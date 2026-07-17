# Sanjeevani Mitra — PRD

## Problem Statement
A multilingual (Chhattisgarhi / Hindi / English) health **triage** chat assistant for rural
Chhattisgarhi-speaking patients. Hackathon prototype: Gemma 4 + function calling backend.
Judged on functionality, real-world impact, clarity. Trust-critical, NOT a diagnosis tool.

## User Persona
Rural patients, low digital literacy, first-time app users, low-end Android phones.
Tone must be calm, safe, unmistakably not a diagnosis.

## Architecture
- **Frontend**: React (single-file `App.js`), Tailwind core utilities, lucide-react icons.
  Mukta font (clean Devanagari). Mobile-first (max-w-md). No external chat UI libs.
- **Backend**: FastAPI (`server.py`). `/api/chat` classifies symptoms into 3 tiers via
  **Gemma 4 function calling** (`report_triage` tool) using `google-genai` SDK.
  Auto-fallback Gemma -> Gemini; each response reports `meta.model_used` + `fallback_triggered`.
  When `GEMINI_API_KEY` is a placeholder, runs a **keyword-based mock** (Gemma-style JSON).
- **DB**: MongoDB — `sessions` + `messages` collections (uuid ids, ISO timestamps).

## Triage tiers (colorblind-safe: icon + label + color)
- self_care (green / CheckCircle2) — home care advice
- clinic_visit (amber / AlertTriangle) — urgency + nearby clinic list (hardcoded Chhattisgarh)
- emergency (red / OctagonAlert) — full-screen takeover, 108 ambulance + nearest facility,
  must acknowledge to dismiss

## Implemented (2026-07-16)
- 3-tier triage backend with function-calling schema + Gemma->Gemini fallback + mock mode
- Session/message persistence in MongoDB; history endpoints
- Hardcoded clinic list + emergency numbers (108/112) endpoint
- Full React UI: persistent disclaimer bar, always-visible language toggle (default Chhattisgarhi),
  self-built message list + input, triage cards, full-screen emergency takeover, history drawer,
  dev/reasoning panel (model used, fallback, latency, reasoning)
- Tested: backend 9/9, frontend 11/11 passing

## Config (backend/.env)
- GEMINI_API_KEY (placeholder now — swap real Google AI Studio key to enable live model)
- GEMMA_MODEL=gemma-4-31b-it, GEMINI_FALLBACK_MODEL=gemini-2.5-flash

## Backlog / Next
- P0: User adds real Gemini/Gemma key -> live-test model_classify path & fallback frequency
- P1: Streaming responses (SSE) for token-by-token replies
- P1: Multi-turn context (currently each message classified independently)
- P2: Voice input (STT) for low-literacy users; TTS read-out of advice
- P2: GPS-based real nearest-clinic lookup; save/share triage result
