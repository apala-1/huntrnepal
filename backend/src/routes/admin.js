const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllUsers, toggleUserStatus, verifyCompany,
  getAuditLogs, getStats, getAllPayments,
  createUser, editUser, deleteUser
} = require('../controllers/adminController');

router.use(authenticate, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', editUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/toggle', toggleUserStatus);
router.put('/companies/:id/verify', verifyCompany);
router.get('/logs', getAuditLogs);
router.get('/payments', getAllPayments);

module.exports = router;