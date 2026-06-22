const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const db = require('../config/database');

// ─── Helper: Create JWT ───────────────────────────────────────────
const createToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30m' }
  );
};

// ─── Helper: Log audit event ─────────────────────────────────────
const logAudit = (userId, action, targetType, targetId, ip, userAgent, details) => {
  db.run(
    `INSERT INTO audit_logs 
     (user_id, action, target_type, target_id, ip_address, user_agent, details) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, action, targetType, targetId, ip, userAgent, details]
  );
};

// ─── REGISTER ────────────────────────────────────────────────────
const register = (req, res) => {
  const { username, email, password, role } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Only allow valid roles
  const allowedRoles = ['researcher', 'company'];
  const userRole = allowedRoles.includes(role) ? role : 'researcher';

  // Check if user already exists
  db.get(
    'SELECT id FROM users WHERE email = ? OR username = ?',
    [email, username],
    async (err, existingUser) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (existingUser) {
        return res.status(409).json({ error: 'Email or username already taken' });
      }

      try {
        // Hash password with bcrypt (cost factor 12)
        const passwordHash = await bcrypt.hash(password, 12);

        // Insert new user
        db.run(
          `INSERT INTO users (username, email, password_hash, role) 
           VALUES (?, ?, ?, ?)`,
          [username, email, passwordHash, userRole],
          function (err) {
            if (err) return res.status(500).json({ error: 'Failed to create user' });

            const newUserId = this.lastID;

            // If registering as company, create company profile too
            if (userRole === 'company') {
              const { company_name, website } = req.body;
              db.run(
                `INSERT INTO companies (user_id, company_name, website) 
                 VALUES (?, ?, ?)`,
                [newUserId, company_name || username, website || '']
              );
            }

            logAudit(newUserId, 'REGISTER', 'user', newUserId, 
              req.ip, req.get('User-Agent'), `New ${userRole} registered`);

            res.status(201).json({
              message: 'Account created successfully',
              userId: newUserId,
              role: userRole
            });
          }
        );
      } catch (err) {
        res.status(500).json({ error: 'Server error during registration' });
      }
    }
  );
};

// ─── LOGIN ───────────────────────────────────────────────────────
// NOTE: No rate limiting here intentionally - this is a vulnerability
// we will exploit in penetration testing (Phase 8) then fix (Phase 6)
const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });

      // VULNERABILITY NOTE: We return the same error for both cases
      // (user not found AND wrong password). This prevents username enumeration.
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check if account is locked
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        return res.status(423).json({ 
          error: 'Account temporarily locked. Try again later.' 
        });
      }

      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        // Increment failed attempts
        const attempts = user.failed_login_attempts + 1;
        const lockUntil = attempts >= 5 
          ? new Date(Date.now() + 15 * 60 * 1000).toISOString() 
          : null;

        db.run(
          'UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?',
          [attempts, lockUntil, user.id]
        );

        logAudit(user.id, 'LOGIN_FAILED', 'user', user.id,
          req.ip, req.get('User-Agent'), `Failed attempt ${attempts}`);

        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Reset failed attempts on success
      db.run(
        'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?',
        [user.id]
      );

      // If MFA is enabled, don't give full token yet
      if (user.mfa_enabled) {
        const tempToken = jwt.sign(
          { userId: user.id, role: user.role, mfaPending: true },
          process.env.JWT_SECRET,
          { expiresIn: '5m' }
        );
        return res.json({ 
          mfaRequired: true, 
          tempToken 
        });
      }

      // Issue full JWT in httpOnly cookie
      const token = createToken(user.id, user.role);

      res.cookie('token', token, {
        httpOnly: true,       // JS cannot access this cookie
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',   // CSRF protection
        maxAge: 30 * 60 * 1000 // 30 minutes
      });

      logAudit(user.id, 'LOGIN_SUCCESS', 'user', user.id,
        req.ip, req.get('User-Agent'), 'Successful login');

      res.json({
        message: 'Login successful',
        user: { id: user.id, username: user.username, role: user.role, email: user.email }
      });
    }
  );
};

// ─── LOGOUT ──────────────────────────────────────────────────────
const logout = (req, res) => {
  logAudit(req.user?.userId, 'LOGOUT', 'user', req.user?.userId,
    req.ip, req.get('User-Agent'), 'User logged out');

  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

// ─── MFA SETUP ───────────────────────────────────────────────────
const setupMfa = (req, res) => {
  const secret = speakeasy.generateSecret({
    name: `HuntrNepal:${req.user.email}`,
    length: 20
  });

  // Store secret temporarily (not enabled until verified)
  db.run(
    'UPDATE users SET mfa_secret = ? WHERE id = ?',
    [secret.base32, req.user.userId],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to setup MFA' });

      QRCode.toDataURL(secret.otpauth_url, (err, qrCodeUrl) => {
        if (err) return res.status(500).json({ error: 'Failed to generate QR code' });

        res.json({
          secret: secret.base32,
          qrCode: qrCodeUrl,
          message: 'Scan this QR code with your authenticator app, then verify'
        });
      });
    }
  );
};

// ─── MFA VERIFY AND ENABLE ───────────────────────────────────────
const verifyMfa = (req, res) => {
  const { token } = req.body;

  db.get('SELECT mfa_secret FROM users WHERE id = ?', [req.user.userId], (err, user) => {
    if (err || !user) return res.status(500).json({ error: 'User not found' });

    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: 'base32',
      token,
      window: 1 // Allow 1 step before/after for clock skew
    });

    if (!verified) {
      return res.status(401).json({ error: 'Invalid MFA code' });
    }

    // Enable MFA on the account
    db.run('UPDATE users SET mfa_enabled = 1 WHERE id = ?', [req.user.userId]);

    logAudit(req.user.userId, 'MFA_ENABLED', 'user', req.user.userId,
      req.ip, req.get('User-Agent'), 'MFA successfully enabled');

    res.json({ message: 'MFA enabled successfully' });
  });
};

// ─── MFA LOGIN VERIFICATION ──────────────────────────────────────
const verifyMfaLogin = (req, res) => {
  const { token, tempToken } = req.body;

  let decoded;
  try {
    decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  if (!decoded.mfaPending) {
    return res.status(400).json({ error: 'MFA not required for this session' });
  }

  db.get('SELECT * FROM users WHERE id = ?', [decoded.userId], (err, user) => {
    if (err || !user) return res.status(500).json({ error: 'User not found' });

    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return res.status(401).json({ error: 'Invalid MFA code' });
    }

    // Issue full JWT
    const fullToken = createToken(user.id, user.role);

    res.cookie('token', fullToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000
    });

    logAudit(user.id, 'MFA_LOGIN_SUCCESS', 'user', user.id,
      req.ip, req.get('User-Agent'), 'MFA login verified');

    res.json({
      message: 'MFA verified. Login successful.',
      user: { id: user.id, username: user.username, role: user.role, email: user.email }
    });
  });
};

// ─── GET CURRENT USER ────────────────────────────────────────────
const getMe = (req, res) => {
  db.get(
    'SELECT id, username, email, role, mfa_enabled, created_at FROM users WHERE id = ?',
    [req.user.userId],
    (err, user) => {
      if (err || !user) return res.status(404).json({ error: 'User not found' });
      res.json({ user });
    }
  );
};

module.exports = { register, login, logout, setupMfa, verifyMfa, verifyMfaLogin, getMe };