import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  Shield, 
  Activity, 
  FileText, 
  Users, 
  Settings,
  LogOut,
  Home
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Top horizontal navigation component following Material Design principles
 * Responsive navigation with mobile menu support
 */
export function TopNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Navigation items with proper routing structure
  const navigationItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      description: "Overview dan ringkasan data"
    },
    {
      title: "QSHE",
      icon: Activity,
      description: "Quality, Safety, Health & Environment",
      submenu: [
        { title: "Safety Key Metric", href: "/qshe/safety-metrics", admin: false },
        { title: "Safety Admin", href: "/qshe/safety-admin", admin: true },
        { title: "Laporan Rikes & NAPZA", href: "/qshe/rikes-napza", admin: false },
        { title: "Laporan Medical Onsite", href: "/qshe/medical-onsite", admin: false },
      ]
    },
    {
      title: "Security",
      icon: Shield,
      description: "Sistem keamanan dan monitoring",
      submenu: [
        { title: "Security Key Metric", href: "/security/security-metrics", admin: false },
        { title: "Security Admin", href: "/security/security-admin", admin: true },
        { title: "Laporan BUJP", href: "/security/bujp-reports", admin: false },
        { title: "Kompetensi Personil", href: "/security/competency", admin: false },
        { title: "Visitor Management", href: "/security/vms", admin: false },
        { title: "VMS Admin", href: "/security/vms-admin", admin: true },
      ]
    },
    {
      title: "Laporan",
      href: "/reports",
      icon: FileText,
      description: "Semua laporan dan dokumentasi"
    }
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const NavigationContent = () => (
    <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8 space-y-4 lg:space-y-0">
      {navigationItems.map((item) => (
        <div key={item.title} className="relative group">
          {item.submenu ? (
            <div className="relative">
              <Button
                variant="ghost"
                className={`
                  flex items-center space-x-2 transition-material hover:bg-primary/10
                  ${isActivePath('/qshe') || isActivePath('/security') ? 'text-primary bg-primary/5' : ''}
                `}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Button>
              
              {/* Dropdown submenu */}
              <div className="absolute top-full left-0 mt-2 w-64 surface-2 border rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  <div className="text-sm font-medium text-muted-foreground px-3 py-2">
                    {item.description}
                  </div>
                  {item.submenu
                    .filter(subItem => !subItem.admin || isAdmin)
                    .map((subItem) => (
                    <Link
                      key={subItem.href}
                      to={subItem.href}
                      className={`
                        block px-3 py-2 text-sm rounded-md transition-material hover:bg-primary/10
                        ${isActivePath(subItem.href) ? 'text-primary bg-primary/5' : 'text-foreground'}
                      `}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {subItem.title}
                      {subItem.admin && (
                        <span className="ml-2 text-xs bg-accent text-accent-foreground px-1.5 py-0.5 rounded">
                          Admin
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Link to={item.href!}>
              <Button
                variant="ghost"
                className={`
                  flex items-center space-x-2 transition-material hover:bg-primary/10
                  ${isActivePath(item.href!) ? 'text-primary bg-primary/5' : ''}
                `}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Button>
            </Link>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <nav className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                AK4L
              </h1>
              <p className="text-xs text-muted-foreground leading-none">
                Angkasa Kelautan For Life
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex">
            <NavigationContent />
          </div>

          {/* User menu and mobile trigger */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">
                  {isAdmin ? "Admin" : "User"}:
                </span>
                <span className="font-medium">{user.name}</span>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:flex items-center space-x-2 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>

            {/* Mobile menu trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="pb-4 border-b">
                    <p className="text-sm text-muted-foreground">
                      {isAdmin ? "Administrator" : "User"}: {user?.name}
                    </p>
                  </div>
                  
                  <NavigationContent />
                  
                  <div className="pt-4 border-t">
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start space-x-2 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}