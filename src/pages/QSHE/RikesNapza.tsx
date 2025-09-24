import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  TrendingUp,
  FileText
} from "lucide-react";

/**
 * Laporan Rikes & NAPZA - Health examination and drug test reports
 * Shows attendance and test results in graphical format
 */
export default function RikesNapza() {
  const currentMonth = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  
  // Mock data for Rikes & NAPZA reports
  const healthData = {
    totalEmployees: 450,
    rikesParticipants: 425,
    napzaParticipants: 445,
    rikesAttendance: 94.4,
    napzaAttendance: 98.9,
    lastUpdate: "2024-01-15"
  };

  const monthlyAttendance = [
    { month: 'Jul', rikes: 92, napza: 97 },
    { month: 'Aug', rikes: 89, napza: 95 },
    { month: 'Sep', rikes: 91, napza: 96 },
    { month: 'Okt', rikes: 93, napza: 98 },
    { month: 'Nov', rikes: 94, napza: 99 },
    { month: 'Des', rikes: 94.4, napza: 98.9 }
  ];

  const testResults = {
    rikes: {
      fit: 380,
      fitWithCondition: 40,
      unfit: 5,
      pending: 0
    },
    napza: {
      negative: 440,
      positive: 2,
      pending: 3
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Laporan Rikes & NAPZA</h1>
          <p className="text-muted-foreground mt-1">
            Monitoring kehadiran dan hasil pemeriksaan kesehatan - {currentMonth}
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Update terakhir: {healthData.lastUpdate}
          </span>
        </div>
      </div>

      {/* Attendance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="surface-1 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Karyawan</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{healthData.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Karyawan aktif yang wajib medical check
            </p>
          </CardContent>
        </Card>

        <Card className="surface-1 border-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kehadiran Rikes</CardTitle>
            <Activity className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{healthData.rikesAttendance}%</div>
            <p className="text-xs text-muted-foreground">
              {healthData.rikesParticipants} dari {healthData.totalEmployees} karyawan
            </p>
            <Progress value={healthData.rikesAttendance} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="surface-1 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kehadiran NAPZA</CardTitle>
            <CheckCircle className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{healthData.napzaAttendance}%</div>
            <p className="text-xs text-muted-foreground">
              {healthData.napzaParticipants} dari {healthData.totalEmployees} karyawan
            </p>
            <Progress value={healthData.napzaAttendance} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="surface-1 border-warning/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">96.7%</div>
            <p className="text-xs text-muted-foreground">
              Overall medical compliance
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-success mr-1" />
              <span className="text-xs text-success">Meningkat</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rikes Results */}
        <Card className="surface-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Hasil Pemeriksaan Rikes</span>
            </CardTitle>
            <CardDescription>
              Distribusi hasil pemeriksaan kesehatan berkala
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                <div>
                  <span className="font-medium text-success">Fit</span>
                  <p className="text-sm text-muted-foreground">Sehat dan layak kerja</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-success">{testResults.rikes.fit}</div>
                  <div className="text-xs text-muted-foreground">
                    {((testResults.rikes.fit / healthData.rikesParticipants) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-warning/10 rounded-lg">
                <div>
                  <span className="font-medium text-warning">Fit with Condition</span>
                  <p className="text-sm text-muted-foreground">Sehat dengan syarat</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-warning">{testResults.rikes.fitWithCondition}</div>
                  <div className="text-xs text-muted-foreground">
                    {((testResults.rikes.fitWithCondition / healthData.rikesParticipants) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg">
                <div>
                  <span className="font-medium text-destructive">Unfit</span>
                  <p className="text-sm text-muted-foreground">Tidak layak kerja</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-destructive">{testResults.rikes.unfit}</div>
                  <div className="text-xs text-muted-foreground">
                    {((testResults.rikes.unfit / healthData.rikesParticipants) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NAPZA Results */}
        <Card className="surface-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Hasil Test NAPZA</span>
            </CardTitle>
            <CardDescription>
              Distribusi hasil tes narkoba, psikotropika, dan zat adiktif
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                <div>
                  <span className="font-medium text-success">Negatif</span>
                  <p className="text-sm text-muted-foreground">Bebas NAPZA</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-success">{testResults.napza.negative}</div>
                  <div className="text-xs text-muted-foreground">
                    {((testResults.napza.negative / healthData.napzaParticipants) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-destructive/10 rounded-lg">
                <div>
                  <span className="font-medium text-destructive">Positif</span>
                  <p className="text-sm text-muted-foreground">Terdeteksi NAPZA</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-destructive">{testResults.napza.positive}</div>
                  <div className="text-xs text-muted-foreground">
                    {((testResults.napza.positive / healthData.napzaParticipants) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <span className="font-medium">Pending</span>
                  <p className="text-sm text-muted-foreground">Menunggu hasil</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{testResults.napza.pending}</div>
                  <div className="text-xs text-muted-foreground">
                    {((testResults.napza.pending / healthData.napzaParticipants) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Attendance Trend */}
      <Card className="surface-1">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Trend Kehadiran 6 Bulan Terakhir</span>
          </CardTitle>
          <CardDescription>
            Perbandingan tingkat kehadiran Rikes dan NAPZA per bulan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyAttendance.map((data) => (
              <div key={data.month} className="flex items-center space-x-4">
                <div className="w-12 text-sm font-medium">{data.month}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Rikes: {data.rikes}%</span>
                    <span>NAPZA: {data.napza}%</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Progress value={data.rikes} className="h-2" />
                    </div>
                    <div className="flex-1">
                      <Progress value={data.napza} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="font-medium text-success">Tren Positif</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Tingkat kehadiran Rikes dan NAPZA menunjukkan tren stabil dengan peningkatan compliance.
              NAPZA mencapai target &gt;95% secara konsisten.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button className="bg-gradient-primary hover:opacity-90">
          <FileText className="mr-2 h-4 w-4" />
          Unduh Laporan Lengkap
        </Button>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Jadwal Pemeriksaan
        </Button>
        <Button variant="outline">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Follow Up Cases
        </Button>
      </div>
    </div>
  );
}