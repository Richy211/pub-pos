const express = require("express")
const cors = require("cors")
const db = require("./config/db")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req,res)=>{
 res.send("API funcionando")
})

app.get("/tables",(req,res)=>{

 db.query("SELECT * FROM tables",(err,result)=>{

  if(err){
   res.send(err)
  }else{
   res.json(result)
  }

 })

})

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
    "INSERT INTO orders (table_id) VALUES (?)",
    [tableId],
    (err,insertResult)=>{

     if(err){
      return res.send(err)
     }

     res.json({
      id: insertResult.insertId,
      table_id: tableId
     })

    }
   )

 })
})

app.get("/products",(req,res)=>{

 db.query("SELECT * FROM products",(err,result)=>{

  if(err){
   return res.send(err)
  }

  res.json(result)

 })

})

app.post("/order-item",(req,res)=>{

 const {order_id, product_id} = req.body

 db.query(
  "INSERT INTO order_items (order_id,product_id,qty) VALUES (?,?,1)",
  [order_id,product_id],
  (err,result)=>{

   if(err){
    return res.send(err)
   }

   res.json({success:true})

  }
 )

})


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