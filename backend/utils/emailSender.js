const nodemailer = require('nodemailer');
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('⚠️ Gmail SMTP not configured — emails disabled.');
    return null;
  }
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD }
  });
  return transporter;
}

async function sendEmail({ to, subject, html, from }) {
  const t = getTransporter();
  if (!t) return { success: false, error: 'Email not configured' };
  try {
    await t.sendMail({
      from: from || `"NexWork" <${process.env.GMAIL_USER}>`,
      to, subject, html
    });
    return { success: true };
  } catch (err) {
    console.error('Email error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendEmail };
