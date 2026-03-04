'use client';

import { useState, useEffect } from 'react';
import { LinguaForm } from '@/components/LinguaForm';

export default function Home() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-lg">
        <LinguaForm />
      </div>

      <footer className="mt-8 text-muted-foreground text-sm">
        <p>© {year || '2025'} Prathibha Puraskahara SJSVT. All rights reserved.</p>
      </footer>
    </main>
  );
}
