const db = require('./database');

const initDb = () => {
  db.serialize(() => {

    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'researcher',
        mfa_secret TEXT,
        mfa_enabled INTEGER DEFAULT 0,
        is_verified INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        bio TEXT DEFAULT '',
        website TEXT DEFAULT '',
        twitter TEXT DEFAULT '',
        location TEXT DEFAULT ''
      )
    `);

    // Companies table
    db.run(`
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        company_name TEXT NOT NULL,
        website TEXT,
        description TEXT,
        is_verified INTEGER DEFAULT 0,
        khalti_balance REAL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Bounty programs table
    db.run(`
      CREATE TABLE IF NOT EXISTS bounty_programs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        scope TEXT NOT NULL,
        out_of_scope TEXT,
        min_reward REAL NOT NULL,
        max_reward REAL NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      )
    `);

    // Vulnerability reports table
    db.run(`
      CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        researcher_id INTEGER NOT NULL,
        program_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        severity TEXT NOT NULL,
        cvss_score REAL,
        steps_to_reproduce TEXT NOT NULL,
        impact TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        reward_amount REAL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (researcher_id) REFERENCES users(id),
        FOREIGN KEY (program_id) REFERENCES bounty_programs(id)
      )
    `);

    // Payments table
    db.run(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER NOT NULL,
        researcher_id INTEGER NOT NULL,
        company_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        khalti_token TEXT,
        khalti_transaction_id TEXT,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (report_id) REFERENCES reports(id),
        FOREIGN KEY (researcher_id) REFERENCES users(id),
        FOREIGN KEY (company_id) REFERENCES companies(id)
      )
    `);

    // Audit log table
    db.run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        target_type TEXT,
        target_id INTEGER,
        ip_address TEXT,
        user_agent TEXT,
        details TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    db.run(`
    CREATE TABLE IF NOT EXISTS report_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      comment TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (report_id) REFERENCES reports(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

    console.log('Database tables initialized');
  });
};

module.exports = initDb;