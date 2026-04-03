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
    const parentRef = collection(firestore, 'registrations');
    
    console.log('Attempting Firestore write for student data...');
    
    // 1. Save the main student document (without the large files)
    const docResponse = await addDoc(parentRef, {
      ...cleanData,
      hasPhoto: !!photoBase64,
      hasMarksCard: !!marksCardBase64,
      createdAt: serverTimestamp(),
    });

    const studentId = docResponse.id;
    console.log('Main document SUCCESS! Student ID:', studentId);

    // 2. Helper function to chunk and save files
    const saveChunks = async (base64: string, type: 'photo' | 'marksCard') => {
      if (!base64) return;
      
      const CHUNK_SIZE = 900 * 1024; // 900KB (Safe under the 1MB Firestore limit)
      const chunkCount = Math.ceil(base64.length / CHUNK_SIZE);
      const chunksCollection = collection(firestore, 'file_chunks');
      
      console.log(`Splitting ${type} (${base64.length} chars) into ${chunkCount} chunks...`);
      
      for (let i = 0; i < chunkCount; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, base64.length);
        const chunkData = base64.substring(start, end);
        
        await addDoc(chunksCollection, {
          studentId,
          type,
          index: i,
          totalChunks: chunkCount,
          data: chunkData,
          createdAt: serverTimestamp(),
        });
      }
      console.log(`${type} chunks saved successfully!`);
    };

    // 3. Save chunks for both files in the background (or sequential if preferred for safety)
    await saveChunks(photoBase64, 'photo');
    await saveChunks(marksCardBase64, 'marksCard');

    // Background tasks (AI/Email) are handled after the critical DB writes
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
