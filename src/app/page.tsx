import { LinguaForm } from '@/components/LinguaForm';
import { Globe, ShieldCheck, MailCheck } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative flex flex-col min-h-screen">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-accent/10 to-transparent blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-primary/10 to-transparent blur-3xl opacity-50" />
      </div>

      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary">LinguaForm</span>
          </div>
        </div>
      </header>

      <section className="flex-1 container mx-auto px-4 py-12 md:py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 z-10">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold text-primary leading-[1.1]">
              Effortless Forms in <span className="text-accent underline decoration-accent/30 underline-offset-4">English & Kannada</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Accept information gracefully across languages. LinguaForm automatically generates personalized confirmation emails based on user input, ensuring a warm touch for every submission.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-primary">Secure Storage</h3>
                <p className="text-sm text-muted-foreground">Reliable data persistence for all your form entries.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <MailCheck className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-primary">Smart Emails</h3>
                <p className="text-sm text-muted-foreground">Automated personalization for every message.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-lg lg:max-w-none lg:mr-0">
          <LinguaForm />
          {/* Decorative element behind form */}
          <div className="absolute -z-10 -bottom-6 -right-6 w-full h-full bg-accent/5 rounded-2xl border-2 border-dashed border-accent/20" />
        </div>
      </section>

      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="w-5 h-5" />
            <span className="text-xl font-bold">LinguaForm</span>
          </div>
          <p className="text-primary-foreground/50 text-sm">
            © {new Date().getFullYear()} LinguaForm. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
