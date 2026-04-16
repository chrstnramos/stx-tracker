# STX Promo — Automation Roadmap Tracker

Interactive task tracker for the Q2 2026 automation project.

---

## Quick Deploy to Vercel (5 minutes)

### Step 1: Push to GitHub

1. Create a new GitHub repo (e.g., `stx-roadmap`)
2. Upload all files from this folder to the repo
3. Or use the command line:

```bash
cd stx-roadmap-deploy
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/stx-roadmap.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `stx-roadmap` repo
4. Vercel auto-detects Vite. Just click **"Deploy"**
5. Wait ~60 seconds. You'll get a URL like `stx-roadmap.vercel.app`

### Step 3: Embed in Notion

1. Open your Notion page
2. Type `/embed`
3. Paste your Vercel URL
4. Resize the embed block to full width

---

## Enable Team Sync (Firebase)

By default, the tracker uses localStorage (per-browser, no sync).
To make checkboxes sync across all team members in real time:

### Step 1: Create a Firebase Project (Free)

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Create a project"** → name it (e.g., `stx-roadmap`)
3. Disable Google Analytics (not needed) → **Create**

### Step 2: Create a Realtime Database

1. In Firebase Console, go to **Build → Realtime Database**
2. Click **"Create Database"**
3. Choose your region → **Start in test mode** → **Enable**

> **Important:** Test mode rules expire after 30 days. Before they expire,
> update your rules to restrict access. A simple rule:
> ```json
> {
>   "rules": {
>     ".read": true,
>     ".write": true
>   }
> }
> ```
> For tighter security, add authentication later.

### Step 3: Get Your Config

1. In Firebase Console, click the **gear icon** → **Project Settings**
2. Scroll to **"Your apps"** → click the **web icon** (`</>`)
3. Register the app (any name) → Copy the `firebaseConfig` object

### Step 4: Add Config to the Project

1. Open `src/storage.js`
2. Replace the placeholder config with your real config
3. Change `USE_FIREBASE = false` to `USE_FIREBASE = true`
4. Commit and push. Vercel auto-redeploys.

The badge in the header will change from "LOCAL MODE" to "LIVE SYNC"
and all team members will see the same checkboxes in real time.

---

## Project Structure

```
stx-roadmap-deploy/
├── index.html          # Entry point
├── package.json        # Dependencies
├── vite.config.js      # Build config
├── src/
│   ├── main.jsx        # React mount
│   ├── App.jsx         # Full roadmap UI
│   └── storage.js      # Storage layer (Firebase or localStorage)
```

---

## Local Development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`
