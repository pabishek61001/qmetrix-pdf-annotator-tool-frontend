'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Automatically remove after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {/* Professional Toast Notification Stack */}
            <div className="fixed top-6 right-0 md:right-6 z-50 flex flex-col gap-3 w-full md:max-w-sm  px-4 pointer-events-none">
                {toasts.map((toast) => {
                    const isSuccess = toast.type === 'success';
                    const isWarning = toast.type === 'warning';
                    const isError = toast.type === 'error';

                    return (
                        <div
                            key={toast.id}
                            className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-md border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${isSuccess
                                ? 'bg-emerald-50/95 text-slate-900 border-emerald-300 shadow-emerald-600/10'
                                : isWarning
                                    ? 'bg-amber-50/95 text-slate-900 border-amber-300 shadow-amber-600/10'
                                    : 'bg-red-50/95 text-slate-900 border-red-300 shadow-red-600/10'
                                }`}
                        >
                            <div className="flex items-center gap-3 min-w-0 pr-3">
                                <div className={`p-2 rounded-xl shrink-0 ${isSuccess
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : isWarning
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                    {isSuccess && <CheckCircle2 className="w-4 h-4" />}
                                    {isWarning && <AlertTriangle className="w-4 h-4" />}
                                    {isError && <XCircle className="w-4 h-4" />}
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-xs font-bold capitalize tracking-tight ${isSuccess ? 'text-emerald-900' : isWarning ? 'text-amber-900' : 'text-red-900'
                                        }`}>
                                        {toast.type === 'success' ? 'Success Notice' : toast.type === 'warning' ? 'System Action' : 'Action Failed'}
                                    </p>
                                    <p className="text-[11px] font-medium text-slate-700 mt-0.5">{toast.message}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white/60 rounded-xl transition-colors cursor-pointer shrink-0"
                                aria-label="Close notification"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}