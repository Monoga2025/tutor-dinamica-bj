# Tutor Dinámica BJ - Próxima Sesión

## 📅 Fecha: 2026-05-05 (Post-Examen)
## 🎯 Examen parcial de Dinámica Cap.14 completado

---

## LO QUE SE HIZO

### 1. Simplificación del Modo EM
- **Eliminado:** 4 modos antiguos (Flashcard, Quick, Error Spotting, Full) - 904 líneas eliminadas
- **Nuevo flujo lineal:** Enunciado → Variables → Seleccionar Ley → Ver Trucos → Abrir Pizarra
- **Fix crítico:** Eliminar función `emOpenBoard()` duplicada que impedía pasar la fórmula a la pizarra

### 2. Sistema de Trucos de Reconocimiento (RECOGNITION TRICKS)
Se agregaron a cada ley en `EM_LAWS`:

```javascript
recognitionWords: ['choque', 'impacto', 'elástico', ...],
recognitionTrick: 'Busca cuando hay UN SOLO impacto...',
firstStep: 'Dibuja el estado ANTES...',
```

**Leyes actualizadas:**
- `momentum_pure` - Choque simple sin energía
- `momentum_energy` - Choque elástico (e=1)
- `momentum_restitution` - Choque con e<1
- `multiple_impact` - Eventos múltiples secuenciales
- `angular` - Momento angular
- `cm` - Centro de masa

### 3. showEMFormula mejorado
- **ANTES:** Mostraba la fórmula algebraica completa
- **AHORA:** Muestra Trucos de Reconocimiento + Palabras Clave + Primer Paso
- La fórmula solo aparece como referencia "Tu hoja de fórmulas tiene..."

### 4. emOpenBoard mejorado
- Pasa a la pizarra: nombre de ley, trick, palabras clave, primer paso
- NO pasa la fórmula algebraica completa (el estudiante tiene su hoja)

### 5. Deploy
- **URL:** https://tutor-dinamica-bj-one.vercel.app
- **Cuenta Vercel:** dmonoga-5328s-projects
- **GitHub:** https://github.com/Monoga2025/tutor-dinamica-bj

---

## FILOSOFÍA DEL SISTEMA

```
El estudiante aprende a RECONOCER PATRONES.
No memoriza ecuaciones.
No depende del tutor.

En el parcial: hoja de fórmulas + cerebro entrenado = ÉXITO
```

### Flujo mental del estudiante:
1. Lee enunciado
2. Busca palabras clave
3. Aplica truco de reconocimiento → identifica ley
4. Trabaja en pizarra con hint progresivo
5. AI revisa y documenta errores
6. Sistema genera ejercicios puente

---

## MEJORAS PENDIENTES

### 🔴 PRIORIDAD ALTA (Para después del examen)

#### 1. Sistema de Hints Progresivos
**Problema actual:** Cuando seleccionas la ley correcta, immediately muestra todo.
**Lo ideal:**
```
1. Seleccionas ley correcta
2. MOSTRAR solo: "¿Cómo reconocer este tipo?"
3. Si el estudiante abre la pizarra Y se atasca → hint más específico
4. Hint: "Revisa el componente x"
5. Hint final: "Tu ecuación debería ser..."
```

**Archivo a modificar:** `emOpenBoard()`, crear `requestHint()`

#### 2. Validación Paso a Paso en Pizarra
**Problema:** AI solo revisa al final.
**Lo ideal:** Checkpoints intermedios.

```
CHECKPOINT 1: ¿Setup correcto?
→ "Tienes 2 incógnitas, necesitas 2 ecuaciones"

CHECKPOINT 2: ¿Planteaste bien?
→ "¿Separaste en x e y?"

CHECKPOINT 3: ¿Resolviste bien?
→ AI valida números
```

**Archivos:** `api/ai.js`, crear `checkBoardStep()`

#### 3. Sistema de Errores Mejorado
**Problema actual:** Solo registra "ley incorrecta"
**Lo ideal:** Registrar EN QUÉ paso falló

```javascript
errorTypes: {
  recognition: 'No supo identificar la ley',
  setup: 'No plantó bien las ecuaciones',
  math: 'Error de cálculo',
  concept: 'Concepto mal entendido'
}
```

**Archivos:** `SRS`, `ErrorTracker`, `gateProfile()`

#### 4. Ejercicios PUENTE Automáticos
**Problema:** El estudiante hace ejercicios random.
**Lo ideal:** Secuencia de puente personalizada.

```
Si falla en "momentum + restitución":

PUENTE:
1. Pure momentum (fácil) × 3
2. Energía cinética pura × 2
3. Concepto de e (sin números) × 2
4. Momentum + Restitution (ahora sí)
```

**Archivos:** `buildEMQueue()`, crear `buildBridgeQueue(weakness)`

#### 5. Rediseño Visual (Dashboard Style)
**Referencia:** El usuario mostró una imagen de dashboard moderno.
- Tarjetas con métricas
- Gráficos de progreso
- Mejor jerarquía visual
- Cards para problemas en vez de lista plana

**Nota:** El usuario dijo "no quiero que sea bonito, quiero que funcione" para el examen. Post-examen: rediseñar.

---

### 🟡 PRIORIDAD MEDIA

#### 6. Soporte Multi-Ley Completo
**Problema:** Ejercicios como 14.38 (billar) necesitan momentum + energía.
**Estado actual:** `showEMFormula(correctLaws[0])` solo muestra la primera ley.
**Lo ideal:**
```
1. Usuario selecciona ley 1 → hint → trabaja
2. AI revisa
3. Usuario selecciona ley 2 → hint → trabaja
4. AI revisa
```

**Archivo:** `showEMFormula()`, `selectEMLaw()`

#### 7. Modo "Simular Examen"
- Timer de 2 horas
- Sin ayuda de AI
- Al final: revisión completa con IA
- Genera reporte de debilidades

#### 8. Base de datos de RECONOCIMIENTO DE PATRONES expandida
Cada ley debe tener más patrones de texto:

```javascript
recognitionPatterns: [
  'cuando una bola golpea a otra',
  'dos partículas chocan',
  'carro recibe maleta',
  'explota en el aire'
]
```

---

### 🟢 PRIORIDAD BAJA (Nice to have)

#### 9. Historial de sesión
- Grabar cada sesión de estudio
- Ver evolución en el tiempo
- Métricas: tiempo por ejercicio, errores por tema

#### 10. Modo "Repaso Rápido"
- 10 ejercicios filtrados por debilidad
- Sin timer
- Con hints unlimited

#### 11. Integración con PDF del libro
- Ya existe `pdf-panel`
- Mejorarlo para buscar por tema
- Sugerir ejercicios del libro por tema

---

## ARQUITECTURA ACTUAL

```
tutor-dinamica-bj/
├── tutor-dinamica.html    # App principal (HTML/CSS/JS)
├── api/
│   └── ai.js              # API de OpenRouter para revisar soluciones
├── .vercel/               # Config deploy
└── .gitignore
```

### Variables de entorno en Vercel:
```
OPENROUTER_API_KEY=sk-or-v1-...  # Requerido para AI
```

---

## ISSUES CONOCIDOS

1. **Vercel free tier excedido** - Crear cuenta nueva para deploy
2. **No hay `.env` en repo** - API key configurada manualmente en Vercel
3. **Modo multi-ley incompleto** - Solo funciona con ejercicios de 1 ley

---

## PRÓXIMOS PASOS INMEDIATOS

1. ✅ ~~Deploy a Vercel~~ - Hecho
2. ✅ ~~Configurar OPENROUTER_API_KEY en Vercel~~ - Pendiente (usuario)
3. ⏳ Estudiar para el examen
4. 📝 Post-examen: implementar hints progresivos
5. 📝 Post-examen: validación paso a paso
6. 📝 Post-examen: ejercicios puente automáticos

---

## NOTAS PARA CLAUDE (sesión siguiente)

- Usuario: JJMen (estudiante de ingeniería)
- Examen: 2026-05-05, Dinámica Cap.14 Beer & Johnston
- 116 problemas (14.1 a 14.116)
- stack: HTML/CSS/JS vanilla + Vercel + OpenRouter API
- No usa frameworks (React, Vue, etc.)
- Código en: https://github.com/Monoga2025/tutor-dinamica-bj
- Deploy: https://tutor-dinamica-bj-one.vercel.app

## Comandos útiles:
```bash
# Deploy
npx vercel --prod --yes

# Link project (si se desconecta)
npx vercel link

# Environments
npx vercel env add OPENROUTER_API_KEY
npx vercel env pull  # Descargar .env de Vercel
```
