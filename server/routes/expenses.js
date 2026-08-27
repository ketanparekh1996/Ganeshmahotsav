const express = require('express');
const multer  = require('multer');
const path    = require('path');
const { db }  = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { addLog } = require('../helpers/log');

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.get('/', authenticateToken, (req, res) => {
  const { search, category, member_id, start_date, end_date, payment_method } = req.query;
  let query = `SELECT e.*, u.name as member_name, u.mobile as member_mobile
               FROM expenses e JOIN users u ON e.member_id = u.id WHERE 1=1`;
  const params = [];

  if (search)         { query += ' AND (e.title LIKE ? OR u.name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (category)       { query += ' AND e.category = ?';        params.push(category); }
  if (member_id)      { query += ' AND e.member_id = ?';       params.push(member_id); }
  if (start_date)     { query += ' AND e.expense_date >= ?';   params.push(start_date); }
  if (end_date)       { query += ' AND e.expense_date <= ?';   params.push(end_date); }
  if (payment_method) { query += ' AND e.payment_method = ?';  params.push(payment_method); }
  query += ' ORDER BY e.expense_date DESC, e.created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/:id', authenticateToken, (req, res) => {
  db.get(
    `SELECT e.*, u.name as member_name FROM expenses e JOIN users u ON e.member_id = u.id WHERE e.id = ?`,
    [req.params.id],
    (err, row) => {
      if (err)  return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Expense not found' });
      res.json(row);
    }
  );
});

router.post('/', authenticateToken, upload.single('receipt_image'), (req, res) => {
  const { member_id, title, category, amount, expense_date, payment_method, description, notes } = req.body;
  const receipt_image = req.file ? req.file.filename : null;

  if (!member_id || !title || !category || !amount || amount <= 0)
    return res.status(400).json({ error: 'Invalid input data' });

  db.run(
    `INSERT INTO expenses (member_id, title, category, amount, expense_date, payment_method, description, receipt_image, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [member_id, title, category, amount, expense_date, payment_method, description, receipt_image, notes],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      const newId = this.lastID;

      // get member name for description
      db.get('SELECT name FROM users WHERE id = ?', [member_id], (e, user) => {
        db.get('SELECT * FROM expenses WHERE id = ?', [newId], (e2, row) => {
          addLog({
            userId: req.user.id, userName: req.user.name,
            action: 'CREATE', entityType: 'expense', entityId: newId,
            description: `${user?.name || 'Unknown'} added expense "${title}" — ₹${amount} (${category})`,
            newData: row,
          });
        });
      });
      res.status(201).json({ id: newId, message: 'Expense added successfully' });
    }
  );
});

router.put('/:id', authenticateToken, upload.single('receipt_image'), (req, res) => {
  const { member_id, title, category, amount, expense_date, payment_method, description, notes } = req.body;
  const receipt_image = req.file ? req.file.filename : req.body.existing_receipt;

  db.get('SELECT * FROM expenses WHERE id = ?', [req.params.id], (err, old) => {
    if (err)  return res.status(500).json({ error: err.message });
    if (!old) return res.status(404).json({ error: 'Expense not found' });

    db.run(
      `UPDATE expenses SET member_id=?, title=?, category=?, amount=?, expense_date=?,
       payment_method=?, description=?, receipt_image=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      [member_id, title, category, amount, expense_date, payment_method, description, receipt_image, notes, req.params.id],
      function(e) {
        if (e) return res.status(500).json({ error: e.message });
        db.get('SELECT e.*, u.name as member_name FROM expenses e JOIN users u ON e.member_id = u.id WHERE e.id = ?',
          [req.params.id], (e2, updated) => {
            addLog({
              userId: req.user.id, userName: req.user.name,
              action: 'UPDATE', entityType: 'expense', entityId: parseInt(req.params.id),
              description: `Updated expense "${title}" — ₹${amount} (${category})`,
              oldData: old, newData: updated,
            });
          }
        );
        res.json({ message: 'Expense updated successfully' });
      }
    );
  });
});

router.delete('/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM expenses WHERE id = ?', [req.params.id], (err, old) => {
    if (err)  return res.status(500).json({ error: err.message });
    if (!old) return res.status(404).json({ error: 'Expense not found' });

    db.run('DELETE FROM expenses WHERE id = ?', [req.params.id], function(e) {
      if (e) return res.status(500).json({ error: e.message });
      addLog({
        userId: req.user.id, userName: req.user.name,
        action: 'DELETE', entityType: 'expense', entityId: parseInt(req.params.id),
        description: `Deleted expense "${old.title}" — ₹${old.amount}`,
        oldData: old,
      });
      res.json({ message: 'Expense deleted successfully' });
    });
  });
});

module.exports = router;
