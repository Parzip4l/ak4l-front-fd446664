import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  CheckCircle, 
  X,
  Calendar,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * VMS Admin Panel - For administrators and receptionists
 * Approve or reject visitor requests
 */
export default function VMSAdmin() {
  const { toast } = useToast();
  
  const [visitorRequests, setVisitorRequests] = useState([
    {
      id: 1,
      visitorName: "John Doe",
      company: "PT Teknologi Maju",
      purpose: "Meeting dengan tim IT untuk diskusi implementasi sistem baru",
      contactPerson: "Ahmad Rizki",
      visitDate: "2024-01-20",
      visitTime: "10:00",
      duration: "2 jam",
      status: "pending",
      submittedAt: "2024-01-18 14:30",
      submittedBy: "user@ak4l.com"
    },
    {
      id: 2,
      visitorName: "Sarah Johnson",
      company: "CV Mandiri Jaya",
      purpose: "Presentasi proposal kerjasama",
      contactPerson: "Budi Santoso",
      visitDate: "2024-01-22",
      visitTime: "14:00",
      duration: "1.5 jam",
      status: "pending",
      submittedAt: "2024-01-19 09:15",
      submittedBy: "manager@ak4l.com"
    }
  ]);

  const handleApproval = async (id: number, action: 'approved' | 'rejected') => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setVisitorRequests(prev => 
        prev.map(req => 
          req.id === id 
            ? { ...req, status: action, processedAt: new Date().toISOString() }
            : req
        )
      );
      
      const actionText = action === 'approved' ? 'disetujui' : 'ditolak';
      toast({
        title: `Pengajuan ${actionText}`,
        description: `Pengajuan kunjungan telah ${actionText} dan notifikasi akan dikirim`,
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memproses pengajuan",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="warning">Pending</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">VMS Admin Panel</h1>
        <p className="text-muted-foreground mt-1">
          Kelola dan setujui pengajuan kunjungan tamu
        </p>
      </div>

      <Card className="surface-1">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Pengajuan Kunjungan</span>
          </CardTitle>
          <CardDescription>
            Daftar pengajuan yang memerlukan persetujuan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {visitorRequests.map((request) => (
              <div key={request.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-semibold text-lg">{request.visitorName}</h4>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{request.company}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{request.visitDate}</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{request.visitTime}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Tujuan:</span>
                    <p className="text-muted-foreground mt-1">{request.purpose}</p>
                  </div>
                  <div>
                    <span className="font-medium">Contact Person:</span>
                    <p className="text-muted-foreground mt-1">{request.contactPerson}</p>
                  </div>
                  <div>
                    <span className="font-medium">Durasi:</span>
                    <p className="text-muted-foreground mt-1">{request.duration}</p>
                  </div>
                  <div>
                    <span className="font-medium">Diajukan oleh:</span>
                    <p className="text-muted-foreground mt-1">{request.submittedBy}</p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Diajukan pada: {request.submittedAt}
                </div>

                {request.status === 'pending' && (
                  <div className="flex space-x-3 pt-2">
                    <Button
                      size="sm"
                      className="bg-success hover:bg-success/90"
                      onClick={() => handleApproval(request.id, 'approved')}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Setujui
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleApproval(request.id, 'rejected')}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Tolak
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}