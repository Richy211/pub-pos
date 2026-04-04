const express = require("express");
const router = express.Router();

const verificarToken = require("../middleware/auth");
const verificarRol = require("../middleware/verificarRol");

// ruta protegida
router.post("/",
  verificarToken,
  verificarRol(["admin", "garzon"]),
  (req, res) => {
    res.send("Pedido creado");
  }
);

module.exports = router;