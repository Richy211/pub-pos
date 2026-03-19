const express = require("express");
const cors = require("cors");

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// ===============================
// 🧠 "BASE DE DATOS" EN MEMORIA
// ===============================
let tables = [
  { id: 1, number: 1, total: 0 },
  { id: 2, number: 2, total: 0 },
  { id: 3, number: 3, total: 0 },
  { id: 4, number: 4, total: 0 },
];

let orders = [];
let orderItems = [];

let products = [
  { id: 1, name: "Cerveza", price: 3000 },
  { id: 2, name: "Pisco", price: 5000 },
  { id: 3, name: "Hamburguesa", price: 8000 },
];

// ===============================
// 🍽️ TABLES
// ===============================
app.get("/tables", (req, res) => {
  const updatedTables = tables.map(t => {
    const order = orders.find(o => o.table_id == t.id);

    if (!order) return { ...t, total: 0 };

    const items = orderItems.filter(i => i.order_id == order.id);

    const total = items.reduce((acc, item) => {
      return acc + item.qty * item.price;
    }, 0);

    return { ...t, total };
  });

  res.json(updatedTables);
});

// ===============================
// 🍺 PRODUCTS
// ===============================
app.get("/products", (req, res) => {
  res.json(products);
});

// ===============================
// 📦 GET ORDER BY TABLE
// ===============================
app.get("/order/:tableId", (req, res) => {
  const order = orders.find(o => o.table_id == req.params.tableId);
  res.json(order || null);
});

// ===============================
// 🟢 OPEN ORDER
// ===============================
app.post("/open-order", (req, res) => {
  const { table_id } = req.body;

  const existing = orders.find(o => o.table_id == table_id);
  if (existing) return res.json(existing);

  const newOrder = {
    id: orders.length + 1,
    table_id,
  };

  orders.push(newOrder);

  res.json(newOrder);
});

// ===============================
// ➕ ADD PRODUCT
// ===============================
app.post("/order-item", (req, res) => {
  const { order_id, product_id } = req.body;

  const product = products.find(p => p.id == product_id);

  let item = orderItems.find(
    i => i.order_id == order_id && i.product_id == product_id
  );

  if (item) {
    item.qty += 1;
  } else {
    item = {
      id: orderItems.length + 1,
      order_id,
      product_id,
      name: product.name,
      price: product.price,
      qty: 1,
    };
    orderItems.push(item);
  }

  res.json(item);
});

// ===============================
// 📋 GET ITEMS
// ===============================
app.get("/order-items/:orderId", (req, res) => {
  const items = orderItems.filter(i => i.order_id == req.params.orderId);
  res.json(items);
});

// ===============================
// ❌ REMOVE ITEM
// ===============================
app.post("/remove-item", (req, res) => {
  const { order_item_id } = req.body;

  orderItems = orderItems.filter(i => i.id != order_item_id);

  res.json({ success: true });
});

// ===============================
// 🚀 START SERVER
// ===============================
app.listen(5000, () => {
  console.log("🔥 Backend corriendo en http://localhost:5000");
});