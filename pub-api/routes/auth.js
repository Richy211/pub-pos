const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const SECRET = "super_secret_key";

/* ===============================
   LOGIN
================================ */
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (result.length === 0) {
        return res.status(401).json({ message: "Usuario no existe" });
      }

      const user = result[0];

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
   REGISTER
================================ */
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, role],
      (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        res.json({
          message: "Usuario creado",
          user: {
            id: result.insertId,
            username,
            role,
          },
        });
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
router.get("/test", (req, res) => {
  res.send("auth funcionando");
});

});

module.exports = router;