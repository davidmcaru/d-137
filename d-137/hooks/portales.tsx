// La pestaña Cuota, la cuota y el día (confirmada en la iteración 9; antes «Cuota y día»): la ficha con la pistola de
// portales y sus filas Semana, Hoy y 5 h, plegable (desplegada, la semana día a día); lo de cada sesión; cuándo lo
// usas, por horas; y el día, lo que hizo cada sesión. Por defecto, todo plegado
import type { RenderElement } from 'claude-code'

import type { Cuota, Ficha, Hecho } from '../types'
import {
  deEstaSemana, gastadoDesde, horasDe, porSesion, puntosPorDolar, ritmo, semanaDiaADia, usoDia, ventanaSemana,
} from './calculos'
import type { Acciones, Datos, El } from './comun'
import {
  AMARILLO, arriba, cabecera, CIAN, corto, dibujo, dibujoLleno, dolares, ficha, figuraEn, hora, ico, millones, mini, pct, pct0,
  plegar, plural, tarjeta, VERDE,
} from './comun'
import { fijaDe } from './dibujos'
import { diaDe } from './fichas'
import { cuadroTrazos, dosBarrasSvg, horasSvg, rayaMedia, semanaSvg } from './graficas'
import { barra, filtro, separador, T } from './kit'
import { MARTYS } from './martys'
import { RESERVA } from './personajes'

const colorDe = (tag: string) => (MARTYS.find(m => m.tag === tag) ?? RESERVA.find(m => m.tag === tag))?.camiseta ?? '#9a9a96'
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
// Las unidades de «Por sesión», que alterna el botón de su cabecera: el % de la semana (por defecto), los millones de
// tokens y los dólares a precio de la API (28-oct)
const UNIDADES: Record<string, { texto: string; siguiente: string }> = {
  pct: { texto: '%', siguiente: 'tok' }, tok: { texto: 'Tokens', siguiente: 'usd' }, usd: { texto: 'USD', siguiente: 'pct' },
}

export function pestanaPortales(el: El, d: Datos, a: Acciones): RenderElement[] {
  const { Box, Text } = el
  const todas = [d.yo, ...d.otras].filter((f): f is Ficha => f !== null)
  const hoy = diaDe(d.ahora)
  const g = d.global
  // La semana de la cuota, aunque esta sesión no sepa cuándo se renueva: la de las demás o, si nadie lo sabe, desde el
  // lunes a las 0:00 (calculos.ts); y su %, el de esta sesión o el de todas, si es de esta semana
  const vent = ventanaSemana(d.cuota, g, d.ahora)
  const mia = deEstaSemana(d.cuota.semana, vent.fin)
  const deTodas = deEstaSemana(g.ultimo, vent.fin)
  const semana = Math.max(mia ?? 0, deTodas ?? 0)
  const haySemana = typeof mia === 'number' || typeof deTodas === 'number'
  const usoHoy = usoDia(g, hoy)
  const cinco = d.cuota.horas?.pct
  const cuotaV: Cuota = { ...d.cuota, semana: { pct: semana, resetsAt: new Date(vent.fin).toISOString() } }
  const va = haySemana ? ritmo(cuotaV, d.ahora) : null
  const ancho = Math.max(240, Math.min(560, Math.round((d.cols - 8) * 7.2)))
  const desde = `el ${DIAS[new Date(vent.inicio).getDay()] ?? ''} a las ${hora(vent.inicio)}`

  // La ficha, con su semana día a día al desplegarla
  const abiertoF = d.ui.abiertos.ficha === true
  const cabeza = ficha(el, {
    key: 'ficha',
    dibujo: figuraEn(el, fijaDe('pistola'), 'La pistola de portales'),
    arriba: arriba(el, 'Cuota y día', va === null ? (haySemana ? pct0(semana) : 'sin datos') : va >= 0 ? `sobra ${pct(va)}` : `falta ${pct(-va)}`,
      va === null ? 'inactive' : va >= 0 ? 'success' : 'error'),
    derecha: plegar(el, 'ficha', abiertoF, a),
    nombre: haySemana ? `${pct0(semana)} de la semana` : 'La cuota llega con la primera respuesta de Claude',
    cols: d.cols,
    filas: [
      { etiqueta: 'Semana', frac: semana / 100, valor: haySemana ? pct0(semana) : '—', color: CIAN },
      { etiqueta: 'Hoy', frac: (usoHoy ?? 0) / (100 / 7), valor: pct(usoHoy), color: AMARILLO },
      { etiqueta: '5 h', frac: (cinco ?? 0) / 100, valor: typeof cinco === 'number' ? pct0(cinco) : '—', color: VERDE },
    ],
    debajo: abiertoF ? (
      <Box key="semana" flexDirection="column" gap="sm">
        {separador(el, 'sem-l1')}
        <Box flexDirection="row" alignItems="center" gap="xs">
          {ico(el, 'grafica', T.t3, 13)}
          <Text size="caption" weight="semibold" color={T.t3}>La semana, día a día</Text>
        </Box>
        {dibujo(el, semanaSvg(semanaDiaADia(g, cuotaV, d.ahora), ancho), ancho, 140, 'La semana, día a día')}
        {separador(el, 'sem-l2')}
        <Box key="sem-ley" flexDirection="row" flexWrap="wrap" columnGap="md" rowGap="xs">
          <Box flexDirection="row" alignItems="center" gap="xs">
            {dibujo(el, rayaMedia(), 14, 10, 'la raya de tu media')}
            <Text size="caption" color={T.t3}>tu media de ese día</Text>
          </Box>
          <Box flexDirection="row" alignItems="center" gap="xs">
            {dibujo(el, cuadroTrazos(), 11, 11, 'el cuadro a trazos')}
            <Text size="caption" color={T.t3}>lo que tocaría para acabar cerca del 100 %</Text>
          </Box>
        </Box>
      </Box>
    ) : null,
  })

  // Por sesión: lo de hoy (plegado) o lo de la semana y hoy (desplegado), solo de las que han gastado algo desde que se
  // renovó la semana, en la unidad que diga el botón de la cabecera
  const k = puntosPorDolar(g, d.registros, d.ahora)
  const filas = porSesion(d.registros, todas, vent.inicio, d.ahora)
  const abiertoS = d.ui.abiertos.porSesion === true
  const unidad = UNIDADES[d.ui.unidad] ? d.ui.unidad : 'pct'
  // el % sale de los dólares; las barras, de los dólares o de los tokens (las proporciones del % son las de los dólares)
  const enUnidad = (usd: number, tok: number) => (unidad === 'tok' ? tok : unidad === 'usd' ? usd : k === null ? null : usd * k)
  const base = (usd: number, tok: number) => (unidad === 'tok' ? tok : usd)
  const cifra = (n: number | null) => (unidad === 'tok' ? millones(n) : unidad === 'usd' ? dolares(n) : pct(n))
  const maxHoy = Math.max(1e-9, ...filas.map(x => base(x.usdHoy, x.tokHoy)))
  const totalSemana = Math.max(1e-9, filas.reduce((s, x) => s + base(x.usdSemana, x.tokSemana), 0))
  // la barra de cada sesión, plegada, algo más ancha que su hueco (lo que deja la fila sin el Marty, el nombre, la cifra
  // y el margen): el escritorio la encoge justo hasta llenarlo, y así poco, sus puntas redondas casi no se deforman
  const anchoBarra = Math.max(80, Math.round(d.cols * 7.9 - 170))
  // donde empiezan esas barras (el Marty, 16 px, y el nombre, 8 columnas, con sus huecos): ahí empieza también la
  // rejilla de «Cuándo lo usas» (28-oct)
  const sangria = 16 + 11 + 8 * 7.9 + 11
  // la cabecera dice lo de la semana y lo de hoy, plegada o no (it-11, r21: «Sem. x % · Día y %»); en tokens o en
  // dólares, lo de las sesiones de este PC: la semana, desde que se renovó, y el día, entero
  const cero = new Date(d.ahora)
  cero.setHours(0, 0, 0, 0)
  const suma = (fn: (usd: number, tok: number) => number | null, desdeT: number) => fn(
    d.registros.reduce((s, r) => s + gastadoDesde(r, 'usd', desdeT), 0), d.registros.reduce((s, r) => s + gastadoDesde(r, 'tok', desdeT), 0))
  const totales = unidad === 'pct'
    ? `Sem. ${haySemana ? pct0(semana) : '—'} · Día ${pct(usoHoy)}`
    : `Sem. ${cifra(suma(enUnidad, vent.inicio))} · Día ${cifra(suma(enUnidad, cero.getTime()))}`
  const porSes = tarjeta(el, 'porsesion', [
    cabecera(el, {
      key: 'ps-cab', icono: 'grafica', titulo: abiertoS ? 'Por sesión · semana y hoy' : 'Por sesión · hoy',
      derecha: (
        <Box key="ps-der" flexDirection="row" alignItems="center" gap="xs">
          <Text key="ps-tot" size="caption" color={T.t3}>{totales}</Text>
          {filtro(el, 'ps-unidad', { texto: UNIDADES[unidad]?.texto ?? '%', activo: true, color: T.acento },
            () => a.ui('unidad', UNIDADES[unidad]?.siguiente ?? 'pct'))}
        </Box>
      ),
      plegable: { clave: 'porSesion', abierto: abiertoS, a },
    }),
    ...(!filas.length ? [
      <Text key="ps-nada" size="footnote" color={T.t3} wrap="wrap">
        {`Ninguna sesión ha gastado nada desde que se renovó la semana, ${desde}.`}
      </Text>,
    ] : abiertoS ? [
      ...filas.flatMap((x, i) => {
        const sem = enUnidad(x.usdSemana, x.tokSemana)
        const dia = enUnidad(x.usdHoy, x.tokHoy)
        return [i ? separador(el, `ps-l-${x.id}`) : null, (
          <Box key={`ps-${x.id}`} flexDirection="column" gap="xs">
            <Box flexDirection="row" alignItems="center" gap="sm">
              {mini(el, x.tag, 16)}
              <Text size="footnote" weight="bold" color={T.t1}>{corto(x.rotulo, 12)}</Text>
              <Box flexGrow={1} />
              <Text size="caption" color={T.t3}>semana <Text weight="bold" color={T.t1}>{cifra(sem)}</Text> · hoy <Text weight="bold" color={T.t1}>{cifra(dia)}</Text></Text>
            </Box>
            {/* la barra, de borde a borde de la fila (28-oct: acababa unos 75 px antes) */}
            {dibujoLleno(el, dosBarrasSvg(base(x.usdSemana, x.tokSemana) / totalSemana, base(x.usdHoy, x.tokHoy) / totalSemana,
              colorDe(x.tag), Math.round(d.cols * 7.9)), 14, `${x.rotulo}: ${cifra(sem)} en la semana y ${cifra(dia)} hoy`)}
          </Box>
        )]
      }),
      separador(el, 'ps-l-ley'),
      <Text key="ps-ley" size="caption" color={T.t3} wrap="wrap">
        {`La semana empezó ${desde}. La barra entera es lo gastado desde entonces; cada sesión, su parte, y debajo, lo de hoy.`}
      </Text>,
    ] : filas.map(x => {
      const dia = enUnidad(x.usdHoy, x.tokHoy)
      // la barra llena el hueco hasta la cifra, y la cifra, a la derecha con el margen de la ficha de arriba, en su
      // misma línea (28-oct: la barra se quedaba en su ancho y las cifras no casaban con las de la ficha)
      return (
        <Box key={`ps-${x.id}`} flexDirection="row" alignItems="center" gap="sm" paddingRight="xl">
          {mini(el, x.tag, 16)}
          <Box width={8}><Text size="footnote" weight="bold" color={T.t1} wrap="truncate-end">{corto(x.rotulo, 9)}</Text></Box>
          <Box flexGrow={1} minWidth={0}>
            {dibujoLleno(el, barra(anchoBarra, base(x.usdHoy, x.tokHoy) / maxHoy, colorDe(x.tag), 8, T.pista, true), 8, `${x.rotulo}: ${cifra(dia)} hoy`)}
          </Box>
          <Box width={8} flexShrink={0} flexDirection="row" justifyContent="flex-end"><Text size="footnote" weight="bold" color={T.t1} tabular>{cifra(dia)}</Text></Box>
        </Box>
      )
    })),
  ])

  // Cuándo lo usas: el mapa de las horas, de esta semana o de media; hoy, en los dos, lo de hoy (28-oct)
  const abiertoC = d.ui.abiertos.cuando === true
  const partidas = d.ui.cuandoModo !== 'media'
  const hayHoras = Object.keys(g.horas).length > 0
  const leyendaC = partidas ? (abiertoC ? 'Cada día de esta semana' : 'Media de esta semana; hoy, lo de hoy')
    : 'Media de 4 semanas; hoy, lo de hoy'
  const cuando = tarjeta(el, 'cuando', [
    cabecera(el, {
      key: 'cu-cab', icono: 'calendario', titulo: 'Cuándo lo usas',
      derecha: (
        <Box key="cu-modo" flexDirection="row" gap="xs">
          {filtro(el, 'cu-media', { texto: 'Media', activo: !partidas, color: !partidas ? T.acento : undefined }, () => a.ui('cuandoModo', 'media'))}
          {filtro(el, 'cu-semana', { texto: 'Esta semana', activo: partidas, color: partidas ? T.acento : undefined }, () => a.ui('cuandoModo', 'semana'))}
        </Box>
      ),
      plegable: { clave: 'cuando', abierto: abiertoC, a },
    }),
    hayHoras
      ? dibujo(el, horasSvg(horasDe(g, d.ahora, abiertoC, !partidas), leyendaC, ancho, Math.round(sangria)), ancho, abiertoC ? 145 : 85, 'Cuándo lo usas, por horas')
      : <Text key="cu-nada" size="footnote" color={T.t3} wrap="wrap">Se va llenando hora a hora desde hoy.</Text>,
  ])

  // El día: lo que hizo esta sesión o todas, con lo más reciente arriba
  const abiertoD = d.ui.abiertos.dia === true
  const todasD = d.ui.diaModo === 'todas'
  const deHoy = d.registros
    .map(r => ({ r, f: todas.find(x => x.id === r.id), hechos: [...(r.dias[hoy]?.hechos ?? [])].sort((x, y) => y.t - x.t) }))
    .filter(x => x.hechos.length)
    .sort((x, y) => (y.hechos[0]?.t ?? 0) - (x.hechos[0]?.t ?? 0))
  const mio = deHoy.find(x => x.r.id === d.yo?.id)
  const filaHecho = (key: string, tag: string, x: Hecho) => (
    <Box key={key} flexDirection="row" alignItems="center" gap="sm">
      {mini(el, tag, 16)}
      <Text size="caption" color={T.t3} tabular>{hora(x.t)}</Text>
      <Box flexGrow={1} minWidth={0}><Text size="footnote" wrap="truncate-end">{x.texto}</Text></Box>
    </Box>
  )
  let cuerpoDia: unknown[] = []
  if (!todasD) {
    const lista = mio?.hechos ?? []
    const tag = d.yo?.tag ?? 'M-01'
    cuerpoDia = !lista.length
      ? [<Text key="dia-nada" size="footnote" color={T.t3}>Esta sesión aún no ha acabado nada hoy.</Text>]
      : abiertoD
        ? lista.map((x, i) => filaHecho(`dia-${i}`, tag, x))
        : [filaHecho('dia-0', tag, lista[0] as Hecho),
          ...(lista.length > 1 ? [<Text key="dia-mas" size="caption" color={T.t3}>{`y ${plural(lista.length - 1, 'cosa más', 'cosas más')} hoy en esta sesión`}</Text>] : [])]
  } else {
    cuerpoDia = !deHoy.length
      ? [<Text key="dia-nada" size="footnote" color={T.t3}>Ninguna sesión ha acabado nada hoy todavía.</Text>]
      : deHoy.flatMap((x, i) => {
        const tag = x.f?.tag ?? x.r.tag
        const lista = abiertoD ? x.hechos : x.hechos.slice(0, 1)
        return [
          i ? separador(el, `dg-l-${x.r.id}`) : null,
          <Box key={`dg-${x.r.id}`} flexDirection="row" alignItems="center" gap="xs">
            {mini(el, tag, 16)}
            <Text size="footnote" weight="bold">{x.f?.rotulo ?? x.r.rotulo}</Text>
            <Box flexGrow={1} />
            <Text size="caption" color={T.t3}>{String(x.hechos.length)}</Text>
          </Box>,
          ...lista.map((hh, i) => (
            <Box key={`dh-${x.r.id}-${i}`} flexDirection="row" alignItems="center" gap="sm" paddingLeft="lg">
              <Text size="caption" color={T.t3} tabular>{hora(hh.t)}</Text>
              <Box flexGrow={1} minWidth={0}><Text size="footnote" wrap="truncate-end">{hh.texto}</Text></Box>
            </Box>
          )),
        ]
      })
  }
  const dia = tarjeta(el, 'dia', [
    cabecera(el, {
      key: 'dia-cab', icono: 'lista', titulo: 'El día',
      derecha: (
        <Box key="dia-modo" flexDirection="row" gap="xs">
          {filtro(el, 'dia-sesion', { texto: 'Sesión', activo: !todasD, color: !todasD ? T.acento : undefined }, () => a.ui('diaModo', 'sesion'))}
          {filtro(el, 'dia-todas', { texto: 'Todas', activo: todasD, color: todasD ? T.acento : undefined }, () => a.ui('diaModo', 'todas'))}
        </Box>
      ),
      plegable: { clave: 'dia', abierto: abiertoD, a },
    }),
    ...cuerpoDia,
  ])

  return [cabeza, porSes, cuando, dia]
}

