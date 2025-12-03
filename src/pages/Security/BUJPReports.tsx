"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle, 
  AlertCircle,
  Clock,
  Plus,
  User,
  Eye,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  X,
  FileText,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";

const API_URL = import.meta.env.VITE_API_URL || "/api/v1";
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || "/storage";

const API_BASE_URL = `${API_URL}/bujp-reports`;
const AUTH_ME_URL = `${API_URL}/me`;
const STORAGE_BASE_URL = `${STORAGE_URL}/storage`;
const ITEMS_PER_PAGE = 5;

// API service to handle network requests
const apiService = {
  get: async (url) => {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
  post: async (url, body, isFormData = false) => {
    const token = localStorage.getItem('token');
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
    };
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }
};

const formatReportType = (type) => {
  if (!type) return 'N/A';
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function MedicalAdminPanel() {
  const { toast } = useToast();
  
  // Data and State
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  
  // Dialog States
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState({ action: null, reportId: null, notes: '' });
  
  // Filtering, Search, and Pagination
  const [filters, setFilters] = useState({
      month: '',
      year: new Date().getFullYear().toString(),
      status: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Form State
  const [uploadFile, setUploadFile] = useState(null);
  const [reportType, setReportType] = useState("");
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().substring(0, 7));
  const [reportNotes, setReportNotes] = useState("");

  // Set user permissions on component mount
  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const meData = await apiService.get(AUTH_ME_URL);
        if (meData && Array.isArray(meData.permissions)) {
          setUserPermissions(meData.permissions);
        }
      } catch (error) {
        console.error("Failed to fetch user permissions:", error);
      }
    };
    fetchUserPermissions();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    fetchReports();
  }, [filters]);

  // Fetch data based on filters
  const fetchReports = async () => {
    setIsLoading(true);
    try {
      let url = API_BASE_URL;
      const params = new URLSearchParams();
      if (filters.month) params.append('month', filters.month);
      if (filters.year) params.append('year', filters.year);
      if (filters.status) params.append('status', filters.status);
      
      if (params.toString()) {
        url = `${API_BASE_URL}/filter?${params.toString()}`;
      }
      
      const data = await apiService.get(url);
      const transformedData = (Array.isArray(data) ? data : []).map(report => ({
        ...report,
        fileName: report.file_path ? report.file_path.split('/').pop() : 'N/A'
      }));
      setReports(transformedData);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      toast({
        title: "Gagal Memuat Data",
        description: "Tidak dapat mengambil data laporan dari server.",
        variant: "destructive",
      });
      setReports([]); // Reset to empty array on error
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({...prev, [field]: value}));
    setCurrentPage(1); // Reset pagination on filter change
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset pagination on search
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile || !reportType || !reportMonth) {
        toast({ title: "Data Tidak Lengkap", description: "Tipe, bulan, dan file wajib diisi.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("type", reportType);
    formData.append("month", `${reportMonth}-01`);
    formData.append("file", uploadFile);
    formData.append("notes", reportNotes);

    try {
        await apiService.post(API_BASE_URL, formData, true);
        toast({ title: "Upload Berhasil", description: "Laporan baru telah ditambahkan dan menunggu approval." });
        setUploadFile(null); setReportType(""); setReportMonth(new Date().toISOString().substring(0, 7)); setReportNotes("");
        fetchReports(); 
    } catch (error) {
        console.error("Upload error:", error);
        toast({ title: "Upload Gagal", description: "Terjadi kesalahan saat mengupload file.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async () => {
    const { action, reportId, notes } = confirmationAction;
    if (!action || !reportId) return;

    setIsSubmitting(true);
    try {
        const url = `${API_BASE_URL}/${reportId}/approve`;
        await apiService.post(url, { status: action, notes });
        toast({ title: "Status Berhasil Diupdate" });
        fetchReports(); 
    } catch (error) {
        console.error("Status update error:", error);
        toast({ title: "Update Gagal", description: "Terjadi kesalahan saat mengubah status laporan.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
        setIsConfirmOpen(false);
        setConfirmationAction({ action: null, reportId: null, notes: '' });
    }
  };
  
  const openConfirmation = (action, reportId) => {
    setConfirmationAction({ action, reportId, notes: '' });
    setIsConfirmOpen(true);
  };
  
  const openDetailView = async (reportId) => {
      try {
        const reportDetails = await apiService.get(`${API_BASE_URL}/${reportId}`);
        const transformedDetails = {
          ...reportDetails,
          fileName: reportDetails.file_path ? reportDetails.file_path.split('/').pop() : 'N/A'
        };
        setSelectedReport(transformedDetails);
        setIsDetailOpen(true);
      } catch (error) {
        console.error("Failed to fetch report details:", error);
        toast({ title: "Gagal Memuat Detail", variant: "destructive" });
      }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({ title: "Format Salah", description: "Hanya file PDF yang diizinkan.", variant: "destructive" });
        return;
      }
      if (file.size > 2 * 1024 * 1024) { 
        toast({ title: "File Terlalu Besar", description: "Ukuran maksimal file adalah 2MB.", variant: "destructive" });
        return;
      }
      setUploadFile(file);
    }
  };
  
  const searchedReports = useMemo(() => {
    if (!Array.isArray(reports)) return [];
    if (!searchTerm) return reports;

    const lowercasedFilter = searchTerm.toLowerCase();
    return reports.filter(report => {
        const uploaderName = (report.submitter?.name || report.uploader?.name || '').toLowerCase();
        const reportType = formatReportType(report.type).toLowerCase();
        const fileName = (report.fileName || '').toLowerCase();

        return (
            uploaderName.includes(lowercasedFilter) ||
            reportType.includes(lowercasedFilter) ||
            fileName.includes(lowercasedFilter)
        );
    });
  }, [reports, searchTerm]);

  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return searchedReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [searchedReports, currentPage]);
  
  const totalPages = Math.ceil(searchedReports.length / ITEMS_PER_PAGE);
  
  const getStatusProps = (status) => {
    switch (status) {
      case 'approved': return { icon: <CheckCircle className="h-5 w-5 text-green-600" />, badge: <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>, color: 'text-green-600' };
      case 'rejected': return { icon: <X className="h-5 w-5 text-red-600" />, badge: <Badge variant="destructive">Rejected</Badge>, color: 'text-red-600' };
      default: return { icon: <Clock className="h-5 w-5 text-yellow-600" />, badge: <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>, color: 'text-yellow-600' };
    }
  };

  const years = Array.from({length: 10}, (_, i) => (new Date().getFullYear() - i).toString());
  const months = [
      { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' }, { value: '3', label: 'Maret' },
      { value: '4', label: 'April' }, { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
      { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' }, { value: '9', label: 'September' },
      { value: '10', label: 'Oktober' }, { value: '11', label: 'November' }, { value: '12', label: 'Desember' }
  ];

  const canApprove = userPermissions.includes('medical_reports.create');

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8 relative">
      <h1 className="text-3xl font-bold text-white">BUJP Report Admin Panel</h1>
      
      <Tabs defaultValue="history">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload"><Plus className="h-4 w-4 mr-2"/>Upload Laporan</TabsTrigger>
          <TabsTrigger value="history"><FileText className="h-4 w-4 mr-2"/>Riwayat & Approval</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Laporan Baru</CardTitle>
              <CardDescription>Isi detail laporan dan upload file PDF (maks 2MB).</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUploadSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipe Laporan</Label>
                    <Select value={reportType} onValueChange={setReportType} required>
                        <SelectTrigger><SelectValue placeholder="Pilih tipe..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="kegiatan">Laporan Kegiatan</SelectItem>
                            <SelectItem value="absensi">Absensi Kehadiran</SelectItem>
                            <SelectItem value="obat">Penggunaan Obat</SelectItem>
                            <SelectItem value="limbah">Laporan Limbah</SelectItem>
                            <SelectItem value="lain">Laporan Lain</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="month">Periode Bulan</Label>
                    <Input id="month" type="month" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} required/>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file-upload">File Laporan</Label>
                  <Input id="file-upload" type="file" accept=".pdf" onChange={handleFileChange} required/>
                  {uploadFile && <p className="text-sm text-muted-foreground">File: {uploadFile.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan (Opsional)</Label>
                  <Textarea id="notes" placeholder="Deskripsi singkat..." value={reportNotes} onChange={(e) => setReportNotes(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                  {isSubmitting ? 'Mengunggah...' : 'Upload Laporan'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle>Riwayat Laporan</CardTitle>
                    <CardDescription>Review, setujui, atau tolak laporan yang masuk.</CardDescription>
                  </div>
                  <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="search" placeholder="Cari file, tipe, atau uploader..." className="pl-8 sm:w-[300px]" value={searchTerm} onChange={handleSearchChange}/>
                  </div>
              </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-4 p-4 mb-4 border rounded-lg bg-gray-50">
                    <div className="flex-1 space-y-2"><Label>Tahun</Label><Select value={filters.year} onValueChange={(v) => handleFilterChange('year', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select></div>
                    <div className="flex-1 space-y-2"><Label>Bulan</Label><Select value={filters.month} onValueChange={(v) => handleFilterChange('month', v)}><SelectTrigger><SelectValue placeholder="Semua Bulan"/></SelectTrigger><SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent></Select></div>
                    <div className="flex-1 space-y-2"><Label>Status</Label><Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}><SelectTrigger><SelectValue placeholder="Semua Status"/></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select></div>
                </div>

              {isLoading ? <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div> : 
              paginatedReports.length > 0 ? (
                <div className="space-y-4">
                  {paginatedReports.map((report) => {
                    const status = getStatusProps(report.status);
                    return (
                    <Card key={report.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="mt-1">{status.icon}</div>
                            <div>
                              <p className="font-semibold text-gray-800">{report.type || 'N/A'}</p>
                              <div className="text-sm text-muted-foreground space-y-1 mt-1">
                                <p><strong>Tipe:</strong> {formatReportType(report.type)}</p>
                                <p><strong>Periode:</strong> {new Date(report.month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
                                <p><strong>Uploader:</strong> {report.submitter?.name || report.uploader?.name || 'N/A'}</p>
                                <p><strong>Diupload pada:</strong> {formatDate(report.created_at)}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 mt-4 sm:mt-0 self-start">
                             {status.badge}
                             <Button size="icon" variant="outline" onClick={() => openDetailView(report.id)}><Eye className="h-4 w-4"/></Button>
                             {canApprove && report.status === 'pending' && (
                              <>
                                 <Button size="icon" className="bg-green-600 hover:bg-green-700" onClick={() => openConfirmation('approved', report.id)}><ThumbsUp className="h-4 w-4"/></Button>
                                 <Button size="icon" variant="destructive" onClick={() => openConfirmation('rejected', report.id)}><ThumbsDown className="h-4 w-4"/></Button>
                              </>
                             )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )})}
                </div>
              ) : <p className="text-center text-muted-foreground py-8">Tidak ada data yang cocok dengan filter atau pencarian.</p>}
              
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-6">
                  <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                  <span className="text-sm">Halaman {currentPage} dari {totalPages}</span>
                  <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Laporan</DialogTitle>
          </DialogHeader>
          {selectedReport ? (
            <>
              <div className="space-y-3 py-4 text-sm">
                <p><strong>File:</strong> {selectedReport.fileName || 'N/A'}</p>
                <p><strong>Uploader:</strong> {selectedReport.submitter?.name || selectedReport.uploader?.name || 'N/A'}</p>
                <p><strong>Bulan:</strong> {new Date(selectedReport.month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
                <p><strong>Tipe:</strong> {formatReportType(selectedReport.type)}</p>
                <p><strong>Status:</strong> <span className={getStatusProps(selectedReport.status).color}>{selectedReport.status}</span></p>
                <p><strong>Catatan Laporan:</strong> {selectedReport.notes || '-'}</p>
                {selectedReport.approvals?.length > 0 && (
                  <div className="pt-4 mt-4 border-t">
                    <h4 className="font-semibold text-gray-800 mb-3">Riwayat Approval</h4>
                     <div className="space-y-4">
                        {selectedReport.approvals.map(approval => (
                          <div key={approval.id} className="flex items-start space-x-3">
                            {approval.status === 'approved' ? <CheckCircle className="h-5 w-5 text-green-500 mt-px"/> : <X className="h-5 w-5 text-red-500 mt-px"/>}
                            <div className="flex-1">
                              <p className={`font-semibold ${approval.status === 'approved' ? 'text-green-700' : 'text-red-700'}`}>{approval.status.toUpperCase()}</p>
                              <p className="text-sm text-gray-600">Oleh: <span className="font-medium">{approval.approver?.name || 'N/A'}</span></p>
                              {approval.notes && <p className="text-sm text-gray-500 mt-1 bg-gray-50 p-2 rounded-md italic">"{approval.notes}"</p>}
                              <p className="text-xs text-gray-400 mt-1">{formatDate(approval.created_at)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button asChild variant="outline">
                  <a href={`${STORAGE_BASE_URL}/${selectedReport.file_path}`} target="_blank" rel="noopener noreferrer" download={selectedReport.fileName}>
                    <Download className="mr-2 h-4 w-4" />
                    Download File
                  </a>
                </Button>
              </DialogFooter>
            </>
          ) : <div className="flex justify-center items-center h-40"><Loader2 className="mx-auto h-8 w-8 animate-spin"/></div>}
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Tindakan</DialogTitle>
            <DialogDescription>
                Anda akan {confirmationAction.action === 'approved' ? 'menyetujui' : 'menolak'} laporan ini. Mohon berikan catatan (wajib jika menolak).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="approval_notes">Catatan</Label>
            <Textarea 
              id="approval_notes" 
              placeholder="Tambahkan catatan untuk tindakan ini..." 
              value={confirmationAction.notes}
              onChange={(e) => setConfirmationAction(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsConfirmOpen(false)}>Batal</Button>
            <Button 
                onClick={handleStatusUpdate} 
                disabled={isSubmitting || (confirmationAction.action === 'rejected' && !confirmationAction.notes)}
                className={confirmationAction.action === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Konfirmasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

