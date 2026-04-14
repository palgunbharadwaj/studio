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

export async function submitLinguaForm(data: any): Promise<SubmissionResult> {
  try {
    console.log('--- SERVER SUBMISSION INITIATED ---');

    // 0. Validate Environment Variables (Critical for Deployed Environments)
    const requiredEnvVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'
    ];
    const missingVars = requiredEnvVars.filter(v => !process.env[v]);
    if (missingVars.length > 0) {
      throw new Error(`Server configuration error: Missing environment variables (${missingVars.join(', ')}). Please check your hosting provide's secret settings.`);
    }

    const { firestore } = initializeFirebase();
    
    // Extract large files for chunking
    const { photoBase64, marksCardBase64, ...formData } = data;

    // Firestore does not accept 'undefined' values. Sanitize data before submission.
    const cleanData: Record<string, any> = {};
    Object.keys(formData).forEach((key) => {
      // Filter out undefined and null to be safe for all Firestore environments
      if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
        cleanData[key] = formData[key];
      }
    });

    const successMessage = cleanData.language === 'en' 
      ? "The award distribution will take place on 23/04/2026. All receiving students, along with their families, are requested to compulsorily attend the Lord's service."
      : "ದಿನಾಂಕ:23/04/2026 ರಂದು ಎಲ್ಲಾ ಮಕ್ಕಳಿಗೂ ಪುರಸ್ಕರಿಸಲಾಗುವುದು. ಹಾಗಾಗಿ ಸಂಬಂಧಪಟ್ಟ ಮಕ್ಕಳು ಹಾಗೂ ಕುಟುಂಬ ಕಡ್ಡಾಯವಾಗಿ ಭಗವಂತನ ಕೈಂಕರ್ಯಕ್ಕೆ ಹಾಜರಾಗುವುದು.";

    const parentRef = collection(firestore, 'registrations');
    
    // 1. Pre-generate the document ID so we can start file uploads immediately in parallel
    // This removes the need to wait for the main record before starting chunk uploads
    const registrationRef = doc(parentRef);
    const studentId = registrationRef.id;
    console.log('Generated Student ID:', studentId);

    // 2. Prepare the main document promise
    const mainDocPromise = setDoc(registrationRef, {
      ...cleanData,
      hasPhoto: !!photoBase64,
      hasMarksCard: !!marksCardBase64,
      createdAt: serverTimestamp(),
    });

    // 3. Helper function to generate chunk promises
    const getChunkPromises = (base64: string, type: 'photo' | 'marksCard') => {
      if (!base64) return [];
      
      const CHUNK_SIZE = 950 * 1024; 
      const chunkCount = Math.ceil(base64.length / CHUNK_SIZE);
      const chunksCollection = collection(firestore, 'file_chunks');
      
      const promises = [];
      for (let i = 0; i < chunkCount; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, base64.length);
        const chunkData = base64.substring(start, end);
        
        promises.push(addDoc(chunksCollection, {
          studentId,
          type,
          index: i,
          totalChunks: chunkCount,
          data: chunkData,
          createdAt: serverTimestamp(),
        }));
      }
      return promises;
    };

    // 4. Trigger ALL writes (Main + Photo Chunks + Marks Chunks) simultaneously
    console.log('Sending all data to Firestore in parallel...');
    const photoPromises = getChunkPromises(photoBase64, 'photo');
    const marksPromises = getChunkPromises(marksCardBase64, 'marksCard');
    
    await Promise.all([
      mainDocPromise,
      ...photoPromises,
      ...marksPromises
    ]);
    
    console.log('All records and chunks saved successfully.');

    return {
      success: true,
      message: successMessage,
      studentId,
    };

  } catch (error) {
    console.error('SERVER SUBMISSION CRITICAL ERROR:', error);
    return {
      success: false,
      message: error instanceof Error && error.message.includes('configuration error') 
        ? error.message 
        : 'An error occurred during submission. If this persists, please try with smaller files or check your internet connection.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
