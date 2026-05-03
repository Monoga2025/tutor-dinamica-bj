export const STATS_TOPICS = [
  { id: 'media',      name: 'Media aritmética' },
  { id: 'mediana',    name: 'Mediana' },
  { id: 'moda',       name: 'Moda' },
  { id: 'varianza',   name: 'Varianza y Desv. Estándar' },
  { id: 'cv',         name: 'Coef. de Variación' },
  { id: 'tabla',      name: 'Tablas de Frecuencia' },
  { id: 'agrupados',  name: 'Datos Agrupados' },
  { id: 'cuartiles',  name: 'Cuartiles / Percentiles' },
];

export const STATS_FORMULAS = [
  {
    title: 'Media — Datos Simples',
    latex: `\\bar{x} = \\frac{\\sum x_i}{n}`,
    note: 'Suma todos los datos y divide entre la cantidad n.',
  },
  {
    title: 'Media — Datos Agrupados',
    latex: `\\bar{x} = \\frac{\\sum f_i m_i}{n}`,
    note: 'mᵢ = marca de clase = (límite inf + límite sup) / 2',
  },
  {
    title: 'Mediana — Datos Agrupados',
    latex: `Me = L + \\frac{n/2 - F}{f} \\cdot c`,
    note: 'L = límite inferior de la clase mediana\nF = frecuencia acumulada ANTES de esa clase\nf = frecuencia de esa clase\nc = amplitud del intervalo',
  },
  {
    title: 'Moda — Datos Agrupados',
    latex: `Mo = L + \\frac{d_1}{d_1+d_2} \\cdot c`,
    note: 'd₁ = f_modal − f_anterior\nd₂ = f_modal − f_siguiente',
  },
  {
    title: 'Varianza Poblacional vs Muestral',
    latex: `\\sigma^2 = \\frac{\\sum(x_i-\\mu)^2}{N} \\qquad s^2 = \\frac{\\sum(x_i-\\bar{x})^2}{n-1}`,
    warn: '⚠️ Población usa N. Muestra usa (n-1). ¡Diferencia crítica!',
  },
  {
    title: 'Fórmula alternativa de varianza',
    latex: `s^2 = \\frac{\\sum x_i^2 - (\\sum x_i)^2/n}{n-1}`,
    note: 'Más rápida para calcular sin la media.',
  },
  {
    title: 'Coeficiente de Variación',
    latex: `CV = \\frac{s}{\\bar{x}} \\times 100\\%`,
    note: 'CV < 15%: homogéneo | CV 15–30%: moderado | CV > 30%: heterogéneo',
  },
  {
    title: 'Amplitud de clase',
    latex: `c = \\frac{\\text{Máx} - \\text{Mín}}{k} \\qquad k \\approx \\sqrt{n}`,
    note: 'Sturges: k = 1 + 3.322·log(n). Redondea c hacia ARRIBA.',
  },
];

export const STATS_FLASHCARDS = [
  {
    front: `\\text{Media de datos agrupados}`,
    back: `\\bar{x} = \\frac{\\sum f_i m_i}{n}`,
    tip: 'mᵢ = punto medio del intervalo. Multiplica frecuencia × marca de clase.',
  },
  {
    front: `\\text{Mediana agrupada — fórmula}`,
    back: `Me = L + \\frac{n/2 - F}{f}\\cdot c`,
    tip: 'F es la frecuencia acumulada ANTES (no incluyendo) la clase mediana.',
  },
  {
    front: `\\text{Varianza muestral vs poblacional}`,
    back: `s^2 = \\frac{\\sum(x_i-\\bar{x})^2}{n-1} \\quad \\sigma^2 = \\frac{\\sum(x_i-\\mu)^2}{N}`,
    tip: 'Muestra siempre usa n-1 (corrección de Bessel para sesgo).',
  },
  {
    front: `\\text{¿Cuándo Media = Mediana = Moda?}`,
    back: `\\text{Distribución simétrica (normal / campana de Gauss)}`,
    tip: 'Si son distintos → hay sesgo. Media > Mediana > Moda = sesgo positivo.',
  },
  {
    front: `CV\\text{ — ¿qué mide?}`,
    back: `CV = \\frac{s}{\\bar{x}}\\times100\\%\\quad\\text{(dispersión relativa)}`,
    tip: 'Útil para comparar grupos con diferentes unidades o magnitudes.',
  },
];

export const STATS_PROBLEMS = [
  {
    num: 'Práctica 1',
    topic: 'Media, Mediana, Moda',
    latex: `\\text{Datos: }\\{3,\\,7,\\,5,\\,9,\\,1,\\,7,\\,4\\}\\quad\\text{Halla }\\bar{x},\\,Me,\\,Mo`,
    hints: [
      'Para la mediana: ordena de menor a mayor primero.',
      'Para la media: suma todos y divide entre n=7.',
    ],
    steps: [
      `\\bar{x}=\\frac{3+7+5+9+1+7+4}{7}=\\frac{36}{7}\\approx5.14`,
      `\\text{Ordenados: }\\{1,3,4,5,7,7,9\\}\\;\\Rightarrow\\;Me=5\\text{ (posición 4)}`,
      `Mo=7\\text{ (aparece 2 veces)}`,
    ],
    answer: 'x̄ ≈ 5.14, Me = 5, Mo = 7',
  },
  {
    num: 'Práctica 2',
    topic: 'Varianza y Desv. Estándar (muestra)',
    latex: `\\text{Datos: }\\{2,4,4,4,5,5,7,9\\}\\quad\\text{Calcula }s^2\\text{ y }s`,
    hints: [
      'Primero calcula x̄, luego (xᵢ − x̄)² para cada dato.',
      'Para muestra, el denominador es (n−1) = 7, no n = 8.',
    ],
    steps: [
      `\\bar{x}=\\frac{2+4+4+4+5+5+7+9}{8}=\\frac{40}{8}=5`,
      `\\sum(x_i-5)^2=9+1+1+1+0+0+4+16=32`,
      `s^2=\\frac{32}{7}\\approx4.57`,
      `s=\\sqrt{4.57}\\approx2.14`,
    ],
    answer: 's² ≈ 4.57, s ≈ 2.14',
  },
  {
    num: 'Práctica 3',
    topic: 'Coeficiente de Variación',
    latex: `\\text{Grupo A: }\\bar{x}=80,s=8\\quad\\text{Grupo B: }\\bar{x}=30,s=6\\quad\\text{¿Cuál es más homogéneo?}`,
    hints: [
      'Usa CV = (s/x̄)·100% para cada grupo.',
      'Menor CV = más homogéneo (menos disperso relativamente).',
    ],
    steps: [
      `CV_A=\\frac{8}{80}\\times100\\%=10\\%`,
      `CV_B=\\frac{6}{30}\\times100\\%=20\\%`,
      `CV_A < CV_B`,
    ],
    answer: 'Grupo A es más homogéneo (CV=10% vs 20%)',
  },
];
