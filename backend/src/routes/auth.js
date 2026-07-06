const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const {
  register, login, logout,
  setupMfa, verifyMfa, verifyMfaLogin,
  getMe, changePassword, updateProfile,
  forgotPassword, resetPassword
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/mfa/login', verifyMfaLogin);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.post('/mfa/setup', authenticate, setupMfa);
router.post('/mfa/verify', authenticate, verifyMfa);

module.exports = router;