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
    
    // 1. Deduplicate and sort chunks by index
    const uniqueChunks = new Map<number, any>();
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (typeof data.index === 'number') {
        uniqueChunks.set(data.index, data);
      }
    });

    const sortedDocs = Array.from(uniqueChunks.values())
      .sort((a, b) => a.index - b.index);
    
    // 2. Validation: Check if we have all the chunks
    // We get the expected total from the first chunk found
    const expectedTotal = sortedDocs[0].totalChunks;
    if (sortedDocs.length !== expectedTotal) {
      console.error(`Re-assembly failed: Found ${sortedDocs.length} of ${expectedTotal} chunks for ${type}`);
      return null;
    }
    
    // 3. Concatenate the data
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
