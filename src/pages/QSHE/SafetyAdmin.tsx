"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar,
  Save, 
  AlertCircle, 
  CheckCircle, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const API_URL = "http://127.0.0.1:8000/api/v1/safety-metrics";
const ITEMS_PER_PAGE = 5;

/**
 * Safety Admin Panel - For administrators only
 * Input form for monthly safety data with validation
 * Data is fetched and updated from the Laravel API
 */
export default function SafetyAdmin() {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().substring(0, 7));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [historicalData, setHistoricalData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [formData, setFormData] = useState({
    month: currentMonth,
    fatality: 0,
    lost_time_injuries: 0,
    illness: 0,
    medical_treatment_cases: 0,
    first_aid_cases: 0,
    property_damage: 0,
    near_miss: 0,
    unsafe_action: 0,
    unsafe_condition: 0,
    work_hours: 176000,
    lost_days: 0,
    far: 0,
    sr: 0,
    fr: 0,
    safety_inspection: false,
    emergency_drill: false,
    incident_investigation: false,
    internal_audit: false,
    p2k3_meeting: false,
    safety_awareness: false,
    status: "pending"
  });

  // Fetch historical data on load and when month changes
  useEffect(() => {
    async function fetchHistoricalData() {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("Authentication token not available.");
        return;
      }

      try {
        const res = await fetch(API_URL, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
        if (!res.ok) throw new Error("Failed to fetch historical data");
        const data = await res.json();
        setHistoricalData(data);

        // Check for existing data for the current month and pre-fill form
        const currentMonthData = data.find(item => item.month === currentMonth);
        if (currentMonthData) {
          setFormData(currentMonthData);
        } else {
          setFormData(prev => ({ 
            ...prev, 
            month: currentMonth,
            // Reset other form fields when month changes to a new month
            fatality: 0,
            lost_time_injuries: 0,
            illness: 0,
            medical_treatment_cases: 0,
            first_aid_cases: 0,
            property_damage: 0,
            near_miss: 0,
            unsafe_action: 0,
            unsafe_condition: 0,
            work_hours: 176000,
            lost_days: 0,
            far: 0,
            sr: 0,
            fr: 0,
            safety_inspection: false,
            emergency_drill: false,
            incident_investigation: false,
            internal_audit: false,
            p2k3_meeting: false,
            safety_awareness: false,
            status: "pending"
          }));
        }

      } catch (error) {
        console.error("Error fetching historical data:", error);
      } finally {
        setIsDataLoaded(true);
      }
    }
    fetchHistoricalData();
  }, [currentMonth]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'boolean' ? value : 
               (field === 'month' ? value : 
               (parseFloat(value) || 0))
    }));
  };

  const calculateRates = (data) => {
    const fr = (data.lost_time_injuries * 1000000) / data.work_hours;
    const sr = (data.lost_days * 1000000) / data.work_hours;
    const far = (data.fatality * 1000000) / data.work_hours;
    
    return {
      fr: parseFloat(fr.toFixed(2)),
      sr: parseFloat(sr.toFixed(2)),
      far: parseFloat(far.toFixed(2))
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    
    // Recalculate rates before sending
    const rates = calculateRates(formData);
    const payload = { ...formData, ...rates, status: "pending" };

    const existingData = historicalData.find(item => item.month === payload.month);
    let url = API_URL;
    let method = 'POST';

    if (existingData) {
      url = `${API_URL}/${existingData.id}`;
      method = 'PUT';
    }
    
    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Gagal menyimpan data.");
      
      const responseData = await res.json();
      
      // Update historical data
      if (existingData) {
        setHistoricalData(historicalData.map(item => item.month === payload.month ? responseData : item));
      } else {
        setHistoricalData([...historicalData, responseData]);
      }

      toast({
        title: "Data berhasil disimpan",
        description: `Safety metrics untuk ${payload.month} telah diupdate.`,
      });
      
    } catch (error) {
      console.error("Error submitting data:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan data. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedRates = calculateRates(formData);

  // Filter and paginate data
  const filteredData = historicalData.filter(data => 
    new Date(data.month + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime());
  
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPiramidaData = (data) => {
    return [
      { label: "Fatality", value: data.fatality, color: '#ff4d4f' },
      { label: "Lost Time Injuries", value: data.lost_time_injuries, color: '#f5222d' },
      { label: "Illness", value: data.illness, color: '#fa8c16' },
      { label: "Medical Treatment Cases", value: data.medical_treatment_cases, color: '#faad14' },
      { label: "First Aid Cases", value: data.first_aid_cases, color: '#a0d911' },
      { label: "Property Damage", value: data.property_damage, color: '#52c41a' },
      { label: "Near Miss", value: data.near_miss, color: '#13c2c2' },
      { label: "Unsafe Action", value: data.unsafe_action, color: '#40a9ff' },
      { label: "Unsafe Condition", value: data.unsafe_condition, color: '#2f54eb' },
    ].sort((a, b) => a.value - b.value); 
  };

  const SafetyPyramid = ({ data }) => {
    const pyramidData = getPiramidaData(data);
    const totalValue = pyramidData.reduce((sum, item) => sum + item.value, 0);

    const renderPyramid = () => (
      <div className="flex flex-col-reverse w-full max-w-sm items-center overflow-hidden">
        {pyramidData.map((item, index) => {
          const percentage = totalValue > 0 ? (item.value / totalValue) : 0;
          const width = Math.max(10, percentage * 100);
          
          return (
            <div 
              key={item.label}
              className="py-1 text-center font-medium relative transition-all duration-300 ease-in-out"
              style={{
                backgroundColor: item.color,
                width: `${width}%`,
                clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                marginTop: '-1px'
              }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
                <span className="text-white text-xs whitespace-nowrap drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                  {item.value} - {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );

    return (
      <div className="flex flex-col items-center p-4">
        <h3 className="text-xl font-bold mb-4">Piramida Insiden Keselamatan</h3>
        
        {totalValue > 0 ? (
          renderPyramid()
        ) : (
          <div className="text-center text-muted-foreground mt-4">Tidak ada data untuk piramida.</div>
        )}
        <div className="mt-8 grid grid-cols-2 gap-4 w-full">
          {pyramidData.sort((a, b) => b.value - a.value).map(item => (
            <div key={item.label} className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
              <span>{item.label}: {item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Safety Admin Panel</h1>
          <p className="text-white mt-1">
            Input dan kelola data Safety Key Metrics
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Calendar className="h-4 w-4 text-white" />
          <span className="text-sm text-white">
            Periode: {new Date(formData.month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      <Tabs defaultValue="input" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="input">Input Data</TabsTrigger>
          <TabsTrigger value="history">Riwayat Data</TabsTrigger>
        </TabsList>

        {/* Data Input Tab */}
        <TabsContent value="input" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form */}
            <div className="lg:col-span-2">
              <Card className="surface-1">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Input Safety Data</span>
                  </CardTitle>
                  <CardDescription>
                    Masukkan data safety bulanan. Pastikan data akurat sebelum submit.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="month">Bulan/Tahun</Label>
                          <Input
                            id="month"
                            type="month"
                            value={formData.month}
                            onChange={(e) => setCurrentMonth(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fatality">Number of Fatality</Label>
                          <Input
                            id="fatality"
                            type="number"
                            min="0"
                            value={formData.fatality}
                            onChange={(e) => handleInputChange('fatality', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lost_time_injuries">Lost Time Injuries</Label>
                          <Input
                            id="lost_time_injuries"
                            type="number"
                            min="0"
                            value={formData.lost_time_injuries}
                            onChange={(e) => handleInputChange('lost_time_injuries', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="illness">Illness</Label>
                          <Input
                            id="illness"
                            type="number"
                            min="0"
                            value={formData.illness}
                            onChange={(e) => handleInputChange('illness', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="medical_treatment_cases">Medical Treatment Cases</Label>
                          <Input
                            id="medical_treatment_cases"
                            type="number"
                            min="0"
                            value={formData.medical_treatment_cases}
                            onChange={(e) => handleInputChange('medical_treatment_cases', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="first_aid_cases">First Aid Cases</Label>
                          <Input
                            id="first_aid_cases"
                            type="number"
                            min="0"
                            value={formData.first_aid_cases}
                            onChange={(e) => handleInputChange('first_aid_cases', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="property_damage">Property Damage</Label>
                          <Input
                            id="property_damage"
                            type="number"
                            min="0"
                            value={formData.property_damage}
                            onChange={(e) => handleInputChange('property_damage', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="near_miss">Near Miss</Label>
                          <Input
                            id="near_miss"
                            type="number"
                            min="0"
                            value={formData.near_miss}
                            onChange={(e) => handleInputChange('near_miss', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="unsafe_action">Unsafe Action</Label>
                          <Input
                            id="unsafe_action"
                            type="number"
                            min="0"
                            value={formData.unsafe_action}
                            onChange={(e) => handleInputChange('unsafe_action', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="unsafe_condition">Unsafe Condition</Label>
                          <Input
                            id="unsafe_condition"
                            type="number"
                            min="0"
                            value={formData.unsafe_condition}
                            onChange={(e) => handleInputChange('unsafe_condition', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lost_days">Total Lost Days</Label>
                          <Input
                            id="lost_days"
                            type="number"
                            min="0"
                            value={formData.lost_days}
                            onChange={(e) => handleInputChange('lost_days', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="work_hours">Total Working Hours</Label>
                          <Input
                            id="work_hours"
                            type="number"
                            min="1"
                            value={formData.work_hours}
                            onChange={(e) => handleInputChange('work_hours', e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Jam kerja total seluruh karyawan dalam periode ini
                          </p>
                        </div>
                      </div>

                      {/* Safety Activities Checkboxes */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Aktivitas Keselamatan</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="safety_inspection"
                              checked={formData.safety_inspection}
                              onChange={(e) => handleInputChange('safety_inspection', e.target.checked)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor="safety_inspection">Inspeksi Keselamatan</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="emergency_drill"
                              checked={formData.emergency_drill}
                              onChange={(e) => handleInputChange('emergency_drill', e.target.checked)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor="emergency_drill">Simulasi Tanggap Darurat</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="incident_investigation"
                              checked={formData.incident_investigation}
                              onChange={(e) => handleInputChange('incident_investigation', e.target.checked)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor="incident_investigation">Investigasi Insiden Keselamatan</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="internal_audit"
                              checked={formData.internal_audit}
                              onChange={(e) => handleInputChange('internal_audit', e.target.checked)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor="internal_audit">Audit Internal Keselamatan</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="p2k3_meeting"
                              checked={formData.p2k3_meeting}
                              onChange={(e) => handleInputChange('p2k3_meeting', e.target.checked)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor="p2k3_meeting">Rapat P2K3</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="safety_awareness"
                              checked={formData.safety_awareness}
                              onChange={(e) => handleInputChange('safety_awareness', e.target.checked)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor="safety_awareness">Awareness Keselamatan</Label>
                          </div>
                        </div>
                      </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-primary hover:opacity-90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

            {/* Calculated Results */}
            <div className="space-y-6">
              <Card className="surface-1">
                <CardHeader>
                  <CardTitle className="text-lg">Perhitungan Otomatis</CardTitle>
                  <CardDescription>
                    Hasil kalkulasi berdasarkan data input
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Frequency Rate</span>
                      <Badge variant="secondary">{displayedRates.fr}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Severity Rate</span>
                      <Badge variant="secondary">{displayedRates.sr}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Fatal Accident Rate</span>
                      <Badge variant={displayedRates.far === 0 ? "success" : "destructive"}>{displayedRates.far}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="surface-1">
                <CardHeader>
                  <CardTitle className="text-lg">Status Input</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">
                        Input diizinkan
                      </span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Periode: {new Date(formData.month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Historical Data Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card className="surface-1">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Riwayat Data Safety</CardTitle>
                <div className="relative">
                  <Input 
                    type="text" 
                    placeholder="Cari..." 
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // Reset to first page on search
                    }}
                  />
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <CardDescription>
                Data safety yang telah diinput dan disetujui
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paginatedData.map((data) => (
                  <div key={data.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{new Date(data.month + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Fatality:</span>
                            <span className="font-medium ml-2">{data.fatality}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">LTI:</span>
                            <span className="font-medium ml-2">{data.lost_time_injuries}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Near Miss:</span>
                            <span className="font-medium ml-2">{data.near_miss}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">FR:</span>
                            <span className="font-medium ml-2">{data.fr}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Work Hours:</span>
                            <span className="font-medium ml-2">{data.work_hours.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                         <Badge variant={data.status === 'approved' ? "success" : "secondary"}>
                           {data.status === 'approved' ? 'Approved' : 'Pending'}
                         </Badge>
                         <Dialog>
                           <DialogTrigger asChild>
                             <Button size="sm" variant="outline">
                               <Eye className="h-3 w-3 mr-1" />
                               Details
                             </Button>
                           </DialogTrigger>
                           <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                             <DialogHeader>
                               <DialogTitle>
                                 Safety Data Details - {new Date(data.month + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                               </DialogTitle>
                             </DialogHeader>
                             <SafetyPyramid data={data} />
                           </DialogContent>
                         </Dialog>
                         
                         <Button size="sm" variant="outline">
                           <Edit className="h-3 w-3" />
                         </Button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <Button 
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const SafetyPyramid = ({ data }) => {
  const pyramidData = [
    { label: "Unsafe Condition", value: data.unsafe_condition, color: '#2f54eb' },
    { label: "Unsafe Action", value: data.unsafe_action, color: '#40a9ff' },
    { label: "Near Miss", value: data.near_miss, color: '#13c2c2' },
    { label: "Property Damage", value: data.property_damage, color: '#52c41a' },
    { label: "First Aid Cases", value: data.first_aid_cases, color: '#a0d911' },
    { label: "Medical Treatment Cases", value: data.medical_treatment_cases, color: '#faad14' },
    { label: "Illness", value: data.illness, color: '#fa8c16' },
    { label: "Lost Time Injuries", value: data.lost_time_injuries, color: '#f5222d' },
    { label: "Fatality", value: data.fatality, color: '#ff4d4f' },
  ].sort((a, b) => b.value - a.value); 

  const totalValue = pyramidData.reduce((sum, item) => sum + item.value, 0);

  const renderPyramid = () => (
    <div className="flex flex-col w-full max-w-sm items-center overflow-hidden">
      {pyramidData.map((item, index) => {
        const percentage = totalValue > 0 ? (item.value / totalValue) : 0;
        const width = `${(percentage * 100).toFixed(2)}%`;
        const topMargin = index === 0 ? '0' : '-1px';
        const maxWidth = 300; 
        const currentWidth = Math.max(20, (item.value/pyramidData[0].value) * maxWidth);
        
        return (
          <div 
            key={item.label}
            className="py-1 text-center font-medium relative transition-all duration-300 ease-in-out"
            style={{
              backgroundColor: item.color,
              width: `${currentWidth}px`,
              clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
              marginTop: topMargin
            }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
              <span className="text-white text-xs whitespace-nowrap drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                {item.value} - {item.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col items-center p-4">
      <h3 className="text-xl font-bold mb-4">Piramida Insiden Keselamatan</h3>
      {totalValue > 0 ? (
        renderPyramid()
      ) : (
        <div className="text-center text-muted-foreground mt-4">Tidak ada data untuk piramida.</div>
      )}
      <div className="mt-8 grid grid-cols-2 gap-4 w-full">
        {pyramidData.map(item => (
          <div key={item.label} className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
            <span>{item.label}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
