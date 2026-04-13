'use server';
/**
 * @fileOverview A flow for generating personalized confirmation emails in the user's preferred language.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const PersonalizedConfirmationEmailInputSchema = z.object({
  userName: z.string().describe('The name of the user who submitted the form.').default('User'),
  userEmail: z.string().email().describe('The email address of the user.'),
  submissionDetails: z
    .string()
    .describe('A formatted string or summary of the details submitted by the user.'),
  preferredLanguage: z
    .enum(['en', 'kn'])
    .describe('The user\'s preferred language (\'en\' for English, \'kn\' for Kannada).'),
});

const PersonalizedConfirmationEmailOutputSchema = z.object({
  subject: z.string().describe('The subject line of the personalized confirmation email.'),
  body: z.string().describe('The body content of the personalized confirmation email.'),
  language: z
    .enum(['en', 'kn'])
    .describe('The language in which the email was generated (\'en\' for English, \'kn\' for Kannada).'),
});

export type PersonalizedConfirmationEmailInput = z.infer<typeof PersonalizedConfirmationEmailInputSchema>;
export type PersonalizedConfirmationEmailOutput = z.infer<typeof PersonalizedConfirmationEmailOutputSchema>;

const promptText = `You are a professional assistant for "Prathibha Puraskhara SJSVT".
Generate a concise, polite confirmation email in {{preferredLanguage}}.
If 'kn', use Kannada. If 'en', use English.

User: {{userName}}
Details: {{{submissionDetails}}}

Requirements:
1. Subject: Clear and professional.
2. Body: Acknowledge the 2025-2026 application. Be warm but brief to ensure fast delivery.
3. Set 'language' field to the language used.
4. Tone: Premium and manually written. Avoid long templates.`;


export const personalizedConfirmationEmailFlow = ai.defineFlow(
  {
    name: 'personalizedConfirmationEmailFlow',
    inputSchema: PersonalizedConfirmationEmailInputSchema,
    outputSchema: PersonalizedConfirmationEmailOutputSchema,
  },
  async input => {
    // Waterfall: Try multiple models in case of failure
    const models = [
      'googleai/gemini-1.5-flash',
      'googleai/gemini-2.0-flash',
      'googleai/gemini-1.5-pro'
    ];

    let lastError: any = null;

    for (const model of models) {
      try {
        console.log(`AI Attempting generation with model: ${model}...`);
        
        // Manually replace template placeholders with actual input values
        const finalPrompt = promptText
          .replace('{{preferredLanguage}}', input.preferredLanguage)
          .replace('{{userName}}', input.userName)
          .replace('{{{submissionDetails}}}', input.submissionDetails);

        const {output} = await ai.generate({
          model: model,
          prompt: finalPrompt,
          output: {schema: PersonalizedConfirmationEmailOutputSchema},
        });
        
        if (output) {
          console.log(`AI Content successfully generated with: ${model}`);
          return output;
        }
      } catch (err) {
        console.warn(`Model ${model} failed, trying next... error:`, err);
        lastError = err;
      }
    }

    throw new Error(`AI generation failed with all models. Last error: ${String(lastError)}`);
  }
);

export async function generatePersonalizedConfirmationEmail(
  input: PersonalizedConfirmationEmailInput
): Promise<PersonalizedConfirmationEmailOutput> {
  return personalizedConfirmationEmailFlow(input);
}
