const { db } = require('../database');

/**
 * Add an activity log entry
 * @param {object} opts
 * @param {number}  opts.userId
 * @param {string}  opts.userName
 * @param {string}  opts.action      - 'CREATE' | 'UPDATE' | 'DELETE'
 * @param {string}  opts.entityType  - 'donation' | 'expense' | 'member'
 * @param {number}  opts.entityId
 * @param {string}  opts.description - human-readable summary
 * @param {object}  [opts.oldData]   - snapshot before change (for UPDATE/DELETE)
 * @param {object}  [opts.newData]   - snapshot after change  (for CREATE/UPDATE)
 */
const addLog = ({ userId, userName, action, entityType, entityId, description, oldData, newData }) => {
  db.run(
    `INSERT INTO activity_logs
       (user_id, user_name, action, entity_type, entity_id, description, old_data, new_data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      userName,
      action,
      entityType,
      entityId,
      description,
      oldData ? JSON.stringify(oldData) : null,
      newData ? JSON.stringify(newData) : null,
    ]
  );
};

module.exports = { addLog };
