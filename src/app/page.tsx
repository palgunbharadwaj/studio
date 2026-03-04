import { LinguaForm } from '@/components/LinguaForm';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
      <div className="w-full max-w-lg">
        <LinguaForm />
      </div>

      <footer className="mt-12 text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} Prathibha Puraskahara SJSVT. All rights reserved.</p>
      </footer>
    </main>
  );
}
