// Las gráficas del panel, en SVG: la barra de los pasos del turno y su cascada (MP10, elegida en la iteración 2), la
// semana día a día y el mapa de las horas de «Cuota». Van sin ancho fijo cuando ocupan toda la tarjeta: el panel las
// pinta al ancho que haya (hasta el suyo) y con su proporción
import type { DiaSemana, FilaHoras } from './calculos'
import { anchoTexto, mezcla, T } from './kit'

const PISTA = 'rgba(128,128,128,0.22)'
const TEXTO = '#8b8b86'
const LETRA = 'Inter, Segoe UI, system-ui, sans-serif'
const n1 = (v: number) => (Math.round(v * 10) / 10).toFixed(1).replace('.', ',')

export type Tramo = { desde: number; hasta: number; color: string; vivo?: boolean }

// El borde a trazos de un cuadro, con rayitas rellenas (el panel del escritorio no pinta los trazos de un SVG)
function aTrazos(x: number, y: number, w: number, h: number, color: string, paso = 3): string {
  let s = ''
  for (let i = 0; i < w; i += paso * 2) {
    const l = Math.min(paso, w - i).toFixed(1)
    s += `<rect x="${(x + i).toFixed(1)}" y="${y.toFixed(1)}" width="${l}" height="1.2" fill="${color}"/>` +
      `<rect x="${(x + i).toFixed(1)}" y="${(y + h - 1.2).toFixed(1)}" width="${l}" height="1.2" fill="${color}"/>`
  }
  for (let j = 0; j < h; j += paso * 2) {
    const l = Math.min(paso, h - j).toFixed(1)
    s += `<rect x="${x.toFixed(1)}" y="${(y + j).toFixed(1)}" width="1.2" height="${l}" fill="${color}"/>` +
      `<rect x="${(x + w - 1.2).toFixed(1)}" y="${(y + j).toFixed(1)}" width="1.2" height="${l}" fill="${color}"/>`
  }
  return s
}

// La barra conjunta de los pasos (MP10 plegada): un tramo por paso, de largo lo que tardó, y un poco de pista al final
// mientras trabaja
export function barraPasos(tramos: Tramo[], ancho: number, sigue: boolean): string {
  const h = 8
  const total = tramos.reduce((s, t) => s + Math.max(1, t.hasta - t.desde), 0)
  const util = sigue ? ancho * 0.94 : ancho
  let x = 0
  let s = `<rect width="${ancho}" height="${h}" rx="3" fill="${PISTA}"/>`
  for (const t of tramos) {
    const w = total ? (Math.max(1, t.hasta - t.desde) / total) * util : 0
    if (w >= 1) s += `<rect x="${x.toFixed(1)}" width="${Math.max(1, w - 2).toFixed(1)}" height="${h}" rx="3" fill="${t.color}"/>`
    x += w
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${h}" viewBox="0 0 ${ancho} ${h}">${s}</svg>`
}

// Las rayas en diagonal de un tramo vivo (las de las maquetas: 3 px de color y 3 px más oscuro, a 135°), cada una ya
// recortada a lo ancho del tramo
function rayas(xi: number, xf: number, h: number, color: string): string {
  const paso = 8.49
  const ancho = 4.24
  const corta = (pts: [number, number][], borde: number, dentro: (x: number) => boolean) => {
    const out: [number, number][] = []
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % pts.length] as [number, number]
      if (dentro(p[0])) out.push(p)
      if (dentro(p[0]) !== dentro(q[0])) out.push([borde, p[1] + ((borde - p[0]) * (q[1] - p[1])) / (q[0] - p[0])])
    })
    return out
  }
  let s = ''
  for (let c = xi - ancho; c < xf + h; c += paso) {
    let pts: [number, number][] = [[c, 0], [c + ancho, 0], [c + ancho - h, h], [c - h, h]]
    pts = corta(pts, xi, x => x >= xi)
    pts = corta(pts, xf, x => x <= xf)
    if (pts.length >= 3) s += `<polygon points="${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}" fill="${color}"/>`
  }
  return s
}

// Un paso de la cascada (MP10 desplegada): su tramo en la línea de tiempo del turno, sobre la pista oscura y redondo de
// punta a punta; el que sigue, a rayas en diagonal
export function tramoCascada(desde: number, hasta: number, t0: number, t1: number, color: string, vivo: boolean, ancho = 130): string {
  const h = 12
  const r = h / 2
  const span = Math.max(1, t1 - t0)
  const x = Math.max(0, Math.min(ancho - h, ((desde - t0) / span) * ancho))
  const w = Math.max(h, Math.min(ancho - x, ((hasta - desde) / span) * ancho))
  let s = `<rect width="${ancho}" height="${h}" rx="${r}" fill="${T.marco}"/>`
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    s += `<rect x="${x.toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="${r}" fill="${vivo ? mezcla(color, 0.7, '#000000') : color}"/>`
    if (vivo) s += rayas(x + r * 0.6, x + w - r * 0.6, h, color)
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ancho} ${h}">${s}</svg>`
}

// La semana, día a día (de lunes a domingo): una barra por día, con lo gastado encima; la media de ese día, una raya
// ámbar; en los que faltan, lo que tocaría para acabar cerca del 100 %, en verde y a trazos; y donde la cuota se
// renueva, una raya vertical a trazos con «se renueva»
export function semanaSvg(dias: DiaSemana[], ancho: number): string {
  const alto = 140
  const base = 118
  const arriba = 22
  const max = Math.max(1, ...dias.map(d => Math.max(d.valor ?? 0, d.media ?? 0, d.toca ?? 0))) * 1.08
  const col = ancho / dias.length
  const bw = Math.min(38, col * 0.62)
  const y = (v: number) => base - (v / max) * (base - arriba)
  let s = ''
  dias.forEach((d, i) => {
    const cx = col * i + col / 2
    const x = cx - bw / 2
    if (d.renueva && i > 0) {
      const xr = (col * i).toFixed(1)
      for (let yy = 14; yy < base + 4; yy += 6) s += `<rect x="${xr}" y="${yy}" width="1" height="3" fill="#8e8c85"/>`
      s += `<text x="${xr}" y="9" text-anchor="middle" font-size="9" fill="#8e8c85" font-family="${LETRA}">se renueva</text>`
    }
    if (d.valor !== null) {
      const yy = y(d.valor)
      s += `<rect x="${x.toFixed(1)}" y="${yy.toFixed(1)}" width="${bw.toFixed(1)}" height="${(base - yy).toFixed(1)}" rx="3" ` +
        `fill="${d.hoy ? '#9fe3ff' : '#6b6b67'}"/>`
      s += `<text x="${cx.toFixed(1)}" y="${(yy - 6).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="700" ` +
        `fill="${d.hoy ? '#9fe3ff' : '#c9c9c4'}" font-family="${LETRA}">${n1(d.valor)}</text>`
    } else if (d.toca !== null) {
      const yy = y(d.toca)
      s += `<rect x="${x.toFixed(1)}" y="${yy.toFixed(1)}" width="${bw.toFixed(1)}" height="${(base - yy).toFixed(1)}" rx="3" ` +
        'fill="rgba(87,194,122,0.10)"/>' + aTrazos(x, yy, bw, base - yy, '#57c27a')
      s += `<text x="${cx.toFixed(1)}" y="${(yy - 6).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="700" ` +
        `fill="#57c27a" font-family="${LETRA}">${n1(d.toca)}</text>`
    }
    if (d.media !== null) {
      const ym = y(d.media)
      s += `<rect x="${(x - 4).toFixed(1)}" y="${(ym - 1).toFixed(1)}" width="${(bw + 8).toFixed(1)}" height="2" fill="#e2b93b"/>`
    }
    s += `<text x="${cx.toFixed(1)}" y="${base + 16}" text-anchor="middle" font-size="11" ` +
      `fill="${d.hoy ? '#e8e6e3' : TEXTO}" font-weight="${d.hoy ? 700 : 400}" font-family="${LETRA}">${d.nombre}</text>`
  })
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}" viewBox="0 0 ${ancho} ${alto}">${s}</svg>`
}
// Los dos dibujos de su leyenda (CX2): la raya ámbar de la media y el cuadro a trazos de lo que tocaría
export const rayaMedia = () => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 10"><rect y="4" width="14" height="2" fill="#e2b93b"/></svg>'
export const cuadroTrazos = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 11">${aTrazos(0, 0, 11, 11, '#57c27a', 2)}</svg>`

// Cuándo lo usas: una fila por grupo de días (o por día) y una celda entera por hora, con lo que diga su fila (la media
// o lo de ese día); debajo, en una línea, qué es cada fila
const NIVELES = ['rgba(128,128,128,0.16)', '#5f5f5b', '#878782', '#b3b3ad', '#e8e8e2']
// (`etiqueta`: el ancho de la columna de los nombres de las filas; Cuota lo pone para que la rejilla empiece donde
// las barras de «Por sesión»)
export function horasSvg(filas: FilaHoras[], leyenda: string, ancho: number, etiqueta = 70): string {
  const celda = Math.max(7, Math.min(16, Math.floor((ancho - etiqueta) / 24)))
  const fila = 15
  const max = Math.max(0.1, ...filas.flatMap(f => f.valores ?? []))
  const nivel = (v: number) => (v <= 0 ? 0 : Math.min(4, 1 + Math.floor((v / max) * 3.999)))
  let s = ''
  filas.forEach((f, r) => {
    const y = r * fila
    s += `<text x="0" y="${y + 10}" font-size="10" fill="${f.fuerte ? '#e8e6e3' : TEXTO}" font-weight="${f.fuerte ? 700 : 400}" ` +
      `font-family="${LETRA}">${f.nombre}</text>`
    for (let h = 0; h < 24; h += 1) {
      const x = etiqueta + h * celda
      s += `<rect x="${x}" y="${y}" width="${celda - 2}" height="${fila - 3}" rx="1.5" fill="${NIVELES[nivel(f.valores?.[h] ?? 0)]}"/>`
    }
  })
  const yEje = filas.length * fila + 9
  for (let h = 0; h < 24; h += 3) {
    s += `<text x="${etiqueta + h * celda}" y="${yEje}" font-size="9" fill="${TEXTO}" font-family="Consolas, monospace">` +
      `${String(h).padStart(2, '0')}</text>`
  }
  const yLey = yEje + 16
  s += `<text x="0" y="${yLey}" font-size="10" fill="${TEXTO}" font-family="${LETRA}">${leyenda}</text>`
  // la escala de «menos» a «más», a la derecha, si cabe sin pisar lo de qué es cada fila
  const xm = etiqueta + 24 * celda
  if (anchoTexto(leyenda, 10) + 10 <= xm - 112 - anchoTexto('menos', 10)) {
    s += `<text x="${xm - 112}" y="${yLey}" font-size="10" fill="${TEXTO}" text-anchor="end" font-family="${LETRA}">menos</text>`
    NIVELES.slice(1).forEach((c, i) => {
      s += `<rect x="${xm - 106 + i * 15}" y="${yLey - 9}" width="12" height="10" rx="1.5" fill="${c}"/>`
    })
    s += `<text x="${xm - 44}" y="${yLey}" font-size="10" fill="${TEXTO}" font-family="${LETRA}">más</text>`
  }
  const w = etiqueta + 24 * celda
  const h = yLey + 4
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${s}</svg>`
}

// Las dos barras de una sesión (CX2): la gruesa, lo suyo de la semana; la fina, debajo y más oscura, lo de hoy; las
// dos en la misma escala, la de lo gastado entre todas esta semana
export function dosBarrasSvg(semana: number, hoy: number, color: string, ancho: number): string {
  const x1 = Math.max(semana > 0 ? 8 : 0, Math.min(1, semana) * ancho)
  const x2 = Math.max(hoy > 0 ? 3 : 0, Math.min(1, hoy) * ancho)
  // sin proporción fija: se estira o se encoge hasta llenar su fila (dibujoLleno)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="14" viewBox="0 0 ${ancho} 14" preserveAspectRatio="none">` +
    `<rect width="${ancho}" height="8" rx="4" fill="${T.pista}"/>` +
    (x1 ? `<rect width="${x1.toFixed(1)}" height="8" rx="4" fill="${color}"/>` : '') +
    `<rect y="11" width="${ancho}" height="3" rx="1.5" fill="${T.pista}"/>` +
    (x2 ? `<rect y="11" width="${x2.toFixed(1)}" height="3" rx="1.5" fill="${mezcla(color, 0.6, T.tarjeta)}"/>` : '') + '</svg>'
}

// Una barra fina de toda la tarjeta con un tramo de color: la parte de una sesión en lo gastado esta semana
export function parteSvg(desde: number, frac: number, color: string, ancho: number): string {
  const h = 5
  const x = Math.max(0, Math.min(1, desde)) * ancho
  const w = Math.max(frac > 0 ? 3 : 0, Math.min(ancho - x, frac * ancho))
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${h}" viewBox="0 0 ${ancho} ${h}">` +
    `<rect width="${ancho}" height="${h}" rx="2.5" fill="${PISTA}"/>` +
    (w ? `<rect x="${x.toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="2.5" fill="${color}"/>` : '') + '</svg>'
}
