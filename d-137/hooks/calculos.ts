// Las cuentas de la cuota, sin dibujar nada. Claude Code solo da el % de la semana y de las 5 horas de la cuenta entera;
// lo de cada sesión sale de lo que cuesta cada una (el coste en dólares que lleva su motor): el % de un día, repartido
// según lo que costó cada sesión ese día. Con varias sesiones a la vez, restar el % de antes y el de después contaría lo
// de todas en cada una
import type { CuotaGlobal, Cuota, Ficha, Lectura, Registro } from '../types'
import { diaDe } from './fichas'

const DIA = 86400000
const SEMANA = 7 * DIA

// Lo gastado un día, en % de la semana: lo del final menos lo del principio, más lo de antes de una renovación
export function usoDia(g: CuotaGlobal, dia: string): number | null {
  const d = g.dias[dia]
  if (!d) return null
  return Math.max(0, d.fin - d.ini) + (d.antes ?? 0)
}

// Cuántos puntos de la semana vale un dólar, con lo de los últimos siete días que tienen las dos cosas (el % del día y
// lo que costaron las sesiones); con muy poco gasto todavía, nada
export function puntosPorDolar(g: CuotaGlobal, registros: Registro[], ahora: number): number | null {
  let pct = 0
  let usd = 0
  for (let i = 0; i < 7; i += 1) {
    const dia = diaDe(ahora - i * DIA)
    const p = usoDia(g, dia)
    const u = registros.reduce((s, r) => s + (r.dias[dia]?.usd ?? 0), 0)
    if (p === null || u <= 0) continue
    pct += p
    usd += u
  }
  return usd >= 0.5 && pct > 0 ? pct / usd : null
}

const fechaDe = (iso?: string) => {
  const t = iso ? Date.parse(iso) : NaN
  return Number.isNaN(t) ? null : t
}
// Dos lecturas son de la misma ventana si se renuevan a la misma hora (con dos horas de margen)
export const mismaVentana = (a?: string, b?: string) => {
  const x = fechaDe(a)
  const y = fechaDe(b)
  return x !== null && y !== null && Math.abs(x - y) < 2 * 3600000
}

// La semana de la cuota: cuándo empezó y cuándo se renueva. Sale de la renovación que dijo Claude Code, en la última
// respuesta de esta sesión o en la de todas, llevada a esta semana de siete en siete días (se renueva siempre a la misma
// hora); si nunca la ha dicho, los lunes a las 0:00
export function ventanaSemana(cuota: Cuota, g: CuotaGlobal, ahora: number): { inicio: number; fin: number } {
  const conocida = fechaDe(cuota.semana?.resetsAt) ?? fechaDe(g.ultimo?.resetsAt)
  if (conocida !== null) {
    const fin = conocida > ahora ? conocida : conocida + (Math.floor((ahora - conocida) / SEMANA) + 1) * SEMANA
    return { inicio: fin - SEMANA, fin }
  }
  const ini = new Date(ahora)
  ini.setHours(0, 0, 0, 0)
  ini.setDate(ini.getDate() - ((ini.getDay() + 6) % 7))
  const fin = new Date(ini)
  fin.setDate(fin.getDate() + 7)
  return { inicio: ini.getTime(), fin: fin.getTime() }
}
// El % de la semana de una lectura, si es de la semana de ahora: una que se renovaba antes de ahora ya no vale (tras
// renovarse, la sesión que aún no ha vuelto a preguntar seguía diciendo el 94 % de la semana pasada)
export const deEstaSemana = (v: { pct: number; resetsAt?: string } | undefined, fin: number) =>
  v && (!v.resetsAt || mismaVentana(v.resetsAt, new Date(fin).toISOString())) ? v.pct : undefined

// Lo gastado por una sesión desde un momento, en dólares o en tokens: los días enteros de después y, del día de ese
// momento, sus horas desde la suya (desde las 0:00, el día entero). Un día sin horas, de antes del 28-oct, no cuenta
// cuando es el del corte: no se sabe qué fue antes y qué después
export function gastadoDesde(r: Registro, que: 'usd' | 'tok', desde: number): number {
  const dia0 = diaDe(desde)
  const h0 = new Date(desde).getHours()
  let s = 0
  for (const [dia, x] of Object.entries(r.dias)) {
    if (dia < dia0) continue
    if (dia > dia0 || h0 === 0) s += que === 'usd' ? x.usd : x.tok ?? 0
    else s += (que === 'usd' ? x.usdH : x.tokH)?.slice(h0).reduce((a, b) => a + (b ?? 0), 0) ?? 0
  }
  return s
}

// La lectura más nueva de todas las sesiones: la ventana que se renueva más tarde y, en ella, el % más alto (el uso
// solo crece dentro de una ventana)
export function mejorLectura(lecturas: Lectura[]): { semana?: number; renueva?: string; horas?: number } {
  let semana: number | undefined
  let renueva: string | undefined
  let horas: number | undefined
  let renuevaH: string | undefined
  for (const l of lecturas) {
    if (typeof l.semana === 'number') {
      const t = fechaDe(l.renuevaSemana) ?? 0
      const ya = fechaDe(renueva) ?? 0
      if (semana === undefined || t > ya + 2 * 3600000) {
        semana = l.semana
        renueva = l.renuevaSemana
      } else if (Math.abs(t - ya) <= 2 * 3600000) semana = Math.max(semana, l.semana)
    }
    if (typeof l.horas === 'number') {
      const t = fechaDe(l.renuevaHoras) ?? 0
      const ya = fechaDe(renuevaH) ?? 0
      if (horas === undefined || t > ya + 1800000) {
        horas = l.horas
        renuevaH = l.renuevaHoras
      } else if (Math.abs(t - ya) <= 1800000) horas = Math.max(horas, l.horas)
    }
  }
  return { semana, renueva, horas }
}

// La sesión que lleva la cuota de todas: la que llegó antes de las que van con este panel
export const llevaLaCuota = (yo: Ficha, todas: Ficha[]) =>
  todas.filter(f => f.v === 2).every(f => f.id === yo.id || f.desde > yo.desde || (f.desde === yo.desde && f.id > yo.id))

// Apunta la lectura nueva en la cuota de todas: el día y lo gastado en cada hora
export function apunta(g: CuotaGlobal, pct: number, renueva: string | undefined, ahora: number): CuotaGlobal {
  const hoy = diaDe(ahora)
  const hora = new Date(ahora).getHours()
  const dias = { ...g.dias }
  const horas = { ...g.horas }
  const u = g.ultimo
  if (!u) {
    dias[hoy] = { ini: pct, fin: pct }
    return { dias, horas, ultimo: { pct, cuando: ahora, resetsAt: renueva } }
  }
  const misma = mismaVentana(u.resetsAt, renueva) || (!u.resetsAt && !renueva)
  if (misma && pct < u.pct) return g
  const dia = dias[hoy] ?? { ini: misma ? u.pct : 0, fin: misma ? u.pct : 0 }
  let delta = 0
  if (misma) {
    delta = pct - u.pct
    dias[hoy] = { ...dia, fin: pct }
  } else {
    // la ventana se renovó: lo de antes queda aparte y se cuenta desde cero
    delta = pct
    dias[hoy] = { ini: 0, fin: pct, antes: (dia.antes ?? 0) + Math.max(0, dia.fin - dia.ini) }
  }
  if (delta > 0) {
    const fila = (horas[hoy] ?? Array.from({ length: 24 }, () => 0)).slice()
    fila[hora] = Math.round(((fila[hora] ?? 0) + delta) * 10) / 10
    horas[hoy] = fila
  }
  return { dias, horas, ultimo: { pct, cuando: ahora, resetsAt: renueva } }
}

// La semana día a día, de lunes a domingo (26-oct: «la semana siempre empieza en lunes»): lo gastado en cada
// día, la media de ese día de la semana en las cuatro anteriores y, en los que faltan, lo que tocaría para acabar cerca
// del 100 %: hasta que la cuota se renueva, lo que queda entre los días que quedan; desde entonces, la ventana nueva a
// partes iguales. `renueva`, el día en que empieza una ventana (la raya de «se renueva»)
export type DiaSemana = { dia: string; nombre: string; valor: number | null; media: number | null; toca: number | null; hoy: boolean; renueva: boolean }
const NOMBRES = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
export function semanaDiaADia(g: CuotaGlobal, cuota: Cuota, ahora: number): DiaSemana[] {
  const fin = fechaDe(cuota.semana?.resetsAt) ?? ahora + DIA
  const hoy = diaDe(ahora)
  const usado = cuota.semana?.pct ?? 0
  const ventana: string[] = []
  for (let i = 0; i < 7; i += 1) ventana.push(diaDe(fin - SEMANA + 3600000 + i * DIA))
  const quedan = ventana.filter(d => d > hoy).length
  const toca = quedan > 0 ? Math.max(0, 100 - usado) / quedan : null
  const cambios = new Set([diaDe(fin - SEMANA), diaDe(fin)])
  const mediodia = new Date(`${hoy}T12:00:00`)
  const lunes = mediodia.getTime() - ((mediodia.getDay() + 6) % 7) * DIA
  const dias: string[] = []
  for (let i = 0; i < 7; i += 1) dias.push(diaDe(lunes + i * DIA))
  return dias.map(d => {
    const fecha = new Date(`${d}T12:00:00`)
    const previos: number[] = []
    for (let k = 1; k <= 4; k += 1) {
      const v = usoDia(g, diaDe(fecha.getTime() - k * SEMANA))
      if (v !== null) previos.push(v)
    }
    return {
      dia: d,
      nombre: NOMBRES[fecha.getDay()] ?? '',
      valor: d <= hoy ? usoDia(g, d) : null,
      media: previos.length ? previos.reduce((s, v) => s + v, 0) / previos.length : null,
      toca: d <= hoy ? null : ventana.includes(d) ? toca : 100 / 7,
      hoy: d === hoy,
      renueva: cambios.has(d),
    }
  })
}

// Si vas por delante o por detrás de lo que tocaría a estas alturas de la semana (en línea recta hasta el 100 %)
export function ritmo(cuota: Cuota, ahora: number): number | null {
  const fin = fechaDe(cuota.semana?.resetsAt)
  if (fin === null || typeof cuota.semana?.pct !== 'number') return null
  const pasado = Math.min(1, Math.max(0, (ahora - (fin - SEMANA)) / SEMANA))
  return pasado * 100 - cuota.semana.pct
}

// Lo de cada sesión en la semana y hoy, en dólares y en tokens (el % sale al dibujar, con lo que vale cada dólar). Solo
// las que han gastado algo desde que se renovó la semana: las demás desaparecen, y vuelven en cuanto se usan
// (28-oct). Lo de hoy, desde que empezó la semana si se renovó hoy. Cada sesión apunta lo suyo a medida que gasta, así
// que lo de la tarea en curso ya va dentro
export type PorSesion = { id: string; tag: string; rotulo: string; usdHoy: number; usdSemana: number; tokHoy: number; tokSemana: number }
export function porSesion(registros: Registro[], fichas: Ficha[], inicio: number, ahora: number): PorSesion[] {
  const cero = new Date(ahora)
  cero.setHours(0, 0, 0, 0)
  const hoy = Math.max(inicio, cero.getTime())
  const vivas = new Map(fichas.map(f => [f.id, f]))
  return registros
    .map(r => {
      const f = vivas.get(r.id)
      return {
        id: r.id, tag: f?.tag ?? r.tag, rotulo: f?.rotulo ?? r.rotulo,
        usdHoy: gastadoDesde(r, 'usd', hoy), usdSemana: gastadoDesde(r, 'usd', inicio),
        tokHoy: gastadoDesde(r, 'tok', hoy), tokSemana: gastadoDesde(r, 'tok', inicio),
      }
    })
    .filter(x => x.usdSemana > 0 || x.tokSemana > 0)
    .sort((a, b) => b.usdHoy - a.usdHoy || b.usdSemana - a.usdSemana)
}

// Cuándo lo usas: lo gastado en cada hora, una cifra por celda, sin partirlas en dos (28-oct: «los medios
// bloques al final no me sirven de nada»). Con «Esta semana», plegado, la media de los días entre semana y la del finde
// de esta semana (de lunes a hoy) y, desplegado, lo de cada día; con «Media», la de los días de las cuatro semanas de
// antes, entre semana y en finde o, desplegado, la de cada día de la semana. Hoy, en los dos, lo de hoy, que no es una
// media. Sin datos (un día que aún no ha llegado), null
export type FilaHoras = { nombre: string; valores: number[] | null; fuerte?: boolean }
const finde = (d: Date) => d.getDay() === 0 || d.getDay() === 6
const ceros = () => Array.from({ length: 24 }, () => 0)
// La media de cada hora entre los días con datos; de hoy, solo las horas que ya han pasado: las que faltan aún no han
// llegado, y contarlas como cero bajaría la media de la tarde a mitad del día
function mediaDe(g: CuotaGlobal, dias: string[], ahora: number): number[] {
  const hoy = diaDe(ahora)
  const hora = new Date(ahora).getHours()
  return ceros().map((_, h) => {
    const filas = dias.filter(d => !(d === hoy && h > hora)).map(d => g.horas[d]).filter((x): x is number[] => Array.isArray(x))
    return filas.length ? filas.reduce((s, f) => s + (f[h] ?? 0), 0) / filas.length : 0
  })
}
export function horasDe(g: CuotaGlobal, ahora: number, abierto: boolean, media: boolean): FilaHoras[] {
  const hoyD = new Date(ahora)
  const hoy = diaDe(ahora)
  const deHoy = g.horas[hoy] ?? ceros()
  const atras = Array.from({ length: 28 }, (_, i) => new Date(ahora - (i + 1) * DIA))
  const lunes = new Date(ahora - ((hoyD.getDay() + 6) % 7) * DIA)
  const semana = Array.from({ length: 7 }, (_, i) => new Date(lunes.getTime() + i * DIA))
  const deSemana = (d: Date) => diaDe(d.getTime())
  if (!abierto) {
    const entre = media ? atras.filter(d => !finde(d)).map(deSemana) : semana.filter(d => !finde(d) && deSemana(d) <= hoy).map(deSemana)
    const fin = media ? atras.filter(finde).map(deSemana) : semana.filter(d => finde(d) && deSemana(d) <= hoy).map(deSemana)
    return [
      { nombre: 'Entre semana', valores: entre.length ? mediaDe(g, entre, ahora) : null },
      { nombre: 'Finde', valores: fin.length ? mediaDe(g, fin, ahora) : null },
      { nombre: 'Hoy', valores: deHoy, fuerte: true },
    ]
  }
  // con «Media», la de ese día de la semana en las cuatro de antes de hoy, como la de los plegados
  return semana.map(d => {
    const dia = deSemana(d)
    const valores = dia === hoy ? deHoy
      : media ? mediaDe(g, atras.filter(x => x.getDay() === d.getDay()).map(deSemana), ahora)
        : dia < hoy ? g.horas[dia] ?? ceros() : null
    return { nombre: NOMBRES[d.getDay()] ?? '', valores, fuerte: dia === hoy }
  })
}
