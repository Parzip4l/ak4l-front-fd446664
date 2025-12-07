/* eslint-disable */
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Users, Shield, Key, Plus, Loader2, Edit, RefreshCw, Lock, Search, Filter, X, Trash2, MoreHorizontal
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

// --- Interfaces ---
interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  roles?: { id: number; name: string }[] | string[]; 
}

interface Role {
  id: number;
  name: string;
  permissions: { id: number; name: string }[];
}

interface Permission {
  id: number;
  name: string;
}

export default function UserRoleManagement() {
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("users");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Data
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  // State Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // State Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // State Forms
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", password_confirmation: "" });
  
  const [roleForm, setRoleForm] = useState<{ id: number | null, name: string, permissions: string[] }>({ 
    id: null, 
    name: "", 
    permissions: [] 
  });

  const [originalPermissions, setOriginalPermissions] = useState<string[]>([]);
  const [permForm, setPermForm] = useState({ name: "" });
  const [assignForm, setAssignForm] = useState({ user_id: null, role_name: "" });
  const [passwordForm, setPasswordForm] = useState({ user_id: null, password: "", password_confirmation: "" });

  // --- VALIDASI PASSWORD ---
  const validatePassword = (password: string) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  };

  const passwordRequirementsText = "Password harus memiliki minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan karakter khusus (@$!%*?&).";

  // --- 1. DATA FETCHING ---
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token"); 
    if (!token) return;

    setIsLoading(true);
    
    const fetchWithToken = async (endpoint: string) => {
      try {
        const response = await fetch(`${API_URL}${endpoint}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
        const json = await response.json();
        
        if (json.data && json.data.data && Array.isArray(json.data.data)) return json.data.data;
        if (json.data && Array.isArray(json.data)) return json.data;
        if (Array.isArray(json)) return json;
        return []; 
      } catch (e) {
        console.error(`Fetch Error on ${endpoint}:`, e);
        return [];
      }
    };

    try {
      const [rolesData, permData, usersData] = await Promise.all([
        fetchWithToken('/roles'),
        fetchWithToken('/permissions'), 
        fetchWithToken('/users'),
      ]);
      
      setRoles(rolesData as Role[]);
      setPermissions(permData as Permission[]);
      setUsers(usersData as User[]);

    } catch (error) {
      toast({ title: "Gagal Memuat Data", description: "Kesalahan koneksi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- FILTERING LOGIC ---
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const userRoles = user.roles || [];
      const matchesRole = filterRole === "all" || userRoles.some(r => {
        const rName = typeof r === 'string' ? r : r.name;
        return rName === filterRole;
      });

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  // --- 2. ACTION HANDLERS ---

  const apiCall = async (endpoint: string, method: string, body: any) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(body),
    });
    const json = await response.json();
    if (!response.ok) throw new Error(json.message || "Request failed");
    return json;
  };

  const handleSubmit = async (endpoint: string, method: string, body: any, onSuccess: () => void) => {
    setIsSubmitting(true);
    try {
      await apiCall(endpoint, method, body);
      onSuccess();
      fetchData(); 
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Gagal.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- DELETE HANDLERS ---
  const handleDeleteRole = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus Role ini?")) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setIsSubmitting(true);
    try {
        await fetch(`${API_URL}/roles/${id}`, {
            method: 'DELETE',
            headers: { "Authorization": `Bearer ${token}` },
        });
        toast({ title: "Berhasil", description: "Role berhasil dihapus." });
        fetchData();
    } catch (error) {
        toast({ title: "Error", description: "Gagal menghapus role.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeletePermission = async (id: number) => {
    if (!window.confirm("Hapus permission ini?")) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
        await fetch(`${API_URL}/permissions/${id}`, {
            method: 'DELETE',
            headers: { "Authorization": `Bearer ${token}` },
        });
        toast({ title: "Berhasil", description: "Permission dihapus." });
        fetchData();
    } catch (error) {
        toast({ title: "Error", description: "Gagal menghapus permission.", variant: "destructive" });
    }
  };

  // --- [BARU] HAPUS ROLE DARI USER ---
  const handleRemoveRoleFromUser = async (userId: number, roleName: string) => {
    if(!window.confirm(`Hapus role ${roleName} dari user ini?`)) return;
    setIsSubmitting(true);
    try {
        // Menggunakan endpoint revoke
        await apiCall(`/users/${userId}/roles/revoke`, "POST", { role: roleName });
        toast({ title: "Berhasil", description: `Role ${roleName} dicabut.` });
        fetchData();
    } catch (error) {
        toast({ title: "Gagal", description: "Gagal mencabut role.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- REGISTRATION & ASSIGN ---
  const handleRegisterUser = async () => {
    if (!validatePassword(userForm.password)) {
      toast({ title: "Password Lemah", description: passwordRequirementsText, variant: "destructive" });
      return;
    }
    if (userForm.password !== userForm.password_confirmation) {
      toast({ title: "Error", description: "Konfirmasi password tidak cocok.", variant: "destructive" });
      return;
    }
    await handleSubmit('/register', 'POST', userForm, () => {
      setShowUserModal(false);
      setUserForm({ name: "", email: "", password: "", password_confirmation: "" });
      toast({ title: "Berhasil", description: "User berhasil dibuat." });
    });
  };

  const handleAssignRole = async () => {
    if(!assignForm.user_id || !assignForm.role_name) {
      toast({ title: "Error", description: "Pilih user dan role.", variant: "destructive" });
      return;
    }
    const endpoint = `/users/${assignForm.user_id}/roles/assign`;
    await handleSubmit(endpoint, 'POST', { role: assignForm.role_name }, () => {
      setShowAssignModal(false);
      toast({ title: "Berhasil", description: "Role berhasil diupdate." });
    });
  };

  const handleChangePassword = async () => {
    if (!validatePassword(passwordForm.password)) {
      toast({ title: "Password Lemah", description: passwordRequirementsText, variant: "destructive" });
      return;
    }
    if (passwordForm.password !== passwordForm.password_confirmation) {
      toast({ title: "Error", description: "Konfirmasi password tidak cocok.", variant: "destructive" });
      return;
    }
    const url = `/users/${passwordForm.user_id}/change-password`; 
    await handleSubmit(url, 'POST', {
        password: passwordForm.password,
        password_confirmation: passwordForm.password_confirmation
    }, () => {
        setShowPasswordModal(false);
        setPasswordForm({ user_id: null, password: "", password_confirmation: "" });
        toast({ title: "Berhasil", description: "Password berhasil diubah." });
    });
  };

  // --- ROLE SAVING ---
  const handleSaveRole = async () => {
    const isEdit = !!roleForm.id;
    setIsSubmitting(true);

    try {
        let roleId = roleForm.id;
        if (isEdit) {
            await apiCall(`/roles/${roleId}`, "PUT", { name: roleForm.name });
        } else {
            const res = await apiCall('/roles', "POST", { name: roleForm.name });
            roleId = res.data?.id || res.id;
        }

        if (!roleId) throw new Error("Gagal mendapatkan ID Role.");

        const selectedPermissions = roleForm.permissions;
        const permissionsToAdd = selectedPermissions.filter(p => !originalPermissions.includes(p));
        const permissionsToRemove = originalPermissions.filter(p => !selectedPermissions.includes(p));

        if (permissionsToAdd.length > 0) {
            await apiCall(`/roles/${roleId}/assign-permissions`, "POST", { permissions: permissionsToAdd });
        }
        if (permissionsToRemove.length > 0) {
             await apiCall(`/roles/${roleId}/revoke-permissions`, "POST", { permissions: permissionsToRemove });
        }

        setShowRoleModal(false);
        setRoleForm({ id: null, name: "", permissions: [] });
        setOriginalPermissions([]);
        toast({ title: "Berhasil", description: "Role & Permission berhasil disimpan." });
        fetchData();

    } catch (error) {
        toast({ 
            title: "Error", 
            description: error instanceof Error ? error.message : "Gagal menyimpan role.", 
            variant: "destructive" 
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleCreatePermission = async () => {
    if(!permForm.name) return;
    await handleSubmit('/permissions', 'POST', { name: permForm.name }, () => {
      setPermForm({ name: "" });
      toast({ title: "Berhasil", description: "Permission dibuat." });
    });
  };

  const openEditRole = (role: Role) => {
    const currentPermissionNames = role.permissions ? role.permissions.map(p => p.name) : [];
    setOriginalPermissions(currentPermissionNames);
    setRoleForm({ id: role.id, name: role.name, permissions: currentPermissionNames });
    setShowRoleModal(true);
  };

  const togglePermission = (permName: string) => {
    setRoleForm(prev => {
      const isSelected = prev.permissions.includes(permName);
      let newPerms;
      if (isSelected) {
        newPerms = prev.permissions.filter(p => p !== permName);
      } else {
        newPerms = [...prev.permissions, permName];
      }
      return { ...prev, permissions: newPerms };
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-[Inter] p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-7xl space-y-8 relative">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">User & Role Management</h1>
            <p className="text-white mt-2 text-lg">Kelola akses, keamanan, dan struktur organisasi.</p>
          </div>
          <Button variant="outline" onClick={fetchData} disabled={isLoading} className="rounded-xl shadow-sm self-start sm:self-auto">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <RefreshCw className="h-4 w-4 mr-2"/>} Refresh
          </Button>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-full border shadow-sm w-full sm:w-auto flex">
            <TabsTrigger value="users" className="flex-1 sm:flex-none rounded-full px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" /> Users
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex-1 sm:flex-none rounded-full px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" /> Roles
            </TabsTrigger>
          </TabsList>

          {/* === USERS TAB === */}
          <TabsContent value="users" className="space-y-6">
            <Card className="rounded-3xl shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardHeader className="p-6 md:p-8 pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold">Daftar Pengguna</CardTitle>
                    <CardDescription>Total {users.length} pengguna terdaftar</CardDescription>
                  </div>
                  <Button onClick={() => setShowUserModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md w-full md:w-auto">
                    <Plus className="h-4 w-4 mr-2" /> User Baru
                  </Button>
                </div>
                
                {/* Filters Mobile Friendly */}
                <div className="flex flex-col md:flex-row gap-3 mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Cari nama atau email..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 rounded-xl border-gray-200 bg-white w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-[150px] md:w-[200px]">
                        <Select value={filterRole} onValueChange={setFilterRole}>
                        <SelectTrigger className="rounded-xl bg-white border-gray-200 w-full">
                            <Filter className="h-4 w-4 mr-2 text-gray-400" />
                            <SelectValue placeholder="Filter Role" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">Semua Role</SelectItem>
                            {roles.map(r => (
                            <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>
                    {(searchTerm || filterRole !== 'all') && (
                        <Button variant="ghost" onClick={() => { setSearchTerm(""); setFilterRole("all"); }} className="text-red-500 hover:bg-red-50 rounded-xl px-3">
                        <X className="h-4 w-4" />
                        </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block">
                <CardContent className="p-0">
                    <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                        <TableHead className="pl-8">User Profile</TableHead>
                        <TableHead>Role Access</TableHead>
                        <TableHead className="text-right pr-8">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                        <TableRow><TableCell colSpan={3} className="h-32 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" /> Memuat...</TableCell></TableRow>
                        ) : filteredUsers.length > 0 ? filteredUsers.map((u) => (
                        <TableRow key={u.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="pl-8">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                <div className="font-semibold text-gray-900">{u.name}</div>
                                <div className="text-sm text-gray-500">{u.email}</div>
                                </div>
                            </div>
                            </TableCell>
                            <TableCell>
                            {u.roles && u.roles.length > 0 ? u.roles.map((r, i) => {
                                const roleName = typeof r === 'string' ? r : r.name;
                                return (
                                    <Badge key={i} className="mr-1 mb-1 pr-1 bg-green-100 text-green-700 hover:bg-green-200 border-green-200 shadow-none">
                                        {roleName}
                                        <button 
                                            onClick={() => handleRemoveRoleFromUser(u.id, roleName)}
                                            className="ml-1 hover:bg-green-300 rounded-full p-0.5"
                                            title="Hapus role ini"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                );
                            }) : <Badge variant="outline" className="text-gray-400 border-gray-200">No Role</Badge>}
                            </TableCell>
                            <TableCell className="text-right pr-8">
                            <div className="flex justify-end gap-2">
                                <Button 
                                    variant="outline" size="sm" 
                                    className="h-8 rounded-lg border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-600"
                                    onClick={() => { setAssignForm({ user_id: u.id as any, role_name: "" }); setShowAssignModal(true); }}
                                >
                                    <Shield className="h-3.5 w-3.5 mr-1" /> Role
                                </Button>
                                <Button 
                                    variant="outline" size="sm"
                                    className="h-8 rounded-lg border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-600 hover:text-red-600"
                                    onClick={() => { setPasswordForm({ user_id: u.id as any, password: "", password_confirmation: "" }); setShowPasswordModal(true); }}
                                >
                                    <Lock className="h-3.5 w-3.5 mr-1" /> Pswd
                                </Button>
                            </div>
                            </TableCell>
                        </TableRow>
                        )) : (
                        <TableRow><TableCell colSpan={3} className="h-32 text-center text-gray-500">Tidak ada user ditemukan.</TableCell></TableRow>
                        )}
                    </TableBody>
                    </Table>
                </CardContent>
              </div>

              {/* MOBILE CARD VIEW (Responsive) */}
              <div className="md:hidden space-y-4 p-4 bg-gray-50/50">
                {isLoading ? (
                    <div className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>
                ) : filteredUsers.length > 0 ? filteredUsers.map((u) => (
                    <Card key={u.id} className="border border-gray-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                        {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{u.name}</CardTitle>
                                        <CardDescription className="text-xs">{u.email}</CardDescription>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4"/></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => { setAssignForm({ user_id: u.id as any, role_name: "" }); setShowAssignModal(true); }}>
                                            <Shield className="mr-2 h-4 w-4" /> Assign Role
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => { setPasswordForm({ user_id: u.id as any, password: "", password_confirmation: "" }); setShowPasswordModal(true); }}>
                                            <Lock className="mr-2 h-4 w-4" /> Change Password
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {u.roles && u.roles.length > 0 ? u.roles.map((r, i) => {
                                    const roleName = typeof r === 'string' ? r : r.name;
                                    return (
                                        <Badge key={i} className="pr-1 bg-green-100 text-green-700 border-green-200">
                                            {roleName}
                                            <button onClick={() => handleRemoveRoleFromUser(u.id, roleName)} className="ml-1 p-0.5 rounded-full hover:bg-green-200"><X className="h-3 w-3" /></button>
                                        </Badge>
                                    );
                                }) : <span className="text-xs text-gray-400 italic">No Roles Assigned</span>}
                            </div>
                        </CardContent>
                    </Card>
                )) : (
                    <div className="text-center py-10 text-gray-500">Tidak ada user ditemukan.</div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* === ROLES TAB === */}
          <TabsContent value="roles" className="space-y-6">
            <Card className="rounded-3xl shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardHeader className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold">Roles & Permissions</CardTitle>
                  <CardDescription>Manajemen hak akses level role.</CardDescription>
                </div>
                <div className="flex space-x-2 w-full md:w-auto">
                  <Button variant="outline" onClick={() => setShowPermissionModal(true)} className="rounded-xl flex-1 md:flex-none">
                    <Key className="h-4 w-4 mr-2" /> Permissions
                  </Button>
                  <Button onClick={() => { 
                      setRoleForm({ id: null, name: "", permissions: [] }); 
                      setOriginalPermissions([]); 
                      setShowRoleModal(true); 
                  }} className="bg-blue-600 hover:bg-blue-700 rounded-xl flex-1 md:flex-none">
                    <Plus className="h-4 w-4 mr-2" /> Role Baru
                  </Button>
                </div>
              </CardHeader>

              {/* DESKTOP TABLE */}
              <div className="hidden md:block">
                <CardContent className="p-0">
                    <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                        <TableHead className="pl-8">Role Name</TableHead>
                        <TableHead>Permissions Attached</TableHead>
                        <TableHead className="text-right pr-8">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.map((role) => (
                        <TableRow key={role.id} className="hover:bg-gray-50">
                            <TableCell className="pl-8 font-bold">{role.name}</TableCell>
                            <TableCell>
                            <div className="flex flex-wrap gap-1.5">
                                {role.permissions?.slice(0, 10).map((p, i) => (
                                <Badge key={i} variant="secondary" className="bg-gray-100 text-gray-600 text-xs border border-gray-200">{p.name}</Badge>
                                ))}
                                {role.permissions && role.permissions.length > 10 && (
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-500 text-xs">+{role.permissions.length - 10} more</Badge>
                                )}
                            </div>
                            </TableCell>
                            <TableCell className="text-right pr-8">
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={() => openEditRole(role)} className="rounded-full hover:bg-blue-50 text-blue-600">
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteRole(role.id)} className="rounded-full hover:bg-red-50 text-red-500">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </CardContent>
              </div>

              {/* MOBILE LIST */}
              <div className="md:hidden p-4 space-y-3">
                 {roles.map((role) => (
                    <Card key={role.id} className="border-gray-200">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">{role.name}</CardTitle>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => openEditRole(role)}><Edit className="h-4 w-4 text-blue-600"/></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteRole(role.id)}><Trash2 className="h-4 w-4 text-red-600"/></Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-1">
                                {role.permissions?.slice(0, 8).map((p, i) => (
                                <Badge key={i} variant="secondary" className="bg-gray-100 text-gray-600 text-[10px] border border-gray-200">{p.name}</Badge>
                                ))}
                                {role.permissions && role.permissions.length > 8 && (
                                    <Badge variant="secondary" className="bg-gray-50 text-gray-400 text-[10px]">+{role.permissions.length - 8} more</Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                 ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* --- MODALS (Tetap Sama) --- */}
        
        {/* Register User Modal */}
        <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
          <DialogContent className="sm:max-w-[500px] rounded-2xl p-6 w-[95vw]">
            <DialogHeader><DialogTitle>Tambah User</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2"><Label>Nama</Label><Input value={userForm.name} onChange={(e)=>setUserForm({...userForm, name: e.target.value})} className="rounded-xl"/></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={userForm.email} onChange={(e)=>setUserForm({...userForm, email: e.target.value})} className="rounded-xl"/></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Password</Label><Input type="password" value={userForm.password} onChange={(e)=>setUserForm({...userForm, password: e.target.value})} className="rounded-xl"/></div>
                <div className="space-y-2"><Label>Konfirmasi</Label><Input type="password" value={userForm.password_confirmation} onChange={(e)=>setUserForm({...userForm, password_confirmation: e.target.value})} className="rounded-xl"/></div>
              </div>
              <Alert className="bg-blue-50 border-blue-100 text-blue-800 rounded-xl">
                <AlertDescription className="text-xs">{passwordRequirementsText}</AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button onClick={handleRegisterUser} disabled={isSubmitting} className="bg-blue-600 rounded-xl w-full">{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Simpan User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Role Modal */}
        <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
          <DialogContent className="sm:max-w-[400px] rounded-2xl p-6 w-[95vw]">
            <DialogHeader><DialogTitle>Assign Role</DialogTitle><DialogDescription>Ubah hak akses pengguna ini.</DialogDescription></DialogHeader>
            <div className="py-4">
              <Label className="mb-2 block">Pilih Role</Label>
              <Select onValueChange={(val) => setAssignForm({...assignForm, role_name: val})} value={assignForm.role_name}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Pilih role..." /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {roles.map((r) => (<SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button onClick={handleAssignRole} disabled={isSubmitting} className="bg-blue-600 rounded-xl w-full">Simpan Perubahan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Change Password Modal */}
        <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
          <DialogContent className="sm:max-w-[400px] rounded-2xl p-6 w-[95vw]">
            <DialogHeader><DialogTitle>Ganti Password</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2"><Label>Password Baru</Label><Input type="password" value={passwordForm.password} onChange={(e)=>setPasswordForm({...passwordForm, password: e.target.value})} className="rounded-xl"/></div>
              <div className="space-y-2"><Label>Ulangi Password</Label><Input type="password" value={passwordForm.password_confirmation} onChange={(e)=>setPasswordForm({...passwordForm, password_confirmation: e.target.value})} className="rounded-xl"/></div>
              <Alert className="bg-yellow-50 border-yellow-100 text-yellow-800 rounded-xl">
                <AlertDescription className="text-xs">{passwordRequirementsText}</AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button onClick={handleChangePassword} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 rounded-xl w-full">Update Password</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Role Modal (Create/Edit) */}
        <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
          <DialogContent className="sm:max-w-[600px] rounded-2xl p-6 w-[95vw]">
            <DialogHeader><DialogTitle>{roleForm.id ? 'Edit Role' : 'Buat Role Baru'}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2"><Label>Nama Role</Label><Input value={roleForm.name} onChange={(e)=>setRoleForm({...roleForm, name: e.target.value})} className="rounded-xl"/></div>
              <div className="space-y-2">
                <div className="flex justify-between"><Label>Permissions</Label>
                  <div className="space-x-2">
                    <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={()=>setRoleForm(p=>({...p, permissions: permissions.map(x=>x.name)}))}>Select All</Button>
                    <Button type="button" variant="ghost" size="sm" className="h-6 text-xs text-red-500" onClick={()=>setRoleForm(p=>({...p, permissions: []}))}>Clear</Button>
                  </div>
                </div>
                <div className="border rounded-xl p-4 h-60 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/50">
                  {permissions.map((p) => (
                    <div key={p.id} className="flex items-center space-x-2">
                        <Checkbox 
                            id={`p-${p.id}`} 
                            checked={roleForm.permissions.includes(p.name)} 
                            onCheckedChange={() => togglePermission(p.name)}
                        />
                        <label htmlFor={`p-${p.id}`} className="text-sm cursor-pointer select-none">{p.name}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter><Button onClick={handleSaveRole} disabled={isSubmitting} className="bg-blue-600 rounded-xl w-full">Simpan Role</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manage Permissions Modal */}
        <Dialog open={showPermissionModal} onOpenChange={setShowPermissionModal}>
          <DialogContent className="rounded-2xl p-6 sm:max-w-[500px] w-[95vw]">
            <DialogHeader>
                <DialogTitle>Manage Permissions</DialogTitle>
                <DialogDescription>Tambah atau hapus permission sistem.</DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 items-end py-4 border-b">
                <div className="flex-1 space-y-2">
                    <Label>Permission Baru</Label>
                    <Input 
                        value={permForm.name} 
                        onChange={(e)=>setPermForm({name: e.target.value})} 
                        className="rounded-xl" 
                        placeholder="ex: view_dashboard"
                    />
                </div>
                <Button onClick={handleCreatePermission} disabled={isSubmitting || !permForm.name} className="bg-blue-600 rounded-xl">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <div className="pt-2">
                <Label className="mb-2 block">Daftar Permission ({permissions.length})</Label>
                <ScrollArea className="h-[300px] w-full rounded-xl border p-4 bg-gray-50/50">
                    <div className="space-y-2">
                        {permissions.map((perm) => (
                            <div key={perm.id} className="flex items-center justify-between bg-white p-3 rounded-lg border shadow-sm group">
                                <span className="text-sm font-medium text-gray-700">{perm.name}</span>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity opacity-100"
                                    onClick={() => handleDeletePermission(perm.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setShowPermissionModal(false)} className="w-full rounded-xl">Tutup</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}