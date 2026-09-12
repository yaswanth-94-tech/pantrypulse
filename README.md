# PantryPulse 🥗⚡

**PantryPulse** is an AI-powered, zero-waste smart kitchen application built with React (Vite), Node.js (Express), Google Gemini, and Supabase. It extracts grocery inventory from receipt photos and generates instant, creative zero-waste rescue recipes to prevent food waste.

---

## 🚀 Deploy to Render (Blueprint)

PantryPulse includes a [`render.yaml`](./render.yaml) blueprint specification for 1-click, automated deployment on the **Render Free Tier**.

Both the React frontend and Express backend are served by a single Node web service, eliminating CORS issues and keeping costs at $0.

### Step-by-Step Deployment Instructions

1. **Push your code to GitHub / GitLab:**
   ```bash
   git add .
   git commit -m "Add Render blueprint and production static file serving"
   git push origin main
   ```

2. **Open Render:**
   - Go to the [Render Dashboard](https://dashboard.render.com).
   - Click **New +** in the top right, then select **Blueprint**.

3. **Connect Your Repository:**
   - Select your PantryPulse repository.
   - Render will automatically detect the [`render.yaml`](./render.yaml) file.

4. **Fill in Environment Variables (when prompted):**
   Render will prompt you to enter the values for the environment variables defined with `sync: false`:

   | Variable Name | Description | Where to get it |
   |---------------|-------------|-----------------|
   | `GEMINI_API_KEY` | Google Gemini API Key | [Google AI Studio](https://aistudio.google.com/app/apikey) |
   | `SUPABASE_URL` | Supabase Project URL | Supabase Dashboard > Project Settings > API |
   | `SUPABASE_ANON_KEY` | Supabase Anonymous Key | Supabase Dashboard > Project Settings > API |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | Supabase Dashboard > Project Settings > API |
   | `VITE_SUPABASE_URL` | Frontend Supabase URL (same as `SUPABASE_URL`) | Supabase Dashboard > Project Settings > API |
   | `VITE_SUPABASE_ANON_KEY` | Frontend Anon Key (same as `SUPABASE_ANON_KEY`) | Supabase Dashboard > Project Settings > API |

5. **Click "Apply":**
   - Render will run `npm install && npm run build` to build the frontend.
   - Then Render runs `npm start` (`node server.js`) to launch the full-stack server on port 10000.
   - Once the health check `/api/health` reports status `live`, your app is published with a free `https://pantrypulse-xxxx.onrender.com` URL!

---

## 💻 Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure your `.env` file:**
   ```env
   PORT=10000
   GEMINI_API_KEY=your_gemini_api_key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start development servers (Concurrent frontend + backend):**
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:10000`
