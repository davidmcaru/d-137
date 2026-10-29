// Pinta en imagen todos los dibujos del mod, en la carpeta Dibujos del repo. El mod no usa imágenes: sus dibujos son
// rejillas de píxeles escritas en su código (d-137\hooks\personajes.ts, martys.ts y dibujos.ts). Esto las lee de ahí y
// saca:
// - Personajes\: los personajes de las sesiones, cada uno con sus cuatro estados (trabajando, esperando, bloqueado y
//   pausado), la cabeza de su pestaña y su dibujo pequeño de las casillas;
// - Otros\: las caras de Doc, Paloma mensajera, Trabajador, la pistola de portales y los iconos de la franja;
// - Dibujos.html, para verlos todos juntos, con su nombre.
// Lo que lee del código se lo da también a quien lo pida con require.
// Sin nada instalado: solo Node. Uso: node dibujos.cjs (o doble clic en «Rehacer dibujos.cmd»)
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const MOD = path.join(__dirname, '..')
const HOOKS = path.join(MOD, 'd-137', 'hooks')
const SALIDA = path.join(MOD, 'Dibujos')
const FONDO = '#262624'
const ESC = 4

const lee = f => fs.readFileSync(path.join(HOOKS, f), 'utf8').replace(/\r\n/g, '\n')
// Un literal de JS del código del mod (un objeto o una lista, sin sus tipos ni sus comentarios), evaluado
const literal = (texto, apertura, ambito = {}) => {
  const i = texto.indexOf(apertura)
  if (i < 0) throw new Error(`No encuentro ${apertura}`)
  const desde = texto.indexOf('=', i) + 1
  let n = 0
  let fin = desde
  for (let j = desde; j < texto.length; j += 1) {
    const c = texto[j]
    if (c === '{' || c === '[') n += 1
    else if (c === '}' || c === ']') {
      n -= 1
      if (n === 0) {
        fin = j + 1
        break
      }
    }
  }
  const cuerpo = texto.slice(desde, fin).replace(/^\s*\/\/.*$/gm, '')
  return Function(...Object.keys(ambito), `return (${cuerpo})`)(...Object.values(ambito))
}

const personajes = lee('personajes.ts')
const FICHAS = literal(personajes, 'export const FICHAS')
const RESERVA = literal(personajes, 'export const RESERVA')
const MARTYS = literal(lee('martys.ts'), 'export const MARTYS')
const fichas = lee('fichas.ts')
const TAGS = literal(fichas, 'export const TAGS')
const NOMBRES = literal(fichas, 'const NOMBRES')
const dibujos = lee('dibujos.ts')
const DOC = literal(dibujos, 'export const DOC')
const PISTOLA = literal(dibujos, 'export const PISTOLA')
const ICONOS_FRANJA = literal(dibujos, 'export const ICONOS_FRANJA', { DOC })
const CABEZAS = literal(dibujos, 'const CABEZAS')
const nombreDe = tag => NOMBRES[tag] ?? tag

// La cabeza de una pestaña, como cabeza y cabezaDe en dibujos.ts: las filas de arriba de su dibujo de ficha, sin lo de
// alrededor
function recorte(d, filas, o = {}) {
  const fuera = (x, y) => x < (o.desde ?? 0) || (o.hasta !== undefined && x >= o.hasta) ||
    (o.sin ?? []).some(([py, px, hx]) => py === y && x >= px && x <= (hx ?? px))
  const f0 = d.filas.slice(0, filas).map((f, y) => [...f].map((ch, x) => (fuera(x, y) ? '.' : ch)).join(''))
  while (f0.length > 1 && !/[^.]/.test(f0[0])) f0.shift()
  const xs = f0.flatMap(f => [...f].map((ch, x) => (ch === '.' ? -1 : x)).filter(x => x >= 0))
  const x0 = Math.min(...xs)
  const w = Math.max(...xs) - x0 + 1
  return { filas: f0.map(f => f.slice(x0, x0 + w).padEnd(w, '.')), pal: d.pal }
}
const cabeza = (clave, filas, o = {}) => recorte(FICHAS[clave], filas, o)
// la del personaje de la sesión, en la pestaña Sesión; si no se sabe quién es, la del Marty
function cabezaDe(tag) {
  const c = CABEZAS[tag] ?? { filas: 22 }
  return FICHAS[`${tag}:normal`] ? cabeza(`${tag}:normal`, c.filas, c) : cabeza('M-01:normal', 22)
}
const pequenoDe = tag => MARTYS.find(m => m.tag === tag) ?? RESERVA.find(m => m.tag === tag)

// ---- Pintar: una lámina con varios dibujos, en fila, alineados abajo, a ESC píxeles por píxel ----
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))
function lamina(piezas, hueco = 12, margen = 12) {
  const tam = piezas.map(d => ({ w: Math.max(...d.filas.map(f => f.length)) * ESC, h: d.filas.length * ESC }))
  const W = margen * 2 + tam.reduce((s, t) => s + t.w, 0) + hueco * (piezas.length - 1)
  const H = margen * 2 + Math.max(...tam.map(t => t.h))
  const img = Buffer.alloc(W * H * 4)
  const [r0, g0, b0] = rgb(FONDO)
  for (let i = 0; i < W * H; i += 1) img.set([r0, g0, b0, 255], i * 4)
  let x0 = margen
  piezas.forEach((d, n) => {
    const y0 = H - margen - tam[n].h
    d.filas.forEach((f, y) => [...f].forEach((ch, x) => {
      const c = d.pal[ch]
      if (!c) return
      const [r, g, b] = rgb(c)
      for (let dy = 0; dy < ESC; dy += 1) {
        for (let dx = 0; dx < ESC; dx += 1) img.set([r, g, b, 255], ((y0 + y * ESC + dy) * W + x0 + x * ESC + dx) * 4)
      }
    }))
    x0 += tam[n].w + hueco
  })
  return png(W, H, img)
}
function png(w, h, rgba) {
  const filas = Buffer.alloc((w * 4 + 1) * h)
  for (let y = 0; y < h; y += 1) rgba.copy(filas, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4)
  const trozo = (tipo, datos) => {
    const largo = Buffer.alloc(4)
    largo.writeUInt32BE(datos.length)
    const td = Buffer.concat([Buffer.from(tipo), datos])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(zlib.crc32(td) >>> 0)
    return Buffer.concat([largo, td, crc])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr.set([8, 6, 0, 0, 0], 8)
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), trozo('IHDR', ihdr),
    trozo('IDAT', zlib.deflateSync(filas)), trozo('IEND', Buffer.alloc(0))])
}

// ---- Escribir ----
function escribir() {
  fs.rmSync(path.join(SALIDA, 'Personajes'), { recursive: true, force: true })
  fs.rmSync(path.join(SALIDA, 'Otros'), { recursive: true, force: true })
  fs.mkdirSync(path.join(SALIDA, 'Personajes'), { recursive: true })
  fs.mkdirSync(path.join(SALIDA, 'Otros'), { recursive: true })
  const archivo = s => s.replace(/[\\/:*?"<>|]/g, '-')
  const ESTADOS = [['normal', 'trabajando'], ['espera', 'esperando'], ['bloqueo', 'bloqueado'], ['pausa', 'pausado']]
  const filas = []
  TAGS.forEach((tag, i) => {
    const piezas = ESTADOS.map(([e]) => FICHAS[`${tag}:${e}`]).filter(Boolean)
    const peq = pequenoDe(tag)
    const nombre = `${String(i + 1).padStart(2, '0')} ${archivo(nombreDe(tag))}.png`
    fs.writeFileSync(path.join(SALIDA, 'Personajes', nombre), lamina([...piezas, cabezaDe(tag), ...(peq ? [peq] : [])]))
    filas.push({ tag, nombre: nombreDe(tag), img: `Personajes/${nombre}`, estados: piezas.length, peq: !!peq })
  })
  const otros = [
    ['Doc, normal', ['doc:normal', 'doc:normal2']], ['Doc, alguna espera una decisión', ['doc:espera']],
    ['Doc, todas paradas', ['doc:paradas']], ['Doc, algún bloqueo', ['doc:bloqueo']], ['Paloma mensajera', ['pajaro']],
    ['Trabajador', ['genio']], ['La pistola de portales', ['pistola']],
  ].map(([titulo, claves]) => {
    const nombre = `${archivo(titulo)}.png`
    fs.writeFileSync(path.join(SALIDA, 'Otros', nombre), lamina(claves.map(k => FICHAS[k])))
    return { titulo, img: `Otros/${nombre}` }
  })
  const iconos = Object.keys(ICONOS_FRANJA)
  fs.writeFileSync(path.join(SALIDA, 'Otros', 'Iconos de la franja.png'), lamina([...iconos.map(k => ICONOS_FRANJA[k]), PISTOLA], 16))
  otros.push({ titulo: `Iconos de la franja (${iconos.join(', ')}) y la pistola pequeña de la pestaña Cuota`, img: 'Otros/Iconos de la franja.png' })

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>Dibujos de D-137</title>
<style>
:root{color-scheme:dark}body{margin:0;background:#1a1a18;color:#e8e6e3;font:15px Inter,"Segoe UI",system-ui,sans-serif}
main{max-width:1100px;margin:0 auto;padding:24px 16px 48px}h1{font-size:24px;margin:0 0 6px}h2{font-size:18px;margin:36px 0 12px}
p{color:#a8a69f;margin:0 0 10px;line-height:1.5}.f{display:flex;flex-wrap:wrap;align-items:center;gap:6px 18px;padding:12px 0;border-top:1px solid #33332f}
.n{width:230px}.n b{display:block;font-size:16px}.n span{color:#a8a69f;font-size:13px}img{display:block;max-width:100%;image-rendering:pixelated;border-radius:8px}
code{font-family:Consolas,monospace;font-size:13px;color:#bdf0ff}
</style>
<main>
<h1>Los dibujos de D-137</h1>
<p>Todo lo que dibuja el mod, sacado de su código (<code>d-137\\hooks</code>), que es donde viven: el mod no usa imágenes.
Estas se rehacen con <code>Herramientas\\Rehacer dibujos.cmd</code>. Para cambiar un dibujo, su rejilla, en
<code>d-137\\hooks</code> (<code>personajes.ts</code>, <code>martys.ts</code> y <code>dibujos.ts</code>).</p>
<h2>Los personajes de las sesiones (${filas.length})</h2>
<p>Cada uno: trabajando, esperando, bloqueado y pausado; la cabeza de su pestaña; y su dibujo pequeño de las casillas.</p>
${filas.map((f, i) => `<div class="f"><div class="n"><b>${i + 1}. ${esc(f.nombre)}</b><span>código: ${esc(f.tag)}</span></div><img src="${encodeURI(f.img)}" alt="${esc(f.nombre)}"></div>`).join('\n')}
<h2>Doc, las fichas de las otras pestañas y la franja</h2>
${otros.map(o => `<div class="f"><div class="n"><b>${esc(o.titulo)}</b></div><img src="${encodeURI(o.img)}" alt="${esc(o.titulo)}"></div>`).join('\n')}
</main></html>
`
  fs.writeFileSync(path.join(SALIDA, 'Dibujos.html'), html)
  console.log(`${filas.length} personajes y ${otros.length} láminas más, en ${SALIDA}`)
  for (const f of filas) if (f.estados !== 4 || !f.peq) console.log(`  OJO: ${f.tag} tiene ${f.estados} estados${f.peq ? '' : ' y ningún dibujo pequeño'}`)
}

module.exports = { FICHAS, RESERVA, MARTYS, TAGS, PISTOLA, nombreDe, cabeza, cabezaDe, pequenoDe }
if (require.main === module) escribir()
