'use client';

import { useState, useEffect } from 'react';
import { initializeFirebase } from '@/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Download, Eye, FileText, ImageIcon } from 'lucide-react';
import { getReassembledFile } from '@/app/actions/file-viewer';

export default function AdminExportPage() {
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [viewingFile, setViewingFile] = useState<{ studentId: string, type: 'photo' | 'marksCard', name: string } | null>(null);
  const [isAssembling, setIsAssembling] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const { firestore } = initializeFirebase();
      const q = query(collection(firestore, 'registrations'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadBlob = (content: string, filename: string) => {
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCSVRow = (columns: string[]) => {
    return columns.map(col => `"${(col || '').toString().replace(/"/g, '""')}"`).join(',');
  };

  const handleDownloadCSV = () => {
    if (registrations.length === 0) return;

    const headers = [
      'Submission Date', 'Student Name', 'Email', 'Father Name', 'Mother Name', 'Relationship',
      'Course', 'Year of Passing', 'Board', 'Stream', 'Combination', 'Marks Obtained',
      'Total Marks', 'Percentage', 'CGPA', 'File ID (Student ID)'
    ];

    const csvRows = registrations.map(reg => {
      const date = reg.createdAt?.toDate ? reg.createdAt.toDate().toLocaleString() : 'N/A';
      return formatCSVRow([
        date, reg.studentName, reg.email, reg.fatherName, reg.motherName, reg.relationship,
        reg.course, reg.yearOfPassing, reg.board, reg.pucStream, reg.combination, reg.marksObtained,
        reg.totalMarks, reg.percentage, reg.cgpa, reg.id
      ]);
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    downloadBlob(csvContent, `registrations_all_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleCategorizedExport = (courseType: string) => {
    const filtered = registrations.filter(r => r.course === courseType);
    if (filtered.length === 0) return;

    let headers: string[] = [];
    let rowMapper: (reg: any) => string[] = () => [];

    const commonHeaders = ['Student Name', 'Father Name', 'Mother Name', 'S/O or D/O', 'Email'];
    const getCommonData = (reg: any) => [reg.studentName, reg.fatherName, reg.motherName, reg.relationship, reg.email];

    if (courseType === 'SSLC') {
      headers = [...commonHeaders, 'Board', 'Marks Obtained', 'Total Marks', 'Percentage'];
      rowMapper = (reg) => [...getCommonData(reg), reg.board, reg.marksObtained, reg.totalMarks, reg.percentage];
    } else if (courseType === 'PUC') {
      headers = [...commonHeaders, 'Board', 'Stream', 'Combination', 'Marks Obtained', 'Total Marks', 'Percentage'];
      rowMapper = (reg) => [...getCommonData(reg), reg.board, reg.pucStream, reg.combination, reg.marksObtained, reg.totalMarks, reg.percentage];
    } else if (['Diploma', 'Degree', 'Engineering'].includes(courseType)) {
      headers = [...commonHeaders, 'Course', 'Branch', 'Score (CGPA/%)'];
      rowMapper = (reg) => [...getCommonData(reg), reg.course, reg.branch, reg.cgpa || reg.percentage];
    } else {
      headers = [...commonHeaders, 'Course Description', 'Score'];
      rowMapper = (reg) => [...getCommonData(reg), reg.otherCourse || reg.course, reg.cgpa || reg.percentage];
    }

    const csvRows = filtered.map(reg => formatCSVRow(rowMapper(reg)));
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    downloadBlob(csvContent, `registrations_${courseType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleViewFile = async (studentId: string, type: 'photo' | 'marksCard', studentName: string) => {
    setIsAssembling(true);
    try {
      const base64 = await getReassembledFile(studentId, type);
      if (base64) {
        // Handle PDF vs Image
        if (type === 'marksCard') {
          // Open PDF in new tab
          const win = window.open();
          if (win) {
            win.document.write(`<iframe src="${base64}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
          }
        } else {
          // Open Image in new tab
          const win = window.open();
          if (win) {
            win.document.write(`<img src="${base64}" style="max-width:100%; height:auto;" />`);
          }
        }
      } else {
        alert('File not found or re-assembly failed.');
      }
    } catch (err) {
      console.error('View error:', err);
      alert('Error loading file.');
    } finally {
      setIsAssembling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard: Pratibha Puraskar 2025</h1>
            <p className="text-slate-500">Secret URL: /admin-2025-p-puraskar-export</p>
          </div>
          <Button onClick={handleDownloadCSV} variant="default" className="font-bold gap-2 bg-slate-900 hover:bg-slate-800">
            <Download className="w-4 h-4" /> Export All Data
          </Button>
        </div>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Download Categorized Reports (Relevant Columns Only)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Button 
                variant="outline" 
                className="flex-1 font-semibold border-orange-200 hover:bg-orange-50 text-orange-700 h-16 flex-col gap-1"
                onClick={() => handleCategorizedExport('SSLC')}
                disabled={!registrations.some(r => r.course === 'SSLC')}
              >
                <div className="text-xs uppercase opacity-70">Category</div>
                SSLC
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 font-semibold border-blue-200 hover:bg-blue-50 text-blue-700 h-16 flex-col gap-1"
                onClick={() => handleCategorizedExport('PUC')}
                disabled={!registrations.some(r => r.course === 'PUC')}
              >
                <div className="text-xs uppercase opacity-70">Category</div>
                2nd PUC
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 font-semibold border-green-200 hover:bg-green-50 text-green-700 h-16 flex-col gap-1"
                onClick={() => handleCategorizedExport('Diploma')}
                disabled={!registrations.some(r => r.course === 'Diploma')}
              >
                <div className="text-xs uppercase opacity-70">Category</div>
                Diploma
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 font-semibold border-purple-200 hover:bg-purple-50 text-purple-700 h-16 flex-col gap-1"
                onClick={() => handleCategorizedExport('Degree')}
                disabled={!registrations.some(r => r.course === 'Degree')}
              >
                <div className="text-xs uppercase opacity-70">Category</div>
                Degree
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 font-semibold border-cyan-200 hover:bg-cyan-50 text-cyan-700 h-16 flex-col gap-1"
                onClick={() => handleCategorizedExport('Engineering')}
                disabled={!registrations.some(r => r.course === 'Engineering')}
              >
                <div className="text-xs uppercase opacity-70">Category</div>
                Engineering
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 font-semibold border-slate-200 hover:bg-slate-50 text-slate-700 h-16 flex-col gap-1"
                onClick={() => handleCategorizedExport('Other')}
                disabled={!registrations.some(r => r.course === 'Other')}
              >
                <div className="text-xs uppercase opacity-70">Category</div>
                Other
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="bg-white border-b rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> 
              Recent Submissions ({registrations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold">Student Name</TableHead>
                    <TableHead className="font-bold">Course</TableHead>
                    <TableHead className="font-bold">Percentage/GPA</TableHead>
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">No submissions found.</TableCell>
                    </TableRow>
                  ) : (
                    registrations.map((reg) => (
                      <TableRow key={reg.id} className="hover:bg-slate-50/50 bg-white">
                        <TableCell className="font-medium text-slate-900">{reg.studentName}</TableCell>
                        <TableCell>{reg.course}</TableCell>
                        <TableCell className="font-bold text-primary">
                          {reg.percentage ? `${reg.percentage}%` : reg.cgpa}
                        </TableCell>
                        <TableCell className="text-slate-500 text-xs text-nowrap">
                          {reg.createdAt?.toDate ? reg.createdAt.toDate().toLocaleString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {reg.hasPhoto && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 gap-1.5" 
                                onClick={() => handleViewFile(reg.id, 'photo', reg.studentName)}
                                disabled={isAssembling}
                              >
                                {isAssembling ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                                Photo
                              </Button>
                            )}
                            {reg.hasMarksCard && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 gap-1.5" 
                                onClick={() => handleViewFile(reg.id, 'marksCard', reg.studentName)}
                                disabled={isAssembling}
                              >
                                {isAssembling ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                                PDF
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
