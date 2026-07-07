const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { authenticate } = require('../middleware/auth');
const { validateRegistration } = require('../middleware/validate');
const {
  register, login, logout,
  setupMfa, verifyMfa, verifyMfaLogin,
  getMe, changePassword, updateProfile,
  forgotPassword, resetPassword, uploadAvatar
} = require('../controllers/authController');
const upload = require('../middleware/upload');

// ✅ FIXED: Rate limiting prevents brute force attacks
// Per brief requirement: lockout after 10-15 attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minute window
  max: 10,                     // 10 attempts per window per IP
  message: { 
    error: 'Too many login attempts from this IP address. Please try again in 15 minutes.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true  // Only count failed attempts
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 5,                      // 5 registrations per hour per IP
  message: { 
    error: 'Too many accounts created. Please try again later.' 
  }
});

const mfaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many MFA attempts. Please try again later.' }
});

const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: 'Too many reset attempts. Please try again in 1 hour.' }
});

// Public routes
router.post('/register', registerLimiter, validateRegistration, register);
router.post('/login', loginLimiter, login);
router.post('/forgot-password', resetLimiter, forgotPassword);
router.post('/reset-password', resetLimiter, resetPassword);
router.post('/mfa/login', mfaLimiter, verifyMfaLogin);
router.post(
  '/avatar',
  authenticate,
  upload.single('avatar'),
  uploadAvatar
);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.post('/mfa/setup', authenticate, setupMfa);
router.post('/mfa/verify', mfaLimiter, authenticate, verifyMfa);

module.exports = router;