import { AppSidebar } from "@/components/app-sidebar";
import { Head, router } from '@inertiajs/react';
import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
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
import { Search, Plus, Eye, FileDown, ChevronDown, ChevronUp, MoreVertical } from 'lucide-react';

// Lazy load heavy PDF libraries only when needed
const loadPDFLibraries = () => Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
]);

export default function IpcrfSubmissions({ teachers, availableYears, kras, filters, flash }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedYear, setSelectedYear] = useState(filters.year || '');
    const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
    const [selectedRating, setSelectedRating] = useState(null);
    const [expandedRows, setExpandedRows] = useState([]);
    const [openMenuRow, setOpenMenuRow] = useState(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const menuRef = useRef(null);

    // Handle click outside to close menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuRow(null);
            }
        };

        if (openMenuRow !== null) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openMenuRow]);

    // Show flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

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

    // Get status badge color
    const getStatusBadge = (status) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800',
            submitted: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
        };
        return colors[status] || colors.draft;
    };

    // Get rating equivalency
    const getRatingEquivalency = (rating) => {
        const numRating = Number(rating);
        if (numRating >= 4.5) return 'Outstanding';
        if (numRating >= 3.5) return 'Very Satisfactory';
        if (numRating >= 2.5) return 'Satisfactory';
        if (numRating >= 1.5) return 'Unsatisfactory';
        return 'Poor';
    };

    // Get rating color
    const getRatingColor = (rating) => {
        const numRating = Number(rating);
        if (numRating >= 4.5) return 'text-purple-600 bg-purple-50';
        if (numRating >= 3.5) return 'text-green-600 bg-green-50';
        if (numRating >= 2.5) return 'text-blue-600 bg-blue-50';
        if (numRating >= 1.5) return 'text-orange-600 bg-orange-50';
        return 'text-red-600 bg-red-50';
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

    // Generate IPCRF PDF for printing - Official DepEd Format matching the exact layout
    const generateIPCRFPDF = async (teacher, rating) => {
        if (isGeneratingPDF) return; // Prevent multiple clicks
        
        try {
            setIsGeneratingPDF(true);
            console.log('Starting PDF generation...', { teacher, rating });
            
            // Show loading toast
            const loadingToast = toast.loading('Generating PDF...');
            
            // Lazy load PDF libraries
            const [{ default: jsPDF }, { default: autoTable }] = await loadPDFLibraries();
            
            // Create PDF in landscape orientation for IPCRF form
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'legal' // 355.6 x 215.9 mm
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            let currentY = 8;
            
            // Add border around entire page
            doc.setLineWidth(0.5);
            doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
            
            // Title Section
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('INDIVIDUAL PERFORMANCE COMMITMENT AND REVIEW FORM (IPCRF) for Regular Teachers in the Highly Proficient Stage', pageWidth / 2, currentY, { align: 'center' });
            
            currentY += 8;
            
            // Employee Information Table
            const employeeData = [
                [
                    { content: 'Name of Employee', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
                    { content: teacher?.name || 'Andrey', colSpan: 2, styles: { fillColor: [255, 255, 255] } },
                    { content: 'Name of Rater', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
                    { content: 'MARY ANN L. CATINDIG', colSpan: 2, styles: { fillColor: [255, 255, 255] } }
                ],
                [
                    { content: 'Position', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
                    { content: teacher?.current_position?.name || 'Master Teacher II', colSpan: 2, styles: { fillColor: [255, 255, 255] } },
                    { content: 'Position', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
                    { content: 'Principal IV', colSpan: 2, styles: { fillColor: [255, 255, 255] } }
                ],
                [
                    { content: 'Bureau/Center/Service/Division', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
                    { content: 'ISABELA SCHOOL OF ARTS AND TRADES - Ilagan City', colSpan: 2, styles: { fillColor: [255, 255, 255] } },
                    { content: 'Date of Review', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
                    { content: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), colSpan: 2, styles: { fillColor: [255, 255, 255] } }
                ],
                [
                    { content: 'Rating Period', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
                    { content: rating?.rating_period || '2026-2027', colSpan: 5, styles: { fillColor: [255, 255, 255] } }
                ]
            ];

            autoTable(doc, {
                startY: currentY,
                body: employeeData,
                theme: 'grid',
                styles: {
                    fontSize: 8,
                    cellPadding: 2.5,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.2
                },
                margin: { left: 7, right: 7 },
                tableWidth: pageWidth - 14
            });

            currentY = doc.lastAutoTable.finalY + 2;

            // Section Headers - TO BE FILLED OUT
            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            doc.text('TO BE FILLED OUT DURING PLANNING', pageWidth * 0.35, currentY, { align: 'center' });
            doc.text('TO BE FILLED OUT DURING EVALUATION', pageWidth * 0.75, currentY, { align: 'center' });
            
            currentY += 3;

            // Main IPCRF Table with exact column structure
            const headers = [
                [
                    { content: 'MFOs', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [240, 240, 240], fontSize: 6 } },
                    { content: 'Domains', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [240, 240, 240], fontSize: 6 } },
                    { content: 'Objectives', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [240, 240, 240], fontSize: 6 } },
                    { content: 'Timeline', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [240, 240, 240], fontSize: 6 } },
                    { content: 'Weight\nper KRA', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [240, 240, 240], fontSize: 5.5 } },
                    { content: 'QET', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [240, 240, 240], fontSize: 6 } },
                    { content: 'Performance Indicators', colSpan: 5, styles: { halign: 'center', fillColor: [240, 240, 240], fontSize: 6 } },
                    { content: 'Actual Results', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [240, 240, 240], fontSize: 5.5 } },
                    { content: 'Rating', colSpan: 4, styles: { halign: 'center', fillColor: [240, 240, 240], fontSize: 6 } },
                    { content: 'Score', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [240, 240, 240], fontSize: 6 } }
                ],
                [
                    { content: 'Outstanding\n5', styles: { halign: 'center', fillColor: [240, 240, 240], fontSize: 5 } },
                    { content: 'Very Satisfactory\n4', styles: { halign: 'center', fillColor: [240, 240, 240], fontSize: 5 } },
                    { content: 'Satisfactory\n3', styles: { halign: 'center', fillColor: [240, 240, 240], fontSize: 5 } },
                    { content: 'Unsatisfactory\n2', styles: { halign: 'center', fillColor: [240, 240, 240], fontSize: 5 } },
                    { content: 'Poor\n1', styles: { halign: 'center', fillColor: [240, 240, 240], fontSize: 5 } },
                    { content: 'Q', styles: { halign: 'center', fillColor: [240, 240, 240], fontSize: 6 } },
                    { content: 'E', styles: { halign: 'center', fillColor: [240, 240, 240], fontSize: 6 } },
                    { content: 'T', styles: { halign: 'center', fillColor: [240, 240, 240], fontSize: 6 } },
                    { content: 'Ave', styles: { halign: 'center', fillColor: [240, 240, 240], fontSize: 5.5 } }
                ]
            ];

            // Build data rows from KRA details
            const dataRows = [];
            const mfoMap = {
                'Content Knowledge and Pedagogy': 'Basic\nEducation\nServices',
                'Learning Environment & Diversity of Learners': 'Basic\nEducation\nServices',
                'Curriculum and Planning & Assessment and Reporting': 'Basic\nEducation\nServices',
                'Community Linkages and Professional Engagement': 'Professional\nDevelopment',
                'Personal Growth and Professional Development': 'Professional\nDevelopment'
            };

            const domainMap = {
                'Content Knowledge and Pedagogy': '1. Content\nKnowledge and\nPedagogy',
                'Learning Environment & Diversity of Learners': '2. Learning\nEnvironment &\nDiversity of\nLearners',
                'Curriculum and Planning & Assessment and Reporting': '3. Curriculum and\nPlanning &\nAssessment and\nReporting',
                'Community Linkages and Professional Engagement': '4. Community\nLinkages and\nProfessional\nEngagement',
                'Personal Growth and Professional Development': '5. Personal\nGrowth and\nProfessional\nDevelopment'
            };

            console.log('Rating data:', rating);
            console.log('KRA details:', rating?.kra_details);
            
            if (rating?.kra_details && Array.isArray(rating.kra_details)) {
                console.log('Processing KRA details, count:', rating.kra_details.length);
                rating.kra_details.forEach((kra, kraIndex) => {
                    console.log(`Processing KRA ${kraIndex}:`, kra);
                    if (kra?.objectives && Array.isArray(kra.objectives)) {
                        console.log(`  Objectives count: ${kra.objectives.length}`);
                        kra.objectives.forEach((obj, objIndex) => {
                            const objRating = Number(obj.rating) || 5;
                            const objScore = Number(obj.score) || 0;
                            const weight = obj.weight ? `${obj.weight}%` : '7.14%';
                            const timeline = rating?.rating_period || 'SY 2024-2025';
                            
                            // Get individual QET ratings or use the overall rating if not available
                            const qRating = Number(obj.q_rating || obj.quality_rating || objRating);
                            const eRating = Number(obj.e_rating || obj.efficiency_rating || objRating);
                            const tRating = Number(obj.t_rating || obj.timeliness_rating || objRating);
                            const avgRating = (qRating + eRating + tRating) / 3;
                            
                            // Performance indicators - use data from database or defaults
                            // These should come from the admin's uploaded content
                            const outstandingText = obj.outstanding_indicator || 
                                'Identified and utilized personal professional strengths to uphold the dignity of teaching as a profession to help build a positive teaching and learning culture within the school';
                            
                            const verySatisfactoryText = obj.very_satisfactory_indicator || 
                                'Identified and utilized personal professional strengths to uphold the dignity of teaching as a profession to help build a positive teaching and learning culture within the school';
                            
                            const satisfactoryText = obj.satisfactory_indicator || 
                                'Identified and utilized personal professional strengths to uphold the dignity of teaching as a profession to help build a positive teaching and learning culture within the school';
                            
                            const unsatisfactoryText = obj.unsatisfactory_indicator || 
                                'Identified personal professional strengths that uphold the dignity of teaching as a profession as evidenced in PD/LAC sessions/FGDs/other collegial discussions that are responsive to learners with disabilities, giftedness and talents during meetings/LAC sessions/FGDs/other collegial discussions';
                            
                            const poorText = obj.poor_indicator || 
                                'No acceptable evidence was shown';
                            
                            // Actual results - should come from the rating data
                            const actualResults = obj.actual_results || 
                                'Demonstrated Level 5 in the objective as shown in COT rating sheets / inter-observer agreement forms';
                            
                            dataRows.push([
                                objIndex === 0 ? (mfoMap[kra.kra_name] || 'Basic\nEducation\nServices') : '',
                                objIndex === 0 ? (domainMap[kra.kra_name] || kra.kra_name) : '',
                                obj.objective_description || obj.objective_code || '',
                                timeline,
                                weight,
                                'Quality',
                                outstandingText,
                                verySatisfactoryText,
                                satisfactoryText,
                                unsatisfactoryText,
                                poorText,
                                actualResults,
                                qRating.toFixed(0), // Q (Quality)
                                eRating.toFixed(0), // E (Efficiency)
                                tRating.toFixed(0), // T (Timeliness)
                                avgRating.toFixed(3), // Ave (Average of Q, E, T)
                                objScore.toFixed(3) // Score
                            ]);
                        });
                    } else {
                        console.log(`  No objectives found for KRA ${kraIndex}`);
                    }
                });
            } else {
                console.log('No kra_details found or not an array');
            }
            
            console.log('Total data rows generated:', dataRows.length);

            autoTable(doc, {
                startY: currentY,
                head: headers,
                body: dataRows,
                theme: 'grid',
                styles: {
                    fontSize: 6,
                    cellPadding: 1.5,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.2,
                    valign: 'middle'
                },
                headStyles: {
                    fillColor: [220, 220, 220],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                columnStyles: {
                    0: { cellWidth: 18, halign: 'center', fontSize: 6 },  // MFOs
                    1: { cellWidth: 22, halign: 'center', fontSize: 6 },  // Domains
                    2: { cellWidth: 35, fontSize: 5.5 },                   // Objectives
                    3: { cellWidth: 20, halign: 'center', fontSize: 6 },  // Timeline
                    4: { cellWidth: 10, halign: 'center', fontSize: 6 },  // Weight
                    5: { cellWidth: 10, halign: 'center', fontSize: 6 },  // QET
                    6: { cellWidth: 28, fontSize: 5 },                     // Outstanding
                    7: { cellWidth: 28, fontSize: 5 },                     // Very Satisfactory
                    8: { cellWidth: 28, fontSize: 5 },                     // Satisfactory
                    9: { cellWidth: 28, fontSize: 5 },                     // Unsatisfactory
                    10: { cellWidth: 28, fontSize: 5 },                    // Poor
                    11: { cellWidth: 28, fontSize: 5.5 },                  // Actual Results
                    12: { cellWidth: 7, halign: 'center', fontSize: 6 },  // Q
                    13: { cellWidth: 7, halign: 'center', fontSize: 6 },  // E
                    14: { cellWidth: 7, halign: 'center', fontSize: 6 },  // T
                    15: { cellWidth: 10, halign: 'center', fontSize: 6 }, // Ave
                    16: { cellWidth: 12, halign: 'center', fontSize: 6 }  // Score
                },
                margin: { left: 7, right: 7 },
                tableWidth: pageWidth - 14
            });

            currentY = doc.lastAutoTable.finalY + 3;

            // Rating for Overall Accomplishments
            const totalScore = Number(rating?.total_score) || 0;
            const numericalRating = Number(rating?.numerical_rating) || 0;
            let adjectivalRating = '';
            if (numericalRating >= 4.5) adjectivalRating = 'Outstanding';
            else if (numericalRating >= 3.5) adjectivalRating = 'Very Satisfactory';
            else if (numericalRating >= 2.5) adjectivalRating = 'Satisfactory';
            else if (numericalRating >= 1.5) adjectivalRating = 'Unsatisfactory';
            else adjectivalRating = 'Poor';

            const summaryData = [
                [
                    { content: 'RATING FOR OVERALL ACCOMPLISHMENTS', styles: { fontStyle: 'bold', fillColor: [220, 220, 220] } },
                    { content: adjectivalRating, styles: { fontStyle: 'bold', halign: 'center' } },
                    { content: numericalRating.toFixed(3), styles: { fontStyle: 'bold', halign: 'center' } }
                ]
            ];

            autoTable(doc, {
                startY: currentY,
                body: summaryData,
                theme: 'grid',
                styles: {
                    fontSize: 9,
                    cellPadding: 3,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.3
                },
                columnStyles: {
                    0: { cellWidth: 200 },
                    1: { cellWidth: 50 },
                    2: { cellWidth: 30 }
                }
            });

            currentY = doc.lastAutoTable.finalY + 5;

            // Rating Criteria Section
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('RATING CRITERIA:', 10, currentY);
            
            currentY += 5;
            
            const ratingCriteria = [
                [
                    { content: 'Rating Scale', styles: { fontStyle: 'bold', halign: 'center', fillColor: [240, 240, 240] } },
                    { content: 'Description', styles: { fontStyle: 'bold', halign: 'center', fillColor: [240, 240, 240] } },
                    { content: 'Criteria', styles: { fontStyle: 'bold', halign: 'center', fillColor: [240, 240, 240] } }
                ],
                [
                    { content: '5\nOutstanding', styles: { halign: 'center', fontStyle: 'bold', fillColor: [255, 255, 200] } },
                    { content: 'Performance consistently exceeds expectations', styles: { valign: 'middle' } },
                    { content: 'Demonstrated Level 5 in the objective as shown in COT rating sheets / inter-observer agreement forms. Objective was met within the allotted time.', styles: { fontSize: 7 } }
                ],
                [
                    { content: '4\nVery Satisfactory', styles: { halign: 'center', fontStyle: 'bold', fillColor: [200, 255, 200] } },
                    { content: 'Performance frequently exceeds expectations', styles: { valign: 'middle' } },
                    { content: 'Demonstrated Level 4 in the objective as shown in COT rating sheets / inter-observer agreement forms. Objective was met within the allotted time.', styles: { fontSize: 7 } }
                ],
                [
                    { content: '3\nSatisfactory', styles: { halign: 'center', fontStyle: 'bold', fillColor: [200, 200, 255] } },
                    { content: 'Performance meets expectations', styles: { valign: 'middle' } },
                    { content: 'Demonstrated Level 3 in the objective as shown in COT rating sheets / inter-observer agreement forms. Objective was met but instruction exceeded the allotted time.', styles: { fontSize: 7 } }
                ],
                [
                    { content: '2\nUnsatisfactory', styles: { halign: 'center', fontStyle: 'bold', fillColor: [255, 220, 200] } },
                    { content: 'Performance needs improvement', styles: { valign: 'middle' } },
                    { content: 'Demonstrated Level 2 in the objective as shown in COT rating sheets / inter-observer agreement forms. No acceptable evidence was shown.', styles: { fontSize: 7 } }
                ],
                [
                    { content: '1\nPoor', styles: { halign: 'center', fontStyle: 'bold', fillColor: [255, 200, 200] } },
                    { content: 'Performance is significantly below expectations', styles: { valign: 'middle' } },
                    { content: 'Demonstrated Level 1 in the objective as shown in COT rating sheets / inter-observer agreement forms. No acceptable evidence was shown.', styles: { fontSize: 7 } }
                ]
            ];

            autoTable(doc, {
                startY: currentY,
                body: ratingCriteria,
                theme: 'grid',
                styles: {
                    fontSize: 7,
                    cellPadding: 3,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.2,
                    valign: 'middle'
                },
                columnStyles: {
                    0: { cellWidth: 30, halign: 'center' },
                    1: { cellWidth: 60 },
                    2: { cellWidth: 100 }
                },
                margin: { left: 10, right: 10 }
            });

            currentY = doc.lastAutoTable.finalY + 5;

            // QET Explanation
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text('QET Rating Components:', 10, currentY);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            currentY += 4;
            doc.text('• Q (Quality) - The degree to which objectives are met with high standards', 12, currentY);
            currentY += 3;
            doc.text('• E (Efficiency) - The optimal use of time and resources in achieving objectives', 12, currentY);
            currentY += 3;
            doc.text('• T (Timeliness) - The completion of objectives within the specified timeframe', 12, currentY);
            
            currentY += 6;

            // Adjectival Rating Equivalences Table
            const ratingEquivalences = [
                [
                    { content: 'ADJECTIVAL RATING EQUIVALENCES', colSpan: 2, styles: { fontStyle: 'bold', halign: 'center', fillColor: [220, 220, 220] } }
                ],
                [
                    { content: 'RANGE', styles: { fontStyle: 'bold', halign: 'center', fillColor: [240, 240, 240] } },
                    { content: 'ADJECTIVAL RATING', styles: { fontStyle: 'bold', halign: 'center', fillColor: [240, 240, 240] } }
                ],
                ['4.500 – 5.000', 'Outstanding'],
                ['3.500 – 4.499', 'Very Satisfactory'],
                ['2.500 – 3.499', 'Satisfactory'],
                ['1.500 – 2.499', 'Unsatisfactory'],
                ['below 1.499', 'Poor']
            ];

            autoTable(doc, {
                startY: currentY,
                body: ratingEquivalences,
                theme: 'grid',
                styles: {
                    fontSize: 8,
                    cellPadding: 2,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.3,
                    halign: 'center'
                },
                columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 50 }
                },
                margin: { left: 10 }
            });

            currentY = doc.lastAutoTable.finalY + 10;

            // Add new page for additional sections
            doc.addPage();
            currentY = 15;
            
            // Add border around new page
            doc.setLineWidth(0.5);
            doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
            
            // CORE BEHAVIORAL COMPETENCIES Section
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setFillColor(144, 238, 144); // Light green
            doc.rect(pageWidth - 60, 10, 50, 8, 'F');
            doc.setTextColor(0, 0, 0);
            doc.text('CORE BEHAVIORAL COMPETENCIES', pageWidth - 35, 15, { align: 'center' });
            
            currentY = 25;
            
            // Core Behavioral Competencies Table
            const behavioralCompetencies = [
                [
                    { content: 'CORE BEHAVIORAL COMPETENCIES', colSpan: 3, styles: { halign: 'center', fontStyle: 'bold', fillColor: [144, 238, 144], fontSize: 9 } }
                ],
                [
                    { content: 'Competency', styles: { halign: 'center', fontStyle: 'bold', fillColor: [220, 220, 220] } },
                    { content: 'Description', styles: { halign: 'center', fontStyle: 'bold', fillColor: [220, 220, 220] } },
                    { content: 'Rating', styles: { halign: 'center', fontStyle: 'bold', fillColor: [220, 220, 220] } }
                ],
                ['Self-Management', 'Ability to manage own emotions, behavior and development', '5'],
                ['Professionalism and Ethics', 'Demonstrated behavior that upholds organizational integrity', '5'],
                ['Results Focus', 'Ability to set goals and achieve results', '5'],
                ['Teamwork', 'Ability to work effectively with others', '5'],
                ['Service Orientation', 'Focus on providing quality service to stakeholders', '5'],
                ['Innovation', 'Ability to find creative solutions and improvements', '5']
            ];

            autoTable(doc, {
                startY: currentY,
                body: behavioralCompetencies,
                theme: 'grid',
                styles: {
                    fontSize: 8,
                    cellPadding: 3,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.3
                },
                columnStyles: {
                    0: { cellWidth: 60, fontStyle: 'bold' },
                    1: { cellWidth: 120 },
                    2: { cellWidth: 30, halign: 'center' }
                },
                margin: { left: 10, right: 10 }
            });

            currentY = doc.lastAutoTable.finalY + 10;
            
            // PART III: SUMMARY OF RATINGS FOR DECISION
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('PART III: SUMMARY OF RATINGS FOR DECISION', pageWidth / 2, currentY, { align: 'center' });
            
            currentY += 8;
            
            // Calculate KRA summaries from rating data
            const kraSummary = [];
            let kraHeaders = ['', 'KRA', 'Weight per KRA', 'Objectives', 'Accomplishments of KRA and Objectives', 'Final Rating', 'Final Score', 'Adjectival Rating'];
            
            if (rating?.kra_details && Array.isArray(rating.kra_details)) {
                rating.kra_details.forEach((kra, index) => {
                    const kraNum = index + 1;
                    // Use weight from database, or calculate standard DepEd weights
                    const standardWeights = [30, 20, 20, 20, 10]; // KRA 1-5 standard weights
                    const kraWeight = kra.weight || standardWeights[index] || 20;
                    const kraWeightStr = kraWeight + '%';
                    const objectivesList = kra.objectives?.map(obj => obj.objective_code || `Obj ${obj.objective_id}`).join(', ') || '';
                    const avgRating = kra.average_rating || 5.000;
                    const score = kra.score || 0;
                    const adjectivalRating = getRatingEquivalency(avgRating);
                    
                    kraSummary.push([
                        kraNum.toString(),
                        `KRA ${kraNum}`,
                        kraWeightStr,
                        objectivesList.substring(0, 30) + (objectivesList.length > 30 ? '...' : ''),
                        '7.14%', // Individual objective weight
                        avgRating.toFixed(3),
                        score.toFixed(3),
                        adjectivalRating
                    ]);
                });
            }
            
            // Add summary rows
            kraSummary.push([
                { content: 'Average', colSpan: 5, styles: { fontStyle: 'bold', halign: 'right', fillColor: [220, 220, 220] } },
                { content: numericalRating.toFixed(3), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 200] } },
                { content: totalScore.toFixed(3), styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 200] } },
                { content: adjectivalRating, styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 200] } }
            ]);
            
            kraSummary.push([
                { content: 'Section', colSpan: 5, styles: { fontStyle: 'bold', halign: 'right', fillColor: [220, 220, 220] } },
                { content: 'Final Rating', colSpan: 3, styles: { fontStyle: 'bold', halign: 'center', fillColor: [180, 255, 180] } }
            ]);
            
            kraSummary.push([
                { content: 'Core Behavioral Competencies', colSpan: 5, styles: { fontStyle: 'bold', halign: 'right', fillColor: [240, 240, 240] } },
                { content: '5.000', colSpan: 3, styles: { halign: 'center' } }
            ]);

            autoTable(doc, {
                startY: currentY,
                head: [kraHeaders],
                body: kraSummary,
                theme: 'grid',
                styles: {
                    fontSize: 7,
                    cellPadding: 2,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.3
                },
                headStyles: {
                    fillColor: [144, 238, 144],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold',
                    halign: 'center'
                },
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 30, halign: 'center' },
                    2: { cellWidth: 30, halign: 'center' },
                    3: { cellWidth: 50 },
                    4: { cellWidth: 40 },
                    5: { cellWidth: 25, halign: 'center' },
                    6: { cellWidth: 25, halign: 'center' },
                    7: { cellWidth: 35, halign: 'center' }
                },
                margin: { left: 10, right: 10 }
            });

            currentY = doc.lastAutoTable.finalY + 10;

            // Signature Section
            const signatureData = [
                [
                    { content: teacher?.name || 'EDNA C. GARCIA', styles: { halign: 'center', fontStyle: 'bold' } },
                    { content: 'MARY ANN L. CATINDIG', styles: { halign: 'center', fontStyle: 'bold' } },
                    { content: 'EDUARDO C. ESCORPISO JR. EDD. CESO V', styles: { halign: 'center', fontStyle: 'bold' } }
                ],
                [
                    { content: 'Ratee', styles: { halign: 'center', fontStyle: 'italic' } },
                    { content: 'Rater', styles: { halign: 'center', fontStyle: 'italic' } },
                    { content: 'Approving Authority', styles: { halign: 'center', fontStyle: 'italic' } }
                ]
            ];

            autoTable(doc, {
                startY: currentY,
                body: signatureData,
                theme: 'plain',
                styles: {
                    fontSize: 9,
                    cellPadding: 3
                },
                columnStyles: {
                    0: { cellWidth: 90 },
                    1: { cellWidth: 90 },
                    2: { cellWidth: 90 }
                }
            });
            
            console.log('PDF generation complete, saving...');
            
            // Save PDF
            const filename = `IPCRF_${teacher?.name?.replace(/\s+/g, '_') || 'Teacher'}_${rating?.rating_period || 'Unknown'}.pdf`;
            doc.save(filename);
            
            // Dismiss loading and show success
            toast.dismiss();
            toast.success('IPCRF PDF generated successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.dismiss();
            toast.error(`Failed to generate PDF: ${error.message}`);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // Export rating to PDF in official IPCRF format
    const exportRatingToPDF = async () => {
        if (!selectedRating || isGeneratingPDF) return;

        try {
            setIsGeneratingPDF(true);
            console.log('Exporting rating to PDF:', selectedRating);
            
            // Show loading toast
            const loadingToast = toast.loading('Exporting PDF...');
            
            // Lazy load PDF libraries
            const [{ default: jsPDF }, { default: autoTable }] = await loadPDFLibraries();
            
            // Create PDF in landscape orientation
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'legal'
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            
            // Pink/salmon background color
            doc.setFillColor(255, 192, 203);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');

            // Add logos
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text('DepEd', 15, 15);
            doc.text('BHROD', pageWidth - 25, 15);

            // Title section
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Official Electronic IPCRF Tool v4.3', pageWidth / 2, 12, { align: 'center' });
            doc.text('Highly Proficient Regular Teacher', pageWidth / 2, 17, { align: 'center' });
            doc.text(`SY ${selectedRating.rating_period || '2024-2025'}`, pageWidth / 2, 22, { align: 'center' });
            doc.setFontSize(11);
            doc.text('PART 1: INDIVIDUAL PERFORMANCE COMMITMENT AND REVIEW FORM', pageWidth / 2, 28, { align: 'center' });

            // Privacy notice
            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            doc.text('PRIVACY NOTICE:', 10, 35);
            doc.setFont('helvetica', 'normal');
            const privacyText = 'By using this tool, you agree to authorize the Department of Education to collect, process, retain, and dispose of your personal information in accordance with the Data Privacy Act of 2012.';
            doc.text(privacyText, 10, 38, { maxWidth: pageWidth - 20 });

            // Instructions
            doc.setFont('helvetica', 'bold');
            doc.text('INSTRUCTIONS:', 10, 45);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6);
            const instructions = 'Part 1 shall be accomplished by the Rater during the Phase III: Performance Review and Evaluation of the RPMS Cycle. Fill in empty cells (white) with needed information about the rater and approving authority.';
            doc.text(instructions, 10, 48, { maxWidth: pageWidth - 20 });

            // Find teacher from the list
            const teacher = teachers.data.find(t => t.ipcrf_ratings?.some(r => r.id === selectedRating.id));

            // Employee information table
            const employeeData = [
                [
                    { content: 'Name of Employee:', styles: { fontStyle: 'bold', fillColor: [255, 192, 203] } },
                    { content: teacher?.name || '', colSpan: 2, styles: { fillColor: [255, 255, 255] } },
                    { content: 'RATER Last Name:', styles: { fontStyle: 'bold', fillColor: [255, 192, 203] } },
                    { content: '', styles: { fillColor: [255, 255, 255] } },
                    { content: 'First:', styles: { fontStyle: 'bold', fillColor: [255, 192, 203] } },
                    { content: '', styles: { fillColor: [255, 255, 255] } },
                    { content: 'Middle:', styles: { fontStyle: 'bold', fillColor: [255, 192, 203] } },
                    { content: '', styles: { fillColor: [255, 255, 255] } }
                ],
                [
                    { content: 'Position:', styles: { fontStyle: 'bold', fillColor: [255, 192, 203] } },
                    { content: teacher?.current_position?.name || 'Master Teacher II', colSpan: 2, styles: { fillColor: [255, 255, 255] } },
                    { content: 'Position:', styles: { fontStyle: 'bold', fillColor: [255, 192, 203] } },
                    { content: 'Principal IV', styles: { fillColor: [255, 255, 255] } },
                    { content: 'DepEd Email:', styles: { fontStyle: 'bold', fillColor: [255, 192, 203] } },
                    { content: '', colSpan: 2, styles: { fillColor: [255, 255, 255] } }
                ],
                [
                    { content: 'Bureau/Center/Service/Division:', styles: { fontStyle: 'bold', fillColor: [255, 192, 203] } },
                    { content: 'ISABELA SCHOOL OF ARTS AND TRADES - Ilagan Campus', colSpan: 2, styles: { fillColor: [255, 255, 255] } },
                    { content: 'Date of Review:', styles: { fontStyle: 'bold', fillColor: [255, 192, 203] } },
                    { content: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }), colSpan: 4, styles: { fillColor: [255, 255, 255] } }
                ],
                [
                    { content: 'Rating Period:', styles: { fontStyle: 'bold', fillColor: [255, 192, 203] } },
                    { content: `SY ${selectedRating.rating_period || '2024-2025'}`, colSpan: 7, styles: { fillColor: [255, 255, 255] } }
                ]
            ];

            autoTable(doc, {
                startY: 55,
                body: employeeData,
                theme: 'grid',
                styles: {
                    fontSize: 7,
                    cellPadding: 2,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.1
                },
                columnStyles: {
                    0: { cellWidth: 45 },
                    1: { cellWidth: 35 },
                    2: { cellWidth: 35 },
                    3: { cellWidth: 35 },
                    4: { cellWidth: 30 },
                    5: { cellWidth: 20 },
                    6: { cellWidth: 30 },
                    7: { cellWidth: 25 }
                }
            });

            // Main IPCRF table
            let currentY = doc.lastAutoTable.finalY + 3;

            // Table headers
            const headers = [
                [
                    { content: 'KRA', rowSpan: 3, styles: { halign: 'center', valign: 'middle', fillColor: [144, 238, 144] } },
                    { content: 'Objective\nNo.', rowSpan: 3, styles: { halign: 'center', valign: 'middle', fillColor: [144, 238, 144] } },
                    { content: 'PPST', rowSpan: 3, styles: { halign: 'center', valign: 'middle', fillColor: [144, 238, 144] } },
                    { content: 'COI/NCOI', rowSpan: 3, styles: { halign: 'center', valign: 'middle', fillColor: [144, 238, 144] } },
                    { content: 'Weight\nper\nObjective', rowSpan: 3, styles: { halign: 'center', valign: 'middle', fillColor: [144, 238, 144] } },
                    { content: 'COT\nIndicator\nNo.', rowSpan: 3, styles: { halign: 'center', valign: 'middle', fillColor: [144, 238, 144] } },
                    { content: 'COT 1', colSpan: 2, styles: { halign: 'center', fillColor: [255, 192, 203] } },
                    { content: 'COT 2', colSpan: 2, styles: { halign: 'center', fillColor: [255, 192, 203] } },
                    { content: 'COT 3', colSpan: 2, styles: { halign: 'center', fillColor: [255, 192, 203] } },
                    { content: 'COT 4', colSpan: 2, styles: { halign: 'center', fillColor: [255, 192, 203] } },
                    { content: 'Ave', rowSpan: 3, styles: { halign: 'center', valign: 'middle', fillColor: [144, 238, 144] } },
                    { content: 'IPCRF Numerical Ratings', colSpan: 4, styles: { halign: 'center', fillColor: [144, 238, 144] } },
                    { content: 'Score', rowSpan: 3, styles: { halign: 'center', valign: 'middle', fillColor: [144, 238, 144] } },
                    { content: 'Adjectival\nRating', rowSpan: 3, styles: { halign: 'center', valign: 'middle', fillColor: [144, 238, 144] } }
                ],
                [
                    { content: 'Rating', styles: { halign: 'center', fillColor: [255, 192, 203] } },
                    { content: 'RPMS 5-pt', styles: { halign: 'center', fillColor: [255, 192, 203] } },
                    { content: 'Rating', styles: { halign: 'center', fillColor: [255, 192, 203] } },
                    { content: 'RPMS 5-pt', styles: { halign: 'center', fillColor: [255, 192, 203] } },
                    { content: 'Rating', styles: { halign: 'center', fillColor: [255, 192, 203] } },
                    { content: 'RPMS 5-pt', styles: { halign: 'center', fillColor: [255, 192, 203] } },
                    { content: 'Rating', styles: { halign: 'center', fillColor: [255, 192, 203] } },
                    { content: 'RPMS 5-pt', styles: { halign: 'center', fillColor: [255, 192, 203] } },
                    { content: 'Q', styles: { halign: 'center', fillColor: [144, 238, 144] } },
                    { content: 'E', styles: { halign: 'center', fillColor: [144, 238, 144] } },
                    { content: 'T', styles: { halign: 'center', fillColor: [144, 238, 144] } },
                    { content: 'Ave', styles: { halign: 'center', fillColor: [144, 238, 144] } }
                ]
            ];

            // Get rating description
            const getRatingDescription = (rating) => {
                const numRating = Number(rating);
                if (numRating >= 4.5) return 'Outstanding';
                if (numRating >= 3.5) return 'Very Satisfactory';
                if (numRating >= 2.5) return 'Satisfactory';
                if (numRating >= 1.5) return 'Unsatisfactory';
                return 'Poor';
            };

            // Build data rows from KRA details
            const dataRows = [];
            if (selectedRating.kra_details) {
                selectedRating.kra_details.forEach((kra, kraIndex) => {
                    if (kra.objectives) {
                        kra.objectives.forEach((obj, objIndex) => {
                            const rating = Number(obj.rating) || 0;
                            const score = Number(obj.score) || 0;
                            
                            dataRows.push([
                                (kraIndex + 1).toString(),
                                (objIndex + 1).toString(),
                                obj.objective_code || '',
                                'COI',
                                '7.14%',
                                '',
                                '', '', '', '', '', '', '', '',
                                rating ? rating.toFixed(3) : '',
                                rating || '',
                                rating || '',
                                rating || '',
                                rating ? rating.toFixed(3) : '',
                                score ? score.toFixed(3) : '',
                                rating ? getRatingDescription(rating) : ''
                            ]);
                        });
                    }
                });
            }

            autoTable(doc, {
                startY: currentY,
                head: headers,
                body: dataRows,
                theme: 'grid',
                styles: {
                    fontSize: 6,
                    cellPadding: 1,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.1,
                    halign: 'center',
                    valign: 'middle'
                },
                headStyles: {
                    fillColor: [144, 238, 144],
                    textColor: [0, 0, 0],
                    fontStyle: 'bold'
                }
            });

            // Footer section
            currentY = doc.lastAutoTable.finalY;
            
            const footerData = [
                [
                    { content: 'Date Observed:', styles: { fontStyle: 'bold', fillColor: [255, 192, 203] } },
                    { content: new Date().toLocaleDateString('en-US'), styles: { fillColor: [255, 255, 255] } },
                    { content: '', colSpan: 2, styles: { fillColor: [255, 192, 203] } },
                    { content: 'Final Rating', styles: { fontStyle: 'bold', fillColor: [144, 238, 144] } },
                    { content: selectedRating.numerical_rating ? Number(selectedRating.numerical_rating).toFixed(3) : '', styles: { fillColor: [255, 255, 255] } }
                ],
                [
                    { content: 'COT Status:', styles: { fontStyle: 'bold', fillColor: [255, 192, 203] } },
                    { content: '✓', styles: { fillColor: [255, 255, 255] } },
                    { content: '', colSpan: 2, styles: { fillColor: [255, 192, 203] } },
                    { content: 'Adjectival Rating', styles: { fontStyle: 'bold', fillColor: [144, 238, 144] } },
                    { content: selectedRating.numerical_rating ? getRatingDescription(selectedRating.numerical_rating) : '', styles: { fillColor: [255, 255, 255] } }
                ]
            ];

            autoTable(doc, {
                startY: currentY,
                body: footerData,
                theme: 'grid',
                styles: {
                    fontSize: 7,
                    cellPadding: 2,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.1
                }
            });

            // Signature section
            currentY = doc.lastAutoTable.finalY + 5;
            
            const signatureData = [
                [
                    { content: 'Rater', colSpan: 2, styles: { halign: 'center', fontStyle: 'bold', fillColor: [255, 192, 203] } },
                    { content: 'Approving Authority', colSpan: 2, styles: { halign: 'center', fontStyle: 'bold', fillColor: [255, 192, 203] } },
                    { content: '', colSpan: 2, styles: { fillColor: [255, 192, 203] } }
                ],
                [
                    { content: '', styles: { fillColor: [255, 255, 255] } },
                    { content: '', styles: { halign: 'center', fontStyle: 'bold', fillColor: [255, 255, 255] } },
                    { content: 'Last:', styles: { fontStyle: 'bold', fillColor: [255, 192, 203] } },
                    { content: '', styles: { fillColor: [255, 255, 255] } },
                    { content: 'First:', styles: { fontStyle: 'bold', fillColor: [255, 192, 203] } },
                    { content: '', styles: { fillColor: [255, 255, 255] } }
                ],
                [
                    { content: '', styles: { fillColor: [255, 192, 203] } },
                    { content: 'Principal IV', styles: { halign: 'center', fontStyle: 'italic', fillColor: [255, 255, 255] } },
                    { content: 'Position:', styles: { fontStyle: 'bold', fillColor: [255, 192, 203] } },
                    { content: 'Schools Division Superintendent', styles: { fillColor: [255, 255, 255] } },
                    { content: 'Middle:', styles: { fontStyle: 'bold', fillColor: [255, 192, 203] } },
                    { content: '', styles: { fillColor: [255, 255, 255] } }
                ]
            ];

            autoTable(doc, {
                startY: currentY,
                body: signatureData,
                theme: 'grid',
                styles: {
                    fontSize: 7,
                    cellPadding: 3,
                    lineColor: [0, 0, 0],
                    lineWidth: 0.1
                }
            });

            // Save the PDF
            const fileName = `IPCRF_${teacher?.name.replace(/\s+/g, '_') || 'Teacher'}_${selectedRating.rating_period}_${new Date().toISOString().split('T')[0]}.pdf`;
            console.log('Saving PDF as:', fileName);
            doc.save(fileName);
            
            // Dismiss loading and show success
            toast.dismiss();
            toast.success('PDF exported successfully!');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            toast.dismiss();
            toast.error('Failed to export PDF: ' + error.message);
        } finally {
            setIsGeneratingPDF(false);
        }
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
                                src="/pictures/isat.tmp" 
                                alt="ISAT Background" 
                                className="w-[600px] h-[600px] object-contain"
                                loading="lazy"
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
                                                <TableHead className="text-center">Equivalency</TableHead>
                                                <TableHead className="text-center">Year</TableHead>
                                                <TableHead className="text-center">Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {teachers.data.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                                                        No teachers found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                teachers.data.map((teacher) => {
                                                    const latestRating = teacher.ipcrf_ratings?.[0];
                                                    const isExpanded = expandedRows.includes(teacher.id);
                                                    
                                                    return (
                                                        <React.Fragment key={teacher.id}>
                                                            <TableRow>
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
                                                                            {latestRating.numerical_rating ? Number(latestRating.numerical_rating).toFixed(2) : 'N/A'}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-gray-400 text-sm">No rating</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    {latestRating?.numerical_rating ? (
                                                                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded ${getRatingColor(latestRating.numerical_rating)}`}>
                                                                            {getRatingEquivalency(latestRating.numerical_rating)}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-gray-400 text-sm">-</span>
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
                                                                    <div className="relative inline-block" ref={openMenuRow === teacher.id ? menuRef : null}>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="h-8 w-8 p-0"
                                                                            onClick={() => setOpenMenuRow(openMenuRow === teacher.id ? null : teacher.id)}
                                                                        >
                                                                            <MoreVertical className="h-4 w-4" />
                                                                        </Button>
                                                                        
                                                                        {/* Dropdown menu that appears on click */}
                                                                        {openMenuRow === teacher.id && (
                                                                            <div className="absolute right-0 top-0 flex flex-row gap-1 bg-white border rounded-md shadow-lg p-1 z-10">
                                                                                <Button
                                                                                    size="sm"
                                                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                                                    onClick={() => {
                                                                                        router.visit(route('admin.ipcrf.rate', teacher.id));
                                                                                        setOpenMenuRow(null);
                                                                                    }}
                                                                                    title="Rate"
                                                                                >
                                                                                    <Plus className="h-3 w-3 mr-1" />
                                                                                    Rate
                                                                                </Button>
                                                                                {latestRating && (
                                                                                    <>
                                                                                        <Button
                                                                                            size="sm"
                                                                                            variant="outline"
                                                                                            onClick={() => {
                                                                                                viewRatingDetails(latestRating);
                                                                                                setOpenMenuRow(null);
                                                                                            }}
                                                                                            title="View"
                                                                                        >
                                                                                            <Eye className="h-3 w-3 mr-1" />
                                                                                            View
                                                                                        </Button>
                                                                                        <Button
                                                                                            size="sm"
                                                                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                                                                            onClick={() => {
                                                                                                generateIPCRFPDF(teacher, latestRating);
                                                                                                setOpenMenuRow(null);
                                                                                            }}
                                                                                            title="Print"
                                                                                        >
                                                                                            <FileDown className="h-3 w-3 mr-1" />
                                                                                            Print
                                                                                        </Button>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                            
                                                            {/* Expanded Row - Show all ratings */}
                                                            {isExpanded && teacher.ipcrf_ratings?.length > 0 && (
                                                                <TableRow>
                                                                    <TableCell colSpan={8} className="bg-gray-50">
                                                                        <div className="p-4">
                                                                            <h4 className="font-semibold mb-3">Rating History</h4>
                                                                            <div className="space-y-2">
                                                                                {teacher.ipcrf_ratings.map((rating) => (
                                                                                    <div key={rating.id} className="flex items-center justify-between p-3 bg-white rounded border">
                                                                                        <div className="flex items-center gap-4">
                                                                                            <span className="font-medium">{rating.rating_period}</span>
                                                                                            <span className="text-lg font-semibold text-blue-600">
                                                                                                {rating.numerical_rating ? Number(rating.numerical_rating).toFixed(2) : 'N/A'}
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
                                                        </React.Fragment>
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
                                <div className={`p-4 rounded-lg ${getRatingColor(selectedRating.numerical_rating)}`}>
                                    <p className="text-sm font-medium opacity-80">Rating Equivalency</p>
                                    <p className="text-2xl font-bold mt-1">
                                        {selectedRating.numerical_rating ? getRatingEquivalency(selectedRating.numerical_rating) : 'N/A'}
                                    </p>
                                    <p className="text-sm font-medium mt-1 opacity-70">
                                        ({selectedRating.numerical_rating ? Number(selectedRating.numerical_rating).toFixed(2) : 'N/A'})
                                    </p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Total Score</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {selectedRating.total_score ? Number(selectedRating.total_score).toFixed(2) : 'N/A'}
                                    </p>
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
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500">Rating</p>
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getRatingColor(obj.rating)}`}>
                                                            {obj.rating ? getRatingEquivalency(obj.rating) : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500">Score</p>
                                                        <span className="font-semibold text-sm">{obj.score ? Number(obj.score).toFixed(2) : 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 pt-3 border-t flex justify-between items-center">
                                        <span className="font-semibold">KRA Average:</span>
                                        <div className="text-right">
                                            <span className={`inline-flex px-3 py-1 text-sm font-bold rounded ${getRatingColor(kra.average_rating)}`}>
                                                {kra.average_rating ? getRatingEquivalency(kra.average_rating) : 'N/A'}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">
                                                ({kra.average_rating ? Number(kra.average_rating).toFixed(2) : 'N/A'})
                                            </p>
                                        </div>
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
                        <Button 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={exportRatingToPDF}
                        >
                            <FileDown className="h-4 w-4 mr-2" />
                            Export PDF
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
