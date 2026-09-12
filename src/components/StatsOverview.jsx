import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Leaf, Award, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function StatsOverview({ metrics, pantryItems = [] }) {
  const consumedList = pantryItems.filter(i => i.status === 'consumed');
  const wastedList = pantryItems.filter(i => i.status === 'wasted');

  return (
    <div className="space-y-7 max-w-5xl mx-auto">
      
      {/* Top Banner Grid - iOS Fitness/Health Widget Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Money Saved */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5.5 rounded-3xl liquid-glass-card border-emerald-500/25 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Total Money Saved</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
              ${metrics.dollarsSaved}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Equivalent to ₹{metrics.rupeesSaved} rescued from waste</p>
          </div>
        </motion.div>

        {/* CO2 Emissions Prevented */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5.5 rounded-3xl liquid-glass-card border-indigo-500/25 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">CO₂ Offset</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
              {metrics.co2SavedKg} <span className="text-base text-indigo-600 dark:text-indigo-300 font-normal">kg CO₂e</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Life-cycle agricultural emissions prevented</p>
          </div>
        </motion.div>

        {/* Rescue Efficiency */}
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5.5 rounded-3xl liquid-glass-card border-amber-500/25 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Rescue Efficiency</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
              {metrics.rescueSuccessRate}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{metrics.consumedCount} cooked vs {metrics.wastedCount} wasted</p>
          </div>
        </motion.div>
      </div>

      {/* Historical Log Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Consumed Rescued Items */}
        <div className="p-5 sm:p-6 rounded-3xl liquid-glass-surface border-emerald-500/20 space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              Rescued & Cooked Items ({consumedList.length})
            </h3>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">+${Math.round(consumedList.length * 4.25)}</span>
          </div>

          {consumedList.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic py-6 text-center">No items logged as cooked yet. Click "I Cooked This" to track your impact!</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {consumedList.map(item => (
                <div key={item.id} className="p-2.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-white truncate pr-2">{item.name}</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium px-2 py-0.5 rounded-md bg-emerald-500/15">Rescued</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wasted Items Breakdown */}
        <div className="p-5 sm:p-6 rounded-3xl liquid-glass-surface border-rose-500/20 space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              Wasted Items Log ({wastedList.length})
            </h3>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 tabular-nums">-${metrics.dollarsWasted}</span>
          </div>

          {wastedList.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic py-6 text-center">Zero food waste recorded! Perfect kitchen streak.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {wastedList.map(item => (
                <div key={item.id} className="p-2.5 rounded-xl bg-rose-500/[0.06] border border-rose-500/20 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate pr-2">{item.name}</span>
                  <span className="text-[10px] text-rose-700 dark:text-rose-300 font-medium px-2 py-0.5 rounded-md bg-rose-500/15">Wasted</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
