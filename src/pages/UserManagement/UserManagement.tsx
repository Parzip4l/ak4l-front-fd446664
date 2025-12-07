/* eslint-disable */
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle
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

// Fallback to /api/v1 if env variable is missing
const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

// --- Interfaces ---
interface Role {
  id: number;
  name: string;
  permissions: { id: number; name: string }[];
}

interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  roles?: (Role | string)[]; 
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
  const [assignForm, setAssignForm] = useState<{ user_id: number | null, role_name: string }>({ user_id: null, role_name: "" });
  const [passwordForm, setPasswordForm] = useState<{ user_id: number | null, password: string, password_confirmation: string }>({ user_id: null, password: "", password_confirmation: "" });

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
        
        if (json.data && Array.isArray(json.data)) return json.data;
        if (json.data && json.data.data && Array.isArray(json.data.data)) return json.data.data;
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
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">User & Role Management</h1>
          <p className="text-white mt-2 text-lg">Kelola akses, keamanan, dan struktur organisasi.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={isLoading} className="rounded-xl shadow-sm self-start sm:self-auto">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <RefreshCw className="h-4 w-4 mr-2"/>} Refresh Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full sm:w-auto grid-cols-2">
          <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" /> Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Shield className="w-4 h-4 mr-2" /> Roles & Perms
          </TabsTrigger>
        </TabsList>

        {/* === USERS TAB === */}
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Daftar Pengguna</CardTitle>
                  <CardDescription>Total {users.length} pengguna terdaftar</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="search"
                      placeholder="Cari nama atau email..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 sm:w-[250px] bg-white dark:bg-gray-900"
                    />
                  </div>
                  <Button onClick={() => setShowUserModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" /> User Baru
                  </Button>
                </div>
              </div>
              
              {/* Filter Bar */}
              <div className="flex flex-col md:flex-row gap-4 mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                <div className="flex items-center gap-2 flex-1">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="bg-white dark:bg-gray-800 w-full md:w-[200px]">
                      <SelectValue placeholder="Filter Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Role</SelectItem>
                      {roles.map(r => (
                        <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(searchTerm || filterRole !== 'all') && (
                    <Button variant="ghost" size="icon" onClick={() => { setSearchTerm(""); setFilterRole("all"); }} className="text-red-500 hover:bg-red-50">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
                ) : filteredUsers.length > 0 ? (
                  <div className="space-y-4">
                    {filteredUsers.map((u) => (
                      <Card key={u.id} className="overflow-hidden border border-gray-200 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
                                {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{u.name}</h3>
                                <p className="text-sm text-gray-500">{u.email}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {u.roles && u.roles.length > 0 ? u.roles.map((r, i) => {
                                      const roleName = typeof r === 'string' ? r : r.name;
                                      return (
                                          <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 text-xs">
                                              {roleName}
                                              <button 
                                                  onClick={() => handleRemoveRoleFromUser(u.id, roleName)}
                                                  className="hover:bg-green-200 rounded-full p-0.5 transition-colors ml-1"
                                                  title="Hapus role ini"
                                              >
                                                  <X className="h-3 w-3" />
                                              </button>
                                          </Badge>
                                      );
                                  }) : <Badge variant="outline" className="text-gray-400 border-gray-200 text-xs">No Role</Badge>}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 w-full sm:w-auto justify-end">
                                <Button 
                                    variant="outline" size="sm" 
                                    className="flex-1 sm:flex-none"
                                    onClick={() => { setAssignForm({ user_id: u.id, role_name: "" }); setShowAssignModal(true); }}
                                >
                                    <Shield className="h-3.5 w-3.5 mr-1" /> Role
                                </Button>
                                <Button 
                                    variant="outline" size="sm"
                                    className="flex-1 sm:flex-none text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                    onClick={() => { setPasswordForm({ user_id: u.id, password: "", password_confirmation: "" }); setShowPasswordModal(true); }}
                                >
                                    <Lock className="h-3.5 w-3.5 mr-1" /> Password
                                </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">Tidak ada user ditemukan.</div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === ROLES TAB === */}
        <TabsContent value="roles" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle>Roles & Permissions</CardTitle>
                  <CardDescription>Manajemen hak akses level role.</CardDescription>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button variant="outline" onClick={() => setShowPermissionModal(true)} className="flex-1 md:flex-none">
                    <Key className="h-4 w-4 mr-2" /> Permissions
                  </Button>
                  <Button onClick={() => { 
                      setRoleForm({ id: null, name: "", permissions: [] }); 
                      setOriginalPermissions([]); 
                      setShowRoleModal(true); 
                  }} className="bg-blue-600 hover:bg-blue-700 text-white flex-1 md:flex-none">
                    <Plus className="h-4 w-4 mr-2" /> Role Baru
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {roles.map((role) => (
                  <Card key={role.id} className="overflow-hidden border border-gray-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-600" />
                            {role.name}
                          </h3>
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {role.permissions?.slice(0, 15).map((p, i) => (
                              <Badge key={i} variant="secondary" className="bg-gray-100 text-gray-600 text-xs border border-gray-200">{p.name}</Badge>
                            ))}
                            {role.permissions && role.permissions.length > 15 && (
                                <Badge variant="secondary" className="bg-gray-100 text-gray-500 text-xs">+{role.permissions.length - 15} more</Badge>
                            )}
                            {(!role.permissions || role.permissions.length === 0) && (
                              <span className="text-xs text-gray-400 italic">No permissions assigned</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                            <Button variant="ghost" size="sm" onClick={() => openEditRole(role)} className="hover:bg-blue-50 text-blue-600">
                                <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteRole(role.id)} className="hover:bg-red-50 text-red-600">
                                <Trash2 className="h-4 w-4 mr-1" /> Hapus
                            </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- MODALS --- */}
      
      {/* Register User Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Tambah User</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Nama</Label><Input value={userForm.name} onChange={(e)=>setUserForm({...userForm, name: e.target.value})} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={userForm.email} onChange={(e)=>setUserForm({...userForm, email: e.target.value})} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Password</Label><Input type="password" value={userForm.password} onChange={(e)=>setUserForm({...userForm, password: e.target.value})} /></div>
              <div className="space-y-2"><Label>Konfirmasi</Label><Input type="password" value={userForm.password_confirmation} onChange={(e)=>setUserForm({...userForm, password_confirmation: e.target.value})} /></div>
            </div>
            <Alert className="bg-blue-50 border-blue-100 text-blue-800">
              <AlertDescription className="text-xs">{passwordRequirementsText}</AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button onClick={handleRegisterUser} disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Simpan User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Role Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Assign Role</DialogTitle><DialogDescription>Ubah hak akses pengguna ini.</DialogDescription></DialogHeader>
          <div className="py-4 space-y-2">
            <Label>Pilih Role</Label>
            <Select onValueChange={(val) => setAssignForm({...assignForm, role_name: val})} value={assignForm.role_name}>
              <SelectTrigger><SelectValue placeholder="Pilih role..." /></SelectTrigger>
              <SelectContent>
                {roles.map((r) => (<SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleAssignRole} disabled={isSubmitting} className="w-full">Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Ganti Password</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Password Baru</Label><Input type="password" value={passwordForm.password} onChange={(e)=>setPasswordForm({...passwordForm, password: e.target.value})} /></div>
            <div className="space-y-2"><Label>Ulangi Password</Label><Input type="password" value={passwordForm.password_confirmation} onChange={(e)=>setPasswordForm({...passwordForm, password_confirmation: e.target.value})} /></div>
            <Alert className="bg-yellow-50 border-yellow-100 text-yellow-800">
              <AlertDescription className="text-xs">{passwordRequirementsText}</AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button onClick={handleChangePassword} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 w-full text-white">Update Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Modal (Create/Edit) */}
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{roleForm.id ? 'Edit Role' : 'Buat Role Baru'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Nama Role</Label><Input value={roleForm.name} onChange={(e)=>setRoleForm({...roleForm, name: e.target.value})} /></div>
            <div className="space-y-2">
              <div className="flex justify-between items-center"><Label>Permissions</Label>
                <div className="space-x-2">
                  <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={()=>setRoleForm(p=>({...p, permissions: permissions.map(x=>x.name)}))}>Select All</Button>
                  <Button type="button" variant="ghost" size="sm" className="h-6 text-xs text-red-500" onClick={()=>setRoleForm(p=>({...p, permissions: []}))}>Clear</Button>
                </div>
              </div>
              <div className="border rounded-md p-4 h-60 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/50">
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
          <DialogFooter><Button onClick={handleSaveRole} disabled={isSubmitting} className="w-full sm:w-auto">Simpan Role</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Permissions Modal */}
      <Dialog open={showPermissionModal} onOpenChange={setShowPermissionModal}>
        <DialogContent className="sm:max-w-[500px]">
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
                      placeholder="ex: view_dashboard"
                  />
              </div>
              <Button onClick={handleCreatePermission} disabled={isSubmitting || !permForm.name}>
                  <Plus className="h-4 w-4" />
              </Button>
          </div>
          <div className="pt-2">
              <Label className="mb-2 block">Daftar Permission ({permissions.length})</Label>
              <ScrollArea className="h-[300px] w-full rounded-md border p-4 bg-gray-50/50">
                  <div className="space-y-2">
                      {permissions.map((perm) => (
                          <div key={perm.id} className="flex items-center justify-between bg-white p-3 rounded-md border shadow-sm group">
                              <span className="text-sm font-medium text-gray-700">{perm.name}</span>
                              <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
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
              <Button variant="outline" onClick={() => setShowPermissionModal(false)} className="w-full">Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}