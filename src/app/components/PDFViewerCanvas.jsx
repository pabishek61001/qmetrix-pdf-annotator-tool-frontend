'use client';

import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import { Layers, PanelRightClose, PanelRightOpen, Calculator, Save, MousePointerClick, File } from 'lucide-react';
import { useToast } from './ToastProvider';

const CanvasViewer = dynamic(() => import('./CanvasViewer'), {
    ssr: false,
    loading: () => (
        <div className="w-full flex-1 min-h-[500px] flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs font-semibold">
            Loading PDF Rendering Engine...
        </div>
    )
});

export default function PDFViewerCanvas({
    pdfUrl,
    setPdfUrl,
    onPdfSelected,
    annotations,
    setAnnotations,
    isSidebarOpen,
    setIsSidebarOpen,
    onSaveClick,
    projectId,
    isDrawing,
    setIsDrawing,
    currentPoints,
    setCurrentPoints
}) {
    const { addToast } = useToast();
    const canvasRef = useRef(null);
    const mapperButtonRef = useRef(null);

    const handleLocalPdfUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            setPdfUrl(fileUrl);
            if (onPdfSelected) onPdfSelected(file);
            addToast('PDF Blueprint loaded successfully!', 'success');
        }
    };

    const handleCanvasClick = (e) => {
        if (!isDrawing) return;
        if (!canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const xPercent = clickX / rect.width;
        const yPercent = clickY / rect.height;

        setCurrentPoints(prevPoints => [...prevPoints, { x: xPercent, y: yPercent }]);
    };

    return (
        <div className="flex flex-col gap-4 sm:gap-6 w-full h-full relative" ref={mapperButtonRef}
        >
            <div className="w-full bg-white rounded-2xl sm:rounded-3xlflex flex-col relative ">

                {/* Sticky Toolbar with responsive mobile icon/text layout */}
                <div className="sticky top-16 md:top-16 z-40 w-full mb-4  backdrop-blur-xl p-3 sm:p-3.5 border border-slate-200/80 bg-white flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 transition-all">

                    {/* Left Group: Mapper Button & Points Counter */}
                    <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 w-full md:w-auto">


                        <button
                            ref={mapperButtonRef}
                            onClick={() => {
                                if (!pdfUrl) {
                                    addToast('Please upload a PDF blueprint first!', 'error');
                                    return;
                                }
                                const nextState = !isDrawing;
                                setIsDrawing(nextState);
                                // if (nextState && setIsSidebarOpen) setIsSidebarOpen(true);
                                mapperButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }}
                            className={`group relative flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all duration-300 cursor-pointer shadow-lg active:scale-95 ${isDrawing
                                ? 'bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 text-white shadow-emerald-600/30 ring-2 ring-emerald-400/60 border border-emerald-400'
                                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 hover:from-blue-500 hover:to-purple-600 text-white shadow-indigo-900/30 border border-blue-400/35'
                                }`}
                        >
                            {isDrawing ? (
                                <span className="relative flex h-2.5 w-2.5 items-center justify-center shrink-0">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-200 opacity-75"></span>
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                                </span>
                            ) : (
                                <span className="relative flex h-2 w-2 rounded-full bg-cyan-300 shrink-0 shadow-[0_0_8px_#38bdf8]"></span>
                            )}

                            {/* Shortened text on mobile screens, full descriptive text on desktop */}
                            <span className="truncate flex items-center gap-1.5 drop-shadow-xs">
                                <MousePointerClick className="w-3.5 h-3.5" />
                                <span className="sm:hidden">{isDrawing ? 'Mapping...' : 'One Click Room Mapper'}</span>
                                <span className="hidden sm:inline">{isDrawing ? 'Mapping Active: Click Room Vertices' : 'One Click Room Mapper'}</span>
                            </span>
                        </button>

                        {currentPoints.length > 0 && (
                            <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-2 rounded-xl font-semibold shrink-0">
                                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                                <span>Pts: {currentPoints.length}/3</span>
                            </span>
                        )}
                    </div>

                    {/* Right Group: Change PDF, Save, and BoQ Toggle with Meaningful Color Naming */}
                    <div className="flex items-center gap-2 justify-end w-full md:w-auto">

                        {/* Change / Upload PDF Button (Emerald / File Theme) */}
                        <label className="cursor-pointer flex-1 sm:flex-initial text-center bg-emerald-950 hover:bg-emerald-900 text-emerald-100 border border-emerald-800/80 text-xs font-semibold px-3 sm:px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 group">
                            <File className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">
                                <span className="sm:hidden">{pdfUrl ? 'PDF' : 'Upload'}</span>
                                <span className="hidden sm:inline">{pdfUrl ? 'Change PDF' : 'Upload PDF *'}</span>
                            </span>
                            <input type="file" accept="application/pdf" onChange={handleLocalPdfUpload} className="hidden" />
                        </label>

                        {/* Toggle BoQ Drawer Button (Violet / Calculation Theme) */}
                        {setIsSidebarOpen && (
                            <button
                                onClick={() => setIsSidebarOpen((prev) => !prev)}
                                className="flex-1 sm:flex-initial bg-violet-950 hover:bg-violet-900 text-violet-100 border border-violet-800/80 p-2.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 text-xs font-semibold px-3 z-20 shrink-0 group"
                                title="Toggle BoQ & Room Manager"
                            >
                                <Calculator className="w-4 h-4 hidden md:block text-violet-300" />

                                {/* Responsive Text Layout */}
                                <span className="sm:hidden">+ Room</span>
                                <span className="hidden sm:inline">Room Takeoffs / BoQ ({annotations.length})</span>

                                {isSidebarOpen ? (
                                    <PanelRightClose className="w-4 h-4 ml-0.5 text-violet-300" />
                                ) : (
                                    <PanelRightOpen className="w-4 h-4 ml-0.5 text-violet-300" />
                                )}
                            </button>
                        )}
                        {/* Save Project Button (Action Blue / Sync Theme) */}
                        {onSaveClick && (
                            <button
                                onClick={onSaveClick}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 sm:px-4 py-2.5 rounded-xl shadow-md transition-all text-xs cursor-pointer active:scale-95 border border-blue-400/30 shrink-0"
                            >
                                <Save className="w-3.5 h-3.5 text-white" />
                                <span className="truncate">
                                    <span className="sm:hidden">Save</span>
                                    <span className="hidden sm:inline">{projectId ? 'Update & Sync' : 'Save Takeoffs'}</span>
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Canvas Container */}
                <div className="relative w-full flex-1">
                    <CanvasViewer
                        canvasRef={canvasRef}
                        handleCanvasClick={handleCanvasClick}
                        pdfUrl={pdfUrl}
                        isDrawing={isDrawing}
                        annotations={annotations}
                        currentPoints={currentPoints}
                    />
                </div>
            </div>
        </div>
    );
}