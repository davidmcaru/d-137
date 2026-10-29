"""Iteración 5 de «Personajes» · los ocho Martys en el estilo elegido en la 4 (MC1 y MC2), cada uno con sus cuatro
estados (26-oct: «las variantes nuevas de las variantes antiguas de Marty, y sus estados de normal, bloqueado,
esperando, pausado, de cada Marty»). Normal, la cara de MC1; esperando una decisión, la de MC2 (asustado, con los
brazos arriba); bloqueado, el ceño fruncido y los dientes apretados; pausado, dormido. Cada Marty, con lo suyo de
siempre: el azul, el malvado con su parche, Mutante con sus bultos, el alien verde con sus antenas, el de dos
cabezas, el afro y el robot."""
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(AQUI, '..', 'it4'))
from caras import CABEZA_MARTY, CUERPO_MARTY, Lienzo, MARTY_PAL  # noqa: E402

ESTADOS = [
    ('normal', 'Normal', 'La cara de MC1: los ojos grandes, las cejas cortas y la boca nerviosa en zigzag'),
    ('espera', 'Esperando una decisión', 'La de MC2: las cejas en pico, la boca en «o», la gota de sudor y los brazos arriba'),
    ('bloqueo', 'Bloqueado', 'El ceño fruncido, los ojos entornados y los dientes apretados, con los puños abajo'),
    ('pausa', 'Pausado', 'Dormido: los ojos cerrados, la boca pequeña y floja'),
]

# Las caras de cada estado, en la cabeza de MC1 (los ojos en las columnas 5 a 9 y 14 a 18, filas 9 a 12)
PUPILAS = ((7, 10), (8, 10), (7, 11), (8, 11), (15, 10), (16, 10), (15, 11), (16, 11))


def _limpia_boca(L, dy=0):
    for y in (15, 16, 17):
        L.tramo(y + dy, 8, 15, 's')


def normal(L, dy=0):
    L.puntos('k', *((x, y + dy) for x, y in PUPILAS))


def espera(L, dy=0, brazos=True):
    # las cejas, con la punta de dentro hacia arriba
    L.tramo(8 + dy, 6, 8, 's')
    L.tramo(8 + dy, 15, 17, 's')
    L.puntos('H', (6, 7 + dy), (7, 7 + dy), (8, 6 + dy), (17, 7 + dy), (16, 7 + dy), (15, 6 + dy))
    # los ojos, una fila más altos, con las pupilas arriba
    L.puntos('w', (6, 8 + dy), (7, 8 + dy), (8, 8 + dy), (15, 8 + dy), (16, 8 + dy), (17, 8 + dy))
    L.puntos('k', (7, 9 + dy), (8, 9 + dy), (7, 10 + dy), (8, 10 + dy), (15, 9 + dy), (16, 9 + dy), (15, 10 + dy), (16, 10 + dy))
    # la boca en «o»
    _limpia_boca(L, dy)
    L.tramo(15 + dy, 10, 13, 'k')
    L.puntos('k', (10, 16 + dy), (13, 16 + dy), (10, 17 + dy), (13, 17 + dy))
    L.tramo(16 + dy, 11, 12, 'r')
    L.tramo(17 + dy, 11, 12, 'r')
    L.tramo(18 + dy, 10, 13, 'k')
    # la gota de sudor en la sien
    L.puntos('d', (20, 7 + dy), (20, 8 + dy), (19, 9 + dy), (20, 9 + dy))
    if brazos:
        for y in (22, 23, 24):
            L.puntos('.', (2, y + dy), (3, y + dy), (20, y + dy), (21, y + dy))
        L.puntos('s', (1, 18 + dy), (1, 17 + dy), (2, 16 + dy), (1, 16 + dy), (22, 18 + dy), (22, 17 + dy), (21, 16 + dy), (22, 16 + dy))
        L.puntos('y', (1, 19 + dy), (2, 19 + dy), (21, 19 + dy), (22, 19 + dy))


def bloqueo(L, dy=0):
    # el ceño: las cejas bajan hacia el centro
    L.tramo(8 + dy, 5, 9, 's')
    L.tramo(8 + dy, 14, 18, 's')
    L.puntos('H', (5, 7 + dy), (6, 7 + dy), (7, 8 + dy), (8, 8 + dy), (9, 9 + dy), (18, 7 + dy), (17, 7 + dy), (16, 8 + dy), (15, 8 + dy), (14, 9 + dy))
    # los ojos, entornados: la fila de arriba, de piel
    for x in range(5, 19):
        if L.filas[9 + dy][x] == 'w':
            L.pon(x, 9 + dy, 's')
    L.puntos('k', *((x, y + dy) for x, y in PUPILAS))
    # los dientes apretados
    _limpia_boca(L, dy)
    L.tramo(15 + dy, 9, 14, 'k')
    L.tramo(16 + dy, 9, 14, 'w')
    L.puntos('k', (9, 16 + dy), (14, 16 + dy), (11, 16 + dy), (12, 16 + dy))
    L.tramo(17 + dy, 9, 14, 'k')


def pausa(L, dy=0):
    # los ojos cerrados: un párpado curvo en lugar del blanco
    for x in range(5, 19):
        for y in (9, 10, 11, 12):
            if L.filas[y + dy][x] == 'w':
                L.pon(x, y + dy, 's')
    for x0 in (5, 14):
        L.puntos('H', (x0, 10 + dy), (x0 + 4, 10 + dy))
        L.tramo(11 + dy, x0 + 1, x0 + 3, 'H')
    # la boca pequeña y floja
    _limpia_boca(L, dy)
    L.tramo(16 + dy, 11, 12, 'k')
    L.tramo(17 + dy, 11, 12, 'r')


CARAS = {'normal': normal, 'espera': espera, 'bloqueo': bloqueo, 'pausa': pausa}


def _marty(pal, cabeza=None, cuerpo=None):
    return Lienzo((cabeza or CABEZA_MARTY) + (cuerpo or CUERPO_MARTY), {**MARTY_PAL, **pal})


# ---- Cada Marty: su paleta, su pelo y lo suyo ----
def m01(est):
    L = _marty({})
    CARAS[est](L)
    return L


def m02(est):
    L = _marty({'y': '#4a90e2', 'Y': '#3672b8', 'b': '#2d3a4f'})
    CARAS[est](L)
    return L


def m03(est):
    """El malvado: la camiseta negra, el parche en el ojo izquierdo y la boca recta"""
    L = _marty({'y': '#3a3a3a', 'Y': '#2a2a2a', 'b': '#26262a', 'z': '#a9a9a3', 'p': '#1b1b1f'})
    CARAS[est](L)
    # el parche, con su cinta hasta el pelo
    for x in range(5, 10):
        for y in range(8, 13):
            if L.filas[y][x] in ('w', 'k', 's', 'H') and not (y == 8 and x in (5, 9)):
                L.pon(x, y, 'p')
    L.puntos('p', (4, 9), (3, 9), (10, 8), (11, 7), (12, 7), (13, 6))
    if est == 'normal':
        _limpia_boca(L)
        L.tramo(15, 9, 14, 'k')
        L.pon(15, 14, 'k')
    return L


def m04(est):
    """Mutante: la camiseta verde y los bultos de carne en la cabeza, la mejilla y el hombro"""
    L = _marty({'y': '#43a047', 'Y': '#2f7d33', 'f': '#e8958f', 'F': '#b95f59'})
    CARAS[est](L)
    bultos = [(19, 1), (20, 1), (18, 2), (19, 2), (20, 2), (21, 2), (18, 3), (19, 3), (20, 3), (21, 3), (22, 3), (19, 4), (20, 4),
              (21, 4), (22, 4), (20, 5), (21, 5), (19, 11), (20, 11), (19, 12), (20, 12), (21, 12), (20, 13), (21, 13),
              (0, 19), (1, 19), (0, 20), (1, 20), (2, 20), (0, 21), (1, 21), (1, 22)]
    L.puntos('f', *bultos)
    L.puntos('F', (21, 2), (22, 4), (21, 5), (21, 13), (2, 20), (1, 22))
    # un ojo en el bulto de la cabeza
    L.puntos('w', (19, 3), (20, 3))
    L.pon(20, 3, 'k')
    return L


def m05(est):
    """El alien: la piel verde, el pelo verde oscuro y dos antenas"""
    L = _marty({'s': '#8fd16a', 'S': '#6fae4f', 'h': '#2e7d32', 'H': '#1f5a24', 'y': '#b39ddb', 'Y': '#8f7bbd', 'v': '#d8ff6a'})
    L.filas = [['.'] * L.w for _ in range(3)] + L.filas
    CARAS[est](L, 3)
    L.puntos('k', (7, 2), (6, 1), (16, 2), (17, 1))
    L.puntos('v', (5, 0), (6, 0), (18, 0), (17, 0))
    return L


def m07(est):
    """El afro: la piel oscura, el pelo afro grande y la camiseta turquesa"""
    afro = ['...hhhhhhhhh', '.hhhhhhhhhhh', 'hhhhhhhhhhhh', 'hhhhhhhhhhhh', 'hhhhhhhhhhhh', 'hhhhhhhhhhhh', 'hhhhhhshhsss',
            'hhhhssssssss', '.hhsssHHHsss']
    cabeza = afro + CABEZA_MARTY[9:]
    L = _marty({'s': '#8d5a3b', 'S': '#6e4329', 'h': '#2a2422', 'H': '#1f1a19', 'y': '#2ec4b6', 'Y': '#22968b'}, cabeza)
    CARAS[est](L)
    return L


def m08(est):
    """El robot: la piel de metal, el casco con su luz roja, los ojos cian, la boca de rejilla y los tornillos"""
    L = _marty({'s': '#a7b0ba', 'S': '#8a939d', 'h': '#5b6673', 'H': '#454e59', 'y': '#cfd5dc', 'Y': '#aab2bb',
                'R': '#d23c3c', 'c': '#2aa0c0', 'g': '#6b7480'})
    CARAS[est](L)
    L.puntos('R', (11, 0), (12, 0))
    # los ojos cian en lugar de las pupilas negras
    for y in range(len(L.filas)):
        for x in range(L.w):
            if L.filas[y][x] == 'k' and 8 <= y <= 12:
                L.pon(x, y, 'c')
    # la boca, de rejilla (salvo dormido, que se apaga)
    if est != 'pausa':
        _limpia_boca(L)
        L.tramo(15, 9, 14, 'g')
        L.tramo(16, 9, 14, 'k')
        L.puntos('g', (10, 16), (12, 16), (14, 16))
    L.puntos('g', (4, 13), (19, 13))
    return L


# El de dos cabezas: dos cabezas más pequeñas, juntas, sobre un cuerpo ancho (32 de ancho)
_CABEZA = [
    '...hhhhhh.......', '..hhhhhhhh......', '.hhhhhhhhhh.....', '.hhhhhhhhhh.....', '.hhhsshssshh....', '.hhsssssssh.....',
    '.hsHHssHHsh.....', '.hswwssswwh.....', '.swwwsswwws.....', '.swwwsswwws.....', '.sswssswwss.....', '..ssssssss......',
    '..sssskkss......', '...sssssss......', '....ssss........', '.....ss.........',
]
# la cabeza, tres columnas hacia el centro: las dos, juntas sobre el cuerpo
CABEZA_DOS = ['...' + f[:-3] for f in _CABEZA]
CUERPO_DOS = [
    '....yyyyyyyyyyyy', '..yyyyyyyyyyyyyy', '..yyyyyyyyyyyyyy', '..ss.yyyyyyyyyyy', '..ss.yyyyyyyyyyy', '..ss.yyyyyyyyyyy',
    '.....yyyyyyyyyyy', '.....bbbbbbbbbbb', '.....bbbbbbbbbbb', '......bbbb......', '......bbbb......', '......bbbb......',
    '.....zzzzz......',
]


def m06(est):
    L = Lienzo(CABEZA_DOS + CUERPO_DOS, {**MARTY_PAL, 'y': '#d63a3a', 'Y': '#a92c2c'})
    # pupilas: en cada ojo (columnas 2 a 4 y 7 a 9 de cada cabeza)
    ojos = [(5, 6, 7), (10, 11, 12), (19, 20, 21), (24, 25, 26)]
    for xs in ojos:
        x0 = xs[0]
        if est == 'pausa':
            for x in xs:
                for y in (7, 8, 9, 10):
                    if L.filas[y][x] == 'w':
                        L.pon(x, y, 's')
            L.tramo(9, x0, x0 + 2, 'H')
        elif est == 'espera':
            L.puntos('k', (x0 + 1, 7), (x0 + 1, 8))
        else:
            L.puntos('k', (x0 + 1, 8), (x0 + 2, 8), (x0 + 1, 9), (x0 + 2, 9))
            if est == 'bloqueo':
                for x in xs:
                    if L.filas[7][x] == 'w':
                        L.pon(x, 7, 's')
    for x0 in (9, 21):
        if est == 'espera':
            L.puntos('k', (x0, 12), (x0 + 1, 12))
            L.puntos('r', (x0, 13), (x0 + 1, 13))
        elif est == 'bloqueo':
            L.tramo(12, x0 - 1, x0 + 2, 'k')
            L.tramo(13, x0 - 1, x0 + 2, 'w')
            L.pon(x0, 13, 'k')
        elif est == 'pausa':
            L.puntos('s', (x0, 12), (x0 + 1, 12))
            L.pon(x0 + 1, 13, 'k')
    if est == 'espera':
        L.puntos('d', (3, 5), (3, 6), (28, 5), (28, 6))
        for y in (19, 20, 21):
            L.puntos('.', (2, y), (3, y), (28, y), (29, y))
        L.puntos('s', (1, 15), (1, 14), (2, 13), (30, 15), (30, 14), (29, 13))
        L.puntos('y', (1, 16), (2, 16), (29, 16), (30, 16))
    return L


MARTYS5 = [
    ('M01', 'M-01', 'Marty', m01), ('M02', 'M-02', 'El azul', m02), ('M03', 'M-03', 'El malvado', m03),
    ('M04', 'M-04', 'Mutante', m04), ('M05', 'M-05', 'El alien', m05), ('M06', 'M-06', 'El de dos cabezas', m06),
    ('M07', 'M-07', 'El afro', m07), ('M08', 'M-08', 'El robot', m08),
]
