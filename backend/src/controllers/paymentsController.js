const axios = require('axios');
const db = require('../config/database');

// ─── INITIATE PAYMENT (company pays researcher) ───────────────────
const initiatePayment = (req, res) => {
  const { report_id } = req.body;

  if (!report_id) {
    return res.status(400).json({ error: 'Report ID is required' });
  }

  // Verify the report belongs to this company and is accepted
  db.get(`
    SELECT 
      r.id, r.reward_amount, r.researcher_id, r.status,
      c.id as company_id, c.user_id as company_user_id,
      u.username as researcher_username, u.email as researcher_email,
      bp.title as program_title
    FROM reports r
    JOIN bounty_programs bp ON r.program_id = bp.id
    JOIN companies c ON bp.company_id = c.id
    JOIN users u ON r.researcher_id = u.id
    WHERE r.id = ? AND c.user_id = ?
  `, [report_id, req.user.userId], (err, report) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!report) return res.status(403).json({ error: 'Report not found or access denied' });
    if (report.status !== 'accepted') {
      return res.status(400).json({ error: 'Report must be accepted before payment' });
    }
    if (!report.reward_amount) {
      return res.status(400).json({ error: 'No reward amount set for this report' });
    }

    // Check not already paid
    db.get(
      'SELECT id FROM payments WHERE report_id = ? AND status = "completed"',
      [report_id],
      (err, existing) => {
        if (existing) {
          return res.status(400).json({ error: 'This report has already been paid' });
        }

        // Create pending payment record
        db.run(`
          INSERT INTO payments (report_id, researcher_id, company_id, amount, status)
          VALUES (?, ?, ?, ?, 'pending')
        `, [report_id, report.researcher_id, report.company_id, report.reward_amount],
          function (err) {
            if (err) return res.status(500).json({ error: 'Failed to create payment record' });

            const paymentId = this.lastID;

            // Call Khalti API to initiate payment
            // Amount in Khalti is in PAISA (1 NPR = 100 paisa)
            const amountInPaisa = Math.round(report.reward_amount * 100);

            axios.post('https://a.khalti.com/api/v2/epayment/initiate/', {
              return_url: `${process.env.FRONTEND_URL}/payments/verify?payment_id=${paymentId}`,
              website_url: process.env.FRONTEND_URL,
              amount: amountInPaisa,
              purchase_order_id: `HUNTR-${paymentId}-${report_id}`,
              purchase_order_name: `Bounty: ${report.program_title}`,
              customer_info: {
                name: report.researcher_username,
                email: report.researcher_email
              }
            }, {
              headers: {
                Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
                'Content-Type': 'application/json'
              }
            }).then(khaltiRes => {
              // Save Khalti pidx for verification later
              db.run(
                'UPDATE payments SET khalti_token = ? WHERE id = ?',
                [khaltiRes.data.pidx, paymentId]
              );

              db.run(`
                INSERT INTO audit_logs (user_id, action, target_type, target_id, ip_address, details)
                VALUES (?, 'PAYMENT_INITIATED', 'payment', ?, ?, ?)
              `, [req.user.userId, paymentId, req.ip,
                  `Payment of NPR ${report.reward_amount} initiated for report #${report_id}`]);

              res.json({
                paymentUrl: khaltiRes.data.payment_url,
                paymentId,
                pidx: khaltiRes.data.pidx
              });
            }).catch(err => {
              // Clean up pending payment if Khalti fails
              db.run('DELETE FROM payments WHERE id = ?', [paymentId]);
              console.error('Khalti error:', err.response?.data);
              res.status(502).json({ error: 'Payment gateway error. Try again.' });
            });
          }
        );
      }
    );
  });
};

// ─── VERIFY PAYMENT (after Khalti redirects back) ─────────────────
const verifyPayment = (req, res) => {
  const { pidx, payment_id } = req.query;

  if (!pidx || !payment_id) {
    return res.status(400).json({ error: 'Missing verification parameters' });
  }

  // Verify with Khalti
  axios.post('https://a.khalti.com/api/v2/epayment/lookup/', { pidx }, {
    headers: {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      'Content-Type': 'application/json'
    }
  }).then(khaltiRes => {
    const { status, transaction_id, total_amount } = khaltiRes.data;

    if (status === 'Completed') {
      // Mark payment complete
      db.run(`
        UPDATE payments 
        SET status = 'completed', khalti_transaction_id = ?
        WHERE id = ? AND khalti_token = ?
      `, [transaction_id, payment_id, pidx], function (err) {
        if (err || this.changes === 0) {
          return res.status(500).json({ error: 'Failed to update payment record' });
        }

        // Mark report as resolved
        db.get('SELECT report_id, researcher_id FROM payments WHERE id = ?',
          [payment_id], (err, payment) => {
            if (payment) {
              db.run(
                'UPDATE reports SET status = "resolved" WHERE id = ?',
                [payment.report_id]
              );

              db.run(`
                INSERT INTO audit_logs (user_id, action, target_type, target_id, ip_address, details)
                VALUES (?, 'PAYMENT_COMPLETED', 'payment', ?, ?, ?)
              `, [payment.researcher_id, payment_id, req.ip,
                  `Payment completed. Khalti TX: ${transaction_id}`]);
            }
          });

        res.json({
          success: true,
          message: 'Payment verified and completed',
          transactionId: transaction_id,
          amount: total_amount / 100  // Convert paisa back to NPR
        });
      });
    } else {
      db.run('UPDATE payments SET status = ? WHERE id = ?', [status.toLowerCase(), payment_id]);
      res.status(400).json({ error: `Payment ${status}. Not completed.` });
    }
  }).catch(err => {
    console.error('Khalti verify error:', err.response?.data);
    res.status(502).json({ error: 'Could not verify payment with Khalti' });
  });
};

// ─── GET PAYMENT STATUS ──────────────────────────────────────────
const getPaymentStatus = (req, res) => {
  const { report_id } = req.params;

  db.get(
    'SELECT * FROM payments WHERE report_id = ? ORDER BY created_at DESC LIMIT 1',
    [report_id],
    (err, payment) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ payment: payment || null });
    }
  );
};

module.exports = { initiatePayment, verifyPayment, getPaymentStatus };