const db = require('./src/config/database');

db.run(
  'ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT NULL',
  (err) => {
    if (err) {
      // Ignore if the column already exists
      if (!err.message.toLowerCase().includes('duplicate')) {
        console.error(err);
      } else {
        console.log('avatar column already exists.');
      }
    } else {
      console.log('avatar column added.');
    }
  }
);