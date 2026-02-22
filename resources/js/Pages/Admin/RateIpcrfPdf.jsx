import { AppSidebar } from "@/components/app-sidebar";
import { Head, router, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { ArrowLeft, Save, User, Award, Eye, Star, FileText, Download } from 'lucide-react';

export default function RateIpcrfPdf({ teacher, submissions, auth, flash }) {
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [selectedSubmissionIndex, setSelectedSubmissionIndex] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 5; // Show 5 items per page

    // Show flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Initialize ratings for all submissions
    const [ratings, setRatings] = useState(
        submissions.map(sub => sub.rating || 0)
    );

    // Update rating for a specific submission
    const updateRating = (index, rating) => {
        const newRatings = [...ratings];
        newRatings[index] = rating;
        setRatings(newRatings);
    };

    // Open rating modal
    const openRatingModal = (index) => {
        setSelectedSubmissionIndex(index);
        setIsRatingModalOpen(true);
    };

    // Handle submit all ratings
    const handleSubmit = () => {
        // Validate all submissions are rated
        const unratedCount = ratings.filter(r => r === 0).length;
        if (unratedCount > 0) {
            toast.error(`Please rate all ${submissions.length} submissions before submitting. ${unratedCount} remaining.`);
            return;
        }

        // Prepare data for submission
        const ratingsData = submissions.map((sub, index) => ({
            submission_id: sub.id,
            rating: ratings[index],
        }));

        router.post(route('admin.ipcrf.submissions.rate'), {
            teacher_id: teacher.id,
            ratings: ratingsData,
        }, {
            onSuccess: () => {
                toast.success('Ratings submitted successfully!');
                router.visit(route('admin.ipcrf.submissions'));
            },
            onError: (errors) => {
                Object.keys(errors).forEach((field) => {
                    const errorMessage = Array.isArray(errors[field]) ? errors[field][0] : errors[field];
                    toast.error(errorMessage);
                });
            },
        });
    };

    // Star rating component
    const StarRating = ({ rating, onRate, readonly = false }) => {
        const [hover, setHover] = useState(0);

        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        disabled={readonly}
                        className={`transition-all ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                        onMouseEnter={() => !readonly && setHover(star)}
                        onMouseLeave={() => !readonly && setHover(0)}
                        onClick={() => !readonly && onRate(star)}
                    >
                        <Star
                            className={`h-6 w-6 ${
                                star <= (hover || rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                            }`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    const isTeacher = auth.user.roles?.some(role => role.name === 'teacher');

    // Pagination for unified table
    const [currentTablePage, setCurrentTablePage] = useState(0);
    const tableItemsPerPage = 5;
    const totalTablePages = Math.ceil(submissions.length / tableItemsPerPage);
    
    const paginatedSubmissions = submissions.slice(
        currentTablePage * tableItemsPerPage,
        (currentTablePage + 1) * tableItemsPerPage
    );

    // Selected document for PDF viewer
    const [selectedDocIndex, setSelectedDocIndex] = useState(0);

    return (
        <>
            <Head title={`Rate IPCRF - ${teacher.name}`} />
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
                                        <BreadcrumbLink href={route('admin.ipcrf.submissions')}>
                                            IPCRF Submissions
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>Rate IPCRF</BreadcrumbPage>
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
                            <div className="bg-white rounded-lg shadow">
                                {/* Header */}
                                <div className="border-b bg-gradient-to-r from-green-50 to-blue-50 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Link href={route('admin.ipcrf.submissions')}>
                                                <Button variant="outline" size="sm">
                                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                                    Back
                                                </Button>
                                            </Link>
                                            <div className="h-8 w-px bg-gray-300"></div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900">Rate IPCRF Submissions</h2>
                                                <p className="text-sm text-gray-600">Review and rate teacher's IPCRF documents</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Teacher Info Card */}
                                    <div className="bg-white rounded-lg border-2 border-green-200 p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                                                    <User className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Teacher</p>
                                                    <p className="text-sm font-bold text-gray-900 mt-0.5">{teacher.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                                    <Award className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Position</p>
                                                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                                                        {teacher.current_position?.name || 'No Position'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                                                    <Award className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Submissions</p>
                                                    <p className="text-sm font-bold text-gray-900 mt-0.5">{submissions.length}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
                                                    <Star className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Rated</p>
                                                    <p className="text-sm font-bold text-gray-900 mt-0.5">
                                                        {ratings.filter(r => r > 0).length} / {submissions.length}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="p-6">
                                    {submissions.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submissions Found</h3>
                                            <p className="text-gray-600">This teacher hasn't submitted any IPCRF documents yet.</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Two Column Layout: PDF Left, Table Right */}
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                                                {/* Left Column - PDF Viewer (2/3 width) */}
                                                <div className="lg:col-span-2 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-lg font-semibold text-gray-900">Document Preview</h3>
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-gray-500" />
                                                            <span className="text-sm text-gray-600">
                                                                Document #{selectedDocIndex + 1} of {submissions.length}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* PDF Container - Height matches right column */}
                                                    <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100 shadow-lg">
                                                        <div className="h-[calc(100vh-280px)] min-h-[600px] max-h-[1000px] overflow-y-auto">
                                                            <iframe
                                                                src={`/storage/${submissions[selectedDocIndex].file_path}`}
                                                                className="w-full h-full"
                                                                title="IPCRF Document"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Column - Unified Document Table (1/3 width) */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-lg font-semibold text-gray-900">Documents & Ratings</h3>
                                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                                            {ratings.filter(r => r > 0).length}/{submissions.length} Rated
                                                        </span>
                                                    </div>

                                                    {/* Unified Table */}
                                                    <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full text-sm">
                                                                <thead className="bg-gradient-to-r from-green-50 to-blue-50 border-b-2 border-gray-200">
                                                                    <tr>
                                                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                            #
                                                                        </th>
                                                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                            Document
                                                                        </th>
                                                                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                            Rating
                                                                        </th>
                                                                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                            Actions
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-200">
                                                                    {paginatedSubmissions.map((submission, idx) => {
                                                                        const actualIndex = currentTablePage * tableItemsPerPage + idx;
                                                                        const isSelected = selectedDocIndex === actualIndex;
                                                                        const isRated = ratings[actualIndex] > 0;
                                                                        
                                                                        return (
                                                                            <tr 
                                                                                key={submission.id}
                                                                                onClick={() => setSelectedDocIndex(actualIndex)}
                                                                                className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                                                                                    isSelected ? 'bg-green-50 border-l-4 border-green-500' : ''
                                                                                }`}
                                                                            >
                                                                                {/* Document Number */}
                                                                                <td className="px-3 py-4">
                                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                                                                        isRated ? 'bg-green-600' : 'bg-gray-400'
                                                                                    }`}>
                                                                                        {actualIndex + 1}
                                                                                    </div>
                                                                                </td>

                                                                                {/* Document Info */}
                                                                                <td className="px-3 py-4">
                                                                                    <div className="space-y-1">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <FileText className="h-4 w-4 text-blue-600" />
                                                                                            <p className="font-medium text-gray-900 text-xs">
                                                                                                {submission.objective?.code || 'N/A'}
                                                                                            </p>
                                                                                        </div>
                                                                                        <p className="text-xs text-gray-500 ml-6">
                                                                                            {submission.school_year || 'N/A'}
                                                                                        </p>
                                                                                        {isRated && (
                                                                                            <div className="flex items-center gap-1 ml-6">
                                                                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                                                                                    ✓ Rated
                                                                                                </span>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </td>

                                                                                {/* Rating Stars */}
                                                                                <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                                                                                    <div className="flex flex-col items-center gap-1">
                                                                                        <div className="flex gap-0.5">
                                                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                                                <button
                                                                                                    key={star}
                                                                                                    type="button"
                                                                                                    disabled={isTeacher}
                                                                                                    className={`transition-all ${
                                                                                                        isTeacher ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                                                                                                    }`}
                                                                                                    onClick={() => !isTeacher && updateRating(actualIndex, star)}
                                                                                                >
                                                                                                    <Star
                                                                                                        className={`h-4 w-4 ${
                                                                                                            star <= ratings[actualIndex]
                                                                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                                                                : 'text-gray-300'
                                                                                                        }`}
                                                                                                    />
                                                                                                </button>
                                                                                            ))}
                                                                                        </div>
                                                                                        {isRated && (
                                                                                            <span className="text-xs font-semibold text-gray-700">
                                                                                                {ratings[actualIndex]}/5
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </td>

                                                                                {/* Actions */}
                                                                                <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                                                                                    <div className="flex items-center justify-center">
                                                                                        <Button
                                                                                            size="sm"
                                                                                            variant="outline"
                                                                                            onClick={() => openRatingModal(actualIndex)}
                                                                                            className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700"
                                                                                            title="Open detailed view"
                                                                                        >
                                                                                            <Download className="h-3 w-3" />
                                                                                        </Button>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        {/* Table Pagination */}
                                                        {totalTablePages > 1 && (
                                                            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="text-xs text-gray-600">
                                                                        Showing {currentTablePage * tableItemsPerPage + 1} to{' '}
                                                                        {Math.min((currentTablePage + 1) * tableItemsPerPage, submissions.length)} of{' '}
                                                                        {submissions.length} documents
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => setCurrentTablePage(Math.max(0, currentTablePage - 1))}
                                                                            disabled={currentTablePage === 0}
                                                                            className="h-7 px-3 text-xs"
                                                                        >
                                                                            Previous
                                                                        </Button>
                                                                        <span className="text-xs text-gray-600 font-medium">
                                                                            Page {currentTablePage + 1} of {totalTablePages}
                                                                        </span>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => setCurrentTablePage(Math.min(totalTablePages - 1, currentTablePage + 1))}
                                                                            disabled={currentTablePage === totalTablePages - 1}
                                                                            className="h-7 px-3 text-xs"
                                                                        >
                                                                            Next
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Progress Summary Card */}
                                                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-4 shadow-sm">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                                                                <span className="text-lg font-bold text-blue-600">
                                                                    {submissions.length > 0 
                                                                        ? Math.round((ratings.filter(r => r > 0).length / submissions.length) * 100)
                                                                        : 0}%
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div 
                                                                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                                                                    style={{ 
                                                                        width: `${submissions.length > 0 
                                                                            ? (ratings.filter(r => r > 0).length / submissions.length) * 100
                                                                            : 0}%` 
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2 pt-2">
                                                                <div className="bg-white rounded-lg p-2 text-center">
                                                                    <p className="text-xs text-gray-600">Rated</p>
                                                                    <p className="text-lg font-bold text-green-600">
                                                                        {ratings.filter(r => r > 0).length}
                                                                    </p>
                                                                </div>
                                                                <div className="bg-white rounded-lg p-2 text-center">
                                                                    <p className="text-xs text-gray-600">Pending</p>
                                                                    <p className="text-lg font-bold text-orange-600">
                                                                        {ratings.filter(r => r === 0).length}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Submit Button */}
                                            {!isTeacher && (
                                                <div className="flex items-center justify-end pt-6 border-t mt-6">
                                                    <div className="flex gap-3">
                                                        <Link href={route('admin.ipcrf.submissions')}>
                                                            <Button type="button" variant="outline">
                                                                <ArrowLeft className="h-4 w-4 mr-2" />
                                                                Cancel
                                                            </Button>
                                                        </Link>
                                                        <Button 
                                                            onClick={handleSubmit}
                                                            className="bg-green-600 hover:bg-green-700 px-8"
                                                            disabled={ratings.filter(r => r > 0).length !== submissions.length}
                                                        >
                                                            <Save className="h-4 w-4 mr-2" />
                                                            Submit All Ratings
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>

            {/* Rating Modal */}
            {selectedSubmissionIndex !== null && (
                <Dialog open={isRatingModalOpen} onOpenChange={setIsRatingModalOpen}>
                    <DialogContent className="max-w-5xl max-h-[90vh]">
                        <DialogHeader>
                            <DialogTitle>Rate IPCRF Document #{selectedSubmissionIndex + 1}</DialogTitle>
                            <DialogDescription>
                                Review the document and provide your rating
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                            {/* PDF Viewer in Modal */}
                            <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                                <div className="h-[500px] overflow-y-auto">
                                    <iframe
                                        src={`/storage/${submissions[selectedSubmissionIndex].file_path}`}
                                        className="w-full h-full"
                                        title={`IPCRF Document ${selectedSubmissionIndex + 1}`}
                                    />
                                </div>
                            </div>

                            {/* Document Info in Modal */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Objective:</span>
                                        <p className="font-semibold text-gray-900">
                                            {submissions[selectedSubmissionIndex].objective?.code || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">School Year:</span>
                                        <p className="font-semibold text-gray-900">
                                            {submissions[selectedSubmissionIndex].school_year || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Rating in Modal */}
                            <div className="bg-white border-2 border-green-200 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-1">Your Rating</h4>
                                        <p className="text-sm text-gray-600">Rate this submission from 1 to 5 stars</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <StarRating
                                            rating={ratings[selectedSubmissionIndex]}
                                            onRate={(rating) => updateRating(selectedSubmissionIndex, rating)}
                                            readonly={isTeacher}
                                        />
                                        <span className="text-sm font-semibold text-gray-700">
                                            {ratings[selectedSubmissionIndex] > 0 
                                                ? `${ratings[selectedSubmissionIndex]} / 5 stars` 
                                                : 'Not rated yet'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Pagination in Modal */}
                            <div className="flex justify-center gap-2">
                                {submissions.map((_, index) => (
                                    <Button
                                        key={index}
                                        variant={selectedSubmissionIndex === index ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedSubmissionIndex(index)}
                                        className={`min-w-[40px] ${
                                            selectedSubmissionIndex === index 
                                                ? 'bg-green-600 hover:bg-green-700' 
                                                : ''
                                        }`}
                                    >
                                        {index + 1}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button 
                                variant="outline" 
                                onClick={() => setIsRatingModalOpen(false)}
                            >
                                Close
                            </Button>
                            {!isTeacher && (
                                <Button 
                                    onClick={() => {
                                        setIsRatingModalOpen(false);
                                        toast.success('Rating updated');
                                    }}
                                    className="bg-green-600 hover:bg-green-700"
                                    disabled={ratings[selectedSubmissionIndex] === 0}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Rating
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
