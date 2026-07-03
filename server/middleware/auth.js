const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'auto-cabify-secret-change-me-in-production';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso solo para administradores' });
  }
  next();
}

function requireConductor(req, res, next) {
  if (req.user.role !== 'conductor') {
    return res.status(403).json({ error: 'Acceso solo para conductores' });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin, requireConductor, JWT_SECRET };
