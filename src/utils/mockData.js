// Initial high-quality mock data for immediate zero-latency demonstration

export const INITIAL_PANTRY_ITEMS = [
  {
    id: 'p1',
    user_id: 'demo-user',
    name: 'Organic Baby Spinach',
    category: 'Produce',
    storage_location: 'Fridge',
    shelf_life_days: 3,
    expiry_date: new Date(Date.now() + 1 * 86400000).toISOString(),
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'p2',
    user_id: 'demo-user',
    name: 'Farm Eggs (Large Grade A)',
    category: 'Dairy',
    storage_location: 'Fridge',
    shelf_life_days: 14,
    expiry_date: new Date(Date.now() + 2 * 86400000).toISOString(),
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'p3',
    user_id: 'demo-user',
    name: 'Ripe Vine Tomatoes',
    category: 'Produce',
    storage_location: 'Counter',
    shelf_life_days: 4,
    expiry_date: new Date(Date.now() + 1 * 86400000).toISOString(),
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'p4',
    user_id: 'demo-user',
    name: 'Whole Grain Sourdough',
    category: 'Bakery',
    storage_location: 'Pantry',
    shelf_life_days: 5,
    expiry_date: new Date(Date.now() + 3 * 86400000).toISOString(),
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'p5',
    user_id: 'demo-user',
    name: 'Sharp Cheddar Cheese',
    category: 'Dairy',
    storage_location: 'Fridge',
    shelf_life_days: 21,
    expiry_date: new Date(Date.now() + 7 * 86400000).toISOString(),
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'p6',
    user_id: 'demo-user',
    name: 'Greek Whole Milk Yogurt',
    category: 'Dairy',
    storage_location: 'Fridge',
    shelf_life_days: 10,
    expiry_date: new Date(Date.now() + 5 * 86400000).toISOString(),
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'p7',
    user_id: 'demo-user',
    name: 'Avocados (Hass)',
    category: 'Produce',
    storage_location: 'Counter',
    shelf_life_days: 4,
    expiry_date: new Date(Date.now() + 2 * 86400000).toISOString(),
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'p8',
    user_id: 'demo-user',
    name: 'Free-Range Chicken Breast',
    category: 'Meat',
    storage_location: 'Fridge',
    shelf_life_days: 3,
    expiry_date: new Date(Date.now() + 0 * 86400000 + 4 * 3600000).toISOString(),
    status: 'active',
    created_at: new Date().toISOString()
  }
];

export const MOCK_RECIPE_CACHE = {
  title: "Spinach, Tomato & Cheddar Zero-Waste Frittata",
  prep_time_minutes: 10,
  cook_time_minutes: 15,
  urgency_reasoning: "Rescues Baby Spinach (1 day left), Tomatoes (1 day left), and Chicken (expiring today) before spoilage.",
  ingredients_used: ["Organic Baby Spinach", "Farm Eggs", "Ripe Vine Tomatoes", "Sharp Cheddar Cheese"],
  missing_staples: ["Olive Oil", "Black Pepper", "Garlic Powder"],
  instructions: [
    "Preheat your oven to 375°F (190°C) or prepare a medium skillet over medium heat.",
    "Whisk 5 farm eggs in a bowl with a dash of black pepper and salt.",
    "Roughly chop the vine tomatoes and baby spinach.",
    "Sauté the tomatoes and spinach in 1 tbsp olive oil for 3 minutes until spinach wilts.",
    "Pour the whisked eggs over the sautéed vegetables and sprinkle shredded cheddar cheese on top.",
    "Cook undisturbed for 4 minutes until edges set, then transfer pan to oven (or cover pan with a lid) for 8 minutes until eggs are completely set and golden.",
    "Slice into quarters and serve immediately. Enjoy your rescued zero-waste feast!"
  ]
};
