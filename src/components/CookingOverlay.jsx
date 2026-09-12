import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, CheckCircle2, Clock, ChefHat, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CookingOverlay({ recipe, onClose, onCompleteMeal }) {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [checkedIngredients, setCheckedIngredients] = useState([]);

  // Cooking Timer state
  const initialSeconds = (recipe?.cook_time_minutes || 15) * 60;
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  if (!recipe) return null;

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleStep = (index) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter(i => i !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  const toggleIngredient = (ing) => {
    if (checkedIngredients.includes(ing)) {
      setCheckedIngredients(checkedIngredients.filter(i => i !== ing));
    } else {
      setCheckedIngredients([...checkedIngredients, ing]);
    }
  };

  const handleFinishCooking = () => {
    // Grand celebration confetti burst (PRD 2.3)
    confetti({
      particleCount: 110,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#10b981', '#34d399', '#6366f1', '#f59e0b', '#ec4899']
    });

    if (onCompleteMeal) {
      onCompleteMeal(recipe.ingredients_used || []);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 dark:bg-slate-950/85 backdrop-blur-3xl p-4 sm:p-6 flex flex-col">
        
        {/* Top Floating Control Bar */}
        <div className="max-w-4xl w-full mx-auto flex items-center justify-between py-3.5 border-b border-slate-200 dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Cooking Studio Mode
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">{recipe.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="max-w-4xl w-full mx-auto flex-1 my-5 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto">
          
          {/* Left Column: Ingredients Checklist & Timer */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Interactive Cooking Countdown Timer */}
            <div className="p-5 rounded-3xl liquid-glass-surface border-slate-200 dark:border-white/10 text-center space-y-3.5">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Clock className="w-3.5 h-3.5" /> Cooking Timer
              </div>

              <div className="text-4xl sm:text-5xl font-extrabold font-mono text-slate-900 dark:text-white tracking-wider tabular-nums py-1">
                {formatTimer(timeLeft)}
              </div>

              <div className="flex items-center justify-center gap-2.5 pt-1">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isRunning 
                      ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/30' 
                      : 'liquid-btn-primary text-white'
                  }`}
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isRunning ? 'Pause' : 'Start'}
                </button>

                <button
                  onClick={() => { setIsRunning(false); setTimeLeft(initialSeconds); }}
                  className="p-1.5 rounded-xl liquid-btn-secondary text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Ingredients Checklist */}
            <div className="p-5 rounded-3xl liquid-glass-surface border-slate-200 dark:border-white/10 space-y-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Rescued Ingredients Checklist
              </h3>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {recipe.ingredients_used?.map((ing, idx) => {
                  const isChecked = checkedIngredients.includes(ing);
                  return (
                    <label
                      key={idx}
                      onClick={() => toggleIngredient(ing)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-800 dark:text-emerald-300 line-through opacity-70'
                          : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.07] text-slate-900 dark:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                      }`}
                    >
                      <span className="pr-2 truncate">{ing}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-500 focus:ring-0"
                      />
                    </label>
                  );
                })}
              </div>

              {recipe.missing_staples?.length > 0 && (
                <div className="pt-2.5 border-t border-slate-200 dark:border-white/[0.08]">
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Basic Kitchen Staples Used:</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-mono mt-0.5">{recipe.missing_staples.join(', ')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Step-by-Step Instructions */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-3xl liquid-glass-surface border-slate-200 dark:border-white/10 space-y-4 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
                  Step-by-Step Instructions ({recipe.instructions?.length || 0} Steps)
                </h3>

                <div className="space-y-2.5">
                  {recipe.instructions?.map((step, idx) => {
                    const isDone = completedSteps.includes(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleStep(idx)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isDone
                            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-800 dark:text-emerald-300'
                            : 'bg-black/[0.02] dark:bg-white/[0.025] border-black/[0.06] dark:border-white/[0.07] text-slate-800 dark:text-slate-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isDone ? 'bg-emerald-500 text-white dark:text-slate-950' : 'bg-black/10 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed pt-0.5">
                          {step}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Complete Meal Button */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08]">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleFinishCooking}
                  className="w-full py-3.5 rounded-2xl text-xs font-bold liquid-btn-primary text-white shadow-xl flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Finish Cooking & Rescue All Ingredients!
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}
