
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageToggle } from './LanguageToggle';
import { submitLinguaForm, SubmissionResult } from '@/app/actions/submit-form';
import { Loader2, CheckCircle2, Send, Mail, User, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  details: z.string().min(10, { message: "Please provide some more details." }),
});

type FormValues = z.infer<typeof formSchema>;

export function LinguaForm() {
  const [lang, setLang] = useState<'en' | 'kn'>('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      details: '',
    },
  });

  const translations = {
    en: {
      title: "Submit Your Information",
      description: "We'll store your data securely and send you a personalized confirmation email.",
      nameLabel: "Full Name",
      namePlaceholder: "Enter your name",
      emailLabel: "Email Address",
      emailPlaceholder: "example@email.com",
      detailsLabel: "Additional Details",
      detailsPlaceholder: "Tell us more...",
      submitButton: "Submit Form",
      successTitle: "Submission Received!",
      successDesc: "An AI-powered personalized email has been generated for you.",
      emailSubject: "Subject",
      emailBody: "Email Content",
      backButton: "Submit Another",
    },
    kn: {
      title: "ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ಸಲ್ಲಿಸಿ",
      description: "ನಾವು ನಿಮ್ಮ ಡೇಟಾವನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಸಂಗ್ರಹಿಸುತ್ತೇವೆ ಮತ್ತು ನಿಮಗೆ ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ದೃಢೀಕರಣ ಇಮೇಲ್ ಕಳುಹಿಸುತ್ತೇವೆ.",
      nameLabel: "ಪೂರ್ಣ ಹೆಸರು",
      namePlaceholder: "ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
      emailLabel: "ಇಮೇಲ್ ವಿಳಾಸ",
      emailPlaceholder: "example@email.com",
      detailsLabel: "ಹೆಚ್ಚುವರಿ ವಿವರಗಳು",
      detailsPlaceholder: "ನಮಗೆ ಇನ್ನಷ್ಟು ತಿಳಿಸಿ...",
      submitButton: "ಸಲ್ಲಿಸಿ",
      successTitle: "ಸಲ್ಲಿಸುವಿಕೆ ಸ್ವೀಕರಿಸಲಾಗಿದೆ!",
      successDesc: "ನಿಮಗಾಗಿ AI-ಚಾಲಿತ ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಇಮೇಲ್ ಅನ್ನು ರಚಿಸಲಾಗಿದೆ.",
      emailSubject: "ವಿಷಯ",
      emailBody: "ಇಮೇಲ್ ವಿಷಯ",
      backButton: "ಮತ್ತೊಂದು ಸಲ್ಲಿಸಿ",
    }
  };

  const t = translations[lang];

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    setResult(null);
    const response = await submitLinguaForm({
      ...values,
      language: lang,
    });
    setResult(response);
    setIsSubmitting(false);
  }

  if (result?.success) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="border-accent/20 shadow-xl overflow-hidden">
          <div className="h-2 bg-accent" />
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-green-100 text-green-600 p-3 rounded-full w-fit mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold">{t.successTitle}</CardTitle>
            <CardDescription>{t.successDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Mail className="w-4 h-4" />
                <span>{t.emailSubject}: {result.emailPreview?.subject}</span>
              </div>
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {result.emailPreview?.body}
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setResult(null);
                  form.reset();
                }}
              >
                {t.backButton}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="shadow-2xl border-none ring-1 ring-border/50">
      <CardHeader className="space-y-4">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
            LinguaForm AI
          </Badge>
          <LanguageToggle current={lang} onChange={setLang} />
        </div>
        <div>
          <CardTitle className="text-2xl font-headline font-bold text-primary">{t.title}</CardTitle>
          <CardDescription className="text-muted-foreground mt-1">{t.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="w-4 h-4 text-accent" />
                    {t.nameLabel}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t.namePlaceholder} {...field} className="transition-all focus:ring-accent" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-accent" />
                    {t.emailLabel}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t.emailPlaceholder} type="email" {...field} className="transition-all focus:ring-accent" />
                  </FormControl>
                  <FormDescription className="text-xs">
                    {lang === 'en' ? 'Your privacy is guaranteed.' : 'ನಿಮ್ಮ ಗೌಪ್ಯತೆಯನ್ನು ಖಾತರಿಪಡಿಸಲಾಗಿದೆ.'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-accent" />
                    {t.detailsLabel}
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t.detailsPlaceholder} 
                      className="min-h-[120px] transition-all focus:ring-accent resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.98]" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {lang === 'en' ? 'Processing...' : 'ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ...'}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  {t.submitButton}
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
