const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

/* =========================
   🟢 OBTENER ORDEN POR MESA
========================= */
app.get("/orders/table/:tableId", (req, res) => {
  const { tableId } = req.params;

  db.query(
    "SELECT * FROM orders WHERE table_id = ? AND status = 'open' LIMIT 1",
    [tableId],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error DB" });
      res.json(result[0] || null);
    }
  );
});

/* =========================
   🟢 ABRIR ORDEN
========================= */
app.post("/open-order", (req, res) => {
  const { table_id } = req.body;

  db.query(
    "INSERT INTO orders (table_id, status) VALUES (?, 'open')",
    [table_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error creando orden" });

      res.json({
        id: result.insertId,
        table_id,
        status: "open"
      });
    }
  );
});

/* =========================
   🟢 AGREGAR PRODUCTO
========================= */
app.post("/order-items", (req, res) => {
  const { order_id, product_id, quantity } = req.body;

  if (!order_id || !product_id || !quantity) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  db.query(
    `INSERT INTO order_items (order_id, product_id, quantity)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
    [order_id, product_id, quantity, quantity],
    (err) => {
      if (err) {
        console.error("ERROR:", err);
        return res.status(500).json({ error: "Error insertando item" });
      }

      db.query(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [quantity, product_id],
        (err) => {
          if (err) {
            console.error("ERROR STOCK:", err);
            return res.status(500).json({ error: "Error stock" });
          }

          res.json({ message: "Producto agregado" });
        }
      );
    }
  );
});

/* =========================
   🟢 OBTENER ITEMS
========================= */
app.get("/order-items/:orderId", (req, res) => {
  const { orderId } = req.params;

  db.query(
    `SELECT oi.id, oi.quantity, p.name, p.price
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ?`,
    [orderId],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error items" });
      res.json(result);
    }
  );
});

/* =========================
   🟢 ELIMINAR ITEM
========================= */
app.post("/remove-item", (req, res) => {
  const { order_item_id } = req.body;

  db.query(
    "DELETE FROM order_items WHERE id = ?",
    [order_item_id],
    (err) => {
      if (err) return res.status(500).json({ error: "Error eliminando" });
      res.json({ message: "Item eliminado" });
    }
  );
});

/* =========================
   🟢 CANCELAR ORDEN
========================= */
app.post("/cancel-order", (req, res) => {
  const { order_id } = req.body;

  db.query(
    "DELETE FROM orders WHERE id = ?",
    [order_id],
    (err) => {
      if (err) return res.status(500).json({ error: "Error cancelando" });
      res.json({ message: "Orden cancelada" });
    }
  );
});

/* =========================
   🟢 PAGAR
========================= */
app.post("/pay-order", (req, res) => {
  const { order_id } = req.body;

  db.query(
    "UPDATE orders SET status = 'paid' WHERE id = ?",
    [order_id],
    (err) => {
      if (err) return res.status(500).json({ error: "Error pago" });
      res.json({ message: "Pagado" });
    }
  );
});

/* =========================
   🟢 PRODUCTOS
========================= */
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, result) => {
    if (err) return res.status(500).json({ error: "Error productos" });
    res.json(result);
  });
});

/* =========================
   🟢 MESAS
========================= */
app.get("/tables", (req, res) => {
  db.query(
    `
    SELECT 
      t.id,
      t.number,

      CASE 
        WHEN o.id IS NOT NULL THEN 'occupied'
        ELSE 'free'
      END as status,

      IFNULL(SUM(oi.quantity * p.price), 0) as total

    FROM tables t

    LEFT JOIN orders o 
      ON t.id = o.table_id 
      AND o.status = 'open'

    LEFT JOIN order_items oi 
      ON o.id = oi.order_id

    LEFT JOIN products p 
      ON oi.product_id = p.id

    GROUP BY t.id, t.number
    `,
    (err, result) => {
      if (err) {
        console.error("ERROR TABLES:", err);
        return res.status(500).json({ error: "Error mesas" });
      }

      res.json(result);
    }
  );
});

app.post("/login", (req, res) => {
  let { username, password } = req.body;

  username = username?.trim();
  password = password?.trim();

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, result) => {

      if (err) return res.status(500).json({ error: "Error DB" });

      if (result.length === 0) {
        return res.status(401).json({ error: "Usuario no existe" });
      }

      const user = result[0];

      // 🔥 comparar password manualmente
      if (user.password !== password) {
        return res.status(401).json({ error: "Contraseña incorrecta" });
      }

      res.json({
        id: user.id,
        username: user.username,
        role: user.role
      });
    }
  );
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});