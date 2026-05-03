export const CIRCUIT = {
  description: 'Tu circuito: 3 mallas, 2 fuentes 80V, R1=R2=Rb=20Ω, Ra=Rc=R3=30Ω',
  elements: [
    { id: 'R1', value: 20, unit: 'Ω', mallas: ['M1'],       color: 'red' },
    { id: 'Rb', value: 20, unit: 'Ω', mallas: ['M1','M2'],  color: 'purple' },
    { id: 'Ra', value: 30, unit: 'Ω', mallas: ['M1','M3'],  color: 'orange' },
    { id: 'R2', value: 20, unit: 'Ω', mallas: ['M2'],       color: 'blue' },
    { id: 'Rc', value: 30, unit: 'Ω', mallas: ['M2','M3'],  color: 'teal' },
    { id: 'R3', value: 30, unit: 'Ω', mallas: ['M3'],       color: 'green' },
    { id: 'V1', value: 80, unit: 'V', mallas: ['M1'],       color: 'red' },
    { id: 'V2', value: 80, unit: 'V', mallas: ['M2'],       color: 'blue' },
  ],
};

// Ecuaciones de malla (ya resueltas)
export const MALLA_STEPS = [
  {
    label: 'Paso 1 — Asignar corrientes de malla',
    latex: `I_1,\\;I_2,\\;I_3 \\text{ (todas en sentido horario ↻)}`,
    note: 'Convención: todas horarias. Facilita los signos automáticamente.',
  },
  {
    label: 'Paso 2 — KVL Malla 1 (I₁)',
    latex: `(R_1+R_b+R_a)I_1 - R_b I_2 - R_a I_3 = 80`,
    note: '',
  },
  {
    label: 'Malla 1 — Sustituyendo valores',
    latex: `(20+20+30)I_1 - 20I_2 - 30I_3 = 80`,
  },
  {
    label: 'Malla 1 — Ecuación (1)',
    latex: `70I_1 - 20I_2 - 30I_3 = 80 \\quad\\cdots(1)`,
    highlight: true,
  },
  {
    label: 'Paso 3 — KVL Malla 2 (I₂)',
    latex: `(R_b+R_2+R_c)I_2 - R_b I_1 - R_c I_3 = 80`,
  },
  {
    label: 'Malla 2 — Ecuación (2)',
    latex: `-20I_1 + 70I_2 - 30I_3 = 80 \\quad\\cdots(2)`,
    highlight: true,
  },
  {
    label: 'Paso 4 — KVL Malla 3 (I₃) — sin fuente',
    latex: `(R_a+R_c+R_3)I_3 - R_a I_1 - R_c I_2 = 0`,
  },
  {
    label: 'Malla 3 — Ecuación (3)',
    latex: `-30I_1 - 30I_2 + 90I_3 = 0 \\quad\\cdots(3)`,
    highlight: true,
  },
  {
    label: 'Sistema matricial',
    latex: `\\begin{bmatrix}70&-20&-30\\\\-20&70&-30\\\\-30&-30&90\\end{bmatrix}\\begin{bmatrix}I_1\\\\I_2\\\\I_3\\end{bmatrix}=\\begin{bmatrix}80\\\\80\\\\0\\end{bmatrix}`,
  },
  {
    label: 'Observación — Simetría',
    latex: `(1)=(2)\\Rightarrow I_1=I_2 \\quad \\text{(mismos coeficientes, mismo lado derecho)}`,
    note: 'Esta simetría simplifica enormemente la solución.',
  },
  {
    label: 'De (3): relación entre I₃ e I₁,I₂',
    latex: `-I_1-I_2+3I_3=0\\;\\Rightarrow\\;I_3=\\frac{I_1+I_2}{3}=\\frac{2I_1}{3}`,
  },
  {
    label: 'Sustituyendo en (1)',
    latex: `70I_1-20I_1-30\\cdot\\frac{2I_1}{3}=80\\;\\Rightarrow\\;30I_1=80`,
  },
  {
    label: '✅ RESULTADO FINAL',
    latex: `I_1=I_2=\\frac{8}{3}\\approx2.67\\text{ A}\\qquad I_3=\\frac{16}{9}\\approx1.78\\text{ A}`,
    highlight: true,
  },
];

export const BRANCH_CURRENTS = [
  { branch: 'R1 = 20Ω (solo M1)',    latex: `I_{R1}=I_1=\\tfrac{8}{3}\\text{ A}`,      voltage: `V_{R1}=20\\times\\tfrac{8}{3}=\\tfrac{160}{3}\\approx53.3\\text{ V}` },
  { branch: 'Rb = 20Ω (M1 ∩ M2)',   latex: `I_{Rb}=I_1-I_2=\\tfrac{8}{3}-\\tfrac{8}{3}=0\\text{ A}`, voltage: `V_{Rb}=0\\text{ V}`, warn: '¡Cero corriente! El profe puede preguntar esto.' },
  { branch: 'Ra = 30Ω (M1 ∩ M3)',   latex: `I_{Ra}=I_1-I_3=\\tfrac{8}{3}-\\tfrac{16}{9}=\\tfrac{8}{9}\\text{ A}`, voltage: `V_{Ra}=30\\times\\tfrac{8}{9}=\\tfrac{80}{3}\\approx26.7\\text{ V}` },
  { branch: 'R2 = 20Ω (solo M2)',    latex: `I_{R2}=I_2=\\tfrac{8}{3}\\text{ A}`,      voltage: `V_{R2}=\\tfrac{160}{3}\\approx53.3\\text{ V}` },
  { branch: 'Rc = 30Ω (M2 ∩ M3)',   latex: `I_{Rc}=I_2-I_3=\\tfrac{8}{9}\\text{ A}`, voltage: `V_{Rc}=\\tfrac{80}{3}\\approx26.7\\text{ V}` },
  { branch: 'R3 = 30Ω (solo M3)',    latex: `I_{R3}=I_3=\\tfrac{16}{9}\\text{ A}`,     voltage: `V_{R3}=30\\times\\tfrac{16}{9}=\\tfrac{160}{3}\\approx53.3\\text{ V}` },
];

export const VERIFICACION = [
  { label: 'Malla 1', latex: `70\\cdot\\tfrac{8}{3}-20\\cdot\\tfrac{8}{3}-30\\cdot\\tfrac{16}{9}=\\tfrac{560-160-160}{3}=\\tfrac{240}{3}=80\\;✓` },
  { label: 'Malla 2', latex: `-20\\cdot\\tfrac{8}{3}+70\\cdot\\tfrac{8}{3}-30\\cdot\\tfrac{16}{9}=80\\;✓` },
  { label: 'Malla 3', latex: `-30\\cdot\\tfrac{8}{3}-30\\cdot\\tfrac{8}{3}+90\\cdot\\tfrac{16}{9}=-80-80+160=0\\;✓` },
];

export const CHECKLIST = [
  '3 copias del circuito dibujadas (una por malla: I₁, I₂, I₃)',
  'Colores: rojo M1, azul M2, verde M3',
  'Las 3 ecuaciones de malla de memoria (KVL)',
  'Resultados: I₁=I₂=8/3 A, I₃=16/9 A',
  'Dato sorpresa: I_Rb = 0 A (el profe puede preguntar)',
];
