// El selector del personaje de esta sesión (5-nov-2026): sale con el ojo de su ficha, a la derecha del enlace de la
// sesión, con los 25 personajes y, en cada uno, cuántas sesiones lo tienen, también las archivadas. No impide elegir uno repetido: solo lo cuenta. Lo
// elegido se guarda como el de esta sesión (reparto.ts). Es la rejilla de fichas que se eligió entre seis
// (5-nov): el dibujo grande de cada uno, el mismo de la ficha, quieto; su nombre; la bola
// con la cuenta, y el de esta sesión con el borde y el fondo cian de lo elegido. Cada casilla es un dibujo con un botón en
// blanco encima, como las de la fila de Decisión
import type { RenderElement } from 'claude-code'

import type { Acciones, Datos, El } from './comun'
import { cabecera } from './comun'
import { retrato } from './dibujos'
import { nombreTag, TAGS } from './fichas'
import { anchoTexto, boton, esc, FUENTE, incrusta, mezcla, svgPulsable, T } from './kit'

const POR_FILA = 5
const HUECO = 7
const ALTO = 92
const GRIS_CUENTA = '#bdbdb7'
const texto = (t: string, x: number, y: number, tam: number, negrita: boolean, color: string) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="${FUENTE}" font-size="${tam}" font-weight="${negrita ? 700 : 500}" ` +
  `fill="${color}">${esc(t)}</text>`

// Una casilla: el dibujo de ficha, lo más grande que quepa en 44 × 54; su nombre, con la letra algo más pequeña si no
// cabe; y la bola con cuántas sesiones lo tienen (gris claro si alguna, apagada si ninguna), con un aro del fondo de la
// casilla para que se lea aunque toque el dibujo (el de Mutante, el más ancho)
function casilla(tag: string, n: number, actual: boolean, w: number): string {
  const f = retrato(tag)
  const k = Math.min(44 / f.w, 54 / f.h)
  const fw = Math.round(f.w * k)
  const fh = Math.round(f.h * k)
  const fondo = actual ? mezcla(T.acento, 0.14, T.tarjeta) : T.marco
  const nombre = nombreTag(tag)
  const tam = Math.max(8.5, Math.min(11, (11 * (w - 8)) / anchoTexto(nombre, 11, actual)))
  const s = (actual
    ? `<rect x="1" y="1" width="${w - 2}" height="${ALTO - 2}" rx="9" fill="${fondo}" stroke="${T.acento}" stroke-width="2"/>`
    : `<rect x="0.5" y="0.5" width="${w - 1}" height="${ALTO - 1}" rx="9" fill="${fondo}" stroke="${T.borde}"/>`) +
    incrusta(f.svg, (w - fw) / 2, 8 + (54 - fh) / 2, fw, fh) +
    texto(nombre, w / 2, ALTO - 11, Math.round(tam * 10) / 10, actual, actual ? T.t1 : T.t2) +
    `<circle cx="${w - 12}" cy="12" r="9.5" fill="${fondo}"/><circle cx="${w - 12}" cy="12" r="7.5" fill="${n > 0 ? GRIS_CUENTA : T.pista}"/>` +
    texto(n > 9 ? '9+' : String(n), w - 12, 15.4, 9.4, true, n > 0 ? '#1b1b1f' : T.t3)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${ALTO}" viewBox="0 0 ${w} ${ALTO}">${s}</svg>`
}

export function selectorPersonajes(el: El, d: Datos, a: Acciones): RenderElement {
  const { Box, Text } = el
  const yo = d.yo?.tag ?? ''
  const cuentas = d.reparto?.cuentas ?? {}
  // lo que cabe dentro de la tarjeta (unos 7,9 px por columna, menos su borde y su aire), en cinco columnas
  const w = Math.floor((Math.max(240, Math.round(d.cols * 7.9 - 48)) - HUECO * (POR_FILA - 1)) / POR_FILA)
  const casillas = TAGS.map(tag => {
    const n = cuentas[tag] ?? 0
    return svgPulsable(el, `sel-${tag}`, casilla(tag, n, tag === yo, w), w, ALTO,
      `${nombreTag(tag)}: ${n === 1 ? '1 sesión' : `${n} sesiones`}`, () => a.eligePersonaje(tag))
  })
  const filas: RenderElement[] = []
  for (let i = 0; i < casillas.length; i += POR_FILA) {
    filas.push(<Box key={`sel-f${i}`} flexDirection="row" gap="xs">{casillas.slice(i, i + POR_FILA)}</Box>)
  }
  return (
    <Box key="selector" flexDirection="column" borderStyle="round" borderColor={T.acento} backgroundColor={T.tarjeta}
      paddingX="sm" paddingY="sm" gap="sm">
      {cabecera(el, { key: 'sel-cab', titulo: 'Personaje de esta sesión', fuerte: true,
        derecha: boton(el, 'sel-cerrar', { icono: 'x', tipo: 'ib', alto: 26 }, () => a.alterna('selector')) })}
      <Text key="sel-nota" size="caption" color={T.t3} wrap="wrap">
        {d.reparto ? 'El número: las sesiones que lo tienen, también las archivadas.' : 'Contando las sesiones…'}
      </Text>
      <Box key="sel-rejilla" flexDirection="column" gap="xs">{filas}</Box>
    </Box>
  )
}
