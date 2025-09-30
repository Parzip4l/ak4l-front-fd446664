/* eslint-disable */
"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
// Assumed components from Shadcn UI library
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  Save, 
  Plus, 
  Search, 
  TrendingUp, 
  TrendingDown,
  Info,
  Eye,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Toaster } from "@/components/ui/toaster";

const API_URL = "http://127.0.0.1:8000/api/v1";

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


function SecurityAdminContent() {
  const { toast } = useToast();
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState("input");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const [historicalData, setHistoricalData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1
  });

  const [formData, setFormData] = useState({});

  const selectedMonthPeriod = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}`;

  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('id-ID', { month: 'long' });
  };

  const fetchHistoricalData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/security-metrics-v2`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch historical data.");
      const data = await response.json();
      setHistoricalData(data.data || []);
    } catch (error) {
      console.error("Error fetching historical data:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data riwayat. Silakan muat ulang halaman.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, toast]);

  const fetchAnalyticsData = useCallback(async () => {
    if (!token || !selectedDate.month || !selectedDate.year) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/security-metrics-v2-analytics?month=${selectedMonthPeriod}&year=${selectedDate.year}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch analytics data.");
      const data = await response.json();
      setAnalyticsData(data.data?.[0] || null);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setAnalyticsData(null);
      toast({
        title: "Error",
        description: "Gagal memuat data analitik. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, toast, selectedDate]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistoricalData();
    } else if (activeTab === 'analytics') {
      fetchAnalyticsData();
    }
  }, [activeTab, fetchHistoricalData, fetchAnalyticsData]);

  useEffect(() => {
    const currentMonthData = historicalData.find(d => d.month.startsWith(selectedMonthPeriod));
    const initialData = {};
    incidentCategories.forEach(cat => {
      initialData[cat.key] = 0;
    });

    if (currentMonthData) {
      setFormData({
        ...initialData,
        ...currentMonthData
      });
    } else {
      setFormData(initialData);
    }
  }, [selectedMonthPeriod, historicalData]);

  const handleInputChange = useCallback((key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: parseInt(value) || 0
    }));
  }, []);

  const getTotalIncidents = useCallback(() => {
    const currentMonthData = historicalData.find(d => d.month.startsWith(selectedMonthPeriod));
    if (currentMonthData && currentMonthData.total_insiden !== undefined) {
      return currentMonthData.total_insiden;
    }
    const incidentKeysToSum = ['kasus_kriminal', 'kasus_ancaman_bom', 'kasus_huru_hara', 'kasus_vandalisme', 'kasus_lainnya'];
    return incidentKeysToSum.reduce((sum, key) => sum + (parseInt(formData[key]) || 0), 0);
  }, [formData, historicalData, selectedMonthPeriod]);

  const handleUpdateConfirmation = useCallback(async () => {
    setShowUpdateModal(false);
    setIsSubmitting(true);
    const submittingPeriod = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}`;
    const existingData = historicalData.find(d => d.month.startsWith(submittingPeriod));
    const url = `${API_URL}/security-metrics-v2/${existingData.id}`;

    const payload = {
      month: `${submittingPeriod}-01`,
      ...formData,
    };

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update data to API.");
      }

      toast({
        title: "Data berhasil diperbarui",
        description: `Security metrics untuk ${selectedMonthPeriod} telah diupdate.`,
      });
      await fetchHistoricalData();
    } catch (error) {
      console.error("Failed to update data:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui data. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedDate, formData, historicalData, token, toast, fetchHistoricalData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const submittingPeriod = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}`;
    const existingData = historicalData.find(d => d.month.startsWith(submittingPeriod));

    if (existingData) {
      setShowUpdateModal(true);
      return;
    }

    setIsSubmitting(true);
    const payload = {
      month: `${submittingPeriod}-01`,
      ...formData,
    };

    try {
      const response = await fetch(`${API_URL}/security-metrics-v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save data to API.");
      }

      toast({
        title: "Data berhasil disimpan",
        description: `Security metrics untuk ${selectedMonthPeriod} telah disimpan.`,
      });
      await fetchHistoricalData();
    } catch (error) {
      console.error("Failed to save data:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan data. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedDate, formData, historicalData, token, toast, fetchHistoricalData, selectedMonthPeriod]);

  const getIncidentLevel = useCallback((total) => {
    if (total === 0) return { level: "Excellent", color: "bg-green-500 hover:bg-green-600", text: "text-green-800 dark:text-green-200", border: "border-green-500" };
    if (total <= 3) return { level: "Good", color: "bg-yellow-500 hover:bg-yellow-600", text: "text-yellow-800 dark:text-yellow-200", border: "border-yellow-500" };
    if (total <= 6) return { level: "Moderate", color: "bg-orange-500 hover:bg-orange-600", text: "text-orange-800 dark:text-orange-200", border: "border-orange-500" };
    return { level: "High", color: "bg-red-500 hover:bg-red-600", text: "text-red-800 dark:text-red-200", border: "border-red-500" };
  }, []);

  const incidentLevel = getIncidentLevel(getTotalIncidents());

  const filteredData = historicalData.filter(data => {
    if (typeof data !== 'object' || data === null) return false;
    
    const matchesSearch = Object.keys(data).some(key => 
      typeof data[key] === 'string' && data[key].toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesSearch;
  });

  const handleEdit = useCallback((data) => {
    setFormData(data);
    setActiveTab('input');
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-[Inter] p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-7xl space-y-10 relative">

        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Security Admin Panel</h1>
            <p className="text-gray-600 text-white mt-2 text-lg max-w-prose">
              Masukkan, kelola, dan analisis metrik keamanan utama untuk pemantauan bulanan.
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
            <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Periode: {getMonthName(today.getMonth() + 1)} {today.getFullYear()}
            </span>
          </div>
        </header>
        
        {/* User ID and Alert */}
        <div className="space-y-4">
          <Alert className={`rounded-2xl shadow-lg border-l-4 border-blue-500`}>
            <div className="flex items-center space-x-2">
              <Info className={`h-5 w-5 flex-shrink-0 text-blue-500`} />
              <AlertDescription className="text-sm">
                  Anda dapat menginput data untuk bulan ini dan bulan sebelumnya. Pastikan data akurat sebelum disimpan.
              </AlertDescription>
            </div>
          </Alert>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} className="space-y-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 p-1 rounded-full bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="input" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white rounded-full transition-colors duration-300 font-semibold text-gray-700 dark:text-gray-300">
              Input Data
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white rounded-full transition-colors duration-300 font-semibold text-gray-700 dark:text-gray-300">
              Riwayat Data
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white rounded-full transition-colors duration-300 font-semibold text-gray-700 dark:text-gray-300">
              Analitik
            </TabsTrigger>
          </TabsList>

          {/* Data Input Tab */}
          <TabsContent value="input" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Input Form Card */}
              <div className="lg:col-span-2">
                <Card className="rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <CardHeader className="p-8">
                    <CardTitle className="flex items-center space-x-3 text-3xl font-bold text-gray-900 dark:text-gray-100">
                      <Plus className="h-7 w-7 text-blue-600" />
                      <span>Input Data Keamanan</span>
                    </CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400 mt-2">
                      Masukkan data metrik keamanan untuk periode bulan yang dipilih.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <form onSubmit={handleSubmit} className="space-y-8">
                      {/* Period Selection */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <Label htmlFor="period" className="text-gray-700 dark:text-gray-300 font-semibold min-w-[120px]">Pilih Periode:</Label>
                        <Select
                          value={selectedMonthPeriod}
                          onValueChange={(val) => {
                            const [year, month] = val.split('-');
                            setSelectedDate({ year: parseInt(year), month: parseInt(month) });
                          }}
                        >
                          <SelectTrigger className="w-full sm:w-[220px] rounded-xl shadow-sm hover:ring-2 hover:ring-blue-500 transition-shadow">
                            <SelectValue placeholder="Pilih Periode" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl shadow-lg">
                            {Array.from({ length: 12 }).map((_, i) => {
                              const date = new Date();
                              date.setMonth(today.getMonth() - i);
                              const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                              const label = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                              return <SelectItem key={value} value={value}>{label}</SelectItem>;
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Input Fields Grid */}
                      {isLoading ? (
                        <div className="flex items-center justify-center h-48">
                          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                          <span className="ml-2 text-gray-500">Memuat kategori...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {incidentCategories.map(category => (
                            <div key={category.key} className="space-y-2">
                              <Label htmlFor={category.key} className="text-gray-700 dark:text-gray-300 font-medium">
                                {category.name}
                                <span className="block text-xs text-gray-400 dark:text-gray-500 font-normal mt-1">{category.description}</span>
                              </Label>
                              <Input
                                id={category.key}
                                type="number"
                                min="0"
                                value={formData[category.key] || 0}
                                onChange={(e) => handleInputChange(category.key, e.target.value)}
                                className="rounded-xl shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 transition-shadow"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Submit Button */}
                      <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg py-3 font-semibold"
                        disabled={isSubmitting || isLoading}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Simpan Data
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Results Card */}
              <div className="space-y-6">
                <Card className="rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <CardHeader className="p-8">
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ringkasan Insiden</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                      Total insiden dan penilaian berdasarkan input.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <div className={`p-6 rounded-2xl text-center shadow-inner transition-all duration-300 ${incidentLevel.border}`}>
                      <div className={`text-6xl font-extrabold ${incidentLevel.text}`}>
                        {getTotalIncidents()}
                      </div>
                      <p className="text-base font-medium mt-2 text-gray-600 dark:text-gray-400">Total Insiden</p>
                      <Badge
                        className={`mt-4 text-sm font-semibold py-2 px-4 rounded-full shadow-md ${incidentLevel.color}`}
                      >
                        {incidentLevel.level}
                      </Badge>
                    </div>
                    <div className="space-y-3 text-md mt-8">
                      {incidentCategories.map(category => (
                        <div key={category.key} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                          <span className="text-gray-600 dark:text-gray-400">{category.name}:</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{formData[category.key] || 0}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Historical Data Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader className="p-8">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Search className="h-6 w-6 text-gray-500" />
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Riwayat Data</CardTitle>
                  </div>
                  <div className="relative w-full sm:w-auto">
                    <Input
                      type="text"
                      placeholder="Cari data..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Data metrik keamanan yang telah diinput dan disetujui
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-48">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                      <span className="ml-2 text-gray-500">Memuat data...</span>
                    </div>
                  ) : filteredData.length > 0 ? (
                    filteredData.map((data) => (
                      <div key={data.id} className="p-5 border border-gray-200 dark:border-gray-700 rounded-2xl space-y-4 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-xl text-gray-900 dark:text-gray-50">{data.month.substring(0, 7)}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                              {incidentCategories.map(cat => (
                                <div key={cat.key}>
                                  <span className="text-gray-500 dark:text-gray-400">{cat.name}:</span>
                                  <span className="font-medium ml-2 text-gray-800 dark:text-gray-200">{data[cat.key] || 0}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              className="bg-white text-gray-800 rounded-full border border-gray-300 hover:bg-gray-100 transition-all duration-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 shadow-md"
                              onClick={() => handleEdit(data)}
                            >
                              <Eye className="h-4 w-4 mr-2" /> Lihat Detail
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                      Tidak ada data riwayat yang sesuai.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <Label htmlFor="analytics-period" className="text-gray-600 dark:text-gray-300 font-medium min-w-[120px]">Pilih Periode:</Label>
              <Select 
                value={selectedMonthPeriod}
                onValueChange={(val) => {
                  const [year, month] = val.split('-');
                  setSelectedDate({ year: parseInt(year), month: parseInt(month) });
                }}
              >
                <SelectTrigger className="w-full sm:w-[220px] rounded-xl shadow-sm hover:ring-2 hover:ring-blue-500 transition-shadow">
                  <SelectValue placeholder="Pilih Periode" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-lg">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const date = new Date();
                    date.setMonth(today.getMonth() - i);
                    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    const label = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                    return <SelectItem key={value} value={value}>{label}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                <span className="ml-2 text-gray-500">Memuat analitik...</span>
              </div>
            ) : analyticsData ? (
              <Card className="rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader className="p-8">
                  <CardTitle className="text-2xl font-bold">Analitik Bulanan</CardTitle>
                  <CardDescription>
                    Ringkasan data keamanan untuk {getMonthName(new Date(analyticsData.month).getMonth() + 1)}{" "}
                    {new Date(analyticsData.month).getFullYear()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {incidentCategories.map((category) => {
                      const trendValue = analyticsData.trend?.[category.key];
                      const renderTrend = () => {
                        if (trendValue === null || trendValue === undefined) return null;
                        if (trendValue === 'naik')
                          return (
                            <span className="flex items-center text-green-500 font-semibold">
                              <TrendingUp className="h-5 w-5 mr-2" />
                              Naik
                            </span>
                          );
                        if (trendValue === 'turun')
                          return (
                            <span className="flex items-center text-red-500 font-semibold">
                              <TrendingDown className="h-5 w-5 mr-2" />
                              Turun
                            </span>
                          );
                        return <span className="text-gray-500 font-semibold">Sama</span>;
                      };
                      return (
                        <div key={category.key} className="p-6 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900 shadow-md">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{category.name}</h4>
                            <span className="text-sm">{renderTrend()}</span>
                          </div>
                          <p className="text-4xl font-bold mt-2 text-gray-900 dark:text-gray-50">{analyticsData[category.key]}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                Tidak ada data analitik untuk bulan ini.
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Update Confirmation Dialog */}
        <AlertDialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Perbarui Data?</AlertDialogTitle>
              <AlertDialogDescription>
                Data untuk periode ini sudah ada. Apakah Anda yakin ingin memperbarui data yang sudah ada? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleUpdateConfirmation}>Perbarui</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Toaster />
      </div>
    </div>
  );
}

// Main component that provides the AuthContext
export default function AppWrapper() {
  return (
    <AuthProvider>
      <SecurityAdminContent />
    </AuthProvider>
  );
}
