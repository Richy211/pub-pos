const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const db = require("./config/db");

const app = express();
const router = express.Router();
const SECRET = "secreto_super_seguro";

// --- Middlewares ---
app.use(cors());
app.use(express.json());

/* ===============================
    AUTH
================================ */
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.status(401).json({ message: "Usuario no existe" });

    const user = result[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "8h" });
    res.json({ token, role: user.role });
  });
});

const handlePago = async (orderId, metodoPago) => {
  try {
    const response = await fetch(`http://localhost:5000/api/orders/${orderId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metodo_pago: metodoPago })
    });

    const data = await response.json();

    if (response.ok) {
      // ✨ Aquí llamamos a la función que pegaste tú
      generarPDF(data); 
      
      alert("Pago procesado y boleta descargada");
      // Aquí podrías redirigir a la vista de mesas o refrescar el estado
    } else {
      console.error("Error al pagar:", data.error);
    }
  } catch (error) {
    console.error("Error de red:", error);
  }
};



/* ===============================
    PRODUCTS (CRUD)
================================ */
router.get("/products", (req, res) => {
  const query = "SELECT p.*, c.name AS category FROM products p LEFT JOIN categories c ON p.category_id = c.id";
  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

router.post("/products", (req, res) => {
  const { name, price, category_id, stock } = req.body;
  const nuevoStock = parseInt(stock) || 0;

  db.query("SELECT id, stock FROM products WHERE name = ?", [name], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.length > 0) {
      const productId = result[0].id;
      const sqlUpdate = "UPDATE products SET stock = stock + ?, price = ?, category_id = ? WHERE id = ?";
      db.query(sqlUpdate, [nuevoStock, parseFloat(price) || 0, category_id || null, productId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Stock actualizado (producto existente)", id: productId });
      });
    } else {
      const sqlInsert = "INSERT INTO products (name, price, category_id, stock) VALUES (?, ?, ?, ?)";
      db.query(sqlInsert, [name, parseFloat(price) || 0, category_id || null, nuevoStock], (err, insertResult) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Producto creado", id: insertResult.insertId });
      });
    }
  });
});

router.put("/products/:id", (req, res) => {
  const { name, price, stock, category_id } = req.body;
  const sql = "UPDATE products SET name = ?, price = ?, stock = ?, category_id = ? WHERE id = ?";
  db.query(sql, [name, parseFloat(price) || 0, parseInt(stock) || 0, category_id || null, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Producto actualizado" });
  });
});

router.delete("/products/:id", (req, res) => {
  db.query("DELETE FROM products WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Producto eliminado" });
  });
});

// ELIMINAR ÍTEM DE UNA MESA Y DEVOLVER STOCK
// --- 1. DISMINUIR O ELIMINAR ÍTEM (Resta de a 1) ---
// --- 1. ELIMINAR O DISMINUIR ÍTEM (De a uno) ---
router.delete("/order-items/:id", (req, res) => {
  const itemId = req.params.id;

  db.query("SELECT product_id, quantity FROM order_items WHERE id = ?", [itemId], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al buscar ítem", details: err });
    if (result.length === 0) return res.status(404).json({ message: "Ítem no encontrado" });

    const { product_id, quantity } = result[0];

    if (quantity > 1) {
      // Disminuimos cantidad en la orden y devolvemos 1 al stock
      db.query("UPDATE order_items SET quantity = quantity - 1 WHERE id = ?", [itemId], (err) => {
        if (err) return res.status(500).json(err);
        db.query("UPDATE products SET stock = stock + 1 WHERE id = ?", [product_id]);
        res.json({ message: "Cantidad disminuida" });
      });
    } else {
      // Si queda solo uno, borramos la fila y devolvemos 1 al stock
      db.query("DELETE FROM order_items WHERE id = ?", [itemId], (err) => {
        if (err) return res.status(500).json(err);
        db.query("UPDATE products SET stock = stock + 1 WHERE id = ?", [product_id]);
        res.json({ message: "Ítem eliminado" });
      });
    }
  });
});

// --- 2. TRASLADAR ÍTEM DE PERSONA ---
router.put("/order-items/:id/transfer", (req, res) => {
  const { id } = req.params;
  const { seat_id } = req.body;
  
  if(!seat_id) return res.status(400).json({ message: "Falta el asiento de destino" });

  db.query("UPDATE order_items SET seat_id = ? WHERE id = ?", [seat_id, id], (err) => {
    if (err) return res.status(500).json({ error: "Error al trasladar", details: err });
    res.json({ message: "Producto trasladado con éxito" });
  });
});

// --- 3. CANCELAR ORDEN COMPLETA (Botón de pánico) ---
router.post("/orders/:id/cancel", (req, res) => {
  const orderId = req.params.id;

  // 1. Buscamos todos los productos para devolver el stock
  db.query("SELECT product_id, quantity FROM order_items WHERE order_id = ?", [orderId], (err, items) => {
    if (err) return res.status(500).json(err);

    // Si hay productos, devolvemos el stock de cada uno
    if (items.length > 0) {
      items.forEach(item => {
        db.query("UPDATE products SET stock = stock + ? WHERE id = ?", [item.quantity, item.product_id]);
      });
    }

    // 2. Borramos los items de la orden
    db.query("DELETE FROM order_items WHERE order_id = ?", [orderId], (err) => {
      if (err) return res.status(500).json(err);

      // 3. Marcamos la orden como cancelada para liberar la mesa
      db.query("UPDATE orders SET status = 'cancelled' WHERE id = ?", [orderId], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Orden cancelada y stock restaurado" });
      });
    });
  });
});






// --- 2. TRASLADAR ÍTEM DE PERSONA ---
router.put("/order-items/:id/transfer", (req, res) => {
  const { id } = req.params;
  const { seat_id } = req.body;
  db.query("UPDATE order_items SET seat_id = ? WHERE id = ?", [seat_id, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Producto trasladado con éxito" });
  });
});

// --- 3. CANCELAR ORDEN COMPLETA ---
router.post("/orders/:id/cancel", (req, res) => {
  const orderId = req.params.id;

  // Primero recuperamos todos los items para devolver el stock a 'products'
  db.query("SELECT product_id, quantity FROM order_items WHERE order_id = ?", [orderId], (err, items) => {
    if (err) return res.status(500).json(err);

    // Si hay items, devolvemos el stock de cada uno
    if (items.length > 0) {
      items.forEach(item => {
        db.query("UPDATE products SET stock = stock + ? WHERE id = ?", [item.quantity, item.product_id]);
      });
    }

    // Luego eliminamos los items de la orden
    db.query("DELETE FROM order_items WHERE order_id = ?", [orderId], (err) => {
      if (err) return res.status(500).json(err);

      // Finalmente, cerramos la orden (o la eliminamos, según prefieras)
      // Aquí la marcamos como 'cancelled' para que la mesa quede libre
      db.query("UPDATE orders SET status = 'cancelled' WHERE id = ?", [orderId], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Orden cancelada y stock restaurado" });
      });
    });
  });
});

/* ===============================
    TABLES & ORDERS
================================ */
router.get("/tables", (req, res) => {
  const query = `
    SELECT t.id, t.number, 
    CASE WHEN EXISTS (SELECT 1 FROM orders o WHERE o.table_id = t.id AND o.status = 'open') 
    THEN 'occupied' ELSE 'available' END as status 
    FROM tables t`;
  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

router.post("/open-order", (req, res) => {
  const { table_id } = req.body;
  db.query("SELECT * FROM orders WHERE table_id = ? AND status = 'open'", [table_id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length > 0) return res.json(result[0]);

    db.query("INSERT INTO orders (table_id, status) VALUES (?, 'open')", [table_id], (err, insertResult) => {
      if (err) return res.status(500).json(err);
      res.json({ id: insertResult.insertId, table_id, status: "open" });
    });
  });
});

router.get("/orders/table/:tableId", (req, res) => {
  db.query("SELECT * FROM orders WHERE table_id = ? AND status = 'open'", [req.params.tableId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0] || null);
  });
});

router.get("/order-items/:orderId", (req, res) => {
  const { orderId } = req.params;
  // ASEGÚRATE de incluir seat_id en el SELECT
  const sql = `
    SELECT oi.*, p.name 
    FROM order_items oi 
    JOIN products p ON oi.product_id = p.id 
    WHERE oi.order_id = ?`;
  
  db.query(sql, [orderId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

router.post("/order-items", (req, res) => {
  const { order_id, product_id, seat_id } = req.body;
  const currentSeat = seat_id || 1; 

  console.log("Recibido:", { order_id, product_id, currentSeat }); // Para debug

  db.query("SELECT price, cost, stock FROM products WHERE id = ?", [product_id], (err, result) => {
    if (err) {
      console.error("Error en SELECT product:", err);
      return res.status(500).json(err);
    }
    
    if (result.length === 0) return res.status(404).json({ message: "Producto no existe" });

    const product = result[0];
    if (product.stock <= 0) return res.status(400).json({ message: "Sin stock" });

    // Buscamos si ya existe ese producto en ese asiento específico
    db.query("SELECT * FROM order_items WHERE order_id = ? AND product_id = ? AND seat_id = ?", 
      [order_id, product_id, currentSeat], (err, items) => {
      
      if (err) {
        console.error("Error en SELECT order_items:", err);
        return res.status(500).json(err);
      }

      if (items.length > 0) {
        db.query("UPDATE order_items SET quantity = quantity + 1 WHERE id = ?", [items[0].id], (err) => {
          if (err) return res.status(500).json(err);
          db.query("UPDATE products SET stock = stock - 1 WHERE id = ?", [product_id]);
          res.json({ message: "Cantidad actualizada" });
        });
      } else {
        // AGREGAR: Asegúrate de que las columnas coincidan EXACTO con tu DB
        db.query("INSERT INTO order_items (order_id, product_id, seat_id, quantity, price, cost) VALUES (?, ?, ?, 1, ?, ?)", 
          [order_id, product_id, currentSeat, product.price, product.cost], (err) => {
          if (err) {
            console.error("Error en INSERT:", err); // <--- ESTO TE DIRÁ EL PROBLEMA REAL
            return res.status(500).json({ error: "Error al insertar en DB", detail: err.message });
          }
          db.query("UPDATE products SET stock = stock - 1 WHERE id = ?", [product_id]);
          res.json({ message: "Producto agregado" });
        });
      }
    });
  });
});

router.post("/orders/:id/pay", (req, res) => {
  const orderId = req.params.id;

  // 1. Primero calculamos el total sumando los items de esa orden
  const sqlSum = "SELECT SUM(quantity * price) as total_calculado FROM order_items WHERE order_id = ?";
  
  db.query(sqlSum, [orderId], (err, result) => {
    if (err) return res.status(500).json({ error: "Error calculando total" });

    const total = result[0].total_calculado || 0;

    // 2. Ahora actualizamos el status Y guardamos el total calculado
    const sqlUpdate = "UPDATE orders SET status = 'paid', total = ? WHERE id = ?";
    
    db.query(sqlUpdate, [total, orderId], (err, result) => {
      if (err) return res.status(500).json({ error: "Error al pagar" });

      // 3. Obtenemos el detalle (para el ticket)
      const sqlDetalle = `SELECT oi.quantity, p.name, oi.price, oi.seat_id, (oi.quantity * oi.price) as subtotal
                          FROM order_items oi
                          JOIN products p ON oi.product_id = p.id
                          WHERE oi.order_id = ?`;

      db.query(sqlDetalle, [orderId], (err, items) => {
        if (err) return res.status(500).json({ error: "Error al obtener detalle" });
        res.json({ message: "Orden pagada y total guardado", items });
      });
    });
  });
});






/* ===============================
    ADMIN & PURCHASES
================================ */
router.get("/admin/compras", (req, res) => {
  const sql = `
    SELECT c.id, c.date, c.total, p.nombre AS proveedor_nombre,
    GROUP_CONCAT(prod.name SEPARATOR ', ') AS productos_comprados
    FROM compras c
    LEFT JOIN proveedores p ON c.proveedor_id = p.id
    LEFT JOIN compras_items ci ON c.id = ci.purchase_id
    LEFT JOIN products prod ON ci.product_id = prod.id
    GROUP BY c.id ORDER BY c.date DESC`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.post("/admin/compras-completas", (req, res) => {
  const { proveedor_id, date, total_neto, iva, total, items } = req.body;

  db.beginTransaction((err) => {
    if (err) return res.status(500).json(err);

    const sqlCompra = "INSERT INTO compras (proveedor_id, date, total_neto, iva, total, status) VALUES (?, ?, ?, ?, ?, 'recibido')";
    db.query(sqlCompra, [proveedor_id, date, total_neto, iva, total], (err, result) => {
      if (err) return db.rollback(() => res.status(500).json({ error: err.message }));

      const purchaseId = result.insertId;
      const queries = items.map(item => {
        return new Promise((resolve, reject) => {
          db.query("INSERT INTO compras_items (purchase_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
            [purchaseId, item.product_id, item.quantity, item.price_unit], (err) => {
              if (err) return reject(err);
              const sqlUpdate = "UPDATE products SET stock = stock + ?, cost = ? WHERE id = ?";
              db.query(sqlUpdate, [item.quantity, item.price_unit, item.product_id], (err) => {
                if (err) return reject(err);
                resolve();
              });
            });
        });
      });

      Promise.all(queries)
        .then(() => {
          db.commit(err => {
            if (err) return db.rollback(() => res.status(500).json(err));
            res.json({ message: "Stock y compra registrados con éxito" });
          });
        })
        .catch(err => db.rollback(() => res.status(500).json({ error: err.message })));
    });
  });
});

router.get("/admin/compras-detalle/:id", (req, res) => {
  const query = `
    SELECT ci.quantity, ci.price, p.name, (ci.quantity * ci.price) as subtotal
    FROM compras_items ci
    INNER JOIN products p ON ci.product_id = p.id
    WHERE ci.purchase_id = ?`;
  db.query(query, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

/* ===============================
    REPORTS & PROVEEDORES
================================ */
router.get("/admin/proveedores", (req, res) => {
  db.query("SELECT id, nombre FROM proveedores ORDER BY nombre ASC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

router.get("/reportes/movimiento-productos", (req, res) => {
  const query = `
    SELECT 
        p.id,
        p.name AS Producto,
        p.stock AS Stock_Actual,
        IFNULL((
            SELECT SUM(oi.quantity) 
            FROM order_items oi 
            JOIN orders o ON oi.order_id = o.id 
            WHERE oi.product_id = p.id AND o.status = 'paid'
        ), 0) AS Total_Vendido
    FROM products p
    GROUP BY p.id
    ORDER BY Total_Vendido DESC`;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});


router.get("/cash-close", (req, res) => {
  const query = `
    SELECT COUNT(DISTINCT o.id) as total_ordenes,
    COALESCE(SUM(oi.quantity * oi.price), 0) as total_ventas,
    COALESCE(SUM(oi.quantity * (oi.price - IFNULL(oi.cost, 0))), 0) as total_utilidad
    FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id WHERE o.status = 'paid'`;
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result[0]);
  });
});

/* ===============================
    ESTADÍSTICAS REPARADAS
================================ */

// 1. Ventas por día (Para el gráfico de líneas)
router.get("/sales-by-day", (req, res) => {
  const query = `
    SELECT 
      DATE_FORMAT(o.created_at, '%Y-%m-%d') as date, 
      SUM(oi.quantity * oi.price) as total 
    FROM orders o 
    JOIN order_items oi ON o.id = oi.order_id 
    WHERE o.status = 'paid' 
    GROUP BY DATE(o.created_at) 
    ORDER BY date ASC 
    LIMIT 30`; // Traemos el último mes

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// 2. Distribución de Impacto (Productos más vendidos)
router.get("/admin/reportes/movimiento-productos", (req, res) => {
  const query = `
    SELECT 
        p.name AS Producto,
        SUM(oi.quantity) AS Total_Vendido
    FROM products p
    JOIN order_items oi ON p.id = oi.product_id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'paid'
    GROUP BY p.id
    ORDER BY Total_Vendido DESC
    LIMIT 10`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// RUTA PARA TRASLADAR ITEM
router.put("/order-items/:id/transfer", (req, res) => {
  const { id } = req.params;
  const { seat_id } = req.body;
  
  db.query("UPDATE order_items SET seat_id = ? WHERE id = ?", [seat_id, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Producto trasladado con éxito" });
  });
});

// --- 1. RUTA DE ALERTAS (CORREGIDA CON ALIAS) ---
router.get("/admin/compras/alertas-vencimiento", (req, res) => {
  // Usamos el alias 'due_date' para que el frontend no tenga que cambiar nada
  const sql = `
    SELECT c.*, p.nombre AS proveedor, c.due_date_iva AS due_date 
    FROM compras c
    JOIN proveedores p ON c.proveedor_id = p.id
    WHERE c.due_date_iva <= DATE_ADD(CURDATE(), INTERVAL 5 DAY) 
    AND c.due_date_iva >= CURDATE()
    AND c.status != 'paid'`;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// --- 2. RUTA DE GUARDADO (CORREGIDA) ---
router.post("/admin/compras-completas", (req, res) => {
  const { proveedor_id, date, due_date, total_neto, iva, total, items } = req.body;

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: "Error iniciando transacción" });

    // Insertamos usando due_date_iva
    const sqlCompra = "INSERT INTO compras (proveedor_id, date, due_date_iva, total_neto, iva, total, status) VALUES (?, ?, ?, ?, ?, ?, 'recibido')";
    
    db.query(sqlCompra, [proveedor_id, date, due_date, total_neto, iva, total], (err, result) => {
      if (err) return db.rollback(() => res.status(500).json({ error: err.message }));

      const purchaseId = result.insertId;
      const queries = items.map(item => {
        return new Promise((resolve, reject) => {
          db.query("INSERT INTO compras_items (purchase_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
            [purchaseId, item.product_id, item.quantity, item.price_unit], (err) => {
              if (err) return reject(err);
              db.query("UPDATE products SET stock = stock + ?, cost = ? WHERE id = ?", 
                [item.quantity, item.price_unit, item.product_id], (err) => {
                if (err) return reject(err);
                resolve();
              });
            });
        });
      });

      Promise.all(queries)
        .then(() => {
          db.commit(err => {
            if (err) return db.rollback(() => res.status(500).json({ error: "Error al confirmar" }));
            res.json({ message: "Compra registrada" });
          });
        })
        .catch(err => db.rollback(() => res.status(500).json({ error: err.message })));
    });
  });
});

router.get("/admin/resumen-fiscal", (req, res) => {
  // Vamos a ejecutar dos consultas separadas para aislar el error
  const sqlCredito = `SELECT IFNULL(SUM(iva), 0) as total FROM compras 
                      WHERE MONTH(date) = MONTH(CURRENT_DATE()) 
                      AND YEAR(date) = YEAR(CURRENT_DATE())`;
  
  const sqlDebito = `SELECT IFNULL(SUM((oi.quantity * oi.price) * 0.19 / 1.19), 0) as total 
                     FROM order_items oi 
                     JOIN orders o ON oi.order_id = o.id 
                     WHERE o.status = 'paid' 
                     AND MONTH(o.created_at) = MONTH(CURRENT_DATE()) 
                     AND YEAR(o.created_at) = YEAR(CURRENT_DATE())`;

  db.query(sqlCredito, (err, resCredito) => {
    if (err) return res.status(500).json({ error: "Error en Credito: " + err.message });
    
    db.query(sqlDebito, (err, resDebito) => {
      if (err) return res.status(500).json({ error: "Error en Debito: " + err.message });
      
      res.json({
        iva_credito: resCredito[0].total,
        iva_debito: resDebito[0].total
      });
    });
  });
});

// Obtener el total esperado del día (basado en órdenes pagadas)
router.get("/admin/cierre-diario/total-esperado", (req, res) => {
  const sql = `SELECT SUM(total) as esperado 
               FROM orders 
               WHERE status = 'paid' 
               AND DATE(created_at) = CURDATE()`;
  
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result[0] || { esperado: 0 });
  });
});

// Guardar el Arqueo
router.post("/admin/arqueo", (req, res) => {
  const { total_esperado, total_real, observaciones } = req.body;
  const diferencia = total_real - total_esperado; // Si es negativo, faltó dinero

  const sql = "INSERT INTO arqueos_caja (fecha, total_esperado, total_real, diferencia, observaciones) VALUES (CURDATE(), ?, ?, ?, ?)";
  
  db.query(sql, [total_esperado, total_real, diferencia, observaciones], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Arqueo registrado", diferencia });
  });
});

// Obtener el historial de arqueos
router.get("/admin/arqueo/historial", (req, res) => {
  const sql = "SELECT * FROM arqueos_caja ORDER BY fecha DESC, id DESC";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Obtener detalle de ventas por mesa para el cierre
router.get("/admin/cierre-diario/detalle-mesas", (req, res) => {
  const sql = `
    SELECT t.number as mesa, SUM(o.total) as total_mesa
    FROM orders o
    JOIN tables t ON o.table_id = t.id
    WHERE o.status = 'paid' 
    AND DATE(o.created_at) = CURDATE()
    GROUP BY t.id
    ORDER BY t.number ASC`;
  
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});


// --- Iniciar Servidor ---
app.use("/api", router);
app.listen(5000, () => console.log("🚀 Servidor corriendo en puerto 5000"));