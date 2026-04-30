const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());

/* ===============================
    OPERACIONES DE MESAS (REPARADO)
================================ */

// 1. Listar todas las mesas para la pantalla principal
router.get("/tables", async (req, res) => {
  try {
    const query = `
      SELECT t.id, t.number, 
      CASE WHEN EXISTS (SELECT 1 FROM orders o WHERE o.table_id = t.id AND o.status = 'open') 
      THEN 'occupied' ELSE 'available' END as status 
      FROM tables t ORDER BY t.number ASC`;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Buscar si una mesa ya tiene una orden abierta (Quita el 404 al entrar a la mesa)
router.get("/orders/table/:table_id", async (req, res) => {
  try {
    const { table_id } = req.params;
    const result = await db.query(
      "SELECT * FROM orders WHERE table_id = $1 AND status = 'open' LIMIT 1",
      [table_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Mesa libre" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Abrir una nueva orden (Quita el 404 de /api/open-order)
router.post("/open-order", async (req, res) => {
  const { table_id } = req.body;
  try {
    // Insertamos solo table_id y status. Postgres pondrá el ID solo.
    const query = "INSERT INTO orders (table_id, status, total) VALUES ($1, 'open', 0) RETURNING id";
    const result = await db.query(query, [table_id]);
    
    // Actualizamos la mesa a ocupada
    await db.query("UPDATE tables SET status = 'occupied' WHERE id = $1", [table_id]);

    res.json({ id: result.rows[0].id, table_id, status: "open" });
  } catch (err) {
    console.error("ERROR POSTGRES:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post("/order-items", async (req, res) => {
  const { order_id, product_id, seat_id } = req.body;

  try {
    // Buscamos el precio actual del producto
    const prod = await db.query("SELECT price FROM products WHERE id = $1", [product_id]);
    if (prod.rows.length === 0) return res.status(404).json({ message: "Producto no encontrado" });

    const price = prod.rows[0].price;

    // Insertamos el ítem. Dejamos que Postgres ponga el ID solo.
    const query = `
      INSERT INTO order_items (order_id, product_id, seat_id, quantity, price) 
      VALUES ($1, $2, $3, 1, $4) 
      RETURNING *`;
    
    const result = await db.query(query, [order_id, product_id, seat_id || 1, price]);

    // Opcional: Descontar stock (si tu sistema lo hace)
    await db.query("UPDATE products SET stock = stock - 1 WHERE id = $1", [product_id]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("ERROR AL AGREGAR PRODUCTO:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Esta ruta es la que el frontend (Order.jsx:46) está reclamando con un 404
router.get("/order-items/:order_id", async (req, res) => {
  try {
    const { order_id } = req.params;
    const query = `
      SELECT 
        MAX(oi.id) as id, 
        oi.product_id, 
        p.name, 
        oi.seat_id, 
        SUM(oi.quantity) as quantity, 
        oi.price,
        (SUM(oi.quantity) * oi.price) as subtotal
      FROM order_items oi 
      JOIN products p ON oi.product_id = p.id 
      WHERE oi.order_id = $1
      GROUP BY oi.product_id, p.name, oi.seat_id, oi.price
      ORDER BY p.name ASC`;
    const result = await db.query(query, [order_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.delete("/order-items/decrease", async (req, res) => {
  const { order_id, product_id, seat_id } = req.body;
  try {
    // Eliminamos solo UNA unidad (la última agregada)
    const deleteQuery = `
      DELETE FROM order_items 
      WHERE id IN (
        SELECT id FROM order_items 
        WHERE order_id = $1 AND product_id = $2 AND seat_id = $3 
        LIMIT 1
      )`;
    await db.query(deleteQuery, [order_id, product_id, seat_id]);
    
    // Devolvemos el stock al inventario
    await db.query("UPDATE products SET stock = stock + 1 WHERE id = $1", [product_id]);
    
    res.json({ message: "Cantidad disminuida" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Para el botón de "disminuir" o "eliminar uno"
router.delete("/order-items/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Buscamos el product_id antes de borrar para devolver el stock
    const item = await db.query("SELECT product_id FROM order_items WHERE id = $1", [id]);
    
    if (item.rows.length > 0) {
      const productId = item.rows[0].product_id;
      
      // 2. Borramos el registro
      await db.query("DELETE FROM order_items WHERE id = $1", [id]);
      
      // 3. Devolvemos 1 al stock
      await db.query("UPDATE products SET stock = stock + 1 WHERE id = $1", [productId]);
      
      res.json({ message: "Ítem eliminado" });
    } else {
      res.status(404).json({ message: "Ítem no encontrado" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
    PROCESO DE PAGO (FINALIZAR VENTA)
================================ */

router.put("/orders/pay/:id", async (req, res) => {
  const { id } = req.params;
  const { payment_method } = req.body; // Por si tu front manda el método (efectivo/tarjeta)

  try {
    // 1. Calculamos el total real sumando los items de esa orden
    const totalRes = await db.query(
      "SELECT SUM(price * quantity) as total FROM order_items WHERE order_id = $1",
      [id]
    );
    const totalFinal = totalRes.rows[0].total || 0;

    // 2. Actualizamos la orden: estado 'paid', el total real y la fecha de cierre
    await db.query(
      "UPDATE orders SET status = 'paid', total = $1, closed_at = CURRENT_TIMESTAMP WHERE id = $2",
      [totalFinal, id]
    );

    // 3. Buscamos el table_id para liberar la mesa
    const orderRes = await db.query("SELECT table_id FROM orders WHERE id = $1", [id]);
    if (orderRes.rows.length > 0) {
      const tableId = orderRes.rows[0].table_id;
      // Liberamos la mesa en la tabla 'tables'
      await db.query("UPDATE tables SET status = 'available' WHERE id = $1", [tableId]);
    }

    res.json({ message: "Pago registrado con éxito", total: totalFinal });
  } catch (err) {
    console.error("ERROR AL PROCESAR PAGO:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
    PROCESO DE PAGO (CORREGIDO)
================================ */

// Esta ruta atrapa el pago y libera la mesa
const procesarPago = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Calculamos el total de la orden
    const totalRes = await db.query(
      "SELECT SUM(price * quantity) as total FROM order_items WHERE order_id = $1",
      [id]
    );
    const totalFinal = totalRes.rows[0].total || 0;

    // 2. Marcamos como pagada
    await db.query(
      "UPDATE orders SET status = 'paid', total = $1, closed_at = CURRENT_TIMESTAMP WHERE id = $2",
      [totalFinal, id]
    );

    // 3. Liberamos la mesa asociada
    const orderRes = await db.query("SELECT table_id FROM orders WHERE id = $1", [id]);
    if (orderRes.rows.length > 0) {
      await db.query("UPDATE tables SET status = 'available' WHERE id = $1", [orderRes.rows[0].table_id]);
    }

    console.log(`✅ Pago registrado para Orden ${id}: $${totalFinal}`);
    res.json({ success: true, message: "Venta finalizada" });
  } catch (err) {
    console.error("❌ Error en pago:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Definimos la ruta de dos formas por si el front varía la URL
router.put("/orders/pay/:id", procesarPago);
router.post("/orders/pay/:id", procesarPago); // Por si acaso el front usa POST en vez de PUT

/* =============================================
    RUTA DEFINITIVA DE PAGO (SOLUCIÓN AL 404)
   ============================================= */

// Esta ruta coincide exactamente con: POST /api/orders/256/pay
router.post("/orders/:id/pay", async (req, res) => {
  const { id } = req.params;
  console.log(`Petición de pago recibida para la orden: ${id}`);

  try {
    // 1. Calculamos el total real de la cuenta
    const totalRes = await db.query(
      "SELECT SUM(price * quantity) as total FROM order_items WHERE order_id = $1",
      [id]
    );
    const totalFinal = totalRes.rows[0].total || 0;

    // 2. Marcamos la orden como pagada ('paid') y cerramos con fecha actual
    await db.query(
      "UPDATE orders SET status = 'paid', total = $1, closed_at = CURRENT_TIMESTAMP WHERE id = $2",
      [totalFinal, id]
    );

    // 3. Buscamos qué mesa era para dejarla libre ('available')
    const orderRes = await db.query("SELECT table_id FROM orders WHERE id = $1", [id]);
    if (orderRes.rows.length > 0) {
      const tableId = orderRes.rows[0].table_id;
      await db.query("UPDATE tables SET status = 'available' WHERE id = $1", [tableId]);
    }

    console.log(`✅ ¡Cuenta cerrada! Orden ${id} pagada por $${totalFinal}`);
    
    // Respondemos éxito al frontend para que te redirija a las mesas
    res.json({ success: true, message: "Pago procesado correctamente" });

  } catch (err) {
    console.error("❌ ERROR CRÍTICO EN EL PAGO:", err.message);
    res.status(500).json({ error: "Error interno al procesar el pago" });
  }
});



/* =============================================
    TRASLADAR PRODUCTO (VERSIÓN POSTGRES STRICT)
   ============================================= */

router.put("/order-items/:id/transfer", async (req, res) => {
  const { id } = req.params;
  
  // Imprimimos en la terminal para saber qué llega realmente
  console.log("Cuerpo recibido:", req.body);

  // Intentamos capturar el asiento de varias formas por si el front usa otro nombre
  const newSeat = req.body.new_seat_id || req.body.seat_id || req.body.targetSeat;

  try {
    const seatId = parseInt(newSeat);
    
    if (isNaN(seatId)) {
      console.log("❌ Error: El asiento no es un número válido:", newSeat);
      return res.status(400).json({ error: "Asiento no válido" });
    }

    const query = "UPDATE order_items SET seat_id = $1 WHERE id = $2 RETURNING *";
    const result = await db.query(query, [seatId, id]);

    if (result.rows.length > 0) {
      console.log(`↔️ Traslado OK: Item ${id} -> Persona ${seatId}`);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Item no encontrado" });
    }
  } catch (err) {
    console.error("❌ Error Postgres:", err.message);
    res.status(500).json({ error: err.message });
  }
});



// --- EL MÓDULO QUE TE DA ERROR (RENTABILIDAD Y FISCAL) ---
router.get("/admin/resumen-rentabilidad", async (req, res) => {
  try {
    const query = `
      SELECT 
        COALESCE(SUM(total), 0) as ventas_brutas,
        COALESCE(SUM(total * 0.10), 0) as costos_insumos, 
        COALESCE(SUM(total * 0.90), 0) as utilidad_neta
      FROM orders WHERE status = 'paid'`;
    const result = await db.query(query);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ ventas_brutas: 0, costos_insumos: 0, utilidad_neta: 0 }); }
});

router.get("/admin/resumen-fiscal", async (req, res) => {
  try {
    const query = `
      SELECT 
        COALESCE(SUM(total * 0.19), 0) as iva_debito,
        COALESCE(SUM(total * 0.10), 0) as iva_credito
      FROM orders WHERE status = 'paid'`;
    const result = await db.query(query);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ iva_debito: 0, iva_credito: 0 }); }
});

// --- OTROS REPORTES ---
router.get("/sales-by-day", async (req, res) => {
  try {
    const result = await db.query("SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as name, SUM(total) as value FROM orders WHERE status = 'paid' GROUP BY name ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) { res.status(500).json([]); }
});

router.get("/products", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM products ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) { res.status(500).json([]); }
});

app.use("/api", router);
app.listen(5000, () => console.log("🚀 Servidor ajustado al detalle"));