
'use client';

import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { submitLinguaForm, SubmissionResult } from '@/app/actions/submit-form';
import { Loader2, CheckCircle2, Send, FileText, Info, User, GraduationCap, FileCheck } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  studentName: z.string().min(2, { message: "Name is required." }),
  relationship: z.enum(['SO', 'DO'], { required_error: "Relationship is required." }),
  fatherName: z.string().min(2, { message: "Father's name is required." }),
  motherName: z.string().min(2, { message: "Mother's name is required." }),
  course: z.enum(['SSLC', 'PUC', 'Diploma', 'Degree', 'Engineering', 'Other'], { required_error: "Course is required." }),
  // Academic details
  board: z.string().optional(),
  pucStream: z.enum(['Science', 'Commerce', 'Arts']).optional(),
  combination: z.string().optional(),
  percentage: z.string().optional(),
  marksObtained: z.string().optional(),
  totalMarks: z.string().optional(),
  yearOfPassing: z.string().optional(),
  cgpa: z.string().optional(),
  otherCourse: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function LinguaForm() {
  const [lang, setLang] = useState<'kn' | 'en'>('kn');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [marksFile, setMarksFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      studentName: '',
      fatherName: '',
      motherName: '',
    },
  });

  const selectedCourse = useWatch({ control: form.control, name: 'course' });
  const selectedStream = useWatch({ control: form.control, name: 'pucStream' });

  const translations = {
    en: {
      title: "Prathibha Puraskahara 2024-2025:",
      description: "Recognition at the temple level for students who secured more than 85% in PUC and Ranks or more than 90% in SSLC/Degree/Job-oriented education in the March and April examinations of the academic years 2024 and 2025.",
      langLabel: "Choose Language / ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ",
      emailLabel: "Email",
      studentNameLabel: "Student Name",
      relationshipLabel: "S/O or D/O",
      fatherNameLabel: "Father Name",
      motherNameLabel: "Mother Name",
      courseLabel: "Course",
      boardLabel: "Board",
      streamLabel: "Stream",
      combinationLabel: "Combination",
      percentageLabel: "Percentage",
      marksObtainedLabel: "Marks Obtained",
      totalMarksLabel: "Total Marks",
      yearPassingLabel: "Year Of Passing",
      cgpaLabel: "CGPA",
      otherCourseLabel: "Please specify other course",
      docsTitle: "Documents",
      photoLabel: "Photo (JPG/JPEG, max 10MB)",
      marksCardLabel: "Marks Card (PDF/DOC, max 10MB)",
      submitButton: "Submit",
      processing: "Processing...",
      successTitle: "Submission Received!",
      successDesc: "Your registration has been submitted successfully.",
      backButton: "Submit Another",
      requiredNote: "* Indicates required question",
    },
    kn: {
      title: "ಪ್ರತಿಭಾ ಪುರಸ್ಕಾರ 2024-2025:",
      description: "2024 ಮತ್ತು 2025ರ ಸಾಲಿನ ಮಾರ್ಚಿ ಮತ್ತು ಏಪ್ರಿಲ್ ನಲ್ಲಿ ನಡೆದ ಪಿ.ಯು.ಸಿ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಶೇ.85 ಕ್ಕಿಂತ ಹಾಗೂ ಎಸ್.ಎಸ್.ಎಲ್.ಸಿ/ಪದವಿ/ಉದ್ಯೋಗಾಧಾರಿತ ಶಿಕ್ಷಣದಲ್ಲಿ ರ‍್ಯಾಂಕ್‌ ಅಥವಾ ಶೇ.90 ಕ್ಕಿಂತ ಹೆಚ್ಚು ಅಂಕ ಪಡೆದ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ದೇವಾಲಯದ ಮಟ್ಟದಲ್ಲಿ ಪುರಸ್ಕಾರ.",
      langLabel: "Choose Language / ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ",
      emailLabel: "ಇಮೇಲ್ ವಿಳಾಸ",
      studentNameLabel: "ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರು",
      relationshipLabel: "S/O ಅಥವಾ D/O",
      fatherNameLabel: "ತಂದೆಯ ಹೆಸರು",
      motherNameLabel: "ತಾಯಿಯ ಹೆಸರು",
      courseLabel: "ಕೋರ್ಸ್",
      boardLabel: "ಮಂಡಳಿ",
      streamLabel: "ವಿಭಾಗ",
      combinationLabel: "ವಿಷಯಗಳು",
      percentageLabel: "ಶೇಕಡಾ (%)",
      marksObtainedLabel: "ಗಳಿಸಿದ ಅಂಕಗಳು",
      totalMarksLabel: "ಒಟ್ಟು ಅಂಕಗಳು",
      yearPassingLabel: "ಪಾಸಾದ ವರ್ಷ",
      cgpaLabel: "ಸಿಜಿಪಿಎ (CGPA)",
      otherCourseLabel: "ಇತರೆ ಕೋರ್ಸ್ ವಿವರ",
      docsTitle: "ದಾಖಲೆಗಳು",
      photoLabel: "ಫೋಟೋ (JPG/JPEG, ಗರಿಷ್ಠ 10MB)",
      marksCardLabel: "ಅಂಕಪಟ್ಟಿ (PDF/DOC, ಗರಿಷ್ಠ 10MB)",
      submitButton: "ಸಲ್ಲಿಸಿ",
      processing: "ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ...",
      successTitle: "ಸಲ್ಲಿಸುವಿಕೆ ಸ್ವೀಕರಿಸಲಾಗಿದೆ!",
      successDesc: "ನಿಮ್ಮ ನೋಂದಣಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ.",
      backButton: "ಮತ್ತೊಂದು ಸಲ್ಲಿಸಿ",
      requiredNote: "* ಕಡ್ಡಾಯ ಪ್ರಶ್ನೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ",
    }
  };

  const t = translations[lang];
  const banner = PlaceHolderImages.find(img => img.id === 'form-banner');

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      let photoBase64 = '';
      let marksCardBase64 = '';
      if (photoFile) photoBase64 = await fileToBase64(photoFile);
      if (marksFile) marksCardBase64 = await fileToBase64(marksFile);

      const response = await submitLinguaForm({
        ...values,
        language: lang,
        photoBase64,
        marksCardBase64,
      });
      setResult(response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (result?.success) {
    return (
      <Card className="shadow-sm border-none max-w-xl mx-auto">
        <CardContent className="pt-8 pb-8 text-center space-y-3">
          <div className="mx-auto bg-green-50 text-green-600 p-2 rounded-full w-fit">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#202124]">{t.successTitle}</h2>
            <p className="text-[11px] text-muted-foreground">{t.successDesc}</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full px-5 text-[10px] h-7" onClick={() => { setResult(null); setPhotoFile(null); setMarksFile(null); form.reset(); }}>
            {t.backButton}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 w-full max-w-xl mx-auto pb-8">
      <Card className="overflow-hidden border-none shadow-sm">
        <div className="relative w-full aspect-[4/1]">
          {banner && <Image src={banner.imageUrl} alt={banner.description} fill className="object-cover" priority />}
        </div>
      </Card>

      <Card className="shadow-sm overflow-hidden border-none">
        <CardContent className="p-5 space-y-2">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0"><Info className="w-4 h-4 text-primary" /></div>
            <div className="space-y-1">
              <h1 className="text-sm font-bold tracking-tight text-[#202124]">{t.title}</h1>
              <p className="text-[11px] text-[#5f6368] leading-relaxed">{t.description}</p>
            </div>
          </div>
          <div className="text-[9px] text-destructive pt-2 border-t mt-1 font-medium italic">{t.requiredNote}</div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-none">
        <CardContent className="p-5">
          <div className="space-y-3">
            <Label className="text-[11px] font-semibold text-[#202124]">{t.langLabel} <span className="text-destructive">*</span></Label>
            <RadioGroup value={lang} onValueChange={(v) => setLang(v as 'en' | 'kn')} className="flex flex-col gap-2">
              <div className="flex items-center space-x-3 py-1 cursor-pointer" onClick={() => setLang('en')}>
                <RadioGroupItem value="en" id="en" className="h-3.5 w-3.5" />
                <Label htmlFor="en" className="cursor-pointer font-medium text-[11px]">English</Label>
              </div>
              <div className="flex items-center space-x-3 py-1 cursor-pointer" onClick={() => setLang('kn')}>
                <RadioGroupItem value="kn" id="kn" className="h-3.5 w-3.5" />
                <Label htmlFor="kn" className="cursor-pointer font-medium text-[11px]">ಕನ್ನಡ</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <Card className="shadow-sm border-none">
            <CardContent className="p-5">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[11px] font-semibold text-[#202124]">{t.emailLabel} <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="example@email.com" className="h-8 text-[11px] bg-muted/20 rounded-sm" {...field} /></FormControl>
                  <FormMessage className="text-[9px]" />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b"><User className="w-3.5 h-3.5 text-primary" /><h2 className="text-[12px] font-bold">Personal Details</h2></div>
              <FormField control={form.control} name="studentName" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[11px] font-semibold">{t.studentNameLabel} <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder={lang === 'en' ? "Enter student name" : "ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ"} className="h-8 text-[11px] bg-muted/20" {...field} /></FormControl>
                  <FormMessage className="text-[9px]" />
                </FormItem>
              )} />
              <FormField control={form.control} name="relationship" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[11px] font-semibold">{t.relationshipLabel} <span className="text-destructive">*</span></FormLabel>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-2">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="SO" id="so" className="h-3.5 w-3.5" /><Label htmlFor="so" className="text-[11px]">{lang === 'en' ? 'S/O (Son of)' : 'S/O (ಮಗ)'}</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="DO" id="do" className="h-3.5 w-3.5" /><Label htmlFor="do" className="text-[11px]">{lang === 'en' ? 'D/O (Daughter of)' : 'D/O (ಮಗಳು)'}</Label></div>
                  </RadioGroup>
                  <FormMessage className="text-[9px]" />
                </FormItem>
              )} />
              <FormField control={form.control} name="fatherName" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[11px] font-semibold">{t.fatherNameLabel} <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input className="h-8 text-[11px] bg-muted/20" {...field} /></FormControl>
                  <FormMessage className="text-[9px]" />
                </FormItem>
              )} />
              <FormField control={form.control} name="motherName" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[11px] font-semibold">{t.motherNameLabel} <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input className="h-8 text-[11px] bg-muted/20" {...field} /></FormControl>
                  <FormMessage className="text-[9px]" />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b"><GraduationCap className="w-3.5 h-3.5 text-primary" /><h2 className="text-[12px] font-bold">Academic Details</h2></div>
              <FormField control={form.control} name="course" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[11px] font-semibold">{t.courseLabel} <span className="text-destructive">*</span></FormLabel>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-2">
                    {['SSLC', 'PUC', 'Diploma', 'Degree', 'Engineering', 'Other'].map((c) => (
                      <div key={c} className="flex items-center space-x-2"><RadioGroupItem value={c} id={c} className="h-3.5 w-3.5" /><Label htmlFor={c} className="text-[11px]">{c === 'PUC' ? '2nd PUC' : c === 'SSLC' ? 'SSLC/10th' : c}</Label></div>
                    ))}
                  </RadioGroup>
                  <FormMessage className="text-[9px]" />
                </FormItem>
              )} />

              {selectedCourse === 'SSLC' && (
                <div className="space-y-3 pt-2">
                  <FormField control={form.control} name="board" render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[11px] font-semibold">{t.boardLabel} *</FormLabel>
                      <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-2">
                        {['State', 'CBSE', 'ICSE'].map(b => <div key={b} className="flex items-center space-x-2"><RadioGroupItem value={b} id={b} className="h-3.5 w-3.5" /><Label htmlFor={b} className="text-[11px]">{b}</Label></div>)}
                      </RadioGroup>
                    </FormItem>
                  )} />
                </div>
              )}

              {selectedCourse === 'PUC' && (
                <div className="space-y-3 pt-2">
                  <FormField control={form.control} name="pucStream" render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[11px] font-semibold">{t.streamLabel} *</FormLabel>
                      <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-2">
                        {['Science', 'Commerce', 'Arts'].map(s => <div key={s} className="flex items-center space-x-2"><RadioGroupItem value={s} id={s} className="h-3.5 w-3.5" /><Label htmlFor={s} className="text-[11px]">{s}</Label></div>)}
                      </RadioGroup>
                    </FormItem>
                  )} />
                  {selectedStream && (
                    <FormField control={form.control} name="combination" render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[11px] font-semibold">{t.combinationLabel} *</FormLabel>
                        <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-2">
                          {selectedStream === 'Science' && ['PCMB', 'PCMC', 'PCME', 'PCMS', 'PCMH', 'PCAG', 'Other'].map(c => <div key={c} className="flex items-center space-x-2"><RadioGroupItem value={c} id={c} className="h-3.5 w-3.5" /><Label htmlFor={c} className="text-[11px]">{c}</Label></div>)}
                          {selectedStream === 'Commerce' && ['EGBA', 'ECBA', 'ESBA', 'EBAC', 'EMBA', 'ECSA', 'Other'].map(c => <div key={c} className="flex items-center space-x-2"><RadioGroupItem value={c} id={c} className="h-3.5 w-3.5" /><Label htmlFor={c} className="text-[11px]">{c}</Label></div>)}
                          {selectedStream === 'Arts' && ['HEPS', 'HEPPsy', 'HESP', 'HEBA', 'HEGG', 'HESF', 'Other'].map(c => <div key={c} className="flex items-center space-x-2"><RadioGroupItem value={c} id={c} className="h-3.5 w-3.5" /><Label htmlFor={c} className="text-[11px]">{c}</Label></div>)}
                        </RadioGroup>
                      </FormItem>
                    )} />
                  )}
                </div>
              )}

              {(['SSLC', 'PUC', 'Diploma', 'Degree', 'Engineering'].includes(selectedCourse || '')) && (
                <div className="space-y-3">
                  <FormField control={form.control} name="percentage" render={({ field }) => (
                    <FormItem className="space-y-1.5"><FormLabel className="text-[11px] font-semibold">{t.percentageLabel} *</FormLabel><FormControl><Input className="h-8 text-[11px] bg-muted/20" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="marksObtained" render={({ field }) => (
                    <FormItem className="space-y-1.5"><FormLabel className="text-[11px] font-semibold">{t.marksObtainedLabel} *</FormLabel><FormControl><Input className="h-8 text-[11px] bg-muted/20" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="totalMarks" render={({ field }) => (
                    <FormItem className="space-y-1.5"><FormLabel className="text-[11px] font-semibold">{t.totalMarksLabel} *</FormLabel><FormControl><Input className="h-8 text-[11px] bg-muted/20" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="yearOfPassing" render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[11px] font-semibold">{t.yearPassingLabel} *</FormLabel>
                      <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-2">
                        {['2024-2025', '2023-2024'].map(y => <div key={y} className="flex items-center space-x-2"><RadioGroupItem value={y} id={y} className="h-3.5 w-3.5" /><Label htmlFor={y} className="text-[11px]">{y}</Label></div>)}
                      </RadioGroup>
                    </FormItem>
                  )} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b"><FileCheck className="w-3.5 h-3.5 text-primary" /><h2 className="text-[12px] font-bold">{t.docsTitle}</h2></div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">{t.photoLabel} <span className="text-destructive">*</span></Label>
                  <Input type="file" accept="image/jpeg,image/jpg" className="h-8 text-[11px] cursor-pointer" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">{t.marksCardLabel} <span className="text-destructive">*</span></Label>
                  <Input type="file" accept=".pdf,.doc,.docx" className="h-8 text-[11px] cursor-pointer" onChange={(e) => setMarksFile(e.target.files?.[0] || null)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex pt-1">
            <Button type="submit" className="w-full h-8 text-[11px] font-bold rounded-md shadow" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> {t.processing}</> : <><Send className="mr-2 h-3 w-3" /> {t.submitButton}</>}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
