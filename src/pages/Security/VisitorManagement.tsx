"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Plus, 
  Calendar,
  Clock,
  CheckCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";
const API_URL = `${API_BASE_URL}/visitor-requests`;

/**
 * Visitor Management System - Online visitor request form
 * Allows users to submit visitor requests that need admin approval
 */
export default function VisitorManagement() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    visitorName: "",
    company: "",
    purpose: "",
    contactPerson: "",
    visitDate: "",
    visitTime: "",
    duration: "",
    additionalNotes: ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    if (!token) {
      toast({
        title: "Error",
        description: "Token otentikasi tidak ditemukan. Mohon login ulang.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    // Sesuaikan format data ke JSON raw yang diminta
    const payload = {
      visitor_name: formData.visitorName,
      visitor_company: formData.company,
      purpose: formData.purpose,
      visit_date: `${formData.visitDate} ${formData.visitTime}:00`,
      // Assuming host_id is a static value for now or obtained from elsewhere
      // I'll use a dummy value for the example. You might need to change this.
      host_id: 2 
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error("Gagal mengirim pengajuan.");
      }
      
      const responseData = await res.json();
      
      toast({
        title: "Pengajuan berhasil dikirim",
        description: "Pengajuan kunjungan Anda akan diproses oleh admin security",
      });
      
      // Reset form
      setFormData({
        visitorName: "",
        company: "",
        purpose: "",
        contactPerson: "",
        visitDate: "",
        visitTime: "",
        duration: "",
        additionalNotes: ""
      });
      
    } catch (error) {
      console.error("Error submitting data:", error);
      toast({
        title: "Pengajuan gagal",
        description: "Terjadi kesalahan saat mengirim pengajuan",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8 relative">
      <div>
        <h1 className="text-3xl font-bold text-white">Visitor Management System</h1>
        <p className="text-white mt-1">
          Ajukan kunjungan tamu secara online untuk mendapatkan persetujuan
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visitor Request Form */}
        <div className="lg:col-span-2">
          <Card className="surface-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Pengajuan Kunjungan Baru</span>
              </CardTitle>
              <CardDescription>
                Isi form berikut untuk mengajukan kunjungan tamu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="visitorName">Nama Pengunjung *</Label>
                    <Input
                      id="visitorName"
                      value={formData.visitorName}
                      onChange={(e) => handleInputChange('visitorName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Perusahaan/Instansi</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="visitDate">Tanggal Kunjungan *</Label>
                    <Input
                      id="visitDate"
                      type="date"
                      value={formData.visitDate}
                      onChange={(e) => handleInputChange('visitDate', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="visitTime">Waktu Kunjungan *</Label>
                    <Input
                      id="visitTime"
                      type="time"
                      value={formData.visitTime}
                      onChange={(e) => handleInputChange('visitTime', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input
                      id="contactPerson"
                      placeholder="Nama karyawan yang akan ditemui"
                      value={formData.contactPerson}
                      onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Estimasi Durasi</Label>
                    <Input
                      id="duration"
                      placeholder="contoh: 2 jam"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Tujuan Kunjungan *</Label>
                  <Textarea
                    id="purpose"
                    placeholder="Jelaskan tujuan kunjungan secara singkat"
                    value={formData.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">Catatan Tambahan</Label>
                  <Textarea
                    id="additionalNotes"
                    placeholder="Informasi tambahan jika diperlukan"
                    value={formData.additionalNotes}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    rows={2}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:opacity-90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Ajukan Kunjungan
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Guidelines & Info */}
        <div className="space-y-6">
          <Card className="surface-1">
            <CardHeader>
              <CardTitle className="text-lg">Panduan Pengajuan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
                  <div>
                    <span className="font-medium">Waktu Proses:</span>
                    <p className="text-muted-foreground">Maksimal 24 jam kerja</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
                  <div>
                    <span className="font-medium">Jam Kunjungan:</span>
                    <p className="text-muted-foreground">Senin-Jumat: 08:00-17:00</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>
                  <div>
                    <span className="font-medium">Dokumen Wajib:</span>
                    <p className="text-muted-foreground">KTP/identitas resmi</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-1">
            <CardHeader>
              <CardTitle className="text-lg">Status Pengajuan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-warning" />
                  <Badge variant="warning">Pending</Badge>
                  <span className="text-sm">Menunggu approval</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <Badge variant="success">Approved</Badge>
                  <span className="text-sm">Kunjungan disetujui</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
