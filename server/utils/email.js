const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
});

const sendVerificationEmail = async (to, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
  await transporter.sendMail({
    from: `ClickZoom <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Verify your ClickZoom account',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0D1117;color:#fff;padding:32px;border-radius:16px">
        <h2 style="color:#1A73E8;margin-bottom:8px">Verify your email</h2>
        <p style="color:#888780;margin-bottom:24px">Click the button below to verify your ClickZoom account.</p>
        <a href="${url}" style="display:inline-block;background:#1A73E8;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700">Verify Email</a>
        <p style="color:#888780;margin-top:24px;font-size:12px">Or copy this link: ${url}</p>
      </div>`,
  });
};

const sendPasswordResetEmail = async (to, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await transporter.sendMail({
    from: `ClickZoom <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Reset your ClickZoom password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0D1117;color:#fff;padding:32px;border-radius:16px">
        <h2 style="color:#1A73E8;margin-bottom:8px">Reset your password</h2>
        <p style="color:#888780;margin-bottom:24px">This link expires in 1 hour.</p>
        <a href="${url}" style="display:inline-block;background:#1A73E8;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700">Reset Password</a>
      </div>`,
  });
};

const sendContentReadyEmail = async (to, tutorialTitle) => {
  await transporter.sendMail({
    from: `ClickZoom <${process.env.GMAIL_USER}>`,
    to,
    subject: `Your ClickZoom content is ready: ${tutorialTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0D1117;color:#fff;padding:32px;border-radius:16px">
        <h2 style="color:#00E5A0;margin-bottom:8px">Your content is ready!</h2>
        <p style="color:#888780;margin-bottom:24px">"${tutorialTitle}" has finished generating.</p>
        <a href="${process.env.CLIENT_URL}/dashboard" style="display:inline-block;background:#1A73E8;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700">View and Download</a>
      </div>`,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendContentReadyEmail };
