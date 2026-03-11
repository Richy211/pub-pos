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

app.listen(5000, ()=>{
 console.log("Servidor corriendo en puerto 5000")
})