const db = require('../config/database');

// ─── SUBMIT REPORT (researcher only) ─────────────────────────────
const submitReport = (req, res) => {
  const { program_id, title, description, severity, cvss_score, steps_to_reproduce, impact } = req.body;

  if (!program_id || !title || !description || !severity || !steps_to_reproduce || !impact) {
    return res.status(400).json({ error: 'All required fields must be filled' });
  }

  const validSeverities = ['critical', 'high', 'medium', 'low', 'info'];
  if (!validSeverities.includes(severity)) {
    return res.status(400).json({ error: 'Invalid severity level' });
  }

  // Check program exists and is active
  db.get(
    'SELECT id FROM bounty_programs WHERE id = ? AND is_active = 1',
    [program_id],
    (err, program) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!program) return res.status(404).json({ error: 'Program not found or inactive' });

      db.get(`
        SELECT c.user_id FROM bounty_programs bp
        JOIN companies c ON bp.company_id = c.id
        WHERE bp.id = ?
      `, [program_id], (err, programOwner) => {
        if (programOwner && programOwner.user_id === req.user.userId) {
          return res.status(403).json({ 
            error: 'You cannot submit reports against your own company program' 
          });
        }

      db.get(
        'SELECT id FROM reports WHERE researcher_id = ? AND program_id = ? AND title = ?',
        [req.user.userId, program_id, title],
        (err, duplicate) => {
          if (duplicate) {
            return res.status(409).json({ 
              error: 'You have already submitted a report with this title for this program. Duplicate reports are not accepted.' 
            });
          }

      db.run(`
        INSERT INTO reports 
        (researcher_id, program_id, title, description, severity, cvss_score, steps_to_reproduce, impact)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [req.user.userId, program_id, title, description, severity, cvss_score || null, steps_to_reproduce, impact],
        function (err) {
          if (err) return res.status(500).json({ error: 'Failed to submit report' });

          db.run(`
            INSERT INTO audit_logs (user_id, action, target_type, target_id, ip_address, details)
            VALUES (?, 'REPORT_SUBMITTED', 'report', ?, ?, ?)
          `, [req.user.userId, this.lastID, req.ip, `Submitted report: ${title}`]);

          res.status(201).json({
            message: 'Report submitted successfully',
            reportId: this.lastID
          });
        }
      );
    });
  });
    }
  );
};

// ─── GET RESEARCHER'S OWN REPORTS ────────────────────────────────
const getMyReports = (req, res) => {
  db.all(`
    SELECT 
      r.id, r.title, r.severity, r.status, r.reward_amount, r.created_at,
      bp.title as program_title,
      c.company_name
    FROM reports r
    JOIN bounty_programs bp ON r.program_id = bp.id
    JOIN companies c ON bp.company_id = c.id
    WHERE r.researcher_id = ?
    ORDER BY r.created_at DESC
  `, [req.user.userId], (err, reports) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch reports' });
    res.json({ reports });
  });
};

// ─── GET SINGLE REPORT ───────────────────────────────────────────
const getReport = (req, res) => {
  const { id } = req.params;

  db.get(`
    SELECT 
      r.*,
      u.username as researcher_username,
      bp.title as program_title,
      c.company_name
    FROM reports r
    JOIN users u ON r.researcher_id = u.id
    JOIN bounty_programs bp ON r.program_id = bp.id
    JOIN companies c ON bp.company_id = c.id
    WHERE r.id = ?
  `, [id], (err, report) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ report });
  });
};

// ─── GET REPORTS FOR COMPANY'S PROGRAMS ──────────────────────────
const getCompanyReports = (req, res) => {
  db.get('SELECT id FROM companies WHERE user_id = ?', [req.user.userId], (err, company) => {
    if (err || !company) return res.status(404).json({ error: 'Company not found' });

    db.all(`
      SELECT 
        r.id, r.title, r.severity, r.status, r.reward_amount, r.created_at,
        u.username as researcher_username,
        bp.title as program_title
      FROM reports r
      JOIN users u ON r.researcher_id = u.id
      JOIN bounty_programs bp ON r.program_id = bp.id
      WHERE bp.company_id = ?
      ORDER BY r.created_at DESC
    `, [company.id], (err, reports) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch reports' });
      res.json({ reports });
    });
  });
};

// ─── UPDATE REPORT STATUS (company only) ─────────────────────────
const updateReportStatus = (req, res) => {
  const { id } = req.params;
  const { status, reward_amount } = req.body;

  const validStatuses = ['pending', 'triaging', 'accepted', 'rejected', 'resolved'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  // Verify company owns the program this report belongs to
  db.get(`
    SELECT r.id FROM reports r
    JOIN bounty_programs bp ON r.program_id = bp.id
    JOIN companies c ON bp.company_id = c.id
    WHERE r.id = ? AND c.user_id = ?
  `, [id, req.user.userId], (err, report) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!report) return res.status(403).json({ error: 'Access denied' });

    db.run(`
      UPDATE reports 
      SET status = ?, reward_amount = ?, updated_at = datetime('now')
      WHERE id = ?
    `, [status, reward_amount || null, id], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to update report' });

      db.run(`
        INSERT INTO audit_logs (user_id, action, target_type, target_id, ip_address, details)
        VALUES (?, 'REPORT_STATUS_UPDATED', 'report', ?, ?, ?)
      `, [req.user.userId, id, req.ip, `Status changed to: ${status}`]);

      res.json({ message: 'Report updated successfully' });
    });
  });
};

// ─── GET ALL REPORTS (admin only) ────────────────────────────────
const getAllReports = (req, res) => {
  db.all(`
    SELECT 
      r.id, r.title, r.severity, r.status, r.reward_amount, r.created_at,
      u.username as researcher_username,
      bp.title as program_title,
      c.company_name
    FROM reports r
    JOIN users u ON r.researcher_id = u.id
    JOIN bounty_programs bp ON r.program_id = bp.id
    JOIN companies c ON bp.company_id = c.id
    ORDER BY r.created_at DESC
  `, [], (err, reports) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch reports' });
    res.json({ reports });
  });
};

// ─── LEADERBOARD ─────────────────────────────────────────────────
const getLeaderboard = (req, res) => {
  db.all(`
    SELECT 
      r.researcher_id,
      u.username,
      COUNT(r.id) as total_reports,
      SUM(CASE WHEN r.status IN ('accepted','resolved') THEN 1 ELSE 0 END) as accepted_reports,
      SUM(CASE WHEN r.reward_amount IS NOT NULL THEN r.reward_amount ELSE 0 END) as total_earned
    FROM reports r
    JOIN users u ON r.researcher_id = u.id
    GROUP BY r.researcher_id
    ORDER BY accepted_reports DESC, total_earned DESC
    LIMIT 20
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch leaderboard' });
    res.json({ leaderboard: rows });
  });
};

module.exports = {
  submitReport, getMyReports, getReport,
  getCompanyReports, updateReportStatus, getAllReports, getLeaderboard
};