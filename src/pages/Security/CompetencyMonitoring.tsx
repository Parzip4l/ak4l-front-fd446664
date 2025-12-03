"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { 
  Users, FileText, CheckCircle, AlertTriangle, Upload, Eye, Plus, Edit, Trash2, Loader2, ThumbsUp, ThumbsDown, UserSquare, ShieldCheck, Briefcase, Search, ChevronLeft, ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || "/storage";


const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";
const AUTH_ME_URL = `${API_BASE_URL}/me`;
const STORAGE_BASE_URL = `${STORAGE_URL}/storage`;

// --- API SERVICE ---
const apiService = {
  get: async (url) => {
    const token = localStorage.getItem('token');
    const res = await fetch(url, { headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }});
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  },
  post: async (url, body, isFormData = false) => {
    const token = localStorage.getItem('token');
    const headers = { "Authorization": `Bearer ${token}`, "Accept": "application/json" };
    if (!isFormData) headers["Content-Type"] = "application/json";
    const res = await fetch(url, { method: 'POST', headers, body: isFormData ? body : JSON.stringify(body) });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to post data');
    }
    return res.json();
  },
  put: async (url, body) => {
    const token = localStorage.getItem('token');
    const res = await fetch(url, { method: 'PUT', headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json", "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error('Failed to update data');
    return res.json();
  },
  delete: async (url) => {
    const token = localStorage.getItem('token');
    const res = await fetch(url, { method: 'DELETE', headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }});
    if (!res.ok) throw new Error('Failed to delete data');
    return res.json();
  }
};

// --- MAIN COMPONENT ---
export default function CompetencyManagement() {
  const { toast } = useToast();
  
  // Data States
  const [personnelList, setPersonnelList] = useState([]);
  const [skills, setSkills] = useState([]);
  const [jobPositions, setJobPositions] = useState([]);
  const [competencyMatrix, setCompetencyMatrix] = useState([]);
  
  // Loading & Permissions
  const [isLoading, setIsLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState([]);
  
  // Dialog & Form states
  const [dialogState, setDialogState] = useState({ type: null, data: null, isOpen: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [personnelRes, skillsRes, jobPositionsRes] = await Promise.all([
        apiService.get(`${API_BASE_URL}/personnels`),
        apiService.get(`${API_BASE_URL}/skills`),
        apiService.get(`${API_BASE_URL}/job-positions`)
      ]);
      setPersonnelList(personnelRes.data || []);
      setSkills(skillsRes.data || skillsRes || []);
      setJobPositions(jobPositionsRes.data || jobPositionsRes || []);
    } catch (error) {
      toast({ title: "Gagal Memuat Data", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const meData = await apiService.get(AUTH_ME_URL);
        setUserPermissions(meData.permissions || []);
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
      }
    };
    fetchPermissions();
    fetchData();
  }, []);

  // --- COMPETENCY MATRIX LOGIC ---
  useEffect(() => {
    if (personnelList.length > 0 && skills.length > 0) {
      const matrix = personnelList.map(person => {
        let validSkills = 0;
        const personSkills = skills.map(skill => {
          const personnelSkill = person.skills?.find(ps => ps.skill_id === skill.id);
          let status = 'missing';
          if (personnelSkill) {
             status = personnelSkill.status || 'pending';
             if (status === 'valid') validSkills++;
          }
          return { ...skill, personnelSkill, status };
        });
        const overallScore = skills.length > 0 ? Math.round((validSkills / skills.length) * 100) : 0;
        return { ...person, skills: personSkills, overallScore };
      });
      setCompetencyMatrix(matrix);
    } else {
      setCompetencyMatrix([]);
    }
  }, [personnelList, skills]);
  
  const handleCrudSubmit = async (formData) => {
      setIsSubmitting(true);
      const { type, data } = dialogState;
      try {
          let response;
          switch (type) {
              case 'new-personnel':
                  response = await apiService.post(`${API_BASE_URL}/personnels`, formData, true);
                  break;
              case 'edit-personnel':
                  response = await apiService.post(`${API_BASE_URL}/personnels/${data.id}`, formData, true);
                  break;
              case 'delete-personnel':
                  response = await apiService.delete(`${API_BASE_URL}/personnels/${data.id}`);
                  break;
              case 'new-skill':
                  response = await apiService.post(`${API_BASE_URL}/skills`, formData);
                  break;
              case 'edit-skill':
                  response = await apiService.put(`${API_BASE_URL}/skills/${data.id}`, formData);
                  break;
              case 'delete-skill':
                  response = await apiService.delete(`${API_BASE_URL}/skills/${data.id}`);
                  break;
              case 'new-job':
                  response = await apiService.post(`${API_BASE_URL}/job-positions`, formData);
                  break;
              case 'edit-job':
                  response = await apiService.put(`${API_BASE_URL}/job-positions/${data.id}`, formData);
                  break;
              case 'delete-job':
                  response = await apiService.delete(`${API_BASE_URL}/job-positions/${data.id}`);
                  break;
              case 'approve-skill':
                  response = await apiService.post(`${API_BASE_URL}/personnel-skills/${data.personnelSkill.id}/status`, formData);
                  break;
              case 'upload-skill':
                  response = await apiService.post(`${API_BASE_URL}/personnel-skills`, formData, true);
                  break;
          }
          toast({ title: "Sukses", description: response?.message || "Operasi berhasil." });
          fetchData(); // Refresh all data
          setDialogState({ isOpen: false, type: null, data: null });
      } catch (error) {
          toast({ title: "Gagal", description: error.message, variant: "destructive" });
      } finally {
          setIsSubmitting(false);
      }
  };

  const openDialog = (type, data = null) => setDialogState({ isOpen: true, type, data });

  // Permissions
  const canApprove = userPermissions.includes('security_metrics.create');
  const canCreate = userPermissions.includes('security_metrics.create');
  const canUpdate = userPermissions.includes('security_metrics.update');
  const canDelete = userPermissions.includes('security_metrics.delete');
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8 relative">
      <h1 className="text-3xl font-bold text-white">Manajemen Kompetensi Security</h1>
      
      <Tabs defaultValue="matrix">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="matrix"><ShieldCheck className="h-4 w-4 mr-2"/>Matriks Kompetensi</TabsTrigger>
          <TabsTrigger value="personnel"><Users className="h-4 w-4 mr-2"/>Manajemen Personel</TabsTrigger>
          <TabsTrigger value="jobs"><Briefcase className="h-4 w-4 mr-2"/>Manajemen Jabatan</TabsTrigger>
          <TabsTrigger value="skills"><FileText className="h-4 w-4 mr-2"/>Manajemen Keahlian</TabsTrigger>
        </TabsList>
        
        <TabsContent value="matrix" className="mt-6">
          <CompetencyMatrix matrix={competencyMatrix} onOpenDialog={openDialog} canApprove={canApprove}/>
        </TabsContent>
        
        <TabsContent value="personnel" className="mt-6">
            <CrudTable
                title="Personel Security"
                description="Kelola data seluruh personel security."
                data={personnelList}
                columns={[
                    { accessor: 'photo', header: 'Foto', render: (item) => <img 
  src={item.photo ? `${STORAGE_BASE_URL}/${item.photo}` : "/default-avatar.png"} 
  alt={item.name} 
  className="h-16 w-16 rounded-full object-cover" 
/> },
                    { accessor: 'name', header: 'Nama' },
                    { accessor: 'job_position.name', header: 'Jabatan' },
                    { accessor: 'kta_number', header: 'No. KTA' },
                ]}
                onOpenDialog={openDialog}
                dialogTypePrefix="personnel"
                canCreate={canCreate} canUpdate={canUpdate} canDelete={canDelete}
            />
        </TabsContent>
        
        <TabsContent value="jobs" className="mt-6">
            <CrudTable
                title="Jabatan"
                description="Kelola posisi jabatan yang tersedia."
                data={jobPositions}
                columns={[{ accessor: 'name', header: 'Nama Jabatan' }]}
                onOpenDialog={openDialog}
                dialogTypePrefix="job"
                canCreate={canCreate} canUpdate={canUpdate} canDelete={canDelete}
            />
        </TabsContent>
        
        <TabsContent value="skills" className="mt-6">
            <CrudTable
                title="Keahlian"
                description="Kelola jenis kompetensi dan sertifikasi yang dibutuhkan."
                data={skills}
                columns={[{ accessor: 'name', header: 'Nama Keahlian' }]}
                onOpenDialog={openDialog}
                dialogTypePrefix="skill"
                canCreate={canCreate} canUpdate={canUpdate} canDelete={canDelete}
            />
        </TabsContent>
      </Tabs>
      
      <FormDialog 
        dialogState={dialogState}
        setDialogState={setDialogState}
        onSubmit={handleCrudSubmit}
        isSubmitting={isSubmitting}
        jobPositions={jobPositions}
      />
    </div>
  );
}

// --- SUB-COMPONENTS ---

const CompetencyMatrix = ({ matrix, onOpenDialog, canApprove }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredMatrix = useMemo(() => {
        if (!searchTerm) return matrix;
        return matrix.filter(person => person.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [matrix, searchTerm]);

    const getStatusBadge = (status) => {
      switch (status) {
        case 'valid': return <Badge className="bg-green-100 text-green-800">Valid</Badge>;
        case 'expired': return <Badge variant="destructive">Expired</Badge>;
        case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
        default: return <Badge variant="secondary">Missing</Badge>;
      }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle>Matriks Kompetensi Personel</CardTitle>
                        <CardDescription>Status sertifikasi dan kompetensi seluruh personel security.</CardDescription>
                    </div>
                     <div className="relative w-full md:w-auto">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Cari nama personel..."
                            className="pl-8 w-full md:w-[300px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {filteredMatrix.map((person) => (
                        <Card key={person.id} className="p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-4">
                                    <img src={`${STORAGE_BASE_URL}/${person.photo}`} alt={person.name} className="h-16 w-16 rounded-full object-cover" />
                                    <div>
                                        <h4 className="font-semibold text-lg">{person.name}</h4>
                                        <p className="text-sm text-muted-foreground">{person.job_position?.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold">{person.overallScore}%</div>
                                    <Progress value={person.overallScore} className="w-24 h-2 mt-1" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                {person.skills.map(skill => (
                                    <div key={skill.id} className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-sm">{skill.name}</span>
                                            {getStatusBadge(skill.status)}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Exp: {skill.personnelSkill?.valid_until || 'N/A'}
                                        </p>
                                        <div className="flex space-x-2 mt-2">
                                            {skill.personnelSkill ? (
                                                <>
                                                    <Button size="sm" variant="outline" className="text-xs" asChild><a href={`${STORAGE_BASE_URL}/${skill.personnelSkill.certificate_file}`} target="_blank" rel="noopener noreferrer"><Eye className="mr-1 h-3 w-3" />Lihat</a></Button>
                                                    
                                                </>
                                            ) : (
                                                <Button size="sm" variant="outline" className="text-xs" onClick={() => onOpenDialog('upload-skill', { ...skill, personId: person.id })}><Upload className="mr-1 h-3 w-3" />Upload</Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

const CrudTable = ({ title, description, data, columns, onOpenDialog, dialogTypePrefix, canCreate, canUpdate, canDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const lowercasedFilter = searchTerm.toLowerCase();
        return data.filter(item => 
            columns.some(col => {
                const value = col.accessor.split('.').reduce((o, i) => o?.[i], item) || '';
                return String(value).toLowerCase().includes(lowercasedFilter);
            })
        );
    }, [data, searchTerm, columns]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredData, currentPage]);
    
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 w-full md:w-auto">
                         <div className="relative flex-grow">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Cari..."
                                className="pl-8 w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {canCreate && <Button onClick={() => onOpenDialog(`new-${dialogTypePrefix}`)} className="flex-shrink-0"><Plus className="mr-2 h-4 w-4" /> Tambah</Button>}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {columns.map(col => <th key={col.accessor} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col.header}</th>)}
                                {(canUpdate || canDelete) && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedData.map(item => (
                                <tr key={item.id}>
                                    {columns.map(col => <td key={col.accessor} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{col.render ? col.render(item) : col.accessor.split('.').reduce((o, i) => o?.[i], item) || 'N/A'}</td>)}
                                    {(canUpdate || canDelete) && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            {canUpdate && <Button variant="outline" size="icon" onClick={() => onOpenDialog(`edit-${dialogTypePrefix}`, item)}><Edit className="h-4 w-4" /></Button>}
                                            {canDelete && <Button variant="destructive" size="icon" onClick={() => onOpenDialog(`delete-${dialogTypePrefix}`, item)}><Trash2 className="h-4 w-4" /></Button>}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {totalPages > 1 && (
                    <div className="flex items-center justify-end space-x-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /> Previous</Button>
                        <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Next <ChevronRight className="h-4 w-4" /></Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};


const FormDialog = ({ dialogState, setDialogState, onSubmit, isSubmitting, jobPositions }) => {
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const getInitialState = () => {
        if (dialogState.type?.startsWith('new')) {
            if (dialogState.type === 'new-personnel') return { name: '', bujp: '', kta_number: '', code: '', job_position_id: '', photo: null };
            if (dialogState.type === 'new-skill' || dialogState.type === 'new-job') return { name: '' };
        }
        if (dialogState.type === 'upload-skill') {
            return {
                personnel_id: dialogState.data.personId,
                skill_id: dialogState.data.id,
                certificate: '', member_card: '', certificate_file: null, member_card_file: null, valid_until: ''
            };
        }
        if (dialogState.type === 'approve-skill') {
            return { status: 'valid', notes: '' };
        }
        return dialogState.data || {};
    };
    const initialState = getInitialState();
    setFormData(initialState);
    
    if (dialogState.type === 'edit-personnel' && initialState.photo) {
        setImagePreview(`${STORAGE_BASE_URL}/${initialState.photo}`);
    } else {
        setImagePreview(null);
    }

  }, [dialogState.type, dialogState.data]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo' && files && files[0]) {
        const file = files[0];
        setFormData(prev => ({ ...prev, photo: file }));
        setImagePreview(URL.createObjectURL(file));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let submissionData = { ...formData };
    
    if (['new-personnel', 'edit-personnel', 'upload-skill'].includes(dialogState.type)) {
        const fd = new FormData();
        for (const key in submissionData) {
            if (submissionData[key] !== null && submissionData[key] !== undefined) {
                fd.append(key, submissionData[key]);
            }
        }
        if(dialogState.type === 'edit-personnel') fd.append('_method', 'PUT');
        submissionData = fd;
    }
    onSubmit(submissionData);
  };

  const renderForm = () => {
    switch (dialogState.type) {
      case 'new-personnel':
      case 'edit-personnel':
        return (
          <div className="space-y-4">
            <div className="space-y-2"><Label htmlFor="name">Nama</Label><Input id="name" name="name" value={formData.name || ''} onChange={handleChange} required /></div>
            <div className="space-y-2"><Label htmlFor="bujp">BUJP</Label><Input id="bujp" name="bujp" value={formData.bujp || ''} onChange={handleChange} /></div>
            <div className="space-y-2"><Label htmlFor="kta_number">No. KTA</Label><Input id="kta_number" name="kta_number" value={formData.kta_number || ''} onChange={handleChange} /></div>
            <div className="space-y-2"><Label htmlFor="code">Kode</Label><Input id="code" name="code" value={formData.code || ''} onChange={handleChange} /></div>
            <div className="space-y-2"><Label htmlFor="job_position_id">Jabatan</Label>
                <Select name="job_position_id" value={String(formData.job_position_id || '')} onValueChange={(value) => handleSelectChange('job_position_id', value)}>
                    <SelectTrigger><SelectValue placeholder="Pilih jabatan..." /></SelectTrigger>
                    <SelectContent>{jobPositions.map(jp => <SelectItem key={jp.id} value={String(jp.id)}>{jp.name}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div className="space-y-2"><Label htmlFor="photo">Foto</Label><Input id="photo" name="photo" type="file" onChange={handleChange} /></div>
            {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-24 w-24 rounded-full object-cover"/>}
          </div>
        );
      case 'new-skill':
      case 'edit-skill':
      case 'new-job':
      case 'edit-job':
        return <div className="space-y-2"><Label htmlFor="name">Nama</Label><Input id="name" name="name" value={formData.name || ''} onChange={handleChange} required /></div>;
      case 'upload-skill':
        return (
            <div className="space-y-4">
                <div className="space-y-2"><Label htmlFor="certificate">No. Sertifikat</Label><Input id="certificate" name="certificate" value={formData.certificate || ''} onChange={handleChange} required /></div>
                <div className="space-y-2"><Label htmlFor="member_card">No. Kartu Anggota</Label><Input id="member_card" name="member_card" value={formData.member_card || ''} onChange={handleChange} /></div>
                <div className="space-y-2"><Label htmlFor="certificate_file">File Sertifikat (PDF/JPG)</Label><Input id="certificate_file" name="certificate_file" type="file" onChange={handleChange} required /></div>
                <div className="space-y-2"><Label htmlFor="member_card_file">File Kartu Anggota (PDF/JPG)</Label><Input id="member_card_file" name="member_card_file" type="file" onChange={handleChange} /></div>
                <div className="space-y-2"><Label htmlFor="valid_until">Tanggal Kadaluarsa</Label><Input id="valid_until" name="valid_until" type="date" value={formData.valid_until || ''} onChange={handleChange} /></div>
            </div>
        )
      case 'approve-skill':
        return (
            <div className="space-y-4">
                 <div className="space-y-2"><Label htmlFor="status">Status</Label>
                    <Select name="status" value={formData.status || 'valid'} onValueChange={(value) => handleSelectChange('status', value)}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="valid">Valid</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                            <SelectItem value="rejected">Tolak (Rejected)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2"><Label htmlFor="notes">Catatan</Label><Textarea id="notes" name="notes" placeholder="Tambahkan catatan persetujuan..." value={formData.notes || ''} onChange={handleChange} /></div>
            </div>
        );
      case 'delete-personnel':
      case 'delete-skill':
      case 'delete-job':
        return <DialogDescription>Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat diurungkan.</DialogDescription>;
      default: return null;
    }
  };
  
  const getDialogTitle = () => {
    const titles = {
      'new-personnel': 'Tambah Personel Baru', 'edit-personnel': 'Edit Personel', 'delete-personnel': 'Hapus Personel',
      'new-skill': 'Tambah Keahlian Baru', 'edit-skill': 'Edit Keahlian', 'delete-skill': 'Hapus Keahlian',
      'new-job': 'Tambah Jabatan Baru', 'edit-job': 'Edit Jabatan', 'delete-job': 'Hapus Jabatan',
      'approve-skill': `Approve Skill: ${dialogState.data?.name}`,
      'upload-skill': `Upload Skill: ${dialogState.data?.name}`
    };
    return titles[dialogState.type] || '';
  }

  if (!dialogState.isOpen) return null;

  const isDelete = dialogState.type?.startsWith('delete');

  return (
    <Dialog open={dialogState.isOpen} onOpenChange={(isOpen) => setDialogState(prev => ({ ...prev, isOpen }))}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{getDialogTitle()}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                <div className="py-4">{renderForm()}</div>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setDialogState({ isOpen: false, type: null, data: null })}>Batal</Button>
                    <Button type="submit" disabled={isSubmitting} variant={isDelete ? 'destructive' : 'default'}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                        {isDelete ? 'Hapus' : (dialogState.type === 'approve-skill' ? 'Update Status' : 'Simpan')}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
  );
};

