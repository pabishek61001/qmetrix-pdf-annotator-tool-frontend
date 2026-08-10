'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Save, Loader2 } from 'lucide-react';
import { useToast } from './ToastProvider';

export default function ProjectFormModal({ isOpen, onClose, onSave, isSaving, initialData }) {

    const { addToast } = useToast();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [pdfFile, setPdfFile] = useState(null);

    // Populate fields when modal opens or initialData changes
    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setDescription(initialData.description || '');
        } else {
            setName('');
            setDescription('');
        }
        setPdfFile(null);
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            addToast('Please enter a project name.', 'error');
            return;
        }

        if (!description.trim()) {
            addToast('Please enter description or survey notes.', 'error');
            return;
        }

        // If it's a completely new project AND no file is attached, throw error. 
        // If initialData exists, the project already has a stored pdfUrl in the cloud, so pdfFile is optional.
        if (!initialData && !pdfFile) {
            addToast('Please upload a PDF blueprint file.', 'error');
            return;
        }

        onSave({ name, description, pdfFile });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            addToast('Invalid file format. Please upload a valid PDF document.', 'error');
            e.target.value = '';
            setPdfFile(null);
            return;
        }

        const maxSizeInBytes = 500 * 1024; // 500 KB
        if (file.size > maxSizeInBytes) {
            addToast('Blueprint file size must not exceed 500 KB.', 'warning');
            e.target.value = '';
            setPdfFile(null);
            return;
        }

        setPdfFile(file);
        addToast('PDF blueprint attached successfully!', 'success');
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">
                        {initialData ? 'Update Annotated Project' : 'Save Annotated Project'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Project / Blueprint Name
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Ground Floor Plan - Block A"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Description / Survey Notes
                        </label>
                        <textarea
                            placeholder="Enter details about room estimations and measurements..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-black"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Upload PDF Blueprint File (Max 500 KB) {initialData ? <span className="text-slate-400 font-normal">(Optional if unchanged)</span> : <span className="text-red-500">*</span>}
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100/80 transition-all">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                                    <Upload className="w-7 h-7 text-blue-600 mb-2" />
                                    <p className="text-xs font-semibold text-slate-700 text-center truncate max-w-xs">
                                        {pdfFile ? pdfFile.name : initialData ? 'Keep existing PDF or click to replace' : 'Click to select blueprint PDF file'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Strictly PDF • Maximum 500 KB</p>
                                </div>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving Project...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {initialData ? 'Update & Sync Project' : 'Confirm & Save'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}