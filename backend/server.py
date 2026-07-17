from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import time
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Sanjeevani Mitra API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("sanjeevani")

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMMA_MODEL = os.environ.get("GEMMA_MODEL", "gemma-4-31b-it")
GEMINI_FALLBACK_MODEL = os.environ.get("GEMINI_FALLBACK_MODEL", "gemini-2.5-flash")

PLACEHOLDER_KEYS = {"", "placeholder", "your-key-here", "REPLACE_ME"}


def has_real_key() -> bool:
    return GEMINI_API_KEY not in PLACEHOLDER_KEYS and len(GEMINI_API_KEY) > 20


# ---------------------------------------------------------------------------
# Static / mock reference data
# ---------------------------------------------------------------------------
CLINICS = [
    {"name": "Community Health Centre, Abhanpur", "type": "CHC", "distance_km": 5, "phone": "07726-234100"},
    {"name": "Primary Health Centre, Dhamtari", "type": "PHC", "distance_km": 12, "phone": "07722-238090"},
    {"name": "Dr. B.R. Ambedkar District Hospital, Raipur", "type": "District Hospital", "distance_km": 8, "phone": "0771-2890100"},
    {"name": "AIIMS Raipur", "type": "Tertiary Hospital", "distance_km": 15, "phone": "0771-2573777"},
]

EMERGENCY_NUMBERS = {"ambulance": "108", "national": "112"}

# Triage classification tool schema (used for real Gemma function calling)
# Added 'seeking_info' for diagnostic flow conversations
TRIAGE_FUNCTION = {
    "name": "report_triage",
    "description": (
        "Report the triage classification for the patient's described symptoms. "
        "You MUST call this function for every patient message."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "triage_tier": {
                "type": "string",
                "enum": ["seeking_info", "self_care", "clinic_visit", "emergency"],
                "description": "seeking_info = need more follow-up details to decide; self_care = safe home care; clinic_visit = should see a clinic soon; emergency = life-threatening, needs immediate help.",
            },
            "is_emergency": {"type": "boolean", "description": "True only if triage_tier is emergency."} ,
            "patient_message": {
                "type": "string",
                "description": "A short, calm, reassuring reply or follow-up question to the patient in THEIR language. Never diagnose.",
            },
            "care_recommendation": {
                "type": "string",
                "description": "One concrete next-step advice or follow-up guidance in the patient's language. If triage_tier is seeking_info, guide them on what info is needed.",
            },
            "reasoning": {"type": "string", "description": "Brief clinical reasoning (English, for developers)."},
        },
        "required": ["triage_tier", "is_emergency", "patient_message", "care_recommendation"],
    },
}

LANG_NAMES = {"cg": "Chhattisgarhi", "hi": "Hindi", "en": "English"}

SYSTEM_INSTRUCTION = (
    "You are Sanjeevani Mitra, a calm, careful health triage assistant for rural patients in "
    "Chhattisgarh, India. You are NOT a doctor and you NEVER give a diagnosis. Your only job is to "
    "assess urgency and guide the patient to the right level of care. Always be reassuring and simple. "
    "Reply strictly in the language: {lang}.\n\n"
    "DIAGNOSTIC FLOW:\n"
    "1. If the user's description is brief, vague, or you lack key info (e.g., duration, severity, exact symptoms), "
    "do NOT jump to a final triage recommendation. Instead, set triage_tier to 'seeking_info' and write a friendly "
    "reply asking 1 or 2 relevant follow-up questions to clarify.\n"
    "2. If you have sufficient context, or if the symptoms are clearly critical (e.g., chest pain, difficulty breathing, fainted), "
    "classify them into 'self_care', 'clinic_visit', or 'emergency'.\n\n"
    "You MUST always call the report_triage function."
)

# ---------------------------------------------------------------------------
# Mock triage engine (keyword based, multilingual) — used when no real key
# ---------------------------------------------------------------------------
EMERGENCY_KW = [
    "chest pain", "not breathing", "can't breathe", "cannot breathe", "difficulty breathing",
    "unconscious", "seizure", "stroke", "severe bleeding", "heavy bleeding", "poison", "suicide",
    "fainted", "blue lips", "no pulse",
    "सांस नहीं", "साँस नहीं", "बेहोश", "सीने में दर्द", "छाती में दर्द", "बहुत खून", "दौरा", "लकवा",
    "जहर", "आत्महत्या", "खून बह",
]
CLINIC_KW = [
    "high fever", "fever for", "vomiting", "persistent", "injury", "fracture", "cut", "burn",
    "diarrhea", "diarrhoea", "swelling", "wound", "days", "pain", "ache", "stomach", "headache",
    "बुखार", "तेज बुखार", "उल्टी", "दर्द", "चोट", "दस्त", "घाव", "सूजन", "फ्रैक्चर", "जल गया",
    "दिन से",
]

MOCK_TEXT = {
    "self_care": {
        "cg": ("तोर तकलीफ हल्का लागत हे। घर म आराम कर अउ पानी पीयत रह। दु-तीन दिन म ठीक नई होय त दवाखाना जाबे।",
               "आराम करव, गरम पानी पीयव अउ हल्का खाना खावव। बुखार बाढ़े त तुरते डाक्टर करा जावव।"),
        "hi": ("आपकी तकलीफ हल्की लग रही है। घर पर आराम करें और पानी पीते रहें। दो-तीन दिन में ठीक न हो तो क्लिनिक जाएँ।",
               "आराम करें, गरम पानी पिएँ और हल्का भोजन लें। बुखार बढ़े तो तुरंत डॉक्टर से मिलें।"),
        "en": ("Your symptoms seem mild. Rest at home and keep drinking fluids. If it does not improve in 2-3 days, visit a clinic.",
               "Rest, drink warm water and eat light food. If fever rises, see a doctor promptly."),
    },
    "clinic_visit": {
        "cg": ("तोर लक्षण ल देख के लागत हे के तोला जल्दी दवाखाना जाना चाही। खुद इलाज झन कर।",
               "आज या कल एक नजदीक के स्वास्थ्य केंद्र म जाके डाक्टर ल दिखावव।"),
        "hi": ("आपके लक्षण देखकर लगता है कि आपको जल्दी क्लिनिक जाना चाहिए। खुद इलाज न करें।",
               "आज या कल किसी नजदीकी स्वास्थ्य केंद्र में जाकर डॉक्टर को दिखाएँ।"),
        "en": ("Your symptoms suggest you should visit a clinic soon. Please do not self-medicate.",
               "Please see a doctor at a nearby health centre today or tomorrow."),
    },
    "emergency": {
        "cg": ("ये गंभीर लागत हे। तुरते मदद के जरूरत हे — देरी झन कर।",
               "अभिच 108 म फोन कर के एम्बुलेंस बुलावव अउ सबसे नजदीक के अस्पताल जावव।"),
        "hi": ("यह गंभीर लग रहा है। तुरंत मदद की ज़रूरत है — देर न करें।",
               "अभी 108 पर कॉल करके एम्बुलेंस बुलाएँ और नजदीकी अस्पताल जाएँ।"),
        "en": ("This looks serious. Immediate help is needed — do not delay.",
               "Call 108 for an ambulance now and go to the nearest hospital."),
    },
}


def mock_classify(message: str, lang: str) -> dict:
    text = message.lower()
    tier = "self_care"
    if any(k.lower() in text for k in EMERGENCY_KW):
        tier = "emergency"
    elif any(k.lower() in text for k in CLINIC_KW):
        tier = "clinic_visit"
    lang = lang if lang in ("cg", "hi", "en") else "cg"
    patient_message, care = MOCK_TEXT[tier][lang]
    return {
        "triage_tier": tier,
        "is_emergency": tier == "emergency",
        "patient_message": patient_message,
        "care_recommendation": care,
        "reasoning": f"Mock engine matched tier='{tier}' via keyword rules (no live model key set).",
    }


# ---------------------------------------------------------------------------
# Real model triage (Gemma 4 with function calling, Gemini fallback)
# ---------------------------------------------------------------------------
async def model_classify(history: list[dict], lang: str) -> dict:
    """Try Gemma 4 with function calling; fall back to Gemini. Returns triage + meta."""
    from google import genai
    from google.genai import types

    gclient = genai.Client(api_key=GEMINI_API_KEY)
    tool = types.Tool(function_declarations=[TRIAGE_FUNCTION])
    config = types.GenerateContentConfig(
        tools=[tool],
        system_instruction=SYSTEM_INSTRUCTION.format(lang=LANG_NAMES.get(lang, "Chhattisgarhi")),
        tool_config=types.ToolConfig(
            function_calling_config=types.FunctionCallingConfig(mode="ANY", allowed_function_names=["report_triage"])
        ),
    )

    # Convert mongo history to google Content structures
    contents = []
    for msg in history:
        role = "user" if msg["role"] == "user" else "model"
        # If assistant has function-call content, we can pass text to be safe
        contents.append(
            types.Content(
                role=role,
                parts=[types.Part.from_text(text=msg["text"])]
            )
        )

    def extract(resp) -> Optional[dict]:
        for cand in getattr(resp, "candidates", []) or []:
            for part in getattr(cand.content, "parts", []) or []:
                fc = getattr(part, "function_call", None)
                if fc and fc.name == "report_triage":
                    return dict(fc.args)
        return None

    async def call(model_name: str) -> Optional[dict]:
        resp = await gclient.aio.models.generate_content(model=model_name, contents=contents, config=config)
        return extract(resp)

    # Attempt Gemma first
    try:
        args = await call(GEMMA_MODEL)
        if args:
            return {**args, "model_used": GEMMA_MODEL, "fallback_triggered": False}
        raise ValueError("Gemma returned no function call")
    except Exception as e:  # noqa: BLE001
        logger.warning("Gemma call failed (%s). Falling back to %s", e, GEMINI_FALLBACK_MODEL)
        args = await call(GEMINI_FALLBACK_MODEL)
        if not args:
            raise HTTPException(status_code=502, detail="Both Gemma and Gemini failed to classify")
        return {**args, "model_used": GEMINI_FALLBACK_MODEL, "fallback_triggered": True, "fallback_reason": str(e)}


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    message: str
    language: Literal["cg", "hi", "en"] = "cg"
    session_id: Optional[str] = None


class SessionCreate(BaseModel):
    language: Literal["cg", "hi", "en"] = "cg"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def ensure_session(session_id: Optional[str], language: str) -> str:
    if session_id:
        existing = await db.sessions.find_one({"id": session_id})
        if existing:
            return session_id
    sid = session_id or str(uuid.uuid4())
    await db.sessions.insert_one({"id": sid, "language": language, "created_at": now_iso()})
    return sid


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"message": "Sanjeevani Mitra API", "live_model": has_real_key()}


@api_router.get("/clinics")
async def get_clinics():
    return {"clinics": CLINICS, "emergency_numbers": EMERGENCY_NUMBERS}


@api_router.post("/sessions")
async def create_session(body: SessionCreate):
    sid = await ensure_session(None, body.language)
    return {"session_id": sid}


@api_router.get("/sessions")
async def list_sessions():
    sessions = await db.sessions.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"sessions": sessions}


@api_router.get("/sessions/{session_id}/messages")
async def get_messages(session_id: str):
    msgs = await db.messages.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1).to_list(500)
    return {"session_id": session_id, "messages": msgs}


@api_router.post("/chat")
async def chat(body: ChatRequest):
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    session_id = await ensure_session(body.session_id, body.language)
    started = time.time()

    # Store user message
    user_doc = {
        "id": str(uuid.uuid4()), "session_id": session_id, "role": "user",
        "text": body.message, "language": body.language, "created_at": now_iso(),
    }
    await db.messages.insert_one(dict(user_doc))

    # Fetch history
    history = await db.messages.find({"session_id": session_id}).sort("created_at", 1).to_list(100)

    # Classify
    if has_real_key():
        try:
            result = await model_classify(history, body.language)
        except HTTPException:
            raise
        except Exception as e:  # noqa: BLE001
            logger.error("Model classify unexpected error: %s", e)
            result = {**mock_classify(body.message, body.language), "model_used": "mock", "fallback_triggered": False}
    else:
        result = {**mock_classify(body.message, body.language), "model_used": "mock", "fallback_triggered": False}

    tier = result.get("triage_tier", "self_care")
    is_emergency = bool(result.get("is_emergency", tier == "emergency"))
    include_clinics = tier in ("clinic_visit", "emergency")
    latency_ms = int((time.time() - started) * 1000)

    response = {
        "session_id": session_id,
        "message": result.get("patient_message", ""),
        "triage_tier": tier,
        "care_recommendation": result.get("care_recommendation", ""),
        "is_emergency": is_emergency,
        "clinics": CLINICS if include_clinics else [],
        "emergency_numbers": EMERGENCY_NUMBERS if is_emergency else None,
        "meta": {
            "model_used": result.get("model_used", "mock"),
            "fallback_triggered": result.get("fallback_triggered", False),
            "fallback_reason": result.get("fallback_reason"),
            "reasoning": result.get("reasoning", ""),
            "latency_ms": latency_ms,
            "live_model": has_real_key(),
        },
    }

    # Store assistant message
    assistant_doc = {
        "id": str(uuid.uuid4()), "session_id": session_id, "role": "assistant",
        "text": response["message"], "language": body.language, "created_at": now_iso(),
        "triage": {
            "triage_tier": tier, "is_emergency": is_emergency,
            "care_recommendation": response["care_recommendation"],
            "clinics": response["clinics"], "emergency_numbers": response["emergency_numbers"],
            "meta": response["meta"],
        },
    }
    await db.messages.insert_one(dict(assistant_doc))

    return response


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
