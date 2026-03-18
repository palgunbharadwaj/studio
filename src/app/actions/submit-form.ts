'use client';

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { generatePersonalizedConfirmationEmail, PersonalizedConfirmationEmailOutput } from '@/ai/flows/personalized-confirmation-email';
import { sendConfirmationEmail } from './send-email';

export type SubmissionResult = {
  success: boolean;
  message: string;
  error?: string;
  emailData?: PersonalizedConfirmationEmailOutput;
};

export async function submitLinguaForm(data: any): Promise<SubmissionResult> {
  const { firestore } = initializeFirebase();
  
  // Firestore does not accept 'undefined' values. Sanitize data before submission.
  const cleanData: Record<string, any> = {};
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) {
      cleanData[key] = data[key];
    }
  });

  const successMessage = cleanData.language === 'en' 
    ? "The award distribution will take place on 23/04/2026. All receiving students, along with their families, are requested to compulsorily attend the Lord's service."
    : "ದಿನಾಂಕ:23/04/2026 ರಂದು ಎಲ್ಲಾ ಮಕ್ಕಳಿಗೂ ಪುರಸ್ಕರಿಸಲಾಗುವುದು. ಹಾಗಾಗಿ ಸಂಬಂಧಪಟ್ಟ ಮಕ್ಕಳು ಹಾಗೂ ಕುಟುಂಬ ಕಡ್ಡಾಯವಾಗಿ ಭಗವಂತನ ಕೈಂಕರ್ಯಕ್ಕೆ ಹಾಜರಾಗುವುದು.";

  try {
    const docRef = collection(firestore, 'registrations');
    
    // Initiate write. We sanitize data to prevent the "Unsupported field value: undefined" error.
    addDoc(docRef, {
      ...cleanData,
      createdAt: serverTimestamp(),
    }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: 'registrations',
        operation: 'create',
        requestResourceData: cleanData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    // Background tasks (AI/Email) are decoupled to ensure the success UI is not blocked
    try {
      const submissionDetails = `
        Course: ${cleanData.course}
        Year: ${cleanData.yearOfPassing}
        Result: ${cleanData.percentage ? cleanData.percentage + '%' : cleanData.cgpa + ' CGPA'}
      `.trim();

      generatePersonalizedConfirmationEmail({
        userName: cleanData.studentName,
        userEmail: cleanData.email,
        submissionDetails,
        preferredLanguage: cleanData.language as 'en' | 'kn',
      }).then(emailData => {
        sendConfirmationEmail(cleanData.email, emailData.subject, emailData.body);
      }).catch(err => console.warn('AI/Email background task failed:', err));

      return {
        success: true,
        message: successMessage,
      };
    } catch (backgroundError) {
      console.warn('Post-submission tasks failed:', backgroundError);
      return {
        success: true,
        message: successMessage,
      };
    }
  } catch (error) {
    console.error('Submission processing failed:', error);
    return {
      success: false,
      message: 'An error occurred during submission.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
