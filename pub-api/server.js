const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const db = require("./config/db"); // Asegúrate de que el db.js use 'pg'

const app = express();

// Configuración de CORS para producción y local
app.use(cors({
  origin: ["https://pub-pos-v1.netlify.app", "http://localhost:5173"], 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
}));

app.use(express.json());

/* =============================================
    1. ADMINISTRACIÓN Y PROVEEDORES
   ============================================= */

// Listar proveedores
app.get("/api/admin/proveedores", async (req, res) => {
  try {
    const result = await db.query("SELECT id, nombre FROM proveedores ORDER BY nombre ASC");
    res.json(result.rows);
  } catch (err) { res.status(500).json([]); }
});

// Historial de Compras (AdminVentas.jsx)
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
  } catch (err) { res.status(500).json([]); }
});

// Registro de nueva factura
app.post("/api/admin/compras", async (req, res) => {
  const { proveedor_id, total } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO compras (proveedor_id, total, date, status) VALUES ($1, $2, CURRENT_TIMESTAMP, 'pendiente') RETURNING id",
      [proveedor_id, total]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) { res.status(500).json({ error: "Error al registrar compra" }); }
});

/* =============================================
    2. GESTIÓN DE SALA Y ÓRDENES
   ============================================= */

// Listar mesas con estado dinámico
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

// Abrir una nueva mesa
app.post("/api/open-order", async (req, res) => {
  const { table_id } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO orders (table_id, status) VALUES ($1, 'open') RETURNING id",
      [table_id]
    );
    await db.query("UPDATE tables SET status = 'occupied' WHERE id = $1", [table_id]);
    res.json({ id: result.rows[0].id, table_id, status: "open" });
  } catch (err) { res.status(500).json({ error: "No se pudo abrir la mesa" }); }
});

// Pagar orden
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

/* =============================================
    3. PRODUCTOS E INVENTARIO
   ============================================= */

app.get("/api/products", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM products ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) { res.status(500).json([]); }
});

// Agregar item a la orden (con descuento de stock)
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
  } catch (err) { res.status(500).json({ error: "Error al agregar item" }); }
});

/* =============================================
    4. REPORTES Y ESTADÍSTICAS (PARCHE RECHARTS)
   ============================================= */

// Datos para gráfico circular/barras (Top 5 Productos)
app.get("/api/reportes/ventas-grafico", async (req, res) => {
  try {
    const query = `
      SELECT p.id, p.name as "name", SUM(oi.quantity * oi.price) as "value"
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'paid'
      GROUP BY p.id, p.name
      ORDER BY "value" DESC LIMIT 5`;
    
    const result = await db.query(query);
    const dataFormatted = result.rows.map((row, index) => ({
      key: row.id || index,
      name: row.name,
      value: Number(row.value)
    }));

    res.json(dataFormatted.length > 0 ? dataFormatted : [{ key: 0, name: 'Sin datos', value: 0 }]);
  } catch (err) { res.status(500).json([{ key: 'err', name: 'Error', value: 0 }]); }
});

// Ventas por día
app.get("/api/sales-by-day", async (req, res) => {
  try {
    const query = `
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as name, SUM(total) as value 
      FROM orders WHERE status = 'paid' 
      GROUP BY name ORDER BY name ASC`;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) { res.status(500).json([]); }
});

// Cierre de caja hoy
app.get("/api/cash-close", async (req, res) => {
  try {
    const query = `
      SELECT COUNT(DISTINCT id) as total_ordenes, COALESCE(SUM(total), 0) as total_ventas
      FROM orders WHERE status = 'paid' AND DATE(created_at) = CURRENT_DATE`;
    const result = await db.query(query);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ total_ordenes: 0, total_ventas: 0 }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor Maipú TOTALMENTE LISTO en puerto ${PORT}`));