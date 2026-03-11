const mysql = require("mysql2")

const db = mysql.createConnection({
 host: "localhost",
 user: "root",
 password: "",
 database: "pub-pos"
})

db.connect(err => {
 if(err){
  console.log("Error conectando a MySQL", err)
 }else{
  console.log("MySQL conectado")
 }
})

module.exports = db