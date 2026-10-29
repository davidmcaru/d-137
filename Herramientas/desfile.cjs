// Pinta el desfile de los personajes del README (Capturas\desfile.svg): los 25 de las sesiones en fila, con su nombre,
// pasando de derecha a izquierda sin fin y dando saltitos. Es un SVG con su animación dentro (GitHub la reproduce en el
// README) y se queda quieto si el sistema pide menos movimiento. Los dibujos salen del código del mod, como los de
// Dibujos (dibujos.cjs): cada uno, un trazado por color, a 3 píxeles por píxel.
// Sin nada instalado: solo Node. Uso: node desfile.cjs
const fs = require('fs')
const path = require('path')
const { FICHAS, TAGS, nombreDe } = require('./dibujos.cjs')

const SALIDA = path.join(__dirname, '..', 'Capturas', 'desfile.svg')
const ANCHO = 880
const ALTO = 150
const ESC = 3
const HUECO = 26
const PIES = 112
const FONDO = '#0a0a0a'
const CIAN = '#bdf0ff'
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')

// Un dibujo en trazados, uno por color: cada tramo de una fila, un rectángulo de un píxel de alto
function trazados(d) {
  const porColor = new Map()
  d.filas.forEach((f, y) => {
    let x = 0
    while (x < f.length) {
      const ch = f[x]
      const color = d.pal[ch]
      let n = 1
      while (x + n < f.length && f[x + n] === ch) n += 1
      if (color) porColor.set(color, `${porColor.get(color) ?? ''}M${x} ${y}h${n}v1h-${n}z`)
      x += n
    }
  })
  return [...porColor].map(([c, dd]) => `<path fill="${c}" d="${dd}"/>`).join('')
}

const gente = TAGS.map((tag, i) => {
  const d = FICHAS[`${tag}:normal`]
  const w = Math.max(...d.filas.map(f => f.length))
  const h = d.filas.length
  const nombre = nombreDe(tag)
  return { i, nombre, w, h, def: `<g id="p${i}">${trazados(d)}</g>`, celda: Math.max(w * ESC, nombre.length * 7.4) + HUECO }
})
const tramo = Math.round(gente.reduce((s, g) => s + g.celda, 0))
const copias = Math.ceil(ANCHO / tramo) + 1
let x = 0
const fila = []
for (let k = 0; k < copias; k += 1) {
  for (const g of gente) {
    const cx = x + g.celda / 2
    const sx = Math.round(cx - (g.w * ESC) / 2)
    fila.push(`<g transform="translate(${sx} ${PIES - g.h * ESC})"><g class="b${g.i % 2}">` +
      `<use href="#p${g.i}" transform="scale(${ESC})"/></g></g>` +
      `<text x="${cx.toFixed(1)}" y="${PIES + 22}">${esc(g.nombre)}</text>`)
    x += g.celda
  }
}
const segundos = Math.round(tramo / 40)
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO}" height="${ALTO}" viewBox="0 0 ${ANCHO} ${ALTO}" role="img" aria-label="Los ${gente.length} personajes de D-137, en fila: ${esc(gente.map(g => g.nombre).join(', '))}">
<style>text{font:600 12px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;fill:#b0b0b0;text-anchor:middle}
@keyframes cinta{from{transform:translateX(0)}to{transform:translateX(-${tramo}px)}}.cinta{animation:cinta ${segundos}s linear infinite}
@keyframes salto{0%{transform:translateY(0)}50%{transform:translateY(-3px)}}.b0,.b1{animation:salto .9s steps(1,end) infinite}.b1{animation-delay:-.45s}
@media (prefers-reduced-motion:reduce){.cinta,.b0,.b1{animation:none}}</style>
<defs>${gente.map(g => g.def).join('')}
<linearGradient id="suelo" x1="0" x2="1"><stop offset="0" stop-color="${CIAN}" stop-opacity="0"/><stop offset=".5" stop-color="${CIAN}" stop-opacity=".55"/><stop offset="1" stop-color="${CIAN}" stop-opacity="0"/></linearGradient>
<linearGradient id="izq" x1="0" x2="1"><stop offset="0" stop-color="${FONDO}"/><stop offset="1" stop-color="${FONDO}" stop-opacity="0"/></linearGradient>
<linearGradient id="der" x1="0" x2="1"><stop offset="0" stop-color="${FONDO}" stop-opacity="0"/><stop offset="1" stop-color="${FONDO}"/></linearGradient>
<clipPath id="caja"><rect width="${ANCHO}" height="${ALTO}" rx="14"/></clipPath></defs>
<g clip-path="url(#caja)"><rect width="${ANCHO}" height="${ALTO}" fill="${FONDO}"/>
<rect x="0" y="${PIES + 1}" width="${ANCHO}" height="2" fill="url(#suelo)"/>
<g class="cinta">${fila.join('')}</g>
<rect width="70" height="${ALTO}" fill="url(#izq)"/><rect x="${ANCHO - 70}" width="70" height="${ALTO}" fill="url(#der)"/></g>
</svg>
`
fs.mkdirSync(path.dirname(SALIDA), { recursive: true })
fs.writeFileSync(SALIDA, svg)
console.log(`${gente.length} personajes, una vuelta cada ${segundos} s, ${(svg.length / 1024).toFixed(0)} KB, en ${SALIDA}`)
