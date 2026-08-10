'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layers, ArrowLeft, ShieldCheck, FolderKanban, PlusCircle, Menu, X } from 'lucide-react';

export default function Navbar({ showBack = true, title = "PDF Annotation Tool" }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-xs transition-all">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 py-10 flex items-center justify-between gap-2">

                    {/* Left Side: Navigation Back & App Identity */}
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        {showBack && (
                            <Link
                                href="/"
                                className="group flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-xl font-medium text-xs transition-all border border-slate-200 shrink-0"
                                title="Back to Dashboard"
                            >
                                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                                <span className="hidden xs:inline">Dashboard</span>
                            </Link>
                        )}

                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-sm shadow-blue-500/20 shrink-0">
                                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight truncate">{title}</h1>
                                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate hidden sm:block">QMetrix Cost Consultancy & QS Systems</p>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex items-center gap-2">
                        <Link
                            href="/"
                            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                            <FolderKanban className="w-4 h-4 text-blue-600" />
                            Projects
                        </Link>
                        <Link
                            href="/workspace"
                            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                            <PlusCircle className="w-4 h-4 text-blue-600" />
                            New Takeoff
                        </Link>
                    </div>

                    {/* Right Side: Status Badges & Mobile Hamburger Toggle */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="hidden sm:flex items-center gap-2 bg-blue-50 text-emerald-700 font-semibold text-xs px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            System Live & Ready
                        </div>

                        {/* Mobile Drawer Toggle Button */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
                            aria-label="Open Navigation Menu"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>

                </div>
            </header>

            {/* Mobile Slide-Over Drawer */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    {/* Backdrop Overlay */}
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Drawer Content */}
                    <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 p-6">
                        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-600 text-white p-2 rounded-xl">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">QMetrix Systems</h3>
                                    <p className="text-[10px] text-slate-500">Navigation Menu</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Drawer Navigation Links */}
                        <div className="py-6 space-y-2 flex-1">
                            <Link
                                href="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                            >
                                <FolderKanban className="w-5 h-5 text-blue-600" />
                                Projects Dashboard
                            </Link>
                            <Link
                                href="/workspace"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                            >
                                <PlusCircle className="w-5 h-5 text-blue-600" />
                                New Blueprint Takeoff
                            </Link>
                        </div>

                        {/* Drawer Footer Status */}
                        <div className="pt-6 border-t border-slate-100 space-y-3">
                            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <ShieldCheck className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-semibold text-slate-700">Production Mode Active</span>
                            </div>
                            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 font-semibold text-xs px-3.5 py-2 rounded-xl border border-blue-200">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                                </span>
                                System Live & Ready
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}