import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  AlertTriangle,
  CheckCircle2,
  Octagon,
  Phone,
  MapPin,
  Send,
  History,
  Plus,
  X,
  Activity,
  LogOut
} from "lucide-react";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND_URL}/api`;

const CHHATTISGARH_JILAS = [
  "Raipur", "Bilaspur", "Durg", "Rajnandgaon", "Korba", "Raigarh", "Jashpur",
  "Sarguja", "Koriya", "Balrampur", "Surajpur", "Kabirdham", "Bemetara",
  "Mungeli", "Baloda Bazar", "Gariaband", "Mahasamund", "Dhamtari", "Kanker",
  "Kondagaon", "Narayanpur", "Bastar", "Dantewada", "Sukma", "Bijapur",
  "Gaurela-Pendra-Marwahi", "Manendragarh", "Sakti", "Sarangarh-Bilaigarh",
  "Khairagarh", "Mohla-Manpur", "Shankar Nagar"
];

const JILA_COORDS = {
  "Raipur": { lat: 21.2514, lon: 81.6296 },
  "Bilaspur": { lat: 22.0790, lon: 82.1391 },
  "Durg": { lat: 21.1904, lon: 81.2849 },
  "Rajnandgaon": { lat: 21.0971, lon: 80.9831 },
  "Korba": { lat: 22.3595, lon: 82.7501 },
  "Raigarh": { lat: 21.8974, lon: 83.3950 },
  "Jashpur": { lat: 22.9013, lon: 84.1435 },
  "Sarguja": { lat: 22.9150, lon: 83.1650 },
  "Koriya": { lat: 23.2500, lon: 82.5000 },
  "Balrampur": { lat: 23.6061, lon: 83.6158 },
  "Surajpur": { lat: 23.2201, lon: 82.8537 },
  "Kabirdham": { lat: 22.0163, lon: 81.2482 },
  "Bemetara": { lat: 21.7028, lon: 81.5478 },
  "Mungeli": { lat: 22.0684, lon: 81.6859 },
  "Baloda Bazar": { lat: 21.6588, lon: 82.1601 },
  "Gariaband": { lat: 20.6358, lon: 82.0622 },
  "Mahasamund": { lat: 21.0979, lon: 82.0997 },
  "Dhamtari": { lat: 20.7070, lon: 81.5498 },
  "Kanker": { lat: 20.2721, lon: 81.4930 },
  "Kondagaon": { lat: 19.5980, lon: 81.6702 },
  "Narayanpur": { lat: 19.7214, lon: 81.2514 },
  "Bastar": { lat: 19.2156, lon: 81.8661 },
  "Dantewada": { lat: 18.9004, lon: 81.3524 },
  "Sukma": { lat: 18.4005, lon: 81.6669 },
  "Bijapur": { lat: 18.7975, lon: 80.8143 },
  "Gaurela-Pendra-Marwahi": { lat: 22.7744, lon: 81.9167 },
  "Manendragarh": { lat: 23.2100, lon: 82.2000 },
  "Sakti": { lat: 22.0248, lon: 82.9608 },
  "Sarangarh-Bilaigarh": { lat: 21.5959, lon: 83.0827 },
  "Khairagarh": { lat: 21.4178, lon: 80.9754 },
  "Mohla-Manpur": { lat: 20.5794, lon: 80.7454 },
  "Shankar Nagar": { lat: 21.2612, lon: 81.6587 }
};

const COPY = {
  cg: {
    disclaimer: "चेतावनी: ये केवल जानकारी बर हे, कोनो डाक्टर के सलाह नई हे। आपातकाल म अस्पताल जावव।",
    title: "संजीवनी मित्र",
    subtitle: "तोर सेहत के संगवारी",
    welcome: "राम-राम {name}! मैं संजीवनी मित्र हरंव। अपन बीमारी या तकलीफ के बारे म बताओ।",
    placeholder: "अपन तकलीफ इहाँ लिखव...",
    historyTitle: "सत्र इतिहास",
    newSession: "नवा सत्र",
    callAmbulance: "108 एम्बुलेंस ला फोन करव",
    acknowledgeEmergency: "मैं समझ गयूँ (बंद करव)",
    selfCare: "घरेलू उपचार (Self-Care)",
    clinicVisit: "दवाखाना सलाह (Clinic Visit)",
    emergency: "आपातकाल! (Emergency)",
    devTitle: "डेवलपर पैनल",
    clinicsTitle: "नजदीक के स्वास्थ्य केंद्र:",
    distance: "दूरी: {dist} किमी",
    phone: "फ़ोन: {phone}",
    send: "भेजव",
    call: "फोन",
    thinking: "सोचत हे...",
    error: "माफ करव, अभी जुड़ नई पावत हँव। थोड़ा देर बाद फिर कोसिस करव।",
    signOut: "बाहर जावव",
    // Onboarding
    onboardTitle: "संजीवनी मित्र म स्वागत हे",
    onboardSubtitle: "शुरू करे बर अपन जानकारी भरव",
    onboardName: "तोर नाम",
    onboardNamePlaceholder: "नाम लिखव",
    onboardMobile: "मोबाइल नंबर",
    onboardMobilePlaceholder: "10 अंक के नंबर",
    onboardJila: "जिला",
    onboardJilaPlaceholder: "अपन जिला चुनव",
    onboardSubmit: "शुरू करव →",
    onboardNote: "तोर जानकारी सुरक्षित हे। ये केवल तोर सेहत मदद बर हे।"
  },
  hi: {
    disclaimer: "अस्वीकरण: यह केवल सूचना के लिए है, किसी डॉक्टर की सलाह नहीं है। आपातकाल में अस्पताल जाएँ।",
    title: "संजीवनी मित्र",
    subtitle: "आपका स्वास्थ्य मार्गदर्शक",
    welcome: "नमस्ते {name}! मैं संजीवनी मित्र हूँ। अपनी बीमारी या तकलीफ के बारे में बताएँ।",
    placeholder: "अपनी तकलीफ यहाँ लिखें...",
    historyTitle: "सत्र इतिहास",
    newSession: "नया सत्र",
    callAmbulance: "108 एम्बुलेंस को कॉल करें",
    acknowledgeEmergency: "मैं समझ गया (बंद करें)",
    selfCare: "घरेलू उपचार (Self-Care)",
    clinicVisit: "क्लिनिक सलाह (Clinic Visit)",
    emergency: "आपातकाल! (Emergency)",
    devTitle: "डेवलपर पैनल",
    clinicsTitle: "नजीकी स्वास्थ्य केंद्र:",
    distance: "दूरी: {dist} किमी",
    phone: "फ़ोन: {phone}",
    send: "भेजें",
    call: "कॉल",
    thinking: "सोच रहा है...",
    error: "क्षमा करें, अभी कनेक्ट नहीं हो पा रहा। थोड़ी देर बाद फिर कोशिश करें।",
    signOut: "लॉग आउट",
    // Onboarding
    onboardTitle: "संजीवनी मित्र में आपका स्वागत है",
    onboardSubtitle: "शुरू करने के लिए अपनी जानकारी भरें",
    onboardName: "आपका नाम",
    onboardNamePlaceholder: "नाम लिखें",
    onboardMobile: "मोबाइल नंबर",
    onboardMobilePlaceholder: "10 अंकों का नंबर",
    onboardJila: "जिला",
    onboardJilaPlaceholder: "अपना जिला चुनें",
    onboardSubmit: "शुरू करें →",
    onboardNote: "आपकी जानकारी सुरक्षित है। यह केवल आपकी स्वास्थ्य सहायता के लिए है।"
  },
  en: {
    disclaimer: "Disclaimer: For information only, not medical advice. For emergencies, go to a hospital.",
    title: "Sanjeevani Mitra",
    subtitle: "Your Health Companion",
    welcome: "Hello {name}! I am Sanjeevani Mitra. Describe your symptoms to check urgency.",
    placeholder: "Type your symptoms here...",
    historyTitle: "Session History",
    newSession: "New Session",
    callAmbulance: "Call 108 Ambulance",
    acknowledgeEmergency: "I Understand (Dismiss)",
    selfCare: "Self-Care",
    clinicVisit: "Clinic Visit",
    emergency: "Emergency",
    devTitle: "Developer Panel",
    clinicsTitle: "Recommended Clinics:",
    distance: "Distance: {dist} km",
    phone: "Phone: {phone}",
    send: "Send",
    call: "Call",
    thinking: "Thinking...",
    error: "Sorry, I could not connect right now. Please try again in a moment.",
    signOut: "Sign Out",
    // Onboarding
    onboardTitle: "Welcome to Sanjeevani Mitra",
    onboardSubtitle: "Fill in your details to get started",
    onboardName: "Your Name",
    onboardNamePlaceholder: "Enter your name",
    onboardMobile: "Mobile Number",
    onboardMobilePlaceholder: "10-digit number",
    onboardJila: "District (Jila)",
    onboardJilaPlaceholder: "Select your district",
    onboardSubmit: "Get Started →",
    onboardNote: "Your information is safe. This is only for your health assistance."
  }
};

function App() {
  const [language, setLanguage] = useState("cg");
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  // Onboarding state
  const savedUser = (() => { try { return JSON.parse(localStorage.getItem("sm_user") || "null"); } catch { return null; } })();
  const [user, setUser] = useState(savedUser);
  const [onboardForm, setOnboardForm] = useState({ name: "", mobile: "", jila: "" });
  const [onboardError, setOnboardError] = useState("");
  
  // UI states
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDevOpen, setIsDevOpen] = useState(false);
  
  // Session list for history drawer
  const [sessions, setSessions] = useState([]);
  
  // Last metadata for developer panel
  const [devMeta, setDevMeta] = useState(null);

  // Geolocation & nearby clinics
  const [nearbyClinics, setNearbyClinics] = useState([]);
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | loading | done | denied

  const messagesEndRef = useRef(null);

  const text = COPY[language];

  // Fetch real nearby health facilities from OpenStreetMap (free, no API key)
  const fetchNearbyClinics = () => {
    setLocationStatus("loading");

    const queryOverpass = async (lat, lon, label) => {
      try {
        const query = `[out:json][timeout:15];(
          node["amenity"~"hospital|clinic|health_centre|doctors"](around:20000,${lat},${lon});
          way["amenity"~"hospital|clinic|health_centre|doctors"](around:20000,${lat},${lon});
        );out center 6;`;
        const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        const data = await res.json();
        const clinics = data.elements
          .filter(el => el.tags?.name)
          .map((el) => {
            const elLat = el.lat ?? el.center?.lat;
            const elLon = el.lon ?? el.center?.lon;
            const dist = elLat && elLon
              ? Math.round(Math.sqrt(Math.pow((elLat - lat) * 111, 2) + Math.pow((elLon - lon) * 111 * Math.cos(lat * Math.PI / 180), 2)) * 10) / 10
              : null;
            return {
              name: el.tags.name,
              type: el.tags.amenity === "hospital" ? "Hospital" : el.tags.amenity === "clinic" ? "Clinic" : "Health Centre",
              distance_km: dist ?? "?",
              phone: el.tags.phone || el.tags["contact:phone"] || "108"
            };
          })
          .sort((a, b) => (a.distance_km === "?" ? 999 : a.distance_km) - (b.distance_km === "?" ? 999 : b.distance_km))
          .slice(0, 5);

        setNearbyClinics(clinics);
        setLocationStatus(label);
      } catch (e) {
        console.error("Overpass query failed:", e);
        setLocationStatus("failed");
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          queryOverpass(pos.coords.latitude, pos.coords.longitude, "gps");
        },
        () => {
          // Geolocation failed or denied -> Try district center fallback
          const savedUser = JSON.parse(localStorage.getItem("sm_user") || "null");
          const activeJila = user?.jila || savedUser?.jila;
          if (activeJila && JILA_COORDS[activeJila]) {
            const coords = JILA_COORDS[activeJila];
            queryOverpass(coords.lat, coords.lon, "jila");
          } else {
            setLocationStatus("denied");
          }
        },
        { timeout: 8000 }
      );
    } else {
      const savedUser = JSON.parse(localStorage.getItem("sm_user") || "null");
      const activeJila = user?.jila || savedUser?.jila;
      if (activeJila && JILA_COORDS[activeJila]) {
        const coords = JILA_COORDS[activeJila];
        queryOverpass(coords.lat, coords.lon, "jila");
      } else {
        setLocationStatus("denied");
      }
    }
  };

  // Request location as soon as user completes onboarding
  useEffect(() => {
    if (user) fetchNearbyClinics();
  }, [user]); // eslint-disable-line

  const handleOnboardSubmit = (e) => {
    e.preventDefault();
    if (!onboardForm.name.trim()) { setOnboardError("नाम / Name required"); return; }
    if (!/^[0-9]{10}$/.test(onboardForm.mobile.trim())) { setOnboardError("Valid 10-digit mobile number required"); return; }
    if (!onboardForm.jila) { setOnboardError("Please select your district / जिला चुनें"); return; }
    const newUser = { name: onboardForm.name.trim(), mobile: onboardForm.mobile.trim(), jila: onboardForm.jila };
    localStorage.setItem("sm_user", JSON.stringify(newUser));
    setUser(newUser);
    setOnboardError("");
  };

  const handleSignOut = () => {
    localStorage.removeItem("sm_user");
    setUser(null);
    setOnboardForm({ name: "", mobile: "", jila: "" });
    setMessages([]);
    setSessionId("");
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load initial sessions & set up current session on mount
  useEffect(() => {
    fetchSessions();
    startNewSession();
  }, []);

  // Fetch all sessions from backend
  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${API}/sessions`);
      if (res.data && res.data.sessions) {
        setSessions(res.data.sessions);
      }
    } catch (e) {
      console.error("Error fetching sessions:", e);
    }
  };

  // Start new session
  const startNewSession = async () => {
    try {
      const res = await axios.post(`${API}/sessions`, { language });
      if (res.data && res.data.session_id) {
        const newId = res.data.session_id;
        setSessionId(newId);
        setMessages([]);
        setDevMeta(null);
        setIsEmergencyActive(false);
        fetchSessions();
      }
    } catch (e) {
      console.error("Error creating session:", e);
    }
  };

  // Load specific session history
  const loadSession = async (sid) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/sessions/${sid}/messages`);
      if (res.data && res.data.messages) {
        setSessionId(sid);
        setMessages(res.data.messages);
        
        // Find last assistant triage to configure dev panel / emergency state
        const assistantMsgs = res.data.messages.filter(m => m.role === "assistant");
        if (assistantMsgs.length > 0) {
          const lastMsg = assistantMsgs[assistantMsgs.length - 1];
          if (lastMsg.triage) {
            setDevMeta(lastMsg.triage.meta);
            if (lastMsg.triage.triage_tier === "emergency") {
              setIsEmergencyActive(true);
            }
          }
        } else {
          setDevMeta(null);
          setIsEmergencyActive(false);
        }
        setIsHistoryOpen(false);
      }
    } catch (e) {
      console.error("Error loading session:", e);
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async (userMsg) => {
    if (!userMsg.trim() || loading) return;
    setLoading(true);

    // Optimistically update local message state (before API returns)
    const tempUserMsg = {
      id: Math.random().toString(),
      role: "user",
      text: userMsg,
      language
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await axios.post(`${API}/chat`, {
        message: userMsg,
        language,
        session_id: sessionId
      });

      if (res.data) {
        // Update messages with actual server records
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== tempUserMsg.id);
          return [
            ...filtered,
            {
              id: Math.random().toString(),
              role: "user",
              text: userMsg,
              language
            },
            {
              id: Math.random().toString(),
              role: "assistant",
              text: res.data.message,
              language,
              triage: {
                triage_tier: res.data.triage_tier,
                is_emergency: res.data.is_emergency,
                quick_replies: res.data.quick_replies || [],
                care_recommendation: res.data.care_recommendation,
                clinics: res.data.clinics,
                emergency_numbers: res.data.emergency_numbers,
                meta: res.data.meta
              }
            }
          ];
        });

        // Set developer panel metadata
        if (res.data.meta) {
          setDevMeta(res.data.meta);
        }

        // Trigger emergency takeover if appropriate
        if (res.data.triage_tier === "emergency" || res.data.is_emergency) {
          setIsEmergencyActive(true);
        }

        // Refresh sessions list
        fetchSessions();
      }
    } catch (error) {
      console.error("Chat API error:", error);
      // Fallback display if server fails
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          text: text.error,
          language
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Send message handler
  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || loading) return;
    const msg = inputText.trim();
    setInputText("");
    sendChatMessage(msg);
  };

  const handleQuickReplyClick = (replyText) => {
    sendChatMessage(replyText);
  };

  // Render triage status cards
  const renderTriageCard = (triage) => {
    if (!triage || !triage.triage_tier || triage.triage_tier === "seeking_info") return null;

    const tier = triage.triage_tier;
    let cardStyle = "";
    let label = "";
    let Icon = null;

    if (tier === "self_care") {
      cardStyle = "bg-emerald-50 border-emerald-200 text-emerald-900";
      label = text.selfCare;
      Icon = CheckCircle2;
    } else if (tier === "clinic_visit") {
      cardStyle = "bg-amber-50 border-amber-200 text-amber-900";
      label = text.clinicVisit;
      Icon = AlertTriangle;
    } else if (tier === "emergency") {
      cardStyle = "bg-red-50 border-red-200 text-red-900";
      label = text.emergency;
      Icon = Octagon;
    }

    return (
      <div
        data-testid="triage-card"
        className={`mt-3 p-4 border rounded-md ${cardStyle} sm-fade-in`}
      >
        <div className="flex items-center gap-2 font-bold mb-1">
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span data-testid="triage-tier-label">{label}</span>
        </div>
        <p className="text-base font-semibold">{triage.care_recommendation}</p>

        {(() => {
          // Prefer real GPS clinics, fall back to backend-provided list
          const displayClinics = nearbyClinics.length > 0 ? nearbyClinics : (triage.clinics || []);
          return displayClinics.length > 0 ? (
            <div data-testid="clinic-list" className="mt-3 pt-3 border-t border-current/10">
              <h4 className="font-bold text-sm mb-2">
                {text.clinicsTitle}
                {locationStatus === "gps" && (
                  <span className="ml-2 text-xs font-normal opacity-70">📍 Near you (GPS)</span>
                )}
                {locationStatus === "jila" && (
                  <span className="ml-2 text-xs font-normal opacity-70">📍 Near {user?.jila} District</span>
                )}
              </h4>
              <div className="space-y-2">
                {displayClinics.map((clinic, idx) => (
                  <div key={idx} className="bg-white/60 p-2.5 rounded border border-current/10 text-stone-900 text-sm">
                    <div className="font-bold flex items-center justify-between">
                      <span>{clinic.name}</span>
                      <span className="text-xs bg-stone-200 text-stone-800 px-1.5 py-0.5 rounded">
                        {clinic.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-stone-600 mt-1 text-xs flex-wrap">
                      {clinic.distance_km && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {text.distance.replace("{dist}", clinic.distance_km)}
                        </span>
                      )}
                      <a href={`tel:${clinic.phone}`} className="flex items-center gap-1 text-blue-700 font-semibold underline">
                        <Phone className="w-3.5 h-3.5" />
                        {clinic.phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        })()}
      </div>
    );
  };

  return (
    <div className="App flex flex-col min-h-screen bg-[#FDFBF7]">

      {/* ── ONBOARDING GATE ── Show before chat if user not registered */}
      {!user && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-6">
          {/* Language selector on onboarding */}
          <div className="flex gap-2 mb-8">
            {["cg", "hi", "en"].map((l) => (
              <button key={l} onClick={() => setLanguage(l)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  language === l ? "bg-white text-blue-900 border-white" : "bg-white/10 text-white border-white/30 hover:bg-white/20"
                }`}>
                {l === "cg" ? "छत्तीसगढ़ी" : l === "hi" ? "हिंदी" : "English"}
              </button>
            ))}
          </div>

          {/* Logo / Title */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-white/40 shadow-xl">
              <img src="/logo.jpg" alt="Sanjeevani Mitra" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">{text.onboardTitle}</h1>
            <p className="text-blue-200 mt-2 text-base">{text.onboardSubtitle}</p>
          </div>

          {/* Form Card */}
          <form onSubmit={handleOnboardSubmit}
            className="w-full max-w-sm bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 space-y-4">

            {/* Name */}
            <div>
              <label className="block text-white font-semibold text-sm mb-1.5">{text.onboardName} *</label>
              <input
                type="text"
                value={onboardForm.name}
                onChange={(e) => setOnboardForm(f => ({ ...f, name: e.target.value }))}
                placeholder={text.onboardNamePlaceholder}
                className="w-full bg-white/90 text-stone-900 rounded-lg px-4 py-3 text-lg font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                maxLength={60}
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-white font-semibold text-sm mb-1.5">{text.onboardMobile} *</label>
              <input
                type="tel"
                inputMode="numeric"
                value={onboardForm.mobile}
                onChange={(e) => setOnboardForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                placeholder={text.onboardMobilePlaceholder}
                className="w-full bg-white/90 text-stone-900 rounded-lg px-4 py-3 text-lg font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Jila */}
            <div>
              <label className="block text-white font-semibold text-sm mb-1.5">{text.onboardJila} *</label>
              <select
                value={onboardForm.jila}
                onChange={(e) => setOnboardForm(f => ({ ...f, jila: e.target.value }))}
                className="w-full bg-white/90 text-stone-900 rounded-lg px-4 py-3 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">{text.onboardJilaPlaceholder}</option>
                {CHHATTISGARH_JILAS.map((j) => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
            </div>

            {/* Error */}
            {onboardError && (
              <p className="text-amber-300 text-sm font-semibold text-center">{onboardError}</p>
            )}

            {/* Submit */}
            <button type="submit"
              className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-blue-950 font-black text-xl rounded-xl transition-all active:scale-95 shadow-lg mt-2">
              {text.onboardSubmit}
            </button>

            <p className="text-blue-200/70 text-xs text-center pt-1">{text.onboardNote}</p>
          </form>
        </div>
      )}
      {/* Sticky Disclaimer Bar */}
      <div
        id="disclaimer-bar"
        data-testid="disclaimer-bar"
        className="bg-stone-900 text-amber-300 font-medium py-3 px-4 text-center text-sm md:text-base sticky top-0 z-40 border-b-4 border-amber-500"
      >
        {text.disclaimer}
      </div>

      {/* Main Container Container (Mobile Centered Layout) */}
      <div className="max-w-md mx-auto w-full flex-grow flex flex-col bg-white border-x border-stone-200 relative min-h-0">
        
        {/* Header Section */}
        <header className="p-4 border-b border-stone-200 flex items-center justify-between bg-[#FDFBF7]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 leading-tight">
              {text.title}
            </h1>
            <p className="text-sm text-stone-500">{text.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              data-testid="dev-panel-toggle"
              onClick={() => setIsDevOpen(!isDevOpen)}
              className={`p-2 rounded border border-stone-300 hover:bg-stone-100 transition-colors ${
                isDevOpen ? "bg-amber-100 border-amber-400" : ""
              }`}
              title="Dev Panel"
            >
              <Activity className="w-5 h-5 text-stone-700" />
            </button>
            <button
              data-testid="history-button"
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 rounded border border-stone-300 hover:bg-stone-100 transition-colors"
              title="History"
            >
              <History className="w-5 h-5 text-stone-700" />
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 rounded border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
              title={text.signOut}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Language Selection Bar */}
        <div className="px-4 pt-3 pb-2 bg-[#FDFBF7] border-b border-stone-100">
          <div className="flex w-full bg-stone-100 p-1 rounded-md border border-stone-200">
            <button
              data-testid="language-toggle-cg"
              onClick={() => setLanguage("cg")}
              className={`flex-1 text-center py-2 px-3 text-sm md:text-base font-semibold rounded ${
                language === "cg"
                  ? "bg-white shadow-sm text-blue-900"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              छत्तीसगढ़ी
            </button>
            <button
              data-testid="language-toggle-hi"
              onClick={() => setLanguage("hi")}
              className={`flex-1 text-center py-2 px-3 text-sm md:text-base font-semibold rounded ${
                language === "hi"
                  ? "bg-white shadow-sm text-blue-900"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              हिंदी
            </button>
            <button
              data-testid="language-toggle-en"
              onClick={() => setLanguage("en")}
              className={`flex-1 text-center py-2 px-3 text-sm md:text-base font-semibold rounded ${
                language === "en"
                  ? "bg-white shadow-sm text-blue-900"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Chat Message Window */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 min-h-[400px] bg-[#FDFBF7]/40">
          
          {/* Welcome Message (If Chat Empty) */}
          {messages.length === 0 && (
            <div
              data-testid="message-assistant"
              className="bg-white border border-stone-200 rounded-md rounded-tl-none p-4 shadow-sm text-stone-900 max-w-[85%] mr-auto sm-fade-in"
            >
              <p className="text-lg leading-relaxed">
                {text.welcome.replace("{name}", user?.name || "")}
              </p>
              {user && (
                <p className="text-xs text-stone-400 mt-2">{user.jila} • {user.mobile}</p>
              )}
            </div>
          )}

          {/* Render Active Message History */}
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={idx}
                data-testid={isUser ? "message-user" : "message-assistant"}
                className={`max-w-[85%] p-4 rounded-md text-stone-900 leading-relaxed text-lg border sm-fade-in ${
                  isUser
                    ? "bg-blue-50 border-blue-100 rounded-tr-none ml-auto"
                    : "bg-white border-stone-200 rounded-tl-none mr-auto"
                }`}
              >
                <p>{msg.text}</p>
                {!isUser && msg.triage && renderTriageCard(msg.triage)}

                {/* Generated Quick Replies for seeking_info turns */}
                {!isUser && msg.triage && msg.triage.triage_tier === "seeking_info" && msg.triage.quick_replies && msg.triage.quick_replies.length > 0 && idx === messages.length - 1 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.triage.quick_replies.map((reply, ridx) => (
                      <button
                        key={ridx}
                        onClick={() => handleQuickReplyClick(reply)}
                        className="bg-blue-50 border border-blue-200 text-blue-800 text-sm font-semibold px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors active:scale-95"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Loading Indicator */}
          {loading && (
            <div className="bg-white border border-stone-200 rounded-md rounded-tl-none p-4 mr-auto max-w-[120px] text-stone-400 text-sm flex items-center justify-center gap-1 sm-fade-in">
              <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Inputs Footer Section */}
        <div className="sticky bottom-0 bg-white border-t border-stone-200 p-4 pb-safe mt-auto">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              data-testid="chat-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={text.placeholder}
              className="flex-grow min-h-[48px] text-lg bg-stone-50 border border-stone-300 rounded-md px-4 focus:outline-none focus:ring-2 focus:ring-blue-800"
              disabled={loading}
            />
            <button
              type="submit"
              data-testid="send-button"
              className="bg-blue-900 text-white px-5 rounded-md min-w-[70px] min-h-[48px] font-bold hover:bg-blue-800 transition-colors flex items-center justify-center"
              disabled={loading || !inputText.trim()}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Developer Metadata Side Panel Overlay */}
        {isDevOpen && (
          <div
            data-testid="dev-panel"
            className="absolute right-0 top-0 w-[80%] h-full bg-stone-900/95 border-l border-stone-700 text-stone-200 z-30 p-4 font-mono text-xs overflow-y-auto sm-snap"
          >
            <div className="flex items-center justify-between border-b border-stone-700 pb-2 mb-3">
              <span className="font-bold text-amber-400 text-sm">{text.devTitle}</span>
              <button onClick={() => setIsDevOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            {devMeta ? (
              <div className="space-y-3">
                <div>
                  <span className="text-stone-400 font-bold block">MODEL USED:</span>
                  <span className="text-emerald-400 text-sm font-semibold">{devMeta.model_used}</span>
                </div>
                <div>
                  <span className="text-stone-400 font-bold block">FALLBACK TRIGGERED:</span>
                  <span className={devMeta.fallback_triggered ? "text-red-400" : "text-emerald-400"}>
                    {String(devMeta.fallback_triggered)}
                  </span>
                </div>
                {devMeta.fallback_triggered && (
                  <div>
                    <span className="text-stone-400 font-bold block">FALLBACK REASON:</span>
                    <p className="text-red-400 italic bg-stone-950 p-2 rounded mt-1 break-words">
                      {devMeta.fallback_reason}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-stone-400 font-bold block">LATENCY:</span>
                  <span className="text-blue-400 font-semibold">{devMeta.latency_ms} ms</span>
                </div>
                <div>
                  <span className="text-stone-400 font-bold block">CLINICAL REASONING:</span>
                  <p className="bg-stone-950 p-2 rounded mt-1 border border-stone-800 leading-relaxed text-stone-300 break-words">
                    {devMeta.reasoning || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-stone-400 font-bold block">LIVE LLM CALLS:</span>
                  <span className={devMeta.live_model ? "text-emerald-400" : "text-amber-400"}>
                    {devMeta.live_model ? "Connected to GenAI" : "Offline / Keyword Engine"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-stone-400 italic text-center py-12 leading-relaxed">
                No active triage analysis. Send a symptom description to inspect Gemma's live reasoning and latency logs.
              </div>
            )}
          </div>
        )}

        {/* History Drawer Slider */}
        {isHistoryOpen && (
          <div
            data-testid="history-drawer"
            className="absolute left-0 top-0 w-full h-full bg-[#FDFBF7] border-r border-stone-200 z-30 flex flex-col sm-snap"
          >
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-stone-700" />
                <span className="font-bold text-lg text-stone-900">{text.historyTitle}</span>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="text-stone-500 hover:text-stone-800 p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Start New Session */}
            <div className="p-4 border-b border-stone-100 bg-white">
              <button
                data-testid="new-session-button"
                onClick={() => {
                  startNewSession();
                  setIsHistoryOpen(false);
                }}
                className="w-full bg-blue-900 text-white p-3 rounded-md font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                {text.newSession}
              </button>
            </div>

            {/* List past Sessions */}
            <div className="flex-grow overflow-y-auto p-4 space-y-2">
              {sessions.length === 0 ? (
                <p className="text-stone-500 text-center py-8">No history sessions found.</p>
              ) : (
                sessions.map((sess) => (
                  <button
                    key={sess.id}
                    onClick={() => loadSession(sess.id)}
                    className={`w-full text-left p-3.5 rounded border transition-colors flex items-center justify-between ${
                      sessionId === sess.id
                        ? "bg-blue-50 border-blue-300 font-bold text-blue-900"
                        : "bg-white border-stone-200 hover:bg-stone-50 text-stone-800"
                    }`}
                  >
                    <div className="truncate pr-4 flex-grow">
                      <span className="text-xs text-stone-400 block mb-1">
                        {new Date(sess.created_at).toLocaleString()}
                      </span>
                      <span className="text-sm font-medium">
                        ID: {sess.id.slice(0, 8)}... ({sess.language.toUpperCase()})
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Emergency Takeover Full-screen Overlay */}
        {isEmergencyActive && (
          <div
            data-testid="emergency-takeover"
            className="fixed inset-0 z-50 bg-red-600 text-white flex flex-col items-center justify-center p-6 text-center sm-snap"
          >
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 sm-pulse">
              <Octagon className="w-16 h-16 text-white stroke-[2.5]" />
            </div>

            <h1 className="text-5xl font-black tracking-tight leading-none mb-4 uppercase">
              {text.emergency}
            </h1>
            <p className="text-2xl font-bold max-w-md mx-auto mb-8 leading-relaxed">
              {language === "cg" && "ये गंभीर बीमारी के लक्षण हे। तुरते 108 म फोन करके एम्बुलेंस ला बुलावव!"}
              {language === "hi" && "यह बहुत गंभीर लक्षण है। कृपया तुरंत 108 एम्बुलेंस को कॉल करें!"}
              {language === "en" && "These are critical emergency symptoms. Call 108 ambulance immediately!"}
            </p>

            <div className="w-full max-w-sm space-y-3">
              {/* 108 — Free Ambulance (EMRI) */}
              <a
                href="tel:108"
                data-testid="call-ambulance-button"
                className="w-full py-4 bg-white text-red-700 rounded-md font-black text-xl flex items-center justify-center gap-3 hover:bg-stone-100 transition-colors shadow-lg active:scale-95"
              >
                <Phone className="w-6 h-6 stroke-[3]" />
                {text.callAmbulance} — 108
              </a>

              {/* 112 — National Emergency (Police/Fire/Ambulance) */}
              <a
                href="tel:112"
                className="w-full py-3 bg-red-800 text-white rounded-md font-bold text-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-colors active:scale-95"
              >
                <Phone className="w-5 h-5" />
                {language === "en" ? "Unified Emergency" : "राष्ट्रीय आपातकाल"} — 112
              </a>

              {/* 104 — Health Helpline */}
              <a
                href="tel:104"
                className="w-full py-3 bg-red-800/70 text-white rounded-md font-bold text-base flex items-center justify-center gap-2 hover:bg-red-700/80 transition-colors active:scale-95"
              >
                <Phone className="w-4 h-4" />
                {language === "en" ? "Health Helpline" : "स्वास्थ्य हेल्पलाइन"} — 104
              </a>

              {/* Acknowledge/Dismiss Button */}
              <button
                data-testid="acknowledge-emergency-button"
                onClick={() => setIsEmergencyActive(false)}
                className="w-full py-3 border border-white/40 bg-white/10 hover:bg-white/20 text-white rounded-md font-bold text-lg transition-colors active:scale-95"
              >
                {text.acknowledgeEmergency}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
