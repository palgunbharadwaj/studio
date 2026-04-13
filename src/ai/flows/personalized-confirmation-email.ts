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

const promptText = `You are an assistant tasked with generating personalized confirmation emails for "Prathibha Puraskahara SJSVT".

Generate a confirmation email strictly in the language: {{preferredLanguage}}.
If the language is 'kn', the output MUST be in Kannada. If 'en', it MUST be in English.

User Name: {{userName}}
Submission Details:
{{{submissionDetails}}}

Requirements:
1. Acknowledge the submission for "Prathibha Puraskahara SJSVT" for the academic year 2025-2026.
2. The subject line should be professional and clear.
3. The body should be polite and personalized.
4. Ensure the entire response (subject and body) is in the specified language.
5. Set the 'language' field in the output to the language used.
6. Use unique phrasing and avoid rigid templates. Change the tone and vocabulary for each generation so every email feels manually and individually written while maintaining a premium, professional feel.`;

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
