const db = require('./src/config/database');

db.serialize(() => {
  db.run(`ALTER TABLE users ADD COLUMN bio TEXT DEFAULT ''`, err => {
    if (err && !err.message.includes('duplicate column')) console.error(err.message);
  });

  db.run(`ALTER TABLE users ADD COLUMN website TEXT DEFAULT ''`, err => {
    if (err && !err.message.includes('duplicate column')) console.error(err.message);
  });

  db.run(`ALTER TABLE users ADD COLUMN location TEXT DEFAULT ''`, err => {
    if (err && !err.message.includes('duplicate column')) console.error(err.message);
  });

  db.run(`ALTER TABLE users ADD COLUMN twitter TEXT DEFAULT ''`, err => {
    if (err && !err.message.includes('duplicate column')) console.error(err.message);
  });

  console.log('Profile columns added (or already exist).');
});