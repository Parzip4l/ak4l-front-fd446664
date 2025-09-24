import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

/**
 * Login page with Material Design styling and JWT authentication
 * Includes demo credentials display and proper form validation
 */
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: "Login berhasil",
          description: "Selamat datang di AK4L Dashboard",
        });
        navigate("/dashboard");
      } else {
        setError("Email atau password salah. Silakan coba lagi.");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat login. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      setEmail('admin@ak4l.com');
      setPassword('admin123');
    } else {
      setEmail('user@ak4l.com');
      setPassword('user123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-card rounded-2xl shadow-lg mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AK4L</h1>
          <p className="text-white/80">Angkasa Kelautan For Life</p>
        </div>

        <Card className="surface-3 border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Masuk ke Sistem</CardTitle>
            <CardDescription className="text-center">
              Masukkan email dan password untuk mengakses dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Demo credentials info */}
            <Alert className="border-primary/20 bg-primary/5">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Demo Credentials:</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center">
                      <span>Admin:</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDemoLogin('admin')}
                        className="h-6 text-xs"
                      >
                        admin@ak4l.com / admin123
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>User:</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDemoLogin('user')}
                        className="h-6 text-xs"
                      >
                        user@ak4l.com / user123
                      </Button>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@ak4l.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-material focus:ring-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="transition-material focus:ring-primary"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 transition-material"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Masuk...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground pt-4">
              <p>Sistem QSHE & Security Management</p>
              <p className="mt-1">© 2024 Angkasa Kelautan For Life</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}