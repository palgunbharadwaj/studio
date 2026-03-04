'use server';
/**
 * @fileOverview A flow for generating personalized confirmation emails.
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
  prompt: `You are an assistant tasked with generating personalized confirmation emails.\nGenerate a confirmation email in {{preferredLanguage}} for the user named "{{userName}}".\nThe email should acknowledge their submission for "Prathibha Puraskahara SJSVT" and include the following details:\n\nSubmission Details:\n{{{submissionDetails}}}\n\nThe email should have a clear subject line and a polite, personalized body.\nEnsure the entire response is in the specified language, and set the 'language' field in the output to the language used.`,
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
