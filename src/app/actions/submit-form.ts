'use server';

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * @fileOverview A server action for securely submitting the form data to Firestore 
 * and triggering the AI confirmation email.
 */

export type SubmissionResult = {
  success: boolean;
  message: string;
  error?: string;
};

export async function submitLinguaForm(data: any): Promise<SubmissionResult> {
  const { firestore } = initializeFirebase();
  
  // Extract large files for chunking
  const { photoBase64, marksCardBase64, ...formData } = data;

  // Firestore does not accept 'undefined' values. Sanitize data before submission.
  const cleanData: Record<string, any> = {};
  Object.keys(formData).forEach((key) => {
    if (formData[key] !== undefined) {
      cleanData[key] = formData[key];
    }
  });

  const successMessage = cleanData.language === 'en' 
    ? "The award distribution will take place on 23/04/2026. All receiving students, along with their families, are requested to compulsorily attend the Lord's service."
    : "ದಿನಾಂಕ:23/04/2026 ರಂದು ಎಲ್ಲಾ ಮಕ್ಕಳಿಗೂ ಪುರಸ್ಕರಿಸಲಾಗುವುದು. ಹಾಗಾಗಿ ಸಂಬಂಧಪಟ್ಟ ಮಕ್ಕಳು ಹಾಗೂ ಕುಟುಂಬ ಕಡ್ಡಾಯವಾಗಿ ಭಗವಂತನ ಕೈಂಕರ್ಯಕ್ಕೆ ಹಾಜರಾಗುವುದು.";

  try {
    console.log('--- SERVER SUBMISSION INITIATED ---');
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

    // 2. Helper function to chunk and save files to Firestore (Parallelized)
    const saveChunks = async (base64: string, type: 'photo' | 'marksCard') => {
      if (!base64) return;
      
      const CHUNK_SIZE = 900 * 1024;
      const chunkCount = Math.ceil(base64.length / CHUNK_SIZE);
      const chunksCollection = collection(firestore, 'file_chunks');
      
      console.log(`Uploading ${type} (${chunkCount} chunks) in parallel...`);
      
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

    // 3. Save file chunks (Parallelized for both files for maximum speed)
    await Promise.all([
      saveChunks(photoBase64, 'photo'),
      saveChunks(marksCardBase64, 'marksCard')
    ]);
    console.log('All files saved to Firestore in parallel.');

    return {
      success: true,
      message: successMessage,
    };

  } catch (error) {
    console.error('SERVER SUBMISSION CRITICAL ERROR:', error);
    return {
      success: false,
      message: 'An error occurred during secure submission.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
