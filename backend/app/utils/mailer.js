import nodemailer from "nodemailer";
import 'dotenv/config'

async function sendEmail(type, email, token) {
  const transport = nodemailer.createTransport(
   { host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
     user: process.env.EMAIL_USER,
     pass: process.env.EMAIL_PASS,
   },
  }
);

  // Common email style 
  const baseStyle = `
    font-family: Arial, sans-serif;
    background-color: #f5f5f5;
    margin: 0;
    padding: 0;
  `;

  //  Verification Email Template
  const verifyEmailTemplate = `
  <!DOCTYPE html>
  <html lang="en">
    <head><meta charset="UTF-8" /><title>Email Verification</title></head>
    <body style="${baseStyle}">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="500" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:10px; padding:30px; text-align:center;">
              <tr><td><img src="https://i.ibb.co/yD4G67D/iiiitp.png" alt="IIIT Pune Logo" width="100" height="100" style="margin-bottom:20px;" /></td></tr>
              <tr><td><h1 style="color:#333; font-size:24px;">Please Verify Your Email</h1></td></tr>
              <tr><td style="padding:10px 20px;"><p style="color:#555; font-size:16px; line-height:1.5;">
                To keep your account secure, please verify your email by clicking the button below.</p></td></tr>
              <tr><td>
                <a href=${process.env.emailBase}/verify?token=${token}
                  style="display:inline-block; margin-top:20px; background-color:#007bff; color:#fff; text-decoration:none; padding:12px 24px; border-radius:6px; font-weight:bold;">
                  Verify Email
                </a>
              </td></tr>
              <tr><td style="padding-top:20px;"><p style="color:#888; font-size:14px;"> 
                If you are unable to open the link open the link in chrome ${process.env.emailBase}/verify?token=${token}If you didn’t create an account, you can safely ignore this email.</p></td></tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

  //  Forgot Password Template
  const forgotPasswordTemplate = `
  <!DOCTYPE html>
  <html lang="en">
    <head><meta charset="UTF-8" /><title>Reset Your Password</title></head>
    <body style="${baseStyle}">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="500" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:10px; padding:30px; text-align:center;">
              <tr><td><img src="https://i.ibb.co/yD4G67D/iiiitp.png" alt="IIIT Pune Logo" width="100" height="100" style="margin-bottom:20px;" /></td></tr>
              <tr><td><h1 style="color:#333; font-size:24px;">Reset Your Password</h1></td></tr>
              <tr><td style="padding:10px 20px;"><p style="color:#555; font-size:16px; line-height:1.5;">
                We received a request to reset your password. Click the button below to set a new password. This link will expire in 10 minutes.</p></td></tr>
              <tr><td>
                <a href=${process.env.emailBase}/reset-password?token=${token}
                  style="display:inline-block; margin-top:20px; background-color:#dc3545; color:#fff; text-decoration:none; padding:12px 24px; border-radius:6px; font-weight:bold;">
                  Reset Password
                </a>
              </td></tr>
              <tr><td style="padding-top:20px;"><p style="color:#888; font-size:14px;">
                If you didn’t request this, you can safely ignore this email — your password will remain unchanged.</p></td></tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

  // Select template dynamically
  const htmlTemplate = type === "forgot" ? forgotPasswordTemplate : verifyEmailTemplate;

  const mailOptions = {
    from: "IIIT Pune <hi@viggu.me>",
    to: email,
    subject: type === "forgot" ? "Reset Your Password" : "Verify Your Email",
    html: htmlTemplate,
  };

  await transport.sendMail(mailOptions);
  console.log(`📨 ${type === "forgot" ? "Password reset" : "Verification"} email sent to ${email}`);
}

export default sendEmail;
