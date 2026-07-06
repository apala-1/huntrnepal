require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const initDb = require('./src/config/initDb');

const app = express();

// Security headers
// ✅ Security headers via Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true
  }
}));

// CORS - only allow our React frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true  // Allow cookies to be sent cross-origin
}));

// Body parsing
// ✅ Limit request size to prevent DoS via large payloads
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

const xss = require('xss');

// ✅ SECURITY: Sanitize all incoming request body strings against XSS
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const sanitizeValue = (val) => {
      if (typeof val === 'string') return xss(val);
      if (typeof val === 'object' && val !== null) {
        Object.keys(val).forEach(k => { val[k] = sanitizeValue(val[k]); });
      }
      return val;
    };
    req.body = sanitizeValue(req.body);
  }
  next();
});

// HTTP request logging
app.use(morgan('dev'));

// Initialize database tables
initDb();

// Routes (placeholders for now)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'HuntrNepal API is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/programs', require('./src/routes/programs'));
app.use('/api/reports', require('./src/routes/reports'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/payments', require('./src/routes/payments'));
app.use('/api/comments', require('./src/routes/comments'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`HuntrNepal API running on http://localhost:${PORT}`);
});