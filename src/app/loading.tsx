'use client';

import Image from 'next/image';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-950 transition-colors duration-300">
      <div className="flex flex-col items-center space-y-6">
        {/* Animated Logo Container */}
        <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white dark:bg-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-gray-100/80 dark:border-slate-700/60 p-5 animate-pulse">
          <Image
            src="/logo.png"
            alt="Safar Logo"
            width={80}
            height={80}
            className="w-full h-full object-contain rounded-2xl"
            priority
          />
          {/* Outer glowing loader ring */}
          <div className="absolute inset-0 rounded-3xl border-2 border-primary/20 border-t-primary dark:border-primary/10 dark:border-t-primary animate-spin" style={{ margin: '-4px' }} />
        </div>

        {/* Loading text */}
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
            Safar
          </h2>
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 animate-pulse">
            Loading route planner...
          </p>
        </div>
      </div>
    </div>
  );
}
