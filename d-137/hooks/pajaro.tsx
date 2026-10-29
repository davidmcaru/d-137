// La pestaña Decisión, lo que te toca (confirmada en la iteración 9; antes «Te toca»): la ficha con Paloma mensajera; la
// fila de Martys, con los avisos como una casilla más y lo ya mandado atenuado; las preguntas una a una, con su
// contexto, la recomendada en verde y «Otra»; el resumen con «Mandar a…»; y los avisos, que no son decisiones pero te
// tocan. La respuesta va a su sesión, que la recibe como tuya (register.tsx, session.receive)
import type { RenderElement } from 'claude-code'
import { nombreTag } from './fichas'

import type { Decision, Ficha, Tarea } from '../types'
import type { Acciones, Datos, El } from './comun'
import {
  abiertoDe, arriba, bloque3x3, cabecera, corto, decisionesDe, dibujo, duracion, ESTADOS, estadoDe, ficha, figuraEn, hace, hora, ico,
  insignia, letra, mini, pct0, plegar, plural, respuesta, tarjeta, toque, VERDE,
} from './comun'
import { insignia as bola, fijaDe, icono as iconoD, marca, marty, tenue } from './dibujos'
import {
  anchoTexto, boton, esc, FUENTE, iconoCaja, incrusta, letraBoton, mezcla, numero, separador, svgPulsable, T, tecla, trazos,
} from './kit'

export type Aviso = { id: string; tipo: 'fallo' | 'hecho' | 'parada'; f: Ficha; texto: string; debajo: string; t: number; tarea?: Tarea }
// Los avisos: lo que acabó en segundo plano (bien o mal) en las dos últimas horas y las sesiones que llevan más de una
// hora paradas; sin los que ya marcaste «Visto»
export function avisosDe(d: Datos): Aviso[] {
  const todas = [d.yo, ...d.otras].filter((f): f is Ficha => f !== null)
  const out: Aviso[] = []
  for (const f of todas) {
    const acabadas = f.id === d.yo?.id ? d.marcha.filter(t => t.fin) : f.acabadas ?? []
    for (const t of acabadas) {
      if (!t.fin || d.ahora - t.fin > 2 * 3600000 || t.estado === 'killed') continue
      const bien = t.estado === 'completed'
      out.push({
        id: `t:${f.id}:${t.id}`, tipo: bien ? 'hecho' : 'fallo', f, t: t.fin, tarea: t,
        texto: bien ? `Terminó «${corto(t.que, 44)}»` : `Falló «${corto(t.que, 44)}»`,
        debajo: `${f.rotulo} · ${hace(d.ahora - t.fin)}${!bien && t.linea ? ` · ${corto(t.linea, 40)}` : ''}`,
      })
    }
    if (estadoDe(f) === 'parada' && f.turno && d.ahora - f.turno > 3600000 && f.id !== d.yo?.id) {
      out.push({ id: `p:${f.id}:${f.turno}`, tipo: 'parada', f, t: f.turno, texto: `Lleva ${duracion(d.ahora - f.turno)} parada, sin tarea`,
        debajo: `${f.rotulo} · desde las ${hora(f.turno)}` })
    }
  }
  const vistos = new Set(d.ui.vistos)
  return out.filter(x => !vistos.has(x.id)).sort((x, y) => y.t - x.t)
}

// Qué sesiones te esperan (la que más espera, primero) y cuáles ya tienen tu respuesta
export function pendientesDe(d: Datos): { pendientes: Ficha[]; mandadas: Ficha[]; resto: Ficha[] } {
  const todas = [d.yo, ...d.otras].filter((f): f is Ficha => f !== null).sort((x, y) => x.tag.localeCompare(y.tag))
  const m = d.ui.mandadas
  const pendientes = todas.filter(f => f.toca.length && !(m[f.id] && m[f.id]!.turno >= f.turno)).sort((x, y) => x.turno - y.turno)
  // lo mandado, con su tick, hasta que esa sesión se pone a trabajar con la respuesta (empieza un turno después de
  // mandársela) o, si no lo hace (cerrada), 30 minutos (26-oct)
  const mandadas = todas.filter(f => {
    const x = m[f.id]
    return x && d.ahora - x.cuando < 30 * 60000 && !(f.turno > x.cuando) && !pendientes.includes(f)
  })
  const resto = todas.filter(f => !pendientes.includes(f) && !mandadas.includes(f))
  return { pendientes, mandadas, resto }
}
export const claveDe = (f: Ficha, i: number) => `${f.id}#${i}`
// El cuadro de «Otra» se dibuja con el texto de cuando apareció, no con el de cada tecla: con el de ahora, cada vez que el
// panel se repinta (cada pocos segundos) el escritorio lo volvía a poner y la vista saltaba al principio (26-oct).
// Se olvida cuando el cuadro deja de dibujarse (otra pregunta, el resumen u otra pestaña)
const CAMPO = { key: '', valor: '' }
export const olvidaCampo = () => {
  CAMPO.key = ''
}
// y crece con lo que escribes: de 2 a 6 líneas, unas 42 letras por línea
const filasDe = (texto: string) => Math.min(6, Math.max(2, Math.ceil((texto.length + 8) / 42)))
export function respuestaDe(d: Datos, f: Ficha, decs: Decision[] = decisionesDe(f)): string {
  const elegida = (i: number) => {
    const k = d.ui.elecciones[claveDe(f, i)]
    if (k === -1 && (d.ui.textos[claveDe(f, i)] ?? '').trim()) return -1
    return typeof k === 'number' && k >= 0 ? k : decs[i]?.recomendada ?? 0
  }
  return respuesta(decs, elegida, i => d.ui.textos[claveDe(f, i)] ?? '')
}

export function pestanaPajaro(el: El, d: Datos, a: Acciones): RenderElement[] {
  // el cuadro de «Otra» que se dibuja ahora, si lo hay: si es el mismo que antes, con su texto de entonces
  const antes = CAMPO.key
  CAMPO.key = ''
  const campo = (key: string, ahora: string) => {
    if (key !== antes) CAMPO.valor = ahora
    CAMPO.key = key
    return CAMPO.valor
  }
  const { Box, Text, Input } = el
  const { pendientes, mandadas, resto } = pendientesDe(d)
  const avisos = avisosDe(d)
  const nDec = pendientes.reduce((s, f) => s + decisionesDe(f).length, 0)
  const nMandadas = mandadas.length

  // Desplegada (28-oct: la distribución 1 de seis), el bloque de 3 × 3: las preguntas que te han hecho todas las
  // sesiones (en total, hoy y esta semana, de lunes a domingo: con la de la cuota, que puede empezar cualquier día,
  // salía menos que hoy), cómo contestas (con la recomendada, desde el panel o con lo tuyo, «Otra») y lo de ahora (lo
  // que te toca, las sesiones que te esperan y los avisos). Las que llevan el mod de antes no traen lo suyo
  const abiertoF = abiertoDe(d, 'fichaPajaro')
  const pregs = [d.yo, ...d.otras].filter((f): f is Ficha => f !== null)
    .flatMap(f => d.registros.find(r => r.id === f.id)?.sesion?.preguntas ?? [])
  const suma = (v: number[]) => v.reduce((s, x) => s + x, 0)
  const cuando = pregs.flatMap(p => p.cuando)
  const hay = pregs.length > 0
  const medianoche = new Date(d.ahora).setHours(0, 0, 0, 0)
  const lunes = new Date(medianoche)
  lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7))
  const semana = lunes.getTime()
  const contestadas = suma(pregs.map(p => p.contestadas))
  const parte = (n: number) => (contestadas ? pct0((n / contestadas) * 100) : '—')
  const bloque = bloque3x3(el, 'preguntas', [
    [{ etiqueta: 'Total', valor: hay ? String(cuando.length) : '—', color: T.t1 },
      { etiqueta: 'Recomendada', valor: parte(suma(pregs.map(p => p.rec))), color: T.ok },
      { etiqueta: 'Ahora', valor: String(nDec), color: T.naranja }],
    [{ etiqueta: 'Hoy', valor: hay ? String(cuando.filter(t => t >= medianoche).length) : '—', color: T.t1 },
      { etiqueta: 'Desde el panel', valor: parte(suma(pregs.map(p => p.panel))), color: T.azul },
      { etiqueta: 'Esperan', valor: String(pendientes.length), color: T.t1 }],
    [{ etiqueta: 'Semana', valor: hay ? String(cuando.filter(t => t >= semana).length) : '—', color: T.t1 },
      { etiqueta: 'Otra', valor: parte(suma(pregs.map(p => p.otra))), color: T.aviso },
      { etiqueta: 'Avisos', valor: String(avisos.length), color: T.error }],
  ])

  const cabeza = ficha(el, {
    key: 'ficha',
    dibujo: figuraEn(el, fijaDe('pajaro'), 'Paloma mensajera'),
    arriba: arriba(el, 'Paloma mensajera', nDec ? 'te toca' : 'al día', nDec ? ESTADOS.espera.texto : 'success'),
    derecha: (
      <Box key="paj-der" flexDirection="row" alignItems="center" gap="xs">
        {insignia(el, 'avisos', 'campana', plural(avisos.length, 'aviso', 'avisos'))}
        {plegar(el, 'fichaPajaro', abiertoF, a)}
      </Box>
    ),
    abajo: abiertoF ? bloque : undefined,
    nombre: `${plural(nDec, 'decisión', 'decisiones')} · ${plural(pendientes.length, 'sesión', 'sesiones')}`,
    cols: d.cols,
    filas: [
      { etiqueta: 'Decisiones', frac: Math.min(1, nDec / 8), valor: String(nDec), color: ESTADOS.espera.hex },
      { etiqueta: 'Avisos', frac: Math.min(1, avisos.length / 8), valor: String(avisos.length), color: '#d8d8d2' },
      { etiqueta: 'Mandadas', frac: Math.min(1, nMandadas / 8), valor: String(nMandadas), color: VERDE },
    ],
  })

  const barra = (
    <Box key="barra" flexDirection="row" alignItems="center" gap="xs">
      <Text size="caption" color={T.t3}>La que más espera, primero</Text>
      <Box flexGrow={1} />
      {pendientes.length
        ? boton(el, 'copiar-todo', { texto: 'Copiar todo', icono: 'copiar' },
          (ev?: any) => a.copia(pendientes.map(f => `${nombreTag(f.tag)} ${f.rotulo}: ${respuestaDe(d, f)}`).join('\n'), ev?.surface))
        : null}
      {pendientes.length ? boton(el, 'mandar-todo', { texto: 'Mandar todo', icono: 'enviar', tipo: 'azul' }, () => a.mandaTodo()) : null}
    </Box>
  )

  // La fila de Martys: los avisos primero, luego las que te esperan, las ya mandadas y las demás, atenuadas
  const sel = d.ui.tocaSel === 'avisos' ? 'avisos'
    : [...pendientes, ...mandadas].some(f => f.id === d.ui.tocaSel) ? d.ui.tocaSel
      : pendientes[0]?.id ?? (avisos.length ? 'avisos' : null)
  // Cada casilla, entera en SVG como en TX1 (it-11, r14 y r15): el dibujo arriba, el nombre corto debajo (sin el
  // M-xx, que ya dice el dibujo) y su insignia en la esquina; la pulsada, con el borde azul y su fondo; los avisos, con
  // el borde a trazos. Se pulsa entera
  const baldosa = (key: string, o: { figura: string; lado: number; nombre: string; fuerte: boolean; activa: boolean;
    trazos?: boolean; insignia?: string }, alPulsar?: () => void) => {
    const tam = 11.5
    const w = Math.max(46, Math.round(anchoTexto(o.nombre, tam, o.fuerte) + 16))
    const al = 60
    let s = ''
    if (o.activa) {
      s += `<rect x="1" y="1" width="${w - 2}" height="${al - 2}" rx="9" fill="${mezcla(T.azul, 0.16, T.tarjeta)}" ` +
        `stroke="${T.azul}" stroke-width="2"/>`
    } else if (o.trazos) s += trazos(w, al, 9, '#6f6e68')
    s += incrusta(o.figura, (w - o.lado) / 2, 6 + (28 - o.lado) / 2, o.lado, o.lado)
    s += `<text x="${w / 2}" y="${al - 10}" text-anchor="middle" font-family="${FUENTE}" font-size="${tam}" ` +
      `font-weight="${o.fuerte ? 700 : 500}" fill="${o.fuerte ? T.t1 : '#6f6e68'}">${esc(o.nombre)}</text>`
    if (o.insignia) s += incrusta(o.insignia, w / 2 + 7, 1, 15, 15)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${al}" viewBox="0 0 ${w} ${al}">${s}</svg>`
    return alPulsar ? svgPulsable(el, `${key}-p-p`, svg, w, al, o.nombre, alPulsar) : dibujo(el, svg, w, al, o.nombre)
  }
  const fila = tarjeta(el, 'fila', [
    <Box key="fila-martys" flexDirection="row" flexWrap="wrap" gap="xs">
      {baldosa('f-avisos', { figura: iconoD('campana', '#c9c9c4'), lado: 22, nombre: 'Avisos', fuerte: true, activa: sel === 'avisos',
        trazos: true, insignia: avisos.length ? bola(avisos.length, '#bdbdb7') : undefined }, () => a.ui('tocaSel', 'avisos'))}
      {pendientes.map(f => baldosa(`f-${f.id}`, { figura: marty(f.tag), lado: 28, nombre: corto(f.rotulo, 7), fuerte: true,
        activa: sel === f.id, insignia: bola(decisionesDe(f).length, ESTADOS.espera.hex) },
      () => { a.ui('tocaSel', f.id); a.ui('tocaPaso', 0) }))}
      {mandadas.map(f => baldosa(`f-${f.id}`, { figura: tenue(f.tag), lado: 28, nombre: corto(f.rotulo, 7), fuerte: false,
        activa: sel === f.id, insignia: marca('check', VERDE) }, () => a.ui('tocaSel', f.id)))}
      {resto.map(f => baldosa(`f-${f.id}`, { figura: tenue(f.tag), lado: 28, nombre: corto(f.rotulo, 7), fuerte: false, activa: false }))}
    </Box>,
  ])

  let cuerpo: RenderElement
  const pend = pendientes.find(f => f.id === sel)
  const mand = mandadas.find(f => f.id === sel)
  if (sel === 'avisos') {
    // Los avisos (TW4): cada uno con su icono en su cuadrado de color, lo suyo y «Visto», que lo quita; una línea entre
    // uno y otro (it-11, r17)
    cuerpo = tarjeta(el, 'avisos', [
      cabecera(el, { key: 'av-cab', icono: 'campana', titulo: `Avisos · ${avisos.length} · no son decisiones, pero te tocan` }),
      <Text key="av-tit" size="heading" weight="bold" color={T.t1}>Lo que ha pasado mientras tanto</Text>,
      ...(avisos.length ? avisos.flatMap(x => [separador(el, `av-l-${x.id}`), (
        <Box key={`av-${x.id}`} flexDirection="row" alignItems="center" gap="sm">
          {x.tipo === 'parada' ? iconoCaja(el, `av-i-${x.id}`, 'luna', T.t3, 26)
            : iconoCaja(el, `av-i-${x.id}`, x.tipo === 'hecho' ? 'check' : 'x', x.tipo === 'hecho' ? T.ok : T.error, 26)}
          {mini(el, x.f.tag, 20)}
          <Box flexDirection="column" flexGrow={1} minWidth={0}>
            <Text size="footnote" weight="bold" color={T.t1} wrap="truncate-end">{x.texto}</Text>
            <Text size="caption" color={T.t3} wrap="truncate-end">{x.debajo}</Text>
          </Box>
          {x.tipo !== 'parada' && x.f.id === d.yo?.id && x.tarea?.salida
            ? boton(el, `av-a-${x.id}`, { texto: 'Ver salida' }, () => a.lanza(`salida:${x.tarea?.salida ?? ''}`))
            : boton(el, `av-a-${x.id}`, { texto: 'Sesión' }, () => a.abreSesion(x.f))}
          {boton(el, `av-v-${x.id}`, { icono: 'check', tipo: 'ib', alto: 26 }, () => a.visto([x.id]))}
        </Box>
      )]) : [<Text key="av-nada" size="footnote" color={T.t3}>Nada nuevo.</Text>]),
      separador(el, 'av-l-pie'),
      <Box key="av-pie" flexDirection="row" alignItems="center">
        <Text size="caption" color={T.t3}>«Visto» lo quita de aquí</Text>
        <Box flexGrow={1} />
        {avisos.length ? boton(el, 'av-todo', { texto: 'Todo visto', icono: 'check' }, () => a.visto(avisos.map(x => x.id))) : null}
      </Box>,
    ])
  } else if (pend) {
    const f = pend
    const decs = decisionesDe(f)
    const n = decs.length
    const paso = Math.max(0, Math.min(n, d.ui.tocaPaso))
    const tramos = decs.map((_, i) => `<rect x="${i * 18}" y="0" width="14" height="3" rx="1.5" fill="${i <= paso ? '#6cb6ff' : 'rgba(128,128,128,0.35)'}"/>`).join('')
    const progreso = dibujo(el, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n * 18 - 4} 3">${tramos}</svg>`, n * 18 - 4, 3, `${Math.min(paso + 1, n)} de ${n}`)
    const cab = (texto: string) => (
      <Box key="pr-cab" flexDirection="row" alignItems="center" gap="xs">
        {mini(el, f.tag, 16)}
        <Text size="caption" color={T.t3}>{texto}</Text>
        <Box flexGrow={1} />
        {progreso}
      </Box>
    )
    const sinOpciones = decs.some(x => !x.opciones.length)
    // Las opciones de TX1 (it-11, r16): cada una en su recuadro, con su letra, «recomendada» en verde y su tecla;
    // la recomendada, con el borde verde, y la que elijas, con el azul
    const caja = mezcla('#ffffff', 0.025, T.tarjeta)
    const filo = mezcla('#ffffff', 0.07, T.tarjeta)
    if (sinOpciones) {
      cuerpo = tarjeta(el, 'pregunta', [
        cab(`${f.rotulo} · ${plural(n, 'pregunta', 'preguntas')} · ${hace(d.ahora - f.turno)}`),
        ...decs.map((x, i) => <Text key={`so-${i}`} size="footnote" color={T.t1} wrap="wrap">{`${i + 1}. ${x.titulo}`}</Text>),
        <Text key="so-nota" size="caption" color={T.t3}>Su sesión no manda las opciones: contesta allí.</Text>,
        <Box key="so-b" flexDirection="row">{boton(el, 'so-ses', { texto: 'Sesión', icono: 'ojo', tipo: 'pri' }, () => a.abreSesion(f))}</Box>,
      ])
    } else if (paso < n) {
      const dec = decs[paso] as Decision
      const clave = claveDe(f, paso)
      const elegida = d.ui.elecciones[clave]
      cuerpo = tarjeta(el, 'pregunta', [
        cab(`${f.rotulo} · pregunta ${paso + 1} de ${n} · ${hace(d.ahora - f.turno)}`),
        <Text key="pr-tit" size="heading" weight="bold" color={T.t1} wrap="wrap">{dec.titulo}</Text>,
        dec.contexto ? <Text key="pr-ctx" size="footnote" color={T.t2} wrap="wrap">{dec.contexto}</Text> : null,
        ...dec.opciones.map((o, k) => {
          const esta = elegida === k
          const rec = k === dec.recomendada
          const verde = elegida === undefined && rec
          const borde = esta ? T.azul : verde ? T.ok : filo
          const fondo = esta ? mezcla(T.azul, 0.12, T.tarjeta) : verde ? mezcla(T.ok, 0.07, T.tarjeta) : caja
          const elige = () => a.elige(f.id, paso, k)
          return (
            <Box key={`op-${k}`} flexDirection="row" alignItems="center" gap="sm" borderStyle="round" borderColor={borde}
              backgroundColor={fondo} paddingX="sm" paddingY="xs" position="relative">
              {letraBoton(el, `op-${f.id}-${paso}-${k}`, letra(k), esta ? T.azul : verde ? T.ok : T.t3, elige)}
              <Box flexGrow={1} flexShrink={1} width={1} minWidth={0}>
                <Text color={T.t1} wrap="wrap">{o}</Text>
              </Box>
              {rec ? <Text size="caption" weight="bold" color={T.ok}>recomendada</Text> : null}
              {tecla(el, `op-t-${k}`, letra(k))}
              {toque(el, `opt-${f.id}-${paso}-${k}`, elige)}
            </Box>
          )
        }),
        // «Otra»: su letra también elige (si hay algo escrito), y el cuadro ocupa todo el ancho que quede, con «elegir» a la
        // derecha (28-oct)
        <Box key="op-otra" flexDirection="row" alignItems="center" gap="sm" borderStyle="round"
          borderColor={elegida === -1 ? T.azul : filo} backgroundColor={caja} paddingX="sm" paddingY="xs">
          {letraBoton(el, `op-${f.id}-${paso}-otra`, letra(dec.opciones.length), elegida === -1 ? T.azul : T.t3, () => {
            if ((d.ui.textos[clave] ?? '').trim()) a.elige(f.id, paso, -1)
          })}
          <Box flexGrow={1} flexShrink={1} width={1} minWidth={0} flexDirection="column" alignItems="stretch">
            <Input key={`otra-${f.id}-${paso}`} placeholder="Otra: escribe la tuya…" value={campo(`otra-${f.id}-${paso}`, d.ui.textos[clave] ?? '')}
              rows={filasDe(d.ui.textos[clave] ?? '')} submitLabel="elegir" onInput={(v: string) => a.texto(clave, v)}
              onSubmit={(v: string) => { a.texto(clave, v); if (v.trim()) a.elige(f.id, paso, -1) }} />
          </Box>
          {tecla(el, 'op-t-otra', letra(dec.opciones.length))}
        </Box>,
        <Box key="pr-pie" flexDirection="row" alignItems="center">
          <Box flexGrow={1} width={1} flexDirection="row">
            {paso > 0 ? boton(el, 'pr-ant', { texto: 'Anterior' }, () => a.ui('tocaPaso', paso - 1)) : null}
          </Box>
          {f.id === d.yo?.id ? null : boton(el, 'pr-sesion', { texto: 'Sesión', icono: 'ojo' }, () => a.abreSesion(f))}
          <Box flexGrow={1} width={1} flexDirection="row" justifyContent="flex-end">
            {boton(el, 'pr-sig', { texto: paso + 1 < n ? 'Siguiente' : 'Resumen', icono: 'derecha', despues: true },
              () => a.ui('tocaPaso', paso + 1))}
          </Box>
        </Box>,
      ])
    } else {
      // El resumen: lo elegido en cada una, «Cambiar», y «Mandar a…»
      const texto = respuestaDe(d, f, decs)
      const azulito = mezcla(T.azul, 0.16, T.tarjeta)
      cuerpo = tarjeta(el, 'resumen', [
        cab(`${f.rotulo} · resumen`),
        <Text key="rs-tit" size="heading" weight="bold" color={T.t1}>{`Lo que mandas a ${f.rotulo}`}</Text>,
        ...decs.flatMap((dec, i) => {
          const clave = claveDe(f, i)
          const k = d.ui.elecciones[clave]
          const otra = k === -1 && (d.ui.textos[clave] ?? '').trim()
          const usada = otra ? -1 : typeof k === 'number' && k >= 0 ? k : dec.recomendada
          return [i ? separador(el, `rs-l-${i}`) : null, (
            <Box key={`rs-${i}`} flexDirection="row" alignItems="center" gap="sm">
              {numero(el, `rs-n-${i}`, i + 1, T.t3)}
              <Box flexDirection="column" flexGrow={1} minWidth={0} gap="xs">
                <Text size="footnote" weight="bold" color={T.t1} wrap="wrap">{dec.titulo}</Text>
                <Box flexDirection="row" alignItems="center" gap="xs">
                  <Box key={`rs-p-${i}`} borderStyle="round" borderColor={azulito} backgroundColor={azulito} paddingX="xs" flexShrink={1} minWidth={0}>
                    <Text size="caption" weight="bold" color={T.trab} wrap="wrap">
                      {usada === -1 ? `Otra: ${d.ui.textos[clave] ?? ''}` : `${letra(usada)}) ${dec.opciones[usada] ?? ''}`}
                    </Text>
                  </Box>
                  {usada === dec.recomendada ? <Text size="caption" color={T.t3}>la recomendada</Text> : null}
                </Box>
              </Box>
              {boton(el, `rs-c-${i}`, { texto: 'Cambiar', alto: 26 }, () => a.ui('tocaPaso', i))}
            </Box>
          )]
        }),
        separador(el, 'rs-l-se'),
        <Box key="rs-se" flexDirection="row" alignItems="center" gap="xs">
          <Text size="caption" color={T.t3}>Se manda:</Text>
          <Box borderStyle="round" borderColor={filo} backgroundColor={caja} paddingX="xs" flexShrink={1} minWidth={0}>
            <Text size="caption" mono weight="bold" color={T.t1} wrap="wrap">{`«${texto}»`}</Text>
          </Box>
        </Box>,
        <Box key="rs-pie" flexDirection="row" alignItems="center">
          <Box flexGrow={1} width={1} flexDirection="row">
            {boton(el, 'rs-ant', { texto: 'Anterior' }, () => a.ui('tocaPaso', n - 1))}
          </Box>
          {f.id === d.yo?.id ? null : boton(el, 'rs-sesion', { texto: 'Sesión', icono: 'ojo' }, () => a.abreSesion(f))}
          <Box flexGrow={1} width={1} flexDirection="row" justifyContent="flex-end">
            {boton(el, 'rs-mandar', { texto: f.id === d.yo?.id ? 'Mandar a esta sesión' : `Mandar a ${f.rotulo}`, icono: 'enviar', tipo: 'azul' },
              () => a.manda(f))}
          </Box>
        </Box>,
      ])
    }
  } else if (mand) {
    // Lo ya mandado: lo que elegiste, atenuado, con «Cambiar la respuesta»
    const m = d.ui.mandadas[mand.id]!
    const verdecito = mezcla(VERDE, 0.12, T.tarjeta)
    cuerpo = tarjeta(el, 'mandada', [
      <Box key="md-cab" flexDirection="row" alignItems="center" gap="xs">
        {mini(el, mand.tag, 16)}
        <Text size="caption" color={T.t3}>{`${mand.rotulo} · ${plural(m.decisiones.length, 'pregunta', 'preguntas')} · `}</Text>
        <Text size="caption" weight="bold" color={T.ok}>mandada</Text>
      </Box>,
      ...m.decisiones.map((dec, i) => (
        <Box key={`md-${i}`} flexDirection="column" gap="xs">
          <Text size="footnote" weight="bold" color={T.t3} wrap="wrap">{dec.titulo}</Text>
          <Box flexDirection="row">
            <Box key={`md-p-${i}`} borderStyle="round" borderColor={verdecito} backgroundColor={verdecito} paddingX="xs" flexShrink={1} minWidth={0}>
              <Text size="caption" weight="bold" color={T.ok} wrap="wrap">{m.elegidas[i] ?? ''}</Text>
            </Box>
          </Box>
        </Box>
      )),
      <Box key="md-ok" flexDirection="row" alignItems="center" gap="xs" borderStyle="round" borderColor={verdecito}
        backgroundColor={verdecito} paddingX="sm" paddingY="xs">
        {ico(el, 'check', VERDE, 13)}
        <Text size="footnote" color={T.t1}>{`Mandada a ${mand.rotulo}: `}</Text>
        <Text size="footnote" mono weight="bold" color={T.t1}>{`«${m.texto}»`}</Text>
        <Text size="caption" color={T.t3}>{` · ${hora(m.cuando)}`}</Text>
      </Box>,
      <Box key="md-pie" flexDirection="row" alignItems="center">
        {boton(el, 'md-cambiar', { texto: 'Cambiar la respuesta' }, () => a.desmanda(mand.id))}
        <Box flexGrow={1} />
        {boton(el, 'md-sesion', { texto: 'Sesión', icono: 'ojo' }, () => a.abreSesion(mand))}
      </Box>,
    ])
  } else {
    cuerpo = tarjeta(el, 'vacio', [
      <Text key="vacio" size="footnote" color={T.t3} wrap="wrap">
        No te toca nada. Cuando una sesión te pregunte algo, sale aquí, con su recomendada.
      </Text>,
    ])
  }

  return [cabeza, barra, fila, cuerpo]
}
