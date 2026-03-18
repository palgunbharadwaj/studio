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
  
  try {
    const docRef = collection(firestore, 'registrations');
    
    // Create submission record
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

    // Construct submission summary for AI context
    const submissionDetails = `
      Course: ${data.course}
      Academic Year: 2025-2026
      ${data.branch ? `Branch/Combination: ${data.branch || data.combination}` : ''}
      Result: ${data.percentage ? data.percentage + '%' : data.cgpa + ' CGPA'}
    `.trim();

    // Call Genkit flow to generate personalized confirmation content in the correct language
    const emailData = await generatePersonalizedConfirmationEmail({
      userName: data.studentName,
      userEmail: data.email,
      submissionDetails,
      preferredLanguage: data.language as 'en' | 'kn',
    });

    // Send the email via Server Action
    await sendConfirmationEmail(data.email, emailData.subject, emailData.body);

    const successMessage = data.language === 'en' 
      ? "The award distribution will take place on 23/04/2026. All receiving students, along with their families, are requested to compulsorily attend the Lord's service."
      : "ದಿನಾಂಕ:23/04/2026 ರಂದು ಎಲ್ಲಾ ಮಕ್ಕಳಿಗೂ ಪುರಸ್ಕರಿಸಲಾಗುವುದು. ಹಾಗಾಗಿ ಸಂಬಂಧಪಟ್ಟ ಮಕ್ಕಳು ಹಾಗೂ ಕುಟುಂಬ ಕಡ್ಡಾಯವಾಗಿ ಭಗವಂತನ ಕೈಂಕರ್ಯಕ್ಕೆ ಹಾಜರಾಗುವುದು.";

    return {
      success: true,
      message: successMessage,
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
