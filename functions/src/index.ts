import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.pass
  }
});

// Contact form email handler
export const sendContactEmail = functions.https.onCall(async (data, context) => {
  const { name, email, inquiry } = data;

  const mailOptions = {
    from: functions.config().email.user,
    to: 'jshea762@outlook.com',
    subject: `Digital ID Platform Inquiry from ${name}`,
    text: `
      Name: ${name}
      Email: ${email}
      Inquiry: ${inquiry}
    `,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Inquiry:</strong></p>
      <p>${inquiry}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send email');
  }
});

// Rest of the existing functions...
[Previous function code remains the same]