'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { submitLinguaForm, SubmissionResult } from '@/app/actions/submit-form';
import { Loader2, CheckCircle2, Send, FileText, Info } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  details: z.string().min(10, { message: "Please provide some more details." }),
});

type FormValues = z.infer<typeof formSchema>;

export function LinguaForm() {
  const [lang, setLang] = useState<'en' | 'kn'>('kn');
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
      title: "Prathibha Puraskahara 2024-2025:",
      description: "Recognition at the temple level for students who secured more than 85% in PUC and Ranks or more than 90% in SSLC/Degree/Job-oriented education in the March and April examinations of the academic years 2024 and 2025.",
      langQuestion: "Choose Language / ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ",
      nameLabel: "Full Name",
      namePlaceholder: "Enter your name",
      emailLabel: "Email Address",
      emailPlaceholder: "example@email.com",
      detailsLabel: "Additional Details (Course, Marks %, etc.)",
      detailsPlaceholder: "Enter your marks and course details...",
      fileLabel: "Upload Document (PDF)",
      filePlaceholder: "Click to select file",
      submitButton: "Submit Registration",
      successTitle: "Submission Received!",
      successDesc: "Your registration has been submitted successfully.",
      backButton: "Submit Another",
      processing: "Processing...",
    },
    kn: {
      title: "ಪ್ರತಿಭಾ ಪುರಸ್ಕಾರ 2024-2025:",
      description: "2024 ಮತ್ತು 2025ರ ಸಾಲಿನ ಮಾರ್ಚಿ ಮತ್ತು ಏಪ್ರಿಲ್ ನಲ್ಲಿ ನಡೆದ ಪಿ.ಯು.ಸಿ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಶೇ.85 ಕ್ಕಿಂತ ಹಾಗೂ ಎಸ್.ಎಸ್.ಎಲ್.ಸಿ/ಪದವಿ/ಉದ್ಯೋಗಾಧಾರಿತ ಶಿಕ್ಷಣದಲ್ಲಿ ರ‍್ಯಾಂಕ್‌ ಅಥವಾ ಶೇ.90 ಕ್ಕಿಂತ ಹೆಚ್ಚು ಅಂಕ ಪಡೆದ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ದೇವಾಲಯದ ಮಟ್ಟದಲ್ಲಿ ಪುರಸ್ಕಾರ.",
      langQuestion: "Choose Language / ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ",
      nameLabel: "ಪೂರ್ಣ ಹೆಸರು",
      namePlaceholder: "ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
      emailLabel: "ಇಮೇಲ್ ವಿಳಾಸ",
      emailPlaceholder: "example@email.com",
      detailsLabel: "ಹೆಚ್ಚುವರಿ ವಿವರಗಳು (ಕೋರ್ಸ್, ಅಂಕಗಳು %, ಇತ್ಯಾದಿ)",
      detailsPlaceholder: "ನಿಮ್ಮ ಅಂಕಗಳು ಮತ್ತು ಕೋರ್ಸ್ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ...",
      fileLabel: "ದಾಖಲೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (PDF)",
      filePlaceholder: "ಫೈಲ್ ಆಯ್ಕೆ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ",
      submitButton: "ಸಲ್ಲಿಸಿ",
      successTitle: "ಸಲ್ಲಿಸುವಿಕೆ ಸ್ವೀಕರಿಸಲಾಗಿದೆ!",
      successDesc: "ನಿಮ್ಮ ನೋಂದಣಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ.",
      backButton: "ಮತ್ತೊಂದು ಸಲ್ಲಿಸಿ",
      processing: "ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ...",
    }
  };

  const t = translations[lang];
  const banner = PlaceHolderImages.find(img => img.id === 'form-banner');

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

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    let documentBase64 = '';
    if (file) {
      const reader = new FileReader();
      documentBase64 = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
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
      <Card className="shadow-lg border-none">
        <CardContent className="pt-12 pb-12 text-center space-y-6">
          <div className="mx-auto bg-green-50 text-green-600 p-4 rounded-full w-fit">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#202124]">{t.successTitle}</h2>
            <p className="text-muted-foreground">{t.successDesc}</p>
          </div>
          <Button variant="outline" className="rounded-full px-8" onClick={() => { setResult(null); setFile(null); form.reset(); }}>
            {t.backButton}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto pb-12">
      <Card className="overflow-hidden border-none shadow-md">
        <div className="relative w-full aspect-[4/1]">
          {banner && (
            <Image 
              src={banner.imageUrl} 
              alt={banner.description} 
              fill 
              className="object-cover"
              priority
            />
          )}
        </div>
      </Card>

      <Card className="shadow-md overflow-hidden border-none">
        <CardContent className="p-8 space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Info className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-[#202124]">{t.title}</h1>
              <p className="text-base text-[#5f6368] leading-relaxed">{t.description}</p>
            </div>
          </div>
          <div className="text-xs text-[#70757a] border-t pt-4 mt-2 font-medium italic">
            Official registration portal for Prathibha Puraskahara SJSVT.
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md border-none">
        <CardContent className="p-8">
          <div className="space-y-4">
            <Label className="text-lg font-bold text-[#202124]">
              {t.langQuestion} <span className="text-destructive">*</span>
            </Label>
            <RadioGroup 
              value={lang} 
              onValueChange={(v) => setLang(v as 'en' | 'kn')}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${lang === 'en' ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/30 hover:bg-muted/50'}`} onClick={() => setLang('en')}>
                <RadioGroupItem value="en" id="en" className="sr-only" />
                <Label htmlFor="en" className="cursor-pointer font-semibold text-base w-full">English</Label>
              </div>
              <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${lang === 'kn' ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/30 hover:bg-muted/50'}`} onClick={() => setLang('kn')}>
                <RadioGroupItem value="kn" id="kn" className="sr-only" />
                <Label htmlFor="kn" className="cursor-pointer font-semibold text-base w-full">ಕನ್ನಡ</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="shadow-md border-none">
            <CardContent className="p-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg font-bold text-[#202124]">
                      {t.nameLabel} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t.namePlaceholder} 
                        className="h-12 text-base bg-muted/20 border-0 focus-visible:bg-transparent transition-all"
                        suppressHydrationWarning
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-md border-none">
            <CardContent className="p-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg font-bold text-[#202124]">
                      {t.emailLabel} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t.emailPlaceholder} 
                        type="email"
                        className="h-12 text-base bg-muted/20 border-0 focus-visible:bg-transparent transition-all"
                        suppressHydrationWarning
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-md border-none">
            <CardContent className="p-8">
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg font-bold text-[#202124]">
                      {t.detailsLabel} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t.detailsPlaceholder} 
                        className="min-h-[120px] text-base bg-muted/20 border-0 focus-visible:bg-transparent transition-all resize-none"
                        suppressHydrationWarning
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="shadow-md border-none">
            <CardContent className="p-8 space-y-4">
              <Label className="text-lg font-bold text-[#202124]">
                {t.fileLabel}
              </Label>
              <div className="relative group">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 transition-all ${file ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 bg-muted/20 group-hover:bg-muted/40'}`}>
                  <FileText className={`w-12 h-12 mb-3 ${file ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-base font-semibold ${file ? 'text-primary' : 'text-muted-foreground'}`}>
                    {file ? file.name : t.filePlaceholder}
                  </span>
                  {!file && <span className="text-xs text-muted-foreground mt-2">Max size: 2MB</span>}
                </div>
              </div>
              {fileError && <p className="text-sm font-semibold text-destructive mt-2">{fileError}</p>}
            </CardContent>
          </Card>

          <div className="flex pt-4">
            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all" 
              disabled={isSubmitting}
              suppressHydrationWarning
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  {t.processing}
                </>
              ) : (
                <>
                  <Send className="mr-3 h-5 w-5" />
                  {t.submitButton}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
