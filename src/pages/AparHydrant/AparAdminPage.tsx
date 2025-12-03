import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Pencil, Trash2, CheckCircle, XCircle, PlusCircle, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Alat {
  id: number;
  jenis: "APAR" | "Hydrant" | "";
  lokasi: string;
  status: "Aktif" | "Perlu Perbaikan" | "Rusak" | "";
  tanggalPemeriksaan: string;
  approved: boolean;
}

export default function AparHydrantAdminPage() {
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editItem, setEditItem] = useState<Alat | null>(null);

  const [data, setData] = useState<Alat[]>([
    {
      id: 1,
      jenis: "APAR",
      lokasi: "Stasiun Velodrome - Lantai 1",
      status: "Aktif",
      tanggalPemeriksaan: "2025-10-10",
      approved: true,
    },
    {
      id: 2,
      jenis: "Hydrant",
      lokasi: "Depo LRTJ - Zona B",
      status: "Perlu Perbaikan",
      tanggalPemeriksaan: "2025-10-09",
      approved: false,
    },
  ]);

  const filteredData = data.filter((item) =>
    item.lokasi.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!editItem) return;
    if (editItem.id) {
      setData((prev) =>
        prev.map((d) => (d.id === editItem.id ? editItem : d))
      );
    } else {
      setData((prev) => [
        ...prev,
        { ...editItem, id: Date.now(), tanggalPemeriksaan: new Date().toISOString().split("T")[0] },
      ]);
    }
    setOpenModal(false);
    setEditItem(null);
  };

  const handleDelete = (id: number) => {
    setData((prev) => prev.filter((d) => d.id !== id));
  };

  const handleApprove = (id: number) => {
    setData((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, approved: !d.approved } : d
      )
    );
  };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen font-[Inter] p-6 sm:p-8 lg:p-10 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto max-w-7xl space-y-10 relative">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Admin Data APAR & Hydrant
            </h1>
            <p className="text-white mt-2 text-lg max-w-prose">
              Kelola data alat pemadam dan approval laporan pemeriksaan di sistem LRT Jakarta.
            </p>
          </div>
        </header>

        {/* Table Section */}
        <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Wrench className="h-6 w-6 text-red-500" />
                Kelola Data Alat
              </CardTitle>
              <CardDescription>
                Tambah, ubah, atau setujui laporan inspeksi alat pemadam.
              </CardDescription>
            </div>
            <Button
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-xl"
              onClick={() => {
                setEditItem({
                  id: 0,
                  jenis: "",
                  lokasi: "",
                  status: "Aktif",
                  tanggalPemeriksaan: "",
                  approved: false,
                });
                setOpenModal(true);
              }}
            >
              <PlusCircle size={18} /> Tambah Data
            </Button>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-3 mb-6">
              <Input
                placeholder="Cari berdasarkan lokasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm rounded-xl"
              />
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 border">No</th>
                    <th className="px-4 py-3 border">Jenis</th>
                    <th className="px-4 py-3 border">Lokasi</th>
                    <th className="px-4 py-3 border">Status</th>
                    <th className="px-4 py-3 border">Tanggal</th>
                    <th className="px-4 py-3 border text-center">Approval</th>
                    <th className="px-4 py-3 border text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="border px-4 py-2 text-center">{index + 1}</td>
                      <td className="border px-4 py-2 font-semibold">{item.jenis}</td>
                      <td className="border px-4 py-2">{item.lokasi}</td>
                      <td className="border px-4 py-2">
                        <Badge
                          variant={
                            item.status === "Aktif"
                              ? "success"
                              : item.status === "Perlu Perbaikan"
                              ? "warning"
                              : "destructive"
                          }
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {item.tanggalPemeriksaan}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {item.approved ? (
                          <span className="text-green-600 font-medium">Disetujui</span>
                        ) : (
                          <span className="text-red-600 font-medium">Belum</span>
                        )}
                      </td>
                      <td className="border px-4 py-2 text-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditItem(item);
                            setOpenModal(true);
                          }}
                          className="rounded-xl"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item.id)}
                          className="rounded-xl"
                        >
                          <Trash2 size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant={item.approved ? "secondary" : "default"}
                          onClick={() => handleApprove(item.id)}
                          className="rounded-xl"
                        >
                          {item.approved ? (
                            <XCircle size={16} />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Modal Tambah/Edit */}
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {editItem?.id ? "Edit Data Alat" : "Tambah Data Baru"}
              </DialogTitle>
              <DialogDescription>
                Isi data alat pemadam sesuai form di bawah.
              </DialogDescription>
            </DialogHeader>

            {editItem && (
              <div className="space-y-4 mt-4">
                <select
                  className="w-full border rounded-xl px-3 py-2"
                  value={editItem.jenis}
                  onChange={(e) => setEditItem({ ...editItem, jenis: e.target.value as Alat["jenis"] })}
                >
                  <option value="">Pilih Jenis</option>
                  <option value="APAR">APAR</option>
                  <option value="Hydrant">Hydrant</option>
                </select>

                <Input
                  placeholder="Lokasi alat..."
                  value={editItem.lokasi}
                  onChange={(e) => setEditItem({ ...editItem, lokasi: e.target.value })}
                  className="rounded-xl"
                />

                <select
                  className="w-full border rounded-xl px-3 py-2"
                  value={editItem.status}
                  onChange={(e) => setEditItem({ ...editItem, status: e.target.value as Alat["status"] })}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                  <option value="Rusak">Rusak</option>
                </select>

                <div className="flex justify-end gap-3 pt-3">
                  <Button variant="outline" onClick={() => setOpenModal(false)} className="rounded-xl">
                    Batal
                  </Button>
                  <Button onClick={handleSave} className="rounded-xl bg-blue-600 hover:bg-blue-700">
                    Simpan
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
