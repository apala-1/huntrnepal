const db = require('../config/database');

// ─── GET ALL ACTIVE PROGRAMS (public) ────────────────────────────
const getAllPrograms = (req, res) => {
  db.all(
    `SELECT bp.*, c.company_name, c.website,
            COUNT(r.id) as report_count
     FROM bounty_programs bp
     JOIN companies c ON bp.company_id = c.id
     LEFT JOIN reports r ON r.program_id = bp.id
     WHERE bp.is_active = 1
     GROUP BY bp.id
     ORDER BY bp.created_at DESC`,
    [],
    (err, programs) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch programs' });
      res.json({ programs });
    }
  );
};

// ─── GET SINGLE PROGRAM ───────────────────────────────────────────
const getProgram = (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT bp.*, c.company_name, c.website, c.description as company_description
     FROM bounty_programs bp
     JOIN companies c ON bp.company_id = c.id
     WHERE bp.id = ?`,
    [id],
    (err, program) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!program) return res.status(404).json({ error: 'Program not found' });
      res.json({ program });
    }
  );
};

// ─── CREATE PROGRAM (company only) ───────────────────────────────
const createProgram = (req, res) => {
  const { title, description, scope, out_of_scope, min_reward, max_reward } = req.body;

  if (!title || !description || !scope || !min_reward || !max_reward) {
    return res.status(400).json({ error: 'All required fields must be filled' });
  }

  if (parseFloat(min_reward) < 0 || parseFloat(max_reward) < parseFloat(min_reward)) {
    return res.status(400).json({ 
      error: 'Invalid reward range. Max must be greater than min.' 
    });
  }

  // Get company id for this user
  db.get(
    'SELECT id FROM companies WHERE user_id = ?',
    [req.user.userId],
    (err, company) => {
      if (err || !company) {
        return res.status(403).json({ 
          error: 'Company profile not found. Contact admin.' 
        });
      }

      db.run(
        `INSERT INTO bounty_programs 
         (company_id, title, description, scope, out_of_scope, min_reward, max_reward)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [company.id, title, description, scope, out_of_scope, min_reward, max_reward],
        function(err) {
          if (err) return res.status(500).json({ error: 'Failed to create program' });

          res.status(201).json({ 
            message: 'Program created successfully',
            programId: this.lastID
          });
        }
      );
    }
  );
};

// ─── UPDATE PROGRAM (company only, own programs) ──────────────────
const updateProgram = (req, res) => {
  const { id } = req.params;
  const { title, description, scope, out_of_scope, min_reward, max_reward, is_active } = req.body;

  // Verify ownership
  db.get(
    `SELECT bp.id FROM bounty_programs bp
     JOIN companies c ON bp.company_id = c.id
     WHERE bp.id = ? AND c.user_id = ?`,
    [id, req.user.userId],
    (err, program) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!program) {
        return res.status(403).json({ error: 'Not authorized to edit this program' });
      }

      db.run(
        `UPDATE bounty_programs SET
         title = ?, description = ?, scope = ?, out_of_scope = ?,
         min_reward = ?, max_reward = ?, is_active = ?
         WHERE id = ?`,
        [title, description, scope, out_of_scope, min_reward, max_reward, is_active, id],
        (err) => {
          if (err) return res.status(500).json({ error: 'Failed to update program' });
          res.json({ message: 'Program updated' });
        }
      );
    }
  );
};

// ─── GET MY PROGRAMS (company dashboard) ─────────────────────────
const getMyPrograms = (req, res) => {
  db.get('SELECT id FROM companies WHERE user_id = ?', [req.user.userId], (err, company) => {
    if (err || !company) return res.status(404).json({ error: 'Company not found' });

    db.all(
      `SELECT bp.*, COUNT(r.id) as report_count,
              SUM(CASE WHEN r.status = 'accepted' THEN 1 ELSE 0 END) as accepted_count
       FROM bounty_programs bp
       LEFT JOIN reports r ON r.program_id = bp.id
       WHERE bp.company_id = ?
       GROUP BY bp.id
       ORDER BY bp.created_at DESC`,
      [company.id],
      (err, programs) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ programs });
      }
    );
  });
};

module.exports = { getAllPrograms, getProgram, createProgram, updateProgram, getMyPrograms };