import Navbar from '@/app/components/Navbar';
import { PlusCircle, Layers, Calculator, FolderKanban, Search, IndianRupee, View, Folders } from 'lucide-react';
import Link from 'next/link';
import SavedProjects from '@/app/components/SavedProjects';

export const dynamic = 'force-dynamic';

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
      <Navbar showBack={false} title="QMetrix Cost Consultancy & QS Systems" />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">

        {/* Hero / Action Header Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-950 via-indigo-150 to-slate-950 p-6 sm:p-10 shadow-blue-950/40 text-white">
          {/* 1. Architectural CAD Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

          {/* 2. Vibrant Multi-colored Ambient Lighting Blobs */}
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-600/30 blur-[90px] pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-[90px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            {/* Left Side: Titles and Description */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[9px] sm:text-[11px]  font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                  Quantity Surveying & Cost Estimations
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Blueprint Takeoff Dashboard
              </h1>

              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-medium leading-relaxed">
                Manage structural drawings, execute precise polygon measurements, review room bills of quantities, and sync cloud changes in real-time.
              </p>
            </div>

            {/* Right Side: Action CTA Group */}
            <div className="flex flex-row items-center gap-2 sm:gap-3 w-full max-w-sm">
              <a
                href="#projects-section"
                className="group relative z-10 flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-slate-700/80 hover:bg-slate-800 text-slate-200 font-semibold px-3 sm:px-6 py-3.5 sm:py-4 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer active:scale-95 text-sm sm:text-md border border-slate-700/60 backdrop-blur-md text-center shadow-xs"
              >
                <Folders className="w-4 h-4 text-slate-300 shrink-0 transition-transform duration-300 group-hover:translate-y-0.5" />
                <span className="truncate">View Projects</span>
              </a>

              <Link
                href="/workspace"
                className="group relative z-10 flex-1 flex items-center justify-center gap-1.5 sm:gap-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-3 sm:px-6 py-3.5 sm:py-4 rounded-2xl shadow-md shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer active:scale-95 text-sm sm:text-md border border-blue-400/40 text-center"
              >
                <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-transform duration-300 group-hover:rotate-90" />
                <span className="truncate">Create Project</span>
              </Link>
            </div>

          </div>
        </div>

        {/* Quick Aggregate Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Projects</p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5" >{totalProjects}</p>
            </div>
          </div>

          {/* Cumulative Takeoff Area Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cumulative Takeoff Area</p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">{totalAreaAllProjects.toFixed(2)} sq.m</p>
            </div>
          </div>

          {/* Dedicated Unit Rate Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Standard Unit Rate</p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">125 / sq.m</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Fit-out Budget</p>
              <p className="text-xl font-extrabold text-emerald-700 mt-0.5" >
                ₹ {totalEstimatedCostAll.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div id="projects-section" className="flex justify-between items-center pt-2" >
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Saved Projects ({projects.length})
          </h2>
          <span className="text-xs hidden sm:block font-medium text-slate-500">
            Showing synced cloud database records
          </span>
        </div>

        {/* Dashboard Grid Component */}
        <SavedProjects projects={projects} />
      </main>
    </div>
  );
}