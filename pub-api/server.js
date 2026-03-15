const express = require("express")
const app = express()

const cors = require("cors")
const db = require("./config/db")

app.use(cors())
app.use(express.json())

/* ===============================
   TEST API
================================ */
app.get("/",(req,res)=>{
 res.send("API funcionando")
})

/* ===============================
   OBTENER MESAS + TOTAL
================================ */
app.get("/tables",(req,res)=>{

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
   OBTENER ORDEN ABIERTA
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

   res.json(null)

 })

})

/* ===============================
   ABRIR MESA
================================ */
app.post("/open-order",(req,res)=>{

 const {table_id} = req.body

 db.query(
  "INSERT INTO orders (table_id,status) VALUES (?, 'open')",
  [table_id],
  (err,result)=>{

   if(err){
    return res.send(err)
   }

   res.json({
    id: result.insertId,
    table_id,
    status:"open"
   })

  }
 )

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
   AGREGAR PRODUCTO
================================ */
/* app.post("/order-item",(req,res)=>{

 const {order_id, product_id} = req.body

 db.query(
  "INSERT INTO order_items (order_id,product_id,qty) VALUES (?,?,1)",
  [order_id,product_id],
  (err)=>{

   if(err){
    return res.send(err)
   }

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

}) */

app.post("/order-item",(req,res)=>{

 const {order_id, product_id} = req.body

 // primero verificar si el producto ya existe en el pedido
 db.query(
  "SELECT * FROM order_items WHERE order_id=? AND product_id=?",
  [order_id,product_id],
  (err,result)=>{

   if(err){
    return res.send(err)
   }

   // si ya existe -> aumentar cantidad
   if(result.length > 0){

    db.query(
     "UPDATE order_items SET qty = qty + 1 WHERE order_id=? AND product_id=?",
     [order_id,product_id],
     (err)=>{
      if(err){
       return res.send(err)
      }

      res.json({success:true})
     }
    )

   } else {

    // si no existe -> insertar
    db.query(
     "INSERT INTO order_items (order_id,product_id,qty) VALUES (?,?,1)",
     [order_id,product_id],
     (err)=>{
      if(err){
       return res.send(err)
      }

      res.json({success:true})
     }
    )

   }

  }
 )

})


/* ===============================
   ELIMINAR ITEM DEL PEDIDO
================================ */
app.post("/remove-item",(req,res)=>{

 const {order_item_id} = req.body

 db.query(
  "DELETE FROM order_items WHERE id=?",
  [order_item_id],
  (err)=>{

   if(err){
    return res.send(err)
   }

   res.json({success:true})

  }
 )

})



/* ===============================
   PAGAR ORDEN
================================ */
app.post("/pay-order",(req,res)=>{

 const {order_id} = req.body

 db.query(
  "SELECT table_id FROM orders WHERE id=?",
  [order_id],
  (err,result)=>{

   if(err){
    return res.send(err)
   }

   const table_id = result[0].table_id

   db.query(
    "UPDATE orders SET status='paid' WHERE id=?",
    [order_id],
    (err)=>{

     if(err){
      return res.send(err)
     }

     db.query(
      "UPDATE tables SET status='free' WHERE id=?",
      [table_id],
      (err)=>{

       if(err){
        return res.send(err)
       }

       res.json({success:true})

      }
     )

    }
   )

  }
 )
})

/* ===============================
   ITEMS DEL PEDIDO
================================ */
app.get("/order-items/:orderId",(req,res)=>{

 const orderId = req.params.orderId

 db.query(
 `
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

/* ===============================
   SERVER
================================ */
app.listen(5000,()=>{
 console.log("Servidor corriendo en puerto 5000")
})