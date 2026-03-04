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
import { Loader2, CheckCircle2, Send, Mail, User, Info, FileText, X } from 'lucide-react';

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
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

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
      brand: "Prathibha Puraskahara SJSVT",
      title: "Submit Your Information",
      description: "Enter your details below to register.",
      nameLabel: "Full Name",
      namePlaceholder: "Enter your name",
      emailLabel: "Email Address",
      emailPlaceholder: "example@email.com",
      detailsLabel: "Additional Details",
      detailsPlaceholder: "Tell us more...",
      fileLabel: "Upload Document (PDF)",
      filePlaceholder: "Click to select file",
      submitButton: "Submit Form",
      successTitle: "Submission Received!",
      successDesc: "A confirmation email has been generated for you.",
      emailSubject: "Subject",
      emailBody: "Email Content",
      backButton: "Submit Another",
      processing: "Processing...",
    },
    kn: {
      brand: "ಪ್ರತಿಭಾ ಪುರಸ್ಕಾರ SJSVT",
      title: "ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ಸಲ್ಲಿಸಿ",
      description: "ನೋಂದಾಯಿಸಲು ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಕೆಳಗೆ ನಮೂದಿಸಿ.",
      nameLabel: "ಪೂರ್ಣ ಹೆಸರು",
      namePlaceholder: "ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
      emailLabel: "ಇಮೇಲ್ ವಿಳಾಸ",
      emailPlaceholder: "example@email.com",
      detailsLabel: "ಹೆಚ್ಚುವರಿ ವಿವರಗಳು",
      detailsPlaceholder: "ನಮಗೆ ಇನ್ನಷ್ಟು ತಿಳಿಸಿ...",
      fileLabel: "ದಾಖಲೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (PDF)",
      filePlaceholder: "ಫೈಲ್ ಆಯ್ಕೆ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ",
      submitButton: "ಸಲ್ಲಿಸಿ",
      successTitle: "ಸಲ್ಲಿಸುವಿಕೆ ಸ್ವೀಕರಿಸಲಾಗಿದೆ!",
      successDesc: "ನಿಮಗಾಗಿ ದೃಢೀಕರಣ ಇಮೇಲ್ ಅನ್ನು ರಚಿಸಲಾಗಿದೆ.",
      emailSubject: "ವಿಷಯ",
      emailBody: "ಇಮೇಲ್ ವಿಷಯ",
      backButton: "ಮತ್ತೊಂದು ಸಲ್ಲಿಸಿ",
      processing: "ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ...",
    }
  };

  const t = translations[lang];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFileError(null);
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setFileError(lang === 'en' ? 'Only PDF files are allowed.' : 'ಕೇವಲ PDF ಫೈಲ್‌ಗಳನ್ನು ಮಾತ್ರ ಅನುಮತಿಸಲಾಗಿದೆ.');
        setFile(null);
        return;
      }
      if (selectedFile.size > 2 * 1024 * 1024) {
        setFileError(lang === 'en' ? 'File size must be less than 2MB.' : 'ಫೈಲ್ ಗಾತ್ರ 2MB ಗಿಂತ ಕಡಿಮೆ ಇರಬೇಕು.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileError(null);
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    setResult(null);
    
    let documentBase64 = '';
    if (file) {
      try {
        documentBase64 = await toBase64(file);
      } catch (err) {
        console.error("File conversion error", err);
      }
    }

    const response = await submitLinguaForm({
      ...values,
      language: lang,
      documentBase64,
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
                  setFile(null);
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
    <Card className="shadow-2xl border bg-card overflow-hidden">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex justify-between items-center gap-4">
          <h1 className="text-xl font-bold text-primary leading-tight">{t.brand}</h1>
          <LanguageToggle current={lang} onChange={setLang} />
        </div>
        <div className="pt-2 border-t">
          <CardTitle className="text-2xl font-bold text-foreground">{t.title}</CardTitle>
          <CardDescription className="text-muted-foreground mt-1">{t.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                    <Input placeholder={t.namePlaceholder} {...field} className="transition-all" suppressHydrationWarning />
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
                    <Input placeholder={t.emailPlaceholder} type="email" {...field} className="transition-all" suppressHydrationWarning />
                  </FormControl>
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
                      className="min-h-[100px] transition-all resize-none" 
                      {...field} 
                      suppressHydrationWarning
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                {t.fileLabel}
              </FormLabel>
              <div className="relative">
                {!file ? (
                  <div className="relative group">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex items-center justify-center border-2 border-dashed rounded-md p-4 bg-muted/20 group-hover:bg-muted/40 transition-colors">
                      <span className="text-sm text-muted-foreground">{t.filePlaceholder}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 border rounded-md bg-accent/5">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-accent shrink-0" />
                      <span className="text-sm font-medium truncate">{file.name}</span>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={removeFile}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {fileError && <p className="text-xs font-medium text-destructive mt-1">{fileError}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold mt-4" 
              disabled={isSubmitting}
              suppressHydrationWarning
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t.processing}
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
