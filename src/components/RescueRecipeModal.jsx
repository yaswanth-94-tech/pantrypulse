import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChefHat, Sparkles, Clock, AlertTriangle, CheckCircle2, RefreshCw, Zap, ArrowRight } from 'lucide-react';
import { generateRescueRecipe } from '../services/api';

export default function RescueRecipeModal({ 
  isOpen, 
  onClose, 
  pantryItems = [], 
  selectedItems = [],
  onStartCooking
}) {
  const [selectedIngredientNames, setSelectedIngredientNames] = useState(
    selectedItems.length > 0 ? selectedItems : pantryItems.filter(i => i.status === 'active').slice(0, 4).map(i => i.name)
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipeResult, setRecipeResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const toggleSelectIngredient = (name) => {
    if (selectedIngredientNames.includes(name)) {
      setSelectedIngredientNames(selectedIngredientNames.filter(n => n !== name));
    } else {
      setSelectedIngredientNames([...selectedIngredientNames, name]);
    }
  };

  const handleGenerate = async () => {
    if (selectedIngredientNames.length === 0) {
      setError('Please select at least 1 ingredient from your pantry');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const res = await generateRescueRecipe(selectedIngredientNames);
      setRecipeResult(res);
    } catch (err) {
      setError('Could not generate rescue recipe: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/75 backdrop-blur-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-3xl overflow-hidden rounded-3xl liquid-glass-modal p-6 sm:p-7 shadow-2xl max-h-[92vh] flex flex-col"
        >
          {/* Top Specular Rim */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 dark:via-white/30 to-transparent pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Zero-Waste Rescue Engine
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-semibold">
                    Instant AI Cache
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Generate delicious instant meals to rescue expiring ingredients</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-5 space-y-5">
            
            {/* Step 1: Ingredient Picker */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Select Ingredients to Rescue ({selectedIngredientNames.length} selected)
                </label>
                <button
                  onClick={() => setSelectedIngredientNames(pantryItems.filter(i => i.status === 'active').map(i => i.name))}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-semibold"
                >
                  Select All
                </button>
              </div>

              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                {pantryItems.filter(i => i.status === 'active').map(item => {
                  const isSelected = selectedIngredientNames.includes(item.name);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleSelectIngredient(item.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 shadow-sm'
                          : 'bg-black/[0.03] dark:bg-white/[0.03] border-black/[0.08] dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.06]'
                      }`}
                    >
                      <span>{item.name}</span>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Trigger Button */}
            {!recipeResult && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={isGenerating}
                onClick={handleGenerate}
                className="w-full py-3.5 rounded-2xl text-xs font-bold liquid-btn-primary text-white shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Checking Cache & Generating Rescue Recipe...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Rescue Meal Recipe
                  </>
                )}
              </motion.button>
            )}

            {/* Step 2: Recipe Display Card */}
            {recipeResult && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 p-5 rounded-2xl liquid-glass-surface border-slate-200 dark:border-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/25 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {recipeResult.source === 'cache' ? 'Instant Cache' : 'AI Copilot'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                        {recipeResult.prep_time_minutes + recipeResult.cook_time_minutes} mins total
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-lg font-bold text-slate-900 dark:text-white tracking-tight">{recipeResult.title}</h3>
                  </div>

                  <button
                    onClick={() => setRecipeResult(null)}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 underline font-medium"
                  >
                    New Recipe
                  </button>
                </div>

                {recipeResult.urgency_reasoning && (
                  <div className="p-3 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200">
                    💡 <strong>Zero-Waste Reason:</strong> {recipeResult.urgency_reasoning}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[10px] mb-1.5">Rescued Items</h4>
                    <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                      {recipeResult.ingredients_used?.map((ing, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                          <span>{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {recipeResult.missing_staples?.length > 0 && (
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[10px] mb-1.5">Kitchen Staples</h4>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
                        {recipeResult.missing_staples.join(', ')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Instructions Preview */}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[10px] mb-1.5">Instructions Preview</h4>
                  <ol className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {recipeResult.instructions?.slice(0, 3).map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                    {recipeResult.instructions?.length > 3 && (
                      <li className="text-[10px] text-slate-400 dark:text-slate-500 italic">+{recipeResult.instructions.length - 3} more steps in Interactive Cooking Mode...</li>
                    )}
                  </ol>
                </div>

                {/* Launch Cooking Overlay */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    onClose();
                    onStartCooking(recipeResult);
                  }}
                  className="w-full py-3 rounded-xl text-xs font-bold liquid-btn-primary text-white shadow-lg flex items-center justify-center gap-2"
                >
                  <ChefHat className="w-4 h-4" />
                  Start Full-Screen Cooking Mode
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
