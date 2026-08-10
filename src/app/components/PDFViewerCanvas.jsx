'use client';

import React, { useState, useRef } from 'react';
import { MousePointer, Layers } from 'lucide-react';
import { calculatePolygonArea } from '@/app/utils/geometryUtils';
import { useToast } from './ToastProvider';
import CanvasViewer from './CanvasViewer';
import BoqSidebar from './BoqSidebar';

export default function PDFViewerCanvas({ pdfUrl, setPdfUrl, annotations, setAnnotations }) {

    const { addToast } = useToast();

    const [currentPoints, setCurrentPoints] = useState([]);
    const [roomName, setRoomName] = useState('');
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef(null);

    const handleLocalPdfUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            setPdfUrl(fileUrl);
        }
    };

    const handleCanvasClick = (e) => {
        if (!isDrawing) return;
        if (!canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setCurrentPoints(prevPoints => [...prevPoints, { x, y }]);
    };

    const handleSaveRoom = () => {
        if (!roomName.trim() || currentPoints.length < 3) {
            addToast('Please enter a room name and map at least 3 vertex points on the blueprint', 'error');
            return;
        }

        const calculatedArea = calculatePolygonArea(currentPoints);
        const newAnnotation = {
            roomName: roomName.trim(),
            area: calculatedArea,
            points: currentPoints,
        };

        setAnnotations([...annotations, newAnnotation]);
        setCurrentPoints([]);
        setRoomName('');
        setIsDrawing(false);
        addToast('Room mapping saved successfully!', 'success');
    };

    const handleDeleteAnnotation = (index) => {
        const updated = annotations.filter((_, i) => i !== index);
        setAnnotations(updated);
        addToast('Room mapping removed.', 'warning');
    };

    const totalFloorArea = annotations.reduce((acc, curr) => acc + (curr.area || 0), 0);
    const estimatedCost = totalFloorArea * 125;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full h-full">
            {/* Left / Center Container */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs flex flex-col relative overflow-hidden">

                {/* Toolbar Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center w-full mb-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            onClick={() => setIsDrawing(!isDrawing)}
                            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs cursor-pointer ${isDrawing
                                ? 'bg-blue-700 hover:bg-blue-800 text-white shadow-blue-700/20 ring-2 ring-blue-400/50'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                                }`}
                        >
                            <MousePointer className="w-4 h-4" />
                            {isDrawing ? 'Mapping Active: Click Vertices' : 'Activate "One Click" Room Mapper'}
                        </button>

                        {currentPoints.length > 0 && (
                            <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-800 border border-blue-200 px-3 py-2 rounded-xl font-semibold">
                                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                                Vertices: {currentPoints.length}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-end">
                        <label className="cursor-pointer bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-2xs flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-slate-500" />
                            Add/ Change PDF Blueprint
                            <input type="file" accept="application/pdf" onChange={handleLocalPdfUpload} className="hidden" />
                        </label>
                    </div>
                </div>

                <CanvasViewer
                    canvasRef={canvasRef}
                    handleCanvasClick={handleCanvasClick}
                    pdfUrl={pdfUrl}
                    isDrawing={isDrawing}
                    annotations={annotations}
                    currentPoints={currentPoints}
                />
            </div>

            {/* Right Panel: Bill of Quantities Sidebar */}
            <BoqSidebar
                isDrawing={isDrawing}
                roomName={roomName}
                setRoomName={setRoomName}
                handleSaveRoom={handleSaveRoom}
                setCurrentPoints={setCurrentPoints}
                annotations={annotations}
                handleDeleteAnnotation={handleDeleteAnnotation}
                totalFloorArea={totalFloorArea}
                estimatedCost={estimatedCost}
            />
        </div>
    );
}