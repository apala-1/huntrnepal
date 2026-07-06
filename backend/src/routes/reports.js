const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  submitReport, getMyReports, getReport,
  getCompanyReports, updateReportStatus, getAllReports
} = require('../controllers/reportsController');

// Researcher
router.post('/', authenticate, authorize('researcher'), submitReport);
router.get('/my', authenticate, authorize('researcher'), getMyReports);

// Company
router.get('/company', authenticate, authorize('company'), getCompanyReports);
router.put('/:id/status', authenticate, authorize('company'), updateReportStatus);

// Admin
router.get('/all', authenticate, authorize('admin'), getAllReports);

// ⚠️ Vulnerable route - no ownership check (IDOR)
router.get('/:id', authenticate, getReport);

router.get('/leaderboard', (req, res) => {
  const db = require('../config/database');
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
});

module.exports = router;