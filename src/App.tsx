import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TopNavigation } from "@/components/Layout/TopNavigation";
import { ProtectedRoute } from "@/components/Layout/ProtectedRoute";


// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// QSHE Module Pages
import SafetyMetrics from "./pages/QSHE/SafetyMetrics";
import SafetyAdmin from "./pages/QSHE/SafetyAdmin";
import RikesNapza from "./pages/QSHE/RikesNapza";
import MedicalOnsite from "./pages/QSHE/MedicalOnsite";

// Security Module Pages
import SecurityMetrics from "./pages/Security/SecurityMetrics";
import SecurityAdmin from "./pages/Security/SecurityAdmin";
import BUJPReports from "./pages/Security/BUJPReports";
import CompetencyMonitoring from "./pages/Security/CompetencyMonitoring";
import VisitorManagement from "./pages/Security/VisitorManagement";
import VMSAdmin from "./pages/Security/VMSAdmin";

// Reports
import Reports from "./pages/Reports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes with navigation */}
            <Route path="/" element={
              <ProtectedRoute>
                <TopNavigation />
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <TopNavigation />
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* QSHE Module Routes */}
            <Route path="/qshe/safety-metrics" element={
              <ProtectedRoute>
                <TopNavigation />
                <SafetyMetrics />
              </ProtectedRoute>
            } />
            
            <Route path="/qshe/safety-admin" element={
              <ProtectedRoute adminOnly>
                <TopNavigation />
                <SafetyAdmin />
              </ProtectedRoute>
            } />
            
            <Route path="/qshe/rikes-napza" element={
              <ProtectedRoute>
                <TopNavigation />
                <RikesNapza />
              </ProtectedRoute>
            } />
            
            <Route path="/qshe/medical-onsite" element={
              <ProtectedRoute>
                <TopNavigation />
                <MedicalOnsite />
              </ProtectedRoute>
            } />

            {/* Security Module Routes */}
            <Route path="/security/security-metrics" element={
              <ProtectedRoute>
                <TopNavigation />
                <SecurityMetrics />
              </ProtectedRoute>
            } />
            
            <Route path="/security/security-admin" element={
              <ProtectedRoute adminOnly>
                <TopNavigation />
                <SecurityAdmin />
              </ProtectedRoute>
            } />
            
            <Route path="/security/bujp-reports" element={
              <ProtectedRoute>
                <TopNavigation />
                <BUJPReports />
              </ProtectedRoute>
            } />
            
            <Route path="/security/competency" element={
              <ProtectedRoute>
                <TopNavigation />
                <CompetencyMonitoring />
              </ProtectedRoute>
            } />
            
            <Route path="/security/vms" element={
              <ProtectedRoute>
                <TopNavigation />
                <VisitorManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/security/vms-admin" element={
              <ProtectedRoute adminOnly>
                <TopNavigation />
                <VMSAdmin />
              </ProtectedRoute>
            } />

            {/* Reports */}
            <Route path="/reports" element={
              <ProtectedRoute>
                <TopNavigation />
                <Reports />
              </ProtectedRoute>
            } />

            {/* 404 catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
