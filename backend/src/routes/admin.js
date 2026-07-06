const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllUsers, toggleUserStatus, verifyCompany,
  getAuditLogs, getStats, getAllPayments
} = require('../controllers/adminController');

router.get('/stats', authenticate, getStats); 

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.put('/companies/:id/verify', verifyCompany);
router.get('/logs', getAuditLogs);
router.get('/payments', getAllPayments);

module.exports = router;