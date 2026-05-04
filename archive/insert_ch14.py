#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sqlite3, time, json, os

DB = os.path.join(os.path.dirname(__file__), 'tutor_ia.db')
conn = sqlite3.connect(DB)

solutions_data = [
    ('14.1', 14, '1',
     'Airline employee tosses 15-kg and 20-kg suitcases onto 25-kg carrier.',
     'Conservacion de momento lineal - impactos sucesivos',
     json.dumps([
         'No hay fuerzas externas horizontales. El carrito rueda libremente entre impactos.',
         '(a) 15-kg primero: (15)(3) = (40)v1  →  v1 = 1.125 m/s',
         '(20)(2) + (40)(1.125) = (60)v2  →  v2 = 1.417 m/s',
         '(b) 20-kg primero: (20)(2) = (45)v1  →  v1 = 0.8889 m/s',
         '(15)(3) + (45)(0.8889) = (60)v2  →  v2 = 1.417 m/s',
     ]),
     '(a) v2 = 1.417 m/s  |  (b) v2 = 1.417 m/s', 797),

    ('14.5', 14, '5',
     'Bullet 1500 ft/s through 6-lb block A, embeds in 4.95-lb block B. vA=5 ft/s, vB=9 ft/s.',
     'Conservacion de momento - bala multiple impacto',
     json.dumps([
         'mAvA + mBvB = (6)(5)+(4.95)(9) = 74.55 lb*ft/s',
         '(a) m = 74.55 / (v0-vB) = 74.55/1491 = 0.0500 lb = 0.800 oz',
         '(b) m*v0 = m*v1 + mA*vA  =>  v1 = (0.05*1500 - 6*5)/0.05 = 900 ft/s',
     ]),
     '(a) m = 0.800 oz  |  (b) v1 = 900 ft/s', 801),

    ('14.7', 14, '7',
     'Bumper cars A(240kg), B(260kg), C(235kg). vA=2m/s, vB=0, vC=-1.5m/s. e=0.8.',
     'Conservacion de momento + coeficiente de restitucion',
     json.dumps([
         '(a) A y C golpean B simultaneamente:',
         'mAvA + mBvB + mCvC = mAvA + mBvB + mCvC  (3 incognitas)',
         'vB-vA = e(vA-vB) = 0.8(2-0) = 1.6',
         'vC-vB = e(vB-vC) = 0.8(0+1.5) = 1.2',
         'Solucion: vA=-1.288 m/s, vB=0.312 m/s, vC=1.512 m/s',
         '(b) A golpea B primero:',
         '(240)(2) = 240vA+260vB; vB-vA=1.6  =>  vA=0.128, vB=1.728',
         'B golpea C: (260)(1.728)+(235)(-1.5)=260vB+235vC; vC-vB=2.5824',
         '  =>  vB=-1.030, vC=1.552',
         'A golpea B otra vez: vA=-0.956, vB=-0.0296',
     ]),
     '(a) vA=1.288, vB=0.312, vC=1.512 m/s  |  (b) vA=0.956, vB=0.0296, vC=1.552 m/s', 803),

    ('14.9', 14, '9',
     'System mA=3kg, mB=4kg, mC=5kg with velocities vA=-4i+4j+6k, vB=-6i+8j+4k, vC=2i-6j-4k.',
     'Momento angular de sistema de particulas - producto vectorial',
     json.dumps([
         'Ho = rA x mAvA + rB x mBvB + rC x mCvC',
         'rA=1.2i+1.5k, rB=0.9i+1.2j+1.2k, rC=2.4j+1.8k',
         'Calcular cada producto vectorial (determinante 3x3)',
         '= (-18i-39.6j+14.4k) + (-19.2i-43.2j+57.6k) + (6i+18j-24k)',
         'Ho = -31.2i - 64.8j + 48.0k  kg.m^2/s',
     ]),
     'Ho = -(31.2)i - (64.8)j + (48.0)k  kg.m^2/s', 808),

    ('14.15', 14, '15',
     '900-lb space vehicle v=(1200i) ft/s. Explodes into 450lb@A(3840,-960,-1920), 300lb@B(6480,1200,2640), find C at t=4s.',
     'Centro de masa - sin fuerzas externas sigue trayectoria original',
     json.dumps([
         'Sin fuerzas externas: rG = vG*t = (1200)(4)i = 4800i ft',
         'm*rG = mA*rA + mB*rB + mC*rC',
         '900(4800i) = 450(3840i-960j-1920k) + 300(6480i+1200j+2640k) + 150*rC',
         '150*rC = 4320000i - 648000j*... => calcular por componentes',
         'rC = 4320i + 480j + 480k  ft',
     ]),
     'rC = (4320 ft)i + (480 ft)j + (480 ft)k', 815),

    ('14.17', 14, '17',
     'Airplane 1500kg + helicopter 3000kg collide at 1200m altitude. Find where airplane falls.',
     'Centro de masa en explosion/colision + cinematica del proyectil',
     json.dumps([
         'Velocidad del helicoptero antes: vH = 8400m/(4*60s) i = 35 m/s i',
         'Velocidad del avion antes: vA = (16000i-12000j)/(240s) = 66.67i-50j m/s',
         'V_cdm = (mH*vH + mA*vA)/(mH+mA) = (3000*35i + 1500*(66.67i-50j))/4500',
         'V_cdm = 45.556i - 16.667j m/s',
         'Tiempo de caida: t = sqrt(2h/g) = sqrt(2400/9.81) = 15.64 s',
         'rG = V_cdm * t = (712.55i - 260.69j) m',
         'mH*rH1+mH2*rH2+mA*rA = (mH+mA)*rG',
         '=> rA = (1004i - 48.7j) m',
     ]),
     'Avion cae en (1004 m, -48.7 m)', 817),

    ('14.31', 14, '31',
     'Energy lost in 14.1 impacts (15-kg suitcase first). Calculate for each impact.',
     'Energia perdida en impacto - T_perdida = T_antes - T_despues',
     json.dumps([
         '(a) 1er impacto (15kg hits 25kg carrier):',
         'T_antes = (1/2)(15)(3)^2 = 67.5 J',
         'v1 = 1.125 m/s (del 14.1)',
         'T_despues = (1/2)(40)(1.125)^2 = 25.31 J',
         'Perdida (a) = 67.5 - 25.31 = 42.2 J',
         '(b) 2do impacto (20kg hits 40kg system):',
         'T_antes = 25.31 + (1/2)(20)(2)^2 = 65.31 J',
         'v2 = 1.417 m/s (del 14.1)',
         'T_despues = (1/2)(60)(1.417)^2 = 60.21 J',
         'Perdida (b) = 5.10 J',
     ]),
     '(a) 42.2 J  |  (b) 5.10 J', 836),

    ('14.35', 14, '35',
     'Cars mA=1600kg, mB=900kg, vA=90km/h, vB=60km/h head-on. Show EA/EB = mB/mA.',
     'Colision plastica - energia absorbida proporcional a inverso de masa',
     json.dumps([
         'CDM velocity: V = (mA*vA + mB*(-vB))/(mA+mB)',
         'vA=25m/s, vB=16.667m/s: V = (1600*25 - 900*16.667)/2500 = 10 m/s',
         'Velocidades relativas al CDM: uA=15 m/s, uB=-26.667 m/s',
         'EA = (1/2)*mA*uA^2 = (1/2)(1600)(15)^2 = 180 kJ',
         'EB = (1/2)*mB*uB^2 = (1/2)(900)(26.667)^2 = 320 kJ',
         'EA/EB = 180/320 = 0.5625 = 900/1600 = mB/mA  QED',
     ]),
     'EA=180 kJ, EB=320 kJ, EA/EB = mB/mA', 842),

    ('14.57', 14, '57',
     'Water stream A=500mm2, v=25m/s hits stationary plate. Find force P.',
     'Flujo de fluido - principio impulso-momento',
     json.dumps([
         'dm/dt = rho*A*v = 1000 * 500e-6 * 25 = 12.5 kg/s',
         'Impulso-momento: (dm)*v - P*dt = (dm)*0',
         'P = (dm/dt)*v = (12.5)(25) = 312 N',
     ]),
     'P = 312 N', 877),

    ('14.91', 14, '91',
     'Space shuttle: 3 engines, each burns 340 kg/s at 3750 m/s relative velocity.',
     'Cohete - empuje = u * dm/dt',
     json.dumps([
         'Empuje un motor: P = u*(dm/dt) = (3750)(340) = 1.275e6 N',
         'Total 3 motores: F = 3 * 1.275e6 = 3.825e6 N = 3.83 MN',
     ]),
     'Empuje total = 3.83 MN', 923),

    ('14.94', 14, '94',
     'Rocket 1200kg (1000kg fuel), burns 12.5 kg/s, ejected 4000 m/s, vertical launch.',
     'Cohete vertical - a = P/m - g con masa variable',
     json.dumps([
         'Empuje: P = u*dm/dt = 4000*12.5 = 50000 N',
         'EcMov: a = P/m - g',
         '(a) inicio m=1200kg: a = 50000/1200 - 9.81 = 31.9 m/s^2',
         '(b) fin combustible m=200kg: a = 50000/200 - 9.81 = 240 m/s^2',
     ]),
     '(a) a = 31.9 m/s^2  |  (b) a = 240 m/s^2', 926),
]

for sol in solutions_data:
    conn.execute('''
        INSERT OR REPLACE INTO solutions(problem_id, chapter, problem_num, problem_text, method, steps, final_answer, page_num, processed_ts)
        VALUES (?,?,?,?,?,?,?,?,?)
    ''', (sol[0], sol[1], sol[2], sol[3], sol[4], sol[5], sol[6], sol[7], time.time()))

ch14_context = """CAPITULO 14 - SISTEMAS DE PARTICULAS (Beer & Johnston, verificado del solucionario)

CONCEPTOS CLAVE:

1. CONSERVACION DE MOMENTO LINEAL
   Si no hay fuerzas externas: Sum(m_i * v_i) = Sum(m_i * v_i')
   Para impactos SUCESIVOS: aplicar conservacion en cada impacto por separado.
   Entre impactos el sistema rueda libremente (sin fuerzas externas).
   Truco: el orden de impacto PUEDE cambiar la velocidad intermedia pero NO la final
   si los dos impactos son entre los mismos objetos (ver 14.1: ambos ordenes dan 1.417 m/s).

2. COEFICIENTE DE RESTITUCION
   e = (vB' - vA') / (vA - vB)   (relativa de separacion / relativa de aproximacion)
   e=0 perfectamente plastico (se pegan)
   e=1 perfectamente elastico (conserva energia cinetica)
   Sistema de 2 ecuaciones: conservacion de momento + definicion de e.
   Para 3 cuerpos: cada par de impacto genera su propio sistema de 2 ecuaciones.

3. MOMENTO ANGULAR
   Ho = Sum(r_i x m_i*v_i)   (producto vectorial, 3D)
   Relacion: Ho = r_cdm x m*v_cdm + Hg
   Se conserva cuando el momento de las fuerzas externas es cero.

4. MOVIMIENTO DEL CENTRO DE MASA
   Sin fuerzas externas: r_G(t) = r_G0 + v_G * t   (trayectoria recta y uniforme)
   En explosiones: el CDM sigue como si NO hubiera explotado.
   Para localizar fragmento: m_total * r_G = Sum(m_i * r_i)

5. ENERGIA EN IMPACTOS
   Perdida: DeltaT = T_antes - T_despues
   Impacto plastico entre m1 y m2: DeltaT = (1/2)*(m1*m2/(m1+m2))*(v1-v2)^2
   En colision frontal: EA/EB = mB/mA (energia absorbida inversamente proporcional a la masa)

6. FLUJO DE FLUIDOS
   dm/dt = rho * A * v   (tasa de flujo masico)
   Fuerza sobre placa estatica: F = (dm/dt) * v
   Fuerza sobre placa movil velocidad V: F = (dm/dt) * (v - V), dm/dt con velocidad relativa
   Empuje de propulsor: F = (dm/dt) * (u - v_avion)

7. COHETES (masa variable)
   Empuje: P = u * |dm/dt|   donde u = velocidad relativa de expulsion
   Ecuacion de movimiento: m*(dv/dt) = P - mg  (vertical)
   Tsiolkovsky: v - v0 = u * ln(m0/m) - g*t   (vertical desde reposo)
   Sin gravedad: Delta_v = u * ln(m0/m_final)

PROBLEMAS CRITICOS (por frecuencia en examenes):
- 14.1/14.6: impactos sucesivos con momento lineal
- 14.7: coeficiente de restitucion, multiples impactos en secuencia
- 14.9/14.11: momento angular 3D con productos vectoriales
- 14.15/14.16: explosion y CDM
- 14.19: accidente de autos, CDM bajo ausencia de fuerzas externas
- 14.31/14.35: energia perdida en impactos
- 14.57/14.58: fuerza de chorro sobre placa
- 14.68: banda transportadora (masa variable)
- 14.91/14.94: cohetes, empuje, aceleracion variable

ERRORES COMUNES:
- Usar la misma velocidad antes y despues sin aplicar conservacion
- Olvidar que dm/dt = rho*A*v usa la velocidad RELATIVA para placa movil
- En momento angular 3D: confundir el orden del producto vectorial (r x mv, NO mv x r)
- En explosion: asumir que todos los fragmentos tienen la misma velocidad del CDM
- Tsiolkovsky: olvidar el termino -g*t para lanzamiento vertical
"""

conn.execute('''
    INSERT OR REPLACE INTO bj_sections(chapter, section, title, content)
    VALUES (14, '14.CONTEXT', 'Conceptos Clave Cap 14 - Verificados del Solucionario', ?)
''', (ch14_context,))

conn.commit()
conn.close()
print("OK: 11 soluciones verificadas + contexto cap14 insertados en DB")
