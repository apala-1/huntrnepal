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
router.put('/profile', authenticate, (req, res) => {
  const { bio, website, twitter, location } = req.body;
  const db = require('../config/database');
  
  db.run(
    'UPDATE users SET bio = ?, website = ?, twitter = ?, location = ? WHERE id = ?',
    [bio, website, twitter, location, req.user.userId],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to update profile' });
      res.json({ message: 'Profile updated' });
    }
  );
});
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  // BAD: Math.random() is predictable, not cryptographically random
  const resetToken = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  
  const db = require('../config/database');
  db.run(
    'UPDATE users SET mfa_secret = ? WHERE email = ?',
    [resetToken, email]
  );
  
  // In real app would send email - here we return it directly (another vuln: token in response)
  res.json({ 
    message: 'Reset token sent',
    debug_token: resetToken  // ⚠️ NEVER expose token in response
  });
});

module.exports = router;