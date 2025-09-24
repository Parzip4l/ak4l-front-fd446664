import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Car,
  Calendar,
  TrendingDown,
  TrendingUp,
  CheckCircle
} from "lucide-react";

/**
 * Security Key Metrics - Public View
 * Display security performance data and incident tracking
 * Accessible to all users for transparency
 */
export default function SecurityMetrics() {
  const currentMonth = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  
  // Mock security data
  const securityData = {
    criminalCases: 1,
    bombThreats: 0,
    theftCases: 2,
    vandalism: 0,
    unauthorizedAccess: 3,
    vehicleIncidents: 1,
    totalVisitors: 847,
    approvedVisitors: 832,
    rejectedVisitors: 15,
    lastUpdate: "2024-01-15"
  };

  const monthlyTrend = [
    { month: 'Jul', criminal: 2, theft: 1, access: 4, visitors: 756 },
    { month: 'Aug', criminal: 1, theft: 0, access: 2, visitors: 698 },
    { month: 'Sep', criminal: 0, theft: 1, access: 1, visitors: 723 },
    { month: 'Okt', criminal: 1, theft: 0, access: 2, visitors: 789 },
    { month: 'Nov', criminal: 0, theft: 1, access: 1, visitors: 812 },
    { month: 'Des', criminal: 1, theft: 2, access: 3, visitors: 847 }
  ];

  const securityIncidents = [
    {
      type: "Kasus Kriminal",
      count: securityData.criminalCases,
      description: "Tindak pidana dalam area kerja",
      severity: "high",
      trend: "stable"
    },
    {
      type: "Ancaman Bom",
      count: securityData.bombThreats,
      description: "Laporan ancaman bom atau teror",
      severity: "critical",
      trend: "stable"
    },
    {
      type: "Pencurian",
      count: securityData.theftCases,
      description: "Kasus kehilangan atau pencurian",
      severity: "medium",
      trend: "up"
    },
    {
      type: "Akses Tidak Sah",
      count: securityData.unauthorizedAccess,
      description: "Pelanggaran akses area terbatas",
      severity: "medium",
      trend: "up"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive bg-destructive/10';
      case 'high': return 'text-warning bg-warning/10';
      case 'medium': return 'text-primary bg-primary/10';
      default: return 'text-success bg-success/10';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-destructive" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-success" />;
      default: return <div className="w-3 h-3 rounded-full bg-muted"></div>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Key Metrics</h1>
          <p className="text-muted-foreground mt-1">
            Monitoring performa keamanan dan insiden - {currentMonth}
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Update terakhir: {securityData.lastUpdate}
          </span>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="surface-1 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Secure</div>
            <p className="text-xs text-muted-foreground">
              Overall security condition
            </p>
            <div className="flex items-center mt-2">
              <CheckCircle className="h-3 w-3 text-success mr-1" />
              <span className="text-xs text-success">Normal operations</span>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-1 border-warning/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {securityData.criminalCases + securityData.theftCases + securityData.unauthorizedAccess}
            </div>
            <p className="text-xs text-muted-foreground">
              Security incidents this month
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-warning mr-1" />
              <span className="text-xs text-warning">Perlu monitoring</span>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-1 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitor Traffic</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{securityData.totalVisitors}</div>
            <p className="text-xs text-muted-foreground">
              Total kunjungan bulan ini
            </p>
            <Progress value={(securityData.approvedVisitors / securityData.totalVisitors) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="surface-1 border-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {((securityData.approvedVisitors / securityData.totalVisitors) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Visitor approval rate
            </p>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
              <span className="text-xs text-success">Excellent</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Incidents Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="surface-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Breakdown Insiden Keamanan</span>
            </CardTitle>
            <CardDescription>
              Detail jenis insiden dan tingkat keparahan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {securityIncidents.map((incident) => (
              <div key={incident.type} className={`p-3 rounded-lg ${getSeverityColor(incident.severity)}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{incident.type}</span>
                    <p className="text-sm opacity-75 mt-1">{incident.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold">{incident.count}</span>
                    {getTrendIcon(incident.trend)}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium">Security Assessment</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Level keamanan dalam kondisi normal dengan beberapa insiden minor yang masih dalam batas toleran.
                Fokus monitoring pada akses tidak sah yang mengalami peningkatan.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="surface-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5" />
              <span>Trend 6 Bulan Terakhir</span>
            </CardTitle>
            <CardDescription>
              Perbandingan insiden dan traffic kunjungan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyTrend.map((data) => (
                <div key={data.month} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{data.month}</span>
                    <Badge variant="secondary" className="text-xs">
                      {data.visitors} visitors
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Criminal:</span>
                      <span className={data.criminal > 0 ? 'text-destructive font-medium' : 'text-success'}>{data.criminal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Theft:</span>
                      <span className={data.theft > 0 ? 'text-warning font-medium' : 'text-success'}>{data.theft}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Access:</span>
                      <span className={data.access > 0 ? 'text-primary font-medium' : 'text-success'}>{data.access}</span>
                    </div>
                  </div>
                  <Progress 
                    value={(data.visitors / 900) * 100} 
                    className="h-1" 
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">Traffic Insight</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Traffic kunjungan menunjukkan peningkatan konsisten, mencerminkan aktivitas bisnis yang positif.
                Insiden keamanan relatif stabil dengan fokus pada preventive measures.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visitor Management Overview */}
      <Card className="surface-1">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Visitor Management Overview</span>
          </CardTitle>
          <CardDescription>
            Summary aktivitas visitor management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <div className="text-2xl font-bold text-success mb-2">
                {securityData.approvedVisitors}
              </div>
              <p className="text-sm font-medium text-success">Approved</p>
              <p className="text-xs text-muted-foreground mt-1">
                {((securityData.approvedVisitors / securityData.totalVisitors) * 100).toFixed(1)}% dari total
              </p>
            </div>
            
            <div className="text-center p-4 bg-destructive/10 rounded-lg">
              <div className="text-2xl font-bold text-destructive mb-2">
                {securityData.rejectedVisitors}
              </div>
              <p className="text-sm font-medium text-destructive">Rejected</p>
              <p className="text-xs text-muted-foreground mt-1">
                {((securityData.rejectedVisitors / securityData.totalVisitors) * 100).toFixed(1)}% dari total
              </p>
            </div>
            
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-2">
                {securityData.totalVisitors}
              </div>
              <p className="text-sm font-medium text-primary">Total Visits</p>
              <p className="text-xs text-muted-foreground mt-1">
                Semua pengajuan kunjungan
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}