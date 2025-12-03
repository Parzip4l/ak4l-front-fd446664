import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import {
  Search,
  Filter,
  PackageSearch,
  History
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

export default function AparHydrantListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedAlat, setSelectedAlat] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dummy data alat
  const alatList = [
    { id: 1, kode: "APAR-001", lokasi: "Stasiun Velodrome", status: "Aktif", tanggal: "2025-10-01" },
    { id: 2, kode: "APAR-002", lokasi: "Stasiun Boulevard Utara", status: "Refill", tanggal: "2025-09-25" },
    { id: 3, kode: "APAR-003", lokasi: "Stasiun Pegangsaan", status: "Rusak", tanggal: "2025-09-12" },
    { id: 4, kode: "HYD-001", lokasi: "Depo LRTJ", status: "Aktif", tanggal: "2025-08-22" },
    { id: 5, kode: "APAR-004", lokasi: "Stasiun Rawamangun", status: "Tidak Aktif", tanggal: "2025-08-11" },
    { id: 6, kode: "HYD-002", lokasi: "Stasiun Velodrome", status: "Aktif", tanggal: "2025-07-10" },
    { id: 7, kode: "APAR-005", lokasi: "Stasiun Pemuda", status: "Refill", tanggal: "2025-07-01" }
  ];

  // Dummy data riwayat
  const riwayatData: Record<number, { tanggal: string; status: string; pengecek: string }[]> = {
    1: [
      { tanggal: "2025-10-01", status: "Aktif", pengecek: "Budi Santoso" },
      { tanggal: "2025-09-01", status: "Refill", pengecek: "Rina Kartika" }
    ],
    2: [
      { tanggal: "2025-09-25", status: "Refill", pengecek: "Ahmad Fauzi" },
      { tanggal: "2025-08-20", status: "Aktif", pengecek: "Sinta Ayu" }
    ],
    3: [
      { tanggal: "2025-09-12", status: "Rusak", pengecek: "Agus Pratama" }
    ],
    4: [
      { tanggal: "2025-08-22", status: "Aktif", pengecek: "Wahyu Nugroho" }
    ],
    5: [
      { tanggal: "2025-08-11", status: "Tidak Aktif", pengecek: "Lestari Putri" }
    ]
  };

  // Filter & pencarian
  const filteredList = useMemo(() => {
    return alatList.filter((alat) => {
      const cocokStatus = statusFilter === "all" || alat.status === statusFilter;
      const cocokSearch =
        alat.kode.toLowerCase().includes(search.toLowerCase()) ||
        alat.lokasi.toLowerCase().includes(search.toLowerCase());
      return cocokStatus && cocokSearch;
    });
  }, [alatList, search, statusFilter]);

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedData = filteredList.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const openRiwayat = (alat: any) => {
    setSelectedAlat(alat);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen font-[Inter] p-4 sm:p-6 lg:p-8 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto max-w-7xl space-y-10 relative">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Daftar Alat APAR & Hydrant
            </h1>
            <p className="text-white mt-2 text-lg max-w-prose">
              Data seluruh alat pemadam di lingkungan operasional LRT Jakarta. Gunakan filter dan pencarian untuk menemukan alat tertentu.
            </p>
          </div>
        </header>

        {/* Filter + Search */}
        <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <PackageSearch className="h-6 w-6 text-blue-500" />
                Pencarian & Filter
              </CardTitle>
              <CardDescription>
                Gunakan pencarian atau filter status untuk melihat alat sesuai kondisi.
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px] rounded-xl">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-lg">
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                    <SelectItem value="Rusak">Rusak</SelectItem>
                    <SelectItem value="Refill">Refill</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative w-full sm:w-[260px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari kode atau lokasi..."
                  className="pl-9 rounded-xl"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Table Data */}
        <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="p-6">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <PackageSearch className="h-6 w-6 text-orange-500" />
              Daftar Alat Terdaftar
            </CardTitle>
            <CardDescription>
              Menampilkan seluruh alat aktif, rusak, atau perlu refill yang terdaftar dalam sistem.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Kode Alat</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Update</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((alat, index) => (
                    <TableRow key={alat.id}>
                      <TableCell>{(page - 1) * itemsPerPage + index + 1}</TableCell>
                      <TableCell className="font-semibold">{alat.kode}</TableCell>
                      <TableCell>{alat.lokasi}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            alat.status === "Aktif"
                              ? "success"
                              : alat.status === "Refill"
                              ? "warning"
                              : alat.status === "Rusak"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {alat.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{alat.tanggal}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-blue-600 border-blue-300 hover:bg-blue-50"
                          onClick={() => openRiwayat(alat)}
                        >
                          <History className="h-4 w-4 mr-2" /> Lihat Riwayat
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-6">
                      Tidak ada data ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                <PaginationItem>
                  <span className="px-3 py-1 text-sm text-gray-600">
                    Halaman {page} dari {totalPages}
                  </span>
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Modal Riwayat */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Riwayat Pemeriksaan – {selectedAlat?.kode}
              </DialogTitle>
              <DialogDescription>
                Lokasi: {selectedAlat?.lokasi}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-3">
              {selectedAlat && riwayatData[selectedAlat.id] ? (
                riwayatData[selectedAlat.id].map((r, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{r.tanggal}</p>
                      <p className="text-sm text-gray-600">Status: {r.status}</p>
                      <p className="text-sm text-gray-500">Pengecek: {r.pengecek}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center italic py-4">
                  Belum ada riwayat pemeriksaan.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
