"""Iteración 4 de «Personajes» · las caras (26-oct, sobre RP4: «me quedo con este estilo, pero hazme otro que se
parezca más en la cara al Doc de verdad… 5 variantes de cara y cuerpo de este estilo, y 5 iguales de píxeles más
fino; para Marty, igual»). Cada personaje se dibuja a mano en la rejilla de RP4 y MP4 (Doc, 24 × 36; Marty, 24 × 32):
la mitad izquierda de cada fila, que se refleja, y luego lo que no es simétrico (las pupilas, la baba, una ceja, un
brazo). Con el estilo de RP4: brillo en los ojos, volumen y contorno de color (pixel.py de la it-3)."""

NEGRO = '#1b1b1f'
BLANCO = '#ffffff'

DOC_PAL = {
    'h': '#b9dcec', 'H': '#93c4da', 's': '#f2c6a0', 'S': '#d4a07a', 'k': NEGRO, 'w': BLANCO, 'b': '#6f93a6',
    'c': '#f4f6f8', 'C': '#c3ccd5', 'm': '#7cc4e8', 'n': '#8d6b4a', 'o': '#2e2a2a', 'g': '#8ee05a', 'r': '#6e2f33',
    'p': '#d7dde3', 'P': '#9aa6b1', 'v': '#62e07a', 'f': '#a9b4bd', 'F': '#7c8791',
}
MARTY_PAL = {
    'h': '#6b4423', 'H': '#4f3119', 's': '#f2c6a0', 'S': '#d4a07a', 'k': NEGRO, 'w': BLANCO, 'y': '#daa520',
    'Y': '#b8891a', 'b': '#2f5fb3', 'z': '#ecebe6', 'r': '#6e2f33', 'q': '#f0a29a', 'd': '#9fd8ff',
    'p': '#d7dde3', 'P': '#9aa6b1', 'v': '#62e07a',
}


class Lienzo:
    """Una rejilla de claves de color, a partir de las mitades izquierdas de sus filas"""

    def __init__(self, mitades, pal):
        assert all(len(m) == len(mitades[0]) for m in mitades), [len(m) for m in mitades]
        self.filas = [list(m + m[::-1]) for m in mitades]
        self.pal = pal

    @property
    def w(self):
        return len(self.filas[0])

    @property
    def h(self):
        return len(self.filas)

    def pon(self, x, y, k):
        if 0 <= y < self.h and 0 <= x < self.w:
            self.filas[y][x] = k

    def puntos(self, k, *xy):
        for x, y in xy:
            self.pon(x, y, k)

    def tramo(self, y, x0, x1, k):
        for x in range(x0, x1 + 1):
            self.pon(x, y, k)

    def ancho(self, mas):
        """Más columnas a cada lado (para un brazo que sale o una pistola)"""
        self.filas = [['.'] * mas + f + ['.'] * mas for f in self.filas]
        return mas

    def rejilla(self):
        return [[self.pal.get(c) if c != '.' else None for c in f] for f in self.filas]


# ---- Doc ----
# El cuerpo de la bata abierta, con el jersey azul y las manos a los lados
CUERPO_DOC = [
    '....ccccCCmm', '...cccccCmmm', '..ccccccCmmm', '..ccc.ccCmmm', '..ccc.ccCmmm', '..sss.ccCmmm', '......ccnnnn',
    '......ccnnnn', '........nnn.', '........nnn.', '........nnn.', '.......oooo.',
]


def doc_r1():
    """De la serie: el pelo en corona de pinchos, la ceja única, los ojos grandes con ojeras, la nariz larga, la boca
    ancha con los dientes y la baba"""
    L = Lienzo([
        '....h.......', '....hh....h.', 'h...hhh..hhh', 'hh..hhhhhhhh', '.hhhhhhhhhhh', '..hhhhhhhhhh', 'hhhhhhhhhhhh',
        '.hhhhhssssss', '..hhhsssssss', '...hhsssssss', '...hssbbbbbb', '...hsbbbbbbb', '...hssswwwss', '...ssswwwwws',
        '...ssswwwwws', '...sssswwwss', '...sssSSSSSs', '....sssssssS', '....ssssssSS', '....ssskkkkk', '....ssskwwkw',
        '....sssskkkk', '.....sssssss', '......cc..ss',
    ] + CUERPO_DOC, DOC_PAL)
    L.puntos('k', (8, 13), (9, 13), (8, 14), (9, 14), (14, 13), (15, 13), (14, 14), (15, 14))
    L.puntos('g', (16, 21), (16, 22))
    return L


def doc_r2():
    """Cara larga, como en la serie: la corona más baja, la frente estrecha, dos arrugas bajo los ojos, la barbilla con
    su pliegue y la boca cerrada, torcida hacia abajo; las manos en los bolsillos de la bata"""
    L = Lienzo([
        '..h.....h...', '..hh...hhh..', 'h.hhh.hhhhh.', 'hhhhhhhhhhhh', '.hhhhhhhhhhh', 'hhhhhhhsssss', '.hhhhhssssss',
        '..hhhsssssss', '...hhsbbbbbb', '....hbbbbbbb', '....ssswwwss', '....sswwwwws', '....sswwwwws', '....ssswwwss',
        '....ssSSSSSs', '.....ssSSSss', '.....ssssssS', '.....ssssssS', '.....sssssSS', '.....sssssss', '.....sskkkkk',
        '.....sksssss', '.....sssssss', '......ssssSS', '.......sssss', '..........ss',
        '....ccccCCmm', '...cccccCmmm', '..ccc.ccCmmm', '..ccc.ccCmmm', '..ccc.ccCmmm', '......ccnnnn', '........nnn.',
        '........nnn.', '........nnn.', '.......oooo.',
    ], DOC_PAL)
    L.puntos('k', (8, 11), (9, 11), (8, 12), (9, 12), (14, 11), (15, 11), (14, 12), (15, 12))
    L.puntos('g', (17, 22), (17, 23), (17, 24))
    return L


def doc_r3():
    """Mirando de lado, con la ceja levantada a un lado y media sonrisa; los brazos cruzados"""
    L = doc_r1()
    for (x, y) in ((8, 13), (9, 13), (8, 14), (9, 14), (14, 13), (15, 13), (14, 14), (15, 14)):
        L.pon(x, y, 'w')
    L.puntos('k', (9, 13), (10, 13), (9, 14), (10, 14), (16, 13), (17, 13), (16, 14), (17, 14))
    # la ceja: la mitad derecha, una fila más arriba
    L.tramo(9, 13, 18, 'b')
    L.tramo(11, 14, 18, 's')
    L.pon(19, 11, 's')
    # media sonrisa: la comisura derecha sube; sin dientes ni baba
    L.tramo(19, 7, 14, 'k')
    L.puntos('k', (15, 18), (16, 18))
    L.puntos('s', (15, 19), (16, 19))
    L.tramo(20, 7, 16, 's')
    L.tramo(21, 8, 15, 's')
    L.puntos('s', (16, 21), (16, 22))
    # los brazos cruzados: los antebrazos de lado a lado del pecho, con las manos asomando
    L.tramo(27, 2, 21, 'c')
    L.tramo(28, 2, 21, 'C')
    L.tramo(28, 3, 20, 'c')
    L.puntos('s', (6, 27), (7, 27), (16, 28), (17, 28))
    L.tramo(29, 2, 4, '.')
    L.tramo(29, 19, 21, '.')
    return L


def pistola(L, x0, y0):
    """La pistola de portales en la mano que está en (x0, y0) (dos filas de mano): el cuerpo gris encima, el mango oscuro
    en la mano, el morro verde delante y el tubo verde arriba"""
    L.tramo(y0 - 2, x0 - 1, x0 + 5, 'p')
    L.tramo(y0 - 1, x0 - 1, x0 + 5, 'p')
    L.tramo(y0 - 1, x0 + 1, x0 + 4, 'P')
    L.puntos('v', (x0 + 6, y0 - 2), (x0 + 6, y0 - 1), (x0 + 7, y0 - 2), (x0 + 7, y0 - 1))
    L.puntos('v', (x0 + 1, y0 - 3), (x0 + 2, y0 - 3), (x0 + 3, y0 - 3))
    L.puntos('P', (x0 + 1, y0), (x0 + 1, y0 + 1))


def doc_r4():
    """Con la pistola de portales en la mano, el brazo derecho estirado"""
    L = doc_r1()
    m = L.ancho(5)
    # el brazo derecho, en horizontal a la altura del pecho
    for y in (27, 28, 29):
        L.tramo(y, 19 + m, 21 + m, '.')
    L.tramo(26, 18 + m, 22 + m, 'c')
    L.tramo(27, 18 + m, 22 + m, 'c')
    L.puntos('s', (23 + m, 26), (23 + m, 27))
    pistola(L, 23 + m, 26)
    return L


def doc_r5():
    """Con la petaca: los párpados a media asta, los ojos cada uno a un lado, la boca abierta del eructo y la baba
    larga"""
    L = doc_r1()
    # los párpados: la mitad de arriba de cada ojo, de piel en sombra
    for x in range(6, 18):
        for y in (12, 13):
            if L.filas[y][x] in ('w', 'k'):
                L.pon(x, y, 'S')
    for (x, y) in ((8, 14), (9, 14), (14, 14), (15, 14)):
        L.pon(x, y, 'w')
    # un ojo a cada lado
    L.puntos('k', (7, 14), (8, 14), (7, 15), (8, 15), (15, 14), (16, 14), (15, 15), (16, 15))
    # la boca abierta: el hueco oscuro
    L.tramo(19, 8, 15, 'k')
    L.tramo(20, 8, 15, 'r')
    L.puntos('k', (8, 20), (15, 20))
    L.tramo(21, 9, 14, 'k')
    L.puntos('s', (7, 19), (16, 19), (7, 20), (16, 20))
    L.puntos('g', (15, 21), (15, 22), (16, 22), (16, 23), (16, 24))
    # la petaca, en la mano derecha
    L.tramo(29, 19, 21, 's')
    L.tramo(26, 19, 21, 'f')
    L.tramo(27, 19, 21, 'f')
    L.tramo(28, 19, 21, 'F')
    L.pon(20, 25, 'F')
    return L


DOCS = [
    ('R1', 'De la serie', 'El pelo en corona de pinchos, la ceja única, los ojos grandes con ojeras, la nariz larga y la '
     'boca ancha con los dientes y la baba', ['Ceja única', 'Ojeras', 'Baba'], doc_r1),
    ('R2', 'Cara larga', 'La cara más larga y estrecha, como en la serie: la corona más baja, dos arrugas bajo los ojos, '
     'el pliegue de la barbilla y la boca cerrada, torcida; las manos en los bolsillos', ['Cara larga', 'Arrugas',
                                                                                        'Manos en los bolsillos'], doc_r2),
    ('R3', 'De lado', 'Mirando de lado, con media ceja levantada y media sonrisa; los brazos cruzados',
     ['Mirada de lado', 'Ceja levantada', 'Brazos cruzados'], doc_r3),
    ('R4', 'Con la pistola', 'La cara de R1 y el brazo estirado con la pistola de portales', ['Pistola de portales',
                                                                                              'Brazo estirado'], doc_r4),
    ('R5', 'Con la petaca', 'Los párpados a media asta, un ojo a cada lado, la boca abierta del eructo, la baba larga y '
     'la petaca en la mano', ['Párpados', 'Eructo', 'Petaca'], doc_r5),
]


# ---- Marty ----
CUERPO_MARTY = [
    '....yyyyyyYY', '..yyyyyyyyyy', '..yyyyyyyyyy', '..ss.yyyyyyy', '..ss.yyyyyyy', '..ss.yyyyyyy', '.....yyyyyyy',
    '.....bbbbbbb', '.....bbbbbbb', '......bbbb..', '......bbbb..', '......bbbb..', '.....zzzzz..',
]
CABEZA_MARTY = [
    '......hhhhhh', '....hhhhhhhh', '...hhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhhhh', '..hhhsshhsss',
    '..hhssssssss', '..hsssHHHsss', '..hssswwwsss', '..hsswwwwwss', '..hsswwwwwss', '..hssswwwsss', '...sssssssss',
    '...ssssssssS', '...sssssskks', '....sssssssk', '.....sssssss', '..........ss',
]


def marty_m1():
    """De la serie: el pelo redondo con su flequillo, las cejas cortas, los ojos grandes y la boca nerviosa en zigzag"""
    L = Lienzo(CABEZA_MARTY + CUERPO_MARTY, MARTY_PAL)
    L.puntos('k', (7, 10), (8, 10), (7, 11), (8, 11), (15, 10), (16, 10), (15, 11), (16, 11))
    return L


def marty_m2():
    """Asustado: las cejas en pico, los ojos más altos con las pupilas pequeñas, la boca abierta en «o», una gota de
    sudor y los brazos arriba"""
    L = marty_m1()
    # las cejas, con la punta de dentro hacia arriba
    L.tramo(8, 6, 8, 's')
    L.tramo(8, 15, 17, 's')
    L.puntos('H', (6, 7), (7, 7), (8, 6), (17, 7), (16, 7), (15, 6))
    # los ojos, una fila más altos por arriba
    L.puntos('w', (6, 8), (7, 8), (8, 8), (15, 8), (16, 8), (17, 8))
    for (x, y) in ((7, 10), (8, 10), (7, 11), (8, 11), (15, 10), (16, 10), (15, 11), (16, 11)):
        L.pon(x, y, 'w')
    L.puntos('k', (7, 9), (8, 9), (7, 10), (8, 10), (15, 9), (16, 9), (15, 10), (16, 10))
    # la boca en «o»
    L.tramo(15, 9, 14, 's')
    L.tramo(16, 9, 14, 's')
    L.tramo(15, 10, 13, 'k')
    L.puntos('k', (10, 16), (13, 16), (10, 17), (13, 17))
    L.tramo(16, 11, 12, 'r')
    L.tramo(17, 11, 12, 'r')
    L.tramo(18, 10, 13, 'k')
    L.pon(18, 18, '.')
    L.pon(5, 18, '.')
    # una gota de sudor en la sien
    L.puntos('d', (20, 7), (20, 8), (19, 9), (20, 9))
    # los brazos arriba: las mangas y las manos junto a la cara
    for y in (22, 23, 24):
        L.puntos('.', (2, y), (3, y), (20, y), (21, y))
    L.puntos('s', (1, 18), (1, 17), (2, 16), (1, 16), (22, 18), (22, 17), (21, 16), (22, 16))
    L.puntos('y', (1, 19), (2, 19), (21, 19), (22, 19))
    return L


def marty_m3():
    """Mirando de lado, de reojo: las pupilas a un lado, una ceja más alta y la boca recta, torcida"""
    L = marty_m1()
    for (x, y) in ((7, 10), (8, 10), (7, 11), (8, 11), (15, 10), (16, 10), (15, 11), (16, 11)):
        L.pon(x, y, 'w')
    L.puntos('k', (5, 10), (6, 10), (5, 11), (6, 11), (13, 10), (14, 10), (13, 11), (14, 11))
    # la ceja derecha, más alta
    L.tramo(8, 15, 17, 's')
    L.tramo(7, 15, 17, 'H')
    # la boca, recta y torcida
    L.tramo(15, 9, 14, 's')
    L.tramo(16, 9, 14, 's')
    L.tramo(16, 9, 13, 'k')
    L.pon(14, 15, 'k')
    return L


def marty_m4():
    """Contento: la sonrisa, los mofletes colorados y la mirada hacia arriba"""
    L = marty_m1()
    for (x, y) in ((7, 10), (8, 10), (7, 11), (8, 11), (15, 10), (16, 10), (15, 11), (16, 11)):
        L.pon(x, y, 'w')
    L.puntos('k', (7, 9), (8, 9), (7, 10), (8, 10), (15, 9), (16, 9), (15, 10), (16, 10))
    L.tramo(15, 9, 14, 's')
    L.tramo(16, 9, 14, 's')
    L.puntos('k', (8, 15), (15, 15))
    L.tramo(16, 9, 14, 'k')
    L.puntos('q', (4, 13), (5, 13), (18, 13), (19, 13))
    return L


def marty_m5():
    """Con la pistola de portales en la mano, el brazo derecho estirado"""
    L = marty_m1()
    m = L.ancho(5)
    for y in (22, 23, 24):
        L.puntos('.', (20 + m, y), (21 + m, y))
    L.tramo(20, 19 + m, 22 + m, 'y')
    L.tramo(21, 19 + m, 22 + m, 's')
    L.puntos('s', (23 + m, 21), (23 + m, 22))
    pistola(L, 23 + m, 21)
    return L


MARTYS = [
    ('M1', 'De la serie', 'El pelo redondo con su flequillo, las cejas cortas, los ojos grandes y la boca nerviosa en '
     'zigzag', ['Flequillo', 'Cejas', 'Boca en zigzag'], marty_m1),
    ('M2', 'Asustado', 'Las cejas en pico, los ojos más altos con las pupilas pequeñas, la boca en «o», una gota de sudor '
     'y los brazos arriba', ['Cejas en pico', 'Boca en «o»', 'Brazos arriba'], marty_m2),
    ('M3', 'De reojo', 'Las pupilas a un lado, una ceja más alta y la boca recta, torcida', ['De reojo',
                                                                                         'Ceja levantada'], marty_m3),
    ('M4', 'Contento', 'La sonrisa, los mofletes colorados y la mirada hacia arriba', ['Sonrisa', 'Mofletes'], marty_m4),
    ('M5', 'Con la pistola', 'La cara de M1 y el brazo estirado con la pistola de portales', ['Pistola de portales'],
     marty_m5),
]
