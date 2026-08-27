const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database');
const { SECRET_KEY, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', (req, res) => {
  const { mobile, password } = req.body;

  db.get('SELECT * FROM users WHERE mobile = ? AND status = ?', [mobile, 'active'], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'Invalid credentials' });

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, SECRET_KEY, {
      expiresIn: '24h'
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role
      }
    });
  });
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  db.get('SELECT id, name, mobile, email, role, profile_photo FROM users WHERE id = ?', 
    [req.user.id], 
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(user);
    }
  );
});

module.exports = router;
