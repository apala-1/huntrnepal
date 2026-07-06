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

module.exports = router;