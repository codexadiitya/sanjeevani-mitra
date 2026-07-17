# Sanjeevani Mitra 🌿

> **Sanjeevani Mitra** is a GenAI-powered, mobile-first health triage assistant designed for rural patients in Chhattisgarh, India. 

The system acts as a conversational first point of guidance for patients communicating in local dialects (such as Chhattisgarhi and Hindi). It evaluates symptom urgency using native Gemma 4 function calling, advises on next steps (without providing medical diagnosis), and dynamically routes patients to nearby health facilities or emergency services based on their location.

---

## 🚀 Key Features

*   **Multilingual Dialect Support**: Defaults to Chhattisgarhi (`cg`), with support for Hindi (`hi`) and English (`en`). Understands colloquial Romanized inputs (e.g., *"morla bukhar aate have"*).
*   **Gemma 4 Function Calling**: Uses `gemma-4-31b-it` native tool calling (`report_triage` schema) to perform structured urgency classification.
*   **Multi-turn Conversational Diagnostics**: Automatically tracks session history to ask follow-up questions for vague inputs before rendering a final triage decision.
*   **Dynamic Geolocation Clinic Finder**: Binds client-side GPS (or district fallbacks for Chhattisgarh's 32 districts) to the OpenStreetMap Overpass API, fetching real medical clinics within 20km with phone numbers and calculated distances.
*   **Safety Disclaimers & Emergency Takeover**: Contains a sticky disclaimer bar and a deterministic keyword-based override that locks the screen and exposes verified Indian emergency services (108 Ambulance, 112 Unified, 104 Health Helpline) for critical cases.
*   **Fail-Safe High-Availability Policy**: Automatically falls back: Gemma 4 ➔ Gemini 2.5 Flash ➔ Local Keyword Engine.

---

## 🛠️ Tech Stack

*   **Frontend**: React (Single-file `App.js`), Tailwind CSS, Lucide Icons, Mukta Font.
*   **Backend**: FastAPI, Uvicorn, Google GenAI SDK.
*   **Database**: MongoDB (Session tracking & log store).
*   **APIs**: OpenStreetMap Overpass API (Free geospatial queries).

---

## 📦 Local Installation & Setup

### Prerequisites
*   Python 3.9+
*   Node.js 18+
*   MongoDB running locally (`mongodb://localhost:27017`)

---

### Step 1: Run the Backend (FastAPI)

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create your `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and configure your API key:
   ```env
   GEMINI_API_KEY="AIzaSy...your_real_google_ai_studio_key..."
   MONGO_URL="mongodb://localhost:27017"
   DB_NAME="sanjeevani_db"
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   pip install google-genai
   ```
5. Start the server:
   ```bash
   python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
   ```
   *Verify startup logs show: `🟢 Sanjeevani Mitra booted in LIVE mode`.*

---

### Step 2: Run the Frontend (React)

1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Create your `.env` file:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies and start the app:
   ```bash
   npm install --legacy-peer-deps
   npm start
   ```
   *The app will automatically open at `http://localhost:3000`.*

---

## ☁️ Cloud Deployment Guide

To deploy this application to the internet for free:

### 1. Database (MongoDB Atlas)
1. Register on [MongoDB Atlas](https://www.mongodb.com/atlas) (Free M0 Tier).
2. Allow access from anywhere (`0.0.0.0/0` in Network Access).
3. Copy your connection URL: `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority`.

### 2. Backend (Render)
1. Log into [Render.com](https://render.com) using your GitHub account.
2. Create a new **Web Service** and connect this repository.
3. Configure the settings:
   * **Root Directory**: `backend`
   * **Start Command**: `python -m uvicorn server:app --host 0.0.0.0 --port $PORT`
4. Add **Environment Variables**:
   * `GEMINI_API_KEY` = *(your Google AI Studio key starting with `AIzaSy...`)*
   * `MONGO_URL` = *(your MongoDB Atlas connection string)*
   * `DB_NAME` = `sanjeevani_db`
   * `CORS_ORIGINS` = `*`
   * `GEMMA_MODEL` = `gemma-4-31b-it`
   * `GEMINI_FALLBACK_MODEL` = `gemini-2.5-flash`

### 3. Frontend (Vercel)
1. Log into [Vercel.com](https://vercel.com) using your GitHub account.
2. Select **Add New** → **Project** and import this repository.
3. Configure the settings:
   * **Root Directory**: `frontend`
4. Add the following **Environment Variable**:
   * `REACT_APP_BACKEND_URL` = *(your live Render backend URL, e.g., `https://sanjeevani-backend.onrender.com`)*
5. Click **Deploy**.

---

## ⚖️ Safety & Disclaimer
*Sanjeevani Mitra is a clinical triage classification tool designed solely to determine care urgency. It is NOT a diagnostic utility and should not replace professional medical evaluations. Always seek emergency medical help if severe symptoms are present.*
