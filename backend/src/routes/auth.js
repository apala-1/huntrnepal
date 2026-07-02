const router = require('express').Router();
const { 
  register, login, logout, 
  setupMfa, verifyMfa, verifyMfaLogin, getMe, changePassword   
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/mfa/setup', authenticate, setupMfa);
router.post('/mfa/verify', authenticate, verifyMfa);
router.post('/mfa/login', verifyMfaLogin);
router.post('/change-password', authenticate, changePassword);

module.exports = router;