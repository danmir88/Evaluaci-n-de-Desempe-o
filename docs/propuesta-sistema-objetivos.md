# Sistema de Evaluación de Desempeño FRIGOR — Componente 1: Objetivos ejecutivos

**Propuesta metodológica · octubre 2026**
Preparado para Gerencia General y Gerencia de Talento Humano.

---

## 1. Resumen

Proponemos reemplazar el Constructor de Objetivos SMART 2026 por un modelo de **scorecard ponderado por ejecutivo** con tres piezas que hoy no existen: **pesos**, **bandas de logro** (umbral, meta, sobresaliente) y un **proceso trimestral de evaluación y calibración**. El modelo sigue lo que hacen las empresas de referencia (Balanced Scorecard, despliegue tipo Hoshin Kanri, diseño de incentivos anuales de WTW, Meridian y FW Cook, y los hallazgos de Locke y Latham sobre metas).

Plan de trabajo:

| Etapa | Qué se hace | Cuándo |
|---|---|---|
| Transición 2026 | Cerrar T3 y T4 con los 16 objetivos vigentes, agregándoles peso, bandas y meta acumulada T3/T4 | Oct 2026 – Ene 2027 |
| Objetivos 2027 | Construir los scorecards con el modelo completo, en cascada desde el scorecard corporativo | Oct – Dic 2026 |
| Fase 2 (2027) | Agregar el componente de competencias y conductas (el “cómo”) con la misma escala de 5 niveles | Desde T2 2027 |
| Fase 3 (2028) | Conectar el resultado con la compensación variable, si el Directorio lo aprueba | Presupuesto 2028 |

La herramienta web que acompaña esta propuesta (`app/objetivos-frigor.html`, desplegable en Railway) ya implementa el modelo.

---

## 2. Diagnóstico del Constructor actual

El Constructor resolvió algo valioso: obligó a tener línea base, fuente y pilar estratégico. Sus límites son de diseño, no de esfuerzo:

1. **Es rígido en la redacción y laxo en lo que importa.** Bloquea indicadores que contengan “y”, comas o “/” (por eso rechazaría el propio “OTIF (on time + in full / ventas)”) y compone el texto del objetivo automáticamente. A cambio, no pide pesos ni rangos de logro.
2. **No permite calcular un resultado.** Sin pesos, los 16 objetivos valen lo mismo, y sin umbral y sobresaliente solo se puede decir “cumplió / no cumplió”. No existe un puntaje del ejecutivo.
3. **Prohíbe proyectos, pero la mitad de los objetivos son proyectos.** Rechaza los objetivos de actividad, y sin embargo 8 de los 16 objetivos son “avance de proyecto %” disfrazados de resultado (ISO 22000, plantas, ERP, programas de GTH). Un % de avance declarado por el propio responsable es la medida más débil posible.
4. **Las metas intermedias son un reparto lineal automático.** Para “cumplimiento de presupuesto” con base 0 y meta 100, el reparto lineal da 25% en marzo, lo que no tiene sentido: el presupuesto acumulado ya es la meta de cada mes.
5. **El proceso es “vueltero”.** Asistente de 7 pasos, seguimiento opcional que duplica SALAR, y consolidación por archivos JSON que cada gerente envía a GTH.
6. **No hay gobierno.** No se definen quién aprueba, cuándo se pueden ajustar metas, ni cómo se calibra.
7. **Datos pendientes.** Cinco objetivos siguen con línea base y meta marcadas como PLACEHOLDER (UO/Ventas, OTIF, días de cartera, rotación ≤ 6 meses).
8. **Clasificaciones dudosas.** ISO 22000 (inocuidad) y OTIF (servicio) están en el pilar Financiero; corresponden mejor a Clientes. Se recomienda revisarlo al construir 2027.

---

## 3. Qué dicen las mejores prácticas

| Práctica | Fuente | Qué tomamos |
|---|---|---|
| Metas específicas y exigentes rinden más que “haz tu mejor esfuerzo”, siempre que haya retroalimentación y compromiso | Locke & Latham (2002), meta-análisis con más de 40.000 participantes | Metas numéricas exigentes, revisión trimestral y metas acordadas, no impuestas |
| Las metas mal dosificadas generan efectos secundarios: foco estrecho, riesgo excesivo y conductas antiéticas | Ordóñez, Schweitzer, Galinsky & Bazerman, *Goals Gone Wild* (2009) | Pocas metas balanceadas, topes, y un modificador por eventos graves de inocuidad, seguridad o ética |
| Estrategia traducida en un mapa causa-efecto de 4 perspectivas con medidas, metas e iniciativas, desplegada en cascada | Kaplan & Norton, Balanced Scorecard y Strategy Maps | Los 4 pilares de FRIGOR como perspectivas; scorecard corporativo que se despliega a divisiones y gerencias |
| Pocos objetivos de ruptura (3–5 al año) acordados en diálogo entre niveles (*catchball*) | Hoshin Kanri / X-Matrix | Ronda de propuesta y contrapropuesta entre Gerencia General y divisiones antes de aprobar |
| Umbral, meta y máximo calibrados por probabilidad: umbral ~80–90%, meta ~50%, máximo ~10–20% | WTW (análisis de 10 años del S&P 1500); Meridian | Bandas de logro por indicador; la meta no es “lo seguro” |
| Scorecards de 4 o más métricas, peso individual típico ~25% | Harvard Law School Forum on Corporate Governance (2025) | 3 a 7 objetivos por ejecutivo con peso entre 10% y 40% |
| Compromisos que deben lograrse al 100% vs. metas aspiracionales | Google, guía de OKR (re:Work) | Separar los compromisos (scorecard evaluado) de las aspiraciones (no evaluadas, opcionales) |
| Conversaciones frecuentes y una “foto” trimestral, en vez de una evaluación anual pesada | Deloitte (Buckingham & Goodall, HBR 2015); Adobe Check-in | Evaluación trimestral corta y retroalimentación al cierre de cada trimestre |
| Los ajustes a metas a mitad de año erosionan credibilidad; solo por eventos externos materiales y con reglas previas | Meridian, *A Framework for Incentive Plan Adjustments*; Pearl Meyer | Metas fijas con una sola ventana de revisión y criterios escritos |
| Proyectos medidos por hitos ponderados, no por % de avance declarado | Método de hitos ponderados (Oracle Primavera, PMI) | Tipo de objetivo “Proyecto con hitos” con evidencia verificable |
| La alineación de metas con la organización y con el colaborador mejora el desempeño hasta 22%; la calibración falla cuando no es consistente | Gartner | Calibración con evidencia y reglas comunes |

---

## 4. El modelo propuesto

### 4.1 Arquitectura

```
Pilares estratégicos FRIGOR (4 perspectivas)
        │
Scorecard corporativo (Gerencia General) — 8 a 12 indicadores, cubre los 4 pilares
        │  catchball
Scorecards de división (5 gerencias de división)
        │  catchball
Scorecards de gerencia (Planificación y Finanzas, TI, GTH, Contabilidad…)
```

**Composición del scorecard por nivel (desde 2027):**

| Nivel | Resultados corporativos compartidos | Resultados de la división | Objetivos propios |
|---|---|---|---|
| Gerente General | 100% | — | — |
| Gerentes de división | 30% | 70% (sus propios objetivos) | — |
| Gerentes de área | 20% | 20% | 60% |

El componente compartido (por ejemplo EBITDA y ventas totales) evita que cada área optimice lo suyo a costa del resto y es la práctica dominante en planes anuales de incentivos.

### 4.2 Reglas de construcción

- **3 a 7 objetivos** por ejecutivo, que suman **100%**.
- **Peso por objetivo entre 10% y 40%.**
- **Al menos 60% del peso en indicadores de resultado.** Los proyectos con hitos pueden pesar hasta 40%.
- Cada objetivo se vincula a **un pilar estratégico**. El scorecard corporativo cubre los cuatro; las gerencias no están obligadas a hacerlo.
- **Redacción libre.** El objetivo se escribe como se diría al comité. La disciplina está en la medición, no en el texto.

### 4.3 Dos tipos de objetivo

**A. Indicador de resultado.** Ficha con: indicador, fórmula, unidad, si mejor es mayor o menor, línea base real, **umbral**, **meta** y **sobresaliente**, **meta acumulada al cierre de cada trimestre**, fuente y **responsable del dato** (idealmente distinto del evaluado: Finanzas certifica ventas y UO; Calidad certifica reclamos).

**B. Proyecto con hitos.** De 3 a 6 entregables verificables, cada uno con trimestre comprometido, peso (los hitos suman 100%) y evidencia (acta de recepción, go-live, certificado de auditoría). Cuenta lo entregado, no el % de avance declarado.

### 4.4 Cómo se calcula el puntaje

**Indicador:**

| Resultado | Puntaje |
|---|---|
| Bajo el umbral | 0 |
| En el umbral | 50 |
| En la meta | 100 |
| En el sobresaliente o más | 120 (tope) |

Entre puntos, interpolación lineal. Para indicadores donde menor es mejor (días de cartera, rotación), la curva se invierte.

**Meta trimestral:** es la meta **acumulada** a ese trimestre (año a la fecha). Umbral y sobresaliente del trimestre mantienen la misma distancia a la meta que en el año.

**Proyecto:** puntaje = peso de los hitos cumplidos que vencían hasta ese trimestre ÷ peso de los hitos que vencían. Tope 100. Si no vence ningún hito en el trimestre, el objetivo no pondera ese trimestre.

**Puntaje del ejecutivo** = promedio ponderado por peso de los objetivos con meta en el trimestre. **El resultado anual es el T4 acumulado**, no el promedio de los trimestres: T1 a T3 sirven para corregir el rumbo a tiempo.

**Tope de 120:** el mercado usa máximos de 150% a 200% cuando hay bono atado. Mientras el sistema no pague variable, 120 basta para reconocer el sobrecumplimiento sin premiar metas fáciles.

**Valores sugeridos de umbral y sobresaliente** (punto de partida, ajustable):
- Umbral = meta − 30% de la brecha entre línea base y meta.
- Sobresaliente = meta + 20% de esa brecha.
- Para % de cumplimiento de presupuesto: 90 / 100 / 110.
- Para cumplimiento de planes donde exceder no agrega valor (abastecimiento, avance de proyecto): 90 / 100 / 100.

### 4.5 Escala de calificación

| Nivel | Calificación | Puntaje ponderado |
|---|---|---|
| 5 | Excepcional | ≥ 115 |
| 4 | Supera | 105 – 114,9 |
| 3 | Cumple | 90 – 104,9 |
| 2 | Cumple parcialmente | 70 – 89,9 |
| 1 | No cumple | < 70 |

La misma escala de 5 niveles se usará para competencias en la Fase 2, para combinar el “qué” y el “cómo” en una matriz.

### 4.6 Gobierno

| Rol | Responsabilidad |
|---|---|
| Directorio / Gerencia General | Aprueba el scorecard corporativo y los scorecards de división; preside la calibración |
| Gerentes | Proponen su scorecard, cargan resultados trimestrales con comentario y nivel de confianza, conversan con su equipo |
| Responsables del dato (Finanzas, Calidad, Supply Chain, GTH) | Certifican los valores reales al cierre de cada trimestre |
| GTH | Custodia el modelo y la herramienta, revisa la calidad de los objetivos, facilita la calibración, carga los resultados en SALAR |
| Comité de calibración | GG + gerentes de división + GTH. Revisa evidencia, aplica ajustes de ±20 puntos con motivo escrito y revisa la distribución |

**Reglas de ajuste de metas:**
1. Las metas se fijan con el presupuesto y no cambian durante el año.
2. Hay **una sola ventana de revisión, en julio**, y solo por eventos externos materiales (regulación, sanidad animal, tipo de cambio fuera del rango presupuestado, cierre de mercados) o por decisiones de la compañía que cambian el alcance (por ejemplo, un proyecto que se suspende). La aprobación es de Gerencia General, por escrito.
3. Un evento grave de inocuidad, seguridad o ética puede reducir el resultado final por decisión del comité, aunque las metas numéricas se hayan cumplido.
4. Todo cambio queda en la bitácora con fecha y autor.

### 4.7 Ciclo anual

| Momento | Actividad |
|---|---|
| Oct – Nov | Gerencia General define el scorecard corporativo junto con el presupuesto; divisiones y gerencias proponen (catchball) |
| Dic | Calibración de la calidad de los objetivos y aprobación |
| Ene | Ratificación de líneas base con el cierre real del año anterior |
| Abr / Jul / Oct | Evaluación trimestral (T1, T2, T3): carga de resultados en 10 días hábiles, calibración breve y conversación de retroalimentación |
| Jul | Única ventana de revisión de metas |
| Ene (año siguiente) | Cierre anual = T4 acumulado, calibración completa, carga en SALAR |

---

## 5. Transición: cierre de T3 y T4 2026

Los 16 objetivos vigentes no tienen pesos ni bandas, y no es justo inventárselos a fin de año sin acordarlos. La propuesta es:

1. **Validar en la primera quincena de octubre**, con cada gerente, los pesos, bandas y metas T3/T4 propuestos en `data/objetivos_2026_transicion.json` (se importan en la herramienta desde *Datos → Importar*).
2. **Pesos de transición:** iguales dentro de cada gerencia (Comercial 33/33/34, Cadena 50/50, Operaciones 4 × 25, GTH 4 × 25; GAF, Planificación y TI 100%).
3. **Bandas de transición:** con la regla de la sección 4.4. Los objetivos de % de presupuesto quedan en 90 / 100 / 110.
4. **Proyectos medidos por % de avance** (ISO 22000, plantas, aspersión, ERP, RyR, sistema de desempeño): en 2026 se mantienen como “avance real vs. planificado”. La meta T3 propuesta (75%) **debe reemplazarse por el % planificado a septiembre según el cronograma de cada proyecto**. Desde 2027 pasan a hitos verificables.
5. **Resolver los 5 PLACEHOLDER antes de evaluar T3.** Sin línea base real, el puntaje no es defendible.
6. **T3 es formativo y T4 es el resultado anual.** T3 sirve para probar el modelo y corregir. El resultado oficial 2026 es el acumulado a diciembre.

Calendario propuesto:

| Fechas | Actividad |
|---|---|
| 7 – 16 oct | Validar pesos, bandas y metas T3/T4 |
| 12 – 23 oct | Carga de resultados T3 (acumulado a septiembre) y envío a GTH |
| 26 – 30 oct | Calibración T3 y retroalimentación |
| 4 – 22 ene 2027 | Cierre anual 2026 (T4), calibración y carga en SALAR |

---

## 6. Construcción de objetivos 2027

| Fechas | Actividad |
|---|---|
| 19 oct – 6 nov | Gerencia General define el scorecard corporativo con el presupuesto 2027 |
| 9 – 27 nov | Divisiones y gerencias proponen sus scorecards en la herramienta (estado “Propuesto”) |
| 30 nov – 11 dic | Calibración de calidad (GTH + GG) y aprobación (estado “Aprobado”) |
| Ene 2027 | Ratificación de líneas base con el real 2026 |

**Ejemplo de scorecard corporativo 2027** (ilustrativo; las cifras salen del presupuesto):

| Pilar | Indicador | Tipo | Peso |
|---|---|---|---|
| Financiera | Margen EBITDA consolidado | Indicador | 20% |
| Financiera | Ventas totales vs. presupuesto | Indicador | 15% |
| Clientes | OTIF a clientes nacionales y de exportación | Indicador | 15% |
| Clientes | Reclamos de calidad por cada 100 t despachadas | Indicador | 10% |
| Procesos | Rendimiento de faena (yield) | Indicador | 10% |
| Procesos | Puesta en marcha de la Unidad de despojos y ERP Back Office | Proyecto con hitos | 15% |
| Gente | Rotación no deseada en posiciones críticas | Indicador | 10% |
| Gente | Índice de seguridad (frecuencia de accidentes con baja) | Indicador | 5% |

Desde la herramienta, el botón **“Duplicar para el año siguiente”** copia un objetivo 2026 como borrador 2027 y toma como línea base el último valor real registrado.

---

## 7. Fuentes

- Locke, E. & Latham, G. (2002). *Building a Practically Useful Theory of Goal Setting and Task Motivation*. American Psychologist. https://home.ubalt.edu/tmitch/642/articles%20syllabus/locke%20pract%20goal%20setting%202002%20am%20psy.pdf
- Ordóñez, L., Schweitzer, M., Galinsky, A. & Bazerman, M. (2009). *Goals Gone Wild*. https://www.hks.harvard.edu/publications/goals-gone-wild-systematic-side-effects-overprescribing-goal-setting
- Balanced Scorecard Institute. *Balanced Scorecard Basics*. https://www.balancedscorecard.org/bsc-basics/
- Harvard Business School Working Knowledge. *Mapping Your Corporate Strategy*. https://www.library.hbs.edu/working-knowledge/mapping-your-corporate-strategy
- WorldatWork. *Should Your CEO Incentive Payouts Follow a Bell-Shaped Curve?* https://worldatwork.org/publications/workspan-daily/should-your-ceo-incentive-payouts-follow-a-bell-shaped-curve
- Harvard Law School Forum on Corporate Governance (2025). *Annual Incentive Plan Design and Trends*. https://corpgov.law.harvard.edu/2025/10/14/annual-incentive-plan-design-and-trends/
- Meridian Compensation Partners. *A Framework for Incentive Plan Adjustments*. https://www.meridiancp.com/insights/a-framework-for-incentive-plan-adjustments/
- Meridian Compensation Partners. *Annual Incentive Plans: The Basics*. https://www.meridiancp.com/?p=6013
- What Matters. *How to Grade and Score your OKRs*. https://www.whatmatters.com/faqs/how-to-grade-okrs
- Gartner. *3 Ways to Set Effective Performance Goals*. https://gcom.pdo.aws.gartner.com/smarterwithgartner/3-ways-to-set-effective-performance-goals
- ATD. *Reinventing Performance Management at Deloitte*. https://td.org/insights/reinventing-performance-management-at-deloitte
- Oracle Primavera. *Using weighted milestones in the WBS*. https://docs.oracle.com/cd/F25600_01/client_help/en_US/using_weighted_milestones_in_the_wbs.htm
- TeamGuru. *Hoshin Kanri guide*. https://www.teamguru.com/guides/hoshin-kanri
