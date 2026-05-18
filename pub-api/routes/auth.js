const express = require("express");
const router = express.Router();

const verificarToken = require("../middleware/auth");
const verificarRol = require("../middleware/verificarRol");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const SECRET = "super_secret_key";

/* ===============================
   LOGIN (Adaptado para Postgres / Supabase)
================================ */
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Cambiado "?" por "$1" para PostgreSQL
  db.query(
    "SELECT * FROM users WHERE username = $1",
    [username],
    async (err, result) => {
      if (err) {
        console.error("Error en query de login:", err);
        return res.status(500).json(err);
      }

      // VALIDACIÓN SALVADORA: Evita que se caiga si result es undefined o no trae rows
      if (!result || !result.rows || result.rows.length === 0) {
        return res.status(401).json({ message: "Usuario no existe" });
      }

      // En Postgres los datos viajan en .rows
      const user = result.rows[0];

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
          username: user.username,
        },
        SECRET,
        { expiresIn: "8h" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      });
    }
  );
});

/* ===============================
   REGISTER (Adaptado para Postgres / Supabase)
================================ */
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cambiado "?" por "$1, $2, $3" para PostgreSQL
    db.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id",
      [username, hashedPassword, role],
      (err, result) => {
        if (err) {
          console.error("Error en query de registro:", err);
          return res.status(500).json(err);
        }

        // Postgres no usa .insertId, usamos RETURNING id para sacar el ID generado
        const nuevoId = result && result.rows && result.rows[0] ? result.rows[0].id : null;

        res.json({
          message: "Usuario creado",
          user: {
            id: nuevoId,
            username,
            role,
          },
        });
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
});

/* ===============================
   TEST (Corregido fuera de la ruta register)
================================ */
router.get("/test", (req, res) => {
  res.send("auth funcionando");
});

module.exports = router;