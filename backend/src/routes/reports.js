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

module.exports = router;