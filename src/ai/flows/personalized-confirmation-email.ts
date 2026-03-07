'use server';
/**
 * @fileOverview A flow for generating personalized confirmation emails in the user's preferred language.
 *
 * - generatePersonalizedConfirmationEmail - A function that handles the email generation process.
 * - PersonalizedConfirmationEmailInput - The input type for the generatePersonalizedConfirmationEmail function.
 * - PersonalizedConfirmationEmailOutput - The return type for the generatePersonalizedConfirmationEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
export type PersonalizedConfirmationEmailInput = z.infer<
  typeof PersonalizedConfirmationEmailInputSchema
>;

const PersonalizedConfirmationEmailOutputSchema = z.object({
  subject: z.string().describe('The subject line of the personalized confirmation email.'),
  body: z.string().describe('The body content of the personalized confirmation email.'),
  language: z
    .enum(['en', 'kn'])
    .describe('The language in which the email was generated (\'en\' for English, \'kn\' for Kannada).'),
});
export type PersonalizedConfirmationEmailOutput = z.infer<
  typeof PersonalizedConfirmationEmailOutputSchema
>;

export async function generatePersonalizedConfirmationEmail(
  input: PersonalizedConfirmationEmailInput
): Promise<PersonalizedConfirmationEmailOutput> {
  return personalizedConfirmationEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedConfirmationEmailPrompt',
  input: {schema: PersonalizedConfirmationEmailInputSchema},
  output: {schema: PersonalizedConfirmationEmailOutputSchema},
  prompt: `You are an assistant tasked with generating personalized confirmation emails for "Prathibha Puraskahara SJSVT".

Generate a confirmation email strictly in the language: {{preferredLanguage}}.
If the language is 'kn', the output MUST be in Kannada. If 'en', it MUST be in English.

User Name: {{userName}}
Submission Details:
{{{submissionDetails}}}

Requirements:
1. Acknowledge the submission for "Prathibha Puraskahara SJSVT" for the academic year 2024-2025.
2. The subject line should be professional and clear.
3. The body should be polite and personalized.
4. Ensure the entire response (subject and body) is in the specified language.
5. Set the 'language' field in the output to the language used.`,
});

const personalizedConfirmationEmailFlow = ai.defineFlow(
  {
    name: 'personalizedConfirmationEmailFlow',
    inputSchema: PersonalizedConfirmationEmailInputSchema,
    outputSchema: PersonalizedConfirmationEmailOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
