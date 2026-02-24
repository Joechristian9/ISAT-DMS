import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Upload, FileText, Trash2, X, ZoomIn, ZoomOut, Download } from 'lucide-react';
import TeacherLayout from '@/Layouts/TeacherLayout';

export default function TeacherIpcrf({ kras, submissions, schoolYear, user }) {
    const [uploadingFor, setUploadingFor] = useState(null);
    const [currentKraIndex, setCurrentKraIndex] = useState(0);
    const [viewingPdf, setViewingPdf] = useState(null);
    const [pdfZoom, setPdfZoom] = useState(100);
    const { data, setData, post, processing, errors, reset } = useForm({
        objective_id: '',
        competency_id: '',
        file: null,
        notes: '',
        school_year: schoolYear,
    });

    const handleFileUpload = (objectiveId, competencyId = null) => {
        setUploadingFor({ objectiveId, competencyId });
        setData({
            objective_id: objectiveId,
            competency_id: competencyId,
            file: null,
            notes: '',
            school_year: schoolYear,
        });
    };

    const submitFile = (e) => {
        e.preventDefault();
        post(route('teacher.ipcrf.upload'), {
            onSuccess: () => {
                setUploadingFor(null);
                reset();
            },
        });
    };

    const deleteSubmission = (submissionId) => {
        if (confirm('Are you sure you want to delete this file?')) {
            router.delete(route('teacher.ipcrf.delete', submissionId));
        }
    };

    const getSubmission = (objectiveId, competencyId = null) => {
        if (competencyId === null) {
            // Looking for objective submission (no competency)
            const key = objectiveId + '_obj';
            return submissions[key];
        } else {
            // Looking for competency submission
            const key = objectiveId + '_' + competencyId;
            return submissions[key];
        }
    };

    const nextKra = () => {
        if (currentKraIndex < kras.length - 1) {
            setCurrentKraIndex(currentKraIndex + 1);
        }
    };

    const prevKra = () => {
        if (currentKraIndex > 0) {
            setCurrentKraIndex(currentKraIndex - 1);
        }
    };

    const currentKra = kras[currentKraIndex];
    
    // Calculate global index for current KRA
    let globalStartIndex = 0;
    for (let i = 0; i < currentKraIndex; i++) {
        globalStartIndex += kras[i].objectives.length;
    }

    return (
        <TeacherLayout user={user}>
            <Head title="IPCRF Tool" />
            
            <div className="min-h-screen">
                {/* Page Header */}
                <div className="bg-white/95 backdrop-blur-lg shadow-sm border-b border-green-100 lg:sticky lg:top-0 z-30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-green-600 rounded-full blur opacity-25"></div>
                                <img 
                                    src="/pictures/isat.tmp" 
                                    alt="ISAT" 
                                    className="relative h-16 w-16 rounded-full object-cover ring-2 ring-white shadow-lg"
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-600">OFFICIAL ELECTRONIC IPCRF TOOL v4.3</h1>
                                <p className="text-sm text-gray-600 font-medium">Proficient Regular Teacher - SY {schoolYear}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Teacher Information Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-green-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <label className="text-sm font-semibold text-gray-700 w-40">SY:</label>
                                    <span className="text-sm text-red-600 font-semibold">{schoolYear}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="text-sm font-semibold text-gray-700 w-40">Teacher Type:</label>
                                    <span className="text-sm text-red-600 font-semibold">Regular Teacher</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="text-sm font-semibold text-gray-700 w-40">Select Career Stage:</label>
                                    <span className="text-sm text-blue-600 font-semibold">Proficient</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <label className="text-sm font-semibold text-gray-700 w-40">Objectives:</label>
                                    <input 
                                        type="text" 
                                        value="14"
                                        readOnly
                                        className="w-24 px-3 py-1 text-sm border border-gray-300 rounded bg-gray-50"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="text-sm font-semibold text-gray-700 w-40">No. Classroom Observations:</label>
                                    <input 
                                        type="text" 
                                        placeholder=""
                                        className="w-24 px-3 py-1 text-sm border border-gray-300 rounded"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="text-sm font-semibold text-gray-700 w-40">MS Office version:</label>
                                    <span className="text-sm text-red-600 font-semibold">Supported</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KRA Navigation */}
                    <div className="bg-white/95 backdrop-blur-lg rounded-xl shadow-lg p-4 mb-4 border border-green-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <h3 className="text-lg font-bold text-gray-900">
                                    KRA {currentKraIndex + 1} of {kras.length}: <span className="text-green-600">{currentKra.name}</span>
                                </h3>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={prevKra}
                                    disabled={currentKraIndex === 0}
                                    variant="outline"
                                    size="sm"
                                    className="border-green-200 hover:bg-green-50 hover:text-green-700 disabled:opacity-50"
                                >
                                    ← Previous KRA
                                </Button>
                                <Button
                                    onClick={nextKra}
                                    disabled={currentKraIndex === kras.length - 1}
                                    variant="outline"
                                    size="sm"
                                    className="border-green-200 hover:bg-green-50 hover:text-green-700 disabled:opacity-50"
                                >
                                    Next KRA →
                                </Button>
                            </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                            {kras.map((kra, index) => (
                                <button
                                    key={kra.id}
                                    onClick={() => setCurrentKraIndex(index)}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                                        index === currentKraIndex
                                            ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg scale-105 ring-2 ring-green-400'
                                            : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-700 hover:shadow border border-gray-200'
                                    }`}
                                >
                                    KRA {index + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* IPCRF Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden border-2 border-gray-300">
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse">
                                <thead className="bg-green-600">
                                    <tr>
                                        <th className="px-3 py-2 text-center text-xs font-bold text-white uppercase border-2 border-gray-400 w-32">
                                            KRA
                                        </th>
                                        <th className="px-3 py-2 text-center text-xs font-bold text-white uppercase border-2 border-gray-400 w-12">
                                            
                                        </th>
                                        <th className="px-3 py-2 text-center text-xs font-bold text-white uppercase border-2 border-gray-400 w-16">
                                            
                                        </th>
                                        <th className="px-3 py-2 text-center text-xs font-bold text-white uppercase border-2 border-gray-400">
                                            Objective
                                        </th>
                                        <th className="px-3 py-2 text-center text-xs font-bold text-white uppercase border-2 border-gray-400 w-32">
                                            Objective Upload
                                        </th>
                                        <th className="px-3 py-2 text-center text-xs font-bold text-white uppercase border-2 border-gray-400 w-24">
                                            COI/NCOI
                                        </th>
                                        <th className="px-3 py-2 text-center text-xs font-bold text-white uppercase border-2 border-gray-400 w-32">
                                            COI/NCOI Upload
                                        </th>
                                        <th className="px-3 py-2 text-center text-xs font-bold text-white uppercase border-2 border-gray-400 w-20">
                                            Weight
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {currentKra.objectives.map((objective, objIndex) => {
                                        const globalIndex = globalStartIndex + objIndex + 1;
                                        const objectiveSubmission = getSubmission(objective.id, null);
                                        const competency = objective.competencies[0];
                                        const competencySubmission = competency ? getSubmission(objective.id, competency.id) : null;
                                        
                                        // Check if both submissions are reviewed
                                        const isObjectiveReviewed = objectiveSubmission?.status === 'reviewed';
                                        const isCompetencyReviewed = competencySubmission?.status === 'reviewed';
                                        const showDetails = isObjectiveReviewed && isCompetencyReviewed;
                                        
                                        const isLastInKra = objIndex === currentKra.objectives.length - 1;
                                        
                                        return (
                                            <tr key={objective.id} className="hover:bg-gray-50">
                                                {objIndex === 0 && (
                                                    <td 
                                                        rowSpan={currentKra.objectives.length} 
                                                        className="px-3 py-2 text-xs font-semibold text-gray-900 bg-green-50 border-l-2 border-r-2 border-t-2 border-gray-400 align-top"
                                                        style={{ borderBottom: '2px solid rgb(156, 163, 175)' }}
                                                    >
                                                        <div className="font-bold mb-1">{currentKraIndex + 1}. {currentKra.name}</div>
                                                    </td>
                                                )}
                                                <td className={`px-3 py-2 text-sm text-gray-900 text-center border-l-2 border-r-2 border-gray-400 font-bold ${isLastInKra ? 'border-b-2' : ''} ${objIndex === 0 ? 'border-t-2' : ''}`}>
                                                    {globalIndex}
                                                </td>
                                                <td className={`px-3 py-2 text-xs text-center border-l-2 border-r-2 border-gray-400 font-bold text-blue-700 ${isLastInKra ? 'border-b-2' : ''} ${objIndex === 0 ? 'border-t-2' : ''}`}>
                                                    {objective.code}
                                                </td>
                                                <td className={`px-3 py-2 text-xs text-gray-700 border-l-2 border-r-2 border-gray-400 ${isLastInKra ? 'border-b-2' : ''} ${objIndex === 0 ? 'border-t-2' : ''}`}>
                                                    {objective.description}
                                                </td>
                                                
                                                {/* Objective Upload Column */}
                                                <td className={`px-3 py-2 text-center border-l-2 border-r-2 border-gray-400 bg-gray-50 ${isLastInKra ? 'border-b-2' : ''} ${objIndex === 0 ? 'border-t-2' : ''}`}>
                                                    {objectiveSubmission ? (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <button
                                                                onClick={() => setViewingPdf({ path: objectiveSubmission.file_path, title: 'Objective Evidence' })}
                                                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                                <span className="text-xs">View PDF</span>
                                                            </button>
                                                            {isObjectiveReviewed && objectiveSubmission.rating && (
                                                                <span className="text-xs text-green-600 font-semibold">
                                                                    ★ {objectiveSubmission.rating}
                                                                </span>
                                                            )}
                                                            {objectiveSubmission.status === 'submitted' && (
                                                                <span className="text-xs text-yellow-600 font-medium">Pending</span>
                                                            )}
                                                            {objectiveSubmission.status === 'pending' && (
                                                                <button
                                                                    onClick={() => deleteSubmission(objectiveSubmission.id)}
                                                                    className="text-red-600 hover:text-red-800 text-xs mt-1"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleFileUpload(objective.id, null)}
                                                            className="text-xs h-7"
                                                        >
                                                            <Upload className="h-3 w-3 mr-1" />
                                                            Upload
                                                        </Button>
                                                    )}
                                                </td>
                                                
                                                {/* COI/NCOI Type Column */}
                                                <td className={`px-3 py-2 text-xs text-center border-l-2 border-r-2 border-gray-400 ${isLastInKra ? 'border-b-2' : ''} ${objIndex === 0 ? 'border-t-2' : ''}`}>
                                                    {showDetails ? (
                                                        <span className={`inline-flex px-2 py-1 text-xs font-bold rounded ${
                                                            competency?.type === 'COI' 
                                                                ? 'bg-blue-100 text-blue-800' 
                                                                : 'bg-purple-100 text-purple-800'
                                                        }`}>
                                                            {competency?.type || 'N/A'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </td>
                                                
                                                {/* COI/NCOI Upload Column */}
                                                <td className={`px-3 py-2 text-center border-l-2 border-r-2 border-gray-400 bg-gray-50 ${isLastInKra ? 'border-b-2' : ''} ${objIndex === 0 ? 'border-t-2' : ''}`}>
                                                    {competency ? (
                                                        competencySubmission ? (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <button
                                                                    onClick={() => setViewingPdf({ path: competencySubmission.file_path, title: 'COI/NCOI Evidence' })}
                                                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                                >
                                                                    <FileText className="h-4 w-4" />
                                                                    <span className="text-xs">View PDF</span>
                                                                </button>
                                                                {isCompetencyReviewed && competencySubmission.rating && (
                                                                    <span className="text-xs text-green-600 font-semibold">
                                                                        ★ {competencySubmission.rating}
                                                                    </span>
                                                                )}
                                                                {competencySubmission.status === 'submitted' && (
                                                                    <span className="text-xs text-yellow-600 font-medium">Pending</span>
                                                                )}
                                                                {competencySubmission.status === 'pending' && (
                                                                    <button
                                                                        onClick={() => deleteSubmission(competencySubmission.id)}
                                                                        className="text-red-600 hover:text-red-800 text-xs mt-1"
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleFileUpload(objective.id, competency.id)}
                                                                className="text-xs h-7"
                                                            >
                                                                <Upload className="h-3 w-3 mr-1" />
                                                                Upload
                                                            </Button>
                                                        )
                                                    ) : (
                                                        <span className="text-xs text-gray-400">N/A</span>
                                                    )}
                                                </td>
                                                
                                                {/* Weight Column */}
                                                <td className={`px-3 py-2 text-xs text-gray-900 text-center font-bold border-l-2 border-r-2 border-gray-400 ${isLastInKra ? 'border-b-2' : ''} ${objIndex === 0 ? 'border-t-2' : ''}`}>
                                                    {showDetails ? (
                                                        <span>{objective.weight}%</span>
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    <tr className="bg-green-100">
                                        <td colSpan="7" className="px-3 py-3 text-right text-sm font-bold text-gray-900 border-2 border-gray-400">
                                            TOTAL
                                        </td>
                                        <td className="px-3 py-3 text-center text-sm font-bold text-gray-900 border-2 border-gray-400">
                                            {/* Calculate total only for reviewed items */}
                                            {(() => {
                                                let total = 0;
                                                kras.forEach(kra => {
                                                    kra.objectives.forEach(obj => {
                                                        const objSub = getSubmission(obj.id, null);
                                                        const comp = obj.competencies[0];
                                                        const compSub = comp ? getSubmission(obj.id, comp.id) : null;
                                                        if (objSub?.status === 'reviewed' && compSub?.status === 'reviewed') {
                                                            total += parseFloat(obj.weight);
                                                        }
                                                    });
                                                });
                                                return total > 0 ? `${total.toFixed(2)}%` : '-';
                                            })()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>

                {/* PDF Viewer Modal */}
                {viewingPdf && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    {viewingPdf.title}
                                </h3>
                                <div className="flex items-center gap-3">
                                    {/* Zoom Controls */}
                                    <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
                                        <button
                                            onClick={() => setPdfZoom(Math.max(50, pdfZoom - 10))}
                                            className="text-white hover:text-green-100 transition-colors"
                                            title="Zoom Out"
                                        >
                                            <ZoomOut className="h-4 w-4" />
                                        </button>
                                        <span className="text-white font-semibold text-sm min-w-[50px] text-center">
                                            {pdfZoom}%
                                        </span>
                                        <button
                                            onClick={() => setPdfZoom(Math.min(200, pdfZoom + 10))}
                                            className="text-white hover:text-green-100 transition-colors"
                                            title="Zoom In"
                                        >
                                            <ZoomIn className="h-4 w-4" />
                                        </button>
                                    </div>
                                    
                                    {/* Download Button */}
                                    <a
                                        href={`/storage/${viewingPdf.path}`}
                                        download
                                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span className="text-sm font-medium">Download</span>
                                    </a>
                                    
                                    {/* Close Button */}
                                    <button
                                        onClick={() => {
                                            setViewingPdf(null);
                                            setPdfZoom(100);
                                        }}
                                        className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
                                        title="Close"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* PDF Viewer */}
                            <div className="flex-1 overflow-auto bg-gray-100 p-4">
                                <div className="flex justify-center">
                                    <iframe
                                        src={`/storage/${viewingPdf.path}`}
                                        className="bg-white shadow-lg rounded-lg"
                                        style={{
                                            width: `${pdfZoom}%`,
                                            minWidth: '100%',
                                            height: '100%',
                                            minHeight: '800px',
                                            border: 'none'
                                        }}
                                        title="PDF Viewer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upload Modal */}
                {uploadingFor && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold mb-2">Upload PDF File</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                {uploadingFor.competencyId 
                                    ? 'Uploading for: COI/NCOI Evidence' 
                                    : 'Uploading for: Objective Evidence'}
                            </p>
                            <form onSubmit={submitFile}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select PDF File (Max 10MB)
                                        </label>
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => setData('file', e.target.files[0])}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            required
                                        />
                                        {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notes (Optional)
                                        </label>
                                        <textarea
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            rows="3"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Add any notes about this submission..."
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <Button type="submit" disabled={processing} className="flex-1">
                                        {processing ? 'Uploading...' : 'Upload'}
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => setUploadingFor(null)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </TeacherLayout>
    );
}
