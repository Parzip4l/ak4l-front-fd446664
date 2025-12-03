/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FireExtinguisher,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";

// --- Type Definitions ---
interface Stats {
  total_alat: number;
  detail_total?: string;
  persentase_baik: number;
  perlu_perhatian: number;
  detail_perhatian?: string;
  inspeksi_terlewat: number;
}

interface Inspection {
  id: number;
  kode_alat: string;
  lokasi: string;
  jadwal: string;
  sisa_hari: number;
}

interface History {
  id: number;
  kode_alat: string;
  petugas: string;
  status: string;
}

interface ApiResponse<T> {
  data: T;
}

interface SelectedDate {
  year: number;
  month: number;
}

// --- Constants ---
const API_URL = "http://127.0.0.1:8000/api/v1";

// --- Helper Functions ---
const getStatusVariant = (status: string): "success" | "warning" | "destructive" | "secondary" => {
  switch (status) {
    case "Baik":
      return "success";
    case "Perlu Refill":
      return "warning";
    case "Rusak":
      return "destructive";
    default:
      return "secondary";
  }
};

// --- Komponen Utama ---
const AparDashboardPage: React.FC = () => {
  const { toast } = useToast();
  const { token } = useAuth();

  const [stats, setStats] = useState<Stats | null>(null);
  const [upcomingInspections, setUpcomingInspections] = useState<Inspection[]>([]);
  const [recentHistory, setRecentHistory] = useState<History[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<SelectedDate>({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  });

  const selectedMonthPeriod = `${selectedDate.year}-${String(selectedDate.month).padStart(2, "0")}`;

  const fetchData = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    const headers = { Authorization: `Bearer ${token}` };
    const monthQuery = `?month=${selectedDate.month}&year=${selectedDate.year}`;

    try {
      const [statsRes, inspectionsRes, historyRes] = await Promise.all([
        fetch(`${API_URL}/apar-hydrant/stats${monthQuery}`, { headers }).then((res) =>
          res.json()
        ) as Promise<ApiResponse<Stats>>,
        fetch(`${API_URL}/apar-hydrant/upcoming-inspections${monthQuery}`, { headers }).then(
          (res) => res.json()
        ) as Promise<ApiResponse<Inspection[]>>,
        fetch(`${API_URL}/apar-hydrant/recent-history${monthQuery}`, { headers }).then((res) =>
          res.json()
        ) as Promise<ApiResponse<History[]>>,
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      if (inspectionsRes?.data) setUpcomingInspections(inspectionsRes.data);
      if (historyRes?.data) setRecentHistory(historyRes.data);
    } catch (error) {
      console.error("Error fetching APAR & Hydrant dashboard data:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data dashboard. Pastikan API backend berjalan.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMonthChange = (val: string) => {
    const [year, month] = val.split("-");
    setSelectedDate({ year: parseInt(year), month: parseInt(month) });
  };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen font-[Inter] p-4 sm:p-6 lg:p-8 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto max-w-7xl space-y-10 relative">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              APAR & Hydrant Dashboard
            </h1>
            <p className="text-white mt-2 text-lg max-w-prose">
              Monitoring kondisi dan jadwal alat pemadam.
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Calendar className="h-5 w-5 text-white" />
            <Select value={selectedMonthPeriod} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-full sm:w-[220px] rounded-xl shadow-sm hover:ring-2 hover:ring-orange-500 transition-shadow">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-lg">
                {Array.from({ length: 12 }).map((_, i) => {
                  const date = new Date();
                  date.setMonth(today.getMonth() - i);
                  const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
                    2,
                    "0"
                  )}`;
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
            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Alat
                  </CardTitle>
                  <FireExtinguisher className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_alat ?? 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.detail_total || "N/A"}
                  </p>
                </CardContent>
              </Card>

              {/* Card 2 */}
              <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Kondisi Baik
                  </CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.persentase_baik ?? 0}%</div>
                  <Progress value={stats?.persentase_baik ?? 0} className="mt-2 h-2" />
                </CardContent>
              </Card>

              {/* Card 3 */}
              <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Perlu Perhatian
                  </CardTitle>
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.perlu_perhatian ?? 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.detail_perhatian || "N/A"}
                  </p>
                </CardContent>
              </Card>

              {/* Card 4 */}
              <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Inspeksi Terlewat
                  </CardTitle>
                  <Clock className="h-5 w-5 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.inspeksi_terlewat ?? 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Dari total jadwal bulan ini
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Jadwal & Riwayat */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Jadwal Inspeksi */}
              <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <CardHeader className="p-6">
                  <CardTitle className="text-2xl font-bold">
                    Jadwal Inspeksi Mendatang
                  </CardTitle>
                  <CardDescription>
                    Alat yang perlu diinspeksi dalam 30 hari ke depan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="space-y-4">
                    {upcomingInspections.length > 0 ? (
                      upcomingInspections.map((item) => (
                        <div key={item.id} className="flex items-center">
                          <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {item.kode_alat} - {item.lokasi}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Jadwal:{" "}
                              {new Date(item.jadwal).toLocaleDateString("id-ID")}
                            </p>
                          </div>
                          <Badge
                            variant={item.sisa_hari <= 7 ? "destructive" : "secondary"}
                          >
                            {item.sisa_hari} hari lagi
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-center text-gray-500 py-4">
                        Tidak ada jadwal inspeksi mendatang.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Riwayat */}
              <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <CardHeader className="p-6">
                  <CardTitle className="text-2xl font-bold">
                    Riwayat Inspeksi Terakhir
                  </CardTitle>
                  <CardDescription>
                    Aktivitas pengecekan alat yang baru saja dilakukan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kode Alat</TableHead>
                        <TableHead>Petugas</TableHead>
                        <TableHead>Status Hasil</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentHistory.length > 0 ? (
                        recentHistory.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.kode_alat}
                            </TableCell>
                            <TableCell>{item.petugas}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(item.status)}>
                                {item.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center text-gray-500 py-4"
                          >
                            Belum ada riwayat inspeksi bulan ini.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default AparDashboardPage;
