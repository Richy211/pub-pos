const { Pool } = require("pg");

const db = new Pool({
  host: process.env.DB_HOST || "tu-host-de-supabase.com", // El que te da Supabase
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "tu-password-segura",
  database: process.env.DB_NAME || "postgres",
  port: process.env.DB_PORT || 5432,
  // CAMBIO CLAVE AQUÍ:
  ssl: {
    rejectUnauthorized: false
  }
});

// Verificar conexión
db.connect()
  .then(client => {
    console.log("🚀 PostgreSQL (Supabase) conectado con éxito");
    client.release();
  })
  .catch(err => {
    console.error("❌ Error de conexión DB:", err.message);
  });

module.exports = db;