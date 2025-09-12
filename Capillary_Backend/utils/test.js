require('dotenv').config();
const nodemailer = require('nodemailer');

// Create a transporter using the Gmail SMTP server
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ADDRESS, // Your Gmail address
    pass: process.env.EMAIL_PASSWORD, // Your App Password
  },
});

// Email options
const mailOptions = {
  from: process.env.EMAIL_ADDRESS,  // Your Gmail address
  to: 'recipient@example.com',      // Recipient's email address
  subject: 'Test Email',            // Subject of the email
  text: 'Hello, this is a test email sent from my app!',  // Email body text
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
