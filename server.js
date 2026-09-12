import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const port = process.env.PORT || 10000;

// Initialize Supabase (with fallback safety check)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// Initialize Gemini SDK (with fallback safety check)
const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

// 0. Render Keep-Alive / Health Endpoint (PRD 3.1)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'live', 
    uptime: process.uptime(),
    hasGemini: !!ai,
    hasSupabase: !!supabase,
    timestamp: new Date().toISOString()
  });
});

function formatUserId(id) {
  if (!id) return '00000000-0000-0000-0000-000000000000';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;
  return crypto.createHash('md5').update(String(id)).digest('hex').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
}

// In-Memory Fallback Store (Empty by default for all users)
let memoryPantry = [];

const memoryCache = new Map();

// 1. Visual Ingestion Route (Consumes base64 without heavy memory overhead - PRD 6.1)
app.post('/api/pantry/parse-image', async (req, res) => {
  try {
    const { base64Data, mimeType, userId } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'Missing image payload (base64Data)' });
    }

    const effectiveUserId = userId || 'demo-user';
    let parsedItems = [];

    if (ai) {
      // Clean base64 string if data URL prefix exists
      const cleanBase64 = base64Data.includes('base64,') 
        ? base64Data.split('base64,')[1] 
        : base64Data;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { data: cleanBase64, mimeType: mimeType || 'image/jpeg' } },
              { text: 'Identify all edible grocery/food items visible in the image. Return structured data estimating realistic shelf-life in days when stored in recommended home conditions.' }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    category: { 
                      type: Type.STRING,
                      enum: ['Produce', 'Dairy', 'Meat', 'Bakery', 'Pantry', 'Frozen'] 
                    },
                    storage_location: { 
                      type: Type.STRING, 
                      enum: ['Fridge', 'Freezer', 'Pantry', 'Counter'] 
                    },
                    estimated_shelf_life_days: { type: Type.INTEGER }
                  },
                  required: ['name', 'category', 'storage_location', 'estimated_shelf_life_days']
                }
              }
            },
            required: ['items']
          }
        }
      });

      const parsed = JSON.parse(response.text.trim());
      parsedItems = parsed.items || [];
    } else {
      // Mock Fallback Extraction for Instant Local Demo without API key
      console.log('Gemini API key not configured. Using intelligent demo scanner response.');
      parsedItems = [
        { name: 'Organic Bell Peppers', category: 'Produce', storage_location: 'Fridge', estimated_shelf_life_days: 5 },
        { name: 'Whole Milk 1L', category: 'Dairy', storage_location: 'Fridge', estimated_shelf_life_days: 6 },
        { name: 'Fresh Cilantro Bunch', category: 'Produce', storage_location: 'Fridge', estimated_shelf_life_days: 3 },
        { name: 'Almond Milk', category: 'Dairy', storage_location: 'Fridge', estimated_shelf_life_days: 8 }
      ];
    }

    const now = new Date();
    const dbPayload = parsedItems.map(item => ({
      id: crypto.randomUUID(),
      user_id: effectiveUserId,
      name: item.name,
      category: item.category || 'Pantry',
      storage_location: item.storage_location || 'Fridge',
      shelf_life_days: item.estimated_shelf_life_days || 5,
      expiry_date: new Date(now.getTime() + (item.estimated_shelf_life_days || 5) * 86400000).toISOString(),
      status: 'active',
      created_at: now.toISOString()
    }));

    // Return structured items for user preview and confirmation before importing
    return res.status(200).json({ 
      success: true, 
      items: dbPayload, 
      source: ai ? 'gemini-supabase' : 'demo-mode' 
    });
  } catch (err) {
    console.error('Extraction error:', err);
    return res.status(500).json({ error: 'Failed to process receipt/shelf image: ' + err.message });
  }
});

// 2. Rescue Recipe Route with SHA-256 Caching (PRD 5.2 & 6.1)
app.post('/api/recipes/rescue', async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'No items provided for rescue recipe' });
    }

    const sortedKey = items.map(i => i.trim().toLowerCase()).sort().join(':');
    const ingredientHash = crypto.createHash('sha256').update(sortedKey).digest('hex');

    // 1. Cache lookup in Supabase
    if (supabase) {
      const { data: cached } = await supabase
        .from('recipes_cache')
        .select('recipe_data')
        .eq('ingredient_hash', ingredientHash)
        .maybeSingle();

      if (cached) {
        return res.status(200).json({ ...cached.recipe_data, source: 'cache' });
      }
    } else if (memoryCache.has(ingredientHash)) {
      return res.status(200).json({ ...memoryCache.get(ingredientHash), source: 'memory-cache' });
    }

    let recipeResult = null;

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { 
                text: `Create an amazing zero-waste rescue meal using these ingredients that are expiring soon: ${items.join(', ')}. Assume standard pantry items like salt, pepper, oil, and water are available. Focus on minimizing food waste!` 
              }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              prep_time_minutes: { type: Type.INTEGER },
              cook_time_minutes: { type: Type.INTEGER },
              urgency_reasoning: { type: Type.STRING },
              ingredients_used: { type: Type.ARRAY, items: { type: Type.STRING } },
              missing_staples: { type: Type.ARRAY, items: { type: Type.STRING } },
              instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['title', 'prep_time_minutes', 'cook_time_minutes', 'ingredients_used', 'instructions']
          }
        }
      });

      recipeResult = JSON.parse(response.text.trim());
    } else {
      // Fallback AI Recipe Generator for Demo Mode
      recipeResult = {
        title: `Zero-Waste ${items.slice(0, 2).join(' & ')} Rescue Scramble`,
        prep_time_minutes: 8,
        cook_time_minutes: 12,
        urgency_reasoning: `Saves ${items.join(', ')} before they lose peak freshness.`,
        ingredients_used: items,
        missing_staples: ['Olive Oil', 'Salt & Black Pepper'],
        instructions: [
          `Heat 1 tbsp olive oil in a non-stick skillet over medium-high heat.`,
          `Chop and saute ${items.filter(i => !i.toLowerCase().includes('egg')).join(', ') || 'the vegetables'} until tender (approx 4 minutes).`,
          `Whisk any eggs or liquid ingredients in a bowl, then pour into the pan with the vegetables.`,
          `Gently fold and cook until soft curds form and ingredients are hot.`,
          `Season to taste with salt and black pepper. Serve warm!`
        ]
      };
    }

    // Save to cache asynchronously
    if (supabase) {
      supabase.from('recipes_cache').insert({
        ingredient_hash: ingredientHash,
        recipe_data: recipeResult
      }).then(() => console.log('Recipe cached to Supabase successfully.'))
        .catch(err => console.error('Cache save error:', err));
    } else {
      memoryCache.set(ingredientHash, recipeResult);
    }

    return res.status(200).json({ ...recipeResult, source: ai ? 'gemini-generated' : 'demo-generated' });
  } catch (err) {
    console.error('Recipe error:', err);
    return res.status(500).json({ error: 'Failed to generate rescue recipe: ' + err.message });
  }
});

// 3. Pantry CRUD Endpoints
app.get('/api/pantry/items', async (req, res) => {
  try {
    const { userId } = req.query;
    // New users or unauthenticated requests get empty array
    if (!userId) {
      return res.status(200).json([]);
    }

    const formattedId = formatUserId(userId);

    if (supabase) {
      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('user_id', formattedId)
        .order('expiry_date', { ascending: true });
      
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    const userItems = memoryPantry.filter(i => i.user_id === formattedId);
    return res.status(200).json(userItems);
  } catch (err) {
    console.error('Fetch pantry error:', err);
    return res.status(200).json([]); // clean fallback
  }
});

app.post('/api/pantry/items', async (req, res) => {
  try {
    const { name, category, storage_location, shelf_life_days, expiry_date, status, user_id } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const days = parseInt(shelf_life_days) || 5;
    const computedExpiry = expiry_date || new Date(Date.now() + days * 86400000).toISOString();
    
    const newItem = {
      id: crypto.randomUUID(),
      user_id: formatUserId(user_id),
      name,
      category: category || 'Pantry',
      storage_location: storage_location || 'Fridge',
      shelf_life_days: days,
      expiry_date: computedExpiry,
      status: status || 'active',
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase.from('pantry_items').insert(newItem).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    memoryPantry.push(newItem);
    return res.status(201).json(newItem);
  } catch (err) {
    console.error('Add item error:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.patch('/api/pantry/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (supabase) {
      const { data, error } = await supabase
        .from('pantry_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    const idx = memoryPantry.findIndex(i => i.id === id);
    if (idx !== -1) {
      memoryPantry[idx] = { ...memoryPantry[idx], ...updates };
      return res.status(200).json(memoryPantry[idx]);
    }
    return res.status(404).json({ error: 'Item not found' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/pantry/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (supabase) {
      const { error } = await supabase.from('pantry_items').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    memoryPantry = memoryPantry.filter(i => i.id !== id);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Serve frontend static build in production (when dist folder exists)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`PantryPulse backend active on port ${port}`);
  console.log(`Gemini API: ${ai ? 'ENABLED' : 'DEMO MODE'}`);
  console.log(`Supabase DB: ${supabase ? 'ENABLED' : 'IN-MEMORY DEMO MODE'}`);
});
