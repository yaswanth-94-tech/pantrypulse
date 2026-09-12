// Central API client for PantryPulse with cold-start detection & fallback support

const API_BASE = '/api';

export async function checkHealth() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return { isLive: true, data };
    }
    return { isLive: false, isColdStart: false };
  } catch (err) {
    clearTimeout(timeoutId);
    // Timeout or network failure implies Render cold start waking up
    return { isLive: false, isColdStart: true };
  }
}

export async function parsePantryImage(base64Data, mimeType = 'image/jpeg', userId = 'demo-user') {
  try {
    const res = await fetch(`${API_BASE}/pantry/parse-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Data, mimeType, userId }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to parse image');
    }

    return await res.json();
  } catch (err) {
    console.warn('API call failed, fallback simulated AI response:', err.message);
    // Intelligent client-side demo fallback
    return {
      success: true,
      items: [
        {
          id: 'demo-' + Date.now() + '-1',
          name: 'Organic Avocados (2x)',
          category: 'Produce',
          storage_location: 'Counter',
          shelf_life_days: 3,
          expiry_date: new Date(Date.now() + 3 * 86400000).toISOString(),
          status: 'active'
        },
        {
          id: 'demo-' + Date.now() + '-2',
          name: 'Whole Milk 1L',
          category: 'Dairy',
          storage_location: 'Fridge',
          shelf_life_days: 5,
          expiry_date: new Date(Date.now() + 5 * 86400000).toISOString(),
          status: 'active'
        },
        {
          id: 'demo-' + Date.now() + '-3',
          name: 'Fresh Strawberries',
          category: 'Produce',
          storage_location: 'Fridge',
          shelf_life_days: 2,
          expiry_date: new Date(Date.now() + 2 * 86400000).toISOString(),
          status: 'active'
        }
      ],
      source: 'client-fallback'
    };
  }
}

export async function generateRescueRecipe(items) {
  try {
    const res = await fetch(`${API_BASE}/recipes/rescue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to generate recipe');
    }

    return await res.json();
  } catch (err) {
    console.warn('Recipe API error, returning zero-waste demo recipe:', err.message);
    return {
      title: `Zero-Waste ${items.slice(0, 2).join(' & ')} Rescue Pan`,
      prep_time_minutes: 8,
      cook_time_minutes: 12,
      urgency_reasoning: `Saves ${items.join(', ')} before spoilage!`,
      ingredients_used: items,
      missing_staples: ['Cooking Oil', 'Salt & Pepper'],
      instructions: [
        'Heat 1 tbsp olive oil in a skillet over medium heat.',
        `Sauté ${items.join(' and ')} for 4-5 minutes until tender.`,
        'Season with salt, pepper, and your favorite spices.',
        'Serve hot with warm bread or rice. Bon Appétit!'
      ],
      source: 'client-fallback'
    };
  }
}

export async function fetchPantryItems(userId) {
  try {
    const url = userId 
      ? `${API_BASE}/pantry/items?userId=${encodeURIComponent(userId)}` 
      : `${API_BASE}/pantry/items`;
    const res = await fetch(url);
    if (res.ok) return await res.json();
    return [];
  } catch (err) {
    console.error('Fetch pantry items error:', err);
    return [];
  }
}

export async function createPantryItem(itemData) {
  try {
    const res = await fetch(`${API_BASE}/pantry/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });
    if (res.ok) return await res.json();
    return null;
  } catch (err) {
    return null;
  }
}

export async function updateItemStatus(id, status) {
  try {
    const res = await fetch(`${API_BASE}/pantry/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) return await res.json();
    return null;
  } catch (err) {
    return null;
  }
}

export async function deleteItem(id) {
  try {
    const res = await fetch(`${API_BASE}/pantry/items/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}
