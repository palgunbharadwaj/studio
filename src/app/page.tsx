import { LinguaForm } from '@/components/LinguaForm';

export default function Home() {
  return (
    <main className="relative flex flex-col min-h-screen items-center justify-center p-4">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-accent/10 to-transparent blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-primary/10 to-transparent blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-primary mb-2">
            Prathibha Puraskahara SJSVT
          </h1>
          <p className="text-xl font-bold text-accent">
            ಪ್ರತಿಭಾ ಪುರಸ್ಕಾರ SJSVT
          </p>
        </div>
        
        <LinguaForm />
        
        <div className="absolute -z-10 -bottom-6 -right-6 w-full h-full bg-accent/5 rounded-2xl border-2 border-dashed border-accent/20" />
      </div>

      <footer className="mt-12 text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} Prathibha Puraskahara SJSVT. All rights reserved.</p>
      </footer>
    </main>
  );
}
