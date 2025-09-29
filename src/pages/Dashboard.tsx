import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Shield,
  FileText,
  Users,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Calendar,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user, isAdmin, token, logout } = useAuth();

  const [safetyMetrics, setSafetyMetrics] = useState<any>({
    fatalities: 0,
    lostTime: 0,
    frequency: 0,
    severity: 0,
    lastUpdate: "-",
  });

  // Security & pending reports masih mock
  const securityMetrics = {
    criminalCases: 1,
    bombThreats: 0,
    visits: 45,
    lastUpdate: "2024-01-15",
  };

  const pendingReports = [
    { type: "Medical Onsite", count: 3, urgent: 1 },
    { type: "BUJP", count: 2, urgent: 0 },
    { type: "Rikes & NAPZA", count: 1, urgent: 0 },
  ];

  const quickActions = [
    {
      title: "Safety Metrics",
      description: "Lihat dan kelola data keselamatan",
      href: isAdmin ? "/qshe/safety-admin" : "/qshe/safety-metrics",
      icon: Activity,
      color: "bg-success/10 text-success",
    },
    {
      title: "Security Metrics",
      description: "Monitor data keamanan",
      href: isAdmin ? "/security/security-admin" : "/security/security-metrics",
      icon: Shield,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Visitor Management",
      description: "Kelola kunjungan tamu",
      href: isAdmin ? "/security/vms-admin" : "/security/vms",
      icon: Users,
      color: "bg-accent/10 text-accent",
    },
    {
      title: "Laporan",
      description: "Akses semua laporan",
      href: "/reports",
      icon: FileText,
      color: "bg-warning/10 text-warning",
    },
  ];

  // Fetch data safety metrics dari API
  useEffect(() => {
    const fetchSafetyData = async () => {
      if (!token) return;

      try {
        const baseUrl =
          import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0"); // 01 - 12

        const res = await fetch(
          `${baseUrl}/api/v1/latest-by-month?year=${year}&month=${month}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Fetch safety metrics failed:", errorText);
          throw new Error("Failed to fetch safety metrics");
        }

        const data = await res.json();

        setSafetyMetrics({
          fatalities: data.fatality,
          lostTime: data.lost_time_injuries,
          frequency: parseFloat(data.fr),
          severity: parseFloat(data.sr),
          lastUpdate: data.updated_at
            ? new Date(data.updated_at).toLocaleDateString("id-ID")
            : "-",
        });
      } catch (err) {
        console.error("Error fetching safety metrics:", err);
        logout(); // kalau token invalid, logout user
      }
    };

    fetchSafetyData();
  }, [token, logout]);

  return (
    <div className="container mx-auto p-6 space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-white mt-1">
            Selamat datang, {user?.name}
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0 text-white">
          <Clock className="h-4 w-4 text-mutwhiteed-foreground" />
          <span className="text-sm text-white-foreground">
            Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}
          </span>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="surface-1 border-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Safety Status</CardTitle>
            <Activity className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">Good</div>
            <p className="text-xs text-muted-foreground">
              {safetyMetrics.fatalities} fatalities, {safetyMetrics.lostTime} LTI bulan ini
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-success mr-1" />
              <span className="text-xs text-success">FR: {safetyMetrics.frequency}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-1 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">Secure</div>
            <p className="text-xs text-muted-foreground">
              {securityMetrics.criminalCases} incident bulan ini
            </p>
            <div className="flex items-center mt-2">
              <CheckCircle className="h-3 w-3 text-success mr-1" />
              <span className="text-xs text-success">{securityMetrics.visits} kunjungan</span>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-1 border-warning/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <FileText className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {pendingReports.reduce((acc, item) => acc + item.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingReports.reduce((acc, item) => acc + item.urgent, 0)} butuh perhatian
            </p>
            <div className="flex items-center mt-2">
              <AlertTriangle className="h-3 w-3 text-warning mr-1" />
              <span className="text-xs text-warning">Segera tindak lanjut</span>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-1 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">Optimal</div>
            <p className="text-xs text-muted-foreground">Semua sistem berjalan normal</p>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
              <span className="text-xs text-success">Online</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Akses Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.href}>
              <Card className="surface-1 hover:surface-2 transition-all duration-200 hover:scale-105 cursor-pointer group">
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <action.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity & Pending Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Reports Detail */}
        <Card className="surface-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Laporan Tertunda</span>
            </CardTitle>
            <CardDescription>Laporan yang memerlukan tindak lanjut</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingReports.map((report) => (
              <div
                key={report.type}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{report.type}</p>
                  <p className="text-sm text-muted-foreground">{report.count} laporan pending</p>
                </div>
                <div className="flex items-center space-x-2">
                  {report.urgent > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {report.urgent} urgent
                    </Badge>
                  )}
                  <Badge variant="secondary">{report.count}</Badge>
                </div>
              </div>
            ))}
            <Button className="w-full mt-4" variant="outline" asChild>
              <Link to="/reports">Lihat Semua Laporan</Link>
            </Button>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="surface-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Informasi Sistem</span>
            </CardTitle>
            <CardDescription>Status dan informasi penting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                <span className="text-sm font-medium">Last Safety Update</span>
                <span className="text-sm text-muted-foreground">{safetyMetrics.lastUpdate}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                <span className="text-sm font-medium">Last Security Update</span>
                <span className="text-sm text-muted-foreground">{securityMetrics.lastUpdate}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-accent/10 rounded-lg">
                <span className="text-sm font-medium">User Role</span>
                <Badge variant={isAdmin ? "default" : "secondary"}>
                  {isAdmin ? "Administrator" : "Standard User"}
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                AK4L Dashboard v1.0 • Developed with ❤️
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
