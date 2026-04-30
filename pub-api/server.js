const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const app = express();
const router = express.Router();

// Configuración de Middlewares
app.use(cors());
app.use(express.json());

/* =============================================
    OPERACIONES DE MESAS
   ============================================= */

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

// 2. Buscar si una mesa ya tiene una orden abierta
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

// 3. Abrir una nueva orden
router.post("/open-order", async (req, res) => {
  const { table_id } = req.body;
  try {
    const query = "INSERT INTO orders (table_id, status, total) VALUES ($1, 'open', 0) RETURNING id";
    const result = await db.query(query, [table_id]);
    
    await db.query("UPDATE tables SET status = 'occupied' WHERE id = $1", [table_id]);

    res.json({ id: result.rows[0].id, table_id, status: "open" });
  } catch (err) {
    console.error("ERROR POSTGRES:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =============================================
    GESTIÓN DE ITEMS DE LA ORDEN
   ============================================= */

// Agregar producto a la orden
router.post("/order-items", async (req, res) => {
  const { order_id, product_id, seat_id } = req.body;
  try {
    const prod = await db.query("SELECT price FROM products WHERE id = $1", [product_id]);
    if (prod.rows.length === 0) return res.status(404).json({ message: "Producto no encontrado" });

    const price = prod.rows[0].price;
    const query = `
      INSERT INTO order_items (order_id, product_id, seat_id, quantity, price) 
      VALUES ($1, $2, $3, 1, $4) 
      RETURNING *`;
    
    const result = await db.query(query, [order_id, product_id, seat_id || 1, price]);
    await db.query("UPDATE products SET stock = stock - 1 WHERE id = $1", [product_id]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar items de una orden (Agrupados)
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

// Disminuir cantidad o eliminar item
router.delete("/order-items/decrease", async (req, res) => {
  const { order_id, product_id, seat_id } = req.body;
  try {
    const deleteQuery = `
      DELETE FROM order_items 
      WHERE id IN (
        SELECT id FROM order_items 
        WHERE order_id = $1 AND product_id = $2 AND seat_id = $3 
        LIMIT 1
      )`;
    await db.query(deleteQuery, [order_id, product_id, seat_id]);
    await db.query("UPDATE products SET stock = stock + 1 WHERE id = $1", [product_id]);
    res.json({ message: "Cantidad disminuida" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trasladar producto entre asientos
router.put("/order-items/:id/transfer", async (req, res) => {
  const { id } = req.params;
  const newSeat = req.body.new_seat_id || req.body.seat_id || req.body.targetSeat;

  try {
    const seatId = parseInt(newSeat);
    if (isNaN(seatId)) return res.status(400).json({ error: "Asiento no válido" });

    const query = "UPDATE order_items SET seat_id = $1 WHERE id = $2 RETURNING *";
    const result = await db.query(query, [seatId, id]);

    if (result.rows.length > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Item no encontrado" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =============================================
    PROCESO DE PAGO (CONSOLIDADO)
   ============================================= */

// Ruta definitiva para procesar el pago y liberar mesa
router.post("/orders/:id/pay", async (req, res) => {
  const { id } = req.params;
  try {
    const totalRes = await db.query(
      "SELECT SUM(price * quantity) as total FROM order_items WHERE order_id = $1",
      [id]
    );
    const totalFinal = totalRes.rows[0].total || 0;

    await db.query(
      "UPDATE orders SET status = 'paid', total = $1, closed_at = CURRENT_TIMESTAMP WHERE id = $2",
      [totalFinal, id]
    );

    const orderRes = await db.query("SELECT table_id FROM orders WHERE id = $1", [id]);
    if (orderRes.rows.length > 0) {
      await db.query("UPDATE tables SET status = 'available' WHERE id = $1", [orderRes.rows[0].table_id]);
    }

    console.log(`✅ Orden ${id} pagada: $${totalFinal}`);
    res.json({ success: true, message: "Pago procesado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error interno al procesar el pago" });
  }
});

/* =============================================
    ADMINISTRACIÓN Y REPORTES
   ============================================= */

router.get("/products", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM products ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) { res.status(500).json([]); }
});

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

router.get("/sales-by-day", async (req, res) => {
  try {
    const query = "SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as name, SUM(total) as value FROM orders WHERE status = 'paid' GROUP BY name ORDER BY name ASC";
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) { res.status(500).json([]); }
});

/* =============================================
    REPORTE DE MOVIMIENTO DE PRODUCTOS
   ============================================= */

// Esta es la ruta que tu frontend está pidiendo y da 404
router.get("/reportes/movimiento-productos", async (req, res) => {
  try {
    const query = `
      SELECT 
        p.name as producto,
        COUNT(oi.id) as cantidad_ventas,
        p.stock as stock_actual
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id, p.name, p.stock
      ORDER BY cantidad_ventas DESC`;
      
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error en reporte de movimientos:", err.message);
    res.status(500).json({ error: "Error al obtener movimientos de productos" });
  }
});


/* =============================================
    INICIO DEL SERVIDOR
   ============================================= */

app.use("/api", router);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`✅ API base: http://localhost:${PORT}/api`);
});