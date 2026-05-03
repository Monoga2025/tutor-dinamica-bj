import { useState, useRef, useEffect } from 'react';
import katex from 'katex';

const SYSTEM_PROMPT = `Eres un tutor socrático de élite. El estudiante tiene exámenes HOY:
- Quiz de Electromecánica: 6:00 AM (ANÁLISIS DE MALLAS — su circuito tiene 3 mallas, I₁=I₂=8/3 A, I₃=16/9 A)
- Parcial de Cálculo: 4:00 PM (INTEGRALES DOBLES, polares, área, centro de masa)
- Estadística: mañana

REGLAS ABSOLUTAS:
1. Nunca des la respuesta directa. Guía con preguntas.
2. Primero pregunta qué intentó o qué sabe del tema.
3. Da pistas del concepto, no de la operación.
4. Si falla 2 veces → pista operacional.
5. Si falla 3 veces → explica paso a paso con analogía.
6. Después de explicar algo → "Ahora explícamelo con tus palabras."
7. Usa LaTeX cuando escribas fórmulas: $formula$ para inline, $$formula$$ para display.

TEMAS DE CÁLCULO (taller = examen exacto):
- Ej1: ∬(5-x)dA, R:[0,5]×[0,3] → 37.5
- Ej2: Área entre y=-x e y=2x-x² → 4.5
- Ej3: Centro de masa triángulo con ρ=x² → (6/5, 4/5)
- Ej4: ∬(x+1)dA región triangular → 20/3
- Ej5a: Polar cuarto círculo → (π/2)(1-ln2)
- Ej5b: Polar semicírculo r≤5 → 250

TEMAS DE ELECTRO (quiz guiado a las 6am):
- Método de mallas: asignar corrientes horarias, escribir KVL por malla
- Su circuito: 70I₁-20I₂-30I₃=80, -20I₁+70I₂-30I₃=80, -30I₁-30I₂+90I₃=0
- Resultados: I₁=I₂=8/3≈2.67A, I₃=16/9≈1.78A, dato llamativo: I_Rb=0

COMANDOS ESPECIALES (actívalos si el usuario los escribe):
- "quiz rápido [tema]" → 5 preguntas tipo examen, una por una
- "debilidades" → lista los temas donde el estudiante falló en la sesión
- "feynman [concepto]" → pide al estudiante explicar el concepto desde cero
- "repaso rápido [tema]" → 5 puntos clave en bullets con fórmulas LaTeX
- "simula examen" → problema similar al parcial, sin ver solución del taller

TONO: directo, urgente pero tranquilo. Sin relleno. Una pregunta a la vez.`;

function renderLatex(text) {
  if (!text) return '';
  // Replace $$...$$ display math
  let result = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    try { return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false }); }
    catch { return `<code>${math}</code>`; }
  });
  // Replace $...$ inline math
  result = result.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    try { return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false }); }
    catch { return `<code>${math}</code>`; }
  });
  // Basic markdown
  result = result
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
  return `<p>${result}</p>`;
}

const CONTEXT_BUTTONS = [
  { label: '⚡ Mallas electro', msg: 'Explícame el método de mallas para mi circuito de 3 mallas.' },
  { label: '∫∫ Polares', msg: 'Tengo dudas sobre coordenadas polares en integrales dobles.' },
  { label: '📍 Centro de masa', msg: 'No entiendo cómo calcular el centro de masa con densidad variable.' },
  { label: '📐 Área entre curvas', msg: 'Ayúdame con el área entre dos curvas.' },
  { label: '🎯 Quiz rápido calc', msg: 'quiz rápido integrales dobles' },
  { label: '🎯 Quiz rápido electro', msg: 'quiz rápido mallas' },
  { label: '📋 Plan ahora', msg: 'Dime exactamente qué estudiar ahora dado que son las 8:39pm y tengo el quiz de electro a las 6am y cálculo a las 4pm.' },
];

export default function Chat({ apiKey }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '**Tutor activo.** Son las 8:39 PM. Tienes el quiz de electro a las 6:00 AM y cálculo a las 4:00 PM.\n\n¿Empezamos con mallas o con integrales dobles?',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(text) {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/anthropic/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const assistantContent = data.content?.[0]?.text || '(Sin respuesta)';
      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function useContext(msg) {
    sendMessage(msg);
  }

  return (
    <div className="chat-wrap">
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`}>
            <div className="chat-avatar">{m.role === 'assistant' ? '🧠' : '🎓'}</div>
            <div
              className="chat-bubble"
              dangerouslySetInnerHTML={{ __html: renderLatex(m.content) }}
            />
          </div>
        ))}
        {loading && (
          <div className="chat-msg assistant">
            <div className="chat-avatar">🧠</div>
            <div className="chat-bubble" style={{ padding: '16px 20px' }}>
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-context-strip">
        {CONTEXT_BUTTONS.map(b => (
          <button key={b.label} className="ctx-btn" onClick={() => useContext(b.msg)}>{b.label}</button>
        ))}
      </div>

      <div className="chat-input-row">
        <textarea
          ref={inputRef}
          className="chat-input"
          placeholder="Escribe tu duda... (Enter para enviar, Shift+Enter para nueva línea)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
        />
        <button
          className="btn btn-primary"
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
        >
          ↑ Enviar
        </button>
      </div>
    </div>
  );
}
