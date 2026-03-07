
'use client';

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { generatePersonalizedConfirmationEmail, PersonalizedConfirmationEmailOutput } from '@/ai/flows/personalized-confirmation-email';

export type SubmissionResult = {
  success: boolean;
  message: string;
  error?: string;
  emailData?: PersonalizedConfirmationEmailOutput;
};

export async function submitLinguaForm(data: any): Promise<SubmissionResult> {
  const { firestore } = initializeFirebase();
  
  try {
    const docRef = collection(firestore, 'registrations');
    
    // Fire and forget mutation (background sync)
    addDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
    }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: 'registrations',
        operation: 'create',
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    // Construct detailed summary for AI generation
    const submissionDetails = `
      Course: ${data.course}
      Academic Year: 2024-2025
      ${data.branch ? `Branch/Combination: ${data.branch || data.combination}` : ''}
      Result: ${data.percentage ? data.percentage + '%' : data.cgpa + ' CGPA'}
    `.trim();

    // Call Genkit flow to generate personalized confirmation content
    const emailData = await generatePersonalizedConfirmationEmail({
      userName: data.studentName,
      userEmail: data.email,
      submissionDetails,
      preferredLanguage: data.language as 'en' | 'kn',
    });

    return {
      success: true,
      message: data.language === 'en' ? 'Submission successful!' : 'ಸಲ್ಲಿಸುವಿಕೆ ಯಶಸ್ವಿಯಾಗಿದೆ!',
      emailData,
    };
  } catch (error) {
    return {
      success: false,
      message: 'An error occurred during submission.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
