import { useState, useEffect, useRef } from "react";

// ─── EMBEDDED DATA (subset for PoC) ───────────────────────────────────────────

const MODULES = [
  { id: "I",   name: "Regulations",          examWeight: "15–25%", color: "#E8A838", lessons: 5, questions: 25 },
  { id: "II",  name: "Airspace & Charts",    examWeight: "15–25%", color: "#4A9EE8", lessons: 3, questions: 25 },
  { id: "III", name: "Weather",              examWeight: "11–16%", color: "#5DB87A", lessons: 3, questions: 23 },
  { id: "IV",  name: "Loading & Performance",examWeight: "7–11%",  color: "#B87AE8", lessons: 3, questions: 13 },
  { id: "V",   name: "Operations",           examWeight: "35–45%", color: "#E86B4A", lessons: 6, questions: 39 },
];

const LESSONS = [
  {
    id: "I-L1", module: "I", title: "Eligibility & the Remote Pilot Certificate",
    importance: "high", readTime: 6,
    intro: "Before you can legally fly commercially under Part 107, you need a Remote Pilot Certificate with a Small UAS Rating. This lesson covers who qualifies, how to get certified, and how to stay current.",
    sections: [
      {
        heading: "Who Is Eligible",
        body: "To be eligible under §107.61 you must be at least 16 years old, able to read, speak, write, and understand English, and not know of any physical or mental condition that would make you unable to safely operate a small UAS. There is no requirement for an FAA medical certificate — you self-certify your fitness before every flight.",
        keyFacts: ["Minimum age: 16 years old", "English proficiency required", "No FAA medical certificate required", "Must self-certify fitness before every flight"],
      },
      {
        heading: "The Knowledge Test",
        body: "To obtain the certificate you must pass the FAA Aeronautical Knowledge Test at an FAA-approved testing center. The test is 60 questions, you have 2 hours, and the passing score is 70% — meaning 42 correct out of 60. After passing, apply through IACRA at iacra.faa.gov. Bring your FAA Tracking Number (FTN) to the test.",
        keyFacts: ["60 questions, 2-hour time limit", "Passing score: 70% (42/60)", "Apply via IACRA after passing", "Bring your FTN to the testing center"],
        memoryAid: "70% to fly — 42 right out of 60."
      },
      {
        heading: "Staying Current — 24-Month Recency",
        body: "Your Remote Pilot Certificate never expires, but your aeronautical knowledge recency does. Under §107.65, you must pass a recurrent knowledge test every 24 calendar months. If your currency lapses you cannot legally act as remote PIC until you retake and pass the test.",
        keyFacts: ["Certificate never expires", "Knowledge recency: every 24 calendar months", "Must pass recurrent test to continue acting as remote PIC"],
        memoryAid: "Certificate lasts forever. Knowledge lasts 24 months."
      }
    ],
    summaryTable: [
      { item: "Minimum age", value: "16 years old" },
      { item: "Test length", value: "60 questions, 2 hours" },
      { item: "Passing score", value: "70% (42/60)" },
      { item: "Medical certificate required", value: "No" },
      { item: "Knowledge recency", value: "Every 24 calendar months" },
    ],
    commonMistakes: [
      "Confusing certificate expiration (never) with knowledge recency (24 months)",
      "Thinking an FAA medical certificate is required — it is not under Part 107",
      "Forgetting to get your FTN from IACRA before the test day",
    ],
    relatedQuestions: ["I-001", "I-002", "I-007", "I-014", "I-016"]
  },
  {
    id: "I-L3", module: "I", title: "Operating Rules — Limits & Prohibited Acts",
    importance: "critical", readTime: 8,
    intro: "Part 107's operating rules define the legal envelope for every flight. Know these numbers cold — the exam tests them directly and violations carry serious civil and criminal penalties.",
    sections: [
      {
        heading: "The Hard Numbers (§107.51)",
        body: "Every Part 107 pilot must know these four limits. Maximum altitude: 400 feet AGL (exception: within 400 ft horizontally of a structure you may fly 400 ft above the structure's top). Maximum groundspeed: 87 knots (100 mph). Minimum flight visibility from control station: 3 statute miles. Cloud clearances: at least 500 feet below clouds AND 2,000 feet horizontal from clouds.",
        keyFacts: ["Max altitude: 400 ft AGL", "Structure exception: 400 ft above structure top within 400 ft horizontal", "Max groundspeed: 87 knots (100 mph)", "Min visibility: 3 statute miles", "Cloud clearance: 500 ft below / 2,000 ft horizontal"],
        memoryAid: "400 up. 100 mph. 3 miles visible. 500 below / 2,000 beside clouds."
      },
      {
        heading: "Daylight & Civil Twilight (§107.29)",
        body: "Standard Part 107 operations are restricted to daylight. Civil twilight — 30 minutes before official sunrise and 30 minutes after official sunset — is permitted but requires anti-collision lighting visible for at least 3 statute miles. True night operations require a waiver.",
        keyFacts: ["Civil twilight: 30 min before sunrise / 30 min after sunset", "Civil twilight requires: anti-collision lighting visible 3 SM", "Night operations (outside civil twilight): waiver required"],
        memoryAid: "Civil twilight = 30 min either side of sun. Lights on, 3 miles visible."
      },
      {
        heading: "Alcohol Rules (§107.27)",
        body: "No person may act as remote PIC, person manipulating the controls, or visual observer if they consumed alcohol within the preceding 8 hours, are under the influence, or have a BAC of 0.04% or greater. This applies to the entire crew, not just the pilot at the controls.",
        keyFacts: ["8-hour 'bottle to throttle' rule", "BAC limit: below 0.04%", "Applies to remote PIC, person manipulating controls, AND visual observer"],
        memoryAid: "8 hours, 0.04 BAC. The whole crew, not just the PIC."
      }
    ],
    summaryTable: [
      { item: "Max altitude (standard)", value: "400 ft AGL" },
      { item: "Max altitude (near structure)", value: "400 ft above structure top" },
      { item: "Max groundspeed", value: "87 kts (100 mph)" },
      { item: "Min visibility", value: "3 statute miles" },
      { item: "Cloud clearances", value: "500 ft below / 2,000 ft horizontal" },
      { item: "Civil twilight", value: "30 min before sunrise / 30 min after sunset" },
      { item: "Night ops", value: "Waiver required" },
      { item: "Bottle to throttle", value: "8 hours" },
      { item: "BAC limit", value: "Below 0.04%" },
    ],
    commonMistakes: [
      "Thinking 400 ft AGL is always the maximum — the structure exception allows higher",
      "Confusing civil twilight (no waiver, just lights) with night ops (waiver required)",
      "Thinking alcohol rules only apply to the person flying — they apply to all crew",
    ],
    relatedQuestions: ["I-008", "I-009", "I-011", "I-012", "V-001", "V-002", "V-003", "V-004", "V-036"]
  },
];

const QUESTIONS = [
  {
    id: "I-001", module: "I", topic: "Eligibility", difficulty: "easy",
    question: "What is the minimum age to obtain a Remote Pilot Certificate with a Small UAS rating under Part 107?",
    options: { A: "14 years old", B: "16 years old", C: "18 years old" },
    correct: "B",
    explanation: "Per 14 CFR §107.61, an applicant must be at least 16 years of age to be eligible for a Remote Pilot Certificate with a small UAS rating.",
    regulation: "14 CFR §107.61"
  },
  {
    id: "I-002", module: "I", topic: "Eligibility", difficulty: "easy",
    question: "Which of the following is NOT a requirement to be eligible for a Remote Pilot Certificate under Part 107?",
    options: { A: "Be able to read, speak, write, and understand English", B: "Hold a valid driver's license", C: "Be in a proper physical and mental condition to safely operate a small UAS" },
    correct: "B",
    explanation: "A driver's license is useful for identity verification at the testing center but is not a legal eligibility requirement under §107.61. Requirements include minimum age, English proficiency, and self-certified physical/mental fitness.",
    regulation: "14 CFR §107.61"
  },
  {
    id: "I-007", module: "I", topic: "Certificate Recency", difficulty: "medium",
    question: "How often must a remote pilot complete the recurrent aeronautical knowledge test to maintain currency under Part 107?",
    options: { A: "Every 12 calendar months", B: "Every 24 calendar months", C: "Every 36 calendar months" },
    correct: "B",
    explanation: "Per §107.65, a remote pilot must complete a recurrent knowledge test every 24 calendar months. The certificate itself does not expire, but the pilot's recency does.",
    regulation: "14 CFR §107.65"
  },
  {
    id: "V-001", module: "V", topic: "Operating Limitations", difficulty: "easy",
    question: "What is the maximum altitude a small UAS may operate under Part 107 without a waiver?",
    options: { A: "400 feet AGL", B: "500 feet AGL", C: "1,000 feet MSL" },
    correct: "A",
    explanation: "Per §107.51(b), the maximum altitude is 400 feet AGL. Exception: within a 400-foot radius of a structure, you may fly up to 400 feet above the structure's immediate uppermost limit.",
    regulation: "14 CFR §107.51"
  },
  {
    id: "V-002", module: "V", topic: "Operating Limitations", difficulty: "easy",
    question: "What is the maximum groundspeed a small UAS may operate at under Part 107?",
    options: { A: "87 knots (100 mph)", B: "100 knots (115 mph)", C: "55 knots (63 mph)" },
    correct: "A",
    explanation: "Per §107.51(a), a small UAS may not exceed 87 knots (100 mph). Commonly expressed as 100 mph for ease of remembering.",
    regulation: "14 CFR §107.51"
  },
  {
    id: "V-003", module: "V", topic: "Operating Limitations", difficulty: "medium",
    question: "What is the minimum flight visibility required for Part 107 operations?",
    options: { A: "1 statute mile", B: "3 statute miles", C: "5 statute miles" },
    correct: "B",
    explanation: "Per §107.51(c), the minimum flight visibility as observed from the control station is 3 statute miles.",
    regulation: "14 CFR §107.51"
  },
  {
    id: "I-008", module: "I", topic: "Daylight Operations", difficulty: "medium",
    question: "What is required to operate a small UAS during civil twilight (within 30 minutes of official sunrise or sunset)?",
    options: { A: "A waiver from the FAA", B: "Anti-collision lighting visible for at least 3 statute miles", C: "A visual observer must be present" },
    correct: "B",
    explanation: "Per §107.29(b), during civil twilight a small UAS must have lighted anti-collision lighting visible for at least 3 statute miles with a flash rate sufficient to avoid a collision. Night operations outside civil twilight require a waiver.",
    regulation: "14 CFR §107.29"
  },
];

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const icons = {
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    arrow: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    book: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    quiz: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    star: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    alert: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    plane: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19 4s-2 1-3.5 2.5L11 8 2.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>,
    trophy: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 4H17l-1 7a5 5 0 0 1-8 0Z"/><path d="M5 4H3v3a4 4 0 0 0 4 4"/><path d="M19 4h2v3a4 4 0 0 1-4 4"/></svg>,
  };
  return icons[name] || null;
};

// ─── DIFFICULTY BADGE ─────────────────────────────────────────────────────────
const DiffBadge = ({ level }) => {
  const colors = { easy: "#5DB87A", medium: "#E8A838", hard: "#E86B4A" };
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
      textTransform: "uppercase", color: colors[level],
      border: `1px solid ${colors[level]}40`, borderRadius: 3,
      padding: "2px 6px"
    }}>{level}</span>
  );
};

// ─── PROGRESS RING ────────────────────────────────────────────────────────────
const ProgressRing = ({ pct, color, size = 56 }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e2532" strokeWidth="4"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct/100)}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }}/>
    </svg>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home"); // home | lesson | quiz | results
  const [activeModule, setActiveModule] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [quizState, setQuizState] = useState({ qIdx: 0, answers: {}, submitted: false });
  const [progress, setProgress] = useState({ lessonsRead: new Set(), quizScores: {} });
  const [quizMode, setQuizMode] = useState("module"); // module | lesson
  const [quizQuestions, setQuizQuestions] = useState([]);
  const scrollRef = useRef(null);

  const moduleColor = (id) => MODULES.find(m => m.id === id)?.color || "#ccc";

  const startLesson = (lesson) => {
    setActiveLesson(lesson);
    setScreen("lesson");
    setTimeout(() => scrollRef.current?.scrollTo(0, 0), 10);
  };

  const finishLesson = (lessonId) => {
    setProgress(p => ({ ...p, lessonsRead: new Set([...p.lessonsRead, lessonId]) }));
    setScreen("home");
  };

  const startQuiz = (moduleId, lessonId = null) => {
    const pool = lessonId
      ? QUESTIONS.filter(q => activeLesson?.relatedQuestions?.includes(q.id))
      : QUESTIONS.filter(q => q.module === moduleId);
    if (pool.length === 0) return;
    setQuizQuestions(pool);
    setQuizState({ qIdx: 0, answers: {}, submitted: false });
    setQuizMode(lessonId ? "lesson" : "module");
    setScreen("quiz");
  };

  const answer = (qId, choice) => {
    if (quizState.submitted) return;
    setQuizState(s => ({ ...s, answers: { ...s.answers, [qId]: choice } }));
  };

  const submitQuiz = () => {
    const correct = quizQuestions.filter(q => quizState.answers[q.id] === q.correct).length;
    const pct = Math.round((correct / quizQuestions.length) * 100);
    setProgress(p => ({
      ...p,
      quizScores: { ...p.quizScores, [activeModule || "mixed"]: pct }
    }));
    setQuizState(s => ({ ...s, submitted: true }));
    setScreen("results");
  };

  const totalProgress = () => {
    const totalLessons = LESSONS.length;
    const done = progress.lessonsRead.size;
    return Math.round((done / totalLessons) * 100);
  };

  const styles = {
    app: {
      minHeight: "100vh", background: "#0d1117",
      fontFamily: "'DM Sans', 'Trebuchet MS', sans-serif",
      color: "#e2e8f0", overflowX: "hidden",
    },
    // NAV
    nav: {
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", height: 56,
      borderBottom: "1px solid #1e2532",
      background: "rgba(13,17,23,0.95)", backdropFilter: "blur(8px)",
      position: "sticky", top: 0, zIndex: 100,
    },
    navLogo: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },
    navLogoText: { fontSize: 15, fontWeight: 700, letterSpacing: "0.04em", color: "#e2e8f0" },
    navBadge: {
      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", color: "#E8A838",
      border: "1px solid #E8A83840", borderRadius: 3, padding: "2px 7px"
    },
    navProgress: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b" },
    // CONTENT
    content: { maxWidth: 880, margin: "0 auto", padding: "32px 20px" },
    // HOME
    hero: {
      background: "linear-gradient(135deg, #111827 0%, #0d1117 50%, #111827 100%)",
      border: "1px solid #1e2532", borderRadius: 12, padding: "40px 36px",
      marginBottom: 32, position: "relative", overflow: "hidden",
    },
    heroAccent: {
      position: "absolute", top: -60, right: -60,
      width: 220, height: 220, borderRadius: "50%",
      background: "radial-gradient(circle, #E8A83815 0%, transparent 70%)",
    },
    heroTag: {
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
      color: "#E8A838", marginBottom: 16,
    },
    heroTitle: { fontSize: 32, fontWeight: 800, lineHeight: 1.2, marginBottom: 10, letterSpacing: "-0.02em" },
    heroSub: { fontSize: 15, color: "#94a3b8", lineHeight: 1.6, marginBottom: 28, maxWidth: 520 },
    heroStats: { display: "flex", gap: 32 },
    heroStat: { display: "flex", flexDirection: "column", gap: 2 },
    heroStatNum: { fontSize: 24, fontWeight: 800, color: "#E8A838" },
    heroStatLabel: { fontSize: 11, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" },
    // GRID
    sectionTitle: {
      fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
      color: "#64748b", marginBottom: 16
    },
    moduleGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: 32 },
    moduleCard: (color) => ({
      background: "#111827", border: `1px solid #1e2532`,
      borderRadius: 10, padding: "20px", cursor: "pointer",
      transition: "all 0.2s", position: "relative", overflow: "hidden",
    }),
    moduleCardAccent: (color) => ({
      position: "absolute", top: 0, left: 0, right: 0, height: 2,
      background: color,
    }),
    moduleCardHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 },
    moduleId: (color) => ({
      width: 32, height: 32, borderRadius: 6,
      background: `${color}18`, border: `1px solid ${color}30`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, fontWeight: 800, color,
    }),
    moduleWeight: { fontSize: 11, color: "#64748b", fontWeight: 600 },
    moduleName: { fontSize: 15, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 },
    moduleStats: { display: "flex", gap: 16 },
    moduleStat: { fontSize: 12, color: "#64748b" },
    moduleStatNum: (color) => ({ color, fontWeight: 700 }),
    // LESSON LIST
    lessonList: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 },
    lessonRow: (done) => ({
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 18px",
      background: done ? "#0f1620" : "#111827",
      border: `1px solid ${done ? "#1e3a2a" : "#1e2532"}`,
      borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
    }),
    lessonRowLeft: { display: "flex", alignItems: "center", gap: 12 },
    lessonCheck: (done, color) => ({
      width: 24, height: 24, borderRadius: "50%",
      background: done ? `${color}20` : "#1e2532",
      border: `1px solid ${done ? color : "#2d3748"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: done ? color : "#4a5568", flexShrink: 0,
    }),
    lessonName: { fontSize: 14, fontWeight: 600 },
    lessonMeta: { display: "flex", alignItems: "center", gap: 8 },
    impBadge: (imp) => {
      const c = { critical: "#E86B4A", high: "#E8A838", medium: "#4A9EE8" };
      return {
        fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
        color: c[imp] || "#64748b", border: `1px solid ${c[imp] || "#64748b"}40`,
        borderRadius: 3, padding: "2px 5px",
      };
    },
    readTime: { fontSize: 11, color: "#4a5568" },
    // LESSON SCREEN
    lessonHeader: {
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      marginBottom: 28,
    },
    backBtn: {
      display: "flex", alignItems: "center", gap: 6,
      fontSize: 13, color: "#64748b", cursor: "pointer",
      padding: "6px 10px", borderRadius: 6,
      border: "1px solid #1e2532", background: "transparent",
      marginBottom: 20, transition: "all 0.15s",
    },
    lessonTitle: { fontSize: 24, fontWeight: 800, lineHeight: 1.3, marginBottom: 6, letterSpacing: "-0.01em" },
    lessonIntro: { fontSize: 15, color: "#94a3b8", lineHeight: 1.7, marginBottom: 28 },
    section: { marginBottom: 28 },
    sectionHeading: { fontSize: 16, fontWeight: 700, marginBottom: 10, color: "#e2e8f0" },
    sectionBody: { fontSize: 14, color: "#94a3b8", lineHeight: 1.75, marginBottom: 14 },
    keyFactsList: {
      background: "#0d1117", border: "1px solid #1e2532", borderRadius: 8,
      padding: "14px 16px", marginBottom: 12,
    },
    keyFact: {
      display: "flex", alignItems: "flex-start", gap: 10,
      fontSize: 13, color: "#cbd5e1", lineHeight: 1.5, padding: "4px 0",
    },
    keyFactDot: { color: "#4A9EE8", marginTop: 5, flexShrink: 0, fontSize: 10 },
    memAid: {
      background: "#0f1a2e", border: "1px solid #1e3a5f",
      borderLeft: "3px solid #4A9EE8", borderRadius: 6,
      padding: "10px 14px", marginBottom: 10,
      fontSize: 13, color: "#7eb3e8", fontStyle: "italic",
    },
    summaryTable: {
      width: "100%", borderCollapse: "collapse",
      marginBottom: 24, fontSize: 13,
    },
    tableTh: {
      textAlign: "left", padding: "8px 12px",
      borderBottom: "1px solid #1e2532",
      fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
      color: "#4a5568", fontWeight: 700,
    },
    tableTd: (odd) => ({
      padding: "9px 12px",
      background: odd ? "#0d1117" : "transparent",
      borderBottom: "1px solid #1a2030",
      color: odd ? "#94a3b8" : "#cbd5e1",
    }),
    mistakesBox: {
      background: "#1a0e0e", border: "1px solid #3b1515", borderRadius: 8,
      padding: "14px 16px", marginBottom: 28,
    },
    mistakesTitle: {
      display: "flex", alignItems: "center", gap: 7,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
      color: "#e86b4a", marginBottom: 10,
    },
    mistake: {
      fontSize: 13, color: "#f4a6a6", lineHeight: 1.6,
      padding: "3px 0", paddingLeft: 14, position: "relative",
    },
    lessonActions: { display: "flex", gap: 10, marginTop: 8 },
    // BUTTONS
    btnPrimary: (color = "#E8A838") => ({
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "10px 20px", borderRadius: 7,
      background: color, color: "#0d1117",
      fontSize: 13, fontWeight: 700, cursor: "pointer",
      border: "none", transition: "all 0.15s", letterSpacing: "0.01em",
    }),
    btnSecondary: {
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "10px 20px", borderRadius: 7,
      background: "transparent", color: "#94a3b8",
      fontSize: 13, fontWeight: 600, cursor: "pointer",
      border: "1px solid #1e2532", transition: "all 0.15s",
    },
    // QUIZ
    quizHeader: { marginBottom: 24 },
    quizProgress: {
      display: "flex", alignItems: "center", justifyContent: "space-between",
      marginBottom: 16,
    },
    quizProgressBar: {
      flex: 1, height: 3, background: "#1e2532", borderRadius: 2, marginRight: 16,
    },
    quizProgressFill: (pct, color) => ({
      height: "100%", width: `${pct}%`, background: color,
      borderRadius: 2, transition: "width 0.3s ease",
    }),
    quizQuestion: {
      background: "#111827", border: "1px solid #1e2532",
      borderRadius: 10, padding: "22px 24px", marginBottom: 16,
    },
    quizQuestionNum: { fontSize: 11, color: "#4a5568", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 },
    quizQuestionText: { fontSize: 16, fontWeight: 600, lineHeight: 1.6, marginBottom: 6 },
    quizReg: { fontSize: 11, color: "#4a5568", fontStyle: "italic" },
    quizOptions: { display: "flex", flexDirection: "column", gap: 8 },
    quizOption: (state) => {
      const base = {
        display: "flex", alignItems: "flex-start", gap: 12,
        padding: "12px 16px", borderRadius: 7, cursor: "pointer",
        transition: "all 0.15s", fontSize: 14, lineHeight: 1.5,
      };
      if (state === "selected") return { ...base, background: "#0f1a2e", border: "1px solid #4A9EE8", color: "#7eb3e8" };
      if (state === "correct") return { ...base, background: "#0a1f0f", border: "1px solid #5DB87A", color: "#7dd3a0" };
      if (state === "wrong") return { ...base, background: "#1a0e0e", border: "1px solid #E86B4A", color: "#f4a6a6" };
      if (state === "reveal") return { ...base, background: "#0a1f0f", border: "1px solid #5DB87A40", color: "#5DB87A" };
      return { ...base, background: "#0d1117", border: "1px solid #1e2532", color: "#94a3b8" };
    },
    optionLetter: {
      width: 22, height: 22, borderRadius: 5,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1,
      background: "#1e2532",
    },
    explanation: {
      background: "#0f1a2e", border: "1px solid #1e3a5f", borderRadius: 8,
      padding: "14px 16px", marginTop: 12, fontSize: 13, color: "#7eb3e8", lineHeight: 1.7,
    },
    explanationReg: { fontSize: 11, color: "#4a5568", marginTop: 6, fontStyle: "italic" },
    // RESULTS
    resultsCard: {
      background: "#111827", border: "1px solid #1e2532", borderRadius: 12,
      padding: "36px", textAlign: "center", marginBottom: 24,
    },
    resultsScore: { fontSize: 64, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em" },
    resultsSub: { fontSize: 15, color: "#64748b", marginTop: 6, marginBottom: 24 },
    resultsGrid: {
      display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16,
      textAlign: "center",
    },
    resultsStat: { background: "#0d1117", borderRadius: 8, padding: "16px" },
    resultsStatNum: { fontSize: 28, fontWeight: 800, marginBottom: 4 },
    resultsStatLabel: { fontSize: 11, color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.08em" },
  };

  // ─── SCREENS ───────────────────────────────────────────────────────────────

  const HomeScreen = () => {
    const pct = totalProgress();
    const answered = Object.keys(progress.quizScores).length;
    return (
      <div style={styles.content}>
        {/* HERO */}
        <div style={styles.hero}>
          <div style={styles.heroAccent}/>
          <div style={styles.heroTag}>
            <Icon name="plane" size={12}/> FAA Part 107 — Remote Pilot Certificate
          </div>
          <div style={styles.heroTitle}>Master the knowledge.<br/>Pass the test.</div>
          <div style={styles.heroSub}>
            20 lessons and 126 practice questions mapped directly to the FAA Airman Certification Standards. Everything you need — nothing you don't.
          </div>
          <div style={styles.heroStats}>
            <div style={styles.heroStat}>
              <div style={styles.heroStatNum}>{progress.lessonsRead.size}<span style={{ fontSize: 14, color: "#64748b" }}>/20</span></div>
              <div style={styles.heroStatLabel}>Lessons read</div>
            </div>
            <div style={styles.heroStat}>
              <div style={styles.heroStatNum}>{answered}<span style={{ fontSize: 14, color: "#64748b" }}>/5</span></div>
              <div style={styles.heroStatLabel}>Modules quizzed</div>
            </div>
            <div style={styles.heroStat}>
              <div style={styles.heroStatNum}>{pct}<span style={{ fontSize: 14, color: "#64748b" }}>%</span></div>
              <div style={styles.heroStatLabel}>Overall progress</div>
            </div>
          </div>
        </div>

        {/* MODULES */}
        <div style={styles.sectionTitle}>Study Modules</div>
        <div style={styles.moduleGrid}>
          {MODULES.map(m => {
            const moduleLessons = LESSONS.filter(l => l.module === m.id);
            const doneCount = moduleLessons.filter(l => progress.lessonsRead.has(l.id)).length;
            const score = progress.quizScores[m.id];
            return (
              <div key={m.id} style={styles.moduleCard(m.color)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${m.color}40`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e2532"; e.currentTarget.style.transform = "none"; }}
                onClick={() => { setActiveModule(m.id); }}
              >
                <div style={styles.moduleCardAccent(m.color)}/>
                <div style={styles.moduleCardHeader}>
                  <div style={styles.moduleId(m.color)}>{m.id}</div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <div style={styles.moduleWeight}>{m.examWeight} of exam</div>
                    {score !== undefined && (
                      <div style={{ fontSize: 11, fontWeight: 700, color: score >= 70 ? "#5DB87A" : "#E86B4A" }}>
                        Quiz: {score}%
                      </div>
                    )}
                  </div>
                </div>
                <div style={styles.moduleName}>{m.name}</div>
                <div style={styles.moduleStats}>
                  <div style={styles.moduleStat}>
                    <span style={styles.moduleStatNum(m.color)}>{doneCount}</span>/{moduleLessons.length} lessons
                  </div>
                  <div style={styles.moduleStat}>
                    <span style={styles.moduleStatNum(m.color)}>{m.questions}</span> questions
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* LESSONS */}
        <div style={styles.sectionTitle}>
          {activeModule ? `${MODULES.find(m=>m.id===activeModule)?.name} — Lessons` : "All Lessons"}
        </div>
        <div style={styles.lessonList}>
          {LESSONS.filter(l => !activeModule || l.module === activeModule).map(l => {
            const done = progress.lessonsRead.has(l.id);
            const color = moduleColor(l.module);
            return (
              <div key={l.id} style={styles.lessonRow(done)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = done ? "#2a5a3a" : "#2d3748"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = done ? "#1e3a2a" : "#1e2532"; }}
                onClick={() => startLesson(l)}
              >
                <div style={styles.lessonRowLeft}>
                  <div style={styles.lessonCheck(done, color)}>
                    {done ? <Icon name="check" size={12}/> : <Icon name="book" size={12}/>}
                  </div>
                  <div>
                    <div style={styles.lessonName}>{l.title}</div>
                    <div style={{ fontSize: 11, color: "#4a5568", marginTop: 2 }}>
                      Module {l.module} · {l.relatedQuestions?.length || 0} practice questions
                    </div>
                  </div>
                </div>
                <div style={styles.lessonMeta}>
                  <span style={styles.impBadge(l.importance)}>{l.importance}</span>
                  <span style={styles.readTime}>{l.readTime} min</span>
                  <Icon name="arrow" size={14}/>
                </div>
              </div>
            );
          })}
        </div>

        {activeModule && (
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button style={styles.btnPrimary(moduleColor(activeModule))}
              onClick={() => startQuiz(activeModule)}>
              <Icon name="quiz" size={14}/>
              Take {MODULES.find(m=>m.id===activeModule)?.name} Quiz
            </button>
            <button style={styles.btnSecondary} onClick={() => setActiveModule(null)}>
              Show all modules
            </button>
          </div>
        )}
      </div>
    );
  };

  const LessonScreen = () => {
    const lesson = activeLesson;
    if (!lesson) return null;
    const color = moduleColor(lesson.module);
    const done = progress.lessonsRead.has(lesson.id);
    return (
      <div style={{ ...styles.content, maxWidth: 720 }} ref={scrollRef}>
        <button style={styles.backBtn}
          onMouseEnter={e => e.currentTarget.style.color = "#e2e8f0"}
          onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
          onClick={() => setScreen("home")}>
          <Icon name="back" size={14}/> Back to lessons
        </button>

        {/* HEADER */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              color, border: `1px solid ${color}40`, borderRadius: 3, padding: "2px 7px"
            }}>Module {lesson.module}</div>
            <span style={styles.impBadge(lesson.importance)}>{lesson.importance}</span>
            <span style={styles.readTime}>{lesson.readTime} min read</span>
          </div>
          <div style={styles.lessonTitle}>{lesson.title}</div>
        </div>

        {/* INTRO */}
        <div style={styles.lessonIntro}>{lesson.intro}</div>

        {/* SECTIONS */}
        {lesson.sections.map((sec, i) => (
          <div key={i} style={styles.section}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10, marginBottom: 12,
            }}>
              <div style={{
                width: 4, height: 20, borderRadius: 2, background: color, flexShrink: 0
              }}/>
              <div style={styles.sectionHeading}>{sec.heading}</div>
            </div>
            <div style={styles.sectionBody}>{sec.body}</div>
            {sec.keyFacts?.length > 0 && (
              <div style={styles.keyFactsList}>
                {sec.keyFacts.map((f, j) => (
                  <div key={j} style={styles.keyFact}>
                    <span style={styles.keyFactDot}>◆</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            )}
            {sec.memoryAid && (
              <div style={styles.memAid}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 8 }}>Memory Aid</span>
                {sec.memoryAid}
              </div>
            )}
          </div>
        ))}

        {/* SUMMARY TABLE */}
        {lesson.summaryTable?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a5568", marginBottom: 12 }}>Quick Reference</div>
            <table style={styles.summaryTable}>
              <thead>
                <tr>
                  <th style={styles.tableTh}>Item</th>
                  <th style={styles.tableTh}>Value</th>
                </tr>
              </thead>
              <tbody>
                {lesson.summaryTable.map((row, i) => (
                  <tr key={i}>
                    <td style={styles.tableTd(i%2===0)}>{row.item}</td>
                    <td style={{ ...styles.tableTd(i%2!==0), fontWeight: 600, color: "#e2e8f0" }}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* COMMON MISTAKES */}
        {lesson.commonMistakes?.length > 0 && (
          <div style={styles.mistakesBox}>
            <div style={styles.mistakesTitle}>
              <Icon name="alert" size={13}/> Common Exam Mistakes
            </div>
            {lesson.commonMistakes.map((m, i) => (
              <div key={i} style={styles.mistake}>
                <span style={{ position: "absolute", left: 0, color: "#E86B4A" }}>–</span>
                {m}
              </div>
            ))}
          </div>
        )}

        {/* ACTIONS */}
        <div style={styles.lessonActions}>
          {!done ? (
            <button style={styles.btnPrimary(color)} onClick={() => finishLesson(lesson.id)}>
              <Icon name="check" size={14}/> Mark Complete
            </button>
          ) : (
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              fontSize: 13, color: "#5DB87A", fontWeight: 600,
            }}>
              <Icon name="check" size={14}/> Completed
            </div>
          )}
          {lesson.relatedQuestions?.length > 0 && (
            <button style={styles.btnSecondary} onClick={() => startQuiz(lesson.module, lesson.id)}>
              <Icon name="quiz" size={14}/>
              Practice {lesson.relatedQuestions.length} questions
            </button>
          )}
        </div>
      </div>
    );
  };

  const QuizScreen = () => {
    const q = quizQuestions[quizState.qIdx];
    if (!q) return null;
    const color = moduleColor(q.module);
    const selected = quizState.answers[q.id];
    const pct = Math.round(((quizState.qIdx + (selected ? 1 : 0)) / quizQuestions.length) * 100);
    const canAdvance = !!selected;
    const isLast = quizState.qIdx === quizQuestions.length - 1;

    const getOptionState = (key) => {
      if (!selected) return "default";
      if (key === selected && key === q.correct) return "correct";
      if (key === selected && key !== q.correct) return "wrong";
      if (key === q.correct && selected) return "reveal";
      return "default";
    };

    const advance = () => {
      if (isLast) { submitQuiz(); return; }
      setQuizState(s => ({ ...s, qIdx: s.qIdx + 1 }));
    };

    return (
      <div style={{ ...styles.content, maxWidth: 680 }}>
        <button style={styles.backBtn} onClick={() => setScreen("home")}>
          <Icon name="back" size={14}/> Exit quiz
        </button>

        <div style={styles.quizProgress}>
          <div style={styles.quizProgressBar}>
            <div style={styles.quizProgressFill(pct, color)}/>
          </div>
          <span style={{ fontSize: 12, color: "#4a5568", whiteSpace: "nowrap" }}>
            {quizState.qIdx + 1} / {quizQuestions.length}
          </span>
        </div>

        <div style={styles.quizQuestion}>
          <div style={styles.quizQuestionNum}>Question {quizState.qIdx + 1} · <DiffBadge level={q.difficulty}/></div>
          <div style={styles.quizQuestionText}>{q.question}</div>
          {q.regulation && <div style={styles.quizReg}>{q.regulation}</div>}
        </div>

        <div style={styles.quizOptions}>
          {Object.entries(q.options).map(([key, text]) => {
            const state = getOptionState(key);
            return (
              <div key={key} style={styles.quizOption(state)} onClick={() => answer(q.id, key)}>
                <div style={{
                  ...styles.optionLetter,
                  background: state === "correct" ? "#5DB87A20" : state === "wrong" ? "#E86B4A20" : state === "reveal" ? "#5DB87A10" : state === "selected" ? "#4A9EE820" : "#1e2532",
                  color: state === "correct" ? "#5DB87A" : state === "wrong" ? "#E86B4A" : state === "reveal" ? "#5DB87A" : state === "selected" ? "#4A9EE8" : "#64748b",
                }}>
                  {state === "correct" ? <Icon name="check" size={10}/> : state === "wrong" ? <Icon name="x" size={10}/> : key}
                </div>
                <span>{text}</span>
              </div>
            );
          })}
        </div>

        {selected && (
          <div style={styles.explanation}>
            {q.explanation}
            {q.regulation && <div style={styles.explanationReg}>{q.regulation}</div>}
          </div>
        )}

        {canAdvance && (
          <div style={{ marginTop: 16 }}>
            <button style={styles.btnPrimary(color)} onClick={advance}>
              {isLast ? <><Icon name="trophy" size={14}/> Finish Quiz</> : <><Icon name="arrow" size={14}/> Next Question</>}
            </button>
          </div>
        )}
      </div>
    );
  };

  const ResultsScreen = () => {
    const correct = quizQuestions.filter(q => quizState.answers[q.id] === q.correct).length;
    const pct = Math.round((correct / quizQuestions.length) * 100);
    const passed = pct >= 70;
    const color = passed ? "#5DB87A" : "#E86B4A";
    return (
      <div style={{ ...styles.content, maxWidth: 560 }}>
        <div style={styles.resultsCard}>
          <div style={{ marginBottom: 12, color: color }}>
            <Icon name="trophy" size={28}/>
          </div>
          <div style={{ ...styles.resultsScore, color }}>{pct}%</div>
          <div style={styles.resultsSub}>
            {passed ? "Passed! Above the 70% threshold." : "Below the 70% threshold — review and retry."}
          </div>
          <div style={styles.resultsGrid}>
            <div style={styles.resultsStat}>
              <div style={{ ...styles.resultsStatNum, color: "#5DB87A" }}>{correct}</div>
              <div style={styles.resultsStatLabel}>Correct</div>
            </div>
            <div style={styles.resultsStat}>
              <div style={{ ...styles.resultsStatNum, color: "#E86B4A" }}>{quizQuestions.length - correct}</div>
              <div style={styles.resultsStatLabel}>Incorrect</div>
            </div>
            <div style={styles.resultsStat}>
              <div style={{ ...styles.resultsStatNum, color: "#4A9EE8" }}>{quizQuestions.length}</div>
              <div style={styles.resultsStatLabel}>Total</div>
            </div>
          </div>
        </div>

        {/* REVIEW */}
        <div style={styles.sectionTitle}>Review Answers</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {quizQuestions.map((q, i) => {
            const given = quizState.answers[q.id];
            const ok = given === q.correct;
            return (
              <div key={q.id} style={{
                background: ok ? "#0a1f0f" : "#1a0e0e",
                border: `1px solid ${ok ? "#1e3a2a" : "#3b1515"}`,
                borderRadius: 8, padding: "14px 16px",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                    background: ok ? "#5DB87A20" : "#E86B4A20",
                    border: `1px solid ${ok ? "#5DB87A" : "#E86B4A"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: ok ? "#5DB87A" : "#E86B4A",
                  }}>
                    {ok ? <Icon name="check" size={10}/> : <Icon name="x" size={10}/>}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#e2e8f0" }}>{q.question}</div>
                    {!ok && <div style={{ fontSize: 12, color: "#f4a6a6", marginBottom: 4 }}>
                      Your answer: {q.options[given]}
                    </div>}
                    <div style={{ fontSize: 12, color: "#7dd3a0" }}>
                      Correct: {q.options[q.correct]}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button style={styles.btnPrimary("#E8A838")} onClick={() => setScreen("home")}>
            <Icon name="book" size={14}/> Back to lessons
          </button>
          <button style={styles.btnSecondary} onClick={() => {
            setQuizState({ qIdx: 0, answers: {}, submitted: false });
            setScreen("quiz");
          }}>
            Retry quiz
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.app}>
      {/* NAV */}
      <div style={styles.nav}>
        <div style={styles.navLogo} onClick={() => setScreen("home")}>
          <Icon name="plane" size={18}/>
          <span style={styles.navLogoText}>Part 107 Prep</span>
          <span style={styles.navBadge}>Beta</span>
        </div>
        <div style={styles.navProgress}>
          <ProgressRing pct={totalProgress()} color="#E8A838" size={32}/>
          <span>{totalProgress()}% complete</span>
        </div>
      </div>

      {/* SCREENS */}
      {screen === "home" && <HomeScreen/>}
      {screen === "lesson" && <LessonScreen/>}
      {screen === "quiz" && <QuizScreen/>}
      {screen === "results" && <ResultsScreen/>}
    </div>
  );
}
