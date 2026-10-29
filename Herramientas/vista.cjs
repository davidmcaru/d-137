// Vista previa aproximada del panel D-137: lee los árboles que imprime la prueba (líneas «ARBOL:<nombre>:<json>») y los
// pinta como HTML con el aspecto oscuro de la app (cajas, textos, botones nativos, Svg), para revisarlos antes de
// instalar. No es la app: los botones y los tamaños son una aproximación
const fs = require('fs')
const path = require('path')
const { createRequire } = require('module')
// Playwright: el de esta carpeta (npm i playwright) o el de la que diga PLAYWRIGHT_DIR, la de un proyecto que ya lo tenga
const req = createRequire(path.join(process.env.PLAYWRIGHT_DIR || __dirname, 'package.json'))
const { chromium } = req('playwright')

const AQUI = process.cwd()
const ENTRADA = process.argv[2] || path.join(AQUI, 'prueba1.txt')
const SALIDA = process.argv[3] || path.join(AQUI, 'vista')
fs.mkdirSync(SALIDA, { recursive: true })

const TEMA = { text: '#e8e6e3', inactive: '#9a9a96', subtle: '#3d3d3a', suggestion: '#b1b9f9', success: '#4eba65', error: '#ff6b80',
  warning: '#ffc107', autoAccept: '#af87ff', inverseText: '#1b1b1f' }
const color = c => (c ? TEMA[c] || c : undefined)
// Medido en sus capturas del escritorio (26-oct): los pasos salen más anchos que en la terminal
const PASO = { xs: 7, sm: 11, md: 16, lg: 20, xl: 26 }
const esp = v => (v === undefined ? undefined : typeof v === 'number' ? `${v * 8}px` : `${PASO[v] ?? 6}px`)
const ancho = v => (v === undefined ? undefined : typeof v === 'number' ? `${v * 7.6}px` : v)
const TAM = { caption: 11.5, footnote: 12.5, body: 14, heading: 16, title: 19 }
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function estiloTexto(p) {
  const s = []
  if (p.color) s.push(`color:${color(p.color)}`)
  if (p.backgroundColor) s.push(`background:${color(p.backgroundColor)}`)
  if (p.size) s.push(`font-size:${TAM[p.size] || 13}px`)
  const w = p.weight || (p.bold ? 'semibold' : undefined)
  if (w) s.push(`font-weight:${{ regular: 400, medium: 500, semibold: 600, bold: 700 }[w] || 400}`)
  if (p.mono) s.push('font-family:Consolas,monospace')
  if (p.tabular) s.push('font-variant-numeric:tabular-nums')
  if (p.dimColor) s.push('opacity:.6')
  if (p.wrap && p.wrap.startsWith('truncate')) s.push('white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;max-width:100%')
  return s.join(';')
}
function pinta(n) {
  if (n === null || n === undefined || n === false) return ''
  if (typeof n === 'string' || typeof n === 'number') return esc(n)
  if (Array.isArray(n)) return n.map(pinta).join('')
  const p = n.props || {}
  const hijos = (n.children || []).map(pinta).join('')
  switch (n.type) {
    case 'Box': {
      const s = ['display:' + (p.display === 'none' ? 'none' : 'flex'), `flex-direction:${p.flexDirection || 'row'}`]
      if (p.gap !== undefined) s.push(`gap:${esp(p.gap)}`)
      if (p.columnGap !== undefined) s.push(`column-gap:${esp(p.columnGap)}`)
      if (p.rowGap !== undefined) s.push(`row-gap:${esp(p.rowGap)}`)
      if (p.flexWrap) s.push(`flex-wrap:${p.flexWrap}`)
      if (p.flexGrow !== undefined) s.push(`flex-grow:${p.flexGrow}`)
      if (p.flexShrink !== undefined) s.push(`flex-shrink:${p.flexShrink}`)
      if (p.alignItems) s.push(`align-items:${p.alignItems}`)
      if (p.justifyContent) s.push(`justify-content:${p.justifyContent}`)
      if (p.width !== undefined) s.push(`width:${ancho(p.width)}`)
      if (p.minWidth !== undefined) s.push(`min-width:${ancho(p.minWidth)}`)
      if (p.padding !== undefined) s.push(`padding:${esp(p.padding)}`)
      if (p.paddingX !== undefined) s.push(`padding-left:${esp(p.paddingX)};padding-right:${esp(p.paddingX)}`)
      if (p.paddingY !== undefined) s.push(`padding-top:${esp(p.paddingY)};padding-bottom:${esp(p.paddingY)}`)
      if (p.paddingLeft !== undefined) s.push(`padding-left:${esp(p.paddingLeft)}`)
      if (p.paddingRight !== undefined) s.push(`padding-right:${esp(p.paddingRight)}`)
      if (p.paddingTop !== undefined) s.push(`padding-top:${esp(p.paddingTop)}`)
      if (p.paddingBottom !== undefined) s.push(`padding-bottom:${esp(p.paddingBottom)}`)
      if (p.borderStyle) s.push(`border:1px ${p.borderStyle === 'dashed' ? 'dashed' : 'solid'} ${color(p.borderColor) || '#3d3d3a'};border-radius:8px`)
      if (p.backgroundColor) s.push(`background:${color(p.backgroundColor)};border-radius:8px`)
      if (p.position === 'absolute') s.push('position:absolute' + ['top', 'left', 'right', 'bottom'].filter(k => p[k] !== undefined).map(k => `;${k}:${p[k] * 8}px`).join(''))
      else s.push('position:relative')
      s.push('box-sizing:border-box')
      return `<div style="${s.join(';')}">${hijos}</div>`
    }
    case 'Text':
      return `<span style="${estiloTexto(p)}">${hijos}</span>`
    case 'Button': {
      // El escritorio pinta el texto del botón sin los estilos de sus Text (visto en sus capturas)
      const dentro = esc(p.label || (n.children || []).map(c => (typeof c === 'string' ? c : (c.children || []).join(''))).join(''))
      const clase = p.plain ? 'plano' : p.variant === 'primary' ? 'prim' : 'sec'
      return `<button class="${clase}"${p.dimColor ? ' style="opacity:.6"' : ''}>${dentro}</button>`
    }
    case 'Svg':
      // El escritorio quita los atributos de pintura del <svg> de fuera: aquí también, para ver lo mismo
      p.source = String(p.source).replace(/<svg([^>]*)>/, (m, attrs) => `<svg${attrs.replace(/\s(fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|shape-rendering)="[^"]*"/g, '')}>`)
      return `<img alt="" src="data:image/svg+xml;utf8,${encodeURIComponent(p.source)}" ${p.width ? `width="${p.width}"` : ''} ${p.height ? `height="${p.height}"` : ''} style="max-width:100%;flex:none;image-rendering:pixelated">`
    case 'Input':
      return `<input placeholder="${esc(p.placeholder || '')}" value="${esc(p.value || '')}">`
    case 'Select':
      return `<select>${(p.options || []).map(o => `<option ${o.value === p.value ? 'selected' : ''}>${esc(o.label || o.value)}</option>`).join('')}</select>`
    default:
      return hijos
  }
}

const CSS = `body{margin:0;background:#141413;font:14px "Segoe UI",Inter,system-ui,sans-serif;color:#f5f4ef}
.panel{width:480px;background:#262624;border-left:1px solid #2c2c2a;padding:12px 14px 18px;box-sizing:border-box}
.cab{display:flex;justify-content:space-between;color:#c9c9c4;font-weight:600;margin:-2px 0 10px}
button{font:inherit;font-size:13.5px;border-radius:7px;padding:4px 10px;cursor:pointer;white-space:nowrap}
button.sec{background:#3a3936;color:#f5f4ef;border:0}
button.prim{background:#f4f3ee;color:#1b1b1f;border:0;font-weight:500}
button.plano{background:none;border:0;padding:0;color:#f5f4ef;text-align:left;font-size:14px}
input{flex:1;width:100%;background:#151514;border:1px solid #3d3d3a;border-radius:6px;color:#e8e6e3;padding:4px 8px;font:inherit;box-sizing:border-box}
select{background:#2c2c2a;color:#e8e6e3;border:1px solid #464643;border-radius:6px;font:inherit;font-size:12px;padding:2px 4px}
.franja{width:900px;background:#1e1e1c;padding:10px 14px;box-sizing:border-box}`

;(async () => {
  const texto = fs.readFileSync(ENTRADA, 'utf8')
  const arboles = [...texto.matchAll(/^ARBOL:([a-z-]+):(.*)$/gm)].map(m => [m[1], JSON.parse(m[2])])
  const navegador = await chromium.launch({ channel: 'chrome' })
  const pagina = await navegador.newPage({ viewport: { width: 940, height: 900 }, deviceScaleFactor: 1 })
  for (const [nombre, arbol] of arboles) {
    const franja = nombre === 'franja'
    const html = `<!doctype html><meta charset="utf-8"><style>${CSS}</style>` +
      (franja ? `<div class="franja" id="x">${pinta(arbol)}</div>`
        : `<div class="panel" id="x"><div class="cab"><span>D-137</span><span>⤢ ✕</span></div>${pinta(arbol)}</div>`)
    await pagina.setContent(html)
    await pagina.waitForTimeout(150)
    const caja = await pagina.locator('#x').boundingBox()
    const destino = path.join(SALIDA, `${nombre}.png`)
    await pagina.screenshot({ path: destino, clip: { x: 0, y: 0, width: Math.ceil(caja.width), height: Math.ceil(caja.height) }, fullPage: true })
    console.log(destino)
  }
  await navegador.close()
})()
