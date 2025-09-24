import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  TrendingDown, 
  TrendingUp,
  Calendar,
  Target
} from "lucide-react";

/**
 * Safety Key Metrics - Public View
 * Display safety performance data in visual dashboard format
 * Accessible to all users for transparency
 */
export default function SafetyMetrics() {
  // Mock data - would come from API in production
  const currentMonth = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  
  const safetyData = {
    fatalities: 0,
    lostTimeInjuries: 2,
    nearMisses: 15,
    frequencyRate: 1.2,
    severityRate: 0.8,
    fatalAccidentRate: 0.0,
    lastUpdate: "2024-01-15",
    targetFR: 2.0,
    targetSR: 1.5
  };

  const monthlyTrend = [
    { month: 'Jul', fr: 1.8, sr: 1.2 },
    { month: 'Aug', fr: 1.5, sr: 0.9 },
    { month: 'Sep', fr: 1.3, sr: 0.8 },
    { month: 'Okt', fr: 1.1, sr: 0.7 },
    { month: 'Nov', fr: 1.0, sr: 0.6 },
    { month: 'Des', fr: 1.2, sr: 0.8 }
  ];

  const getStatusColor = (value: number, target: number) => {
    if (value <= target * 0.5) return "success";
    if (value <= target * 0.8) return "warning";
    return "destructive";
  };

  const getStatusIcon = (value: number, target: number) => {
    if (value <= target * 0.5) return <CheckCircle className="h-4 w-4" />;
    if (value <= target * 0.8) return <AlertTriangle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Safety Key Metrics</h1>
          <p className="text-muted-foreground mt-1">
            Monitoring performa keselamatan kerja - {currentMonth}
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Update terakhir: {safetyData.lastUpdate}
          </span>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="surface-1 border-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fatalities</CardTitle>
            <div className="text-success">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{safetyData.fatalities}</div>
            <p className="text-xs text-muted-foreground">
              Target: 0 • Status: Tercapai
            </p>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
              <span className="text-xs text-success">Zero fatality maintained</span>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-1 border-warning/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lost Time Injuries</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{safetyData.lostTimeInjuries}</div>
            <p className="text-xs text-muted-foreground">
              Kasus dengan waktu hilang kerja
            </p>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-3 w-3 text-success mr-1" />
              <span className="text-xs text-success">Menurun dari bulan lalu</span>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-1 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Near Misses</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{safetyData.nearMisses}</div>
            <p className="text-xs text-muted-foreground">
              Laporan hampir celaka
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-primary mr-1" />
              <span className="text-xs text-primary">Pelaporan meningkat</span>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-1 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Safety Performance</CardTitle>
            <Target className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">Good</div>
            <p className="text-xs text-muted-foreground">
              Overall safety rating
            </p>
            <Progress value={75} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frequency & Severity Rates */}
        <Card className="surface-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Safety Rates</span>
            </CardTitle>
            <CardDescription>
              Perhitungan FR, SR, dan FAR berdasarkan data bulanan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Frequency Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Frequency Rate (FR)</span>
                <Badge variant={getStatusColor(safetyData.frequencyRate, safetyData.targetFR)}>
                  {safetyData.frequencyRate}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(safetyData.frequencyRate, safetyData.targetFR)}
                <Progress 
                  value={(safetyData.frequencyRate / safetyData.targetFR) * 100} 
                  className="flex-1 h-2" 
                />
                <span className="text-sm text-muted-foreground">Target: {safetyData.targetFR}</span>
              </div>
            </div>

            {/* Severity Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Severity Rate (SR)</span>
                <Badge variant={getStatusColor(safetyData.severityRate, safetyData.targetSR)}>
                  {safetyData.severityRate}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(safetyData.severityRate, safetyData.targetSR)}
                <Progress 
                  value={(safetyData.severityRate / safetyData.targetSR) * 100} 
                  className="flex-1 h-2" 
                />
                <span className="text-sm text-muted-foreground">Target: {safetyData.targetSR}</span>
              </div>
            </div>

            {/* Fatal Accident Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Fatal Accident Rate (FAR)</span>
                <Badge variant="success">
                  {safetyData.fatalAccidentRate}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <Progress value={0} className="flex-1 h-2" />
                <span className="text-sm text-muted-foreground">Target: 0</span>
              </div>
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
              Perbandingan FR dan SR per bulan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyTrend.map((data, index) => (
                <div key={data.month} className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium">{data.month}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>FR: {data.fr}</span>
                      <span>SR: {data.sr}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Progress value={(data.fr / 2.5) * 100} className="flex-1 h-1" />
                      <Progress value={(data.sr / 2.0) * 100} className="flex-1 h-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="h-4 w-4 text-success" />
                <span className="font-medium text-success">Tren Positif</span>
              </div>
              <p className="text-sm text-muted-foreground">
                FR dan SR menunjukkan tren menurun dalam 6 bulan terakhir, 
                menandakan peningkatan performa keselamatan kerja.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <Card className="surface-1">
        <CardHeader>
          <CardTitle>Informasi Perhitungan</CardTitle>
          <CardDescription>
            Metodologi dan definisi untuk Safety Key Metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="font-semibold">Frequency Rate (FR)</h4>
            <p className="text-sm text-muted-foreground">
              FR = (Jumlah kecelakaan dengan Lost Time × 1.000.000) / Total jam kerja
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Severity Rate (SR)</h4>
            <p className="text-sm text-muted-foreground">
              SR = (Jumlah hari hilang × 1.000.000) / Total jam kerja
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Fatal Accident Rate (FAR)</h4>
            <p className="text-sm text-muted-foreground">
              FAR = (Jumlah fatality × 100.000.000) / Total jam kerja
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}