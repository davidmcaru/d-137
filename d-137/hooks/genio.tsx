// La pestaña Activo, lo que sigue en marcha (antes «En marcha»): la ficha de Trabajador, que existe para cumplir una
// tarea y desaparecer, como los comandos; el cambio entre lo activo y lo acabado y los tipos en una fila (EF3); y un
// bloque por sesión con su Marty grande a la izquierda, compacto (iteraciones 7 a 10)
import type { RenderElement } from 'claude-code'

import type { Ficha, Tarea } from '../types'
import type { Acciones, Datos, El } from './comun'
import {
  abiertoDe, arriba, bloque3x3, confirmar, corto, dolares, duracion, ESTADOS, ficha, figuraEn, hace, millones, mini, mmss, plegar, tiempoO,
} from './comun'
import { boton, chip, etiqueta, filtro, mezcla, separador, T } from './kit'
import { fijaDe } from './dibujos'

export type Tipo = 'servidor' | 'comando' | 'agente'
export const TIPOS: Record<Tipo, { nombre: string; glifo: string; icono: string; texto: string; hex: string }> = {
  servidor: { nombre: 'Servidor', glifo: '▤', icono: 'servidor', texto: 'suggestion', hex: '#6cb6ff' },
  comando: { nombre: 'Comando', glifo: '>_', icono: 'terminal', texto: 'warning', hex: '#e6bd55' },
  agente: { nombre: 'Agente', glifo: '✦', icono: 'agente', texto: 'autoAccept', hex: '#b39ddb' },
}
// Un servidor se reconoce por su orden o por lo que escribe (una dirección local); lo demás que corre es un comando
export function tipoDe(t: Tarea): Tipo {
  if (t.tipo === 'agente') return 'agente'
  const todo = `${t.que} ${t.orden ?? ''} ${t.linea ?? ''}`
  return /\b(serve|server|servidor|vite|preview|http\.server|dev server|localhost:\d+|127\.0\.0\.1:\d+)\b/i.test(todo) ? 'servidor' : 'comando'
}
// Lo que lleva, si su última línea lo dice: «70 %», o «134 de 192»
export function progresoDe(linea?: string): number | null {
  if (!linea) return null
  const p = /(\d+(?:[.,]\d+)?)\s*%/.exec(linea)
  if (p) return Math.min(100, Number(p[1]!.replace(',', '.')))
  const de = /(\d+)\s*(?:de|of|\/)\s*(\d+)/i.exec(linea)
  if (de && Number(de[2]) > 0) return Math.min(100, Math.round((Number(de[1]) / Number(de[2])) * 100))
  return null
}
const url = (linea?: string) => /(https?:\/\/[^\s]+|(?:localhost|127\.0\.0\.1):\d+[^\s]*)/.exec(linea ?? '')?.[1]

type Cosa = { f: Ficha; t: Tarea; tipo: Tipo; mia: boolean }
export const idAcabada = (x: { f: Ficha; t: Tarea }) => `t:${x.f.id}:${x.t.id}`
export function tareasDe(d: Datos): { activas: Cosa[]; acabadas: Cosa[] } {
  const todas = [d.yo, ...d.otras].filter((f): f is Ficha => f !== null)
  const out: Cosa[] = []
  for (const f of todas) {
    const mia = f.id === d.yo?.id
    const lista = mia ? d.marcha : [...(f.marcha ?? []), ...(f.acabadas ?? [])]
    for (const t of lista) out.push({ f, t, tipo: tipoDe(t), mia })
  }
  const vistos = new Set(d.ui.vistos)
  return {
    activas: out.filter(x => !x.t.fin).sort((x, y) => y.t.desde - x.t.desde),
    acabadas: out.filter(x => x.t.fin && d.ahora - x.t.fin < 2 * 3600000 && !vistos.has(idAcabada(x)))
      .sort((x, y) => (y.t.fin ?? 0) - (x.t.fin ?? 0)),
  }
}

export function pestanaGenio(el: El, d: Datos, a: Acciones): RenderElement[] {
  const { Box, Text } = el
  const { activas, acabadas } = tareasDe(d)
  const bien = acabadas.filter(x => x.t.estado === 'completed').length
  const mal = acabadas.filter(x => x.t.estado !== 'completed' && x.t.estado !== 'killed').length
  const porTipo = (tp: Tipo) => activas.filter(x => x.tipo === tp)
  const masLarga = (tp: Tipo) => {
    const l = porTipo(tp)
    if (!l.length) return '—'
    const ms = Math.max(...l.map(x => d.ahora - x.t.desde))
    return duracion(ms)
  }
  const total = Math.max(1, activas.length)
  const titular: [string, string] = mal
    ? [mal === 1 ? '1 falló' : `${mal} fallaron`, ESTADOS.bloqueada.texto]
    : activas.length ? [`${activas.length} en marcha`, ESTADOS.trabaja.texto] : ['nada en marcha', 'inactive']

  // Desplegada (28-oct), el bloque de 3 × 3 de Marty, pero de los subagentes de todas las sesiones: lo que han
  // tardado, lo que han costado (su parte del coste de su sesión, por lo que pesan) y sus tokens; en total, el que más y
  // de media por agente; y en la esquina, los que acabaron mal. Las que llevan el mod de antes no traen lo suyo
  const abiertoF = abiertoDe(d, 'fichaGenio')
  const ags = [d.yo, ...d.otras].filter((f): f is Ficha => f !== null).flatMap(f => {
    const s = d.registros.find(r => r.id === f.id)?.sesion
    if (!s?.agentes) return []
    const porPeso = s.peso > 0 ? (f.usd ?? 0) / s.peso : 0
    return [{ g: s.agentes, usd: s.agentes.peso * porPeso, maxUsd: s.agentes.maxPeso * porPeso }]
  })
  const suma = (v: number[]) => v.reduce((s, x) => s + x, 0)
  const nAg = suma(ags.map(x => x.g.n))
  const hay = ags.length > 0
  const tiempoAg = suma(ags.map(x => x.g.tiempo))
  const usdAg = suma(ags.map(x => x.usd))
  const bloque = bloque3x3(el, 'agentes', [
    [{ etiqueta: 'Total', valor: hay ? tiempoO(tiempoAg) : '—', color: T.t1 },
      { etiqueta: 'Total', valor: hay ? dolares(usdAg) : '—', color: T.morado },
      { etiqueta: 'Total', valor: hay ? millones(suma(ags.map(x => x.g.tok))) : '—', color: T.azul }],
    [{ etiqueta: 'Máx', valor: hay ? tiempoO(Math.max(...ags.map(x => x.g.maxT))) : '—', color: T.t1 },
      { etiqueta: 'Máx', valor: hay ? dolares(Math.max(...ags.map(x => x.maxUsd))) : '—', color: T.morado },
      { etiqueta: 'Máx', valor: hay ? millones(Math.max(...ags.map(x => x.g.maxTok))) : '—', color: T.azul }],
    [{ etiqueta: 'Media', valor: nAg ? tiempoO(tiempoAg / nAg) : '—', color: T.t1 },
      { etiqueta: 'Media', valor: nAg ? dolares(usdAg / nAg) : '—', color: T.morado },
      { etiqueta: 'Fallidos', valor: hay ? String(suma(ags.map(x => x.g.fallidos))) : '—', color: T.error }],
  ])
  const cabeza = ficha(el, {
    key: 'ficha',
    dibujo: figuraEn(el, fijaDe('genio'), 'Trabajador'),
    arriba: arriba(el, 'Trabajador', titular[0], titular[1]),
    derecha: (
      <Box key="cuentas" flexDirection="row" alignItems="center" gap="xs">
        {bien ? etiqueta(el, 'ok', String(bien), T.ok, { icono: 'check' }) : null}
        {mal ? etiqueta(el, 'mal', String(mal), T.error, { icono: 'x' }) : null}
        {plegar(el, 'fichaGenio', abiertoF, a)}
      </Box>
    ),
    nombre: activas.length ? `${activas.length} en marcha` : 'Nada en segundo plano',
    cols: d.cols,
    abajo: abiertoF ? bloque : undefined,
    filas: (['servidor', 'comando', 'agente'] as Tipo[]).map(tp => ({
      etiqueta: TIPOS[tp].nombre, frac: porTipo(tp).length / total, valor: masLarga(tp), color: TIPOS[tp].hex,
    })),
  })

  // Lo activo o lo acabado, y los tipos para filtrar
  const vista = d.ui.marchaVista === 'acabados' ? 'acabados' : 'activos'
  const tipo = (['servidor', 'comando', 'agente'] as string[]).includes(d.ui.marchaTipo) ? (d.ui.marchaTipo as Tipo) : null
  const base = vista === 'activos' ? activas : acabadas
  const lista = tipo ? base.filter(x => x.tipo === tipo) : base
  const barra = (
    <Box key="barra" flexDirection="row" alignItems="center" gap="xs" flexWrap="wrap">
      {filtro(el, 'v-activos', { texto: `Activos · ${activas.length}`, activo: vista === 'activos' }, () => a.ui('marchaVista', 'activos'))}
      {filtro(el, 'v-acabados', { texto: `Acabados · ${acabadas.length}`, activo: vista === 'acabados' }, () => a.ui('marchaVista', 'acabados'))}
      <Box flexGrow={1} />
      {vista === 'acabados' && acabadas.length
        ? boton(el, 'limpiar-acabados', { texto: 'Limpiar', alto: 26 }, () => a.limpiaAcabadas(acabadas.map(idAcabada)))
        : null}
      {(['servidor', 'comando', 'agente'] as Tipo[]).map(tp => {
        const cuantas = base.filter(x => x.tipo === tp).length
        return cuantas
          ? filtro(el, `t-${tp}`, { texto: String(cuantas), icono: TIPOS[tp].icono, color: TIPOS[tp].hex, activo: tipo === tp },
            () => a.ui('marchaTipo', tipo === tp ? '' : tp))
          : null
      })}
    </Box>
  )

  // Un bloque por sesión, con su Marty grande a la izquierda y lo suyo a la derecha
  const sesiones: Ficha[] = []
  for (const x of lista) if (!sesiones.includes(x.f)) sesiones.push(x.f)
  const bloques = sesiones.map(f => {
    const suyas = lista.filter(x => x.f === f)
    // NF1: la tarjeta de la sesión, con su Marty y su nombre sobre el fondo oscuro, a la izquierda y a toda la altura
    return (
      <Box key={`bl-${f.id}`} flexDirection="row" gap="sm" borderStyle="round" borderColor={T.borde} backgroundColor={T.tarjeta}
        paddingX="xs" paddingY="xs">
        <Box flexDirection="column" alignItems="center" justifyContent="center" minWidth={8} gap="xs" borderStyle="round"
          borderColor={T.marco} backgroundColor={T.marco} paddingX="xs" paddingY="xs">
          {mini(el, f.tag, 32)}
          <Text size="caption" weight="bold" color={T.t1}>{corto(f.rotulo, 8)}</Text>
        </Box>
        <Box flexDirection="column" flexGrow={1} minWidth={0} gap="xs" paddingY="xs" paddingRight="xs">
          {suyas.flatMap(({ t, tipo: tp, mia }, i) => {
            const ti = TIPOS[tp]
            const prog = progresoDe(t.linea)
            const enlace = url(t.linea)
            // el estado, en su pastilla: en marcha, con su punto (y lo que lleva, si lo dice); acabado, con su icono
            const estado = !t.fin
              ? chip(el, `st-${t.id}`, prog !== null ? `${prog} %` : 'En marcha', T.trab, { fondo: mezcla(T.trab, 0.14, T.tarjeta) })
              : t.estado === 'completed'
                ? chip(el, `st-${t.id}`, 'Terminó', T.ok, { icono: 'check', fondo: mezcla(T.ok, 0.14, T.tarjeta) })
                : t.estado === 'killed'
                  ? chip(el, `st-${t.id}`, 'Lo paraste', T.t3, { icono: 'parar', fondo: mezcla('#ffffff', 0.06, T.tarjeta) })
                  : chip(el, `st-${t.id}`, 'Falló', T.error, { icono: 'x', fondo: mezcla(T.error, 0.14, T.tarjeta) })
            const botones: unknown[] = []
            if (tp === 'servidor' && enlace) botones.push(boton(el, `mb-cp-${f.id}-${t.id}`, { icono: 'copiar', tipo: 'ib', alto: 26 }, (ev?: any) => a.copia(enlace, ev?.surface)))
            if (mia && t.salida) botones.push(boton(el, `mb-ver-${f.id}-${t.id}`, { icono: 'terminal', tipo: 'ib', alto: 26 }, () => a.verSalida(t)))
            if (mia && !t.fin) {
              botones.push(...confirmar(el, d, a, { clave: `mb-para-${t.id}`, id: `parar-${t.id}`, etiqueta: '■', no: 'No', si: 'Parar', hace: s => a.para(t, s) }))
            }
            if (!mia) botones.push(boton(el, `mb-ses-${f.id}-${t.id}`, { icono: 'ojo', tipo: 'ib', alto: 26 }, () => a.abreSesion(f)))
            return [i ? separador(el, `it-l-${f.id}-${t.id}`) : null, (
              <Box key={`it-${f.id}-${t.id}`} flexDirection="column" gap="xs">
                <Box flexDirection="row" alignItems="center" gap="xs">
                  {etiqueta(el, `tp-${f.id}-${t.id}`, ti.nombre, ti.hex, { icono: ti.icono, mayus: true })}
                  <Box flexGrow={1} minWidth={0}><Text size="footnote" weight="bold" color={T.t1} wrap="truncate-end">{t.que}</Text></Box>
                  <Box flexShrink={0}><Text size="caption" color={T.t3} tabular wrap="truncate-end">{t.fin ? hace(d.ahora - t.fin) : mmss(d.ahora - t.desde)}</Text></Box>
                </Box>
                <Box flexDirection="row" alignItems="center" gap="xs">
                  <Box flexGrow={1} minWidth={0}><Text size="caption" mono color={T.t3} wrap="truncate-end">{t.linea ?? ' '}</Text></Box>
                  {estado}
                  {botones}
                </Box>
              </Box>
            )]
          })}
        </Box>
      </Box>
    )
  })
  const nada = !bloques.length ? (
    <Text key="nada" size="footnote" color={T.t3} wrap="wrap">
      {vista === 'activos'
        ? 'No hay nada en segundo plano: ni renders, ni servidores, ni agentes.'
        : `Nada ha acabado en las dos últimas horas${tipo ? ` de ese tipo` : ''}.`}
    </Text>
  ) : null

  return [cabeza, barra, ...bloques, ...(nada ? [nada] : [])]
}
