const db = require('./src/config/database');
const crypto = require('crypto');

db.run(
  'ALTER TABLE companies ADD COLUMN encryption_key TEXT',
  [],
  (err) => {
    if (err && !err.message.toLowerCase().includes('duplicate')) {
      console.error(err);
    }
  }
);

db.all('SELECT id FROM companies', [], (err, companies) => {
  if (err) {
    console.error(err);
    return;
  }

  companies.forEach((company) => {
    const key = crypto.randomBytes(32).toString('hex');

    db.run(
      'UPDATE companies SET encryption_key = ? WHERE id = ?',
      [key, company.id]
    );
  });

  console.log('Encryption keys generated for all companies.');
});