"""Iteración 5 de «Personajes» · el resto, en el estilo elegido en la 4 (26-oct: «para el resto de personajes
(Trabajador, Paloma mensajera, la pistola de portales, Liz, Michi, etc.) la variante de este estilo»). Los que son como Marty (Verano, Liz,
Gerardo y Terror), sobre su misma cabeza y su mismo cuerpo, cada uno con lo suyo; Trabajador y Paloma mensajera,
dibujados de nuevo en la rejilla de Doc; los demás (Copito, Pompis, el robot de la mantequilla,
Michi, la pistola y los objetos), el dibujo de hoy a 2 × 2 con su cara y su detalle nuevos. Y de Doc, una cabeza
pequeña para las pestañas y la franja."""
import io
import json
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(AQUI, '..', 'it4'))
sys.path.insert(0, os.path.join(AQUI, '..', 'it3'))
from caras import BLANCO, Lienzo, MARTY_PAL, NEGRO  # noqa: E402
import pixel  # noqa: E402

# el mod, en la carpeta d-137 del repo (relativo: sirve donde se copie el repo)
MOD = os.path.normpath(os.path.join(AQUI, '..', '..', '..', 'd-137'))
_RESERVA = json.load(io.open(os.path.join(MOD, 'recursos', 'reserva.json'), encoding='utf-8'))
_lista = lambda v: list(v.values()) if isinstance(v, dict) else v  # noqa: E731
RESERVA = {x['clave']: x for g in ('personajes', 'objetos', 'elegidos') for x in _lista(_RESERVA[g])}


def doble_de(clave, retoques=None):
    """El dibujo de hoy de la reserva, a 2 × 2 (Scale2x, con los ojos y las líneas en bloques enteros), con sus retoques
    en la rejilla doble: (x, y, color) o un rectángulo (x0, y0, x1, y1, color)"""
    d = RESERVA[clave]
    ancho = max(len(f) for f in d['filas'])
    r = [[d['pal'].get(c) for c in f.ljust(ancho, '.')] for f in d['filas']]
    out = pixel.doble(r)
    for t in retoques or []:
        if len(t) == 3:
            x, y, c = t
            if 0 <= y < len(out) and 0 <= x < len(out[0]):
                out[y][x] = c
        else:
            x0, y0, x1, y1, c = t
            for y in range(y0, y1 + 1):
                for x in range(x0, x1 + 1):
                    if 0 <= y < len(out) and 0 <= x < len(out[0]):
                        out[y][x] = c
    return out


# ---- Los que son como Marty: su cabeza y su cuerpo, con lo suyo ----
def verano_l():
    """Verano: el pelo largo y pelirrojo, las pestañas, la boca pequeña y la camiseta rosa"""
    L = Lienzo([
        '......hhhhhh', '....hhhhhhhh', '...hhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhsss',
        '..hhhsssssss', '..hhssHHHsss', '..hhsswwwsss', '..hhswwwwwss', '..hhswwwwwss', '..hhsswwwsss', '..hhssssssss',
        '..hhsssssssS', '..hhssssssss', '..hhhsssssss', '..hhh..sssss', '..hhh.....ss',
        '..hhpppppppp', '..hhpppppppp', '..ss.ppppppp', '..ss.ppppppp', '..ss.ppppppp', '.....ppppppp', '.....bbbbbbb',
        '.....bbbbbbb', '......bbbb..', '......bbbb..', '......bbbb..', '.....zzzzz..',
    ], {**MARTY_PAL, 'h': '#c4562e', 'H': '#8f3b1f', 'p': '#e86f9e', 'b': '#3f5fa8'})
    L.puntos('k', (7, 10), (8, 10), (7, 11), (8, 11), (15, 10), (16, 10), (15, 11), (16, 11), (5, 9), (18, 9))
    L.tramo(16, 10, 13, 'k')
    L.puntos('k', (9, 15), (14, 15))
    return L


def liz_l():
    """Liz: la melena rubia por la barbilla, las pestañas, la camiseta roja y su copa de vino"""
    L = Lienzo([
        '......hhhhhh', '....hhhhhhhh', '...hhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhsss',
        '..hhhsssssss', '..hhssHHHsss', '..hhsswwwsss', '..hhswwwwwss', '..hhswwwwwss', '..hhsswwwsss', '..hhssssssss',
        '..hhsssssssS', '..hhssssssss', '..hhhsssssss', '...hh.ssssss', '..........ss',
        '....rrrrrrRR', '..rrrrrrrrrr', '..rrrrrrrrrr', '..ss.rrrrrrr', '..ss.rrrrrrr', '..ss.rrrrrrr', '.....rrrrrrr',
        '.....ddddddd', '.....ddddddd', '......dddd..', '......dddd..', '......dddd..', '.....nnnnn..',
    ], {**MARTY_PAL, 'h': '#e8c460', 'H': '#b8922e', 'r': '#b0383c', 'R': '#8a2a2e', 'd': '#3b3b46', 'n': '#26262a',
        'g': '#d9e2ea', 'v': '#7a1f3a'})
    L.puntos('k', (7, 10), (8, 10), (7, 11), (8, 11), (15, 10), (16, 10), (15, 11), (16, 11), (5, 9), (18, 9))
    L.tramo(16, 9, 14, 'k')
    # la copa, en la mano derecha
    L.puntos('g', (19, 18), (22, 18), (19, 19), (22, 19), (20, 21), (21, 21), (20, 22), (21, 22), (19, 23), (22, 23))
    L.puntos('v', (20, 18), (21, 18), (20, 19), (21, 19), (20, 20), (21, 20))
    return L


def gerardo_l():
    """Gerardo: el pelo castaño con su raya, la frente despejada, la sonrisa nerviosa con los dientes y el polo verde"""
    L = Lienzo([
        '......hhhhhh', '....hhhhhhhh', '...hhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhsss', '..hhhsssssss', '..hhssssssss',
        '..hsssssssss', '..hsssHHHsss', '..hssswwwsss', '..hsswwwwwss', '..hsswwwwwss', '..hssswwwsss', '...sssssssss',
        '...ssssssssS', '...sssssssss', '....ssssssss', '.....sssssss', '..........ss',
        '....ggggggGG', '..gggggggggg', '..gggggggggg', '..ss.ggggggg', '..ss.ggggggg', '..ss.ggggggg', '.....ggggggg',
        '.....ttttttt', '.....ttttttt', '......tttt..', '......tttt..', '......tttt..', '.....NNNNN..',
    ], {**MARTY_PAL, 'h': '#7a5230', 'H': '#56391f', 'g': '#9cc78f', 'G': '#6f9a62', 't': '#b8a070', 'N': '#4a3020'})
    L.puntos('k', (7, 10), (8, 10), (7, 11), (8, 11), (15, 10), (16, 10), (15, 11), (16, 11))
    # las cejas, preocupadas
    L.puntos('H', (8, 7), (15, 7))
    L.puntos('s', (6, 8), (17, 8))
    # la sonrisa nerviosa, con los dientes de arriba
    L.puntos('k', (8, 15), (15, 15))
    L.tramo(15, 9, 14, 'w')
    L.tramo(16, 9, 14, 'k')
    return L


def terror_l():
    """Terror: el sombrero, la cara quemada, la sonrisa de dientes de sierra, el jersey a rayas y las cuchillas"""
    L = Lienzo([
        '.......aaaaa', '......aaaaaa', '......aaaaaa', '......aaaaaa', '......AAAAAA', '.aaaaaaaaaaa', '..aaaaaaaaaa',
        '....ssssssss', '....sSssSSss', '....swwwssss', '....wwwwwsss', '....swwwssss', '....ssSsssss', '....ssssssss',
        '....skkkkkkk', '....sswkwkwk', '....ssskkkkk', '.....sssssss', '..........ss',
        '....rrrrrrrr', '..rrrrrrrrrr', '..gggggggggg', '..ss.rrrrrrr', '..ss.ggggggg', '..ss.rrrrrrr', '.....ggggggg',
        '.....ddddddd', '.....ddddddd', '......dddd..', '......dddd..', '......dddd..', '.....nnnnn..',
    ], {**MARTY_PAL, 'a': '#6b4a2b', 'A': '#3d2a18', 's': '#d98a7a', 'S': '#b55a50', 'r': '#b3302f', 'g': '#3f7a3a',
        'd': '#3b3b46', 'n': '#26262a', 'c': '#c4c8ce'})
    L.puntos('k', (6, 10), (7, 10), (6, 11), (7, 11), (16, 10), (17, 10), (16, 11), (17, 11))
    # las cuchillas de los dedos
    L.puntos('c', (1, 25), (1, 26), (2, 26), (3, 26), (3, 27), (22, 25), (22, 26), (21, 26), (20, 26), (20, 27))
    return L


def verano():
    return verano_l().rejilla()


def liz():
    return liz_l().rejilla()


def gerardo():
    return gerardo_l().rejilla()


def terror():
    return terror_l().rejilla()


# ---- Trabajador y Paloma mensajera, en la rejilla de Doc ----
def genio():
    """Trabajador: la cabeza alargada, los ojos grandes, la boca abierta y un brazo arriba («¡mírame!»)"""
    L = Lienzo([
        '.......bbbbb', '.....bbbbbbb', '....bbbbbbbb', '....bbbbbbbb', '...bbbbbbbbb', '...bbwwwwbbb', '...bbwwwwbbb',
        '...bbwwwwbbb', '...bbbwwbbbb', '...bbbbbbbbb', '...bbbbbkkkk', '...bbbbkrrrr', '....bbbkrrrr', '....bbbbkkkk',
        '.....bbbbbbb', '.........bbb', '......bbbbbb', '....bbbbbbbb', '...bbb.bbbbb', '...bbb.bbbbb', '...bbb.bbbbb',
        '...bbb.bbbbb', '....bb.bbbbb', '.......bbbbb', '.......bbbbb', '.......bbbbb', '.......bbb..', '.......bbb..',
        '.......bbb..', '.......bbb..', '......bbbb..',
    ], {'b': '#6ec6f0', 'k': NEGRO, 'w': BLANCO, 'r': '#e05a5a'})
    L.puntos('k', (6, 6), (7, 6), (6, 7), (7, 7), (16, 6), (17, 6), (16, 7), (17, 7))
    # el brazo derecho, arriba
    for y in range(18, 23):
        L.tramo(y, 18, 20, '.')
    L.puntos('b', (19, 17), (20, 16), (21, 15), (21, 14), (22, 14), (21, 13), (22, 13), (21, 12), (22, 12), (21, 11),
             (22, 11), (20, 10), (21, 10), (22, 10), (23, 10), (21, 9), (23, 9))
    return L.rejilla()


def pajaro():
    """Paloma mensajera: la cresta, los ojos fijos, el pico grande en el centro y el traje verde oscuro con su cinturón"""
    L = Lienzo([
        '......h....h', '.....hh...hh', '.....hhh.hhh', '....hhhhhhhh', '...hhhhhhhhh', '...hhhhhhhhh', '...hhwwwhhhh',
        '...hhwwwhhhh', '...hhhwhhhyy', '...hhhhhhyyy', '....hhhhhyyy', '....hhhhhhyy', '.....hhhhhyy', '......hhhhhY',
        '.......hhhhh', '........ffff', '....dddddddd', '...ddddddddd', '..dddddDDddd', '..dd.ddddddd', '..dd.ddddddd',
        '..dd.ddddddd', '..hh.ddddddd', '.....ddddddd', '.....DDDDDDD', '.....ddddddd', '......dddd..', '......dddd..',
        '......dddd..', '.....DDDDD..',
    ], {'h': '#c9a26b', 'H': '#a07c48', 'w': BLANCO, 'k': NEGRO, 'y': '#f2b632', 'Y': '#c98d1c', 'f': '#8d6e4a',
        'd': '#3b4a3f', 'D': '#2a362d'})
    L.puntos('k', (6, 6), (6, 7), (7, 7), (7, 6), (16, 6), (17, 6), (16, 7), (17, 7))
    L.puntos('H', (4, 5), (5, 5), (6, 5), (7, 5), (16, 5), (17, 5), (18, 5), (19, 5))
    return L.rejilla()


# ---- Doc: su cabeza pequeña, para las pestañas y la franja ----
def doc_cabeza():
    L = Lienzo([
        '.h...h.', 'hhh.hhh', 'hhhhhhh', '.hhssss', '.hsbbbb', '..swwws', '..swkws', '..ssssS', '..skkkk', '...ssss',
        '...cccm', '..ccccm',
    ], {'h': '#b9dcec', 's': '#f2c6a0', 'S': '#d4a07a', 'b': '#6f93a6', 'w': BLANCO, 'k': NEGRO, 'c': '#f4f6f8',
        'm': '#7cc4e8'})
    return L.rejilla()


# ---- Los demás: el de hoy a 2 × 2, con su cara y su detalle ----
def copito():
    return doble_de('copito', [(18, 9, BLANCO), (19, 9, NEGRO), (16, 2, '#9aa2ad'), (18, 2, '#9aa2ad')])


def pompis():
    return doble_de('pompis', [(8, 13, BLANCO), (20, 13, BLANCO), (12, 21, '#8a1f1f'), (13, 21, '#8a1f1f'), (14, 21, '#8a1f1f'),
                              (15, 21, '#8a1f1f')])


def butter():
    return doble_de('butter', [(14, 8, '#ffb0b0'), (4, 17, '#fff1a8'), (5, 17, '#fff1a8')])


def michi():
    return doble_de('michi', [(9, 9, BLANCO), (21, 9, BLANCO), (14, 13, '#5a2814'), (15, 13, '#5a2814')])


def pistola_de():
    return doble_de('pistola', [(9, 2, '#8ff08f'), (10, 2, '#8ff08f'), (11, 2, '#8ff08f'), (29, 6, '#9fff9f'), (30, 6, '#9fff9f')])


def objeto(clave, brillos):
    return lambda: doble_de(clave, brillos)


OTROS = [
    ('PJ1', 'Trabajador', 'La cabeza alargada, los ojos grandes, la boca abierta y un brazo arriba: «¡mírame!»', genio),
    ('PJ2', 'Paloma mensajera', 'La cresta, los ojos fijos, el pico grande en el centro y el traje verde oscuro', pajaro),
    ('PJ3', 'La pistola de portales', 'La de hoy a 2 × 2, con el brillo del tubo y del morro', pistola_de),
    ('PR1', 'Verano', 'El pelo largo y pelirrojo, las pestañas, la boca pequeña y la camiseta rosa', verano),
    ('PR2', 'Liz', 'La melena rubia, las pestañas, la camiseta roja y su copa de vino', liz),
    ('PR3', 'Gerardo', 'El pelo con su raya, la frente despejada, la sonrisa nerviosa y el polo verde', gerardo),
    ('PR4', 'Copito', 'El de hoy a 2 × 2, con el brillo del ojo y del casco', copito),
    ('PR5', 'Terror', 'El sombrero, la cara quemada, la sonrisa de sierra, el jersey a rayas y las cuchillas', terror),
    ('PR6', 'Pompis', 'El de hoy a 2 × 2, con el brillo de los ojos y la boca', pompis),
    ('PR7', 'El robot de la mantequilla', 'El de hoy a 2 × 2, con la luz del ojo y la mantequilla', butter),
    ('PR8', 'Michi', 'El de hoy a 2 × 2, con el brillo de los ojos y la nariz', michi),
    ('OB1', 'La batería cósmica', 'La de hoy a 2 × 2, con su contorno', objeto('bateria', [])),
    ('OB2', 'Un chirimbolo', 'El de hoy a 2 × 2, con su contorno', objeto('chirimbolo', [])),
    ('OB3', 'La tele cósmica', 'La de hoy a 2 × 2, con su contorno', objeto('tele', [])),
    ('OB4', 'El cristal del destino', 'El de hoy a 2 × 2, con su contorno', objeto('cristal', [])),
    ('OB5', 'El arcade', 'El de hoy a 2 × 2, con su contorno', objeto('arcade', [])),
]
