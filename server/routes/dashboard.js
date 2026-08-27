const express = require('express');
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get dashboard summary
router.get('/summary', authenticateToken, (req, res) => {
  const queries = {
    totalDonations: 'SELECT COALESCE(SUM(amount), 0) as total FROM donations',
    totalExpenses: 'SELECT COALESCE(SUM(amount), 0) as total FROM expenses',
    totalDonors: 'SELECT COUNT(DISTINCT mobile) as count FROM donations',
    totalExpenseEntries: 'SELECT COUNT(*) as count FROM expenses',
    totalMembers: 'SELECT COUNT(*) as count FROM users WHERE status = "active"'
  };

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    db.get(query, (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (key === 'totalDonations') results.totalDonations = row.total;
      else if (key === 'totalExpenses') results.totalExpenses = row.total;
      else if (key === 'totalDonors') results.totalDonors = row.count;
      else if (key === 'totalExpenseEntries') results.totalExpenseEntries = row.count;
      else if (key === 'totalMembers') results.totalMembers = row.count;

      completed++;
      if (completed === total) {
        results.remainingBalance = results.totalDonations - results.totalExpenses;
        res.json(results);
      }
    });
  });
});

// Get recent donations
router.get('/recent-donations', authenticateToken, (req, res) => {
  const limit = req.query.limit || 5;
  db.all(
    'SELECT * FROM donations ORDER BY donation_date DESC, created_at DESC LIMIT ?',
    [limit],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get recent expenses
router.get('/recent-expenses', authenticateToken, (req, res) => {
  const limit = req.query.limit || 5;
  const query = `SELECT e.*, u.name as member_name 
                 FROM expenses e 
                 JOIN users u ON e.member_id = u.id 
                 ORDER BY e.expense_date DESC, e.created_at DESC 
                 LIMIT ?`;
  
  db.all(query, [limit], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get member expense summary
router.get('/member-expenses', authenticateToken, (req, res) => {
  const query = `SELECT u.id, u.name, u.mobile, COALESCE(SUM(e.amount), 0) as total_expenses, COUNT(e.id) as expense_count
                 FROM users u
                 LEFT JOIN expenses e ON u.id = e.member_id
                 WHERE u.status = 'active'
                 GROUP BY u.id, u.name, u.mobile
                 ORDER BY total_expenses DESC`;

  db.all(query, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get category-wise expenses
router.get('/category-expenses', authenticateToken, (req, res) => {
  const query = `SELECT category, COALESCE(SUM(amount), 0) as total, COUNT(*) as count
                 FROM expenses
                 GROUP BY category
                 ORDER BY total DESC`;

  db.all(query, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
