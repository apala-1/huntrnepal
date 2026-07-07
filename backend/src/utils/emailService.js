const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify connection on startup
transporter.verify((error) => {
  if (error) {
    console.error('Email service error:', error.message);
  } else {
    console.log('Email service ready');
  }
});

const sendPasswordResetEmail = async (toEmail, username, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(toEmail)}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: 'HuntrNepal — Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
          .header { background: #6366f1; padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .body { padding: 30px; }
          .token-box { background: #f8f8f8; border: 2px dashed #6366f1; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .token { font-size: 32px; font-weight: bold; color: #6366f1; letter-spacing: 8px; }
          .btn { display: inline-block; background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .warning { background: #fff3cd; border-left: 4px solid #f59e0b; padding: 12px; margin-top: 20px; font-size: 14px; }
          .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HuntrNepal</h1>
            <p style="color: #c7d2fe; margin: 5px 0 0 0;">Bug Bounty & Vulnerability Disclosure Platform</p>
          </div>
          <div class="body">
            <h2>Password Reset Request</h2>
            <p>Hi <strong>${username}</strong>,</p>
            <p>We received a request to reset your HuntrNepal password. Use the token below or click the button to reset your password.</p>
            
            <div class="token-box">
              <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">Your Reset Token</p>
              <div class="token">${resetToken}</div>
              <p style="margin: 8px 0 0 0; color: #666; font-size: 12px;">Valid for 30 minutes only</p>
            </div>

            <div style="text-align: center;">
              <a href="${resetUrl}" class="btn">Reset Password</a>
            </div>

            <div class="warning">
              <strong>Security Notice:</strong> If you did not request a password reset, please ignore this email and consider changing your password immediately. This link expires in 30 minutes.
            </div>
          </div>
          <div class="footer">
            <p>This email was sent from HuntrNepal. Do not reply to this email.</p>
            <p>© 2025 HuntrNepal — Nepal's Bug Bounty Platform</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendReportStatusEmail = async (toEmail, username, reportTitle, status, rewardAmount) => {
  const statusColors = {
    accepted: '#22c55e',
    rejected: '#ef4444',
    resolved: '#a855f7',
    triaging: '#3b82f6'
  };

  const color = statusColors[status] || '#6366f1';

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: `HuntrNepal — Your report "${reportTitle}" has been ${status}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
          .header { background: #6366f1; padding: 30px; text-align: center; color: white; }
          .body { padding: 30px; }
          .status-badge { display: inline-block; background: ${color}; color: white; padding: 8px 20px; border-radius: 20px; font-weight: bold; text-transform: uppercase; }
          .reward { background: #dcfce7; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HuntrNepal</h1>
          </div>
          <div class="body">
            <h2>Report Status Update</h2>
            <p>Hi <strong>${username}</strong>,</p>
            <p>Your vulnerability report has been reviewed:</p>
            <p><strong>${reportTitle}</strong></p>
            <p>Status: <span class="status-badge">${status}</span></p>
            ${rewardAmount ? `
            <div class="reward">
              <p style="margin: 0; color: #666;">Reward Amount</p>
              <h2 style="color: #15803d; margin: 8px 0 0 0;">NPR ${Number(rewardAmount).toLocaleString()}</h2>
            </div>` : ''}
            <p>Log in to HuntrNepal to view the full details and any company feedback.</p>
          </div>
          <div class="footer">
            <p>© 2025 HuntrNepal</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail, sendReportStatusEmail };