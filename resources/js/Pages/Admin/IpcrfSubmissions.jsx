import { AppSidebar } from "@/components/app-sidebar";
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
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
import { FileText, Star } from 'lucide-react';

export default function IpcrfSubmissions({ teachers }) {
    const [reviewingSubmission, setReviewingSubmission] = useState(null);
    const { data, setData, post, processing, reset } = useForm({
        rating: 5,
        feedback: '',
    });

    const submitReview = (e) => {
        e.preventDefault();
        post(route('admin.ipcrf.review', reviewingSubmission.id), {
            onSuccess: () => {
                setReviewingSubmission(null);
                reset();
            },
        });
    };

    return (
        <>
            <Head title="IPCRF Submissions" />
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
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">palitan mo laman nito prince. hindi ganito ui niya</h2>
                            
                            <div className="space-y-6">
                                {teachers.map((teacher) => (
                                    <div key={teacher.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="font-semibold text-lg">{teacher.name}</h3>
                                                <p className="text-sm text-gray-600">{teacher.email}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">
                                                    Submissions: {teacher.teacher_submissions.length}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Reviewed: {teacher.teacher_submissions.filter(s => s.status === 'reviewed').length}
                                                </p>
                                            </div>
                                        </div>

                                        {teacher.teacher_submissions.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Objective</th>
                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">File</th>
                                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Rating</th>
                                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {teacher.teacher_submissions.map((submission) => (
                                                            <tr key={submission.id}>
                                                                <td className="px-4 py-2 text-sm">
                                                                    <span className="font-semibold text-blue-600">
                                                                        {submission.objective?.code}
                                                                    </span>
                                                                    <p className="text-xs text-gray-600 mt-1">
                                                                        {submission.objective?.description.substring(0, 60)}...
                                                                    </p>
                                                                </td>
                                                                <td className="px-4 py-2 text-sm">
                                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                                                                        submission.competency?.type === 'COI' 
                                                                            ? 'bg-blue-100 text-blue-800' 
                                                                            : 'bg-purple-100 text-purple-800'
                                                                    }`}>
                                                                        {submission.competency?.type || 'N/A'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-2 text-center">
                                                                    <a 
                                                                        href={`/storage/${submission.file_path}`} 
                                                                        target="_blank"
                                                                        className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                                                                    >
                                                                        <FileText className="h-4 w-4 mr-1" />
                                                                        View
                                                                    </a>
                                                                </td>
                                                                <td className="px-4 py-2 text-center">
                                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                                                                        submission.status === 'reviewed' 
                                                                            ? 'bg-green-100 text-green-800' 
                                                                            : 'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                        {submission.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-2 text-center">
                                                                    {submission.rating ? (
                                                                        <div className="flex items-center justify-center gap-1">
                                                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                                            <span className="font-semibold">{submission.rating}</span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-400 text-xs">Not rated</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-2 text-center">
                                                                    {submission.status !== 'reviewed' && (
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => setReviewingSubmission(submission)}
                                                                        >
                                                                            Review
                                                                        </Button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-center text-gray-500 py-4">No submissions yet</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>

            {/* Review Modal */}
            {reviewingSubmission && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Review Submission</h3>
                        <form onSubmit={submitReview}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rating (1-5)
                                    </label>
                                    <select
                                        value={data.rating}
                                        onChange={(e) => setData('rating', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="5">5 - Outstanding</option>
                                        <option value="4">4 - Very Satisfactory</option>
                                        <option value="3">3 - Satisfactory</option>
                                        <option value="2">2 - Unsatisfactory</option>
                                        <option value="1">1 - Poor</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Feedback (Optional)
                                    </label>
                                    <textarea
                                        value={data.feedback}
                                        onChange={(e) => setData('feedback', e.target.value)}
                                        rows="4"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Provide feedback for the teacher..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button type="submit" disabled={processing} className="flex-1">
                                    {processing ? 'Submitting...' : 'Submit Review'}
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setReviewingSubmission(null)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
