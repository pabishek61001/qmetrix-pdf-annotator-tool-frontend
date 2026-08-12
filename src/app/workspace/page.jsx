'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import PDFViewerCanvas from './components/PDFViewerCanvas';
import ProjectFormModal from './components/ProjectFormModal';
import BoqSidebar from '@/app/workspace/components/BoqSidebar';
import { Save, Loader2, FileUp, PencilRuler, AlertCircle } from 'lucide-react';
import { useToast } from '@/app/providers/ToastProvider';
import { calculatePolygonArea } from '@/app/utils/geometryUtils';

import AOS from 'aos';
import 'aos/dist/aos.css';

function WorkspaceContent() {
    const { addToast } = useToast();

    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [annotations, setAnnotations] = useState([]);
    const [pdfUrl, setPdfUrl] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [loadingProject, setLoadingProject] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPoints, setCurrentPoints] = useState([]);
    const [roomName, setRoomName] = useState('');

    const [showUnsavedWarningModal, setShowUnsavedWarningModal] = useState(false);

    const searchParams = useSearchParams();
    const projectId = searchParams.get('id');
    const router = useRouter();

    useEffect(() => {
        AOS.init({
            duration: 800, // animation duration
            once: true,    // whether animation should happen only once
        });
    }, []);


    // 1. Fetch project details & initialize baseline session comparison
    useEffect(() => {
        if (!projectId) return;

        let isMounted = true;
        const fetchProjectDetails = async () => {
            try {
                setLoadingProject(true);
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`);
                if (!res.ok) throw new Error('Failed to fetch project data');

                const project = await res.json();
                if (isMounted) {
                    let resolvedUrl = project.pdfUrl || '';
                    if (resolvedUrl && !resolvedUrl.startsWith('http') && !resolvedUrl.startsWith('blob:')) {
                        resolvedUrl = `${process.env.NEXT_PUBLIC_API_URL}${resolvedUrl.startsWith('/') ? '' : '/'}${resolvedUrl}`;
                    }
                    setPdfUrl(resolvedUrl);

                    const serverAnnotations = project.annotations || [];
                    setAnnotations(serverAnnotations);
                    setProjectName(project.name || '');
                    setProjectDescription(project.description || '');

                    // 🌟 Save server baseline to session storage
                    sessionStorage.setItem(`qmetrix_baseline_${projectId}`, JSON.stringify(serverAnnotations));

                    // 🌟 Check if there's an existing draft that differs from the server baseline
                    const savedDraft = sessionStorage.getItem(`qmetrix_draft_${projectId}`);
                    if (savedDraft) {
                        const parsedDraft = JSON.parse(savedDraft);
                        // Compare stringified JSON lengths or contents to see if user had un-synced edits
                        if (JSON.stringify(parsedDraft) !== JSON.stringify(serverAnnotations)) {
                            setAnnotations(parsedDraft); // Restore un-synced local work
                            setShowUnsavedWarningModal(true); // Trigger your custom modal!
                        }
                    }
                }
            } catch (err) {
                addToast('Failed to load saved project data.', 'error');
                router.push('/');
            } finally {
                if (isMounted) setLoadingProject(false);
            }
        };

        fetchProjectDetails();
        return () => { isMounted = false; };
    }, [projectId, router, addToast]);


    // 2. Continuous auto-save draft to session memory on every annotation change
    useEffect(() => {
        if (!projectId) return;
        // Only save draft if annotations exist
        if (annotations.length > 0) {
            sessionStorage.setItem(`qmetrix_draft_${projectId}`, JSON.stringify(annotations));
        }
    }, [annotations, projectId]);


    // 3. Handle clearing draft session storage once project is successfully saved/synced
    const clearDraftSession = () => {
        if (projectId) {
            sessionStorage.removeItem(`qmetrix_draft_${projectId}`);
            sessionStorage.removeItem(`qmetrix_baseline_${projectId}`);
        }
    };


    const handleSaveRoom = () => {
        if (!roomName.trim() || currentPoints.length < 3) {
            addToast('Please enter a room name and map at least 3 vertex points on the blueprint', 'error');
            return;
        }

        const calculatedArea = calculatePolygonArea(currentPoints.map(p => ({ x: p.x * 1000, y: p.y * 650 })));
        const newAnnotation = {
            roomName: roomName.trim(),
            area: calculatedArea,
            points: currentPoints,
        };

        setAnnotations([...annotations, newAnnotation]);
        setCurrentPoints([]);
        setRoomName('');
        setIsDrawing(false);
        setIsSidebarOpen(false); // Fixed typo from SidebarOpen icon to boolean state
        addToast('Room mapping saved successfully!', 'success');
    };

    const handleSaveProject = async ({ name, description }) => {
        try {
            setIsSaving(true);
            clearDraftSession()

            // Create a FormData object
            const formData = new FormData();

            formData.append('name', name);
            formData.append('description', description);

            if (pdfFile) {
                formData.append('pdfFile', pdfFile);
            }

            formData.append('annotations', JSON.stringify(annotations));

            let res;
            if (projectId) {
                if (!pdfFile) {
                    res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, description, annotations }),
                    });
                } else {
                    res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`, {
                        method: 'PUT',
                        body: formData,
                    });
                }
            } else {
                if (!pdfFile && !pdfUrl) {
                    addToast('Please upload a PDF blueprint first.', 'error');
                    setIsSaving(false);
                    return;
                }
                res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
                    method: 'POST',
                    body: formData,
                });
            }

            if (!res.ok) throw new Error('Save operation failed');

            addToast('Project saved successfully!', 'success');
            setIsModalOpen(false);
            router.push('/');
        } catch (err) {
            console.log('Error saving project:', err);
            addToast('Failed to save project.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAnnotation = (index) => {
        const updated = annotations.filter((_, i) => i !== index);
        setAnnotations(updated);
        addToast('Room mapping removed.', 'success');
    };

    const totalFloorArea = annotations.reduce((acc, curr) => acc + (curr.area || 0), 0);
    const estimatedCost = totalFloorArea * 125;

    return (
        <div className="min-h-screen bg-slate-200 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
            <Navbar title={projectId ? "Reopen & Edit Blueprint" : "New Blueprint Workspace"} />

            <main className="flex-1 max-w-[1600px] w-full mx-auto px-3 md:px-4 py-4 flex flex-col gap-6">
                {loadingProject ? (
                    <div className="flex-1 flex flex-col justify-center items-center py-32 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
                        <span className="text-slate-700 font-semibold text-sm sm:text-base">Restoring saved blueprint markings & polygon layers...</span>
                        <span className="text-slate-400 text-xs mt-1">Please wait while we fetch cloud assets.</span>
                    </div>
                ) : (
                    <>

                        {/* Hero / Action Header Banner */}
                        <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-950 via-indigo-150 to-slate-950 p-6 sm:p-6 shadow-blue-950/40 text-white ">
                            {/* 1. Architectural CAD Grid Pattern Overlay */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

                            {/* 2. Vibrant Multi-colored Ambient Lighting Blobs */}
                            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-600/30 blur-[90px] pointer-events-none" />
                            <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-[90px] pointer-events-none" />

                            {/* Left Side: Branding & Interactive Workflow Stepper */}
                            <div className="relative z-10 space-y-3 w-full lg:w-auto">
                                <div className="flex items-center gap-2.5">
                                    <span className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[9px] sm:text-[11px]  font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm backdrop-blur-md">
                                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                                        QMetrix QS Estimation Engine
                                    </span>
                                </div>

                                {/* Workflow Title Steps */}
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3.5">
                                    {/* Step 1 */}
                                    <div className="flex items-center gap-2 px-2 py-1 text-xl lg:text-2xl font-semibold md:font-extrabold text-slate-400">
                                        <FileUp className="w-5 h-5 text-slate-400 shrink-0" />
                                        <span className="text-slate-200 font-bold">Upload</span>pdf
                                    </div>

                                    <span className="text-slate-600 font-bold hidden sm:inline text-lg">→</span>

                                    {/* Step 2 */}
                                    <div className="flex items-center gap-2 px-2 py-1 text-xl lg:text-2xl font-semibold md:font-extrabold text-slate-400">
                                        <PencilRuler className="w-5 h-5 text-slate-400 shrink-0" />
                                        <span>Map &  </span> <span className="text-slate-200 font-bold" >Add</span>Room
                                    </div>

                                    <span className="text-slate-600 font-bold hidden sm:inline text-lg">→</span>

                                    {/* Step 3 */}
                                    <div className="flex items-center gap-2 px-2 py-1 text-xl lg:text-2xl font-semibold md:font-extrabold text-slate-400">
                                        <Save className="w-5 h-5 text-slate-400 shrink-0" />
                                        <span>Final</span> <span className="text-slate-200 font-bold">Save</span>
                                    </div>
                                </div>
                                <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-medium leading-relaxed hidden sm:block">
                                    Execute precise polygon takeoffs, calculate real-time surface areas, and generate bills of quantities seamlessly.
                                </p>
                            </div>

                            {/* Right Side: Live Metric Design Pills */}
                            <div className="relative z-10 flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">

                                {/* Architectural Live Metrics Pill */}
                                <div className="flex items-center justify-between sm:justify-start gap-4 bg-slate-900/90 border border-slate-800 px-5 py-3 rounded-2xl backdrop-blur-xl shadow-inner w-full sm:w-auto">
                                    <div className="text-left sm:text-right">
                                        <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Total Area</p>
                                        <p className="text-sm font-black text-cyan-400">{totalFloorArea.toFixed(2)} <span className="text-[10px] text-slate-400">sq.m</span></p>
                                    </div>

                                    <div className="h-7 w-px bg-slate-800"></div>

                                    <div className="text-left sm:text-right">
                                        <p className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Rooms Mapped</p>
                                        <p className="text-sm font-black text-emerald-400">{annotations.length} <span className="text-[10px] text-slate-400">Units</span></p>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Core Workspace Canvas */}
                        <div className="flex-1 flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-xs p-2 sm:p-4">
                            <PDFViewerCanvas
                                pdfUrl={pdfUrl}
                                setPdfUrl={setPdfUrl}
                                onPdfSelected={(file) => setPdfFile(file)}
                                annotations={annotations}
                                setAnnotations={setAnnotations}
                                isSidebarOpen={isSidebarOpen}
                                setIsSidebarOpen={setIsSidebarOpen}
                                onSaveClick={() => setIsModalOpen(true)}
                                projectId={projectId}
                                isDrawing={isDrawing}
                                setIsDrawing={setIsDrawing}
                                currentPoints={currentPoints}
                                setCurrentPoints={setCurrentPoints}
                            />
                        </div>
                    </>
                )}
            </main>

            {/* Global Workspace Slide-out Drawer Panel */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-50 transition-opacity"
                />
            )}

            <div className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[380px] lg:w-[480px] bg-white shadow-2xl border-l border-slate-200 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
                }`}>
                <BoqSidebar
                    isDrawing={isDrawing}
                    roomName={roomName}
                    setRoomName={setRoomName}
                    handleSaveRoom={handleSaveRoom}
                    setCurrentPoints={setCurrentPoints}
                    currentPointsLength={currentPoints.length}
                    annotations={annotations}
                    handleDeleteAnnotation={handleDeleteAnnotation}
                    totalFloorArea={totalFloorArea}
                    estimatedCost={estimatedCost}
                    onClose={() => setIsSidebarOpen(false)}
                />
            </div>

            {/* Save Project Modal Form */}
            <ProjectFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProject}
                isSaving={isSaving}
                initialData={projectId ? { name: projectName, description: projectDescription } : null}
            />

            {/* 🌟 Custom Unsaved Changes Warning Modal Popup */}
            {showUnsavedWarningModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                            <AlertCircle className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900">Unsaved Takeoff Changes!</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                You have mapped rooms in memory that have not been permanently saved. Click <span className="font-bold text-blue-600">"Final Save Project Now"</span> to secure your measurements to the database.
                            </p>
                        </div>
                        <div className="flex gap-2.5 pt-2">
                            <button
                                onClick={() => setShowUnsavedWarningModal(false)}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                            >
                                Continue Editing
                            </button>
                            <button
                                onClick={() => {
                                    setShowUnsavedWarningModal(false);
                                    setIsModalOpen(true); // Open the final save modal form directly
                                }}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                            >
                                Final Save Project Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function WorkspacePage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
            <WorkspaceContent />
        </Suspense>
    );
}