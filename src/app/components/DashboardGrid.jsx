'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FileText, ArrowRight, Layers, Calendar, Calculator } from 'lucide-react';

export default function DashboardGrid({ projects }) {
    const router = useRouter();
    const safeProjects = Array.isArray(projects) ? projects : [];

    if (safeProjects.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 p-8 shadow-xs">
                <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-base font-bold text-slate-900">No saved projects found</h3>
                <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto mt-1 mb-6">
                    Get started by uploading a floor plan PDF and mapping room markings.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Desktop & Tablet Table View */}
            <div className="hidden md:block bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200/60 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                            <th className="py-4 px-6">Project Name</th>
                            <th className="py-4 px-6">Description / Survey Notes</th>
                            <th className="py-4 px-6">Room Takeoffs</th>
                            <th className="py-4 px-6">Created Date</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {safeProjects.map((project) => {
                            const formattedDate = project.createdAt
                                ? new Date(project.createdAt).toISOString().split('T')[0].split('-').reverse().join('/')
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
                                                <span className="text-[11px] text-slate-400">ID: {project._id.slice(-6)}</span>
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
                                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full w-fit border border-blue-200/60">
                                                <Calculator className="w-3 h-3" />
                                                {project.annotations?.length || 0} Rooms
                                            </span>
                                            <span className="text-[10px] text-slate-400 mt-1 pl-1">
                                                Area: {totalArea.toFixed(1)} sq.m
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            {formattedDate}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button
                                            onClick={() => router.push(`/workspace?id=${project._id}`)}
                                            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-blue-600 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer group-hover:shadow-md"
                                        >
                                            Reopen Project
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {safeProjects.map((project) => {
                    const formattedDate = project.createdAt
                        ? new Date(project.createdAt).toISOString().split('T')[0].split('-').reverse().join('/')
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
                                        <h3 className="font-extrabold text-slate-900 text-sm truncate max-w-[180px]">
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
                                <div className="space-y-0.5">
                                    <span className="text-slate-400 block">{formattedDate}</span>
                                    <span className="font-bold text-slate-700">{totalArea.toFixed(1)} sq.m total</span>
                                </div>
                                <button
                                    onClick={() => router.push(`/workspace?id=${project._id}`)}
                                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                                >
                                    Reopen
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}