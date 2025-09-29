import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Upload,
  Eye
} from "lucide-react";

/**
 * Security Personnel Competency Monitoring
 * Matrix display and document management for security staff competency
 */
export default function CompetencyMonitoring() {
  // Mock competency data
  const competencyMatrix = [
    {
      id: 1,
      name: "Ahmad Susanto",
      position: "Security Supervisor",
      certifications: {
        basicSecurity: { status: "valid", expiry: "2024-08-15", document: "cert_001.pdf" },
        fireEvacuation: { status: "expired", expiry: "2023-12-01", document: null },
        firstAid: { status: "valid", expiry: "2024-06-20", document: "cert_002.pdf" }
      },
      overallScore: 75
    },
    {
      id: 2,
      name: "Budi Santoso",
      position: "Security Guard",
      certifications: {
        basicSecurity: { status: "valid", expiry: "2024-10-12", document: "cert_003.pdf" },
        fireEvacuation: { status: "valid", expiry: "2024-05-18", document: "cert_004.pdf" },
        firstAid: { status: "pending", expiry: null, document: null }
      },
      overallScore: 85
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge variant="success">Valid</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8 relative">
      <div>
        <h1 className="text-3xl font-bold text-white">Monitoring Kompetensi Personil Security</h1>
        <p className="text-white mt-1">
          Matriks kompetensi dan dokumentasi sertifikat personel security
        </p>
      </div>

      {/* Competency Matrix */}
      <Card className="surface-1">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Matriks Kompetensi Personel</span>
          </CardTitle>
          <CardDescription>
            Status sertifikasi dan kompetensi seluruh personel security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {competencyMatrix.map((person) => (
              <div key={person.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{person.name}</h4>
                    <p className="text-sm text-muted-foreground">{person.position}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{person.overallScore}%</div>
                    <Progress value={person.overallScore} className="w-20 h-2 mt-1" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Basic Security</span>
                      {getStatusBadge(person.certifications.basicSecurity.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Exp: {person.certifications.basicSecurity.expiry || 'N/A'}
                    </p>
                    <div className="flex space-x-2 mt-2">
                      {person.certifications.basicSecurity.document && (
                        <Button size="sm" variant="outline" className="text-xs">
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Fire Evacuation</span>
                      {getStatusBadge(person.certifications.fireEvacuation.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Exp: {person.certifications.fireEvacuation.expiry || 'N/A'}
                    </p>
                    <div className="flex space-x-2 mt-2">
                      {person.certifications.fireEvacuation.document ? (
                        <Button size="sm" variant="outline" className="text-xs">
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="text-xs">
                          <Upload className="mr-1 h-3 w-3" />
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">First Aid</span>
                      {getStatusBadge(person.certifications.firstAid.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Exp: {person.certifications.firstAid.expiry || 'N/A'}
                    </p>
                    <div className="flex space-x-2 mt-2">
                      {person.certifications.firstAid.document ? (
                        <Button size="sm" variant="outline" className="text-xs">
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="text-xs">
                          <Upload className="mr-1 h-3 w-3" />
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}