
'use client';

import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Loader2, Send, User, GraduationCap, FileCheck, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  studentName: z.string().min(1, { message: "Name is required." }),
  relationship: z.enum(['SO', 'DO'], { required_error: "Relationship is required." }),
  fatherName: z.string().min(1, { message: "Father's name is required." }),
  motherName: z.string().min(1, { message: "Mother's name is required." }),
  course: z.enum(['SSLC', 'PUC', 'Diploma', 'Degree', 'Engineering', 'Other'], { required_error: "Course is required." }),
  board: z.string().optional(),
  pucStream: z.string().optional(),
  combination: z.string().optional(),
  percentage: z.string().optional(),
  marksObtained: z.string().optional(),
  totalMarks: z.string().optional(),
  yearOfPassing: z.string().optional(),
  cgpa: z.string().optional(),
  otherCourse: z.string().optional(),
  branch: z.string().optional(),
  scoreType: z.enum(['CGPA', 'Percentage']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function LinguaForm() {
  const [lang, setLang] = useState<'kn' | 'en'>('kn');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);
  const [totalMarksError, setTotalMarksError] = useState<string | null>(null);
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [marksFile, setMarksFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      studentName: '',
      relationship: undefined,
      fatherName: '',
      motherName: '',
      course: undefined,
      percentage: '',
      marksObtained: '',
      totalMarks: '',
      cgpa: '',
      yearOfPassing: '',
      scoreType: undefined,
      otherCourse: '',
    },
  });

  const selectedCourse = useWatch({ control: form.control, name: 'course' });
  const selectedStream = useWatch({ control: form.control, name: 'pucStream' });
  const marksObtained = useWatch({ control: form.control, name: 'marksObtained' });
  const totalMarks = useWatch({ control: form.control, name: 'totalMarks' });
  const cgpaValue = useWatch({ control: form.control, name: 'cgpa' });
  const scoreType = useWatch({ control: form.control, name: 'scoreType' });
  const percentageValue = useWatch({ control: form.control, name: 'percentage' });
  const watchedCombination = useWatch({ control: form.control, name: 'combination' });
  const watchedBranch = useWatch({ control: form.control, name: 'branch' });

  // 1. Language Switch: Full Reset (Everything cleared)
  useEffect(() => {
    form.reset({
      email: '',
      studentName: '',
      relationship: undefined,
      fatherName: '',
      motherName: '',
      course: undefined,
      board: undefined,
      pucStream: undefined,
      combination: undefined,
      percentage: '',
      marksObtained: '',
      totalMarks: '',
      cgpa: '',
      yearOfPassing: '',
      scoreType: undefined,
      otherCourse: '',
      branch: undefined,
    });
    setPhotoFile(null);
    setMarksFile(null);
    setEligibilityError(null);
    setTotalMarksError(null);
    setFileError(null);
  }, [lang, form]);

  // 2. Academic Switch (Course): Partial Reset (Only Academic fields + Documents cleared)
  useEffect(() => {
    if (selectedCourse) {
      form.setValue('board', undefined);
      form.setValue('pucStream', undefined);
      form.setValue('combination', undefined);
      form.setValue('branch', undefined);
      form.setValue('marksObtained', '');
      form.setValue('totalMarks', '');
      form.setValue('cgpa', '');
      form.setValue('percentage', '');
      form.setValue('otherCourse', '');
      form.setValue('yearOfPassing', '');
      form.setValue('scoreType', undefined);
      
      // Reset Documents section on course change
      setPhotoFile(null);
      setMarksFile(null);
    }
  }, [selectedCourse, form]);

  // 3. Academic Switch (Stream): Reset Combination + Documents
  useEffect(() => {
    if (selectedStream) {
      form.setValue('combination', undefined);
      form.setValue('otherCourse', '');
      
      // Reset Documents section on stream change
      setPhotoFile(null);
      setMarksFile(null);
    }
  }, [selectedStream, form]);

  // 4. Score Type Switch: Reset Score Fields + Documents
  useEffect(() => {
    if (scoreType) {
      form.setValue('marksObtained', '');
      form.setValue('totalMarks', '');
      form.setValue('cgpa', '');
      form.setValue('percentage', '');
      
      // Reset Documents section on score type change
      setPhotoFile(null);
      setMarksFile(null);
    }
  }, [scoreType, form]);

  // 5. Combination/Branch/Other Specification Switch: Reset Documents
  useEffect(() => {
    if (watchedCombination || watchedBranch) {
      // Reset Documents section
      setPhotoFile(null);
      setMarksFile(null);
    }
  }, [watchedCombination, watchedBranch]);

  useEffect(() => {
    setEligibilityError(null);
    setTotalMarksError(null);

    if (['SSLC', 'PUC'].includes(selectedCourse || '') || (selectedCourse === 'Other' && scoreType === 'Percentage')) {
      if (marksObtained && totalMarks) {
        const marks = parseFloat(marksObtained);
        const total = parseFloat(totalMarks);
        
        if (!isNaN(marks) && !isNaN(total) && total > 0) {
          if (selectedCourse === 'SSLC' && totalMarks !== '625') {
            const errorMsg = lang === 'en' 
              ? "Total marks for SSLC must be 625." 
              : "ಎಸ್.ಎಸ್.ಎಲ್.ಸಿ.ಗೆ ಒಟ್ಟು ಅಂಕಗಳು 625 ಆಗಿರಬೇಕು.";
            setTotalMarksError(errorMsg);
            form.setValue('percentage', '');
            return;
          }
          if (selectedCourse === 'PUC' && totalMarks !== '600') {
            const errorMsg = lang === 'en' 
              ? "Total marks for 2nd PUC must be 600." 
              : "ದ್ವಿತೀಯ ಪಿ.ಯು.ಸಿ.ಗೆ ಒಟ್ಟು ಅಂಕಗಳು 600 ಆಗಿರಬೇಕು.";
            setTotalMarksError(errorMsg);
            form.setValue('percentage', '');
            return;
          }

          if (marks > total) {
            const errorMsg = lang === 'en' ? "Marks obtained cannot exceed total marks." : "ಗಳಿಸಿದ ಅಂಕಗಳು ಒಟ್ಟು ಅಂಕಗಳಿಗಿಂತ ಹೆಚ್ಚಿರಬಾರದು.";
            setTotalMarksError(errorMsg);
            form.setValue('percentage', '');
            return;
          }

          const calculatedPercentage = (marks / total) * 100;
          const roundedPercentage = calculatedPercentage.toFixed(2);
          form.setValue('percentage', roundedPercentage);

          let minRequired = (selectedCourse === 'PUC') ? 85 : 90;
          if (calculatedPercentage < minRequired) {
            const errorMsg = lang === 'en' 
              ? `Minimum ${minRequired}% marks required for eligibility.` 
              : `ಅರ್ಹತೆಗಾಗಿ ಕನಿಷ್ಠ ${minRequired}% ಅಂಕಗಳು ಅಗತ್ಯವಿದೆ.`;
            setEligibilityError(errorMsg);
          }
        }
      }
    } else if (['Diploma', 'Degree', 'Engineering'].includes(selectedCourse || '')) {
      if (scoreType === 'CGPA' && cgpaValue) {
        const cgpa = parseFloat(cgpaValue);
        if (!isNaN(cgpa)) {
          if (cgpa < 9.0 || cgpa > 10.0) {
            const errorMsg = lang === 'en' 
              ? "CGPA must be between 9.0 and 10.0." 
              : "ಸಿಜಿಪಿಎ 9.0 ರಿಂದ 10.0 ರ ನಡುವೆ ಇರಬೇಕು.";
            setEligibilityError(errorMsg);
          }
        }
      } else if (scoreType === 'Percentage' && percentageValue) {
        const p = parseFloat(percentageValue);
        if (!isNaN(p)) {
          if (p < 90.0 || p > 100.0) {
            const errorMsg = lang === 'en' 
              ? "Percentage must be between 90% and 100%." 
              : "ಶೇಕಡಾ 90% ರಿಂದ 100% ರ ನಡುವೆ ಇರಬೇಕು.";
            setEligibilityError(errorMsg);
          }
        }
      }
    } else if (selectedCourse === 'Other' && scoreType === 'CGPA' && cgpaValue) {
      const cgpa = parseFloat(cgpaValue);
      if (!isNaN(cgpa)) {
        if (cgpa < 9.0 || cgpa > 10.0) {
          const errorMsg = lang === 'en' 
            ? "CGPA must be between 9.0 and 10.0." 
            : "ಸಿಜಿಪಿಎ 9.0 ರಿಂದ 10.0 ರ ನಡುವೆ ಇರಬೇಕು.";
          setEligibilityError(errorMsg);
        }
      }
    }
  }, [marksObtained, totalMarks, cgpaValue, percentageValue, selectedCourse, lang, form, scoreType]);

  const translations = {
    en: {
      trustName: "Sri Jalavasudeva Srivaishnava Seva Trust (R), Kulaganam",
      headerBold: "Pratibha Puraskar 2025-2026:",
      headerDesc: "Temple-level award for students who have scored more than 85% in the P.U.C. examinations held in March and April of the years 2025 and 2026, and for those who have secured a rank or more than 90% marks in S.S.L.C. / Degree / Job-oriented education.",
      langLabel: "Choose Language / ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ",
      personalDetailsHeader: "Personal Details",
      academicDetailsHeader: "Academic Details",
      emailLabel: "Email",
      studentNameLabel: "Student Name",
      relationshipLabel: "S/O or D/O",
      fatherNameLabel: "Father Name",
      motherNameLabel: "Mother Name",
      courseLabel: "Course",
      boardLabel: "Board",
      streamLabel: "Stream",
      combinationLabel: "Combination",
      scienceCombination: "2nd PUC Science Combination",
      commerceCombination: "2nd PUC Commerce Combination",
      artsCombination: "2nd PUC Arts Combination",
      branchLabel: "Branch",
      scoreTypeLabel: "Select Score Type",
      percentageLabel: "Percentage (%)",
      marksObtainedLabel: "Marks Obtained",
      totalMarksLabel: "Total Marks",
      yearPassingLabel: "Year of Passing",
      cgpaLabel: "CGPA",
      otherCourseLabel: "Please specify other course",
      docsTitle: "Documents",
      photoLabel: "Photo (JPG/JPEG, max 10MB)",
      marksCardLabel: "Marks Card (PDF only, max 10MB)",
      submitButton: "Submit",
      processing: "Processing...",
      successTitle: "Your application for the Pratibha Puraskar 2025-2026 has been received. Thank you.",
      successMessage: "The award distribution will take place on 23/04/2026. All receiving students, along with their families, are requested to compulsorily attend the Lord's service.",
      requiredNote: "* Indicates required question",
      boards: ['State', 'CBSE', 'ICSE'],
      scienceCombinations: [
        'PCMB (Physics, Chemistry, Mathematics, Biology)',
        'PCMC (Physics, Chemistry, Mathematics, Computer Science)',
        'PCME (Physics, Chemistry, Mathematics, Electronics)',
        'PCMS (Physics, Chemistry, Mathematics, Statistics)',
        'PCMH (Physics, Chemistry, Mathematics, Home Science)',
        'PCAG (Physics, Chemistry, Agriculture, Mathematics/Biology)',
        'Other'
      ],
      commerceCombinations: [
        'EGBA (Economics, Geography, Business Studies, Accountancy)',
        'ECBA (Economics, Commerce, Business Studies, Accountancy)',
        'ESBA (Economics, Sociology, Business Studies, Accountancy)',
        'EBAC (Economics, Business Studies, Accountancy, Computer Science)',
        'EMBA (Economics, Mathematics, Business Studies, Accountancy)',
        'ECSA (Economics, Computer Science, Statistics, Accountancy)',
        'Other'
      ],
      artsCombinations: [
        'HEPS (History, Economics, Political Science, Sociology)',
        'HEPPsy (History, Economics, Political Science, Psychology)',
        'HESP (History, Economics, Sociology, Psychology)',
        'HEBA (History, Economics, Business, Accountancy)',
        'HEGG (History, Economics, Geography, Geology)',
        'HESF (History, Economics, Sociology, Fine Arts)',
        'Other'
      ],
      engineeringCourses: [
        'CSE (Computer Science and Engineering)',
        'AIML (Artificial Intelligence and Machine Learning)',
        'ISE (Information Science and Engineering)',
        'ECE (Electronics and Communication Engineering)',
        'EEE (Electrical and Electronics Engineering)',
        'Mechanical (Mechanical Engineering)',
        'Civil (Civil Engineering)',
        'IP (Industrial Production Engineering)',
        'EIE (Electronics and Instrumentation Engineering)',
        'ECS (Electronics and Computer Science Engineering)',
        'ECE (Electronics and Computer Engineering)',
        'CSBS (Computer Science and Business Systems)',
        'Mechatronics (Mechatronics Engineering)',
        'Automobile (Automobile Engineering)',
        'Aerospace (Aerospace Engineering)',
        'Chemical (Chemical Engineering)',
        'Biotechnology (Biotechnology Engineering)',
        'Data Science (Data Science and Engineering)',
        'AI & Data Science (Artificial Intelligence and Data Science Engineering)',
        'Robotics & Automation (Robotics and Automation Engineering)',
        'Other'
      ],
      diplomaCourses: [
        'Diploma in Computer Science & Engineering (CSE)',
        'Diploma in Electronics & Communication Engineering (ECE)',
        'Diploma in Electrical & Electronics Engineering (EEE)',
        'Diploma in Mechanical Engineering',
        'Diploma in Civil Engineering',
        'Diploma in Automobile Engineering',
        'Other'
      ],
      degreeCourses: [
        'D.Pharma (Diploma in Pharmacy)',
        'B.Pharma (Bachelor of Pharmacy)',
        'B.Sc (Bachelor of Science)',
        'B.Com (Bachelor of Commerce)',
        'B.A (Bachelor of Arts)',
        'BCA (Bachelor of Computer Applications)',
        'BBA (Bachelor of Business Administration)',
        'BSW (Bachelor of Social Work)',
        'B.Sc Nursing (Bachelor of Science in Nursing)',
        'Other'
      ]
    },
    kn: {
      trustName: "ಶ್ರೀ ಜಲವಾಸುದೇವ ಶ್ರೀವೈಷ್ಣವ ಸೇವಾ ಟ್ರಸ್ಟ್(ರಿ),ಕುಲಗಣಂ",
      headerBold: "ಪತಿಭಾ ಪುರಸ್ಕಾರ 2025-2026:",
      headerDesc: "2025 ಮತ್ತು 2026ರ ಸಾಲಿನ ಮಾರ್ಚಿ ಮತ್ತು ಏಪ್ರಿಲ್ ನಲ್ಲಿ ನಡೆದ ಪಿ.ಯು.ಸಿ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಶೇ.85 ಕ್ಕಿಂತ ಹಾಗೂ ಎಸ್.ಎಸ್.ಎಲ್.ಸಿ/ಪದವಿ/ಉದ್ಯೋಗಾಧಾರಿತ ಶಿಕ್ಷಣದಲ್ಲಿ ರ‍್ಯಾಂಕ್‌ ಅಥವಾ ಶೇ.90 ಕ್ಕಿಂತ ಹೆಚ್ಚು ಅಂಕ ಪಡೆದ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ದೇವಾಲಯದ ಮಟ್ಟದಲ್ಲಿ ಪುರಸ್ಕಾರ",
      langLabel: "Choose Language / ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ",
      personalDetailsHeader: "ವೈಯಕ್ತಿಕ ವಿವರಗಳು",
      academicDetailsHeader: "ಶೈಕ್ಷಣಿಕ ವಿವರಗಳು",
      emailLabel: "ಇಮೇಲ್",
      studentNameLabel: "ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರು",
      relationshipLabel: "S/O ಅಥವಾ D/O",
      fatherNameLabel: "ತಂದೆಯ ಹೆಸರು",
      motherNameLabel: "ತಾಯಿಯ ಹೆಸರು",
      courseLabel: "ಕೋರ್ಸ್",
      boardLabel: "ಮಂಡಳಿ",
      streamLabel: "ವಿಭಾಗ",
      combinationLabel: "ವಿಭಾಗ",
      scienceCombination: "ವಿಜ್ಞಾನ ವಿಭಾಗ",
      commerceCombination: "ವಾಣಿಜ್ಯ ವಿಭಾಗ",
      artsCombination: "ಕಲೆ ವಿಭಾಗ",
      branchLabel: "ವಿಭಾಗ",
      scoreTypeLabel: "ಅಂಕಗಳ ಪ್ರಕಾರವನ್ನು ಆರಿಸಿ",
      percentageLabel: "ಶೇಕಡಾ (%)",
      marksObtainedLabel: "ಗಳಿಸಿದ ಅಂಕಗಳು",
      totalMarksLabel: "ಒಟ್ಟು ಅಂಕಗಳು",
      yearPassingLabel: "ಉತ್ತೀರ್ಣರಾದ ವರ್ಷ",
      cgpaLabel: "ಸಿಜಿಪಿಎ (CGPA)",
      otherCourseLabel: "ಇತರೆ ಕೋರ್ಸ್ ವಿವರ",
      docsTitle: "ದಾಖಲೆಗಳು",
      photoLabel: "ಫೋಟೋ (JPG/JPEG, ಗರಿಷ್ಠ 10MB)",
      marksCardLabel: "ಅಂಕಪಟ್ಟಿ (PDF ಮಾತ್ರ, ಗರಿಷ್ಠ 10MB)",
      submitButton: "ಸಲ್ಲಿಸಿ",
      processing: "ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ...",
      successTitle: "ಪ್ರತಿಭಾ ಪುರಸ್ಕಾರ 2025-2026 ಕ್ಕಾಗಿ ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು ಸ್ವೀಕರಿಸಲಾಗಿದೆ. ಧನ್ಯವಾದಗಳು.",
      successMessage: "ದಿನಾಂಕ:23/04/2026 ರಂದು ಎಲ್ಲಾ ಮಕ್ಕಳಿಗೂ ಪುರಸ್ಕರಿಸಲಾಗುವುದು. ಹಾಗಾಗಿ ಸಂಬಂಧಪಟ್ಟ ಮಕ್ಕಳು ಹಾಗೂ ಕುಟುಂಬ ಕಡ್ಡಾಯವಾಗಿ ಭಗವಂತನ ಕೈಂಕರ್ಯಕ್ಕೆ ಹಾಜರಾಗುವುದು.",
      requiredNote: "* ಕಡ್ಡಾಯ ಪ್ರಶ್ನೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ",
      boards: ['ರಾಜ್ಯ (State)', 'ಸಿಬಿಎಸ್ ಇ (CBSE)', 'ಐಸಿಎಸ್ ಇ (ICSE)'],
      scienceCombinations: [
        'PCMB (ಭೌತಶಾಸ್ತ್ರ, ರಸಾಯನಶಾಸ್ತ್ರ, ಗಣಿತ, ಜೀವಶಾಸ್ತ್ರ)',
        'PCMC (ಭೌತಶಾಸ್ತ್ರ, ರಸಾಯನಶಾಸ್ತ್ರ, ಗಣಿತ, ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್)',
        'PCME (ಭೌತಶಾಸ್ತ್ರ, ರಸಾಯನಶಾಸ್ತ್ರ, ಗಣಿತ, ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್)',
        'PCMS (ಭೌತಶಾಸ್ತ್ರ, ರಸಾಯನಶಾಸ್ತ್ರ, ಗಣಿತ, ಸಂಖ್ಯಾಶಾಸ್ತ್ರ)',
        'PCMH (ಭೌತಶಾಸ್ತ್ರ, ರಸಾಯನಶಾಸ್ತ್ರ, ಗಣಿತ, ಗೃಹ ವಿಜ್ಞಾನ)',
        'PCAG (ಭೌತಶಾಸ್ತ್ರ, ರಸಾಯನಶಾಸ್ತ್ರ, ಕೃಷಿ ವಿಜ್ಞಾನ, ಗಣಿತ ಅಥವಾ ಜೀವಶಾಸ್ತ್ರ)',
        'ಇತರೆ'
      ],
      commerceCombinations: [
        'ECBA (ಅರ್ಥಶಾಸ್ತ್ರ, ವಾಣಿಜ್ಯ, ವ್ಯವಹಾರ ಅಧ್ಯಯನಗಳು, ಲೆಕ್ಕಶಾಸ್ತ್ರ)',
        'EBAC (ಅರ್ಥಶಾಸ್ತ್ರ, ವ್ಯವಹಾರ ಅಧ್ಯಯನಗಳು, ಲೆಕ್ಕಶಾಸ್ತ್ರ, ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್)',
        'ESBA (ಅರ್ಥಶಾಸ್ತ್ರ, ಸಮಾಜಶಾಸ್ತ್ರ, ವ್ಯವಹಾರ ಅಧ್ಯಯನಗಳು, ಲೆಕ್ಕಶಾಸ್ತ್ರ)',
        'EGBA (ಅರ್ಥಶಾಸ್ತ್ರ, ಭೂಗೋಳಶಾಸ್ತ್ರ, ವ್ಯವಹಾರ ಅಧ್ಯಯನಗಳು, ಲೆಕ್ಕಶಾಸ್ತ್ರ)',
        'EMBA (ಅರ್ಥಶಾಸ್ತ್ರ, ಗಣಿತ, ವ್ಯವಹಾರ ಅಧ್ಯಯನಗಳು, ಲೆಕ್ಕಶಾಸ್ತ್ರ)',
        'ECSA (ಅರ್ಥಶಾಸ್ತ್ರ, ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್, ಸಂಖ್ಯಾಶಾಸ್ತ್ರ, ಲೆಕ್ಕಶಾಸ್ತ್ರ)',
        'ಇತರೆ'
      ],
      artsCombinations: [
        'HEPS (ಇತಿಹಾಸ, ಅರ್ಥಶಾಸ್ತ್ರ, ರಾಜಕೀಯ ವಿಜ್ಞಾನ, ಸಮಾಜಶಾಸ್ತ್ರ)',
        'HEPPsy (ಇತಿಹಾಸ, ಅರ್ಥಶಾಸ್ತ್ರ, ರಾಜಕೀಯ ವಿಜ್ಞಾನ, ಮನೋವಿಜ್ಞಾನ)',
        'HESP (ಇತಿಹಾಸ, ಅರ್ಥಶಾಸ್ತ್ರ, ಸಮಾಜಶಾಸ್ತ್ರ, ಮನೋವಿಜ್ಞಾನ)',
        'HEBA (ಇತಿಹಾಸ, ಅರ್ಥಶಾಸ್ತ್ರ, ವ್ಯವಹಾರ ಅಧ್ಯಯನಗಳು, ಲೆಕ್ಕಶಾಸ್ತ್ರ)',
        'HEGG (ಇತಿಹಾಸ, ಅರ್ಥಶಾಸ್ತ್ರ, ಭೂಗೋಳಶಾಸ್ತ್ರ, ಭೂಗರ್ಭಶಾಸ್ತ್ರ)',
        'HESF (ಇತಿಹಾಸ, ಅರ್ಥಶಾಸ್ತ್ರ, ಸಮಾಜಶಾಸ್ತ್ರ, ಲಲಿತಕಲೆಗಳು)',
        'ಇತರೆ'
      ],
      engineeringCourses: [
        'CSE (ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್ ಮತ್ತು ಇಂಜಿನಿಯರಿಂಗ್)',
        'AIML (ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಮತ್ತು ಯಂತ್ರ ಕಲಿಕೆ)',
        'ISE (ಮಾಹಿತಿ ವಿಜ್ಞಾನ ಮತ್ತು ಇಂಜಿನಿಯರಿಂಗ್)',
        'ECE (ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಮತ್ತು ಸಂವಹನ ಇಂಜಿನಿಯರಿಂಗ್)',
        'EEE (ವಿದ್ಯುತ್ ಮತ್ತು ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'Mechanical (ಮೆಕ್ಯಾನಿಕಲ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'Civil (ಸಿವಿಲ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'IP (ಕೈಗಾರಿಕಾ ಉತ್ಪಾದನಾ ಇಂಜಿನಿಯರಿಂಗ್)',
        'EIE (ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಮತ್ತು ಇನ್ಸ್ಟ್ರುಮೆಂಟೇಶನ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'ECS (ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಮತ್ತು ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'ECE (ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಮತ್ತು ಕಂಪ್ಯೂಟರ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'CSBS (ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್ ಮತ್ತು ವ್ಯವಹಾರ ವ್ಯವಸ್ಥೆಗಳು)',
        'Mechatronics (ಮೆಕಾಟ್ರಾನಿಕ್ಸ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'Automobile (ಆಟೋಮೊಬೈಲ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'Aerospace (ಏರೋಸ್ಪೇಸ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'Chemical (ರಾಸಾಯನಿಕ ಇಂಜಿನಿಯರಿಂಗ್)',
        'Biotechnology (ಜೈವಿಕ ತಂತ್ರಜ್ಞಾನ ಇಂಜಿನಿಯರಿಂಗ್)',
        'Data Science (ದತ್ತಾಂಶ ವಿಜ್ಞಾನ ಮತ್ತು ಇಂಜಿನಿಯರಿಂಗ್)',
        'AI & Data Science (ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಮತ್ತು ದತ್ತಾಂಶ ವಿಜ್ಞಾನ ಇಂಜಿನಿಯರಿಂಗ್)',
        'Robotics & Automation (ರೋಬೋಟಿಕ್ಸ್ ಮತ್ತು ಆಟೊಮೇಷನ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'ಇತರೆ'
      ],
      diplomaCourses: [
        'ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್ ಮತ್ತು ಇಂಜಿನಿಯರಿಂಗ್ ಡಿಪ್ಲೊಮಾ',
        'ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಮತ್ತು ಕಮ್ಯುನಿಕೇಷನ್ ಇಂಜಿನಿಯರಿಂಗ್ ಡಿಪ್ಲೊಮಾ',
        'ಎಲೆಕ್ಟ್ರಿಕಲ್ ಮತ್ತು ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಇಂಜಿನಿಯರಿಂಗ್ ಡಿಪ್ಲೊಮಾ',
        'ಮೆಕ್ಯಾನಿಕಲ್ ಇಂಜಿನಿಯರಿಂಗ್ ಡಿಪ್ಲೊಮಾ',
        'ಸಿವಿಲ್ ಇಂಜಿನಿಯರಿಂಗ್ ಡಿಪ್ಲೊಮಾ',
        'ಆಟೋಮೊಬೈಲ್ ಇಂಜಿನಿಯರಿಂಗ್ ಡಿಪ್ಲೊಮಾ',
        'ಇತರೆ'
      ],
      degreeCourses: [
        'ಡಿ.ಫಾರ್ಮ (ಡಿಪ್ಲೊಮಾ ಇನ್ ಫಾರ್ಮಸಿ)',
        'ಬಿ.ಫಾರ್ಮ (ಬ್ಯಾಚುಲರ್ ಆಫ್ ಫಾರ್ಮಸಿ)',
        'ಬಿ.ಎಸ್ಸಿ (ಬ್ಯಾಚುಲರ್ ಆಫ್ ಸೈನ್ಸ್)',
        'ಬಿ.ಕಾಂ (ಬ್ಯಾಚುಲರ್ ಆಫ್ ಕಾಮರ್ಸ್)',
        'ಬಿ.ಎ (ಬ್ಯಾಚುಲರ್ ಆಫ್ ಆರ್ಟ್ಸ್)',
        'ಬಿ.ಸಿ.ಎ (ಬ್ಯಾಚುಲರ್ ಆಫ್ ಕಂಪ್ಯೂಟರ್ ಅಪ್ಲಿಕೇಶನ್ಸ್)',
        'ಬಿ.ಬಿ.ಎ (ಬ್ಯಾಚುಲರ್ ಆಫ್ ಬಿಸಿನೆಸ್ ಅಡ್ಮಿನಿಸ್ಟ್ರೇಷನ್)',
        'ಬಿ.ಎಸ್.ಡಬ್ಲ್ಯೂ (ಬ್ಯಾಚುಲರ್ ಆಫ್ ಸೋಷಿಯಲ್ ವರ್ಕ್)',
        'ಬಿ.ಎಸ್ಸಿ ನರ್ಸಿಂಗ್ (ಬ್ಯಾಚುಲರ್ ಆಫ್ ಸೈನ್ಸ್ ಇನ್ ನರ್ಸಿಂಗ್)',
        'ಇತರೆ'
      ]
    }
  };

  const t = translations[lang];

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFileError(lang === 'en' ? "Please upload an image file for the photo." : "ದಯವಿಟ್ಟು ಫೋಟೋಗಾಗಿ ಚಿತ್ರದ ಫೈಲ್ ಅನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.");
        setPhotoFile(null);
        e.target.value = '';
      } else {
        setFileError(null);
        setPhotoFile(file);
      }
    }
  };

  const handleMarksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setFileError(lang === 'en' ? "Please upload a PDF file for the marks card." : "ದಯವಿಟ್ಟು ಅಂಕಪಟ್ಟಿಗಾಗಿ PDF ಫೈಲ್ ಅನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.");
        setMarksFile(null);
        e.target.value = '';
      } else {
        setFileError(null);
        setMarksFile(file);
      }
    }
  };

  async function onSubmit(values: FormValues) {
    if (eligibilityError || totalMarksError || fileError) return;
    if (!photoFile || !marksFile) return;

    setIsSubmitting(true);
    try {
      let photoBase64 = await fileToBase64(photoFile);
      let marksCardBase64 = await fileToBase64(marksFile);

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

  const canSubmit = () => {
    const v = form.getValues();
    const basicFields = v.studentName && v.email && v.relationship && v.fatherName && v.motherName && v.course && v.yearOfPassing;
    if (!basicFields) return false;
    
    if (v.course === 'SSLC' && (!v.board || !v.marksObtained || !v.totalMarks)) return false;
    if (v.course === 'PUC') {
      if (!v.pucStream || !v.combination || !v.marksObtained || !v.totalMarks) return false;
      if ((v.combination === 'Other' || v.combination === 'ಇತರೆ') && !v.otherCourse) return false;
    }
    if (['Diploma', 'Degree', 'Engineering'].includes(v.course)) {
        if (!v.branch || !v.scoreType) return false;
        if ((v.branch === 'Other' || v.branch === 'ಇತರೆ') && !v.otherCourse) return false;
        if (v.scoreType === 'CGPA' && !v.cgpa) return false;
        if (v.scoreType === 'Percentage' && !v.percentage) return false;
    }
    if (v.course === 'Other') {
        if (!v.otherCourse || !v.scoreType) return false;
        if (v.scoreType === 'CGPA' && !v.cgpa) return false;
        if (v.scoreType === 'Percentage' && (!v.marksObtained || !v.totalMarks)) return false;
    }
    if (!photoFile || !marksFile) return false;
    return true;
  };

  if (result?.success) {
    return (
      <div className="w-full max-w-xl mx-auto py-10 space-y-4">
        <Card className="shadow-sm border-none">
          <CardContent className="p-6 text-center space-y-6">
            <div className="flex justify-center"><Loader2 className="w-12 h-12 text-primary animate-pulse" /></div>
            <h2 className="text-[16px] font-bold text-[#202124] leading-tight">
              {t.successTitle}
            </h2>
            <p className="text-[14px] text-[#202124] font-bold leading-relaxed">
              {t.successMessage}
            </p>
            <Button onClick={() => window.location.reload()} className="h-10 px-8 text-[14px] font-bold">Done</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-2 w-full max-w-xl mx-auto pb-5 cursor-default relative">
      <Card className="shadow-sm border-none">
        <CardContent className="p-4 space-y-0 text-left">
          <p className="text-[18px] font-bold text-[#202124] text-center mb-2">{t.trustName}</p>
          <p className="text-[16px] font-bold text-[#202124] text-center">{t.headerBold}</p>
          <p className="text-[14px] text-[#202124] text-center">{t.headerDesc}</p>
          <div className="pt-2 font-bold italic text-destructive text-[14px]">{t.requiredNote}</div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-none">
        <CardContent className="p-4">
          <div className="space-y-2">
            <Label className="font-bold text-[#202124] text-[16px]">{t.langLabel} <span className="text-destructive">*</span></Label>
            <RadioGroup value={lang} onValueChange={(v) => setLang(v as 'en' | 'kn')} className="flex flex-col gap-1.5">
              <div className="flex items-center space-x-2.5 py-0.5">
                <RadioGroupItem value="kn" id="lang-kn-radio" className="h-4 w-4 cursor-pointer" />
                <Label htmlFor="lang-kn-radio" className="font-normal text-[14px] cursor-pointer">ಕನ್ನಡ</Label>
              </div>
              <div className="flex items-center space-x-2.5 py-0.5">
                <RadioGroupItem value="en" id="lang-en-radio" className="h-4 w-4 cursor-pointer" />
                <Label htmlFor="lang-en-radio" className="font-normal text-[14px] cursor-pointer">English</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Form {...form} key={lang}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <Card className="shadow-sm border-none">
            <CardContent className="p-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="font-bold text-[16px]">{t.emailLabel} <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="example@email.com" className="h-10 bg-muted/20 text-[14px]" {...field} /></FormControl>
                  <FormMessage className="text-[14px]" />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b"><User className="w-4 h-4 text-primary" /><h2 className="font-bold text-[16px]">{t.personalDetailsHeader}</h2></div>
              <FormField control={form.control} name="studentName" render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="font-bold text-[16px]">{t.studentNameLabel} <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input className="h-10 bg-muted/20 text-[14px]" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="relationship" render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="font-bold text-[16px]">{t.relationshipLabel} <span className="text-destructive">*</span></FormLabel>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-1.5">
                    <div className="flex items-center space-x-1.5"><RadioGroupItem value="SO" id="rel-so-p" className="h-4 w-4 cursor-pointer" /><Label htmlFor="rel-so-p" className="text-[14px] font-normal cursor-pointer">{lang === 'en' ? 'S/O (Son of)' : 'S/O (ಮಗ)'}</Label></div>
                    <div className="flex items-center space-x-1.5"><RadioGroupItem value="DO" id="rel-do-p" className="h-4 w-4 cursor-pointer" /><Label htmlFor="rel-do-p" className="text-[14px] font-normal cursor-pointer">{lang === 'en' ? 'D/O (Daughter of)' : 'D/O (ಮಗಳು)'}</Label></div>
                  </RadioGroup>
                </FormItem>
              )} />
              <FormField control={form.control} name="fatherName" render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="font-bold text-[16px]">{t.fatherNameLabel} <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input className="h-10 bg-muted/20 text-[14px]" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="motherName" render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="font-bold text-[16px]">{t.motherNameLabel} <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input className="h-10 bg-muted/20 text-[14px]" {...field} /></FormControl>
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b"><GraduationCap className="w-4 h-4 text-primary" /><h2 className="font-bold text-[16px]">{t.academicDetailsHeader}</h2></div>
              <FormField control={form.control} name="course" render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="font-bold text-[16px]">{t.courseLabel} <span className="text-destructive">*</span></FormLabel>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-1.5">
                    {['SSLC', 'PUC', 'Diploma', 'Degree', 'Engineering', 'Other'].map((c) => (
                      <div key={c} className="flex items-center space-x-1.5">
                        <RadioGroupItem value={c} id={`main-course-${c}-${lang}-opt`} className="h-4 w-4 cursor-pointer" />
                        <Label htmlFor={`main-course-${c}-${lang}-opt`} className="text-[14px] font-normal cursor-pointer">
                          {c === 'PUC' ? (lang === 'en' ? '2nd PUC' : 'ದ್ವಿತೀಯ ಪಿ.ಯು.ಸಿ') : 
                           c === 'SSLC' ? (lang === 'en' ? 'SSLC / 10th' : 'ಎಸ್.ಎಸ್.ಎಲ್.ಸಿ. / 10 ನೇ ತರಗತಿ') : 
                           c === 'Diploma' ? (lang === 'en' ? 'Diploma' : 'ಡಿಪ್ಲೊಮಾ') :
                           c === 'Degree' ? (lang === 'en' ? 'Degree' : 'ಪದವಿ') :
                           c === 'Engineering' ? (lang === 'en' ? 'Engineering' : 'ಇಂಜಿನಿಯರಿಂಗ್') : 
                           (lang === 'en' ? 'Other' : 'ಇತರೆ')}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormItem>
              )} />

              {selectedCourse === 'SSLC' && (
                <FormField control={form.control} name="board" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[16px] font-bold">{t.boardLabel} <span className="text-destructive">*</span></FormLabel>
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-1.5">
                      {t.boards.map(b => <div key={b} className="flex items-center space-x-1.5"><RadioGroupItem value={b} id={`board-${b}-${lang}-opt`} className="h-4 w-4 cursor-pointer" /><Label htmlFor={`board-${b}-${lang}-opt`} className="text-[14px] font-normal cursor-pointer">{b}</Label></div>)}
                    </RadioGroup>
                  </FormItem>
                )} />
              )}

              {selectedCourse === 'PUC' && (
                <div className="space-y-3 pt-1">
                  <FormField control={form.control} name="pucStream" render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[16px] font-bold">{t.streamLabel} <span className="text-destructive">*</span></FormLabel>
                      <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-1.5">
                        {['Science', 'Commerce', 'Arts'].map(s => (
                          <div key={s} className="flex items-center space-x-1.5">
                            <RadioGroupItem value={s} id={`stream-${s}-${lang}-opt`} className="h-4 w-4 cursor-pointer" />
                            <Label htmlFor={`stream-${s}-${lang}-opt`} className="text-[14px] font-normal cursor-pointer">{lang === 'en' ? s : (s === 'Science' ? 'ವಿಜ್ಞಾನ' : s === 'Commerce' ? 'ವಾಣಿಜ್ಯ' : 'ಕಲೆ')}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormItem>
                  )} />
                  {selectedStream && (
                    <FormField control={form.control} name="combination" render={({ field }) => {
                      const options = selectedStream === 'Science' ? t.scienceCombinations : selectedStream === 'Commerce' ? t.commerceCombinations : t.artsCombinations;
                      const label = lang === 'en' 
                        ? (selectedStream === 'Science' ? t.scienceCombination : selectedStream === 'Commerce' ? t.commerceCombination : t.artsCombination)
                        : (selectedStream === 'Science' ? 'ವಿಜ್ಞಾನ ವಿಭಾಗ' : selectedStream === 'Commerce' ? 'ವಾಣಿಜ್ಯ ವಿಭಾಗ' : 'ಕಲೆ ವಿಭಾಗ');
                      return (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[16px] font-bold">{label} <span className="text-destructive">*</span></FormLabel>
                          <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-1.5">
                            {options.map((c, idx) => <div key={idx} className="flex items-center space-x-1.5"><RadioGroupItem value={c} id={`comb-${idx}-${selectedStream}-${lang}-opt`} className="h-4 w-4 cursor-pointer" /><Label htmlFor={`comb-${idx}-${selectedStream}-${lang}-opt`} className="text-[14px] cursor-pointer">{c}</Label></div>)}
                          </RadioGroup>
                        </FormItem>
                      );
                    }} />
                  )}
                  { (watchedCombination === 'Other' || watchedCombination === 'ಇತರೆ') && (
                    <FormField control={form.control} name="otherCourse" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[16px] font-bold">{t.otherCourseLabel} <span className="text-destructive">*</span></FormLabel>
                        <FormControl><Input className="h-10 bg-muted/20 text-[14px]" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  )}
                </div>
              )}

              {['Diploma', 'Degree', 'Engineering'].includes(selectedCourse || '') && (
                <div className="space-y-3">
                  <FormField control={form.control} name="branch" render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[16px] font-bold">{t.branchLabel} <span className="text-destructive">*</span></FormLabel>
                      <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-1.5">
                        {(selectedCourse === 'Engineering' ? t.engineeringCourses : selectedCourse === 'Diploma' ? t.diplomaCourses : selectedCourse === 'Degree' ? t.degreeCourses : []).map((c, idx) => (
                          <div key={idx} className="flex items-center space-x-1.5"><RadioGroupItem value={c} id={`branch-${idx}-${selectedCourse}-${lang}-opt`} className="h-4 w-4 cursor-pointer" /><Label htmlFor={`branch-${idx}-${selectedCourse}-${lang}-opt`} className="text-[14px] cursor-pointer">{c}</Label></div>
                        ))}
                      </RadioGroup>
                    </FormItem>
                  )} />

                  { (watchedBranch === 'Other' || watchedBranch === 'ಇತರೆ') && (
                    <FormField control={form.control} name="otherCourse" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[16px] font-bold">{t.otherCourseLabel} <span className="text-destructive">*</span></FormLabel>
                        <FormControl><Input className="h-10 bg-muted/20 text-[14px]" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  )}

                  <FormField control={form.control} name="scoreType" render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[16px] font-bold">{t.scoreTypeLabel} <span className="text-destructive">*</span></FormLabel>
                      <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-row gap-4">
                        <div className="flex items-center space-x-1.5"><RadioGroupItem value="CGPA" id={`score-cgpa-${lang}-opt`} className="cursor-pointer" /><Label htmlFor={`score-cgpa-${lang}-opt`} className="text-[14px] cursor-pointer">{t.cgpaLabel}</Label></div>
                        <div className="flex items-center space-x-1.5"><RadioGroupItem value="Percentage" id={`score-pct-${lang}-opt`} className="cursor-pointer" /><Label htmlFor={`score-pct-${lang}-opt`} className="text-[14px] cursor-pointer">{t.percentageLabel}</Label></div>
                      </RadioGroup>
                    </FormItem>
                  )} />

                  {scoreType === 'CGPA' && (
                    <FormField control={form.control} name="cgpa" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[16px] font-bold">{t.cgpaLabel} <span className="text-destructive">*</span></FormLabel>
                        <FormControl><Input type="number" step="0.01" className="h-10 bg-muted/20 text-[14px]" {...field} /></FormControl>
                        {eligibilityError && (
                          <Alert variant="destructive" className="py-1 px-2 mt-1 flex items-center gap-2 border-destructive/20 bg-destructive/5">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <AlertDescription className="leading-tight font-medium text-[14px]">{eligibilityError}</AlertDescription>
                          </Alert>
                        )}
                      </FormItem>
                    )} />
                  )}

                  {scoreType === 'Percentage' && (
                    <FormField control={form.control} name="percentage" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[16px] font-bold">{t.percentageLabel} <span className="text-destructive">*</span></FormLabel>
                        <FormControl><Input type="number" step="0.01" className="h-10 bg-muted/20 text-[14px]" {...field} /></FormControl>
                        {eligibilityError && (
                          <Alert variant="destructive" className="py-1 px-2 mt-1 flex items-center gap-2 border-destructive/20 bg-destructive/5">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <AlertDescription className="leading-tight font-medium text-[14px]">{eligibilityError}</AlertDescription>
                          </Alert>
                        )}
                      </FormItem>
                    )} />
                  )}
                </div>
              )}

              {selectedCourse === 'Other' && (
                <div className="space-y-3">
                  <FormField control={form.control} name="otherCourse" render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[16px] font-bold">{t.otherCourseLabel} <span className="text-destructive">*</span></FormLabel>
                      <FormControl><Input className="h-10 bg-muted/20 text-[14px]" {...field} /></FormControl>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="scoreType" render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[16px] font-bold">{t.scoreTypeLabel} <span className="text-destructive">*</span></FormLabel>
                      <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-row gap-4">
                        <div className="flex items-center space-x-1.5"><RadioGroupItem value="CGPA" id={`other-score-cgpa-${lang}-opt`} className="cursor-pointer" /><Label htmlFor={`other-score-cgpa-${lang}-opt`} className="text-[14px] cursor-pointer">{t.cgpaLabel}</Label></div>
                        <div className="flex items-center space-x-1.5"><RadioGroupItem value="Percentage" id={`other-score-pct-${lang}-opt`} className="cursor-pointer" /><Label htmlFor={`other-score-pct-${lang}-opt`} className="text-[14px] cursor-pointer">{lang === 'en' ? 'Marks' : 'ಅಂಕಗಳು'}</Label></div>
                      </RadioGroup>
                    </FormItem>
                  )} />

                  {scoreType === 'CGPA' && (
                    <FormField control={form.control} name="cgpa" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[16px] font-bold">{t.cgpaLabel} <span className="text-destructive">*</span></FormLabel>
                        <FormControl><Input type="number" step="0.01" className="h-10 bg-muted/20 text-[14px]" {...field} /></FormControl>
                        {eligibilityError && (
                          <Alert variant="destructive" className="py-1 px-2 mt-1 flex items-center gap-2 border-destructive/20 bg-destructive/5">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <AlertDescription className="leading-tight font-medium text-[14px]">{eligibilityError}</AlertDescription>
                          </Alert>
                        )}
                      </FormItem>
                    )} />
                  )}
                </div>
              )}

              {selectedCourse && (
                <div className="space-y-3 pt-1">
                  {((['SSLC', 'PUC'].includes(selectedCourse)) || (selectedCourse === 'Other' && scoreType === 'Percentage')) && (
                    <>
                      <FormField control={form.control} name="marksObtained" render={({ field }) => (
                        <FormItem className="space-y-1"><FormLabel className="text-[16px] font-bold">{t.marksObtainedLabel} <span className="text-destructive">*</span></FormLabel><FormControl><Input type="number" className="h-10 bg-muted/20 text-[14px]" {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="totalMarks" render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[16px] font-bold">{t.totalMarksLabel} <span className="text-destructive">*</span></FormLabel>
                          <FormControl><Input type="number" className="h-10 bg-muted/20 text-[14px]" {...field} /></FormControl>
                          {totalMarksError && <p className="font-medium pt-1 text-destructive text-[14px]">{totalMarksError}</p>}
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="percentage" render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[16px] font-bold">{t.percentageLabel}</FormLabel>
                          <FormControl><Input readOnly className="h-10 bg-secondary/30 font-bold text-[14px]" {...field} /></FormControl>
                          {eligibilityError && (
                            <Alert variant="destructive" className="py-1 px-2 mt-1 flex items-center gap-2 border-destructive/20 bg-destructive/5">
                              <AlertCircle className="h-4 w-4 shrink-0" />
                              <AlertDescription className="leading-tight font-medium text-[14px]">{eligibilityError}</AlertDescription>
                            </Alert>
                          )}
                        </FormItem>
                      )} />
                    </>
                  )}

                  <FormField control={form.control} name="yearOfPassing" render={({ field }) => {
                    const year = selectedCourse === 'SSLC' ? '2024-2025' : '2025-2026';
                    return (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[16px] font-bold">{t.yearPassingLabel} <span className="text-destructive">*</span></FormLabel>
                        <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-1.5">
                          <div className="flex items-center space-x-1.5"><RadioGroupItem value={year} id={`year-${year}-${lang}-opt`} className="h-4 w-4 cursor-pointer" /><Label htmlFor={`year-${year}-${lang}-opt`} className="text-[14px] font-normal cursor-pointer">{year}</Label></div>
                        </RadioGroup>
                      </FormItem>
                    );
                  }} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none" key={`docs-container-${lang}-${selectedCourse}-${selectedStream}-${scoreType}`}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b"><FileCheck className="w-4 h-4 text-primary" /><h2 className="font-bold text-[16px]">{t.docsTitle}</h2></div>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="photo-upload-input" className="text-[16px] font-bold cursor-default">{t.photoLabel} <span className="text-destructive">*</span></Label>
                  <Input id="photo-upload-input" type="file" accept="image/*" className="h-10 text-[14px] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border file:border-solid file:border-border file:bg-secondary/50 file:text-[14px] file:font-medium cursor-pointer file:cursor-pointer bg-muted/5 border-border/40" onChange={handlePhotoChange} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="marks-upload-input" className="text-[16px] font-bold cursor-default">{t.marksCardLabel} <span className="text-destructive">*</span></Label>
                  <Input id="marks-upload-input" type="file" accept=".pdf" className="h-10 text-[14px] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border file:border-solid file:border-border file:bg-secondary/50 file:text-[14px] file:font-medium cursor-pointer file:cursor-pointer bg-muted/5 border-border/40" onChange={handleMarksChange} />
                </div>
                {fileError && <p className="text-destructive text-[14px] font-bold">{fileError}</p>}
              </div>
            </CardContent>
          </Card>

          <div className="flex pt-1">
            <Button type="submit" className="w-full h-11 font-bold text-[16px]" disabled={isSubmitting || !!eligibilityError || !!totalMarksError || !!fileError || !canSubmit()}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.processing}</> : <><Send className="mr-2 h-4 w-4" /> {t.submitButton}</>}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
