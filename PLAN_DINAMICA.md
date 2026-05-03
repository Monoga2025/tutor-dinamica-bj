# PLAN — Tutor Dinámica (Beer & Johnston)

> **Único objetivo:** que Daniel pase el parcial del miércoles dominando dinámica.
> Sin comercial, sin multi-user, sin features bonitas. Velocidad pura.

---

## 🎯 OBJETIVO

Daniel resuelve los problemas del parcial de dinámica del miércoles porque **entendió** los conceptos, no porque memorizó.

### Criterios de éxito (objetivos, medibles)
- [ ] Rating ELO sube de 1200 → 1700+
- [ ] 25+ ejercicios B&J resueltos correctamente entre martes y miércoles AM
- [ ] Cada ejercicio: identificó método, dibujó FBD, llegó al resultado
- [ ] AI nunca le revela respuesta, siempre lo guía

---

## 📚 ALCANCE EXACTO

### Libro: Beer & Johnston, en español
- **PDF principal:** `Dinamica_beer_johnston.pdf`, páginas **185–333** (~148 págs)
- **Solucionario:** `Solucionario_Mecanica_Vectorial_para_Ing.pdf` (PDF de imágenes escaneadas)

### Lo que sí — solo dinámica de partículas
- Probable cobertura por capítulos (a confirmar al inspeccionar el PDF):
  - Cinemática de partículas
  - Cinética: F=ma
  - Trabajo y energía
  - Impulso y momentum
- Sistemas de partículas y cuerpo rígido **solo si entran en el parcial** (verificar)

### Lo que NO
- Estática, otros capítulos, otros libros
- Estadística (proyecto archivado)
- Login, multi-user, cloud, monetización
- UI vistosa

---

## 💰 RESTRICCIÓN CRÍTICA: $0.80 en OpenRouter

No alcanza para procesar el solucionario completo con Gemini vía OpenRouter (~$0.075 por imagen). **Hay que cambiar de proveedor.**

### Estrategia OCR sin gastar OpenRouter

| Recurso | Costo | Capacidad | Para qué |
|---------|-------|-----------|----------|
| **Gemini API directa (Google AI Studio)** | **GRATIS** | 15 req/min, 1500 req/día | OCR del solucionario |
| **`pdftotext` (poppler)** | GRATIS | Instantáneo | Libro principal pp 185-333 |
| **Tesseract OCR local** | GRATIS | Ilimitado | Fallback si Gemini se queda corto |
| **OpenRouter ($0.80)** | Pagado | Reservado | Solo el tutor en runtime, no OCR |

**Decisión:**
- OCR del solucionario → **Gemini API directa con free tier**. Crear key gratis en [aistudio.google.com](https://aistudio.google.com/apikey). Sin OpenRouter.
- Texto del libro → `pdftotext`, $0.
- Tutor en runtime → seguir usando OpenRouter (los $0.80 alcanzan para ~30-50 mensajes con Gemini Flash).

---

## 🏗️ ARQUITECTURA (simplificada, single-user)

### Stack
- **Backend:** Python + SQLite (ya existe `server.py`, se extiende)
- **Frontend:** HTML único (ya existe `tutor-pizarra.html`, se refactoriza)
- **OCR:** Script Python `ingest.py` con Gemini API directa
- **Tutor en vivo:** Gemini Flash vía OpenRouter (los $0.80)

### Decisión de repo
**Refactorizar `Parciales 5/` en sitio.** Razones:
- No hay tiempo para nuevo repo limpio (parcial miércoles)
- Mover lo de stats a `_archive/stats/`
- Renombrar `tutor-pizarra.html` → `dinamica.html`
- Cuando llegue el momento de vender, ahí se hace repo limpio

### Tablas SQLite (nuevas)
```
exercises      (id, chapter, section, number, problem_text, problem_img, difficulty)
solutions      (exercise_id, given, find, method, steps, final_answer)
student_progress (id=1, rating, streak, total_attempts, total_wins, last_topic)
attempts       (id, exercise_id, ts, hints_used, success, time_seconds)
bj_sections    (chapter, section, title, content)
```

Una sola fila en `student_progress` (id=1). Sin `user_id` columns. Simplicidad total.

### Cinco piezas funcionales

1. **Knowledge base** — texto del libro chunked por sección, en `bj_sections`
2. **Solucionario OCR** — extracción Gemini Free → tabla `solutions`
3. **Motor ELO** — selecciona próximo ejercicio en zona de desarrollo próximo
4. **Canvas con AI annotation** — AI dibuja círculos/flechas sobre tu FBD
5. **Tutor socrático especializado** — prompt B&J + verificación contra solucionario

---

## 🧠 PRINCIPIOS PEDAGÓGICOS (no cambian)

1. **Active recall** — AI pregunta primero, jamás revela respuesta
2. **Feedback visual** — AI dibuja, no solo describe
3. **ZPD adaptativo** — siguiente ejercicio en zona "desafío óptimo" (rating + 50)
4. **Ground truth oculto** — AI tiene solucionario, lo usa para verificar internamente
5. **No abandono** — falla 3 veces → baja dificultad, refuerza concepto

### Sistema ELO
```
E = 1 / (1 + 10^((R_e - R_p) / 400))
S = 1.0  (correcto sin pistas)
S = 0.7  (1 pista usada)
S = 0.4  (2 pistas usadas)
S = 0    (3+ pistas o se rinde)
R_p' = R_p + 32 × (S - E)
```

---

## 📋 TAREAS POR FASE

### FASE 0 — Reconocimiento (HOY, 1h) — sin código

- [ ] Inspeccionar `Dinamica_beer_johnston.pdf`:
  - [ ] Confirmar qué capítulos están en pp 185-333
  - [ ] Confirmar si es texto extraíble o escaneado (probar `pdftotext`)
  - [ ] Listar las secciones (12.1, 12.2, …) presentes
- [ ] Inspeccionar `Solucionario_Mecanica_Vectorial_para_Ing.pdf`:
  - [ ] Cuántas páginas en total
  - [ ] Calidad del escaneo (legible o basura)
  - [ ] Estructura: ¿numeración por ejercicio? ¿índice?
  - [ ] Identificar páginas que cubren los capítulos del parcial
- [ ] **Decidir alcance final** según hallazgos: cuántos ejercicios en total
- [ ] Crear cuenta en Google AI Studio y obtener API key gratis

**Output esperado:** archivo `RECON.md` con páginas exactas, # ejercicios, plan OCR.

### FASE 1 — Ingesta (HOY noche, 3h)

- [ ] **Setup ambiente:**
  - [ ] Instalar `poppler-utils` (para `pdftotext`)
  - [ ] Instalar `google-generativeai` (Python SDK Gemini)
  - [ ] Instalar `pytesseract` + `tesseract-ocr` (fallback)
- [ ] **Ingest libro:**
  - [ ] Script `ingest_book.py` → extrae texto pp 185-333
  - [ ] Chunkea por sección (detecta encabezados "12.1", "12.2", …)
  - [ ] Guarda en `bj_sections`
- [ ] **Ingest solucionario:**
  - [ ] Script `ingest_solutions.py` → cada página del PDF
  - [ ] Para cada página: convierte a JPG → manda a Gemini Free → recibe JSON estructurado
  - [ ] Schema esperado: `{exercise_number, given, find, method, steps[], final_answer}`
  - [ ] Inserta en `solutions`
  - [ ] Respeta rate limit (15/min): `time.sleep(4.5)` entre llamadas
- [ ] **Validar:** revisar manualmente 5 ejercicios al azar
- [ ] **Asignar dificultad inicial:** heurística por capítulo y subsección (1100-1900)

### FASE 2 — Motor ELO (martes mañana, 3h)

- [ ] Crear tablas `student_progress` y `attempts` en SQLite
- [ ] Endpoints en `server.py`:
  - `GET /api/elo/rating` → rating actual
  - `GET /api/elo/next` → próximo ejercicio en ZPD
  - `POST /api/elo/result` → registra intento, actualiza rating
- [ ] UI:
  - [ ] Badge con rating en topbar (reemplaza `0%` overall)
  - [ ] Botón "▶ Siguiente ejercicio" reemplaza la grilla manual E1-E16
  - [ ] Modal al terminar ejercicio: "+35 puntos, rating 1235 → 1270"

### FASE 3 — AI Annotation en canvas (martes tarde, 4h)

- [ ] Extender system prompt: AI puede devolver `annotations[]` con:
  ```json
  [
    {"type": "circle", "x": 300, "y": 200, "r": 40, "color": "red", "label": "falta peso"},
    {"type": "arrow",  "from": [100,100], "to": [150,200], "color": "green", "label": "F_g"},
    {"type": "text",   "x": 250, "y": 100, "text": "ΣFy = 0"}
  ]
  ```
- [ ] Renderer en frontend: dibuja shapes como capa overlay
  - Color azul/rojo distintivo
  - Línea dashed
  - Opacidad 0.7
  - Tag `ai-annotation` para poder ocultar/mostrar
- [ ] Toggle 👁️ "Capa AI" en toolbar
- [ ] Cuando AI dibuja, hacer pequeña vibración del cuadro para que se note

### FASE 4 — Tutor de dinámica (martes noche, 3h)

- [ ] System prompt nuevo:
  - Experto Beer & Johnston español, conoce caps del parcial
  - Decision tree obligatorio antes de cualquier ecuación:
    1. Identificar tipo de problema
    2. Elegir método (F=ma / energía / momentum)
    3. Dibujar FBD
    4. Elegir coordenadas
    5. Escribir ecuaciones
    6. Resolver
    7. Interpretar
  - Reglas de FBD obligatorias: peso, normales, fricción, tensiones, etc.
  - Verificar contra solucionario en cada paso
  - Solo da pistas, jamás resultado
- [ ] Templates por método (uno por F=ma, uno por energía, uno por momentum)

### FASE 5 — Pulido y práctica (miércoles AM temprano, 3h)

- [ ] Hacer 8-10 ejercicios reales como estudiante
- [ ] Anotar fallos del AI: pistas malas, no detecta errores, etc.
- [ ] Ajustar prompts según hallazgos
- [ ] Backup de `tutor_ia.db`
- [ ] **Plan B:** si algo falla durante el parcial, modo "tutor texto puro" sin annotations ni ELO, solo el chat con verificación contra solucionario

---

## ❓ DECISIONES PENDIENTES

1. **¿Qué capítulos exactos cubre el parcial?** (esto recorta el alcance)
2. **¿Tienes acceso a internet en el parcial?** Si no, plan B offline
3. **¿Cuántos ejercicios del solucionario?** Lo confirmamos en Fase 0
4. **¿El solucionario está bien escaneado?** Si está borroso, OCR va a fallar

---

## ⚠️ RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|-----------|
| OCR del solucionario sale mal | Media | Tesseract como fallback + revisión manual de muestra |
| Gemini Free Tier rate-limita | Alta | Procesar en batches de 15/min con `sleep` |
| AI annotations confunden | Baja | Probar con 2 ejercicios antes de adoptar |
| Costo de OpenRouter explota en runtime | Media | Solo Gemini Flash (más barato), $0.80 alcanza |
| Día del parcial el tutor falla | Baja | Plan B: modo texto puro, ya probado |

---

## 🚫 PROHIBIDO HASTA DESPUÉS DEL MIÉRCOLES

- Cálculo, estática, otras materias
- Pulido visual / temas
- Multi-user, login, cloud
- Repo limpio para vender
- Cualquier feature "porque sería cool"

Todo eso → `IDEAS_DESPUES_DEL_PARCIAL.md`. No aquí, no ahora.

---

## 🏁 FLUJO IDEAL DEL ESTUDIANTE

```
1. Abro app → veo "Rating: 1200 · Próximo: 12.3 (dificultad 1180)"
2. Leo enunciado en pantalla (LaTeX renderizado)
3. AI: "¿qué método usarías?"
4. Yo: "F=ma" → AI: "Dale, dibuja el FBD"
5. Dibujo en pizarra → AI ve la imagen
6. AI dibuja un círculo rojo: "te falta la fricción aquí"
7. Corrijo → AI: "Eso. Ahora ecuaciones."
8. Escribo → AI verifica álgebra contra solucionario
9. Llego al resultado → AI: "+35 puntos. Rating: 1235."
10. Siguiente ejercicio aparece, ligeramente más difícil
```

Loop de 5-8 minutos. En 6 horas: 50+ ejercicios cubriendo el parcial.

---

## 📅 TIMELINE FINAL

| Día | Bloque | Fase | Output |
|-----|--------|------|--------|
| **Lunes (hoy)** | Tarde | 0 — Reconocimiento | `RECON.md` con scope exacto |
| **Lunes** | Noche | 1 — Ingesta | SQLite con libro + solucionario |
| **Martes** | Mañana | 2 — Motor ELO | Sistema de rating funcionando |
| **Martes** | Tarde | 3 — AI annotation | AI dibuja en canvas |
| **Martes** | Noche | 4 — Prompt dinámica | Tutor especializado listo |
| **Miércoles** | AM | 5 — Pulido + práctica real | Tutor calibrado |
| **Miércoles** | Parcial | 🎯 | Pasar |

---

**Próximo paso inmediato:** Fase 0 — reconocer los dos PDFs. Sin tocar código de la app aún.

¿Arranco Fase 0?
