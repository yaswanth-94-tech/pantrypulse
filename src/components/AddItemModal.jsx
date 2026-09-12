import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';

export default function AddItemModal({ isOpen, onClose, onAddItem }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Produce');
  const [storageLocation, setStorageLocation] = useState('Fridge');
  const [shelfLifeDays, setShelfLifeDays] = useState(5);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const days = parseInt(shelfLifeDays) || 5;
    const expiryDate = new Date(Date.now() + days * 86400000).toISOString();

    onAddItem({
      name: name.trim(),
      category,
      storage_location: storageLocation,
      shelf_life_days: days,
      expiry_date: expiryDate,
      status: 'active'
    });

    setName('');
    setShelfLifeDays(5);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/75 backdrop-blur-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl liquid-glass-modal p-6 sm:p-7 shadow-2xl"
        >
          {/* Top Specular Rim */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 dark:via-white/30 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Add Pantry Item</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Record an item with its storage location & shelf life</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Item Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Organic Almond Milk, Roma Tomatoes, Sourdough"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl liquid-glass-input text-xs cursor-pointer font-medium"
                >
                  <option value="Produce" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Produce</option>
                  <option value="Dairy" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Dairy</option>
                  <option value="Meat" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Meat</option>
                  <option value="Bakery" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Bakery</option>
                  <option value="Pantry" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Pantry</option>
                  <option value="Frozen" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Frozen</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Storage Location
                </label>
                <select
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl liquid-glass-input text-xs cursor-pointer font-medium"
                >
                  <option value="Fridge" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Fridge</option>
                  <option value="Freezer" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Freezer</option>
                  <option value="Pantry" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Pantry</option>
                  <option value="Counter" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Counter</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Estimated Shelf Life (Days)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={shelfLifeDays}
                  onChange={(e) => setShelfLifeDays(parseInt(e.target.value))}
                  className="flex-1 accent-emerald-500 cursor-pointer"
                />
                <span className="w-16 py-1.5 rounded-xl liquid-glass-surface text-emerald-700 dark:text-emerald-300 text-center font-bold text-xs tabular-nums">
                  {shelfLifeDays} Days
                </span>
              </div>
            </div>

            <div className="pt-3.5 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4.5 py-2 rounded-xl text-xs font-bold liquid-btn-primary text-white"
              >
                Add to Inventory
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
