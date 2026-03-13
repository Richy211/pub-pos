const express = require("express")
const cors = require("cors")
const db = require("./config/db")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req,res)=>{
 res.send("API funcionando")
})

/* ===============================
   OBTENER MESAS + TOTAL
================================ */
app.get("/tables", (req, res) => {

 const sql = `
  SELECT 
   t.id,
   t.number,
   t.status,
   IFNULL(SUM(oi.qty * p.price),0) AS total
  FROM tables t
  LEFT JOIN orders o ON o.table_id = t.id AND o.status='open'
  LEFT JOIN order_items oi ON oi.order_id = o.id
  LEFT JOIN products p ON p.id = oi.product_id
  GROUP BY t.id
 `

 db.query(sql,(err,result)=>{

  if(err){
   return res.status(500).json(err)
  }

  res.json(result)

 })

})

/* ===============================
   OBTENER / CREAR ORDEN
================================ */
app.get("/order/:tableId",(req,res)=>{

 const tableId = req.params.tableId

 db.query(
  "SELECT * FROM orders WHERE table_id=? AND status='open'",
  [tableId],
  (err,result)=>{

   if(err){
    return res.send(err)
   }

   if(result.length > 0){
    return res.json(result[0])
   }

   db.query(
    "INSERT INTO orders (table_id,status) VALUES (?, 'open')",
    [tableId],
    (err,insertResult)=>{

     if(err){
      return res.send(err)
     }

     res.json({
      id: insertResult.insertId,
      table_id: tableId,
      status: "open"
     })

    }
   )

 })

})

/* ===============================
   LISTAR PRODUCTOS
================================ */
app.get("/products",(req,res)=>{

 db.query("SELECT * FROM products",(err,result)=>{

  if(err){
   return res.send(err)
  }

  res.json(result)

 })

})

/* ===============================
   AGREGAR PRODUCTO AL PEDIDO
================================ */
app.post("/order-item",(req,res)=>{

 const {order_id, product_id} = req.body

 db.query(
  "INSERT INTO order_items (order_id,product_id,qty) VALUES (?,?,1)",
  [order_id,product_id],
  (err,result)=>{

   if(err){
    return res.send(err)
   }

   /* MARCAR MESA COMO OCUPADA */
   db.query(
    `
    UPDATE tables
    SET status='occupied'
    WHERE id = (
      SELECT table_id FROM orders WHERE id=?
    )
    `,
    [order_id]
   )

   res.json({success:true})

  }
 )

})

/* ===============================
   ITEMS DEL PEDIDO
================================ */
app.get("/order-items/:orderId",(req,res)=>{

 const orderId = req.params.orderId

 db.query(`
  SELECT 
   order_items.id,
   products.name,
   products.price,
   order_items.qty
  FROM order_items
  JOIN products ON products.id = order_items.product_id
  WHERE order_items.order_id = ?
 `,
 [orderId],
 (err,result)=>{

  if(err){
   return res.send(err)
  }

  res.json(result)

 })

})

app.listen(5000, ()=>{
 console.log("Servidor corriendo en puerto 5000")
})