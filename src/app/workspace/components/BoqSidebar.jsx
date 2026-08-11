'use client';

import React from 'react';
import { Trash2, Calculator, CheckCircle2, RotateCcw, IndianRupee, X, Layers } from 'lucide-react';

const ROOM_ACCENTS = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-purple-500',
    'bg-rose-500',
    'bg-indigo-500',
    'bg-teal-500',
];

export default function BoqSidebar({ isDrawing, roomName, setRoomName, handleSaveRoom, setCurrentPoints, currentPointsLength = 0, annotations, handleDeleteAnnotation, totalFloorArea, estimatedCost, onClose }) {
    return (
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 px-5 sm:px-5 py-5 shadow-2xl flex flex-col justify-between h-full min-h-[500px]">

            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <Calculator className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="font-extrabold text-slate-900 text-md sm:text-md tracking-tight">
                                Bill of Quantities
                            </h2>
                            <p className="text-[11px] text-slate-400 font-medium">Real-time Takeoff Estimator</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50/80 border border-blue-200/60 px-3 py-1 rounded-full shadow-2xs">
                            {annotations.length} Mapped
                        </span>
                        {onClose && (
                            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Active Drawing & Room Naming Input Box - Strictly All in a Single Row */}
                <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/50  p-3 rounded-2xl mb-5 shadow-xs flex flex-nowrap items-center gap-2.5 w-full">
                    <input
                        type="text"
                        placeholder="Room Name (e.g. Lobby)"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        className="flex-1 min-w-[120px] px-3 py-2.5 bg-white border border-blue-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs text-slate-900 placeholder:text-slate-400"
                    />
                    <button
                        onClick={handleSaveRoom}
                        className="bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold py-2.5 px-3.5 rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Save ({currentPointsLength} pts)</span>
                    </button>
                    <button
                        onClick={() => setCurrentPoints([])}
                        className="px-3 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs py-2.5 rounded-xl font-semibold cursor-pointer transition-colors flex items-center justify-center shrink-0"
                        title="Reset current points"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>

                {/* Mapped Rooms List */}
                <div className="space-y-2.5 max-h-[260px] lg:max-h-[260px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {annotations.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 p-4">
                            <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            <p className="text-xs font-bold text-slate-700">No rooms mapped yet</p>
                            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] mx-auto">Click room corners on the blueprint and save them here.</p>
                        </div>
                    ) : (
                        annotations.map((ann, idx) => {
                            const accentColor = ROOM_ACCENTS[idx % ROOM_ACCENTS.length];
                            return (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 rounded-2xl transition-all shadow-2xs group relative overflow-hidden"
                                >
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentColor}`}></div>
                                    <div className="min-w-0 pl-2 pr-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                                            <h4 className="font-bold text-slate-900 text-md truncate">{ann.roomName}</h4>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-blue-700 font-extrabold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                                {ann.area} sq.m
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteAnnotation(idx)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
                                        title="Remove Room Takeoff"
                                    >
                                        <Trash2 className="w-5 h-5 text-red-400" />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Aggregated Cost Consultancy Totals Banner */}
            <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-900 text-white p-4.5 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-2.5 text-xs font-medium text-slate-300">
                    <span>Cumulative Floor Area:</span>
                    <span className="font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700">
                        {totalFloorArea.toFixed(2)} sq.m
                    </span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-200 pt-2.5 border-t border-slate-800">
                    <span>Estimated Fit-out Cost:</span>
                    <span className="font-extrabold text-emerald-400 text-sm sm:text-base flex items-center">
                        <IndianRupee className="w-4 h-4 -mr-0.5" />
                        {estimatedCost.toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                    </span>
                </div>
            </div>
        </div>
    );
}