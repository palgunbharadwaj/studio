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
import { Loader2, CheckCircle2, Send, Info, User, GraduationCap, FileCheck, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  studentName: z.string().min(2, { message: "Name is required." }),
  relationship: z.enum(['SO', 'DO'], { required_error: "Relationship is required." }),
  fatherName: z.string().min(2, { message: "Father's name is required." }),
  motherName: z.string().min(2, { message: "Mother's name is required." }),
  course: z.enum(['SSLC', 'PUC', 'Diploma', 'Degree', 'Engineering', 'Other'], { required_error: "Course is required." }),
  board: z.string().optional(),
  pucStream: z.enum(['Science', 'Commerce', 'Arts']).optional(),
  combination: z.string().optional(),
  percentage: z.string().optional(),
  marksObtained: z.string().optional(),
  totalMarks: z.string().optional(),
  yearOfPassing: z.string().optional(),
  cgpa: z.string().optional(),
  otherCourse: z.string().optional(),
  branch: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function LinguaForm() {
  const [lang, setLang] = useState<'kn' | 'en'>('kn');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [marksFile, setMarksFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      studentName: '',
      fatherName: '',
      motherName: '',
      percentage: '',
      marksObtained: '',
      totalMarks: '',
    },
  });

  const selectedCourse = useWatch({ control: form.control, name: 'course' });
  const selectedStream = useWatch({ control: form.control, name: 'pucStream' });
  const marksObtained = useWatch({ control: form.control, name: 'marksObtained' });
  const totalMarks = useWatch({ control: form.control, name: 'totalMarks' });

  // Handle percentage calculation and validation
  useEffect(() => {
    if (marksObtained && totalMarks) {
      const marks = parseFloat(marksObtained);
      const total = parseFloat(totalMarks);
      
      if (!isNaN(marks) && !isNaN(total) && total > 0) {
        const calculatedPercentage = (marks / total) * 100;
        const roundedPercentage = calculatedPercentage.toFixed(2);
        form.setValue('percentage', roundedPercentage);

        let minRequired = 90;
        if (selectedCourse === 'PUC') {
          minRequired = 85;
        }

        if (calculatedPercentage < minRequired) {
          const errorMsg = lang === 'en' 
            ? `Minimum ${minRequired}% marks required for eligibility.` 
            : `ಅರ್ಹತೆಗಾಗಿ ಕನಿಷ್ಠ ${minRequired}% ಅಂಕಗಳು ಅಗತ್ಯವಿದೆ.`;
          setEligibilityError(errorMsg);
        } else {
          setEligibilityError(null);
        }
      } else {
        form.setValue('percentage', '');
        setEligibilityError(null);
      }
    } else {
      setEligibilityError(null);
    }
  }, [marksObtained, totalMarks, selectedCourse, lang, form]);

  const translations = {
    en: {
      title: "Prathibha Puraskahara 2024-2025:",
      description: "2024 ಮತ್ತು 2025ರ ಸಾಲಿನ ಮಾರ್ಚಿ ಮತ್ತು ಏಪ್ರಿಲ್ ನಲ್ಲಿ ನಡೆದ ಪಿ.ಯು.ಸಿ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಶೇ.85 ಕ್ಕಿಂತ ಹಾಗೂ ಎಸ್.ಎಸ್.ಎಲ್.ಸಿ/ಪದವಿ/ಉದ್ಯೋಗಾಧಾರಿತ ಶಿಕ್ಷಣದಲ್ಲಿ ರ‍್ಯಾಂಕ್‌ ಅಥವಾ ಶೇ.90 ಕ್ಕಿಂತ ಹೆಚ್ಚು ಅಂಕ ಪಡೆದ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ದೇವಾಲಯದ ಮಟ್ಟದಲ್ಲಿ ಪುರಸ್ಕಾರ.",
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
      branchLabel: "Branch",
      percentageLabel: "Percentage (%)",
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
      boards: ['State', 'CBSE', 'ICSE'],
      streams: ['Science', 'Commerce', 'Arts'],
      years: ['2024-2025', '2023-2024'],
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
        'ECS (Electronics & Computer Science Engineering)',
        'CSBS (Computer Science and Business Systems)',
        'Mechatronics Engineering',
        'Automobile Engineering',
        'Aerospace Engineering',
        'Chemical Engineering',
        'Biotechnology Engineering',
        'Data Science and Engineering',
        'AIDS (Artificial Intelligence and Data Science Engineering)',
        'Robotics and Automation Engineering',
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
      title: "Prathibha Puraskahara 2024-2025:",
      description: "2024 ಮತ್ತು 2025ರ ಸಾಲಿನ ಮಾರ್ಚಿ ಮತ್ತು ಏಪ್ರಿಲ್ ನಲ್ಲಿ ನಡೆದ ಪಿ.ಯು.ಸಿ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಶೇ.85 ಕ್ಕಿಂತ ಹಾಗೂ ಎಸ್.ಎಸ್.ಎಲ್.ಸಿ/ಪದವಿ/ಉದ್ಯೋಗಾಧಾರಿತ ಶಿಕ್ಷಣದಲ್ಲಿ ರ‍್ಯಾಂಕ್‌ ಅಥವಾ ಶೇ.90 ಕ್ಕಿಂತ ಹೆಚ್ಚು ಅಂಕ ಪಡೆದ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ದೇವಾಲಯದ ಮಟ್ಟದಲ್ಲಿ ಪುರಸ್ಕಾರ.",
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
      combinationLabel: "ವಿಷಯಗಳು",
      branchLabel: "ವಿಭಾಗ",
      percentageLabel: "ಶೇಕಡಾ (%)",
      marksObtainedLabel: "ಗಳಿಸಿದ ಅಂಕಗಳು",
      totalMarksLabel: "ಒಟ್ಟು ಅಂಕಗಳು",
      yearPassingLabel: "ಉತ್ತೀರ್ಣರಾದ ವರ್ಷ",
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
      boards: ['ರಾಜ್ಯ (State)', 'ಸಿಬಿಎಸ್ ಇ (CBSE)', 'ಐಸಿಎಸ್ ಇ (ICSE)'],
      streams: ['ವಿಜ್ಞಾನ (Science)', 'ವಾಣಿಜ್ಯ (Commerce)', 'ಕಲೆ (Arts)'],
      years: ['2024-2025', '2023-2024'],
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
        'HEPS (ಇತಿಹಾಸ, ಅರ್ಥಶಾಸ್ತ್ರ, ರಾಜ್ಯಶಾಸ್ತ್ರ, ಸಮಾಜಶಾಸ್ತ್ರ)',
        'HEPPsy (ಇತಿಹಾಸ, ಅರ್ಥಶಾಸ್ತ್ರ, ರಾಜ್ಯಶಾಸ್ತ್ರ, ಮನೋವಿಜ್ಞಾನ)',
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
        'Mechanical (ಮೆಕಾನಿಕಲ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'Civil (ಸಿವಿಲ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'IP (ಕೈಗಾರಿಕಾ ಉತ್ಪಾದನಾ ಇಂಜಿನಿಯರಿಂಗ್)',
        'EIE (ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಮತ್ತು ಇನ್ಸ್ಟ್ರುಮೆಂಟೇಶನ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'ECS (ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಮತ್ತು ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'CSBS (ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್ ಮತ್ತು ವ್ಯವಹಾರ ವ್ಯವಸ್ಥೆಗಳು)',
        'Mechatronics (ಮೆಕಾಟ್ರಾನಿಕ್ಸ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'Automobile (ಆಟೋಮೊಬೈಲ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'Aerospace (ಏರೋಸ್ಪೇಸ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'Chemical (ರಾಸಾಯನಿಕ ಇಂಜಿನಿಯರಿಂಗ್)',
        'Biotechnology (ಜೈವಿಕ ತಂತ್ರಜ್ಞಾನ ಇಂಜಿನಿಯರಿಂಗ್)',
        'Data Science (ದತ್ತಾಂಶ ವಿಜ್ಞಾನ ಮತ್ತು ಇಂಜಿನಿಯರಿಂಗ್)',
        'AI & Data Science (ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಮತ್ತು ದತ್ತಾಂಶ ವಿಜ್ಞಾನ ಇಂಜಿನಿಯರಿಂಗ್)',
        'Robotics & Automation (ರೋಬೋಟಿಕ್ಸ್ ಮತ್ತು ಸ್ವಯಂಚಾಲಿತ ಇಂಜಿನಿಯರಿಂಗ್)',
        'ಇತರೆ'
      ],
      diplomaCourses: [
        'ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್ ಮತ್ತು ಇಂಜಿನಿಯರಿಂಗ್ ಡಿಪ್ಲೊಮಾ',
        'ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಮತ್ತು ಕಮ್ಯುನಿಕೇಶನ್ ಇಂಜಿನಿಯರಿಂಗ್ ಡಿಪ್ಲೊಮಾ',
        'ಎಲೆಕ್ಟ್ರಿಕಲ್ ಮತ್ತು ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್ ಇಂಜಿನಿಯರಿಂಗ್ ಡಿಪ್ಲೊಮಾ',
        'ಮೆಕಾನಿಕಲ್ ಇಂಜಿನಿಯರಿಂಗ್ ಡಿಪ್ಲೊಮಾ',
        'ಸಿವಿಲ್ ಇಂಜಿನಿಯರಿಂಗ್ ಡಿಪ್ಲೊಮಾ',
        'ಆಟೋಮೊಬೈಲ್ ಇಂಜಿನಿಯರಿಂಗ್ ಡಿಪ್ಲೊಮಾ',
        'ಇತರೆ'
      ],
      degreeCourses: [
        'ಡಿ.ಫಾರ್ಮಾ',
        'ಬಿ.ಫಾರ್ಮಾ',
        'ಬಿ.ಎಸ್ಸಿ',
        'ಬಿ.ಕಾಂ',
        'ಬಿ.ಎ.',
        'ಬಿ.ಸಿ.ಎ.',
        'ಬಿ.ಬಿ.ಎ.',
        'ಬಿಎಸ್ ಡಬ್ಲ್ಯೂ',
        'ಬಿ.ಎಸ್ಸಿ ನರ್ಸಿಂಗ್',
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

  async function onSubmit(values: FormValues) {
    if (eligibilityError) return;
    
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
              <div className="flex items-center gap-2 pb-2 border-b"><User className="w-3.5 h-3.5 text-primary" /><h2 className="text-[12px] font-bold">{t.personalDetailsHeader}</h2></div>
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
              <div className="flex items-center gap-2 pb-2 border-b"><GraduationCap className="w-3.5 h-3.5 text-primary" /><h2 className="text-[12px] font-bold">{t.academicDetailsHeader}</h2></div>
              <FormField control={form.control} name="course" render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[11px] font-semibold">{t.courseLabel} <span className="text-destructive">*</span></FormLabel>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-2">
                    {['SSLC', 'PUC', 'Diploma', 'Degree', 'Engineering', 'Other'].map((c) => (
                      <div key={c} className="flex items-center space-x-2">
                        <RadioGroupItem value={c} id={c} className="h-3.5 w-3.5" />
                        <Label htmlFor={c} className="text-[11px]">
                          {c === 'PUC' ? (lang === 'en' ? '2nd PUC' : 'ದ್ವಿತೀಯ ಪಿ.ಯು.ಸಿ') : 
                           c === 'SSLC' ? (lang === 'en' ? 'SSLC/10th' : 'ಎಸ್.ಎಸ್.ಎಲ್.ಸಿ. / 10 ನೇ ತರಗತಿ') : 
                           c === 'Diploma' ? (lang === 'en' ? 'Diploma' : 'ಡಿಪ್ಲೊಮಾ') :
                           c === 'Degree' ? (lang === 'en' ? 'Degree' : 'ಪದವಿ') :
                           c === 'Engineering' ? (lang === 'en' ? 'Engineering' : 'ಇಂಜಿನಿಯರಿಂಗ್') :
                           (lang === 'en' ? 'Other' : 'ಇತರೆ')}
                        </Label>
                      </div>
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
                        {t.boards.map(b => <div key={b} className="flex items-center space-x-2"><RadioGroupItem value={b} id={b} className="h-3.5 w-3.5" /><Label htmlFor={b} className="text-[11px]">{b}</Label></div>)}
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
                        {t.streams.map(s => <div key={s} className="flex items-center space-x-2"><RadioGroupItem value={s} id={s} className="h-3.5 w-3.5" /><Label htmlFor={s} className="text-[11px]">{s}</Label></div>)}
                      </RadioGroup>
                    </FormItem>
                  )} />
                  {selectedStream && (
                    <FormField control={form.control} name="combination" render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[11px] font-semibold">{t.combinationLabel} *</FormLabel>
                        <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-2">
                          {(selectedStream === 'Science' ? t.scienceCombinations : selectedStream === 'Commerce' ? t.commerceCombinations : t.artsCombinations).map(c => (
                            <div key={c} className="flex items-center space-x-2"><RadioGroupItem value={c} id={c} className="h-3.5 w-3.5" /><Label htmlFor={c} className="text-[11px]">{c}</Label></div>
                          ))}
                        </RadioGroup>
                      </FormItem>
                    )} />
                  )}
                </div>
              )}

              {selectedCourse === 'Engineering' && (
                <div className="space-y-3 pt-2">
                  <FormField control={form.control} name="branch" render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[11px] font-semibold">{t.branchLabel} *</FormLabel>
                      <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-2">
                        {t.engineeringCourses.map(c => <div key={c} className="flex items-center space-x-2"><RadioGroupItem value={c} id={c} className="h-3.5 w-3.5" /><Label htmlFor={c} className="text-[11px]">{c}</Label></div>)}
                      </RadioGroup>
                    </FormItem>
                  )} />
                </div>
              )}

              {selectedCourse === 'Diploma' && (
                <div className="space-y-3 pt-2">
                  <FormField control={form.control} name="branch" render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[11px] font-semibold">{t.branchLabel} *</FormLabel>
                      <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-2">
                        {t.diplomaCourses.map(c => <div key={c} className="flex items-center space-x-2"><RadioGroupItem value={c} id={c} className="h-3.5 w-3.5" /><Label htmlFor={c} className="text-[11px]">{c}</Label></div>)}
                      </RadioGroup>
                    </FormItem>
                  )} />
                </div>
              )}

              {selectedCourse === 'Degree' && (
                <div className="space-y-3 pt-2">
                  <FormField control={form.control} name="branch" render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[11px] font-semibold">{t.courseLabel} *</FormLabel>
                      <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-2">
                        {t.degreeCourses.map(c => <div key={c} className="flex items-center space-x-2"><RadioGroupItem value={c} id={c} className="h-3.5 w-3.5" /><Label htmlFor={c} className="text-[11px]">{c}</Label></div>)}
                      </RadioGroup>
                    </FormItem>
                  )} />
                </div>
              )}

              {selectedCourse === 'Other' && (
                <FormField control={form.control} name="otherCourse" render={({ field }) => (
                  <FormItem className="space-y-1.5"><FormLabel className="text-[11px] font-semibold">{t.otherCourseLabel} *</FormLabel><FormControl><Input className="h-8 text-[11px] bg-muted/20" {...field} /></FormControl></FormItem>
                )} />
              )}

              {(['SSLC', 'PUC', 'Diploma', 'Degree', 'Engineering'].includes(selectedCourse || '')) && (
                <div className="space-y-3">
                  <FormField control={form.control} name="marksObtained" render={({ field }) => (
                    <FormItem className="space-y-1.5"><FormLabel className="text-[11px] font-semibold">{t.marksObtainedLabel} *</FormLabel><FormControl><Input type="number" className="h-8 text-[11px] bg-muted/20" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="totalMarks" render={({ field }) => (
                    <FormItem className="space-y-1.5"><FormLabel className="text-[11px] font-semibold">{t.totalMarksLabel} *</FormLabel><FormControl><Input type="number" className="h-8 text-[11px] bg-muted/20" {...field} /></FormControl></FormItem>
                  )} />
                  
                  <FormField control={form.control} name="percentage" render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[11px] font-semibold">{t.percentageLabel}</FormLabel>
                      <FormControl><Input readOnly className="h-8 text-[11px] bg-secondary/30 font-bold" {...field} /></FormControl>
                    </FormItem>
                  )} />

                  {eligibilityError && (
                    <Alert variant="destructive" className="py-2 px-3">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <AlertDescription className="text-[10px] ml-1">
                        {eligibilityError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {(['Diploma', 'Degree', 'Engineering'].includes(selectedCourse || '')) && (
                    <FormField control={form.control} name="cgpa" render={({ field }) => (
                      <FormItem className="space-y-1.5"><FormLabel className="text-[11px] font-semibold">{t.cgpaLabel} *</FormLabel><FormControl><Input className="h-8 text-[11px] bg-muted/20" {...field} /></FormControl></FormItem>
                    )} />
                  )}
                  <FormField control={form.control} name="yearOfPassing" render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[11px] font-semibold">{t.yearPassingLabel} *</FormLabel>
                      <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-2">
                        {t.years.map(y => <div key={y} className="flex items-center space-x-2"><RadioGroupItem value={y} id={y} className="h-3.5 w-3.5" /><Label htmlFor={y} className="text-[11px]">{y}</Label></div>)}
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
            <Button type="submit" className="w-full h-8 text-[11px] font-bold rounded-md shadow" disabled={isSubmitting || !!eligibilityError}>
              {isSubmitting ? <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> {t.processing}</> : <><Send className="mr-2 h-3 w-3" /> {t.submitButton}</>}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
