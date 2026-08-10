'use client';

import React from 'react';
import { Trash2, Calculator, Sparkles, CheckCircle2, RotateCcw, IndianRupee } from 'lucide-react';

export default function BoqSidebar({
    isDrawing,
    roomName,
    setRoomName,
    handleSaveRoom,
    setCurrentPoints,
    annotations,
    handleDeleteAnnotation,
    totalFloorArea,
    estimatedCost
}) {
    return (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-slate-100">
                    <h2 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-blue-600" />
                        Bill of Quantities (BoQ)
                    </h2>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                        {annotations.length} Mapped
                    </span>
                </div>

                {/* Active Drawing Input Drawer */}
                {isDrawing && (
                    <div className="bg-blue-50/80 backdrop-blur-xs border border-blue-200 p-4 rounded-2xl mb-4 shadow-2xs animate-in fade-in slide-in-from-top-2 duration-200">
                        <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                            Map Room Boundary
                        </h3>
                        <input
                            type="text"
                            placeholder="Enter Room Name (e.g. Master Bedroom)"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-blue-300 rounded-xl text-xs font-medium mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs text-black"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleSaveRoom}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                            >
                                Save Room Polygon
                            </button>
                            <button
                                onClick={() => setCurrentPoints([])}
                                className="px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs rounded-xl font-medium cursor-pointer transition-colors"
                                title="Reset current points"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Mapped Rooms List */}
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                    {annotations.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-4">
                            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            <p className="text-xs font-semibold text-slate-600">No rooms mapped on canvas yet.</p>
                            <p className="text-[11px] text-slate-400 mt-1">Activate One Click Mapper and click vertex points around room boundaries.</p>
                        </div>
                    ) : (
                        annotations.map((ann, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 rounded-2xl transition-all shadow-2xs group"
                            >
                                <div className="min-w-0 pr-2">
                                    <h4 className="font-bold text-slate-900 text-xs truncate">{ann.roomName}</h4>
                                    <span className="text-[11px] text-blue-600 font-extrabold mt-0.5 inline-block">{ann.area} sq.m</span>
                                </div>
                                <button
                                    onClick={() => handleDeleteAnnotation(idx)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
                                    title="Remove Room Takeoff"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Aggregated Cost Consultancy Totals Banner */}
            <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                <div className="flex justify-between items-center mb-2 text-xs font-medium text-slate-600">
                    <span>Cumulative Floor Area:</span>
                    <span className="font-bold text-slate-900">{totalFloorArea.toFixed(2)} sq.m</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 pt-2 border-t border-slate-200/60">
                    <span>Estimated Fit-out Cost:</span>
                    <span className="font-extrabold text-blue-700 text-sm flex items-center">
                        <IndianRupee className="w-3.5 h-3.5 -mr-0.5" />
                        {estimatedCost.toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                    </span>
                </div>
            </div>
        </div>
    );
}