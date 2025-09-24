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
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    fatalities: 0,
    lostTimeInjuries: 0,
    nearMisses: 0,
    totalWorkingHours: 176000,
    totalLostDays: 0,
    reportingPeriod: currentMonth
  });

  // Historical data for review
  const [historicalData] = useState([
    {
      id: 1,
      period: "Desember 2023",
      fatalities: 0,
      lostTimeInjuries: 3,
      nearMisses: 12,
      fr: 1.7,
      sr: 1.2,
      status: "approved"
    },
    {
      id: 2,
      period: "November 2023", 
      fatalities: 0,
      lostTimeInjuries: 1,
      nearMisses: 8,
      fr: 1.1,
      sr: 0.6,
      status: "approved"
    }
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'reportingPeriod' ? value : parseInt(value) || 0
    }));
  };

  const calculateRates = () => {
    const fr = (formData.lostTimeInjuries * 1000000) / formData.totalWorkingHours;
    const sr = (formData.totalLostDays * 1000000) / formData.totalWorkingHours;
    const far = (formData.fatalities * 100000000) / formData.totalWorkingHours;
    
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
        description: `Safety metrics untuk ${formData.reportingPeriod} telah diupdate. FR: ${rates.fr}, SR: ${rates.sr}`,
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
            Periode: {currentMonth}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fatalities">Number of Fatality</Label>
                        <Input
                          id="fatalities"
                          type="number"
                          min="0"
                          value={formData.fatalities}
                          onChange={(e) => handleInputChange('fatalities', e.target.value)}
                          disabled={!canInputData}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lostTimeInjuries">Lost Time Injuries</Label>
                        <Input
                          id="lostTimeInjuries"
                          type="number"
                          min="0"
                          value={formData.lostTimeInjuries}
                          onChange={(e) => handleInputChange('lostTimeInjuries', e.target.value)}
                          disabled={!canInputData}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nearMisses">Near Misses</Label>
                        <Input
                          id="nearMisses"
                          type="number"
                          min="0"
                          value={formData.nearMisses}
                          onChange={(e) => handleInputChange('nearMisses', e.target.value)}
                          disabled={!canInputData}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="totalLostDays">Total Lost Days</Label>
                        <Input
                          id="totalLostDays"
                          type="number"
                          min="0"
                          value={formData.totalLostDays}
                          onChange={(e) => handleInputChange('totalLostDays', e.target.value)}
                          disabled={!canInputData}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="totalWorkingHours">Total Working Hours</Label>
                        <Input
                          id="totalWorkingHours"
                          type="number"
                          min="1"
                          value={formData.totalWorkingHours}
                          onChange={(e) => handleInputChange('totalWorkingHours', e.target.value)}
                          disabled={!canInputData}
                        />
                        <p className="text-xs text-muted-foreground">
                          Jam kerja total seluruh karyawan dalam periode ini
                        </p>
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
                        <h4 className="font-semibold">{data.period}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Fatalities:</span>
                            <span className="font-medium ml-2">{data.fatalities}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">LTI:</span>
                            <span className="font-medium ml-2">{data.lostTimeInjuries}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Near Miss:</span>
                            <span className="font-medium ml-2">{data.nearMisses}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">FR:</span>
                            <span className="font-medium ml-2">{data.fr}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="success">
                          {data.status === 'approved' ? 'Approved' : 'Pending'}
                        </Badge>
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