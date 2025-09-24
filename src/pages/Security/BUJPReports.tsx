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
 * BUJP Reports - Badan Usaha Jasa Pengamanan reports management
 * File upload system with approval workflow for security service reports
 */
export default function BUJPReports() {
  const { toast } = useToast();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [reportDescription, setReportDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Mock data for BUJP reports
  const [reports] = useState([
    {
      id: 1,
      fileName: "BUJP_Report_Desember_2023.pdf",
      uploadDate: "2024-01-05",
      uploader: "Security Manager",
      status: "approved",
      description: "Laporan bulanan kinerja BUJP Desember 2023",
      approvedBy: "General Manager",
      approvalDate: "2024-01-08",
      size: "3.2 MB",
      reportType: "monthly"
    },
    {
      id: 2,
      fileName: "BUJP_Incident_Report_20231128.pdf",
      uploadDate: "2023-11-29",
      uploader: "Security Supervisor",
      status: "pending",
      description: "Laporan insiden keamanan tanggal 28 November 2023",
      size: "1.5 MB",
      reportType: "incident"
    },
    {
      id: 3,
      fileName: "BUJP_Performance_Report_Q4_2023.pdf",
      uploadDate: "2023-10-15",
      uploader: "Security Manager",
      status: "revision",
      description: "Laporan performa kuartalan Q4 2023",
      revisionNote: "Mohon tambahkan data response time dan KPI achievement",
      size: "2.8 MB",
      reportType: "quarterly"
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
        description: "Silakan pilih file BUJP report untuk diupload",
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
      const fileInput = document.getElementById('bujp-file-upload') as HTMLInputElement;
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
        return <Badge variant="success">Approved</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
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

  const getReportTypeBadge = (type: string) => {
    switch (type) {
      case 'monthly':
        return <Badge variant="secondary" className="bg-primary/10 text-primary">Monthly</Badge>;
      case 'quarterly':
        return <Badge variant="secondary" className="bg-accent/10 text-accent">Quarterly</Badge>;
      case 'incident':
        return <Badge variant="secondary" className="bg-warning/10 text-warning">Incident</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Laporan BUJP</h1>
          <p className="text-muted-foreground mt-1">
            Upload dan monitor laporan Badan Usaha Jasa Pengamanan
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Upload berkala sesuai kontrak BUJP
          </span>
        </div>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Laporan</TabsTrigger>
          <TabsTrigger value="reports">Semua Laporan</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card className="surface-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Upload Laporan BUJP Baru</span>
              </CardTitle>
              <CardDescription>
                Upload laporan dari vendor BUJP dalam format PDF. File akan direview sebelum disetujui.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="bujp-file-upload">File Laporan (PDF)</Label>
                  <Input
                    id="bujp-file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
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
                  <Label htmlFor="bujp-description">Deskripsi Laporan</Label>
                  <Textarea
                    id="bujp-description"
                    placeholder="Masukkan deskripsi laporan (jenis, periode, hal penting, dll)"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Jenis Laporan BUJP:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                      <h5 className="font-medium">Laporan Bulanan</h5>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Performance summary</li>
                        <li>• Incident reports</li>
                        <li>• Personnel attendance</li>
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-medium">Laporan Insiden</h5>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Security incidents</li>
                        <li>• Emergency response</li>
                        <li>• Investigation results</li>
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-medium">Laporan Khusus</h5>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Training reports</li>
                        <li>• Equipment status</li>
                        <li>• Compliance audit</li>
                      </ul>
                    </div>
                  </div>
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
                      Upload Laporan BUJP
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card className="surface-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Semua Laporan BUJP & Status</span>
              </CardTitle>
              <CardDescription>
                Monitor semua laporan BUJP dan status persetujuannya
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
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold">{report.fileName}</h4>
                            {getReportTypeBadge(report.reportType)}
                          </div>
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

                    {/* Status-specific information */}
                    {report.status === 'approved' && (
                      <div className="bg-success/10 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 text-success">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-medium">Approved & Archived</span>
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
                          <span className="font-medium">Under Review</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Sedang dalam proses review oleh Management
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
                      {report.status === 'revision' && (
                        <Button size="sm" className="text-xs bg-gradient-primary hover:opacity-90">
                          <Upload className="mr-1 h-3 w-3" />
                          Re-upload
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