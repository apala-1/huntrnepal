const db = require('../config/database');

// ─── TOGGLE USER ACTIVE STATUS ───────────────────────────────────
const toggleUserStatus = (req, res) => {
  const { id } = req.params;

  // Prevent admin from deactivating themselves
  if (parseInt(id) === req.user.userId) {
    return res.status(400).json({ error: 'Cannot deactivate your own account' });
  }

  db.get('SELECT is_active, role FROM users WHERE id = ?', [id], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot deactivate another admin' });
    }

    const newStatus = user.is_active ? 0 : 1;
    db.run('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to update user' });

      db.run(`
        INSERT INTO audit_logs (user_id, action, target_type, target_id, ip_address, details)
        VALUES (?, ?, 'user', ?, ?, ?)
      `, [req.user.userId,
          newStatus ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
          id, req.ip,
          `User ${newStatus ? 'activated' : 'deactivated'} by admin`
      ]);

      res.json({ message: `User ${newStatus ? 'activated' : 'deactivated'}` });
    });
  });
};

// ─── VERIFY A COMPANY ────────────────────────────────────────────
const verifyCompany = (req, res) => {
  const { id } = req.params;

  db.run('UPDATE companies SET is_verified = 1 WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to verify company' });
    if (this.changes === 0) return res.status(404).json({ error: 'Company not found' });

    db.run(`
      INSERT INTO audit_logs (user_id, action, target_type, target_id, ip_address, details)
      VALUES (?, 'COMPANY_VERIFIED', 'company', ?, ?, 'Company verified by admin')
    `, [req.user.userId, id, req.ip]);

    res.json({ message: 'Company verified successfully' });
  });
};


// ─── GET PLATFORM STATS ──────────────────────────────────────────
const getStats = (req, res) => {
  const stats = {};

  db.get('SELECT COUNT(*) as count FROM users WHERE role = "researcher"', [], (err, r) => {
    stats.researchers = r?.count || 0;

    db.get('SELECT COUNT(*) as count FROM users WHERE role = "company"', [], (err, r) => {
      stats.companies = r?.count || 0;

      db.get('SELECT COUNT(*) as count FROM bounty_programs WHERE is_active = 1', [], (err, r) => {
        stats.activePrograms = r?.count || 0;

        db.get('SELECT COUNT(*) as count FROM reports', [], (err, r) => {
          stats.totalReports = r?.count || 0;

          db.get('SELECT COUNT(*) as count FROM reports WHERE status = "resolved"', [], (err, r) => {
            stats.resolvedReports = r?.count || 0;

            db.get('SELECT SUM(amount) as total FROM payments WHERE status = "completed"', [], (err, r) => {
              stats.totalPaidOut = r?.total || 0;

              res.json({ stats });
            });
          });
        });
      });
    });
  });
};


// ─── GET ALL USERS WITH PAGINATION ───────────────────────────────
const getAllUsers = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  db.get('SELECT COUNT(*) as total FROM users', [], (err, countRow) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    db.all(`
      SELECT 
        u.id, u.username, u.email, u.role,
        u.is_active, u.mfa_enabled,
        u.failed_login_attempts, u.created_at,
        c.company_name
      FROM users u
      LEFT JOIN companies c ON c.user_id = u.id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset], (err, users) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch users' });

      db.run(`
        INSERT INTO audit_logs (user_id, action, target_type, ip_address, details)
        VALUES (?, 'ADMIN_USERS_ACCESSED', 'users', ?, ?)
      `, [req.user.userId, req.ip, `Page ${page} accessed`]);

      res.json({
        users,
        pagination: {
          page,
          limit,
          total: countRow.total,
          totalPages: Math.ceil(countRow.total / limit)
        }
      });
    });
  });
};

// ─── GET AUDIT LOGS WITH PAGINATION ──────────────────────────────
const getAuditLogs = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  db.get('SELECT COUNT(*) as total FROM audit_logs', [], (err, countRow) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    db.all(`
      SELECT al.*, u.username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset], (err, logs) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch logs' });
      res.json({
        logs,
        pagination: {
          page,
          limit,
          total: countRow.total,
          totalPages: Math.ceil(countRow.total / limit)
        }
      });
    });
  });
};

// ─── GET ALL PAYMENTS WITH PAGINATION ────────────────────────────
const getAllPayments = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  db.get('SELECT COUNT(*) as total FROM payments', [], (err, countRow) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    db.all(`
      SELECT p.*, u.username as researcher_username,
        c.company_name, r.title as report_title
      FROM payments p
      JOIN users u ON p.researcher_id = u.id
      JOIN companies c ON p.company_id = c.id
      JOIN reports r ON p.report_id = r.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset], (err, payments) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch payments' });
      res.json({
        payments,
        pagination: {
          page,
          limit,
          total: countRow.total,
          totalPages: Math.ceil(countRow.total / limit)
        }
      });
    });
  });
};

// ─── CREATE USER (admin only) ─────────────────────────────────────
const createUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const allowedRoles = ['researcher', 'company', 'admin'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  db.get('SELECT id FROM users WHERE email = ? OR username = ?',
    [email, username], async (err, existing) => {
      if (existing) return res.status(409).json({ error: 'Email or username already taken' });

      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash(password, 12);

      db.run(
        `INSERT INTO users (username, email, password_hash, role, is_active)
         VALUES (?, ?, ?, ?, 1)`,
        [username, email, passwordHash, role],
        function(err) {
          if (err) return res.status(500).json({ error: 'Failed to create user' });

          db.run(`
            INSERT INTO audit_logs (user_id, action, target_type, target_id, ip_address, details)
            VALUES (?, 'ADMIN_USER_CREATED', 'user', ?, ?, ?)
          `, [req.user.userId, this.lastID, req.ip, `Created ${role}: ${username}`]);

          res.status(201).json({ message: 'User created', userId: this.lastID });
        }
      );
    });
};

// ─── EDIT USER (admin only) ───────────────────────────────────────
const editUser = (req, res) => {
  const { id } = req.params;
  const { username, email, role } = req.body;

  if (parseInt(id) === req.user.userId) {
    return res.status(400).json({ error: 'Cannot edit your own account here' });
  }

  db.run(
    `UPDATE users SET username = ?, email = ?, role = ?,
     updated_at = datetime('now') WHERE id = ?`,
    [username, email, role, id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to update user' });
      if (this.changes === 0) return res.status(404).json({ error: 'User not found' });

      db.run(`
        INSERT INTO audit_logs (user_id, action, target_type, target_id, ip_address, details)
        VALUES (?, 'ADMIN_USER_EDITED', 'user', ?, ?, ?)
      `, [req.user.userId, id, req.ip, `Updated user #${id}`]);

      res.json({ message: 'User updated successfully' });
    }
  );
};

// ─── DELETE USER (admin only) ─────────────────────────────────────
const deleteUser = (req, res) => {
  const { id } = req.params;

  if (parseInt(id) === req.user.userId) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  db.get('SELECT role FROM users WHERE id = ?', [id], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete another admin account' });
    }

    db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to delete user' });

      db.run(`
        INSERT INTO audit_logs (user_id, action, target_type, target_id, ip_address, details)
        VALUES (?, 'ADMIN_USER_DELETED', 'user', ?, ?, ?)
      `, [req.user.userId, id, req.ip, `Permanently deleted user #${id}`]);

      res.json({ message: 'User permanently deleted' });
    });
  });
};

module.exports = {
  getAllUsers, toggleUserStatus, verifyCompany,
  getAuditLogs, getStats, getAllPayments, createUser, editUser, deleteUser
};