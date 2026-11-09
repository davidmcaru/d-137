// Lo común de las cinco pestañas de D-137 (rediseño de las iteraciones 1 a 10, Diseno-Panel): los cuatro estados con su
// color, los tiempos, la tarjeta de borde fino, su cabecera con el único botón de plegar (a la derecha), la ficha de
// arriba (el dibujo en su marco, la línea grande, el nombre y tres filas de cuadritos, igual en las cinco) y la rejilla
// de casillas. Los colores de texto y de borde son claves del tema de la app, que siguen el modo claro u oscuro; los
// fondos, en hexadecimal con transparencia; los dibujos llevan sus colores dentro
import type { RenderElement } from 'claude-code'

import type {
  Cuota, CuotaGlobal, Decision, Entrega, Estado, Ficha, Mandada, Paso, Pestana, Registro, Reparto, Tarea, TotalesHistorico,
} from '../types'
import { cuadritos, icono, marty as martyQuieto } from './dibujos'
import { anchoTexto, boton, chip, esc, plegarK, separador, svgPulsable, T } from './kit'

export type Est = 'trabaja' | 'espera' | 'bloqueada' | 'parada'
export const ESTADOS: Record<Est, { nombre: string; plural: string; texto: string; hex: string }> = {
  trabaja: { nombre: 'Trabaja', plural: 'Trabajan', texto: 'suggestion', hex: '#6cb6ff' },
  espera: { nombre: 'Espera', plural: 'Esperan', texto: 'warning', hex: '#f0a03c' },
  bloqueada: { nombre: 'Bloqueada', plural: 'Bloqueadas', texto: 'error', hex: '#ef6b62' },
  parada: { nombre: 'Parada', plural: 'Paradas', texto: 'inactive', hex: '#9a9a96' },
}
// El fondo de una casilla: suave sin pulsar (8 %), fuerte pulsada (16 %), como eligió en la iteración 9
export const SUAVE = '14'
export const FUERTE = '29'
export const CAJA = '1f'
export const VERDE = '#57c27a'
export const AMARILLO = '#e2b93b'
export const CIAN = '#9fe3ff'
export const GRIS = '#8b8b86'
export const FONDO = T.tarjeta
export const MARCO = T.marco
// Las claves de color del tema, en los colores de las maquetas (para lo que se dibuja en SVG)
const TEMA: Record<string, string> = { text: T.t1, inactive: T.t3, subtle: T.borde, suggestion: T.trab, success: T.ok,
  warning: T.aviso, error: T.error }
export const hexDe = (c: string) => TEMA[c] ?? c

export function estadoDe(f: Ficha): Est {
  if (f.espera) return 'bloqueada'
  if (f.estado === 'trabajando') return 'trabaja'
  return f.toca.length ? 'espera' : 'parada'
}
// Desde cuándo está en su estado: la espera de un bloqueo, o el principio o el final de su turno
export const desdeDe = (f: Ficha) => (f.espera ? f.espera.desde ?? (f.turno || f.desde) : f.turno || f.desde)

const dos = (n: number) => String(n).padStart(2, '0')
// Entre la cifra y su unidad, un espacio que no se parte: «0,0 %» no se corta en dos líneas (26-oct)
const NB = '\u00a0'
export function mmss(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000))
  const al = Math.floor(s / 3600)
  return al ? `${al}:${dos(Math.floor((s % 3600) / 60))}:${dos(s % 60)}` : `${Math.floor(s / 60)}:${dos(s % 60)}`
}
export const hm = (ms: number) => {
  const m = Math.floor(Math.max(0, ms) / 60000)
  return `${Math.floor(m / 60)}:${dos(m % 60)}${NB}h`
}
// El mes de un instante, para decirlo: «ago. 2026»
const MESES = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.']
export const mesDe = (ms: number) => {
  const d = new Date(ms)
  return `${MESES[d.getMonth()] ?? ''}${NB}${d.getFullYear()}`
}
// Este mes hasta hoy: «Del 1 al 3 de nov.» (el día 1, «1 de nov.»)
export const delMes = (ms: number) => {
  const d = new Date(ms)
  const mes = MESES[d.getMonth()] ?? ''
  return d.getDate() === 1 ? `1 de ${mes}` : `Del 1 al ${d.getDate()} de ${mes}`
}
// El tiempo de la etiqueta de cada estado, como en las maquetas: «Trabaja · 12:40 min», «Espera · 6 min», «Parada · 2:53 h»
export function tiempoEstado(est: Est, ms: number): string {
  if (ms >= 3600000) return hm(ms)
  if (est === 'trabaja' || est === 'bloqueada') return `${mmss(ms)}${NB}min`
  return `${Math.max(1, Math.round(ms / 60000))}${NB}min`
}
// El tiempo de su estado, corto, para la casilla pequeña: «2 min», «2:54 h»
export const tiempoCorto = (ms: number) => (ms >= 3600000 ? hm(ms) : `${Math.max(1, Math.round(ms / 60000))}${NB}min`)
export const duracion = (ms: number) => (ms >= 3600000 ? hm(ms) : `${mmss(ms)}${NB}min`)
export const hora = (ms: number) => {
  const d = new Date(ms)
  return `${dos(d.getHours())}:${dos(d.getMinutes())}`
}
export function hace(ms: number): string {
  const min = Math.round(ms / 60000)
  if (min < 1) return 'ahora mismo'
  if (min < 60) return `hace ${min} min`
  const al = Math.floor(min / 60)
  return al < 24 ? `hace ${al}:${dos(min % 60)} h` : `hace ${Math.round(al / 24)} d`
}
export const pct = (n: number | null | undefined) =>
  typeof n !== 'number' ? '—' : `${(Math.round(n * 10) / 10).toFixed(1).replace('.', ',')}${NB}%`
export const pct0 = (n: number) => `${Math.round(n)}${NB}%`
// Una cifra a la española: el punto de los miles y la coma de los decimales («1.451,11»)
export const cifra = (n: number, decimales: number) => {
  const [ent = '0', dec] = Math.abs(n).toFixed(decimales).split('.')
  return `${n < 0 ? '-' : ''}${ent.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}${dec ? `,${dec}` : ''}`
}
// Los tokens, en millones («168,5 M»; por debajo de 10, con dos decimales), y los dólares a precio de la API
export const millones = (n: number | null | undefined) =>
  typeof n !== 'number' ? '—' : `${cifra(n / 1e6, n >= 1e7 ? 1 : 2)}${NB}M`
export const dolares = (n: number | null | undefined) => (typeof n !== 'number' ? '—' : `${cifra(n, 2)}${NB}$`)
export const corto = (s: string, n = 28) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)
export const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`
// La letra de una opción: de la a a la z y, pasada la z, aa, ab… (como las columnas de una hoja de cálculo)
export const letra = (k: number): string =>
  k < 0 ? '?' : k < 26 ? String.fromCharCode(97 + k) : letra(Math.floor(k / 26) - 1) + letra(k % 26)
export const nombreArchivo = (r: string) => r.split(/[\\/]/).filter(Boolean).pop() ?? r

export type Ui = {
  pestana: Pestana
  abiertos: Record<string, boolean>
  repoSel: string | null
  elegida: string | null
  filtro: string
  tocaSel: string | null
  tocaPaso: number
  elecciones: Record<string, number>
  textos: Record<string, string>
  mandadas: Record<string, Mandada>
  vistos: string[]
  marchaVista: string
  marchaTipo: string
  cuandoModo: string
  diaModo: string
  unidad: string
  confirma: string
}
export type Datos = {
  ahora: number
  cols: number
  surface: string
  yo: Ficha | null
  otras: Ficha[]
  est: Estado
  pasos: Paso[]
  t0: number
  t1: number
  hecho: string
  entregas: Entrega[]
  gasto: number | null
  marcha: Tarea[]
  cuota: Cuota
  global: CuotaGlobal
  registros: Registro[]
  historico: TotalesHistorico | null
  reparto: Reparto | null
  plan: string[]
  aviso: string
  ui: Ui
}
export type Acciones = {
  ui: <K extends keyof Ui>(clave: K, valor: Ui[K]) => void
  alterna: (clave: string) => void
  copia: (texto: string, surface?: string) => void
  escribe: (texto: string, surface?: string) => void
  abreSesion: (f: Ficha) => void
  abreRuta: (ruta: string, comoRun?: boolean) => void
  abreCarpeta: (ruta: string) => void
  limpiaEntregas: () => void
  avisa: (f: Ficha, texto: string) => void
  elige: (id: string, i: number, k: number) => void
  texto: (clave: string, valor: string) => void
  manda: (f: Ficha) => void
  mandaTodo: () => void
  desmanda: (id: string) => void
  cierra: (f: Ficha, seguro: boolean) => void
  visto: (ids: string[]) => void
  lanza: (que: string) => void
  limpiaPasos: () => void
  limpiaAcabadas: (ids: string[]) => void
  verSalida: (t: Tarea) => void
  para: (t: Tarea, seguro: boolean, f?: Ficha) => void
  prueba: (texto: string) => void
  eligePersonaje: (tag: string) => void
}
export type El = any

// Un dibujo; en la terminal, que no tiene Svg, nada. Siempre con descripción: el escritorio no pinta un Svg con el
// «alt» vacío (visto el 26-oct: los iconos y las barras de la cascada no salían). El alto no se llama «h»: taparía la
// función con la que se dibujan las piezas
export function dibujo(el: El, source: string, w: number, alto: number, alt: string, vivo = false): RenderElement | null {
  const { Svg } = el
  if (!Svg) return null
  const texto = alt.trim() || 'dibujo'
  return vivo
    ? <Svg source={source} alt={texto} width={w} height={alto} isInteractive />
    : <Svg source={source} alt={texto} width={w} height={alto} />
}
// Un dibujo que llena todo el ancho que tiene (las barras de «Por sesión»): sin ancho, el escritorio le da el suyo hasta
// llenar el hueco, así que el SVG va algo más ancho que el hueco y con preserveAspectRatio="none", y se encoge justo
// hasta el borde (28-oct: «la barra no llega al final de la fila»)
export function dibujoLleno(el: El, source: string, alto: number, alt: string): RenderElement | null {
  const { Box, Svg } = el
  if (!Svg) return null
  return <Box flexDirection="row"><Svg source={source} alt={alt.trim() || 'dibujo'} height={alto} /></Box>
}
// Los Martys son de 16 × 16: a 16, 32 o 48 px cada píxel cae entero y no sale borroso
// Una figura de ficha (fichaDe, docDe, fijaDe), lo más grande que quepa en su recuadro y con su proporción: el de la
// ficha (84 × 100 px) o el que se diga (26-oct: «que ocupe mucho más y se vea más grande»)
export const CAJA_FICHA = { w: 84, h: 100 }
export const tamFigura = (f: { w: number; h: number }, caja = CAJA_FICHA) => {
  const s = Math.min(caja.w / f.w, caja.h / f.h)
  return { w: Math.round(f.w * s), h: Math.round(f.h * s) }
}
export const figuraEn = (el: El, f: { svg: string; w: number; h: number }, alt: string, viva = false, caja = CAJA_FICHA) => {
  const t = tamFigura(f, caja)
  return dibujo(el, f.svg, t.w, t.h, alt, viva)
}
// La marca del estado, encima del recuadro de la figura, en su esquina de arriba a la derecha
export function marcaEn(el: El, key: string, svg: string | null, alt: string, viva = false): RenderElement | null {
  const { Box } = el
  if (!svg) return null
  return <Box key={key} position="absolute" top={0} right={0}>{dibujo(el, svg, 22, 22, alt, viva)}</Box>
}
export const mini = (el: El, tag: string | undefined, lado = 16, alt = 'Marty') =>
  dibujo(el, martyQuieto(tag), lado, lado, alt)
export const ico = (el: El, nombre: string, color = GRIS, lado = 14) => dibujo(el, icono(nombre, color), lado, lado, `icono ${nombre}`)

// La tarjeta de borde fino (A1), con aire dentro
export function tarjeta(el: El, key: string, hijos: unknown[], o: { borde?: string; fondo?: string } = {}): RenderElement {
  const { Box } = el
  return (
    <Box key={key} flexDirection="column" borderStyle="round" borderColor={o.borde ?? T.borde}
      backgroundColor={o.fondo ?? T.tarjeta} paddingX="sm" paddingY="sm" gap="xs">
      {hijos}
    </Box>
  )
}
export function plegar(el: El, clave: string, abierto: boolean, a: Acciones): RenderElement {
  return plegarK(el, clave, abierto, () => a.alterna(clave))
}
// La cabecera de una tarjeta: icono, título y cuenta a la izquierda; lo suyo y el botón de plegar, a la derecha
export function cabecera(el: El, o: {
  key: string; icono?: string; titulo: string; cuenta?: string | number; fuerte?: boolean; derecha?: unknown;
  plegable?: { clave: string; abierto: boolean; a: Acciones }
}): RenderElement {
  const { Box, Text } = el
  // el título, en su caja que encoge: si el panel es estrecho, se corta con «…» y no echa fuera lo de la derecha
  // (9-nov: en un panel estrecho se salían cosas)
  return (
    <Box key={o.key} flexDirection="row" alignItems="center" gap="xs">
      {o.icono ? ico(el, o.icono) : null}
      <Box flexShrink={1} minWidth={0}>
        <Text size="footnote" color={o.fuerte ? T.t1 : T.t3} weight={o.fuerte ? 'bold' : 'semibold'} wrap="truncate-end">
          {o.titulo}
          {o.cuenta !== undefined && o.cuenta !== '' ? <Text weight="bold" color={T.t1}>{` · ${o.cuenta}`}</Text> : null}
        </Text>
      </Box>
      <Box flexGrow={1} />
      {o.derecha ?? null}
      {o.plegable ? plegar(el, o.plegable.clave, o.plegable.abierto, o.plegable.a) : null}
    </Box>
  )
}

// La ficha de arriba, igual de alta y ancha en las cinco pestañas: el dibujo en su marco, la línea de arriba grande y
// en negrita, el nombre debajo (con lo que se diga delante, `antesNombre`: el botón pequeño del enlace en Sesión) y tres
// filas de cuadritos con su cifra. Desplegada (la de Marty), debajo de una raya y a todo lo ancho, lo que se diga (`abajo`)
//
// La línea de arriba (9-nov: en un panel estrecho, o con un nombre largo, la carpeta echaba fuera el botón de
// plegar): el botón, siempre a la derecha y entero; el título («quién · lo suyo»), hasta el 60 % de la fila; lo de la
// derecha (`derecha`: la carpeta de Sesión, los avisos de Decisión, las cuentas de Activo), en lo que quede, que se acorta
// solo; y el título, en lo que eso no use, cortado con «…» si no cabe
export type FilaFicha = { etiqueta: string; frac: number; valor: string; color: string }
export type Titulo = { quien: string; estado: string; color: string }
// lo de la derecha de la línea de arriba, para el sitio que tiene (en px): lo que se pinta y lo que mide, o nada
export type Derecha = (max: number) => { el: unknown; ancho: number } | null
// el ancho de la columna de la ficha, a la derecha del dibujo: el panel (unos 7,9 px por columna) menos el borde y el aire
// de la tarjeta (48), el marco del dibujo (unos 100) y su hueco (16), con un margen; medido en unas capturas del 9-nov
export const anchoColumnaFicha = (cols: number) => Math.max(80, Math.round(cols * 7.9 - 165))
const PLEGAR = 26
const HUECO = 7
export function ficha(el: El, o: {
  key: string; dibujo: unknown; titulo: Titulo; derecha?: Derecha; plegable?: { clave: string; abierto: boolean; a: Acciones };
  nombre: string; filas: FilaFicha[]; cols: number;
  debajo?: unknown; marca?: unknown; marco?: { fondo: string; borde: string }; abajo?: unknown; antesNombre?: unknown
}): RenderElement {
  const { Box, Text } = el
  const col = anchoColumnaFicha(o.cols)
  const fijo = o.plegable ? PLEGAR + HUECO : 0
  const entero = anchoTitulo(`${o.titulo.quien}${SEP}${o.titulo.estado}`)
  const der = o.derecha ? o.derecha(Math.max(0, col - fijo - HUECO - Math.min(entero, Math.round(col * 0.6)))) : null
  const maxTitulo = Math.max(0, col - fijo - (der ? der.ancho + HUECO : 0))
  // los cuadritos que caben entre la etiqueta y la cifra (unos 7,9 px por columna en el escritorio), todos los que
  // quepan, con el hueco de uno o dos antes de la cifra: con 14 como mucho, en un panel ancho quedaba un hueco grande
  // (28-oct; medido en sus capturas: la cuenta de antes se quedaba unos 40 px corta)
  // y, si el panel es tan estrecho que no caben cinco, ninguno: solo la etiqueta y la cifra (26-oct)
  const caben = Math.floor((o.cols * 7.9 - 185 - 17 * 7.9) / 12)
  const conBarra = caben >= 5
  // dos de más, con su ancho: el escritorio los encoge justo hasta llenar su hueco, así nunca se comen el margen de la
  // derecha ni dejan hueco (la cuenta de columnas es aproximada)
  const n = caben + 2
  // la cifra, a la derecha de su hueco y con el margen del bloque de abajo: así acaban en el mismo sitio, sea cual sea
  // su ancho (28-oct: con «0» en Decisión y Activo no casaban; con «59 %», por casualidad, sí)
  const fila = (f: FilaFicha) => (
    <Box key={`${o.key}-${f.etiqueta}`} flexDirection="row" alignItems="center" gap="sm" paddingRight="xl">
      <Box width={9} flexShrink={0}><Text size="footnote" color={T.t3} wrap="truncate-end">{f.etiqueta}</Text></Box>
      <Box flexGrow={1} minWidth={0}>
        {conBarra ? dibujoLleno(el, cuadritos(f.frac, f.color, n, 9, 3, true), 9, `${f.etiqueta}: ${f.valor}`) : null}
      </Box>
      <Box width={8} flexShrink={0} flexDirection="row" justifyContent="flex-end"><Text size="footnote" weight="bold" tabular wrap="truncate-end">{f.valor}</Text></Box>
    </Box>
  )
  return (
    <Box key={o.key} flexDirection="column" borderStyle="round" borderColor={T.borde} backgroundColor={T.tarjeta}
      paddingX="sm" paddingY="sm" gap="sm">
      <Box flexDirection="row" gap="md" alignItems="stretch">
        {/* la figura, centrada y llenando su recuadro; la marca del estado, encima, en la esquina */}
        <Box borderStyle="round" borderColor={o.marco?.borde ?? T.borde} backgroundColor={o.marco?.fondo ?? T.marco}
          alignItems="center" justifyContent="center" paddingX="xs" paddingY="xs" minWidth={13} position="relative">
          {o.dibujo}
          {o.marca ?? null}
        </Box>
        <Box flexDirection="column" flexGrow={1} gap="xs" minWidth={0}>
          {/* si la cuenta se queda corta en el panel de verdad, lo de la derecha encoge antes que el título (y se corta
              en su caja) y el botón no se mueve */}
          <Box flexDirection="row" alignItems="center" gap="xs">
            <Box flexGrow={1} flexShrink={1} minWidth={0} overflow="hidden">{arriba(el, o.titulo, maxTitulo)}</Box>
            {der ? <Box flexDirection="row" alignItems="center" flexShrink={100} minWidth={0} overflow="hidden">{der.el}</Box> : null}
            {o.plegable ? plegar(el, o.plegable.clave, o.plegable.abierto, o.plegable.a) : null}
          </Box>
          {o.antesNombre ? (
            <Box flexDirection="row" alignItems="center" gap="xs" minWidth={0}>
              {o.antesNombre}
              <Box flexShrink={1} minWidth={0}><Text size="footnote" color={T.t3} wrap="truncate-end">{o.nombre}</Text></Box>
            </Box>
          ) : <Text size="footnote" color={T.t3} wrap="truncate-end">{o.nombre}</Text>}
          {o.filas.map(fila)}
        </Box>
      </Box>
      {o.abajo ? separador(el, `${o.key}-raya`) : null}
      {o.abajo ?? null}
      {o.debajo ?? null}
    </Box>
  )
}
// Lo que sale desplegado de entrada (28-oct: las fichas de Sesión, Todas, Decisión y Activo, con su bloque de 3 × 3); lo
// demás, plegado hasta que se despliega
export const DESPLEGADOS = ['fichaMarty', 'fichaDoc', 'fichaPajaro', 'fichaGenio']
export const abiertoDe = (d: Datos, clave: string) => d.ui.abiertos[clave] ?? DESPLEGADOS.includes(clave)
// El bloque de 3 × 3 de una ficha desplegada (28-oct): tres filas de tres celdas, cada una con su etiqueta en
// gris y su cifra en el color de lo que cuenta; pintado por columnas, para que la raya fina de entre ellas vaya de
// arriba abajo (las filas casan solas: el mismo texto en todas), y a la derecha, el margen de las cifras de arriba
export type CeldaFicha = { etiqueta: string; valor: string; color: string }
// la raya, un poco más corta que el bloque (tres filas de texto pequeño y sus huecos): así no lo estira
const RAYA = 54
export function bloque3x3(el: El, key: string, filas: CeldaFicha[][]): RenderElement {
  const { Box, Text } = el
  const raya = (j: number) => (
    <Box key={`${key}-raya-${j}`} flexShrink={0}>
      {dibujo(el, `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="${RAYA}" viewBox="0 0 1 ${RAYA}"><rect width="1" height="${RAYA}" fill="${T.sep}"/></svg>`, 1, RAYA, 'separador')}
    </Box>
  )
  const columna = (j: number) => (
    <Box key={`${key}-${j}`} flexDirection="column" gap="xs" flexGrow={1} width={1} minWidth={0}>
      {filas.map(fila => fila[j]).filter((c): c is CeldaFicha => !!c).map((c, i) => (
        <Box key={`${key}-${j}-${i}`} flexDirection="row" alignItems="center" gap="xs">
          <Box flexShrink={1} minWidth={0}><Text size="footnote" color={T.t3} wrap="truncate-end">{c.etiqueta}</Text></Box>
          <Box flexGrow={1} />
          <Text size="footnote" weight="bold" color={c.color} tabular>{c.valor}</Text>
        </Box>
      ))}
    </Box>
  )
  return (
    <Box key={key} flexDirection="row" alignItems="center" gap="sm" paddingRight="xl">
      {[columna(0), raya(1), columna(1), raya(2), columna(2)]}
    </Box>
  )
}
// Lo de Sesión (la sesión, de sesion.ts) y Todas (todas las que ha habido, del histórico): el tiempo, lo que habría costado
// por la API y los tokens, en total, en el rato de trabajo más largo y por hora de trabajo; y lo de los archivos, que da
// cada ficha. El orden, el que se eligió entre cinco: los tokens a la derecha, así su hueco (no tienen media) cae
// abajo y ahí van los archivos. `estimado`: parte del coste sale de lo que pesa (historico.ts), y sus cifras llevan «≈»
export type Totales = { abierta?: number; activa?: number; maxT?: number; tok?: number; maxTok?: number; usd?: number; maxUsd?: number; estimado?: boolean }
export const tiempoO = (ms?: number) => (typeof ms === 'number' ? hm(ms) : '—')
export const casi = (estimado: boolean | undefined, s: string) => (estimado ? `≈${NB}${s}` : s)
export function bloqueTotales(el: El, key: string, t: Totales, archivos: CeldaFicha): RenderElement {
  const horas = (t.activa ?? 0) / 3600000
  return bloque3x3(el, key, [
    [{ etiqueta: 'Total', valor: tiempoO(t.abierta), color: T.t1 }, { etiqueta: 'Total', valor: casi(t.estimado, dolares(t.usd)), color: T.morado },
      { etiqueta: 'Total', valor: millones(t.tok), color: T.azul }],
    [{ etiqueta: 'Máx', valor: tiempoO(t.maxT), color: T.t1 }, { etiqueta: 'Máx', valor: casi(t.estimado, dolares(t.maxUsd)), color: T.morado },
      { etiqueta: 'Máx', valor: millones(t.maxTok), color: T.azul }],
    [{ etiqueta: 'Activa', valor: tiempoO(t.activa), color: T.t1 },
      { etiqueta: 'Media', valor: typeof t.usd === 'number' && horas >= 1 / 60 ? casi(t.estimado, `${cifra(t.usd / horas, 2)}${NB}$/h`) : '—', color: T.morado },
      archivos],
  ])
}
// Lo que cabe de un texto en `max` px, con «…» al final si no cabe entero (vacío si no caben ni unas letras)
export function cabe(texto: string, max: number, medir: (s: string) => number): string {
  if (medir(texto) <= max) return texto
  const letras = [...texto]
  while (letras.length && medir(`${letras.join('').trimEnd()}…`) > max) letras.pop()
  return letras.length ? `${letras.join('').trimEnd()}…` : ''
}
// Lo que mide el título de una ficha: anchoTexto se pasa con la letra grande (en unas capturas del 9-nov, un título de
// 31 letras medía 213 px y la cuenta daba 274), así que va rebajado, con un poco de margen
export const anchoTitulo = (s: string) => Math.ceil(anchoTexto(s, 16, true) * 0.8)
const SEP = `${NB}·${NB}`
// La línea de arriba de una ficha: «quién · lo suyo», con lo suyo en el color de su estado. En `max` px: si no cabe, se
// corta el quién con «…» y lo suyo queda entero; si ni así, solo lo suyo (lo que más dice: «Espera», «sobra 24 %»; el
// quién ya está en el dibujo y en la pestaña), cortado si hace falta. Cada parte va en su texto y su caja (un texto
// dentro de otro, en el escritorio, se partía en dos líneas en vez de cortarse; 9-nov)
export function arriba(el: El, t: Titulo, max = Infinity): RenderElement {
  const { Box, Text } = el
  let quien = t.quien
  let estado = t.estado
  if (anchoTitulo(`${quien}${SEP}${estado}`) > max) {
    const sitio = max - anchoTitulo(`${SEP}${estado}`)
    if (sitio >= anchoTitulo('Abcd…')) quien = cabe(quien, sitio, anchoTitulo)
    else if (estado) {
      quien = ''
      estado = cabe(estado, max, anchoTitulo) || estado
    } else quien = cabe(quien, max, anchoTitulo) || quien
  }
  return (
    <Box flexDirection="row" alignItems="center" minWidth={0}>
      {quien ? <Box flexShrink={1} minWidth={0}><Text size="heading" weight="bold" wrap="truncate-end">{quien}</Text></Box> : null}
      {quien && estado ? <Box flexShrink={0}><Text size="heading" weight="bold" color={T.t3}>{SEP}</Text></Box> : null}
      {estado ? <Box flexShrink={quien ? 0 : 1} minWidth={0}><Text size="heading" weight="bold" color={t.color} wrap="truncate-end">{estado}</Text></Box> : null}
    </Box>
  )
}
// Una insignia con su icono (la carpeta de Marty, los avisos de Decisión): redonda y con su borde fino, como en las
// maquetas (26-oct: «bordes redondeados»); en SVG, que una caja con fondo sale con las esquinas en pico. Con
// `alPulsar`, un botón (la carpeta de Marty la abre en el Explorador; 28-oct). Sin texto, solo el icono; `alt`,
// lo que dice entero cuando el texto va acortado
const anchoInsignia = (texto: string) => (texto ? Math.round(9 + 13 + 5 + anchoTexto(texto, 12, true) + 10) : 9 + 13 + 9)
export function insignia(el: El, key: string, icon: string, texto: string, color = 'text', alPulsar?: () => void, alt = texto): RenderElement {
  const { Box, Button, Text, Svg } = el
  if (!Svg) {
    return alPulsar ? <Button key={key} label={texto || alt} variant="secondary" onPress={alPulsar} />
      : <Text key={key} size="caption" weight="semibold">{texto || alt}</Text>
  }
  const tam = 12
  const w = anchoInsignia(texto)
  const al = 22
  const s = `<rect x="0.5" y="0.5" width="${w - 1}" height="${al - 1}" rx="${al / 2}" fill="#ffffff08" stroke="${T.borde}"/>` +
    icono(icon, '#a8a69f').replace('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">', `<svg x="9" y="4.5" width="13" height="13" viewBox="0 0 24 24">`) +
    (texto ? `<text x="${9 + 13 + 5}" y="${(al / 2 + tam * 0.36).toFixed(1)}" font-family="Inter, 'Segoe UI', system-ui, sans-serif" ` +
      `font-size="${tam}" font-weight="600" fill="${hexDe(color)}">${esc(texto)}</text>` : '')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${al}" viewBox="0 0 ${w} ${al}">${s}</svg>`
  if (alPulsar) return svgPulsable(el, key, svg, w, al, alt, alPulsar)
  return (
    <Box key={key} flexShrink={0}>
      <Svg source={svg} alt={alt} width={w} height={al} />
    </Box>
  )
}
// Una insignia para la línea de arriba de una ficha, en `max` px: entera; si no cabe, con su texto cortado con «…» (si
// se leen al menos unas letras); si no, con lo corto que se diga (el número de avisos) o solo el icono; y si ni eso, nada
export function insigniaCabe(el: El, key: string, icon: string, texto: string, max: number,
  o: { corto?: string; color?: string; alPulsar?: () => void } = {}): { el: RenderElement; ancho: number } | null {
  const pon = (t: string) => ({ el: insignia(el, key, icon, t, o.color, o.alPulsar, texto), ancho: anchoInsignia(t) })
  if (anchoInsignia(texto) <= max) return pon(texto)
  // lo que no es texto: el aire, el icono y su hueco (37 px)
  const sitio = max - 37
  if (sitio >= 70) {
    const t = cabe(texto, sitio, s => anchoTexto(s, 12, true))
    if (t) return pon(t)
  }
  const corto = o.corto ?? ''
  if (anchoInsignia(corto) <= max) return pon(corto)
  return anchoInsignia('') <= max ? pon('') : null
}
// Una pastilla de color con su texto (un estado, un número, «Bloqueo»…): el fondo, en la caja; dentro de un texto, el
// escritorio no lo pinta
export function pastilla(el: El, key: string, texto: string, color: string, fondo: string, mono = false): RenderElement {
  return chip(el, key, texto, hexDe(color), { punto: false, fondo, mono })
}

// Un dibujo pulsable (el Marty de una casilla, el Trabajador, un icono de la franja): el escritorio solo deja texto dentro
// de un botón, así que encima del dibujo va uno de caracteres en blanco (U+2800, unos 9 px cada uno). El botón lleva su
// relleno aunque no se vea (unos 12 px por lado) y, si no cabe, el escritorio lo corta con «…», que sí se ve: la capa
// sobresale una columna por cada lado y lleva los caracteres que caben (26-oct: «asocia el botón al Marty»)
export function pulsable(el: El, key: string, figura: unknown, anchoPx: number, alPulsar: () => void): RenderElement {
  const { Box, Button } = el
  const n = Math.max(1, Math.floor((anchoPx + 16 - 24) / 9.8))
  return (
    <Box key={key} position="relative" flexShrink={0}>
      {figura}
      <Box key={`${key}-capa`} position="absolute" top={0} bottom={0} left={-1} right={-1} justifyContent="center"
        alignItems="center">
        <Button key={`${key}-p`} label={'\u2800'.repeat(n)} plain onPress={alPulsar} />
      </Box>
    </Box>
  )
}

// La zona propia que recibe el clic de una casilla entera vive en kit.tsx, con el resto del aspecto de las maquetas
export { sinToque, toque, TOQUES } from './kit'

// Cuántas casillas van por fila: cerradas, cuatro; abiertas, dos si el panel da para ellas (cada una pide unos 145 px,
// con su dibujo y sus dos botones) y, si no, una (9-nov: en un panel estrecho, las de la derecha se salían)
export const porFilaDe = (cols: number, abiertas: boolean) => (!abiertas ? 4 : cols * 7.9 - 48 >= 2 * 145 + 7 ? 2 : 1)
// Las casillas en filas de n, todas del mismo ancho (la última fila, con huecos)
export function rejilla(el: El, key: string, items: RenderElement[], porFila: number): RenderElement {
  const { Box } = el
  const filas: RenderElement[][] = []
  for (let i = 0; i < items.length; i += porFila) filas.push(items.slice(i, i + porFila))
  return (
    <Box key={key} flexDirection="column" gap="xs">
      {filas.map((fila, i) => (
        <Box key={`${key}-f${i}`} flexDirection="row" gap="xs">
          {fila}
          {Array.from({ length: porFila - fila.length }, (_, j) => (
            <Box key={`${key}-h${i}-${j}`} flexGrow={1} width={1} minWidth={0} />
          ))}
        </Box>
      ))}
    </Box>
  )
}

// «Cerrar» una sesión parada: el primer clic solo pregunta, con «No, déjala» y «Sí, cerrar»; se cancela solo a los seis
// segundos o al pulsar cualquier otra cosa del panel (26-oct: lo pulsó por probar y no sabía cómo deshacerlo)
export function botonesCerrar(el: El, f: Ficha, d: Datos, a: Acciones, clave: string): RenderElement[] {
  if (d.ui.confirma === `cerrar-${f.id}`) {
    return [
      boton(el, `${clave}-no`, { texto: 'No, déjala', tipo: 'pri' }, () => a.ui('confirma', '')),
      boton(el, `${clave}-si`, { texto: 'Sí, cerrar', tipo: 'rojo' }, () => a.cierra(f, true)),
    ]
  }
  return [boton(el, `${clave}-cerrar`, { texto: 'Cerrar', icono: 'x' }, () => a.cierra(f, false))]
}

// La respuesta en el formato corto: «1a 2b 3a»; con «Otra», su texto
export function respuesta(decs: Decision[], elegida: (i: number) => number, texto: (i: number) => string): string {
  const partes = decs.map((_, i) => {
    const k = elegida(i)
    return k >= 0 ? `${i + 1}${letra(k)}` : `${i + 1}: ${texto(i).trim()}`
  })
  return partes.some(p => p.includes(':')) ? partes.join('; ') : partes.join(' ')
}
// Las decisiones de una sesión: las enteras, o solo sus títulos si su ficha es de antes
export const decisionesDe = (f: Ficha): Decision[] =>
  f.decisiones?.length ? f.decisiones : f.toca.map(titulo => ({ titulo, opciones: [], recomendada: 0 }))

// Los pasos que se enseñan: los hitos que dijo Claude o, si no dijo ninguno, las herramientas
export function pasosDe(pasos: Paso[]): Paso[] {
  const hitos = pasos.filter(p => p.hito)
  return hitos.length ? hitos : pasos
}
// Los pasos de la tarea, como el plan que Claude le cuenta a la persona (de 4 a 8): cada uno, hecho, el de ahora, en pausa
// (entre turnos) o por hacer. Sin plan, los hitos sueltos que haya dicho (26-oct: «que esos sean los pasos, y no
// cada comando»)
export type PasoVista = { texto: string; estado: 'hecho' | 'ahora' | 'pausa' | 'pendiente'; desde?: number; hasta?: number }
export function vistaPasos(plan: string[], pasos: Paso[], trabajando: boolean): PasoVista[] {
  const hitos = pasos.filter(p => p.hito)
  const estadoDe = (al?: Paso): PasoVista['estado'] => (!al ? 'pendiente' : al.hasta ? 'hecho' : trabajando ? 'ahora' : 'pausa')
  if (plan.length) {
    return plan.map(texto => {
      const al = [...hitos].reverse().find(x => x.texto === texto)
      return { texto, estado: estadoDe(al), desde: al?.desde, hasta: al?.hasta }
    })
  }
  return hitos.map(al => ({ texto: al.texto, estado: estadoDe(al), desde: al.desde, hasta: al.hasta }))
}

// Una acción que se confirma con un segundo clic («Cerrar» una sesión, «Parar» una orden): el primero solo pregunta,
// con «No» y «Sí»; se cancela sola a los seis segundos o al pulsar cualquier otra cosa del panel
export function confirmar(el: El, d: Datos, a: Acciones, o: {
  clave: string; id: string; etiqueta: string; no: string; si: string; hace: (seguro: boolean) => void
}): RenderElement[] {
  if (d.ui.confirma === o.id) {
    return [
      boton(el, `${o.clave}-no`, { texto: o.no, tipo: 'pri' }, () => a.ui('confirma', '')),
      boton(el, `${o.clave}-si`, { texto: o.si, tipo: 'rojo' }, () => o.hace(true)),
    ]
  }
  // «■» es parar: el botón de icono
  return [o.etiqueta === '■' ? boton(el, `${o.clave}-pide`, { icono: 'parar' }, () => o.hace(false))
    : boton(el, `${o.clave}-pide`, { texto: o.etiqueta }, () => o.hace(false))]
}
// Lo que gastó o va gastando una sesión
export const gastoDe = (f: Ficha) => (typeof f.gasto === 'number' ? f.gasto : null)
