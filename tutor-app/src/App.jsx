import { useState, useEffect } from 'react';
import './index.css';
import { useStorage } from './hooks/useStorage';
import { KatexDisplay, KatexInline } from './components/KatexBlock';
import Chat from './components/Chat';
import {
  CALC_TOPICS, CALC_FORMULAS, CALC_FLASHCARDS, CALC_PROBLEMS
} from './data/calculo';
import {
  STATS_TOPICS, STATS_FORMULAS, STATS_FLASHCARDS, STATS_PROBLEMS
} from './data/estadistica';
import {
  MALLA_STEPS, BRANCH_CURRENTS, VERIFICACION, CHECKLIST
} from './data/electro';

// ─── EXAM TIMES ───────────────────────────────────────────────────────────────
const EXAM_ELECTRO = new Date('2026-04-29T06:00:00').getTime();
const EXAM_CALC    = new Date('2026-04-29T16:00:00').getTime();
const EXAM_STATS   = new Date('2026-04-30T08:00:00').getTime();

function fmtTime(ms) {
  if (ms <= 0) return '¡YA!';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// ─── COUNTDOWN HOOK ───────────────────────────────────────────────────────────
function useCountdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

// ─── POMODORO ─────────────────────────────────────────────────────────────────
function Pomodoro() {
  const [isWork, setIsWork] = useState(true);
  const [secs, setSecs] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(1);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSecs(s => {
        if (s <= 1) {
          const nextWork = !isWork;
          setIsWork(nextWork);
          if (!nextWork) setCount(c => c + 1);
          return nextWork ? 5 * 60 : 25 * 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, isWork]);

  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');

  return (
    <div className="pomodoro">
      <div className="pom-mode">{isWork ? '🧠 TRABAJANDO' : '☕ DESCANSO'}</div>
      <div className={`pom-timer ${isWork ? 'pom-work' : 'pom-rest'}`}>{m}:{s}</div>
      <div className="pom-count">Sesión {count} · {isWork ? '25 min' : '5 min'}</div>
      <div className="pom-btns">
        <button className="btn btn-primary" onClick={() => setRunning(r => !r)}>
          {running ? '⏸ Pausar' : '▶ Iniciar'}
        </button>
        <button className="btn btn-ghost" onClick={() => { setRunning(false); setSecs(25*60); setIsWork(true); setCount(1); }}>
          ↺
        </button>
      </div>
    </div>
  );
}

// ─── WEAKNESS PANEL ───────────────────────────────────────────────────────────
const STATUS_OPTS = [
  { id: 'no-idea', label: '❌ Nada' },
  { id: 'weak',    label: '⚠️ Débil' },
  { id: 'regular', label: '🟡 Regular' },
  { id: 'strong',  label: '✅ Listo' },
];
const STATUS_EMOJI = { 'no-idea':'❌', weak:'⚠️', regular:'🟡', strong:'✅', '':'⬜' };

function WeaknessPanel({ topics, subject, weakness, setWeakness }) {
  function set(id, status) {
    setWeakness(prev => ({ ...prev, [`${subject}_${id}`]: status }));
  }
  return (
    <div className="weakness-grid">
      {topics.map(t => {
        const status = weakness[`${subject}_${t.id}`] || '';
        return (
          <div key={t.id} className={`topic-card ${status}`}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{STATUS_EMOJI[status]}</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</div>
            <div className="status-btns">
              {STATUS_OPTS.map(o => (
                <button key={o.id} className="status-btn" onClick={() => set(t.id, o.id)}>{o.label}</button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── FLASHCARDS ───────────────────────────────────────────────────────────────
function Flashcards({ cards }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(new Set());
  const [unknown, setUnknown] = useState(new Set());

  const card = cards[idx];

  function mark(type) {
    if (type === 'known') {
      setKnown(prev => new Set([...prev, idx]));
      setUnknown(prev => { const s = new Set(prev); s.delete(idx); return s; });
    } else {
      setUnknown(prev => new Set([...prev, idx]));
      setKnown(prev => { const s = new Set(prev); s.delete(idx); return s; });
    }
    setFlipped(false);
    setIdx(i => (i + 1) % cards.length);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--muted)' }}>
        <span>{idx + 1}/{cards.length}</span>
        <span style={{ color: 'var(--success)' }}>✅ {known.size}</span>
        <span style={{ color: 'var(--danger)' }}>❌ {unknown.size}</span>
      </div>

      <div className="fc-wrap" onClick={() => setFlipped(f => !f)}>
        <div className={`fc-inner ${flipped ? 'flipped' : ''}`}>
          <div className="fc-face">
            <div className="fc-label">Pregunta — clic para revelar</div>
            <KatexDisplay latex={card.front} />
          </div>
          <div className="fc-face fc-back">
            <div className="fc-label">Respuesta</div>
            <KatexDisplay latex={card.back} />
            {card.tip && <div className="fc-tip">💡 {card.tip}</div>}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-ghost" onClick={() => { setFlipped(false); setIdx(i => (i - 1 + cards.length) % cards.length); }}>← Anterior</button>
        <button className="btn btn-danger" onClick={() => mark('unknown')}>❌ No sabía</button>
        <button className="btn btn-success" onClick={() => mark('known')}>✅ Lo sabía</button>
        <button className="btn btn-ghost" onClick={() => { setFlipped(false); setIdx(i => (i + 1) % cards.length); }}>Siguiente →</button>
      </div>
    </div>
  );
}

// ─── PROBLEM VIEWER ───────────────────────────────────────────────────────────
function ProblemViewer({ problems }) {
  const [shown, setShown] = useState({});

  function toggle(pi, key) {
    setShown(prev => ({ ...prev, [`${pi}_${key}`]: !prev[`${pi}_${key}`] }));
  }

  return (
    <div>
      {problems.map((p, pi) => (
        <div key={pi} className="problem-box">
          <div className="problem-num">{p.num}</div>
          <div style={{ marginBottom: 8 }}>
            <span className="tag tag-tema">{p.topic}</span>
          </div>
          <div className="problem-statement">
            <KatexDisplay latex={p.latex} />
          </div>

          {shown[`${pi}_h0`] && (
            <div className="hint-box">
              <div className="hint-label">Pista 1</div>
              <div style={{ fontSize: 14 }}>{p.hints[0]}</div>
            </div>
          )}
          {shown[`${pi}_h1`] && p.hints[1] && (
            <div className="hint-box">
              <div className="hint-label">Pista 2</div>
              <div style={{ fontSize: 14 }}>{p.hints[1]}</div>
            </div>
          )}
          {shown[`${pi}_sol`] && (
            <div className="solution-box">
              <div className="solution-label">✅ Solución paso a paso</div>
              {p.steps.map((step, si) => (
                step ? (
                  <div key={si} className="solution-step">
                    <KatexDisplay latex={step} style={{ margin: 0 }} />
                  </div>
                ) : <div key={si} style={{ height: 8 }} />
              ))}
              <div className="solution-answer">{p.answer}</div>
            </div>
          )}

          <div className="btn-row">
            <button className="btn btn-warning" onClick={() => toggle(pi, 'h0')}>
              {shown[`${pi}_h0`] ? 'Ocultar' : '💡'} Pista 1
            </button>
            {p.hints[1] && (
              <button className="btn btn-ghost" onClick={() => toggle(pi, 'h1')}>
                {shown[`${pi}_h1`] ? 'Ocultar' : '💡'} Pista 2
              </button>
            )}
            <button className="btn btn-success" onClick={() => toggle(pi, 'sol')}>
              {shown[`${pi}_sol`] ? '🙈 Ocultar' : '👁️ Ver Solución'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── FORMULA SHEET ────────────────────────────────────────────────────────────
function FormulaSheet({ formulas }) {
  return (
    <div className="formula-grid">
      {formulas.map((f, i) => (
        <div key={i} className="card">
          <div className="card-title">{f.title}</div>
          <KatexDisplay latex={f.latex} />
          {f.note && <div className="formula-note" style={{ whiteSpace: 'pre-line' }}>{f.note}</div>}
          {f.warn && <div className="formula-warn">{f.warn}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── SECTION: PLAN ────────────────────────────────────────────────────────────
function SectionPlan({ now }) {
  const TIMELINE = [
    { hour: 'AHORA → 2h', sub: '🔴 ELECTRO QUIZ', urgent: true, text: 'Abre ⚡ Electromecánica. Lee el circuito resuelto. Escribe las 3 ecuaciones de malla de memoria, sin ver. Repite hasta que salgan solas.', sub2: 'Prepara: 3 copias del circuito dibujado + colores listos' },
    { hour: '10pm → 12am', sub: '∫ CÁLCULO — Ronda 1', text: 'Ejercicios 1 y 4 del taller (integrales dobles directas). Luego 5a y 5b (polares). Usa pistas solo si te bloqueas.' },
    { hour: '12am → 5am', sub: '💤 SUEÑO (no negociable)', text: 'El cerebro consolida lo que aprendiste mientras duermes. Sin dormir = 40% menos rendimiento. Pon alarma a las 5:15am.' },
    { hour: '6:00 AM', sub: '🎯 QUIZ ELECTRO', urgent: true, text: 'Llevas: circuito 3 veces dibujado, colores, ecuaciones en mente. El profe guía el proceso.' },
    { hour: '8am → 10am', sub: 'Otra clase', text: 'Descansa la mente. No estudies cálculo en clase de otra materia.' },
    { hour: '10am → 3pm', sub: '∫ CÁLCULO — Ronda 2', text: 'Ejercicios 2 y 3 (área entre curvas, centro de masa). Luego mezcla los 5 tipos sin solución visible. Esto es lo más importante.' },
    { hour: '3pm → 4pm', sub: '🔁 Repaso final', text: 'Solo fórmulas: dA=r dr dθ, centro de masa, límites polares. No estudies nada nuevo.' },
    { hour: '4:00 PM', sub: '🎯 PARCIAL CÁLCULO', urgent: true, text: 'Los mismos 5 ejercicios del taller. Ya los tienes.' },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="row">
          <h2>Plan de Ataque</h2>
          <span className="badge badge-danger">Electro 6am</span>
          <span className="badge badge-danger">Cálculo 4pm</span>
        </div>
        <p>Hora actual: 28 Abr 2026, 8:39 PM</p>
      </div>

      <div className="alert alert-danger">
        🚨 <strong>PRIORIDAD #1: Electro a las 6am.</strong> Estudia mallas AHORA. Tienes ~9 horas. El quiz es guiado — solo necesitas saber plantar las ecuaciones.
      </div>

      <div className="two-col" style={{ marginBottom: 24 }}>
        <Pomodoro />
        <div className="card">
          <div className="card-title">⚡ Prioridad actualizada</div>
          <div style={{ fontSize: 14, lineHeight: 2.2 }}>
            1️⃣ <strong style={{ color: 'var(--danger)' }}>Electro Mallas</strong> — AHORA<br/>
            2️⃣ <strong>Integral Doble Rect.</strong> — Ej. 1 y 4<br/>
            3️⃣ <strong>Coordenadas Polares</strong> — Ej. 5a y 5b<br/>
            4️⃣ <strong>Área entre curvas</strong> — Ej. 2<br/>
            5️⃣ <strong>Centro de Masa</strong> — Ej. 3<br/>
            6️⃣ <strong>Estadística</strong> — Post-parcial cálculo
          </div>
        </div>
      </div>

      <div style={{ fontWeight: 600, marginBottom: 12 }}>📅 Línea de tiempo real</div>
      <div className="card">
        <div className="timeline">
          {TIMELINE.map((t, i) => (
            <div key={i} className="timeline-item">
              <div>
                <div className="tl-hour" style={t.urgent ? { color: 'var(--danger)' } : {}}>{t.hour}</div>
                <div className="tl-sub" style={t.urgent ? { color: 'var(--danger)' } : {}}>{t.sub}</div>
              </div>
              <div>
                <div className="tl-text">{t.text}</div>
                {t.sub2 && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{t.sub2}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SECTION: CÁLCULO ─────────────────────────────────────────────────────────
function SectionCalculo({ weakness, setWeakness }) {
  const [tab, setTab] = useState('formulas');
  const tabs = [
    { id: 'formulas',    label: '📋 Fórmulas' },
    { id: 'flashcards',  label: '🃏 Flashcards' },
    { id: 'taller',      label: '📝 Taller Resuelto' },
    { id: 'debilidades', label: '🎯 Debilidades' },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="row">
          <h2>∫∫ Cálculo — Integrales Dobles</h2>
          <span className="badge badge-danger">4:00 PM</span>
        </div>
        <p>Taller de la profesora = Parcial exacto. Domina estos 6 ejercicios.</p>
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'formulas' && (
        <FormulaSheet formulas={CALC_FORMULAS} />
      )}
      {tab === 'flashcards' && (
        <Flashcards cards={CALC_FLASHCARDS} />
      )}
      {tab === 'taller' && (
        <>
          <div className="alert alert-info">
            🎯 <strong>Estrategia:</strong> Lee el enunciado → intenta 5 min solo → pista 1 si no avanzas → pista 2 → solución como último recurso.
          </div>
          <ProblemViewer problems={CALC_PROBLEMS} />
        </>
      )}
      {tab === 'debilidades' && (
        <>
          <div style={{ marginBottom: 16, fontSize: 14, color: 'var(--muted)' }}>
            Sé honesto. El sistema ajusta la prioridad de estudio.
          </div>
          <WeaknessPanel topics={CALC_TOPICS} subject="calc" weakness={weakness} setWeakness={setWeakness} />
        </>
      )}
    </div>
  );
}

// ─── SECTION: ESTADÍSTICA ─────────────────────────────────────────────────────
function SectionEstadistica({ weakness, setWeakness }) {
  const [tab, setTab] = useState('formulas');
  const tabs = [
    { id: 'formulas',    label: '📋 Fórmulas' },
    { id: 'flashcards',  label: '🃏 Flashcards' },
    { id: 'practica',    label: '✏️ Práctica' },
    { id: 'debilidades', label: '🎯 Debilidades' },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="row">
          <h2>σ Estadística Descriptiva</h2>
          <span className="badge badge-warning">Mañana 8am</span>
        </div>
        <p>Medidas de tendencia central, dispersión, tablas de frecuencia.</p>
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'formulas' && <FormulaSheet formulas={STATS_FORMULAS} />}
      {tab === 'flashcards' && <Flashcards cards={STATS_FLASHCARDS} />}
      {tab === 'practica' && <ProblemViewer problems={STATS_PROBLEMS} />}
      {tab === 'debilidades' && (
        <WeaknessPanel topics={STATS_TOPICS} subject="stats" weakness={weakness} setWeakness={setWeakness} />
      )}
    </div>
  );
}

// ─── SECTION: ELECTRO ─────────────────────────────────────────────────────────
function SectionElectro() {
  const [tab, setTab] = useState('circuito');

  return (
    <div>
      <div className="page-header">
        <div className="row">
          <h2>⚡ Electromecánica — Quiz</h2>
          <span className="badge badge-danger">🔴 6:00 AM</span>
        </div>
        <p>Análisis de mallas (KVL). Tu circuito: 3 mallas, 80V, 20Ω/30Ω. Quiz guiado.</p>
      </div>

      <div className="alert alert-danger">
        📋 <strong>El profe dijo:</strong> Traer el circuito dibujado <strong>3 veces</strong> (una por malla: I₁, I₂, I₃) con <strong>colores diferentes</strong>. El quiz es guiado — él te lleva. Solo saber plantear las ecuaciones.
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab==='circuito'?'active':''}`} onClick={()=>setTab('circuito')}>📐 Circuito Resuelto</button>
        <button className={`tab-btn ${tab==='ramas'?'active':''}`} onClick={()=>setTab('ramas')}>⚡ Ramas y Voltajes</button>
        <button className={`tab-btn ${tab==='metodo'?'active':''}`} onClick={()=>setTab('metodo')}>📖 Método Mallas</button>
        <button className={`tab-btn ${tab==='checklist'?'active':''}`} onClick={()=>setTab('checklist')}>✅ Checklist</button>
      </div>

      {tab === 'circuito' && (
        <div>
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            <strong>Tu circuito:</strong> R1=R2=Rb=20Ω · Ra=Rc=R3=30Ω · Dos fuentes de 80V · 3 mallas horarias
          </div>
          {MALLA_STEPS.map((step, i) => (
            <div key={i} className={`card`} style={{ marginBottom: 10, borderColor: step.highlight ? 'var(--primary)' : 'var(--border)', background: step.highlight ? '#7c6ff710' : 'var(--card2)' }}>
              <div className="card-title" style={{ marginBottom: 8 }}>{step.label}</div>
              <KatexDisplay latex={step.latex} />
              {step.note && <div className="formula-note">{step.note}</div>}
            </div>
          ))}
        </div>
      )}

      {tab === 'ramas' && (
        <div>
          <div className="alert alert-success" style={{ marginBottom: 16 }}>
            ✅ Resultados finales: <strong>I₁ = I₂ = 8/3 ≈ 2.67 A · I₃ = 16/9 ≈ 1.78 A</strong>
          </div>
          <div className="formula-grid">
            {BRANCH_CURRENTS.map((b, i) => (
              <div key={i} className="card" style={b.warn ? { borderColor: 'var(--warning)' } : {}}>
                <div className="card-title">{b.branch}</div>
                <KatexDisplay latex={b.latex} />
                <KatexDisplay latex={b.voltage} style={{ marginTop: 6 }} />
                {b.warn && <div className="formula-warn">⚠️ {b.warn}</div>}
              </div>
            ))}
          </div>
          <div className="divider" />
          <div style={{ fontWeight: 600, marginBottom: 12 }}>🔍 Verificación KVL</div>
          {VERIFICACION.map((v, i) => (
            <div key={i} className="card" style={{ marginBottom: 8, borderColor: 'var(--success)' }}>
              <div className="card-title" style={{ color: 'var(--success)' }}>{v.label}</div>
              <KatexDisplay latex={v.latex} />
            </div>
          ))}
        </div>
      )}

      {tab === 'metodo' && (
        <div className="formula-grid">
          {[
            { title: 'Paso 1 — Asignar corrientes', latex: `\\text{Dibuja }I_1,I_2,I_3\\text{ en sentido horario en cada malla}`, note: 'Todas en el mismo sentido. Facilita los signos.' },
            { title: 'Paso 2 — KVL por malla', latex: `\\sum V = 0 \\text{ en cada lazo (ley de Kirchhoff)}`, note: 'Resistencia propia: signo −. Resistencia compartida: signo + (si opuesta) / − (si misma dirección).' },
            { title: 'Paso 3 — Matriz', latex: `R_{nn}I_n - R_{nk}I_k = V_n`, note: 'Rₙₙ = suma de todas las R en la malla n. Rₙₖ = resistencia compartida entre mallas n y k.' },
            { title: 'Paso 4 — Resolver', latex: `\\text{Sustitución o Cramer para el sistema }3\\times3`, note: 'Si Iₙ < 0, la corriente real va en sentido contrario al asumido.' },
          ].map((f, i) => (
            <div key={i} className="card">
              <div className="card-title">{f.title}</div>
              <KatexDisplay latex={f.latex} />
              <div className="formula-note">{f.note}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'checklist' && (
        <div className="card" style={{ maxWidth: 500 }}>
          <div className="card-title">📋 Llevar mañana a las 6am</div>
          {CHECKLIST.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: i < CHECKLIST.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 14, lineHeight: 1.5 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>☐</span>
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SECTION: CHAT ────────────────────────────────────────────────────────────
function SectionChat() {
  const [apiKey, setApiKey] = useStorage('claude_api_key', '');
  const [keyInput, setKeyInput] = useState('');
  const [editing, setEditing] = useState(!apiKey);

  function saveKey() {
    setApiKey(keyInput.trim());
    setEditing(false);
  }

  return (
    <div>
      <div className="page-header">
        <div className="row">
          <h2>🧠 Tutor IA — Chat</h2>
          <span className="badge badge-primary">Claude Sonnet</span>
        </div>
        <p>Tutor socrático. No te da respuestas — te guía a encontrarlas. Usa LaTeX.</p>
      </div>

      {editing || !apiKey ? (
        <div className="api-banner">
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>🔑 API Key de Anthropic</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
              Obtén una en console.anthropic.com. Se guarda solo en tu navegador.
            </div>
            <input
              type="password"
              placeholder="sk-ant-..."
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveKey()}
            />
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={saveKey}>Guardar y continuar</button>
              {apiKey && <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancelar</button>}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => { setKeyInput(apiKey); setEditing(true); }}>
              🔑 Cambiar API key
            </button>
          </div>
          <Chat apiKey={apiKey} />
        </>
      )}
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, now }) {
  const navItems = [
    { id: 'plan',       icon: '🗺️', label: 'Plan de Ataque' },
    { id: 'electro',    icon: '⚡', label: 'Electromecánica' },
    { id: 'calculo',    icon: '∫',  label: 'Cálculo' },
    { id: 'estadistica',icon: 'σ',  label: 'Estadística' },
    { id: 'chat',       icon: '🧠', label: 'Tutor IA' },
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h1>PARCIALES 5</h1>
        <p>Tutor IA de Emergencia</p>
      </div>

      <div className="nav-section">
        <div className="nav-label">Navegación</div>
        {navItems.map(n => (
          <button key={n.id} className={`nav-btn ${active === n.id ? 'active' : ''}`} onClick={() => setActive(n.id)}>
            <span className="icon">{n.icon}</span> {n.label}
          </button>
        ))}
      </div>

      <div className="nav-section">
        <div className="nav-label">⏰ Cuenta regresiva</div>
        <div className="exam-card urgent">
          <div className="exam-name">🔴 Electro Quiz</div>
          <div className="exam-time">{fmtTime(EXAM_ELECTRO - now)}</div>
          <div className="exam-label">6:00 AM · Mallas</div>
        </div>
        <div className="exam-card urgent">
          <div className="exam-name">🔴 Cálculo</div>
          <div className="exam-time">{fmtTime(EXAM_CALC - now)}</div>
          <div className="exam-label">4:00 PM · Integrales Dobles</div>
        </div>
        <div className="exam-card medium">
          <div className="exam-name">🟡 Estadística</div>
          <div className="exam-time">{fmtTime(EXAM_STATS - now)}</div>
          <div className="exam-label">Mañana 8:00 AM</div>
        </div>
      </div>

      <div style={{ padding: '12px 16px', marginTop: 'auto', fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>
        Active Recall · Interleaving · Feynman<br/>
        <span style={{ color: 'var(--success)' }}>✓</span> Basado en ciencia cognitiva
      </div>
    </nav>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState('electro'); // Start on electro — it's urgent!
  const [weakness, setWeakness] = useStorage('weakness', {});
  const now = useCountdown();

  return (
    <div className="app-layout">
      <Sidebar active={active} setActive={setActive} now={now} />
      <main className="main">
        {active === 'plan'        && <SectionPlan now={now} />}
        {active === 'calculo'     && <SectionCalculo weakness={weakness} setWeakness={setWeakness} />}
        {active === 'estadistica' && <SectionEstadistica weakness={weakness} setWeakness={setWeakness} />}
        {active === 'electro'     && <SectionElectro />}
        {active === 'chat'        && <SectionChat />}
      </main>
    </div>
  );
}
