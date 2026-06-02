import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Save, Send, FileText } from 'lucide-react';
import TeacherLayout from '@/Layouts/TeacherLayout';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Questionnaire({ questionnaire, schoolYear, user }) {
    const [currentSection, setCurrentSection] = useState('profile');
    const [currentChallengeKra, setCurrentChallengeKra] = useState(0);
    
    const { data, setData, post, processing, errors } = useForm({
        school_year: schoolYear,
        name: questionnaire?.name || '',
        age: questionnaire?.age || '',
        teaching_position: questionnaire?.teaching_position || '',
        years_of_service: questionnaire?.years_of_service || '',
        bachelors_degree: questionnaire?.bachelors_degree || '',
        year_level_assignment: questionnaire?.year_level_assignment || '',
        subject_taught: questionnaire?.subject_taught || '',
        trainings_attended: questionnaire?.trainings_attended || '',
        kra_ratings: questionnaire?.kra_ratings || {},
        challenges: questionnaire?.challenges || {},
        status: 'draft',
    });

    const kraData = [
        {
            id: 1,
            name: 'Content Knowledge and Pedagogy',
            objectives: [
                { id: 1, code: '1.1.2', description: 'Applied knowledge of content within and across curriculum teaching areas.' },
                { id: 2, code: '1.2.2', description: 'Used research-based knowledge and principles of teaching and learning to enhance professional practice.' },
                { id: 3, code: '1.3.2', description: 'Ensured the positive use of ICT to facilitate the teaching and learning process.' },
                { id: 4, code: '1.4.2', description: 'Used a range of teaching strategies that enhance learner achievement in literacy and numeracy skills.' },
                { id: 5, code: '1.7.2', description: 'Used effective verbal and non-verbal classroom communication strategies to support learner understanding, participation, engagement and achievement.' },
            ]
        },
        {
            id: 2,
            name: 'Learning Environment & Diversity of Learners',
            objectives: [
                { id: 6, code: '2.1.2', description: 'Maintained supportive learning environment that motivate learners to participate, cooperate and collaborate in continued learning.' },
                { id: 7, code: '2.2.2', description: 'Applied a range of successful strategies that maintain learning environments that motivate learners to work productively by assuming responsibility for their own learning.' },
                { id: 8, code: '2.3.2', description: 'Designed, adapted and implemented teaching strategies that are responsive to learners with disabilities, giftedness and talents.' },
                { id: 9, code: '2.4.2', description: 'Planned and delivered teaching strategies that are responsive to the special educational needs of learners in difficult circumstances, including: geographic isolation; chronic illness; displacement due to armed conflict, urban resettlement or disasters; child abuse and child labor practices.' },
            ]
        },
        {
            id: 3,
            name: 'Curriculum and Planning & Assessment and Reporting',
            objectives: [
                { id: 10, code: '3.1.2', description: 'Adapted and implemented learning programs that ensure relevance and responsiveness to the needs of all learners.' },
            ]
        },
        {
            id: 4,
            name: 'Community Linkages and Professional Engagement',
            objectives: [
                { id: 11, code: '4.1.2', description: 'Maintained learning environments that are responsive to community contexts.' },
                { id: 12, code: '4.2.2', description: 'Reviewed regularly personal teaching practice using existing laws and regulations that apply to the teaching profession and the responsibilities specified in the Code of Ethics for Professional Teachers.' },
                { id: 13, code: '4.3.2', description: 'Complied with and implemented school policies and procedures consistently to foster harmonious relationships with learners, parents, and other stakeholders.' },
            ]
        },
        {
            id: 5,
            name: 'Personal Growth and Professional Development',
            objectives: [
                { id: 14, code: '5.1.2', description: 'Adopted practices that uphold the dignity of teaching as a profession by exhibiting qualities such as a caring attitude, respect, and integrity.' },
            ]
        },
    ];

    const challengesData = [
        {
            kra: 'KRA 1. Content Knowledge and Pedagogy',
            items: [
                'I have a limited understanding of effective teaching strategies and methods.',
                'I struggle to employ diverse teaching methods to cater to different learning styles and interests, leading to student disengagement.',
                'I rely heavily on traditional lecture-based instruction, failing to engage students through interactive and participatory learning experiences.',
                'I struggle in making a meaningful connection between classroom content and real-world applications, diminishing students\' interest and relevance in the material.',
                'I have difficulty in differentiating instructions to meet the needs of diverse learners within the same classroom, leaving some students with special needs unsupported or unchallenged.',
                'I insufficiently differentiate in meeting the needs of diverse learners, resulting in disengagement among my students who require additional support or enrichment.',
                'I struggle to cater to the diverse needs and learning styles of the students.',
                'I experience difficulty in updating my subject matter knowledge to keep pace with recent developments and innovations in my field of specialization.',
                'I have limited confidence in integrating higher-order thinking skills (e.g., critical thinking, problem-solving, and creativity) into my daily lesson delivery.',
                'I struggle to effectively integrate appropriate instructional technologies and digital resources to enhance content delivery and student engagement.',
            ]
        },
        {
            kra: 'KRA 2. Learning Environment & Diversity of Learners',
            items: [
                'I struggle to establish authority in the classroom, leading to disruptions and a lack of respect from students.',
                'I have difficulty in managing disruptive behavior, including addressing conflicts and maintaining a positive learning environment.',
                'I have limited knowledge in arranging the physical space and resources inside the classroom in a way that promotes learning and minimizes distractions.',
                'I have difficulty keeping all students actively engaged in learning activities, leading to disinterest and off-task behavior.',
                'I have difficulty in establishing a positive classroom environment characterized by warmth, rapport, and mutual respect, which can impact students\' motivation and engagement levels.',
                'I struggle with communicating clear expectations, directions, and feedback, leading to confusion and disengagement among students.',
                'I have limited use of technology in my lessons, which may lead to missing opportunities to enhance students\' engagement through interactive and relevant tools.',
                'I struggle to understand the diverse needs of students and tailor teaching methods accordingly.',
                'I encountered difficulty in planning, engaging and effective lessons that cater to the diverse needs of learners.',
                'I am challenged by cultural differences among my students regarding their background and values that can lead to misunderstanding their personal norms.',
                'I barely understand the languages or dialects of the students, leading to confusion.',
                'I am affected by the socio-economic disparities among my students that would lead to fewer educational opportunities.',
                'I encountered different learning styles due to different cultural backgrounds and experiences, requiring teachers to adapt their teaching methods.',
                'I am challenged with inclusive education, such as disabilities or special needs, requiring teachers to provide inclusive education and support services.',
                'I experience difficulty in implementing consistent classroom routines and behavioral expectations that promote a safe, inclusive, and learner-centered environment.',
            ]
        },
        {
            kra: 'KRA 3. Curriculum and Planning & Assessment and Reporting',
            items: [
                'I find it difficult to align lesson plans with curriculum standards and learning objectives.',
                'I have limited time to develop detailed lesson plans due to other responsibilities such as grading, meetings, and extra-curricular activities in the school.',
                'I am inefficient in allocating time to various lesson components.',
                'I struggle in organizing instructional materials, resources, and classroom activities, resulting in much wasted time.',
                'I may underestimate the time needed to cover certain topics or activities, resulting in rushed lessons and incomplete learning objectives.',
                'I am inefficient in lesson preparation due to spending excessive time planning and preparing lessons, which may lead to struggles in prioritizing tasks and allocating time effectively.',
                'I have limited access to teaching materials and technology in the portals of reference.',
                'I encountered difficulty in incorporating assessments effectively into lesson plans to gauge students\' understanding.',
                'I have a limited use of formative assessment strategies to gauge student understanding and adjust instruction accordingly, resulting in missed opportunities for engagement and progress monitoring.',
                'I struggle to select, and implement diagnostic, formative, and summative assessment strategies consistent with curriculum requirements.',
                'I have difficulty monitoring and evaluating learner progress and achievement using learner attainment data.',
                'I have difficulty providing timely, accurate, and constructive feedback to improve learner performance.',
                'I struggle to communicate promptly and clearly the learners\' needs, progress, and achievement to key stakeholders, including parents/guardians.',
                'I find it challenging to utilize assessment data to inform the modification of teaching and learning practices and programs.',
                'I experience difficulty in contextualizing curriculum content and assessment tasks to make them responsive to learners\' local context and real-life situations.',
            ]
        },
        {
            kra: 'KRA 4. Community Linkages and Professional Engagement',
            items: [
                'I have difficulty seeking guidance and mentorship from experienced colleagues and find it very challenging to collaborate with them while maintaining individual productivity.',
                'I often face constraints due to teaching responsibilities, making it challenging to engage in frequent and meaningful communication with parents.',
                'I have limited communication preferences, such as email, phone calls, or in-person meetings, requiring teachers to accommodate diverse communication styles due to the signal in the school where I am assigned.',
                'I have less contact with parents in discussing student issues while maintaining privacy or confidentiality and adhering to school policies.',
                'I have less engagement and collaboration with parents, particularly in meetings and project-initiated activities, and encounter difficulty inviting them for consultation due to work conflicts.',
                'I struggle in discussing sensitive student behavior or academic issues that require sensitivity and effective communication skills from teachers.',
                'I struggle in building relationships with students\' families and the local community with unfamiliar cultural dynamics and community norms.',
                'I have limited opportunities to engage in school-community partnerships that support student learning and development.',
                'I encounter challenges in documenting and sustaining collaborative initiatives with parents, colleagues, and community stakeholders.',
                'I find it challenging to balance professional collaboration with administrative tasks and teaching responsibilities.',
            ]
        },
        {
            kra: 'KRA 5. Personal Growth and Professional Development',
            items: [
                'I have been less engaged in regular self-reflection to assess the effectiveness of classroom management strategies.',
                'I have inadequate reflection on the effectiveness of lesson plans and adjustments for my teaching strategies.',
                'I have difficulty in prioritizing tasks and allocating time accordingly, focusing on high-impact activities.',
                'I have less time for regular self-reflection on time management practices and identifying areas for improvement.',
                'I have difficulty allocating time for professional development to enhance teaching skills and efficiency over time.',
                'I have difficulty in setting boundaries with my students between work and personal time, leading to burnout and inefficiency in time management.',
                'I have difficulty in finding the right balance between teaching and responsibilities, and personal time, due to the demands of the profession.',
                'I experience difficulty in identifying appropriate professional development activities that align with my individual teaching needs and performance goals.',
                'I have limited opportunities to apply newly acquired knowledge and skills from professional development activities to actual classroom practice.',
                'I encounter challenges in sustaining motivation and commitment to continuous professional growth amid increasing workload demands.',
            ]
        },
    ];

    const handleSubmit = (status) => {
        setData('status', status);
        post(route('teacher.questionnaire.store'), {
            onSuccess: () => {
                toast.success(status === 'submitted' 
                    ? 'Questionnaire submitted successfully!' 
                    : 'Questionnaire saved as draft!', {
                    position: "top-right",
                    autoClose: 3000,
                });
            },
            onError: () => {
                toast.error('Failed to save questionnaire. Please try again.', {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        });
    };

    return (
        <TeacherLayout user={user}>
            <Head title="IPCRF Questionnaire" />
            
            <ToastContainer />
            
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 shadow-xl border-b-4 border-green-700">
                    <div className="max-w-7xl mx-auto px-6 py-6">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute -inset-2 bg-white/30 rounded-full blur-xl"></div>
                                <div className="relative bg-white rounded-full p-2 shadow-2xl ring-4 ring-white/50">
                                    <FileText className="h-12 w-12 text-green-600" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">
                                    IPCRF QUESTIONNAIRE
                                </h1>
                                <p className="text-sm text-green-100 font-semibold mt-1">
                                    Performance Rating & Challenges - SY {schoolYear}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Section Navigation */}
                    <div className="bg-white rounded-2xl shadow-xl p-4 mb-6 border-2 border-green-200">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setCurrentSection('profile')}
                                className={`px-6 py-3 text-base font-bold rounded-xl transition-all duration-200 shadow-md ${
                                    currentSection === 'profile'
                                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                                        : 'bg-white text-gray-700 hover:bg-green-50 border-2 border-gray-200'
                                }`}
                            >
                                Profile
                            </button>
                            <button
                                onClick={() => setCurrentSection('ratings')}
                                className={`px-6 py-3 text-base font-bold rounded-xl transition-all duration-200 shadow-md ${
                                    currentSection === 'ratings'
                                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                                        : 'bg-white text-gray-700 hover:bg-green-50 border-2 border-gray-200'
                                }`}
                            >
                                KRA Ratings
                            </button>
                            <button
                                onClick={() => setCurrentSection('challenges')}
                                className={`px-6 py-3 text-base font-bold rounded-xl transition-all duration-200 shadow-md ${
                                    currentSection === 'challenges'
                                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                                        : 'bg-white text-gray-700 hover:bg-green-50 border-2 border-gray-200'
                                }`}
                            >
                                Challenges
                            </button>
                        </div>
                    </div>

                    {/* Profile Section */}
                    {currentSection === 'profile' && (
                        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Teacher Profile</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-base font-bold text-gray-700 mb-2">
                                        Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 transition-all"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-base font-bold text-gray-700 mb-2">
                                        Age
                                    </label>
                                    <input
                                        type="number"
                                        value={data.age}
                                        onChange={(e) => setData('age', e.target.value)}
                                        className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 transition-all"
                                        placeholder="Enter your age"
                                    />
                                </div>
                                <div>
                                    <label className="block text-base font-bold text-gray-700 mb-2">
                                        Teaching Position
                                    </label>
                                    <select
                                        value={data.teaching_position}
                                        onChange={(e) => setData('teaching_position', e.target.value)}
                                        className="w-full px-4 py-3 text-base font-semibold border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 transition-all bg-white hover:border-green-400 cursor-pointer shadow-sm hover:shadow-md appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-12"
                                    >
                                        <option value="" className="text-gray-500">Select Position</option>
                                        <optgroup label="━━━ Beginning ━━━" className="font-bold text-blue-700 bg-blue-50">
                                            <option value="T I" className="py-2">T I - Beginning</option>
                                            <option value="T II" className="py-2">T II - Beginning</option>
                                            <option value="T III" className="py-2">T III - Beginning</option>
                                        </optgroup>
                                        <optgroup label="━━━ Proficient ━━━" className="font-bold text-green-700 bg-green-50">
                                            <option value="T IV" className="py-2">T IV - Proficient</option>
                                            <option value="T V" className="py-2">T V - Proficient</option>
                                            <option value="T VI" className="py-2">T VI - Proficient</option>
                                            <option value="T VII" className="py-2">T VII - Proficient</option>
                                        </optgroup>
                                        <optgroup label="━━━ Highly Proficient ━━━" className="font-bold text-purple-700 bg-purple-50">
                                            <option value="MT I" className="py-2">MT I - Highly Proficient</option>
                                            <option value="MT II" className="py-2">MT II - Highly Proficient</option>
                                        </optgroup>
                                        <optgroup label="━━━ Distinguished ━━━" className="font-bold text-orange-700 bg-orange-50">
                                            <option value="MT III" className="py-2">MT III - Distinguished</option>
                                            <option value="MT IV" className="py-2">MT IV - Distinguished</option>
                                            <option value="MT V" className="py-2">MT V - Distinguished</option>
                                        </optgroup>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-base font-bold text-gray-700 mb-2">
                                        Years of Service
                                    </label>
                                    <input
                                        type="number"
                                        value={data.years_of_service}
                                        onChange={(e) => setData('years_of_service', e.target.value)}
                                        className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 transition-all"
                                        placeholder="Enter years"
                                    />
                                </div>
                                <div>
                                    <label className="block text-base font-bold text-gray-700 mb-2">
                                        Bachelor's Degree
                                    </label>
                                    <input
                                        type="text"
                                        value={data.bachelors_degree}
                                        onChange={(e) => setData('bachelors_degree', e.target.value)}
                                        className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 transition-all"
                                        placeholder="e.g., BS Computer Science"
                                    />
                                </div>
                                <div>
                                    <label className="block text-base font-bold text-gray-700 mb-2">
                                        Year Level Assignment
                                    </label>
                                    <input
                                        type="text"
                                        value={data.year_level_assignment}
                                        onChange={(e) => setData('year_level_assignment', e.target.value)}
                                        className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 transition-all"
                                        placeholder="e.g., 11/12"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-base font-bold text-gray-700 mb-2">
                                        Subject Taught
                                    </label>
                                    <input
                                        type="text"
                                        value={data.subject_taught}
                                        onChange={(e) => setData('subject_taught', e.target.value)}
                                        className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 transition-all"
                                        placeholder="e.g., ICT"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-base font-bold text-gray-700 mb-2">
                                        Trainings Attended (Last 3 Years)
                                    </label>
                                    <textarea
                                        value={data.trainings_attended}
                                        onChange={(e) => setData('trainings_attended', e.target.value)}
                                        rows="4"
                                        className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200 transition-all resize-none"
                                        placeholder="List all trainings attended in the last three (3) years..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* KRA Ratings Section */}
                    {currentSection === 'ratings' && (
                        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance Rating of Senior High School Teachers</h2>
                            <p className="text-base text-gray-600 mb-6">
                                Please indicate your IPCRF Ratings for SY {schoolYear} in each objective under the specified Key Result Areas. 
                                Write your ratings clearly using the following scale: 1-5 (where 5 is the highest).
                            </p>
                            
                            {kraData.map((kra) => (
                                <div key={kra.id} className="mb-8">
                                    <h3 className="text-xl font-bold text-green-700 mb-4 bg-green-50 p-4 rounded-xl">
                                        KRA {kra.id}. {kra.name}
                                    </h3>
                                    <div className="space-y-4">
                                        {kra.objectives.map((obj, idx) => (
                                            <div key={obj.id} className={`p-4 rounded-xl border-2 ${idx % 2 === 0 ? 'bg-green-50' : 'bg-white'}`}>
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                                                        {obj.id}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-base font-semibold text-gray-900 mb-2">
                                                            {obj.code}: {obj.description}
                                                        </p>
                                                        <div className="flex items-center gap-4">
                                                            <label className="text-base font-bold text-gray-700">Rating:</label>
                                                            <select
                                                                value={data.kra_ratings[obj.id] || ''}
                                                                onChange={(e) => setData('kra_ratings', {
                                                                    ...data.kra_ratings,
                                                                    [obj.id]: e.target.value
                                                                })}
                                                                className="px-4 py-2 text-base border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                                                            >
                                                                <option value="">Select Rating</option>
                                                                <option value="5">5 - Outstanding</option>
                                                                <option value="4">4 - Very Satisfactory</option>
                                                                <option value="3">3 - Satisfactory</option>
                                                                <option value="2">2 - Unsatisfactory</option>
                                                                <option value="1">1 - Poor</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Challenges Section */}
                    {currentSection === 'challenges' && (
                        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Challenges Encountered by Senior High School Teachers</h2>
                            <p className="text-base text-gray-600 mb-6">
                                Kindly tick (✓) the number of your choice that corresponds to your answer using the numerical value below. 
                                Please note that 4 is the highest and 1 is the lowest.
                            </p>
                            
                            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                                <table className="w-full text-base">
                                    <thead>
                                        <tr className="border-b-2 border-gray-300">
                                            <th className="text-left py-2 font-bold">Numerical Value</th>
                                            <th className="text-left py-2 font-bold">Descriptive Interpretation</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr><td className="py-1">4</td><td>Strongly Agree</td></tr>
                                        <tr><td className="py-1">3</td><td>Agree</td></tr>
                                        <tr><td className="py-1">2</td><td>Disagree</td></tr>
                                        <tr><td className="py-1">1</td><td>Strongly Disagree</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* KRA Navigation for Challenges */}
                            <div className="mb-6 bg-gradient-to-r from-white via-green-50 to-white rounded-2xl shadow-lg p-6 border-2 border-green-200">
                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Challenge Section</p>
                                    <h3 className="text-xl font-bold text-green-700">
                                        {challengesData[currentChallengeKra].kra}
                                    </h3>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                    {challengesData.map((section, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentChallengeKra(index)}
                                            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 shadow-md ${
                                                index === currentChallengeKra
                                                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105 ring-4 ring-green-200'
                                                    : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-700 hover:shadow-lg hover:scale-105 border-2 border-gray-200 hover:border-green-300'
                                            }`}
                                        >
                                            KRA {index + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Current KRA Challenges */}
                            <div className="space-y-3">
                                {challengesData[currentChallengeKra].items.map((item, itemIdx) => (
                                    <div key={itemIdx} className={`p-4 rounded-xl border-2 ${itemIdx % 2 === 0 ? 'bg-green-50' : 'bg-white'}`}>
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 w-10 h-10 bg-gray-600 text-white rounded-lg flex items-center justify-center font-bold">
                                                {itemIdx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-base text-gray-800 mb-3">{item}</p>
                                                <div className="flex gap-4">
                                                    {[4, 3, 2, 1].map((value) => (
                                                        <label key={value} className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name={`challenge_${currentChallengeKra}_${itemIdx}`}
                                                                value={value}
                                                                checked={data.challenges[`${currentChallengeKra}_${itemIdx}`] === value.toString()}
                                                                onChange={(e) => setData('challenges', {
                                                                    ...data.challenges,
                                                                    [`${currentChallengeKra}_${itemIdx}`]: e.target.value
                                                                })}
                                                                className="w-5 h-5 text-green-600 focus:ring-green-500"
                                                            />
                                                            <span className="text-base font-semibold text-gray-700">{value}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls Below */}
                            <div className="mt-6 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
                                <Button
                                    onClick={() => setCurrentChallengeKra(currentChallengeKra - 1)}
                                    disabled={currentChallengeKra === 0}
                                    variant="outline"
                                    className="px-6 py-3 text-base border-2 border-green-300 hover:bg-green-50 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                                >
                                    ← Previous KRA
                                </Button>
                                
                                <p className="text-lg text-gray-700 font-bold">
                                    KRA {currentChallengeKra + 1} of {challengesData.length}
                                </p>
                                
                                <Button
                                    onClick={() => setCurrentChallengeKra(currentChallengeKra + 1)}
                                    disabled={currentChallengeKra === challengesData.length - 1}
                                    variant="outline"
                                    className="px-6 py-3 text-base border-2 border-green-300 hover:bg-green-50 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                                >
                                    Next KRA →
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-8">
                        <Button
                            onClick={() => handleSubmit('draft')}
                            disabled={processing}
                            className="flex-1 px-8 py-4 text-lg font-bold bg-gray-600 hover:bg-gray-700 text-white rounded-xl shadow-lg"
                        >
                            <Save className="h-5 w-5 mr-2" />
                            Save as Draft
                        </Button>
                        <Button
                            onClick={() => handleSubmit('submitted')}
                            disabled={processing}
                            className="flex-1 px-8 py-4 text-lg font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl shadow-lg"
                        >
                            <Send className="h-5 w-5 mr-2" />
                            Submit Questionnaire
                        </Button>
                    </div>
                </main>
            </div>
        </TeacherLayout>
    );
}
