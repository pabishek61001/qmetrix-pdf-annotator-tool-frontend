'use client';

import React, { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker for pdfjs-dist
if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

const ROOM_COLORS = [
    { fill: 'fill-blue-600/30', stroke: 'stroke-blue-700', badge: 'bg-blue-900/95 border-blue-400/30' },
    { fill: 'fill-emerald-600/30', stroke: 'stroke-emerald-700', badge: 'bg-emerald-900/95 border-emerald-400/30' },
    { fill: 'fill-amber-600/30', stroke: 'stroke-amber-700', badge: 'bg-amber-900/95 border-amber-400/30' },
    { fill: 'fill-purple-600/30', stroke: 'stroke-purple-700', badge: 'bg-purple-900/95 border-purple-400/30' },
    { fill: 'fill-rose-600/30', stroke: 'stroke-rose-700', badge: 'bg-rose-900/95 border-rose-400/30' },
    { fill: 'fill-indigo-600/30', stroke: 'stroke-indigo-700', badge: 'bg-indigo-900/95 border-indigo-400/30' },
    { fill: 'fill-teal-600/30', stroke: 'stroke-teal-700', badge: 'bg-teal-900/95 border-teal-400/30' },
];

export default function CanvasViewer({ canvasRef, handleCanvasClick, pdfUrl, isDrawing, annotations, currentPoints }) {


    const [isMobile, setIsMobile] = useState(false);
    const [mobileCanvasData, setMobileCanvasData] = useState(null);
    const [activeHoverIdx, setActiveHoverIdx] = useState(null);


    // Detect mobile device on mount
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent));
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);


    // Render PDF to a fast image data URL on mobile preserving true PDF aspect ratio
    useEffect(() => {
        if (!pdfUrl || !isMobile) return;

        let isMounted = true;
        const renderPdfToImage = async () => {
            try {
                const resolvedUrl = pdfUrl.startsWith('blob:') || pdfUrl.startsWith('http')
                    ? pdfUrl
                    : `${process.env.NEXT_PUBLIC_API_URL}${pdfUrl}`;

                if (!resolvedUrl) return;

                const loadingTask = pdfjsLib.getDocument({ url: resolvedUrl });
                const pdfDoc = await loadingTask.promise;
                const page = await pdfDoc.getPage(1);

                const unscaledViewport = page.getViewport({ scale: 1.0 });
                const targetWidth = 1000;
                const calculatedHeight = Math.round((unscaledViewport.height / unscaledViewport.width) * targetWidth);

                const renderScale = targetWidth / unscaledViewport.width;
                const viewport = page.getViewport({ scale: renderScale });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = targetWidth;
                canvas.height = calculatedHeight;

                await page.render({ canvasContext: context, viewport }).promise;

                if (isMounted) {
                    setMobileCanvasData({
                        url: canvas.toDataURL('image/jpeg', 0.85),
                        height: calculatedHeight
                    });
                }
            } catch (err) {
                console.error("Mobile PDF rendering error:", err);
            }
        };

        renderPdfToImage();
        return () => { isMounted = false; };
    }, [pdfUrl, isMobile]);


    const finalPdfSrc = pdfUrl && (pdfUrl.startsWith('blob:') || pdfUrl.startsWith('http')) ? pdfUrl : `${process.env.NEXT_PUBLIC_API_URL}${pdfUrl}`;

    return (
        <div className="w-full flex flex-col relative">
            {/* Active Mapping Banner */}
            <div className="mb-3 text-amber-800 text-xs font-semibold px-3 sm:px-4 py-2 rounded-2xl flex items-center justify-start gap-2 shadow-2xs shrink-0 text-center">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                <span>{isDrawing ? 'Mapping Active: Click room boundaries directly on the floor plan.' : pdfUrl ? 'Ready. Click "One Click Room Mapper" to start.' : 'Please upload a PDF floor plan to begin.'}</span>
            </div>

            {/* Scrollable Container with dynamic touch action behavior */}
            <div className="w-full bg-slate-900/5 border-2 border-dashed border-slate-300 rounded-2xl p-2 sm:p-4 flex items-center justify-start sm:justify-center overflow-auto shadow-inner">
                <div
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className={`relative bg-white shadow-xl rounded-xl shrink-0 overflow-hidden ${isDrawing ? 'cursor-crosshair touch-none' : 'cursor-default touch-auto'}`}
                    style={{
                        width: '1000px',
                        height: isMobile && mobileCanvasData?.height ? `${mobileCanvasData.height}px` : '650px',
                        background: '#ffffff',
                        minWidth: '1000px'
                    }}
                >
                    {pdfUrl ? (
                        isMobile ? (
                            mobileCanvasData?.url ? (
                                <img
                                    src={mobileCanvasData.url}
                                    alt="Mobile Blueprint Render"
                                    className="absolute inset-0 w-full h-full z-0 select-none pointer-events-none object-fill"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-xs font-semibold text-slate-500 animate-pulse">
                                    Rendering Mobile Blueprint Engine...
                                </div>
                            )
                        ) : (
                            <iframe
                                src={`${finalPdfSrc}#toolbar=0&navpanes=0&scrollbar=0`}
                                title="Blueprint PDF Viewer"
                                className="absolute inset-0 w-full h-full z-0 select-none border-0 overflow-hidden pointer-events-none"
                            />
                        )
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-20 bg-white">
                            <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3 animate-bounce" />
                            <p className="font-bold text-slate-800 text-sm">No PDF Blueprint Loaded</p>
                            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Upload the floor plan PDF using the button above to begin room takeoffs.</p>
                        </div>
                    )}

                    {/* SVG Polygon Takeoff Overlay */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden">
                        {annotations.map((ann, idx) => {
                            const colorScheme = ROOM_COLORS[idx % ROOM_COLORS.length];
                            const isSelected = activeHoverIdx === idx;
                            const currentHeight = isMobile && mobileCanvasData?.height ? mobileCanvasData.height : 650;

                            return (
                                <g key={idx}>
                                    <polygon
                                        points={(ann.points || []).map((p) => `${p.x * 1000},${p.y * currentHeight}`).join(' ')}
                                        className={`${colorScheme.fill} ${colorScheme.stroke} stroke-2 hover:opacity-90 transition-all pointer-events-auto cursor-pointer`}
                                        onMouseEnter={() => setActiveHoverIdx(idx)}
                                        onMouseLeave={() => setActiveHoverIdx(null)}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveHoverIdx(isSelected ? null : idx);
                                        }}
                                    />

                                    {ann.points && ann.points.length > 0 && (
                                        <foreignObject
                                            x={(ann.points[0].x * 1000) - 10}
                                            y={(ann.points[0].y * currentHeight) - 32}
                                            width="160"
                                            height="45"
                                            className={`transition-all duration-200 pointer-events-none ${isSelected ? 'opacity-100 z-50 scale-105' : 'opacity-0 hover:opacity-100'}`}
                                        >
                                            <div className={`${colorScheme.badge} backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-xl truncate border ring-2 ring-white/25`}>
                                                {ann.roomName}: {ann.area} sq.m
                                            </div>
                                        </foreignObject>
                                    )}
                                </g>
                            );
                        })}

                        {/* Active Drawing Lines */}
                        {currentPoints.length > 0 && (
                            <>
                                <polyline
                                    points={currentPoints.map((p) => `${p.x * 1000},${p.y * (isMobile && mobileCanvasData?.height ? mobileCanvasData.height : 650)}`).join(' ')}
                                    className="fill-none stroke-blue-600 stroke-2"
                                />
                                {currentPoints.map((p, idx) => (
                                    <circle
                                        key={idx}
                                        cx={p.x * 1000}
                                        cy={p.y * (isMobile && mobileCanvasData?.height ? mobileCanvasData.height : 650)}
                                        r="6"
                                        className="fill-blue-600 stroke-white stroke-2 shadow-sm"
                                    />
                                ))}
                            </>
                        )}
                    </svg>
                </div>
            </div>
        </div>
    );
}