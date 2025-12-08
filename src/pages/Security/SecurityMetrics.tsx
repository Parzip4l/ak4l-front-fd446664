/* eslint-disable */
"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  AlertTriangle,
  Users,
  Calendar,
  TrendingDown,
  TrendingUp,
  CheckCircle,
  Loader2,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster } from "@/components/ui/toaster";

const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

const incidentCategories = [
  { key: 'kasus_kriminal', name: 'Kasus Kriminal', description: 'Tindak pidana dalam area kerja' },
  { key: 'kasus_ancaman_bom', name: 'Kasus Ancaman Bom', description: 'Laporan terkait ancaman bom atau teror' },
  { key: 'kasus_huru_hara', name: 'Kasus Huru Hara', description: 'Kerusuhan atau keributan massal' },
  { key: 'kasus_vandalisme', name: 'Kasus Vandalisme', description: 'Kerusakan properti akibat vandalisme' },
  { key: 'kasus_lainnya', name: 'Kasus Lainnya', description: 'Insiden keamanan di luar kategori yang ditentukan' },
  { key: 'inspeksi_pengamanan', name: 'Inspeksi Pengamanan', description: 'Jumlah inspeksi rutin yang dilakukan' },
  { key: 'investigasi_insiden_pengamanan', name: 'Investigasi Insiden', description: 'Jumlah investigasi insiden pengamanan' },
  { key: 'audit_internal_smp', name: 'Audit Internal SMP', description: 'Audit rutin atau temuan audit sistem manajemen pengamanan' },
  { key: 'simulasi_tanggap_darurat_pengamanan', name: 'Simulasi Tanggap Darurat', description: 'Kegiatan simulasi tanggap darurat pengamanan' },
  { key: 'rapat_koordinasi_3_pilar', name: 'Rapat Koordinasi 3 Pilar', description: 'Jumlah rapat koordinasi dengan pihak terkait' },
];

// --- Authentication Context ---
interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchMe: (overrideToken?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const isAdmin = !!user?.roles?.includes("admin");

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      const jwt = data.token;

      localStorage.setItem("token", jwt);
      setToken(jwt);

      await fetchMe(jwt);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const fetchMe = useCallback(async (overrideToken?: string) => {
    const activeToken = overrideToken || token;
    if (!activeToken) return;

    try {
      const response = await fetch(`${API_URL}/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Fetch me failed:", errorText);
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();

      setUser({
        id: data.user?.id,
        name: data.user?.name,
        email: data.user?.email,
        roles: data.roles || [],
        permissions: data.permissions || [],
      });
    } catch (error) {
      console.error("Fetch me error:", error);
      logout();
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (token) fetchMe(token);
  }, [token, fetchMe]);

  return (
    <AuthContext.Provider
      value={{ user, token, isAdmin, login, logout, fetchMe }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
// --- End Authentication Context ---


const getMonthName = (monthNumber) => {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString('id-ID', { month: 'long' });
};

const getSeverityColor = (total) => {
  if (total === 0) return 'text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-950';
  if (total > 0 && total <= 3) return 'text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-950';
  return 'text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-950';
};

const getTrendIcon = (trend) => {
  if (trend === 'naik') return <TrendingUp className="h-5 w-5 text-red-500" />;
  if (trend === 'turun') return <TrendingDown className="h-5 w-5 text-green-500" />;
  return <div className="w-5 h-5 rounded-full bg-gray-400"></div>;
};

const getSecurityStatus = (totalIncidents) => {
  if (totalIncidents === 0) return "Aman";
  if (totalIncidents > 0 && totalIncidents <= 3) return "Tingkat Rendah";
  return "Perlu Perhatian";
}

const incidentsToSum = ['kasus_kriminal', 'kasus_ancaman_bom', 'kasus_huru_hara', 'kasus_vandalisme', 'kasus_lainnya'];

function SecurityMetricsContent() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [securityMetricsData, setSecurityMetricsData] = useState(null);
  const [visitorData, setVisitorData] = useState(null);
  const [historicalMetrics, setHistoricalMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1
  });

  const selectedMonthPeriod = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}`;

  const fetchHistoricalData = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/security-metrics-v2`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch historical metrics.');
      const data = await response.json();
      setHistoricalMetrics(data.data || []);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal memuat data historis.",
        variant: "destructive"
      });
    }
  }, [token, toast]);

  const fetchAllData = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    
    // Fetch visitor data first
    const visitorDataPromise = fetch(`${API_URL}/visitor-requests/summary/monthly?year=${selectedDate.year}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch visitor data.'));

    // Fetch analytics data for the selected month
    const securityMetricsPromise = fetch(`${API_URL}/security-metrics-v2-analytics?month=${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}&year=${selectedDate.year}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch security metrics.'));

    try {
      const [visitorResponse, metricsResponse] = await Promise.allSettled([visitorDataPromise, securityMetricsPromise]);
      
      if (visitorResponse.status === 'fulfilled') {
        const currentMonthData = visitorResponse.value.data.find(d => d.month === selectedDate.month);
        setVisitorData(currentMonthData || null);
      } else {
        throw new Error(visitorResponse.reason);
      }
      
      if (metricsResponse.status === 'fulfilled') {
        setSecurityMetricsData(metricsResponse.value.data?.[0] || null);
      } else {
        throw new Error(metricsResponse.reason);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal memuat data metrik.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, toast, selectedDate]);

  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);
  
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData, selectedDate]);

  const handleMonthChange = (val) => {
    const [year, month] = val.split('-');
    setSelectedDate({ year: parseInt(year), month: parseInt(month) });
  };
  
  const totalIncidents = securityMetricsData?.total_insiden || 0;
  const totalVisitors = visitorData?.total || 0;
  const approvalRate = visitorData?.approval_rate || 0;

  const getIncidentCount = useCallback((key) => {
    return securityMetricsData?.[key] || 0;
  }, [securityMetricsData]);

  const getHistoricalIncidentTotal = useCallback((data) => {
    return incidentsToSum.reduce((sum, key) => sum + (data?.[key] || 0), 0);
  }, []);

  const monthlyTrend = historicalMetrics
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    .slice(-6);

  return (
    <div className="min-h-screen font-[Inter] p-4 sm:p-6 lg:p-8 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto max-w-7xl space-y-10 relative">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Security Key Metrics
            </h1>
            <p className="text-white mt-2 text-lg max-w-prose">
              Monitoring performa keamanan dan insiden.
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Calendar className="h-5 w-5 text-white" />
            <Select value={selectedMonthPeriod} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-full sm:w-[220px] rounded-xl shadow-sm hover:ring-2 hover:ring-blue-500 transition-shadow">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-lg">
                {Array.from({ length: 12 }).map((_, i) => {
                  const date = new Date();
                  date.setMonth(today.getMonth() - i);
                  const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                  const label = date.toLocaleDateString("id-ID", {
                    month: "long",
                    year: "numeric",
                  });
                  return (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
            <span className="ml-4 text-gray-500">Memuat data...</span>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Security Status Card */}
              <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Security Status</CardTitle>
                  <Shield className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${totalIncidents === 0 ? 'text-green-500' : 'text-blue-500'}`}>
                    {getSecurityStatus(totalIncidents)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Overall security condition
                  </p>
                  <div className="flex items-center mt-2 text-sm text-green-500">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>Normal operations</span>
                  </div>
                </CardContent>
              </Card>

              {/* Total Incidents Card */}
              <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Incidents</CardTitle>
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${totalIncidents === 0 ? 'text-green-500' : 'text-yellow-500'}`}>
                    {totalIncidents}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Security incidents this month
                  </p>
                  <div className="flex items-center mt-2 text-sm text-red-500">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>Perlu monitoring</span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Visitor Traffic Card */}
              <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Visitor Traffic</CardTitle>
                  <Users className="h-5 w-5 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {totalVisitors}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total kunjungan bulan ini
                  </p>
                  <Progress value={(visitorData?.approved_completed_count / totalVisitors) * 100 || 0} className="mt-2 h-2" />
                </CardContent>
              </Card>

              {/* Approval Rate Card */}
              <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Approval Rate</CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {approvalRate ? `${approvalRate}%` : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Visitor approval rate
                  </p>
                  <div className="flex items-center mt-2 text-sm text-green-500">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                    <span>Excellent</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Incidents Breakdown & Monthly Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Security Incidents Breakdown */}
              <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <CardHeader className="p-8">
                  <CardTitle className="flex items-center space-x-2 text-2xl font-bold">
                    <AlertTriangle className="h-6 w-6 text-warning" />
                    <span>Breakdown Insiden Keamanan</span>
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    Detail jenis insiden dan tingkat keparahan
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {incidentCategories.filter(cat => ['kasus_kriminal', 'kasus_ancaman_bom', 'kasus_huru_hara', 'kasus_vandalisme', 'kasus_lainnya'].includes(cat.key)).map((category) => (
                      <div 
                        key={category.key} 
                        className={`p-4 rounded-lg flex justify-between items-center ${getSeverityColor(getIncidentCount(category.key))}`}
                      >
                        <div>
                          <span className="font-semibold">{category.name}</span>
                          <p className="text-sm opacity-75 mt-1">{category.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold">{getIncidentCount(category.key)}</span>
                          {getTrendIcon(securityMetricsData?.trend?.[category.key])}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">Security Assessment</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Level keamanan dalam kondisi normal dengan beberapa insiden minor yang masih dalam batas toleran.
                      Fokus monitoring pada akses tidak sah yang mengalami peningkatan.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Trend Card */}
              <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <CardHeader className="p-8">
                  <CardTitle className="flex items-center space-x-2 text-2xl font-bold">
                    <TrendingDown className="h-6 w-6 text-gray-500" />
                    <span>Tren 6 Bulan Terakhir</span>
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-gray-400">
                    Perbandingan insiden dan traffic kunjungan
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <div className="space-y-6">
                    {monthlyTrend.length > 0 ? (
                      monthlyTrend.map((data) => (
                        <div key={data.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{getMonthName(new Date(data.month).getMonth() + 1)}</span>
                            <Badge variant="secondary" className="text-xs">
                              {getHistoricalIncidentTotal(data)} insiden
                            </Badge>
                          </div>
                          <Progress value={(getHistoricalIncidentTotal(data) / 20) * 100} className="mt-2 h-2" />
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Kriminal:</span>
                              <span className={`font-medium ${data.kasus_kriminal > 0 ? 'text-red-500' : 'text-green-500'}`}>{data.kasus_kriminal || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Ancaman Bom:</span>
                              <span className={`font-medium ${data.kasus_ancaman_bom > 0 ? 'text-red-500' : 'text-green-500'}`}>{data.kasus_ancaman_bom || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Vandalisme:</span>
                              <span className={`font-medium ${data.kasus_vandalisme > 0 ? 'text-red-500' : 'text-green-500'}`}>{data.kasus_vandalisme || 0}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                        Tidak ada data historis yang tersedia.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <SecurityMetricsContent />
    </AuthProvider>
  );
}
