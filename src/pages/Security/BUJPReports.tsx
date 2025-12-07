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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  CheckCircle, 
  Clock,
  Plus,
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
  Download,
  FileIcon,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

// --- KONFIGURASI ENV ---
const API_URL = import.meta.env.VITE_API_URL || "/api/v1";
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || "/storage";
const API_BASE_URL = `${API_URL}/bujp-reports`;
const AUTH_ME_URL = `${API_URL}/me`;
const STORAGE_BASE_URL = `${STORAGE_URL}`;
const ITEMS_PER_PAGE = 10; // Tampilkan lebih banyak item jika menggunakan Table

// --- SERVICE API ---
const apiService = {
  get: async (url: string) => {
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
  post: async (url: string, body: any, isFormData = false) => {
    const token = localStorage.getItem('token');
    const headers: any = {
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

// --- HELPERS ---
const formatReportType = (type: string) => {
  if (!type) return 'N/A';
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatMonth = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

export default function MedicalAdminPanel() {
  const { toast } = useToast();
  
  // Data and State
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  
  // Dialog States
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState({ action: null as string | null, reportId: null as string | null, notes: '' });
  
  // Filtering
  const [filters, setFilters] = useState({
      month: '',
      year: new Date().getFullYear().toString(),
      status: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [reportType, setReportType] = useState("");
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().substring(0, 7));
  const [reportNotes, setReportNotes] = useState("");

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

  useEffect(() => {
    fetchReports();
  }, [filters]);

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
      const transformedData = (Array.isArray(data) ? data : []).map((report: any) => ({
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
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({...prev, [field]: value}));
    setCurrentPage(1);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
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
        // Optional: Switch tab to history automatically
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
        if (selectedReport && selectedReport.id === reportId) {
             // Refresh detail view if open
             openDetailView(reportId);
        }
    } catch (error) {
        console.error("Status update error:", error);
        toast({ title: "Update Gagal", description: "Terjadi kesalahan saat mengubah status laporan.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
        setIsConfirmOpen(false);
        setConfirmationAction({ action: null, reportId: null, notes: '' });
    }
  };
  
  const openConfirmation = (action: string, reportId: string) => {
    setConfirmationAction({ action, reportId, notes: '' });
    setIsConfirmOpen(true);
  };
  
  const openDetailView = async (reportId: string) => {
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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': 
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Approved</Badge>;
      case 'rejected': 
        return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Rejected</Badge>;
      default: 
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">Pending</Badge>;
    }
  };

  const years = Array.from({length: 5}, (_, i) => (new Date().getFullYear() - i).toString());
  const months = [
      { value: '1', label: 'Januari' }, { value: '2', label: 'Februari' }, { value: '3', label: 'Maret' },
      { value: '4', label: 'April' }, { value: '5', label: 'Mei' }, { value: '6', label: 'Juni' },
      { value: '7', label: 'Juli' }, { value: '8', label: 'Agustus' }, { value: '9', label: 'September' },
      { value: '10', label: 'Oktober' }, { value: '11', label: 'November' }, { value: '12', label: 'Desember' }
  ];

  const canApprove = userPermissions.includes('medical_reports.create');

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl text-white font-bold tracking-tight">Laporan BUJP</h1>
            <p className="text-white">Kelola laporan kegiatan, absensi, dan medis.</p>
          </div>
      </div>
      
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history"><FileText className="h-4 w-4 mr-2"/>Riwayat Data</TabsTrigger>
          <TabsTrigger value="upload"><Plus className="h-4 w-4 mr-2"/>Upload Baru</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Form Upload Laporan</CardTitle>
              <CardDescription>File laporan akan masuk status pending sampai disetujui.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUploadSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
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
                    <Input id="month" type="month" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} required className="block w-full"/>
                  </div>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="file-upload">File Dokumen (PDF)</Label>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                                <p className="text-sm text-gray-500"><span className="font-semibold">Klik untuk upload</span> atau drag and drop</p>
                                <p className="text-xs text-gray-500">PDF (Maks. 2MB)</p>
                            </div>
                            <Input id="file-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} required/>
                        </label>
                    </div>
                    {uploadFile && (
                        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded mt-2">
                            <FileIcon className="h-4 w-4" />
                            {uploadFile.name}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan Tambahan</Label>
                  <Textarea id="notes" placeholder="Tuliskan keterangan jika diperlukan..." value={reportNotes} onChange={(e) => setReportNotes(e.target.value)} className="resize-none" />
                </div>
                
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                    Upload Laporan
                    </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <CardTitle>Data Laporan</CardTitle>
                        <CardDescription>Daftar seluruh laporan yang masuk ke sistem.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input type="search" placeholder="Cari laporan..." className="pl-8 w-[200px] md:w-[300px]" value={searchTerm} onChange={handleSearchChange}/>
                        </div>
                    </div>
                </div>
                
                {/* Filter Toolbar */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Filter:</span>
                    </div>
                    <Select value={filters.year} onValueChange={(v) => handleFilterChange('year', v)}>
                        <SelectTrigger className="w-[100px] h-8"><SelectValue/></SelectTrigger>
                        <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={filters.month} onValueChange={(v) => handleFilterChange('month', v)}>
                        <SelectTrigger className="w-[130px] h-8"><SelectValue placeholder="Bulan"/></SelectTrigger>
                        <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                        <SelectTrigger className="w-[130px] h-8"><SelectValue placeholder="Status"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                    {(filters.month || filters.status) && (
                        <Button variant="ghost" size="sm" onClick={() => setFilters({year: new Date().getFullYear().toString(), month: '', status: ''})} className="h-8 px-2 lg:px-3">
                            Reset
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                  </div>
              ) : paginatedReports.length > 0 ? (
                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[50px]">No</TableHead>
                                <TableHead>Tipe Laporan</TableHead>
                                <TableHead>Periode</TableHead>
                                <TableHead className="hidden md:table-cell">Pengunggah</TableHead>
                                <TableHead className="hidden md:table-cell">Waktu Upload</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedReports.map((report, index) => (
                                <TableRow key={report.id} className="hover:bg-muted/50">
                                    <TableCell className="text-muted-foreground">
                                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{formatReportType(report.type)}</span>
                                            <span className="text-xs text-muted-foreground md:hidden">{report.submitter?.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {formatMonth(report.month)}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                {report.submitter?.name?.charAt(0) || 'U'}
                                            </div>
                                            <span className="text-sm">{report.submitter?.name || report.uploader?.name || '-'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                                        {formatDate(report.created_at)}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(report.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetailView(report.id)}>
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                            
                                            {canApprove && report.status === 'pending' && (
                                                <>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-green-600 hover:bg-green-50" onClick={() => openConfirmation('approved', report.id)}>
                                                        <ThumbsUp className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600 hover:bg-red-50" onClick={() => openConfirmation('rejected', report.id)}>
                                                        <ThumbsDown className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">Tidak ada laporan ditemukan</h3>
                    <p className="text-sm text-gray-500 max-w-sm mt-2">
                        Cobalah ubah filter pencarian atau upload laporan baru jika belum ada data.
                    </p>
                </div>
              )}
            </CardContent>
            {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 p-4 border-t">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                    </Button>
                    <span className="text-sm font-medium px-2">
                        Hal {currentPage} / {totalPages}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Detail Laporan</DialogTitle>
            <DialogDescription>Informasi lengkap mengenai laporan yang dipilih.</DialogDescription>
          </DialogHeader>
          {selectedReport ? (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-xs font-medium uppercase">Tipe Laporan</p>
                        <p className="font-medium">{formatReportType(selectedReport.type)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-xs font-medium uppercase">Periode</p>
                        <p className="font-medium">{formatMonth(selectedReport.month)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-xs font-medium uppercase">Status</p>
                        <div>{getStatusBadge(selectedReport.status)}</div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-xs font-medium uppercase">Pengunggah</p>
                        <p>{selectedReport.submitter?.name || selectedReport.uploader?.name || '-'}</p>
                    </div>
                </div>

                <div className="space-y-2">
                     <p className="text-muted-foreground text-xs font-medium uppercase">Catatan Laporan</p>
                     <div className="bg-muted/50 p-3 rounded-md text-sm">
                        {selectedReport.notes || <span className="text-muted-foreground italic">Tidak ada catatan</span>}
                     </div>
                </div>

                {selectedReport.approvals && selectedReport.approvals.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3">Riwayat Approval</h4>
                    <div className="space-y-3">
                        {selectedReport.approvals.map((approval: any) => (
                          <div key={approval.id} className="flex gap-3 bg-gray-50 p-2 rounded-lg border">
                            {approval.status === 'approved' 
                                ? <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5"/> 
                                : <X className="h-5 w-5 text-red-500 shrink-0 mt-0.5"/>
                            }
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <p className={`text-sm font-semibold ${approval.status === 'approved' ? 'text-green-700' : 'text-red-700'}`}>
                                        {/* PERBAIKAN ERROR DI SINI */}
                                        {(approval.status || 'unknown').toUpperCase()}
                                    </p>
                                    <span className="text-xs text-muted-foreground">{formatDate(approval.created_at)}</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">Oleh: <span className="font-medium">{approval.approver?.name || 'Admin'}</span></p>
                                {approval.notes && <p className="text-xs text-gray-500 mt-1 italic">"{approval.notes}"</p>}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="flex justify-center items-center h-40"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary"/></div>
          )}
          <DialogFooter className="sm:justify-between gap-2 border-t pt-4 mt-2">
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Tutup</Button>
            {selectedReport && (
                <Button asChild>
                    <a href={`${STORAGE_BASE_URL}/${selectedReport.file_path}`} target="_blank" rel="noopener noreferrer" download>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </a>
                </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Tindakan</DialogTitle>
            <DialogDescription>
                Apakah Anda yakin ingin <span className={confirmationAction.action === 'approved' ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                    {confirmationAction.action === 'approved' ? 'MENYETUJUI' : 'MENOLAK'}
                </span> laporan ini?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="approval_notes">Catatan Approval (Wajib jika menolak)</Label>
            <Textarea 
              id="approval_notes" 
              placeholder="Berikan alasan atau keterangan..." 
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
                {confirmationAction.action === 'approved' ? 'Setujui' : 'Tolak'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}