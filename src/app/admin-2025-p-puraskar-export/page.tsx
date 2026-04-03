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

  const handleDownloadCSV = () => {
    if (registrations.length === 0) return;

    // Headers for the CSV
    const headers = [
      'Submission Date',
      'Student Name',
      'Email',
      'Father Name',
      'Mother Name',
      'Relationship',
      'Course',
      'Year of Passing',
      'Board',
      'Stream',
      'Combination',
      'Marks Obtained',
      'Total Marks',
      'Percentage',
      'CGPA',
      'File ID (Student ID)'
    ];

    const csvRows = registrations.map(reg => {
      const date = reg.createdAt?.toDate ? reg.createdAt.toDate().toLocaleString() : 'N/A';
      return [
        `"${date}"`,
        `"${reg.studentName || ''}"`,
        `"${reg.email || ''}"`,
        `"${reg.fatherName || ''}"`,
        `"${reg.motherName || ''}"`,
        `"${reg.relationship || ''}"`,
        `"${reg.course || ''}"`,
        `"${reg.yearOfPassing || ''}"`,
        `"${reg.board || ''}"`,
        `"${reg.pucStream || ''}"`,
        `"${reg.combination || ''}"`,
        `"${reg.marksObtained || ''}"`,
        `"${reg.totalMarks || ''}"`,
        `"${reg.percentage || ''}"`,
        `"${reg.cgpa || ''}"`,
        `"${reg.id}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `registrations_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <Button onClick={handleDownloadCSV} className="font-bold gap-2">
            <Download className="w-4 h-4" /> Export All to Excel (CSV)
          </Button>
        </div>

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
                        <TableCell className="text-slate-500 text-xs">
                          {reg.createdAt?.toDate ? reg.createdAt.toDate().toLocaleDateString() : 'N/A'}
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
