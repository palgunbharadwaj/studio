
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
import { Loader2, CheckCircle2, Send, User, GraduationCap, FileCheck, AlertCircle, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  studentName: z.string().min(2, { message: "Name is required." }),
  relationship: z.enum(['SO', 'DO'], { required_error: "Relationship is required." }),
  fatherName: z.string().min(2, { message: "Father's name is required." }),
  motherName: z.string().min(2, { message: "Mother's name is required." }),
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
});

type FormValues = z.infer<typeof formSchema>;

export function LinguaForm() {
  const [lang, setLang] = useState<'kn' | 'en'>('kn');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);
  const [totalMarksError, setTotalMarksError] = useState<string | null>(null);
  const [alphabetError, setAlphabetError] = useState<{[key: string]: string | null}>({});
  
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
      cgpa: '',
    },
  });

  const studentName = useWatch({ control: form.control, name: 'studentName' });
  const fatherName = useWatch({ control: form.control, name: 'fatherName' });
  const motherName = useWatch({ control: form.control, name: 'motherName' });
  const selectedCourse = useWatch({ control: form.control, name: 'course' });
  const selectedStream = useWatch({ control: form.control, name: 'pucStream' });
  const marksObtained = useWatch({ control: form.control, name: 'marksObtained' });
  const totalMarks = useWatch({ control: form.control, name: 'totalMarks' });
  const cgpaValue = useWatch({ control: form.control, name: 'cgpa' });

  useEffect(() => {
    const errors: {[key: string]: string | null} = {};
    const englishRegex = /^[A-Za-z\s\.]+$/;
    const kannadaRegex = /^[\u0C80-\u0CFF\s\.]+$/;
    
    const checkField = (field: string, value: string | undefined) => {
      if (!value || value.trim() === '') return;
      const regex = lang === 'en' ? englishRegex : kannadaRegex;
      if (!regex.test(value)) {
        errors[field] = lang === 'en' 
          ? "Please use only English alphabets." 
          : "ದಯವಿಟ್ಟು ಕನ್ನಡ ಅಕ್ಷರಗಳನ್ನು ಮಾತ್ರ ಬಳಸಿ.";
      }
    };

    checkField('studentName', studentName);
    checkField('fatherName', fatherName);
    checkField('motherName', motherName);
    
    setAlphabetError(errors);
  }, [studentName, fatherName, motherName, lang]);

  useEffect(() => {
    setEligibilityError(null);
    setTotalMarksError(null);

    const checkNegative = (val: string | undefined) => val && parseFloat(val) < 0;
    if (checkNegative(marksObtained) || checkNegative(totalMarks) || checkNegative(cgpaValue)) {
      const errorMsg = lang === 'en' 
        ? "Enter valid marks (must be positive)." 
        : "ಸರಿಯಾದ ಅಂಕಗಳನ್ನು ನಮೂದಿಸಿ (ಶೂನ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚಿರಬೇಕು).";
      setEligibilityError(errorMsg);
      form.setValue('percentage', '');
      return;
    }

    if (['SSLC', 'PUC'].includes(selectedCourse || '')) {
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
        } else {
          form.setValue('percentage', '');
        }
      } else {
        form.setValue('percentage', '');
      }
    } else if (selectedCourse === 'Other') {
        if (marksObtained && totalMarks) {
          const marks = parseFloat(marksObtained);
          const total = parseFloat(totalMarks);
          if (!isNaN(marks) && !isNaN(total) && total > 0) {
            if (marks > total) {
              const errorMsg = lang === 'en' ? "Marks obtained cannot exceed total marks." : "ಗಳಿಸಿದ ಅಂಕಗಳು ಒಟ್ಟು ಅಂಕಗಳಿಗಿಂತ ಹೆಚ್ಚಿರಬಾರದು.";
              setTotalMarksError(errorMsg);
              form.setValue('percentage', '');
            } else {
              const roundedPercentage = ((marks / total) * 100).toFixed(2);
              form.setValue('percentage', roundedPercentage);
            }
          }
        }
    } else if (['Diploma', 'Degree', 'Engineering'].includes(selectedCourse || '')) {
      if (cgpaValue) {
        const cgpa = parseFloat(cgpaValue);
        if (!isNaN(cgpa)) {
          if (cgpa < 9.0) {
            const errorMsg = lang === 'en' ? "Enter CGPA above 9" : "9 ಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಸಿಜಿಪಿಎ ನಮೂದಿಸಿ";
            setEligibilityError(errorMsg);
          }
        }
      }
    }
  }, [marksObtained, totalMarks, cgpaValue, selectedCourse, lang, form]);

  const translations = {
    en: {
      title: "ಪತಿಭಾ ಪುರ ರ 2025-2026: \n 2025 ಮತ್ತು 2026ರ ಸಾಲಿನ ಮಾರ್ಚಿ ಮತ್ತು ಏಪ್ರಿಲ್ ನಲ್ಲಿ ನಡೆದ ಪಿ.ಯು.ಸಿ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಶೇ.85 ಕ್ಕಿಂತ ಹಾಗೂ ಎಸ್.ಎಸ್.ಎಲ್.ಸಿ/ಪದವಿ/ಉದ್ಯೋಗಾಧಾರಿತ ಶಿಕ್ಷಣದಲ್ಲಿ ರ‍್ಯಾಂಕ್‌ ಅಥವಾ ಶೇ.90 ಕ್ಕಿಂತ ಹೆಚ್ಚು ಅಂಕ ಪಡೆದ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ದೇವಾಲಯದ ಮಟ್ಟದಲ್ಲಿ ಪುರಸ್ಕಾರ",
      description: "",
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
      branchLabel: "Course",
      percentageLabel: "Percentage (%)",
      marksObtainedLabel: "Marks Obtained",
      totalMarksLabel: "Total Marks",
      yearPassingLabel: "Year of Passing",
      cgpaLabel: "CGPA",
      otherCourseLabel: "Please specify other course",
      docsTitle: "Documents",
      photoLabel: "Photo (JPG/JPEG, max 10MB)",
      marksCardLabel: "Marks Card (PDF/DOC, max 10MB)",
      submitButton: "Submit",
      processing: "Processing...",
      successTitle: "Submission Received!",
      successDesc: "Your registration has been submitted successfully and a confirmation email has been sent.",
      requiredNote: "* Indicates required question",
      confMessage: "Confirmation message generated:",
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
        'ECE (Electronics & Computer Engineering)',
        'Mechatronics Engineering',
        'Automobile Engineering',
        'Aerospace Engineering',
        'Chemical Engineering',
        'Biotechnology Engineering',
        'Data Science and Engineering',
        'AIDS (Artificial Intelligence and Data Science Engineering)',
        'Robotics and Automation Engineering',
        'ECS (Electronics & Computer Science Engineering)',
        'CSBS (Computer Science and Business Systems)',
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
      title: "ಪತಿಭಾ ಪುರ ರ 2025-2026: \n 2025 ಮತ್ತು 2026ರ ಸಾಲಿನ ಮಾರ್ಚಿ ಮತ್ತು ಏಪ್ರಿಲ್ ನಲ್ಲಿ ನಡೆದ ಪಿ.ಯು.ಸಿ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಶೇ.85 ಕ್ಕಿಂತ ಹಾಗೂ ಎಸ್.ಎಸ್.ಎಲ್.ಸಿ/ಪದವಿ/ಉದ್ಯೋಗಾಧಾರಿತ ಶಿಕ್ಷಣದಲ್ಲಿ ರ‍್ಯಾಂಕ್‌ ಅಥವಾ ಶೇ.90 ಕ್ಕಿಂತ ಹೆಚ್ಚು ಅಂಕ ಪಡೆದ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ದೇವಾಲಯದ ಮಟ್ಟದಲ್ಲಿ ಪುರಸ್ಕಾರ",
      description: "",
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
      successDesc: "ನಿಮ್ಮ ನೋಂದಣಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ ಮತ್ತು ದೃಢೀಕರಣ ಇಮೇಲ್ ಕಳಿಸಲಾಗಿದೆ.",
      requiredNote: "* ಕಡ್ಡಾಯ ಪ್ರಶ್ನೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ",
      confMessage: "ದೃಢೀಕರಣ ಸಂದೇಶ ರಚಿಸಲಾಗಿದೆ:",
      boards: ['ರಾಜ್ಯ (State)', 'ಸಿಬಿಎಸ್ ಇ (CBSE)', 'ಐಸಿಎಸ್ ಇ (ICSE)'],
      scienceCombinations: [
        'PCMB (ಭೌತಶಾಸ, ರಸಾಯನಶಾಸ, ಗಣಿತ, ಜೀವಶಾಸ)',
        'PCMC (ಭೌತಶಾಸ, ರಸಾಯನಶಾಸ, ಗಣಿತ, ಕಂ ಟರ್ ೖನ್)',
        'PCME (ಭೌತಶಾಸ, ರಸಾಯನಶಾಸ, ಗಣಿತ, ಎಲೆಕಾನಿಕ್)',
        'PCMS (ಭೌತಶಾಸ, ರಸಾಯನಶಾಸ, ಗಣಿತ, ಸಂ ಶಾಸ)',
        'PCMH (ಭೌತಶಾಸ, ರಸಾಯನಶಾಸ, ಗಣಿತ, ಗೃಹ ವಿ ನ)',
        'PCAG (ಭೌತಶಾಸ, ರಸಾಯನಶಾಸ, ಕೃಷಿ ವಿ ನ, ಗಣಿತ ಅಥವಾ ಜೀವಶಾಸ)',
        'ಇತರೆ'
      ],
      commerceCombinations: [
        'ECBA (ಅಥಶಾಸ, ವಾಣಿಜ, ವವಹಾರ ಅಧಯನಗಳು, ಲೆಕಶಾಸ)',
        'EBAC (ಅಥಶಾಸ, ವವಹಾರ ಅಧಯನಗಳು, ಲೆಕಶಾಸ, ಕಂ ಟರ್ ೖನ್)',
        'ESBA (ಅಥಶಾಸ, ಸಮಾಜಶಾಸ, ವವಹಾರ ಅಧಯನಗಳು, ಲೆಕಶಾಸ)',
        'EGBA (ಅಥಶಾಸ, ಭೂ ೕಳಶಾಸ, ವವಹಾರ ಅಧಯನಗಳು, ಲೆಕಶಾಸ)',
        'EMBA (ಅಥಶಾಸ, ಗಣಿತ, ವವಹಾರ ಅಧಯನಗಳು, ಲೆಕಶಾಸ)',
        'ECSA (ಅಥಶಾಸ, ಕಂ ಟರ್ ೖನ್, ಸಂ ಶಾಸ, ಲೆಕಶಾಸ)',
        'ಇತರೆ'
      ],
      artsCombinations: [
        'HEPS (ಇತಿಹಾಸ, ಅಥಶಾಸ, ರಾಜ ೕಯ ವಿ ನ, ಸಮಾಜಶಾಸ)',
        'HEPPsy (ಇತಿಹಾಸ, ಅಥಶಾಸ, ರಾಜ ೕಯ ವಿ ನ, ಮ ೕವಿ ನ)',
        'HESP (ಇತಿಹಾಸ, ಅಥಶಾಸ, ಸಮಾಜಶಾಸ, ಮ ೕವಿ ನ)',
        'HEBA (ಇತಿಹಾಸ, ಅಥಶಾಸ, ವವಹಾರ ಅಧಯನಗಳು, ಲೆಕಶಾಸ)',
        'HEGG (ಇತಿಹಾಸ, ಅಥಶಾಸ, ಭೂ ೕಳಶಾಸ, ಭೂಗಭಶಾಸ)',
        'HESF (ಇತಿಹಾಸ, ಅಥಶಾಸ, ಸಮಾಜಶಾಸ, ಲಲಿತಕಲೆಗಳು)',
        'ಇತರ'
      ],
      engineeringCourses: [
        'CSE (ಕಂ ಟರ್ ೖನ್ ಮ ಇಂಜಿನಿಯರಿಂಗ್)',
        'AIML (ಕೃತಕ ಬುದಿಮ ಮ ಯಂತ ಕಲಿಕೆ)',
        'ISE (ಮಾಹಿತಿ ವಿ ನ ಮ ಇಂಜಿನಿಯರಿಂಗ್)',
        'ECE (ಎಲೆಕಾನಿಕ್ ಮ ಸಂವಹನ ಇಂಜಿನಿಯರಿಂಗ್)',
        'EEE (ವಿದುತ್ ಮ ಎಲೆಕಾನಿಕ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'Mechanical (ಮೆಕಾನಿಕಲ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'Civil (ಸಿವಿಲ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'IP (ಕೈಗಾರಿಕಾ ಉತಾದನಾ ಇಂಜಿನಿಯರಿಂಗ್)',
        'EIE (ಎಲೆಕಾನಿಕ್ ಮ ಇ ಮೆಂ ೕಶನ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'ECS (ಎಲೆಕಾನಿಕ್ ಮ ಕಂ ಟರ್ ೖನ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'ECE (ಎಲೆಕಾನಿಕ್ ಮ ಕಂ ಟರ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'CSBS (ಕಂ ಟರ್ ೖನ್ ಮ ವವಹಾರ ವವ ಗಳು)',
        'Mechatronics (ಮೆಕಾ ನಿಕ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'Automobile (ಆ ೕಮೊೖಲ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'Aerospace (ಏ ೕ ೕಸ್ ಇಂಜಿನಿಯರಿಂಗ್)',
        'Chemical (ರಾಸಾಯನಿಕ ಇಂಜಿನಿಯರಿಂಗ್)',
        'Biotechnology ( ೖವಿಕ ತಂತ ನ ಇಂಜಿನಿಯರಿಂಗ್)',
        'Data Science (ದತಾಂಶ ವಿ ನ ಮ ಇಂಜಿನಿಯರಿಂಗ್)',
        'AI & Data Science (ಕೃತಕ ಬುದಿಮ ಮ ದತಾಂಶ ವಿ ನ ಇಂಜಿನಿಯರಿಂಗ್)',
        'Robotics & Automation (ೕ ೕಟಿಕ್ ಮ ಂತೀಕೃತ ಇಂಜಿನಿಯರಿಂಗ್)',
        'ಇತರ'
      ],
      diplomaCourses: [
        'ಕಂ ಟರ್ ೖನ್ ಮ ಇಂಜಿನಿಯರಿಂಗ್ ಡಿ ೕಮಾ',
        'ಎಲೆಕಾನಿಕ್ ಮ ಕ ನಿಕೇಷನ್ ಇಂಜಿನಿಯರಿಂಗ್ ಡಿ ೕಮಾ',
        'ಎಲೆ ಕಲ್ ಮ ಎಲೆಕಾನಿಕ್ ಇಂಜಿನಿಯರಿಂಗ್ ಡಿ ೕಮಾ',
        'ಮ ೆಕಾನಿಕಲ್ ಇಂಜಿನಿಯರಿಂಗ್ ಡಿ ೕಮಾ',
        'ಸ ಿವಿಲ್ ಇಂಜಿನಿಯರಿಂಗ್ ಡಿ ೕಮಾ',
        'ಆ ೕಮೊೖಲ್ ಇಂಜಿನಿಯರಿಂಗ್ ಡಿ ೕಮಾ',
        'ಇತರ'
      ],
      degreeCourses: [
        'ಡ ಿ.ಫಾ',
        'ಬ ಿ.ಫಾ',
        'ಬ ಿ.ಎಸಿ',
        'ಬ ಿ.ಕಾಂ',
        'ಬ ಿ.ಎ.',
        'ಬ ಿ.ಸಿ.ಎ.',
        'ಬ ಿ.ಬಿ.ಎ.',
        'ಬ ಿಎಸ್ ಡ',
        'ಬ ಿ.ಎಸಿ ನಸಿಂಗ್',
        'ಇತರ'
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
    if (eligibilityError || totalMarksError || Object.keys(alphabetError).length > 0) return;
    
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
      <Card className="shadow-sm border-none max-w-xl mx-auto cursor-default">
        <CardContent className="pt-5 pb-5 text-center space-y-3">
          <div className="mx-auto bg-green-50 text-green-600 p-2 rounded-full w-fit">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h2 className="font-bold text-[#202124] text-[14px]">{t.successTitle}</h2>
            <p className="text-muted-foreground text-[12px]">{t.successDesc}</p>
          </div>

          {result.emailData && (
            <div className="mt-3 p-3 bg-muted/30 rounded-lg text-left border space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-primary text-[12px]">
                <Mail className="w-4 h-4" />
                <span>{t.confMessage}</span>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-[#202124] text-[12px]">{result.emailData.subject}</p>
                <p className="text-[#5f6368] whitespace-pre-wrap leading-relaxed text-[12px]">{result.emailData.body}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2 w-full max-w-xl mx-auto pb-5 cursor-default relative">
      <Card className="shadow-sm border-none cursor-default">
        <CardContent className="p-4 space-y-1.5">
          <div className="space-y-1 pr-4">
            <h1 className="font-bold tracking-tight text-[#202124] text-[14px] whitespace-pre-wrap">{t.title}</h1>
            {t.description && <p className="text-[#5f6368] leading-relaxed text-[12px]">{t.description}</p>}
          </div>
          <div className="pt-1 border-t mt-1 font-medium italic text-destructive text-[12px]">{t.requiredNote}</div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-none cursor-default">
        <CardContent className="p-4">
          <div className="space-y-2">
            <Label className="font-semibold text-[#202124] text-[14px]">{t.langLabel} <span className="text-destructive">*</span></Label>
            <RadioGroup value={lang} onValueChange={(v) => setLang(v as 'en' | 'kn')} className="flex flex-col gap-1.5">
              <div className="flex items-center space-x-2.5 py-0.5 cursor-pointer" onClick={() => setLang('en')}>
                <RadioGroupItem value="en" id="en" className="h-4 w-4 cursor-pointer" />
                <Label htmlFor="en" className="cursor-pointer font-medium text-[12px]">English</Label>
              </div>
              <div className="flex items-center space-x-2.5 py-0.5 cursor-pointer" onClick={() => setLang('kn')}>
                <RadioGroupItem value="kn" id="kn" className="h-4 w-4 cursor-pointer" />
                <Label htmlFor="kn" className="cursor-pointer font-medium text-[12px]">ಕನ್ನಡ</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <Card className="shadow-sm border-none cursor-default">
            <CardContent className="p-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="font-semibold text-[#202124] text-[14px]">{t.emailLabel} <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="example@email.com" className="h-9 bg-muted/20 rounded-sm cursor-text text-[12px]" {...field} /></FormControl>
                  <FormMessage className="text-[12px]" />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none cursor-default">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b"><User className="w-4 h-4 text-primary" /><h2 className="font-bold text-[14px]">{t.personalDetailsHeader}</h2></div>
              <FormField control={form.control} name="studentName" render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="font-semibold text-[14px]">{t.studentNameLabel} <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder={lang === 'en' ? "Enter student name" : "ವಿದ್ಯಾರ್ಥಿಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ"} className="h-9 bg-muted/20 cursor-text text-[12px]" {...field} /></FormControl>
                  {alphabetError.studentName && <p className="font-medium text-destructive text-[12px]">{alphabetError.studentName}</p>}
                  <FormMessage className="text-[12px]" />
                </FormItem>
              )} />
              <FormField control={form.control} name="relationship" render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="font-semibold text-[14px]">{t.relationshipLabel} <span className="text-destructive">*</span></FormLabel>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-1.5">
                    <div className="flex items-center space-x-1.5"><RadioGroupItem value="SO" id="so" className="h-4 w-4 cursor-pointer" /><Label htmlFor="so" className="cursor-pointer text-[12px]">{lang === 'en' ? 'S/O (Son of)' : 'S/O (ಮಗ)'}</Label></div>
                    <div className="flex items-center space-x-1.5"><RadioGroupItem value="DO" id="do" className="h-4 w-4 cursor-pointer" /><Label htmlFor="do" className="cursor-pointer text-[12px]">{lang === 'en' ? 'D/O (Daughter of)' : 'D/O (ಮಗಳು)'}</Label></div>
                  </RadioGroup>
                  <FormMessage className="text-[12px]" />
                </FormItem>
              )} />
              <FormField control={form.control} name="fatherName" render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="font-semibold text-[14px]">{t.fatherNameLabel} <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input className="h-9 bg-muted/20 cursor-text text-[12px]" {...field} /></FormControl>
                  {alphabetError.fatherName && <p className="font-medium text-destructive text-[12px]">{alphabetError.fatherName}</p>}
                  <FormMessage className="text-[12px]" />
                </FormItem>
              )} />
              <FormField control={form.control} name="motherName" render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="font-semibold text-[14px]">{t.motherNameLabel} <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input className="h-9 bg-muted/20 cursor-text text-[12px]" {...field} /></FormControl>
                  {alphabetError.motherName && <p className="font-medium text-destructive text-[12px]">{alphabetError.motherName}</p>}
                  <FormMessage className="text-[12px]" />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none cursor-default">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b"><GraduationCap className="w-4 h-4 text-primary" /><h2 className="font-bold text-[14px]">{t.academicDetailsHeader}</h2></div>
              <FormField control={form.control} name="course" render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="font-semibold text-[14px]">{t.courseLabel} <span className="text-destructive">*</span></FormLabel>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-1.5">
                    {['SSLC', 'PUC', 'Diploma', 'Degree', 'Engineering', 'Other'].map((c) => (
                      <div key={c} className="flex items-center space-x-1.5">
                        <RadioGroupItem value={c} id={c} className="h-4 w-4 cursor-pointer" />
                        <Label htmlFor={c} className="cursor-pointer text-[12px]">
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
                  <FormMessage className="text-[12px]" />
                </FormItem>
              )} />

              {selectedCourse === 'SSLC' && (
                <FormField control={form.control} name="board" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[14px] font-semibold">{t.boardLabel} *</FormLabel>
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-1.5">
                      {t.boards.map(b => <div key={b} className="flex items-center space-x-1.5"><RadioGroupItem value={b} id={b} className="h-4 w-4 cursor-pointer" /><Label htmlFor={b} className="text-[12px] cursor-pointer">{b}</Label></div>)}
                    </RadioGroup>
                  </FormItem>
                )} />
              )}

              {selectedCourse === 'PUC' && (
                <div className="space-y-2 pt-1">
                  <FormField control={form.control} name="pucStream" render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-[14px] font-semibold">{t.streamLabel} *</FormLabel>
                      <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-1.5">
                        {['Science', 'Commerce', 'Arts'].map(s => (
                          <div key={s} className="flex items-center space-x-1.5">
                            <RadioGroupItem value={s} id={s} className="h-4 w-4 cursor-pointer" />
                            <Label htmlFor={s} className="text-[12px] cursor-pointer">{lang === 'en' ? (s === 'Science' ? 'Science' : s === 'Commerce' ? 'Commerce' : 'Arts') : (s === 'Science' ? 'ವಿಜ್ಞಾನ' : s === 'Commerce' ? 'ವಾಣಿಜ್ಯ' : 'ಕಲೆ')}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormItem>
                  )} />
                  {selectedStream && (
                    <FormField control={form.control} name="combination" render={({ field }) => {
                      const options = selectedStream === 'Science' ? t.scienceCombinations : selectedStream === 'Commerce' ? t.commerceCombinations : t.artsCombinations;
                      return (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[14px] font-semibold">{t.combinationLabel} *</FormLabel>
                          <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-1.5">
                            {options.map(c => <div key={c} className="flex items-center space-x-1.5"><RadioGroupItem value={c} id={c} className="h-4 w-4 cursor-pointer" /><Label htmlFor={c} className="text-[12px] cursor-pointer">{c}</Label></div>)}
                          </RadioGroup>
                        </FormItem>
                      );
                    }} />
                  )}
                </div>
              )}

              {(['Diploma', 'Degree', 'Engineering'].includes(selectedCourse || '')) && (
                <FormField control={form.control} name="branch" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[14px] font-semibold">{t.branchLabel} *</FormLabel>
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-1.5">
                      {(selectedCourse === 'Engineering' ? t.engineeringCourses : selectedCourse === 'Diploma' ? t.diplomaCourses : t.degreeCourses).map(c => (
                        <div key={c} className="flex items-center space-x-1.5"><RadioGroupItem value={c} id={c} className="h-4 w-4 cursor-pointer" /><Label htmlFor={c} className="text-[12px] cursor-pointer">{c}</Label></div>
                      ))}
                    </RadioGroup>
                  </FormItem>
                )} />
              )}

              {selectedCourse === 'Other' && (
                <FormField control={form.control} name="otherCourse" render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-[14px] font-semibold">{t.otherCourseLabel} *</FormLabel>
                    <FormControl><Input className="h-9 bg-muted/20 cursor-text text-[12px]" {...field} /></FormControl>
                  </FormItem>
                )} />
              )}

              {selectedCourse && (
                <div className="space-y-2 pt-1">
                  {(['SSLC', 'PUC', 'Other'].includes(selectedCourse)) && (
                    <>
                      <FormField control={form.control} name="marksObtained" render={({ field }) => (
                        <FormItem className="space-y-1"><FormLabel className="text-[14px] font-semibold">{t.marksObtainedLabel} *</FormLabel><FormControl><Input type="number" className="h-9 bg-muted/20 cursor-text text-[12px]" {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="totalMarks" render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[14px] font-semibold">{t.totalMarksLabel} *</FormLabel>
                          <FormControl><Input type="number" className="h-9 bg-muted/20 cursor-text text-[12px]" {...field} /></FormControl>
                          {totalMarksError && (
                            <p className="font-medium pt-1 text-destructive text-[12px]">{totalMarksError}</p>
                          )}
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="percentage" render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[14px] font-semibold">{t.percentageLabel}</FormLabel>
                          <FormControl><Input readOnly className="h-9 bg-secondary/30 font-bold text-[12px]" {...field} /></FormControl>
                          {eligibilityError && (
                            <Alert variant="destructive" className="py-1 px-2 mt-1 flex items-center gap-2 border-destructive/20 bg-destructive/5">
                              <AlertCircle className="h-4 w-4 shrink-0" />
                              <AlertDescription className="leading-tight font-medium text-[12px]">
                                {eligibilityError}
                              </AlertDescription>
                            </Alert>
                          )}
                        </FormItem>
                      )} />
                    </>
                  )}

                  {(['Diploma', 'Degree', 'Engineering'].includes(selectedCourse)) && (
                    <FormField control={form.control} name="cgpa" render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[14px] font-semibold">{t.cgpaLabel} *</FormLabel>
                        <FormControl><Input type="number" step="0.01" className="h-9 bg-muted/20 cursor-text text-[12px]" {...field} /></FormControl>
                        {eligibilityError && (
                          <Alert variant="destructive" className="py-1 px-2 mt-1 flex items-center gap-2 border-destructive/20 bg-destructive/5">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <AlertDescription className="leading-tight font-medium text-[12px]">
                                {eligibilityError}
                            </AlertDescription>
                          </Alert>
                        )}
                      </FormItem>
                    )} />
                  )}

                  <FormField control={form.control} name="yearOfPassing" render={({ field }) => {
                    let years: string[] = [];
                    if (selectedCourse === 'SSLC') {
                      years = ['2024-2025'];
                    } else {
                      years = ['2025-2026'];
                    }
                    return (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-[14px] font-semibold">{t.yearPassingLabel} *</FormLabel>
                        <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-1.5">
                          {years.map(y => <div key={y} className="flex items-center space-x-1.5"><RadioGroupItem value={y} id={y} className="h-4 w-4 cursor-pointer" /><Label htmlFor={y} className="text-[12px] cursor-pointer">{y}</Label></div>)}
                        </RadioGroup>
                      </FormItem>
                    );
                  }} />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none cursor-default">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 pb-1.5 border-b"><FileCheck className="w-4 h-4 text-primary" /><h2 className="font-bold text-[14px]">{t.docsTitle}</h2></div>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-[14px] font-semibold cursor-pointer">{t.photoLabel} *</Label>
                  <Input type="file" accept="image/jpeg,image/jpg" className="h-9 cursor-pointer file:cursor-pointer text-[12px]" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[14px] font-semibold cursor-pointer">{t.marksCardLabel} *</Label>
                  <Input type="file" accept=".pdf,.doc,.docx" className="h-9 cursor-pointer file:cursor-pointer text-[12px]" onChange={(e) => setMarksFile(e.target.files?.[0] || null)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex pt-1">
            <Button type="submit" className="w-full h-9 font-bold rounded-md shadow cursor-pointer text-[14px]" disabled={isSubmitting || !!eligibilityError || !!totalMarksError || Object.keys(alphabetError).length > 0}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.processing}</> : <><Send className="mr-2 h-4 w-4" /> {t.submitButton}</>}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
