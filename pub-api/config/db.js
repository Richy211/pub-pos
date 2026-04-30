const { Pool } = require("pg");

const db = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "rick2111",
  database: process.env.DB_NAME || "pub_pos_pg",
  port: process.env.DB_PORT || 5432,
  ssl: false
});

// Verificar conexión
db.connect()
  .then(client => {
    console.log("PostgreSQL conectado");
    client.release();
  })
  .catch(err => {
    console.error("Error de conexión DB:", err.message);
  });

module.exports = db;