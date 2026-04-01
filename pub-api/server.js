console.log("🔥 ESTE ES EL BACKEND CORRECTO Y COMPLETO");

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");

const db = require("./config/db");

const app = express();
const router = express.Router();

const SECRET = "secreto_super_seguro";

/* ===============================
    MIDDLEWARES
================================ */

app.use(cors());
app.use(express.json());

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).json({ message: "No autorizado" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Token inválido" });

    req.user = decoded;
    next();
  });
};

/* ===============================
    AUTH
================================ */

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.status(401).json({ message: "Usuario no existe" });
      }

      const user = result[0];
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        SECRET,
        { expiresIn: "8h" }
      );

      res.json({ token, role: user.role });
    }
  );
});

router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, hashedPassword, role],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Usuario creado" });
    }
  );
});

/* ===============================
    PRODUCTS
================================ */

router.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

router.post("/products", (req, res) => {
  const { name, price } = req.body;

  db.query(
    "INSERT INTO products (name, price) VALUES (?, ?)",
    [name, price],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.status(201).json({
        message: "Producto creado",
        id: result.insertId
      });
    }
  );
});

router.put("/products/:id", (req, res) => {
  const { name, price } = req.body;

  db.query(
    "UPDATE products SET name = ?, price = ? WHERE id = ?",
    [name, price, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Producto actualizado" });
    }
  );
});

router.delete("/products/:id", (req, res) => {
  db.query(
    "DELETE FROM products WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Producto eliminado" });
    }
  );
});

/* ===============================
    TABLES (Aquí están de vuelta)
================================ */

router.get("/tables", (req, res) => {
  console.log("🔥 /tables llamada");

  const query = `
    SELECT 
      t.id, 
      t.number,
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM orders o 
          WHERE o.table_id = t.id 
          AND o.status = 'open'
        ) 
        THEN 'occupied'
        ELSE 'available'
      END as status
    FROM tables t
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

/* ===============================
    ORDERS
================================ */

router.post("/open-order", (req, res) => {
  const { table_id } = req.body;

  db.query(
    "SELECT * FROM orders WHERE table_id = ? AND status = 'open'",
    [table_id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length > 0) return res.json(result[0]);

      db.query(
        "INSERT INTO orders (table_id, status) VALUES (?, 'open')",
        [table_id],
        (err, insertResult) => {
          if (err) return res.status(500).json(err);

          res.json({
            id: insertResult.insertId,
            table_id,
            status: "open",
          });
        }
      );
    }
  );
});

router.get("/orders/table/:tableId", (req, res) => {
  db.query(
    "SELECT * FROM orders WHERE table_id = ? AND status = 'open'",
    [req.params.tableId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result[0] || null);
    }
  );
});

router.get("/order-items/:orderId", (req, res) => {
  const query = `
    SELECT oi.*, p.name, p.price
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `;

  db.query(query, [req.params.orderId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

router.post("/order-items", (req, res) => {
  const { order_id, product_id } = req.body;

  db.query(
    "SELECT stock FROM products WHERE id = ?",
    [product_id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.status(404).json({ message: "Producto no existe" });
      }

      const stock = result[0].stock;

      if (stock <= 0) {
        return res.status(400).json({ message: "Sin stock disponible" });
      }

      db.query(
        "SELECT * FROM order_items WHERE order_id = ? AND product_id = ?",
        [order_id, product_id],
        (err, items) => {
          if (err) return res.status(500).json(err);

          const updateStock = () => {
            db.query("UPDATE products SET stock = stock - 1 WHERE id = ?", [product_id]);
          };

          if (items.length > 0) {
            db.query(
              "UPDATE order_items SET qty = qty + 1 WHERE id = ?",
              [items[0].id],
              (err) => {
                if (err) return res.status(500).json(err);
                updateStock();
                res.json({ message: "Cantidad actualizada" });
              }
            );
          } else {
            db.query(
              "INSERT INTO order_items (order_id, product_id, qty) VALUES (?, ?, 1)",
              [order_id, product_id],
              (err) => {
                if (err) return res.status(500).json(err);
                updateStock();
                res.json({ message: "Producto agregado" });
              }
            );
          }
        }
      );
    }
  );
});

router.post("/cancel-order", (req, res) => {
  const { order_id } = req.body;

  db.query("DELETE FROM order_items WHERE order_id = ?", [order_id], (err) => {
    if (err) return res.status(500).json(err);

    db.query(
      "UPDATE orders SET status = 'cancelled' WHERE id = ?",
      [order_id],
      (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Orden cancelada" });
      }
    );
  });
});

router.get("/order-total/:orderId", (req, res) => {
  const query = `
    SELECT SUM(p.price * oi.qty) as total
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `;

  db.query(query, [req.params.orderId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

router.post("/close-order", (req, res) => {
  const { order_id } = req.body;

  db.query(
    "UPDATE orders SET status = 'paid' WHERE id = ?",
    [order_id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Orden pagada" });
    }
  );
});

/* ===============================
    PURCHASES (Corregido y Seguro)
================================ */
router.post("/purchases", verifyToken, (req, res) => {
  console.log("🔥 BODY:", req.body);

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Solo admin puede registrar compras" });
  }

  const { supplier_id, products } = req.body;

  if (!supplier_id || !products || products.length === 0) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  for (let item of products) {
    if (!item.product_id || !item.quantity || !item.unit_price) {
      return res.status(400).json({ error: "Producto incompleto" });
    }

    if (isNaN(item.product_id) || isNaN(item.quantity) || isNaN(item.unit_price)) {
      return res.status(400).json({ error: "Valores inválidos" });
    }
  }

  let totalNet = 0;
  products.forEach(item => {
    totalNet += item.quantity * item.unit_price;
  });

  const iva = totalNet * 0.19;
  const total = totalNet + iva;

  db.query(
    `INSERT INTO purchases (supplier_id, date, total_net, iva, total, status) 
     VALUES (?, NOW(), ?, ?, ?, 'recibido')`,
    [supplier_id, totalNet, iva, total],
    (err, result) => {
      if (err) {
        console.error("❌ ERROR PURCHASE:", err);
        return res.status(500).json({ error: err.message });
      }

      const purchaseId = result.insertId;

      let completed = 0;
      let errorOcurred = false;

      products.forEach(item => {
        const subtotal = item.quantity * item.unit_price;

        db.query(
          `INSERT INTO purchase_details 
          (purchase_id, product_id, quantity, unit_price_net, subtotal_net) 
          VALUES (?, ?, ?, ?, ?)`,
          [purchaseId, item.product_id, item.quantity, item.unit_price, subtotal],
          (errDetail) => {
            if (errDetail && !errorOcurred) {
              errorOcurred = true;
              console.error("❌ ERROR DETALLE:", errDetail);
              return res.status(500).json({ error: errDetail.message });
            }

            db.query(
              `UPDATE products SET stock = stock + ? WHERE id = ?`,
              [item.quantity, item.product_id],
              (errStock) => {
                if (errStock && !errorOcurred) {
                  errorOcurred = true;
                  console.error("❌ ERROR STOCK:", errStock);
                  return res.status(500).json({ error: errStock.message });
                }

                completed++;

                if (completed === products.length && !errorOcurred) {
                  console.log("✅ COMPRA COMPLETA:", purchaseId);
                  res.json({
                    message: "Compra registrada correctamente",
                    purchaseId
                  });
                }
              }
            );
          }
        );
      });
    }
  );
});






/* ===============================
    REPORTS & SALES
================================ */

router.get("/cash-close", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Solo admin" });
  }

  const query = `
    SELECT 
      COUNT(*) as total_orders,
      SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_orders,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders
    FROM orders
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

router.get("/sales-by-day", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Solo admin" });
  }

  const query = `
    SELECT 
      DATE(o.created_at) as date,
      SUM(oi.qty * p.price) as total
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    WHERE o.status = 'paid'
    GROUP BY DATE(o.created_at)
    ORDER BY date ASC
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

router.get("/suppliers", (req, res) => {
  db.query("SELECT * FROM suppliers", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

/* ===============================
    SERVER CONFIG
================================ */

app.use("/", router);

app.listen(5000, () => {
  console.log("🚀 Servidor corriendo en http://localhost:5000");
});