'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import PDFViewerCanvas from '../../components/PDFViewerCanvas';
import ProjectFormModal from '../../components/ProjectFormModal';
import { Save, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

function WorkspaceContent() {

    const { addToast } = useToast();

    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [annotations, setAnnotations] = useState([]);
    const [pdfUrl, setPdfUrl] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [loadingProject, setLoadingProject] = useState(false);

    const searchParams = useSearchParams();
    const projectId = searchParams.get('id');
    const router = useRouter();

    // Fetch project data using native fetch API for maximum speed
    useEffect(() => {
        if (!projectId) return;

        let isMounted = true;
        const fetchProjectDetails = async () => {
            try {
                setLoadingProject(true);
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${projectId}`);
                if (!res.ok) throw new Error('Failed to fetch project data');

                const project = await res.json();
                if (isMounted) {
                    setPdfUrl(project.pdfUrl || '');
                    setAnnotations(project.annotations || []);
                    setProjectName(project.name || '');             // <-- save name
                    setProjectDescription(project.description || ''); // <-- save description
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
    }, [projectId]);

    // Handle saving the new or updated project using native fetch
    const handleSaveProject = async ({ name, description, pdfFile }) => {
        try {
            setIsSaving(true);
            const formData = new FormData();

            formData.append('name', name);
            formData.append('description', description);
            if (pdfFile) formData.append('pdfFile', pdfFile);
            formData.append('annotations', JSON.stringify(annotations));

            let res;
            if (projectId) {
                res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${projectId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, description, annotations }),
                });
            } else {
                res = await fetch(process.env.NEXT_PUBLIC_API_URL, {
                    method: 'POST',
                    body: formData, // FormData automatically sets multipart/form-data boundary
                });
            }

            if (!res.ok) throw new Error('Save operation failed');

            addToast(projectId ? 'Project annotations updated successfully!' : 'New project saved successfully!', 'success');
            setIsModalOpen(false);
            router.push('/');
        } catch (err) {
            console.error('Error saving project:', err);
            addToast('Failed to save project. Check console for details.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
            <Navbar title={projectId ? "Reopen & Edit Blueprint" : "New Blueprint Workspace"} />

            <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
                {loadingProject ? (
                    <div className="flex-1 flex flex-col justify-center items-center py-32 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
                        <span className="text-slate-700 font-semibold text-sm sm:text-base">Restoring saved blueprint markings & polygon layers...</span>
                        <span className="text-slate-400 text-xs mt-1">Please wait while we fetch cloud assets.</span>
                    </div>
                ) : (
                    <>
                        {/* Premium Enterprise Header & Action Bar */}
                        <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-slate-950 via-indigo-150 to-blue-950 p-6 sm:p-10 shadow-blue-950/40 text-white flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 transition-all">

                            {/* Soft Decorative Ambient Glow */}
                            <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="relative z-10 space-y-2">
                                <div className="flex items-center gap-2.5">
                                    <span className="inline-flex items-center gap-2 bg-slate-800/80 text-blue-400 border border-slate-700/80 text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm backdrop-blur-xs">
                                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                                        {projectId ? 'Session Active • Live Editor' : 'New Takeoff Workspace'}
                                    </span>
                                    <span className="text-slate-600">•</span>
                                    <span className="text-xs font-semibold text-slate-400">QMetrix QS Engine</span>
                                </div>

                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                                    Interactive Room Estimation Canvas
                                </h2>

                                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
                                    Map architectural room boundaries using precise vertex coordinate capture to compute real-time areas and bills of quantities.
                                </p>
                            </div>

                            <div className="relative z-10 flex items-center gap-3 w-full lg:w-auto justify-end shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3.5 rounded-2xl shadow-md shadow-blue-900/30 transition-all text-xs sm:text-sm cursor-pointer active:scale-95 border border-blue-400/20"
                                >
                                    <Save className="w-4 h-4" />
                                    {projectId ? 'Update Project & Sync' : 'Save Project Takeoffs'}
                                </button>
                            </div>
                        </div>

                        {/* Core Canvas & PDF Viewer Workspace Component Container */}
                        <div className="flex-1 flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden p-2 sm:p-4">
                            <PDFViewerCanvas
                                pdfUrl={pdfUrl}
                                setPdfUrl={setPdfUrl}
                                annotations={annotations}
                                setAnnotations={setAnnotations}
                            />
                        </div>
                    </>
                )}
            </main>

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