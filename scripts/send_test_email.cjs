// scripts/send_test_email.cjs
require('dns').setDefaultResultOrder('ipv4first');
require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function main() {
  // quick sanity log to ensure env loaded
  console.log('SMTP_HOST, SMTP_PORT, SMTP_USER loaded:',
    process.env.SMTP_HOST, process.env.SMTP_PORT, process.env.SMTP_USER ? 'yes' : 'no');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // STARTTLS on 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    logger: true,
    debug: true,
  });

  try {
    await transporter.verify();
    console.log('SMTP verified OK');
  } catch (err) {
    console.error('SMTP verify failed:', err);
    // Try fallback to port 465 (SSL) as an option
    if ((process.env.SMTP_PORT || '').toString() !== '465') {
      console.log('Attempting fallback to port 465 (secure)...');
      transporter.close();
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        logger: true,
        debug: true,
      });
      await transporter.verify();
    } else {
      throw err;
    }
  }

  const res = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.SMTP_USER,
    subject: 'Test Alert - Monitoring Server',
    text: 'This is a test alert generated from CLI.',
  });

  console.log('Email sent, id:', res.messageId);
}

main().catch(err => { console.error('Send failed:', err); process.exit(1); });
