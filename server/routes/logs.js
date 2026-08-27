const express = require('express');
const { db } = require('../database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all logs (paginated)
router.get('/', authenticateToken, (req, res) => {
  const { page = 1, limit = 50, entity_type, action } = req.query;
  const offset = (page - 1) * limit;

  let where = 'WHERE 1=1';
  const params = [];

  if (entity_type) { where += ' AND entity_type = ?'; params.push(entity_type); }
  if (action)      { where += ' AND action = ?';      params.push(action); }

  db.get(`SELECT COUNT(*) as total FROM activity_logs ${where}`, params, (err, countRow) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all(
      `SELECT * FROM activity_logs ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)],
      (err2, rows) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ logs: rows, total: countRow.total, page: parseInt(page), limit: parseInt(limit) });
      }
    );
  });
});

// Revert a log entry (restore old_data)
router.post('/:id/revert', authenticateToken, (req, res) => {
  db.get('SELECT * FROM activity_logs WHERE id = ?', [req.params.id], (err, log) => {
    if (err)  return res.status(500).json({ error: err.message });
    if (!log) return res.status(404).json({ error: 'Log not found' });
    if (!log.old_data) return res.status(400).json({ error: 'Nothing to revert — no previous data stored' });
    if (log.entity_type === 'member') {
      return isAdmin(req, res, () => revertLog(log, req, res));
    }
    revertLog(log, req, res);
  });
});

function revertLog(log, req, res) {

    const old = JSON.parse(log.old_data);

    if (log.action === 'DELETE') {
      // Re-insert the deleted record
      if (log.entity_type === 'donation') {
        db.run(
          `INSERT INTO donations (id, donor_name, mobile, amount, payment_method, donation_date, receipt_number, notes, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [old.id, old.donor_name, old.mobile, old.amount, old.payment_method,
           old.donation_date, old.receipt_number, old.notes, old.created_by],
          (e) => {
            if (e) return res.status(500).json({ error: e.message });
            insertRevertLog(log, req.user);
            res.json({ message: 'Donation restored successfully' });
          }
        );
      } else if (log.entity_type === 'expense') {
        db.run(
          `INSERT INTO expenses (id, member_id, title, category, amount, expense_date, payment_method, description, receipt_image, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [old.id, old.member_id, old.title, old.category, old.amount, old.expense_date,
           old.payment_method, old.description, old.receipt_image, old.notes],
          (e) => {
            if (e) return res.status(500).json({ error: e.message });
            insertRevertLog(log, req.user);
            res.json({ message: 'Expense restored successfully' });
          }
        );
      } else {
        return res.status(400).json({ error: 'Revert not supported for this entity type' });
      }
    } else if (log.action === 'UPDATE' || log.action === 'CREATE') {
      // Restore to old_data values
      if (log.entity_type === 'donation') {
        db.run(
          `UPDATE donations SET donor_name=?, mobile=?, amount=?, payment_method=?,
           donation_date=?, receipt_number=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
          [old.donor_name, old.mobile, old.amount, old.payment_method,
           old.donation_date, old.receipt_number, old.notes, log.entity_id],
          (e) => {
            if (e) return res.status(500).json({ error: e.message });
            insertRevertLog(log, req.user);
            res.json({ message: 'Donation reverted successfully' });
          }
        );
      } else if (log.entity_type === 'expense') {
        db.run(
          `UPDATE expenses SET member_id=?, title=?, category=?, amount=?, expense_date=?,
           payment_method=?, description=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
          [old.member_id, old.title, old.category, old.amount, old.expense_date,
           old.payment_method, old.description, old.notes, log.entity_id],
          (e) => {
            if (e) return res.status(500).json({ error: e.message });
            insertRevertLog(log, req.user);
            res.json({ message: 'Expense reverted successfully' });
          }
        );
      } else if (log.entity_type === 'member') {
        db.run(
          `UPDATE users SET name=?, mobile=?, email=?, role=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
          [old.name, old.mobile, old.email, old.role, old.status, log.entity_id],
          (e) => {
            if (e) return res.status(500).json({ error: e.message });
            insertRevertLog(log, req.user);
            res.json({ message: 'Member reverted successfully' });
          }
        );
      } else {
        return res.status(400).json({ error: 'Revert not supported for this entity type' });
      }
    } else {
      return res.status(400).json({ error: 'Cannot revert this action' });
    }
}

function insertRevertLog(originalLog, user) {
  db.run(
    `INSERT INTO activity_logs (user_id, user_name, action, entity_type, entity_id, description)
     VALUES (?, ?, 'REVERT', ?, ?, ?)`,
    [user.id, user.name, originalLog.entity_type, originalLog.entity_id,
     `Reverted: ${originalLog.description}`]
  );
}

module.exports = router;
