'use server';

import { Resend } from 'resend';

/**
 * @fileOverview A server action for sending confirmation emails using Resend.
 */

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail(email: string, subject: string, body: string) {
  try {
    console.log('--- EMAIL SENDING INITIATED (RESEND) ---');
    console.log(`To: ${email}`);
    
    const { data, error } = await resend.emails.send({
      from: 'Pratibha Puraskhara <onboarding@resend.dev>',
      to: [email],
      subject: subject,
      html: body,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return { success: false, error: error.message };
    }

    console.log('--- EMAIL SENT SUCCESSFULLY (RESEND) ---', data?.id);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Unexpected Email Error:', err);
    return { success: false, error: String(err) };
  }
}
