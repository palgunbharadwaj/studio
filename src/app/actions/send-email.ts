'use server';

import nodemailer from 'nodemailer';

/**
 * @fileOverview A server action for sending confirmation emails using Gmail SMTP (Nodemailer).
 */

// Create the transporter using Gmail service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465, // Use 465 for Gmail SSL
  secure: true,
  pool: true, // Use a pool for faster connections
  auth: {
    user: process.env.GMAIL_USER,
    // Google App Passwords sometimes have spaces; we strip them for safety
    pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, ''),
  },
  connectionTimeout: 5000, // 5 seconds
});

export async function sendConfirmationEmail(email: string, subject: string, body: string) {
  try {
    console.log('--- EMAIL SENDING INITIATED (GMAIL/SMTP) ---');
    console.log(`To: ${email}`);
    
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"Pratibha Puraskhara" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: subject,
      html: body,
    });

    console.log('--- EMAIL SENT SUCCESSFULLY (GMAIL) ---', info.messageId);
    return { success: true, id: info.messageId };
  } catch (err) {
    console.error('Unexpected Gmail/SMTP Error:', err);
    return { success: false, error: String(err) };
  }
}
