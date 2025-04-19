export const gmailContent = (verificationToken, username) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Arial', sans-serif;
          background-color: #f0f0f0;
        }
    
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
    
        h1, h2 {
          color: black;
          text-align: center;
        }
    
        p {
          font-size: 16px;
          color: black;
          text-align: center;
        }
    
        .btn-verify {
          display: inline-block;
          background-color: #0D6EFD;
          color: #fff;
          font-size: 18px;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          border: 2px solid #008080;
          transition: background-color 0.3s ease-in-out;
          text-align: center;
          margin-top: 20px;
        }
    
        .btn-verify:hover {
          background-color: darkblue;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Email Verification</h1>
        <p>Please take a moment to verify your email for RealTimeEdify, Edit in Real time</p>
        <div style="text-align: center; margin-top: 20px;">
          <h2>Hello ${username},</h2>
          <p>Slacky300 appreciates your commitment to securing your account. To proceed, kindly click the button below to verify your email:</p>
          <a href="${process.env.BACKEND_URL}/users/verifyemail/${verificationToken}" class="btn-verify">Verify Email</a>
        </div>
      </div>
    </body>
    </html>
    
        `;
  
  }

  
export const successFullVerification = (username) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification Success</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Arial', sans-serif;
          background-color: #f0f0f0;
        }
    
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
    
        h1, p {
          color: black;
          text-align: center;
        }
    
        p {
          font-size: 16px;
          color: black;
        }
    
        .btn-home {
          display: inline-block;
          background-color: #0D6EFD;
          color: #fff;
          font-size: 18px;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          border: 2px solid #008080;
          transition: background-color 0.3s ease-in-out;
          text-align: center;
          margin-top: 20px;
        }
    
        .btn-home:hover {
          background-color: darkblue;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Congratulations! ${username}</h1>
        <p>You have successfully verified your email.</p>
        <div style="text-align: center; margin-top: 20px;">
          <p>You can now proceed to the home page by clicking the button below:</p>
          <a href="${process.env.FRONTEND_URL}" class="btn-home">Go to Home Page</a>
        </div>
      </div>
    </body>
    </html>
    
    `;
  }
  
export const passwordResetContent = (resetLink, username, expirationText) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
            .header { color: #2c3e50; text-align: center; }
            .content { margin: 20px 0; line-height: 1.6; }
            .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #3498db;
                color: white !important;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
            }
            .footer { text-align: center; color: #7f8c8d; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 class="header">Password Reset Request</h1>
            <div class="content">
                <p>Hello ${username},</p>
                <p>We received a request to reset your password. Click the button below to reset it:</p>
                <center>
                    <a href="${resetLink}" class="button">Reset Password</a>
                </center>
                <p>This link expires in ${expirationText}.</p>
                <p>If you didn't request this, please ignore this email or contact support.</p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} RealTimeEdify. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Add password change confirmation template
export const passwordChangeConfirmation = (username) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            /* Reuse same styles */
            .success-badge { 
                background: #2ecc71;
                color: white;
                padding: 8px 15px;
                border-radius: 20px;
                display: inline-block;
                margin-bottom: 15px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="success-badge">Password Updated</div>
            <h1 class="header">Security Update Confirmation</h1>
            <div class="content">
                <p>Hello ${username},</p>
                <p>Your password was successfully changed on ${new Date().toLocaleString()}.</p>
                <p>If you didn't make this change, please contact our support team immediately.</p>
            </div>
            <div class="footer">
                <p>Stay secure,<br>The RealTimeEdify Team</p>
            </div>
        </div>
    </body>
    </html>
    `;
};
  
  
