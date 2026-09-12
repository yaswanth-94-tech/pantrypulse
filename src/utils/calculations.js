// Utility calculations for PantryPulse expiry tracking, savings metrics, and status badges

export function getDaysLeft(expiryDateStr) {
  if (!expiryDateStr) return 0;
  const expiry = new Date(expiryDateStr);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getUrgencyConfig(expiryDateStr) {
  const daysLeft = getDaysLeft(expiryDateStr);

  if (daysLeft < 0) {
    return {
      tier: 'expired',
      daysLeft,
      badge: 'Expired',
      color: 'text-rose-700 dark:text-rose-400 font-bold',
      badgeClass: 'bg-rose-100 dark:bg-rose-500/15 border-rose-300 dark:border-rose-500/30 text-rose-900 dark:text-rose-200 font-bold',
      accentColor: '#f43f5e',
      progressPercent: 0
    };
  }

  if (daysLeft <= 1) {
    return {
      tier: 'today',
      daysLeft,
      badge: daysLeft === 0 ? 'Expiring Today' : 'Expiring Tomorrow',
      color: 'text-rose-700 dark:text-rose-400 font-bold',
      badgeClass: 'bg-rose-100 dark:bg-rose-500/20 border-rose-300 dark:border-rose-500/35 text-rose-900 dark:text-rose-200 font-bold',
      accentColor: '#f43f5e',
      progressPercent: 15
    };
  }

  if (daysLeft <= 3) {
    return {
      tier: 'soon',
      daysLeft,
      badge: `${daysLeft} Days Left`,
      color: 'text-amber-700 dark:text-amber-400 font-bold',
      badgeClass: 'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/35 text-amber-950 dark:text-amber-200 font-bold',
      accentColor: '#f59e0b',
      progressPercent: Math.min(100, Math.max(20, (daysLeft / 7) * 100))
    };
  }

  return {
    tier: 'fresh',
    daysLeft,
    badge: `${daysLeft} Days Fresh`,
    color: 'text-emerald-700 dark:text-emerald-400 font-bold',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/35 text-emerald-950 dark:text-emerald-200 font-bold',
    accentColor: '#10b981',
    progressPercent: Math.min(100, (daysLeft / 14) * 100)
  };
}

export function calculateSavingsMetrics(pantryItems = []) {
  const AVG_ITEM_COST_USD = 4.25;
  const AVG_CO2_KG_PER_ITEM = 1.15;

  const consumedItems = pantryItems.filter(item => item.status === 'consumed');
  const wastedItems = pantryItems.filter(item => item.status === 'wasted');
  const activeItems = pantryItems.filter(item => item.status === 'active');
  const expiringSoon = activeItems.filter(item => getDaysLeft(item.expiry_date) <= 3);

  const dollarsSaved = Math.round(consumedItems.length * AVG_ITEM_COST_USD * 100) / 100;
  const rupeesSaved = Math.round(dollarsSaved * 83);
  const co2SavedKg = Math.round(consumedItems.length * AVG_CO2_KG_PER_ITEM * 10) / 10;
  
  const dollarsWasted = Math.round(wastedItems.length * AVG_ITEM_COST_USD * 100) / 100;
  const rescuePotentialUsd = Math.round(expiringSoon.length * AVG_ITEM_COST_USD * 100) / 100;

  const totalActioned = consumedItems.length + wastedItems.length;
  const rescueSuccessRate = totalActioned > 0 
    ? Math.round((consumedItems.length / totalActioned) * 100) 
    : 100;

  return {
    consumedCount: consumedItems.length,
    wastedCount: wastedItems.length,
    activeCount: activeItems.length,
    expiringSoonCount: expiringSoon.length,
    dollarsSaved,
    rupeesSaved,
    co2SavedKg,
    dollarsWasted,
    rescuePotentialUsd,
    rescueSuccessRate
  };
}

export const CATEGORY_COLORS = {
  Produce: { bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-900 dark:text-emerald-300 font-bold', border: 'border-emerald-300 dark:border-emerald-500/30' },
  Dairy: { bg: 'bg-sky-100 dark:bg-sky-500/15', text: 'text-sky-900 dark:text-sky-300 font-bold', border: 'border-sky-300 dark:border-sky-500/30' },
  Meat: { bg: 'bg-rose-100 dark:bg-rose-500/15', text: 'text-rose-900 dark:text-rose-300 font-bold', border: 'border-rose-300 dark:border-rose-500/30' },
  Bakery: { bg: 'bg-amber-100 dark:bg-amber-500/15', text: 'text-amber-950 dark:text-amber-300 font-bold', border: 'border-amber-300 dark:border-amber-500/30' },
  Pantry: { bg: 'bg-indigo-100 dark:bg-indigo-500/15', text: 'text-indigo-900 dark:text-indigo-300 font-bold', border: 'border-indigo-300 dark:border-indigo-500/30' },
  Frozen: { bg: 'bg-cyan-100 dark:bg-cyan-500/15', text: 'text-cyan-900 dark:text-cyan-300 font-bold', border: 'border-cyan-300 dark:border-cyan-500/30' }
};
