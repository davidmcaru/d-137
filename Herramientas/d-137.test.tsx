// Prueba de D-137 (las cinco pestañas, 26-oct) con el banco de pruebas de Claude Code: las fichas de otras
// sesiones (una de los mods de antes), el choque, el freno de git, una orden en segundo plano con su progreso y su fin,
// un agente, lo entregado, las decisiones con su contexto, el registro del día, las cinco pestañas en el escritorio y
// en la terminal, Decisión con «Mandar a…», la respuesta que llega de otro panel y la franja. Va en una copia del mod, en
// su raíz, no en el que se instala. Imprime cada árbol entre marcas («ARBOL:<nombre>») para verlo en una maqueta
import { expect, mock, test } from 'claude-code/testing'

import { leeAjustes } from './hooks/ajustes'
import { gastadoDesde, horasDe, porSesion, ventanaSemana } from './hooks/calculos'
import { dolares, letra, millones } from './hooks/comun'
import { cabezaDe, spriteDe } from './hooks/dibujos'
import { nombreTag, restoDe, rotuloDe, sana, TAGS } from './hooks/fichas'
import { analiza, anterioresDe, rutasDe } from './hooks/sesion'
import { tokensDe, usoDe } from './hooks/tokens'

const CASA = 'C:/Users/prueba/.claude'
const AHORA = new Date(2026, 10, 15, 11, 0, 0).getTime()
const norma = (r: unknown) => String(r).replace(/\\/g, '/').replace(/\/$/, '')
const PANE = { title: 'D-137', isFocused: false, bodyColumns: 58, placement: 'dock', scroll: { offset: 0, bodyRows: 200 }, view: {} }

test('D-137: fichas, frenos, Activo, Decisión, Cuota, panel y franja', async ($, on) => {
  const reloj = mock.clock(on, { now: AHORA })
  mock.env(on, { USERPROFILE: 'C:\\Users\\prueba' })
  const fs = new Map<string, { text: string; mtimeMs: number }>()
  const pon = (ruta: string, valor: unknown) => fs.set(ruta, { text: JSON.stringify(valor), mtimeMs: reloj.now() })
  const ficha = (id: string, extra: Record<string, unknown>) => ({
    id, desde: AHORA + 1000, latido: AHORA + 3600000, estado: 'esperando', turno: 0, paso: '', toca: [], archivos: [],
    espera: null, v: 2, ...extra,
  })
  pon(`${CASA}/sessions/100.json`, { sessionId: 'yo-123', name: 'Web - Portada nueva', hostSessionId: 'local_yo' })
  const repo = { raiz: 'c:/proyectos/mi-web', carpeta: 'mi-web', rama: 'main', sinCommit: 3 }
  const otra1 = () => ficha('otra1', {
    tag: 'Liz', nombre: 'Agenda - Agenda del año', rotulo: 'Agenda', turno: AHORA - 25 * 60000, enlace: 'claude://claude.ai/epitaxy/local_agenda',
    toca: ['¿Marco los fines de semana en gris?', '¿Subo los cambios hoy?'],
    decisiones: [
      { titulo: '¿Marco los fines de semana en gris?', opciones: ['En gris', 'Solo los domingos', 'No'], recomendada: 0,
        contexto: 'Los fines de semana se ven como el resto.' },
      { titulo: '¿Subo los cambios hoy?', opciones: ['Ya', 'Mañana, tras probarlos'], recomendada: 1 },
    ],
    repo: { raiz: 'c:/proyectos/mi-web', carpeta: 'mi-web', rama: 'main' }, gasto: 1.2, pasosN: [4, 4],
  })
  pon(`${CASA}/coordinador/otra1.json`, otra1())
  pon(`${CASA}/coordinador/otra2.json`, ficha('otra2', {
    tag: 'M-03', nombre: 'Web - Revisión de textos', rotulo: 'Web', estado: 'trabajando', turno: AHORA - 495000, recarga: true,
    paso: 'Puliendo los textos de la portada', archivos: [{ ruta: 'c:/proyectos/mi-web/compartido.md', desde: AHORA }],
    tocados: ['c:/proyectos/mi-web/a.txt', 'c:/proyectos/mi-web/compartido.md'], repo, enlace: 'claude://claude.ai/epitaxy/local_web',
    marcha: [{ id: 'r9', que: 'Vídeo de la portada en 4K', tipo: 'orden', desde: AHORA - 192000, linea: 'fotograma 812 de 2400' },
      { id: 's1', que: 'Vite · la web en local', tipo: 'orden', desde: AHORA - 6e6, linea: 'Local: http://localhost:5173/' }],
    acabadas: [{ id: 'z1', que: 'Pruebas del formulario', tipo: 'orden', desde: AHORA - 9e5, fin: AHORA - 480000, estado: 'failed', linea: 'fallaron 2 de 31' }],
    lectura: { semana: 37, horas: 15, renuevaSemana: '2026-11-15T23:00:00.000Z', renuevaHoras: '2026-11-15T13:20:00.000Z', cuando: AHORA - 1000 },
  }))
  pon(`${CASA}/coordinador/otra3.json`, ficha('otra3', {
    tag: 'M-05', nombre: 'Datos - Informes', rotulo: 'Datos', turno: AHORA - 10380000, hecho: 'Informe mensual, hecho',
    repo: { raiz: 'c:/proyectos/datos', carpeta: 'datos', rama: 'main' }, enlace: 'claude://claude.ai/epitaxy/local_datos',
  }))
  // una ficha de los mods de antes (sin v, ni nombre, ni pasos) y una muerta
  pon(`${CASA}/coordinador/vieja.json`, { id: 'vieja', tag: 'M-01', rotulo: 'Diseño', desde: AHORA - 1e7, latido: AHORA + 3600000,
    estado: 'trabajando', turno: AHORA - 760000, paso: 'Exportando los iconos', archivos: [],
    espera: { ruta: 'c:/proyectos/mi-web/iconos/iconos.svg', de: 'M-03', desde: AHORA - 80000 } })
  pon(`${CASA}/coordinador/muerta.json`, ficha('muerta', { tag: 'Mantequillo', nombre: 'X - Muerta', rotulo: 'X', latido: AHORA - 60000 }))
  // lo de los días de antes: el registro de Agenda y la cuota de todas
  const hoy = '2026-11-15'
  pon(`${CASA}/coordinador/registro/otra1.json`, { id: 'otra1', tag: 'Liz', rotulo: 'Agenda', nombre: 'Agenda - Agenda', dias: {
    [hoy]: { usd: 2, hechos: [{ t: AHORA - 26 * 60000, texto: 'Vista semanal, terminada' }] },
    '2026-11-14': { usd: 3, hechos: [] } } })
  pon(`${CASA}/coordinador/cuota.json`, {
    ultimo: { pct: 36, cuando: AHORA - 60000, resetsAt: '2026-11-15T23:00:00.000Z' },
    dias: { [hoy]: { ini: 34, fin: 36 }, '2026-11-14': { ini: 26, fin: 34 }, '2026-11-08': { ini: 1, fin: 9 } },
    horas: { [hoy]: Array.from({ length: 24 }, (_, h) => (h >= 8 && h <= 10 ? 0.6 : 0)), '2026-11-14': Array.from({ length: 24 }, (_, h) => (h >= 10 && h <= 20 ? 0.7 : 0)) },
  })
  fs.set('C:/tmp/tasks/b123.output', { text: 'Empezando\r\x1b[32mminiatura 134 de 192\x1b[0m\r', mtimeMs: AHORA })
  // su transcripción y la de un subagente, con sus tokens: una respuesta en dos líneas (la primera, a medias), otra entera
  // y la del subagente: 1.300.030 + 2.000.010 + 10
  const linea = (id: string, t: number, u: Record<string, number>) => JSON.stringify({
    type: 'assistant', timestamp: new Date(t).toISOString(), requestId: `req_${id}`, message: { id: `msg_${id}`, usage: u } })
  const PROY = `${CASA}/projects/C--Proyectos-mi-web`
  // y sus turnos (28-oct: el bloque de 3 × 3): sigue de otra sesión, la de esta mañana (su resumen lo dice), con
  // un rato de 31 min; luego, en esta, uno que se corta mientras pregunta (15 y 11 min) y otro de 58 min, con un script que hace recortes y
  // una página, y un borrado
  const MIN = 60000
  const ts = (t: number) => new Date(t).toISOString()
  const empieza = (uuid: string, t: number) => JSON.stringify({ type: 'user', uuid, timestamp: ts(t), turnPosition: { promptIndex: 1 }, message: { content: 'hola' } })
  const fin = (uuid: string, t: number) => JSON.stringify({ type: 'system', subtype: 'stop_hook_summary', uuid, timestamp: ts(t) })
  const usa = (uuid: string, t: number, bloque: Record<string, unknown>) =>
    JSON.stringify({ type: 'assistant', uuid, timestamp: ts(t), cwd: 'C:\\Proyectos\\mi-web', message: { id: `m${uuid}`, content: [{ type: 'tool_use', ...bloque }] } })
  const vuelve = (uuid: string, t: number, id: string) => JSON.stringify({ type: 'user', uuid, timestamp: ts(t), message: { content: [{ type: 'tool_result', tool_use_id: id, content: 'ok' }] } })
  const ANTES = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
  fs.set(`${PROY}/${ANTES}.jsonl`, { mtimeMs: AHORA - 149 * MIN, text: [
    empieza('a0', AHORA - 3 * 3600000),
    usa('a2', AHORA - 3 * 3600000 + 12 * MIN, { id: 'r1', name: 'Read', input: { file_path: 'a.md' } }),
    linea('0', AHORA - 3 * 3600000 + 24 * MIN, { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 1000000, cache_creation_input_tokens: 0 }),
    fin('a1', AHORA - 3 * 3600000 + 31 * MIN),
  ].join('\n') })
  const resumen = `This session is being continued. If you need specific details from before compaction, read the full transcript at: C:\\Users\\prueba\\.claude\\projects\\C--Proyectos-mi-web\\${ANTES}.jsonl`
  fs.set(`${PROY}/yo-123.jsonl`, { mtimeMs: AHORA, text: [
    JSON.stringify({ type: 'user', uuid: 'r0', isCompactSummary: true, timestamp: ts(AHORA - 126 * MIN), message: { content: resumen } }),
    empieza('b0', AHORA - 125 * MIN),
    linea('1', AHORA - 2 * 3600000, { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 1200000, cache_creation_input_tokens: 100000 }),
    linea('1', AHORA - 2 * 3600000, { input_tokens: 10, output_tokens: 20, cache_read_input_tokens: 1200000, cache_creation_input_tokens: 100000 }),
    usa('b1', AHORA - 118 * MIN, { id: 'w1', name: 'Write', input: { file_path: 'web\\portada.html', content: 'x' } }),
    vuelve('b2', AHORA - 117 * MIN, 'w1'),
    usa('b3', AHORA - 110 * MIN, { id: 'q1', name: 'AskUserQuestion', input: { questions: [] } }),
    vuelve('b4', AHORA - 90 * MIN, 'q1'),
    usa('b7', AHORA - 85 * MIN, { id: 'p1', name: 'mcp__d-137__progreso', input: { decisiones: [{ titulo: '¿A?', opciones: ['x', 'y'], recomendada: 0 }, { titulo: '¿B?', opciones: ['x', 'y'], recomendada: 1 }] } }),
    usa('b5', AHORA - 80 * MIN, { id: 's1', name: 'SendUserFile', input: { files: ['C:\\tmp\\scratchpad\\Portada.jpg'] } }),
    fin('b6', AHORA - 79 * MIN),
    JSON.stringify({ type: 'user', uuid: 'c0', timestamp: ts(AHORA - 3600000), turnPosition: { promptIndex: 2 }, turnOrigin: 'human', message: { content: '1a 2: lo mío' } }),
    usa('c1', AHORA - 50 * MIN, { id: 'o1', name: 'Bash', input: { command: 'S="C:/Proyectos/mi-web/imagenes"; node "C:/Proyectos/mi-web/scripts/hacer.cjs" "$S/salida"' } }),
    vuelve('c2', AHORA - 45 * MIN, 'o1'),
    usa('c9', AHORA - 40 * MIN, { id: 'p2', name: 'mcp__d-137__progreso', input: { decisiones: [{ titulo: '¿C?', opciones: ['x', 'y'], recomendada: 0 }] } }),
    usa('c3', AHORA - 35 * MIN, { id: 'o2', name: 'PowerShell', input: { command: 'Remove-Item "C:\\Proyectos\\mi-web\\imagenes\\borrado.png"' } }),
    vuelve('c4', AHORA - 35 * MIN + 1000, 'o2'),
    usa('c6', AHORA - 22 * MIN, { id: 'r2', name: 'Read', input: { file_path: 'b.md' } }),
    usa('c10', AHORA - 20 * MIN, { id: 'p3', name: 'mcp__d-137__progreso', input: { decisiones: [{ titulo: '¿C?', opciones: ['x', 'y'], recomendada: 0 }] } }),
    linea('2', AHORA - 600000, { input_tokens: 5, output_tokens: 5, cache_read_input_tokens: 2000000, cache_creation_input_tokens: 0 }),
    usa('c7', AHORA - 9 * MIN, { id: 'ag-x', name: 'Agent', input: { description: 'Revisar la portada', prompt: 'revisa' } }),
    JSON.stringify({ type: 'user', uuid: 'c8', timestamp: ts(AHORA - 4 * MIN), message: { content: '<task-notification>\n<tool-use-id>ag-x</tool-use-id>\n<status>failed</status>\n</task-notification>' } }),
    fin('c5', AHORA - 2 * MIN),
  ].join('\n') })
  fs.set(`${PROY}/yo-123/subagents/agent-a1.jsonl`, { mtimeMs: AHORA,
    text: [JSON.stringify({ type: 'user', uuid: 's0', isSidechain: true, timestamp: ts(AHORA - 8 * MIN), message: { content: 'revisa la portada' } }),
      linea('3', AHORA - 300000, { input_tokens: 1, output_tokens: 9, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 })].join('\n') })
  fs.set(`${CASA}/projects/otro-proyecto/otra.jsonl`, { text: '', mtimeMs: AHORA })
  // lo que dejó el script mientras corría (dos recortes y una página en una carpeta hermana) y lo de antes, que no cuenta
  fs.set('C:/Proyectos/mi-web/imagenes/salida/r1.png', { text: 'png', mtimeMs: AHORA - 47 * MIN })
  fs.set('C:/Proyectos/mi-web/imagenes/salida/r2.png', { text: 'png', mtimeMs: AHORA - 46 * MIN })
  fs.set('C:/Proyectos/mi-web/imagenes/viejo.png', { text: 'png', mtimeMs: AHORA - 5 * 3600000 })
  fs.set('C:/Proyectos/mi-web/bocetos/p1.html', { text: '<p>', mtimeMs: AHORA - 48 * MIN })
  fs.set('C:/Proyectos/mi-web/scripts/hacer.cjs', { text: '//', mtimeMs: AHORA - 3 * 86400000 })
  // los atajos de la franja que abren algo (atajos.ts): la página de la cabeza de Doc y Analizar Pro (Analizar, no)
  fs.set(`${CASA}/atajos/Panel.html`, { text: '<p>', mtimeMs: AHORA - 3 * 86400000 })
  fs.set(`${CASA}/atajos/Analizar Pro.cmd`, { text: '@echo off', mtimeMs: AHORA - 3 * 86400000 })

  // sin distinguir mayúsculas, como Windows (el mod pasa las rutas a minúsculas para compararlas)
  on('fs.list', (_, e: any) => {
    const dir = norma(e.path).toLowerCase()
    const out: unknown[] = []
    const dirs = new Set<string>()
    for (const [k, v] of fs) {
      if (!k.toLowerCase().startsWith(`${dir}/`)) continue
      const resto = k.slice(dir.length + 1)
      if (resto.includes('/')) dirs.add(resto.split('/')[0] as string)
      else out.push({ name: resto, kind: 'file', size: v.text.length, mtimeMs: v.mtimeMs, isLink: false })
    }
    for (const d of dirs) out.push({ name: d, kind: 'dir', size: 0, mtimeMs: 0, isLink: false })
    return { value: out }
  })
  on('fs.stat', (_, e: any) => {
    const r = norma(e.path).toLowerCase()
    const f = [...fs].find(([k]) => k.toLowerCase() === r)?.[1]
    if (f) return { value: { kind: 'file', size: f.text.length, mtimeMs: f.mtimeMs, isLink: false } }
    if ([...fs.keys()].some(k => k.toLowerCase().startsWith(`${r}/`))) return { value: { kind: 'dir', size: 0, mtimeMs: AHORA, isLink: false } }
    throw new Error(`ENOENT ${r}`)
  })
  on('fs.read', (_, e: any) => {
    const f = fs.get(norma(e.path))
    if (!f) throw new Error(`ENOENT ${norma(e.path)}`)
    return { value: f.text }
  })
  on('fs.write', (_, e: any) => {
    fs.set(norma(e.path), { text: e.text, mtimeMs: reloj.now() })
    return { value: undefined }
  })
  on('session.id', () => ({ value: 'yo-123' }))
  on('session.root', () => ({ value: 'C:\\Proyectos\\mi-web' }))
  on('session.cwd', () => ({ value: 'C:\\Proyectos\\mi-web' }) as any)
  let semana = 37
  let usd = 1
  on('session.usage', () => ({
    value: {
      startedAt: AHORA, context: {}, cost: { usd }, rateLimits: [
        { kind: 'seven_day', percentUsed: semana, resetsAt: '2026-11-15T23:00:00.000Z' },
        { kind: 'five_hour', percentUsed: 15, resetsAt: '2026-11-15T13:20:00.000Z' },
      ],
    },
  }) as any)
  on('agent.list', () => ({ value: [{ id: 'ag1', description: 'Revisar los enlaces', type: 'general-purpose', status: 'running' }] }) as any)
  const ordenes: string[][] = []
  on('process.run', (_, e: any) => {
    const argv = e.argv as string[]
    ordenes.push(argv)
    const sale = argv.includes('rev-parse') ? 'C:/Proyectos/mi-web\n'
      : argv.includes('--show-current') ? 'main\n'
        : argv.includes('status') ? ' M a.txt\n M compartido.md\n?? nuevo.txt\n' : ''
    return { value: { exitCode: 0, stdout: sale, stderr: '', isStdoutTruncated: false, isStderrTruncated: false } } as any
  })
  on('tool.register', () => ({ value: {} }) as any)
  on('command.register', (_, e: any) => ({ value: { command: e.name } }) as any)
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.invalidate', () => ({ value: undefined }) as any)
  const copiados: string[] = []
  on('ui.copy', (_, e: any) => {
    copiados.push(String(e.text))
    return { value: {} } as any
  })
  const avisos: string[] = []
  on('ui.toast', (_, e: any) => {
    avisos.push(String(e.text))
    return { value: undefined } as any
  })
  const puestos: string[] = []
  on('prompt.fill', (_, e: any) => {
    puestos.push(e.mode === 'replace' ? e.text : `${e.mode}: ${e.text}`)
    return { isFilled: true, text: e.text, cursor: e.text.length } as any
  })
  // lo que hay escrito en la caja del mensaje, y dónde está el cursor
  let caja = { text: '', cursor: 0 }
  on('prompt.read', () => ({ value: caja }) as any)
  // las órdenes que lanza el mod (la recarga de «Mods»)
  const corridas: string[] = []
  on('command.run', (_, e: any) => {
    corridas.push(String(e.command))
    return { text: '' } as any
  })
  on('prompt.suggest', () => ({ isShown: true }) as any)
  const mensajes: any[] = []
  on('session.send', (_, e: any) => {
    mensajes.push(e)
    return { isDelivered: true } as any
  })
  const enviados: string[] = []
  const contextos: string[] = []
  on('prompt.submit', (_, e: any) => {
    enviados.push(String(e.text))
    contextos.push((e.context ?? []).join('\n'))
    return { text: e.text } as any
  })
  on('mcp.call', () => ({ value: { content: [{ type: 'text', text: 'archivada' }], isError: false } }) as any)
  on('session.receive', (_, e: any) => ({ text: e.text }) as any)
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('turn.start', (_, e: any) => ({ turnId: e.turnId }) as any)
  on('turn.complete', (_, e: any) => ({ text: e.text ?? '' }))
  on('tool.call', (_, e: any) => (e.run_in_background
    ? { result: { backgroundTaskId: 'b123', stdout: '', stderr: '', interrupted: false },
      text: 'Command running in background with ID: b123. Output is being written to: C:/tmp/tasks/b123.output. You will be notified when it completes.' }
    : { result: {} }) as any)
  on('prompt.compose', () => ({ sections: [] }))

  await $.session.start({ cwd: 'C:\\Proyectos\\mi-web', surface: 'desktop', isInteractive: true })
  await reloj.settle()
  const mia = () => JSON.parse(fs.get(`${CASA}/coordinador/yo-123.json`)?.text ?? '{}')
  // un personaje libre, al azar: ni el de otra sesión viva (Liz, M-03, M-05, M-01) ni los que se quitaron (M-06, M-07)
  const LIBRES = TAGS.filter(t => !['Liz', 'M-03', 'M-05', 'M-01'].includes(t))
  expect(LIBRES).toContain(mia().tag)
  // lo que viene marcado al instalar: juntas, las del mismo repo, y el rótulo, el nombre entero (29-oct)
  expect(mia().rotulo).toBe('Web - Portada nueva')
  expect(mia().v).toBe(2)
  expect(mia().enlace).toBe('claude://claude.ai/epitaxy/local_yo')

  await $.turn.start({ text: 'haz la portada', turnId: 't1' } as any)
  // el plan de la tarea: empieza por el primer paso; luego, el segundo por su número
  await $.tool.call({ tool: 'mcp__d-137__progreso', plan: ['Leer el encargo de la portada', 'Maquetar la portada nueva', 'Probar en el móvil'] } as any)
  expect(mia().paso).toBe('Leer el encargo de la portada')
  await reloj.advance(30000)
  await $.tool.call({ tool: 'mcp__d-137__progreso', paso: '2' } as any)
  expect(mia().paso).toBe('Maquetar la portada nueva')
  expect(mia().pasosN).toEqual([1, 3])
  // un subagente: su turno no toca el estado, los pasos ni el plan de la sesión (28-oct: al empezar uno se
  // borraban los pasos, y al acabar la sesión salía como esperando a mitad de su turno)
  await $.turn.start({ text: 'revisa la portada', turnId: 'sa1', agentId: 'ag1' } as any)
  await $.turn.complete({ turnId: 'sa1', agentId: 'ag1', answer: 'revisada', text: 'revisada', durationMs: 1000, isAborted: false, reason: 'answer' } as any)
  await reloj.settle()
  expect(mia().estado).toBe('trabajando')
  expect(mia().paso).toBe('Maquetar la portada nueva')
  expect(mia().pasosN).toEqual([1, 3])

  // El choque: otra2 está tocando compartido.md en su turno; la espera queda con su hora
  const choque: any = await $.tool.call({ tool: 'Edit', file_path: 'C:\\Proyectos\\mi-web\\compartido.md', old_string: 'a', new_string: 'b' } as any)
  expect(JSON.stringify(choque)).toContain('D-137')
  expect(mia().espera?.desde).toBeTruthy()
  // Un archivo libre sí se escribe, queda apuntado y es una entrega
  await $.tool.call({ tool: 'Write', file_path: 'C:\\Proyectos\\mi-web\\web\\portada.html', content: 'x' } as any)
  expect(mia().tocados).toContain('c:/proyectos/mi-web/web/portada.html')
  await $.tool.call({ tool: 'SendUserFile', files: ['C:\\tmp\\scratchpad\\Portada nueva - 1 a 4.jpg'], status: 'normal' } as any)

  // El freno de git: otra2 tiene a.txt cambiado sin commit; la primera vez para, la segunda pasa
  const freno: any = await $.tool.call({ tool: 'Bash', command: 'git restore a.txt', description: 'Deshacer a.txt' } as any)
  expect(JSON.stringify(freno)).toContain('sin commit de otra sesi')
  const segunda: any = await $.tool.call({ tool: 'Bash', command: 'git restore a.txt', description: 'Deshacer a.txt' } as any)
  expect(JSON.stringify(segunda)).not.toContain('sin commit')

  // Una orden en segundo plano y el agente que lleva el motor
  await $.tool.call({ tool: 'Bash', command: 'python miniaturas.py', description: 'Miniaturas de la galería', run_in_background: true } as any)
  usd = 1.6
  semana = 37.4
  await reloj.advance(30500)
  await reloj.settle()
  const marcha = () => (mia().marcha ?? []) as any[]
  expect(marcha().find(t => t.id === 'b123')?.linea).toBe('miniatura 134 de 192')
  expect(marcha().some(t => t.id === 'ag1')).toBe(true)
  // La cuota de todas: esta sesión es la que llegó antes de las que van con el panel nuevo, y la apunta
  const cuota = () => JSON.parse(fs.get(`${CASA}/coordinador/cuota.json`)?.text ?? '{}')
  expect(cuota().ultimo.pct).toBeGreaterThanOrEqual(37)

  await $.tool.call({
    tool: 'mcp__d-137__progreso', hecho: 'Enviada la portada nueva, 1 a 4',
    decisiones: [{ titulo: '¿Paso la portada a las demás páginas?', opciones: ['Sí, a todas', 'Solo al inicio'], recomendada: 1,
      contexto: 'La portada nueva está solo en el inicio.' }],
  } as any)
  await $.tool.call({ tool: 'Read', file_path: 'C:\\Proyectos\\mi-web\\x.ts' } as any)
  usd = 2
  // lo que da en el chat para abrir con «Run», a lo entregado (los archivos, no la carpeta)
  const DADO = 'listo\n\n```bash\nexplorer.exe "D:\\Demo\\it-6\\Abrir demo.cmd"\n```\n\n```bash\nexplorer.exe "D:\\Demo\\it-6"\n```'
  await $.turn.complete({ turnId: 't1', answer: DADO, text: DADO, durationMs: 60000, isAborted: false, reason: 'answer' } as any)
  await reloj.settle()
  expect(mia().toca).toEqual(['¿Paso la portada a las demás páginas?'])
  expect(mia().decisiones[0].contexto).toBe('La portada nueva está solo en el inicio.')
  expect(mia().hecho).toBe('Enviada la portada nueva, 1 a 4')
  const registro = JSON.parse(fs.get(`${CASA}/coordinador/registro/yo-123.json`)?.text ?? '{}')
  expect(registro.dias[hoy].hechos[0].texto).toBe('Enviada la portada nueva, 1 a 4')
  // los dólares, a medida que suben (de 1 a 2), una sola vez aunque haya habido un subagente, y en su hora
  expect(Math.round(registro.dias[hoy].usd * 10)).toBe(10)
  expect(Math.round(registro.dias[hoy].usdH[11] * 10)).toBe(10)
  expect(registro.visto).toBe(2)
  // los tokens, de las transcripciones: cada respuesta una vez, también la del subagente, cada una en su hora
  expect(registro.tok).toBe(3300050)
  expect(registro.dias[hoy].tok).toBe(3300050)
  expect(registro.dias[hoy].tokH[9]).toBe(1300030)
  expect(registro.dias[hoy].tokH[10]).toBe(2000020)
  // y lo de toda la sesión, con la de antes (28-oct): 31 + 15 + 11 + 58 min trabajando y el rato más largo, de
  // 58; el que más tokens gastó (el último) no es el que más pesa en dólares (el primero de hoy, que escribió la caché);
  // y 6 archivos: el escrito, el enviado, los dos recortes y la página del script, y el borrado
  expect(registro.sesion).toEqual({ inicio: AHORA - 3 * 3600000, activa: 115 * MIN, maxT: 58 * MIN, maxTok: 2000020,
    maxPeso: 245110, peso: 545186, tok: 4300050, archivos: 6,
    agentes: { n: 1, tiempo: 3 * MIN, maxT: 3 * MIN, tok: 10, maxTok: 10, peso: 46, maxPeso: 46, fallidos: 1 },
    preguntas: { cuando: [AHORA - 85 * MIN, AHORA - 85 * MIN, AHORA - 40 * MIN], contestadas: 2, rec: 1, otra: 1, panel: 0 } })

  // El panel, pestaña a pestaña, en el escritorio
  const ui: any = await $.ui.mount({ plugin: 'd-137', surface: 'desktop', component: 'Pane', requestId: 'd-137', props: PANE } as any)
  const vuelca = async (nombre: string) => console.log(`ARBOL:${nombre}:${JSON.stringify(await ui.drawn())}`)
  // lo dibujado (botones, pastillas, etiquetas) se lee por su texto alternativo
  const textos = async () => (await ui.findAll({})).map((x: any) => [x.text, x.props?.alt].filter(Boolean).join(' ')).join(' | ')
  const tiene = async (...frases: RegExp[]) => {
    const todo = await textos()
    const faltan = frases.filter(f => !f.test(todo)).map(f => f.source)
    expect({ faltan }).toEqual({ faltan: [] })
  }
  // la ficha lleva el nombre del personaje, no su código (26-oct); arriba, solo él, y debajo, el nombre entero de la
  // sesión, y el bloque de las de su mismo repo (29-oct)
  await tiene(new RegExp(nombreTag(mia().tag)), /Web - Portada nueva/, /Pasos de la tarea/, /Ahora|En pausa|Hecho|Siguiente/, /Dimensión mi-web/, /Entregado/, /Portada nueva - 1 a 4\.jpg/)
  expect(await textos()).not.toContain(`${nombreTag(mia().tag)} · Web`)
  await vuelca('marty')
  // la pestaña Sesión lleva la cabeza del personaje de esta sesión (28-oct: «si es Verano, la de Verano») y su
  // nombre de siempre, sea cual sea el personaje
  const dentro = (svg: string) => JSON.stringify(svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')).slice(1, -1)
  expect(JSON.stringify(await ui.drawn())).toContain(dentro(cabezaDe(mia().tag).svg))
  expect(JSON.stringify(await ui.drawn())).toContain(`"alt":"Sesión"`)
  // la ficha desplegada (28-oct): bajo una raya, el bloque de 3 × 3 de toda la sesión: abierta desde esta mañana (3 h),
  // 1:55 h trabajando y 0:58 h la más larga; 4,30 M tokens y 2,00 M en su rato que más gastó; 2 $, 1,04 $ por hora de
  // trabajo y 0,90 $ el rato que más pesa; y, con git, lo que hay sin commit
  // desplegada de entrada (28-oct); plegada, sin el bloque
  await tiene(/Activa[ |]*1:55\u00a0h/, /3:0\d\u00a0h/, /0:58\u00a0h/, /4,30\u00a0M/, /2,00\u00a0M/, /2,00\u00a0\$/,
    /Media[ |]*1,04\u00a0\$\/h/, /0,90\u00a0\$/, /Commit[ |]*3/)
  await vuelca('marty-ficha-abierta')
  await ui.press({ key: 'pl-fichaMarty' })
  expect(await textos()).not.toMatch(/Activa/)
  // a la izquierda de plegar, el botón que copia el enlace de la sesión
  await ui.press({ key: 'ficha-enlace' })
  await reloj.settle()
  expect(copiados).toContain('claude://claude.ai/epitaxy/local_yo')
  // la carpeta de arriba a la derecha es un botón que la abre en el Explorador
  const antesCarpeta = ordenes.length
  await ui.press({ key: 'carpeta' })
  await reloj.settle()
  const abreCarpeta = ordenes.slice(antesCarpeta).find(o => o[0] === 'powershell.exe')
  const deUtf16c = (b64: string) => { const s = atob(b64); let r = ''; for (let i = 0; i + 1 < s.length; i += 2) r += String.fromCharCode(s.charCodeAt(i) | (s.charCodeAt(i + 1) << 8)); return r }
  const ordenCarpeta = deUtf16c(String(abreCarpeta?.[abreCarpeta.length - 1] ?? ''))
  expect(ordenCarpeta).toContain('c:\\proyectos\\mi-web')
  expect(ordenCarpeta).toContain(`Start-Process explorer.exe -ArgumentList ('"' + $r + '"')`)
  await ui.press({ key: 'pl-pasos' })
  await ui.press({ key: 'pl-repo' })
  // en el bloque, las del mismo repo (mi-web) y las que chocan; Datos, que está en otro repo, no
  expect((await ui.findAll({ key: 'rmo-otra3-p' })).length).toBe(0)
  await ui.pointer({ type: 'down', x: 3, y: 0, button: 'left', in: 'rsel-otra2-t' })
  await ui.pointer({ type: 'up', x: 3, y: 0, button: 'left', in: 'rsel-otra2-t' })
  await tiene(/Maquetar la portada nueva/, /Probar en el móvil/, /Trabaja en lo suyo/)
  // al acabar la tarea, también el paso que no dijo cuenta como hecho
  expect(mia().pasosN).toEqual([3, 3])
  await vuelca('marty-abierto')
  // «Limpiar», con la sesión parada, deja la lista de pasos vacía
  await ui.press({ key: 'pasos-limpiar' })
  await tiene(/Sin pasos/)
  // Entregado, plegado, solo lo último (la imagen enviada); desplegado, también la página
  await ui.press({ key: 'pl-entregado' })
  await tiene(/portada\.html/)
  await ui.press({ key: 'ent-cp-C:\\Proyectos\\mi-web\\web\\portada.html' })
  // abrir la carpeta y abrirlo van por PowerShell, con la orden codificada
  const antes = ordenes.length
  await ui.press({ key: 'ent-cr-C:\\Proyectos\\mi-web\\web\\portada.html' })
  await ui.press({ key: 'ent-ab-C:\\Proyectos\\mi-web\\web\\portada.html' })
  await reloj.settle()
  const ps = ordenes.slice(antes).filter(o => o[0] === 'powershell.exe' && o.includes('-EncodedCommand'))
  expect(ps.length).toBe(2)
  for (const o of ps) console.log(`ORDEN:${o[o.length - 1]}`)
  expect(copiados).toContain('C:\\Proyectos\\mi-web\\web\\portada.html')
  // lo que dio en el chat: el .cmd, no la carpeta; su ▷, como «Run» (explorer.exe con la ruta)
  await tiene(/Abrir demo\.cmd/)
  expect(await textos()).not.toMatch(/\| it-6 \|/)
  const antes2 = ordenes.length
  await ui.press({ key: 'ent-ab-D:\\Demo\\it-6\\Abrir demo.cmd' })
  await reloj.settle()
  const run = ordenes.slice(antes2).find(o => o[0] === 'powershell.exe')
  const deUtf16 = (b64: string) => { const s = atob(b64); let r = ''; for (let i = 0; i + 1 < s.length; i += 2) r += String.fromCharCode(s.charCodeAt(i) | (s.charCodeAt(i + 1) << 8)); return r }
  expect(deUtf16(String(run?.[run.length - 1] ?? ''))).toContain(`Start-Process explorer.exe -ArgumentList ('"' + $r + '"')`)
  await ui.press({ key: 'repo-sesion' })
  expect(ordenes.some(o => o.includes('claude://claude.ai/epitaxy/local_web'))).toBe(true)
  // el Marty de su casilla, también a su sesión
  const aWeb = () => ordenes.filter(o => o.includes('claude://claude.ai/epitaxy/local_web')).length
  const web0 = aWeb()
  await ui.press({ key: 'rmo-otra2-p' })
  await reloj.settle()
  expect(aWeb()).toBe(web0 + 1)
  // y el Trabajador de los agentes, a Activo con lo activo de ese tipo
  await ui.press({ key: 'mkp-agente-p' })
  await tiene(/Trabajador/)
  // (pulsar su filtro lo quita: lo de después lo quiere todo)
  await ui.press({ key: 't-agente' })
  await ui.press({ key: 'tab-marty' })
  // «Limpiar» vacía lo entregado
  await ui.press({ key: 'ent-limpiar' })
  expect(await textos()).not.toMatch(/Entregado/)
  // el Marty de la ficha, que espera una decisión («?»), lleva a sus preguntas en Decisión
  await ui.press({ key: 'ficha-ir-p' })
  await tiene(/Paloma mensajera/, /Paso la portada a las demás páginas/)
  // y se vuelve a Agenda, la que se contesta más abajo
  await ui.press({ key: 'f-otra1-p-p' })

  await ui.press({ key: 'tab-doc' })
  await tiene(/Doc/, /Sesiones · 5/, /Lo que necesita de ti/, /Bloqueo/)
  // con su ficha desplegada, el bloque de todas: aquí solo esta trae su resumen (las demás son de mods de antes)
  await tiene(/Activa[ |]*1:55\u00a0h/, /4,30\u00a0M/, /2,00\u00a0\$/, /Archivos[ |]*6/)
  await vuelca('doc')
  // la casilla entera: el clic llega de su zona (toque.tsx) con su clave
  await ui.pointer({ type: 'down', x: 3, y: 0, button: 'left', in: 'sel-otra1-t' })
  await ui.pointer({ type: 'up', x: 3, y: 0, button: 'left', in: 'sel-otra1-t' })
  await tiene(/Agenda del año/, /Contestar/)
  await vuelca('doc-elegida')
  await ui.press({ key: 'pl-sesiones' })
  await vuelca('doc-abierto')
  // una parada no se cierra desde aquí: «Sesión» lleva a ella, para mirar qué hacía (26-oct)
  await ui.pointer({ type: 'down', x: 3, y: 0, button: 'left', in: 'sel-otra3-t' })
  await ui.pointer({ type: 'up', x: 3, y: 0, button: 'left', in: 'sel-otra3-t' })
  expect(await textos()).not.toMatch(/Cerrar/)
  await ui.press({ key: 'el-sesion1' })
  await reloj.settle()
  expect(ordenes.some(o => o.includes('claude://claude.ai/epitaxy/local_datos'))).toBe(true)

  await ui.press({ key: 'tab-pajaro' })
  await tiene(/Paloma mensajera/, /te toca/, /Marco los fines de semana en gris/, /recomendada/)
  expect((await ui.find({ type: 'Input' }))?.props?.placeholder).toBe('Otra: escribe la tuya…')
  // el cuadro de «Otra», de varias líneas
  expect((await ui.find({ type: 'Input' }))?.props?.rows).toBeGreaterThanOrEqual(2)
  // con su ficha desplegada, el bloque de las preguntas: la mitad, con la recomendada, y la otra mitad, con lo tuyo
  await tiene(/Recomendada[ |]*50\u00a0%/, /Otra[ |]*50\u00a0%/, /Desde el panel[ |]*0\u00a0%/, /Semana[ |]*3/)
  await vuelca('pajaro')
  await ui.press({ key: 'op-otra1-0-1' })
  await ui.input({ key: 'otra-otra1-1', text: 'Tras probar en el móvil' })
  await tiene(/Lo que mandas a Agenda/)
  await vuelca('pajaro-resumen')
  await ui.press({ key: 'rs-mandar' })
  await reloj.settle()
  expect(mensajes.some(m => (m.to === 'otra1' || m.to?.sessionId === 'otra1') && String(m.text) === 'D-137 · respuesta: 1b; 2: Tras probar en el móvil')).toBe(true)
  // el tick de lo mandado se va solo en cuanto Agenda se pone a trabajar con la respuesta
  expect((await ui.findAll({ key: 'f-otra1-p-p' })).length).toBe(1)
  pon(`${CASA}/coordinador/otra1.json`, { ...otra1(), toca: [], decisiones: [], estado: 'trabajando', turno: reloj.now() + 1000 })
  await reloj.advance(4000)
  await reloj.settle()
  expect((await ui.findAll({ key: 'f-otra1-p-p' })).length).toBe(0)
  await ui.press({ key: 'f-avisos-p-p' })
  await tiene(/Lo que ha pasado mientras tanto/, /Pruebas del formulario/)
  await vuelca('pajaro-avisos')

  await ui.press({ key: 'tab-genio' })
  await tiene(/Trabajador/, /Miniaturas de la galería/, /Vídeo de la portada en 4K/, /Revisar los enlaces/)
  // con su ficha desplegada, el bloque de los agentes de todas: uno de 3 min, que acabó mal
  await tiene(/Media[ |]*0:03\u00a0h/, /Fallidos[ |]*1/)
  await vuelca('genio')
  await ui.press({ key: 'v-acabados' })
  await tiene(/Pruebas del formulario/)
  await vuelca('genio-acabados')

  await ui.press({ key: 'tab-portales' })
  await tiene(/Cuota y día/, /de la semana/, /Por sesión/, /Cuándo lo usas/, /El día/)
  await vuelca('portales')
  // Cuándo lo usas, sin celdas partidas: con «Esta semana», la media de esta semana y hoy, lo de hoy (28-oct)
  const dibujado = async () => JSON.stringify(await ui.drawn())
  expect(await dibujado()).toContain('Media de esta semana; hoy, lo de hoy')
  expect(await dibujado()).not.toContain('Izq.')
  await ui.press({ key: 'pl-ficha' })
  await ui.press({ key: 'pl-porSesion' })
  // la unidad de «Por sesión», con el botón de su cabecera: el %, los millones de tokens y los dólares (28-oct)
  await tiene(/semana y hoy/, /Sem\. 37 %/)
  await ui.press({ key: 'ps-unidad' })
  await tiene(/Tokens/, /Sem\. 3,30 M · Día 3,30 M/)
  await ui.press({ key: 'ps-unidad' })
  await tiene(/USD/, /Sem\. 6,00 \$ · Día 3,00 \$/)
  await vuelca('portales-dolares')
  await ui.press({ key: 'ps-unidad' })
  await tiene(/Sem\. 37 %/)
  await ui.press({ key: 'pl-cuando' })
  expect(await dibujado()).toContain('Cada día de esta semana')
  await ui.press({ key: 'cu-media' })
  expect(await dibujado()).toContain('Media de 4 semanas; hoy, lo de hoy')
  await ui.press({ key: 'dia-todas' })
  await ui.press({ key: 'pl-dia' })
  await tiene(/La semana, día a día/, /semana y hoy/, /Vista semanal/)
  await vuelca('portales-abierto')
  await ui.unmount()

  // En la terminal no hay Svg: el árbol tiene que valer igual, pestaña a pestaña
  const terminal: any = await $.ui.mount({ plugin: 'd-137', surface: 'terminal', component: 'Pane', requestId: 'd-137', props: PANE } as any)
  for (const p of ['marty', 'doc', 'pajaro', 'genio', 'portales']) {
    await terminal.press({ key: `tab-${p}` })
    expect((await terminal.findAll({})).length).toBeGreaterThan(5)
  }
  await terminal.unmount()

  // La respuesta que llega de otro panel: esta sesión tiene una decisión pendiente, y pasa como mensaje de la persona, que
  // Claude lee tal cual (sin el marco de lo que manda un plugin), y sale del panel al llegar, aunque la sesión esté
  // trabajando y la respuesta espere su turno (28-oct: «ya mandé la respuesta por el propio mod y siguen pendientes»)
  const recibida: any = await $.session.receive({ origin: { kind: 'peer', plugin: 'd-137' }, text: 'D-137 · respuesta: 1b' } as any)
  expect(String(recibida?.consumed ?? '')).toContain('D-137')
  await reloj.settle()
  expect(enviados.some(t => t === 'Respuesta desde el panel D-137: 1b')).toBe(true)
  expect(mia().toca).toEqual([])
  expect(mia().decisiones ?? []).toEqual([])
  // Las decisiones siguen hasta que las contesta: un turno que no empieza con un mensaje suyo no las quita; su
  // respuesta desde el panel, sí, también con el «The d-137 plugin sent a message:» que le pone delante la app
  await $.tool.call({
    tool: 'mcp__d-137__progreso',
    decisiones: [{ titulo: '¿Paso la portada a las demás páginas?', opciones: ['Sí, a todas', 'Solo al inicio'], recomendada: 1 }],
  } as any)
  await $.turn.start({ text: 'una cosa más', turnId: 't3' } as any)
  await reloj.settle()
  expect(mia().toca).toEqual(['¿Paso la portada a las demás páginas?'])
  await $.turn.complete({ turnId: 't3', answer: 'ok', text: 'ok', durationMs: 1000, isAborted: false, reason: 'answer' } as any)
  await reloj.settle()
  expect(mia().toca).toEqual(['¿Paso la portada a las demás páginas?'])
  await $.turn.start({ text: 'The d-137 plugin sent a message:\nRespuesta desde el panel D-137: 1b', turnId: 't4' } as any)
  await reloj.settle()
  expect(mia().toca).toEqual([])
  // y su ficha, ya sin preguntas: en Decisión deja de salir como pendiente al momento
  expect(mia().decisiones ?? []).toEqual([])
  // Contestadas en el chat (26-oct): un mensaje suyo las quita al llegar, y a Claude le llegan al lado para que
  // mande otra vez las que sigan sin contestar; una orden o el mensaje de otra sesión, no
  await $.tool.call({
    tool: 'mcp__d-137__progreso',
    decisiones: [{ titulo: '¿Subo la portada a producción?', opciones: ['Sí, ya', 'Aún no'], recomendada: 1 }],
  } as any)
  expect(mia().toca).toEqual(['¿Subo la portada a producción?'])
  await $.prompt.submit({ text: '/marty', command: { name: 'marty', args: '' }, origin: { kind: 'composer' }, wait: false } as any)
  await $.prompt.submit({ text: '¿cómo vas?', origin: { kind: 'peer' }, wait: false } as any)
  await reloj.settle()
  expect(mia().toca).toEqual(['¿Subo la portada a producción?'])
  await $.prompt.submit({ text: '1b', origin: { kind: 'composer' }, wait: false } as any)
  await reloj.settle()
  expect(mia().toca).toEqual([])
  expect(mia().decisiones ?? []).toEqual([])
  expect(contextos.at(-1)).toContain('¿Subo la portada a producción?: a) Sí, ya · b) Aún no (recomendada)')
  // La de un modelo de otra sesión (sin el mod) llega como siempre
  const otro: any = await $.session.receive({ origin: { kind: 'peer' }, text: 'D-137 · respuesta: 1a' } as any)
  expect(otro?.consumed).toBeUndefined()

  // La franja de encima del mensaje
  const franja: any = await $.ui.mount({
    plugin: 'd-137', surface: 'desktop', component: 'AbovePrompt',
    props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 90, scroll: { offset: 0, bodyRows: 9 }, view: {} },
  } as any)
  console.log(`ARBOL:franja:${JSON.stringify(await franja.drawn())}`)
  // lo de la franja va donde esté el cursor, sin borrar lo escrito (28-oct), con su espacio si iría pegado
  caja = { text: 'mira esto', cursor: 9 }
  await franja.press({ key: 'fr-fotos-p' })
  caja = { text: '', cursor: 0 }
  // Commit despliega su menú; la opción escribe en la caja y lo cierra
  await franja.press({ key: 'fr-commit-p' })
  await reloj.settle()
  console.log(`ARBOL:franja-commit:${JSON.stringify(await franja.drawn())}`)
  await franja.press({ key: 'fr-op-e2e-b' })
  await reloj.settle()
  expect(puestos.slice(-2)).toEqual([
    'insert:  Usa la skill Fotos (lee ~/.claude/skills/fotos/SKILL.md): ',
    'insert: Haz commit de todo lo que haya pendiente, agrupándolo en el número de commits que veas que tenga más sentido por ' +
      'el trabajo que se ha realizado; después, haz push del commit o los commits a la rama correspondiente, con [e2e] al ' +
      'final del mensaje del último commit, para que GitHub lance la suite E2E.',
  ])
  // la cabeza de Doc abre su página (atajos.ts), en su programa
  const antes3 = ordenes.length
  await franja.press({ key: 'fr-panel-p' })
  await reloj.settle()
  const panelG = ordenes.slice(antes3).find(o => o[0] === 'powershell.exe')
  expect(deUtf16(String(panelG?.[panelG.length - 1] ?? ''))).toContain('Panel.html')
  expect(deUtf16(String(panelG?.[panelG.length - 1] ?? ''))).toContain('Invoke-Item')
  expect(JSON.stringify(await franja.drawn())).not.toContain('fr-op-e2e')
  await franja.press({ key: 'fr-mas-p' })
  await reloj.settle()
  console.log(`ARBOL:franja-mas:${JSON.stringify(await franja.drawn())}`)
  await franja.press({ key: 'fr-op-analizar-pro-b' })
  expect(ordenes.some(o => o.some(x => x.endsWith('Analizar Pro.cmd')))).toBe(true)
  // sin su .cmd, Analizar no abre nada: el aviso dice dónde se cambia su ruta
  const antes4 = ordenes.length
  await franja.press({ key: 'fr-mas-p' })
  await franja.press({ key: 'fr-op-analizar-b' })
  await reloj.settle()
  expect(ordenes.slice(antes4).some(o => o.some(x => String(x).endsWith('Analizar.cmd')))).toBe(false)
  // «Mods» deja /reload-plugins escrito en la caja (la app no deja que el mod lo lance) y manda la recarga a las demás
  // que la entienden (otra2); a las de antes (otra1), no (28-oct)
  const mandados0 = mensajes.length
  const puestos0 = puestos.length
  caja = { text: '', cursor: 0 }
  await franja.press({ key: 'fr-mas-p' })
  await franja.press({ key: 'fr-op-recargar-b' })
  await reloj.settle()
  const recargas = mensajes.slice(mandados0).filter(m => m.text === 'D-137 · recarga el mod')
  expect(recargas.map(m => m.to?.sessionId ?? m.to)).toEqual(['otra2'])
  const escritas = () => puestos.slice(puestos0).filter(p => p === '/reload-plugins').length
  // esta sesión está trabajando (t4): se escribe al acabar su turno
  expect(escritas()).toBe(0)
  await $.turn.complete({ turnId: 't4', answer: 'ok', text: 'ok', durationMs: 1000, isAborted: false, reason: 'answer' } as any)
  await reloj.advance(400)
  await reloj.settle()
  expect(escritas()).toBe(1)
  expect(corridas).not.toContain('reload-plugins')
  await franja.unmount()
  expect(avisos.length).toBeGreaterThanOrEqual(0)
  // y la que recibe la recarga de otra sesión (con el marco con el que llega de verdad) la deja escrita en su caja, sin
  // pasársela a Claude; si está trabajando, al acabar su turno; de alguien sin el mod, llega como cualquier mensaje
  const MARCO = (cuerpo: string) => `Another Claude session sent a message:\n<cross-session-message from="uds:x" from-session="local_web" from-name="Web-02" from-mode="bypass" from-plugin="d-137">\n${cuerpo}\n</cross-session-message>\n\nThis came from another Claude session — not typed by your user.`
  const recibe: any = await $.session.receive({ origin: { kind: 'peer', plugin: 'd-137' }, text: MARCO('D-137 · recarga el mod') } as any)
  expect(String(recibe?.consumed ?? '')).toContain('recarga')
  await reloj.advance(400)
  await reloj.settle()
  expect(escritas()).toBe(2)
  await $.turn.start({ text: 'otra cosa', turnId: 't9' } as any)
  const enTurno: any = await $.session.receive({ origin: { kind: 'peer', plugin: 'd-137' }, text: MARCO('D-137 · recarga el mod') } as any)
  expect(String(enTurno?.consumed ?? '')).toContain('recarga')
  await reloj.advance(400)
  await reloj.settle()
  expect(escritas()).toBe(2)
  await $.turn.complete({ turnId: 't9', answer: 'hecho', text: 'hecho', durationMs: 1000, isAborted: false, reason: 'answer' } as any)
  await reloj.advance(400)
  await reloj.settle()
  expect(escritas()).toBe(3)
  const ajena: any = await $.session.receive({ origin: { kind: 'peer' }, text: MARCO('D-137 · recarga el mod') } as any)
  expect(ajena?.consumed).toBeUndefined()
})

test('La cabeza de cada personaje y las filas de «Cuándo lo usas»', async () => {
  // cada uno, la suya, con el cuello de la camiseta (Marty y Azul solo se distinguen por ella) y sin lo que no es cabeza
  // (la cola de Copito, la copa de Liz)
  expect(TAGS).toEqual(['M-01', 'M-02', 'M-03', 'M-04', 'M-05', 'M-08', 'Verano', 'Liz', 'Gerardo', 'Copito', 'Terror', 'Pompis', 'Mantequillo', 'Michi',
    'Poli', 'Vaquero', 'Pirata', 'Gecko', 'Ciclope', 'Toxico', 'MiniDoc', 'Astronauta', 'Pepinillo', 'Pecas', 'Ronin'])
  // los 11 nuevos (28-oct), con su dibujo pequeño para las casillas, no el del Marty de siempre
  for (const t of TAGS.slice(14)) expect(spriteDe(t).tag).toBe(t)
  expect(new Set(TAGS.map(t => cabezaDe(t).svg)).size).toBe(TAGS.length)
  for (const t of TAGS) {
    const c = cabezaDe(t)
    expect(c.h).toBeGreaterThanOrEqual(14)
    expect(c.h).toBeLessThanOrEqual(26)
  }
  expect(cabezaDe('M-01').h).toBe(22)
  expect(cabezaDe('Copito').w).toBe(18)
  // el nombre de cada uno, el de su ficha
  expect(TAGS.map(nombreTag)).toEqual(['Marty D-137', 'Azul', 'Evil', 'Mutante', 'Xenomarty', 'Martinator', 'Verano',
    'Liz', 'Gerardo', 'Copito', 'Terror', 'Pompis', 'Mantequillo', 'Michi', 'Poli', 'Vaquero', 'Pirata', 'Gecko',
    'Cíclope', 'Tóxico', 'Mini Doc', 'Astronauta', 'Pepinillo', 'Pecas', 'Ronin'])
  // uno que no se sabe quién es (o uno de los quitados), la del Marty
  expect(cabezaDe(undefined).svg).toBe(cabezaDe('M-01').svg)
  expect(cabezaDe('M-06').svg).toBe(cabezaDe('M-01').svg)
  // el de dos cabezas y el afro ya no se reparten: la sesión que aún tenga uno coge otro libre (28-oct)
  const vieja = { id: 'vieja', tag: 'M-06', nombre: '', rotulo: '', desde: 1, latido: 1, estado: 'esperando' as const, turno: 0,
    paso: '', toca: [], archivos: [], espera: null }
  expect(TAGS).toContain(sana(vieja, []).tag)
  expect(sana({ ...vieja, tag: 'M-07' }, []).tag).not.toBe('M-07')
  const verano = { ...vieja, tag: 'Verano' }
  expect(sana(verano, [])).toBe(verano)

  // Cuándo lo usas, el lunes 26 a las 17:40, con lo de hoy y lo del domingo 25
  const AHORA = new Date(2026, 9, 26, 17, 40, 0).getTime()
  const hoy = Array.from({ length: 24 }, (_, h) => (h >= 9 && h <= 17 ? 0.6 : 0))
  const domingo = Array.from({ length: 24 }, (_, h) => (h >= 10 && h <= 20 ? 0.7 : 0))
  const g = { dias: {}, horas: { '2026-10-26': hoy, '2026-10-25': domingo } }
  const ceros = Array.from({ length: 24 }, () => 0)
  // Esta semana, plegada: entre semana, la media de esta semana (solo el lunes); el finde aún no ha llegado; hoy, lo de hoy
  expect(horasDe(g, AHORA, false, false).map(f => [f.nombre, f.valores])).toEqual([['Entre semana', hoy], ['Finde', null], ['Hoy', hoy]])
  // Media, plegada: la de las cuatro semanas de antes (entre semana, sin nada; el finde, el domingo); hoy, lo de hoy
  expect(horasDe(g, AHORA, false, true).map(f => [f.nombre, f.valores])).toEqual([['Entre semana', ceros], ['Finde', domingo], ['Hoy', hoy]])
  // Esta semana, desplegada: cada día de esta semana; los que no han llegado, sin nada
  const semana = horasDe(g, AHORA, true, false)
  expect(semana.map(f => f.nombre)).toEqual(['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'])
  expect(semana.map(f => f.valores)).toEqual([hoy, null, null, null, null, null, null])
  expect(semana.map(f => !!f.fuerte)).toEqual([true, false, false, false, false, false, false])
  // Media, desplegada: la de cada día de la semana en las cuatro de antes; el de hoy, lo de hoy
  expect(horasDe(g, AHORA, true, true).map(f => f.valores)).toEqual([hoy, ceros, ceros, ceros, ceros, ceros, domingo])
  // El martes a las 10:30, la media de esta semana: a las 9, la del lunes y la del martes; a las 15, solo la del lunes,
  // que las 15 del martes aún no han llegado
  const martes = Array.from({ length: 24 }, (_, h) => (h >= 9 && h <= 10 ? 0.4 : 0))
  const g2 = { dias: {}, horas: { '2026-10-26': hoy, '2026-10-27': martes } }
  const entre = horasDe(g2, new Date(2026, 9, 27, 10, 30, 0).getTime(), false, false)[0]?.valores ?? []
  expect([entre[9], entre[15]]).toEqual([0.5, 0.6])
})

test('El rótulo, la semana desde el lunes, lo de cada sesión y los tokens', async () => {
  // sin guion, el rótulo es la primera palabra y el resto va debajo (28-oct)
  const f = (nombre: string) => ({ id: 'x', tag: 'M-03', nombre, rotulo: '', desde: 1, latido: 1, estado: 'esperando' as const,
    turno: 0, paso: '', toca: [], archivos: [], espera: null })
  // con la dimensión por el principio del nombre (la de sin opciones)
  leeAjustes({})
  expect(rotuloDe('Not-02 Notas del proyecto', 'mi-web')).toBe('Not-02')
  expect(restoDe(f('Not-02 Notas del proyecto'))).toBe('Notas del proyecto')
  expect(rotuloDe('Web - Portada nueva', 'mi-web')).toBe('Web')
  expect(restoDe(f('Web - Portada nueva'))).toBe('Portada nueva')
  expect(rotuloDe('M-02 PDF Informe', 'mi-web')).toBe('PDF')
  expect(restoDe(f('M-02 PDF Informe'))).toBe('Informe')
  expect(rotuloDe('Web-02', 'mi-web')).toBe('Web-02')
  expect(restoDe(f('Web-02'))).toBe('')
  expect(rotuloDe('mi-web-3', 'mi-web')).toBe('mi-web')
  // con la dimensión por repo o por rama (29-oct), el rótulo es el nombre entero, y debajo va entero; sin nombre
  // propio, la carpeta, como siempre
  leeAjustes({ dimension: 'Mismo repo' })
  expect(rotuloDe('Web - Portada nueva', 'mi-web')).toBe('Web - Portada nueva')
  expect(rotuloDe('M-02 PDF Informe', 'mi-web')).toBe('PDF Informe')
  expect(restoDe(f('Not-02 Notas del proyecto'))).toBe('Not-02 Notas del proyecto')
  expect(rotuloDe('mi-web-3', 'mi-web')).toBe('mi-web')
  leeAjustes({ dimension: 'Una que ya no está' })
  expect(rotuloDe('Not-02 Notas del proyecto', 'mi-web')).toBe('Not-02')

  // La semana: sin saber cuándo se renueva, desde el lunes a las 0:00 (el domingo 1-nov a las 23:59, aún la del 26)
  const vacia = { dias: {}, horas: {} }
  const a = (dia: number, h: number, m = 0) => new Date(2026, 9, dia, h, m).getTime()
  expect(ventanaSemana({}, vacia, a(28, 10, 38))).toEqual({ inicio: a(26, 0), fin: a(26 + 7, 0) })
  expect(ventanaSemana({}, vacia, a(32, 23, 59)).inicio).toBe(a(26, 0))
  expect(ventanaSemana({}, vacia, a(33, 0)).inicio).toBe(a(33, 0))
  // con la renovación que dijo Claude Code, aunque sea de la semana pasada: la de ahora, siete días después
  const pasada = { ...vacia, ultimo: { pct: 94, cuando: 1, resetsAt: '2026-10-28T09:00:00.000Z' } }
  expect(new Date(ventanaSemana({}, pasada, a(28, 10, 38)).fin).toISOString()).toBe('2026-11-04T09:00:00.000Z')
  expect(new Date(ventanaSemana({}, pasada, a(28, 9, 30)).fin).toISOString()).toBe('2026-10-28T09:00:00.000Z')

  // Lo de cada sesión desde que se renovó (el 28 a las 10:00): la que solo gastó antes desaparece; del día del corte,
  // lo de sus horas desde las 10; de un día sin horas (de antes del cambio), nada si es el del corte
  const h = (n: number, de: number) => Array.from({ length: 24 }, (_, i) => (i === de ? n : 0))
  const reg = (id: string, dias: Record<string, unknown>) => ({ id, tag: 'M-01', rotulo: id, nombre: id, dias } as any)
  const regs = [
    reg('antes', { '2026-10-28': { usd: 2, hechos: [], usdH: h(2, 9), tok: 900, tokH: h(900, 9) } }),
    reg('despues', { '2026-10-28': { usd: 5, hechos: [], usdH: h(3, 11), tok: 700, tokH: h(700, 11) }, '2026-10-27': { usd: 4, hechos: [] } }),
    reg('vieja', { '2026-10-28': { usd: 6, hechos: [] } }),
  ]
  const lista = porSesion(regs, [], a(28, 10), a(28, 12))
  expect(lista.map(x => [x.id, x.usdSemana, x.usdHoy, x.tokSemana])).toEqual([['despues', 3, 3, 700]])
  // otro día de la semana, entero; y desde las 0:00, el día entero aunque no tenga horas
  expect(gastadoDesde(regs[1], 'usd', a(26, 10))).toBe(9)
  expect(gastadoDesde(regs[2], 'usd', a(28, 0))).toBe(6)

  // Los tokens de una transcripción: cada respuesta una vez (con la cifra más alta), las de todas, en su hora
  const l = (id: string, t: number, salida: number) => JSON.stringify({ type: 'assistant', timestamp: new Date(t).toISOString(),
    requestId: `r${id}`, message: { id: `m${id}`, usage: { input_tokens: 1, output_tokens: salida, cache_read_input_tokens: 100, cache_creation_input_tokens: 10 } } })
  const tk = tokensDe([[l('1', a(28, 9, 5), 3), l('1', a(28, 9, 5), 9), '{"type":"user"', ''].join('\n'), l('2', a(28, 11), 89)])
  expect(tk.total).toBe(120 + 200)
  expect(tk.dias['2026-10-28']?.[9]).toBe(120)
  expect(tk.dias['2026-10-28']?.[11]).toBe(200)
  // el uso de una respuesta copiada de la sesión de antes: a cero arriba y entero en sus iteraciones
  expect(usoDe({ input_tokens: 0, output_tokens: 0, iterations: [{ input_tokens: 2, output_tokens: 10, cache_read_input_tokens: 1000, cache_creation_input_tokens: 0 }] }).n).toBe(1012)
  // la sesión de antes sale del resumen: la de la propia sesión, no
  const resumen = JSON.stringify({ type: 'user', isCompactSummary: true, message: { content: 'read the full transcript at: C:\\x\\11111111-2222-4333-8444-555555555555.jsonl y la suya 99999999-2222-4333-8444-555555555555.jsonl' } })
  expect(anterioresDe(resumen, '99999999-2222-4333-8444-555555555555')).toEqual(['11111111-2222-4333-8444-555555555555'])
  expect(anterioresDe(resumen.replace('full transcript at', 'otra cosa'), 'x')).toEqual([])
  // los ratos: del mensaje a su última respuesta, cortados mientras pregunta; una línea copiada (mismo uuid), una vez
  const T0 = Date.parse('2026-10-28T09:00:00Z')
  const ln = (o: Record<string, unknown>, min: number) => JSON.stringify({ ...o, timestamp: new Date(T0 + min * 60000).toISOString() })
  const msg = (uuid: string, min: number) => ln({ type: 'user', uuid, turnPosition: { promptIndex: 1 }, message: { content: 'hola' } }, min)
  const res = (uuid: string, min: number, extra: Record<string, unknown> = {}) => ln({ type: 'assistant', uuid, requestId: uuid, message: { id: uuid, content: [], usage: { input_tokens: 100, output_tokens: 0 } }, ...extra }, min)
  const pregunta = ln({ type: 'assistant', uuid: 'p', message: { id: 'p', content: [{ type: 'tool_use', id: 'q', name: 'AskUserQuestion', input: {} }] } }, 10)
  const respuesta = ln({ type: 'user', uuid: 'r', message: { content: [{ type: 'tool_result', tool_use_id: 'q', content: 'a' }] } }, 40)
  const una = [msg('m1', 0), res('a1', 5), pregunta, respuesta, res('a2', 45), msg('m2', 60), res('a3', 70)].join('\n')
  const an = analiza([{ texto: una, principal: true }, { texto: res('a1', 5), principal: true }])
  expect(an.tramos.map(t => [(t.desde - T0) / 60000, (t.hasta - T0) / 60000, t.tok])).toEqual([[0, 10, 100], [40, 45, 100], [60, 70, 100]])
  expect(an.tok).toBe(300)
  // y lo que hace sola tras más de 15 min sin nada (sin mensaje tuyo delante) es otro rato; lo de un subagente, ninguno
  const sola = [msg('n1', 0), res('n2', 5), res('n3', 125), res('n4', 130)].join('\n')
  const an2 = analiza([{ texto: sola, principal: true }, { texto: res('n5', 300), principal: false }])
  expect(an2.tramos.map(t => [(t.desde - T0) / 60000, (t.hasta - T0) / 60000])).toEqual([[0, 5], [125, 130]])
  // las rutas de una orden, con sus variables, y sin las que siguen con una variable o un comodín
  expect(rutasDe('S="C:/a b/c"; node "$S/x.cjs" d/e.txt "$OTRA/y" "*.png"', 'D:\\obra')).toEqual(['c:/a b/c', 'c:/a b/c/x.cjs', 'd:/obra/d/e.txt'])
  // las letras de las opciones, también pasada la z (decisiones de 32 opciones, 28-oct)
  expect([0, 9, 25, 26, 31, 51, 52, -1].map(letra)).toEqual(['a', 'j', 'z', 'aa', 'af', 'az', 'ba', '?'])
  // y las cifras a la española
  expect([millones(168540000), millones(3300050), dolares(1451.1108)]).toEqual(['168,5 M', '3,30 M', '1.451,11 $'])
})

// Lo elegido al instalar (29-oct): qué sesiones van juntas y qué frenos actúan. Esta sesión, en mi-web y su
// rama main, y tres más: una en otro worktree del mismo repo y otra rama, que está escribiendo compartido.md y tiene
// a.txt sin commit; otra en el mismo repo y su misma rama, con una ficha de antes (sin el worktree principal); y otra de
// otro repo que empieza igual de nombre
async function bancoDimension($: any, on: any) {
  const reloj = mock.clock(on, { now: AHORA })
  mock.env(on, { USERPROFILE: 'C:\\Users\\prueba' })
  const fs = new Map<string, { text: string; mtimeMs: number }>()
  const pon = (ruta: string, valor: unknown) => fs.set(ruta, { text: JSON.stringify(valor), mtimeMs: reloj.now() })
  const ficha = (id: string, extra: Record<string, unknown>) => ({
    id, desde: AHORA + 1000, latido: AHORA + 3600000, estado: 'esperando', turno: 0, paso: '', toca: [], archivos: [],
    espera: null, v: 2, ...extra,
  })
  pon(`${CASA}/sessions/100.json`, { sessionId: 'yo-123', name: 'Web - Portada nueva', hostSessionId: 'local_yo' })
  pon(`${CASA}/coordinador/otraW.json`, ficha('otraW', {
    tag: 'Liz', nombre: 'Arreglos del login', rotulo: 'Arreglos del login', estado: 'trabajando', turno: AHORA - 60000,
    archivos: [{ ruta: 'c:/proyectos/mi-web/compartido.md', desde: AHORA }], tocados: ['c:/proyectos/mi-web/a.txt'],
    repo: { raiz: 'c:/proyectos/mi-web-login', carpeta: 'mi-web-login', rama: 'login', principal: 'c:/proyectos/mi-web' },
  }))
  pon(`${CASA}/coordinador/otraM.json`, ficha('otraM', {
    tag: 'M-05', nombre: 'Agenda del equipo', rotulo: 'Agenda del equipo',
    repo: { raiz: 'c:/proyectos/mi-web', carpeta: 'mi-web', rama: 'main' },
  }))
  pon(`${CASA}/coordinador/otraX.json`, ficha('otraX', {
    tag: 'M-03', nombre: 'Web - Tienda', rotulo: 'Web - Tienda', repo: { raiz: 'c:/proyectos/tienda', carpeta: 'tienda', rama: 'main' },
  }))
  on('fs.list', (_: any, e: any) => {
    const dir = norma(e.path).toLowerCase()
    const out: unknown[] = []
    const dirs = new Set<string>()
    for (const [k, v] of fs) {
      if (!k.toLowerCase().startsWith(`${dir}/`)) continue
      const resto = k.slice(dir.length + 1)
      if (resto.includes('/')) dirs.add(resto.split('/')[0] as string)
      else out.push({ name: resto, kind: 'file', size: v.text.length, mtimeMs: v.mtimeMs, isLink: false })
    }
    for (const d of dirs) out.push({ name: d, kind: 'dir', size: 0, mtimeMs: 0, isLink: false })
    return { value: out }
  })
  on('fs.stat', (_: any, e: any) => {
    const r = norma(e.path).toLowerCase()
    const f = [...fs].find(([k]) => k.toLowerCase() === r)?.[1]
    if (f) return { value: { kind: 'file', size: f.text.length, mtimeMs: f.mtimeMs, isLink: false } }
    throw new Error(`ENOENT ${r}`)
  })
  on('fs.read', (_: any, e: any) => {
    const f = fs.get(norma(e.path))
    if (!f) throw new Error(`ENOENT ${norma(e.path)}`)
    return { value: f.text }
  })
  on('fs.write', (_: any, e: any) => {
    fs.set(norma(e.path), { text: e.text, mtimeMs: reloj.now() })
    return { value: undefined }
  })
  on('session.id', () => ({ value: 'yo-123' }))
  on('session.root', () => ({ value: 'C:\\Proyectos\\mi-web' }))
  on('session.cwd', () => ({ value: 'C:\\Proyectos\\mi-web' }) as any)
  on('session.usage', () => ({
    value: { startedAt: AHORA, context: {}, cost: { usd: 1 }, rateLimits: [
      { kind: 'seven_day', percentUsed: 20, resetsAt: '2026-10-29T08:00:00.000Z' },
      { kind: 'five_hour', percentUsed: 5, resetsAt: '2026-10-26T20:00:00.000Z' },
    ] },
  }) as any)
  on('agent.list', () => ({ value: [] }) as any)
  // git: su raíz, la carpeta .git (relativa, la del worktree principal), su rama y a.txt sin commit
  on('process.run', (_: any, e: any) => {
    const argv = e.argv as string[]
    const sale = argv.includes('--show-toplevel') ? 'C:/Proyectos/mi-web\n'
      : argv.includes('--git-common-dir') ? '.git\n'
        : argv.includes('--show-current') ? 'main\n'
          : argv.includes('status') ? ' M a.txt\n' : ''
    return { value: { exitCode: 0, stdout: sale, stderr: '', isStdoutTruncated: false, isStderrTruncated: false } } as any
  })
  on('tool.register', () => ({ value: {} }) as any)
  on('command.register', (_: any, e: any) => ({ value: { command: e.name } }) as any)
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.invalidate', () => ({ value: undefined }) as any)
  on('ui.toast', () => ({ value: undefined }) as any)
  on('session.send', () => ({ isDelivered: true }) as any)
  on('session.start', (_: any, e: any) => ({ cwd: e.cwd }))
  on('turn.start', (_: any, e: any) => ({ turnId: e.turnId }) as any)
  on('tool.call', () => ({ result: {} }) as any)
  on('prompt.compose', () => ({ sections: [] }))

  await $.session.start({ cwd: 'C:\\Proyectos\\mi-web', surface: 'desktop', isInteractive: true })
  await reloj.settle()
  const mia = () => JSON.parse(fs.get(`${CASA}/coordinador/yo-123.json`)?.text ?? '{}')
  const ui: any = await $.ui.mount({ plugin: 'd-137', surface: 'desktop', component: 'Pane', requestId: 'd-137', props: PANE } as any)
  const textos = async () => (await ui.findAll({})).map((x: any) => [x.text, x.props?.alt].filter(Boolean).join(' ')).join(' | ')
  return { mia, textos }
}

test('Al instalar, por repo: el nombre entero y sin frenos', { options: { dimension: 'Mismo repo', frenos: 'Ninguno' } }, async ($, on) => {
  const { mia, textos } = await bancoDimension($, on)
  // el rótulo es el nombre entero, y el repo, el del worktree principal
  expect(mia().rotulo).toBe('Web - Portada nueva')
  expect(mia().repo.principal).toBe('c:/proyectos/mi-web')
  const todo = await textos()
  // arriba, solo el personaje (sin «· Web»), y debajo, el nombre entero
  expect(todo).not.toContain(`${nombreTag(mia().tag)} · Web`)
  expect(todo).toContain('Web - Portada nueva')
  // juntas, la del otro worktree (en otra rama) y la de la ficha de antes; la del otro repo, no, aunque empiece igual
  expect(todo).toContain('Dimensión mi-web')
  expect(todo).toMatch(/Arreglo/)
  expect(todo).toMatch(/Agenda/)
  expect(todo).not.toMatch(/Web - T/)
  // sin frenos: escribe en el archivo que otra está tocando, y el restore pasa
  await $.turn.start({ text: 'arregla el login', turnId: 't1' } as any)
  const escribe: any = await $.tool.call({ tool: 'Edit', file_path: 'C:\\Proyectos\\mi-web\\compartido.md', old_string: 'a', new_string: 'b' } as any)
  expect(JSON.stringify(escribe)).not.toContain('D-137')
  expect(mia().espera).toBe(null)
  expect(mia().tocados).toContain('c:/proyectos/mi-web/compartido.md')
  const deshace: any = await $.tool.call({ tool: 'Bash', command: 'git restore a.txt', description: 'Deshacer a.txt' } as any)
  expect(JSON.stringify(deshace)).not.toContain('sin commit')
})

test('Al instalar, por repo y rama: solo las de su rama y solo el freno de git', { options: { dimension: 'Mismo repo y rama', frenos: 'Solo el de git' } }, async ($, on) => {
  const { textos } = await bancoDimension($, on)
  const todo = await textos()
  // solo la de su misma rama; la del otro worktree está en otra
  expect(todo).toContain('Dimensión mi-web · main')
  expect(todo).toMatch(/Agenda/)
  expect(todo).not.toMatch(/Arreglo/)
  // el de archivos, no: escribe; el de git, sí: el restore se para
  await $.turn.start({ text: 'arregla el login', turnId: 't1' } as any)
  const escribe: any = await $.tool.call({ tool: 'Edit', file_path: 'C:\\Proyectos\\mi-web\\compartido.md', old_string: 'a', new_string: 'b' } as any)
  expect(JSON.stringify(escribe)).not.toContain('D-137')
  const deshace: any = await $.tool.call({ tool: 'Bash', command: 'git restore a.txt', description: 'Deshacer a.txt' } as any)
  expect(JSON.stringify(deshace)).toContain('sin commit de otra sesi')
})
