'use server';

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type SubmissionResult = {
  success: boolean;
  message: string;
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
    const { firestore } = initializeFirebase();
    
    // Save submission to Firestore
    await addDoc(collection(firestore, 'registrations'), {
      name: data.name,
      email: data.email,
      details: data.details,
      language: data.language,
      documentBase64: data.documentBase64 || '',
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      message: data.language === 'en' ? 'Submission successful!' : 'ಸಲ್ಲಿಸುವಿಕೆ ಯಶಸ್ವಿಯಾಗಿದೆ!',
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