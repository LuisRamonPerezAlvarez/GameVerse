import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden animate-pulse flex flex-col h-[380px]">
      <div className="w-full h-48 bg-slate-800/60" />
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="h-5 bg-slate-800/80 rounded w-3/4" />
          <div className="h-3.5 bg-slate-800/50 rounded w-1/2" />
        </div>
        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="h-4 bg-slate-800/60 rounded w-20" />
          <div className="h-8 w-8 bg-slate-800/60 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
