import DashboardGrid from '@/components/DashboardGrid';
import Navbar from '@/components/Navbar';
import { PlusCircle, Layers, Calculator, FolderKanban, Search } from 'lucide-react';
import Link from 'next/link';

// Server-Side Data Fetching directly in Next.js Server Component
async function getProjects() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    console.error('Failed to fetch projects on server:', err);
    return [];
  }
}

export default async function DashboardPage() {
  const projects = await getProjects();

  // Compute Quick QS Metrics for the Dashboard Header Cards
  const totalProjects = projects.length;
  const totalAreaAllProjects = projects.reduce((acc, p) => {
    const pArea = (p.annotations || []).reduce((sum, a) => sum + (a.area || 0), 0);
    return acc + pArea;
  }, 0);
  const totalEstimatedCostAll = totalAreaAllProjects * 125;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      <Navbar showBack={false} title="QMetrix Enterprise Takeoff Dashboard" />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">

        {/* Hero / Action Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50/60 text-slate-900 p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200/80 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                Quantity Surveying & Cost Estimations
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Blueprint Takeoff Dashboard
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl font-medium leading-relaxed">
              Manage structural drawings, execute precise polygon measurements, review room bills of quantities, and sync cloud changes in real-time.
            </p>
          </div>

          <Link
            href="/workspace"
            className="relative z-10 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3.5 rounded-2xl shadow-md shadow-blue-600/20 transition-all shrink-0 cursor-pointer active:scale-95 text-xs sm:text-sm"
          >
            <PlusCircle className="w-5 h-5" />
            Create New Blueprint Project
          </Link>
        </div>

        {/* Quick Aggregate Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Projects</p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">{totalProjects}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cumulative Takeoff Area</p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">{totalAreaAllProjects.toFixed(2)} sq.m</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Fit-out Budget</p>
              <p className="text-xl font-extrabold text-emerald-700 mt-0.5">
                ₹ {totalEstimatedCostAll.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex justify-between items-center pt-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Saved Blueprint Projects ({projects.length})
          </h2>
          <span className="text-xs font-medium text-slate-500">
            Showing synced cloud database records
          </span>
        </div>

        {/* Dashboard Grid Component */}
        <DashboardGrid projects={projects} />
      </main>
    </div>
  );
}