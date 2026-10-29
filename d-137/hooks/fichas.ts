// Lo compartido entre sesiones, en %USERPROFILE%\.claude\coordinador: la ficha de cada sesión (<id>.json, que renueva
// cada 3 s, el latido; la que lleva 20 s sin renovarla ya no cuenta), su registro del día (registro\<id>.json: lo que
// gastó y lo que hizo, aunque se cierre) y la cuota de todas (cuota.json, que escribe una sola sesión). Las fichas de
// los mods de antes se leen igual: lo que les falta sale vacío
import type { CuotaGlobal, Ficha, Registro, Repo } from '../types'
import { porNombre } from './ajustes'

// Los personajes que se reparten entre las sesiones (26-oct): los Martys y los de reserva, con su nombre. El de dos
// cabezas (M-06) y el afro (M-07) se quitaron del todo el 28-oct: la sesión que aún tenga uno coge otro libre (sana)
export const TAGS = ['M-01', 'M-02', 'M-03', 'M-04', 'M-05', 'M-08', 'Verano', 'Liz', 'Gerardo', 'Copito', 'Terror', 'Pompis',
  'Mantequillo', 'Michi',
  // los nuevos de la iteración 7 de Diseno-Personajes que se eligieron el 28-oct
  'Poli', 'Vaquero', 'Pirata', 'Gecko', 'Ciclope', 'Toxico', 'MiniDoc', 'Astronauta', 'Pepinillo', 'Pecas', 'Ronin']
// El nombre que se ve de cada uno (26-oct: los Martys, por su nombre y no por su código); los de reserva ya se
// llaman por el suyo. El original, «Marty D-137», y los disfrazados, por lo que son, sin «Marty» delante (28-oct:
// «Astronauta», no «Marty Astronauta»)
const NOMBRES: Record<string, string> = {
  'M-01': 'Marty D-137', 'M-02': 'Azul', 'M-03': 'Evil', 'M-04': 'Mutante', 'M-05': 'Xenomarty', 'M-08': 'Martinator',
  Ciclope: 'Cíclope', Toxico: 'Tóxico', MiniDoc: 'Mini Doc',
}
export const nombreTag = (tag: string | undefined) => (tag ? NOMBRES[tag] ?? tag : '')
// Uno libre al azar, siempre el mismo para la misma sesión (sale de su id): así no salen siempre los mismos en el mismo
// orden, y una recarga no lo cambia
export function eligeTag(id: string, usados: Set<string>): string | undefined {
  const libres = TAGS.filter(t => !usados.has(t))
  if (!libres.length) return undefined
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return libres[h % libres.length]
}
const MUERTA = 20000
const OLVIDA = 10 * 60 * 1000
const NO_FICHAS = ['doc.json', 'cuota.json']

export const nombreDe = (r: string) => r.split(/[\\/]/).filter(Boolean).pop() ?? r
export const norm = (r: string) => r.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase()
const dos = (n: number) => String(n).padStart(2, '0')
// El día de un instante, en la hora del PC: «2026-10-26»
export function diaDe(ms: number): string {
  const d = new Date(ms)
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`
}

let CASA = ''
export async function casa($: any): Promise<string> {
  if (!CASA) {
    const c = (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME')) ?? '.'
    CASA = `${String(c).replace(/\\/g, '/')}/.claude`
  }
  return CASA
}
export async function carpeta($: any): Promise<string> {
  return `${await casa($)}/coordinador`
}

function completa(r: Partial<Ficha> & { id: string; tag: string; latido: number }): Ficha {
  return {
    ...r,
    nombre: r.nombre ?? r.rotulo ?? '',
    rotulo: r.propio ? r.rotulo ?? r.tag : sinTag(r.rotulo ?? r.tag),
    desde: r.desde ?? r.latido,
    estado: r.estado === 'trabajando' ? 'trabajando' : 'esperando',
    turno: r.turno ?? 0,
    paso: r.paso ?? '',
    toca: Array.isArray(r.toca) ? r.toca : [],
    decisiones: Array.isArray(r.decisiones) ? r.decisiones : [],
    archivos: Array.isArray(r.archivos) ? r.archivos : [],
    espera: r.espera ?? null,
    marcha: Array.isArray(r.marcha) ? r.marcha : [],
    acabadas: Array.isArray(r.acabadas) ? r.acabadas : [],
    gasto: typeof r.gasto === 'number' ? r.gasto : null,
    tocados: Array.isArray(r.tocados) ? r.tocados : [],
  }
}

export async function leeTodas($: any): Promise<Ficha[]> {
  const dir = await carpeta($)
  const ahora = await $.clock.now()
  let lista: { name: string; kind: string; mtimeMs: number }[] = []
  try {
    lista = await $.fs.list(dir)
  } catch {
    return []
  }
  const out: Ficha[] = []
  for (const f of lista) {
    if (f.kind !== 'file' || !f.name.endsWith('.json') || NO_FICHAS.includes(f.name)) continue
    // Queda una ficha por cada sesión que se abrió alguna vez (el motor no deja borrar): las que llevan rato sin latir
    // ni se abren
    if (ahora - f.mtimeMs > OLVIDA) continue
    try {
      const r = completa(JSON.parse(await $.fs.read(`${dir}/${f.name}`)))
      if (!r.cerrada && ahora - r.latido < MUERTA) out.push(r)
    } catch {
      // una ficha a medio escribir: se lee en el latido siguiente
    }
  }
  return out
}

export async function guarda($: any, f: Ficha) {
  await $.fs.write(`${await carpeta($)}/${f.id}.json`, JSON.stringify(f))
}

// El registro de cada sesión: los de la última semana y pico, para «Cuota» (lo de las sesiones ya cerradas, también)
export async function leeRegistros($: any): Promise<Registro[]> {
  const dir = `${await carpeta($)}/registro`
  const ahora = await $.clock.now()
  let lista: { name: string; kind: string; mtimeMs: number }[] = []
  try {
    lista = await $.fs.list(dir)
  } catch {
    return []
  }
  const out: Registro[] = []
  for (const f of lista) {
    if (f.kind !== 'file' || !f.name.endsWith('.json') || ahora - f.mtimeMs > 9 * 86400000) continue
    try {
      const r = JSON.parse(await $.fs.read(`${dir}/${f.name}`)) as Registro
      if (r && typeof r.id === 'string' && r.dias) out.push(r)
    } catch {
      // uno a medio escribir
    }
  }
  return out
}
export async function guardaRegistro($: any, r: Registro) {
  const dias = Object.keys(r.dias).sort().slice(-9)
  const limpio = { ...r, dias: Object.fromEntries(dias.map(d => [d, r.dias[d]])) }
  await $.fs.write(`${await carpeta($)}/registro/${r.id}.json`, JSON.stringify(limpio))
}
export async function leeGlobal($: any): Promise<CuotaGlobal> {
  try {
    const g = JSON.parse(await $.fs.read(`${await carpeta($)}/cuota.json`)) as CuotaGlobal
    return { dias: g.dias ?? {}, horas: g.horas ?? {}, ultimo: g.ultimo }
  } catch {
    return { dias: {}, horas: {} }
  }
}
export async function guardaGlobal($: any, g: CuotaGlobal) {
  const dias = Object.keys(g.dias).sort().slice(-42)
  const horas = Object.keys(g.horas).sort().slice(-42)
  await $.fs.write(`${await carpeta($)}/cuota.json`, JSON.stringify({
    ultimo: g.ultimo,
    dias: Object.fromEntries(dias.map(d => [d, g.dias[d]])),
    horas: Object.fromEntries(horas.map(d => [d, g.horas[d]])),
  }))
}

type DatosSesion = { name?: string; hostSessionId?: string }
// Lo que Claude Code apunta de la sesión en ~/.claude/sessions/<pid>.json (los .key de al lado no se abren): su nombre
// en la app y su id en el escritorio, con el que se abre su enlace; si hay varios de la misma sesión, el más reciente
export async function datosSesion($: any): Promise<DatosSesion> {
  const id = await $.session.id()
  const dir = `${await casa($)}/sessions`
  let out: DatosSesion = {}
  let cuando = -1
  try {
    for (const f of await $.fs.list(dir)) {
      if (f.kind !== 'file' || !f.name.endsWith('.json') || f.mtimeMs < cuando) continue
      try {
        const s = JSON.parse(await $.fs.read(`${dir}/${f.name}`)) as DatosSesion & { sessionId?: string }
        if (s.sessionId === id) {
          out = { name: s.name?.trim() || undefined, hostSessionId: s.hostSessionId }
          cuando = f.mtimeMs
        }
      } catch {
        // uno a medio escribir
      }
    }
  } catch {
    // sin carpeta de sesiones: otra versión de Claude Code
  }
  return out
}
export const enlaceDe = (hostSessionId?: string) =>
  hostSessionId ? `claude://claude.ai/epitaxy/${hostSessionId}` : undefined
// El id de escritorio de cada sesión abierta, por su id de Claude Code: sirve para abrirla o cerrarla aunque su panel
// sea de antes y su ficha no traiga el enlace (26-oct: «Sesión» no abría las que aún no había recargado)
export async function idsEscritorio($: any): Promise<Map<string, string>> {
  const dir = `${await casa($)}/sessions`
  const out = new Map<string, string>()
  try {
    for (const f of await $.fs.list(dir)) {
      if (f.kind !== 'file' || !f.name.endsWith('.json')) continue
      try {
        const s = JSON.parse(await $.fs.read(`${dir}/${f.name}`)) as { sessionId?: string; hostSessionId?: string }
        if (s.sessionId && s.hostSessionId) out.set(s.sessionId, s.hostSessionId)
      } catch {
        // uno a medio escribir
      }
    }
  } catch {
    // sin carpeta de sesiones
  }
  return out
}

// La carpeta de la sesión: la raíz del repo, su rama, cuántos archivos tiene cambiados sin commit (y cuáles, para «En
// el mismo repo») y la raíz de su worktree principal; sin git, la carpeta
export async function repoDe($: any, dir: string): Promise<{ repo: Repo; cambiados: string[] }> {
  try {
    const top = await $.process.run(['git', '-C', dir, 'rev-parse', '--show-toplevel'])
    if (top.exitCode === 0 && String(top.stdout).trim()) {
      const raiz = String(top.stdout).trim()
      const [rama, st, com] = await Promise.all([
        $.process.run(['git', '-C', raiz, 'branch', '--show-current']),
        $.process.run(['git', '-C', raiz, '-c', 'core.quotePath=false', 'status', '--porcelain']),
        $.process.run(['git', '-C', raiz, 'rev-parse', '--git-common-dir']),
      ])
      const lineas = String(st.stdout).split(/\r?\n/).filter(Boolean)
      // la carpeta .git que comparten todos sus worktrees: relativa a la raíz en el principal («.git»), absoluta en los demás
      const c = com.exitCode === 0 ? String(com.stdout).trim() : ''
      const comun = c ? norm(/^([a-z]:)?[\\/]/i.test(c) ? c : `${raiz}/${c}`) : ''
      return {
        repo: { raiz: norm(raiz), carpeta: nombreDe(raiz), rama: String(rama.stdout).trim() || undefined, sinCommit: lineas.length,
          principal: comun ? comun.replace(/\/\.git$/, '') : undefined },
        cambiados: lineas.map(l => norm(`${raiz}/${(l.slice(3).split(' -> ').pop() ?? '').replace(/^"|"$/g, '')}`)),
      }
    }
  } catch {
    // sin git
  }
  return { repo: { raiz: norm(dir), carpeta: nombreDe(dir) }, cambiados: [] }
}

const partes = (nombre: string) => nombre.split(/\s+[-–—]\s+/)
// El rótulo sin el M-xx de delante, que ya dice el dibujo («M-02 PDF» → PDF; it-11: «M-02 · M-02 PDF»)
export const sinTag = (rotulo: string) => rotulo.replace(/^M-\d+\s+(?=\S)/i, '')
// El rótulo es lo de delante del guion («PDF - Informe…» → PDF). Sin nombre propio, Claude Code llama a la
// sesión como su carpeta con un sufijo («mi-web-3», «mi-web-8a»): cuenta como la carpeta
// Sin guion («Not-02 Notas del proyecto»), el rótulo es la primera palabra y el resto va debajo, sin repetirse
// (28-oct: salía «Evil · Not-02 Notas del proyecto…» y, debajo, «Not-02 Notas del proyecto»)
// Con la dimensión por repo o por rama (ajustes.ts), el nombre entero (29-oct: lo de poner un principio a los nombres
// es una costumbre que no todos tienen)
export function rotuloDe(nombre: string, raiz: string): string {
  const area = partes(nombre)[0]?.trim() || nombre
  if (!area || area.replace(/-[0-9a-f]{1,8}$/i, '') === raiz) return raiz
  if (!porNombre()) return sinTag(nombre.trim())
  const r = sinTag(area)
  return partes(nombre).length > 1 ? r : r.split(/\s+/)[0] ?? r
}
// Lo que va detrás del rótulo: el nombre de la sesión sin su área (o sin su primera palabra); si no hay nada más, nada.
// Con la dimensión por repo o por rama, el nombre entero, que arriba solo va el personaje
export function restoDe(f: Ficha): string {
  if (f.propio || !porNombre()) return f.nombre
  const p = partes(f.nombre)
  return p.length > 1 ? p.slice(1).join(' - ') : sinTag(f.nombre.trim()).split(/\s+/).slice(1).join(' ')
}
// Cómo se nombra una sesión al copiarla: el personaje con su rótulo y el resto del nombre; con el nombre entero de
// rótulo, el personaje y el nombre, sin repetirlo
export const nombreCompleto = (f: Ficha) =>
  (porNombre() ? [`${nombreTag(f.tag)} ${f.rotulo}`, restoDe(f)] : [nombreTag(f.tag), f.nombre || f.rotulo]).filter(Boolean).join(' · ')

// Dos sesiones que arrancan a la vez pueden quedarse con el mismo Marty: se lo queda la que llegó antes, y la otra coge
// uno libre en el latido siguiente. Lo mismo la que tenga uno que ya no está entre los que se reparten
export function sana(r: Ficha, todas: Ficha[]): Ficha {
  const otras = todas.filter(x => x.id !== r.id)
  const previas = otras.filter(x => x.desde < r.desde || (x.desde === r.desde && x.id < r.id))
  if (TAGS.includes(r.tag) && !previas.some(x => x.tag === r.tag)) return r
  const usados = new Set(otras.map(x => x.tag))
  const tag = eligeTag(r.id, usados)
  return tag ? { ...r, tag } : r
}
