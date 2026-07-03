const db = require('./src/config/database');
const bcrypt = require('bcryptjs');

const hash = bcrypt.hashSync('AdminPass123!', 12);

db.run(
  `INSERT OR IGNORE INTO users
   (username, email, password_hash, role, is_active)
   VALUES (?, ?, ?, ?, ?)`,
  ['admin', 'admin@huntrnepal.com', hash, 'admin', 1],
  function (err) {
    if (err) {
      console.error('Error:', err.message);
      return;
    }

    console.log('Admin created! ID:', this.lastID);
    db.close();
  }
);