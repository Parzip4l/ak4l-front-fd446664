
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Shield,
  Activity,
  FileText,
  LogOut,
  Home,
  Bell,
  User,
  ChevronDown,
  FireExtinguisher,
} from "lucide-react";
import PropTypes from "prop-types";

// 💡 PENTING: GANTI BARIS INI DENGAN IMPORT YANG BENAR KE FILE useAuth Anda
import { useAuth } from "@/contexts/AuthContext"; // Contoh import yang benar

export function TopNavigation({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  // 🚫 TIDAK ADA MOCK LAGI. useAuth ASLI DIPAKAI.
  const { user, logout, isAdmin } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    // 1. Panggil logout dari AuthContext (menghapus token dan user)
    logout();
    // 2. Redirect ke halaman login. 
    // ProtectedRoute seharusnya sudah menangani ini, tapi ini adalah safety net.
    navigate("/login"); 
  };

  // scroll listener
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close profile menu if user clicks outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileMenuOpen && !event.target.closest('.profile-dropdown-container')) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [profileMenuOpen]);


  const navigationItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      description: "Overview dan ringkasan data",
    },
    {
      title: "QSHE",
      icon: Activity,
      description: "Quality, Safety, Health & Environment",
      submenu: [
        { title: "Safety Key Metric", href: "/qshe/safety-metrics", admin: false },
        // Hanya tampilkan jika isAdmin
        ...(isAdmin ? [{ title: "Safety Admin", href: "/qshe/safety-admin", admin: true }] : []), 
        { title: "Laporan Rikes & NAPZA", href: "/qshe/rikes-napza", admin: false },
        { title: "Laporan Medical Onsite", href: "/qshe/medical-onsite", admin: false },
      ],
    },
    {
      title: "Security",
      icon: Shield,
      description: "Sistem keamanan dan monitoring",
      submenu: [
        { title: "Security Key Metric", href: "/security/security-metrics", admin: false },
        // Hanya tampilkan jika isAdmin
        ...(isAdmin ? [{ title: "Security Admin", href: "/security/security-admin", admin: true }] : []), 
        { title: "Laporan BUJP", href: "/security/bujp-reports", admin: false },
        { title: "Kompetensi Personil", href: "/security/competency", admin: false },
        { title: "Visitor Management", href: "/security/vms", admin: false },
        // Hanya tampilkan jika isAdmin
        ...(isAdmin ? [{ title: "VMS Admin", href: "/security/vms-admin", admin: true }] : []), 
      ],
    },
    {
      title: "APAR & Hydrant",
      icon: FireExtinguisher,
      description: "Manajemen APAR dan sistem hydrant",
      submenu: [
        { title: "Dashboard APAR & Hydrant", href: "/apar-hydrant/dashboard", admin: false },
        { title: "Daftar Alat", href: "/apar-hydrant/list", admin: false },
        { title: "Jadwal & Kedaluwarsa", href: "/apar-hydrant/schedule", admin: false },
        // Hanya tampilkan jika isAdmin
        ...(isAdmin ? [{ title: "Admin Alat", href: "/apar-hydrant/admin", admin: true }] : []),
      ],
    },
    {
      title: "Laporan",
      href: "/reports",
      icon: FileText,
      description: "Semua laporan dan dokumentasi",
      admin: true
    },
    {
      title: "User Management",
      href: "/user-management",
      icon: User,
      description: "User Management System",
    },
  ];
  
  // Filtering navigasi utama jika tidak ada submenu (Dashboard, Laporan)
  const filteredNavigationItems = navigationItems.map(item => {
    if (item.submenu) {
      return {
        ...item,
        submenu: item.submenu.filter(subItem => !subItem.admin || isAdmin)
      };
    }
    return item;
  });


  const NavigationContent = ({ items, onLinkClick }) => (
    <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-2 space-y-2 lg:space-y-0">
      {items.map((item) => {
        // Cek apakah item harus ditampilkan
        const shouldShow = item.href || (item.submenu && item.submenu.length > 0);
        if (!shouldShow) return null;

        const isParentActive =
          item.submenu?.some((subItem) => location.pathname.startsWith(subItem.href)) ||
          location.pathname === item.href;

        return (
          <div key={item.title} className="relative group">
            {item.submenu ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  className={`flex items-center space-x-2 ${
                    scrolled 
                      ? "text-gray-800 hover:bg-orange-500 hover:text-white" 
                      : "text-white hover:bg-white/10"
                  } ${
                    isParentActive
                      ? scrolled
                        ? "bg-orange-500 text-white hover:bg-orange-600" 
                        : "bg-white/20"
                      : ""
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Button>

                {/* Dropdown submenu */}
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg">
                  <div className="p-2">
                    <div className="text-sm font-medium text-gray-500 px-3 py-2">
                      {item.description}
                    </div>
                    {item.submenu
                      .map((subItem) => (
                        <Link
                          key={subItem.href}
                          to={subItem.href}
                          className={`block px-3 py-2 text-sm rounded-md transition
                            ${
                              location.pathname === subItem.href
                                ? "bg-orange-500 text-white font-medium hover:bg-orange-600"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          onClick={onLinkClick}
                        >
                          {subItem.title}
                          {subItem.admin && (
                            <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                              Admin
                            </span>
                          )}
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link to={item.href}>
                <Button
                  variant="ghost"
                  className={`flex items-center space-x-2 ${
                    scrolled 
                      ? "text-gray-800 hover:bg-orange-500 hover:text-white" 
                      : "text-white hover:bg-white/10"
                  } ${
                    isParentActive
                      ? scrolled
                        ? "bg-orange-500 text-white hover:bg-orange-600" 
                        : "bg-white/20"
                      : ""
                  }`}
                  onClick={onLinkClick}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Button>
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );

  NavigationContent.propTypes = {
    items: PropTypes.array.isRequired,
    onLinkClick: PropTypes.func.isRequired,
  };

  // Jika user belum dimuat (misalnya saat loading awal), jangan tampilkan navigasi
  if (!user && location.pathname !== '/login') {
    return (
        <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-r from-orange-500 via-red-500 to-red-600 z-0">
            <div style={{ paddingTop: '100px', textAlign: 'center', color: 'white' }}>Memuat data...</div>
            <main>{children}</main>
        </div>
    );
  }


  return (
    <>
      {/* BACKGROUND GRADIENT */}
      <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-r from-orange-500 via-red-500 to-red-600 z-0" />

      {/* NAVBAR */}
      <nav
        className={`sticky top-0 z-20 transition-colors duration-300 ${
          scrolled ? "bg-white shadow-md" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 border-b border-white/20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center">
                <img
                  src={scrolled ? "/logo-lrtj.png" : "/logo-lrtj-putih.png"}
                  alt="LRTJ Logo"
                  className="h-10 object-contain"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex">
              <NavigationContent
                items={filteredNavigationItems} // Menggunakan item yang sudah difilter
                onLinkClick={() => setMobileMenuOpen(false)}
              />
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              <button
                className={`${
                  scrolled ? "text-gray-700 hover:text-gray-900" : "text-white hover:text-gray-200"
                }`}
              >
                <Bell className="h-5 w-5" />
              </button>
              
              {/* Profile Dropdown Implementation */}
              <div className="relative profile-dropdown-container">
                <Button
                  variant="ghost"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className={`flex items-center space-x-1 ${
                    scrolled 
                        ? "text-gray-700 hover:bg-gray-100" 
                        : "text-white hover:bg-white/10"
                  } ${profileMenuOpen ? (scrolled ? "bg-gray-100" : "bg-white/10") : ""}`}
                >
                    {/* User Icon */}
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-700" />
                    </div>
                    {/* User Name */}
                    <span className="hidden md:inline">{user?.name}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${profileMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
                </Button>

                {/* Dropdown Content */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg transition-all duration-200 z-50 shadow-lg">
                    <div className="p-2">
                      <div className="px-3 py-2 border-b">
                        <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                        <p className="text-xs text-gray-500">
                          {isAdmin ? "Administrator" : "User"}
                        </p>
                      </div>
                      
                      {/* Logout Button in Dropdown */}
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start space-x-2 mt-2 hover:bg-red-50 text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${scrolled ? "text-gray-700" : "text-white"} lg:hidden`}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="pb-4 border-b">
                    <p className="text-sm text-gray-500">
                      {isAdmin ? "Administrator" : "User"}: {user?.name}
                    </p>
                  </div>

                  <NavigationContent
                    items={filteredNavigationItems} // Menggunakan item yang sudah difilter
                    onLinkClick={() => setMobileMenuOpen(false)}
                  />

                  <div className="pt-4 border-t">
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start space-x-2 hover:bg-red-50 text-red-600"
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
      </nav>

      {/* MAIN CONTENT */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          marginTop: "6rem",
          maxWidth: "1280px",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "1rem",
          paddingRight: "1rem",
        }}
      >
        {children}
      </main>
    </>
  );
}

TopNavigation.propTypes = {
    children: PropTypes.node.isRequired,
};