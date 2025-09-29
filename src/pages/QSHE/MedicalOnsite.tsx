import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload,
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Eye,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Medical Onsite Reports - File upload and approval tracking
 * Monthly medical reports with document approval workflow
 */
export default function MedicalOnsite() {
  const { toast } = useToast();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [reportDescription, setReportDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Mock data for uploaded reports
  const [reports] = useState([
    {
      id: 1,
      fileName: "Medical_Report_Desember_2023.pdf",
      uploadDate: "2024-01-05",
      uploader: "Dr. Ahmad Rizki",
      status: "approved",
      description: "Laporan medical onsite bulan Desember 2023",
      approvedBy: "Manager QSHE",
      approvalDate: "2024-01-08",
      size: "2.4 MB"
    },
    {
      id: 2,
      fileName: "Medical_Report_November_2023.pdf",
      uploadDate: "2023-12-05",
      uploader: "Dr. Sarah Indira",
      status: "pending",
      description: "Laporan medical onsite bulan November 2023",
      size: "1.8 MB"
    },
    {
      id: 3,
      fileName: "Medical_Report_Oktober_2023.pdf",
      uploadDate: "2023-11-03",
      uploader: "Dr. Ahmad Rizki",
      status: "revision",
      description: "Laporan medical onsite bulan Oktober 2023",
      revisionNote: "Mohon lengkapi data kasus emergency response",
      size: "2.1 MB"
    }
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadFile) {
      toast({
        title: "File tidak dipilih",
        description: "Silakan pilih file untuk diupload",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Upload berhasil",
        description: `File ${uploadFile.name} berhasil diupload dan menunggu approval`,
      });
      
      // Reset form
      setUploadFile(null);
      setReportDescription("");
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      toast({
        title: "Upload gagal",
        description: "Terjadi kesalahan saat upload file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="secondary" className="bg-success/10 text-success border-success/20">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
      case 'revision':
        return <Badge variant="destructive">Needs Revision</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'revision':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Laporan Medical Onsite</h1>
          <p className="text-white mt-1">
            Upload dan monitor persetujuan laporan medical bulanan
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Calendar className="h-4 w-4 text-white" />
          <span className="text-sm text-white">
            Deadline upload: Tanggal 5 setiap bulan
          </span>
        </div>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Laporan</TabsTrigger>
          <TabsTrigger value="history">Riwayat & Status</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card className="surface-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Upload Laporan Baru</span>
              </CardTitle>
              <CardDescription>
                Upload laporan medical onsite bulanan dalam format PDF. Maksimal ukuran file 10MB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">File Laporan (PDF)</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {uploadFile && (
                    <p className="text-sm text-muted-foreground">
                      File dipilih: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi Laporan</Label>
                  <Textarea
                    id="description"
                    placeholder="Masukkan deskripsi laporan (periode, highlights, dll)"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Checklist Sebelum Upload:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>File dalam format PDF dan dapat dibuka dengan baik</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Laporan sudah mencakup semua data medical onsite bulan ini</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Data emergency response dan first aid sudah lengkap</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      <span>Dokumen sudah direview internal sebelum upload</span>
                    </li>
                  </ul>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:opacity-90"
                  disabled={!uploadFile || isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Laporan
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card className="surface-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Riwayat Upload & Status Persetujuan</span>
              </CardTitle>
              <CardDescription>
                Monitor status persetujuan dan download laporan yang telah diupload
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getStatusIcon(report.status)}
                        <div className="space-y-1">
                          <h4 className="font-semibold">{report.fileName}</h4>
                          <p className="text-sm text-muted-foreground">{report.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Upload: {report.uploadDate}</span>
                            <span>By: {report.uploader}</span>
                            <span>Size: {report.size}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(report.status)}
                      </div>
                    </div>

                    {/* Approval Info */}
                    {report.status === 'approved' && (
                      <div className="bg-success/10 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 text-success">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-medium">Approved</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Disetujui oleh {report.approvedBy} pada {report.approvalDate}
                        </p>
                      </div>
                    )}

                    {report.status === 'revision' && (
                      <div className="bg-destructive/10 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-medium">Needs Revision</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {report.revisionNote}
                        </p>
                      </div>
                    )}

                    {report.status === 'pending' && (
                      <div className="bg-warning/10 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 text-warning">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">Pending Approval</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Menunggu review dan persetujuan dari Manager QSHE
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 pt-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        <Eye className="mr-1 h-3 w-3" />
                        Preview
                      </Button>
                      {report.status === 'approved' && (
                        <Button size="sm" variant="outline" className="text-xs">
                          <Download className="mr-1 h-3 w-3" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}