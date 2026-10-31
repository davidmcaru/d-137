// Tus atajos de la franja de encima del mensaje: lo que escribe o abre cada botón. Vienen con rutas de ejemplo: cambia
// cada una por la tuya y, en cada sesión abierta, escribe /reload-plugins (o pulsa «Mods», en «Más»). «~» es tu carpeta
// de usuario (C:\Users\<tú> en Windows).

// Las skills: su botón escribe en la caja «Usa la skill <nombre> (lee <ruta>): », donde esté el cursor, sin mandarlo,
// para que acabes tú la frase. La ruta es la de su documento: el SKILL.md de una skill de Claude Code o cualquier .md
// con el proceso. Fotos, Música, Vídeos y Recortes van a la vista en la franja; Trabajo, Estudios y Gustos, en «Más»
export const SKILLS = {
  fotos: { nombre: 'Fotos', ruta: '~/.claude/skills/fotos/SKILL.md' },
  musica: { nombre: 'Música', ruta: '~/.claude/skills/musica/SKILL.md' },
  videos: { nombre: 'Vídeos', ruta: '~/.claude/skills/videos/SKILL.md' },
  recortes: { nombre: 'Recortes', ruta: '~/.claude/skills/recortes/SKILL.md' },
  trabajo: { nombre: 'Trabajo', ruta: '~/.claude/skills/trabajo/SKILL.md' },
  estudios: { nombre: 'Estudios', ruta: '~/.claude/skills/estudios/SKILL.md' },
  gustos: { nombre: 'Gustos', ruta: '~/.claude/skills/gustos/SKILL.md' },
}

// La cabeza de Doc, a la izquierda de la franja: abre esta página o este documento como con doble clic (un índice de tus
// proyectos, un panel tuyo…); si es un .cmd, se ejecuta, como el que arranque tu panel con su propio servidor
export const PANEL = '~/.claude/atajos/Panel.html'

// Analizar y Analizar Pro, en «Más»: lo abren como con doble clic (un .cmd se ejecuta). Si no están, el aviso del panel
// dice qué ruta falta
export const ANALIZAR = '~/.claude/atajos/Analizar.cmd'
export const ANALIZAR_PRO = '~/.claude/atajos/Analizar Pro.cmd'

// Cerrar-Tanda, en «Commit»: la receta con lo que hay que comprobar antes de cerrar una tanda de trabajo, que Claude
// sigue antes del commit y el push. Una ruta relativa es la del repo de la sesión
export const CERRAR_TANDA = '.claude/commands/cerrar-tanda.md'
