// La casilla entera, pulsable (26-oct): una zona del escritorio que no pinta nada, encima de la casilla, y que
// al soltar el clic dentro le dice al mod cuál es (ui.message, en register.tsx). Corre en el escritorio, sin $: solo avisa
import type { ClientModule } from 'claude-code'

// Las zonas en las que bajó el botón: fuera de la función, que se vuelve a llamar con cada redibujo (26-oct:
// los clics que se perdían)
const ABAJO = new Set<string>()

const Toque: ClientModule<{ id: string }> = (props, surface) => {
  surface.onPointer(e => {
    // antes de la primera maqueta, columns y rows valen 0
    const dentro = surface.columns === 0 || (e.x >= 0 && e.y >= 0 && e.x < surface.columns && e.y < surface.rows)
    const izquierdo = e.button !== 'right' && e.button !== 'middle'
    if (e.type === 'down') {
      if (dentro && izquierdo) ABAJO.add(props.id)
      else ABAJO.delete(props.id)
    } else if (e.type === 'up') {
      const valia = ABAJO.delete(props.id)
      if (valia && dentro && izquierdo) surface.post({ toque: props.id })
    }
  })
  const { Box } = surface.elements
  return <Box width="100%" height="100%" />
}

export default Toque
