import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { FileText, ArrowLeft, Calendar, User, Briefcase, Award, BookOpen, Star } from 'lucide-react';
import { AppSidebar } from "@/components/app-sidebar";
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
import { Badge } from '@/components/ui/badge';

export default function QuestionnaireDetail({ questionnaire }) {
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Survey questions array (same as teacher form)
    const surveyQuestions = [
        "This DMS platform has much that is of interest to me.",
        "It is easy to move around the platform.",
        "I can quickly find what I want on e-TRACES.",
        "e-TRACES helps me monitor my progress.",
        "It is easy to store, retrieve, and reproduce files using e-TRACES",
        "The files/documents on e-TRACES are very useful",
        "I feel in control when I'm using this DMS platform",
        "This DMS platform is fast when tracing needed documents.",
        "e-TRACES is useful in producing my portfolio.",
        "Learning to find my way around this DMS platform is user-friendly",
        "I like using this DMS platform",
        "I can easily access documents in the e-TRACES contacts anywhere I am as long as there is internet connectivity",
        "I feel efficient when I'm using e-TRACES",
        "The e-TRACES has some simple and attractive features",
        "Using e-TRACES for the first time is easy to operate and control.",
        "The e-TRACES enables pleasing and satisfying interaction for the user",
        "The DMS platform can be used by specified users to achieve specified goals, freedom from risk, and satisfaction in a specified context of use.",
        "The system can delete, edit, and recover uploaded files.",
        "The system ensures that data are accessible only to those authorized to have access.",
        "The system prevents unauthorized access to, or modification of computer, or programs data.",
        "The system can perform its required functions efficiently while sharing a common environment and resources with other documents or files without a detrimental impact to any other files.",
        "e-TRACES is indeed useful to me especially when tracing my loss files.",
        "Using DMS is not a waste of time",
        "e-TRACES can help me manage my documents/files",
        "DMS platform is efficient in providing relevant work files even in the needed personnel is distant",
        "e-TRACES is useful in justifying authenticity of MOVs aligned to IPCR",
        "the DMS platform made my e-portfolio easier",
        "Uploaded MOVs can be monitored easily by the rater using e-TRACES",
        "e-TRACES can serve as devise scheme for peer mentoring, coaching, and evaluation",
        "e-TRACES help rater and ratees in PMES collaboration and feedbacking."
    ];

    const updateStatus = (newStatus) => {
        if (confirm(`Are you sure you want to mark this as ${newStatus}?`)) {
            setIsUpdatingStatus(true);
            router.post(
                route('admin.questionnaire.update-status', questionnaire.id),
                { status: newStatus },
                {
                    preserveScroll: true,
                    onFinish: () => setIsUpdatingStatus(false),
                }
            );
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            draft: 'bg-gray-200 text-gray-800',
            submitted: 'bg-blue-200 text-blue-800',
            reviewed: 'bg-green-200 text-green-800',
        };
        
        const labels = {
            draft: 'Draft',
            submitted: 'Submitted',
            reviewed: 'Reviewed',
        };

        return (
            <Badge className={variants[status]}>
                {labels[status]}
            </Badge>
        );
    };

    const StarDisplay = ({ value }) => {
        if (!value) return <span className="text-sm text-gray-500">Not rated</span>;
        
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                        key={star} 
                        className={`h-5 w-5 ${star <= value ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill={star <= value ? 'currentColor' : 'none'}
                    />
                ))}
                <span className="ml-2 text-sm font-semibold text-gray-700">{value}/5</span>
            </div>
        );
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Head title={`Questionnaire - ${questionnaire.teacher.name}`} />
                
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href={route('admin.questionnaire-results')}>
                                    Questionnaires
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Detail</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <div className="flex-1 p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                    {/* Background Logo Watermark */}
                    <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-20">
                        <img 
                            src="/pictures/isat.tmp" 
                            alt="ISAT Background" 
                            className="w-[600px] h-[600px] object-contain"
                        />
                    </div>

                    {/* Back Button */}
                    <div className="mb-6 relative z-10">
                        <Link
                            href={route('admin.questionnaire-results')}
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Questionnaires
                        </Link>
                    </div>

                    {/* Header Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-blue-200 relative z-10">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Teacher Questionnaire
                                </h1>
                                <p className="text-gray-600">
                                    Submitted by: <span className="font-semibold text-gray-900">{questionnaire.teacher.name}</span>
                                </p>
                                <p className="text-sm text-gray-500">{questionnaire.teacher.email}</p>
                            </div>
                            <div className="text-right">
                                {getStatusBadge(questionnaire.status)}
                                <p className="text-sm text-gray-600 mt-2">
                                    School Year: <span className="font-semibold">{questionnaire.school_year}</span>
                                </p>
                            </div>
                        </div>

                        {/* Status Actions */}
                        {questionnaire.status !== 'reviewed' && (
                            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                                {questionnaire.status === 'draft' && (
                                    <Button
                                        onClick={() => updateStatus('submitted')}
                                        disabled={isUpdatingStatus}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        Mark as Submitted
                                    </Button>
                                )}
                                {questionnaire.status === 'submitted' && (
                                    <Button
                                        onClick={() => updateStatus('reviewed')}
                                        disabled={isUpdatingStatus}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        Mark as Reviewed
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Personal Information */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-200 relative z-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <User className="h-6 w-6 text-blue-600" />
                            Teacher Information
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
                                <p className="text-sm font-semibold text-blue-900 mb-1">Name</p>
                                <p className="text-lg text-blue-700">{questionnaire.name || 'N/A'}</p>
                            </div>
                            
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
                                <p className="text-sm font-semibold text-purple-900 mb-1">Sex</p>
                                <p className="text-lg text-purple-700">{questionnaire.sex || 'N/A'}</p>
                            </div>
                            
                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border-2 border-orange-200">
                                <p className="text-sm font-semibold text-orange-900 mb-1">Years of Service</p>
                                <p className="text-lg text-orange-700">{questionnaire.years_of_service || 'N/A'}</p>
                            </div>
                            
                            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4 border-2 border-teal-200">
                                <p className="text-sm font-semibold text-teal-900 mb-1">Last IPCR Rating</p>
                                <p className="text-lg text-teal-700">{questionnaire.last_ipcr_rating || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Survey Responses */}
                    {questionnaire.responses && Object.keys(questionnaire.responses).length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-200 relative z-10">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Star className="h-6 w-6 text-yellow-600" />
                                Survey Responses
                            </h2>
                            
                            <div className="space-y-3">
                                {Object.entries(questionnaire.responses)
                                    .sort(([keyA], [keyB]) => {
                                        const numA = parseInt(keyA.replace('question_', ''));
                                        const numB = parseInt(keyB.replace('question_', ''));
                                        return numA - numB;
                                    })
                                    .map(([questionKey, rating]) => {
                                        const questionNumber = parseInt(questionKey.replace('question_', ''));
                                        const questionText = surveyQuestions[questionNumber - 1] || 'Question not found';
                                        const ratingLabels = {
                                            5: 'Very Satisfied (VS)',
                                            4: 'Satisfied (S)',
                                            3: 'Neither (N)',
                                            2: 'Dissatisfied (DS)',
                                            1: 'Very Dissatisfied (VD)'
                                        };
                                        
                                        return (
                                            <div key={questionKey} className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border-2 border-yellow-200">
                                                <div className="mb-3">
                                                    <p className="text-xs font-bold text-yellow-800 mb-1">Question {questionNumber}</p>
                                                    <p className="text-sm text-gray-700">{questionText}</p>
                                                </div>
                                                <div className="flex items-center justify-between pt-3 border-t border-yellow-300">
                                                    <span className="text-xs font-semibold text-yellow-900">Rating:</span>
                                                    <div className="flex items-center gap-2">
                                                        <StarDisplay value={rating} />
                                                        <span className="text-sm font-bold text-yellow-900">
                                                            {ratingLabels[rating]} - {rating}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                            
                            {/* Average Rating */}
                            <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-green-900 mb-2">Overall Average Rating</p>
                                    <p className="text-4xl font-bold text-green-700">
                                        {(Object.values(questionnaire.responses).reduce((a, b) => a + b, 0) / Object.keys(questionnaire.responses).length).toFixed(2)} / 5.0
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submission Info */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 relative z-10">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-gray-600" />
                            Submission Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="text-sm font-semibold text-gray-600 mb-1">Created</p>
                                <p className="text-gray-900">{new Date(questionnaire.created_at).toLocaleString()}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="text-sm font-semibold text-gray-600 mb-1">Last Updated</p>
                                <p className="text-gray-900">{new Date(questionnaire.updated_at).toLocaleString()}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="text-sm font-semibold text-gray-600 mb-1">Submitted At</p>
                                <p className="text-gray-900">
                                    {questionnaire.submitted_at 
                                        ? new Date(questionnaire.submitted_at).toLocaleString()
                                        : 'Not submitted yet'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
