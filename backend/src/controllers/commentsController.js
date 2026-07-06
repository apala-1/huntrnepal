const db = require('../config/database');

// VULNERABILITY: No ownership check — any user can comment on any report
// Also stores raw HTML in comment — Stored XSS via comments
const addComment = (req, res) => {
  const { report_id, comment } = req.body;
  const userId = req.user.userId;

  if (!comment || comment.trim().length === 0) {
    return res.status(400).json({ error: 'Comment cannot be empty' });
  }

  // ⚠️ No check if user has access to this report
  db.run(
    `INSERT INTO report_comments (report_id, user_id, comment) VALUES (?, ?, ?)`,
    [report_id, userId, comment],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to add comment' });
      
      db.run(`
        INSERT INTO audit_logs (user_id, action, target_type, target_id, ip_address, details)
        VALUES (?, 'COMMENT_ADDED', 'report', ?, ?, ?)
      `, [userId, report_id, req.ip, `Comment added to report #${report_id}`]);

      res.status(201).json({ message: 'Comment added', commentId: this.lastID });
    }
  );
};

const getComments = (req, res) => {
  const { report_id } = req.params;

  db.all(`
    SELECT rc.*, u.username, u.role
    FROM report_comments rc
    JOIN users u ON rc.user_id = u.id
    WHERE rc.report_id = ?
    ORDER BY rc.created_at ASC
  `, [report_id], (err, comments) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch comments' });
    res.json({ comments });
  });
};

module.exports = { addComment, getComments };