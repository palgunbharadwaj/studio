'use client';

import { initializeFirebase } from '@/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

/**
 * Re-assembles a chunked file from Firestore based on the studentId and type.
 * This can be used in an Admin dashboard to view the uploaded files.
 */
export async function getReassembledFile(studentId: string, type: 'photo' | 'marksCard'): Promise<string | null> {
  const { firestore } = initializeFirebase();
  
  try {
    const chunksRef = collection(firestore, 'file_chunks');
    const q = query(
      chunksRef, 
      where('studentId', '==', studentId),
      where('type', '==', type)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.warn(`No chunks found for student ${studentId} and type ${type}`);
      return null;
    }
    
    // Sort chunks by index in memory to avoid the need for a composite index
    const sortedDocs = querySnapshot.docs
      .map(doc => doc.data())
      .sort((a, b) => (a.index || 0) - (b.index || 0));
    
    let fullBase64 = '';
    sortedDocs.forEach((doc) => {
      fullBase64 += doc.data;
    });
    
    return fullBase64;
  } catch (error) {
    console.error('Error re-assembling file:', error);
    return null;
  }
}
