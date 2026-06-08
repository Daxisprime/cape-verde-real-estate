# 🚀 Supabase Setup Guide for ProCV

Follow these steps to connect your ProCV application to a real Supabase database.

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Enter:
   - **Name:** `procv-cape-verde`
   - **Database Password:** (save this securely!)
   - **Region:** Choose closest to Cape Verde (EU West recommended)
4. Click **"Create new project"** and wait for setup (~2 minutes)

---

## Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

---

## Step 3: Add Keys to Your Project

Update your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 4: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `supabase/schema.sql` from this project
4. Paste it into the SQL editor
5. Click **"Run"**

This will create all tables and seed 10 Cape Verde properties!

---

## Step 5: Enable Authentication (Optional)

1. Go to **Authentication** → **Providers**
2. Enable the providers you want:
   - ✅ Email (enabled by default)
   - ✅ Google
   - ✅ GitHub
   - etc.

---

## Step 6: Restart Your Dev Server

```bash
# Kill existing server
pkill -f "next"

# Restart
bun dev
```

---

## ✅ Verification

Once connected, your API will return `"source": "supabase"` instead of `"source": "mock"`.

Test it:
```bash
curl http://localhost:3000/api/properties
```

---

## 📊 Database Schema

| Table | Description |
|-------|-------------|
| `users` | User accounts and profiles |
| `properties` | Property listings |
| `favorites` | User's saved properties |
| `inquiries` | Property inquiry messages |
| `conversations` | Chat conversations |
| `messages` | Chat messages |
| `search_alerts` | Saved search criteria |

---

## 🔒 Security

Row Level Security (RLS) is enabled:
- Anyone can view active properties
- Users can only manage their own data
- Agents can manage their own listings

---

## Need Help?

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
