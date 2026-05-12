# EduFees - Backend Setup with Node.js and Supabase

This folder contains the complete, ready-to-run Node.js & Express backend for the **EduFees** application. It connects securely to your **Supabase** PostgreSQL database and serves as an API gateway for both Teacher and Student portals.

---

## 🚀 Setup Instructions

### Step 1: Create Supabase Database
1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `./backend/schema.sql` and run them to create all tables, indexes, and row-level security (RLS) rules.

### Step 2: Configure Environment Variables
1. Create a `.env` file inside the `backend` directory (using `backend/.env.example` as a template):
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Retrieve your Supabase API credentials from **Project Settings -> API**:
   - `SUPABASE_URL` (e.g. `https://your-project.supabase.co`)
   - `SUPABASE_ANON_KEY` (Your public anonymous API key)
3. Change the `TEACHER_PASSWORD` to your desired password.

### Step 3: Install & Start Backend
Open your terminal in the backend directory and run:
```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev
```
The server will start running on **`http://localhost:5000`**.

---

## ⚡ Real-Time Syncing (Frontend Connection)
The React frontend is pre-configured with a **smart hybrid API client**.
- If the Node.js server is active on `http://localhost:5000`, the website automatically connects to **Supabase** in real-time.
- If the server is offline or not configured, the website seamlessly falls back to the LocalStorage database, allowing offline testing and immediate browser preview!
