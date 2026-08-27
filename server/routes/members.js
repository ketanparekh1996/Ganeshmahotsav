const express = require('express');
const bcrypt  = require('bcryptjs');
const { db }  = require('../database');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { addLog } = require('../helpers/log');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const { status, search } = req.query;
  let query = 'SELECT id, name, mobile, email, role, status, profile_photo, created_at FROM users WHERE 1=1';
  const params = [];

  if (status) { query += ' AND status = ?'; params.push(status); }
  if (search) { query += ' AND (name LIKE ? OR mobile LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  query += ' ORDER BY name';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/:id', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, name, mobile, email, role, status, profile_photo, created_at FROM users WHERE id = ?',
    [req.params.id],
    (err, row) => {
      if (err)  return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Member not found' });
      res.json(row);
    }
  );
});

router.get('/:id/expenses', authenticateToken, (req, res) => {
  db.all(
    `SELECT e.*, u.name as member_name FROM expenses e JOIN users u ON e.member_id = u.id
     WHERE e.member_id = ? ORDER BY e.expense_date DESC`,
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

router.post('/', authenticateToken, isAdmin, (req, res) => {
  const { name, mobile, email, password, role, status } = req.body;
  if (!name || !mobile || !password)
    return res.status(400).json({ error: 'Name, mobile, and password are required' });

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    `INSERT INTO users (name, mobile, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)`,
    [name, mobile, email, hashedPassword, role || 'member', status || 'active'],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE'))
          return res.status(400).json({ error: 'Mobile number already registered' });
        return res.status(500).json({ error: err.message });
      }
      const newId = this.lastID;
      addLog({
        userId: req.user.id, userName: req.user.name,
        action: 'CREATE', entityType: 'member', entityId: newId,
        description: `Added member "${name}" (${mobile}) as ${role || 'member'}`,
        newData: { id: newId, name, mobile, email, role: role || 'member', status: status || 'active' },
      });
      res.status(201).json({ id: newId, message: 'Member created successfully' });
    }
  );
});

router.put('/:id', authenticateToken, isAdmin, (req, res) => {
  const { name, mobile, email, role, status } = req.body;

  db.get('SELECT id, name, mobile, email, role, status FROM users WHERE id = ?', [req.params.id], (err, old) => {
    if (err)  return res.status(500).json({ error: err.message });
    if (!old) return res.status(404).json({ error: 'Member not found' });

    db.run(
      `UPDATE users SET name=?, mobile=?, email=?, role=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      [name, mobile, email, role, status, req.params.id],
      function(e) {
        if (e) {
          if (e.message.includes('UNIQUE'))
            return res.status(400).json({ error: 'Mobile number already registered' });
          return res.status(500).json({ error: e.message });
        }
        addLog({
          userId: req.user.id, userName: req.user.name,
          action: 'UPDATE', entityType: 'member', entityId: parseInt(req.params.id),
          description: `Updated member "${name}" — role: ${role}, status: ${status}`,
          oldData: old,
          newData: { id: parseInt(req.params.id), name, mobile, email, role, status },
        });
        res.json({ message: 'Member updated successfully' });
      }
    );
  });
});

router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
  if (parseInt(req.params.id, 10) === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }

  db.get('SELECT COUNT(*) as count FROM expenses WHERE member_id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row.count > 0)
      return res.status(400).json({ error: 'Cannot delete member with existing expenses' });

    db.get('SELECT id, name, mobile, email, role, status FROM users WHERE id = ?', [req.params.id], (e, old) => {
      if (e)    return res.status(500).json({ error: e.message });
      if (!old) return res.status(404).json({ error: 'Member not found' });

      db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(e2) {
        if (e2) return res.status(500).json({ error: e2.message });
        addLog({
          userId: req.user.id, userName: req.user.name,
          action: 'DELETE', entityType: 'member', entityId: parseInt(req.params.id),
          description: `Deleted member "${old.name}" (${old.mobile})`,
          oldData: old,
        });
        res.json({ message: 'Member deleted successfully' });
      });
    });
  });
});

module.exports = router;
