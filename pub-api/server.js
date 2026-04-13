console.log("🔥 BACKEND TOTAL: MESAS + COMPRAS UNIFICADAS");

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
  db.query("INSERT INTO products (name, price, category_id, stock) VALUES (?, ?, ?, ?)", 
    [name, parseFloat(price) || 0, category_id ? parseInt(category_id) : null, parseInt(stock) || 0], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Producto creado", id: result.insertId });
  });
});

router.put("/products/:id", (req, res) => {
  const { name, price, stock, category_id } = req.body;
  db.query("UPDATE products SET name = ?, price = ?, stock = ?, category_id = ? WHERE id = ?", 
    [name, parseFloat(price) || 0, parseInt(stock) || 0, category_id ? parseInt(category_id) : null, req.params.id], (err) => {
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

/* ===============================
    TABLES & ORDERS (LAS MESAS)
================================ */
router.get("/tables", (req, res) => {
  const query = "SELECT t.id, t.number, CASE WHEN EXISTS (SELECT 1 FROM orders o WHERE o.table_id = t.id AND o.status = 'open') THEN 'occupied' ELSE 'available' END as status FROM tables t";
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
  const query = "SELECT oi.id, oi.quantity, p.name, p.price, (oi.quantity * p.price) as subtotal FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?";
  db.query(query, [req.params.orderId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

router.post("/order-items", (req, res) => {
  const { order_id, product_id } = req.body;
  db.query("SELECT price, cost, stock FROM products WHERE id = ?", [product_id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.status(404).json({ message: "Producto no existe" });
    const product = result[0];
    if (product.stock <= 0) return res.status(400).json({ message: "Sin stock disponible" });

    db.query("SELECT * FROM order_items WHERE order_id = ? AND product_id = ?", [order_id, product_id], (err, items) => {
      if (err) return res.status(500).json(err);
      if (items.length > 0) {
        db.query("UPDATE order_items SET quantity = quantity + 1 WHERE id = ?", [items[0].id], (err) => {
          if (err) return res.status(500).json(err);
          db.query("UPDATE products SET stock = stock - 1 WHERE id = ?", [product_id]);
          res.json({ message: "Cantidad actualizada" });
        });
      } else {
        db.query("INSERT INTO order_items (order_id, product_id, quantity, price, cost) VALUES (?, ?, 1, ?, ?)", 
          [order_id, product_id, product.price, product.cost], (err) => {
          if (err) return res.status(500).json(err);
          db.query("UPDATE products SET stock = stock - 1 WHERE id = ?", [product_id]);
          res.json({ message: "Producto agregado" });
        });
      }
    });
  });
});

router.post("/close-order", (req, res) => {
  db.query("UPDATE orders SET status = 'paid' WHERE id = ?", [req.body.order_id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Orden pagada" });
  });
});

/* ===============================
    ADMIN & PURCHASES (COMPRAS)
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

    // SQL usando exactamente los nombres de tu captura: proveedor_id, date, total_neto, iva, total, status
    const sqlCompra = "INSERT INTO compras (proveedor_id, date, total_neto, iva, total, status) VALUES (?, ?, ?, ?, ?, 'recibido')";
    
    db.query(sqlCompra, [proveedor_id, date, total_neto, iva, total], (err, result) => {
      if (err) {
        console.error("❌ ERROR EN TABLA COMPRAS:", err.message);
        return db.rollback(() => res.status(500).json({ error: err.message }));
      }

      const purchaseId = result.insertId;

      const queries = items.map(item => {
        return new Promise((resolve, reject) => {
          // Registro en el historial
          db.query("INSERT INTO compras_items (purchase_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
            [purchaseId, item.product_id, item.quantity, item.price_unit], (err) => {
              if (err) return reject(err);

              // UPDATE DE STOCK: Aquí es donde la Corona sube de 83 a 100
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
            res.json({ message: "Stock actualizado con éxito" });
          });
        })
        .catch(err => {
          console.error("❌ ERROR EN ITEMS:", err.message);
          db.rollback(() => res.status(500).json({ error: err.message }));
        });
    });
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

router.get("/sales-by-day", (req, res) => {
  const query = `SELECT DATE(o.created_at) as date, SUM(oi.quantity * oi.price) as total FROM orders o JOIN order_items oi ON o.id = oi.order_id WHERE o.status = 'paid' GROUP BY DATE(o.created_at) ORDER BY date ASC`;
  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.use("/api", router);
app.use("/", router);

app.listen(5000, () => console.log("🚀 Servidor corriendo en puerto 5000"));