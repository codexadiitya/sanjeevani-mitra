# Sanjeevani Mitra 🌿

> **Sanjeevani Mitra** is a GenAI-powered, mobile-first health triage assistant designed for rural patients in Chhattisgarh, India. 

The system acts as a conversational first point of guidance for patients communicating in local dialects (such as Chhattisgarhi and Hindi). It evaluates symptom urgency using native Gemma 4 function calling, advises on next steps (without providing medical diagnosis), and dynamically routes patients to nearby health facilities or emergency services based on their location.

---

## 🏗️ System Architecture & Triage Flow

```
[ Patient (Dialect / Hindi / English) ]
                 │
                 ▼
     [ React Mobile Frontend ] ──( Overpass API )──> [ Nearby Clinics (20km) ]
                 │
           (POST /api/chat)
                 │
                 ▼
       [ FastAPI Backend ]
                 │
    ┌────────────┴────────────┐
    │ Emergency Keyword Guard │ ──(Triggered)──> [ Emergency Takeover UI (108 / 112) ]
    └────────────┬────────────┘
                 │ (Passed)
                 ▼
    [ Gemma 4 (gemma-4-31b-it) ] ──(Function Calling)──> [ report_triage Schema ]
                 │
       (Fallback if Unavailable)
                 │
       [ Gemini 2.5 Flash / Engine ]
                 │
                 ▼
    [ Structured Response + Quick Replies ] ──> [ MongoDB Session Store ]
```

---

## 🚀 Key Features

* **Multilingual Dialect Support**: Defaults to Chhattisgarhi (`cg`), with support for Hindi (`hi`) and English (`en`). Understands colloquial Romanized inputs (e.g., *"morla bukhar aate have"*).
* **Gemma 4 Native Function Calling**: Uses `gemma-4-31b-it` tool calling (`report_triage` schema) to produce structured urgency classifications and dynamic quick-reply pills.
* **Multi-turn Conversational Diagnostics**: Automatically tracks session history to ask targeted follow-up questions for vague inputs before reaching a triage decision.
* **Dynamic Geolocation Clinic Finder**: Integrates client-side GPS and 32 Chhattisgarh district coordinate fallbacks with the OpenStreetMap Overpass API, fetching real health centers within 20km.
* **Safety Disclaimers & Emergency Takeover**: Contains a sticky disclaimer bar and a deterministic keyword-based override that locks the screen and exposes verified Indian emergency helplines (108 Ambulance, 112 Unified, 104 Health Helpline).
* **Fail-Safe High-Availability Policy**: Gracefully degrades across tiers: Gemma 4 ➔ Gemini 2.5 Flash ➔ Deterministic Keyword Engine.

---

## 🛠️ Tech Stack

* **Frontend**: React, Tailwind CSS, Lucide Icons.
* **Backend**: FastAPI, Uvicorn, Google GenAI SDK.
* **Database**: MongoDB Atlas (Async Motor driver) with In-Memory Safe Fallback.
* **External APIs**: OpenStreetMap Overpass API (Geospatial clinic queries).

---

## 📂 Repository Structure

```text
├── backend/
│   ├── main.py            # Entrypoint wrapper
│   ├── server.py          # FastAPI application & Gemma triage logic
│   ├── requirements.txt   # Python dependencies
│   └── .env.example       # Sample environment variables
├── frontend/
│   ├── src/               # React components & UI logic
│   ├── public/            # Static assets
│   ├── package.json       # Node dependencies
│   └── .env.example       # Frontend sample environment
├── render.yaml            # Render blueprint deployment spec
└── README.md              # Documentation
```

---

## ⚖️ Safety & Disclaimer
*Sanjeevani Mitra is a clinical triage classification tool designed solely to determine care urgency. It is NOT a diagnostic utility and should not replace professional medical evaluations. Always seek emergency medical help if severe symptoms are present.*
