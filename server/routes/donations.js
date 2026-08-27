const express = require('express');
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { addLog } = require('../helpers/log');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const { search, payment_method, start_date, end_date } = req.query;
  let query = 'SELECT * FROM donations WHERE 1=1';
  const params = [];

  if (search) { query += ' AND (donor_name LIKE ? OR mobile LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (payment_method) { query += ' AND payment_method = ?'; params.push(payment_method); }
  if (start_date) { query += ' AND donation_date >= ?'; params.push(start_date); }
  if (end_date)   { query += ' AND donation_date <= ?'; params.push(end_date); }
  query += ' ORDER BY donation_date DESC, created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM donations WHERE id = ?', [req.params.id], (err, row) => {
    if (err)  return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Donation not found' });
    res.json(row);
  });
});

router.post('/', authenticateToken, (req, res) => {
  const { donor_name, mobile, amount, payment_method, donation_date, receipt_number, notes } = req.body;
  if (!donor_name || !amount || amount <= 0)
    return res.status(400).json({ error: 'Invalid input data' });

  db.run(
    `INSERT INTO donations (donor_name, mobile, amount, payment_method, donation_date, receipt_number, notes, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [donor_name, mobile || '', amount, payment_method, donation_date, receipt_number, notes, req.user.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      const newId = this.lastID;
      db.get('SELECT * FROM donations WHERE id = ?', [newId], (e, row) => {
        addLog({
          userId: req.user.id, userName: req.user.name,
          action: 'CREATE', entityType: 'donation', entityId: newId,
          description: `Added donation of ₹${amount} from ${donor_name}`,
          newData: row,
        });
      });
      res.status(201).json({ id: newId, message: 'Donation added successfully' });
    }
  );
});

router.put('/:id', authenticateToken, (req, res) => {
  const { donor_name, mobile, amount, payment_method, donation_date, receipt_number, notes } = req.body;

  db.get('SELECT * FROM donations WHERE id = ?', [req.params.id], (err, old) => {
    if (err)  return res.status(500).json({ error: err.message });
    if (!old) return res.status(404).json({ error: 'Donation not found' });

    db.run(
      `UPDATE donations SET donor_name=?, mobile=?, amount=?, payment_method=?,
       donation_date=?, receipt_number=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      [donor_name, mobile || '', amount, payment_method, donation_date, receipt_number, notes, req.params.id],
      function(e) {
        if (e) return res.status(500).json({ error: e.message });
        db.get('SELECT * FROM donations WHERE id = ?', [req.params.id], (e2, updated) => {
          addLog({
            userId: req.user.id, userName: req.user.name,
            action: 'UPDATE', entityType: 'donation', entityId: parseInt(req.params.id),
            description: `Updated donation from ${donor_name} — ₹${amount}`,
            oldData: old, newData: updated,
          });
        });
        res.json({ message: 'Donation updated successfully' });
      }
    );
  });
});

router.delete('/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM donations WHERE id = ?', [req.params.id], (err, old) => {
    if (err)  return res.status(500).json({ error: err.message });
    if (!old) return res.status(404).json({ error: 'Donation not found' });

    db.run('DELETE FROM donations WHERE id = ?', [req.params.id], function(e) {
      if (e) return res.status(500).json({ error: e.message });
      addLog({
        userId: req.user.id, userName: req.user.name,
        action: 'DELETE', entityType: 'donation', entityId: parseInt(req.params.id),
        description: `Deleted donation of ₹${old.amount} from ${old.donor_name}`,
        oldData: old,
      });
      res.json({ message: 'Donation deleted successfully' });
    });
  });
});

module.exports = router;
