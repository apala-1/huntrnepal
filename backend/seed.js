const db = require('./src/config/database');
const bcrypt = require('bcryptjs');

// Create test company user
const hash = bcrypt.hashSync('TestPass123!', 12);

db.run(
  `INSERT OR IGNORE INTO users (username, email, password_hash, role)
   VALUES (?, ?, ?, ?)`,
  ['acmecorp', 'acme@test.com', hash, 'company'],
  function (err) {
    if (err) {
      console.error(err);
      return;
    }

    const userId = this.lastID;

    db.run(
      `INSERT OR IGNORE INTO companies (user_id, company_name, website, is_verified)
       VALUES (?, ?, ?, ?)`,
      [userId, 'Acme Corporation', 'https://acme.com', 1],
      function (err) {
        if (err) {
          console.error(err);
          return;
        }

        const companyId = this.lastID;

        db.run(
          `INSERT INTO bounty_programs
          (company_id, title, description, scope, out_of_scope, min_reward, max_reward)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            companyId,
            'Acme Web Platform',
            'We are looking for security researchers to help us identify vulnerabilities in our web platform. We welcome reports on authentication, authorization, and data exposure issues.',
            '*.acme.com\nhttps://app.acme.com\nhttps://api.acme.com',
            'Physical attacks\nSocial engineering\nDDoS attacks',
            5000,
            50000
          ]
        );

        db.run(
          `INSERT INTO bounty_programs
          (company_id, title, description, scope, out_of_scope, min_reward, max_reward)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            companyId,
            'Acme Mobile API',
            'Our mobile application API handles sensitive user data. Help us keep it secure by finding vulnerabilities in our REST API endpoints.',
            'https://api.acme.com/v1/*\nhttps://api.acme.com/v2/*',
            'Rate limiting bypass\nSpam',
            2500,
            25000
          ]
        );

        console.log('Test data seeded!');
      }
    );
  }
);