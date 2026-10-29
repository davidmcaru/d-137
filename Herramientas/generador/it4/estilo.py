"""El estilo de RP4 y MP4 (it-3, «Contorno de color»), para las caras nuevas: brillo en las pupilas, volumen (sombra a
la derecha y abajo, luz arriba a la izquierda) y un borde del color oscuro de cada parte. Dos tamaños de píxel: el de
RP4 (la rejilla de 24 × 36 de Doc y 24 × 32 de Marty) y el fino, en el que cada píxel pasa a 4 (2 × 2, con Scale2x,
que redondea las escaleras sin cambiar el dibujo); en el fino, el brillo es de un píxel y el borde, más delgado."""
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(AQUI, '..', 'it3'))
import pixel  # noqa: E402

NEGRO, BLANCO = pixel.NEGRO, '#ffffff'


def brillo(r):
    """Un punto de luz en cada pupila (un trozo negro, de dos por dos o más, que toca el blanco del ojo): su píxel de
    arriba a la izquierda"""
    h, w = len(r), len(r[0])
    visto = set()
    out = pixel.copia(r)
    for y in range(h):
        for x in range(w):
            if r[y][x] != NEGRO or (y, x) in visto:
                continue
            pila, trozo = [(y, x)], []
            visto.add((y, x))
            while pila:
                cy, cx = pila.pop()
                trozo.append((cy, cx))
                for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                    if 0 <= ny < h and 0 <= nx < w and (ny, nx) not in visto and r[ny][nx] == NEGRO:
                        visto.add((ny, nx))
                        pila.append((ny, nx))
            ys = [p[0] for p in trozo]
            xs = [p[1] for p in trozo]
            alto, ancho = max(ys) - min(ys) + 1, max(xs) - min(xs) + 1
            toca_blanco = any(0 <= ny < h and 0 <= nx < w and r[ny][nx] == BLANCO
                              for cy, cx in trozo for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)))
            if toca_blanco and 2 <= alto <= 8 and 2 <= ancho <= 8 and len(trozo) >= 0.75 * alto * ancho:
                y0 = min(ys)
                x0 = min(x for yy, x in trozo if yy == y0)
                out[y0][x0] = BLANCO
    return out


def estilo(r):
    return pixel.contorno(pixel.volumen(brillo(r)))


def base(lienzo):
    return estilo(lienzo.rejilla())


def fino(lienzo):
    return estilo(pixel.doble(lienzo.rejilla()))


def ppm(r, escala, fondo='#262624'):
    """La rejilla como imagen PPM (sin dependencias), cada píxel en un cuadrado de escala × escala"""
    h, w = len(r), len(r[0])
    bg = pixel.rgb(fondo)
    filas = []
    for fila in r:
        linea = bytearray()
        for c in fila:
            if not c:
                px = bg
            elif len(c) == 9:
                a = int(c[7:9], 16) / 255
                px = tuple(round(v * a + b * (1 - a)) for v, b in zip(pixel.rgb(c[:7]), bg))
            else:
                px = pixel.rgb(c)
            linea += bytes(px) * escala
        filas.append(bytes(linea) * escala)
    return f'P6 {w * escala} {h * escala} 255\n'.encode() + b''.join(filas)
