"use client";

import { useEffect, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// URL API diambil dari environment variable
const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

export default function SafetyMetrics() {
  const [safetyData, setSafetyData] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [loading, setLoading] = useState(true);

  // Fetch data dari dua API
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error("Authentication token not available in localStorage.");
        setLoading(false);
        return;
      }

      const headers = {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      };

      try {
        // Ambil data bulanan
        const monthlyDataRes = await fetch(`${API_URL}/latest-by-month?year=${selectedMonth.split("-")[0]}&month=${selectedMonth.split("-")[1]}`, { headers });
        const monthlyData = await monthlyDataRes.json();

        // Ambil data trend 6 bulan
        const trendDataRes = await fetch(`${API_URL}/safety-metrics/summary/monthly?year=${new Date().getFullYear()}`, { headers });
        const trendData = await trendDataRes.json();

        // Gabungkan data yang dibutuhkan
        setSafetyData({
          fatalities: monthlyData.fatality,
          lostTimeInjuries: monthlyData.lost_time_injuries,
          nearMisses: monthlyData.near_miss,
          frequencyRate: parseFloat(monthlyData.fr),
          severityRate: parseFloat(monthlyData.sr),
          fatalAccidentRate: parseFloat(monthlyData.far),
          lastUpdate: new Date(monthlyData.updated_at).toLocaleDateString('id-ID'),
          targetFR: 1.0,
          targetSR: 1.5,
          targetFAR: 0,
        });

        // Filter data trend untuk 6 bulan terakhir
        const currentMonthIndex = new Date().getMonth();
        const sixMonthsAgoIndex = (currentMonthIndex - 5 + 12) % 12;
        const trend = [];
        for (let i = 0; i < 6; i++) {
          const index = (sixMonthsAgoIndex + i) % 12;
          trend.push(trendData[index]);
        }
        setMonthlyTrend(trend);
        
      } catch (error) {
        console.error("Error fetching safety metrics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedMonth]);
  
  const getStatusColor = (value, target) => {
    if (value <= target) return "success";
    if (value <= target * 1.5) return "warning";
    return "destructive";
  };

  const getStatusIcon = (value, target) => {
    if (value <= target) return <CheckCircle className="h-4 w-4 text-success" />;
    if (value <= target * 1.5) return <AlertTriangle className="h-4 w-4 text-warning" />;
    return <AlertTriangle className="h-4 w-4 text-destructive" />;
  };

  const getTrendSummary = () => {
    if (monthlyTrend.length < 2) {
      return {
        text: "Data tren belum cukup untuk analisis.",
        color: "text-muted-foreground",
        Icon: TrendingUp,
      };
    }
    
    // Check if both FR and SR are trending down
    const isFRDown = monthlyTrend.slice(1).every((data, i) => data.fr <= monthlyTrend[i].fr);
    const isSRDown = monthlyTrend.slice(1).every((data, i) => data.sr <= monthlyTrend[i].sr);
    const isFRUp = monthlyTrend.slice(1).every((data, i) => data.fr >= monthlyTrend[i].fr);
    const isSRUp = monthlyTrend.slice(1).every((data, i) => data.sr >= monthlyTrend[i].sr);

    if (isFRDown && isSRDown) {
      return {
        text: "FR dan SR menunjukkan tren menurun dalam 6 bulan terakhir, menandakan peningkatan performa keselamatan kerja.",
        color: "text-success",
        Icon: TrendingDown,
      };
    } else if (isFRUp && isSRUp) {
      return {
        text: "FR dan SR menunjukkan tren meningkat dalam 6 bulan terakhir, menandakan penurunan performa keselamatan kerja.",
        color: "text-destructive",
        Icon: TrendingUp,
      };
    } else {
      return {
        text: "Tren FR dan SR bervariasi dalam 6 bulan terakhir. Perlu analisis lebih lanjut.",
        color: "text-warning",
        Icon: AlertTriangle,
      };
    }
  };
  
  const trendSummary = getTrendSummary();
  const IconComponent = trendSummary.Icon;

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!safetyData) {
    return <div className="p-6">Data tidak tersedia.</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Safety Key Metrics</h1>
          <p className="text-white mt-1">
            Monitoring performa keselamatan kerja - {new Date(selectedMonth).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          {/* Month Picker */}
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Pilih bulan" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }).map((_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                const label = date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
                return (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Calendar className="h-4 w-4 text-white" />
          <span className="text-sm text-white">
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
                <div key={data.name} className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium">{data.name}</div>
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
                <IconComponent className={`h-4 w-4 ${trendSummary.color}`} />
                <span className={`font-medium ${trendSummary.color}`}>
                  {trendSummary.text.includes("menurun") ? "Tren Positif" : (trendSummary.text.includes("meningkat") ? "Tren Negatif" : "Tren Variasi")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {trendSummary.text}
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
