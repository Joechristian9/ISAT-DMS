import { AppSidebar } from "@/components/app-sidebar";
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { Search, Plus, Eye, FileDown, ChevronDown, ChevronUp } from 'lucide-react';

export default function IpcrfSubmissions({ teachers, availableYears, kras, filters, flash }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedYear, setSelectedYear] = useState(filters.year || '');
    const [isAddRatingModalOpen, setIsAddRatingModalOpen] = useState(false);
    const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [selectedRating, setSelectedRating] = useState(null);
    const [expandedRows, setExpandedRows] = useState([]);

    // Show flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Form for adding rating
    const ratingForm = useForm({
        teacher_id: '',
        rating_period: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
        kra_details: [],
        remarks: '',
    });

    // Handle search
    const handleSearch = () => {
        router.get(route('admin.ipcrf.submissions'), {
            search: searchTerm,
            status: selectedStatus,
            year: selectedYear,
        }, {
            preserveState: true,
        });
    };

    // Handle add rating
    const handleAddRating = (e) => {
        e.preventDefault();
        
        // Validate KRA details
        if (ratingForm.data.kra_details.length === 0) {
            toast.error('Please add at least one KRA rating');
            return;
        }

        ratingForm.post(route('admin.ipcrf.rating.store'), {
            onSuccess: () => {
                setIsAddRatingModalOpen(false);
                ratingForm.reset();
                setSelectedTeacher(null);
            },
            onError: () => {
                toast.error('Failed to create rating. Please check the form.');
            },
        });
    };

    // Open add rating modal
    const openAddRatingModal = (teacher) => {
        setSelectedTeacher(teacher);
        
        // Initialize KRA details with empty ratings
        const kraDetails = kras.map(kra => ({
            kra_id: kra.id,
            kra_name: kra.name,
            objectives: kra.objectives.map(obj => ({
                objective_id: obj.id,
                objective_code: obj.code,
                objective_description: obj.description,
                rating: 3,
                score: 0,
            })),
            average_rating: 0,
            score: 0,
        }));

        ratingForm.setData({
            teacher_id: teacher.id,
            rating_period: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
            kra_details: kraDetails,
            remarks: '',
        });
        
        setIsAddRatingModalOpen(true);
    };

    // Update objective rating
    const updateObjectiveRating = (kraIndex, objIndex, rating) => {
        const newKraDetails = [...ratingForm.data.kra_details];
        newKraDetails[kraIndex].objectives[objIndex].rating = parseInt(rating);
        
        // Calculate score (rating * weight)
        const weight = kras[kraIndex].objectives[objIndex].weight;
        newKraDetails[kraIndex].objectives[objIndex].score = (parseInt(rating) * weight) / 5;
        
        // Calculate KRA average and score
        const objectives = newKraDetails[kraIndex].objectives;
        const totalScore = objectives.reduce((sum, obj) => sum + obj.score, 0);
        const avgRating = objectives.reduce((sum, obj) => sum + obj.rating, 0) / objectives.length;
        
        newKraDetails[kraIndex].score = totalScore;
        newKraDetails[kraIndex].average_rating = avgRating;
        
        ratingForm.setData('kra_details', newKraDetails);
    };

    // Calculate total score
    const calculateTotalScore = () => {
        return ratingForm.data.kra_details.reduce((sum, kra) => sum + kra.score, 0);
    };

    // Get status badge color
    const getStatusBadge = (status) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800',
            submitted: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
        };
        return colors[status] || colors.draft;
    };

    // Toggle row expansion
    const toggleRowExpansion = (teacherId) => {
        setExpandedRows(prev => 
            prev.includes(teacherId) 
                ? prev.filter(id => id !== teacherId)
                : [...prev, teacherId]
        );
    };

    // View rating details
    const viewRatingDetails = (rating) => {
        setSelectedRating(rating);
        setIsViewDetailsModalOpen(true);
    };

    return (
        <>
            <Head title="IPCRF Submissions" />
            <Toaster />
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mr-2 h-4" />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>IPCRF Submissions</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                    </header>
                    
                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        {/* Background Logo Watermark */}
                        <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-20">
                            <img 
                                src="/pictures/isat.jpg" 
                                alt="ISAT Background" 
                                className="w-[600px] h-[600px] object-contain"
                            />
                        </div>

                        {/* Content */}
                        <div className="relative z-10">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-2xl font-semibold mb-6">IPCRF Submissions</h2>
                                
                                {/* Search and Filter Section */}
                                <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
                                    <div className="flex-1">
                                        <Label htmlFor="search">Search by Teacher Name</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="search"
                                                placeholder="Search teachers..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                            />
                                            <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700">
                                                <Search className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full md:w-48">
                                        <Label htmlFor="status">Filter by Status</Label>
                                        <Select value={selectedStatus || "all"} onValueChange={(value) => {
                                            const filterValue = value === "all" ? "" : value;
                                            setSelectedStatus(filterValue);
                                            router.get(route('admin.ipcrf.submissions'), {
                                                search: searchTerm,
                                                status: filterValue,
                                                year: selectedYear,
                                            }, {
                                                preserveState: true,
                                            });
                                        }}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="submitted">Submitted</SelectItem>
                                                <SelectItem value="approved">Approved</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="w-full md:w-48">
                                        <Label htmlFor="year">Filter by Year</Label>
                                        <Select value={selectedYear || "all"} onValueChange={(value) => {
                                            const filterValue = value === "all" ? "" : value;
                                            setSelectedYear(filterValue);
                                            router.get(route('admin.ipcrf.submissions'), {
                                                search: searchTerm,
                                                status: selectedStatus,
                                                year: filterValue,
                                            }, {
                                                preserveState: true,
                                            });
                                        }}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Years" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Years</SelectItem>
                                                {availableYears.map((year) => (
                                                    <SelectItem key={year} value={year}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Teachers Table */}
                                <div className="rounded-md border overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12"></TableHead>
                                                <TableHead>Teacher Name</TableHead>
                                                <TableHead>Position</TableHead>
                                                <TableHead className="text-center">Rating</TableHead>
                                                <TableHead className="text-center">Year</TableHead>
                                                <TableHead className="text-center">Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {teachers.data.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                                        No teachers found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                teachers.data.map((teacher) => {
                                                    const latestRating = teacher.ipcrf_ratings?.[0];
                                                    const isExpanded = expandedRows.includes(teacher.id);
                                                    
                                                    return (
                                                        <>
                                                            <TableRow key={teacher.id}>
                                                                <TableCell>
                                                                    {teacher.ipcrf_ratings?.length > 0 && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="h-6 w-6 p-0"
                                                                            onClick={() => toggleRowExpansion(teacher.id)}
                                                                        >
                                                                            {isExpanded ? (
                                                                                <ChevronUp className="h-4 w-4" />
                                                                            ) : (
                                                                                <ChevronDown className="h-4 w-4" />
                                                                            )}
                                                                        </Button>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="font-medium">{teacher.name}</TableCell>
                                                                <TableCell>
                                                                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700">
                                                                        {teacher.current_position?.name || 'No Position'}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    {latestRating ? (
                                                                        <span className="font-semibold text-lg">
                                                                            {latestRating.numerical_rating?.toFixed(2) || 'N/A'}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-gray-400 text-sm">No rating</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    {latestRating?.rating_period || '-'}
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    {latestRating ? (
                                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(latestRating.status)}`}>
                                                                            {latestRating.status}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-gray-400 text-sm">-</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <div className="flex gap-2 justify-end">
                                                                        <Button
                                                                            size="sm"
                                                                            className="bg-green-600 hover:bg-green-700"
                                                                            onClick={() => openAddRatingModal(teacher)}
                                                                        >
                                                                            <Plus className="h-3 w-3 mr-1" />
                                                                            Rate
                                                                        </Button>
                                                                        {latestRating && (
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => viewRatingDetails(latestRating)}
                                                                            >
                                                                                <Eye className="h-3 w-3 mr-1" />
                                                                                View
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                            
                                                            {/* Expanded Row - Show all ratings */}
                                                            {isExpanded && teacher.ipcrf_ratings?.length > 0 && (
                                                                <TableRow>
                                                                    <TableCell colSpan={7} className="bg-gray-50">
                                                                        <div className="p-4">
                                                                            <h4 className="font-semibold mb-3">Rating History</h4>
                                                                            <div className="space-y-2">
                                                                                {teacher.ipcrf_ratings.map((rating) => (
                                                                                    <div key={rating.id} className="flex items-center justify-between p-3 bg-white rounded border">
                                                                                        <div className="flex items-center gap-4">
                                                                                            <span className="font-medium">{rating.rating_period}</span>
                                                                                            <span className="text-lg font-semibold text-blue-600">
                                                                                                {rating.numerical_rating?.toFixed(2)}
                                                                                            </span>
                                                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(rating.status)}`}>
                                                                                                {rating.status}
                                                                                            </span>
                                                                                        </div>
                                                                                        <Button
                                                                                            size="sm"
                                                                                            variant="outline"
                                                                                            onClick={() => viewRatingDetails(rating)}
                                                                                        >
                                                                                            <Eye className="h-3 w-3 mr-1" />
                                                                                            View Details
                                                                                        </Button>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                        </>
                                                    );
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {teachers.links.length > 3 && (
                                    <div className="flex justify-center gap-2 mt-4">
                                        {teachers.links.map((link, index) => (
                                            <Button
                                                key={index}
                                                variant={link.active ? "default" : "outline"}
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.get(link.url)}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>

            {/* Rate Modal */}
            <Dialog open={isAddRatingModalOpen} onOpenChange={setIsAddRatingModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Rate IPCRF - {selectedTeacher?.name}</DialogTitle>
                        <DialogDescription>
                            Rate each objective on a scale of 1-5
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddRating}>
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="rating_period">Rating Period</Label>
                                    <Input
                                        id="rating_period"
                                        value={ratingForm.data.rating_period}
                                        onChange={(e) => ratingForm.setData('rating_period', e.target.value)}
                                        placeholder="e.g., 2024-2025"
                                        required
                                    />
                                </div>
                            </div>

                            {/* KRA Ratings */}
                            {ratingForm.data.kra_details.map((kra, kraIndex) => (
                                <div key={kra.kra_id} className="border rounded-lg p-4">
                                    <h3 className="font-semibold text-lg mb-3">{kra.kra_name}</h3>
                                    <div className="space-y-3">
                                        {kra.objectives.map((obj, objIndex) => (
                                            <div key={obj.objective_id} className="flex items-center gap-4 p-2 bg-gray-50 rounded">
                                                <div className="flex-1">
                                                    <span className="font-medium text-sm text-blue-600">{obj.objective_code}</span>
                                                    <p className="text-sm text-gray-600">{obj.objective_description.substring(0, 80)}...</p>
                                                </div>
                                                <div className="w-32">
                                                    <Select
                                                        value={obj.rating.toString()}
                                                        onValueChange={(value) => updateObjectiveRating(kraIndex, objIndex, value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="5">5 - Outstanding</SelectItem>
                                                            <SelectItem value="4">4 - Very Satisfactory</SelectItem>
                                                            <SelectItem value="3">3 - Satisfactory</SelectItem>
                                                            <SelectItem value="2">2 - Unsatisfactory</SelectItem>
                                                            <SelectItem value="1">1 - Poor</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="w-20 text-right">
                                                    <span className="font-semibold">{obj.score.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 pt-3 border-t flex justify-between items-center">
                                        <span className="font-semibold">KRA Average:</span>
                                        <span className="text-lg font-bold text-blue-600">{kra.average_rating.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}

                            {/* Total Score */}
                            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold">Total Score:</span>
                                    <span className="text-2xl font-bold text-green-600">{calculateTotalScore().toFixed(2)}</span>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="remarks">Remarks (Optional)</Label>
                                <textarea
                                    id="remarks"
                                    value={ratingForm.data.remarks}
                                    onChange={(e) => ratingForm.setData('remarks', e.target.value)}
                                    rows="3"
                                    className="w-full rounded-md border border-gray-300 p-2"
                                    placeholder="Add any remarks or comments..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddRatingModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={ratingForm.processing} className="bg-green-600 hover:bg-green-700">
                                {ratingForm.processing ? 'Saving...' : 'Save Rating'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Details Modal */}
            <Dialog open={isViewDetailsModalOpen} onOpenChange={setIsViewDetailsModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>IPCRF Rating Details</DialogTitle>
                        <DialogDescription>
                            Rating Period: {selectedRating?.rating_period}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRating && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Numerical Rating</p>
                                    <p className="text-2xl font-bold text-blue-600">{selectedRating.numerical_rating?.toFixed(2)}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Total Score</p>
                                    <p className="text-2xl font-bold text-green-600">{selectedRating.total_score?.toFixed(2)}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Status</p>
                                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded mt-2 ${getStatusBadge(selectedRating.status)}`}>
                                        {selectedRating.status}
                                    </span>
                                </div>
                            </div>

                            {/* KRA Details */}
                            {selectedRating.kra_details?.map((kra, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <h3 className="font-semibold text-lg mb-3">{kra.kra_name}</h3>
                                    <div className="space-y-2">
                                        {kra.objectives?.map((obj, objIndex) => (
                                            <div key={objIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <div className="flex-1">
                                                    <span className="font-medium text-sm text-blue-600">{obj.objective_code}</span>
                                                    <p className="text-sm text-gray-600">{obj.objective_description}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm">Rating: <span className="font-semibold">{obj.rating}</span></span>
                                                    <span className="text-sm">Score: <span className="font-semibold">{obj.score?.toFixed(2)}</span></span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 pt-3 border-t flex justify-between items-center">
                                        <span className="font-semibold">KRA Average:</span>
                                        <span className="text-lg font-bold text-blue-600">{kra.average_rating?.toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}

                            {selectedRating.remarks && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Remarks:</p>
                                    <p className="text-sm text-gray-600">{selectedRating.remarks}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewDetailsModalOpen(false)}>
                            Close
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <FileDown className="h-4 w-4 mr-2" />
                            Export PDF
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
