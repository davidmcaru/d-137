// El aspecto de las maquetas del rediseño (Diseno-Panel, iteraciones 1 a 10) en el escritorio, que no deja poner CSS
// (26-oct: «es como si le faltara el css de los recortes»). Lo que el escritorio pinta a su manera (los botones
// nativos; el fondo de una caja, sin esquinas redondas) se dibuja aquí en SVG con los colores y las medidas de las
// maquetas (.btn, .chip, .tab y .card del CSS de it10), y se pulsa con una zona propia del escritorio (toque.tsx) o, si
// no la hay, con un botón en blanco encima. En la terminal, que no pinta SVG, los botones de siempre
import type { RenderElement } from 'claude-code'

import { ICONOS } from './dibujos'

type El = any

// Los colores de las maquetas (.fa del CSS de it10)
export const T = {
  fondo: '#262624', tarjeta: '#2e2e2c', borde: '#3c3c38', t1: '#f5f4ef', t2: '#c3c1b8', t3: '#8e8c85', acento: '#bdf0ff',
  ok: '#5cc995', aviso: '#e6bd55', error: '#ee7268', trab: '#8cc8ff', boton: '#34342f', sep: '#373733', marco: '#1f1f1d',
  tinta: '#0f1a1e', pista: '#3d3d38', azul: '#5c9afc', morado: '#a78bfa', naranja: '#f0a03c',
}
export const FUENTE = "Inter, 'Segoe UI', system-ui, sans-serif"
export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// El ancho de un texto en Inter o Segoe UI, aproximado letra a letra y con holgura: un SVG no crece con su texto, y lo
// que no cabe se cortaría
export function anchoTexto(texto: string, tam: number, negrita = false): number {
  let em = 0
  for (const c of texto) {
    em += /[ilj.,:;!|'·]/.test(c) ? 0.27 : /[ftrI\s]/.test(c) ? 0.34 : /[mwMW%]/.test(c) ? 0.86
      : /[A-ZÁÉÍÓÚÑ]/.test(c) ? 0.67 : /[0-9]/.test(c) ? 0.58 : 0.56
  }
  return Math.ceil(em * tam * (negrita ? 1.08 : 1) * 1.07)
}

// Un dibujo SVG dentro de otro: el <svg> de fuera, recolocado
export const incrusta = (svg: string, x: number, y: number, w: number, al: number) =>
  svg.replace(/<svg([^>]*)>/, (_m, attrs: string) =>
    `<svg${attrs.replace(/\s(width|height|x|y)="[^"]*"/g, '')} x="${x}" y="${y}" width="${w}" height="${al}">`)

export const icono = (nombre: string, x: number, y: number, lado: number, color: string, grueso = 2.2) =>
  `<g transform="translate(${x} ${y}) scale(${lado / 24})" fill="none" stroke="${color}" stroke-width="${grueso}" ` +
  `stroke-linecap="round" stroke-linejoin="round">${ICONOS[nombre] ?? ''}</g>`

// Un clic que llega por dos sitios a la vez (el botón del dibujo y la zona propia de su casilla) cuenta una sola vez:
// el segundo llegaba ya con la casilla abierta y la volvía a cerrar (26-oct: «solo se abren al pulsar el nombre»)
const ULTIMO = new Map<string, number>()
export function unaVez(grupo: string, fn: () => void): () => void {
  return () => {
    const ahora = Date.now()
    if (ahora - (ULTIMO.get(grupo) ?? 0) < 400) return
    ULTIMO.set(grupo, ahora)
    fn()
  }
}

// ---- La zona propia que recibe el clic (toque.tsx) ----
// Lo que hace cada una, por su clave; lo lanza el aviso del clic (ui.message, en register.tsx). Va solo donde no hay
// botones debajo, que dejarían de responder. Sin Client (el móvil, VS Code) o si falla, se queda el botón en blanco
export const TOQUES = new Map<string, () => void>()
let conToque = true
export const sinToque = () => {
  conToque = false
}
export function toque(el: El, key: string, alPulsar: () => void): RenderElement | null {
  const { Box, Client } = el
  if (!Client || !conToque) return null
  TOQUES.set(key, alPulsar)
  return (
    <Box key={`${key}-toque`} position="absolute" top={0} left={0} right={0} bottom={0}>
      <Client key={`${key}-t`} module="./toque.tsx" props={{ id: key }} width="100%" height="100%" />
    </Box>
  )
}

// Un SVG que se pulsa con un botón en blanco (U+2800) encima, con la clave de siempre, que sobresale una columna por
// lado para que no se corte con «…». Sin zona propia: con una por botón eran decenas y los clics se perdían
// (26-oct: «funciona muy mal»); la zona propia, solo en las casillas enteras
export function svgPulsable(el: El, key: string, svg: string, w: number, al: number, alt: string, alPulsar: () => void): RenderElement {
  const { Box, Button, Svg } = el
  const n = Math.max(1, Math.floor((w + 16 - 24) / 9.8))
  return (
    <Box key={`${key}-k`} position="relative" flexShrink={0}>
      <Svg source={svg} alt={alt} width={w} height={al} />
      <Box position="absolute" top={0} bottom={0} left={-1} right={-1} justifyContent="center" alignItems="center">
        <Button key={key} label={'⠀'.repeat(n)} plain onPress={alPulsar} />
      </Box>
    </Box>
  )
}

// Los símbolos de los botones en la terminal
const GLIFOS: Record<string, string> = {
  copiar: '⧉', enlace: '🔗', carpeta: '🗀', abrir: '▷', ojo: '👁︎', arriba: '▴', abajo: '▾', parar: '■', terminal: '>_', check: '✓',
  x: '✕', mensaje: '✉', enviar: '➤', derecha: '›', izquierda: '‹', borrar: '⌫',
}

// ---- Los botones (.btn de las maquetas): 28 de alto, radio 7, borde fino; el principal, cian ----
export type TipoBoton = 'sec' | 'pri' | 'borde' | 'rojo' | 'suave' | 'ib' | 'azul'
export function boton(el: El, key: string, o: { texto?: string; icono?: string; tipo?: TipoBoton; alto?: number; despues?: boolean },
  alPulsar: () => void): RenderElement {
  const { Button, Svg } = el
  const tipo = o.tipo ?? 'sec'
  if (!Svg) {
    const label = [o.icono ? GLIFOS[o.icono] ?? '' : '', o.texto ?? ''].filter(Boolean).join(' ') || '·'
    return <Button key={key} label={label} variant={tipo === 'pri' ? 'primary' : 'secondary'} onPress={alPulsar} />
  }
  const al = o.alto ?? 28
  const tam = al >= 28 ? 12.5 : 12
  const negrita = tipo === 'pri' || tipo === 'azul'
  const tw = o.texto ? anchoTexto(o.texto, tam, negrita) : 0
  const lado = al >= 28 ? 14 : 13
  const iw = o.icono ? lado : 0
  const pad = o.texto ? 10 : (al - iw) / 2
  const w = Math.round(pad * 2 + iw + (o.icono && o.texto ? 6 : 0) + tw)
  const [fondo, borde, color] = tipo === 'pri' ? [T.acento, T.acento, T.tinta]
    // el azul de Decisión («Mandar todo», «Mandar a…»), con la letra blanca
    : tipo === 'azul' ? [T.azul, T.azul, '#ffffff']
    : tipo === 'borde' ? [T.boton, '#bdf0ffaa', T.acento]
      : tipo === 'rojo' ? ['#ee726826', '#ee726880', T.error]
        : tipo === 'suave' ? ['#ffffff0a', '#ffffff14', T.t2]
          // .ib: el botón de solo icono, con el icono en el gris claro
          : tipo === 'ib' ? [T.boton, T.borde, T.t2]
            : [T.boton, T.borde, T.t1]
  let s = `<rect x="0.5" y="0.5" width="${w - 1}" height="${al - 1}" rx="7" fill="${fondo}" stroke="${borde}"/>`
  let x = pad
  if (o.icono && !o.despues) {
    s += icono(o.icono, x, (al - lado) / 2, lado, color)
    x += lado + (o.texto ? 6 : 0)
  }
  if (o.texto) {
    s += `<text x="${x}" y="${(al / 2 + tam * 0.36).toFixed(1)}" font-family="${FUENTE}" font-size="${tam}" ` +
      `font-weight="${negrita ? 600 : 500}" fill="${color}">${esc(o.texto)}</text>`
    x += tw + 6
  }
  // detrás del texto, como la flecha de «Siguiente ›»
  if (o.icono && o.despues) s += icono(o.icono, x, (al - lado) / 2, lado, color)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${al}" viewBox="0 0 ${w} ${al}">${s}</svg>`
  return svgPulsable(el, key, svg, w, al, o.texto || o.icono || 'botón', alPulsar)
}

// El botón de plegar: un cuadrado con la flecha (el de las maquetas, a la derecha de cada cabecera)
export const plegarK = (el: El, clave: string, abierto: boolean, alPulsar: () => void) =>
  boton(el, `pl-${clave}`, { icono: abierto ? 'arriba' : 'abajo', alto: 26 }, alPulsar)

// ---- Las pastillas (.chip): redondas, del color de lo que dicen y con su fondo suave; con punto o sin él ----
export function chip(el: El, key: string, texto: string, color: string, o: { punto?: boolean; fondo?: string; alto?: number;
  tam?: number; mono?: boolean; icono?: string } = {}): RenderElement {
  const { Box, Text, Svg } = el
  if (!Svg) return <Text key={key} size="caption" weight="bold">{texto}</Text>
  const al = o.alto ?? 20
  const tam = o.tam ?? 12
  // delante, el punto o un icono (el ✓ de «Terminó», la ✕ de «Falló»)
  const punto = o.punto !== false || !!o.icono
  const tw = anchoTexto(texto, tam, true)
  const w = Math.round(8 + (punto ? (o.icono ? 15 : 11) : 0) + tw + 8)
  const fondo = o.fondo ?? `${color}24`
  const fam = o.mono ? "'JetBrains Mono', Consolas, monospace" : FUENTE
  const s = `<rect width="${w}" height="${al}" rx="${al / 2}" fill="${fondo}"/>` +
    (o.icono ? icono(o.icono, 8, (al - 11) / 2, 11, color, 2.6) : punto ? `<circle cx="${8 + 3}" cy="${al / 2}" r="3" fill="${color}"/>` : '') +
    `<text x="${8 + (punto ? (o.icono ? 15 : 11) : 0)}" y="${(al / 2 + tam * 0.36).toFixed(1)}" font-family="${fam}" font-size="${tam}" ` +
    `font-weight="600" fill="${color}">${esc(texto)}</text>`
  return (
    <Box key={key} flexShrink={0}>
      <Svg source={`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${al}" viewBox="0 0 ${w} ${al}">${s}</svg>`}
        alt={texto} width={w} height={al} />
    </Box>
  )
}

// Una línea fina de lado a lado (.fila + .fila de las maquetas): el SVG más ancho que nada, recortado a su sitio
export function separador(el: El, key: string, color = T.sep): RenderElement | null {
  const { Box, Svg } = el
  if (!Svg) return null
  return (
    <Box key={key} flexDirection="row">
      <Svg source={`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1" viewBox="0 0 1600 1" preserveAspectRatio="none"><rect width="1600" height="1" fill="${color}"/></svg>`}
        alt="separador" height={1} />
    </Box>
  )
}

// Una cuenta en un cuadrado redondeado de su color (el 1, 2, 3 de «Lo que necesita de ti»)
export function numero(el: El, key: string, n: number | string, color: string): RenderElement {
  const { Box, Text, Svg } = el
  if (!Svg) return <Text key={key} size="caption">{String(n)}</Text>
  const s = `<rect width="22" height="22" rx="6" fill="${color}26"/><text x="11" y="15.2" text-anchor="middle" ` +
    `font-family="${FUENTE}" font-size="12" font-weight="700" fill="${color}">${esc(String(n))}</text>`
  return (
    <Box key={key} flexShrink={0}>
      <Svg source={`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">${s}</svg>`} alt={String(n)}
        width={22} height={22} />
    </Box>
  )
}

// Un icono en su cuadrado de color suave (los de los avisos: ✕ rojo, ✓ verde, la luna)
export function iconoCaja(el: El, key: string, nombre: string, color: string, lado = 28): RenderElement {
  const { Box, Svg } = el
  if (!Svg) return null as unknown as RenderElement
  const s = `<rect width="${lado}" height="${lado}" rx="7" fill="${color}26"/>` + icono(nombre, lado * 0.25, lado * 0.25, lado * 0.5, color, 2.4)
  return (
    <Box key={key} flexShrink={0}>
      <Svg source={`<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 ${lado} ${lado}">${s}</svg>`}
        alt={nombre} width={lado} height={lado} />
    </Box>
  )
}

// ---- Las pestañas (.tab): 30 de alto, radio 8, borde fino; la de ahora, cian; con el dibujo de su ficha ----
// El dibujo, a 16 × 16, o con su tamaño (la cabeza de cada personaje, un píxel por píxel), centrado en alto
export function pestana(el: El, key: string, texto: string, activa: boolean, dibujo: string | { svg: string; w: number; h: number } | null,
  alPulsar: () => void): RenderElement {
  const { Button, Svg } = el
  if (!Svg) return <Button key={key} label={texto} variant={activa ? 'primary' : 'secondary'} onPress={alPulsar} />
  const al = 30
  const tam = 13
  const tw = anchoTexto(texto, tam, activa)
  const dib = typeof dibujo === 'string' ? { svg: dibujo, w: 16, h: 16 } : dibujo
  const iw = dib ? dib.w : 0
  const w = Math.round(8 + iw + (dibujo ? 6 : 0) + tw + 9)
  const [fondo, borde, color] = activa ? [T.acento, T.acento, T.tinta] : ['#00000000', T.borde, T.t2]
  const s = `<rect x="0.5" y="0.5" width="${w - 1}" height="${al - 1}" rx="8" fill="${fondo}" stroke="${borde}"/>` +
    (dib ? incrusta(dib.svg, 8, Math.round((al - dib.h) / 2), dib.w, dib.h) : '') +
    `<text x="${8 + iw + (dibujo ? 6 : 0)}" y="${(al / 2 + tam * 0.36).toFixed(1)}" font-family="${FUENTE}" font-size="${tam}" ` +
    `font-weight="${activa ? 600 : 500}" fill="${color}">${esc(texto)}</text>`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${al}" viewBox="0 0 ${w} ${al}">${s}</svg>`
  return svgPulsable(el, key, svg, w, al, texto, alPulsar)
}

// Un color sobre otro, ya mezclado (el color-mix de las maquetas): un fondo opaco donde uno con transparencia dejaría ver
// lo de debajo
export function mezcla(color: string, alfa: number, base: string = T.tarjeta): string {
  const rgb = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))
  const [a, b] = [rgb(color), rgb(base)]
  return `#${a.map((v, i) => Math.round(v * alfa + (b[i] ?? 0) * (1 - alfa)).toString(16).padStart(2, '0')).join('')}`
}

// La caja con el borde de su color (las casillas y los paneles de las maquetas, .tarj-m y .panel-c), redonda y con su
// fondo opaco (mezcla). El borde de 2 px de las maquetas no cabe: el escritorio deja el hueco de una fila por cada
// borde, y dos cajas, una dentro de otra, salían como un marco gordo (26-oct: «líneas súper bold»). En la
// terminal, un borde grueso
export function grueso(el: El, key: string, color: string, fondo: string, fuera: Record<string, unknown>,
  dentro: Record<string, unknown>, hijos: (RenderElement | null)[]): RenderElement {
  const { Box, Svg } = el
  return (
    <Box key={key} borderStyle={Svg ? 'round' : 'bold'} borderColor={color} backgroundColor={Svg ? fondo : undefined}
      {...fuera} {...dentro}>
      {hijos}
    </Box>
  )
}

// La etiqueta de estado (.estado-et): un cuadradito de su color y el texto, sobre el fondo oscuro, con el radio de 6
export function estadoEt(el: El, key: string, texto: string, color: string): RenderElement {
  const { Box, Text, Svg } = el
  if (!Svg) return <Text key={key} size="caption" weight="bold" color={color}>{`■ ${texto}`}</Text>
  const al = 22
  const tam = 12
  const w = Math.round(7 + 8 + 5 + anchoTexto(texto, tam, true) + 7)
  const s = `<rect width="${w}" height="${al}" rx="6" fill="${T.marco}"/><rect x="7" y="7" width="8" height="8" rx="2" fill="${color}"/>` +
    `<text x="20" y="${(al / 2 + tam * 0.36).toFixed(1)}" font-family="${FUENTE}" font-size="${tam}" font-weight="600" ` +
    `fill="${T.t1}">${esc(texto)}</text>`
  return (
    <Box key={key} flexShrink={0}>
      <Svg source={`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${al}" viewBox="0 0 ${w} ${al}">${s}</svg>`}
        alt={texto} width={w} height={al} />
    </Box>
  )
}

// Una leyenda de iconos con su texto (la de lo entregado: copiar la ruta, abrir la carpeta, abrir en su programa)
export function leyenda(el: El, key: string, items: [string, string][]): RenderElement {
  const { Box, Text, Svg } = el
  return (
    <Box key={key} flexDirection="row" flexWrap="wrap" columnGap="md" rowGap="xs">
      {items.map(([nombre, texto]) => (
        <Box key={`${key}-${nombre}`} flexDirection="row" alignItems="center" gap="xs">
          {Svg ? <Svg source={`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">${icono(nombre, 0, 0, 12, T.t3, 2.2)}</svg>`}
            alt={texto} width={12} height={12} /> : <Text size="caption" color={T.t3}>{GLIFOS[nombre] ?? ''}</Text>}
          <Text size="caption" color={T.t3}>{texto}</Text>
        </Box>
      ))}
    </Box>
  )
}

// Una etiqueta de borde fino de su color, con su icono (las de Activo: el tipo, «SERVIDOR», y las cuentas «✓ 4» y
// «✕ 1» de su ficha); en mayúsculas, la del tipo
export function etiqueta(el: El, key: string, texto: string, color: string, o: { icono?: string; mayus?: boolean; alto?: number } = {}): RenderElement {
  const { Box, Text, Svg } = el
  const t = o.mayus ? texto.toUpperCase() : texto
  if (!Svg) return <Text key={key} size="caption" weight="bold" color={color}>{`${o.icono ? `${GLIFOS[o.icono] ?? ''} ` : ''}${t}`}</Text>
  const al = o.alto ?? 22
  const tam = o.mayus ? 11 : 12
  const iw = o.icono ? 12 : 0
  const w = Math.round(7 + iw + (o.icono ? 5 : 0) + anchoTexto(t, tam, true) * (o.mayus ? 1.06 : 1) + 8)
  const s = `<rect x="0.5" y="0.5" width="${w - 1}" height="${al - 1}" rx="6" fill="${color}1f" stroke="${color}66"/>` +
    (o.icono ? icono(o.icono, 7, (al - 12) / 2, 12, color, 2.4) : '') +
    `<text x="${7 + iw + (o.icono ? 5 : 0)}" y="${(al / 2 + tam * 0.36).toFixed(1)}" font-family="${FUENTE}" font-size="${tam}" ` +
    `font-weight="700" letter-spacing="${o.mayus ? 0.4 : 0}" fill="${color}">${esc(t)}</text>`
  return (
    <Box key={key} flexShrink={0}>
      <Svg source={`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${al}" viewBox="0 0 ${w} ${al}">${s}</svg>`}
        alt={texto} width={w} height={al} />
    </Box>
  )
}

// Un filtro (los de Activo: «Activos · 6», «Acabados · 5» y los tipos): con borde fino; el puesto, con el fondo y el
// borde de su color
export function filtro(el: El, key: string, o: { texto?: string; icono?: string; color?: string; activo: boolean },
  alPulsar: () => void): RenderElement {
  const { Button, Svg } = el
  const color = o.color ?? T.trab
  if (!Svg) {
    return <Button key={key} label={`${o.icono ? `${GLIFOS[o.icono] ?? ''} ` : ''}${o.texto ?? ''}`} variant={o.activo ? 'primary' : 'secondary'} onPress={alPulsar} />
  }
  const al = 26
  const tam = 12.5
  const iw = o.icono ? 13 : 0
  const tw = o.texto ? anchoTexto(o.texto, tam, true) : 0
  const w = Math.round(9 + iw + (o.icono && o.texto ? 5 : 0) + tw + 9)
  const [fondo, borde, tinta] = o.activo ? [`${color}29`, `${color}99`, color] : ['#00000000', o.color ? `${color}66` : T.borde, o.color ? color : T.t2]
  let s = `<rect x="0.5" y="0.5" width="${w - 1}" height="${al - 1}" rx="7" fill="${fondo}" stroke="${borde}"/>`
  if (o.icono) s += icono(o.icono, 9, (al - 13) / 2, 13, tinta, 2.3)
  if (o.texto) {
    s += `<text x="${9 + iw + (o.icono ? 5 : 0)}" y="${(al / 2 + tam * 0.36).toFixed(1)}" font-family="${FUENTE}" font-size="${tam}" ` +
      `font-weight="${o.activo ? 600 : 500}" fill="${tinta}">${esc(o.texto)}</text>`
  }
  return svgPulsable(el, key, `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${al}" viewBox="0 0 ${w} ${al}">${s}</svg>`,
    w, al, o.texto ?? o.icono ?? 'filtro', alPulsar)
}

// La tecla de una opción (la [a] de las maquetas): un cuadradito de borde fino con su letra
export function tecla(el: El, key: string, letra: string): RenderElement | null {
  const { Box, Svg } = el
  if (!Svg) return null
  const s = `<rect x="0.5" y="0.5" width="15" height="15" rx="4" fill="none" stroke="#ffffff38"/><text x="8" y="11.6" ` +
    `text-anchor="middle" font-family="${FUENTE}" font-size="10" fill="${T.t3}">${esc(letra)}</text>`
  return (
    <Box key={key} flexShrink={0}>
      <Svg source={`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">${s}</svg>`} alt={`tecla ${letra}`}
        width={16} height={16} />
    </Box>
  )
}

// La letra de una opción, de su color (la recomendada, en verde), con su botón en blanco encima
export function letraPulsable(el: El, key: string, letra: string, color: string, alPulsar: () => void): RenderElement {
  const { Box, Button, Text } = el
  return (
    <Box key={`${key}-k`} position="relative" flexShrink={0} paddingX="xs">
      <Text weight="bold" color={color}>{letra}</Text>
      <Box position="absolute" top={0} bottom={0} left={-1} right={-1} justifyContent="center" alignItems="center">
        <Button key={key} label={'⠀'} plain onPress={alPulsar} />
      </Box>
    </Box>
  )
}

// La letra de una opción de Decisión como botón dibujado, igual que las pestañas: su cuadrado suave y la letra de su
// color (la recomendada, verde; la elegida, azul). Con el botón en blanco de un carácter encima (letraPulsable) no
// respondía (28-oct: «poder clicar en las letras de la izquierda para elegir la opción»)
export function letraBoton(el: El, key: string, letra: string, color: string, alPulsar: () => void): RenderElement {
  const { Svg } = el
  if (!Svg) return letraPulsable(el, key, letra, color, alPulsar)
  const lado = 24
  const s = `<rect x="0.5" y="0.5" width="${lado - 1}" height="${lado - 1}" rx="6" fill="${color}1f" stroke="${color}66"/>` +
    `<text x="${lado / 2}" y="16.6" text-anchor="middle" font-family="${FUENTE}" font-size="13" font-weight="700" ` +
    `fill="${color}">${esc(letra)}</text>`
  return svgPulsable(el, key, `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 ${lado} ${lado}">${s}</svg>`,
    lado, lado, `opción ${letra}`, alPulsar)
}

// Un borde a trazos con las esquinas redondas (la casilla de los avisos de TX1): los lados, con rayitas rellenas (el
// escritorio no pinta los trazos discontinuos de un SVG), y las esquinas, de un trazo
export function trazos(w: number, al: number, r: number, color: string, g = 1.5): string {
  const d = 4
  const hueco = 3
  const m = g / 2 + 0.5
  let s = ''
  const linea = (x0: number, y0: number, x1: number, y1: number) => {
    const largo = Math.abs(x1 - x0) + Math.abs(y1 - y0)
    for (let i = hueco; i < largo - 1; i += d + hueco) {
      const l = Math.min(d, largo - i).toFixed(1)
      s += y0 === y1
        ? `<rect x="${(x0 + i).toFixed(1)}" y="${(y0 - g / 2).toFixed(1)}" width="${l}" height="${g}" fill="${color}"/>`
        : `<rect x="${(x0 - g / 2).toFixed(1)}" y="${(y0 + i).toFixed(1)}" width="${g}" height="${l}" fill="${color}"/>`
    }
  }
  linea(r + m, m, w - r - m, m)
  linea(r + m, al - m, w - r - m, al - m)
  linea(m, r + m, m, al - r - m)
  linea(w - m, r + m, w - m, al - r - m)
  const arco = (x0: number, y0: number, x1: number, y1: number) =>
    `<path d="M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}" fill="none" stroke="${color}" stroke-width="${g}"/>`
  s += arco(m, r + m, r + m, m) + arco(w - r - m, m, w - m, r + m) + arco(w - m, al - r - m, w - r - m, al - m) +
    arco(r + m, al - m, m, al - r - m)
  return s
}

// Una opción de los menús de la franja (Más y Commit): su icono pixelado y su nombre en una sola etiqueta redonda de
// fondo suave, que se pulsa entera (it-11, r22: «deberían ser uno… en badges de color de fondo suave»)
export function etiquetaMenu(el: El, key: string, texto: string, dibujo: string, dw: number, dh: number,
  alPulsar: (ev?: any) => void): RenderElement {
  const { Button, Svg } = el
  if (!Svg) return <Button key={key} label={texto} variant="secondary" onPress={alPulsar} />
  const al = 28
  const tam = 12.5
  const w = Math.round(9 + dw + 7 + anchoTexto(texto, tam) + 11)
  const s = `<rect x="0.5" y="0.5" width="${w - 1}" height="${al - 1}" rx="8" fill="#bdf0ff1f" stroke="#bdf0ff47"/>` +
    incrusta(dibujo, 9, (al - dh) / 2, dw, dh) +
    `<text x="${9 + dw + 7}" y="${(al / 2 + tam * 0.36).toFixed(1)}" font-family="${FUENTE}" font-size="${tam}" font-weight="500" ` +
    `fill="${T.t1}">${esc(texto)}</text>`
  return svgPulsable(el, key, `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${al}" viewBox="0 0 ${w} ${al}">${s}</svg>`,
    w, al, texto, alPulsar)
}

// ---- Las barras (.barra): 6 de alto, redondas, sobre su pista ----
// (`estira`: sin proporción fija, para llenar el hueco que le den con dibujoLleno)
export function barra(ancho: number, frac: number, color: string, alto = 6, pista = T.pista, estira = false): string {
  const w = Math.max(0, Math.min(1, frac)) * ancho
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}" viewBox="0 0 ${ancho} ${alto}"${estira ? ' preserveAspectRatio="none"' : ''}>` +
    `<rect width="${ancho}" height="${alto}" rx="${alto / 2}" fill="${pista}"/>` +
    (w > 0 ? `<rect width="${Math.max(alto, w).toFixed(1)}" height="${alto}" rx="${alto / 2}" fill="${color}"/>` : '') + '</svg>'
}
