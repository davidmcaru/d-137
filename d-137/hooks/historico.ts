// El histórico (1-nov: que lo gastado no se pierda al borrar una sesión y poder verlo mes a mes): lo de cada sesión,
// día a día y sin caducar, en d-137/historico/<id>.json. El registro solo recuerda nueve días y borrar una sesión
// se lleva sus transcripciones; esto se queda. Cada sesión guarda lo suyo al leer sus transcripciones, y las que no pueden
// (las de antes de esto, las borradas) las lee o las saca de su registro la que lleva la cuota (register.tsx). Aquí, sin
// dibujar nada, lo que se guarda y las cuentas
import type { Cuenta, DiaHistorico, DiaRegistro, Historico, Registro, TotalesHistorico } from '../types'
import { diaDe } from './fichas'
import type { Analisis } from './sesion'

const suma = (l: number[]) => l.reduce((s, x) => s + x, 0)
// Lo que no baja aunque ya no se pueda leer todo: si se borra la sesión de la que sigue esta, lo suyo se queda
const NO_BAJAN = ['peso', 'tok', 'activa', 'maxT', 'maxTok', 'maxPeso'] as const

// Lo que falta para un total, repartido por lo que pesa cada día: entre los días sin dato o, si todos lo tienen, entre todos
function reparte(dias: DiaHistorico[], campo: 'tok' | 'activa' | 'archivos', total: number) {
  const falta = total - suma(dias.map(x => x[campo]))
  if (falta <= 0 || !dias.length) return
  const sin = dias.filter(x => x[campo] <= 0)
  const base = sin.length ? sin : dias
  const peso = suma(base.map(x => x.peso))
  for (const x of base) x[campo] += peso > 0 ? (falta * x.peso) / peso : falta / base.length
}

// Lo de una sesión, día a día: de sus transcripciones (con las de las que sigue) y de su registro. Sin transcripción (una
// sesión borrada antes de que existiera esto), lo que quedó en su registro: los días que recuerda y lo de toda la sesión
// repartido entre ellos. El coste de cada día es su parte del de la sesión, por lo que pesa: el de la sesión es el de
// Claude Code, que cuadra con lo que pesa (unos 2,6 $ por millón), y lo apuntado por días no siempre: hasta el 1-nov se
// contaba otra vez al reabrir una sesión, y no recuerda más de nueve. Sin ningún coste (una sesión que
// no llegó a tener el mod), todo a cero: sale al sumar, de lo que pesa
export function historicoDe(previo: Historico | null, an: Analisis, r: Registro | null, o: {
  id: string; nombre?: string; fin: number; leido?: number; sigue?: string[]; archivos?: Map<string, number>
}): Historico {
  const dias: Record<string, DiaHistorico> = {}
  const de = (d: string) => dias[d] ?? (dias[d] = { usd: 0, peso: 0, tok: 0, activa: 0, maxT: 0, maxTok: 0, maxPeso: 0, archivos: 0 })
  for (const [d, x] of Object.entries(an.dias)) Object.assign(de(d), x)
  for (const tr of an.tramos) {
    const x = de(diaDe(tr.desde))
    const dura = Math.max(0, tr.hasta - tr.desde)
    x.activa += dura
    x.maxT = Math.max(x.maxT, dura)
    x.maxTok = Math.max(x.maxTok, tr.tok)
    x.maxPeso = Math.max(x.maxPeso, tr.peso)
  }
  const s = r?.sesion
  if (!Object.keys(dias).length && r) {
    const valor = (x: DiaRegistro) => x.usd || x.tok || 0
    const todo = suma(Object.values(r.dias).map(valor))
    for (const [d, x] of Object.entries(r.dias)) {
      Object.assign(de(d), { tok: x.tok ?? 0, peso: s && todo > 0 ? (s.peso * valor(x)) / todo : valor(x) })
    }
    const mayor = Object.values(dias).sort((a, b) => b.peso - a.peso)[0]
    if (s && mayor) Object.assign(mayor, { maxT: s.maxT, maxTok: s.maxTok, maxPeso: s.maxPeso })
  }
  for (const [d, x] of Object.entries(previo?.dias ?? {})) {
    const y = de(d)
    for (const k of NO_BAJAN) y[k] = Math.max(y[k], x[k])
  }
  // los archivos, en el día en que se tocó cada uno; lo guardado se queda si era más (una transcripción que ya no está)
  const cuando = o.archivos ? [...o.archivos.values()] : Object.values(an.editados)
  const antes = Object.values(previo?.dias ?? {})
  if (cuando.length >= suma(antes.map(x => x.archivos))) for (const t of cuando) de(diaDe(t)).archivos += 1
  else for (const [d, x] of Object.entries(previo?.dias ?? {})) de(d).archivos = x.archivos
  const lista = Object.values(dias)
  if (s) {
    reparte(lista, 'tok', s.tok)
    reparte(lista, 'activa', s.activa)
    reparte(lista, 'archivos', s.archivos)
  }
  const apuntado = suma(Object.values(r?.dias ?? {}).map(x => x.usd))
  const coste = Math.max(typeof r?.visto === 'number' ? Math.max(r.visto, r.alto ?? 0) : apuntado, suma(antes.map(x => x.usd)))
  const peso = suma(lista.map(x => x.peso))
  for (const x of lista) x.usd = peso > 0 ? (coste * x.peso) / peso : 0
  const inicios = [an.inicio, s?.inicio, previo?.inicio].filter((x): x is number => typeof x === 'number' && x > 0)
  const sigue = [...new Set([...(previo?.sigue ?? []), ...(o.sigue ?? [])])]
  return {
    id: o.id,
    nombre: o.nombre || r?.nombre || an.titulo || previo?.nombre || o.id.slice(0, 8),
    inicio: inicios.length ? Math.min(...inicios) : o.fin,
    fin: Math.max(o.fin, previo?.fin ?? 0),
    dias,
    leido: Math.max(o.leido ?? 0, previo?.leido ?? 0),
    ...(sigue.length ? { sigue } : {}),
  }
}

const costeDe = (h: Historico) => suma(Object.values(h.dias).map(x => x.usd))
const pesoDe = (h: Historico) => suma(Object.values(h.dias).map(x => x.peso))
// Las que cuentan: las que gastaron algo, sin las seguidas: una sesión que sigue de otra ya trae lo de aquella, también su
// coste (la app lo arrastra de una a otra)
const cuentan = (hs: Historico[]) => {
  const seguidas = new Set(hs.flatMap(h => h.sigue ?? []))
  return hs.filter(h => !seguidas.has(h.id.toLowerCase()) && Object.values(h.dias).some(x => x.tok > 0 || x.usd > 0))
}
// El tiempo que estuvo abierta dentro de un mes
function enElMes(desde: number, hasta: number, mes: string) {
  const [a = 0, m = 1] = mes.split('-').map(Number)
  return Math.max(0, Math.min(hasta, new Date(a, m, 1).getTime()) - Math.max(desde, new Date(a, m - 1, 1).getTime()))
}

// Lo de cada mes, del más viejo al más nuevo, con las sesiones que trabajaron en él de la que más costó a la que menos. El
// coste de las sesiones sin él sale de lo que pesa lo suyo, a lo que vale el peso en las demás: unos 2,6 $ por millón
export type EnMes = { id: string; nombre: string; usd: number; tok: number; activa: number; archivos: number; estimado: boolean }
export type Mes = Cuenta & { mes: string; sesiones: EnMes[] }
export function mesesDe(todas: Historico[], ahora: number, vivas: Set<string>): Mes[] {
  const hs = cuentan(todas)
  const conCoste = hs.filter(h => costeDe(h) > 0)
  const precio = suma(conCoste.map(costeDe)) / (suma(conCoste.map(pesoDe)) || 1)
  const meses = new Map<string, Mes>()
  for (const h of hs) {
    const coste = costeDe(h)
    const estimado = coste <= 0
    const porPeso = estimado ? precio : coste / (pesoDe(h) || 1)
    const suyos = new Map<string, EnMes>()
    for (const [dia, x] of Object.entries(h.dias)) {
      const mes = dia.slice(0, 7)
      const m = meses.get(mes) ?? { mes, abierta: 0, activa: 0, maxT: 0, usd: 0, maxUsd: 0, tok: 0, maxTok: 0, archivos: 0, estimado: false, sesiones: [] }
      meses.set(mes, m)
      const e = suyos.get(mes) ?? { id: h.id, nombre: h.nombre, usd: 0, tok: 0, activa: 0, archivos: 0, estimado }
      suyos.set(mes, e)
      const usd = estimado ? x.peso * precio : x.usd
      for (const c of [m, e]) {
        c.usd += usd
        c.tok += x.tok
        c.activa += x.activa
        c.archivos += x.archivos
      }
      m.maxT = Math.max(m.maxT, x.maxT)
      m.maxTok = Math.max(m.maxTok, x.maxTok)
      m.maxUsd = Math.max(m.maxUsd, x.maxPeso * porPeso)
      if (estimado && usd > 0) m.estimado = true
    }
    for (const [mes, e] of suyos) meses.get(mes)?.sesiones.push(e)
  }
  for (const h of hs) {
    const hasta = vivas.has(h.id) ? ahora : h.fin
    for (const m of meses.values()) m.abierta += enElMes(h.inicio, hasta, m.mes)
  }
  for (const m of meses.values()) m.sesiones.sort((a, b) => b.usd - a.usd)
  return [...meses.values()].sort((a, b) => a.mes.localeCompare(b.mes))
}

// Lo de este mes, del día 1 a hoy: lo que enseña la ficha de Doc (3-nov: lo de todos los meses, solo en el informe)
export function esteMes(todas: Historico[], ahora: number, vivas: Set<string>): TotalesHistorico {
  const d = new Date(ahora)
  const desde = new Date(d.getFullYear(), d.getMonth(), 1).getTime()
  const m = mesesDe(todas, ahora, vivas).find(x => x.mes === diaDe(ahora).slice(0, 7))
  if (!m) return { n: 0, desde, abierta: 0, activa: 0, maxT: 0, usd: 0, maxUsd: 0, tok: 0, maxTok: 0, archivos: 0, estimado: false }
  const { mes: _mes, sesiones, ...cuenta } = m
  return { ...cuenta, n: sesiones.length, desde }
}

// Lo de esta semana de la cuota, desde que se renovó hasta ahora: los días
// enteros, del histórico; el de la renovación, solo desde su hora, en la parte de sus
// dólares (o, si no, de sus tokens) que el registro apunta hora a hora (usdH y tokH, de los últimos nueve días) y, sin
// horas, en la parte del día que queda. Lo más largo de ese día solo cuenta si la mayor parte fue después
export function estaSemana(todas: Historico[], registros: Registro[], desde: number, ahora: number, vivas: Set<string>): TotalesHistorico {
  const hs = cuentan(todas)
  const conCoste = hs.filter(h => costeDe(h) > 0)
  const precio = suma(conCoste.map(costeDe)) / (suma(conCoste.map(pesoDe)) || 1)
  const dia0 = diaDe(desde)
  const hora0 = new Date(desde).getHours()
  const hoy = diaDe(ahora)
  const regs = new Map(registros.map(r => [r.id.toLowerCase(), r]))
  const porHoras = (l?: number[]) => {
    const todo = suma(l ?? [])
    return l && todo > 0 ? suma(l.slice(hora0)) / todo : null
  }
  const t: TotalesHistorico = {
    n: 0, desde, abierta: 0, activa: 0, maxT: 0, usd: 0, maxUsd: 0, tok: 0, maxTok: 0, archivos: 0, estimado: false,
  }
  for (const h of hs) {
    const coste = costeDe(h)
    const estimado = coste <= 0
    const porPeso = estimado ? precio : coste / (pesoDe(h) || 1)
    let suyo = 0
    for (const [dia, x] of Object.entries(h.dias)) {
      if (dia < dia0 || dia > hoy) continue
      const r = dia === dia0 ? regs.get(h.id.toLowerCase())?.dias[dia] : undefined
      const parte = dia === dia0 ? porHoras(r?.usdH) ?? porHoras(r?.tokH) ?? Math.max(0, 24 - hora0) / 24 : 1
      if (parte <= 0) continue
      const usd = (estimado ? x.peso * precio : x.usd) * parte
      t.usd += usd
      t.tok += x.tok * parte
      t.activa += x.activa * parte
      t.archivos += x.archivos * parte
      suyo += usd + x.tok * parte
      if (parte >= 0.5) {
        t.maxT = Math.max(t.maxT, x.maxT)
        t.maxTok = Math.max(t.maxTok, x.maxTok)
        t.maxUsd = Math.max(t.maxUsd, x.maxPeso * porPeso)
      }
      if (estimado && usd > 0) t.estimado = true
    }
    if (suyo > 0) {
      t.n += 1
      const hasta = vivas.has(h.id) ? ahora : h.fin
      t.abierta += Math.max(0, Math.min(hasta, ahora) - Math.max(h.inicio, desde))
    }
  }
  return t
}

// Todo sumado: lo que encabeza el informe
export function totalesDe(todas: Historico[], ahora: number, vivas: Set<string>): TotalesHistorico | null {
  const meses = mesesDe(todas, ahora, vivas)
  if (!meses.length) return null
  const hs = cuentan(todas)
  const total = (k: 'abierta' | 'activa' | 'usd' | 'tok' | 'archivos') => suma(meses.map(m => m[k]))
  const mayor = (k: 'maxT' | 'maxUsd' | 'maxTok') => Math.max(...meses.map(m => m[k]))
  return {
    n: hs.length, desde: Math.min(...hs.map(h => h.inicio)), abierta: total('abierta'), activa: total('activa'), usd: total('usd'),
    tok: total('tok'), archivos: total('archivos'), maxT: mayor('maxT'), maxUsd: mayor('maxUsd'), maxTok: mayor('maxTok'),
    estimado: meses.some(m => m.estimado),
  }
}
