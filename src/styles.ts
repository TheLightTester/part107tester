import type { CSSProperties } from 'react'

type StyleObj = CSSProperties

export const styles = {
  app: {
    minHeight: '100vh', background: '#0d1117',
    fontFamily: "'DM Sans', 'Trebuchet MS', sans-serif",
    color: '#e2e8f0', overflowX: 'hidden',
  } satisfies StyleObj,
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', height: 56,
    borderBottom: '1px solid #1e2532',
    background: 'rgba(13,17,23,0.95)', backdropFilter: 'blur(8px)',
    position: 'sticky', top: 0, zIndex: 100,
  } satisfies StyleObj,
  navLogo: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' } satisfies StyleObj,
  navLogoText: { fontSize: 15, fontWeight: 700, letterSpacing: '0.04em', color: '#e2e8f0' } satisfies StyleObj,
  navBadge: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: '#E8A838',
    border: '1px solid #E8A83840', borderRadius: 3, padding: '2px 7px',
  } satisfies StyleObj,
  navProgress: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b' } satisfies StyleObj,
  content: { maxWidth: 880, margin: '0 auto', padding: '32px 20px' } satisfies StyleObj,
  hero: {
    background: 'linear-gradient(135deg, #111827 0%, #0d1117 50%, #111827 100%)',
    border: '1px solid #1e2532', borderRadius: 12, padding: '40px 36px',
    marginBottom: 32, position: 'relative', overflow: 'hidden',
  } satisfies StyleObj,
  heroAccent: {
    position: 'absolute', top: -60, right: -60,
    width: 220, height: 220, borderRadius: '50%',
    background: 'radial-gradient(circle, #E8A83815 0%, transparent 70%)',
  } satisfies StyleObj,
  heroTag: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
    color: '#E8A838', marginBottom: 16,
  } satisfies StyleObj,
  heroTitle: { fontSize: 32, fontWeight: 800, lineHeight: 1.2, marginBottom: 10, letterSpacing: '-0.02em' } satisfies StyleObj,
  heroSub: { fontSize: 15, color: '#94a3b8', lineHeight: 1.6, marginBottom: 28, maxWidth: 520 } satisfies StyleObj,
  heroStats: { display: 'flex', gap: 32 } satisfies StyleObj,
  heroStat: { display: 'flex', flexDirection: 'column', gap: 2 } satisfies StyleObj,
  heroStatNum: { fontSize: 24, fontWeight: 800, color: '#E8A838' } satisfies StyleObj,
  heroStatLabel: { fontSize: 11, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' } satisfies StyleObj,
  sectionTitle: {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
    color: '#64748b', marginBottom: 16,
  } satisfies StyleObj,
  moduleGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 32 } satisfies StyleObj,
  moduleCard: (_color: string): StyleObj => ({
    background: '#111827', border: '1px solid #1e2532',
    borderRadius: 10, padding: '20px', cursor: 'pointer',
    transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
  }),
  moduleCardAccent: (color: string): StyleObj => ({
    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
    background: color,
  }),
  moduleCardHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 } satisfies StyleObj,
  moduleId: (color: string): StyleObj => ({
    width: 32, height: 32, borderRadius: 6,
    background: `${color}18`, border: `1px solid ${color}30`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 800, color,
  }),
  moduleWeight: { fontSize: 11, color: '#64748b', fontWeight: 600 } satisfies StyleObj,
  moduleName: { fontSize: 15, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 } satisfies StyleObj,
  moduleStats: { display: 'flex', gap: 16 } satisfies StyleObj,
  moduleStat: { fontSize: 12, color: '#64748b' } satisfies StyleObj,
  moduleStatNum: (color: string): StyleObj => ({ color, fontWeight: 700 }),
  lessonList: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 } satisfies StyleObj,
  lessonRow: (done: boolean): StyleObj => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 18px',
    background: done ? '#0f1620' : '#111827',
    border: `1px solid ${done ? '#1e3a2a' : '#1e2532'}`,
    borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
  }),
  lessonRowLeft: { display: 'flex', alignItems: 'center', gap: 12 } satisfies StyleObj,
  lessonCheck: (done: boolean, color: string): StyleObj => ({
    width: 24, height: 24, borderRadius: '50%',
    background: done ? `${color}20` : '#1e2532',
    border: `1px solid ${done ? color : '#2d3748'}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: done ? color : '#4a5568', flexShrink: 0,
  }),
  lessonName: { fontSize: 14, fontWeight: 600 } satisfies StyleObj,
  lessonMeta: { display: 'flex', alignItems: 'center', gap: 8 } satisfies StyleObj,
  impBadge: (imp: string): StyleObj => {
    const c: Record<string, string> = { critical: '#E86B4A', high: '#E8A838', medium: '#4A9EE8' }
    const col = c[imp] ?? '#64748b'
    return {
      fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
      color: col, border: `1px solid ${col}40`,
      borderRadius: 3, padding: '2px 5px',
    }
  },
  readTime: { fontSize: 11, color: '#4a5568' } satisfies StyleObj,
  lessonHeader: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: 28,
  } satisfies StyleObj,
  backBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 13, color: '#64748b', cursor: 'pointer',
    padding: '6px 10px', borderRadius: 6,
    border: '1px solid #1e2532', background: 'transparent',
    marginBottom: 20, transition: 'all 0.15s',
  } satisfies StyleObj,
  lessonTitle: { fontSize: 24, fontWeight: 800, lineHeight: 1.3, marginBottom: 6, letterSpacing: '-0.01em' } satisfies StyleObj,
  lessonIntro: { fontSize: 15, color: '#94a3b8', lineHeight: 1.7, marginBottom: 28 } satisfies StyleObj,
  section: { marginBottom: 28 } satisfies StyleObj,
  sectionHeading: { fontSize: 16, fontWeight: 700, marginBottom: 10, color: '#e2e8f0' } satisfies StyleObj,
  sectionBody: { fontSize: 14, color: '#94a3b8', lineHeight: 1.75, marginBottom: 14 } satisfies StyleObj,
  keyFactsList: {
    background: '#0d1117', border: '1px solid #1e2532', borderRadius: 8,
    padding: '14px 16px', marginBottom: 12,
  } satisfies StyleObj,
  keyFact: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
    fontSize: 13, color: '#cbd5e1', lineHeight: 1.5, padding: '4px 0',
  } satisfies StyleObj,
  keyFactDot: { color: '#4A9EE8', marginTop: 5, flexShrink: 0, fontSize: 10 } satisfies StyleObj,
  memAid: {
    background: '#0f1a2e', border: '1px solid #1e3a5f',
    borderLeft: '3px solid #4A9EE8', borderRadius: 6,
    padding: '10px 14px', marginBottom: 10,
    fontSize: 13, color: '#7eb3e8', fontStyle: 'italic',
  } satisfies StyleObj,
  summaryTable: {
    width: '100%', borderCollapse: 'collapse',
    marginBottom: 24, fontSize: 13,
  } satisfies StyleObj,
  tableTh: {
    textAlign: 'left', padding: '8px 12px',
    borderBottom: '1px solid #1e2532',
    fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
    color: '#4a5568', fontWeight: 700,
  } satisfies StyleObj,
  tableTd: (odd: boolean): StyleObj => ({
    padding: '9px 12px',
    background: odd ? '#0d1117' : 'transparent',
    borderBottom: '1px solid #1a2030',
    color: odd ? '#94a3b8' : '#cbd5e1',
  }),
  mistakesBox: {
    background: '#1a0e0e', border: '1px solid #3b1515', borderRadius: 8,
    padding: '14px 16px', marginBottom: 28,
  } satisfies StyleObj,
  mistakesTitle: {
    display: 'flex', alignItems: 'center', gap: 7,
    fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
    color: '#e86b4a', marginBottom: 10,
  } satisfies StyleObj,
  mistake: {
    fontSize: 13, color: '#f4a6a6', lineHeight: 1.6,
    padding: '3px 0', paddingLeft: 14, position: 'relative',
  } satisfies StyleObj,
  lessonActions: { display: 'flex', gap: 10, marginTop: 8 } satisfies StyleObj,
  btnPrimary: (color = '#E8A838'): StyleObj => ({
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '10px 20px', borderRadius: 7,
    background: color, color: '#0d1117',
    fontSize: 13, fontWeight: 700, cursor: 'pointer',
    border: 'none', transition: 'all 0.15s', letterSpacing: '0.01em',
  }),
  btnSecondary: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '10px 20px', borderRadius: 7,
    background: 'transparent', color: '#94a3b8',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    border: '1px solid #1e2532', transition: 'all 0.15s',
  } satisfies StyleObj,
  quizHeader: { marginBottom: 24 } satisfies StyleObj,
  quizProgress: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16,
  } satisfies StyleObj,
  quizProgressBar: {
    flex: 1, height: 3, background: '#1e2532', borderRadius: 2, marginRight: 16,
  } satisfies StyleObj,
  quizProgressFill: (pct: number, color: string): StyleObj => ({
    height: '100%', width: `${pct}%`, background: color,
    borderRadius: 2, transition: 'width 0.3s ease',
  }),
  quizQuestion: {
    background: '#111827', border: '1px solid #1e2532',
    borderRadius: 10, padding: '22px 24px', marginBottom: 16,
  } satisfies StyleObj,
  quizQuestionNum: { fontSize: 11, color: '#4a5568', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 } satisfies StyleObj,
  quizQuestionText: { fontSize: 16, fontWeight: 600, lineHeight: 1.6, marginBottom: 6 } satisfies StyleObj,
  quizReg: { fontSize: 11, color: '#4a5568', fontStyle: 'italic' } satisfies StyleObj,
  quizOptions: { display: 'flex', flexDirection: 'column', gap: 8 } satisfies StyleObj,
  quizOption: (state: string): StyleObj => {
    const base: StyleObj = {
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 16px', borderRadius: 7, cursor: 'pointer',
      transition: 'all 0.15s', fontSize: 14, lineHeight: 1.5,
    }
    if (state === 'selected') return { ...base, background: '#0f1a2e', border: '1px solid #4A9EE8', color: '#7eb3e8' }
    if (state === 'correct')  return { ...base, background: '#0a1f0f', border: '1px solid #5DB87A', color: '#7dd3a0' }
    if (state === 'wrong')    return { ...base, background: '#1a0e0e', border: '1px solid #E86B4A', color: '#f4a6a6' }
    if (state === 'reveal')   return { ...base, background: '#0a1f0f', border: '1px solid #5DB87A40', color: '#5DB87A' }
    return { ...base, background: '#0d1117', border: '1px solid #1e2532', color: '#94a3b8' }
  },
  optionLetter: {
    width: 22, height: 22, borderRadius: 5,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1,
    background: '#1e2532',
  } satisfies StyleObj,
  explanation: {
    background: '#0f1a2e', border: '1px solid #1e3a5f', borderRadius: 8,
    padding: '14px 16px', marginTop: 12, fontSize: 13, color: '#7eb3e8', lineHeight: 1.7,
  } satisfies StyleObj,
  explanationReg: { fontSize: 11, color: '#4a5568', marginTop: 6, fontStyle: 'italic' } satisfies StyleObj,
  resultsCard: {
    background: '#111827', border: '1px solid #1e2532', borderRadius: 12,
    padding: '36px', textAlign: 'center', marginBottom: 24,
  } satisfies StyleObj,
  resultsScore: { fontSize: 64, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em' } satisfies StyleObj,
  resultsSub: { fontSize: 15, color: '#64748b', marginTop: 6, marginBottom: 24 } satisfies StyleObj,
  resultsGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16,
    textAlign: 'center',
  } satisfies StyleObj,
  resultsStat: { background: '#0d1117', borderRadius: 8, padding: '16px' } satisfies StyleObj,
  resultsStatNum: { fontSize: 28, fontWeight: 800, marginBottom: 4 } satisfies StyleObj,
  resultsStatLabel: { fontSize: 11, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.08em' } satisfies StyleObj,
  reviewBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 10px', borderRadius: 5,
    background: 'transparent', color: '#E8A838',
    fontSize: 11, fontWeight: 700, cursor: 'pointer',
    border: '1px solid #E8A83850', transition: 'all 0.15s',
    whiteSpace: 'nowrap', flexShrink: 0,
  } satisfies StyleObj,
  stickyCompletionBar: (visible: boolean): StyleObj => ({
    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
    background: '#111827', borderTop: '2px solid #E8A838',
    padding: '14px 24px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
    transform: visible ? 'translateY(0)' : 'translateY(100%)',
    transition: 'transform 0.3s ease',
  }),
}
