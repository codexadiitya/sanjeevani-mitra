# Test Credentials

No authentication in this app — no login/accounts required.

## Backend
- Base URL: from `frontend/.env` `REACT_APP_BACKEND_URL`, all routes prefixed `/api`.
- LLM mode: MOCK (backend/.env `GEMINI_API_KEY="placeholder"`). Responses return
  `meta.model_used="mock"` and `live_model=false`. This is expected until a real
  Google AI Studio (Gemini) key is set to enable Gemma 4 function calling.
