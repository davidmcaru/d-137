// D-137: el panel de las sesiones de Claude de este PC (desde el 22-oct-2026; rediseñado en las iteraciones 1 a 10
// de Diseno-Panel, el 23 al 26-oct). Cada sesión deja su ficha en la carpeta compartida (fichas.ts) y su registro del
// día; el panel (panel.tsx) enseña cinco pestañas: Sesión (esta sesión), Todas (todas), Decisión (lo que te toca, con la
// respuesta que se manda a su sesión), Activo (lo que sigue en marcha) y Cuota (la cuota y el día); encima del
// mensaje, la franja de skills y commit. Dos frenos: antes de escribir un archivo que otra sesión está tocando en su
// turno, esta espera y aquella se entera; y antes de un restore, checkout o stash que se llevaría cambios sin commit de
// otra sesión, avisa (los dos, o solo el de git, o ninguno, según lo elegido al instalar: ajustes.ts). Claude le pasa
// su paso y sus decisiones con la herramienta «progreso», y una instrucción del mod se lo recuerda en cada sesión
import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Cuota, CuotaGlobal, Decision, Entrega, Estado, Ficha, Mandada, Paso, Pestana, Registro, Tarea } from '../types'
import { AJUSTES, leeAjustes } from './ajustes'
import { ANALIZAR, ANALIZAR_PRO, PANEL } from './atajos'
import { apunta, llevaLaCuota, mejorLectura, puntosPorDolar } from './calculos'
import type { Acciones, Datos } from './comun'
import { decisionesDe, DESPLEGADOS, letra, sinToque, TOQUES, vistaPasos } from './comun'
import {
  carpeta, casa, datosSesion, diaDe, enlaceDe, guarda, guardaGlobal, guardaRegistro, idsEscritorio, leeGlobal, leeRegistros,
  leeTodas, eligeTag, nombreDe, nombreTag, norm, repoDe, rotuloDe, sana, TAGS,
} from './fichas'
import { pendientesDe, respuestaDe } from './pajaro'
import { COMMIT, franja, MAS, panel } from './panel'
import { analiza, anterioresDe, resumenDe, tocados } from './sesion'
import { tokensDe, transcripcionesDe } from './tokens'
import type { Transcripcion } from './tokens'

const PANE = 'd-137'
const HERRAMIENTA = 'mcp__d-137__progreso'
const EDITAN = ['Edit', 'Write', 'MultiEdit', 'NotebookEdit']
const ORDENES = ['Bash', 'PowerShell']
const LATIDO = 3000
const RETIENE = 10 * 60 * 1000
const DIAS = ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.']
// Lo que se lleva por delante los cambios sin commit de un repo (23-oct: el freno de la lección de las sesiones
// paralelas, que el 18-oct dejó vacío el índice de la memoria)
const DESHACE = /\bgit\b(?:\s+-C\s+("[^"]*"|'[^']*'|\S+))?\s+(?:restore|checkout|switch|stash|clean|reset\s+--hard)\b/i
// Cómo empieza la respuesta que un panel manda a la sesión que preguntó: la de allí solo la pasa como de la persona si
// empieza así, viene de este mod y tiene decisiones pendientes
const MARCA = 'D-137 · respuesta: '
// Lo que manda «Mods» a las demás sesiones para que su mod se recargue (28-oct)
const RECARGA = 'D-137 · recarga el mod'
const RESPUESTA = 'Respuesta desde el panel D-137'

const ficha = atom({ plugin: 'd-137', key: 'ficha' } as const, null as Ficha | null)
const otras = atom({ plugin: 'd-137', key: 'otras' } as const, [] as Ficha[])
const estado = atom({ plugin: 'd-137', key: 'estado' } as const, 'esperando' as Estado)
const pasos = atom({ plugin: 'd-137', key: 'pasos' } as const, [] as Paso[])
// Los pasos de la tarea que dijo Claude (su plan): siguen entre turnos hasta que acaban o se limpian
const plan = atom({ plugin: 'd-137', key: 'plan' } as const, [] as string[])
const toca = atom({ plugin: 'd-137', key: 'toca' } as const, [] as Decision[])
const hecho = atom({ plugin: 'd-137', key: 'hecho' } as const, '')
const inicio = atom({ plugin: 'd-137', key: 'inicio' } as const, 0)
const fin = atom({ plugin: 'd-137', key: 'fin' } as const, 0)
const aviso = atom({ plugin: 'd-137', key: 'aviso' } as const, '')
const cuota = atom({ plugin: 'd-137', key: 'cuota' } as const, {} as Cuota)
const marcha = atom({ plugin: 'd-137', key: 'marcha' } as const, [] as Tarea[])
const entregas = atom({ plugin: 'd-137', key: 'entregas' } as const, [] as Entrega[])
const gasto = atom({ plugin: 'd-137', key: 'gasto' } as const, null as number | null)
const registros = atom({ plugin: 'd-137', key: 'registros' } as const, [] as Registro[])
const global = atom({ plugin: 'd-137', key: 'global' } as const, { dias: {}, horas: {} } as CuotaGlobal)
// Lo de la vista: la pestaña, lo desplegado, lo pulsado y lo elegido en Decisión (por defecto, todo plegado)
const pestana = atom({ plugin: 'd-137', key: 'pestana' } as const, 'marty' as Pestana)
const abiertos = atom({ plugin: 'd-137', key: 'abiertos' } as const, {} as Record<string, boolean>)
const repoSel = atom({ plugin: 'd-137', key: 'repoSel' } as const, null as string | null)
const elegida = atom({ plugin: 'd-137', key: 'elegida' } as const, null as string | null)
const filtro = atom({ plugin: 'd-137', key: 'filtro' } as const, 'todas')
const tocaSel = atom({ plugin: 'd-137', key: 'tocaSel' } as const, null as string | null)
const tocaPaso = atom({ plugin: 'd-137', key: 'tocaPaso' } as const, 0)
const elecciones = atom({ plugin: 'd-137', key: 'elecciones' } as const, {} as Record<string, number>)
const mandadas = atom({ plugin: 'd-137', key: 'mandadas' } as const, {} as Record<string, Mandada>)
const vistos = atom({ plugin: 'd-137', key: 'vistos' } as const, [] as string[])
const marchaVista = atom({ plugin: 'd-137', key: 'marchaVista' } as const, 'activos')
const marchaTipo = atom({ plugin: 'd-137', key: 'marchaTipo' } as const, '')
const cuandoModo = atom({ plugin: 'd-137', key: 'cuandoModo' } as const, 'semana')
const diaModo = atom({ plugin: 'd-137', key: 'diaModo' } as const, 'sesion')
// La unidad de «Por sesión» en Cuota: el %, por defecto, los millones de tokens o los dólares (28-oct)
const unidad = atom({ plugin: 'd-137', key: 'unidad' } as const, 'pct')
const confirma = atom({ plugin: 'd-137', key: 'confirma' } as const, '')
// El menú abierto de la franja: Más, Commit o ninguno
const franjaMenu = atom({ plugin: 'd-137', key: 'franjaMenu' } as const, null as string | null)

const DESCRIPCION =
  'Pone al día el panel «D-137» que la persona ve junto al chat: el paso de ahora, en una línea y en palabras sencillas ' +
  '(paso); los pasos de la tarea, de 4 a 8, como el plan que le cuentas (plan); lo hecho al terminar, en una línea ' +
  '(hecho); y las decisiones que le tocan, cada una con su título, sus opciones, la recomendada (contando desde 0) y, ' +
  'si ayuda, una o dos frases de contexto (decisiones).'
const ESQUEMA = {
  type: 'object',
  properties: {
    plan: {
      type: 'array', items: { type: 'string' },
      description: 'Los pasos de la tarea, de 4 a 8, cortos y en palabras sencillas: los mismos del plan que le cuentas',
    },
    paso: { type: 'string', description: 'El paso de ahora: uno de los del plan (su texto o su número), o uno nuevo' },
    hecho: { type: 'string', description: 'Al terminar: lo hecho, en una línea' },
    decisiones: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          titulo: { type: 'string' },
          opciones: { type: 'array', items: { type: 'string' } },
          recomendada: { type: 'integer', description: 'La opción recomendada, contando desde 0' },
          contexto: { type: 'string', description: 'Una o dos frases con lo que hace falta saber para decidir sin ir a la sesión' },
        },
        required: ['titulo', 'opciones', 'recomendada'],
      },
    },
  },
}
// Lo que el mod añade a las instrucciones de cada sesión (23-oct: «que Claude rellene el panel solo»)
const INSTRUCCION =
  'Panel «D-137»: la persona ve junto al chat en qué estás y lo que le toca decidir, también desde sus otras sesiones. ' +
  'Al empezar una tarea de varios pasos, llama a la herramienta mcp__d-137__progreso con `plan` (de 4 a 8 pasos ' +
  'cortos, en palabras sencillas: los del plan que le cuentes) y, cada vez que pases al siguiente, con `paso` (su ' +
  'texto o su número); el panel enseña esos pasos, no cada orden. Antes de acabar un turno en el que le pidas decidir ' +
  'algo, llámala con `decisiones` (cada ' +
  'una con su título, sus opciones, la recomendada, contando desde 0, y un `contexto` de una o dos frases si hace ' +
  'falta para decidir sin leer el chat) y `hecho` (lo hecho, en una línea). Las decisiones siguen en el panel hasta ' +
  'que las conteste, desde el panel o en el chat: un mensaje suyo las quita del panel al llegar, y si alguna sigue ' +
  'sin contestar, vuelve a mandarla con `decisiones` antes de acabar el turno. Su respuesta puede llegarte desde el ' +
  'panel de otra sesión, como un mensaje suyo que empieza por «Respuesta desde el panel D-137».'
// Lo que lee Claude al lado del mensaje de la persona que quitó del panel sus decisiones pendientes (prompt.submit)
const quitadas = (decs: Decision[]) =>
  'D-137: al llegar este mensaje de la persona, el panel ha quitado las decisiones que tenías pendientes. Si no las ' +
  'contesta todas, vuelve a mandar las que sigan sin contestar con `decisiones` antes de acabar el turno:\n' +
  decs
    .map((d, i) => {
      const ops = d.opciones.map((o, k) => `${letra(k)}) ${o}${k === d.recomendada ? ' (recomendada)' : ''}`)
      return `${i + 1}. ${d.titulo}: ${ops.join(' · ')}`
    })
    .join('\n')

const nombreArchivo = (ruta: unknown) => String(ruta ?? '').split(/[\\/]/).pop() ?? ''
// Cada herramienta, en las palabras con que se la ve trabajar: la descripción de una orden, o qué fichero toca
function describe(e: Record<string, unknown>): string {
  switch (String(e.tool)) {
    case 'Bash':
    case 'PowerShell':
      return String(e.description || e.command || e.tool).slice(0, 90)
    case 'Read':
      return `Leer ${nombreArchivo(e.file_path)}`
    case 'Edit':
      return `Editar ${nombreArchivo(e.file_path)}`
    case 'Write':
      return `Escribir ${nombreArchivo(e.file_path)}`
    case 'Grep':
    case 'Glob':
      return `Buscar «${String(e.pattern ?? '').slice(0, 40)}»`
    case 'Agent':
      return `Agente: ${String(e.description ?? '')}`
    case 'Skill':
      return `Skill ${String(e.skill ?? '')}`
    default:
      return String(e.tool).replace(/^mcp__[^_]+(__)?/, '')
  }
}
// La última línea que ha escrito una orden en segundo plano, sin colores de terminal
function ultimaLinea(txt: string): string {
  const lineas = txt.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '').split(/[\r\n]+/).map(l => l.trim()).filter(Boolean)
  return (lineas[lineas.length - 1] ?? '').slice(0, 100)
}

// Lo que cada sesión sabía de las demás en el latido anterior, para avisar de lo que cambia (no se guarda: tras una
// recarga, el primer latido solo apunta)
let antes: Map<string, { estado: string; toca: number }> | null = null
// Si Claude ya ha dicho su paso en este turno: entonces la ficha enseña ese, y no la última herramienta
let hito = false
// Las órdenes de deshacer que el freno ya avisó en este turno: si Claude la repite tras comprobarlo, pasa
let avisadas = new Set<string>()
// Cuándo vio el panel por primera vez cada agente en segundo plano
const vistosAgentes = new Map<string, number>()
// Los archivos del repo cambiados sin commit (para «En el mismo repo») y lo escrito en «Otra» de Decisión (sin redibujar
// a cada tecla)
let cambiados: string[] = []
const TEXTOS: Record<string, string> = {}
// El id de escritorio de cada sesión abierta (para el enlace de las que traen ficha de antes), al día cada 30 s
let ESCRITORIO = new Map<string, string>()
// La última pestaña que se eligió en cualquier sesión (su hora), para no volver a aplicarla
let vistaVista = 0
async function apuntaPestana($: any, p: Pestana) {
  try {
    await $.fs.write(`${await carpeta($)}/vista.json`, JSON.stringify({ pestana: p, t: await $.clock.now() }))
  } catch {
    // sin carpeta compartida: se queda en esta sesión
  }
}
async function sigueVista($: any) {
  try {
    const v = JSON.parse(await $.fs.read(`${await carpeta($)}/vista.json`)) as { pestana?: Pestana; t?: number }
    if (!v.pestana || !v.t || v.t <= vistaVista) return
    vistaVista = v.t
    if ((await read($, pestana)) !== v.pestana) await update($, pestana, () => v.pestana as Pestana)
  } catch {
    // aún no hay ninguna elegida
  }
}
const enlaceDeFicha = (f: Ficha) => f.enlace ?? enlaceDe(ESCRITORIO.get(f.id))
// El registro de esta sesión y la última lectura de la cuota, para saber cuándo cambió
let miRegistro: Registro | null = null
let ultimaLectura = ''
let cuandoLectura = 0

async function cambiaFicha($: any, fn: (f: Ficha) => Ficha) {
  const f = await read($, ficha)
  if (!f) return
  const nueva = fn(f)
  await update($, ficha, () => nueva)
  await guarda($, nueva)
}
// Las decisiones contestadas, fuera de aquí y de la ficha: los paneles de todas las sesiones dejan de verlas en el
// latido siguiente
async function quitaDecisiones($: any) {
  await update($, toca, () => [])
  await cambiaFicha($, x => ({ ...x, toca: [], decisiones: [] }))
}
// El nombre de la sesión cambia (la app le pone uno tras el primer mensaje, y se puede renombrar), y con él su rótulo
async function alDia($: any) {
  const s = await datosSesion($)
  const nombre = s.name ?? ''
  const raiz = nombreDe(await $.session.root())
  const enlace = enlaceDe(s.hostSessionId)
  await cambiaFicha($, f => {
    const rotulo = f.propio ? f.rotulo : rotuloDe(nombre, raiz)
    return f.nombre === nombre && f.rotulo === rotulo && f.enlace === enlace ? f : { ...f, nombre, rotulo, enlace }
  })
}
async function alDiaRepo($: any) {
  const r = await repoDe($, String(await $.session.cwd()))
  cambiados = r.cambiados
  await cambiaFicha($, f => (JSON.stringify(f.repo) === JSON.stringify(r.repo) ? f : { ...f, repo: r.repo }))
}
function avisa($: any, texto: string) {
  Promise.resolve()
    .then(() => $.ui.toast(texto))
    .catch(() => undefined)
}
async function refresca($: any) {
  let todas = await leeTodas($)
  const yo = await read($, ficha)
  if (yo) {
    const sano = sana(yo, todas)
    if (sano !== yo) {
      await update($, ficha, () => sano)
      await guarda($, sano)
      todas = todas.map(x => (x.id === sano.id ? sano : x))
    }
  }
  const resto = todas.filter(x => x.id !== yo?.id && TAGS.includes(x.tag))
    .map(x => (x.enlace || !ESCRITORIO.has(x.id) ? x : { ...x, enlace: enlaceDeFicha(x) }))
  await update($, otras, () => resto)
  if (antes) {
    for (const f of resto) {
      const previo = antes.get(f.id)
      if (!previo) continue
      const quien = `${nombreTag(f.tag)} · ${f.rotulo}`
      const cosas = f.toca.length === 1 ? 'una cosa' : `${f.toca.length} cosas`
      if (previo.estado === 'trabajando' && f.estado === 'esperando') {
        avisa($, `${quien} ha terminado${f.toca.length ? ` y te toca decidir ${cosas}` : ''}`)
      } else if (previo.toca === 0 && f.toca.length) avisa($, `${quien} te espera: ${f.toca[0]}`)
    }
  }
  antes = new Map(resto.map(f => [f.id, { estado: f.estado, toca: f.toca.length }]))
}
// Lo que Claude Code sabe de la última respuesta: la cuota (la ventana de 5 horas y la de la semana) y lo que lleva
// costado la sesión; sin datos, nada
async function uso($: any): Promise<{ cuota: Cuota; usd: number | null; semana: number | null; contexto: number | null }> {
  try {
    const u = await $.session.usage()
    const c: Cuota = {}
    for (const r of (u.rateLimits ?? []) as { kind: string; percentUsed: number; resetsAt?: string }[]) {
      const cuando = r.resetsAt ? new Date(r.resetsAt) : null
      const vale = cuando !== null && !Number.isNaN(cuando.getTime())
      if (r.kind === 'seven_day') {
        c.semana = { pct: r.percentUsed, resetsAt: r.resetsAt, renueva: vale ? `se renueva el ${DIAS[cuando.getDay()] ?? ''}` : undefined }
      } else if (r.kind === 'five_hour') c.horas = { pct: r.percentUsed, resetsAt: r.resetsAt }
    }
    const usd = typeof u.cost?.usd === 'number' ? u.cost.usd : null
    const contexto = typeof u.context?.percent === 'number' ? u.context.percent : null
    return { cuota: c, usd, semana: c.semana?.pct ?? null, contexto }
  } catch {
    return { cuota: {}, usd: null, semana: null, contexto: null }
  }
}
// Lo que lleva gastado hoy esta sesión, en % de la semana: los dólares de hoy de su registro, y lo poco que aún no ha
// apuntado, por lo que vale cada dólar esos días; sin con qué calcularlo, null
async function gastoHoy($: any, usd: number | null): Promise<number | null> {
  const ahora = await $.clock.now()
  const k = puntosPorDolar(await read($, global), await read($, registros), ahora)
  if (k === null) return null
  const deHoy = miRegistro?.dias[diaDe(ahora)]?.usd ?? 0
  const visto = miRegistro?.visto
  const falta = usd !== null && typeof visto === 'number' ? Math.max(0, usd - visto) : 0
  return (deHoy + falta) * k
}
async function alDiaCuota($: any) {
  const ahora = await $.clock.now()
  const u = await uso($)
  await update($, cuota, () => u.cuota)
  const lectura = JSON.stringify([u.cuota.semana?.pct, u.cuota.horas?.pct])
  if (lectura !== ultimaLectura) {
    ultimaLectura = lectura
    cuandoLectura = ahora
  }
  await apuntaGasto($, u.usd)
  const hoy = await gastoHoy($, u.usd)
  await update($, gasto, () => hoy)
  await cambiaFicha($, f => ({
    ...f,
    usd: u.usd ?? f.usd,
    contexto: u.contexto ?? f.contexto,
    gasto: hoy,
    lectura: u.cuota.semana || u.cuota.horas ? {
      semana: u.cuota.semana?.pct, horas: u.cuota.horas?.pct, renuevaSemana: u.cuota.semana?.resetsAt,
      renuevaHoras: u.cuota.horas?.resetsAt, cuando: cuandoLectura,
    } : f.lectura,
  }))
}
// Una sola sesión lleva la cuota de todas: con la lectura más nueva de cada una, apunta el día y las horas
async function llevaCuota($: any) {
  const yo = await read($, ficha)
  if (!yo) return
  const todas = [yo, ...(await read($, otras))]
  const g = await leeGlobal($)
  await update($, global, () => g)
  if (!llevaLaCuota(yo, todas)) return
  const mejor = mejorLectura(todas.map(f => f.lectura).filter((l): l is NonNullable<Ficha['lectura']> => !!l))
  if (typeof mejor.semana !== 'number') return
  const nuevo = apunta(g, mejor.semana, mejor.renueva, await $.clock.now())
  if (nuevo === g) return
  await guardaGlobal($, nuevo)
  await update($, global, () => nuevo)
}
// El registro de la sesión: lo que costó y lo que hizo cada día. Se cambia con `fn` sobre el de ahora (o uno nuevo), con
// su nombre al día, y se guarda. De uno en uno, en cola: el gasto, lo hecho y los tokens llegan a la vez, y uno pisaría
// al otro
let colaRegistro: Promise<void> = Promise.resolve()
function cambiaRegistro($: any, fn: (r: Registro, ahora: number) => Registro | null): Promise<void> {
  const paso = colaRegistro.then(async () => {
    const yo = await read($, ficha)
    if (!yo) return
    const ahora = await $.clock.now()
    const r = fn(miRegistro ?? { id: yo.id, tag: yo.tag, rotulo: yo.rotulo, nombre: yo.nombre, dias: {} }, ahora)
    if (!r) return
    miRegistro = { ...r, tag: yo.tag, rotulo: yo.rotulo, nombre: yo.nombre }
    await guardaRegistro($, miRegistro)
    await update($, registros, l => [...l.filter(x => x.id !== yo.id), miRegistro as Registro])
  })
  colaRegistro = paso.catch(() => undefined)
  return paso
}
const ceros = () => Array.from({ length: 24 }, () => 0)
// Lo que costó, a medida que llega: lo que ha subido el coste de la sesión desde lo último apuntado (`visto`), en el día
// y la hora de ahora. Así cada dólar cuenta una vez, también lo de los subagentes, que el coste de la sesión ya suma, y
// lo que gastan en segundo plano entre turnos (antes se apuntaba lo de cada turno, y los turnos de los subagentes
// también lo apuntaban: salía dos veces). La primera vez solo toma nota de lo que lleva, que ya estaba apuntado
async function apuntaGasto($: any, usd: number | null) {
  if (usd === null) return
  await cambiaRegistro($, (r, ahora) => {
    if (typeof r.visto !== 'number') return { ...r, visto: usd }
    // un coste que baja es una sesión que vuelve a empezar de cero (un /clear)
    const mas = usd >= r.visto ? usd - r.visto : usd
    if (mas < 0.0005) return usd === r.visto ? null : { ...r, visto: usd }
    const dia = diaDe(ahora)
    const x = r.dias[dia] ?? { usd: 0, hechos: [] }
    const usdH = (x.usdH ?? ceros()).slice()
    const h = new Date(ahora).getHours()
    usdH[h] = (usdH[h] ?? 0) + mas
    return { ...r, visto: usd, dias: { ...r.dias, [dia]: { ...x, usd: x.usd + mas, usdH } } }
  })
}
// Lo que hizo: lo hecho de cada tarea, con su hora (los últimos 40 del día)
async function apuntaHecho($: any, texto: string) {
  if (!texto) return
  await cambiaRegistro($, (r, ahora) => {
    const dia = diaDe(ahora)
    const x = r.dias[dia] ?? { usd: 0, hechos: [] }
    return { ...r, dias: { ...r.dias, [dia]: { ...x, hechos: [...x.hechos, { t: ahora, texto: texto.slice(0, 140) }].slice(-40) } } }
  })
}
// Una transcripción entera. Hasta 4 MiB, con $.fs.read; si pesa más, la app no deja leerla de una vez (28-oct:
// el bloque de Marty salía a cero), y se lee por PowerShell, sin lo que no hace falta: fuera las peticiones a la API y
// las copias de los archivos, y de cada resultado de una herramienta (casi la mitad del archivo), solo a qué llamada
// responde y cuándo. Lo leído así se guarda mientras el archivo no cambie (el de una sesión de antes ya no cambia)
const ADELGAZA = `$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
$r = [IO.StreamReader]::new($ruta, [Text.UTF8Encoding]::new($false))
$o = [Console]::Out
while ($null -ne ($l = $r.ReadLine())) {
  if ($l.StartsWith('{"type":"api-request') -or $l.StartsWith('{"type":"file-history')) { continue }
  if ($l.Contains('"tool_result"') -and $l.Contains('"type":"user"')) {
    $u = [regex]::Match($l, '"uuid":"([^"]+)"').Groups[1].Value
    $t = [regex]::Match($l, '"timestamp":"([^"]+)"').Groups[1].Value
    $s = if ($l.Contains('"isSidechain":true')) { 'true' } else { 'false' }
    $ids = @([regex]::Matches($l, '"tool_use_id":"([^"]+)"') | ForEach-Object { '{"type":"tool_result","tool_use_id":"' + $_.Groups[1].Value + '"}' })
    $l = '{"type":"user","uuid":"' + $u + '","timestamp":"' + $t + '","isSidechain":' + $s + ',"message":{"content":[' + ($ids -join ',') + ']}}'
  }
  $o.WriteLine($l)
}
$o.Flush()`
const grandes = new Map<string, { clave: string; texto: string }>()
async function leeTranscripcion($: any, f: Transcripcion): Promise<string> {
  if (f.size < 4194304) {
    try {
      return String(await $.fs.read(f.ruta))
    } catch {
      // un subagente que se acaba de borrar
      return ''
    }
  }
  const clave = `${f.size}:${f.mtimeMs}`
  const guardada = grandes.get(f.ruta)
  if (guardada?.clave === clave) return guardada.texto
  const guion = `$ruta = '${f.ruta.replace(/\//g, '\\').replace(/'/g, "''")}'\n${ADELGAZA}`
  let texto = ''
  try {
    const p = $.process.spawn({ argv: ['powershell.exe', '-NoProfile', '-NonInteractive', '-EncodedCommand', powershellCodificado(guion)] })
    for await (const trozo of p) if (trozo.stream === 'stdout') texto += trozo.text
  } catch {
    return ''
  }
  grandes.set(f.ruta, { clave, texto })
  return texto
}
// Lo de sus transcripciones: sus tokens (tokens.ts), cada día y cada hora, y el total; y lo de toda la sesión para el
// bloque de Marty (sesion.ts), también de las sesiones de las que sigue: sus ratos de trabajo, lo que gastó cada uno y
// los archivos que ha tocado. Solo si han cambiado, y como mucho cada dos minutos (o al acabar un turno): leerlas cuesta
// unos 0,1 s por cada 25 MB. Las órdenes ya miradas no se vuelven a mirar
let proyecto: string | null = null
let huellaTokens = ''
let tokensCuando = 0
const ordenesVistas = new Set<string>()
const tocadosTodos = new Set<string>()
async function alDiaSesion($: any, ya = false) {
  const ahora = await $.clock.now()
  if (!ya && ahora - tokensCuando < 120000) return
  tokensCuando = ahora
  const c = await casa($)
  const id = await $.session.id()
  const t = await transcripcionesDe($, c, id, proyecto)
  proyecto = t.proyecto
  if (!t.archivos.length) return
  const lee = (f: Transcripcion) => leeTranscripcion($, f)
  const suyos = await Promise.all(t.archivos.map(lee))
  // las de antes: la que dice su resumen y, si aquella seguía de otra, también esa
  const antes: { texto: string; principal: boolean }[] = []
  const vistas = new Set([id.toLowerCase()])
  let huella = t.archivos.map(f => `${f.ruta}:${f.size}:${f.mtimeMs}`).join('|')
  let pendientes = anterioresDe(suyos[0] ?? '', id)
  while (pendientes.length && vistas.size < 6) {
    const otro = pendientes.shift() as string
    if (vistas.has(otro)) continue
    vistas.add(otro)
    const o = await transcripcionesDe($, c, otro, proyecto)
    huella += `|${o.archivos.map(f => `${f.ruta}:${f.size}:${f.mtimeMs}`).join('|')}`
    const textos = await Promise.all(o.archivos.map(lee))
    textos.forEach((texto, i) => antes.push({ texto, principal: i === 0 }))
    pendientes = [...pendientes, ...anterioresDe(textos[0] ?? '', otro)]
  }
  if (huella === huellaTokens) return
  huellaTokens = huella
  const tk = tokensDe(suyos)
  const an = analiza([...antes, ...suyos.map((texto, i) => ({ texto, principal: i === 0 }))])
  await tocados($, an, ordenesVistas, tocadosTodos, ahora, norm(c))
  let empezo: number | undefined
  try {
    empezo = (await $.session.usage()).startedAt
  } catch {
    empezo = undefined
  }
  const sesion = resumenDe(an, tocadosTodos.size, empezo)
  await cambiaRegistro($, r => {
    const dias = { ...r.dias }
    for (const [dia, tokH] of Object.entries(tk.dias)) {
      const x = dias[dia] ?? { usd: 0, hechos: [] }
      dias[dia] = { ...x, tok: tokH.reduce((a, b) => a + b, 0), tokH }
    }
    return { ...r, tok: tk.total, dias, sesion }
  })
}
// Escribe en la caja del mensaje donde esté el cursor, sin borrar lo que hubiera (28-oct: «que inserte ese texto
// sin borrarme lo del chat»; antes iba encima, con el modo «replace»), con un espacio a cada lado si quedaría pegado a
// otra palabra; si no la coge, lo copia
async function escribe($: any, texto: string, surface?: string) {
  let puesto = false
  try {
    const caja = await $.prompt.read()
    const antes = caja.text.slice(0, caja.cursor)
    const despues = caja.text.slice(caja.cursor)
    const t = `${antes && !/\s$/.test(antes) ? ' ' : ''}${texto}${despues && !/^\s/.test(despues) && !/\s$/.test(texto) ? ' ' : ''}`
    const r = await $.prompt.fill({ text: t, mode: 'insert' })
    puesto = r?.isFilled !== false
  } catch {
    puesto = false
  }
  if (puesto) {
    await update($, aviso, () => `Puesto en tu mensaje: ${texto.trim()}`)
    return
  }
  await copia($, texto, surface)
}
async function copia($: any, texto: string, surface?: string) {
  try {
    await $.ui.copy({ text: texto, surface })
  } catch {
    // sin portapapeles: queda en el aviso
  }
  await update($, aviso, () => `Copiado: ${texto.length > 120 ? `${texto.slice(0, 119)}…` : texto}`)
}
async function abre($: any, url: string) {
  try {
    await $.process.run(['cmd', '/c', 'start', '', url])
  } catch {
    avisa($, `No se pudo abrir ${url}`)
  }
}
// Lo que abre un botón de la franja, con su ruta de atajos.ts («~», la carpeta del usuario); si no está, el aviso dice
// dónde se cambia
async function atajo($: any, ruta: string, abrir: (r: string) => Promise<void>) {
  const usuario = (await casa($)).replace(/\/\.claude$/, '')
  const r = ruta.replace(/^~(?=[\\/]|$)/, usuario).replace(/\//g, '\\')
  try {
    await $.fs.stat(r)
  } catch {
    avisa($, `No encuentro ${r}: cambia su ruta en hooks/atajos.ts`)
    return
  }
  avisa($, `Abriendo ${nombreDe(r)}…`)
  await abrir(r)
}
// «Mods» (28-oct): deja «/reload-plugins» escrito en la caja de cada sesión abierta, para que lo mandes tú: la
// app no deja que un mod lo lance («isn't available over a remote connection»). Aquí, ya; en las demás, con la marca de
// recarga, que su mod entiende si ya es de esta versión (su ficha lo dice); las de antes, a mano. La que está
// trabajando, al acabar su turno
const RECARGAR = '/reload-plugins'
let recargaPendiente = false
async function recargaTodas($: any, surface?: string) {
  const vivas = await read($, otras)
  const nuevas = vivas.filter(f => f.recarga)
  for (const f of nuevas) {
    try {
      await $.session.send({ to: { sessionId: f.id }, text: RECARGA })
    } catch {
      // esa, a mano
    }
  }
  const viejas = vivas.length - nuevas.length
  avisa($, `Pulsa Enter en la caja para recargar el mod${nuevas.length ? `; en ${nuevas.length === 1 ? 'la otra sesión' : `las otras ${nuevas.length}`}, ` +
    'te lo dejo escrito cuando acaben lo que estén haciendo' : ''}` +
    `${viejas ? `; ${viejas === 1 ? 'una sesión es de antes y hay que recargarla' : `${viejas} sesiones son de antes y hay que recargarlas`} a mano` : ''}.`)
  await pideRecarga($, surface)
}
// La recarga, en la caja de esta sesión: si trabaja, al acabar su turno; si tienes algo escrito, no lo pisa (te lo copia
// para que lo pegues tú)
async function pideRecarga($: any, surface?: string) {
  if ((await read($, estado)) === 'trabajando') {
    recargaPendiente = true
    return
  }
  recargaPendiente = false
  let caja = { text: '', cursor: 0 }
  try {
    caja = await $.prompt.read()
  } catch {
    // sin caja: se copia
  }
  if (!caja.text.trim()) {
    try {
      const r = await $.prompt.fill({ text: RECARGAR, mode: 'replace' })
      if (r?.isFilled !== false) {
        await update($, aviso, () => `Escrito ${RECARGAR}: pulsa Enter para recargar el mod`)
        return
      }
    } catch {
      // sin caja: se copia
    }
  }
  await copia($, RECARGAR, surface)
  avisa($, `Para recargar el mod, manda ${RECARGAR} (copiado) cuando tengas la caja libre.`)
}
// Lo que dice un mensaje de otra sesión, sin el marco con el que llega («Another Claude session sent a message:
// <cross-session-message …>…</cross-session-message>»): sin quitarlo, la marca de recarga no se reconocía (28-oct)
const cuerpoDe = (texto: string) =>
  (/<cross-session-message[^>]*>\s*([\s\S]*?)\s*<\/cross-session-message>/.exec(texto)?.[1] ?? texto).trim()
// El freno de choques: si otra sesión está tocando ese archivo en su turno, esta espera (la respuesta es el { deny }) y
// aquella se entera; si no, el archivo queda apuntado en la ficha mientras dure el turno, y entre los tocados. Sin el
// freno de archivos (lo elegido al instalar, ajustes.ts), se apunta igual y no espera: el panel sigue diciendo quién
// toca lo mismo
async function frena($: any, x: { file_path?: string; notebook_path?: string }): Promise<{ deny: string } | null> {
  const ruta = norm(String(x.file_path ?? x.notebook_path ?? ''))
  const r = await read($, ficha)
  if (!ruta || !r) return null
  const ahora = await $.clock.now()
  const todas = await leeTodas($)
  const otro = todas.find(
    o => o.id !== r.id && o.estado === 'trabajando' && o.archivos.some(a => a.ruta === ruta && ahora - a.desde < RETIENE),
  )
  const nombre = nombreDe(ruta)
  if (!otro || AJUSTES.frenos !== 'los-dos') {
    await cambiaFicha($, y => ({
      ...y,
      espera: null,
      archivos: [...y.archivos.filter(a => a.ruta !== ruta), { ruta, desde: ahora }],
      tocados: [...(y.tocados ?? []).filter(t => t !== ruta), ruta].slice(-300),
    }))
    return null
  }
  if (!r.espera || norm(r.espera.ruta) !== ruta) {
    const original = String(x.file_path ?? x.notebook_path ?? ruta)
    await cambiaFicha($, y => ({ ...y, espera: { ruta: original, de: otro.tag, desde: ahora } }))
    await refresca($)
    try {
      await $.session.send({
        to: { sessionId: otro.id },
        text: `D-137: ${nombreTag(r.tag)} (${r.rotulo}) quiere escribir en ${nombre}, que estás tocando tú (${nombreTag(otro.tag)}). Cuando acabes con él, díselo.`,
      })
    } catch {
      // si no llega el aviso, el panel ya lo cuenta
    }
  }

  return {
    deny: `D-137: ${nombreTag(otro.tag)} (${otro.rotulo}) está escribiendo en ${nombre} ahora mismo. Espera a que termine (ya le he avisado de que esperas) y vuelve a intentarlo después.`,
  }
}
// El freno de git: un restore, checkout, switch, stash, clean o reset --hard en un repo donde otra sesión tiene cambios
// sin commit se para una vez, con la lista; si Claude la repite en el mismo turno, tras comprobarlo, pasa
async function frenoGit($: any, orden: string): Promise<{ deny: string } | null> {
  const clave = orden.trim()
  if (avisadas.has(clave)) return null
  const quita = (s: string) => s.replace(/^["']|["']$/g, '')
  const conC = DESHACE.exec(orden)?.[1]
  const cd = /^\s*(?:cd|Set-Location|Push-Location)\s+("[^"]*"|'[^']*'|\S+)\s*(?:&&|;)/i.exec(orden)?.[1]
  const dir = conC ? quita(conC) : cd ? quita(cd) : String(await $.session.cwd())
  let raiz = ''
  let cambios = new Set<string>()
  try {
    const top = await $.process.run(['git', '-C', dir, 'rev-parse', '--show-toplevel'])
    if (top.exitCode !== 0) return null
    raiz = norm(top.stdout.trim())
    const st = await $.process.run(['git', '-C', raiz, '-c', 'core.quotePath=false', 'status', '--porcelain'])
    cambios = new Set(String(st.stdout).split(/\r?\n/).filter(Boolean).map((l: string) => {
      const p = (l.slice(3).split(' -> ').pop() ?? '').replace(/^"|"$/g, '')
      return norm(`${raiz}/${p}`)
    }))
  } catch {
    return null
  }
  const yo = await read($, ficha)
  const ajenos = (await leeTodas($))
    .filter(f => f.id !== yo?.id)
    .map(f => ({ f, suyos: (f.tocados ?? []).filter(t => cambios.has(t)) }))
    .filter(x => x.suyos.length)
  if (!ajenos.length) return null
  avisadas.add(clave)
  const lista = ajenos
    .map(({ f, suyos }) => `${nombreTag(f.tag)} (${f.rotulo}): ${suyos.slice(0, 3).map(nombreDe).join(', ')}${suyos.length > 3 ? ` y ${suyos.length - 3} más` : ''}`)
    .join('; ')

  return {
    deny: `D-137: en este repo hay cambios sin commit de otra sesión, ${lista}. Un restore, checkout o stash se los llevaría. Comprueba con git status y git diff qué es de quién y deshaz solo lo tuyo; si de verdad hay que hacerlo así, repite la misma orden.`,
  }
}
// Lo que sigue en marcha: la ficha publica lo que corre y lo que acabó hace poco, sin la ruta de su salida
async function publicaMarcha($: any, lista: Tarea[]) {
  const limpia = (t: Tarea) => {
    const { salida: _salida, ...resto } = t
    return resto
  }
  await cambiaFicha($, f => ({ ...f, marcha: lista.filter(t => !t.fin).map(limpia), acabadas: lista.filter(t => t.fin).map(limpia) }))
}
async function apuntaTarea($: any, t: Tarea) {
  const nueva = [...(await read($, marcha)).filter(x => x.id !== t.id), t]
  await update($, marcha, () => nueva)
  await publicaMarcha($, nueva)
}
async function acabaTarea($: any, id: string, como: string) {
  const ahora = await $.clock.now()
  const lista = await read($, marcha)
  if (!lista.some(t => t.id === id && !t.fin)) return
  const nueva = lista.map(t => (t.id === id ? { ...t, fin: ahora, estado: como } : t))
  await update($, marcha, () => nueva)
  await publicaMarcha($, nueva)
}
// Cada pocos segundos: la última línea de cada orden en segundo plano, los agentes que lleva el motor, y fuera lo que
// acabó hace más de dos horas
async function alDiaMarcha($: any) {
  const ahora = await $.clock.now()
  const lista = await read($, marcha)
  let cambio = false
  const nueva: Tarea[] = []
  for (const t of lista) {
    if (t.fin) {
      if (ahora - t.fin > 2 * 3600000) cambio = true
      else nueva.push(t)
      continue
    }
    let linea = t.linea
    if (t.salida) {
      try {
        linea = ultimaLinea(await $.fs.read(t.salida))
      } catch {
        // más de 4 MB, o ya no está
      }
    }
    const salio = /^\[(?:exited with code (\d+)|killed)\]$/.exec(linea ?? '')
    if (salio) {
      nueva.push({ ...t, fin: ahora, estado: salio[1] === undefined ? 'killed' : salio[1] === '0' ? 'completed' : 'failed' })
      cambio = true
      continue
    }
    if (linea !== t.linea) cambio = true
    nueva.push(linea === t.linea ? t : { ...t, linea })
  }
  try {
    for (const g of (await $.agent.list()) as { id: string; description: string; status: string }[]) {
      const vivo = g.status === 'running' || g.status === 'pending'
      const i = nueva.findIndex(t => t.id === g.id)
      const suya = nueva[i]
      if (vivo && !suya) {
        if (!vistosAgentes.has(g.id)) vistosAgentes.set(g.id, ahora)
        nueva.push({ id: g.id, que: g.description || 'Agente', tipo: 'agente', desde: vistosAgentes.get(g.id) ?? ahora })
        cambio = true
      } else if (!vivo && suya && !suya.fin) {
        nueva[i] = { ...suya, fin: ahora, estado: g.status }
        cambio = true
      }
    }
  } catch {
    // sin lista de agentes
  }
  if (cambio) {
    await update($, marcha, () => nueva)
    await publicaMarcha($, nueva)
  }
}
// Lo entregado: lo que crea o envía Claude, y lo que te da en el chat para abrir con «Run», salvo su trabajo interno
// (su temporal, si no lo envía, y sus transcripciones)
async function apuntaEntrega($: any, ruta: string, tipo: 'creado' | 'enviado' | 'chat') {
  if (!ruta) return
  const entera = /^[a-z]:[\\/]|^[\\/]/i.test(ruta) ? ruta : `${String(await $.session.cwd()).replace(/[\\/]+$/, '')}\\${ruta}`
  const n = norm(entera)
  if (n.includes('/.claude/projects/') || (tipo === 'creado' && n.includes('/scratchpad/'))) return
  const cuando = await $.clock.now()
  await update($, entregas, l => [...l.filter(x => norm(x.ruta) !== n), { ruta: entera, tipo, cuando }].slice(-30))
}
// Los pasos que publica la ficha: los hechos y el total, del plan (o de los hitos sueltos)
async function publicaPasos($: any) {
  const l = vistaPasos(await read($, plan), await read($, pasos), (await read($, estado)) === 'trabajando')
  const n: [number, number] = [l.filter(p => p.estado === 'hecho').length, l.length]
  await cambiaFicha($, f => (f.pasosN?.[0] === n[0] && f.pasosN?.[1] === n[1] ? f : { ...f, pasosN: n }))
}
// Abre una ventana de PowerShell que sigue en vivo la salida de una orden en segundo plano (las órdenes en segundo plano
// no tienen terminal propia: su salida va a un archivo). La orden va codificada, para que las rutas no rompan las comillas
function base64(bytes: number[]): string {
  const abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let s = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const [a, b, c] = [bytes[i] ?? 0, bytes[i + 1] ?? 0, bytes[i + 2] ?? 0]
    const n = (a << 16) | (b << 8) | c
    s += abc[(n >> 18) & 63]! + abc[(n >> 12) & 63]! + (i + 1 < bytes.length ? abc[(n >> 6) & 63]! : '=') + (i + 2 < bytes.length ? abc[n & 63]! : '=')
  }
  return s
}
function powershellCodificado(orden: string): string {
  const bytes: number[] = []
  for (let i = 0; i < orden.length; i += 1) {
    const c = orden.charCodeAt(i)
    bytes.push(c & 255, c >> 8)
  }
  return base64(bytes)
}
async function sigueSalida($: any, t: Tarea) {
  if (!t.salida) return
  const q = (s: string) => s.replace(/'/g, "''")
  const orden = `$host.UI.RawUI.WindowTitle = 'D-137 · ${q(t.que.slice(0, 60))}'; Get-Content -LiteralPath '${q(t.salida)}' -Wait -Tail 60`
  try {
    await $.process.run(['cmd', '/c', 'start', '', 'powershell', '-NoExit', '-EncodedCommand', powershellCodificado(orden)])
  } catch {
    avisa($, 'No se pudo abrir la terminal de esa orden.')
  }
}

// Abre lo entregado: su carpeta, con el archivo marcado, o el archivo en su programa. Con su programa, el código se
// ejecuta (en este PC, un .py va a py.exe y un .js a WScript): lo que no sea un documento, una imagen o un sonido se
// abre en VS Code o, sin él, en el Bloc de notas. Por PowerShell y codificado: explorer.exe /select quiere las comillas
// alrededor de la ruta, no del argumento entero, y una ruta con espacios las rompería
const DOCUMENTO = /\.(html?|pdf|md|txt|csv|docx?|xlsx?|pptx?|jpe?g|png|gif|webp|avif|svg|bmp|tiff?|heic|mp4|mov|mkv|webm|avi|mp3|wav|flac|m4a|ogg|aiff?)$/i
// Lo que Claude te dio en el chat (comoRun) se abre como con su «Run»: explorer.exe con la ruta (un .cmd, se ejecuta)
async function abreArchivo($: any, ruta: string, carpeta: boolean, comoRun = false) {
  const r = `'${ruta.replace(/\//g, '\\').replace(/'/g, "''")}'`
  const abrir = carpeta
    ? `Start-Process explorer.exe -ArgumentList ('/select,"' + $r + '"')`
    : comoRun
    ? `Start-Process explorer.exe -ArgumentList ('"' + $r + '"')`
    : DOCUMENTO.test(ruta)
      ? 'Invoke-Item -LiteralPath $r'
      : "$c = Get-Command code -ErrorAction SilentlyContinue; $e = if ($c) { Join-Path (Split-Path (Split-Path $c.Source)) 'Code.exe' } else { '' }; " +
        "if ($e -and (Test-Path $e)) { Start-Process $e -ArgumentList ('\"' + $r + '\"') } else { Start-Process notepad.exe -ArgumentList ('\"' + $r + '\"') }"
  const orden = `$r = ${r}; if (-not (Test-Path -LiteralPath $r)) { exit 3 }; ${abrir}`
  try {
    const x = await $.process.run(['powershell.exe', '-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-EncodedCommand', powershellCodificado(orden)])
    if (x.exitCode === 3) avisa($, `Ya no está: ${nombreDe(ruta)}`)
    else if (x.exitCode !== 0) avisa($, `No se pudo abrir ${nombreDe(ruta)}`)
  } catch {
    avisa($, `No se pudo abrir ${nombreDe(ruta)}`)
  }
}

// Lo que hacen los botones del panel
function acciones($: any): Acciones {
  const pon = (k: keyof Datos['ui'], v: unknown) => {
    // cualquier otra pulsación cancela un «Cerrar» a medio confirmar
    if (k !== 'confirma') void update($, confirma, () => '')
    switch (k) {
      case 'pestana':
        void update($, pestana, () => v as Pestana)
        void update($, aviso, () => '')
        void apuntaPestana($, v as Pestana)
        break
      case 'abiertos': void update($, abiertos, () => v as Record<string, boolean>); break
      case 'repoSel': void update($, repoSel, () => v as string | null); break
      case 'elegida': void update($, elegida, () => v as string | null); break
      case 'filtro': void update($, filtro, () => String(v)); break
      case 'tocaSel': void update($, tocaSel, () => v as string | null); break
      case 'tocaPaso': void update($, tocaPaso, () => Number(v) || 0); break
      case 'elecciones': void update($, elecciones, () => v as Record<string, number>); break
      case 'mandadas': void update($, mandadas, () => v as Record<string, Mandada>); break
      case 'vistos': void update($, vistos, () => v as string[]); break
      case 'marchaVista': void update($, marchaVista, () => String(v)); break
      case 'marchaTipo': void update($, marchaTipo, () => String(v)); break
      case 'cuandoModo': void update($, cuandoModo, () => String(v)); break
      case 'diaModo': void update($, diaModo, () => String(v)); break
      case 'unidad': void update($, unidad, () => String(v)); break
      case 'confirma': void update($, confirma, () => String(v)); break
      default: break
    }
  }
  const manda = async (f: Ficha) => {
    const d = await datos($, 0)
    const decs = decisionesDe(f)
    const texto = respuestaDe(d, f, decs)
    const yo = await read($, ficha)
    try {
      // la de esta sesión, como mensaje suyo (sin el «The d-137 plugin sent a message:» que le pone delante la app), y
      // fuera del panel ya, aunque Claude esté trabajando y la respuesta espere su turno (28-oct)
      if (f.id === yo?.id) {
        await $.prompt.submit({ text: `${RESPUESTA}: ${texto}`, asUser: true })
        await quitaDecisiones($)
      } else await $.session.send({ to: { sessionId: f.id }, text: `${MARCA}${texto}` })
    } catch {
      avisa($, `No se pudo mandar a ${nombreTag(f.tag)}: cópialo y pégalo allí.`)
      await copia($, texto)
      return
    }
    const ahora = await $.clock.now()
    const elegidas = decs.map((dec, i) => {
      const k = d.ui.elecciones[`${f.id}#${i}`]
      const otra = (TEXTOS[`${f.id}#${i}`] ?? '').trim()
      if (k === -1 && otra) return `Otra: ${otra}`
      const j = typeof k === 'number' && k >= 0 ? k : dec.recomendada
      return `${letra(j)}) ${dec.opciones[j] ?? ''}`
    })
    await update($, mandadas, m => ({ ...m, [f.id]: { texto, cuando: ahora, decisiones: decs, elegidas, turno: f.turno } }))
    await update($, elecciones, e => Object.fromEntries(Object.entries(e).filter(([k]) => !k.startsWith(`${f.id}#`))))
    await update($, tocaSel, () => null)
    await update($, tocaPaso, () => 0)
    await update($, aviso, () => `Mandado a ${nombreTag(f.tag)} ${f.rotulo}: «${texto}»`)
  }
  return {
    ui: (k, v) => pon(k, v),
    alterna: clave => {
      void update($, confirma, () => '')
      void update($, abiertos, a => ({ ...a, [clave]: !(a[clave] ?? DESPLEGADOS.includes(clave)) }))
    },
    copia: (texto, surface) => {
      void copia($, texto, surface)
    },
    escribe: (texto, surface) => {
      void escribe($, texto, surface)
    },
    abreSesion: f => {
      void (async () => {
        const yo = await read($, ficha)
        if (f.id === yo?.id) avisa($, 'Es esta misma sesión.')
        else {
          if (!enlaceDeFicha(f)) ESCRITORIO = await idsEscritorio($)
          const url = enlaceDeFicha(f)
          if (url) await abre($, url)
          else avisa($, `No encuentro el enlace de ${nombreTag(f.tag)}: ábrela desde la barra de la app.`)
        }
      })()
    },
    abreRuta: (ruta, comoRun) => {
      void abreArchivo($, ruta, false, comoRun === true)
    },
    abreCarpeta: ruta => {
      void abreArchivo($, ruta, true)
    },
    limpiaEntregas: () => {
      void update($, entregas, () => [])
    },
    avisa: (f, texto) => {
      void (async () => {
        try {
          await $.session.send({ to: { sessionId: f.id }, text: texto })
          await update($, aviso, () => `Avisado ${nombreTag(f.tag)} ${f.rotulo}.`)
        } catch {
          avisa($, `No se pudo avisar a ${nombreTag(f.tag)}.`)
        }
      })()
    },
    elige: (id, i, k) => {
      void (async () => {
        await update($, elecciones, e => ({ ...e, [`${id}#${i}`]: k }))
        await update($, tocaPaso, () => i + 1)
      })()
    },
    texto: (clave, valor) => {
      TEXTOS[clave] = valor
    },
    manda: f => {
      void manda(f)
    },
    mandaTodo: () => {
      void (async () => {
        for (const f of pendientesDe(await datos($, 0)).pendientes) await manda(f)
      })()
    },
    desmanda: id => {
      void (async () => {
        await update($, mandadas, m => Object.fromEntries(Object.entries(m).filter(([k]) => k !== id)))
        await update($, tocaSel, () => id)
        await update($, tocaPaso, () => 0)
      })()
    },
    // Cerrar una sesión parada es archivarla en la app (se puede recuperar desde «Archivadas»): el primer clic solo
    // pregunta, y solo «Sí, cerrar» la cierra; la pregunta se cancela sola a los seis segundos
    cierra: (f, seguro) => {
      void (async () => {
        const clave = `cerrar-${f.id}`
        if (!seguro || (await read($, confirma)) !== clave) {
          await update($, confirma, () => clave)
          $.clock.after(6000, () => {
            void update($, confirma, c => (c === clave ? '' : c))
          })
          return
        }
        await update($, confirma, () => '')
        if (!enlaceDeFicha(f)) ESCRITORIO = await idsEscritorio($)
        const id = enlaceDeFicha(f)?.split('/').pop()
        if (!id) {
          avisa($, `${nombreTag(f.tag)} aún no tiene enlace: ciérrala desde la app.`)
          return
        }
        try {
          const r = await $.mcp.call('ccd_session_mgmt', 'archive_session', { session_id: id, reason: `D-137: ${nombreTag(f.tag)} ${f.rotulo}, parada sin tarea` })
          const texto = ((r?.content ?? []) as { type: string; text?: string }[]).map(c => c.text ?? '').join(' ').trim()
          await update($, aviso, () => (r?.isError ? `No se pudo cerrar ${nombreTag(f.tag)}: ${texto}` : `${nombreTag(f.tag)} ${f.rotulo}, archivada (se recupera desde «Archivadas»).`))
        } catch (err) {
          await update($, aviso, () => `No se pudo cerrar ${nombreTag(f.tag)} desde aquí: ciérrala en la app. (${String(err).slice(0, 80)})`)
        }
      })()
    },
    visto: ids => {
      void update($, vistos, v => [...v, ...ids.filter(x => !v.includes(x))].slice(-300))
    },
    lanza: que => {
      if (que.startsWith('salida:')) void $.process.run(['notepad.exe', que.slice(7)]).catch(() => undefined)
    },
    // Limpiar los pasos: fuera los hechos; si no queda ninguno por hacer, el plan entero
    limpiaPasos: () => {
      void (async () => {
        const pl = await read($, plan)
        const ps = await read($, pasos)
        const hechos = new Set(ps.filter(p => p.hito && p.hasta).map(p => p.texto))
        const queda = pl.filter(x => !hechos.has(x))
        // con un paso en marcha, se quedan los que faltan; si no, la lista entera se va
        const vivo = ps.some(p => p.hito && !p.hasta)
        await update($, plan, () => (vivo ? queda : []))
        await update($, pasos, l => l.filter(p => !(p.hito && (p.hasta || !vivo))))
        await publicaPasos($)
      })()
    },
    // Limpiar lo acabado: lo de esta sesión sale de su lista; lo de las demás, de la vista (como «Visto»)
    limpiaAcabadas: ids => {
      void (async () => {
        const nueva = (await read($, marcha)).filter(x => !x.fin)
        await update($, marcha, () => nueva)
        await publicaMarcha($, nueva)
        await update($, vistos, v => [...v, ...ids.filter(x => !v.includes(x))].slice(-300))
      })()
    },
    verSalida: t => {
      void sigueSalida($, t)
    },
    prueba: texto => {
      void update($, aviso, () => texto)
    },
    // Parar una orden o un agente de esta sesión, con la herramienta del motor; pide confirmarlo
    para: (t, seguro) => {
      void (async () => {
        const clave = `parar-${t.id}`
        if (!seguro || (await read($, confirma)) !== clave) {
          await update($, confirma, () => clave)
          $.clock.after(6000, () => {
            void update($, confirma, c => (c === clave ? '' : c))
          })
          return
        }
        await update($, confirma, () => '')
        try {
          await $.tool.call({ tool: 'TaskStop', task_id: t.id })
          await acabaTarea($, t.id, 'killed')
          await update($, aviso, () => `Parada: ${t.que}`)
        } catch (err) {
          await update($, aviso, () => `No se pudo parar «${t.que}»: ${String(err).slice(0, 80)}`)
        }
      })()
    },
  }
}

async function datos($: any, cols: number, surface = 'desktop'): Promise<Datos> {
  const [est, lista, loHecho, t0, t1, msg, yo, resto, cu, tareas, dado, g, regs, glo, pl] = await Promise.all([
    read($, estado), read($, pasos), read($, hecho), read($, inicio), read($, fin), read($, aviso),
    read($, ficha), read($, otras), read($, cuota), read($, marcha), read($, entregas), read($, gasto), read($, registros),
    read($, global), read($, plan),
  ])
  const [pe, ab, rs, el, fi, ts, tp, ec, md, vi, mv, mt, cm, dm, un, cf] = await Promise.all([
    read($, pestana), read($, abiertos), read($, repoSel), read($, elegida), read($, filtro), read($, tocaSel),
    read($, tocaPaso), read($, elecciones), read($, mandadas), read($, vistos), read($, marchaVista), read($, marchaTipo),
    read($, cuandoModo), read($, diaModo), read($, unidad), read($, confirma),
  ])
  const ui: Datos['ui'] = {
    pestana: pe, abiertos: ab, repoSel: rs, elegida: el, filtro: fi, tocaSel: ts, tocaPaso: tp, elecciones: ec,
    mandadas: md, vistos: vi, marchaVista: mv, marchaTipo: mt, cuandoModo: cm, diaModo: dm, unidad: un, confirma: cf,
    textos: TEXTOS,
  }
  return {
    ahora: await $.clock.now(), cols, surface, yo, otras: resto, est, pasos: lista, t0, t1, hecho: loHecho, entregas: dado,
    gasto: g, marcha: tareas, cuota: cu, global: glo, registros: regs, plan: pl, aviso: msg, ui,
  }
}

export const register: Register = (on, opciones) => {
  // lo elegido al instalar (qué sesiones van juntas y qué frenos): un cambio en /config vuelve a cargar el mod
  leeAjustes(opciones)
  on('session.start', async ($, e, next) => {
    const id = await $.session.id()
    const ahora = await $.clock.now()
    let r = await read($, ficha)
    if (!r || r.id !== id) {
      const todas = await leeTodas($)
      const mia = todas.find(x => x.id === id)
      if (mia) r = mia
      else {
        const usados = new Set(todas.map(x => x.tag))
        const s = await datosSesion($)
        const nombre = s.name ?? ''
        const rotulo = rotuloDe(nombre, nombreDe(await $.session.root()))
        r = {
          id, tag: eligeTag(id, usados) ?? 'M-08', nombre, rotulo, desde: ahora, latido: ahora,
          estado: 'esperando', turno: 0, paso: '', toca: [], archivos: [], espera: null,
        }
      }
    }
    const lista: Ficha = { ...r, latido: ahora, cerrada: false, v: 2, recarga: true }
    await update($, ficha, () => lista)
    await guarda($, lista)
    try {
      miRegistro = JSON.parse(await $.fs.read(`${await carpeta($)}/registro/${id}.json`)) as Registro
    } catch {
      miRegistro = null
    }
    await alDia($)
    ESCRITORIO = await idsEscritorio($)
    await refresca($)
    void alDiaRepo($)
    void alDiaCuota($)
    void leeRegistros($).then(l => update($, registros, () => l))
    void llevaCuota($)
    void alDiaSesion($, true)
    await $.tool.register({ name: 'progreso', description: DESCRIPCION, inputSchema: ESQUEMA })
    await $.command.register({ name: 'marty', description: 'Abre el panel «D-137», en esta sesión' })
    await $.command.register({ name: 'd-137', description: 'Abre el panel «D-137», en todas las sesiones' })
    await $.command.register({
      name: 'rotulo',
      description: 'Cambia el rótulo de esta sesión en los paneles (sin texto, vuelve a su nombre)',
      argumentHint: '[texto]',
    })
    void $.ui.open({ id: PANE, title: 'D-137' })
    let latidos = 0
    $.clock.every(LATIDO, () => {
      void (async () => {
        const ya = await $.clock.now()
        await cambiaFicha($, x => ({ ...x, latido: ya }))
        latidos += 1
        if (latidos % 2 === 0) await alDiaMarcha($)
        await refresca($)
        if (latidos % 10 === 0) {
          await alDia($)
          await alDiaCuota($)
          await alDiaRepo($)
          ESCRITORIO = await idsEscritorio($)
          const l = await leeRegistros($)
          await update($, registros, () => l)
          await llevaCuota($)
          await alDiaSesion($)
        }
      })()
    })
    void sigueVista($)
    $.clock.every(1000, () => {
      void sigueVista($)
      $.ui.invalidate('ui.render')
    })

    return next(e)
  })

  on('command.run', { command: 'marty' }, async $ => {
    await update($, pestana, () => 'marty' as Pestana)
    await apuntaPestana($, 'marty')
    await $.ui.open({ id: PANE, title: 'D-137' })

    return { text: 'Panel «D-137» abierto, en esta sesión.' }
  })

  on('command.run', { command: 'd-137' }, async $ => {
    await update($, pestana, () => 'doc' as Pestana)
    await apuntaPestana($, 'doc')
    await $.ui.open({ id: PANE, title: 'D-137' })

    return { text: 'Panel «D-137» abierto, en todas las sesiones.' }
  })

  on('command.run', { command: 'rotulo' }, async ($, e) => {
    const texto = e.args.trim()
    if (texto) await cambiaFicha($, x => ({ ...x, rotulo: texto, propio: true }))
    else {
      await cambiaFicha($, x => ({ ...x, propio: false }))
      await alDia($)
    }
    await refresca($)
    const ahora = await read($, ficha)

    return {
      text: texto
        ? `El rótulo de esta sesión dice ahora «${texto}».`
        : `El rótulo vuelve a salir del nombre de la sesión: «${ahora?.rotulo ?? ''}».`,
    }
  })

  // Los turnos de los subagentes también pasan por aquí (con su agentId): el estado, los pasos y el plan son del bucle
  // principal, y su gasto ya lo suma el coste de la sesión (28-oct: al empezar uno se borraban los pasos, y al
  // acabar la sesión salía como esperando a mitad de su turno)
  on('turn.start', async ($, e, next) => {
    if (e.agentId !== undefined) return next(e)
    const ahora = await $.clock.now()
    hito = false
    avisadas = new Set()
    const u = await uso($)
    const pl = await read($, plan)
    const previos = (await read($, pasos)).filter(p => p.hito)
    const acabado = pl.length > 0 && pl.every(x => previos.some(h => h.texto === x && h.hasta))
    if (!pl.length || acabado) {
      await update($, plan, () => [])
      await update($, pasos, () => [])
    } else {
      await update($, pasos, () => previos)
      hito = previos.some(h => !h.hasta)
    }
    await update($, estado, () => 'trabajando' as Estado)
    // Las decisiones siguen pendientes hasta que las contesta (26-oct): se quitan si este turno es su respuesta
    // desde el panel (las que contesta en el chat, al llegar su mensaje, en prompt.submit); si no, solo cuando Claude
    // manda otras, o ninguna. La respuesta se busca al principio, no en la primera letra: a lo que manda el mod sin ir
    // como suyo, la app le pone delante «The d-137 plugin sent a message:», y así no se quitaban nunca (28-oct:
    // «ya mandé la respuesta por el propio mod y siguen pendientes»)
    const respuesta = /Respuesta desde el panel D-137/.test(String((e as { text?: unknown }).text ?? '').slice(0, 300))
    // y de su ficha también, ya: si no, en Decisión (aquí y en las demás sesiones) seguían como pendientes hasta acabar el
    // turno (26-oct: «ya le mandé esto y me sigue saliendo como pendiente»)
    if (respuesta) await quitaDecisiones($)
    await update($, hecho, () => '')
    await update($, aviso, () => '')
    await update($, inicio, () => ahora)
    await apuntaGasto($, u.usd)
    await cambiaFicha($, x => ({
      ...x, estado: 'trabajando', turno: ahora, paso: '', ...(respuesta ? { toca: [], decisiones: [] } : {}), archivos: [],
    }))
    await publicaPasos($)
    await alDia($)

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId !== undefined) return next(e)
    const ahora = await $.clock.now()
    await update($, estado, () => 'terminado' as Estado)
    await update($, fin, () => ahora)
    const decs = await read($, toca)
    const u = await uso($)
    await update($, cuota, () => u.cuota)
    const loHecho = await read($, hecho)
    await update($, pasos, ps => ps.map(p => (p.hasta || p.hito ? p : { ...p, hasta: ahora })))
    const l = vistaPasos(await read($, plan), await read($, pasos), false)
    await cambiaFicha($, x => ({
      ...x, estado: 'esperando', turno: ahora, paso: '', toca: decs.map(d => d.titulo), decisiones: decs, archivos: [],
      espera: null, usd: u.usd ?? x.usd, contexto: u.contexto ?? x.contexto, hecho: loHecho || x.hecho,
      pasosN: [l.filter(p => p.estado === 'hecho').length, l.length],
    }))
    await apuntaGasto($, u.usd)
    await apuntaHecho($, loHecho)
    const hoy = await gastoHoy($, u.usd)
    await update($, gasto, () => hoy)
    await cambiaFicha($, x => ({ ...x, gasto: hoy }))
    // Lo que te da en el chat para abrir con «Run» (`explorer.exe "<ruta>"`), a lo entregado: solo archivos, el primero
    // del mensaje arriba (26-oct: «si se me pasa en el chat, lo tengo ahí a la vista»)
    const rutas = [...String(e.answer ?? '').matchAll(/explorer\.exe\s+(?:\/select,)?"([^"\r\n]+)"/gi)].map(m => m[1] ?? '')
    for (const ruta of [...new Set(rutas)].reverse()) {
      if (/\.[a-z0-9]{1,8}$/i.test(ruta.replace(/[\\/]+$/, ''))) await apuntaEntrega($, ruta, 'chat')
    }
    await refresca($)
    void alDiaRepo($)
    void alDiaSesion($, true)
    const hecha = await next(e)
    // la recarga que se pidió con «Mods» mientras trabajaba, ya en la caja
    if (recargaPendiente) {
      $.clock.after(300, () => {
        void pideRecarga($)
      })
    }
    // Con decisiones, el mensaje propone en gris «todo lo recomendado», para cogerlo con Tab
    if (decs.length) {
      Promise.resolve()
        .then(() => $.prompt.suggest({ text: 'todo lo recomendado' }))
        .catch(() => undefined)
    }

    return hecha
  })

  on('session.end', async ($, e, next) => {
    await cambiaFicha($, x => ({ ...x, cerrada: true }))

    return next(e)
  })

  // La respuesta que manda el panel de otra sesión (Decisión → «Mandar a…»): si viene de este mod, con su marca, y aquí
  // hay decisiones pendientes, pasa como mensaje de la persona; si no, llega como cualquier mensaje de otra sesión
  on('session.receive', async ($, e, next) => {
    const o = e.origin as { kind: string; plugin?: string }
    const cuerpo = cuerpoDe(e.text)
    // «Mods» de otra sesión: deja la recarga escrita en la caja, cuando la sesión quede libre, sin pasarle nada a Claude
    if (e.agentId === undefined && o.kind === 'peer' && o.plugin === 'd-137' && cuerpo.startsWith(RECARGA)) {
      $.clock.after(300, () => {
        void pideRecarga($)
      })
      return { consumed: 'D-137: recarga del mod, pedida con «Mods» desde otra sesión' }
    }
    const marca = cuerpo.startsWith(MARCA) ? MARCA : ''
    if (e.agentId === undefined && o.kind === 'peer' && o.plugin === 'd-137' && marca) {
      const resp = cuerpo.slice(marca.length).trim()
      const decs = await read($, toca)
      if (decs.length && resp && resp.length <= 1500) {
        // como mensaje suyo, y fuera del panel al llegar, aunque esta sesión esté trabajando y la respuesta espere su
        // turno: así deja de salir como pendiente en todas (28-oct)
        void $.prompt.submit({ text: `${RESPUESTA}: ${resp}`, asUser: true })
        await quitaDecisiones($)
        await update($, aviso, () => `Respuesta recibida desde otro panel: «${resp}»`)
        return { consumed: 'D-137: la respuesta de la persona, mandada desde el panel de otra sesión, pasa como su mensaje' }
      }
    }

    return next(e)
  })

  // El aviso de que una tarea en segundo plano ha acabado llega como un mensaje: se marca en «Activo». Y un mensaje de
  // la persona en el chat (escrito o desde el móvil; no una orden como /marty) quita del panel las decisiones pendientes,
  // como su respuesta desde Decisión (26-oct: «que no siga en el mod como pendiente si se responde en el chat»); a
  // Claude le llegan al lado, para que vuelva a mandar las que sigan sin contestar
  on('prompt.submit', async ($, e, next) => {
    if (e.origin.kind === 'task-notification') {
      for (const m of e.text.matchAll(/<task-id>\s*([^<\s]+)\s*<\/task-id>[\s\S]*?<status>\s*([^<\s]+)\s*<\/status>/g)) {
        if (m[1]) await acabaTarea($, m[1], m[2] ?? 'completed')
      }
    }
    const texto = e.text.trim()
    const suyo = (e.origin.kind === 'composer' || e.origin.kind === 'bridge') && !e.command && !e.isMeta
    if (suyo && texto && !/^[/!]/.test(texto)) {
      const decs = await read($, toca)
      if (decs.length) {
        await quitaDecisiones($)
        return next({ ...e, context: [...(e.context ?? []), quitadas(decs)] })
      }
    }

    return next(e)
  })

  on('tool.call', { tool: HERRAMIENTA }, async ($, e) => {
    const x = e as unknown as Record<string, unknown>
    const ahora = await $.clock.now()
    if (Array.isArray(x.plan)) {
      const lista = (x.plan as unknown[]).map(s => String(s).trim()).filter(Boolean).slice(0, 12).map(s => s.slice(0, 80))
      await update($, plan, () => lista)
      await update($, pasos, l => l.filter(p => !p.hito))
      hito = false
    }
    const pl = await read($, plan)
    let texto = typeof x.paso === 'string' ? x.paso.trim() : ''
    // sin paso, con un plan nuevo: empieza por el primero
    if (!texto && Array.isArray(x.plan) && pl.length) texto = pl[0] ?? ''
    if (texto) {
      const bajo = texto.toLowerCase()
      const n = /^\d+$/.test(texto) ? Number(texto) - 1
        : pl.findIndex(s => s.toLowerCase() === bajo || s.toLowerCase().startsWith(bajo) || bajo.startsWith(s.toLowerCase()))
      if (n >= 0 && n < pl.length) texto = pl[n] ?? texto
      else if (pl.length) await update($, plan, p => [...p, texto])
      hito = true
      // los pasos del plan de antes de este que Claude no dijo, hechos sin tiempo (26-oct: «no sé si están ahí
      // porque aún no están hechos o es un bug»)
      const saltados = n > 0 ? pl.slice(0, n) : []
      await update($, pasos, l => {
        const dichos = new Set(l.filter(p => p.hito).map(p => p.texto))
        const sin = saltados.filter(s => !dichos.has(s)).map((s, i) => ({ id: `hito-${ahora}-s${i}`, texto: s, desde: ahora, hasta: ahora, hito: true }))
        return [...l.map(p => (p.hito && !p.hasta ? { ...p, hasta: ahora } : p)), ...sin, { id: `hito-${ahora}`, texto, desde: ahora, hito: true }]
      })
      await cambiaFicha($, f => ({ ...f, paso: texto }))
    }
    if (typeof x.hecho === 'string') {
      await update($, hecho, () => String(x.hecho))
      // la tarea acabó: también los pasos del plan que no dijo, hechos sin tiempo
      const todo = await read($, plan)
      await update($, pasos, l => {
        const dichos = new Set(l.filter(p => p.hito).map(p => p.texto))
        const sin = todo.filter(s => !dichos.has(s)).map((s, i) => ({ id: `hito-${ahora}-h${i}`, texto: s, desde: ahora, hasta: ahora, hito: true }))
        return [...l.map(p => (p.hito && !p.hasta ? { ...p, hasta: ahora } : p)), ...sin]
      })
    }
    await publicaPasos($)
    if (Array.isArray(x.decisiones)) {
      const decs = (x.decisiones as Decision[])
        .filter(d => d && typeof d.titulo === 'string' && Array.isArray(d.opciones) && d.opciones.length > 0)
        .map(d => ({
          titulo: d.titulo, opciones: d.opciones.map(String),
          recomendada: Number.isInteger(d.recomendada) && d.recomendada >= 0 && d.recomendada < d.opciones.length ? d.recomendada : 0,
          ...(typeof d.contexto === 'string' && d.contexto.trim() ? { contexto: d.contexto.trim().slice(0, 400) } : {}),
        }))
      await update($, toca, () => decs)
      // en la ficha ya, para que salgan en Decisión sin esperar al final del turno
      await cambiaFicha($, f => ({ ...f, toca: decs.map(d => d.titulo), decisiones: decs }))
    }

    return { result: 'Panel «D-137» al día.' }
  })

  // Cada herramienta es un paso, con lo que tarda; mientras Claude no diga el suyo, la ficha enseña la última. Antes,
  // los dos frenos; después, lo que se queda en segundo plano y lo entregado
  on('tool.call', async ($, e, next) => {
    const herramienta = String(e.tool)
    if (herramienta === HERRAMIENTA) return next(e)
    const x = e as unknown as Record<string, unknown>
    if (EDITAN.includes(herramienta)) {
      const parada = await frena($, x as { file_path?: string; notebook_path?: string })
      if (parada) return parada
    }
    if (AJUSTES.frenos !== 'ninguno' && ORDENES.includes(herramienta) && DESHACE.test(String(x.command ?? ''))) {
      const parada = await frenoGit($, String(x.command))
      if (parada) return parada
    }
    if (e.agentId !== undefined) return next(e)
    const id = e.tool_use_id
    const desde = await $.clock.now()
    const texto = describe(x)
    await update($, pasos, l => [...l, { id, texto, desde }].slice(-300))
    if (!hito) {
      await cambiaFicha($, f => ({ ...f, paso: texto }))
      await publicaPasos($)
    }
    const ran = await next(e)
    const hasta = await $.clock.now()
    const fallo = ran.deny !== undefined || ran.isError === true
    await update($, pasos, l => l.map(p => (p.id === id ? { ...p, hasta, fallo } : p)))
    if (!hito) await publicaPasos($)
    if (!fallo) {
      const salida = ran.text ?? ''
      if (ORDENES.includes(herramienta) && x.run_in_background === true) {
        const res = (ran.result ?? {}) as { backgroundTaskId?: string }
        const tarea = res.backgroundTaskId ?? /background with ID: (\w+)/.exec(salida)?.[1]
        if (tarea) {
          await apuntaTarea($, {
            id: tarea, que: texto, tipo: 'orden', desde, orden: String(x.command ?? '').slice(0, 200),
            salida: /written to: (.+?\.output)/.exec(salida)?.[1],
          })
        }
      }
      if (herramienta === 'TaskStop') await acabaTarea($, String(x.task_id ?? x.shell_id ?? ''), 'killed')
      if (herramienta === 'Write') await apuntaEntrega($, String(x.file_path ?? ''), 'creado')
      if (herramienta === 'SendUserFile' && Array.isArray(x.files)) {
        for (const f of x.files) await apuntaEntrega($, String(f), 'enviado')
      }
    }

    return ran
  })

  on('prompt.compose', async ($, e, next) => {
    const r = await next(e)
    if (!e.tools.includes(HERRAMIENTA)) return r

    return { ...r, sections: [...r.sections, { id: 'd-137:panel', text: INSTRUCCION, scope: 'session' as const }] }
  })

  // El clic en una casilla entera (toque.tsx): lo que hace cada una, guardado al pintarla
  on('ui.message', async ($, e, next) => {
    const d = e.data as { toque?: unknown } | null
    if (d && typeof d.toque === 'string') TOQUES.get(d.toque)?.()
    return next(e)
  })
  // Si esa zona no carga en una superficie, se quita, y queda el botón del dibujo
  on('ui.fault', async ($, e, next) => {
    sinToque()
    $.ui.invalidate('ui.render')
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const el = $.ui.resolve(e)
    TOQUES.clear()
    const d = await datos($, Math.max(36, e.props.bodyColumns ?? 56), e.surface)

    return panel(el, d, acciones($), cambiados)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)

    const cierra = () => void update($, franjaMenu, () => null)
    return franja($.ui.resolve(e), await read($, franjaMenu), {
      panelGeneral: () => {
        void atajo($, PANEL, r => abreArchivo($, r, false))
        cierra()
      },
      escribe: texto => {
        void escribe($, texto)
        cierra()
      },
      menu: cual => {
        void update($, franjaMenu, m => (m === cual ? null : cual))
      },
      mas: (valor, surface) => {
        const m = MAS.find(x => x.value === valor)
        if (!m) return
        cierra()
        if (valor === 'analizar' || valor === 'analizar-pro') void atajo($, valor === 'analizar' ? ANALIZAR : ANALIZAR_PRO, r => abre($, r))
        else if (valor === 'recargar') void recargaTodas($, surface)
        else if (m.texto) void escribe($, m.texto, surface)
      },
      commit: (valor, surface) => {
        const c = COMMIT.find(x => x.value === valor)
        if (!c) return
        cierra()
        void escribe($, c.texto, surface)
      },
    })
  })
}
