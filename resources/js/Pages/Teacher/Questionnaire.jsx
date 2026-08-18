import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Send, FileText, ArrowLeft, Star } from 'lucide-react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Questionnaire({ questionnaire, schoolYear, user }) {
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        school_year: schoolYear,
        name: questionnaire?.name || user.name || '',
        sex: questionnaire?.sex || '',
        years_of_service: questionnaire?.years_of_service || '',
        last_ipcr_rating: questionnaire?.last_ipcr_rating || '',
        responses: questionnaire?.responses || {},
        status: 'draft',
    });

    // e-TRACES DMS Satisfaction Survey Questions (30 items)
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

    const ratingScale = [
        { value: 5, label: 'VS', description: 'Very Satisfied' },
        { value: 4, label: 'S', description: 'Satisfied' },
        { value: 3, label: 'N', description: 'Neither' },
        { value: 2, label: 'DS', description: 'Dissatisfied' },
        { value: 1, label: 'VD', description: 'Very Dissatisfied' }
    ];

    const handleRatingChange = (questionIndex, rating) => {
        setData('responses', {
            ...data.responses,
            [`question_${questionIndex + 1}`]: rating
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Check if all questions are answered
        const totalQuestions = surveyQuestions.length;
        const answeredQuestions = Object.keys(data.responses).length;
        
        if (answeredQuestions < totalQuestions) {
            toast.error(`Please answer all questions. ${answeredQuestions}/${totalQuestions} answered.`);
            return;
        }
        
        if (showSubmitConfirm) {
            setData('status', 'submitted');
            post(route('teacher.questionnaire.store'), {
                onSuccess: () => {
                    toast.success('Thank you! Your feedback has been submitted successfully.');
                    setShowSubmitConfirm(false);
                },
                onError: () => {
                    toast.error('Failed to submit questionnaire. Please try again.');
                }
            });
        } else {
            setShowSubmitConfirm(true);
        }
    };

    const handleSaveDraft = () => {
        setData('status', 'draft');
        post(route('teacher.questionnaire.store'), {
            onSuccess: () => {
                toast.success('Draft saved successfully!');
            },
            onError: () => {
                toast.error('Failed to save draft.');
            }
        });
    };

    const getAnsweredCount = () => {
        return Object.values(data.responses).filter(value => value !== null && value !== undefined && value !== '').length;
    };

    const getProgress = () => {
        return Math.round((getAnsweredCount() / surveyQuestions.length) * 100);
    };

    return (
        <TeacherLayout user={user}>
            <Head title="Teacher Satisfaction Questionnaire" />
            <ToastContainer position="top-right" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
                {/* Background Logo Watermark */}
                <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-10">
                    <img 
                        src="/pictures/isat.tmp" 
                        alt="ISAT Background" 
                        className="w-[800px] h-[800px] object-contain"
                    />
                </div>

                <div className="max-w-5xl mx-auto relative z-10">
                    {/* Back Button */}
                    <Link
                        href={route('teacher.dashboard')}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border-2 border-blue-200">
                        <div className="text-center mb-6">
                            <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                e-TRACES: Teachers Level of Satisfaction and Performance
                            </h1>
                            <p className="text-gray-600">School Year: {schoolYear}</p>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold text-gray-700">
                                    Progress: {getAnsweredCount()}/{surveyQuestions.length} questions
                                </span>
                                <span className="text-sm font-semibold text-blue-600">
                                    {getProgress()}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${getProgress()}%` }}
                                />
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sex</label>
                                    <select
                                        value={data.sex}
                                        onChange={(e) => setData('sex', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Number of years in the service</label>
                                    <select
                                        value={data.years_of_service}
                                        onChange={(e) => setData('years_of_service', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select</option>
                                        <option value="0-5">0-5 years</option>
                                        <option value="6-10">6-10 years</option>
                                        <option value="11-15">11-15 years</option>
                                        <option value="15-20">15-20 years</option>
                                        <option value="20+">longer than 20 years</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last IPCR numerical rating</label>
                                    <input
                                        type="text"
                                        value={data.last_ipcr_rating}
                                        onChange={(e) => setData('last_ipcr_rating', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., 4.5"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-200">
                        <p className="text-gray-700 mb-4">
                            A series of statements are listed below. Each one describes a situation which may be related to a certain extent to what you do or feel. Mark with a <span className="font-bold">✓</span> the option that best applies to how often you engaged in the mentioned activity.
                        </p>
                        <p className="text-gray-700 mb-4">
                            It is important for you to know that this questionnaire is completely independent and that there is not a correct or incorrect answer. The information you provide will be kept confidentially. Thank you very much.
                        </p>
                        
                        {/* Legend - Sticky */}
                        <div className="sticky top-0 z-50 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 border-2 border-yellow-200 shadow-lg mb-4">
                            <p className="font-bold text-gray-900 mb-2">Legend:</p>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                                {ratingScale.map((scale) => (
                                    <div key={scale.value} className="text-center">
                                        <span className="font-bold text-gray-900">{scale.description} ({scale.label})</span>
                                        <span className="block text-gray-600">– {scale.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Survey Questions */}
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border-2 border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Survey Questions</h2>
                            
                            <div className="space-y-6">
                                {surveyQuestions.map((question, index) => (
                                    <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-6 border-2 border-gray-200">
                                        <div className="mb-4">
                                            <p className="font-semibold text-gray-900">
                                                {index + 1}. {question}
                                            </p>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-4">
                                            {ratingScale.map((scale) => (
                                                <label
                                                    key={scale.value}
                                                    className={`flex-1 min-w-[100px] cursor-pointer transition-all ${
                                                        data.responses[`question_${index + 1}`] === scale.value
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-white text-gray-700 hover:bg-blue-50'
                                                    } border-2 ${
                                                        data.responses[`question_${index + 1}`] === scale.value
                                                            ? 'border-blue-600'
                                                            : 'border-gray-300'
                                                    } rounded-lg p-3 text-center`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question_${index + 1}`}
                                                        value={scale.value}
                                                        checked={data.responses[`question_${index + 1}`] === scale.value}
                                                        onChange={() => handleRatingChange(index, scale.value)}
                                                        className="sr-only"
                                                    />
                                                    <div className="font-bold text-lg">{scale.label}</div>
                                                    <div className="text-xs">{scale.value}</div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Confirmation */}
                        {showSubmitConfirm && (
                            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 mb-6">
                                <p className="text-yellow-900 font-semibold mb-4">
                                    ⚠️ Are you sure you want to submit? You won't be able to edit your responses after submission.
                                </p>
                                <div className="flex gap-4">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        Yes, Submit Now
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setShowSubmitConfirm(false)}
                                        className="bg-gray-600 hover:bg-gray-700 text-white"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
                            <div className="flex flex-wrap gap-4 justify-end">
                                <Button
                                    type="button"
                                    onClick={handleSaveDraft}
                                    disabled={processing}
                                    className="bg-gray-600 hover:bg-gray-700 text-white"
                                >
                                    Save Draft
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing || getAnsweredCount() < surveyQuestions.length}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    {showSubmitConfirm ? 'Confirm Submit' : 'Submit Questionnaire'}
                                </Button>
                            </div>
                            {getAnsweredCount() < surveyQuestions.length && (
                                <p className="text-red-600 text-sm mt-2 text-right">
                                    Please answer all questions before submitting
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </TeacherLayout>
    );
}
