const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "pub_pos",
});

db.connect((err) => {
  if (err) {
    console.log("Error DB:", err);
  } else {
    console.log("MySQL conectado");
  }
});

module.exports = db;

