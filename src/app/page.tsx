
import { LinguaForm } from '@/components/LinguaForm';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Github, Globe, Sparkles, ShieldCheck, MailCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-image');

  return (
    <main className="relative flex flex-col min-h-screen">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-accent/10 to-transparent blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-primary/10 to-transparent blur-3xl opacity-50" />
      </div>

      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg transition-transform group-hover:rotate-12">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary">LinguaForm</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">About</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">API</a>
          </nav>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer">
              <Github className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
            </a>
          </div>
        </div>
      </header>

      <section className="flex-1 container mx-auto px-4 py-12 md:py-20 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Multilingual Support</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold text-primary leading-[1.1]">
              Effortless Forms in <span className="text-accent underline decoration-accent/30 underline-offset-4">English & Kannada</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Accept information gracefully across languages. LinguaForm automatically generates personalized AI confirmation emails based on user input, ensuring a warm touch for every submission.
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
                <p className="text-sm text-muted-foreground">Automated personalization using Gemini AI models.</p>
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

      <section id="features" className="bg-white/50 py-24 border-y">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-headline font-bold text-primary">Powerful Core Features</h2>
            <p className="text-muted-foreground">Everything you need to capture and process information seamlessly.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-background border hover:border-accent/50 transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <Languages className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Multilingual UI</h3>
              <p className="text-muted-foreground text-sm">Switch instantly between English and Kannada. Native font support ensures clarity for every user.</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-background border hover:border-accent/50 transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Personalization</h3>
              <p className="text-muted-foreground text-sm">Our Gemini-powered engine crafts unique responses for every submission, adapting to the user's language and context.</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-background border hover:border-accent/50 transition-all hover:shadow-lg">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Professional Layout</h3>
              <p className="text-muted-foreground text-sm">Clean, minimalist design following modern UX standards. Optimized for accessibility and speed.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6" />
              <span className="text-2xl font-bold">LinguaForm</span>
            </div>
            <p className="text-primary-foreground/70 text-sm max-w-xs">
              Bridging the gap between languages through smart form technology and AI-driven communication.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-bold">Product</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold">Company</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold">Language Support</h4>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/10 text-white hover:bg-white/20 border-none">English</Badge>
              <Badge className="bg-white/10 text-white hover:bg-white/20 border-none">ಕನ್ನಡ (Kannada)</Badge>
              <Badge className="bg-white/10 text-white/40 border-none">More Coming Soon</Badge>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-white/10 text-center text-sm text-primary-foreground/50">
          <p>© {new Date().getFullYear()} LinguaForm. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

function Languages({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  );
}
