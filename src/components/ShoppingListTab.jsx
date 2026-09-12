import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, CheckCircle2, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ShoppingListTab({ items = [], onAddToPantry, onDeleteItem }) {
  const [newItemName, setNewItemName] = useState('');
  const shoppingItems = items.filter(i => i.status === 'shopping_list');

  const handleAddShoppingItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    onAddToPantry({
      name: newItemName.trim(),
      category: 'Pantry',
      storage_location: 'Fridge',
      shelf_life_days: 7,
      expiry_date: new Date(Date.now() + 7 * 86400000).toISOString(),
      status: 'shopping_list'
    });

    setNewItemName('');
  };

  const handleBuyItem = (item) => {
    confetti({
      particleCount: 35,
      spread: 55,
      origin: { y: 0.7 }
    });

    onAddToPantry({
      ...item,
      status: 'active',
      expiry_date: new Date(Date.now() + (item.shelf_life_days || 7) * 86400000).toISOString()
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl liquid-glass-surface flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-500 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Smart Grocery Shopping List</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track missing kitchen staples and auto-restock your pantry</p>
          </div>
        </div>

        <form onSubmit={handleAddShoppingItem} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add staple (e.g. Milk, Olive Oil)..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="px-3.5 py-2 rounded-xl liquid-glass-input text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold liquid-btn-indigo text-white flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </form>
      </div>

      {/* List */}
      {shoppingItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl liquid-glass-surface space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 flex items-center justify-center mx-auto text-slate-500 dark:text-slate-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Your Shopping List is Empty</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Missing staples flagged during recipe generation or items added manually will appear here for easy restock.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {shoppingItems.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-3.5 rounded-2xl liquid-glass-card flex items-center justify-between gap-3"
              >
                <div className="min-w-0 pr-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{item.name}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Est. Shelf Life: {item.shelf_life_days || 7} days</p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBuyItem(item)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold liquid-btn-primary text-white"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Bought
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
