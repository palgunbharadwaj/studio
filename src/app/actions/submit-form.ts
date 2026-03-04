
'use server';

import { 
  generatePersonalizedConfirmationEmail, 
  PersonalizedConfirmationEmailInput, 
  PersonalizedConfirmationEmailOutput 
} from '@/ai/flows/personalized-confirmation-email';

export type SubmissionResult = {
  success: boolean;
  message: string;
  emailPreview?: PersonalizedConfirmationEmailOutput;
  error?: string;
};

export async function submitLinguaForm(data: {
  name: string;
  email: string;
  details: string;
  language: 'en' | 'kn';
  documentBase64?: string;
}): Promise<SubmissionResult> {
  try {
    // In a production app, you would use firestore here to save 'data'.
    // We have bootstrapped the backend, and firestore is available.
    
    const aiInput: PersonalizedConfirmationEmailInput = {
      userName: data.name,
      userEmail: data.email,
      submissionDetails: `${data.details}${data.documentBase64 ? '\n(Document uploaded)' : ''}`,
      preferredLanguage: data.language,
    };

    const emailPreview = await generatePersonalizedConfirmationEmail(aiInput);

    return {
      success: true,
      message: data.language === 'en' ? 'Submission successful!' : 'ಸಲ್ಲಿಸುವಿಕೆ ಯಶಸ್ವಿಯಾಗಿದೆ!',
      emailPreview,
    };
  } catch (error) {
    console.error('Submission error:', error);
    return {
      success: false,
      message: 'An error occurred during submission.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
