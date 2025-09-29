"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, 
  CheckCircle, 
  X,
  Calendar,
  Clock,
  Search,
  CheckSquare,
  Loader2,
  Hourglass,
  BadgeCheck,
  ClipboardCheck,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_URL = "http://127.0.0.1:8000/api/v1/visitor-requests";

/**
 * VMS Admin Panel - For administrators and receptionists
 * Approve or reject visitor requests
 */
export default function VMSAdmin() {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  
  const [visitorRequests, setVisitorRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Periksa peran user untuk menentukan hak akses
  const isCSOrAdmin = user?.roles?.includes('cs') || isAdmin;

  // Fetch visitor requests from API
  useEffect(() => {
    async function fetchRequests() {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(API_URL, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
        if (!res.ok) throw new Error("Gagal mengambil data permintaan.");
        const data = await res.json();
        setVisitorRequests(data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Gagal memuat daftar kunjungan.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchRequests();
    }
  }, [user, toast]);

  // Fetch analytics data
  useEffect(() => {
    async function fetchAnalytics() {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/analytics?month=${selectedMonth}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
        if (!res.ok) throw new Error("Gagal mengambil data analitik.");
        const data = await res.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    }
    
    fetchAnalytics();
  }, [selectedMonth]);

  const handleApproval = async (id, action) => {
    const token = localStorage.getItem('token');
    const endpoint = `${API_URL}/${id}/${action}`;
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      if (!res.ok) throw new Error(`Gagal ${action} pengajuan`);
      
      const updatedRequest = await res.json();
      
      setVisitorRequests(prev => 
        prev.map(req => 
          req.id === id 
            ? updatedRequest
            : req
        )
      );
      
      const actionText = action === 'approve' ? 'disetujui' : action === 'reject' ? 'ditolak' : 'selesai';
      toast({
        title: `Pengajuan ${actionText}`,
        description: `Pengajuan kunjungan telah ${actionText} dan notifikasi akan dikirim`,
      });
      
    } catch (error) {
      console.error("Error processing request:", error);
      toast({
        title: "Error",
        description: `Gagal memproses pengajuan: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      default:
        return <Badge variant="warning">Pending</Badge>;
    }
  };
  
  const filteredRequests = Array.isArray(visitorRequests) ? visitorRequests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter;
    const matchesSearch = request.visitor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.visitor_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.contact_person?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  }) : [];

  const pendingCount = visitorRequests.filter(req => req.status === 'pending').length;
  const approvedCount = visitorRequests.filter(req => req.status === 'approved').length;
  const completedCount = visitorRequests.filter(req => req.status === 'completed').length;
  const totalCount = visitorRequests.length;
  
  const getGrowthIcon = (growth) => {
    if (growth > 0) {
      return <TrendingUp className="h-4 w-4 text-success" />;
    } else if (growth < 0) {
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    }
    return null;
  };
  

  return (
    <div className="container mx-auto p-6 space-y-8 relative">
      <div>
        <h1 className="text-3xl font-bold text-white">VMS Admin Panel</h1>
        <p className="text-white mt-1">
          Kelola dan setujui pengajuan kunjungan tamu
        </p>
      </div>

      <div className="flex justify-between items-center space-x-3">
        <h2 className="text-xl font-bold text-white">Ringkasan Kunjungan</h2>
        <div className="flex items-center space-x-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {Array.from({ length: 12 }).map((_, i) => {
                        const date = new Date();
                        date.setMonth(date.getMonth() - i);
                        const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        const label = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
                        return (
                            <SelectItem key={value} value={value}>
                                {label}
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        </div>
      </div>
      
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pengajuan</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                  Pengajuan bulan ini
              </p>
            </CardContent>
          </Card>
          <Card className="border-warning/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Hourglass className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">
                  Pengajuan menunggu
              </p>
            </CardContent>
          </Card>
          <Card className="border-success/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif di Lokasi</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.active}</div>
              <p className="text-xs text-muted-foreground mt-1">
                  Tamu sedang berkunjung
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selesai</CardTitle>
              <BadgeCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.completed}</div>
              <p className="text-xs text-muted-foreground mt-1">
                  Kunjungan selesai
              </p>
            </CardContent>
          </Card>
          <Card className="border-info/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pertumbuhan</CardTitle>
              {getGrowthIcon(analyticsData.growth)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.growth}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                  Dibanding bulan lalu
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="surface-1">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <CardTitle>Daftar Pengajuan Kunjungan</CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
              <div className="relative w-full sm:w-auto">
                <Input
                  type="text"
                  placeholder="Cari..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList className="grid w-full grid-cols-4 md:w-auto">
                  <TabsTrigger value="all">Semua</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="completed">Selesai</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          <CardDescription>
            Daftar pengajuan yang memerlukan persetujuan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center text-muted-foreground">Tidak ada pengajuan yang sesuai.</div>
          ) : (
            <div className="space-y-6">
              {filteredRequests.map((request) => (
                <div key={request.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold text-lg">{request.visitor_name}</h4>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{request.visitor_company}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{request.visit_date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                    <div>
                      <span className="font-medium">Tujuan:</span>
                      <p className="text-muted-foreground mt-1">{request.host.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                    <div>
                      <span className="font-medium">Keperluan:</span>
                      <p className="text-muted-foreground mt-1">{request.purpose}</p>
                    </div>
                  </div>

                  {/* Action Buttons based on status */}
                  <div className="flex space-x-3 pt-2">
                    {/* CS/Host can approve/reject pending requests */}
                    {request.status === 'pending' && isCSOrAdmin && (
                      <>
                        <Button
                          size="sm"
                          className="bg-success hover:bg-success/90"
                          onClick={() => handleApproval(request.id, 'approve')}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleApproval(request.id, 'reject')}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Tolak
                        </Button>
                      </>
                    )}

                    {/* Admin/Receptionist can complete approved requests */}
                    {request.status === 'approved' && isAdmin && (
                       <Button
                         size="sm"
                         variant="secondary"
                         onClick={() => handleApproval(request.id, 'complete')}
                       >
                         <CheckSquare className="mr-2 h-4 w-4" />
                         Selesaikan Kunjungan
                       </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
