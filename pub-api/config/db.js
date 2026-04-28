/* const mysql = require("mysql2");

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

module.exports = db; */

const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

db.connect((err) => {
  if (err) {
    console.log("Error DB:", err);
  } else {
    console.log("MySQL conectado");
  }
});

module.exports = db;