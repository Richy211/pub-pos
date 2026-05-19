require("dotenv").config(); 
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { Pool } = require("pg"); // ← pg en vez de mysql2

const app = express();
const router = express.Router();
const SECRET = "secreto_super_seguro";

// --- Conexión PostgreSQL (Supabase) ---
// Usa las variables de entorno separadas configuradas en Render
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false } // Requerido por Supabase
});

// Helper para queries más limpias
const db = {
  query: (text, params) => pool.query(text, params)
};

// --- Middlewares ---
app.use(cors());
app.use(express.json());

/* ===============================
    AUTH
================================ */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) return res.status(401).json({ message: "Usuario no existe" });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "8h" });
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
    PRODUCTS (CRUD)
================================ */
router.get("/products", async (req, res) => {
  try {
    // ← LEFT JOIN con categories para traer el nombre de categoría
    const result = await db.query(`
      SELECT p.*, c.name AS category 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/products", async (req, res) => {
  const { name, price, category_id, stock } = req.body;
  const nuevoStock = parseInt(stock) || 0;
  try {
    const existing = await db.query("SELECT id FROM products WHERE name = $1", [name]);

    if (existing.rows.length > 0) {
      const productId = existing.rows[0].id;
      await db.query(
        "UPDATE products SET stock = stock + $1, price = $2, category_id = $3 WHERE id = $4",
        [nuevoStock, parseFloat(price) || 0, category_id || null, productId]
      );
      res.json({ message: "Stock actualizado (producto existente)", id: productId });
    } else {
      const result = await db.query(
        "INSERT INTO products (name, price, category_id, stock) VALUES ($1, $2, $3, $4) RETURNING id",
        [name, parseFloat(price) || 0, category_id || null, nuevoStock]
      );
      res.status(201).json({ message: "Producto creado", id: result.rows[0].id });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/products/:id", async (req, res) => {
  const { name, price, stock, category_id } = req.body;
  try {
    await db.query(
      "UPDATE products SET name = $1, price = $2, stock = $3, category_id = $4 WHERE id = $5",
      [name, parseFloat(price) || 0, parseInt(stock) || 0, category_id || null, req.params.id]
    );
    res.json({ message: "Producto actualizado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM products WHERE id = $1", [req.params.id]);
    res.json({ message: "Producto eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
    ORDER ITEMS
================================ */

// Eliminar o disminuir ítem (de a uno), devuelve stock
router.delete("/order-items/:id", async (req, res) => {
  const itemId = req.params.id;
  try {
    const result = await db.query(
      "SELECT product_id, quantity FROM order_items WHERE id = $1",
      [itemId]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Ítem no encontrado" });

    const { product_id, quantity } = result.rows[0];

    if (quantity > 1) {
      await db.query("UPDATE order_items SET quantity = quantity - 1 WHERE id = $1", [itemId]);
      await db.query("UPDATE products SET stock = stock + 1 WHERE id = $1", [product_id]);
      res.json({ message: "Cantidad disminuida" });
    } else {
      await db.query("DELETE FROM order_items WHERE id = $1", [itemId]);
      await db.query("UPDATE products SET stock = stock + 1 WHERE id = $1", [product_id]);
      res.json({ message: "Ítem eliminado" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trasladar ítem de persona
router.put("/order-items/:id/transfer", async (req, res) => {
  const { id } = req.params;
  const { seat_id } = req.body;
  if (!seat_id) return res.status(400).json({ message: "Falta el asiento de destino" });
  try {
    await db.query("UPDATE order_items SET seat_id = $1 WHERE id = $2", [seat_id, id]);
    res.json({ message: "Producto trasladado con éxito" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancelar orden completa (botón de pánico)
router.post("/orders/:id/cancel", async (req, res) => {
  const orderId = req.params.id;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const items = await client.query(
      "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
      [orderId]
    );

    // Devolvemos stock de cada producto
    for (const item of items.rows) {
      await client.query(
        "UPDATE products SET stock = stock + $1 WHERE id = $2",
        [item.quantity, item.product_id]
      );
    }

    await client.query("DELETE FROM order_items WHERE order_id = $1", [orderId]);
    await client.query("UPDATE orders SET status = 'cancelled' WHERE id = $1", [orderId]);

    await client.query("COMMIT");
    res.json({ message: "Orden cancelada y stock restaurado" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

/* ===============================
    TABLES & ORDERS
================================ */
router.get("/tables", async (req, res) => {
    console.log("DB_HOST:", process.env.DB_HOST);
  console.log("DB_USER:", process.env.DB_USER);
  console.log("DB_PORT:", process.env.DB_PORT);
  try {
    const result = await db.query(`
      SELECT 
        t.id, 
        t.number,
        CASE WHEN COUNT(o.id) > 0 THEN 'occupied' ELSE 'available' END AS status,
        COALESCE(SUM(oi.quantity * oi.price), 0) AS total
      FROM tables t
      LEFT JOIN orders o ON o.table_id = t.id AND o.status = 'open'
      LEFT JOIN order_items oi ON oi.order_id = o.id
      GROUP BY t.id, t.number
      ORDER BY t.number ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("ERROR TABLES:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post("/open-order", async (req, res) => {
  const { table_id } = req.body;
  try {
    const existing = await db.query(
      "SELECT * FROM orders WHERE table_id = $1 AND status = 'open'",
      [table_id]
    );
    if (existing.rows.length > 0) return res.json(existing.rows[0]);

    const result = await db.query(
      "INSERT INTO orders (table_id, status) VALUES ($1, 'open') RETURNING *",
      [table_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/orders/table/:tableId", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM orders WHERE table_id = $1 AND status = 'open'",
      [req.params.tableId]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/order-items/:orderId", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT oi.*, p.name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [req.params.orderId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/order-items", async (req, res) => {
  const { order_id, product_id, seat_id } = req.body;
  const currentSeat = seat_id || 1;
  try {
    const productResult = await db.query(
      "SELECT price, cost, stock FROM products WHERE id = $1",
      [product_id]
    );
    if (productResult.rows.length === 0) return res.status(404).json({ message: "Producto no existe" });

    const product = productResult.rows[0];
    if (product.stock <= 0) return res.status(400).json({ message: "Sin stock" });

    const existing = await db.query(
      "SELECT * FROM order_items WHERE order_id = $1 AND product_id = $2 AND seat_id = $3",
      [order_id, product_id, currentSeat]
    );

    if (existing.rows.length > 0) {
      await db.query(
        "UPDATE order_items SET quantity = quantity + 1 WHERE id = $1",
        [existing.rows[0].id]
      );
    } else {
      await db.query(
        "INSERT INTO order_items (order_id, product_id, seat_id, quantity, price, cost) VALUES ($1, $2, $3, 1, $4, $5)",
        [order_id, product_id, currentSeat, product.price, product.cost]
      );
    }

    await db.query("UPDATE products SET stock = stock - 1 WHERE id = $1", [product_id]);
    res.json({ message: "Producto agregado" });
  } catch (err) {
    console.error("Error en /order-items:", err);
    res.status(500).json({ error: err.message });
  }
});

// Pagar orden
router.post("/orders/:id/pay", async (req, res) => {
  const orderId = req.params.id;
  try {
    const totalResult = await db.query(
      "SELECT SUM(quantity * price) AS total_calculado FROM order_items WHERE order_id = $1",
      [orderId]
    );
    const total = totalResult.rows[0].total_calculado || 0;

    await db.query(
      "UPDATE orders SET status = 'paid', total = $1 WHERE id = $2",
      [total, orderId]
    );

    const detalle = await db.query(`
      SELECT oi.quantity, p.name, oi.price, oi.seat_id,
             (oi.quantity * oi.price) AS subtotal
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [orderId]);

    res.json({ message: "Orden pagada y total guardado", items: detalle.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
    ADMIN & PURCHASES
================================ */
router.get("/admin/compras", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.id, c.date, c.total, p.nombre AS proveedor_nombre,
             STRING_AGG(prod.name, ', ') AS productos_comprados
      FROM compras c
      LEFT JOIN proveedores p ON c.proveedor_id = p.id
      LEFT JOIN compras_detalle ci ON c.id = ci.purchase_id
      LEFT JOIN products prod ON ci.product_id = prod.id
      GROUP BY c.id, c.date, c.total, p.nombre
      ORDER BY c.date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/admin/compras-completas", async (req, res) => {
  const { proveedor_id, date, due_date, total_neto, iva, total, items } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const compraResult = await client.query(
      "INSERT INTO compras (proveedor_id, date, due_date_iva, total_neto, iva, total, status) VALUES ($1, $2, $3, $4, $5, $6, 'recibido') RETURNING id",
      [proveedor_id, date, due_date, total_neto, iva, total]
    );
    const purchaseId = compraResult.rows[0].id;

    for (const item of items) {
await client.query(
"INSERT INTO compras_detalle (purchase_id, product_id, quantity, unit_price_net, subtotal_net) VALUES ($1, $2, $3, $4, $5)",
[purchaseId, item.product_id, item.quantity, item.price_unit, item.quantity * item.price_unit]
);
      await client.query(
        "UPDATE products SET stock = stock + $1, cost = $2 WHERE id = $3",
        [item.quantity, item.price_unit, item.product_id]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Compra registrada" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.get("/admin/compras-detalle/:id", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT ci.quantity, ci.unit_price_net AS price, p.name, ci.subtotal_net AS subtotal
      FROM compras_detalle ci
      INNER JOIN products p ON ci.product_id = p.id
      WHERE ci.purchase_id = $1
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
    PROVEEDORES & REPORTES
================================ */
router.get("/admin/proveedores", async (req, res) => {
  try {
    const result = await db.query("SELECT id, nombre FROM proveedores ORDER BY nombre ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/reportes/movimiento-productos", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        p.id,
        p.name AS producto,
        p.stock AS stock_actual,
        COALESCE((
          SELECT SUM(oi.quantity)
          FROM order_items oi
          JOIN orders o ON oi.order_id = o.id
          WHERE oi.product_id = p.id AND o.status = 'paid'
        ), 0) AS cantidad_ventas
      FROM products p
      ORDER BY cantidad_ventas DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




router.get("/admin/reportes/movimiento-productos", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.name AS "Producto", SUM(oi.quantity) AS "Total_Vendido"
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'paid'
      GROUP BY p.id
      ORDER BY "Total_Vendido" DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/cash-close", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        COUNT(DISTINCT o.id) AS total_ordenes,
        COALESCE(SUM(oi.quantity * oi.price), 0) AS total_ventas,
        COALESCE(SUM(oi.quantity * (oi.price - COALESCE(oi.cost, 0))), 0) AS total_utilidad
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status = 'paid'
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
    ESTADÍSTICAS
================================ */
router.get("/sales-by-day", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        TO_CHAR(o.created_at, 'YYYY-MM-DD') AS date,
        SUM(oi.quantity * oi.price) AS total
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status = 'paid'
      GROUP BY TO_CHAR(o.created_at, 'YYYY-MM-DD')
      ORDER BY date ASC
      LIMIT 30
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
    CIERRE DIARIO & ARQUEO
================================ */
router.get("/admin/compras/alertas-vencimiento", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, p.nombre AS proveedor, c.due_date_iva AS due_date
      FROM compras c
      JOIN proveedores p ON c.proveedor_id = p.id
      WHERE c.due_date_iva <= CURRENT_DATE + INTERVAL '5 days'
        AND c.due_date_iva >= CURRENT_DATE
        AND c.status != 'paid'
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/admin/resumen-fiscal", async (req, res) => {
  try {
    const creditoResult = await db.query(`
      SELECT COALESCE(SUM(iva), 0) AS total
      FROM compras
      WHERE EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);

    const debitoResult = await db.query(`
      SELECT COALESCE(SUM((oi.quantity * oi.price) * 0.19 / 1.19), 0) AS total
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'paid'
        AND EXTRACT(MONTH FROM o.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM o.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);

    res.json({
      iva_credito: creditoResult.rows[0].total,
      iva_debito: debitoResult.rows[0].total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/admin/cierre-diario/total-esperado", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT SUM(total) AS esperado
      FROM orders
      WHERE status = 'paid'
        AND DATE(created_at) = CURRENT_DATE
    `);
    res.json(result.rows[0] || { esperado: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/admin/arqueo", async (req, res) => {
  const { total_esperado, total_real, observaciones } = req.body;
  const diferencia = total_real - total_esperado;
  try {
    const result = await db.query(
      "INSERT INTO arqueos_caja (fecha, total_esperado, total_real, diferencia, observaciones) VALUES (CURRENT_DATE, $1, $2, $3, $4) RETURNING *",
      [total_esperado, total_real, diferencia, observaciones]
    );
    res.json({ message: "Arqueo registrado", diferencia, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/admin/arqueo/historial", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM arqueos_caja ORDER BY fecha DESC, id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/admin/cierre-diario/detalle-mesas", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.number AS mesa, SUM(o.total) AS total_mesa
      FROM orders o
      JOIN tables t ON o.table_id = t.id
      WHERE o.status = 'paid'
        AND DATE(o.created_at) = CURRENT_DATE
      GROUP BY t.id, t.number
      ORDER BY t.number ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/admin/resumen-rentabilidad", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        SUM(oi.quantity * oi.price) AS ventas_brutas,
        SUM(oi.quantity * p.cost) AS costo_total,
        (SUM(oi.quantity * oi.price) - SUM(oi.quantity * p.cost)) AS utilidad_neta
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'paid'
        AND EXTRACT(MONTH FROM o.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM o.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Iniciar Servidor ---
app.use("/api", router);
app.listen(process.env.PORT || 5000, () =>
  console.log(`🚀 Servidor corriendo en puerto ${process.env.PORT || 5000}`)
);