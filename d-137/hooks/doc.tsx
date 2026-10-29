// La pestaña Todas, todas las sesiones (confirmada en la iteración 10): su ficha con tres filas (trabajan, esperan y
// bloqueadas); las sesiones en casillas, con el selector de estado (plegadas, cuatro por fila; desplegadas, dos, con la
// marca antes de los botones), el fondo de su color suave y fuerte al pulsarlas; el panel de la pulsada, aparte; el
// bloqueo, por fuera; y lo que necesita de ti (NT25), por grupos
import type { RenderElement } from 'claude-code'

import type { Ficha } from '../types'
import type { Acciones, Datos, El, Est, Totales } from './comun'
import {
  abiertoDe, arriba, bloqueTotales, cabecera, corto, desdeDe, pulsable, dibujo, ESTADOS, estadoDe, ficha, figuraEn, hora, ico,
  marcaEn, mini, pct,
  plegar, plural, rejilla, SUAVE, tamFigura, tarjeta, tiempoCorto, tiempoEstado, toque,
} from './comun'
import { fichaDe, marca, marcaFicha, pixelado, docDe } from './dibujos'
import type { CaraDoc } from './dibujos'
import { nombreCompleto, nombreDe, nombreTag, restoDe } from './fichas'
import { boton, chip, grueso, mezcla, numero, separador, T, unaVez } from './kit'

const ORDEN: Est[] = ['trabaja', 'espera', 'bloqueada', 'parada']

// Lo que pasa en una sesión, en una línea, con su icono: la pregunta, el paso, a quién espera o lo último que hizo
export function loQuePasa(f: Ficha): { icono: string; texto: string } {
  const est = estadoDe(f)
  if (est === 'espera') {
    return { icono: 'mensaje', texto: `Pregunta: «${f.toca[0] ?? ''}»${f.toca.length > 1 ? ` y ${f.toca.length - 1} más` : ''}` }
  }
  if (est === 'bloqueada' && f.espera) return { icono: 'alerta', texto: `Espera a ${nombreTag(f.espera.de)} por el ${nombreDe(f.espera.ruta)}` }
  if (est === 'trabaja') return { icono: 'rayo', texto: f.paso || 'Pensando…' }
  return f.hecho
    ? { icono: 'reloj', texto: `Lo último: «${f.hecho}»` }
    : { icono: 'reloj', texto: f.turno ? `Sin tarea desde las ${hora(f.turno)}` : 'Sin tarea todavía' }
}
// El aviso a la sesión que bloquea a otra
export const mensajeBloqueo = (f: Ficha) =>
  `D-137: ${nombreTag(f.tag)} (${f.rotulo}) está esperando a que acabes con ${nombreDe(f.espera?.ruta ?? '')}. Cuando lo sueltes, díselo.`

// El recuadro del Marty en el panel de la elegida
const CAJA_ELEGIDA = { w: 62, h: 72 }

export function pestanaDoc(el: El, d: Datos, a: Acciones): RenderElement[] {
  const { Box, Text, Button, Select } = el
  const todas = [d.yo, ...d.otras].filter((f): f is Ficha => f !== null).sort((x, y) => x.tag.localeCompare(y.tag))
  const cuenta = (e: Est) => todas.filter(f => estadoDe(f) === e).length
  const n = { trabaja: cuenta('trabaja'), espera: cuenta('espera'), bloqueada: cuenta('bloqueada'), parada: cuenta('parada') }
  const total = Math.max(1, todas.length)
  const titular: [string, string] = n.bloqueada
    ? [plural(n.bloqueada, 'bloqueada', 'bloqueadas'), ESTADOS.bloqueada.texto]
    : n.espera ? [plural(n.espera, 'espera', 'esperan'), ESTADOS.espera.texto]
      : n.trabaja ? [plural(n.trabaja, 'trabaja', 'trabajan'), ESTADOS.trabaja.texto] : ['todo parado', ESTADOS.parada.texto]

  // la cara de Doc: cabreado si hay algún bloqueo, de lado si alguna espera, con la petaca si todas están paradas y,
  // si no, el de siempre y el de la pistola, alternando cada medio minuto
  const cara: CaraDoc = n.bloqueada ? 'bloqueo' : n.espera ? 'espera' : todas.length && !n.trabaja ? 'paradas'
    : Math.floor(d.ahora / 30000) % 2 ? 'normal2' : 'normal'
  // Desplegada (28-oct), el bloque de 3 × 3 de Marty, de todas las sesiones: sumado lo que se suma; el rato más
  // largo y el que más gastó, el de la que más; y los archivos, los que han tocado entre todas. Las que llevan el mod de
  // antes no tienen su resumen y solo cuentan sus dólares
  const abiertoF = abiertoDe(d, 'fichaDoc')
  const con = todas.map(f => ({ f, r: d.registros.find(x => x.id === f.id) }))
  const res = con.flatMap(x => (x.r?.sesion ? [{ f: x.f, s: x.r.sesion }] : []))
  const suma = (v: number[]) => v.reduce((s, x) => s + x, 0)
  const usd = suma(todas.map(f => f.usd ?? 0))
  const totales: Totales = res.length ? {
    abierta: suma(res.map(x => (x.s.inicio ? d.ahora - x.s.inicio : 0))), activa: suma(res.map(x => x.s.activa)),
    maxT: Math.max(...res.map(x => x.s.maxT)), tok: suma(con.map(x => x.r?.sesion?.tok ?? x.r?.tok ?? 0)),
    maxTok: Math.max(...res.map(x => x.s.maxTok)), usd,
    maxUsd: Math.max(...res.map(x => (x.s.peso > 0 ? ((x.f.usd ?? 0) * x.s.maxPeso) / x.s.peso : 0))),
  } : { usd }
  const cabeza = ficha(el, {
    key: 'ficha',
    dibujo: figuraEn(el, docDe(cara), 'Doc'),
    arriba: arriba(el, 'Doc', titular[0], titular[1]),
    derecha: plegar(el, 'fichaDoc', abiertoF, a),
    nombre: plural(todas.length, 'sesión', 'sesiones'),
    cols: d.cols,
    abajo: abiertoF ? bloqueTotales(el, 'todas', totales,
      { etiqueta: 'Archivos', valor: res.length ? String(suma(res.map(x => x.s.archivos))) : '—', color: T.naranja }) : undefined,
    filas: [
      { etiqueta: 'Trabajan', frac: n.trabaja / total, valor: String(n.trabaja), color: ESTADOS.trabaja.hex },
      { etiqueta: 'Esperan', frac: n.espera / total, valor: String(n.espera), color: ESTADOS.espera.hex },
      { etiqueta: 'Bloqueadas', frac: n.bloqueada / total, valor: String(n.bloqueada), color: ESTADOS.bloqueada.hex },
    ],
  })

  // Las sesiones, en casillas: el selector de estado arriba y, al pulsar una, su panel aparte
  const filtro = ORDEN.includes(d.ui.filtro as Est) && n[d.ui.filtro as Est] ? (d.ui.filtro as Est) : null
  const vistas = filtro ? todas.filter(f => estadoDe(f) === filtro) : todas
  const abiertoS = d.ui.abiertos.sesiones === true
  const opciones = [{ value: 'todas', label: `Todas · ${todas.length}` },
    ...ORDEN.filter(e => n[e]).map(e => ({ value: e, label: `${ESTADOS[e].plural} · ${n[e]}` }))]
  const casilla = (f: Ficha) => {
    const est = estadoDe(f)
    const c = ESTADOS[est]
    const sel = d.ui.elegida === f.id
    const llama = est === 'espera' || est === 'bloqueada'
    // el fondo, del color de su estado: un 20 % sobre el oscuro, y un 40 % la pulsada (26-oct)
    const fondo = mezcla(c.hex, sel ? 0.4 : 0.2, T.marco)
    const pulsa = unaVez(`cas-${f.id}`, () => a.ui('elegida', sel ? null : f.id))
    // el Marty lleva a su sesión; el nombre o el tiempo abren o cierran su panel (26-oct)
    const aSesion = unaVez(`ses-${f.id}`, () => a.abreSesion(f))
    if (!abiertoS) {
      return (
        grueso(el, `cs-${f.id}`, c.hex, fondo, { flexGrow: 1, width: 1, minWidth: 0 }, { paddingX: 'xs', paddingY: 'xs' }, [
          <Box key="in" flexDirection="row" alignItems="center" gap="xs" flexGrow={1} minWidth={0}>
          <Box flexShrink={0} position="relative">
            {pulsable(el, `mo-${f.id}`, mini(el, f.tag, 32), 32, aSesion)}
            {toque(el, `mo-${f.id}`, aSesion)}
          </Box>
          {/* debajo del nombre, el tiempo en su estado, en su color: la palabra no cabe, y la dice el fondo (26-oct) */}
          <Box flexDirection="column" flexGrow={1} minWidth={0} position="relative">
            <Text weight="bold" color={T.t1} wrap="truncate-end">{corto(f.rotulo, 8)}</Text>
            <Text size="caption" weight="bold" color={c.hex} wrap="truncate-end">{tiempoCorto(d.ahora - desdeDe(f))}</Text>
            {toque(el, `sel-${f.id}`, pulsa)}
          </Box>
        </Box>,
        ])
      )
    }
    // Como en RF3: el Marty en su marco, a la izquierda y a toda la altura; arriba, el nombre y, a la derecha, la marca y
    // sus dos botones de icono; debajo, el estado con su tiempo en una pastilla redonda a lo ancho. Se pulsa todo menos
    // los botones
    return (
      grueso(el, `cg-${f.id}`, c.hex, fondo, { flexGrow: 1, width: 1, minWidth: 0 }, { paddingX: 'sm', paddingY: 'sm' }, [
        <Box key="in" flexDirection="row" gap="sm" flexGrow={1} minWidth={0}>
        <Box flexDirection="column" alignItems="center" justifyContent="center" paddingX="xs" flexShrink={0} position="relative">
          {pulsable(el, `mo-${f.id}`, mini(el, f.tag, 32), 32, aSesion)}
          {toque(el, `mo-${f.id}`, aSesion)}
        </Box>
        <Box flexDirection="column" flexGrow={1} minWidth={0} gap="xs">
          <Box flexDirection="row" alignItems="center" gap="xs">
            <Box flexDirection="column" flexGrow={1} minWidth={0} position="relative">
              <Text weight="bold" color={T.t1} wrap="truncate-end">{corto(f.rotulo, 10)}</Text>
              {toque(el, `sel-${f.id}`, pulsa)}
            </Box>
            {llama ? dibujo(el, marca(est === 'espera' ? 'exclama' : 'x', c.hex), 22, 22, c.nombre) : null}
            {boton(el, `ses-${f.id}`, { icono: 'ojo', tipo: 'ib', alto: 22 }, () => a.abreSesion(f))}
            {boton(el, `cop-${f.id}`, { icono: 'copiar', tipo: 'ib', alto: 22 }, (ev?: any) => a.copia(nombreCompleto(f), ev?.surface))}
          </Box>
          <Box flexDirection="row" alignItems="center" borderStyle="round" borderColor={mezcla(c.hex, 0.16, fondo)}
            backgroundColor={mezcla(c.hex, 0.16, fondo)} paddingX="sm" position="relative">
            <Text size="caption" weight="bold" color={c.hex} wrap="truncate-end">{`${c.nombre} · ${tiempoEstado(est, d.ahora - desdeDe(f))}`}</Text>
            {toque(el, `sel2-${f.id}`, pulsa)}
          </Box>
        </Box>
      </Box>,
      ])
    )
  }
  const sesiones = tarjeta(el, 'sesiones', [
    cabecera(el, {
      key: 'ses-cab', icono: 'usuarios', titulo: 'Sesiones', cuenta: todas.length,
      derecha: opciones.length > 2 ? (
        <Select key="filtro" options={opciones} value={filtro ?? 'todas'} onSelect={(v: string) => a.ui('filtro', v)} />
      ) : null,
      plegable: { clave: 'sesiones', abierto: abiertoS, a },
    }),
    vistas.length
      ? rejilla(el, 'ses-rejilla', vistas.map(casilla), abiertoS ? 2 : 4)
      : <Text key="ses-nada" size="footnote" color="inactive">Ninguna en ese estado.</Text>,
  ])

  // El panel de la pulsada: su Marty con el estado y el tiempo, el rótulo pixelado, el nombre con el gasto, la carpeta
  // en un recuadro, lo que pasa y sus botones
  const elegida = todas.find(f => f.id === d.ui.elegida)
  let panel: RenderElement | null = null
  if (elegida) {
    const f = elegida
    const est = estadoDe(f)
    const c = ESTADOS[est]
    const pix = pixelado(`ELEGIDO · ${nombreTag(f.tag)} ${corto(f.rotulo, 10)}`, c.hex)
    // su Marty, lo más grande que quepa en su recuadro, y la marca del estado encima, en la esquina (26-oct)
    const figEl = fichaDe(f.tag, est)
    const pasa = loQuePasa(f)
    const dueno = f.espera ? todas.find(x => x.tag === f.espera?.de) : undefined
    // en una parada, «Sesión» para ir a ver qué hacía y cerrarla a mano si hace falta (26-oct: no proponer «Cerrar»)
    const conSesion = est === 'espera' || (est === 'bloqueada' && !!dueno)
    const principal: RenderElement[] = est === 'espera'
      ? [boton(el, 'el-contestar', { texto: 'Contestar', icono: 'mensaje', tipo: 'pri' }, () => { a.ui('tocaSel', f.id); a.ui('tocaPaso', 0); a.ui('pestana', 'pajaro') })]
      : est === 'bloqueada' && dueno
        ? [boton(el, 'el-avisar', { texto: `Avisar a ${nombreTag(dueno.tag)}`, icono: 'enviar', tipo: 'pri' }, () => a.avisa(dueno, mensajeBloqueo(f)))]
        : [boton(el, 'el-sesion1', { texto: 'Sesión', icono: 'ojo', tipo: 'pri' }, () => a.abreSesion(f))]
    // el fondo del panel, opaco, y el de sus recuadros, un poco más claro y sin borde que se vea
    const panelFondo = mezcla(c.hex, 0.12, T.tarjeta)
    const caja = mezcla('#ffffff', 0.05, mezcla(c.hex, 0.16, T.tarjeta))
    const rama = f.repo ? (f.repo.rama ? `${f.repo.rama}${f.repo.sinCommit ? ` · ${f.repo.sinCommit} sin commit` : ''}` : 'sin git') : ''
    panel = (
      grueso(el, 'elegida', c.hex, panelFondo, {}, { paddingX: 'sm', paddingY: 'sm' }, [
        <Box key="in" flexDirection="row" gap="md" flexGrow={1} minWidth={0}>
        <Box flexDirection="column" alignItems="center" justifyContent="center" borderStyle="round" borderColor={T.marco}
          backgroundColor={T.marco} paddingX="xs" paddingY="xs" minWidth={11} gap="xs" position="relative">
          {est === 'espera'
            ? pulsable(el, 'el-ir', figuraEn(el, figEl, nombreTag(f.tag), true, CAJA_ELEGIDA), tamFigura(figEl, CAJA_ELEGIDA).w,
              () => { a.ui('tocaSel', f.id); a.ui('tocaPaso', 0); a.ui('pestana', 'pajaro') })
            : figuraEn(el, figEl, nombreTag(f.tag), true, CAJA_ELEGIDA)}
          {figEl.propia ? null : marcaEn(el, 'el-marca', marcaFicha(est), c.nombre, est === 'parada')}
          <Text size="footnote" weight="bold" color={c.hex}>{c.nombre}</Text>
          <Text size="caption" color={T.t3} tabular>{tiempoEstado(est, d.ahora - desdeDe(f))}</Text>
        </Box>
        <Box flexDirection="column" flexGrow={1} minWidth={0} gap="xs">
          {/* arriba, el gasto de la semana, que tienen todas, y debajo los pasos, que una parada no tiene: así no queda un
              hueco en la esquina (it-12) */}
          <Box flexDirection="row" alignItems="center" gap="xs">
            {dibujo(el, pix.svg, pix.w, pix.h, `Elegido: ${nombreTag(f.tag)} ${f.rotulo}`)}
            <Box flexGrow={1} />
            {typeof f.gasto === 'number' ? ico(el, 'indicador', T.t3, 13) : null}
            {typeof f.gasto === 'number' ? <Text size="caption" weight="bold" color={T.t1}>{pct(f.gasto)}</Text> : null}
          </Box>
          <Box flexDirection="row" alignItems="center" gap="xs">
            <Box flexGrow={1} minWidth={0}><Text weight="bold" color={T.t1} wrap="truncate-end">{restoDe(f) || f.rotulo}</Text></Box>
            {f.pasosN ? <Text size="caption" color={T.t3}>Pasos <Text weight="bold" color={T.t1}>{`${f.pasosN[0]}/${f.pasosN[1]}`}</Text></Text> : null}
          </Box>
          {f.repo ? (
            <Box flexDirection="row" alignItems="center" gap="xs" borderStyle="round" borderColor={caja} backgroundColor={caja} paddingX="sm">
              {ico(el, 'carpeta', T.t3, 13)}
              <Text size="footnote" weight="bold" color={T.t1}>{f.repo.carpeta}</Text>
              <Text size="caption" mono color={T.t3} wrap="truncate-end">{` · ${rama}`}</Text>
            </Box>
          ) : null}
          <Box flexDirection="row" alignItems="center" gap="xs" borderStyle="round" borderColor={caja} backgroundColor={caja} paddingX="sm">
            {ico(el, pasa.icono, c.hex, 13)}
            <Box flexGrow={1} minWidth={0}><Text size="footnote" color={T.t2} wrap="truncate-end">{pasa.texto}</Text></Box>
          </Box>
          <Box flexDirection="row" gap="xs">
            {principal}
            {!conSesion ? null : boton(el, 'el-sesion', { texto: 'Sesión', icono: 'ojo' }, () => a.abreSesion(f))}
            {boton(el, 'el-copiar', { texto: 'Copiar', icono: 'copiar' },
              (ev?: any) => a.copia(`${nombreCompleto(f)} · ${c.nombre}: ${pasa.texto}`, ev?.surface))}
          </Box>
        </Box>
      </Box>,
      ])
    )
  }

  // El bloqueo, por fuera: quién espera a quién, por qué archivo y desde hace cuánto
  const bloqueos = todas.filter(f => f.espera).map(f => {
    const dueno = todas.find(x => x.tag === f.espera?.de)
    const clave = `bloqueo-${f.id}`
    const abierto = d.ui.abiertos[clave] === true
    const rojo = ESTADOS.bloqueada
    return (
      grueso(el, clave, rojo.hex, mezcla(rojo.hex, 0.1, T.tarjeta), {}, { paddingX: 'sm', paddingY: 'xs' }, [
        <Box key="in" flexDirection="column" gap="xs" flexGrow={1} minWidth={0}>
        <Box flexDirection="row" alignItems="center" gap="xs">
          {chip(el, `${clave}-chip`, 'Bloqueo', T.tinta, { punto: false, fondo: rojo.hex })}
          {mini(el, f.tag, 16)}
          <Text size="footnote" weight="bold">{nombreTag(f.tag)}</Text>
          <Text size="footnote" color="inactive">espera</Text>
          {mini(el, f.espera?.de, 16)}
          <Text size="footnote" weight="bold">{nombreTag(f.espera?.de)}</Text>
          <Box flexGrow={1} minWidth={0}><Text size="caption" color="inactive" wrap="truncate-end">{` · ${nombreDe(f.espera?.ruta ?? '')}`}</Text></Box>
          <Text size="footnote" weight="bold" color={rojo.texto} tabular>{tiempoEstado('bloqueada', d.ahora - desdeDe(f))}</Text>
          {plegar(el, clave, abierto, a)}
        </Box>
        {abierto ? (
          <Box key={`${clave}-mas`} flexDirection="column" gap="xs">
            <Text size="footnote" wrap="wrap">
              {`${nombreTag(f.tag)} (${f.rotulo}) quiere escribir en ${nombreDe(f.espera?.ruta ?? '')}, que ${nombreTag(f.espera?.de)}${dueno ? ` (${dueno.rotulo})` : ''} está tocando en su turno. El freno lo para hasta que lo suelte.`}
            </Text>
            <Box flexDirection="row" gap="xs">
              {dueno ? boton(el, `${clave}-avisar`, { texto: `Avisar a ${nombreTag(dueno.tag)}`, icono: 'enviar', tipo: 'pri' }, () => a.avisa(dueno, mensajeBloqueo(f))) : null}
              {boton(el, `${clave}-sesion`, { texto: 'Sesión', icono: 'ojo' }, () => a.abreSesion(f))}
            </Box>
          </Box>
        ) : null}
      </Box>,
      ])
    )
  })

  // Lo que necesita de ti (NT25): las bloqueadas, las que esperan tu respuesta y las paradas, numeradas, cada grupo con
  // su línea y su cuenta. Plegado, solo las bloqueadas y las que esperan; en las paradas, «Sesión», para ver qué hacía y
  // cerrarla a mano si hace falta (26-oct)
  const abiertoN = d.ui.abiertos.necesita === true
  const grupos: [Est, string, Ficha[]][] = [
    ['bloqueada', 'Bloqueadas', todas.filter(f => estadoDe(f) === 'bloqueada')],
    ['espera', 'Esperan', todas.filter(f => estadoDe(f) === 'espera').sort((x, y) => x.turno - y.turno)],
    ['parada', 'Paradas', todas.filter(f => estadoDe(f) === 'parada' && f.id !== d.yo?.id)],
  ]
  let num = 0
  const tarjetita = mezcla('#ffffff', 0.035, T.tarjeta)
  const filasNecesita: RenderElement[] = []
  for (const [est, titulo, lista] of grupos) {
    if (!lista.length) continue
    const c = ESTADOS[est]
    const ver = abiertoN || est !== 'parada'
    if (!ver) {
      num += lista.length
      continue
    }
    filasNecesita.push(
      <Box key={`nt-${est}`} flexDirection="row" alignItems="center" gap="sm">
        <Text size="footnote" weight="bold" color={c.hex}>{titulo}</Text>
        <Box flexGrow={1} minWidth={0}>{separador(el, `nt-l-${est}`)}</Box>
        <Text size="footnote" weight="bold" color={c.hex}>{String(lista.length)}</Text>
      </Box>,
    )
    for (const f of lista) {
      num += 1
      const t = tiempoEstado(est, d.ahora - desdeDe(f))
      const dueno = f.espera ? todas.find(x => x.tag === f.espera?.de) : undefined
      const [cita, debajo, accion] = est === 'bloqueada'
        ? [`«Necesito el ${nombreDe(f.espera?.ruta ?? '')} de ${nombreTag(f.espera?.de)}»`, `${f.rotulo} · ${nombreDe(f.espera?.ruta ?? '')} · ${t}`,
          dueno ? boton(el, `nt-b-${f.id}`, { texto: 'Avisar', tipo: 'pri' }, () => a.avisa(dueno, mensajeBloqueo(f))) : null]
        : est === 'espera'
          ? [f.toca.length === 1 ? `«${corto(f.toca[0] ?? '', 60)}»` : `«Tengo ${f.toca.length} preguntas para ti»`, `${f.rotulo} · Espera · ${t}`,
            boton(el, `nt-b-${f.id}`, { texto: 'Te toca' },
              () => { a.ui('tocaSel', f.id); a.ui('tocaPaso', 0); a.ui('pestana', 'pajaro') })]
          : ['«No tengo nada que hacer»', `${f.rotulo} · ${f.turno ? `desde las ${hora(f.turno)} · ` : ''}${t}`,
            boton(el, `nt-b-${f.id}`, { texto: 'Sesión' }, () => a.abreSesion(f))]
      filasNecesita.push(
        <Box key={`nt-${f.id}`} flexDirection="row" alignItems="center" gap="sm">
          {numero(el, `nt-n-${f.id}`, num, c.hex)}
          {mini(el, f.tag, 32)}
          <Box flexDirection="column" flexGrow={1} minWidth={0} borderStyle="round" borderColor={tarjetita} backgroundColor={tarjetita}
            paddingX="sm" paddingY="xs">
            <Text size="footnote" weight="bold" color={T.t1} wrap="truncate-end">{cita}</Text>
            <Text size="caption" color={T.t3} wrap="truncate-end">{debajo}</Text>
          </Box>
          {accion}
        </Box>,
      )
    }
  }
  const necesita = !num ? null : tarjeta(el, 'necesita', [
    cabecera(el, { key: 'nt-cab', icono: 'campana', titulo: 'Lo que necesita de ti',
      derecha: <Text key="nt-n" size="caption" color={T.t3}>{String(num)}</Text>, plegable: { clave: 'necesita', abierto: abiertoN, a } }),
    ...(filasNecesita.length ? filasNecesita
      : [<Text key="nt-nada" size="caption" color={T.t3}>Nada urgente: las paradas, al desplegar.</Text>]),
  ])

  return [cabeza, sesiones, ...(panel ? [panel] : []), ...bloqueos, ...(necesita ? [necesita] : [])]
}
