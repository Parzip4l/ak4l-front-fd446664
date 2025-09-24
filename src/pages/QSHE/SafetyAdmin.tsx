import { useState } from "react";
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
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SafetyPyramid from "@/components/QSHE/SafetyPyramid";

/**
 * Safety Admin Panel - For administrators only
 * Input form for monthly safety data with validation
 * Restriction: Data input only allowed until 3rd of each month
 */
export default function SafetyAdmin() {
  const { toast } = useToast();
  const [currentMonth] = useState(new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if current date allows data input (before 3rd of month)
  const currentDate = new Date();
  const canInputData = currentDate.getDate() <= 3;
  
  const [formData, setFormData] = useState({
    month: new Date().toISOString().substring(0, 7), // YYYY-MM format
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
    safety_inspection: false,
    emergency_drill: false,
    incident_investigation: false,
    internal_audit: false,
    p2k3_meeting: false,
    safety_awareness: false
  });

  // Historical data for review
  const [historicalData] = useState([
    {
      id: 1,
      month: "2023-12",
      fatality: 0,
      lost_time_injuries: 3,
      illness: 1,
      medical_treatment_cases: 5,
      first_aid_cases: 8,
      property_damage: 2,
      near_miss: 12,
      unsafe_action: 15,
      unsafe_condition: 8,
      work_hours: 176000,
      lost_days: 15,
      fr: 1.7,
      sr: 1.2,
      far: 0,
      safety_inspection: true,
      emergency_drill: true,
      incident_investigation: false,
      internal_audit: true,
      p2k3_meeting: true,
      safety_awareness: true,
      status: "approved"
    },
    {
      id: 2,
      month: "2023-11",
      fatality: 0,
      lost_time_injuries: 1,
      illness: 0,
      medical_treatment_cases: 3,
      first_aid_cases: 5,
      property_damage: 1,
      near_miss: 8,
      unsafe_action: 10,
      unsafe_condition: 5,
      work_hours: 172000,
      lost_days: 5,
      fr: 1.1,
      sr: 0.6,
      far: 0,
      safety_inspection: true,
      emergency_drill: false,
      incident_investigation: true,
      internal_audit: true,
      p2k3_meeting: true,
      safety_awareness: false,
      status: "approved"
    }
  ]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'boolean' ? value : 
               field === 'month' ? value : 
               parseInt(value as string) || 0
    }));
  };

  const calculateRates = () => {
    const fr = (formData.lost_time_injuries * 1000000) / formData.work_hours;
    const sr = (formData.lost_days * 1000000) / formData.work_hours;
    const far = (formData.fatality * 1000000) / formData.work_hours;
    
    return {
      fr: parseFloat(fr.toFixed(2)),
      sr: parseFloat(sr.toFixed(2)),
      far: parseFloat(far.toFixed(2))
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canInputData) {
      toast({
        title: "Input ditolak",
        description: "Data hanya dapat diinput hingga tanggal 3 setiap bulan.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const rates = calculateRates();
      
      toast({
        title: "Data berhasil disimpan",
        description: `Safety metrics untuk ${formData.month} telah diupdate. FR: ${rates.fr}, SR: ${rates.sr}`,
      });
      
      // Reset form would happen here in real implementation
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan data. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const rates = calculateRates();

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Safety Admin Panel</h1>
          <p className="text-muted-foreground mt-1">
            Input dan kelola data Safety Key Metrics
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Periode: {formData.month}
          </span>
        </div>
      </div>

      {/* Input Restriction Alert */}
      <Alert variant={canInputData ? "default" : "destructive"}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {canInputData ? (
            `Data dapat diinput hingga tanggal 3 setiap bulan. Sisa waktu: ${3 - currentDate.getDate()} hari.`
          ) : (
            "Periode input data telah berakhir. Data hanya dapat diinput hingga tanggal 3 setiap bulan."
          )}
        </AlertDescription>
      </Alert>

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
                         <Label htmlFor="fatality">Number of Fatality</Label>
                         <Input
                           id="fatality"
                           type="number"
                           min="0"
                           value={formData.fatality}
                           onChange={(e) => handleInputChange('fatality', e.target.value)}
                           disabled={!canInputData}
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
                           disabled={!canInputData}
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
                           disabled={!canInputData}
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
                           disabled={!canInputData}
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
                           disabled={!canInputData}
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
                           disabled={!canInputData}
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
                           disabled={!canInputData}
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
                           disabled={!canInputData}
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
                           disabled={!canInputData}
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
                           disabled={!canInputData}
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
                           disabled={!canInputData}
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
                             disabled={!canInputData}
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
                             disabled={!canInputData}
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
                             disabled={!canInputData}
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
                             disabled={!canInputData}
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
                             disabled={!canInputData}
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
                             disabled={!canInputData}
                             className="h-4 w-4"
                           />
                           <Label htmlFor="safety_awareness">Awareness Keselamatan</Label>
                         </div>
                       </div>
                     </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-primary hover:opacity-90"
                      disabled={!canInputData || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
                      <Badge variant="secondary">{rates.fr}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Severity Rate</span>
                      <Badge variant="secondary">{rates.sr}</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Fatal Accident Rate</span>
                      <Badge variant={rates.far === 0 ? "success" : "destructive"}>{rates.far}</Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t text-center">
                    <p className="text-xs text-muted-foreground">
                      Kalkulasi otomatis berdasarkan formula standar industri
                    </p>
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
                      {canInputData ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-sm">
                        {canInputData ? "Input diizinkan" : "Input ditutup"}
                      </span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Periode: {currentMonth}
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
              <CardTitle>Riwayat Data Safety</CardTitle>
              <CardDescription>
                Data safety yang telah diinput dan disetujui
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {historicalData.map((data) => (
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
                        <Badge variant="success">
                          {data.status === 'approved' ? 'Approved' : 'Pending'}
                        </Badge>
                        
                        {/* Details Button with Pyramid Modal */}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}