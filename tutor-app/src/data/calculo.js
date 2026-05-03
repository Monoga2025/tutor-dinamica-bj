export const CALC_TOPICS = [
  { id: 'intdob-rect',   name: 'Integrales Dobles — Rectángulos' },
  { id: 'intdob-region', name: 'Integrales Dobles — Regiones Acotadas' },
  { id: 'area-curvas',   name: 'Área entre Curvas' },
  { id: 'centro-masa',   name: 'Centro de Masa con ρ(x,y)' },
  { id: 'polares',       name: 'Coordenadas Polares' },
];

export const CALC_FORMULAS = [
  {
    title: 'Integral Doble — Rectángulo',
    latex: `\\iint_R f(x,y)\\,dA = \\int_c^d\\int_a^b f(x,y)\\,dx\\,dy`,
    note: 'R = [a,b]×[c,d]. Puedes cambiar el orden de integración libremente.',
  },
  {
    title: 'Integral Doble — Región Acotada',
    latex: `\\iint_R f(x,y)\\,dA = \\int_a^b\\left[\\int_{g_1(x)}^{g_2(x)} f(x,y)\\,dy\\right]dx`,
    note: 'Los límites de y dependen de x. Dibuja la región antes de integrar.',
    warn: '⚠️ El límite inferior debe ser MENOR que el superior.',
  },
  {
    title: 'Área con Integral Doble',
    latex: `A = \\iint_R 1\\,dA = \\int_a^b [f_{\\text{arriba}} - f_{\\text{abajo}}]\\,dx`,
    note: 'Paso 1: Iguala curvas → intersecciones. Paso 2: ¿Cuál está arriba? Paso 3: Integra.',
  },
  {
    title: 'Centro de Masa — Masa total',
    latex: `M = \\iint_R \\rho(x,y)\\,dA`,
    note: 'ρ(x,y) es la función de densidad.',
  },
  {
    title: 'Centro de Masa — Momentos',
    latex: `M_y = \\iint_R x\\cdot\\rho\\,dA \\qquad M_x = \\iint_R y\\cdot\\rho\\,dA`,
    warn: '⚠️ M_y usa x (no y). M_x usa y (no x). Es contra-intuitivo.',
  },
  {
    title: 'Centro de Masa — Coordenadas',
    latex: `\\bar{x} = \\frac{M_y}{M} \\qquad \\bar{y} = \\frac{M_x}{M}`,
  },
  {
    title: 'Coordenadas Polares — Sustitución',
    latex: `x = r\\cos\\theta,\\quad y = r\\sin\\theta,\\quad x^2+y^2 = r^2,\\quad dA = r\\,dr\\,d\\theta`,
    warn: '⚠️ Nunca olvides la r en dA = r dr dθ. Sin r → error garantizado.',
  },
  {
    title: 'Coordenadas Polares — Límites típicos',
    latex: `\\text{Círculo:}\\;\\theta\\in[0,2\\pi],\\;r\\in[0,R]\\\\\\text{Semicírculo sup:}\\;\\theta\\in[0,\\pi]\\\\\\text{1er cuadrante:}\\;\\theta\\in[0,\\tfrac{\\pi}{2}]`,
    note: '¿Cuándo cambiar? Cuando ves √(x²+y²) o x²+y² en el integrando.',
  },
  {
    title: 'Integral polar útil',
    latex: `\\int_0^1 \\frac{r}{1+r}\\,dr = \\left[r - \\ln(1+r)\\right]_0^1 = 1 - \\ln 2`,
    note: 'Truco: reescribe r/(1+r) = 1 - 1/(1+r).',
  },
];

export const CALC_FLASHCARDS = [
  {
    front: `dA\\text{ en polares}`,
    back: `dA = r\\,dr\\,d\\theta`,
    tip: 'La r extra es el jacobiano del cambio de coordenadas. Sin ella → integral incorrecta.',
  },
  {
    front: `\\text{¿Cuándo usar polares?}`,
    back: `\\text{Cuando ves }\\sqrt{x^2+y^2}\\text{ o }x^2+y^2\\text{ en el integrando}`,
    tip: 'La región circular/semicircular también es señal.',
  },
  {
    front: `\\iint_R 1\\,dA = ?`,
    back: `= \\text{Área de la región }R`,
    tip: 'Integrar f=1 sobre R da el área. Útil para verificar resultados.',
  },
  {
    front: `M_y\\text{ vs }M_x`,
    back: `M_y = \\iint x\\rho\\,dA\\quad(\\text{usa }x)\\\\M_x = \\iint y\\rho\\,dA\\quad(\\text{usa }y)`,
    tip: 'M_y aleja del eje y → usa x. Mnemonico: opuesto.',
  },
  {
    front: `\\lim_{r\\to0}\\frac{\\sin r}{r}`,
    back: `= 1`,
    tip: 'Límite fundamental. Aparece al integrar 1/(1+r) en polares.',
  },
  {
    front: `\\text{Regla de la cadena para integrales}`,
    back: `\\frac{d}{dx}\\int_a^{g(x)} f(t)\\,dt = f(g(x))\\cdot g'(x)`,
    tip: 'El Teorema Fundamental del Cálculo con límite superior variable.',
  },
];

export const CALC_PROBLEMS = [
  {
    num: 'Ejercicio 1',
    topic: 'Integral Doble — Rectángulo',
    latex: `\\iint_R (5-x)\\,dA,\\quad R:\\;0\\le x\\le5,\\;0\\le y\\le3`,
    hints: [
      'Es un rectángulo: integra en cualquier orden. Prueba: primero respecto a x, luego y.',
      `\\int_0^3\\left[\\int_0^5(5-x)\\,dx\\right]dy\\;\\Rightarrow\\;\\text{resuelve }\\int_0^5(5-x)\\,dx\\text{ primero}`,
    ],
    steps: [
      `\\int_0^3\\int_0^5(5-x)\\,dx\\,dy`,
      `=\\int_0^3\\left[5x-\\tfrac{x^2}{2}\\right]_0^5 dy`,
      `=\\int_0^3\\left[25-\\tfrac{25}{2}\\right]dy=\\int_0^3 12.5\\,dy`,
      `=12.5\\cdot[y]_0^3=12.5\\times3`,
    ],
    answer: '= 37.5',
  },
  {
    num: 'Ejercicio 2',
    topic: 'Área entre Curvas',
    latex: `\\text{Área entre }y=-x\\text{ y }y=2x-x^2`,
    hints: [
      'Iguala -x = 2x - x² para encontrar intersecciones.',
      'En x=1: y₁=-1 (abajo), y₂=1 (arriba). La curva y=2x-x² está arriba en [0,3].',
    ],
    steps: [
      `-x = 2x-x^2\\;\\Rightarrow\\;x^2-3x=0\\;\\Rightarrow\\;x(x-3)=0`,
      `x=0\\text{ y }x=3`,
      `A=\\int_0^3[(2x-x^2)-(-x)]\\,dx=\\int_0^3(3x-x^2)\\,dx`,
      `=\\left[\\tfrac{3x^2}{2}-\\tfrac{x^3}{3}\\right]_0^3=\\left[\\tfrac{27}{2}-9\\right]`,
    ],
    answer: '= 4.5 unidades²',
  },
  {
    num: 'Ejercicio 3',
    topic: 'Centro de Masa con ρ(x,y)=x²',
    latex: `\\text{Triángulo: }x=0,\\;y=0,\\;2x+y=4,\\;\\rho(x,y)=x^2`,
    hints: [
      'Límites: 0≤x≤2, 0≤y≤4-2x (de la recta 2x+y=4 despejando y).',
      'Calcula M = ∫₀² ∫₀^{4-2x} x² dy dx. La integral interior es trivial respecto a y.',
    ],
    steps: [
      `M=\\int_0^2 x^2(4-2x)\\,dx=\\int_0^2(4x^2-2x^3)\\,dx=\\left[\\tfrac{4x^3}{3}-\\tfrac{x^4}{2}\\right]_0^2=\\tfrac{8}{3}`,
      `M_y=\\int_0^2 x^3(4-2x)\\,dx=\\left[x^4-\\tfrac{2x^5}{5}\\right]_0^2=\\tfrac{16}{5}`,
      `M_x=\\tfrac{1}{2}\\int_0^2 x^2(4-2x)^2\\,dx=\\tfrac{32}{15}`,
      `\\bar{x}=\\frac{M_y}{M}=\\frac{16/5}{8/3}=\\frac{6}{5},\\quad\\bar{y}=\\frac{M_x}{M}=\\frac{32/15}{8/3}=\\frac{4}{5}`,
    ],
    answer: 'Centro de masa: (6/5, 4/5)',
  },
  {
    num: 'Ejercicio 4',
    topic: 'Integral Doble — Región Triangular',
    latex: `\\iint_R(x+1)\\,dA,\\quad R\\text{ acotada por }y=x,\\;x+y=4,\\;x=0`,
    hints: [
      'Intersecciones: y=x ∩ x+y=4 → x=2. Región: 0≤x≤2, x≤y≤4-x.',
      `\\int_0^2\\int_x^{4-x}(x+1)\\,dy\\,dx=\\int_0^2(x+1)(4-2x)\\,dx`,
    ],
    steps: [
      `\\int_0^2(x+1)(4-2x)\\,dx=\\int_0^2(-2x^2+2x+4)\\,dx`,
      `=\\left[-\\tfrac{2x^3}{3}+x^2+4x\\right]_0^2`,
      `=\\left[-\\tfrac{16}{3}+4+8\\right]=\\left[12-\\tfrac{16}{3}\\right]`,
    ],
    answer: '= 20/3 ≈ 6.67',
  },
  {
    num: 'Ejercicio 5a',
    topic: 'Coordenadas Polares — Cuarto de Círculo',
    latex: `\\int_0^1\\int_0^{\\sqrt{1-y^2}}\\frac{1}{1+\\sqrt{x^2+y^2}}\\,dx\\,dy`,
    hints: [
      '¿Ves √(x²+y²)? → polares. Región: primer cuadrante del círculo unitario.',
      'En polares: r:0→1, θ:0→π/2. Sustituye √(x²+y²)=r y dA=r dr dθ.',
    ],
    steps: [
      `\\int_0^{\\pi/2}\\int_0^1\\frac{r}{1+r}\\,dr\\,d\\theta`,
      `\\int_0^1\\frac{r}{1+r}\\,dr=\\int_0^1\\left(1-\\frac{1}{1+r}\\right)dr=\\left[r-\\ln(1+r)\\right]_0^1=1-\\ln2`,
      `\\int_0^{\\pi/2}(1-\\ln2)\\,d\\theta=(1-\\ln2)\\cdot\\frac{\\pi}{2}`,
    ],
    answer: '= (π/2)(1 − ln 2) ≈ 0.483',
  },
  {
    num: 'Ejercicio 5b',
    topic: 'Coordenadas Polares — Semicírculo de Radio 5',
    latex: `\\int_{-5}^{5}\\int_0^{\\sqrt{25-x^2}}(4x+3y)\\,dy\\,dx`,
    hints: [
      'Región: semicírculo superior de radio 5 → polares: r:0→5, θ:0→π.',
      'x=r cosθ, y=r sinθ, dA=r dr dθ.',
    ],
    steps: [
      `\\int_0^\\pi\\int_0^5(4r\\cos\\theta+3r\\sin\\theta)\\cdot r\\,dr\\,d\\theta`,
      `=\\int_0^\\pi(4\\cos\\theta+3\\sin\\theta)\\,d\\theta\\cdot\\int_0^5 r^2\\,dr`,
      `\\int_0^\\pi(4\\cos\\theta+3\\sin\\theta)\\,d\\theta=[4\\sin\\theta-3\\cos\\theta]_0^\\pi=(0+3)-(0-3)=6`,
      `\\int_0^5 r^2\\,dr=\\frac{125}{3}`,
      `\\text{Total}=6\\times\\frac{125}{3}`,
    ],
    answer: '= 250',
  },
];
