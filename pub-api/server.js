const express = require("express");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const app = express();
const router = express.Router();

const cors = require("cors");
const db = require("./config/db");


const SECRET = "secreto_super_seguro"

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

app.use(cors());
app.use(express.json());



/* ===============================
   GET TABLES (con estado real)
================================ */
router.get("/tables", (req, res) => {
 
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
   OPEN ORDER
================================ */
router.post("/open-order", (req, res) => {
  const { table_id } = req.body;

  // verificar si ya existe
  db.query(
    "SELECT * FROM orders WHERE table_id = ? AND status = 'open'",
    [table_id],
    (err, result) => {
      if (result.length > 0) {
        return res.json(result[0]);
      }

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

/* ===============================
   GET ORDER BY TABLE
================================ */
router.get("/orders/table/:tableId", (req, res) => {
  const { tableId } = req.params;

  db.query(
    "SELECT * FROM orders WHERE table_id = ? AND status = 'open'",
    [tableId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result[0] || null);
    }
  );
});

/* ===============================
   GET ORDER ITEMS
================================ */
router.get("/order-items/:orderId", (req, res) => {
  const { orderId } = req.params;

  const query = `
    SELECT oi.*, p.name, p.price
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `;

  db.query(query, [orderId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

/* ===============================
   ADD PRODUCT TO ORDER
================================ */
router.post("/order-items", (req, res) => {
  const { order_id, product_id } = req.body;

  // verificar si ya existe
  db.query(
    "SELECT * FROM order_items WHERE order_id = ? AND product_id = ?",
    [order_id, product_id],
    (err, result) => {
      if (result.length > 0) {
        db.query(
          "UPDATE order_items SET qty = qty + 1 WHERE id = ?",
          [result[0].id],
          (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Cantidad actualizada" });
          }
        );
      } else {
        db.query(
          "INSERT INTO order_items (order_id, product_id, qty) VALUES (?, ?, 1)",
          [order_id, product_id],
          (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Producto agregado" });
          }
        );
      }
    }
  );
});

/* ===============================
   CANCEL ORDER (BOTÓN PRO)
================================ */
router.post("/cancel-order", (req, res) => {
  const { order_id } = req.body;

  // 1. eliminar items
  db.query(
    "DELETE FROM order_items WHERE order_id = ?",
    [order_id],
    (err) => {
      if (err) return res.status(500).json(err);

      // 2. marcar orden como cancelada
      db.query(
        "UPDATE orders SET status = 'cancelled' WHERE id = ?",
        [order_id],
        (err) => {
          if (err) return res.status(500).json(err);

          res.json({ message: "Orden cancelada" });
        }
      );
    }
  );
});

/* ===============================
   CIERRE DE CAJA
================================ */

router.get("/cash-close", verifyToken, (req, res) => {

  // 🔒 SOLO ADMIN
  if(req.user.role !== "admin"){
    return res.status(403).json({ message: "Solo admin" });
  }

  const query = `
    SELECT 
      COUNT(*) as total_orders,
      SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_orders,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
      SUM(
        CASE 
          WHEN status = 'paid' THEN (
            SELECT SUM(oi.qty * p.price)
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = o.id
          )
          ELSE 0
        END
      ) as total_sales
    FROM orders o
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });

});





/* ===============================
   REMOVE ITEM (OPCIÓN RÁPIDA)
================================ */

router.post("/remove-item", (req, res) => {
  const { order_item_id } = req.body;

  // 1. obtener order_id
  db.query(
    "SELECT order_id FROM order_items WHERE id = ?",
    [order_item_id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (!result.length) {
        return res.status(404).json({ message: "Item no encontrado" });
      }

      const orderId = result[0].order_id;

      // 2. eliminar item
      db.query(
        "DELETE FROM order_items WHERE id = ?",
        [order_item_id],
        (err) => {
          if (err) return res.status(500).json(err);

          // 3. contar items restantes
          db.query(
            "SELECT COUNT(*) as count FROM order_items WHERE order_id = ?",
            [orderId],
            (err, countResult) => {
              if (err) return res.status(500).json(err);

              const count = countResult[0].count;

              // 🔥 CLAVE REAL
              if (count === 0) {
                // en vez de DELETE → mejor marcar como cerrada
                db.query(
                  "UPDATE orders SET status = 'cancelled' WHERE id = ?",
                  [orderId],
                  (err) => {
                    if (err) return res.status(500).json(err);

                    return res.json({ message: "Orden cancelada" });
                  }
                );
              } else {
                res.json({ message: "Item eliminado" });
              }
            }
          );
        }
      );
    }
  );
});








/* ===============================
   GET PRODUCTS
================================ */
router.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

/* ===============================
   TOTAL DE ORDEN
================================ */
router.get("/order-total/:orderId", (req, res) => {
  const { orderId } = req.params;

  const query = `
    SELECT SUM(p.price * oi.qty) as total
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `;

  db.query(query, [orderId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

/* ===============================
   CLOSE ORDER (PAGO)
================================ */
router.post("/close-order", (req, res) => {
  const { order_id } = req.body;

  db.query(
    "UPDATE orders SET status = 'paid' WHERE id = ?",
    [order_id],
    (err) => {
      if (err) return res.status(500).json(err);

      res.json({ message: "Orden cerrada" });
    }
  );
});

/* ===============================
   DELETE ORDER ITEM
================================ */
router.delete("/order-items/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM order_items WHERE id = ?",
    [id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Item eliminado" });
    }
  );
});


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
        {
          id: user.id,
          role: user.role
        },
        SECRET,
        { expiresIn: "8h" }
      );

      res.json({
        token,
        role: user.role
      });
    }
  );
});


app.use("/", router);

app.listen(5000, () => {
  console.log("Servidor corriendo en http://localhost:5000");
});