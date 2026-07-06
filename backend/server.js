require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const initDb = require('./src/config/initDb');

const app = express();

// Security headers
app.use(helmet());

// CORS - only allow our React frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true  // Allow cookies to be sent cross-origin
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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