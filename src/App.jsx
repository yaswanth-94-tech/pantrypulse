import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, ChefHat, Camera, Layers, Plus } from 'lucide-react';
import Header from './components/Header';
import PantryCard from './components/PantryCard';
import VisualIngestionModal from './components/VisualIngestionModal';
import RescueRecipeModal from './components/RescueRecipeModal';
import AddItemModal from './components/AddItemModal';
import ShoppingListTab from './components/ShoppingListTab';
import StatsOverview from './components/StatsOverview';
import CookingOverlay from './components/CookingOverlay';
import AuthPage from './components/AuthPage';
import { calculateSavingsMetrics, getDaysLeft } from './utils/calculations';
import { checkHealth, fetchPantryItems, createPantryItem, updateItemStatus, deleteItem } from './services/api';
import { getCurrentUser, signOutUser } from './services/auth';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pantrypulse_theme') || 'dark';
  });

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'shopping' | 'impact'
  const [isColdStart, setIsColdStart] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [sortBy, setSortBy] = useState('urgency'); // 'urgency' | 'name' | 'category'

  // Selected items for Rescue Recipe Generator
  const [selectedForRescue, setSelectedForRescue] = useState([]);

  // Modals
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRescueOpen, setIsRescueOpen] = useState(false);
  const [cookingRecipe, setCookingRecipe] = useState(null);

  // Sync theme with HTML root class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem('pantrypulse_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        const root = document.documentElement;
        if (nextTheme === 'light') {
          root.classList.remove('dark');
          root.classList.add('light');
        } else {
          root.classList.remove('light');
          root.classList.add('dark');
        }
        setTheme(nextTheme);
      });
    } else {
      setTheme(nextTheme);
    }
  };

  // 1. Check user authentication on mount
  useEffect(() => {
    async function initAuth() {
      const activeUser = await getCurrentUser();
      setUser(activeUser);
      setAuthLoading(false);
    }
    initAuth();
  }, []);

  // 2. Load Pantry Data once authenticated
  useEffect(() => {
    if (!user) return;

    async function loadData() {
      const healthRes = await checkHealth();
      if (healthRes.isColdStart) {
        setIsColdStart(true);
        setTimeout(() => setIsColdStart(false), 25000);
      }

      const serverItems = await fetchPantryItems(user.id);
      if (serverItems && Array.isArray(serverItems)) {
        setItems(serverItems);
      } else {
        setItems([]);
      }
      setLoading(false);
    }

    loadData();
  }, [user]);

  // Handle Logout
  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    setActiveTab('inventory');
    setSelectedForRescue([]);
  };

  // Recalculate metrics dynamically
  const metrics = calculateSavingsMetrics(items);
  const activeItems = items.filter(i => i.status === 'active');

  // Filter & Sort Logic
  const filteredActiveItems = activeItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesLoc = selectedLocation === 'All' || item.storage_location === selectedLocation;
    return matchesSearch && matchesCat && matchesLoc;
  }).sort((a, b) => {
    if (sortBy === 'urgency') {
      return getDaysLeft(a.expiry_date) - getDaysLeft(b.expiry_date);
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'category') {
      return a.category.localeCompare(b.category);
    }
    return 0;
  });

  // Action Handlers
  const handleConsumeItem = async (id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'consumed' } : i));
    await updateItemStatus(id, 'consumed');
  };

  const handleDiscardItem = async (id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'wasted' } : i));
    await updateItemStatus(id, 'wasted');
  };

  const handleDeleteItem = async (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    await deleteItem(id);
  };

  const handleAddItem = async (newItemData) => {
    const payload = { ...newItemData, user_id: user?.id || 'demo-user' };
    const created = await createPantryItem(payload);
    if (created) {
      setItems(prev => [created, ...prev]);
    } else {
      const fallbackItem = { ...payload, id: 'local-' + Date.now() };
      setItems(prev => [fallbackItem, ...prev]);
    }
  };

  const handleImportItems = async (importedList) => {
    for (const itemData of importedList) {
      await handleAddItem(itemData);
    }
  };

  const handleToggleRescueSelect = (name) => {
    if (selectedForRescue.includes(name)) {
      setSelectedForRescue(selectedForRescue.filter(n => n !== name));
    } else {
      setSelectedForRescue([...selectedForRescue, name]);
    }
  };

  const handleCompleteMeal = (usedIngredients = []) => {
    setItems(prev => prev.map(item => {
      const isUsed = usedIngredients.some(name => item.name.toLowerCase().includes(name.toLowerCase()));
      if (isUsed && item.status === 'active') {
        updateItemStatus(item.id, 'consumed');
        return { ...item, status: 'consumed' };
      }
      return item;
    }));
    setSelectedForRescue([]);
  };

  // If checking session on initial boot
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex items-center gap-3 text-emerald-400 font-semibold text-xs">
          <div className="w-5 h-5 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
          <span>Loading PantryPulse...</span>
        </div>
      </div>
    );
  }

  // If no authenticated user, display Sign In & Sign Up Page
  if (!user) {
    return <AuthPage onAuthSuccess={(authenticatedUser) => setUser(authenticatedUser)} />;
  }

  return (
    <div className="relative min-h-screen flex flex-col selection:bg-emerald-500/25 selection:text-emerald-300">
      
      {/* Layer 0: Glowing Optical Neon Ring Halo & Ambient Liquid Glass Backlight */}
      <div className="liquid-halo-container">
        <div className="liquid-neon-ring" />
        <div className="liquid-neon-arc" />
        <div className="liquid-glass-orb liquid-orb-emerald" />
        <div className="liquid-glass-orb liquid-orb-indigo" />
        <div className="liquid-glass-orb liquid-orb-rose" />
        <div className="liquid-glass-orb liquid-orb-amber" />
      </div>

      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metrics={metrics}
        isColdStart={isColdStart}
        onOpenScan={() => setIsScanOpen(true)}
        onOpenAdd={() => setIsAddOpen(true)}
        onOpenRescue={() => setIsRescueOpen(true)}
        activeCount={activeItems.length}
        user={user}
        onSignOut={handleSignOut}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7">
        
        {/* Tab 1: Pantry Inventory */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            
            {/* Dynamic Callout Banner: Rescue Alert */}
            {/* Dynamic Callout Banner: Rescue Alert */}
            {metrics.expiringSoonCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-5 rounded-3xl liquid-glass-surface border-amber-400/40 dark:border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-rose-500/10 dark:from-amber-500/[0.08] dark:to-transparent"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/25 border border-amber-500/35 text-amber-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                      {metrics.expiringSoonCount} {metrics.expiringSoonCount === 1 ? 'ingredient needs' : 'ingredients need'} immediate rescue
                    </h3>
                    <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5 font-medium">
                      Save estimated <strong className="text-amber-700 dark:text-amber-300 font-black">${metrics.rescuePotentialUsd}</strong> in grocery value before spoilage.
                    </p>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setIsRescueOpen(true)}
                  className="px-4.5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
                >
                  <ChefHat className="w-4 h-4" />
                  Rescue with AI
                </motion.button>
              </motion.div>
            )}

            {/* Filter & Search Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-3xl liquid-glass-surface">
              
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 dark:text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search pantry items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl liquid-glass-input text-xs font-semibold placeholder:text-slate-400 text-slate-900 dark:text-white"
                />
              </div>

              {/* Category, Location & Sort Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2.5 rounded-2xl liquid-glass-input text-xs cursor-pointer font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="All">All Categories</option>
                  <option value="Produce">Produce</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Meat">Meat</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Pantry">Pantry</option>
                  <option value="Frozen">Frozen</option>
                </select>

                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-3 py-2.5 rounded-2xl liquid-glass-input text-xs cursor-pointer font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="All">All Locations</option>
                  <option value="Fridge">Fridge</option>
                  <option value="Freezer">Freezer</option>
                  <option value="Pantry">Pantry</option>
                  <option value="Counter">Counter</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2.5 rounded-2xl liquid-glass-input text-xs cursor-pointer font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="urgency">Sort by Urgency</option>
                  <option value="name">Sort by Name</option>
                  <option value="category">Sort by Category</option>
                </select>
              </div>
            </div>

            {/* Inventory Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                  <div key={n} className="h-48 rounded-3xl skeleton-shimmer border border-slate-200 dark:border-white/10" />
                ))}
              </div>
            ) : filteredActiveItems.length === 0 ? (
              <div className="p-14 sm:p-16 text-center rounded-3xl liquid-glass-surface space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 flex items-center justify-center mx-auto text-slate-500 dark:text-slate-400">
                  <Layers className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your Pantry is Empty</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  No default items are added. Add your first grocery item or scan a receipt with Gemini AI to get started.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                  <button
                    onClick={() => setIsAddOpen(true)}
                    className="px-4 py-2.5 rounded-2xl text-xs font-bold liquid-btn-secondary text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Add Item
                  </button>
                  <button
                    onClick={() => setIsScanOpen(true)}
                    className="px-4.5 py-2.5 rounded-2xl text-xs font-bold liquid-btn-indigo text-white inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <Camera className="w-4 h-4" /> Scan Photo AI
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredActiveItems.map(item => (
                    <PantryCard
                      key={item.id}
                      item={item}
                      onConsume={handleConsumeItem}
                      onDiscard={handleDiscardItem}
                      isSelectedForRescue={selectedForRescue.includes(item.name)}
                      onToggleRescueSelect={handleToggleRescueSelect}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Shopping List */}
        {activeTab === 'shopping' && (
          <ShoppingListTab
            items={items}
            onAddToPantry={handleAddItem}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {/* Tab 3: Zero-Waste Impact */}
        {activeTab === 'impact' && (
          <StatsOverview
            metrics={metrics}
            pantryItems={items}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto border-t border-slate-200 dark:border-white/[0.08] py-6 text-center text-xs text-slate-500 font-medium">
        <p>PantryPulse — Zero-Waste Smart Kitchen & AI Meal Copilot • Render & Supabase Architecture</p>
      </footer>

      {/* Modals & Overlays */}
      <VisualIngestionModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onImportItems={handleImportItems}
      />

      <RescueRecipeModal
        isOpen={isRescueOpen}
        onClose={() => setIsRescueOpen(false)}
        pantryItems={items}
        selectedItems={selectedForRescue}
        onStartCooking={(recipe) => setCookingRecipe(recipe)}
      />

      <AddItemModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddItem={handleAddItem}
      />

      {cookingRecipe && (
        <CookingOverlay
          recipe={cookingRecipe}
          onClose={() => setCookingRecipe(null)}
          onCompleteMeal={handleCompleteMeal}
        />
      )}
    </div>
  );
}
