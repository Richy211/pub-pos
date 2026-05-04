const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

/* =============================================
    1. RUTAS DE ADMINISTRACIÓN
   ============================================= */
app.get("/api/admin/proveedores", async (req, res) => {
  try {
    const result = await db.query("SELECT id, nombre FROM proveedores ORDER BY nombre ASC");
    res.json(result.rows);
  } catch (err) { res.status(500).json([]); }
});

/* =============================================
    2. RUTAS DE SALA Y ÓRDENES
   ============================================= */

// PAGAR ORDEN (Soluciona error en Payment.jsx:30)
app.post("/api/orders/:id/pay", async (req, res) => {
  const orderId = req.params.id;
  try {
    const sumRes = await db.query("SELECT SUM(quantity * price) as total FROM order_items WHERE order_id = $1", [orderId]);
    const total = sumRes.rows[0].total || 0;
    
    await db.query("UPDATE orders SET status = 'paid', total = $1, closed_at = CURRENT_TIMESTAMP WHERE id = $2", [total, orderId]);
    
    const tableRes = await db.query("SELECT table_id FROM orders WHERE id = $1", [orderId]);
    if (tableRes.rows.length > 0) {
      await db.query("UPDATE tables SET status = 'available' WHERE id = $1", [tableRes.rows[0].table_id]);
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Error al pagar" }); }
});

// CANCELAR ORDEN (Soluciona error en Order.jsx:105)
app.post("/api/orders/:id/cancel", async (req, res) => {
  const orderId = req.params.id;
  try {
    // Devolvemos el stock de todo lo que había en la orden antes de borrar
    const items = await db.query("SELECT product_id, quantity FROM order_items WHERE order_id = $1", [orderId]);
    for (let item of items.rows) {
      await db.query("UPDATE products SET stock = stock + $1 WHERE id = $2", [item.quantity, item.product_id]);
    }
    
    // Liberamos la mesa y marcamos la orden como cancelada (o la borramos)
    const tableRes = await db.query("SELECT table_id FROM orders WHERE id = $1", [orderId]);
    await db.query("UPDATE orders SET status = 'cancelled' WHERE id = $1", [orderId]);
    if (tableRes.rows.length > 0) {
      await db.query("UPDATE tables SET status = 'available' WHERE id = $1", [tableRes.rows[0].table_id]);
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Error al cancelar" }); }
});

// Buscar orden de mesa
app.get("/api/orders/table/:tableId", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM orders WHERE table_id = $1 AND status = 'open' LIMIT 1", [req.params.tableId]);
    res.json(result.rows[0] || null);
  } catch (err) { res.status(500).json(null); }
});

// Listar productos
app.get("/api/products", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM products ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) { res.status(500).json([]); }
});

// Listar mesas
app.get("/api/tables", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.id, t.number, 
      CASE WHEN EXISTS (SELECT 1 FROM orders o WHERE o.table_id = t.id AND o.status = 'open') 
      THEN 'occupied' ELSE 'available' END as status 
      FROM tables t ORDER BY t.number ASC`);
    res.json(result.rows);
  } catch (err) { res.status(500).json([]); }
});

// Listar items
app.get("/api/order-items/:orderId", async (req, res) => {
  try {
    const query = "SELECT oi.*, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1";
    const result = await db.query(query, [req.params.orderId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json([]); }
});

// Agregar item (con agrupación)
app.post("/api/order-items", async (req, res) => {
  const { order_id, product_id, seat_id } = req.body;
  try {
    const prodRes = await db.query("SELECT price FROM products WHERE id = $1", [product_id]);
    const existing = await db.query("SELECT id FROM order_items WHERE order_id = $1 AND product_id = $2 AND seat_id = $3", [order_id, product_id, seat_id || 1]);
    if (existing.rows.length > 0) {
      await db.query("UPDATE order_items SET quantity = quantity + 1 WHERE id = $1", [existing.rows[0].id]);
    } else {
      await db.query("INSERT INTO order_items (order_id, product_id, seat_id, quantity, price) VALUES ($1, $2, $3, 1, $4)", [order_id, product_id, seat_id || 1, prodRes.rows[0].price]);
    }
    await db.query("UPDATE products SET stock = stock - 1 WHERE id = $1", [product_id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Error" }); }
});

app.post("/api/open-order", async (req, res) => {
  const { table_id } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO orders (table_id, status) VALUES ($1, 'open') RETURNING id",
      [table_id]
    );
    await db.query("UPDATE tables SET status = 'occupied' WHERE id = $1", [table_id]);
    res.json({ id: result.rows[0].id, table_id, status: "open" });
  } catch (err) {
    res.status(500).json({ error: "No se pudo abrir la mesa" });
  }
});

app.get("/api/admin/compras/alertas-vencimiento", async (req, res) => {
  try {
    const query = `
      SELECT c.id, c.date, p.nombre as proveedor, c.due_date_iva as vencimiento
      FROM compras c
      JOIN proveedores p ON c.proveedor_id = p.id
      WHERE c.due_date_iva <= CURRENT_DATE + INTERVAL '7 days'
      AND c.status != 'paga'`;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json([]);
  }
});

app.get("/api/reportes/movimiento-productos", async (req, res) => {
  try {
    const query = `
      SELECT p.name as producto, 
             COALESCE(SUM(oi.quantity), 0) as ventas, 
             p.stock as stock_actual
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id, p.name, p.stock
      ORDER BY ventas DESC`;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json([]);
  }
});

/* =============================================
    PARCHE DEFINITIVO PARA ADMINISTRACIÓN
   ============================================= */

// 1. Historial de Compras (Arregla el 404 de AdminVentas.jsx:13)
app.get("/api/admin/compras", async (req, res) => {
  try {
    const query = `
      SELECT c.id, c.date as "FECHA / HORA", p.nombre as "PROVEEDOR", 
             c.total as "INVERSIÓN TOTAL", c.status
      FROM compras c
      LEFT JOIN proveedores p ON c.proveedor_id = p.id
      ORDER BY c.date DESC`;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json([]);
  }
});

// 2. Alertas de Vencimiento
app.get("/api/admin/compras/alertas-vencimiento", async (req, res) => {
  try {
    const query = `
      SELECT c.id, p.nombre as proveedor, c.due_date_iva as vencimiento
      FROM compras c
      JOIN proveedores p ON c.proveedor_id = p.id
      WHERE c.due_date_iva <= CURRENT_DATE + INTERVAL '7 days'
      AND c.status != 'paga'`;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json([]);
  }
});

// 3. Registro de nueva factura (POST)
app.post("/api/admin/compras", async (req, res) => {
  const { proveedor_id, total, items } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO compras (proveedor_id, total, date, status) VALUES ($1, $2, CURRENT_TIMESTAMP, 'pendiente') RETURNING id",
      [proveedor_id, total]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: "Error al registrar compra" });
  }
});

/* =============================================
    RUTA PARA EL GRÁFICO (Distribución de Impacto)
   ============================================= */

app.get("/api/reportes/ventas-grafico", async (req, res) => {
  try {
    const query = `
      SELECT p.name as name, 
             SUM(oi.quantity * oi.price) as value
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'paid'
      GROUP BY p.name
      ORDER BY value DESC
      LIMIT 5`; // Top 5 para que el gráfico no se sature
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error en gráfico:", err);
    res.status(500).json([]);
  }
});

/* =============================================
    PARCHE PARA EL GRÁFICO Y ESTADÍSTICAS
   ============================================= */

// 1. Datos para el gráfico de barras/líneas (Ventas por día)
app.get("/api/sales-by-day", async (req, res) => {
  try {
    const query = `
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as name, 
             SUM(total) as value 
      FROM orders 
      WHERE status = 'paid' 
      GROUP BY name 
      ORDER BY name ASC`;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error en sales-by-day:", err);
    res.status(500).json([]);
  }
});

// 2. Resumen de cierre de caja (Total órdenes y ventas hoy)
app.get("/api/cash-close", async (req, res) => {
  try {
    const query = `
      SELECT COUNT(DISTINCT id) as total_ordenes,
             COALESCE(SUM(total), 0) as total_ventas
      FROM orders 
      WHERE status = 'paid' AND DATE(created_at) = CURRENT_DATE`;
    const result = await db.query(query);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error en cash-close:", err);
    res.status(500).json({ total_ordenes: 0, total_ventas: 0 });
  }
});

/* =============================================
    PARCHE DE RECHART KEYS & GRAPH DATA
   ============================================= */
/* =============================================
    PARCHE DE COMPATIBILIDAD TOTAL PARA GRÁFICO
   ============================================= */

app.get("/api/reportes/ventas-grafico", async (req, res) => {
  try {
    const query = `
      SELECT p.id, 
             p.name as "name", 
             SUM(oi.quantity * oi.price) as "value"
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'paid'
      GROUP BY p.id, p.name
      ORDER BY "value" DESC
      LIMIT 5`;
    
    const result = await db.query(query);

    // Mapeo manual para asegurar que React reciba exactamente lo que necesita
    const dataFormatted = result.rows.map((row, index) => ({
      key: row.id || index, // Esto mata el error de "unique key"
      name: row.name,
      value: Number(row.value) // Asegura que sea número y no string
    }));

    if (dataFormatted.length === 0) {
      return res.json([{ key: 0, name: 'Sin datos', value: 0 }]);
    }

    res.json(dataFormatted);
  } catch (err) {
    console.error("Error crítico en gráfico:", err);
    res.status(500).json([{ key: 'err', name: 'Error', value: 0 }]);
  }
});


const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Servidor Maipú TOTALMENTE LISTO en puerto ${PORT}`));