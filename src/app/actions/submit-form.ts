'use server';

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';

/**
 * @fileOverview A server action for securely submitting the form data to Firestore.
 */

export type SubmissionResult = {
  success: boolean;
  message: string;
  studentId?: string;
  error?: string;
};

export async function uploadFileChunk(payload: {
  studentId: string;
  type: 'photo' | 'marksCard';
  index: number;
  totalChunks: number;
  chunkData: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { firestore } = initializeFirebase();
    const chunksCollection = collection(firestore, 'file_chunks');
    
    await addDoc(chunksCollection, {
      studentId: payload.studentId,
      type: payload.type,
      index: payload.index,
      totalChunks: payload.totalChunks,
      data: payload.chunkData,
      createdAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('CHUNK UPLOAD ERROR:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function submitLinguaForm(data: any): Promise<SubmissionResult> {
  try {
    console.log('--- SERVER SUBMISSION INITIATED ---');

    // 0. Validate Environment Variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'
    ];
    const missingVars = requiredEnvVars.filter(v => !process.env[v]);
    if (missingVars.length > 0) {
      throw new Error(`Server configuration error: Missing environment variables (${missingVars.join(', ')}).`);
    }

    const { firestore } = initializeFirebase();
    
    // Extract file flags (Base64 is no longer sent to this action)
    const { hasPhoto, hasMarksCard, ...formData } = data;

    // Sanitize data
    const cleanData: Record<string, any> = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
        cleanData[key] = formData[key];
      }
    });

    const successMessage = cleanData.language === 'en' 
      ? "The award distribution will take place on 23/04/2026. All receiving students, along with their families, are requested to compulsorily attend the Lord's service."
      : "ದಿನಾಂಕ:23/04/2026 ರಂದು ಎಲ್ಲಾ ಮಕ್ಕಳಿಗೂ ಪುರಸ್ಕರಿಸಲಾಗುವುದು. ಹಾಗಾಗಿ ಸಂಬಂಧಪಟ್ಟ ಮಕ್ಕಳು ಹಾಗೂ ಕುಟುಂಬ ಕಡ್ಡಾಯವಾಗಿ ಭಗವಂತನ ಕೈಂಕರ್ಯಕ್ಕೆ ಹಾಜರಾಗುವುದು.";

    const parentRef = collection(firestore, 'registrations');
    
    // 1. Generate and save the main document
    const registrationRef = doc(parentRef);
    const studentId = registrationRef.id;

    await setDoc(registrationRef, {
      ...cleanData,
      hasPhoto,
      hasMarksCard,
      createdAt: serverTimestamp(),
    });
    
    return {
      success: true,
      message: successMessage,
      studentId,
    };

  } catch (error) {
    console.error('SERVER SUBMISSION CRITICAL ERROR:', error);
    return {
      success: false,
      message: 'An error occurred during submission. If this persists, please try with smaller files or check your internet connection.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
