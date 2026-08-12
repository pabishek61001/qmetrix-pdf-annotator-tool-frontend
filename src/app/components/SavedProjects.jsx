'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, ArrowRight, Layers, Calendar, Calculator, Trash2, AlertTriangle, X, PlusCircle } from 'lucide-react';

export default function SavedProjects({ projects }) {

    const safeProjects = Array.isArray(projects) ? projects : [];

    // State to manage custom delete confirmation modal
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Reusable delete execution function
    const confirmAndDelete = async () => {
        if (!projectToDelete) return;

        try {
            setIsDeleting(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectToDelete._id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                window.location.reload();
            } else {
                alert('Failed to delete project from server.');
                setIsDeleting(false);
                setProjectToDelete(null);
            }
        } catch (err) {
            console.error('Error deleting project:', err);
            alert('An error occurred while deleting the project.');
            setIsDeleting(false);
            setProjectToDelete(null);
        }
    };

    if (safeProjects.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 p-4 md:p-8 shadow-xs">
                <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-base font-bold text-slate-500">No saved projects found</h3>
                <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto mt-1 mb-6">
                    Get started by
                    <strong className="font-bold text-black  px-1.5 py-0.5 rounded ">uploading</strong>
                    a floor plan PDF,
                    <strong className="font-bold text-black  px-1.5 py-0.5 rounded">mapping</strong>
                    room markings, and finally
                    <strong className="font-bold text-black  px-1.5 py-0.5 rounded">saving</strong>
                    to create your project.
                </p>

                {/* Right Side: Action CTA */}
                <Link
                    href="/workspace"
                    className="group relative z-10 flex items-center justify-center gap-2.5 text-blue-500 font-semibold px-6 py-2 rounded-xl transition-all duration-300 hover:-translate-y-0.5 shrink-0 cursor-pointer active:scale-95 text-sm sm:text-md border border-blue-800/20 w-fit mx-auto "
                >
                    <PlusCircle className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
                    Create New Blueprint Project
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full mb-30">
            {/* Desktop & Tablet Table View */}
            <div className="hidden lg:block bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 text-xs font-bold uppercase ">
                            <th className="py-4 px-6 bg-slate-200">Project Name</th>
                            <th className="py-4 px-6 bg-slate-200">Description / Survey Notes</th>
                            <th className="py-4 px-6 bg-slate-200">Room Takeoffs</th>
                            <th className="py-4 px-6 bg-slate-200">Created Date</th>
                            <th className="py-4 px-6 text-right bg-slate-200">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {safeProjects.map((project) => {
                            const formattedDate = project.createdAt
                                ? new Date(project.createdAt).toLocaleString('en-GB', {
                                    dateStyle: 'short',
                                    timeStyle: 'short',
                                    hour12: true,
                                })
                                : 'N/A';

                            const totalArea = (project.annotations || []).reduce((acc, a) => acc + (a.area || 0), 0);

                            return (
                                <tr
                                    key={project._id}
                                    className="hover:bg-slate-50/60 transition-colors group"
                                >
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <Layers className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate max-w-[220px]">
                                                    {project.name}
                                                </h4>
                                                <span className="text-xs text-slate-400">ID: {project._id.slice(-6)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 max-w-xs">
                                        <p className="text-slate-600 text-xs truncate">
                                            {project.description || 'No description provided.'}
                                        </p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg w-fit border border-blue-200/60">
                                                <Calculator className="w-3 h-3" />
                                                {project.annotations?.length || 0} Rooms
                                            </span>
                                            <span className="text-xs text-slate-400 mt-1 pl-1">
                                                Area: {totalArea.toFixed(1)} sq.m
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            {formattedDate}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setProjectToDelete(project)}
                                                className="p-2.5 text-slate-400 hover:text-red-600  hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-slate-200/60 bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>

                                            <Link
                                                href={`/workspace?id=${project._id}`}
                                                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-blue-600 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer group-hover:shadow-md"
                                            >
                                                Reopen
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
                {safeProjects.map((project) => {
                    const formattedDate = project.createdAt
                        ? new Date(project.createdAt).toLocaleString('en-GB', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                            hour12: true,
                        })
                        : 'N/A';

                    const totalArea = (project.annotations || []).reduce((acc, a) => acc + (a.area || 0), 0);

                    return (
                        <div
                            key={project._id}
                            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between gap-4"
                        >
                            <div>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                            <Layers className="w-4 h-4" />
                                        </div>
                                        <h3 className="font-extrabold text-slate-900 text-md truncate max-w-[180px] capitalize">
                                            {project.name}
                                        </h3>
                                    </div>
                                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/60">
                                        {project.annotations?.length || 0} Rooms
                                    </span>
                                </div>
                                <p className="text-slate-600 text-xs line-clamp-2 mt-1">
                                    {project.description || 'No description provided.'}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                                <div className="space-y-0.5 text-sm">
                                    <span className="text-slate-400 block">{formattedDate}</span>
                                    <span className="font-bold text-slate-700">{totalArea.toFixed(1)} sq.m total</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setProjectToDelete(project)}
                                        className="p-2.5 text-slate-400 hover:text-red-600  hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-slate-200/60 bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </button>

                                    <Link
                                        href={`/workspace?id=${project._id}`}
                                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                                    >
                                        Reopen
                                        <ArrowRight className="w-3.5 h-3.5 " />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Custom Delete Confirmation Modal Popup */}
            {projectToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <button
                                onClick={() => setProjectToDelete(null)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5 cursor-pointer" />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-extrabold text-slate-900">
                                Confirm your deletion
                            </h3>
                            <p className="text-slate-600 text-sm sm:text-sm leading-relaxed">
                                Are you sure you want to delete <span className="font-bold text-slate-900">"{projectToDelete.name}"</span>? This action is permanent and will remove all associated room takeoffs from the cloud database.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setProjectToDelete(null)}
                                disabled={isDeleting}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmAndDelete}
                                disabled={isDeleting}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? 'Deleting...' : 'Yes, Delete Project'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}