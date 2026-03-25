function verificarRol(rolesPermitidos) {
  return (req, res, next) => {
    const usuario = req.usuario;

    if (!usuario || !rolesPermitidos.includes(usuario.role)) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    next();
  };
}

module.exports = verificarRol;