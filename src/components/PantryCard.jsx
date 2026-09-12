import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Trash2, Sparkles, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getUrgencyConfig, CATEGORY_COLORS } from '../utils/calculations';

export default function PantryCard({ item, onConsume, onDiscard, isSelectedForRescue, onToggleRescueSelect }) {
  const urgency = getUrgencyConfig(item.expiry_date);
  const categoryStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Pantry'];

  const handleConsume = (e) => {
    e.stopPropagation();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.75, x: 0.5 },
      colors: ['#22c55e', '#10b981', '#6366f1', '#f59e0b']
    });
    onConsume(item.id);
  };

  const handleDiscard = (e) => {
    e.stopPropagation();
    onDiscard(item.id);
  };

  // Radial Gauge SVG Parameters
  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (urgency.progressPercent / 100) * circumference;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.18 } }}
      onClick={() => onToggleRescueSelect && onToggleRescueSelect(item.name)}
      className={`relative overflow-hidden rounded-[26px] p-5 liquid-glass-card cursor-pointer group select-none ${
        isSelectedForRescue
          ? 'border-emerald-500/50 bg-emerald-500/[0.08] shadow-[0_0_35px_-5px_rgba(16,185,129,0.35)]'
          : ''
      }`}
    >
      {/* Top Glossy Specular Refraction Highlight Line */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/45 dark:via-white/35 to-transparent pointer-events-none" />

      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
              {item.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-white/60 dark:bg-white/[0.05] backdrop-blur-md border border-white/90 dark:border-white/[0.08] text-slate-800 dark:text-slate-300 flex items-center gap-1 shadow-sm">
              <MapPin className="w-2.5 h-2.5 text-slate-500 dark:text-slate-400" />
              {item.storage_location}
            </span>
          </div>

          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug truncate pt-0.5">
            {item.name}
          </h3>
        </div>

        {/* Crystalline Liquid Freshness Gauge Ring */}
        <div className="relative flex items-center justify-center w-12 h-12 flex-shrink-0 rounded-2xl bg-white/55 dark:bg-white/[0.04] backdrop-blur-md border border-white/90 dark:border-white/[0.1] shadow-inner">
          <svg className="w-11 h-11 transform -rotate-90">
            <circle
              cx="22"
              cy="22"
              r={radius}
              stroke="currentColor"
              strokeWidth="3.2"
              className="text-slate-200 dark:text-white/10"
              fill="transparent"
            />
            <circle
              cx="22"
              cy="22"
              r={radius}
              stroke={urgency.accentColor}
              strokeWidth="3.2"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className={`text-[11px] font-black leading-none tabular-nums ${urgency.color}`}>
              {urgency.daysLeft < 0 ? '0' : urgency.daysLeft}d
            </span>
          </div>
        </div>
      </div>

      {/* Expiry Pill & Liquid Neon Status Switch (From Sample Image) */}
      <div className="mt-4 flex items-center justify-between">
        <div className={`px-2.5 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1.5 ${urgency.badgeClass}`}>
          <Clock className="w-3.5 h-3.5" />
          {urgency.badge}
        </div>

        {isSelectedForRescue ? (
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Rescuing
          </span>
        ) : (
          /* Sleek Neon Status Pill (Matching sample reference toggle bead) */
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/65 dark:bg-white/[0.06] backdrop-blur-md border border-emerald-300/60 dark:border-white/10 text-[10px] font-bold text-emerald-900 dark:text-slate-300 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#22c55e]"></span>
            </span>
            <span>In Pantry</span>
          </div>
        )}
      </div>

      {/* Action Footer with Neon Cooked Toggle */}
      <div className="mt-4 pt-3.5 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between">
        <button
          onClick={handleDiscard}
          className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors flex items-center gap-1 text-xs font-bold"
          title="Mark Wasted"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Wasted</span>
        </button>

        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={handleConsume}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold liquid-btn-primary text-white shadow-md"
        >
          <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_#ffffff] animate-pulse" />
          I Cooked This!
        </motion.button>
      </div>
    </motion.div>
  );
}
