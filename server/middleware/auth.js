const jwt = require('jsonwebtoken');
const { db } = require('../database');
const SECRET_KEY = process.env.JWT_SECRET || 'ganesh_mahotsav_secret_key_2024';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  db.get(
    'SELECT role, status FROM users WHERE id = ?',
    [req.user.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row || row.status !== 'active' || row.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
      }
      req.user.role = row.role;
      next();
    }
  );
};

module.exports = { authenticateToken, isAdmin, SECRET_KEY };
