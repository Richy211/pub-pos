const jwt = require("jsonwebtoken");

const SECRET = "super_secret_key";

function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token requerido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);

    req.usuario = decoded; // 🔥 AQUÍ guardamos el usuario

    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido" });
  }
}

module.exports = verificarToken;