'use client';

import { LinguaForm } from '@/components/LinguaForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f0f4f8] py-8 px-4 sm:px-6">
      <LinguaForm />
      
      <footer className="mt-12 text-center text-[#70757a] text-xs">
        <p>Prathibha Puraskahara SJSVT. Never submit passwords through forms.</p>
        <div className="mt-2 flex justify-center gap-4">
          <span className="hover:underline cursor-pointer">Report Abuse</span>
          <span>-</span>
          <span className="hover:underline cursor-pointer">Terms of Service</span>
          <span>-</span>
          <span className="hover:underline cursor-pointer">Privacy Policy</span>
        </div>
      </footer>
    </main>
  );
}