// Lo de toda la sesión, sacado de sus transcripciones, para el bloque de 3 × 3 de la ficha de Marty (28-oct):
// cuándo empezó, sus ratos de trabajo y lo que gastó cada uno, y los archivos que ha tocado. Un rato va desde que le
// escribes (o le llega un aviso que la pone a trabajar) hasta su última respuesta del turno, y se corta mientras te
// pregunta y espera tu respuesta. Una sesión que sigue de otra (la app la vuelve a abrir con otro id, desde el resumen
// de la anterior) trae también lo de aquella: ese resumen dice dónde está su transcripción
import type { ResumenSesion } from '../types'
import { norm } from './fichas'
import { usoDe } from './tokens'

export type Tramo = { desde: number; hasta: number; tok: number; peso: number }
export type Orden = { id: string; desde: number; hasta: number; texto: string; cwd: string }
// Lo de cada subagente, de su transcripción (28-oct: el bloque de Trabajador, lo de Marty pero de los agentes):
// cuándo empezó y acabó, y sus tokens y lo que pesan en dólares
export type Agente = { desde: number; hasta: number; tok: number; peso: number }
export type Analisis = {
  inicio: number | null; tok: number; peso: number; tramos: Tramo[]; editados: string[]; ordenes: Orden[]; agentes: Agente[];
  fallidos: number; preguntas: Preguntas
}
// Las preguntas que te ha hecho (28-oct: el bloque de Decisión): cuándo llegó cada una y, de las que contestaste,
// cuántas con la recomendada, cuántas con lo tuyo («Otra») y cuántas desde el panel
export type Preguntas = { cuando: number[]; contestadas: number; rec: number; otra: number; panel: number }
type Pregunta = { titulo: string; recomendada: number }
// La opción que dice una letra: a → 0 … z → 25, aa → 26 (como las de letra(), en comun)
const indiceDe = (l: string) => (l.length === 1 ? l.charCodeAt(0) - 97 : (l.charCodeAt(0) - 96) * 26 + l.charCodeAt(1) - 97)
// Cada pregunta, una vez: las que se vuelven a mandar sin contestar no cuentan otra vez. Tu respuesta es tu siguiente
// mensaje: «todo lo recomendado», o sus códigos («1a 2b», «2: lo mío»), en el chat o desde el panel; las que no nombra
// siguen sin contestar
export function preguntasDe(lotes: { t: number; decs: Pregunta[] }[], respuestas: { t: number; texto: string }[]): Preguntas {
  const out: Preguntas = { cuando: [], contestadas: 0, rec: 0, otra: 0, panel: 0 }
  const todo = [...lotes.map(x => ({ t: x.t, decs: x.decs, texto: null as string | null })),
    ...respuestas.map(x => ({ t: x.t, decs: null as Pregunta[] | null, texto: x.texto }))].sort((a, b) => a.t - b.t)
  let pend: Pregunta[] = []
  for (const e of todo) {
    if (e.decs) {
      for (const p of e.decs) if (!pend.some(x => x.titulo === p.titulo)) out.cuando.push(e.t)
      pend = e.decs
      continue
    }
    const texto = (e.texto ?? '').toLowerCase()
    if (!pend.length || !texto) continue
    const panel = texto.includes('respuesta desde el panel')
    const todoRec = texto.includes('todo lo recomendado')
    // el número, suelto: ni «f2: …» ni «11a» cuentan como la 2 o la 1
    pend = pend.filter((p, i) => {
      const op = new RegExp(`(?<![\\w])${i + 1}([a-z]{1,2})(?![\\w])`).exec(texto)
      const suya = new RegExp(`(?<![\\w])${i + 1}\\s*:\\s*\\S`).test(texto)
      if (!todoRec && !op && !suya) return true
      out.contestadas += 1
      if (todoRec || (op && indiceDe(op[1] ?? '') === p.recomendada)) out.rec += 1
      else if (!op && suya) out.otra += 1
      if (panel) out.panel += 1
      return false
    })
  }
  return out
}

// Las herramientas que esperan tu respuesta: el rato se corta mientras tanto
const ESPERAN = ['AskUserQuestion', 'ExitPlanMode']
// Lo más que se está sin escribir nada en mitad de un rato de trabajo (una orden larga llega a 10 min; un subagente
// escribe en lo suyo, que también cuenta)
const HUECO = 15 * 60000
const EDITAN = ['Write', 'Edit', 'MultiEdit', 'NotebookEdit']
const ORDENES = ['Bash', 'PowerShell']

type Linea = {
  type?: string; subtype?: string; uuid?: string; timestamp?: string; isSidechain?: boolean; isMeta?: boolean
  isCompactSummary?: boolean; turnPosition?: unknown; turnOrigin?: string; cwd?: string; requestId?: string
  message?: { id?: string; model?: string; usage?: Record<string, unknown>; content?: unknown }
}
type Bloque = {
  type?: string; id?: string; name?: string; input?: Record<string, unknown>; tool_use_id?: string; text?: string; is_error?: boolean
}

// Una ruta de la transcripción, entera (las relativas, desde la carpeta en la que estaba), sin «.» ni «..» (si no, la
// misma carpeta cuenta dos veces) y como las demás del mod
export function entera(r: string, cwd = ''): string {
  const p = norm(/^[a-z]:[\\/]|^[\\/]/i.test(r) || !cwd ? r : `${cwd.replace(/[\\/]+$/, '')}/${r}`)
  if (!/(^|\/)\.\.?(\/|$)/.test(p)) return p
  const out: string[] = []
  for (const s of p.split('/')) {
    if (s === '..' && out.length > 1) out.pop()
    else if (s !== '.' && s !== '..') out.push(s)
  }
  return out.join('/')
}

// Las sesiones de las que sigue esta: su resumen (el de la compactación) dice dónde está la transcripción de antes
export function anterioresDe(texto: string, id: string): string[] {
  const ids = new Set<string>()
  for (const l of texto.split('\n')) {
    if (!l.includes('"isCompactSummary":true')) continue
    for (const m of l.matchAll(/full transcript at:[^"\n]*?([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.jsonl/gi)) {
      const otro = (m[1] ?? '').toLowerCase()
      if (otro && otro !== id.toLowerCase()) ids.add(otro)
    }
  }
  return [...ids]
}

// Todo de una pasada: las principales (la suya y las de antes) dicen los ratos; con los subagentes, los tokens, lo
// escrito y las órdenes. Las líneas copiadas de la sesión de antes cuentan una vez (llevan su mismo uuid)
export function analiza(textos: { texto: string; principal: boolean }[]): Analisis {
  const vistas = new Set<string>()
  // cada respuesta, con el subagente que la dio (su número en `agentes`; -1, la sesión)
  const usos = new Map<string, { t: number; n: number; peso: number; ag: number }>()
  const eventos: { t: number; k: 'inicio' | 'algo' | 'fin' | 'espera' | 'vuelve' | 'sub' }[] = []
  const pendientes = new Set<string>()
  const editados = new Set<string>()
  const ordenes = new Map<string, Orden>()
  const agentes: Agente[] = []
  // las llamadas a un agente y las que acabaron mal (con error o, en segundo plano, con su aviso de «failed»)
  const llamadas = new Set<string>()
  const mal = new Set<string>()
  // las preguntas que manda con «progreso» y tus mensajes, para preguntasDe
  const lotes: { t: number; decs: Pregunta[] }[] = []
  const respuestas: { t: number; texto: string }[] = []
  let inicio: number | null = null
  for (const { texto, principal } of textos) {
    // sin marcas de turno (un Claude Code de antes), un turno empieza con cada mensaje que no es un resultado
    const conTurnos = texto.includes('"turnPosition"')
    // un subagente: su transcripción entera es la suya
    const ag: Agente | null = principal ? null : { desde: Infinity, hasta: -Infinity, tok: 0, peso: 0 }
    for (const l of texto.split('\n')) {
      if (!l.startsWith('{') || l.startsWith('{"type":"api-request') || l.startsWith('{"type":"file-history')) continue
      let x: Linea
      try {
        x = JSON.parse(l) as Linea
      } catch {
        // una línea a medio escribir: la última, mientras trabaja
        continue
      }
      const t = Date.parse(x.timestamp ?? '')
      if (!Number.isFinite(t)) continue
      if (x.uuid) {
        if (vistas.has(x.uuid)) continue
        vistas.add(x.uuid)
      }
      const suya = principal && x.isSidechain !== true
      if (suya && (inicio === null || t < inicio)) inicio = t
      if (ag) {
        ag.desde = Math.min(ag.desde, t)
        ag.hasta = Math.max(ag.hasta, t)
      }
      const bloques = Array.isArray(x.message?.content) ? (x.message?.content as Bloque[]) : []
      if (x.type === 'assistant') {
        const u = x.message?.usage
        if (u) {
          const clave = `${x.message?.id ?? ''}:${x.requestId ?? ''}`
          const r = usoDe(u, x.message?.model ?? '')
          const antes = usos.get(clave)
          if (!antes || r.n > antes.n) usos.set(clave, { t: antes?.t ?? t, ...r, ag: antes?.ag ?? (ag ? agentes.length : -1) })
        }
        // lo de un subagente alarga el rato de la sesión que lo espera, pero no abre uno; y va antes de la pregunta que
        // corta el rato, si la hay (si no, abriría otro, vacío)
        eventos.push({ t, k: suya ? 'algo' : 'sub' })
        for (const b of bloques) {
          if (b.type !== 'tool_use' || !b.name) continue
          const ent = b.input ?? {}
          if (EDITAN.includes(b.name)) {
            const r = String(ent.file_path ?? ent.notebook_path ?? '')
            if (r) editados.add(entera(r, x.cwd))
          } else if (b.name === 'SendUserFile' && Array.isArray(ent.files)) {
            for (const f of ent.files) editados.add(entera(String(f), x.cwd))
          } else if (ORDENES.includes(b.name) && b.id) {
            ordenes.set(b.id, { id: b.id, desde: t, hasta: t, texto: String(ent.command ?? ''), cwd: x.cwd ?? '' })
          } else if ((b.name === 'Agent' || b.name === 'Task') && b.id) llamadas.add(b.id)
          else if (suya && b.name.endsWith('__progreso') && Array.isArray(ent.decisiones)) {
            lotes.push({ t, decs: (ent.decisiones as { titulo?: unknown; recomendada?: unknown }[]).map(x => ({
              titulo: String(x.titulo ?? ''), recomendada: typeof x.recomendada === 'number' ? x.recomendada : 0,
            })) })
          }
          if (suya && b.id && ESPERAN.includes(b.name)) {
            pendientes.add(b.id)
            eventos.push({ t, k: 'espera' })
          }
        }
      } else if (x.type === 'user') {
        const resultados = bloques.filter(b => b.type === 'tool_result')
        for (const b of resultados) {
          const o = b.tool_use_id ? ordenes.get(b.tool_use_id) : undefined
          if (o) o.hasta = Math.max(o.hasta, t)
          if (suya && b.tool_use_id && pendientes.delete(b.tool_use_id)) eventos.push({ t, k: 'vuelve' })
          if (b.tool_use_id && b.is_error) mal.add(b.tool_use_id)
        }
        if (!suya) continue
        // el aviso de que acabó algo en segundo plano: si fue mal, cuenta como fallido (si era un agente)
        const aviso = typeof x.message?.content === 'string' ? x.message.content : ''
        if (aviso.includes('<task-notification>') && /<status>failed<\/status>/.test(aviso)) {
          const id = /<tool-use-id>([^<]+)<\/tool-use-id>/.exec(aviso)?.[1]
          if (id) mal.add(id)
        }
        // con marcas, cualquiera: también el mensaje de otra sesión, que va como interno (isMeta)
        const empieza = conTurnos ? !!x.turnPosition : !resultados.length && !x.isMeta && !x.isCompactSummary
        if (empieza) eventos.push({ t, k: 'inicio' })
        else if (resultados.length) eventos.push({ t, k: 'algo' })
        // tu mensaje (o lo que mandas desde el panel), por si contesta a sus preguntas; los de otra sesión o los avisos, no
        const escrito = typeof x.message?.content === 'string' ? x.message.content
          : bloques.filter(b => b.type === 'text').map(b => b.text ?? '').join('\n')
        if (empieza && escrito && !x.isCompactSummary &&
          (!x.turnOrigin || x.turnOrigin === 'human' || escrito.includes('Respuesta desde el panel'))) {
          respuestas.push({ t, texto: escrito.slice(0, 2000) })
        }
      } else if (suya && x.type === 'system' && x.subtype === 'stop_hook_summary') {
        eventos.push({ t, k: 'fin' })
      }
    }
    if (ag && Number.isFinite(ag.desde)) agentes.push(ag)
  }
  eventos.sort((a, b) => a.t - b.t)
  const tramos: Tramo[] = []
  let desde = -1
  let ult = -1
  const cierra = () => {
    if (desde >= 0) tramos.push({ desde, hasta: ult, tok: 0, peso: 0 })
    desde = -1
  }
  for (const e of eventos) {
    if (e.k === 'inicio') {
      cierra()
      desde = e.t
      ult = e.t
      continue
    }
    if (e.k === 'vuelve') {
      if (desde < 0) {
        desde = e.t
        ult = e.t
      }
      continue
    }
    // tras más de un cuarto de hora sin nada, el rato de antes acabó en lo último que hizo: lo de después es otro
    // (28-oct: en DOC-03, lo que hacía sola con días de pausa por medio salía como un rato de 88 h)
    if (desde >= 0 && e.t - ult > HUECO) cierra()
    if (e.k === 'espera' || e.k === 'fin') {
      if (desde >= 0) ult = Math.max(ult, e.t)
      cierra()
    } else if (e.k === 'algo') {
      // lo que hace sola, sin mensaje tuyo delante (el aviso de una tarea en segundo plano), también es un rato
      if (desde < 0) {
        desde = e.t
        ult = e.t
      } else ult = Math.max(ult, e.t)
    } else if (desde >= 0) ult = Math.max(ult, e.t)
  }
  cierra()
  // cada respuesta, a su rato (la de un subagente, al de la sesión que lo lanzó; la de uno en segundo plano mientras la
  // sesión no trabaja, a ninguno)
  let tok = 0
  let peso = 0
  for (const u of usos.values()) {
    tok += u.n
    peso += u.peso
    const de = agentes[u.ag]
    if (de) {
      de.tok += u.n
      de.peso += u.peso
    }
    let lo = 0
    let hi = tramos.length - 1
    while (lo <= hi) {
      const m = (lo + hi) >> 1
      const tr = tramos[m] as Tramo
      if (u.t < tr.desde) hi = m - 1
      else if (u.t > tr.hasta) lo = m + 1
      else {
        tr.tok += u.n
        tr.peso += u.peso
        break
      }
    }
  }
  return {
    inicio, tok, peso, tramos, editados: [...editados], ordenes: [...ordenes.values()], agentes,
    fallidos: [...mal].filter(id => llamadas.has(id)).length, preguntas: preguntasDe(lotes, respuestas),
  }
}

// Lo que se guarda en el registro: lo de los ratos, ya sumado (el coste del rato que más gastó sale del coste de la
// sesión, repartido por lo que pesa cada rato: Claude Code da el coste sumado, no por turno)
export function resumenDe(a: Analisis, archivos: number, empezo?: number): ResumenSesion {
  const dura = (tr: { desde: number; hasta: number }) => Math.max(0, tr.hasta - tr.desde)
  const inicio = Math.min(a.inicio ?? Infinity, typeof empezo === 'number' && empezo > 0 ? empezo : Infinity)
  return {
    inicio: Number.isFinite(inicio) ? inicio : 0,
    activa: a.tramos.reduce((s, tr) => s + dura(tr), 0),
    maxT: Math.max(0, ...a.tramos.map(dura)),
    maxTok: Math.max(0, ...a.tramos.map(tr => tr.tok)),
    maxPeso: Math.max(0, ...a.tramos.map(tr => tr.peso)),
    peso: a.peso,
    tok: a.tok,
    archivos,
    // los subagentes, para el bloque de Trabajador: cuántos, lo que tardaron y gastaron, y los que acabaron mal
    agentes: {
      n: a.agentes.length,
      tiempo: a.agentes.reduce((s, x) => s + dura(x), 0),
      maxT: Math.max(0, ...a.agentes.map(dura)),
      tok: a.agentes.reduce((s, x) => s + x.tok, 0),
      maxTok: Math.max(0, ...a.agentes.map(x => x.tok)),
      peso: a.agentes.reduce((s, x) => s + x.peso, 0),
      maxPeso: Math.max(0, ...a.agentes.map(x => x.peso)),
      fallidos: a.fallidos,
    },
    // y las preguntas que te ha hecho, para el bloque de Decisión
    preguntas: a.preguntas,
  }
}

// Las rutas que nombra una orden, enteras: entre comillas o sueltas con su barra, con las variables que ella misma
// pone (S="C:/…"; $d = '…') ya sustituidas. Las que siguen con una variable, un comodín o un enlace, fuera
export function rutasDe(orden: string, cwd: string): string[] {
  const vars = new Map<string, string>()
  for (const m of orden.matchAll(/(?:^|[\s;&|(])\$?([A-Za-z_]\w*)\s*=\s*(?:"([^"\r\n]*)"|'([^'\r\n]*)')/g)) {
    vars.set((m[1] ?? '').toLowerCase(), m[2] ?? m[3] ?? '')
  }
  const sust = (s: string) => s.replace(/\$\{?([A-Za-z_]\w*)\}?/g, (todo, n: string) => vars.get(n.toLowerCase()) ?? todo)
  const out = new Set<string>()
  const toma = (s: string) => {
    const r = sust(s).trim()
    if (!r || /[$*?<>|]/.test(r) || /^[a-z]+:\/\//i.test(r) || !/[\\/]/.test(r) || /[\r\n]/.test(r)) return
    out.add(entera(r, cwd))
  }
  for (const m of orden.matchAll(/"([^"\r\n]{2,})"|'([^'\r\n]{2,})'/g)) toma(m[1] ?? m[2] ?? '')
  const suelta = orden.replace(/"[^"\r\n]*"|'[^'\r\n]*'/g, ' ')
  for (const m of suelta.matchAll(/(?:^|[\s=])((?:[A-Za-z]:)?[\\/]?(?:[\w.+@~-]+[\\/])+[\w.+@~-]*)/g)) toma(m[1] ?? '')
  return [...out]
}

// Las órdenes que borran o mueven: una ruta suya que ya no está cuenta como tocada
const QUITAN = /(^|[\s;&|(])(rm|rmdir|del|erase|mv|move|ren|rename|Remove-Item|Move-Item|Rename-Item)\s|DeleteFile|DeleteDirectory|MoveFile|\/MOVE?\b/i
// Los scripts del proyecto: lo que escriben suele ir al lado, en una carpeta hermana de la suya
const SCRIPT = /\.(c?js|mjs|ts|py|ps1|cmd|bat|sh)$/i
const SALTA = /^(node_modules|\.git|file-history|\$recycle\.bin|__pycache__)$/i
type Entrada = { name: string; kind: string; mtimeMs?: number }

// Los archivos que ha tocado, en `ya`: los que escribe con sus herramientas o te manda, y los que crean, cambian, mueven
// o borran sus órdenes (un script que hace recortes o páginas): de cada orden acabada y aún sin mirar, las rutas que
// nombra y, en sus carpetas, lo cambiado mientras corría. Cada archivo cuenta una vez, le haga lo que le haga. Lo de
// Claude Code (`casa`: sus transcripciones, sus copias, las fichas del mod), en las órdenes no cuenta: cambia solo,
// mientras corren. Como mucho `tope` entradas por vuelta
export async function tocados($: any, a: Analisis, hechas: Set<string>, ya: Set<string>, ahora: number, casa = '',
  tope = 4000): Promise<void> {
  for (const r of a.editados) ya.add(r)
  const nuevas = a.ordenes.filter(o => !hechas.has(o.id) && (o.hasta > o.desde || ahora - o.desde > 3600000))
  if (!nuevas.length) return
  const ventanas = nuevas.map(o => [o.desde - 2000, o.hasta + 2000] as const)
  const dentro = (t?: number) => typeof t === 'number' && ventanas.some(([i, f]) => t >= i && t <= f)
  const estado = async (r: string): Promise<{ kind: string; mtimeMs: number } | null> => {
    try {
      return (await $.fs.stat(r)) as { kind: string; mtimeMs: number }
    } catch {
      return null
    }
  }
  const padre = (r: string) => r.replace(/\/[^/]*$/, '')
  const suyo = (r: string) => !!casa && (r === casa || r.startsWith(`${casa}/`))
  const dirs = new Map<string, number>()
  // una carpeta se recorre por dentro solo si no es la raíz de un disco ni la de la persona (c:/users/<nombre>)
  const mira = (d: string, nivel: number) => {
    if (!d || suyo(d) || d.split('/').length < (nivel ? 3 : 2)) return
    if (nivel && /^[a-z]:\/users\/[^/]+$/.test(d)) return
    dirs.set(d, Math.max(nivel, dirs.get(d) ?? -1))
  }
  for (const o of nuevas) {
    hechas.add(o.id)
    const quita = QUITAN.test(o.texto)
    const raiz = norm(o.cwd)
    for (const r of rutasDe(o.texto, o.cwd)) {
      if (suyo(r)) continue
      const st = await estado(r)
      if (!st) {
        if (quita && (await estado(padre(r)))?.kind === 'dir') ya.add(r)
        continue
      }
      if (st.kind === 'dir') mira(r, 2)
      else if (st.kind === 'file') {
        if (dentro(st.mtimeMs)) ya.add(r)
        mira(padre(r), 0)
        const abuelo = padre(padre(r))
        if (SCRIPT.test(r) && raiz && abuelo.startsWith(raiz)) mira(abuelo, 3)
      }
    }
  }
  let quedan = tope
  const recorre = async (dir: string, nivel: number) => {
    if (quedan <= 0) return
    let lista: Entrada[] = []
    try {
      lista = (await $.fs.list(dir)) as Entrada[]
    } catch {
      return
    }
    quedan -= lista.length
    for (const f of lista) {
      const r = norm(`${dir}/${f.name}`)
      if (suyo(r)) continue
      if (f.kind === 'file' && dentro(f.mtimeMs)) ya.add(r)
      else if (f.kind === 'dir' && nivel > 0 && !SALTA.test(f.name)) await recorre(r, nivel - 1)
    }
  }
  for (const [dir, nivel] of dirs) await recorre(dir, nivel)
}
