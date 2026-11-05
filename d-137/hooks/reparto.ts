// El personaje de cada sesión, guardado por su código (5-nov-2026: una misma sesión cambiaba de personaje de un día para otro). Hasta
// entonces salía de su id entre los libres al abrirla, y la app vuelve a abrir una sesión con otro id: cambiaba de un día
// para otro. Ahora cada sesión guarda el suyo en d-137/personajes/<clave>.json, un archivo por sesión que solo escribe
// ella. La clave es el código de su enlace en la app (claude://claude.ai/epitaxy/local_…), que no cambia aunque la app la
// vuelva a abrir con otro id; fuera de la app, su id. A una sesión nueva le toca uno al azar entre los menos usados por
// las sesiones que existen, también las archivadas; al borrar una, el suyo queda libre. Se cambia con el selector
// (selector.tsx), que dice cuántas sesiones tiene cada uno
import type { Asignado, Reparto } from '../types'
import { carpeta, NO_FICHAS, TAGS } from './fichas'
import { sesionesEnDisco } from './tokens'

export const DIR_REPARTO = 'personajes'
export async function dirReparto($: any): Promise<string> {
  return `${await carpeta($)}/${DIR_REPARTO}`
}
// El nombre del archivo de una sesión: su clave, sin lo que no cabe en un nombre de archivo
const archivoDe = (clave: string) => `${clave.replace(/[^\w.-]/g, '_')}.json`

function valido(x: unknown, clave?: string): Asignado | null {
  const a = x as Partial<Asignado> | null
  if (!a || typeof a.clave !== 'string' || typeof a.tag !== 'string' || (clave !== undefined && a.clave !== clave)) return null
  return {
    clave: a.clave, tag: a.tag, desde: typeof a.desde === 'number' ? a.desde : 0, ids: Array.isArray(a.ids) ? a.ids.map(String) : [],
    ...(typeof a.elegido === 'number' ? { elegido: a.elegido } : {}), ...(typeof a.nombre === 'string' ? { nombre: a.nombre } : {}),
  }
}
export async function leeAsignado($: any, clave: string): Promise<Asignado | null> {
  try {
    return valido(JSON.parse(await $.fs.read(`${await dirReparto($)}/${archivoDe(clave)}`)), clave)
  } catch {
    return null
  }
}
export async function guardaAsignado($: any, a: Asignado) {
  await $.fs.write(`${await dirReparto($)}/${archivoDe(a.clave)}`, JSON.stringify(a))
}
// Los de todas las sesiones que han tenido uno, existan o no
export async function leeAsignados($: any): Promise<Asignado[]> {
  const dir = await dirReparto($)
  let lista: { name: string; kind: string }[] = []
  try {
    lista = await $.fs.list(dir)
  } catch {
    return []
  }
  const out: Asignado[] = []
  for (const f of lista) {
    if (f.kind !== 'file' || !f.name.endsWith('.json')) continue
    try {
      const a = valido(JSON.parse(await $.fs.read(`${dir}/${f.name}`)))
      if (a) out.push(a)
    } catch {
      // uno a medio escribir: el latido siguiente lo lee entero
    }
  }
  return out
}

// Las sesiones que existen en la app, también las archivadas, con su nombre: la lista de la propia app
// (ccd_session_mgmt, la que no trae la sesión que pregunta). Fuera de la app, o si no contesta, null
export async function sesionesDeLaApp($: any): Promise<Map<string, string> | null> {
  try {
    const r = await $.mcp.call('ccd_session_mgmt', 'list_sessions', { include_archived: true, limit: 1000 })
    if (!r || r.isError) return null
    const texto = ((r.content ?? []) as { type?: string; text?: string }[]).map(c => c.text ?? '').join('')
    const lista = JSON.parse(texto) as unknown
    if (!Array.isArray(lista)) return null
    const out = new Map<string, string>()
    for (const s of lista as { sessionId?: unknown; title?: unknown }[]) {
      if (typeof s?.sessionId === 'string') out.set(s.sessionId, typeof s.title === 'string' ? s.title : '')
    }
    return out
  } catch {
    return null
  }
}

// Cuántas sesiones tienen cada personaje: las que existen (las de la app, también las archivadas; sin la app, las que aún
// tienen su transcripción en el disco) y esta, aunque la app no la cuente
export function repartoDe(asignados: Asignado[], o: { app: Map<string, string> | null; enDisco?: Set<string>; yo?: string; ahora: number }): Reparto {
  const existe = (a: Asignado) => a.clave === o.yo
    || (o.app ? o.app.has(a.clave) : !!o.enDisco && (o.enDisco.has(a.clave) || a.ids.some(i => o.enDisco?.has(i))))
  const cuentas: Record<string, number> = {}
  for (const a of asignados) if (TAGS.includes(a.tag) && existe(a)) cuentas[a.tag] = (cuentas[a.tag] ?? 0) + 1
  return { cuentas, cuando: o.ahora }
}
// Los ids de las sesiones que aún tienen su transcripción, para cuando no se puede preguntar a la app
export async function idsEnDisco($: any, casa: string): Promise<Set<string>> {
  return new Set((await sesionesEnDisco($, casa)).map(s => s.id))
}
// Lo mismo, guardado unos minutos (revisión del 5-nov: con el selector abierto, sin la app, se volvía a listar cada 30 s).
// Se lista antes si en el reparto aparece otra sesión que no estaba la vez anterior, para que cuente; la de esta sesión,
// que cuenta siempre, no
const DISCO_VALE = 5 * 60_000
let enDiscoGuardado: { ids: Set<string>; claves: Set<string>; cuando: number } | null = null
export async function idsEnDiscoGuardados($: any, casa: string, asignados: Asignado[], yo: string | null, ahora: number):
  Promise<Set<string>> {
  const antes = enDiscoGuardado
  // y antes también si una sesión de hace menos de cinco minutos aún no estaba (su transcripción llega con su primer
  // mensaje, después de apuntar su personaje)
  const falta = (a: Asignado) => !antes?.ids.has(a.clave) && !a.ids.some(i => antes?.ids.has(i))
  if (antes && ahora - antes.cuando <= DISCO_VALE &&
    asignados.every(a => a.clave === yo || (antes.claves.has(a.clave) && !(falta(a) && ahora - a.desde < DISCO_VALE)))) {
    return antes.ids
  }
  const ids = await idsEnDisco($, casa)
  enDiscoGuardado = { ids, claves: new Set(asignados.map(a => a.clave)), cuando: ahora }
  return ids
}

// Uno al azar entre los menos usados (5-nov): primero entre los que no tiene ninguna sesión; cuando ya los tienen
// todos, entre los que tienen uno, y así
export function menosUsado(cuentas: Record<string, number>, azar: () => number = Math.random): string {
  const min = Math.min(...TAGS.map(t => cuentas[t] ?? 0))
  const libres = TAGS.filter(t => (cuentas[t] ?? 0) === min)
  return libres[Math.min(libres.length - 1, Math.floor(azar() * libres.length))] ?? TAGS[0] ?? 'M-01'
}

// Las sesiones que ya existen se quedan con el que tengan (5-nov): la primera vez, cada una se queda con el de su
// última ficha (las fichas siguen aunque la sesión se cierre), por el código de su enlace; las fichas de antes del
// 26-oct, que no lo llevan, por su nombre, si en la app hay una sola sesión que se llame así. Lo que ya esté apuntado no se
// pisa, y una marca dice que ya está hecho. La lista de la app solo se pide si hace falta
export async function migraReparto($: any, deLaApp: () => Promise<Map<string, string> | null>): Promise<number> {
  const dir = await dirReparto($)
  try {
    await $.fs.stat(`${dir}/.migrado`)
    return 0
  } catch {
    // aún no
  }
  const app = await deLaApp()
  const raiz = await carpeta($)
  let lista: { name: string; kind: string }[] = []
  try {
    lista = await $.fs.list(raiz)
  } catch {
    return 0
  }
  type Visto = { tag: string; latido: number; desde: number; ids: Set<string>; nombre: string }
  const porClave = new Map<string, Visto>()
  const sinEnlace: { id: string; tag: string; latido: number; desde: number; nombre: string }[] = []
  for (const f of lista) {
    if (f.kind !== 'file' || !f.name.endsWith('.json') || NO_FICHAS.includes(f.name)) continue
    let x: Record<string, unknown>
    try {
      x = JSON.parse(await $.fs.read(`${raiz}/${f.name}`)) as Record<string, unknown>
    } catch {
      continue
    }
    const tag = String(x.tag ?? '')
    if (typeof x.id !== 'string' || !TAGS.includes(tag)) continue
    const latido = typeof x.latido === 'number' ? x.latido : 0
    const desde = typeof x.desde === 'number' ? x.desde : latido
    const nombre = String(x.nombre ?? '').trim()
    const clave = typeof x.enlace === 'string' ? x.enlace.split('/').pop() ?? '' : ''
    if (!clave) {
      sinEnlace.push({ id: x.id, tag, latido, desde, nombre })
      continue
    }
    const ya = porClave.get(clave)
    const ids = new Set([...(ya?.ids ?? []), x.id])
    porClave.set(clave, !ya || latido > ya.latido ? { tag, latido, desde, ids, nombre: nombre || ya?.nombre || '' } : { ...ya, ids })
  }
  if (app) {
    const porNombre = new Map<string, string[]>()
    for (const [clave, titulo] of app) if (titulo) porNombre.set(titulo, [...(porNombre.get(titulo) ?? []), clave])
    for (const s of sinEnlace.sort((a, b) => a.latido - b.latido)) {
      const claves = porNombre.get(s.nombre) ?? []
      const clave = claves[0]
      if (claves.length !== 1 || !clave) continue
      const ya = porClave.get(clave)
      if (ya && ya.latido >= s.latido) continue
      porClave.set(clave, { tag: s.tag, latido: s.latido, desde: s.desde, ids: new Set([...(ya?.ids ?? []), s.id]), nombre: s.nombre })
    }
  }
  let n = 0
  for (const [clave, v] of porClave) {
    if (await leeAsignado($, clave)) continue
    await guardaAsignado($, { clave, tag: v.tag, desde: v.desde, ids: [...v.ids].slice(-30), ...(v.nombre ? { nombre: v.nombre } : {}) })
    n += 1
  }
  // sin la lista de la app, las fichas sin enlace no se han podido casar por su nombre: sin marca, se vuelve a probar
  if (!app && sinEnlace.some(s => s.nombre)) return n
  await $.fs.write(`${dir}/.migrado`, `Personajes de las fichas de antes: ${n} sesiones, el ${new Date(await $.clock.now()).toISOString()}\n`)
  return n
}
