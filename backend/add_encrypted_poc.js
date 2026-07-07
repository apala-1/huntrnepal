const db = require('./src/config/database');

db.run(
  'ALTER TABLE reports ADD COLUMN encrypted_poc TEXT',
  [],
  (err) => {
    if (err) {
      // Ignore if the column already exists
      if (!err.message.toLowerCase().includes('duplicate')) {
        console.error(err);
      } else {
        console.log('encrypted_poc column already exists.');
      }
    } else {
      console.log('encrypted_poc column added.');
    }
  }
);