// Los dibujos del panel, todos en SVG (lo único que el escritorio pinta fuera de una caja o un texto): los cuatro de las
// fichas (Doc, Paloma mensajera, Trabajador y la pistola de portales, elegidos en las iteraciones 8 y 9 del rediseño), los
// Martys con su animación, las barras de cuadritos, la letra pixelada del rótulo de la elegida, las marcas y los
// iconos de trazo (los de Lucide, que son los que dibuja la app). Dentro de un botón no cabe un Svg: allí van glifos
import { MARTYS } from './martys'
import type { Sprite } from './martys'
import { FICHAS, RESERVA } from './personajes'

type Dibujo = { filas: string[]; pal: Record<string, string> }

// Doc, el clásico del motor de antes (motor.js): pelo, cara y bata, 12 × 18
export const DOC: Dibujo = {
  filas: ['..h..h..h...', '.hhh.hhhhh..', 'hhhhhhhhhhh.', 'hhssssssssh.', 'hskkkkkkkksh', '.swwssswwss.', '.sewssswess.',
    '.ssssSSssss.', '.sskwwwwkss.', '..ssssssss..', '..cmmmmmmc..', '.ccmmmmmmcc.', 'ccCmmmmmmCcc', 'scCmmmmmmCcs',
    '.ccnnnnnncc.', '.cCnn..nnCc.', '...nn..nn...', '...kk..kk...'],
  pal: { h: '#b9dcec', s: '#f2c6a0', S: '#d9a882', k: '#1b1b1f', w: '#ffffff', e: '#1b1b1f', c: '#f4f6f8', C: '#c3ccd5',
    m: '#7cc4e8', n: '#8d6b4a' },
}
export const PAJARO: Dibujo = {
  filas: ['....hhhh....', '...hhhhhh...', '..hhhhhhhh..', '..hhwkhhhh..', '..hhhhhyyyy.', '..hhhhhyyy..', '...hhhhhh...',
    '....ffff....', '..dddddddd..', '.ddddddddddd', 'dd.dddddd.dd', 'd..dddddd..d', '...dddddd...', '...dd..dd...',
    '...dd..dd...', '..ddd..ddd..'],
  pal: { h: '#c9a26b', w: '#ffffff', k: '#1b1b1f', y: '#f2b632', f: '#8d6e4a', d: '#3b4a3f' },
}
export const GENIO: Dibujo = {
  filas: ['....bbbb....', '..bbbbbbbb..', '.bbbbbbbbbb.', '.bwwbbbbwwb.', '.bwkbbbbwkb.', '.bbbbbbbbbb.', '.bbbbkkbbbb.',
    '..bbkrrkbb..', '...bbbbbb...', '....bbbb....', '..bbbbbbbb..', '.bbbbbbbbbb.', 'bb.bbbbbb.bb', 'b..bbbbbb..b',
    '...bbbbbb...', '...bb..bb...', '...bb..bb...', '..bbb..bbb..'],
  pal: { b: '#6ec6f0', w: '#ffffff', k: '#1b1b1f', r: '#e05a5a' },
}
export const PISTOLA: Dibujo = {
  filas: ['....GGGGGG......', '....GggggG......', '...wwwwwwwwwwa..', '..wwwwwwwwwwwwgg', '..wwkwkwwwwwwwgg',
    '..WWWWWWWWWWWa..', '...WWW..........', '...WWW..........', '...WW...........'],
  pal: { w: '#e8e8e4', W: '#b8b8b2', g: '#5cd65c', G: '#2f9a3a', k: '#1b1b1f', a: '#9aa0a8' },
}

// Trabajador del color de un tipo de lo que corre (agentes, servidores, comandos)
export const genioDe = (color: string) => quieto({ filas: GENIO.filas, pal: { ...GENIO.pal, b: color } }, `mk:${color}`)
// Los iconos pixelados de la franja (los de la maqueta, it2_comun.PIXEL_ICOS del rediseño), los de sus menús de Más y
// Commit y la cabeza de Doc
export const ICONOS_FRANJA: Record<string, Dibujo> = {
  fotos: { filas: ['....####....', '.##########.', '############', '####oooo####', '###oowwoo###', '###owwwwo###', '###oowwoo###',
    '####oooo####', '############', '.##########.'], pal: { '#': '#e0b341', o: '#7a5a10', w: '#fff3c4' } },
  // la cámara con un más arriba a la derecha (Analizar Pro)
  fotosPro: { filas: ['....####.....s.', '.##########.sss', '############.s.', '####oooo####...', '###oowwoo###...', '###owwwwo###...',
    '###oowwoo###...', '####oooo####...', '############...', '.##########....'], pal: { '#': '#e0b341', o: '#7a5a10', w: '#fff3c4', s: '#bdf0ff' } },
  musica: { filas: ['....######', '....######', '....#....#', '....#....#', '....#....#', '..###..###', '.####.####', '.####.####',
    '..##...##.'], pal: { '#': '#5aa9ff' } },
  videos: { filas: ['############', '#ww#ww#ww#w#', '############', '............', '############', '#..........#', '#..rr......#',
    '#..rrrr....#', '#..rr......#', '#..........#', '############'], pal: { '#': '#ee5a5a', w: '#ffffff', r: '#ffffff' } },
  recortes: { filas: ['..#........', '..#........', '#########..', '..#.....#..', '..#.....#..', '..#.....#..', '..#.....#..',
    '..#.....#..', '..#########', '........#..', '........#..'], pal: { '#': '#a78bfa' } },
  push: { filas: ['.....#.....', '....###....', '...#####...', '..#######..', '.....#.....', '.....#.....', '.....#.....',
    '.....#.....', '...........', '#.........#', '###########'], pal: { '#': '#d7dbe0' } },
  mas: { filas: ['......###.', '.....###..', '....###...', '...######.', '..######..', '.....##...', '....##....', '...##.....',
    '..##......', '.#........'], pal: { '#': '#d7dbe0' } },
  commit: { filas: ['.....#.....', '.....#.....', '.....#.....', '...#####...', '..##...##..', '..#.....#..', '..##...##..',
    '...#####...', '.....#.....', '.....#.....', '.....#.....'], pal: { '#': '#d7dbe0' } },
  iguala: { filas: ['.#.......#.', '###.....###', '.#.......#.', '.#.......#.', '..#.....#..', '...#...#...', '....#.#....',
    '.....#.....', '.....#.....', '....###....', '.....#.....'], pal: { '#': '#d7dbe0' } },
  igualar: { filas: ['.#...#...#.', '###.###.###', '.#...#...#.', '.#...#...#.', '.#...#...#.', '.#...#...#.', '.#...#...#.',
    '.#...#...#.', '.#...#...#.'], pal: { '#': '#d7dbe0' } },
  e2e: { filas: ['...#####...', '....#.#....', '....#.#....', '....#.#....', '...#...#...', '..#.....#..', '.#.......#.',
    '#.ggggggg.#', '#ggggggggg#', '#ggggggggg#', '.#########.'], pal: { '#': '#d7dbe0', g: '#5cd65c' } },
  tanda: { filas: ['..........#', '.........##', '........##.', '.......##..', '#.....##...', '##...##....', '.##.##.....',
    '..###......', '...#.......'], pal: { '#': '#5cd65c' } },
  ver: { filas: ['...#####...', '.##.....##.', '#...ppp...#', '#...ppp...#', '#...ppp...#', '.##.....##.', '...#####...'],
    pal: { '#': '#d7dbe0', p: '#7cc4ff' } },
  analizar: { filas: ['..####.....', '.#....#....', '#..ww..#...', '#.w....#...', '#......#...', '#......#...', '.#....#....',
    '..####.##..', '.......##..', '........##.', '.........##'], pal: { '#': '#e0b341', w: '#fff3c4' } },
  analizarPro: { filas: ['..####...s.', '.#....#.sss', '#..ww..#.s.', '#.w....#...', '#......#...', '#......#...',
    '.#....#....', '..####.##..', '.......##..', '........##.', '.........##'], pal: { '#': '#e0b341', w: '#fff3c4', s: '#bdf0ff' } },
  trabajo: { filas: ['....####....', '...#....#...', '############', '#bbbbbbbbbb#', '#bbbbbbbbbb#', '#####oo#####',
    '#bbbbbbbbbb#', '#bbbbbbbbbb#', '############'], pal: { '#': '#c8a27a', b: '#8d6b4a', o: '#f2d48a' } },
  estudios: { filas: ['.####.####.', '#....#....#', '#.##.#.##.#', '#....#....#', '#.##.#.##.#', '#....#....#', '#.##.#.##.#',
    '.####.####.', '.....#.....'], pal: { '#': '#7cc4ff' } },
  gustos: { filas: ['.###...###.', '#####.#####', '###########', '###########', '.#########.', '..#######..', '...#####...',
    '....###....', '.....#.....'], pal: { '#': '#f472b6' } },
  recargar: { filas: ['...#####...', '..#.....#.#', '.#.......##', '#.......###', '#..........', '..........#', '###.......#',
    '##.......#.', '#.#.....#..', '...#####...'], pal: { '#': '#d7dbe0' } },
  // compactar: una flecha que baja hasta la raya, la raya doble y otra que sube
  compact: { filas: ['....#....', '..#.#.#..', '...###...', '....#....', '#########', '.........', '#########', '....#....',
    '...###...', '..#.#.#..', '....#....'], pal: { '#': '#d7dbe0' } },
  doc: { filas: DOC.filas.slice(0, 10), pal: DOC.pal },
}
export const iconoFranja = (nombre: string) => {
  const d = ICONOS_FRANJA[nombre] ?? ICONOS_FRANJA.push!
  return quieto(d, `fr:${nombre}`)
}

export const spriteDe = (tag?: string): Sprite =>
  MARTYS.find(m => m.tag === tag) ?? RESERVA.find(m => m.tag === tag) ?? (MARTYS[0] as Sprite)

// Los píxeles juntados por tramos de una fila, para que el SVG pese poco
export function rects(filas: string[], pal: Record<string, string>, dx = 0, dy = 0): string {
  let out = ''
  filas.forEach((f, y) => {
    let x = 0
    while (x < f.length) {
      const ch = f[x] ?? '.'
      if (ch === '.' || !pal[ch]) {
        x += 1
        continue
      }
      let w = 1
      while (x + w < f.length && f[x + w] === ch) w += 1
      out += `<rect x="${x + dx}" y="${y + dy}" width="${w}" height="1" fill="${pal[ch]}"/>`
      x += w
    }
  })
  return out
}
const ancho = (filas: string[]) => Math.max(...filas.map(f => f.length))
const memo = new Map<string, string>()
function guardado(clave: string, fn: () => string): string {
  const ya = memo.get(clave)
  if (ya) return ya
  const s = fn()
  if (memo.size > 400) memo.clear()
  memo.set(clave, s)
  return s
}

// Un dibujo quieto, en su proporción
export const quieto = (d: Dibujo, clave: string) => guardado(`q:${clave}`, () =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ancho(d.filas)} ${d.filas.length}">` +
  `<g shape-rendering="crispEdges">${rects(d.filas, d.pal)}</g></svg>`)
export const marty = (tag?: string) => {
  const m = spriteDe(tag)
  return quieto(m, `m:${m.tag}`)
}
// El Marty atenuado de la fila de Decisión: el de una sesión sin nada pendiente
export const tenue = (tag?: string) => {
  const m = spriteDe(tag)
  return guardado(`t:${m.tag}`, () =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 ${m.filas.length}">` +
    `<g opacity="0.35" shape-rendering="crispEdges">${rects(m.filas, m.pal)}</g></svg>`)
}

// El Marty de la ficha, según su estado: bota y parpadea mientras trabaja, pregunta («?») si espera, grita («!») si está
// bloqueado y duerme con zetas si está parado (animación SMIL: el panel la mueve sin que el módulo redibuje)
function cierra(filas: string[]): string[] {
  const f = filas.slice()
  f.forEach((x, r) => {
    if (!x.includes('e')) return
    const arriba = f[r - 1] ?? ''
    if (r > 0 && arriba.includes('w') && !arriba.includes('e')) {
      f[r - 1] = arriba.replace(/w/g, 's')
      f[r] = x.replace(/[we]/g, 'k')
    } else f[r] = x.replace(/[we]/g, 's')
  })
  return f
}
export function martyVivo(tag: string | undefined, est: 'trabaja' | 'espera' | 'bloqueada' | 'parada'): string {
  const m = spriteDe(tag)
  return guardado(`v:${m.tag}:${est}`, () => {
    const cerradas = cierra(m.filas)
    const parpadeo = `<g opacity="0">${rects(cerradas, m.pal)}<animate attributeName="opacity" values="0;1;0" ` +
      'keyTimes="0;0.92;0.96" dur="3.2s" calcMode="discrete" repeatCount="indefinite"/></g>'
    let cuerpo = ''
    let encima = ''
    if (est === 'parada') {
      cuerpo = rects(cerradas, m.pal)
      encima = '<text x="13" y="3" font-size="4" font-weight="700" fill="#8a94a0" font-family="sans-serif">z' +
        '<animate attributeName="y" values="4;-1" dur="2.4s" repeatCount="indefinite"/>' +
        '<animate attributeName="opacity" values="1;0" dur="2.4s" repeatCount="indefinite"/></text>'
    } else if (est === 'trabaja') {
      cuerpo = '<animateTransform attributeName="transform" type="translate" values="0 1;0 0" dur="0.8s" ' +
        `calcMode="discrete" repeatCount="indefinite"/>${rects(m.filas, m.pal)}${parpadeo}`
    } else {
      const signo = est === 'espera' ? '?' : '!'
      const color = est === 'espera' ? '#f0a03c' : '#ef6b62'
      cuerpo = rects(m.filas, m.pal) + parpadeo
      encima = `<text x="14.2" y="3.6" font-size="5" font-weight="800" fill="${color}" font-family="sans-serif">${signo}` +
        '<animate attributeName="opacity" values="1;0.25;1" dur="1.4s" repeatCount="indefinite"/></text>'
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -3 19 20">' +
      `<g shape-rendering="crispEdges">${cuerpo}</g>${encima}</svg>`
  })
}

// Los dibujos nuevos de las fichas (Diseno-Personajes, cerrado el 26-oct), con el estado en la cara; si trabaja, bota. En
// pequeño (hasta 20 px), los de hoy. Sin dibujo nuevo (el de dos cabezas, el afro), el Marty de antes con su animación,
// que lleva dentro su marca (propia)
const DE_ESTADO = { trabaja: 'normal', espera: 'espera', bloqueada: 'bloqueo', parada: 'pausa' } as const
export type Figura = { svg: string; w: number; h: number; propia?: boolean }
// El lienzo es justo el dibujo, y una fila más abajo para el bote del que trabaja: así se centra en su recuadro y lo llena.
// La marca del estado va aparte, encima, en la esquina del recuadro (marcaFicha), sin mover al personaje (26-oct)
function figura(d: Dibujo, clave: string, est?: keyof typeof DE_ESTADO): Figura {
  const w = ancho(d.filas)
  const h = d.filas.length
  const svg = guardado(`fn:${clave}:${est === 'trabaja' ? 'bota' : ''}`, () => {
    let cuerpo = rects(d.filas, d.pal)
    if (est === 'trabaja') {
      cuerpo = '<animateTransform attributeName="transform" type="translate" values="0 1;0 0" dur="0.8s" calcMode="discrete" ' +
        `repeatCount="indefinite"/>${cuerpo}`
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h + 1}"><g shape-rendering="crispEdges">${cuerpo}</g></svg>`
  })
  return { svg, w, h: h + 1 }
}
export function fichaDe(tag: string | undefined, est: keyof typeof DE_ESTADO): Figura {
  const d = FICHAS[`${tag}:${DE_ESTADO[est]}`]
  if (d) return figura(d, `${tag}:${est}`, est)
  return { svg: martyVivo(tag, est), w: 19, h: 20, propia: true }
}
// La marca del estado de una ficha, encima de su recuadro, en la esquina: «?» si espera una decisión, «!» si está
// bloqueada y las zetas, subiendo, si está parada; nada si trabaja
export function marcaFicha(est: keyof typeof DE_ESTADO): string | null {
  if (est === 'espera') return marca('interroga', '#f0a03c')
  if (est === 'bloqueada') return marca('exclama', '#ef6b62')
  if (est !== 'parada') return null
  return guardado('zetas', () => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
    '<text x="7" y="20" font-size="13" font-weight="800" fill="#8a94a0" font-family="sans-serif">z' +
    '<animate attributeName="y" values="22;9" dur="2.4s" repeatCount="indefinite"/>' +
    '<animate attributeName="opacity" values="1;0" dur="2.4s" repeatCount="indefinite"/></text>' +
    '<text x="13" y="12" font-size="9" font-weight="800" fill="#8a94a0" font-family="sans-serif">z' +
    '<animate attributeName="y" values="14;3" dur="2.4s" begin="1.2s" repeatCount="indefinite"/>' +
    '<animate attributeName="opacity" values="1;0" dur="2.4s" begin="1.2s" repeatCount="indefinite"/></text></svg>')
}
// Doc, según cómo van todas (it-5): RC3 si alguna espera una decisión, RC5 si están todas paradas, RA (cabreado)
// si hay algún bloqueo y, si no, RC1 y RC4, alternando de vez en cuando
export type CaraDoc = 'normal' | 'normal2' | 'espera' | 'paradas' | 'bloqueo'
export const docDe = (k: CaraDoc): Figura => figura(FICHAS[`doc:${k}`] as Dibujo, `doc:${k}`)
// La cabeza de un personaje, para su pestaña: las filas de arriba de su dibujo de ficha, sin lo vacío de alrededor (y,
// si se dice, solo de una columna a otra, como sin la mano de Trabajador o la cola de Copito, y sin algunos píxeles
// sueltos, de una fila y de una columna a otra, como la copa de Liz), a su tamaño: un píxel por píxel, para que no salga
// borroso (26-oct: «como la de Doc»)
type Corte = { desde?: number; hasta?: number; sin?: [number, number, number?][] }
function recorte(d: Dibujo, filas: number, o: Corte = {}): Dibujo {
  const fuera = (x: number, y: number) =>
    x < (o.desde ?? 0) || (o.hasta !== undefined && x >= o.hasta) ||
    !!o.sin?.some(([py, px, hastaX]) => py === y && x >= px && x <= (hastaX ?? px))
  const f0 = d.filas.slice(0, filas).map((f, y) => [...f].map((c, x) => (fuera(x, y) ? '.' : c)).join(''))
  // sin las filas vacías de arriba
  while (f0.length > 1 && !/[^.]/.test(f0[0] ?? '')) f0.shift()
  const xs = f0.flatMap(f => [...f].map((c, x) => (c === '.' ? -1 : x)).filter(x => x >= 0))
  const x0 = Math.min(...xs)
  const w = Math.max(...xs) - x0 + 1
  return { filas: f0.map(f => f.slice(x0, x0 + w).padEnd(w, '.')), pal: d.pal }
}
export function cabeza(clave: string, filas: number, o: Corte = {}): Figura {
  const r = recorte(FICHAS[clave] as Dibujo, filas, o)
  const svg = quieto(r, `cab:${clave}:${filas}:${o.desde ?? ''}:${o.hasta ?? ''}:${(o.sin ?? []).join(';')}`)
  return { svg, w: ancho(r.filas), h: r.filas.length }
}
// La cabeza del personaje de la sesión, para su pestaña (28-oct: «si la sesión es Verano, que sea la cabeza de
// Verano»), con el cuello de la camiseta, que deja ver su color: Marty y Azul solo se distinguen por ella
// (28-oct). En casi todos, hasta la fila 22 de su dibujo. Los que no: el Xenomarty, por las antenas; Liz, sin la copa de
// vino que lleva al lado, y los que no llevan camiseta, solo la cabeza: Copito, de perfil y sin la cola; Mr.
// Pompis, que es todo cabeza, hasta la boca; el robot de la mantequilla, hasta el cuello, y Michi, hasta la
// barbilla
const CABEZAS: Record<string, { filas: number } & Corte> = {
  'M-05': { filas: 25 },
  Liz: { filas: 22, sin: [[18, 23], [19, 20, 24], [20, 20, 24], [21, 21, 23]] },
  Copito: { filas: 14, desde: 16 },
  Pompis: { filas: 26 },
  Mantequillo: { filas: 16 },
  Michi: { filas: 21 },
  // de los nuevos (it-7), el astronauta, con la escafandra (dos filas más), y Pepinillo, sin cuello: la mitad de arriba
  Astronauta: { filas: 24 },
  Pepinillo: { filas: 20 },
}
export function cabezaDe(tag: string | undefined): Figura {
  const c = CABEZAS[tag ?? ''] ?? { filas: 22 }
  // y, si no se sabe quién es, la del Marty
  return FICHAS[`${tag}:normal`] ? cabeza(`${tag}:normal`, c.filas, c) : cabeza('M-01:normal', 22)
}
// Trabajador, Paloma mensajera y la pistola de portales, los de sus fichas
export const fijaDe = (k: 'genio' | 'pajaro' | 'pistola'): Figura => figura(FICHAS[k] as Dibujo, k)

// Las barras de las fichas: cuadritos redondeados, llenos hasta la fracción
// (`estira`: con su ancho y sin proporción fija, para que dibujoLleno lo encoja justo hasta llenar su hueco)
export function cuadritos(frac: number, color: string, n = 14, lado = 9, hueco = 3, estira = false): string {
  const llenos = frac > 0 ? Math.max(1, Math.min(n, Math.round(frac * n))) : 0
  return guardado(`c:${llenos}:${color}:${n}:${lado}:${estira ? 1 : 0}`, () => {
    let s = ''
    for (let i = 0; i < n; i += 1) {
      s += `<rect x="${i * (lado + hueco)}" y="0" width="${lado}" height="${lado}" rx="2" ` +
        `fill="${i < llenos ? color : 'rgba(128,128,128,0.22)'}"/>`
    }
    const w = n * (lado + hueco) - hueco
    return `<svg xmlns="http://www.w3.org/2000/svg"${estira ? ` width="${w}" height="${lado}" preserveAspectRatio="none"` : ''} viewBox="0 0 ${w} ${lado}">${s}</svg>`
  })
}
export const anchoCuadritos = (n = 14, lado = 9, hueco = 3) => n * (lado + hueco) - hueco

// Una barra lisa, con su pista
export function barra(frac: number, color: string, w: number, h = 6): string {
  const lleno = frac > 0 ? Math.max(h, Math.round(Math.min(1, frac) * w)) : 0
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" rx="${h / 2}" ` +
    `fill="rgba(128,128,128,0.22)"/>${lleno ? `<rect width="${lleno}" height="${h}" rx="${h / 2}" fill="${color}"/>` : ''}</svg>`
}

// La letra pixelada (5 × 7) del rótulo de la elegida: «ELEGIDO · M-02 WORK»
// Cada letra, sus siete filas de cinco
const LETRA: Record<string, string> = {
  A: '.###. #...# #...# ##### #...# #...# #...#', B: '####. #...# #...# ####. #...# #...# ####.',
  C: '.###. #...# #.... #.... #.... #...# .###.', D: '####. #...# #...# #...# #...# #...# ####.',
  E: '##### #.... #.... ####. #.... #.... #####', F: '##### #.... #.... ####. #.... #.... #....',
  G: '.###. #...# #.... #.### #...# #...# .####', H: '#...# #...# #...# ##### #...# #...# #...#',
  I: '.###. ..#.. ..#.. ..#.. ..#.. ..#.. .###.', J: '..### ...#. ...#. ...#. ...#. #..#. .##..',
  K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#', L: '#.... #.... #.... #.... #.... #.... #####',
  M: '#...# ##.## #.#.# #.#.# #...# #...# #...#', N: '#...# #...# ##..# #.#.# #..## #...# #...#',
  O: '.###. #...# #...# #...# #...# #...# .###.', P: '####. #...# #...# ####. #.... #.... #....',
  Q: '.###. #...# #...# #...# #.#.# #..#. .##.#', R: '####. #...# #...# ####. #.#.. #..#. #...#',
  S: '.#### #.... #.... .###. ....# ....# ####.', T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..',
  U: '#...# #...# #...# #...# #...# #...# .###.', V: '#...# #...# #...# #...# #...# .#.#. ..#..',
  W: '#...# #...# #...# #.#.# #.#.# #.#.# .#.#.', X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
  Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..', Z: '##### ....# ...#. ..#.. .#... #.... #####',
  0: '.###. #...# #..## #.#.# ##..# #...# .###.', 1: '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.',
  2: '.###. #...# ....# ...#. ..#.. .#... #####', 3: '##### ...#. ..#.. ...#. ....# #...# .###.',
  4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.', 5: '##### #.... ####. ....# ....# #...# .###.',
  6: '..##. .#... #.... ####. #...# #...# .###.', 7: '##### ....# ...#. ..#.. .#... .#... .#...',
  8: '.###. #...# #...# .###. #...# #...# .###.', 9: '.###. #...# #...# .#### ....# ...#. .##..',
  '-': '..... ..... ..... .###. ..... ..... .....', '·': '..... ..... ..... ..#.. ..... ..... .....',
  '.': '..... ..... ..... ..... ..... .##.. .##..', '?': '.###. #...# ....# ...#. ..#.. ..... ..#..',
  '!': '..#.. ..#.. ..#.. ..#.. ..#.. ..... ..#..', ':': '..... .##.. .##.. ..... .##.. .##.. .....',
  '/': '....# ....# ...#. ..#.. .#... #.... #....', '%': '##..# ##..# ...#. ..#.. .#... #..## #..##',
  '_': '..... ..... ..... ..... ..... ..... #####',
}
const sinTilde = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
export function pixelado(texto: string, color: string, escala = 2): { svg: string; w: number; h: number } {
  const t = sinTilde(texto)
  let x = 0
  let s = ''
  for (const ch of t) {
    if (ch === ' ') {
      x += 4
      continue
    }
    const g = (LETRA[ch] ?? LETRA['?'] ?? '').replace(/ /g, '')
    for (let i = 0; i < 35; i += 1) {
      if (g[i] === '#') s += `<rect x="${x + (i % 5)}" y="${Math.floor(i / 5)}" width="1" height="1"/>`
    }
    x += 6
  }
  const w = Math.max(1, x - 1)
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 7"><g fill="${color}" shape-rendering="crispEdges">${s}</g></svg>`,
    w: w * escala,
    h: 7 * escala,
  }
}

// La marca de las casillas grandes y de los avisos: un cuadrado de su color con «!» o «×» blanco, centrado
export function marca(tipo: 'exclama' | 'x' | 'interroga' | 'check', color: string): string {
  return guardado(`k:${tipo}:${color}`, () => {
    const signo = tipo === 'exclama' ? '<rect x="10.4" y="5" width="3.2" height="9.6" rx="1.6"/><circle cx="12" cy="18.4" r="1.9"/>'
      : tipo === 'x' ? '<polygon points="7.3,5.2 12,9.9 16.7,5.2 18.8,7.3 14.1,12 18.8,16.7 16.7,18.8 12,14.1 7.3,18.8 5.2,16.7 9.9,12 5.2,7.3"/>'
        : tipo === 'check' ? '<polygon points="5.2,12.6 7.4,10.4 10.2,13.2 16.6,6.8 18.8,9 10.2,17.6"/>'
          : '<text x="12" y="18" text-anchor="middle" font-size="16" font-weight="800" font-family="Inter, Segoe UI, sans-serif">?</text>'
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="${color}"/>` +
      `<g fill="#ffffff">${signo}</g></svg>`
  })
}

export const ICONOS: Record<string, string> = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  reloj: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  alerta: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
  carpeta: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  archivo: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
  enviar: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  rama: '<path d="M6 3v12"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  mensaje: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  rayo: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  calendario: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  terminal: '<path d="m4 17 6-6-6-6M12 19h8"/>',
  servidor: '<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01M6 18h.01"/>',
  agente: '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.14-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.14a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.14 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0z"/>',
  indicador: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  campana: '<path d="M10.27 21a2 2 0 0 0 3.46 0"/><path d="M3.26 15.33A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.67C19.41 13.96 18 12.5 18 8A6 6 0 0 0 6 8c0 4.5-1.41 5.96-2.74 7.33"/>',
  luna: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  usuarios: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  lista: '<path d="M3 12h.01M3 18h.01M3 6h.01M8 12h13M8 18h13M8 6h13"/>',
  grafica: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
  filtro: '<path d="M10 20a1 1 0 0 0 .55.9l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .52-1.34L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.74 1.67l7.22 7.99A2 2 0 0 1 10 14z"/>',
  copiar: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  enlace: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  ojo: '<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>',
  abrir: '<polygon points="6 3 20 12 6 21 6 3"/>',
  arriba: '<path d="m18 15-6-6-6 6"/>',
  abajo: '<path d="m6 9 6 6 6-6"/>',
  derecha: '<path d="m9 18 6-6-6-6"/>',
  izquierda: '<path d="m15 18-6-6 6-6"/>',
  parar: '<rect width="12" height="12" x="6" y="6" rx="2"/>',
  camara: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  borrar: '<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>',
}
export type Icono = keyof typeof ICONOS | string
export const icono = (nombre: Icono, color: string) => guardado(`i:${nombre}:${color}`, () =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="${color}" stroke-width="2" ` +
  `stroke-linecap="round" stroke-linejoin="round">${ICONOS[nombre] ?? ''}</g></svg>`)

// Una insignia redonda con su número (la de las Martys de la fila de Decisión y la de los avisos)
export const insignia = (n: number, color: string) => guardado(`n:${n}:${color}`, () =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7.5" fill="${color}"/>` +
  `<text x="8" y="11.6" text-anchor="middle" font-size="10" font-weight="700" fill="#1b1b1f" ` +
  `font-family="Inter, Segoe UI, sans-serif">${n > 9 ? '9+' : n}</text></svg>`)
