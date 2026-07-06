const db = require('./src/config/database');

db.get(
  `SELECT id FROM companies WHERE company_name = ?`,
  ['Acme Corporation'],
  (err, row) => {
    if (err) {
      console.error(err);
      return;
    }

    if (!row) {
      console.log('Acme Corporation not found. Run seed.js first.');
      return;
    }

    const companyId = row.id;

    const stmt = db.prepare(`
      INSERT INTO bounty_programs
      (company_id, title, description, scope, out_of_scope, min_reward, max_reward, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      companyId,
      'Acme Legacy Portal',
      'Legacy customer portal that has been retired and is no longer accepting vulnerability reports.',
      'https://legacy.acme.com',
      'Social engineering\nPhysical attacks\nDDoS attacks',
      3000,
      20000,
      0
    );

    stmt.run(
      companyId,
      'Acme Admin Dashboard',
      'Internal administration dashboard. Program is currently paused while infrastructure is upgraded.',
      'https://admin.acme.com',
      'Employee accounts\nSpam\nRate-limit testing',
      8000,
      60000,
      0
    );

    stmt.run(
      companyId,
      'Acme Payment Gateway',
      'Payment gateway currently under maintenance. Bug bounty submissions are temporarily closed.',
      'https://payments.acme.com\nhttps://api.payments.acme.com/*',
      'DoS attacks\nSocial engineering\nThird-party integrations',
      10000,
      100000,
      0
    );

    stmt.finalize();

    console.log('✅ 3 inactive bounty programs added successfully.');
  }
);