"""Iteración 6 de «Personajes» (26-oct, «1b»): tres Mutante nuevos, mucho más Mutante, con sus cuatro
estados; Doc cabreado de tres maneras, para cuando hay algún bloqueo; y los tres estados que faltan (esperando,
bloqueado y pausado) de los ocho de reserva, para repartirse entre las sesiones con los Martys. Todo en el estilo de
la 4 (RC y MC)."""
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
for d in ('../it5', '../it4', '../it3'):
    sys.path.insert(0, os.path.normpath(os.path.join(AQUI, d)))
import caras  # noqa: E402
import martys5  # noqa: E402
import otros5  # noqa: E402
from caras import BLANCO, Lienzo, MARTY_PAL, NEGRO  # noqa: E402

CARNE = {'f': '#e8958f', 'F': '#b95f59', 'g': '#8a3f3c', 'u': '#f6b8b0', 'v': '#c45a6a'}


# ---- Los ojos de carne de los Mutante: blanco de 2 × 2 o 3 × 3 con su pupila, que se cierran al dormir ----
def ojo(L, x, y, est, lado=2):
    """Un ojo de más en (x, y): blanco con la pupila; dormido, una raya; esperando, la pupila arriba"""
    if est == 'pausa':
        L.tramo(y + lado - 1, x, x + lado - 1, 'g')
        return
    for yy in range(y, y + lado + 1):
        L.tramo(yy, x, x + lado, 'w')
    py = y if est == 'espera' else y + 1
    L.puntos('k', (x + 1, py), (x + 2, py), (x + 1, py + 1), (x + 2, py + 1))
    if est == 'bloqueo':
        L.tramo(y - 1, x, x + lado, 'g')


def mancha(L, puntos, k='f'):
    L.puntos(k, *puntos)


def rect(L, x0, y0, x1, y1, k):
    for y in range(y0, y1 + 1):
        L.tramo(y, x0, x1, k)


def mutante_c1(est):
    """Bultos por todas partes: media cabeza hecha un bulto de carne con dos ojos, el brazo derecho un tentáculo y
    bultos en el pecho y en una pierna; la otra mitad, Marty"""
    L = martys5._marty({'y': '#43a047', 'Y': '#2f7d33', **CARNE})
    martys5.CARAS[est](L)
    # el bulto de la cabeza: del pelo a la mejilla derecha
    for y, (x0, x1) in enumerate([(15, 19), (14, 21), (13, 22), (13, 23), (13, 23), (13, 23), (14, 23), (15, 23), (14, 23),
                                  (14, 23), (14, 23), (14, 23), (15, 22), (16, 22)]):
        L.tramo(y, x0, x1, 'f')
    mancha(L, [(19, 1), (20, 2), (21, 3), (22, 5), (22, 6), (22, 9), (22, 10), (21, 12), (20, 13)], 'F')
    mancha(L, [(15, 1), (14, 3), (14, 4)], 'u')
    ojo(L, 16, 3, est)
    ojo(L, 19, 8, est, 3)
    # el brazo derecho, un tentáculo que cuelga
    for y in range(19, 25):
        L.puntos('.', (20, y), (21, y))
    for y, x in ((19, 21), (20, 22), (21, 22), (22, 23), (23, 23), (24, 22), (25, 22), (26, 21), (27, 22)):
        L.puntos('f', (x, y), (x - 1, y))
    mancha(L, [(22, 21), (23, 23), (22, 25), (21, 27)], 'F')
    # bultos en el pecho y en una pierna
    rect(L, 7, 21, 9, 23, 'f')
    mancha(L, [(8, 20), (6, 22), (9, 24)], 'f')
    mancha(L, [(9, 23), (7, 21)], 'F')
    rect(L, 14, 27, 17, 29, 'f')
    mancha(L, [(17, 29), (14, 27)], 'F')
    return L


def mutante_c2(est):
    """La cara deformada: un ojo enorme, el otro pequeño, un tercero en la frente, la boca torcida y llena de dientes,
    y bultos en la cabeza y en la barriga"""
    L = martys5._marty({'y': '#43a047', 'Y': '#2f7d33', **CARNE})
    # la cara, en blanco: se dibuja entera
    for y in range(8, 18):
        for x in range(4, 20):
            if L.filas[y][x] in ('w', 'k', 'H', 'S'):
                L.pon(x, y, 's')
    # el ojo enorme (izquierda) y el pequeño (derecha)
    if est == 'pausa':
        L.tramo(11, 4, 10, 'g')
        L.puntos('g', (4, 10), (10, 10))
        L.tramo(11, 15, 17, 'g')
    else:
        rect(L, 4, 8, 10, 13, 'w')
        L.puntos('s', (4, 8), (10, 8), (4, 13), (10, 13))
        py = 8 if est == 'espera' else 10
        rect(L, 6, py + (1 if est == 'espera' else 0), 8, py + (2 if est == 'espera' else 2), 'k')
        rect(L, 15, 10, 17, 12, 'w')
        L.pon(16, 10 if est == 'espera' else 11, 'k')
        if est == 'bloqueo':
            L.puntos('g', (3, 7), (4, 7), (5, 7), (8, 8), (9, 8), (10, 8), (15, 9), (16, 9), (17, 9))
            L.puntos('s', (4, 8), (5, 8))
    ojo(L, 11, 4, est)
    # la boca torcida y llena de dientes
    if est == 'pausa':
        L.tramo(16, 9, 13, 'g')
    elif est == 'espera':
        rect(L, 9, 14, 13, 17, 'k')
        rect(L, 10, 15, 12, 16, 'r')
    else:
        L.tramo(14, 6, 17, 'k')
        L.tramo(15, 5, 17, 'w')
        L.tramo(16, 6, 16, 'k')
        L.puntos('k', (7, 15), (10, 15), (13, 15), (16, 15))
        L.puntos('w', (8, 16), (11, 16), (14, 16))
        if est == 'normal':
            L.puntos('g', (17, 17), (17, 18))
    # bultos en la cabeza y en la barriga
    for y, (x0, x1) in enumerate([(0, 3), (0, 3), (0, 2), (1, 3), (0, 3), (0, 2)], start=2):
        L.tramo(y, x0, x1, 'f')
    for y, (x0, x1) in enumerate([(19, 22), (19, 23), (20, 23), (20, 23)], start=2):
        L.tramo(y, x0, x1, 'f')
    mancha(L, [(1, 3), (2, 5), (21, 3), (22, 5)], 'F')
    rect(L, 9, 22, 15, 25, 'f')
    mancha(L, [(8, 23), (16, 23), (12, 21), (13, 21)], 'f')
    mancha(L, [(14, 25), (15, 24), (9, 25)], 'F')
    ojo(L, 11, 22, est)
    if est == 'espera':
        L.puntos('d', (20, 7), (20, 8), (19, 9), (20, 9))
    return L


# El monstruo: todo carne, con el mechón de Marty, su cara en medio, más ojos, tentáculos y un trozo de camiseta
MONSTRUO = [
    '.........hhh', '........hhhh', '.......hhhhh', '......ffhhhh', '....ffffffff', '...fffffffff', '..ffffffffff',
    '..ffffffffff', '.fffffffffff', '.ffffsssssss', 'fffffsssssss', 'fffffsssssss', 'fffffsssssss', 'ffffffssssss',
    'ffffffssssss', 'ffffffffssss', '.fffffffffff', '..ffffyyyyyy', '..fffyyyyyyy', '.ffffyyyyyyy', 'ff.ffyyyyyyy',
    'f..fffffffff', 'f..fffffffff', '...fffffffff', '...fffffffff', '....ffffffff', '....fff..fff', '...ffff..fff',
    '...fff....ff', '...FFF....FF',
]


def mutante_c3(est):
    """El monstruo: todo carne, con el mechón de Marty, su cara en medio, cuatro ojos de más, tentáculos y un trozo de
    la camiseta verde"""
    L = Lienzo(MONSTRUO, {**MARTY_PAL, 'y': '#43a047', 'Y': '#2f7d33', **CARNE})
    # la cara de Marty, en medio (los ojos en las columnas 7 a 10 y 13 a 16)
    if est == 'pausa':
        L.tramo(11, 7, 10, 'H')
        L.tramo(11, 13, 16, 'H')
        L.tramo(14, 11, 12, 'k')
    else:
        rect(L, 7, 10, 10, 12, 'w')
        rect(L, 13, 10, 16, 12, 'w')
        py = 10 if est == 'espera' else 11
        L.puntos('k', (8, py), (9, py), (8, py + 1), (9, py + 1), (14, py), (15, py), (14, py + 1), (15, py + 1))
        if est == 'bloqueo':
            L.puntos('H', (7, 9), (8, 9), (9, 10), (16, 9), (15, 9), (14, 10))
            L.tramo(14, 9, 14, 'k')
            L.tramo(15, 9, 14, 'w')
            L.puntos('k', (10, 15), (12, 15), (14, 15))
            L.tramo(16, 9, 14, 'k')
        elif est == 'espera':
            rect(L, 10, 14, 13, 16, 'k')
            rect(L, 11, 15, 12, 15, 'r')
            L.puntos('d', (18, 8), (18, 9), (17, 10))
        else:
            L.puntos('k', (9, 14), (10, 15), (11, 14), (12, 15), (13, 14), (14, 15))
    # cuatro ojos de más, repartidos
    ojo(L, 3, 6, est)
    ojo(L, 19, 5, est)
    ojo(L, 2, 14, est)
    ojo(L, 18, 24, est)
    # sombras de la carne y unas venas
    mancha(L, [(1, 11), (0, 13), (22, 9), (23, 11), (5, 23), (18, 22), (20, 25)], 'F')
    mancha(L, [(6, 5), (17, 4), (4, 20), (19, 20)], 'u')
    mancha(L, [(6, 24), (7, 25), (16, 26)], 'v')
    if est == 'espera':
        L.puntos('f', (0, 17), (0, 16), (23, 17), (23, 16))
        L.puntos('.', (0, 21), (0, 22), (23, 21), (23, 22))
    return L


MUTANTE = [
    ('C1', 'Bultos por todas partes', 'Media cabeza hecha un bulto de carne con dos ojos, el brazo derecho un tentáculo y '
     'bultos en el pecho y en una pierna; la otra mitad, Marty', mutante_c1),
    ('C2', 'La cara deformada', 'Un ojo enorme, el otro pequeño, un tercero en la frente, la boca torcida y llena de dientes, '
     'y bultos en la cabeza y en la barriga', mutante_c2),
    ('C3', 'El monstruo', 'Todo carne, con el mechón de Marty, su cara en medio, cuatro ojos de más, tentáculos y un trozo de '
     'la camiseta verde', mutante_c3),
]


# ---- Doc cabreado, para cuando hay algún bloqueo ----
def _ceno(L):
    """La ceja única, en uve: las puntas arriba y el centro abajo, y los ojos entornados"""
    L.tramo(10, 5, 18, 's')
    L.tramo(11, 5, 18, 's')
    L.puntos('b', (5, 10), (6, 10), (7, 10), (8, 11), (9, 11), (10, 12), (11, 12), (12, 12), (13, 12), (14, 11), (15, 11),
             (16, 10), (17, 10), (18, 10))
    for x in range(6, 18):
        if L.filas[12][x] == 'w':
            L.pon(x, 12, 'S')


def _vena(L, x, y):
    L.puntos('V', (x, y), (x + 1, y), (x, y + 1), (x + 2, y + 1), (x + 1, y + 2), (x + 2, y + 2))


def doc_ca(est=None):
    """Ceño y dientes: la ceja en uve, los ojos entornados, los dientes apretados, una vena en la frente y los puños"""
    L = caras.doc_r1()
    L.pal = {**L.pal, 'V': '#e05a5a'}
    _ceno(L)
    L.tramo(19, 7, 16, 'k')
    L.tramo(20, 7, 16, 'w')
    L.puntos('k', (7, 20), (9, 20), (11, 20), (12, 20), (14, 20), (16, 20))
    L.tramo(21, 7, 16, 'k')
    _vena(L, 15, 7)
    return L


def doc_cb(est=None):
    """Gritando: la ceja en uve, la boca muy abierta con los dientes de arriba, dos venas y el puño en alto"""
    L = caras.doc_r1()
    L.pal = {**L.pal, 'V': '#e05a5a'}
    _ceno(L)
    for y in range(19, 24):
        L.tramo(y, 7, 16, 's')
    L.tramo(19, 8, 15, 'k')
    L.tramo(20, 8, 15, 'w')
    L.puntos('k', (7, 20), (16, 20), (7, 21), (16, 21), (8, 22), (15, 22))
    L.tramo(21, 8, 15, 'r')
    L.tramo(22, 9, 14, 'r')
    L.tramo(23, 9, 14, 'k')
    L.puntos('s', (16, 22), (16, 23), (17, 22))
    _vena(L, 15, 7)
    _vena(L, 6, 7)
    # el puño derecho en alto
    for y in range(27, 30):
        L.tramo(y, 19, 21, '.')
    L.puntos('c', (21, 25), (22, 24), (22, 23), (23, 22), (23, 21))
    L.puntos('s', (22, 19), (23, 19), (22, 20), (23, 20), (24, 20), (24, 19))
    return L


def doc_cc(est=None):
    """Con la pistola, apuntando: la cara de A, cabreado, y el brazo estirado con la pistola de portales"""
    L = caras.doc_r4()
    L.pal = {**L.pal, 'V': '#e05a5a'}
    m = 5
    # la cara cabreada, desplazada por el margen que abre la pistola
    _ceno_m(L, m)
    L.tramo(19, 7 + m, 16 + m, 'k')
    L.tramo(20, 7 + m, 16 + m, 'w')
    L.puntos('k', (7 + m, 20), (9 + m, 20), (11 + m, 20), (12 + m, 20), (14 + m, 20), (16 + m, 20))
    L.tramo(21, 7 + m, 16 + m, 'k')
    L.puntos('g', (16 + m, 21), (16 + m, 22))
    _vena(L, 15 + m, 7)
    return L


def _ceno_m(L, m):
    L.tramo(10, 5 + m, 18 + m, 's')
    L.tramo(11, 5 + m, 18 + m, 's')
    L.puntos('b', *((x + m, y) for x, y in ((5, 10), (6, 10), (7, 10), (8, 11), (9, 11), (10, 12), (11, 12), (12, 12), (13, 12),
                                            (14, 11), (15, 11), (16, 10), (17, 10), (18, 10))))
    for x in range(6 + m, 18 + m):
        if L.filas[12][x] == 'w':
            L.pon(x, 12, 'S')


DOCS = [
    ('RA', 'Ceño y dientes', 'La ceja en uve, los ojos entornados, los dientes apretados y una vena en la frente', doc_ca),
    ('RB', 'Gritando', 'La ceja en uve, la boca muy abierta, dos venas y el puño en alto', doc_cb),
    ('RC', 'Con la pistola, apuntando', 'Cabreado como RA, y el brazo estirado con la pistola de portales', doc_cc),
]


# ---- Los tres estados que faltan de los de reserva ----
def _con_camisa(fn_estado, camisa):
    """Los estados de Marty con la manga del color de su camiseta (los brazos arriba de «esperando»)"""
    def aplica(L):
        fn_estado(L)
        if fn_estado is martys5.espera:
            L.puntos(camisa, (1, 19), (2, 19), (21, 19), (22, 19))
    return aplica


def humano(lienzo_fn, camisa):
    def hace(est):
        L = lienzo_fn()
        if est != 'normal':
            _con_camisa(martys5.CARAS[est], camisa)(L)
        return L.rejilla()
    return hace


def terror(est):
    L = otros5.terror_l()
    if est == 'espera':
        L.puntos('w', (6, 11), (7, 11), (16, 11), (17, 11))
        L.puntos('k', (6, 9), (7, 9), (16, 9), (17, 9), (6, 10), (7, 10), (16, 10), (17, 10))
        for y in (14, 15, 16):
            L.tramo(y, 5, 18, 's')
        L.tramo(14, 10, 13, 'k')
        L.puntos('k', (10, 15), (13, 15), (10, 16), (13, 16))
        L.tramo(15, 11, 12, 'r')
        L.tramo(17, 10, 13, 'k')
        L.puntos('d', (20, 8), (20, 9), (19, 10))
    elif est == 'bloqueo':
        L.puntos('k', (4, 7), (5, 7), (6, 8), (7, 8), (19, 7), (18, 7), (17, 8), (16, 8))
        for x in range(4, 20):
            if L.filas[9][x] == 'w':
                L.pon(x, 9, 's')
        L.puntos('c', (1, 22), (1, 23), (22, 22), (22, 23))
    elif est == 'pausa':
        for y in (9, 10, 11):
            for x in range(4, 20):
                if L.filas[y][x] in ('w', 'k'):
                    L.pon(x, y, 's')
        L.tramo(10, 4, 8, 'S')
        L.tramo(10, 15, 19, 'S')
        for y in (14, 15, 16):
            L.tramo(y, 5, 18, 's')
        L.tramo(15, 10, 13, 'k')
    return L.rejilla()


def _rejilla(r, cambios, pal_extra=None):
    out = [f[:] for f in r]
    for x, y, c in cambios:
        if 0 <= y < len(out) and 0 <= x < len(out[0]):
            out[y][x] = c
    return out


def copito(est):
    r = otros5.copito()
    W, K, BL = BLANCO, NEGRO, '#f4f4f2'
    if est == 'espera':
        return _rejilla(r, [(18, 9, BL), (19, 9, BL), (18, 7, K), (19, 7, K), (14, 5, '#9fd8ff'), (14, 6, '#9fd8ff'),
                            (13, 7, '#9fd8ff')])
    if est == 'bloqueo':
        return _rejilla(r, [(16, 6, K), (17, 6, K), (18, 7, K), (19, 7, K), (20, 7, K)] + [(x, 12, K) for x in range(21, 28)]
                        + [(22, 12, W), (24, 12, W), (26, 12, W)])
    if est == 'pausa':
        return _rejilla(r, [(18, 8, BL), (19, 8, BL), (18, 9, BL), (19, 9, BL)] + [(x, 9, K) for x in range(17, 21)]
                        + [(x, y, '#3a6a80') for x in range(20, 24) for y in (2, 3)])
    return r


def pompis(est):
    r = otros5.pompis()
    Y, K, W, R = '#f4c542', NEGRO, BLANCO, '#c0392b'
    boca = [(x, y, Y) for x in range(12, 20) for y in range(20, 24)]
    if est == 'espera':
        ojos = [(x, y, W) for x in (10, 11, 20, 21) for y in (14, 15)] + [(x, y, K) for x in (10, 11, 20, 21) for y in (12, 13)]
        o = [(x, 20, K) for x in range(14, 18)] + [(14, 21, K), (17, 21, K), (14, 22, K), (17, 22, K)] + \
            [(x, 23, K) for x in range(14, 18)] + [(15, 21, R), (16, 21, R), (15, 22, R), (16, 22, R)]
        return _rejilla(r, ojos + boca + o + [(27, 9, '#9fd8ff'), (27, 10, '#9fd8ff'), (26, 11, '#9fd8ff')])
    if est == 'bloqueo':
        cejas = [(9, 10, K), (10, 10, K), (11, 11, K), (12, 11, K), (13, 11, K), (22, 10, K), (21, 10, K), (20, 11, K), (19, 11, K),
                 (18, 11, K)]
        dientes = [(x, 21, K) for x in range(12, 20)] + [(x, 22, W) for x in range(13, 19)] + [(15, 22, K), (16, 22, K)] + \
            [(x, 23, K) for x in range(12, 20)]
        return _rejilla(r, cejas + boca + dientes)
    if est == 'pausa':
        ojos = [(x, y, Y) for x in list(range(8, 14)) + list(range(18, 24)) for y in range(12, 18)]
        rayas = [(x, 15, K) for x in list(range(9, 13)) + list(range(19, 23))] + [(8, 14, K), (13, 14, K), (18, 14, K), (23, 14, K)]
        return _rejilla(r, ojos + rayas + boca + [(15, 21, K), (16, 21, K)])
    return r


def butter(est):
    r = otros5.butter()
    G = '#c4c8ce'
    visor = [(x, y) for x in range(14, 20) for y in (8, 9)]
    # la luz de la antena, del color del visor (it-6: «trabajando, estas dos, azul»; «esperando, ambas en naranja»)
    antena = [(16, 0), (17, 0), (16, 1), (17, 1)]
    if est == 'normal':
        return _rejilla(r, [(x, y, '#5aa9ff') for x, y in visor + antena])
    if est == 'espera':
        return _rejilla(r, [(x, y, '#f0a03c') for x, y in visor + antena] + [(14, 8, G), (19, 8, G)])
    if est == 'bloqueo':
        return _rejilla(r, [(x, y, '#ff2a2a') for x, y in visor] + [(14, 8, G), (15, 8, G), (18, 8, G), (19, 8, G)])
    if est == 'pausa':
        return _rejilla(r, [(x, y, '#4a4f57') for x, y in visor] + [(16, 0, '#4a4f57'), (17, 0, '#4a4f57'), (16, 1, '#4a4f57'),
                                                                     (17, 1, '#4a4f57')])
    return r


def michi(est):
    r = otros5.michi()
    O, Om, K, W = '#e8892a', '#f7c27c', NEGRO, BLANCO
    boca = [(x, y, Om) for x in range(12, 20) for y in (16, 17)]
    if est == 'espera':
        ojos = [(x, y, W) for x in (10, 11, 22, 23) for y in (10, 11)] + [(x, y, K) for x in (10, 11, 22, 23) for y in (8, 9)]
        o = [(x, 16, K) for x in range(14, 18)] + [(14, 17, K), (17, 17, K), (15, 17, '#8a2a2a'), (16, 17, '#8a2a2a')]
        return _rejilla(r, ojos + boca + o + [(28, 5, '#9fd8ff'), (28, 6, '#9fd8ff'), (27, 7, '#9fd8ff')])
    if est == 'bloqueo':
        cejas = [(8, 6, K), (9, 6, K), (10, 7, K), (11, 7, K), (23, 6, K), (22, 6, K), (21, 7, K), (20, 7, K)]
        dientes = [(x, 16, W) for x in range(12, 20)] + [(13, 16, K), (15, 16, K), (17, 16, K)] + [(x, 17, K) for x in range(12, 20)]
        return _rejilla(r, cejas + boca + dientes)
    if est == 'pausa':
        ojos = [(x, y, O) for x in list(range(8, 12)) + list(range(20, 24)) for y in range(8, 12)]
        rayas = [(x, 10, K) for x in list(range(8, 12)) + list(range(20, 24))]
        return _rejilla(r, ojos + rayas + boca + [(15, 16, K), (16, 16, K)])
    return r


RESERVA6 = [
    ('PR1', 'Verano', humano(otros5.verano_l, 'p')), ('PR2', 'Liz', humano(otros5.liz_l, 'r')),
    ('PR3', 'Gerardo', humano(otros5.gerardo_l, 'g')), ('PR4', 'Copito', copito), ('PR5', 'Terror', terror),
    ('PR6', 'Pompis', pompis), ('PR7', 'El robot de la mantequilla', butter), ('PR8', 'Michi', michi),
]
ESTADOS_NUEVOS = [e for e in martys5.ESTADOS if e[0] != 'normal']
