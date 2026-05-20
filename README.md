# 📍 RouteFlow

RouteFlow is a premium, multi-stop route planner and delivery optimization dashboard designed for on-the-go professionals. Whether you are a food delivery driver, courier agent, or independent traveller, RouteFlow helps you organize, manage, and instantly launch multi-destination routes directly into Google Maps with ease.

---

## 🚀 Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | [Next.js 14](https://nextjs.org/) (App Router) | Modern React framework with Server Actions and SSR capabilities. |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & CSS Variables | Responsive layout styled with custom slate variables and dark mode toggles. |
| **Backend & Auth** | [Supabase](https://supabase.com/) | Real-time PostgreSQL database, secure JWT authentication, and user profiles. |
| **Maps API** | [Google Maps Platform](https://developers.google.com/maps) | Autocomplete Address Search, Places API, and Geocoding API. |
| **Hosting & CI/CD** | [Vercel](https://vercel.com/) | Cloud platform for serverless and edge Next.js hosting. |

---

## ✨ Features

* **Instant Address Autocomplete:** Integrated with Google Places API to search and select destination stop points.
* **Intelligent Starting Point:** Agarpara default coordinates configured to pre-populate primary stops for rapid route planning.
* **Premium Dark Mode:** Sleek Slate-900 battery-friendly dark theme with FOUC prevention and local storage state persistence.
* **Multi-Stop Management:** Drag-and-drop stop sorting, dynamic additions, and deletions (up to 25 stops per route).
* **Native Maps Hand-off:** One-click launch to open the complete multi-stop route directions automatically inside Google Maps.
* **Secure Session Syncing:** Connect through email auth or explore as a guest with local storage fallback state management.

---

## 🛠️ Local Setup Instructions

Follow these steps to run RouteFlow on your local development machine:

### 1. Clone the Repository
```bash
git clone https://github.com/Prithwis-AIAgent/RouteFlow.git
cd RouteFlow/routeflow-app
```

### 2. Install Project Dependencies
Make sure you have Node.js installed, then run:
```bash
npm install
```

### 3. Configure Local Environment Variables
Duplicate the environment template file:
```bash
cp .env.example .env.local
```
Open `.env.local` and enter your valid Supabase and Google Maps API keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

---

## ☁️ Vercel Deployment Guide

To deploy RouteFlow directly on Vercel:

1. **Connect Repository:** Log in to [Vercel](https://vercel.com), click **Add New > Project**, and import this GitHub repository.
2. **Configure Settings:**
   * **Framework Preset:** Next.js
   * **Root Directory:** `routeflow-app`
3. **Set Environment Variables:** In the project setup wizard, expand the **Environment Variables** section and insert the following keys matching your configuration:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
4. **Deploy:** Click **Deploy**. Vercel will build the Next.js production bundle and supply a live preview URL.

---

## 🔒 Security Best Practices

* **Zero Hardcoded Credentials:** All credentials, keys, and endpoint targets are requested dynamically from the runtime environment.
* **Air-tight Exclusions:** The `.gitignore` is optimized to block uploads of `.env.local`, `.vercel`, `.next`, and logs to public workspaces.
