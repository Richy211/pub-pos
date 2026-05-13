const { Pool } = require("pg");
const dotenv = require("dotenv");

// Forzamos la carga del .env en la carpeta pub-api
dotenv.config();

const db = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "5432"),
  ssl: {
    rejectUnauthorized: false // Obligatorio para conectar con Supabase
  },
  connectionTimeoutMillis: 10000, 
});

// Verificación de conexión
db.connect()
  .then(client => {
    console.log("✅ PostgreSQL (Supabase) conectado con éxito en Maipú");
    client.release();
  })
  .catch(err => {
    console.error("❌ Error de conexión:", err.message);
    console.log("👉 Tip: Si sale 'ENOTFOUND', intenta reiniciar tu router de internet.");
  });

module.exports = db;