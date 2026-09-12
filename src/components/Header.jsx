import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Camera, Plus, ChefHat, ShoppingBag, Leaf, DollarSign, Activity, RefreshCw, LogOut, Sun, Moon } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  metrics, 
  isColdStart, 
  onOpenScan, 
  onOpenAdd, 
  onOpenRescue,
  activeCount,
  user,
  onSignOut,
  theme,
  onToggleTheme
}) {
  const navTabs = [
    { id: 'inventory', label: 'Pantry Inventory', icon: Sparkles, badge: activeCount },
    { id: 'shopping', label: 'Shopping List', icon: ShoppingBag },
    { id: 'impact', label: 'Zero-Waste Impact', icon: Leaf }
  ];

  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-40 w-full liquid-glass-nav">
      
      {/* iOS-Style Floating Cold-Start Island Banner (PRD 3.1) */}
      <AnimatePresence>
        {isColdStart && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-amber-500/20 bg-amber-500/[0.08] backdrop-blur-xl"
          >
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-xs font-medium text-amber-500 dark:text-amber-200">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500 dark:text-amber-400" />
              <span>Waking up kitchen copilot (~25s server warm-up on free tier)...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-4">
          
          {/* Brand & Dynamic Savings Ticker */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-white/30 to-white/5 p-[1px] shadow-lg shadow-emerald-500/10">
                  <div className="w-full h-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl rounded-[15px] flex items-center justify-center border border-white/20">
                    <Leaf className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  </div>
                </div>
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                    Pantry<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 dark:from-emerald-400 dark:via-teal-300 dark:to-indigo-300">Pulse</span>
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25">
                    Zero-Waste
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Smart Grocery & Meal Copilot</p>
              </div>
            </div>

            {/* Mobile Actions: Theme Switcher Pill, Scan, Rescue, Sign Out */}
            <div className="flex md:hidden items-center gap-1.5">
              {/* Sleek iOS Theme Switcher Pill */}
              <button
                onClick={onToggleTheme}
                className="relative p-1.5 rounded-xl liquid-glass-segmented flex items-center gap-1 text-xs"
                title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              >
                <div className={`p-1 rounded-lg transition-colors ${isDark ? 'text-slate-500' : 'bg-white shadow-sm text-amber-500'}`}>
                  <Sun className="w-3.5 h-3.5" />
                </div>
                <div className={`p-1 rounded-lg transition-colors ${isDark ? 'bg-indigo-500/20 text-indigo-300 shadow-sm' : 'text-slate-400'}`}>
                  <Moon className="w-3.5 h-3.5" />
                </div>
              </button>

              <button
                onClick={onOpenScan}
                className="p-2 rounded-xl liquid-btn-secondary text-slate-700 dark:text-slate-200"
                title="Scan Receipt/Shelf"
              >
                <Camera className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenRescue}
                className="p-2 rounded-xl liquid-btn-primary text-white"
                title="Rescue Recipes"
              >
                <ChefHat className="w-4 h-4" />
              </button>
              {user && (
                <button
                  onClick={onSignOut}
                  className="p-2 rounded-xl liquid-btn-secondary text-slate-400 hover:text-rose-500"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Real-Time Impact Savings Ticker Banner (iOS Widget Style - PRD 2.3) */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 px-2.5 rounded-2xl liquid-glass-surface">
            <div className="flex items-center gap-2 px-2.5 py-1">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Saved</p>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  ${metrics.dollarsSaved} <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">(₹{metrics.rupeesSaved})</span>
                </p>
              </div>
            </div>

            <div className="h-5 w-[1px] bg-slate-300 dark:bg-white/10"></div>

            <div className="flex items-center gap-2 px-2.5 py-1">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Leaf className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">CO₂ Offset</p>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-300 tabular-nums">
                  {metrics.co2SavedKg} <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">kg</span>
                </p>
              </div>
            </div>

            <div className="h-5 w-[1px] bg-slate-300 dark:bg-white/10"></div>

            <div className="flex items-center gap-2 px-2.5 py-1">
              <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Efficiency</p>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-300 tabular-nums">
                  {metrics.rescueSuccessRate}%
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Actions, Theme Switcher & User Profile */}
          <div className="hidden md:flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onOpenAdd}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold liquid-btn-secondary text-slate-800 dark:text-slate-200"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              Add Item
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onOpenScan}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold liquid-btn-indigo text-white"
            >
              <Camera className="w-3.5 h-3.5" />
              Scan Photo AI
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onOpenRescue}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold liquid-btn-primary text-white"
            >
              <ChefHat className="w-3.5 h-3.5" />
              Rescue Meals
              {metrics.expiringSoonCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white text-emerald-900 font-extrabold shadow-sm">
                  {metrics.expiringSoonCount}
                </span>
              )}
            </motion.button>

            {/* Refined Modern SaaS / iOS Liquid Theme Toggle Switch */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={onToggleTheme}
              className="relative p-1 rounded-full liquid-glass-segmented flex items-center gap-1 cursor-pointer transition-all hover:border-emerald-500/30"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold transition-all ${
                !isDark 
                  ? 'bg-white shadow-sm text-slate-900' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}>
                <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-500' : 'text-slate-400'}`} />
                <span className="hidden lg:inline text-[10px]">Light</span>
              </div>

              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold transition-all ${
                isDark 
                  ? 'bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 border border-emerald-500/30 shadow-sm text-white' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}>
                <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="hidden lg:inline text-[10px]">Dark</span>
              </div>
            </motion.button>

            {/* Authenticated User Capsule & Sign Out */}
            {user && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-300 dark:border-white/10">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl liquid-glass-pill text-xs">
                  <div className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-300 max-w-[90px] truncate">
                    {user.name || user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={onSignOut}
                  className="p-2 rounded-xl liquid-btn-secondary text-slate-400 hover:text-rose-500 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* iOS-Style Segmented Navigation Switcher */}
        <div className="pb-3 pt-1">
          <nav className="inline-flex p-1 rounded-2xl liquid-glass-segmented max-w-full overflow-x-auto">
            {navTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors duration-200 whitespace-nowrap select-none ${
                    isActive 
                      ? 'text-slate-900 dark:text-white' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      className="absolute inset-0 rounded-xl bg-gradient-to-b from-white to-slate-100 dark:from-white/15 dark:to-white/5 border border-slate-200 dark:border-white/20 shadow-md"
                    />
                  )}
                  <Icon className={`relative z-10 w-3.5 h-3.5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="relative z-10">{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`relative z-10 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive 
                        ? 'bg-emerald-500/25 text-emerald-700 dark:text-emerald-300' 
                        : 'bg-black/10 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
