'use server';

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
    
    // 1. Save the main student document (without the large files)
    const docResponse = await addDoc(parentRef, {
      ...cleanData,
      hasPhoto: !!photoBase64,
      hasMarksCard: !!marksCardBase64,
      createdAt: serverTimestamp(),
    });

    const studentId = docResponse.id;
    console.log('Main Firestore record created:', studentId);

    // 2. Helper function to chunk and save files to Firestore
    const saveChunks = async (base64: string, type: 'photo' | 'marksCard') => {
      if (!base64) return;
      
      // Increased chunk size closer to 1MB limit for fewer writes and better performance
      const CHUNK_SIZE = 950 * 1024; 
      const chunkCount = Math.ceil(base64.length / CHUNK_SIZE);
      const chunksCollection = collection(firestore, 'file_chunks');
      
      console.log(`Uploading ${type} (${chunkCount} chunks)...`);
      
      const chunkPromises = [];
      for (let i = 0; i < chunkCount; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, base64.length);
        const chunkData = base64.substring(start, end);
        
        chunkPromises.push(addDoc(chunksCollection, {
          studentId,
          type,
          index: i,
          totalChunks: chunkCount,
          data: chunkData,
          createdAt: serverTimestamp(),
        }));
      }
      
      await Promise.all(chunkPromises);
    };

    // 3. Save file chunks
    await Promise.all([
      saveChunks(photoBase64, 'photo'),
      saveChunks(marksCardBase64, 'marksCard')
    ]);
    console.log('All files saved to Firestore.');

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
