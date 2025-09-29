import { useState, useEffect, useCallback, useMemo } from "react";
// FIX: The import for useAuth is removed to resolve build errors.
// A temporary mock function is provided below instead.
// import { useAuth } from "@/contexts/AuthContext"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart, LabelList } from 'recharts';
import { 
  Plus, Loader2, FileX
} from "lucide-react";

// FIX: Hardcoded the API URL to resolve the 'import.meta' build warning.
const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

// --- [MOCK AUTH HOOK] ---
const useAuth = () => {
    const token = localStorage.getItem('token');
    const isAdmin = !!token; 
    return { token, isAdmin };
};


// --- [SUB-KOMPONEN] ---
function RikesPradinasForm({ token, onSuccess }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ periode: new Date().toISOString().slice(0, 7), asp: '', occ: '', sarana: '', prasarana: '', target: '100', keterangan: '' });
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = async (e) => {
        e.preventDefault(); setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/rikes-pradinas`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ ...formData, asp: Number(formData.asp), occ: Number(formData.occ), sarana: Number(formData.sarana), prasarana: Number(formData.prasarana), target: Number(formData.target) }) });
            if (!response.ok) { const err = await response.json(); throw new Error(err.message || "Gagal mengirim data."); }
            toast({ title: "Sukses!", description: "Data Rikes Pradinas berhasil disimpan." });
            onSuccess();
        } catch (error) { toast({ title: "Error!", description: error.message, variant: "destructive" }); } finally { setIsLoading(false); }
    };
    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="periode" className="text-right">Periode</Label><Input id="periode" name="periode" type="month" value={formData.periode} onChange={handleChange} className="col-span-3" required /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="asp" className="text-right">ASP</Label><Input id="asp" name="asp" type="number" value={formData.asp} onChange={handleChange} className="col-span-3" required /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="occ" className="text-right">OCC</Label><Input id="occ" name="occ" type="number" value={formData.occ} onChange={handleChange} className="col-span-3" required /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="sarana" className="text-right">Sarana</Label><Input id="sarana" name="sarana" type="number" value={formData.sarana} onChange={handleChange} className="col-span-3" required /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="prasarana" className="text-right">Prasarana</Label><Input id="prasarana" name="prasarana" type="number" value={formData.prasarana} onChange={handleChange} className="col-span-3" required /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="keterangan" className="text-right">Keterangan</Label><Textarea id="keterangan" name="keterangan" value={formData.keterangan} onChange={handleChange} className="col-span-3" /></div>
            <DialogFooter><Button type="submit" disabled={isLoading}>{isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : 'Simpan Data'}</Button></DialogFooter>
        </form>
    );
}
function RikesNapzaForm({ token, onSuccess }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ periode: new Date().toISOString().slice(0, 7), passed: '', not_passed: '', kehadiran: '', target: '100', keterangan: '' });
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = async (e) => {
        e.preventDefault(); setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/rikes-napza`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ ...formData, passed: Number(formData.passed), not_passed: Number(formData.not_passed), kehadiran: Number(formData.kehadiran), target: Number(formData.target) }) });
            if (!response.ok) { const err = await response.json(); throw new Error(err.message || "Gagal mengirim data."); }
            toast({ title: "Sukses!", description: "Data Rikes & NAPZA berhasil disimpan." });
            onSuccess();
        } catch (error) { toast({ title: "Error!", description: error.message, variant: "destructive" }); } finally { setIsLoading(false); }
    };
    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="periode" className="text-right">Periode</Label><Input id="periode" name="periode" type="month" value={formData.periode} onChange={handleChange} className="col-span-3" required /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="passed" className="text-right">Lulus</Label><Input id="passed" name="passed" type="number" value={formData.passed} onChange={handleChange} className="col-span-3" required /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="not_passed" className="text-right">Tidak Lulus</Label><Input id="not_passed" name="not_passed" type="number" value={formData.not_passed} onChange={handleChange} className="col-span-3" required /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="kehadiran" className="text-right">Kehadiran (%)</Label><Input id="kehadiran" name="kehadiran" type="number" min="0" max="100" value={formData.kehadiran} onChange={handleChange} className="col-span-3" required /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="keterangan" className="text-right">Keterangan</Label><Textarea id="keterangan" name="keterangan" value={formData.keterangan} onChange={handleChange} className="col-span-3" /></div>
            <DialogFooter><Button type="submit" disabled={isLoading}>{isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : 'Simpan Data'}</Button></DialogFooter>
        </form>
    );
}

// Komponen Chart Tahunan untuk data hitungan (bukan persentase)
function YearlyCountChart({ data, title, categories, year }) {
    const chartData = useMemo(() => {
        const chartYear = year || new Date().getFullYear();
        const allMonths = Array.from({ length: 12 }, (_, i) => 
            new Date(chartYear, i, 1).toLocaleDateString('id-ID', { month: 'short' })
        );
        const dataMap = new Map(data.map(item => [
            new Date(item.periode).toLocaleDateString('id-ID', { month: 'short' }), 
            item
        ]));
        return allMonths.map(monthName => {
            const monthData = dataMap.get(monthName) || {};
            const values = categories.reduce((obj, cat) => {
                obj[cat.label] = monthData[cat.key] || 0;
                return obj;
            }, {});
            // UPDATED: Menghitung total realisasi dari semua kategori untuk line chart
            const realisasi = categories.reduce((sum, cat) => sum + (monthData[cat.key] || 0), 0);
            return { name: monthName, ...values, Target: monthData.target || 0, Realisasi: realisasi };
        });
    }, [data, categories, year]);

    const colors = ["#D42A2A", "#F58021", "#BB7F37", "#FFD700"];

    return (
        <Card className="surface-1">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>Grafik jumlah peserta kegiatan pemeriksaan kesehatan tahunan.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 'dataMax + 10']}/>
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }}/>
                        <Legend />
                        {categories.map((cat, index) => (
                             <Bar key={cat.key} dataKey={cat.label} stackId="a" fill={colors[index % colors.length]} barSize={30}>
                                {/* UPDATED: Menambahkan label di dalam setiap bar (hanya jika nilainya > 0) */}
                                <LabelList dataKey={cat.label} position="center" fill="#fff" fontSize={12} formatter={(value) => value > 0 ? value : ''} />
                             </Bar>
                        ))}
                        <Line type="monotone" dataKey="Target" name="Target" stroke="#0000FF" strokeWidth={2} dot={false} activeDot={false} />
                        {/* UPDATED: Menambahkan garis Realisasi berwarna hijau */}
                        <Line type="monotone" dataKey="Realisasi" name="Realisasi" stroke="#22c55e" strokeWidth={2} />
                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

// Komponen Chart Tahunan untuk data persentase
function YearlyPercentageChart({ data, title, category, year, targetValue }) {
     const chartData = useMemo(() => {
        const chartYear = year || new Date().getFullYear();
        const allMonths = Array.from({ length: 12 }, (_, i) => new Date(chartYear, i, 1).toLocaleDateString('id-ID', { month: 'short' }));
        const dataMap = new Map(data.map(item => [new Date(item.periode).toLocaleDateString('id-ID', { month: 'short' }), item]));
        return allMonths.map(monthName => {
            const monthData = dataMap.get(monthName) || {};
            return {
                name: monthName,
                [category.label]: monthData[category.key] || 0,
                Target: targetValue
            };
        });
    }, [data, category, year, targetValue]);

    return (
        <Card className="surface-1">
             <CardHeader><CardTitle>{title}</CardTitle><CardDescription>Grafik persentase kehadiran tahunan.</CardDescription></CardHeader>
             <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                        <XAxis dataKey="name" />
                        <YAxis unit="%" domain={[0, 100]}/>
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem' }} formatter={(value) => `${value}%`} />
                        <Legend />
                        <Bar dataKey={category.label} fill="#F58021" barSize={30}>
                            {/* UPDATED: Menambahkan label persentase di dalam bar */}
                            <LabelList dataKey={category.label} position="insideTop" fill="#fff" fontSize={12} formatter={(value) => `${value}%`} />
                        </Bar>
                        <Line type="monotone" dataKey="Target" name="Target" stroke="#0000FF" strokeWidth={2} dot={false} activeDot={false} />
                        {/* UPDATED: Menambahkan garis Realisasi berwarna hijau */}
                        <Line type="monotone" dataKey={category.label} name="Realisasi" stroke="#22c55e" strokeWidth={2} />
                    </ComposedChart>
                </ResponsiveContainer>
             </CardContent>
        </Card>
    )
}

// --- KOMPONEN UTAMA ---
export default function RikesNapza() {
  const { isAdmin, token } = useAuth();
  const { toast } = useToast();
  
  const [rikesYearlyData, setRikesYearlyData] = useState([]);
  const [napzaYearlyData, setNapzaYearlyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogsOpen, setDialogsOpen] = useState({ pradinas: false, napza: false });
  
  const today = new Date();
  const [filters, setFilters] = useState({ year: today.getFullYear() });
  
  const fetchData = useCallback(async () => {
    if (!token || !API_BASE_URL) {
      toast({ title: "Konfigurasi Error", description: "API URL atau token tidak ditemukan.", variant: "destructive" });
      setIsLoading(false); return;
    }
    
    setIsLoading(true);
    setRikesYearlyData([]); 
    setNapzaYearlyData([]);
    try {
        const [rikesResponse, napzaResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/rikes-pradinas/filter/year?year=${filters.year}`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_BASE_URL}/rikes-napza/filter/year?year=${filters.year}`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (rikesResponse.ok) {
            const rikesResult = await rikesResponse.json();
            setRikesYearlyData(rikesResult.records || []);
        } else { console.error("Gagal memuat data tahunan Rikes Pradinas."); }

        if(napzaResponse.ok){
            const napzaResult = await napzaResponse.json();
            setNapzaYearlyData(napzaResult.records || []);
        } else { console.error("Gagal memuat data tahunan NAPZA."); }

    } catch (error) { toast({ title: "Error", description: "Terjadi kesalahan saat mengambil data.", variant: "destructive" });
    } finally { setIsLoading(false); }
  }, [token, filters.year, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFilterChange = (type, value) => setFilters(prev => ({...prev, [type]: value}));
  const handleSuccess = (dialogName) => {
      setDialogsOpen(prev => ({...prev, [dialogName]: false }));
      fetchData();
  };
  
  const rikesCategories = [ {key: 'asp', label: 'ASP'}, {key: 'occ', label: 'OCC'}, {key: 'sarana', label: 'Sarana'}, {key: 'prasarana', label: 'Prasarana'} ];
  const napzaCountCategories = [ {key: 'passed', label: 'Lulus'}, {key: 'not_passed', label: 'Gagal'}];
  const napzaPercentCategory = {key: 'kehadiran', label: 'Hadir (%)'};

  if (isLoading) {
      return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8 relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white">Laporan Tahunan Rikes & NAPZA</h1>
                <p className="text-white mt-1">Monitoring hasil pemeriksaan untuk tahun {filters.year}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Select value={String(filters.year)} onValueChange={(v) => handleFilterChange('year', Number(v))}>
                    <SelectTrigger className="w-full sm:w-[120px]">
                        <SelectValue placeholder="Pilih Tahun" />
                    </SelectTrigger>
                    <SelectContent>{Array.from({length: 5}, (_, i) => <SelectItem key={i} value={String(today.getFullYear() - i)}>{today.getFullYear() - i}</SelectItem>)}</SelectContent>
                </Select>
                {isAdmin && (
                    <div className="flex items-center gap-2">
                         <Dialog open={dialogsOpen.pradinas} onOpenChange={(isOpen) => setDialogsOpen(p => ({...p, pradinas: isOpen}))}><DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Rikes Pradinas</Button></DialogTrigger><DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>Tambah Data Bulanan Rikes Pradinas</DialogTitle><DialogDescription>Isi detail laporan untuk periode yang dipilih.</DialogDescription></DialogHeader><RikesPradinasForm token={token} onSuccess={() => handleSuccess('pradinas')} /></DialogContent></Dialog>
                         <Dialog open={dialogsOpen.napza} onOpenChange={(isOpen) => setDialogsOpen(p => ({...p, napza: isOpen}))}><DialogTrigger asChild><Button variant="outline"><Plus className="h-4 w-4 mr-2" /> Rikes & NAPZA</Button></DialogTrigger><DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>Tambah Data Bulanan Rikes & NAPZA</DialogTitle><DialogDescription>Isi detail laporan untuk periode yang dipilih.</DialogDescription></DialogHeader><RikesNapzaForm token={token} onSuccess={() => handleSuccess('napza')} /></DialogContent></Dialog>
                    </div>
                )}
            </div>
        </div>
        
        {rikesYearlyData.length === 0 && napzaYearlyData.length === 0 ? (
            <Card className="surface-1 text-center py-12"><FileX className="mx-auto h-12 w-12 text-muted-foreground" /><h3 className="mt-4 text-lg font-semibold">Data Tidak Ditemukan</h3><p className="mt-1 text-sm text-muted-foreground">Tidak ada data laporan untuk tahun {filters.year}.{isAdmin && " Silakan tambahkan data baru."}</p></Card>
        ) : (
        <div className="space-y-8">
            {rikesYearlyData.length > 0 && (
                 <YearlyCountChart 
                    data={rikesYearlyData} 
                    title="Grafik Kehadiran Rikes Pra-Dinas" 
                    categories={rikesCategories}
                    year={filters.year}
                 />
            )}
             {napzaYearlyData.length > 0 && (
                <div className="space-y-8">
                    <YearlyCountChart 
                        data={napzaYearlyData} 
                        title="Grafik Hasil Tes NAPZA (Jumlah)" 
                        categories={napzaCountCategories}
                        year={filters.year}
                    />
                    <YearlyPercentageChart
                        data={napzaYearlyData}
                        title="Grafik Kehadiran Tes NAPZA (%)"
                        category={napzaPercentCategory}
                        year={filters.year}
                        targetValue={100} // Asumsi target kehadiran 100%
                    />
                </div>
             )}
        </div>
        )}
    </div>
  );
}
