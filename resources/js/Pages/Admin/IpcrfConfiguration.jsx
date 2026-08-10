import { AppSidebar } from "@/components/app-sidebar";
import { Head, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Toaster } from "@/components/ui/sonner";
import { 
    Plus, 
    Edit, 
    Trash2, 
    Lock, 
    Unlock, 
    CheckCircle, 
    XCircle,
    Settings,
    AlertCircle,
    Save
} from 'lucide-react';

export default function IpcrfConfiguration({ configurations, currentYear, defaultKras, flash }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState(null);
    
    // Custom KRA/Objective states
    const [customKras, setCustomKras] = useState([]);
    const [customObjectives, setCustomObjectives] = useState([]);
    const [showAddKraForm, setShowAddKraForm] = useState(false);
    const [showAddObjectiveForm, setShowAddObjectiveForm] = useState(false);
    const [newKra, setNewKra] = useState({ name: '', description: '' });
    const [newObjective, setNewObjective] = useState({ kra_id: '', code: '', description: '', weight: '7' });
    
    // Combine default and custom KRAs, merging custom objectives into default KRAs
    const availableKras = React.useMemo(() => {
        if (!defaultKras) return [];
        
        // Start with default KRAs
        const merged = defaultKras.map(kra => {
            // Find custom objectives for this default KRA
            const customObjsForThisKra = customObjectives.filter(obj => obj.kra_id === kra.id);
            
            if (customObjsForThisKra.length > 0) {
                // Merge custom objectives with default objectives
                return {
                    ...kra,
                    objectives: [...(kra.objectives || []), ...customObjsForThisKra]
                };
            }
            return kra;
        });
        
        // Add custom KRAs with their objectives
        customKras.forEach(customKra => {
            // Find objectives for this custom KRA
            const objsForCustomKra = customObjectives.filter(obj => obj.kra_id === customKra.id);
            merged.push({
                ...customKra,
                objectives: objsForCustomKra
            });
        });
        
        return merged;
    }, [defaultKras, customKras, customObjectives]);
    
    const [formData, setFormData] = useState({
        school_year: '',
        kra_count: 4,
        objectives_per_kra: [3, 3, 3, 3],
        selected_objective_ids: [],
        custom_kras: [],
        custom_objectives: [],
        submission_start_date: '',
        submission_end_date: '',
        notes: '',
    });

    // Show flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const resetForm = () => {
        setFormData({
            school_year: '',
            kra_count: 4,
            objectives_per_kra: [3, 3, 3, 3],
            selected_objective_ids: [],
            custom_kras: [],
            custom_objectives: [],
            submission_start_date: '',
            submission_end_date: '',
            notes: '',
        });
        setCustomKras([]);
        setCustomObjectives([]);
        setShowAddKraForm(false);
        setShowAddObjectiveForm(false);
    };

    // Custom KRA handlers
    const handleAddCustomKra = () => {
        if (!newKra.name.trim()) {
            toast.error('KRA name is required');
            return;
        }
        
        const customKra = {
            id: `custom_kra_${Date.now()}`,
            name: newKra.name,
            description: newKra.description,
            objectives: [], // Initialize empty objectives array
            is_custom: true,
            order: 100 + customKras.length
        };
        
        setCustomKras([...customKras, customKra]);
        setNewKra({ name: '', description: '' });
        setShowAddKraForm(false);
        toast.success('Custom KRA added!');
    };

    const handleRemoveCustomKra = (kraId) => {
        setCustomKras(customKras.filter(k => k.id !== kraId));
        // Also remove objectives for this KRA
        setCustomObjectives(customObjectives.filter(o => o.kra_id !== kraId));
        toast.success('Custom KRA removed');
    };

    // Custom Objective handlers
    const handleAddCustomObjective = () => {
        if (!newObjective.kra_id) {
            toast.error('Please select a KRA');
            return;
        }
        if (!newObjective.code.trim() || !newObjective.description.trim()) {
            toast.error('Code and description are required');
            return;
        }
        
        const customObj = {
            id: `custom_obj_${Date.now()}`,
            kra_id: newObjective.kra_id,
            code: newObjective.code,
            description: newObjective.description,
            weight: parseFloat(newObjective.weight) || 7,
            is_custom: true,
            order: 100
        };
        
        // Add to customObjectives state (availableKras will auto-update via useMemo)
        setCustomObjectives([...customObjectives, customObj]);
        
        // Add to selected objectives automatically
        setFormData({
            ...formData,
            selected_objective_ids: [...formData.selected_objective_ids, customObj.id]
        });
        
        setNewObjective({ kra_id: '', code: '', description: '', weight: '7' });
        setShowAddObjectiveForm(false);
        toast.success('Custom objective added!');
    };

    const handleRemoveCustomObjective = (objId) => {
        setCustomObjectives(customObjectives.filter(o => o.id !== objId));
        setFormData({
            ...formData,
            selected_objective_ids: formData.selected_objective_ids.filter(id => id !== objId)
        });
        toast.success('Custom objective removed');
    };

    const handleObjectiveSelection = (objectiveId) => {
        const currentIds = formData.selected_objective_ids || [];
        const newIds = currentIds.includes(objectiveId)
            ? currentIds.filter(id => id !== objectiveId)
            : [...currentIds, objectiveId];
        
        setFormData({
            ...formData,
            selected_objective_ids: newIds,
        });
    };

    const handleSelectAllObjectives = () => {
        const allObjectiveIds = availableKras.flatMap(kra => 
            kra.objectives ? kra.objectives.map(obj => obj.id) : []
        );
        setFormData({
            ...formData,
            selected_objective_ids: allObjectiveIds,
        });
    };

    const handleDeselectAllObjectives = () => {
        setFormData({
            ...formData,
            selected_objective_ids: [],
        });
    };

    const handleKraCountChange = (count) => {
        const newCount = parseInt(count);
        const newObjectives = Array(newCount).fill(3);
        
        // Preserve existing values if reducing count
        if (newCount < formData.kra_count) {
            for (let i = 0; i < newCount; i++) {
                newObjectives[i] = formData.objectives_per_kra[i] || 3;
            }
        } else {
            // Copy existing values and fill new ones with 3
            for (let i = 0; i < formData.kra_count; i++) {
                newObjectives[i] = formData.objectives_per_kra[i] || 3;
            }
        }
        
        setFormData({
            ...formData,
            kra_count: newCount,
            objectives_per_kra: newObjectives,
        });
    };

    const handleObjectiveChange = (kraIndex, value) => {
        const newObjectives = [...formData.objectives_per_kra];
        newObjectives[kraIndex] = parseInt(value);
        setFormData({
            ...formData,
            objectives_per_kra: newObjectives,
        });
    };

    const openCreateModal = () => {
        resetForm();
        setFormData({
            ...formData,
            school_year: `${currentYear}-${parseInt(currentYear) + 1}`,
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (config) => {
        setSelectedConfig(config);
        
        // Reset custom states first
        setCustomKras([]);
        setCustomObjectives([]);
        
        // Load custom KRAs if they exist
        if (config.custom_kras && config.custom_kras.length > 0) {
            setCustomKras(config.custom_kras);
        }
        
        // Load custom objectives if they exist (flatten from custom KRAs)
        if (config.custom_kras && config.custom_kras.length > 0) {
            const allCustomObjectives = config.custom_kras.flatMap(kra => 
                kra.objectives ? kra.objectives.map(obj => ({
                    ...obj,
                    kra_id: kra.id
                })) : []
            );
            setCustomObjectives(allCustomObjectives);
        }
        
        setFormData({
            school_year: config.school_year,
            kra_count: config.kra_count,
            objectives_per_kra: config.objectives_per_kra,
            selected_objective_ids: config.selected_objective_ids || [],
            custom_kras: [],
            custom_objectives: [],
            submission_start_date: config.submission_start_date || '',
            submission_end_date: config.submission_end_date || '',
            notes: config.notes || '',
        });
        
        setIsEditModalOpen(true);
    };

    // Get selected objectives with auto-numbering
    const getSelectedObjectivesWithNumbers = () => {
        const selectedObjs = [];
        let counter = 1;
        
        availableKras.forEach(kra => {
            const objectives = kra.objectives || [];
            objectives.forEach(obj => {
                if (formData.selected_objective_ids.includes(obj.id)) {
                    selectedObjs.push({
                        ...obj,
                        displayNumber: counter++,
                        kraName: kra.name,
                    });
                }
            });
        });
        
        return selectedObjs;
    };

    const openDeleteModal = (config) => {
        setSelectedConfig(config);
        setIsDeleteModalOpen(true);
    };

    const openPreviewModal = () => {
        setIsPreviewModalOpen(true);
    };

    const handleCreate = () => {
        // Calculate objectives_per_kra based on selected objectives
        const objectivesPerKra = availableKras.map(kra => {
            const kraObjectives = kra.objectives || [];
            const selectedCount = kraObjectives.filter(obj => 
                formData.selected_objective_ids.includes(obj.id)
            ).length;
            return selectedCount;
        });

        // Prepare custom KRAs data
        const customKrasData = customKras.map(kra => ({
            name: kra.name,
            description: kra.description || ''
        }));

        // Prepare custom objectives data  
        const customObjectivesData = customObjectives.map(obj => ({
            kra_id: obj.kra_id,
            code: obj.code,
            description: obj.description,
            weight: obj.weight
        }));

        // Filter out custom objective IDs (strings) and only send real objective IDs (integers)
        const realObjectiveIds = formData.selected_objective_ids.filter(id => 
            typeof id === 'number' || !id.toString().startsWith('custom_obj_')
        );

        const dataToSubmit = {
            ...formData,
            selected_objective_ids: realObjectiveIds,
            objectives_per_kra: objectivesPerKra,
            custom_kras: customKrasData,
            custom_objectives: customObjectivesData,
        };

        router.post(route('admin.ipcrf.configuration.store'), dataToSubmit, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                resetForm();
                toast.success('Configuration created successfully!');
            },
            onError: (errors) => {
                Object.keys(errors).forEach((field) => {
                    toast.error(errors[field]);
                });
            },
        });
    };

    const handleUpdate = () => {
        // Calculate objectives_per_kra based on selected objectives
        const objectivesPerKra = availableKras.map(kra => {
            const kraObjectives = kra.objectives || [];
            const selectedCount = kraObjectives.filter(obj => 
                formData.selected_objective_ids.includes(obj.id)
            ).length;
            return selectedCount;
        });

        // Prepare custom KRAs data
        const customKrasData = customKras.map(kra => ({
            name: kra.name,
            description: kra.description || ''
        }));

        // Prepare custom objectives data  
        const customObjectivesData = customObjectives.map(obj => ({
            kra_id: obj.kra_id,
            code: obj.code,
            description: obj.description,
            weight: obj.weight
        }));

        // Filter out custom objective IDs (strings) and only send real objective IDs (integers)
        const realObjectiveIds = formData.selected_objective_ids.filter(id => 
            typeof id === 'number' || !id.toString().startsWith('custom_obj_')
        );

        const dataToSubmit = {
            ...formData,
            selected_objective_ids: realObjectiveIds,
            objectives_per_kra: objectivesPerKra,
            custom_kras: customKrasData,
            custom_objectives: customObjectivesData,
        };

        router.put(route('admin.ipcrf.configuration.update', selectedConfig.id), dataToSubmit, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedConfig(null);
                resetForm();
                toast.success('Configuration updated successfully!');
            },
            onError: (errors) => {
                Object.keys(errors).forEach((field) => {
                    toast.error(errors[field]);
                });
            },
        });
    };

    const handleDelete = () => {
        router.delete(route('admin.ipcrf.configuration.destroy', selectedConfig.id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedConfig(null);
                toast.success('Configuration deleted successfully!');
            },
            onError: (errors) => {
                if (typeof errors === 'object') {
                    Object.keys(errors).forEach((field) => {
                        toast.error(errors[field]);
                    });
                }
            },
        });
    };

    const handleToggleActive = (config) => {
        router.post(route('admin.ipcrf.configuration.toggle-active', config.id), {}, {
            onSuccess: () => {
                toast.success(`Configuration ${config.is_active ? 'deactivated' : 'activated'} successfully!`);
            },
            onError: (errors) => {
                if (typeof errors === 'object') {
                    Object.keys(errors).forEach((field) => {
                        toast.error(errors[field]);
                    });
                }
            },
        });
    };

    const handleToggleLock = (config) => {
        router.post(route('admin.ipcrf.configuration.toggle-lock', config.id), {}, {
            onSuccess: () => {
                toast.success(`Configuration ${config.is_locked ? 'unlocked' : 'locked'} successfully!`);
            },
            onError: (errors) => {
                if (typeof errors === 'object') {
                    Object.keys(errors).forEach((field) => {
                        toast.error(errors[field]);
                    });
                }
            },
        });
    };

    const getTotalObjectives = (objectives) => {
        return objectives.reduce((sum, count) => sum + count, 0);
    };

    return (
        <>
            <Head title="IPCRF Configuration" />
            <Toaster />
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                        <div className="flex items-center gap-2 px-4 w-full justify-between">
                            <div className="flex items-center gap-2">
                                <SidebarTrigger className="-ml-1" />
                                <Separator orientation="vertical" className="mr-2 h-4" />
                                <Breadcrumb>
                                    <BreadcrumbList>
                                        <BreadcrumbItem>
                                            <BreadcrumbPage>IPCRF Configuration</BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </BreadcrumbList>
                                </Breadcrumb>
                            </div>
                            <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700">
                                <Plus className="h-4 w-4 mr-2" />
                                New Configuration
                            </Button>
                        </div>
                    </header>
                    
                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        {/* Background Logo Watermark */}
                        <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-20">
                            <img 
                                src="/pictures/isat.tmp" 
                                alt="ISAT Background" 
                                className="w-[600px] h-[600px] object-contain"
                            />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 space-y-4">
                            {/* Info Card */}
                            <Card className="border-blue-200 bg-blue-50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-blue-900">
                                        <Settings className="h-5 w-5" />
                                        IPCRF Configuration Management
                                    </CardTitle>
                                    <CardDescription className="text-blue-700">
                                        Configure KRAs and Objectives per school year. Changes are year-specific and won't affect previous records.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            {/* Configurations Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>School Year Configurations</CardTitle>
                                    <CardDescription>
                                        Manage KRA and Objective structure for each school year
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {configurations.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Configurations Yet</h3>
                                            <p className="text-gray-600 mb-4">Create your first IPCRF configuration to get started.</p>
                                            <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create Configuration
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>School Year</TableHead>
                                                        <TableHead className="text-center">KRAs</TableHead>
                                                        <TableHead className="text-center">Total Objectives</TableHead>
                                                        <TableHead className="text-center">Status</TableHead>
                                                        <TableHead className="text-center">Lock</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {configurations.map((config) => (
                                                        <TableRow key={config.id}>
                                                            <TableCell className="font-medium">
                                                                {config.school_year}
                                                                {config.submission_start_date && config.submission_end_date && (
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        Submission: {new Date(config.submission_start_date).toLocaleDateString()} - {new Date(config.submission_end_date).toLocaleDateString()}
                                                                    </p>
                                                                )}
                                                                {config.notes && (
                                                                    <p className="text-xs text-gray-500 mt-1">{config.notes}</p>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold">
                                                                    {config.kra_count}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold">
                                                                    {config.selected_objective_ids ? config.selected_objective_ids.length : getTotalObjectives(config.objectives_per_kra)}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleToggleActive(config)}
                                                                    className={config.is_active ? 'border-green-500 text-green-700' : 'border-gray-300'}
                                                                >
                                                                    {config.is_active ? (
                                                                        <>
                                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                                            Active
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <XCircle className="h-3 w-3 mr-1" />
                                                                            Inactive
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleToggleLock(config)}
                                                                    className={config.is_locked ? 'border-red-500 text-red-700' : 'border-gray-300'}
                                                                >
                                                                    {config.is_locked ? (
                                                                        <>
                                                                            <Lock className="h-3 w-3 mr-1" />
                                                                            Locked
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Unlock className="h-3 w-3 mr-1" />
                                                                            Unlocked
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => openEditModal(config)}
                                                                        disabled={config.is_locked}
                                                                        title={config.is_locked ? 'Configuration is locked' : 'Edit configuration'}
                                                                    >
                                                                        <Edit className="h-3 w-3" />
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => openDeleteModal(config)}
                                                                        disabled={config.is_locked}
                                                                        className="text-red-600 hover:text-red-700"
                                                                        title={config.is_locked ? 'Configuration is locked' : 'Delete configuration'}
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Configuration</DialogTitle>
                        <DialogDescription>
                            Select specific objectives from the available options and optionally add custom KRAs/objectives
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                        {/* School Year */}
                        <div className="space-y-2">
                            <Label htmlFor="school_year">School Year</Label>
                            <Input
                                id="school_year"
                                value={formData.school_year}
                                onChange={(e) => setFormData({ ...formData, school_year: e.target.value })}
                                placeholder="e.g., 2024-2025"
                            />
                        </div>

                        {/* Submission Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="submission_start_date">Submission Start Date</Label>
                                <Input
                                    id="submission_start_date"
                                    type="date"
                                    value={formData.submission_start_date}
                                    onChange={(e) => setFormData({ ...formData, submission_start_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="submission_end_date">Submission End Date</Label>
                                <Input
                                    id="submission_end_date"
                                    type="date"
                                    value={formData.submission_end_date}
                                    onChange={(e) => setFormData({ ...formData, submission_end_date: e.target.value })}
                                    min={formData.submission_start_date}
                                />
                            </div>
                        </div>

                        {/* Objective Selection */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">Select Objectives</Label>
                                <div className="flex gap-2">
                                    <Button type="button" size="sm" variant="outline" onClick={handleSelectAllObjectives}>
                                        Select All
                                    </Button>
                                    <Button type="button" size="sm" variant="outline" onClick={handleDeselectAllObjectives}>
                                        Deselect All
                                    </Button>
                                </div>
                            </div>
                            
                            <p className="text-sm text-gray-600">
                                Selected: {formData.selected_objective_ids.length} objective(s)
                            </p>

                            {/* Objectives by KRA */}
                            <div className="border rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
                                {availableKras.map((kra, kraIndex) => (
                                    <div key={kra.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-sm text-green-700 bg-green-50 px-3 py-2 rounded">
                                                KRA {kraIndex + 1}: {kra.name}
                                            </h4>
                                            {kra.is_custom && (
                                                <Button 
                                                    type="button" 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    onClick={() => handleRemoveCustomKra(kra.id)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                        <div className="space-y-2 pl-4">
                                            {kra.objectives && kra.objectives.map((objective) => (
                                                <div key={objective.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                                                    <Checkbox
                                                        id={`obj-${objective.id}`}
                                                        checked={formData.selected_objective_ids.includes(objective.id)}
                                                        onCheckedChange={() => handleObjectiveSelection(objective.id)}
                                                    />
                                                    <label htmlFor={`obj-${objective.id}`} className="text-sm cursor-pointer flex-1">
                                                        <span className="font-medium text-blue-600">{objective.code}</span>
                                                        <span className="text-gray-700"> - {objective.description}</span>
                                                        {objective.is_custom && (
                                                            <>
                                                                <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Custom</span>
                                                                <Button 
                                                                    type="button" 
                                                                    size="sm" 
                                                                    variant="ghost" 
                                                                    onClick={() => handleRemoveCustomObjective(objective.id)}
                                                                    className="ml-2 text-red-600 h-6 w-6 p-0"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Add Custom KRA Button */}
                        <div className="space-y-2">
                            {!showAddKraForm ? (
                                <Button type="button" variant="outline" onClick={() => setShowAddKraForm(true)} className="w-full">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Custom KRA
                                </Button>
                            ) : (
                                <div className="border rounded-lg p-4 space-y-3 bg-purple-50">
                                    <Label>Add Custom KRA</Label>
                                    <Input
                                        placeholder="KRA Name (e.g., Digital Competency)"
                                        value={newKra.name}
                                        onChange={(e) => setNewKra({ ...newKra, name: e.target.value })}
                                    />
                                    <Textarea
                                        placeholder="Description (optional)"
                                        value={newKra.description}
                                        onChange={(e) => setNewKra({ ...newKra, description: e.target.value })}
                                        rows={2}
                                    />
                                    <div className="flex gap-2">
                                        <Button type="button" size="sm" onClick={handleAddCustomKra}>
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add KRA
                                        </Button>
                                        <Button type="button" size="sm" variant="outline" onClick={() => {
                                            setShowAddKraForm(false);
                                            setNewKra({ name: '', description: '' });
                                        }}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Add Custom Objective Button */}
                        <div className="space-y-2">
                            {!showAddObjectiveForm ? (
                                <Button type="button" variant="outline" onClick={() => setShowAddObjectiveForm(true)} className="w-full">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Custom Objective
                                </Button>
                            ) : (
                                <div className="border rounded-lg p-4 space-y-3 bg-blue-50">
                                    <Label>Add Custom Objective</Label>
                                    <div className="space-y-2">
                                        <select
                                            className="w-full border rounded px-3 py-2"
                                            value={newObjective.kra_id}
                                            onChange={(e) => setNewObjective({ ...newObjective, kra_id: e.target.value })}
                                        >
                                            <option value="">Select KRA</option>
                                            {availableKras.map((kra, idx) => (
                                                <option key={kra.id} value={kra.id}>
                                                    KRA {idx + 1}: {kra.name}
                                                </option>
                                            ))}
                                        </select>
                                        <Input
                                            placeholder="Objective Code (e.g., 1.5.2)"
                                            value={newObjective.code}
                                            onChange={(e) => setNewObjective({ ...newObjective, code: e.target.value })}
                                        />
                                        <Textarea
                                            placeholder="Objective Description"
                                            value={newObjective.description}
                                            onChange={(e) => setNewObjective({ ...newObjective, description: e.target.value })}
                                            rows={2}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Weight (default: 7)"
                                            value={newObjective.weight}
                                            onChange={(e) => setNewObjective({ ...newObjective, weight: e.target.value || '7' })}
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="button" size="sm" onClick={handleAddCustomObjective}>
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add Objective
                                        </Button>
                                        <Button type="button" size="sm" variant="outline" onClick={() => {
                                            setShowAddObjectiveForm(false);
                                            setNewObjective({ kra_id: '', code: '', description: '', weight: '7' });
                                        }}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Selected Objectives Preview */}
                        {formData.selected_objective_ids.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-base font-semibold">Selected Objectives Preview (Auto-numbered)</Label>
                                <div className="border rounded-lg p-4 bg-green-50 max-h-48 overflow-y-auto">
                                    <div className="space-y-1">
                                        {getSelectedObjectivesWithNumbers().map((obj) => (
                                            <div key={obj.id} className="text-sm flex gap-2">
                                                <span className="font-bold text-green-700 min-w-[24px]">{obj.displayNumber}.</span>
                                                <span className="font-medium text-blue-600">{obj.code}</span>
                                                <span className="text-gray-600">({obj.kraName})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Add any notes about this configuration..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleCreate} 
                            className="bg-green-600 hover:bg-green-700"
                            disabled={formData.selected_objective_ids.length === 0}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Create Configuration
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Configuration</DialogTitle>
                        <DialogDescription>
                            Select specific objectives from the available options and optionally add custom KRAs/objectives
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                        {/* School Year */}
                        <div className="space-y-2">
                            <Label htmlFor="edit_school_year">School Year</Label>
                            <Input
                                id="edit_school_year"
                                value={formData.school_year}
                                onChange={(e) => setFormData({ ...formData, school_year: e.target.value })}
                                placeholder="e.g., 2024-2025"
                            />
                        </div>

                        {/* Submission Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_submission_start_date">Submission Start Date</Label>
                                <Input
                                    id="edit_submission_start_date"
                                    type="date"
                                    value={formData.submission_start_date}
                                    onChange={(e) => setFormData({ ...formData, submission_start_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_submission_end_date">Submission End Date</Label>
                                <Input
                                    id="edit_submission_end_date"
                                    type="date"
                                    value={formData.submission_end_date}
                                    onChange={(e) => setFormData({ ...formData, submission_end_date: e.target.value })}
                                    min={formData.submission_start_date}
                                />
                            </div>
                        </div>

                        {/* Objective Selection */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">Select Objectives</Label>
                                <div className="flex gap-2">
                                    <Button type="button" size="sm" variant="outline" onClick={handleSelectAllObjectives}>
                                        Select All
                                    </Button>
                                    <Button type="button" size="sm" variant="outline" onClick={handleDeselectAllObjectives}>
                                        Deselect All
                                    </Button>
                                </div>
                            </div>
                            
                            <p className="text-sm text-gray-600">
                                Selected: {formData.selected_objective_ids.length} objective(s)
                            </p>

                            {/* Objectives by KRA */}
                            <div className="border rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
                                {availableKras.map((kra, kraIndex) => (
                                    <div key={kra.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-sm text-green-700 bg-green-50 px-3 py-2 rounded">
                                                KRA {kraIndex + 1}: {kra.name}
                                            </h4>
                                            {kra.is_custom && (
                                                <Button 
                                                    type="button" 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    onClick={() => handleRemoveCustomKra(kra.id)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                        <div className="space-y-2 pl-4">
                                            {kra.objectives && kra.objectives.map((objective) => (
                                                <div key={objective.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                                                    <Checkbox
                                                        id={`edit-obj-${objective.id}`}
                                                        checked={formData.selected_objective_ids.includes(objective.id)}
                                                        onCheckedChange={() => handleObjectiveSelection(objective.id)}
                                                    />
                                                    <label htmlFor={`edit-obj-${objective.id}`} className="text-sm cursor-pointer flex-1">
                                                        <span className="font-medium text-blue-600">{objective.code}</span>
                                                        <span className="text-gray-700"> - {objective.description}</span>
                                                        {objective.is_custom && (
                                                            <>
                                                                <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Custom</span>
                                                                <Button 
                                                                    type="button" 
                                                                    size="sm" 
                                                                    variant="ghost" 
                                                                    onClick={() => handleRemoveCustomObjective(objective.id)}
                                                                    className="ml-2 text-red-600 h-6 w-6 p-0"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Add Custom KRA Button */}
                        <div className="space-y-2">
                            {!showAddKraForm ? (
                                <Button type="button" variant="outline" onClick={() => setShowAddKraForm(true)} className="w-full">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Custom KRA
                                </Button>
                            ) : (
                                <div className="border rounded-lg p-4 space-y-3 bg-purple-50">
                                    <Label>Add Custom KRA</Label>
                                    <Input
                                        placeholder="KRA Name (e.g., Digital Competency)"
                                        value={newKra.name}
                                        onChange={(e) => setNewKra({ ...newKra, name: e.target.value })}
                                    />
                                    <Textarea
                                        placeholder="Description (optional)"
                                        value={newKra.description}
                                        onChange={(e) => setNewKra({ ...newKra, description: e.target.value })}
                                        rows={2}
                                    />
                                    <div className="flex gap-2">
                                        <Button type="button" size="sm" onClick={handleAddCustomKra}>
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add KRA
                                        </Button>
                                        <Button type="button" size="sm" variant="outline" onClick={() => {
                                            setShowAddKraForm(false);
                                            setNewKra({ name: '', description: '' });
                                        }}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Add Custom Objective Button */}
                        <div className="space-y-2">
                            {!showAddObjectiveForm ? (
                                <Button type="button" variant="outline" onClick={() => setShowAddObjectiveForm(true)} className="w-full">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Custom Objective
                                </Button>
                            ) : (
                                <div className="border rounded-lg p-4 space-y-3 bg-blue-50">
                                    <Label>Add Custom Objective</Label>
                                    <div className="space-y-2">
                                        <select
                                            className="w-full border rounded px-3 py-2"
                                            value={newObjective.kra_id}
                                            onChange={(e) => setNewObjective({ ...newObjective, kra_id: e.target.value })}
                                        >
                                            <option value="">Select KRA</option>
                                            {availableKras.map((kra, idx) => (
                                                <option key={kra.id} value={kra.id}>
                                                    KRA {idx + 1}: {kra.name}
                                                </option>
                                            ))}
                                        </select>
                                        <Input
                                            placeholder="Objective Code (e.g., 1.5.2)"
                                            value={newObjective.code}
                                            onChange={(e) => setNewObjective({ ...newObjective, code: e.target.value })}
                                        />
                                        <Textarea
                                            placeholder="Objective Description"
                                            value={newObjective.description}
                                            onChange={(e) => setNewObjective({ ...newObjective, description: e.target.value })}
                                            rows={2}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Weight (default: 7)"
                                            value={newObjective.weight}
                                            onChange={(e) => setNewObjective({ ...newObjective, weight: e.target.value || '7' })}
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="button" size="sm" onClick={handleAddCustomObjective}>
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add Objective
                                        </Button>
                                        <Button type="button" size="sm" variant="outline" onClick={() => {
                                            setShowAddObjectiveForm(false);
                                            setNewObjective({ kra_id: '', code: '', description: '', weight: '7' });
                                        }}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Selected Objectives Preview */}
                        {formData.selected_objective_ids.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-base font-semibold">Selected Objectives Preview (Auto-numbered)</Label>
                                <div className="border rounded-lg p-4 bg-green-50 max-h-48 overflow-y-auto">
                                    <div className="space-y-1">
                                        {getSelectedObjectivesWithNumbers().map((obj) => (
                                            <div key={obj.id} className="text-sm flex gap-2">
                                                <span className="font-bold text-green-700 min-w-[24px]">{obj.displayNumber}.</span>
                                                <span className="font-medium text-blue-600">{obj.code}</span>
                                                <span className="text-gray-600">({obj.kraName})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="edit_notes">Notes (Optional)</Label>
                            <Textarea
                                id="edit_notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Add any notes about this configuration..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700">
                            <Save className="h-4 w-4 mr-2" />
                            Update Configuration
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Configuration</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the configuration for {selectedConfig?.school_year}?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-red-800">
                                <p className="font-semibold mb-1">Warning</p>
                                <p>This configuration will be permanently deleted. Make sure no submissions exist for this school year.</p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Configuration
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Preview Modal */}
            <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Configuration Preview</DialogTitle>
                        <DialogDescription>
                            Preview of the KRA and Objective structure for {formData.school_year}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        {/* Summary */}
                        <div className="grid grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-1">Total KRAs</p>
                                        <p className="text-3xl font-bold text-blue-600">{formData.kra_count}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-1">Total Objectives</p>
                                        <p className="text-3xl font-bold text-purple-600">
                                            {getTotalObjectives(formData.objectives_per_kra)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600 mb-1">Avg per KRA</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            {(getTotalObjectives(formData.objectives_per_kra) / formData.kra_count).toFixed(1)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Structure */}
                        <div className="space-y-3">
                            {Array.from({ length: formData.kra_count }).map((_, kraIndex) => (
                                <Card key={kraIndex} className="border-2">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center justify-between">
                                            <span>KRA {kraIndex + 1}</span>
                                            <span className="text-sm font-normal text-gray-600">
                                                {formData.objectives_per_kra[kraIndex]} Objectives
                                            </span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-4 gap-2">
                                            {Array.from({ length: formData.objectives_per_kra[kraIndex] }).map((_, objIndex) => (
                                                <div
                                                    key={objIndex}
                                                    className="bg-gray-100 rounded-lg p-2 text-center text-sm font-medium text-gray-700"
                                                >
                                                    Obj {objIndex + 1}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setIsPreviewModalOpen(false)}>
                            Close Preview
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
