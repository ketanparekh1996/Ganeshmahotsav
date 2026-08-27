const express = require('express');
const { db } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get comprehensive report
router.get('/', authenticateToken, (req, res) => {
  const { start_date, end_date, category, member_id } = req.query;

  const queries = {};
  const params = {};

  // Total donations query
  let donationQuery = 'SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM donations WHERE 1=1';
  params.donations = [];
  if (start_date) {
    donationQuery += ' AND donation_date >= ?';
    params.donations.push(start_date);
  }
  if (end_date) {
    donationQuery += ' AND donation_date <= ?';
    params.donations.push(end_date);
  }
  queries.donations = donationQuery;

  // Total expenses query
  let expenseQuery = 'SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM expenses WHERE 1=1';
  params.expenses = [];
  if (start_date) {
    expenseQuery += ' AND expense_date >= ?';
    params.expenses.push(start_date);
  }
  if (end_date) {
    expenseQuery += ' AND expense_date <= ?';
    params.expenses.push(end_date);
  }
  if (category) {
    expenseQuery += ' AND category = ?';
    params.expenses.push(category);
  }
  if (member_id) {
    expenseQuery += ' AND member_id = ?';
    params.expenses.push(member_id);
  }
  queries.expenses = expenseQuery;

  const results = {};
  let completed = 0;

  db.get(queries.donations, params.donations, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    results.totalDonations = row.total;
    results.donationCount = row.count;
    completed++;
    if (completed === 2) {
      results.remainingBalance = results.totalDonations - results.totalExpenses;
      res.json(results);
    }
  });

  db.get(queries.expenses, params.expenses, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    results.totalExpenses = row.total;
    results.expenseCount = row.count;
    completed++;
    if (completed === 2) {
      results.remainingBalance = results.totalDonations - results.totalExpenses;
      res.json(results);
    }
  });
});

// Date-wise donations
router.get('/donations-by-date', authenticateToken, (req, res) => {
  const { start_date, end_date } = req.query;
  
  let query = `SELECT DATE(donation_date) as date, COALESCE(SUM(amount), 0) as total, COUNT(*) as count
               FROM donations WHERE 1=1`;
  const params = [];

  if (start_date) {
    query += ' AND donation_date >= ?';
    params.push(start_date);
  }
  if (end_date) {
    query += ' AND donation_date <= ?';
    params.push(end_date);
  }

  query += ' GROUP BY DATE(donation_date) ORDER BY date DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Date-wise expenses
router.get('/expenses-by-date', authenticateToken, (req, res) => {
  const { start_date, end_date } = req.query;
  
  let query = `SELECT DATE(expense_date) as date, COALESCE(SUM(amount), 0) as total, COUNT(*) as count
               FROM expenses WHERE 1=1`;
  const params = [];

  if (start_date) {
    query += ' AND expense_date >= ?';
    params.push(start_date);
  }
  if (end_date) {
    query += ' AND expense_date <= ?';
    params.push(end_date);
  }

  query += ' GROUP BY DATE(expense_date) ORDER BY date DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
