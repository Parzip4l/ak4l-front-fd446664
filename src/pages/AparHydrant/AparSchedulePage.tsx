import React, { useState, useEffect, useCallback } from "react";
// --- PERBAIKAN: Impor dipisah untuk mengatasi bentrokan nama ---
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar"; // <-- PERBAIKAN: Impor pemilih tanggal
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
// --- Akhir Perbaikan Impor ---
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon, // <-- PERBAIKAN: Ikon diubah namanya
  FileText,
  Printer,
  Download,
  Loader2,
  Archive,
  CalendarPlus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/contexts/AuthContext"; // <-- BARIS INI DIHAPUS
import { Toaster } from "@/components/ui/toaster";

const API_URL = "http://127.0.0.1:8000/api/v1"; // sesuaikan dengan API backend

type ReportData = {
  kode_alat: string;
  lokasi: string;
  tanggal: string;
  status: string;
  petugas: string;
};

export default function AparReportPage() {
  // const { token } = useAuth(); // <-- BARIS INI DIHAPUS
  const token = "MOCK_AUTH_TOKEN_FOR_TESTING"; // <-- BARIS INI DITAMBAHKAN UNTUK MENGATASI ERROR
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>();
  const [schedulePetugas, setSchedulePetugas] = useState("");
  const [scheduleDescription, setScheduleDescription] = useState("");

  const fetchReports = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(
        `${API_URL}/apar-hydrant/reports?period=${selectedMonth}`,
        { headers }
      );
      const json = await res.json();
      setReports(json.data || []);
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast({
        title: "Gagal memuat data",
        description: "Pastikan server backend berjalan dengan benar.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, selectedMonth, toast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleExport = (type: string) => {
    toast({
      title: "Ekspor laporan",
      description: `Laporan ${type.toUpperCase()} sedang diproses...`,
      variant: "default",
    });
    // Simulasi download (nanti bisa disambungkan ke endpoint eksport PDF/Excel)
  };

  const handleSubmitSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !scheduleDate || !schedulePetugas) {
      toast({
        title: "Data tidak lengkap",
        description: "Pastikan tanggal dan petugas sudah terisi.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      
      const body = JSON.stringify({
        tanggal_inspeksi: format(scheduleDate, "yyyy-MM-dd"),
        petugas: schedulePetugas,
        deskripsi: scheduleDescription,
      });

      // Ganti endpoint ini sesuai dengan API backend Anda untuk *membuat* jadwal
      const res = await fetch(`${API_URL}/apar-hydrant/schedules`, {
        method: "POST",
        headers,
        body,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menyimpan jadwal");
      }

      toast({
        title: "Jadwal Berhasil Dibuat",
        description: `Inspeksi oleh ${schedulePetugas} pada ${format(scheduleDate, "dd MMMM yyyy", { locale: id })}.`,
        // variant: "success", // <-- PERBAIKAN: Dihapus karena 'success' tidak valid
      });

      // Reset form dan tutup modal
      setIsModalOpen(false);
      setScheduleDate(undefined);
      setSchedulePetugas("");
      setScheduleDescription("");

    } catch (error: any) {
      console.error("Error submitting schedule:", error);
      toast({
        title: "Gagal menyimpan jadwal",
        description: error.message || "Terjadi kesalahan pada server.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen font-[Inter] p-4 sm:p-6 lg:p-8 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto max-w-7xl space-y-10 relative">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Laporan & Arsip Digital (Paperless)
            </h1>
            <p className="text-white mt-2 text-lg max-w-prose">
              Semua data inspeksi disimpan secara digital, lengkap dengan riwayat
              dan ekspor laporan.
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-orange-500 hover:bg-orange-600">
                  <CalendarPlus className="h-4 w-4" />
                  Buat Jadwal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <form onSubmit={handleSubmitSchedule}>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                      Jadwalkan Inspeksi Baru
                    </DialogTitle>
                    <DialogDescription>
                      Pilih tanggal dan petugas untuk inspeksi APAR/Hydrant
                      berikutnya.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-6">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="tanggal" className="text-right">
                        Tanggal
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "col-span-3 justify-start text-left font-normal",
                              !scheduleDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" /> {/* <-- PERBAIKAN: Menggunakan CalendarIcon */}
                            {scheduleDate ? (
                              format(scheduleDate, "dd MMMM yyyy", { locale: id })
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <div className="p-2">
                            <Calendar
                              mode="single"
                              selected={scheduleDate}
                              onSelect={setScheduleDate}
                              initialFocus
                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="petugas" className="text-right">
                        Petugas
                      </Label>
                      <Input
                        id="petugas"
                        value={schedulePetugas}
                        onChange={(e) => setSchedulePetugas(e.target.value)}
                        className="col-span-3"
                        placeholder="Nama petugas"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="deskripsi" className="text-right">
                        Deskripsi
                      </Label>
                      <Input
                        id="deskripsi"
                        value={scheduleDescription}
                        onChange={(e) => setScheduleDescription(e.target.value)}
                        className="col-span-3"
                        placeholder="(Opsional) Cth: Inspeksi triwulan"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Batal
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Simpan Jadwal
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <CalendarIcon className="h-5 w-5 text-white" /> {/* <-- PERBAIKAN: Menggunakan CalendarIcon */}
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-[220px] rounded-xl shadow-sm hover:ring-2 hover:ring-orange-500 transition-shadow">
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-lg">
                {Array.from({ length: 12 }).map((_, i) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - i);
                  const value = `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                  ).padStart(2, "0")}`;
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

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
            <span className="ml-4 text-gray-500">Memuat laporan...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Export Options */}
            <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <CardHeader className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Ekspor & Cetak
                  </CardTitle>
                  <CardDescription>
                    Admin dapat mengekspor laporan sesuai kebutuhan.
                  </CardDescription>
                </div>
                <div className="flex space-x-2 mt-4 sm:mt-0">
                  <Button
                    onClick={() => handleExport("pdf")}
                    className="gap-2"
                  >
                    <Printer className="h-4 w-4" /> Cetak PDF
                  </Button>
                  <Button
                    onClick={() => handleExport("excel")}
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" /> Ekspor Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Semua laporan disimpan otomatis dalam sistem dan dapat diunduh
                  kapan saja.
                </p>
              </CardContent>
            </Card>

            {/* Table Report */}
            <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <CardHeader className="p-6">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-500" /> Laporan
                  Inspeksi Bulanan
                </CardTitle>
                <CardDescription>
                  Data hasil inspeksi, alat rusak/refill, dan riwayat per alat.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Alat</TableHead>
                      <TableHead>Lokasi</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Petugas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.length > 0 ? (
                      reports.map((r, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {r.kode_alat}
                          </TableCell>
                          <TableCell>{r.lokasi}</TableCell>
                          <TableCell>
                            {new Date(r.tanggal).toLocaleDateString("id-ID")}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                r.status === "Baik"
                                  ? "success"
                                  : r.status === "Perlu Refill"
                                  ? "warning"
                                  : "destructive"
                              }
                            >
                              {r.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{r.petugas}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-gray-500 py-6"
                        >
                          Tidak ada data laporan untuk periode ini.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Arsip Digital */}
            <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <CardHeader className="p-6">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Archive className="h-6 w-6 text-orange-500" /> Arsip Digital
                  Otomatis
                </CardTitle>
                <CardDescription>
                  Semua aktivitas inspeksi, laporan, dan perubahan status alat
                  disimpan otomatis.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sistem menyimpan seluruh riwayat inspeksi dan hasil
                  pemeriksaan tanpa perlu dokumen fisik. Data dapat ditelusuri
                  berdasarkan periode, petugas, maupun status alat.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}

