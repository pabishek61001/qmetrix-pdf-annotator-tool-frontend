'use client';

import React from 'react';
import { Layers, MoveHorizontal } from 'lucide-react';

// Distinct professional color palette for different room annotations
const ROOM_COLORS = [
    { fill: 'fill-blue-600/30', stroke: 'stroke-blue-700', badge: 'bg-blue-900/95 border-blue-400/30' },
    { fill: 'fill-emerald-600/30', stroke: 'stroke-emerald-700', badge: 'bg-emerald-900/95 border-emerald-400/30' },
    { fill: 'fill-amber-600/30', stroke: 'stroke-amber-700', badge: 'bg-amber-900/95 border-amber-400/30' },
    { fill: 'fill-purple-600/30', stroke: 'stroke-purple-700', badge: 'bg-purple-900/95 border-purple-400/30' },
    { fill: 'fill-rose-600/30', stroke: 'stroke-rose-700', badge: 'bg-rose-900/95 border-rose-400/30' },
    { fill: 'fill-indigo-600/30', stroke: 'stroke-indigo-700', badge: 'bg-indigo-900/95 border-indigo-400/30' },
    { fill: 'fill-teal-600/30', stroke: 'stroke-teal-700', badge: 'bg-teal-900/95 border-teal-400/30' },
];

export default function CanvasViewer({
    canvasRef,
    handleCanvasClick,
    pdfUrl,
    isDrawing,
    annotations,
    currentPoints
}) {
    return (
        <div className="w-full flex flex-col relative">
            {/* Active Mapping Banner */}
            <div className="mb-3  text-amber-800 text-xs font-semibold px-3 sm:px-4 py-2 rounded-xl flex items-center justify-end gap-2 shadow-2xs shrink-0 text-center">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                <span>{isDrawing ? 'Mapping Active: Click room boundaries directly on the floor plan.' : pdfUrl ? 'Ready. Click "One Click Room Mapper" to start.' : 'Please upload a PDF floor plan to begin.'}</span>
            </div>

            {/* Mobile Scroll Instruction Pill */}
            {pdfUrl && (
                <div className="flex sm:hidden items-center justify-center gap-1.5 text-[11px] text-slate-500 mb-2 font-medium bg-slate-100 py-1 rounded-lg">
                    <MoveHorizontal className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                    <span>Swipe horizontally to view full blueprint</span>
                </div>
            )}

            {/* Fully Scrollable Mobile Container with smooth touch momentum */}
            <div className="w-full bg-slate-900/5 border-2 border-dashed border-slate-300 rounded-2xl p-2 sm:p-4 flex items-center justify-start sm:justify-center overflow-x-auto overflow-y-hidden shadow-inner touch-pan-x [-webkit-overflow-scrolling:touch]">
                <div
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className="relative bg-white shadow-xl rounded-xl cursor-crosshair shrink-0 overflow-hidden"
                    style={{ width: '1000px', height: '650px', background: '#ffffff', minWidth: '1000px' }}
                >
                    {pdfUrl ? (
                        <iframe
                            src={`${pdfUrl.startsWith('blob:') || pdfUrl.startsWith('http') ? pdfUrl : `${process.env.NEXT_PUBLIC_API_URL}${pdfUrl}`}#toolbar=0&navpanes=0&scrollbar=0`}
                            title="Blueprint PDF Viewer"
                            className="absolute inset-0 w-full h-full z-0 select-none border-0 overflow-hidden pointer-events-none"
                        />
                        // <object
                        //     data={`${pdfUrl.startsWith('blob:') || pdfUrl.startsWith('http') ? pdfUrl : `${process.env.NEXT_PUBLIC_API_URL}${pdfUrl}`}#toolbar=0&navpanes=0&scrollbar=0`}
                        //     type="application/pdf"
                        //     className="absolute inset-0 w-full h-full pointer-events-none z-0 select-none block overflow-hidden"
                        // >
                        //     <embed
                        //         src={`${pdfUrl.startsWith('blob:') || pdfUrl.startsWith('http') ? pdfUrl : `${process.env.NEXT_PUBLIC_API_URL}${pdfUrl}`}`}
                        //         type="application/pdf"
                        //         className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
                        //     />
                        // </object>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-20 bg-white">
                            <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3 animate-bounce" />
                            <p className="font-bold text-slate-800 text-sm">No PDF Blueprint Loaded</p>
                            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Upload the floor plan PDF using the button above to begin room takeoffs.</p>
                        </div>
                    )}

                    {/* SVG Polygon Takeoff Overlay with distinct rotating colors */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden">
                        {annotations.map((ann, idx) => {
                            const colorScheme = ROOM_COLORS[idx % ROOM_COLORS.length];

                            return (
                                <g key={idx}>
                                    <polygon
                                        points={(ann.points || []).map((p) => `${p.x * 1000},${p.y * 650}`).join(' ')}
                                        className={`${colorScheme.fill} ${colorScheme.stroke} stroke-2 hover:opacity-80 transition-all pointer-events-auto`}
                                    />
                                    {ann.points && ann.points.length > 0 && (
                                        <foreignObject x={(ann.points[0].x * 1000) - 10} y={(ann.points[0].y * 650) - 32} width="160" height="45">
                                            <div className={`${colorScheme.badge} backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg truncate border`}>
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
                                    points={currentPoints.map((p) => `${p.x * 1000},${p.y * 650}`).join(' ')}
                                    className="fill-none stroke-blue-600 stroke-2 stroke-dasharray-4"
                                />
                                {currentPoints.map((p, idx) => (
                                    <circle
                                        key={idx}
                                        cx={p.x * 1000}
                                        cy={p.y * 650}
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