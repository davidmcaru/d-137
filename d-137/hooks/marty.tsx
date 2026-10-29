// La pestaña Sesión, esta sesión (confirmada en la iteración 9): su ficha; los pasos del turno con MP10 (plegados, la
// barra conjunta; desplegados, la cascada); el bloque de su dimensión (las de su mismo tema, repo o rama, según lo
// elegido al instalar, y las que chocan con ella), plegado cuatro por
// fila y desplegado dos por fila, con el panel de la pulsada aparte; y lo entregado, con sus tres botones de icono
import type { RenderElement } from 'claude-code'

import type { Ficha } from '../types'
import type { Acciones, Datos, El } from './comun'
import {
  abiertoDe, AMARILLO, arriba, bloqueTotales, cabecera, corto, dibujo, duracion, ESTADOS, estadoDe, ficha, figuraEn, hace, hora, ico,
  insignia, marcaEn, mini, desdeDe, mmss, tiempoCorto,
  nombreArchivo, pct, pct0, plegar, pulsable, rejilla, tamFigura, tarjeta, toque, VERDE, vistaPasos,
} from './comun'
import type { PasoVista } from './comun'
import { TIPOS, tareasDe } from './genio'
import type { Tipo } from './genio'
import { AJUSTES, porNombre } from './ajustes'
import { fichaDe, marcaFicha, genioDe } from './dibujos'
import { nombreDe, nombreTag, restoDe } from './fichas'
import { tramoCascada } from './graficas'
import { boton, estadoEt, grueso, leyenda, mezcla, separador, T, unaVez } from './kit'

type Rel = { tipo: 'espero' | 'meespera' | 'pisamos' | 'trabaja' | 'espera' | 'parada'; chip: string; hex: string;
  titulo: string; frase: string; archivo?: string; desde?: number }
const lista = (rutas: string[]) => {
  const n = rutas.map(nombreArchivo)
  return n.length <= 2 ? n.join(' y ') : `${n.slice(0, 2).join(', ')} y ${n.length - 2} más`
}
// Cómo está otra sesión respecto a esta, con los colores de Doc (26-oct): en rojo, la que esperas, la que te
// espera y la que toca lo mismo que tú (sin commit todavía); si no, la de su estado: azul si trabaja, naranja si espera
// una decisión tuya y gris si está parada sin nada pendiente
// Los archivos que tocáis los dos: los suyos que también son tuyos y siguen vivos, porque están sin commit en el repo o
// porque uno de los dos los está tocando en este turno (en cualquier carpeta)
function comunesDe(yo: Ficha, f: Ficha, cambiados: string[]): string[] {
  const sinCommit = new Set(cambiados)
  const ahora = new Set([...yo.archivos, ...f.archivos].map(x => x.ruta))
  const mios = new Set([...(yo.tocados ?? []), ...yo.archivos.map(x => x.ruta)])
  const suyos = [...new Set([...(f.tocados ?? []), ...f.archivos.map(x => x.ruta)])]
  return suyos.filter(t => mios.has(t) && (sinCommit.has(t) || ahora.has(t)))
}
// El tema de una sesión: la primera palabra de su rótulo («Web», «PDF»), que ya va sin el M-xx (26-oct)
// …y hasta el primer guion: «Web-01» y «Web-02» son del mismo tema (26-oct)
export const temaDe = (f: Ficha) => (f.rotulo.trim().split(/\s+/)[0] ?? '').split('-')[0] ?? ''
// La dimensión de una sesión, según lo elegido al instalar (ajustes.ts; 29-oct): su tema; su repo, con todos
// sus worktrees; o su repo y su rama. Sin git, su carpeta
export function dimensionDe(f: Ficha): string {
  if (porNombre()) return temaDe(f).toLowerCase()
  const repo = f.repo ? f.repo.principal ?? f.repo.raiz : ''
  return repo && AJUSTES.dimension === 'rama' ? `${repo}#${f.repo?.rama ?? ''}` : repo
}
// Lo que dice su tarjeta: «Dimensión Web», «Dimensión mi-web» o «Dimensión mi-web · main»
function rotuloDimension(f: Ficha): string {
  if (porNombre()) return temaDe(f)
  const repo = f.repo ? (f.repo.principal && f.repo.principal !== f.repo.raiz ? nombreDe(f.repo.principal) : f.repo.carpeta) : ''
  return [repo, AJUSTES.dimension === 'rama' ? f.repo?.rama : ''].filter(Boolean).join(' · ')
}
// Si choca contigo, sea cual sea su tema: te bloquea, la bloqueas o tocáis el mismo archivo
export const chocaCon = (yo: Ficha, f: Ficha, cambiados: string[]) =>
  yo.espera?.de === f.tag || f.espera?.de === yo.tag || comunesDe(yo, f, cambiados).length > 0

export function relacion(yo: Ficha, f: Ficha, cambiados: string[]): Rel {
  const rojo = ESTADOS.bloqueada.hex
  if (yo.espera && yo.espera.de === f.tag) {
    return { tipo: 'espero', chip: 'Bloqueo', hex: rojo, titulo: 'Lo esperas',
      frase: `${nombreTag(f.tag)} está escribiendo en ${nombreArchivo(yo.espera.ruta)}, y tú lo necesitas para seguir.`,
      archivo: yo.espera.ruta, desde: yo.espera.desde }
  }
  if (f.espera && f.espera.de === yo.tag) {
    return { tipo: 'meespera', chip: 'Bloqueo', hex: rojo, titulo: 'Te espera',
      frase: `${nombreTag(f.tag)} necesita ${nombreArchivo(f.espera.ruta)}, que estás tocando tú.`, archivo: f.espera.ruta,
      desde: f.espera.desde }
  }
  const comunes = comunesDe(yo, f, cambiados)
  const sinCommit = new Set(cambiados)
  if (comunes.length) {
    return { tipo: 'pisamos', chip: 'Jope', hex: rojo, titulo: 'Tocáis lo mismo',
      frase: `Toca ${lista(comunes)}, ${comunes.length === 1 ? 'el mismo archivo' : 'los mismos archivos'} que tú, ${comunes.every(c => sinCommit.has(c)) ? 'sin commit' : 'ahora mismo'}.`,
      archivo: comunes[0] }
  }
  const est = estadoDe(f)
  if (est === 'trabaja') {
    return { tipo: 'trabaja', chip: 'Trabaja', hex: ESTADOS.trabaja.hex, titulo: 'Trabaja en lo suyo',
      frase: 'Trabaja en otros archivos: no os pisáis.' }
  }
  if (est === 'espera') {
    return { tipo: 'espera', chip: 'Espera', hex: ESTADOS.espera.hex, titulo: 'Espera tu decisión',
      frase: f.toca.length === 1 ? `«${corto(f.toca[0] ?? '', 70)}»` : `Tiene ${f.toca.length} preguntas para ti.` }
  }
  // bloqueada por otra que no eres tú
  if (est === 'bloqueada') {
    return { tipo: 'espero', chip: 'Bloqueo', hex: rojo, titulo: 'Bloqueada',
      frase: `Espera ${nombreArchivo(f.espera?.ruta ?? '')} de ${nombreTag(f.espera?.de)}.`, archivo: f.espera?.ruta, desde: f.espera?.desde }
  }
  return { tipo: 'parada', chip: 'Parada', hex: ESTADOS.parada.hex, titulo: 'Parada',
    frase: 'Sin nada que hacer ni nada pendiente.' }
}

// Desplegada la ficha (28-oct), debajo de una raya, el bloque de 3 × 3 de toda la sesión (sesion.ts,
// bloqueTotales): y en su casilla de los archivos, lo que tiene sin commit, en rojo, o, sin git, los que ha tocado, en
// naranja
function bloqueSesion(el: El, d: Datos, yo: Ficha): RenderElement {
  const reg = d.registros.find(r => r.id === yo.id)
  const s = reg?.sesion
  const usd = yo.usd
  const git = typeof yo.repo?.sinCommit === 'number'
  return bloqueTotales(el, 'ses', {
    abierta: s?.inicio ? d.ahora - s.inicio : undefined, activa: s?.activa, maxT: s?.maxT, tok: s?.tok ?? reg?.tok,
    maxTok: s?.maxTok, usd, maxUsd: typeof usd === 'number' && s && s.peso > 0 ? (usd * s.maxPeso) / s.peso : undefined,
  }, git ? { etiqueta: 'Commit', valor: String(yo.repo?.sinCommit ?? 0), color: T.error }
    : { etiqueta: 'Archivos', valor: s ? String(s.archivos) : '—', color: T.naranja })
}

export function pestanaMarty(el: El, d: Datos, a: Acciones, cambiados: string[]): RenderElement[] {
  const { Box, Text, Button } = el
  const yo = d.yo
  if (!yo) return [<Text key="arranca" color="inactive">Arrancando…</Text>]
  const est = estadoDe(yo)
  const c = ESTADOS[est]
  const trabajando = d.est === 'trabajando'
  const pasos = vistaPasos(d.plan, d.pasos, trabajando)
  const hechos = pasos.filter(p => p.estado === 'hecho').length
  const ahoraPaso = pasos.find(p => p.estado === 'ahora' || p.estado === 'pausa')
  // lo que hace ahora mismo si no hay plan: la última orden (sin enseñarlas todas)
  const ultima = [...d.pasos].reverse().find(p => !p.hito)
  const desdePlan = pasos.find(p => p.desde)?.desde
  const finPlan = trabajando ? d.ahora : Math.max(...pasos.map(p => p.hasta ?? p.desde ?? 0), d.t1 || 0)

  // el Marty con su «?» lleva a sus preguntas en Decisión, y con su «!», a Todas, donde se ve el bloqueo (26-oct)
  const fig = fichaDe(yo.tag, est)
  const figura = figuraEn(el, fig, `${nombreTag(yo.tag)}, ${c.nombre}`, true)
  const irA = est === 'espera' ? () => { a.ui('tocaSel', yo.id); a.ui('tocaPaso', 0); a.ui('pestana', 'pajaro') }
    : est === 'bloqueada' ? () => { a.ui('elegida', yo.id); a.ui('pestana', 'doc') } : null
  const abiertoF = abiertoDe(d, 'fichaMarty')
  const cabeza = ficha(el, {
    key: 'ficha',
    dibujo: irA ? pulsable(el, 'ficha-ir', figura, tamFigura(fig).w, irA) : figura,
    marca: fig.propia ? null : marcaEn(el, 'ficha-marca', marcaFicha(est), c.nombre, est === 'parada'),
    // el recuadro, del color de su estado, como las casillas (azul trabaja, naranja espera, rojo bloqueada); parada, como
    // siempre (26-oct)
    marco: est === 'parada' ? undefined : { fondo: mezcla(c.hex, 0.2, T.marco), borde: c.hex },
    // arriba, solo hasta el primer espacio del nombre de la sesión, y el resto debajo (28-oct); con la dimensión por repo
    // o por rama, solo el personaje, y el nombre entero debajo (29-oct)
    arriba: arriba(el, porNombre() ? `${nombreTag(yo.tag)} · ${yo.rotulo}` : nombreTag(yo.tag), c.nombre, c.texto),
    // la carpeta, un botón que la abre en el Explorador (28-oct)
    derecha: (
      <Box key="ficha-der" flexDirection="row" alignItems="center" gap="xs">
        {yo.repo ? insignia(el, 'carpeta', 'carpeta', yo.repo.carpeta, 'text', () => a.abreRuta(yo.repo?.raiz ?? '', true)) : null}
        {plegar(el, 'fichaMarty', abiertoF, a)}
      </Box>
    ),
    // y el que copia el enlace de la sesión, el mismo botón en pequeño, delante del nombre: arriba, junto a la carpeta,
    // echaba fuera el de plegar (28-oct)
    antesNombre: yo.enlace ? boton(el, 'ficha-enlace', { icono: 'enlace', alto: 18 }, () => a.copia(yo.enlace ?? '', d.surface)) : undefined,
    nombre: restoDe(yo) || (yo.nombre ? '' : 'Sin nombre todavía'),
    cols: d.cols,
    abajo: abiertoF ? bloqueSesion(el, d, yo) : undefined,
    filas: [
      { etiqueta: 'Contexto', frac: (yo.contexto ?? 0) / 100, valor: typeof yo.contexto === 'number' ? pct0(yo.contexto) : '—',
        color: (yo.contexto ?? 0) >= 85 ? ESTADOS.bloqueada.hex : (yo.contexto ?? 0) >= 60 ? AMARILLO : '#7cc4ff' },
      { etiqueta: 'Pasos', frac: pasos.length ? hechos / pasos.length : 0, valor: pasos.length ? `${hechos}/${pasos.length}` : '—', color: VERDE },
      // lo de hoy, contra lo que tocaría al día (la semana entre siete)
      { etiqueta: 'Gasto hoy', frac: Math.min(1, (d.gasto ?? 0) / (100 / 7)), valor: pct(d.gasto), color: AMARILLO },
    ],
  })

  // Los pasos de la tarea (MP10, con el plan de Claude): plegados, la barra de avance, un tramo por paso, y «Ahora:»;
  // desplegados, la cascada, con los que faltan en gris. «Limpiar» quita los hechos (26-oct)
  const abiertoP = d.ui.abiertos.pasos === true
  const colorDe = (p: PasoVista) => (p.estado === 'hecho' ? VERDE : p.estado === 'ahora' ? c.hex : p.estado === 'pausa' ? '#8e8c85' : '')
  const ancho = Math.max(200, Math.min(560, Math.round((d.cols - 8) * 7.2)))
  const t0 = desdePlan ?? d.ahora
  const cascada = pasos.flatMap((p, i) => {
    const hasta = p.hasta ?? finPlan
    const vivo = p.estado === 'ahora'
    // un paso que Claude se saltó o que se dio por hecho al acabar: hecho, sin barra ni tiempo
    const conTiempo = !!p.desde && p.hasta !== p.desde
    return [i ? separador(el, `paso-l-${i}`) : null, (
      <Box key={`paso-${i}`} flexDirection="row" alignItems="center" gap="sm">
        {p.estado === 'pendiente'
          ? dibujo(el, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5" fill="none" stroke="#6b6a64" stroke-width="1.5"/></svg>`, 13, 13, 'por hacer')
          : ico(el, p.estado === 'hecho' ? 'check' : 'reloj', colorDe(p), 13)}
        <Box flexGrow={1} flexShrink={1} width={1} minWidth={0}>
          <Text size="footnote" color={p.estado === 'pendiente' ? T.t3 : vivo ? T.t1 : T.t2} weight={vivo ? 'semibold' : undefined} wrap="truncate-end">{p.texto}</Text>
        </Box>
        {/* la barra, en su columna fija: el texto se corta antes de empujarla (26-oct) */}
        <Box flexShrink={0} width={17}>
          {conTiempo && p.desde
            ? dibujo(el, tramoCascada(p.desde, hasta, t0, finPlan, colorDe(p), vivo), 130, 12, `${p.texto}: ${mmss(hasta - p.desde)}`)
            : dibujo(el, tramoCascada(0, 0, 0, 1, '', false), 130, 12, `${p.texto}: ${p.estado === 'hecho' ? 'hecho' : 'por hacer'}`)}
        </Box>
        <Box width={6} flexShrink={0} alignItems="flex-end">
          <Text size="caption" color={T.t3} tabular>{conTiempo && p.desde ? mmss(hasta - p.desde) : ''}</Text>
        </Box>
      </Box>
    )]
  })
  const barraAvance = () => {
    const n = Math.max(1, pasos.length)
    const w = ancho / n
    let s = `<rect width="${ancho}" height="8" rx="3" fill="rgba(128,128,128,0.22)"/>`
    pasos.forEach((p, i) => {
      if (p.estado !== 'pendiente') s += `<rect x="${(i * w).toFixed(1)}" width="${Math.max(1, w - 3).toFixed(1)}" height="8" rx="3" fill="${colorDe(p)}"/>`
    })
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="8" viewBox="0 0 ${ancho} 8">${s}</svg>`
  }
  const lineaAhora = ahoraPaso
    ? `${ahoraPaso.estado === 'pausa' ? 'En pausa' : 'Ahora'}: ${ahoraPaso.texto}`
    : hechos && hechos === pasos.length ? 'Hecho: todos los pasos'
      : pasos.some(p => p.estado === 'pendiente') ? `Siguiente: ${pasos.find(p => p.estado === 'pendiente')?.texto ?? ''}`
        : trabajando && ultima ? `Ahora: ${ultima.texto}` : ''
  const bloquePasos = tarjeta(el, 'pasos', [
    cabecera(el, {
      key: 'pasos-cab', titulo: 'Pasos de la tarea', fuerte: true,
      derecha: (
        <Box key="pasos-der" flexDirection="row" alignItems="center" gap="xs">
          {pasos.length ? (
            <Text size="caption" color={T.t3}>
              {`Pasos ${hechos}/${pasos.length}${desdePlan ? ` · ${trabajando ? 'Lleva' : 'Llevó'} ${duracion(finPlan - desdePlan)}` : ''}`}
            </Text>
          ) : null}
          {hechos ? boton(el, 'pasos-limpiar', { texto: 'Limpiar', alto: 26 }, () => a.limpiaPasos()) : null}
        </Box>
      ),
      plegable: { clave: 'pasos', abierto: abiertoP, a },
    }),
    !pasos.length
      ? <Text key="pasos-nada" size="footnote" color="inactive" wrap="wrap">{lineaAhora || (trabajando ? 'Pensando…' : 'Sin pasos: salen cuando Claude cuenta el plan de una tarea.')}</Text>
      : abiertoP
        ? <Box key="cascada" flexDirection="column" gap="xs">{cascada}</Box>
        : <Box key="barra" flexDirection="column" gap="xs">
          {dibujo(el, barraAvance(), ancho, 8, `${hechos} de ${pasos.length} pasos`)}
          {lineaAhora ? <Text size="caption" color="inactive" wrap="truncate-end">{lineaAhora}</Text> : null}
        </Box>,
  ])

  // Las de su dimensión, con cómo están respecto a esta: las de su mismo tema, repo o rama (lo elegido al instalar;
  // 26-oct: por tema, cuando todas arrancaban en el mismo repo; 29-oct: por repo o por rama, a elegir) y, sea cual sea
  // su dimensión, las que chocan con ella; y, si corre algo en alguna (en
  // esta sesión o en las suyas), un Trabajador por tipo, del color del tipo, que lleva a Activo con lo activo de ese tipo
  // (26-oct)
  const dim = dimensionDe(yo)
  const tema = rotuloDimension(yo)
  const mismos = d.otras
    .filter(f => (dim && dimensionDe(f) === dim) || chocaCon(yo, f, cambiados))
    .sort((x, y) => x.tag.localeCompare(y.tag))
  const delRepo = (id: string) => id === yo.id || mismos.some(m => m.id === id)
  const corriendo = tareasDe(d).activas.filter(x => delRepo(x.f.id))
  const genio = (['agente', 'servidor', 'comando'] as Tipo[])
    .map(tp => ({ tp, n: corriendo.filter(x => x.tipo === tp).length }))
    .filter(x => x.n > 0)
  let repo: RenderElement[] = []
  if (mismos.length || genio.length) {
    const abiertoR = d.ui.abiertos.repo === true
    const porFila = abiertoR ? 2 : 4
    const casillas = mismos.map(f => {
      const r = relacion(yo, f, cambiados)
      const sel = d.ui.repoSel === f.id
      // como en Todas (it-12: sin la marca de «?» o «×»): el fondo del color de su estado, un 20 % sobre el oscuro,
      // y un 40 % la pulsada (26-oct)
      const fondo = mezcla(r.hex, sel ? 0.4 : 0.2, T.marco)
      const pulsa = unaVez(`rcas-${f.id}`, () => a.ui('repoSel', sel ? null : f.id))
      // el Marty lleva a su sesión; el nombre o el tiempo abren o cierran su panel (26-oct)
      const aSesion = unaVez(`rses-${f.id}`, () => a.abreSesion(f))
      const marty = (
        <Box key="mo" flexShrink={0} position="relative">
          {pulsable(el, `rmo-${f.id}`, mini(el, f.tag, 32), 32, aSesion)}
          {toque(el, `rmo-${f.id}`, aSesion)}
        </Box>
      )
      const tiempo = <Text size="caption" weight="bold" color={r.hex} wrap="truncate-end">{tiempoCorto(d.ahora - desdeDe(f))}</Text>
      return abiertoR ? grueso(el, `rg-${f.id}`, r.hex, fondo, { flexGrow: 1, width: 1, minWidth: 0 },
        { flexDirection: 'row', alignItems: 'center', gap: 'sm', paddingX: 'sm', paddingY: 'xs' }, [
          marty,
          <Box key="txt" flexDirection="column" flexGrow={1} minWidth={0} gap="xs" position="relative">
            <Box flexDirection="row" alignItems="center" gap="xs">
              <Text weight="bold" color={T.t1} wrap="truncate-end">{corto(f.rotulo, 10)}</Text>
              {tiempo}
            </Box>
            {estadoEt(el, `rch-${f.id}`, r.chip, r.hex)}
            <Text size="caption" color={T.t2} wrap="wrap">{r.frase}</Text>
            {toque(el, `rsel-${f.id}`, pulsa)}
          </Box>,
        ]) : grueso(el, `rp-${f.id}`, r.hex, fondo, { flexGrow: 1, width: 1, minWidth: 0 },
        { flexDirection: 'row', alignItems: 'center', gap: 'xs', paddingX: 'xs', paddingY: 'xs' }, [
          marty,
          <Box key="txt" flexDirection="column" flexGrow={1} minWidth={0} position="relative">
            <Text weight="bold" color={T.t1} wrap="truncate-end">{corto(f.rotulo, 8)}</Text>
            {tiempo}
            {toque(el, `rsel-${f.id}`, pulsa)}
          </Box>,
        ])
    })
    const PLURAL: Record<Tipo, string> = { agente: 'Agentes', servidor: 'Servidores', comando: 'Comandos' }
    // en la casilla, corto: cabe en el hueco de un Marty (26-oct)
    const CORTO: Record<Tipo, string> = { agente: 'Agent', servidor: 'Server', comando: 'CMD' }
    const tiles = genio.map(({ tp, n }) => {
      const ti = TIPOS[tp]
      // pulses donde pulses (el Trabajador, el nombre o la cifra), a Activo con lo activo de ese tipo (26-oct)
      const ir = unaVez(`mk-${tp}`, () => {
        a.ui('marchaVista', 'activos')
        a.ui('marchaTipo', tp)
        a.ui('pestana', 'genio')
      })
      return (
        grueso(el, `mk-${tp}`, ti.hex, mezcla(ti.hex, 0.08, T.marco), { flexGrow: 1, width: 1, minWidth: 0 },
          { flexDirection: 'row', alignItems: 'center', gap: 'xs', paddingX: 'xs', paddingY: 'xs', position: 'relative' }, [
            pulsable(el, `mkp-${tp}`, dibujo(el, genioDe(ti.hex), 21, 32, `Trabajador: ${PLURAL[tp]}`), 21, ir),
            <Box key="txt" flexDirection="column" alignItems="center" minWidth={0}>
              <Text weight="bold" color={T.t1} wrap="truncate-end">{CORTO[tp]}</Text>
              <Text size="caption" color={T.t3}>{String(n)}</Text>
            </Box>,
            toque(el, `mkp-${tp}`, ir),
          ])
      )
    })
    repo = [tarjeta(el, 'repo', [
      cabecera(el, { key: 'repo-cab', icono: 'carpeta', titulo: tema ? `Dimensión ${tema}` : 'Misma dimensión', cuenta: mismos.length,
        plegable: { clave: 'repo', abierto: abiertoR, a } }),
      // plegado, los Trabajadores siguen a las sesiones en la misma rejilla, con su mismo hueco; desplegado (casillas grandes),
      // aparte, en una de cuatro
      ...(abiertoR
        ? [...(casillas.length ? [rejilla(el, 'repo-rejilla', casillas, porFila)] : []),
          ...(tiles.length ? [rejilla(el, 'repo-genio', tiles, 4)] : [])]
        : casillas.length || tiles.length ? [rejilla(el, 'repo-rejilla', [...casillas, ...tiles], porFila)] : []),
    ])]
    const pulsada = mismos.find(f => f.id === d.ui.repoSel)
    if (pulsada) {
      const r = relacion(yo, pulsada, cambiados)
      const mensaje = r.tipo === 'espero'
        ? `D-137: ${nombreTag(yo.tag)} (${yo.rotulo}) necesita ${nombreArchivo(r.archivo ?? '')}, que estás tocando tú. Cuando acabes con él, díselo.`
        : r.tipo === 'pisamos'
          ? `D-137: ${nombreTag(yo.tag)} (${yo.rotulo}) también está tocando ${nombreArchivo(r.archivo ?? '')} en este repo, sin commit. Antes de seguir, mirad qué es de quién.`
          : ''
      repo.push(grueso(el, 'repo-panel', r.hex, mezcla(r.hex, 0.12, T.tarjeta), {},
        { flexDirection: 'column', gap: 'xs', paddingX: 'md', paddingY: 'sm' }, [
          <Box key="cab" flexDirection="row" alignItems="center" gap="sm">
            {estadoEt(el, 'repo-chip', r.chip, r.hex)}
            <Text weight="bold" color={T.t1}>{r.titulo}</Text>
            <Box flexGrow={1} />
            {r.desde ? <Text size="caption" color={T.t3}>{hace(d.ahora - r.desde)}</Text> : null}
          </Box>,
          <Text key="frase" size="footnote" color={T.t1} wrap="wrap">{r.frase}</Text>,
          <Text key="info" size="caption" color={T.t3} wrap="wrap">
            {[r.desde ? `Desde las ${hora(r.desde)}` : '', pulsada.repo?.rama ? `rama ${pulsada.repo.rama}` : '',
              pulsada.repo?.sinCommit ? `${pulsada.repo.sinCommit} cambios sin commit en el repo` : ''].filter(Boolean).join(' · ') || pulsada.nombre}
          </Text>,
          <Box key="btns" flexDirection="row" gap="xs">
            {mensaje ? boton(el, 'repo-avisar', { texto: 'Avisar', icono: 'enviar', tipo: 'pri' }, () => a.avisa(pulsada, mensaje)) : null}
            {boton(el, 'repo-sesion', { texto: 'Sesión', icono: 'ojo' }, () => a.abreSesion(pulsada))}
            {boton(el, 'repo-copiar', { texto: 'Copiar', icono: 'copiar' },
              (ev?: any) => a.copia(`${nombreTag(pulsada.tag)} ${pulsada.rotulo}: ${r.titulo}. ${r.frase}`, ev?.surface))}
          </Box>,
        ]))
    }
  }

  // Lo entregado: lo que crea o envía Claude, y lo que te da en el chat para abrir con «Run», lo más reciente arriba, con copiar la ruta, abrir la carpeta y abrirlo;
  // plegado, lo de la última hora, como mucho tres; «Limpiar» lo vacía (26-oct)
  const cwd = (yo.repo?.raiz ?? '').toLowerCase()
  const relativa = (ruta: string) => {
    const n = ruta.replace(/\\/g, '/')
    return cwd && n.toLowerCase().startsWith(`${cwd}/`) ? n.slice(cwd.length + 1).replace(/\//g, '\\') : nombreArchivo(ruta)
  }
  const abiertoE = d.ui.abiertos.entregado === true
  const todo = [...d.entregas].reverse()
  // desplegado, todo (como mucho 50): va el último del panel y se baja con su rueda (26-oct: «pone 30 pero solo
  // veo 6»; el panel no tiene zonas con su propio scroll)
  const dado = abiertoE ? todo.slice(0, 50) : todo.filter(x => x.cuando && d.ahora - x.cuando < 3600000).slice(0, 3)
  const entregado = !todo.length ? null : tarjeta(el, 'entregado', [
    cabecera(el, {
      key: 'ent-cab', titulo: 'Entregado', cuenta: todo.length,
      derecha: boton(el, 'ent-limpiar', { texto: 'Limpiar', alto: 26 }, () => a.limpiaEntregas()),
      plegable: { clave: 'entregado', abierto: abiertoE, a },
    }),
    ...(!dado.length ? [<Text key="ent-nada" size="caption" color={T.t3}>Nada en la última hora</Text>] : []),
    ...dado.flatMap((x, i) => [i ? separador(el, `ent-l-${i}`) : null, (
      <Box key={`ent-${x.ruta}`} flexDirection="row" alignItems="center" gap="sm">
        {ico(el, x.tipo === 'enviado' ? 'enviar' : x.tipo === 'chat' ? 'mensaje' : 'archivo', T.t3)}
        <Box flexGrow={1} minWidth={0}><Text size="footnote" color={T.t2} wrap="truncate-middle">{relativa(x.ruta)}</Text></Box>
        {x.cuando ? <Text size="caption" color={T.t3} tabular>{hora(x.cuando)}</Text> : null}
        {boton(el, `ent-cp-${x.ruta}`, { icono: 'copiar', tipo: 'ib', alto: 26 }, (ev?: any) => a.copia(x.ruta, ev?.surface))}
        {boton(el, `ent-cr-${x.ruta}`, { icono: 'carpeta', tipo: 'ib', alto: 26 }, () => a.abreCarpeta(x.ruta))}
        {boton(el, `ent-ab-${x.ruta}`, { icono: 'abrir', tipo: 'borde', alto: 26 }, () => a.abreRuta(x.ruta, x.tipo === 'chat'))}
      </Box>
    )]),
    ...(abiertoE && todo.length > dado.length
      ? [<Text key="ent-mas" size="caption" color={T.t3}>{`Y ${todo.length - dado.length} más, de antes: «Limpiar» los quita.`}</Text>]
      : []),
    ...(abiertoE
      ? [separador(el, 'ent-l-ley'), leyenda(el, 'ent-ley', [['copiar', 'copiar la ruta'], ['carpeta', 'abrir la carpeta'],
        ['abrir', 'abrir en su programa (el código, en el editor; lo del chat, como «Run»)']])]
      : []),
  ])

  return [cabeza, bloquePasos, ...repo, ...(entregado ? [entregado] : [])]
}
