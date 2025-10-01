import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendOtpEmail = async (email, otp, name = 'User') => {
  const mailOptions = {
    from: `"EtherXWord" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Your OTP for EtherXWord Password Reset',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EtherXWord OTP</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: #1a1a1a; border-radius: 16px; padding: 40px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); border: 1px solid #333;">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #ffd700; font-size: 2.5rem; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);">
                EtherXWord
              </h1>
              <p style="color: #cccccc; font-size: 1.1rem; margin: 10px 0 0 0;">Decentralized Document Editor</p>
            </div>
            
            <!-- Content -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h2 style="color: #ffffff; font-size: 1.5rem; margin: 0 0 20px 0;">Password Reset Request</h2>
              <p style="color: #cccccc; font-size: 1rem; line-height: 1.6; margin: 0 0 30px 0;">
                Hello <strong style="color: #ffd700;">${name}</strong>,<br>
                We received a request to reset your password. Use the OTP below to proceed:
              </p>
            </div>
            
            <!-- OTP Box -->
            <div style="background: linear-gradient(135deg, #ffd700, #ffed4e); border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center; box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);">
              <p style="color: #000000; font-size: 0.9rem; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
              <div style="color: #000000; font-size: 2.5rem; font-weight: 700; letter-spacing: 8px; margin: 10px 0; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
              <p style="color: #333333; font-size: 0.85rem; margin: 10px 0 0 0;">Valid for 10 minutes</p>
            </div>
            
            <!-- Instructions -->
            <div style="background: #0a0a0a; border-radius: 8px; padding: 20px; margin: 30px 0; border-left: 4px solid #ffd700;">
              <p style="color: #cccccc; font-size: 0.9rem; margin: 0; line-height: 1.5;">
                <strong style="color: #ffd700;">⚠️ Security Notice:</strong><br>
                • This OTP will expire in 10 minutes<br>
                • Don't share this code with anyone<br>
                • If you didn't request this, please ignore this email
              </p>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #333;">
              <p style="color: #888888; font-size: 0.8rem; margin: 0;">
                This email was sent by EtherXWord<br>
                © 2024 EtherXWord. All rights reserved.
              </p>
            </div>
            
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
};

export const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: `"EtherXWord" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🎉 Welcome to EtherXWord!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to EtherXWord</title>
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: #1a1a1a; border-radius: 16px; padding: 40px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); border: 1px solid #333;">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #ffd700; font-size: 2.5rem; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);">
                EtherXWord
              </h1>
              <p style="color: #cccccc; font-size: 1.1rem; margin: 10px 0 0 0;">Decentralized Document Editor</p>
            </div>
            
            <!-- Welcome Message -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h2 style="color: #ffffff; font-size: 1.8rem; margin: 0 0 20px 0;">🎉 Welcome Aboard!</h2>
              <p style="color: #cccccc; font-size: 1.1rem; line-height: 1.6; margin: 0;">
                Hello <strong style="color: #ffd700;">${name}</strong>,<br>
                Welcome to the future of document editing!
              </p>
            </div>
            
            <!-- Features -->
            <div style="background: #0a0a0a; border-radius: 12px; padding: 30px; margin: 30px 0;">
              <h3 style="color: #ffd700; font-size: 1.2rem; margin: 0 0 20px 0; text-align: center;">What you can do:</h3>
              <div style="color: #cccccc; font-size: 1rem; line-height: 1.8;">
                • Create and edit documents with our powerful editor<br>
                • Store your documents securely on IPFS<br>
                • Access your files from anywhere<br>
                • Collaborate with others in real-time
              </div>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="http://localhost:3000" style="display: inline-block; background: linear-gradient(135deg, #ffd700, #ffed4e); color: #000000; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 1.1rem; box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);">
                Start Creating →
              </a>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #333;">
              <p style="color: #888888; font-size: 0.8rem; margin: 0;">
                Thank you for joining EtherXWord!<br>
                © 2024 EtherXWord. All rights reserved.
              </p>
            </div>
            
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
};