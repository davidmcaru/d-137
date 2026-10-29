// Lo que se elige al instalar el mod (29-oct): los campos de userConfig de plugin.json, que Claude Code pregunta
// en una pantalla al instalarlo y deja cambiar luego en /config (el cambio recarga el mod). Qué sesiones van juntas en
// la Dimensión de la pestaña Sesión y qué frenos actúan entre sesiones. Las opciones van con su texto tal cual, que es lo
// que Claude Code guarda: si se cambia uno, quien lo eligió vuelve al de por defecto
export type Dimension = 'repo' | 'rama' | 'nombre'
export type Frenos = 'los-dos' | 'git' | 'ninguno'

const DIMENSIONES: Record<string, Dimension> = {
  'Mismo repo': 'repo', 'Mismo repo y rama': 'rama', 'Mismo principio del nombre': 'nombre',
}
const FRENOS: Record<string, Frenos> = { 'Los dos': 'los-dos', 'Solo el de git': 'git', Ninguno: 'ninguno' }

// Sin opciones (una versión de Claude Code sin userConfig), lo de siempre: por el principio del nombre y los dos frenos
export const AJUSTES: { dimension: Dimension; frenos: Frenos } = { dimension: 'nombre', frenos: 'los-dos' }

export function leeAjustes(o: Readonly<Record<string, unknown>> | undefined) {
  AJUSTES.dimension = DIMENSIONES[String(o?.dimension ?? '')] ?? 'nombre'
  AJUSTES.frenos = FRENOS[String(o?.frenos ?? '')] ?? 'los-dos'
}
// Con «Mismo principio del nombre», ese principio es el nombre corto de cada sesión (su rótulo, arriba en su ficha); con
// la dimensión por repo o por rama, el rótulo es el nombre entero y la ficha lleva arriba solo el personaje
export const porNombre = () => AJUSTES.dimension === 'nombre'
