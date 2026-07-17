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

## ⚖️ Safety & Disclaimer
*Sanjeevani Mitra is a clinical triage classification tool designed solely to determine care urgency. It is NOT a diagnostic utility and should not replace professional medical evaluations. Always seek emergency medical help if severe symptoms are present.*
