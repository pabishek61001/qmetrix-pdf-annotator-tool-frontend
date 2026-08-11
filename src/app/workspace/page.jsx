'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import PDFViewerCanvas from '../components/PDFViewerCanvas';
import ProjectFormModal from '../components/ProjectFormModal';
import BoqSidebar from '@/app/components/BoqSidebar';
import { Save, Loader2, Calculator, PanelRightClose, PanelRightOpen, SidebarOpen, FileUp, PencilRuler } from 'lucide-react';
import { useToast } from '@/app/components/ToastProvider';
import { calculatePolygonArea } from '@/app/utils/geometryUtils';

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

    const searchParams = useSearchParams();
    const projectId = searchParams.get('id');
    const router = useRouter();

    // Prevent accidental page refresh/loss of unsaved takeoff work
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            // Trigger confirmation if there are unsaved annotations or active points
            if (annotations.length > 0 || currentPoints.length > 0) {
                e.preventDefault();
                e.returnValue = ''; // Required for modern browsers to display confirmation dialog
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [annotations, currentPoints]);

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
                    setAnnotations(project.annotations || []);
                    setProjectName(project.name || '');
                    setProjectDescription(project.description || '');
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
        <div className="min-h-screen bg-slate-300 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
            <Navbar title={projectId ? "Reopen & Edit Blueprint" : "New Blueprint Workspace"} />

            <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 py-7 flex flex-col gap-6">
                {loadingProject ? (
                    <div className="flex-1 flex flex-col justify-center items-center py-32 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
                        <span className="text-slate-700 font-semibold text-sm sm:text-base">Restoring saved blueprint markings & polygon layers...</span>
                        <span className="text-slate-400 text-xs mt-1">Please wait while we fetch cloud assets.</span>
                    </div>
                ) : (
                    <>
                        {/* Premium Enterprise Header & Action Bar */}
                        <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 p-6 sm:p-8 shadow-xl text-white flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            {/* Soft Decorative Ambient Glow */}
                            <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="relative z-10 space-y-2">
                                <div className="flex items-center gap-2.5">
                                    {/* <span className="inline-flex items-center gap-2 bg-slate-800/80 text-blue-400 border border-slate-700/80 text-[11px] font-bold px-3.5 py-1 rounded-full shadow-sm backdrop-blur-xs">
                                        QMetrix QS Engine
                                    </span> */}
                                    <span className="text-slate-600">•</span>
                                    <span className="text-xs font-semibold text-slate-400">QMetrix QS Engine</span>
                                </div>
                                <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex flex-wrap items-center gap-2 sm:gap-3.5">
                                    {/* Step 1: Upload */}
                                    <span className="flex items-center gap-1.5 sm:gap-2 text-slate-300">
                                        <FileUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300 shrink-0" />
                                        Upload
                                    </span>

                                    {/* Separator */}
                                    <span className="text-slate-600 font-medium hidden sm:inline">/</span>

                                    {/* Step 2: Add Room */}
                                    <span className="flex items-center gap-1.5 sm:gap-2 text-slate-300">
                                        <PencilRuler className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-300 shrink-0" />
                                        Add Room
                                    </span>

                                    {/* Separator */}
                                    <span className="text-slate-600 font-medium hidden sm:inline">/</span>

                                    {/* Step 3: Save */}
                                    <span className="flex items-center gap-1.5 sm:gap-2 text-slate-300">
                                        <Save className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300 shrink-0" />
                                        Save
                                    </span>
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
                                    Map architectural room boundaries using precise vertex coordinate capture to compute real-time areas and bills of quantities.
                                </p>
                            </div>

                            {/* Right Side Live Metric Design Pills & Save CTA */}
                            <div className="relative z-10 flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto justify-end shrink-0 pt-1 lg:pt-0 border-t lg:border-t-0 border-slate-800">

                                {/* Architectural Live Metrics Design Pill */}
                                <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-inner">
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Area</p>
                                        <p className="text-xs font-extrabold text-blue-400">{totalFloorArea.toFixed(2)} sq.m</p>
                                    </div>
                                    <div className="h-6 w-px bg-slate-800"></div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rooms Mapped</p>
                                        <p className="text-xs font-extrabold text-emerald-400">{annotations.length} Units</p>
                                    </div>
                                </div>

                                {/* Save Project Button */}
                                {/* <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3.5 rounded-2xl shadow-md shadow-blue-900/35 transition-all text-xs sm:text-sm cursor-pointer active:scale-95 border border-blue-400/20"
                                >
                                    <Save className="w-4 h-4" />
                                    {projectId ? 'Update Project & Sync' : 'Save Project Takeoffs'}
                                </button> */}
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