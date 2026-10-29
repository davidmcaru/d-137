export type Estado = 'trabajando' | 'terminado' | 'esperando'
// Los pasos del turno: cada herramienta, y los hitos que Claude dice con la herramienta «progreso» (los de la cascada)
export type Paso = { id: string; texto: string; desde: number; hasta?: number; fallo?: boolean; hito?: boolean }
// Una decisión para la persona; el contexto, una o dos frases para decidir sin ir a la sesión
export type Decision = { titulo: string; opciones: string[]; recomendada: number; contexto?: string }
export type Archivo = { ruta: string; desde: number }
export type Espera = { ruta: string; de: string; desde?: number }
// Lo que una sesión tiene en segundo plano: una orden (un render, un servidor) o un agente; con su última línea de
// salida mientras corre, y cuándo y cómo acabó
export type Tarea = {
  id: string
  que: string
  tipo: 'orden' | 'agente'
  desde: number
  salida?: string
  linea?: string
  fin?: number
  estado?: string
  orden?: string
}
// Lo que deja cada turno: los archivos que crea o que envía, y cuándo
// creado: lo escribió Claude; enviado: te lo mandó al chat; chat: te lo dio en el chat para abrir con «Run»
export type Entrega = { ruta: string; tipo: 'creado' | 'enviado' | 'chat'; cuando?: number }
// La carpeta de la sesión: la raíz del repo (o la carpeta, si no hay git), su rama y cuántos cambios sin commit tiene
// principal: la raíz del worktree principal, la misma para todos los worktrees del repo (sale de la carpeta .git que
// comparten), para saber que dos sesiones trabajan en el mismo repo aunque cada una esté en su worktree (29-oct)
export type Repo = { raiz: string; carpeta: string; rama?: string; sinCommit?: number; principal?: string }
// Lo que la sesión sabe de la cuota por su última respuesta: el % de la semana y de las 5 horas, y cuándo se renuevan
export type Lectura = { semana?: number; horas?: number; renuevaSemana?: string; renuevaHoras?: string; cuando: number }
// La ficha que cada sesión deja en la carpeta compartida (un .json por sesión): con ella, cada panel sabe qué hacen las
// demás, quién te espera, quién está tocando qué archivo y qué tiene en marcha
export type Ficha = {
  id: string
  tag: string
  // el nombre de la sesión en la app, y el rótulo: lo de delante del guion o lo que se puso con /rotulo (propio)
  nombre: string
  rotulo: string
  propio?: boolean
  desde: number
  latido: number
  estado: 'trabajando' | 'esperando'
  // cuándo empezó el turno, si trabaja, o cuándo acabó
  turno: number
  paso: string
  // los títulos de las decisiones que le tocan a la persona, y las decisiones enteras para Decisión
  toca: string[]
  decisiones?: Decision[]
  archivos: Archivo[]
  espera: Espera | null
  // lo que tiene en segundo plano (vivo y acabado), lo que gastó su última tarea (en % de la semana) y los archivos que
  // ha tocado en toda la sesión, para el freno de git
  marcha?: Tarea[]
  acabadas?: Tarea[]
  gasto?: number | null
  tocados?: string[]
  cerrada?: boolean
  // desde la versión 2 del panel
  v?: number
  repo?: Repo
  enlace?: string
  pasosN?: [number, number]
  hecho?: string
  // lo que lleva costado la sesión, en dólares a precio de la API (el /cost de Claude Code)
  usd?: number
  lectura?: Lectura
  // el % del contexto que lleva la sesión (el que enseña la app en «Context»)
  contexto?: number
  // su mod entiende la recarga que manda «Mods» desde otra sesión (desde el 28-oct)
  recarga?: boolean
}
export type Ventana = { pct: number; renueva?: string; resetsAt?: string }
export type Cuota = { semana?: Ventana; horas?: Ventana }
export type Hecho = { t: number; texto: string }
// Lo de un día de una sesión: los dólares y lo que hizo y, desde el 28-oct, también hora a hora (usdH, 24 cifras) y sus
// tokens (tok, y tokH hora a hora), para cortar la semana a la hora en que se renueva
export type DiaRegistro = { usd: number; hechos: Hecho[]; usdH?: number[]; tok?: number; tokH?: number[] }
// Lo de toda la sesión para el bloque de 3 × 3 de Marty (desde el 28-oct), también de las sesiones de las que sigue:
// cuándo empezó, el rato que ha trabajado y el más largo (en ms), los tokens del rato que más gastó, lo que pesa en
// dólares ese rato y toda la sesión (para repartir su coste), sus tokens y los archivos que ha tocado
export type ResumenSesion = {
  inicio: number
  activa: number
  maxT: number
  maxTok: number
  maxPeso: number
  peso: number
  tok: number
  archivos: number
  // y lo de sus subagentes, para el bloque de Trabajador: cuántos, lo que tardaron en total y el que más, sus tokens y lo
  // que pesan en dólares (en total y el que más), y los que acabaron mal
  agentes?: { n: number; tiempo: number; maxT: number; tok: number; maxTok: number; peso: number; maxPeso: number; fallidos: number }
  // y las preguntas que te ha hecho, para el bloque de Decisión: cuándo llegó cada una y, de las que contestaste, cuántas
  // con la recomendada, cuántas con lo tuyo («Otra») y cuántas desde el panel
  preguntas?: { cuando: number[]; contestadas: number; rec: number; otra: number; panel: number }
}
// El registro de cada sesión (coordinador/registro/<id>.json): lo que gastó y lo que hizo cada día, aunque ya esté
// cerrada; y lo de toda la sesión: los dólares ya apuntados (visto: lo que llevaba costado la sesión la última vez),
// sus tokens (tok) y lo del bloque de Marty (sesion)
export type Registro = {
  id: string
  tag: string
  rotulo: string
  nombre: string
  dias: Record<string, DiaRegistro>
  visto?: number
  tok?: number
  sesion?: ResumenSesion
}
// La cuota de todas (coordinador/cuota.json), que escribe una sola sesión: el % de la semana al empezar y al acabar
// cada día, y lo gastado en cada hora
export type CuotaGlobal = {
  ultimo?: { pct: number; cuando: number; resetsAt?: string }
  dias: Record<string, { ini: number; fin: number; antes?: number }>
  horas: Record<string, number[]>
}
export type Pestana = 'marty' | 'doc' | 'pajaro' | 'genio' | 'portales'
// Lo que se mandó a una sesión desde Decisión, para enseñarlo atenuado
export type Mandada = { texto: string; cuando: number; decisiones: Decision[]; elegidas: string[]; turno: number }

declare module 'claude-code' {
  interface PluginState {
    'd-137': {
      ficha: Ficha | null
      otras: Ficha[]
      estado: Estado
      pasos: Paso[]
      plan: string[]
      toca: Decision[]
      hecho: string
      inicio: number
      fin: number
      aviso: string
      cuota: Cuota
      marcha: Tarea[]
      entregas: Entrega[]
      gasto: number | null
      registros: Registro[]
      global: CuotaGlobal
      pestana: Pestana
      abiertos: Record<string, boolean>
      repoSel: string | null
      elegida: string | null
      filtro: string
      tocaSel: string | null
      tocaPaso: number
      elecciones: Record<string, number>
      mandadas: Record<string, Mandada>
      vistos: string[]
      marchaVista: string
      marchaTipo: string
      cuandoModo: string
      diaModo: string
      // la unidad de «Por sesión» en Cuota: % (de la semana), tok (millones de tokens) o usd
      unidad: string
      confirma: string
      franjaMenu: string | null
    }
  }
}
