// El panel D-137 y la franja de encima del mensaje (rediseño de las iteraciones 1 a 10, Diseno-Panel). Arriba, las cinco
// pestañas, botones de verdad que cambian un estado: Sesión (esta sesión), Todas (todas), Decisión (lo que te toca),
// Activo (lo que sigue en marcha) y Cuota (la cuota y el día), con lo que te toca y lo que corre en su insignia.
// La franja, solo iconos pixelados: la cabeza de Doc abre tu página; a mano, Fotos, Música, Vídeos y Recortes; a la
// derecha, Más y Commit despliegan su menú, que escribe en la caja, donde esté el cursor, y no manda. Sus rutas, las
// tuyas, en atajos.ts
import type { RenderElement } from 'claude-code'

import type { Pestana } from '../types'
import { CERRAR_TANDA, SKILLS } from './atajos'
import type { Acciones, Datos, El } from './comun'
import { dibujo, pulsable } from './comun'
import { cabeza, cabezaDe, ICONOS_FRANJA, iconoFranja, PISTOLA, quieto } from './dibujos'
import { etiquetaMenu, pestana } from './kit'
import { pestanaGenio } from './genio'
import { pestanaMarty } from './marty'
import { olvidaCampo, pestanaPajaro } from './pajaro'
import { pestanaPortales } from './portales'
import { pestanaDoc } from './doc'

const PESTANAS: { id: Pestana; nombre: string }[] = [
  { id: 'marty', nombre: 'Sesión' },
  { id: 'doc', nombre: 'Todas' },
  { id: 'pajaro', nombre: 'Decisión' },
  { id: 'genio', nombre: 'Activo' },
  { id: 'portales', nombre: 'Cuota' },
]

export function panel(el: El, d: Datos, a: Acciones, cambiados: string[]): RenderElement {
  const { Box, Text } = el
  // Sin números en las pestañas (26-oct: «no quiero ver ahí un número»); cada una, con el dibujo de su ficha
  // delante, como en TF1
  // y la cabeza de cada uno, la de su dibujo de ficha nuevo (26-oct: «como la de Doc»); la de Marty, la del
  // personaje de esta sesión, Verano si es Verano (28-oct)
  const dibujos: Record<Pestana, string | { svg: string; w: number; h: number }> = {
    marty: cabezaDe(d.yo?.tag),
    doc: cabeza('doc:normal', 24),
    pajaro: cabeza('pajaro', 16),
    genio: cabeza('genio', 16, { hasta: 22 }),
    portales: quieto(PISTOLA, 'pistola'),
  }
  const pestanas = (
    <Box key="pestanas" flexDirection="row" gap="xs" flexWrap="wrap">
      {PESTANAS.map(p => pestana(el, `tab-${p.id}`, p.nombre, d.ui.pestana === p.id, dibujos[p.id], () => a.ui('pestana', p.id)))}
    </Box>
  )
  if (d.ui.pestana !== 'pajaro') olvidaCampo()
  const cuerpo = d.ui.pestana === 'doc' ? pestanaDoc(el, d, a)
    : d.ui.pestana === 'pajaro' ? pestanaPajaro(el, d, a)
      : d.ui.pestana === 'genio' ? pestanaGenio(el, d, a)
        : d.ui.pestana === 'portales' ? pestanaPortales(el, d, a)
          : pestanaMarty(el, d, a, cambiados)

  return (
    <Box flexDirection="column" gap="sm">
      {pestanas}
      {cuerpo}
      {d.aviso ? <Text key="aviso" size="caption" color="inactive" wrap="wrap">{d.aviso}</Text> : null}
    </Box>
  )
}

// Las skills de mano: escriben en la caja la skill con la ruta entera de su documento, para pedirla desde el chat (sus
// nombres y sus rutas, en atajos.ts)
const usa = (s: { nombre: string; ruta: string }) => `Usa la skill ${s.nombre} (lee ${s.ruta}): `
const MANO: Record<string, string> = {
  fotos: usa(SKILLS.fotos),
  musica: usa(SKILLS.musica),
  videos: usa(SKILLS.videos),
  recortes: usa(SKILLS.recortes),
}
// Los menús de Más y Commit, cada opción con su icono pixelado (de ICONOS_FRANJA). Las skills, con la ruta entera de su
// documento, como las de mano; Mods deja /reload-plugins escrito aquí y en las demás sesiones (register.tsx)
export const MAS = [
  { value: 'analizar', label: 'Analizar', icono: 'fotos' },
  { value: 'analizar-pro', label: 'Analizar Pro', icono: 'fotosPro' },
  { value: 'trabajo', label: 'Trabajo', icono: 'trabajo', texto: usa(SKILLS.trabajo) },
  { value: 'estudios', label: 'Estudios', icono: 'estudios', texto: usa(SKILLS.estudios) },
  { value: 'gustos', label: 'Gustos', icono: 'gustos', texto: usa(SKILLS.gustos) },
  { value: 'recargar', label: 'Mods', icono: 'recargar' },
  // al lado de Mods (26-oct): compacta la conversación, diciendo qué conservar
  { value: 'compact', label: 'Compact', icono: 'compact', texto: '/compact conserva las decisiones, las rutas de los archivos y lo que queda pendiente' },
]
// Los nombres y el orden (26-oct): de lo que se queda en local a lo que va al repo con más proceso. Lo que
// llevan al repo, todo lo pendiente, en los commits que tengan sentido (28-oct)
const TODO = 'Haz commit de todo lo que haya pendiente, agrupándolo en el número de commits que veas que tenga más sentido por el trabajo que se ha realizado'
const SUBE = 'después, haz push del commit o los commits a la rama correspondiente'
export const COMMIT = [
  { value: 'ver', label: 'Cambios', icono: 'ver', texto: 'Dime qué hay cambiado sin commit en este repo (git status y git diff), una línea por archivo con lo que cambia; sin tocar nada.' },
  { value: 'commit', label: 'Commit', icono: 'commit', texto: `${TODO}, sin push.` },
  { value: 'push', label: 'Push', icono: 'push', texto: `${TODO}; ${SUBE}.` },
  { value: 'tanda', label: 'Cerrar-Tanda', icono: 'tanda', texto: `Cierra la tanda siguiendo ${CERRAR_TANDA} y, si sale en verde, haz commit y push.` },
  { value: 'iguala', label: 'Push+Ramas', icono: 'iguala', texto: `${TODO}; ${SUBE} y, por último, iguala las demás ramas del repo por fast-forward (git fetch antes y sin forzar nunca).` },
  { value: 'e2e', label: 'Push+E2E', icono: 'e2e', texto: `${TODO}; ${SUBE}, con [e2e] al final del mensaje del último commit, para que GitHub lance la suite E2E.` },
]

// La franja v3 (26-oct): todo iconos pixelados, sin cajas, bordes ni rayas, cada uno con su botón en blanco
// encima. Más y Commit despliegan debajo su menú, con los mismos iconos y el nombre de cada opción como botón
export function franja(el: El, menu: string | null, a: {
  panelGeneral: () => void; escribe: (texto: string) => void; menu: (cual: string) => void;
  mas: (valor: string, surface?: string) => void; commit: (valor: string, surface?: string) => void
}): RenderElement {
  const { Box } = el
  // dos píxeles de pantalla por cada uno del dibujo: todos a la misma escala
  const pix = (nombre: string) => {
    const d = ICONOS_FRANJA[nombre]
    const w = (d?.filas[0]?.length ?? 8) * 2
    return { dibujo: dibujo(el, iconoFranja(nombre), w, (d?.filas.length ?? 8) * 2, nombre), w }
  }
  // el abierto, con un fondo suave (sin borde)
  const icono = (key: string, nombre: string, alPulsar: () => void, abierto = false) => {
    const p = pix(nombre)
    return (
      <Box key={`${key}-caja`} paddingX="xs" backgroundColor={abierto ? '#ffffff1f' : undefined}>
        {pulsable(el, key, p.dibujo, p.w, alPulsar)}
      </Box>
    )
  }
  const opciones = menu === 'mas'
    ? MAS.map(m => ({ value: m.value, label: m.label, icono: m.icono, elige: (s?: string) => a.mas(m.value, s) }))
    : menu === 'commit'
      ? COMMIT.map(c => ({ value: c.value, label: c.label, icono: c.icono, elige: (s?: string) => a.commit(c.value, s) }))
      : []
  return (
    <Box flexDirection="column" gap="xs">
      <Box key="fr-iconos" flexDirection="row" alignItems="center" gap="sm">
        {icono('fr-panel', 'doc', () => a.panelGeneral())}
        {icono('fr-fotos', 'fotos', () => a.escribe(MANO.fotos!))}
        {icono('fr-musica', 'musica', () => a.escribe(MANO.musica!))}
        {icono('fr-videos', 'videos', () => a.escribe(MANO.videos!))}
        {icono('fr-recortes', 'recortes', () => a.escribe(MANO.recortes!))}
        <Box flexGrow={1} />
        {icono('fr-mas', 'mas', () => a.menu('mas'), menu === 'mas')}
        {icono('fr-commit', 'commit', () => a.menu('commit'), menu === 'commit')}
      </Box>
      {opciones.length ? (
        <Box key="fr-menu" flexDirection="row" flexWrap="wrap" alignItems="center" columnGap="xs" rowGap="xs">
          {opciones.map(o => {
            const dib = ICONOS_FRANJA[o.icono]
            return etiquetaMenu(el, `fr-op-${o.value}-b`, o.label, iconoFranja(o.icono), (dib?.filas[0]?.length ?? 8) * 1.5,
              (dib?.filas.length ?? 8) * 1.5, (ev?: any) => o.elige(ev?.surface))
          })}
        </Box>
      ) : null}
    </Box>
  )
}
