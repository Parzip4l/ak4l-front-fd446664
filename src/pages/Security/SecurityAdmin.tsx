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
  Edit
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Security Admin Panel - For administrators only
 * Input form for monthly security data with validation
 * Restriction: Data input only allowed until 3rd of each month
 */
export default function SecurityAdmin() {
  const { toast } = useToast();
  const [currentMonth] = useState(new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if current date allows data input (before 3rd of month)
  const currentDate = new Date();
  const canInputData = currentDate.getDate() <= 3;
  
  const [formData, setFormData] = useState({
    criminalCases: 0,
    bombThreats: 0,
    theftCases: 0,
    vandalism: 0,
    unauthorizedAccess: 0,
    vehicleIncidents: 0,
    reportingPeriod: currentMonth
  });

  // Historical data for review
  const [historicalData] = useState([
    {
      id: 1,
      period: "Desember 2023",
      criminalCases: 1,
      bombThreats: 0,
      theftCases: 2,
      unauthorizedAccess: 3,
      totalIncidents: 6,
      status: "approved"
    },
    {
      id: 2,
      period: "November 2023", 
      criminalCases: 0,
      bombThreats: 0,
      theftCases: 1,
      unauthorizedAccess: 1,
      totalIncidents: 2,
      status: "approved"
    }
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'reportingPeriod' ? value : parseInt(value) || 0
    }));
  };

  const getTotalIncidents = () => {
    return formData.criminalCases + formData.bombThreats + formData.theftCases + 
           formData.vandalism + formData.unauthorizedAccess + formData.vehicleIncidents;
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
      
      const totalIncidents = getTotalIncidents();
      
      toast({
        title: "Data berhasil disimpan",
        description: `Security metrics untuk ${formData.reportingPeriod} telah diupdate. Total insiden: ${totalIncidents}`,
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

  const getIncidentLevel = (total: number) => {
    if (total === 0) return { level: "Excellent", color: "success" };
    if (total <= 3) return { level: "Good", color: "warning" };
    if (total <= 6) return { level: "Moderate", color: "destructive" };
    return { level: "High", color: "destructive" };
  };

  const incidentLevel = getIncidentLevel(getTotalIncidents());

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Admin Panel</h1>
          <p className="text-muted-foreground mt-1">
            Input dan kelola data Security Key Metrics
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
                    <span>Input Security Data</span>
                  </CardTitle>
                  <CardDescription>
                    Masukkan data insiden keamanan bulanan. Data harus akurat dan terverifikasi.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="criminalCases">Kasus Kriminal</Label>
                        <Input
                          id="criminalCases"
                          type="number"
                          min="0"
                          value={formData.criminalCases}
                          onChange={(e) => handleInputChange('criminalCases', e.target.value)}
                          disabled={!canInputData}
                        />
                        <p className="text-xs text-muted-foreground">
                          Tindak pidana dalam area kerja
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bombThreats">Ancaman Bom</Label>
                        <Input
                          id="bombThreats"
                          type="number"
                          min="0"
                          value={formData.bombThreats}
                          onChange={(e) => handleInputChange('bombThreats', e.target.value)}
                          disabled={!canInputData}
                        />
                        <p className="text-xs text-muted-foreground">
                          Laporan ancaman bom atau teror
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="theftCases">Kasus Pencurian</Label>
                        <Input
                          id="theftCases"
                          type="number"
                          min="0"
                          value={formData.theftCases}
                          onChange={(e) => handleInputChange('theftCases', e.target.value)}
                          disabled={!canInputData}
                        />
                        <p className="text-xs text-muted-foreground">
                          Kehilangan atau pencurian barang
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vandalism">Vandalisme</Label>
                        <Input
                          id="vandalism"
                          type="number"
                          min="0"
                          value={formData.vandalism}
                          onChange={(e) => handleInputChange('vandalism', e.target.value)}
                          disabled={!canInputData}
                        />
                        <p className="text-xs text-muted-foreground">
                          Kerusakan properti akibat vandalisme
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="unauthorizedAccess">Akses Tidak Sah</Label>
                        <Input
                          id="unauthorizedAccess"
                          type="number"
                          min="0"
                          value={formData.unauthorizedAccess}
                          onChange={(e) => handleInputChange('unauthorizedAccess', e.target.value)}
                          disabled={!canInputData}
                        />
                        <p className="text-xs text-muted-foreground">
                          Pelanggaran akses area terbatas
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vehicleIncidents">Insiden Kendaraan</Label>
                        <Input
                          id="vehicleIncidents"
                          type="number"
                          min="0"
                          value={formData.vehicleIncidents}
                          onChange={(e) => handleInputChange('vehicleIncidents', e.target.value)}
                          disabled={!canInputData}
                        />
                        <p className="text-xs text-muted-foreground">
                          Kecelakaan atau insiden kendaraan
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

            {/* Summary Results */}
            <div className="space-y-6">
              <Card className="surface-1">
                <CardHeader>
                  <CardTitle className="text-lg">Summary Insiden</CardTitle>
                  <CardDescription>
                    Total dan assessment berdasarkan input
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`p-4 rounded-lg text-center ${
                    incidentLevel.color === 'success' ? 'bg-success/10' :
                    incidentLevel.color === 'warning' ? 'bg-warning/10' : 'bg-destructive/10'
                  }`}>
                    <div className={`text-3xl font-bold ${
                      incidentLevel.color === 'success' ? 'text-success' :
                      incidentLevel.color === 'warning' ? 'text-warning' : 'text-destructive'
                    }`}>
                      {getTotalIncidents()}
                    </div>
                    <p className="text-sm font-medium mt-1">Total Insiden</p>
                    <Badge 
                      variant={incidentLevel.color as any} 
                      className="mt-2"
                    >
                      {incidentLevel.level}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Kriminal:</span>
                      <span className="font-medium">{formData.criminalCases}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ancaman Bom:</span>
                      <span className="font-medium">{formData.bombThreats}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pencurian:</span>
                      <span className="font-medium">{formData.theftCases}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Akses Tidak Sah:</span>
                      <span className="font-medium">{formData.unauthorizedAccess}</span>
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
              <CardTitle>Riwayat Data Security</CardTitle>
              <CardDescription>
                Data security yang telah diinput dan disetujui
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
                            <span className="text-muted-foreground">Kriminal:</span>
                            <span className="font-medium ml-2">{data.criminalCases}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Pencurian:</span>
                            <span className="font-medium ml-2">{data.theftCases}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Akses:</span>
                            <span className="font-medium ml-2">{data.unauthorizedAccess}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total:</span>
                            <span className="font-medium ml-2">{data.totalIncidents}</span>
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