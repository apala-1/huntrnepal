const db = require('../config/database');

const getAllPrograms = (req, res) => {
  const search = req.query.search || '';

  // ✅ FIXED: Parameterized query - user input never interpolated into SQL
  // Previously: WHERE (bp.title LIKE '%${search}%') - allowed SQL injection
  // Now: search term passed as parameter, database driver handles escaping
  const query = `
    SELECT 
      bp.id, bp.title, bp.description, bp.scope,
      bp.min_reward, bp.max_reward, bp.is_active, bp.created_at,
      c.company_name, c.website
    FROM bounty_programs bp
    JOIN companies c ON bp.company_id = c.id
    WHERE bp.is_active = 1
    AND (bp.title LIKE ? OR bp.description LIKE ?)
    ORDER BY bp.created_at DESC
  `;

  const searchParam = `%${search}%`;

  db.all(query, [searchParam, searchParam], (err, programs) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch programs' });
    res.json({ programs });
  });
};

// ─── GET SINGLE PROGRAM ──────────────────────────────────────────
const getProgram = (req, res) => {
  const { id } = req.params;

  db.get(`
    SELECT 
      bp.*, c.company_name, c.website, c.description as company_description
    FROM bounty_programs bp
    JOIN companies c ON bp.company_id = c.id
    WHERE bp.id = ?
  `, [id], (err, program) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!program) return res.status(404).json({ error: 'Program not found' });
    res.json({ program });
  });
};

// ─── CREATE PROGRAM (company only) ───────────────────────────────
const createProgram = (req, res) => {
  const { title, description, scope, out_of_scope, min_reward, max_reward } = req.body;

  if (!title || !description || !scope || !min_reward || !max_reward) {
    return res.status(400).json({ error: 'All required fields must be filled' });
  }

  if (parseFloat(min_reward) > parseFloat(max_reward)) {
    return res.status(400).json({ error: 'Minimum reward cannot exceed maximum' });
  }

  // Get company ID for this user
  db.get(
    'SELECT id FROM companies WHERE user_id = ?',
    [req.user.userId],
    (err, company) => {
      if (err || !company) {
        return res.status(404).json({ error: 'Company profile not found' });
      }

      db.run(`
        INSERT INTO bounty_programs 
        (company_id, title, description, scope, out_of_scope, min_reward, max_reward)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [company.id, title, description, scope, out_of_scope, min_reward, max_reward],
        function (err) {
          if (err) return res.status(500).json({ error: 'Failed to create program' });

          db.run(`
            INSERT INTO audit_logs (user_id, action, target_type, target_id, ip_address, details)
            VALUES (?, 'PROGRAM_CREATED', 'program', ?, ?, ?)
          `, [req.user.userId, this.lastID, req.ip, `Created program: ${title}`]);

          res.status(201).json({ 
            message: 'Program created successfully', 
            programId: this.lastID 
          });
        }
      );
    }
  );
};

// ─── UPDATE PROGRAM (company only, must own it) ──────────────────
const updateProgram = (req, res) => {
  const { id } = req.params;
  const { title, description, scope, out_of_scope, min_reward, max_reward, is_active } = req.body;

  // Verify ownership first
  db.get(`
    SELECT bp.id FROM bounty_programs bp
    JOIN companies c ON bp.company_id = c.id
    WHERE bp.id = ? AND c.user_id = ?
  `, [id, req.user.userId], (err, program) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!program) {
      return res.status(403).json({ error: 'You do not own this program' });
    }

    db.run(`
      UPDATE bounty_programs 
      SET title = ?, description = ?, scope = ?, out_of_scope = ?,
          min_reward = ?, max_reward = ?, is_active = ?
      WHERE id = ?
    `, [title, description, scope, out_of_scope, min_reward, max_reward, is_active ? 1 : 0, id],
      (err) => {
        if (err) return res.status(500).json({ error: 'Failed to update program' });
        res.json({ message: 'Program updated successfully' });
      }
    );
  });
};

// ─── GET COMPANY'S OWN PROGRAMS ──────────────────────────────────
const getMyPrograms = (req, res) => {
  db.get('SELECT id FROM companies WHERE user_id = ?', [req.user.userId], (err, company) => {
    if (err || !company) return res.status(404).json({ error: 'Company not found' });

    db.all(`
      SELECT bp.*, 
        (SELECT COUNT(*) FROM reports r WHERE r.program_id = bp.id) as report_count
      FROM bounty_programs bp
      WHERE bp.company_id = ?
      ORDER BY bp.created_at DESC
    `, [company.id], (err, programs) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch programs' });
      res.json({ programs });
    });
  });
};

// Get company's encryption key (only for the company owner)
const getCompanyEncryptionKey = (req, res) => {
  db.get(
    'SELECT encryption_key FROM companies WHERE user_id = ?',
    [req.user.userId],
    (err, company) => {
      if (err || !company) return res.status(404).json({ error: 'Company not found' });
      res.json({ encryptionKey: company.encryption_key });
    }
  );
};

// Get a program's company encryption key (for researchers to encrypt with)
const getProgramEncryptionKey = (req, res) => {
  const { id } = req.params;
  db.get(`
    SELECT c.encryption_key 
    FROM bounty_programs bp 
    JOIN companies c ON bp.company_id = c.id 
    WHERE bp.id = ?
  `, [id], (err, result) => {
    if (err || !result) return res.status(404).json({ error: 'Program not found' });
    // Only give the key to authenticated users (researchers need it to encrypt)
    res.json({ encryptionKey: result.encryption_key });
  });
};
const deleteProgram = (req, res) => {
  const { id } = req.params;

  // Verify ownership
  db.get(`
    SELECT bp.id FROM bounty_programs bp
    JOIN companies c ON bp.company_id = c.id
    WHERE bp.id = ? AND c.user_id = ?
  `, [id, req.user.userId], (err, program) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!program) return res.status(403).json({ error: 'You do not own this program' });

    // Check no accepted/paid reports exist
    db.get(
      "SELECT id FROM reports WHERE program_id = ? AND status IN ('accepted', 'resolved')",
      [id],
      (err, activeReport) => {
        if (activeReport) {
          return res.status(400).json({ 
            error: 'Cannot delete program with accepted or resolved reports' 
          });
        }

        db.run('DELETE FROM bounty_programs WHERE id = ?', [id], (err) => {
          if (err) return res.status(500).json({ error: 'Failed to delete program' });

          db.run(`
            INSERT INTO audit_logs (user_id, action, target_type, target_id, ip_address, details)
            VALUES (?, 'PROGRAM_DELETED', 'program', ?, ?, ?)
          `, [req.user.userId, id, req.ip, `Program #${id} deleted`]);

          res.json({ message: 'Program deleted successfully' });
        });
      }
    );
  });
};

module.exports = { getAllPrograms, getProgram, createProgram, updateProgram, getMyPrograms, getCompanyEncryptionKey, getProgramEncryptionKey, deleteProgram };