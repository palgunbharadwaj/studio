'use client';

import { LinguaForm } from '@/components/LinguaForm';
import { useEffect, useState } from 'react';

export default function Home() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <main className="min-h-screen bg-[#f0f4f8] py-12 px-4 sm:px-6">
      <LinguaForm />
      
      <footer className="mt-16 text-center text-[#70757a] text-sm max-w-2xl mx-auto border-t pt-8">
        <p>© {year} Prathibha Puraskahara SJSVT.</p>
        <div className="mt-4 flex justify-center gap-6 font-medium">
          <span className="hover:underline cursor-pointer">Report Abuse</span>
          <span className="text-muted-foreground/40">•</span>
          <span className="hover:underline cursor-pointer">Terms of Service</span>
          <span className="text-muted-foreground/40">•</span>
          <span className="hover:underline cursor-pointer">Privacy Policy</span>
        </div>
      </footer>
    </main>
  );
}
