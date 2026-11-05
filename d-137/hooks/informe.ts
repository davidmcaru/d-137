// El informe del histórico (/historico; 1-nov): una página local, sin nada de fuera más que la letra, con las
// cifras de todas las sesiones que ha habido, una barra por mes y, en cada mes, lo que hizo cada sesión; y, en el chat, una
// línea por mes. De noche con cian o, si el sistema va en claro, en blanco con azul. Se descarga en PDF (2-nov): en A4
// vertical, en blanco y azul, con todos los meses desplegados y sus columnas en cada mes, y sin partir un mes en dos
// páginas si cabe en una. Arriba, el panel del total, con los meses como si fueran las sesiones
import type { Cuenta, TotalesHistorico } from '../types'
import { casi, cifra, dolares, hm, mesDe, millones, plural } from './comun'
import { diaDe } from './fichas'
import type { Mes } from './historico'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const archivos = (n: number) => cifra(Math.round(n), 0)
const media = (x: { usd: number; activa: number; estimado: boolean }) =>
  (x.activa >= 60000 ? casi(x.estimado, `${cifra(x.usd / (x.activa / 3600000), 2)} $/h`) : '—')
const nombreMes = (mes: string) => {
  const [a = 2026, m = 1] = mes.split('-').map(Number)
  return mesDe(new Date(a, m - 1, 15).getTime())
}

const CLARO = '--fondo: #fff; --caja: #f4f6f9; --caja2: #e3ebf3; --texto: #1a1a1a; --suave: #666; --borde: #ccc; --acento: #2570c2; --barra: #2570c2;'
const CSS = `
:root { --fondo: #0a0a0a; --caja: #151515; --caja2: #1a1a1a; --texto: #fff; --suave: #b0b0b0; --borde: #2a2a2a; --acento: #bdf0ff; --barra: #5dd5f0; }
@media (prefers-color-scheme: light) { :root { ${CLARO} } }
* { box-sizing: border-box; }
body { margin: 0; background: var(--fondo); color: var(--texto); font: 400 15px/1.5 Inter, 'Segoe UI', system-ui, sans-serif; }
main { max-width: 1120px; margin: 0 auto; padding: 48px 32px 64px; }
h1 { margin: 0; font-size: 40px; font-weight: 900; letter-spacing: -.02em; }
h1 b { color: var(--acento); font-weight: 900; }
.arriba { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }
.boton { flex: none; margin-top: 10px; padding: 10px 16px; border: 1px solid var(--acento); border-radius: 8px; background: none; color: var(--acento);
  font-family: inherit; font-size: 14px; font-weight: 600; line-height: 1; text-decoration: none; cursor: pointer; }
.boton:hover { background: var(--acento); color: var(--fondo); }
.sub { margin: 4px 0 32px; color: var(--suave); }
.cifras { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px; }
.cifra { background: var(--caja); border: 1px solid var(--borde); border-radius: 12px; padding: 20px; }
.cifra h2 { margin: 0 0 8px; font-size: 13px; font-weight: 600; color: var(--suave); }
.cifra strong { display: block; font: 800 26px/1.2 'JetBrains Mono', Consolas, monospace; letter-spacing: -.02em; white-space: nowrap; }
.cifra span { display: block; margin-top: 6px; font-size: 13px; color: var(--suave); }
.fila { display: grid; grid-template-columns: 96px minmax(120px, 1fr) repeat(7, 92px); gap: 8px; align-items: center; }
.cabeza { padding: 0 16px 8px 36px; font-size: 12px; color: var(--suave); }
.cabeza div:nth-child(n+3), .fila .n { text-align: right; }
.n { font-family: 'JetBrains Mono', Consolas, monospace; font-size: 13px; white-space: nowrap; }
details { background: var(--caja); border: 1px solid var(--borde); border-radius: 12px; margin-bottom: 8px; }
summary { list-style: none; cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 12px 16px; }
summary::-webkit-details-marker { display: none; }
summary::before { content: '▸'; color: var(--suave); width: 12px; }
details[open] summary::before { content: '▾'; }
summary .fila { flex: 1; min-width: 0; }
.mes { font-weight: 700; }
.barra { height: 8px; border-radius: 4px; background: var(--caja2); overflow: hidden; }
.barra i { display: block; height: 100%; border-radius: 4px; background: var(--barra); }
.dentro { padding: 0 16px 16px 36px; }
.dentro p { margin: 0 0 8px; font-size: 13px; color: var(--suave); }
table { width: 100%; border-collapse: collapse; }
th { text-align: right; font-size: 12px; font-weight: 400; color: var(--suave); padding: 4px 0 4px 16px; }
th:first-child, td:first-child { text-align: left; padding-left: 0; }
td { padding: 6px 0 6px 16px; border-top: 1px solid var(--borde); text-align: right; }
td:first-child { font-family: inherit; font-size: 14px; }
.nota { margin-top: 24px; font-size: 13px; color: var(--suave); }
@media (max-width: 1000px) { main { padding: 24px 16px; } .cifras { grid-template-columns: repeat(2, 1fr); } }
@page { size: A4 portrait; margin: 12mm; @bottom-right { content: counter(page) ' / ' counter(pages); font: 10px Inter, 'Segoe UI', sans-serif; color: #666; } }
@media print {
  :root { ${CLARO} }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  main { max-width: none; padding: 0; }
  .boton, summary::before { display: none; }
  h1 { font-size: 30px; }
  .sub { margin-bottom: 14px; font-size: 12px; }
  .cifras { grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 14px; }
  .cifra { padding: 10px 12px; border-radius: 8px; }
  .cifra h2 { margin-bottom: 4px; font-size: 11px; }
  .cifra strong { font-size: 17px; }
  .cifra span { margin-top: 4px; font-size: 10px; line-height: 1.3; }
  .fila { grid-template-columns: 58px minmax(36px, 1fr) 84px 76px 62px 52px 62px 46px 46px; gap: 6px; }
  .cabeza { padding: 6px 12px 3px; font-size: 10px; }
  .n { font-size: 10.5px; }
  .un-mes, details { break-inside: avoid; }
  details { margin-bottom: 6px; border-radius: 8px; }
  summary { padding: 7px 12px; }
  .mes { font-size: 12px; }
  .dentro { padding: 0 12px 8px; }
  .dentro p { margin-bottom: 4px; font-size: 10.5px; }
  th { padding: 2px 0 2px 10px; font-size: 10px; }
  td { padding: 3px 0 3px 10px; line-height: 1.35; }
  td:first-child { font-size: 11.5px; }
  tr { break-inside: avoid; }
  .nota { margin-top: 12px; font-size: 10.5px; }
}
`

const fila = (nombre: string, s: { usd: number; tok: number; activa: number; archivos: number; estimado: boolean }) =>
  `<tr><td>${esc(nombre)}</td><td class="n">${casi(s.estimado, dolares(s.usd))}</td><td class="n">${millones(s.tok)}</td>` +
  `<td class="n">${hm(s.activa)}</td><td class="n">${media(s)}</td><td class="n">${archivos(s.archivos)}</td></tr>`
const CABEZA = '<div class="fila cabeza"><div>Mes</div><div></div><div>Coste</div><div>Media</div><div>Tokens</div><div>Activa</div><div>Abierta</div><div>Archivos</div><div>Sesiones</div></div>'
// Un bloque: su línea de cifras y, debajo, su tabla. El de cada mes, con una fila por sesión; y el del total, con una por mes
// (2-nov: los meses como si fueran las sesiones). En el PDF (`desplegado`), abierto, entero y con las columnas encima
function bloque(o: { titulo: string; c: Cuenta; n: number; frac?: number; primera: string; filas: string[]; desplegado: boolean; abierto?: boolean }) {
  const { c } = o
  return `${o.desplegado ? `<section class="un-mes">${CABEZA}<details open>` : `<details${o.abierto ? ' open' : ''}>`}<summary><div class="fila"><div class="mes">${o.titulo}</div>` +
    `${o.frac === undefined ? '<div></div>' : `<div class="barra"><i style="width:${o.frac * 100}%"></i></div>`}` +
    `<div class="n">${casi(c.estimado, dolares(c.usd))}</div><div class="n">${media(c)}</div><div class="n">${millones(c.tok)}</div>` +
    `<div class="n">${hm(c.activa)}</div><div class="n">${hm(c.abierta)}</div><div class="n">${archivos(c.archivos)}</div>` +
    `<div class="n">${o.n}</div></div></summary><div class="dentro">` +
    `<p>El rato más largo, ${hm(c.maxT)}; el que más costó, ${casi(c.estimado, dolares(c.maxUsd))}; el de más tokens, ${millones(c.maxTok)}.</p>` +
    `<table><thead><tr><th>${o.primera}</th><th>Coste</th><th>Tokens</th><th>Activa</th><th>Media</th><th>Archivos</th></tr></thead>` +
    `<tbody>${o.filas.join('')}</tbody></table></div></details>${o.desplegado ? '</section>' : ''}`
}

// La página. Con `desplegado`, la versión de la que sale el PDF: cada mes abierto y con sus columnas. Con `pdf` (en base64),
// el botón lo descarga de un clic: va dentro de la página, que un enlace a otro archivo la abriría en vez de descargarlo.
// Sin él (no hay Chrome ni Edge), el botón abre la ventana de imprimir del navegador, que también guarda en PDF
export function informeHtml(meses: Mes[], t: TotalesHistorico, ahora: number, o: { desplegado?: boolean; pdf?: string } = {}): string {
  const mayor = Math.max(...meses.map(m => m.usd))
  const dia = new Date(ahora)
  const desplegado = o.desplegado === true
  const recientes = [...meses].reverse()
  const cifraEn = (titulo: string, valor: string, abajo: string) => `<section class="cifra"><h2>${titulo}</h2><strong>${valor}</strong><span>${abajo}</span></section>`
  const boton = o.pdf
    ? `<a class="boton" download="Histórico de Doc ${diaDe(ahora)}.pdf" href="data:application/pdf;base64,${o.pdf}">Descargar PDF</a>`
    : '<button class="boton" onclick="print()">Guardar en PDF</button>'
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Histórico de Doc</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=JetBrains+Mono:wght@400;800&display=swap">
<style>${CSS}</style></head><body><main>
<div class="arriba"><h1>Histórico de <b>Doc</b></h1>${boton}</div>
<p class="sub">${plural(t.n, 'sesión', 'sesiones')} desde ${mesDe(t.desde)}, también las cerradas y las borradas · a ${dia.getDate()} de ${mesDe(ahora)}</p>
<div class="cifras">
${cifraEn('Coste', casi(t.estimado, dolares(t.usd)), `El mayor rato, ${casi(t.estimado, dolares(t.maxUsd))} · ${media(t)}`)}
${cifraEn('Tokens', millones(t.tok), `El mayor rato, ${millones(t.maxTok)}`)}
${cifraEn('Horas', hm(t.activa), `Trabajando · ${hm(t.abierta)} abiertas · el mayor rato, ${hm(t.maxT)}`)}
${cifraEn('Archivos', archivos(t.archivos), 'Tocados entre todas')}
</div>
${desplegado ? '' : CABEZA}
${bloque({ titulo: 'Total', c: t, n: t.n, primera: 'Mes', filas: recientes.map(m => fila(nombreMes(m.mes), m)), desplegado, abierto: true })}
${recientes.map(m => bloque({ titulo: nombreMes(m.mes), c: m, n: m.sesiones.length, frac: mayor > 0 ? m.usd / mayor : 0, primera: 'Sesión',
    filas: m.sesiones.map(s => fila(s.nombre, s)), desplegado })).join('\n')}
${t.estimado ? '<p class="nota">≈ El coste de las sesiones que no llegaron a tener el mod no se apuntó: sale de lo que pesa lo que gastaron, a lo que vale en las demás.</p>' : ''}
</main><script>addEventListener('beforeprint', () => document.querySelectorAll('details').forEach(d => { d.open = true }))</script></body></html>
`
}

// Lo del chat: una línea por mes y el total
export function informeTexto(meses: Mes[], t: TotalesHistorico, ruta: string): string {
  const linea = (nombre: string, x: Mes | TotalesHistorico) =>
    `${nombre}: ${casi(x.estimado, dolares(x.usd))} · ${millones(x.tok)} · activa ${hm(x.activa)} · ${archivos(x.archivos)} archivos`
  return [`Histórico: ${plural(t.n, 'sesión', 'sesiones')} desde ${mesDe(t.desde)}.`, ...meses.map(m => linea(nombreMes(m.mes), m)),
    linea('Total', t), `Con cada sesión, en ${ruta}`].join('\n')
}
