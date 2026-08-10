'use client';

import React from 'react';
import { Layers, Sparkles } from 'lucide-react';

export default function CanvasViewer({
    canvasRef,
    handleCanvasClick,
    pdfUrl,
    isDrawing,
    annotations,
    currentPoints
}) {
    return (
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs flex flex-col relative overflow-hidden">

            {/* Active Mapping Indicator Banner */}
            {isDrawing && pdfUrl && (
                <div className="mb-3  text-yellow-600 text-xs font-semibold px-4 py-2 rounded-xl flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-1">
                    <span>Mapping Active: Click corner points on the blueprint to outline room boundaries.</span>
                </div>
            )}

            {/* Interactive Drawing Canvas Layer Container */}
            <div
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="w-full flex-1 min-h-[480px] sm:min-h-[560px] bg-slate-900/5 border-2 border-dashed border-slate-300 rounded-2xl relative cursor-crosshair overflow-hidden flex items-center justify-center transition-colors"
            >
                {pdfUrl ? (
                    <iframe
                        src={`${pdfUrl.startsWith('blob:') || pdfUrl.startsWith('http') ? pdfUrl : `${process.env.NEXT_PUBLIC_API_URL}${pdfUrl}`}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                        className="absolute inset-0 w-full h-full pointer-events-none opacity-90 select-none object-contain"
                        title="Blueprint PDF Viewer"
                    />
                ) : annotations.length === 0 ? (
                    <div className="text-center p-8">
                        <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3 animate-bounce" />
                        <p className="font-bold text-slate-800 text-sm">No PDF Blueprint Loaded</p>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Upload an architectural floor plan file to begin professional room takeoffs.</p>
                    </div>
                ) : null}

                {/* SVG Overlay for Room Polygons & Active Vertex Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {annotations.map((ann, idx) => (
                        <g key={idx}>
                            <polygon
                                points={ann.points.map((p) => `${p.x},${p.y}`).join(' ')}
                                className="fill-blue-600/25 stroke-blue-600 stroke-2 hover:fill-blue-600/40 transition-all"
                            />
                            {ann.points.length > 0 && (
                                <foreignObject x={ann.points[0].x - 10} y={ann.points[0].y - 28} width="160" height="45">
                                    <div className="bg-slate-900/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-lg truncate border border-white/10">
                                        {ann.roomName}: {ann.area} sq.m
                                    </div>
                                </foreignObject>
                            )}
                        </g>
                    ))}

                    {/* Active Drawing Lines */}
                    {currentPoints.length > 0 && (
                        <>
                            <polyline
                                points={currentPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                                className="fill-none stroke-blue-600 stroke-2 stroke-dasharray-4"
                            />
                            {currentPoints.map((p, idx) => (
                                <circle key={idx} cx={p.x} cy={p.y} r="5.5" className="fill-blue-600 stroke-white stroke-2 shadow-sm" />
                            ))}
                        </>
                    )}
                </svg>
            </div>
        </div>
    );
}