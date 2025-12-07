/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

// 1. Definisikan Interface agar TypeScript mengenali prop 'permission'
interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string; // Tanda tanya (?) berarti opsional
}

export const ProtectedRoute = ({ children, permission }: ProtectedRouteProps) => {
  // Casting user ke any untuk menghindari error tipe data yang kompleks
  const { user, loading } = useAuth() as any; 
  const location = useLocation();

  if (loading) {
    // Tampilan loading sederhana saat cek auth
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  // 1. Cek Authentication (Wajib Login)
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Cek Permission (Jika route butuh permission khusus)
  if (permission) {
    const userRoles = (user.roles || []) as any[];

    // A. CEK SUPER ADMIN (Bypass Total)
    // Logic yang sama persis dengan TopNavigation untuk konsistensi
    const isSuperAdmin = userRoles.some((r: any) => {
        const roleName = (typeof r === 'string' ? r : r.name) || '';
        // Normalisasi string: hapus spasi, ganti _ dengan -, lowercase
        const normalizedRole = roleName.toLowerCase().replace(/_/g, '-').replace(/\s+/g, '-');
        // Izinkan 'super-admin' atau 'admin' mengakses semuanya
        return normalizedRole === 'super-admin' || normalizedRole === 'admin';
    });

    // Jika bukan Super Admin, kita cek permission spesifiknya
    if (!isSuperAdmin) {
        let activePermissions: string[] = [];

        // Ambil direct permissions
        if (user.permissions && user.permissions.length > 0) {
            activePermissions = user.permissions.map((p: any) => typeof p === 'string' ? p : p.name);
        }

        // Ambil permissions dari dalam Roles (Deep Merge)
        userRoles.forEach((role: any) => {
            if (role.permissions && Array.isArray(role.permissions)) {
                const rolePerms = role.permissions.map((p: any) => typeof p === 'string' ? p : p.name);
                activePermissions = [...activePermissions, ...rolePerms];
            }
        });

        // Cek apakah permission yang diminta ada di daftar permission user
        if (!activePermissions.includes(permission)) {
            // User login TAPI tidak punya akses -> Lempar ke halaman Unauthorized
            return <Navigate to="/unauthorized" replace />;
        }
    }
  }

  // Jika lolos semua pengecekan, render halaman
  return <>{children}</>;
};