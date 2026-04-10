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
  // Hacemos un JOIN para traer el nombre de la categoría
  const query = `
    SELECT p.*, c.name AS category 
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
  `;
  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    // Esto te mostrará en la terminal de VS Code qué nombre de categoría trae cada uno
    console.log("Primer producto enviado:", result[0]);
    res.json(result);
  });
});

router.post("/products", (req, res) => {
  const { name, price, category_id } = req.body;

  // 1. Declaramos la variable que faltaba para que Node no lance el ReferenceError
  // Si no llega category_id, le ponemos null para que la DB lo acepte
  const finalCategory = category_id || null;

  // 2. Ahora sí la usamos en el query (3 columnas, 3 signos, 3 valores)
  db.query(
    "INSERT INTO products (name, price, category_id) VALUES (?, ?, ?)",
    [name, price, finalCategory],
    (err, result) => {
      if (err) {
        console.error("❌ Error SQL al crear producto:", err);
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Producto creado con éxito",
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

// 1. Obtener los productos de una orden (para que NO salga vacío)
router.get("/order-items/:orderId", (req, res) => {
  const query = `
    SELECT oi.id, oi.quantity, p.name, p.price, (oi.quantity * p.price) as subtotal
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `;
  db.query(query, [req.params.orderId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

router.post("/order-items", (req, res) => {
  const { order_id, product_id } = req.body;

  // 🔥 1. TRAER PRODUCTO (precio + costo + stock)
  db.query(
    "SELECT price, cost, stock FROM products WHERE id = ?",
    [product_id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.status(404).json({ message: "Producto no existe" });
      }

      const product = result[0];

      if (product.stock <= 0) {
        return res.status(400).json({ message: "Sin stock disponible" });
      }

      // 🔥 2. VER SI YA EXISTE EN LA ORDEN
      db.query(
        "SELECT * FROM order_items WHERE order_id = ? AND product_id = ?",
        [order_id, product_id],
        (err, items) => {
          if (err) return res.status(500).json(err);

          const updateStock = () => {
            db.query(
              "UPDATE products SET stock = stock - 1 WHERE id = ?",
              [product_id]
            );
          };

          // 🟡 SI YA EXISTE → SOLO SUMAR CANTIDAD
          if (items.length > 0) {
            db.query(
              "UPDATE order_items SET quantity = quantity + 1 WHERE id = ?",
              [items[0].id],
              (err) => {
                if (err) return res.status(500).json(err);
                updateStock();
                res.json({ message: "Cantidad actualizada" });
              }
            );
          } 
          
          // 🟢 SI NO EXISTE → INSERTAR CON PRICE Y COST
          else {
            db.query(
              `INSERT INTO order_items 
              (order_id, product_id, quantity, price, cost) 
              VALUES (?, ?, 1, ?, ?)`,
              [order_id, product_id, product.price, product.cost],
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

// 2. Obtener el TOTAL real (para que NO salga $0)
router.get("/order-total/:orderId", (req, res) => {
  const query = `
    SELECT IFNULL(SUM(oi.quantity * p.price), 0) as total
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `;
  db.query(query, [req.params.orderId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ total: result[0].total });
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
    Obtener el balance de ganancias (Ventas vs Compras)
================================ */
// Obtener el balance de ganancias (Ventas vs Compras)
router.get("/admin/balance-ganancias", (req, res) => {
  const sql = `
    SELECT 
      (SELECT IFNULL(SUM(total), 0) FROM orders WHERE status = 'paid') as total_ventas,
      (SELECT IFNULL(SUM(total), 0) FROM compras WHERE status = 'recibido') as total_costos
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const { total_ventas, total_costos } = result[0];
    const margen_bruto = total_ventas - total_costos;
    
    res.json({
      ventas: total_ventas,
      costos: total_costos,
      ganancia_neta: margen_bruto
    });
  });
});


// Obtener historial de compras
router.get("/admin/compras", (req, res) => {
  const sql = `
    SELECT c.*, p.nombre as proveedor_nombre 
    FROM compras c 
    LEFT JOIN proveedores p ON c.proveedor_id = p.id 
    ORDER BY c.date DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
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

  SUM(CASE WHEN o.status = 'paid' THEN 1 ELSE 0 END) as paid_orders,
  SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,

  COALESCE(SUM(CASE WHEN o.status = 'paid' THEN oi.quantity * oi.price ELSE 0 END), 0) as total_sales,

  COALESCE(SUM(CASE WHEN o.status = 'paid' THEN oi.quantity * oi.cost ELSE 0 END), 0) as total_cost,

  COALESCE(SUM(CASE WHEN o.status = 'paid' THEN (oi.quantity * oi.price - oi.quantity * oi.cost) ELSE 0 END), 0) as total_profit

FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id


  `;



  db.query(query, (err, result) => {
    if (err) {
      console.error("ERROR CASH CLOSE:", err);
      return res.status(500).json(err);
    }
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
      SUM(oi.quantity * p.price) as total
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

// Listar proveedores (Asegúrate de que la tabla sea 'proveedores')
router.get("/suppliers", (req, res) => {
  db.query("SELECT id, nombre FROM proveedores ORDER BY nombre ASC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// Guardar nueva compra (Nombres exactos de tu diagrama)
router.post("/purchases", (req, res) => {
  const { proveedor_id, date, total_neto, iva, total, status } = req.body;
  
  const sql = `
    INSERT INTO compras (proveedor_id, date, total_neto, iva, total, status) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(sql, [proveedor_id, date, total_neto, iva, total, status || 'completado'], (err, result) => {
    if (err) {
      console.error("Error SQL:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Compra registrada", id: result.insertId });
  });
});



router.delete("/order-items/:id", (req, res) => {
  const { id } = req.params;

  // 1. Obtener item
  db.query(
    "SELECT product_id, quantity FROM order_items WHERE id = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.status(404).json({ message: "Item no encontrado" });
      }

      const { product_id, quantity } = result[0];

      // 2. Devolver stock
      db.query(
        "UPDATE products SET stock = stock + ? WHERE id = ?",
        [quantity, product_id],
        (err) => {
          if (err) return res.status(500).json(err);

          // 3. Eliminar item
          db.query(
            "DELETE FROM order_items WHERE id = ?",
            [id],
            (err) => {
              if (err) return res.status(500).json(err);

              res.json({ message: "Item eliminado correctamente" });
            }
          );
        }
      );
    }
  );
});

router.get("/reportes/ventas-totales", (req, res) => {
  // Consulta de Totales
  const statsQuery = `
    SELECT 
      CAST(IFNULL(SUM(total), 0) AS DECIMAL(10,2)) as totalVentas,
      CAST(IFNULL(SUM(total * 0.7), 0) AS DECIMAL(10,2)) as utilidad, 
      COUNT(*) as ordenesPagadas
    FROM orders 
    WHERE status = 'paid'
  `;

  // Consulta de Gráfico usando PAID_AT
  // Usamos COALESCE por si acaso paid_at es nulo, use created_at como respaldo
  const graphQuery = `
    SELECT 
      DATE(COALESCE(paid_at, created_at)) as fecha, 
      SUM(total) as total
    FROM orders
    WHERE status = 'paid'
    GROUP BY fecha
    ORDER BY fecha ASC
    LIMIT 7
  `;

  db.query(statsQuery, (err, statsResult) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.query(graphQuery, (err, graphResult) => {
      if (err) return res.status(500).json({ error: err.message });
      
      res.json({
        totalVentas: statsResult[0].totalVentas,
        utilidad: statsResult[0].utilidad,
        ordenesPagadas: statsResult[0].ordenesPagadas,
        dataGrafico: graphResult
      });
    });
  });
});

// Listar proveedores para el Select
router.get("/admin/proveedores", (req, res) => {
  db.query("SELECT id, nombre FROM proveedores ORDER BY nombre ASC", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// Guardar nueva compra
router.post("/admin/compras", (req, res) => {
  const { supplier_id, date, total_net, iva, total, status } = req.body;
  const sql = `
    INSERT INTO compras (supplier_id, date, total_net, iva, total, status) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.query(sql, [supplier_id, date, total_net, iva, total, status], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Compra registrada", id: result.insertId });
  });
});

// Agrega esto antes de app.use("/", router);
router.get("/payment-detail/:tableId", (req, res) => {
  const query = `
    SELECT oi.quantity, p.name, p.price
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.table_id = ? AND o.status = 'open'
  `;
  db.query(query, [req.params.tableId], (err, result) => {
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