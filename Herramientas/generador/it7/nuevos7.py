"""Iteración 7 de «Personajes» · 24 personajes nuevos para las sesiones (28-oct: «genérame otros 24 diseños
posibles para poner en la pestaña de martys y te digo cuáles meto y cuáles descarto»). Todos sobre la cabeza y el
cuerpo de Marty de la it-4 y con las cuatro caras de la it-5 (normal, esperando, bloqueado y pausado): así cada uno sale
con sus estados y en el estilo de los de ahora (brillo, volumen y contorno de color). Cada función devuelve el lienzo
de un estado y cuántas filas se le añadieron arriba (un sombrero alto, una corona, unos cuernos), para recortar su
cabeza en la pestaña."""
import math
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
for d in ('it3', 'it4', 'it5'):
    sys.path.insert(0, os.path.join(AQUI, '..', d))
from caras import CABEZA_MARTY, CUERPO_MARTY, Lienzo, MARTY_PAL  # noqa: E402
from martys5 import CARAS, _limpia_boca, espera  # noqa: E402

# El pelo largo de Verano y la melena de Liz (otros5.py de la it-5), para las chicas
LARGO = [
    '......hhhhhh', '....hhhhhhhh', '...hhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhsss',
    '..hhhsssssss', '..hhssHHHsss', '..hhsswwwsss', '..hhswwwwwss', '..hhswwwwwss', '..hhsswwwsss', '..hhssssssss',
    '..hhsssssssS', '..hhssssssss', '..hhhsssssss', '..hhh..sssss', '..hhh.....ss',
]
MELENA = LARGO[:16] + ['..hhhsssssss', '...hh.ssssss', '..........ss']
# El cuerpo de las chicas de pelo largo: el pelo cae por los hombros
CUERPO_LARGO = ['..hhyyyyyyyy', '..hhyyyyyyyy'] + CUERPO_MARTY[3:]
# Calvo: la cabeza de Marty sin pelo (para el gorro de pelo de lado, la cresta y el engranaje)
CALVO = ['......ssssss', '....ssssssss', '...sssssssss', '..ssssssssss', '..ssssssssss', '..ssssssssss',
         '..ssssssssss', '..ssssssssss'] + [f.replace('h', 's') for f in CABEZA_MARTY[8:]]


def _L(cabeza, cuerpo, pal):
    return Lienzo(cabeza + cuerpo, {**MARTY_PAL, **pal})


def _arriba(L, n):
    """n filas vacías encima, para lo que sale por arriba de la cabeza"""
    L.filas = [['.'] * L.w for _ in range(n)] + L.filas
    return n


def _sobre(L, k, donde, *xy):
    """Pinta k solo donde ahora hay una de las claves de «donde»"""
    for x, y in xy:
        if 0 <= y < L.h and 0 <= x < L.w and L.filas[y][x] in donde:
            L.pon(x, y, k)


def _cara(L, est, dy=0, brazos=True):
    if est == 'espera':
        espera(L, dy, brazos)
    else:
        CARAS[est](L, dy)


def _sonrisa(L, dy=0):
    _limpia_boca(L, dy)
    L.tramo(16 + dy, 10, 13, 'k')
    L.puntos('k', (9, 15 + dy), (14, 15 + dy))


def _gafas(L, color, dy=0):
    L.pal['g'] = color
    for x0, x1 in ((4, 10), (13, 19)):
        L.tramo(8 + dy, x0 + 1, x1 - 1, 'g')
        L.tramo(13 + dy, x0 + 1, x1 - 1, 'g')
        for y in range(9, 13):
            L.puntos('g', (x0, y + dy), (x1, y + dy))
    L.puntos('g', (11, 10 + dy), (12, 10 + dy))


def _cuello_y_corbata(L, corbata, dy=0):
    L.pal['t'] = corbata
    L.puntos('x', (9, 19 + dy), (10, 19 + dy), (13, 19 + dy), (14, 19 + dy))
    for y in range(19, 25):
        L.puntos('t', (11, y + dy), (12, y + dy))


# ---- Martys ----
def poli(est):
    """Marty Poli: la gorra de policía con su placa, la camisa azul marino y la placa en el pecho"""
    gorra = ['....cccccccc', '...ccccccccc', '..cccccccccc', '..cccccccccc', '.vvvvvvvvvvv', '..hhhhhhhhhh']
    L = _L(gorra + CABEZA_MARTY[6:], CUERPO_MARTY, {'c': '#2b3f73', 'v': '#141821', 'o': '#e8b923', 'y': '#2f4a8a',
                                                    'Y': '#223766', 'b': '#1d2440', 'z': '#1b1b1f'})
    _cara(L, est)
    L.puntos('o', (11, 2), (12, 2), (11, 3), (12, 3), (7, 21), (8, 21), (7, 22), (8, 22))
    return L, 0


def vaquero(est):
    """Marty Vaquero: el sombrero de ala ancha, el pañuelo rojo al cuello, la camisa camel y las botas"""
    sombrero = ['.....aaaaaaa', '....aaaaaaaa', '....aaaaaaaa', '....AAAAAAAA', 'aaaaaaaaaaaa', '..hhhhhhhhhh']
    L = _L(sombrero + CABEZA_MARTY[6:], CUERPO_MARTY, {'a': '#8b5a2b', 'A': '#5e3a19', 'R': '#c0392b', 'y': '#d9b98c',
                                                       'Y': '#b89568', 'b': '#3d5a8a', 'z': '#5b3a29'})
    _cara(L, est)
    L.tramo(18, 8, 15, 'R')
    L.tramo(19, 10, 13, 'R')
    L.tramo(20, 11, 12, 'R')
    return L, 0


def pirata(est):
    """Marty Pirata: el pañuelo rojo de lunares con el nudo a un lado y la camiseta de rayas"""
    panuelo = ['......RRRRRR', '....RRRRRRRR', '...RRRxRRRRR', '..RRRRRRRxRR', '..RRRRRRRRRR', '..hhhhhhhhhh']
    L = _L(panuelo + CABEZA_MARTY[6:], CUERPO_MARTY, {'R': '#c0392b', 'x': '#f4f1e8', 'y': '#f2f0e8', 'Y': '#d6d3c8',
                                                      'n': '#2b3a67', 'b': '#3b3b46', 'z': '#26262a'})
    _cara(L, est)
    L.puntos('R', (22, 4), (22, 5), (23, 5), (22, 6), (23, 7))
    for y in (20, 22, 24):
        _sobre(L, 'n', ('y', 'Y'), *((x, y) for x in range(L.w)))
    return L, 0


def gecko(est):
    """Marty Gecko (antes, el lagarto verde; 28-oct: «que sea amarillo como un gecko leopardo»): la piel amarilla
    con manchas oscuras, la sonrisa, la camiseta blanca y la cola a bandas"""
    L = _L(CALVO, CUERPO_MARTY, {'s': '#f2c94c', 'S': '#d9a92a', 'H': '#8a5f1e', 'w': '#fff6d6', 'p': '#4a3020',
                                 'y': '#f4f1e8', 'Y': '#d6d3c8', 'b': '#3d5a8a'})
    _cara(L, est)
    if est == 'normal':
        _sonrisa(L)
    _sobre(L, 'p', ('s',), (7, 1), (12, 0), (16, 2), (4, 4), (10, 3), (19, 5), (13, 6), (5, 7), (3, 14), (20, 13),
           (2, 22), (21, 23), (3, 24), (6, 17), (17, 16))
    cola = [(19, 26), (20, 26), (20, 27), (21, 27), (21, 28), (22, 28), (22, 29), (23, 29)]
    for i, (x, y) in enumerate(cola):
        L.pon(x, y, 'p' if i % 3 == 2 else 's')
    return L, 0


def ciclope(est):
    """Marty Cíclope: un solo ojo grande en medio de la cara, y la camiseta naranja"""
    L = _L(CABEZA_MARTY, CUERPO_MARTY, {'y': '#e07b39', 'Y': '#b85f26'})
    _cara(L, est)
    for y in range(5, 14):
        for x in range(4, 20):
            if L.filas[y][x] in ('w', 'k', 'H'):
                L.pon(x, y, 's')
    if est == 'pausa':
        L.tramo(11, 9, 14, 'H')
        L.puntos('H', (8, 10), (15, 10))
        return L, 0
    t = 8 if est == 'espera' else 9
    L.tramo(t, 10, 13, 'w')
    for y in (t + 1, t + 2, t + 3):
        L.tramo(y, 9, 14, 'w')
    L.tramo(t + 4, 10, 13, 'w')
    py = t + 1 if est == 'espera' else t + 2
    L.puntos('k', (11, py), (12, py), (11, py + 1), (12, py + 1))
    if est == 'espera':
        L.tramo(t - 2, 10, 13, 'H')
        L.puntos('H', (9, t - 1), (14, t - 1))
    elif est == 'bloqueo':
        L.tramo(t, 9, 14, 'H')
        L.tramo(t + 1, 9, 14, 's')
        L.puntos('H', (9, t - 1), (14, t - 1))
    else:
        L.tramo(t - 1, 10, 13, 'H')
    return L, 0


def toxico(est):
    """Marty Tóxico: la piel macilenta, el pelo sucio y el moco verde que le chorrea"""
    L = _L(CABEZA_MARTY, CUERPO_MARTY, {'s': '#c3c98f', 'S': '#a3a96f', 'h': '#4a5226', 'H': '#33391a', 'y': '#a8a23a',
                                        'Y': '#87822a', 'g': '#8ad13b', 'b': '#3b4a2a'})
    _cara(L, est)
    L.puntos('g', (4, 8), (4, 9), (4, 10), (19, 7), (19, 8), (12, 6), (12, 7), (8, 21), (8, 22), (15, 23), (16, 23),
             (15, 24))
    return L, 0


def rey(est):
    """Marty Rey: la corona de oro con sus joyas, el cuello de armiño y la capa roja"""
    L = _L(CABEZA_MARTY, CUERPO_MARTY, {'o': '#f2c230', 'R': '#d23c3c', 'y': '#6a3fa0', 'Y': '#52307d',
                                        'F': '#f4f1e8', 'C': '#b3302f'})
    dy = _arriba(L, 2)
    _cara(L, est, dy)
    for x in (5, 8, 11, 12, 15, 18):
        L.pon(x, 0, 'o')
    L.tramo(1, 5, 18, 'o')
    L.tramo(2, 5, 18, 'o')
    L.puntos('R', (8, 2), (15, 2), (11, 1), (12, 1))
    L.tramo(19 + dy, 4, 19, 'F')
    L.puntos('k', (7, 19 + dy), (11, 19 + dy), (16, 19 + dy))
    for y in range(20, 30):
        L.puntos('C', (1, y + dy), (22, y + dy))
    return L, dy


def astronauta(est):
    """Marty Astronauta: la escafandra de cristal con su brillo, el traje blanco y su parche naranja"""
    L = _L(CABEZA_MARTY, CUERPO_MARTY, {'y': '#e9edf2', 'Y': '#c5ccd6', 'b': '#c5ccd6', 'z': '#8a939d',
                                        'G': '#9fd8ff', 'P': '#7c8791', 'o': '#e07b39', 'x': '#ffffff'})
    dy = _arriba(L, 2)
    _cara(L, est, dy)
    cx, cy, rx, ry = 11.5, 11, 12, 11.5
    for g in range(0, 360, 2):
        x = int(round(cx + rx * math.cos(math.radians(g))))
        y = int(round(cy + ry * math.sin(math.radians(g))))
        if y <= 20 and 0 <= x < L.w and 0 <= y < L.h and L.filas[y][x] == '.':
            L.pon(x, y, 'G')
    L.puntos('x', (4, 4), (3, 5), (3, 6))
    L.tramo(19 + dy, 6, 17, 'P')
    L.puntos('o', (7, 22 + dy), (8, 22 + dy))
    return L, dy


# ---- Docs ----
def mini_doc(est):
    """Mini Doc: el pelo de pinchos azul claro, la ceja única, la bata blanca sobre la camisa azul y la sonrisa"""
    pelo = ['...h..h..h..', '..hh.hh.hhh.', '.hhhhhhhhhhh', 'hhhhhhhhhhhh', '.hhhhhhhhhhh', '..hhhhhhhhhh',
            '..hhssssssss', '..hsssssssss']
    L = _L(pelo + CABEZA_MARTY[8:], CUERPO_MARTY, {'h': '#b9dcec', 'H': '#7fa9bd', 'y': '#f4f6f8', 'Y': '#c3ccd5',
                                                   'm': '#7cc4e8', 'b': '#8d6b4a', 'z': '#2e2a2a'})
    _cara(L, est)
    if est in ('normal', 'pausa'):
        L.tramo(8, 5, 18, 'H')
    if est == 'normal':
        _limpia_boca(L)
        L.tramo(15, 9, 14, 'k')
        L.tramo(16, 10, 13, 'r')
        L.puntos('k', (9, 16), (14, 16))
        L.tramo(17, 10, 13, 'k')
    for y in range(19, 26):
        _sobre(L, 'm', ('y', 'Y'), *((x, y) for x in range(9, 15)))
    return L, 0


def pepinillo(est):
    """Pepinillo: un pepinillo con la cara de Doc (la ceja única y la sonrisa), sin brazos ni piernas"""
    filas = [
        '..........ss', '........ssss', '.......sssss', '......ssssss', '......ssssss', '.....sssssss', '.....sssSsss',
        '.....sssssss', '....ssHHHHHH', '....sswwwsss', '....swwwwwss', '....swwwwwss', '....sswwwsss', '....ssssssss',
        '....sssssssS', '....ssssskks', '....sssssssk', '....ssssssss', '....sssSssss', '....ssssssss', '....ssssssss',
        '....ssssssss', '.....sssssss', '.....ssSssss', '.....sssssss', '......ssssss', '......ssssss', '.......sssss',
        '........ssss', '..........ss',
    ]
    L = Lienzo(filas, {**MARTY_PAL, 's': '#7cbf3a', 'S': '#5a9a2a', 'H': '#2f4f1a', 'L': '#a6dd6a'})
    _cara(L, est, 0, False)
    if est == 'normal':
        _limpia_boca(L)
        L.tramo(15, 9, 14, 'k')
        L.tramo(16, 10, 13, 'r')
        L.tramo(17, 10, 13, 'k')
    _sobre(L, 'S', ('s',), (7, 20), (16, 22), (9, 26), (15, 14), (6, 17))
    _sobre(L, 'L', ('s',), (9, 2), (8, 3), (7, 4))
    return L, 0


# ---- De la serie ----
def tammy(est):
    """Tammy: el pelo largo y rubio, las pestañas, la sonrisa y la camiseta lila"""
    L = _L(LARGO, CUERPO_LARGO, {'h': '#f0d27a', 'H': '#c9a94a', 'y': '#b48be8', 'Y': '#9370c9', 'b': '#3f5fa8'})
    _cara(L, est)
    L.puntos('k', (5, 9), (18, 9))
    if est == 'normal':
        _sonrisa(L)
    return L, 0


def ethan(est):
    """Ethan: el pelo oscuro despeinado, la media sonrisa y la sudadera gris con sus cordones"""
    pelo = ['.....h.hhhhh', '....hhhhhhhh', '...hhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhhhh',
            '..hhhhssssss', '..hhssssssss']
    L = _L(pelo + CABEZA_MARTY[8:], CUERPO_MARTY, {'h': '#3a2a1e', 'H': '#2a1d14', 'y': '#8a8f98', 'Y': '#6d727a',
                                                   'x': '#f4f1e8', 'b': '#2e3a55'})
    _cara(L, est)
    if est == 'normal':
        _limpia_boca(L)
        L.tramo(16, 10, 14, 'k')
        L.pon(15, 15, 'k')
    L.puntos('Y', (9, 18), (14, 18))
    L.puntos('x', (10, 20), (10, 21), (13, 20), (13, 21))
    return L, 0


def unity(est):
    """Unity: la melena corta platino, las pestañas, el gesto serio y el jersey negro"""
    L = _L(MELENA, CUERPO_MARTY, {'h': '#ece6cf', 'H': '#a39a75', 'y': '#33333a', 'Y': '#26262c', 'b': '#2a2a30'})
    _cara(L, est)
    L.puntos('k', (5, 9), (18, 9))
    if est == 'normal':
        _limpia_boca(L)
        L.tramo(16, 10, 13, 'k')
    return L, 0


def pecas(est):
    """Pecas: la melena larga y ondulada naranja, las pecas, la sonrisa y la camiseta verde"""
    ondas = [f if i < 12 else ('.' + f[1:3].replace('.', 'h') + f[3:] if i % 2 else f) for i, f in enumerate(LARGO)]
    L = _L(ondas, CUERPO_LARGO, {'h': '#e07a3a', 'H': '#a8552a', 'y': '#8fcf6a', 'Y': '#6aa64a', 'F': '#c98a5a',
                                 'b': '#3f5fa8'})
    _cara(L, est)
    L.puntos('k', (5, 9), (18, 9))
    _sobre(L, 'F', ('s',), (6, 13), (8, 13), (15, 13), (17, 13))
    if est == 'normal':
        _sonrisa(L)
    return L, 0


def goldenfold(est):
    """Mr. Goldenfold: calvo con pelo a los lados, las gafas, el bigote, la americana marrón y la corbata"""
    cabeza = ['......ssssss', '....ssssssss', '...sssssssss', '..ssssssssss', '..ssssssssss', '..hsssssssss',
              '..hhssssssss', '..hhssssssss'] + CABEZA_MARTY[8:]
    L = _L(cabeza, CUERPO_MARTY, {'h': '#9a8a7a', 'H': '#6a5a4a', 'M': '#5a4030', 'x': '#f4f1e8', 'y': '#7a5230',
                                  'Y': '#5e3f24', 'b': '#4a3a2a', 'z': '#26262a'})
    _cara(L, est)
    _gafas(L, '#2a2a2a')
    L.tramo(14, 8, 15, 'M')
    L.puntos('M', (7, 15), (16, 15))
    _cuello_y_corbata(L, '#c0392b')
    return L, 0


def dr_wong(est):
    """La doctora Wong: la melena negra con flequillo recto, las gafas finas, los labios rojos y la chaqueta gris"""
    flequillo = ['......hhhhhh', '....hhhhhhhh', '...hhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhhhh',
                 '..hhhhhhhhhh', '..hhssssssss']
    L = _L(flequillo + MELENA[8:], CUERPO_MARTY, {'h': '#1e1e24', 'H': '#141418', 'x': '#f4f1e8', 'y': '#6b6f7a',
                                                  'Y': '#555963', 'b': '#3b3e46'})
    _cara(L, est)
    _gafas(L, '#6a6a78')
    if est == 'normal':
        _limpia_boca(L)
        L.tramo(16, 10, 13, 'r')
    for y in range(19, 24):
        L.puntos('x', (10, y), (11, y), (12, y), (13, y))
    return L, 0


def nimbus(est):
    """Mr. Nimbus: la melena y la barba blancas, la piel morena, el traje morado y su tridente de oro"""
    L = _L(LARGO, CUERPO_LARGO, {'h': '#f4f4f0', 'H': '#bdbdb6', 's': '#e8b48c', 'S': '#c99470', 'B': '#f4f4f0',
                                 'y': '#6a3fa0', 'Y': '#52307d', 'o': '#e8b923', 'b': '#52307d'})
    _cara(L, est)
    for y, x0, x1 in ((17, 5, 18), (18, 6, 17), (19, 7, 16), (20, 8, 15), (21, 9, 14), (22, 10, 13)):
        L.tramo(y, x0, x1, 'B')
    L.tramo(14, 8, 15, 'B')
    L.puntos('B', (4, 13), (19, 13), (4, 14), (19, 14))
    for y in range(8, 31):
        L.pon(22, y, 'o')
    L.puntos('o', (21, 6), (21, 7), (23, 6), (23, 7), (22, 5), (21, 8), (23, 8))
    return L, 0


def curtis(est):
    """El presidente Curtis: el pelo gris con la raya, el traje azul marino, la camisa blanca y la corbata roja"""
    pelo = ['......hhhhhh', '....hhhhhhhh', '...hhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhhhh',
            '..hhhsssssss', '..hhssssssss']
    L = _L(pelo + CABEZA_MARTY[8:], CUERPO_MARTY, {'h': '#a8a8a8', 'H': '#6e6e6e', 'x': '#f4f1e8', 'y': '#23305a',
                                                   'Y': '#1a2444', 'b': '#23305a', 'z': '#1b1b1f'})
    _cara(L, est)
    L.puntos('s', (15, 2), (15, 3), (15, 4), (15, 5))
    if est == 'normal':
        _limpia_boca(L)
        L.tramo(16, 10, 13, 'k')
    _cuello_y_corbata(L, '#c0392b')
    return L, 0


def beauregard(est):
    """El señor Beauregard, el mayordomo: el pelo blanco peinado hacia atrás, el bigote fino, el frac y la pajarita"""
    pelo = ['......hhhhhh', '....hhhhhhhh', '...hhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhhss',
            '..hhhsssssss', '..hhssssssss']
    L = _L(pelo + CABEZA_MARTY[8:], CUERPO_MARTY, {'h': '#ececec', 'H': '#9a9a9a', 'x': '#f4f1e8', 'y': '#1f1f24',
                                                   'Y': '#141418', 'b': '#1f1f24', 'z': '#1b1b1f'})
    _cara(L, est)
    if est == 'normal':
        _limpia_boca(L)
        L.tramo(16, 10, 13, 'k')
    L.tramo(14, 9, 14, 'x')
    for y in range(19, 26):
        L.puntos('x', (10, y), (11, y), (12, y), (13, y))
    L.puntos('k', (9, 19), (10, 19), (11, 19), (12, 19), (13, 19), (14, 19), (9, 20), (14, 20))
    return L, 0


def hemorrhage(est):
    """Hemorrhage: la cresta negra, la pintura de guerra roja, el chaleco de cuero y las hombreras"""
    L = _L(CALVO, CUERPO_MARTY, {'h': '#1b1b1f', 'H': '#2a2a2a', 'R': '#c0392b', 'P': '#9aa6b1', 'y': '#5b3a29',
                                 'Y': '#3e2716', 'b': '#3e2716', 'z': '#1b1b1f'})
    dy = _arriba(L, 3)
    _cara(L, est, dy)
    for y in range(0, 9):
        L.tramo(y, 10, 13, 'h')
    L.tramo(13 + dy, 5, 8, 'R')
    L.tramo(13 + dy, 15, 18, 'R')
    for y in range(19, 25):
        _sobre(L, 's', ('y', 'Y'), (10, y + dy), (11, y + dy), (12, y + dy), (13, y + dy))
    L.puntos('P', (2, 19 + dy), (3, 19 + dy), (4, 19 + dy), (19, 19 + dy), (20, 19 + dy), (21, 19 + dy),
             (2, 20 + dy), (21, 20 + dy))
    return L, dy


def needful(est):
    """Mr. Needful, el diablo: el pelo negro engominado, los cuernos rojos, la perilla, el traje granate y la corbata"""
    pelo = ['......hhhhhh', '....hhhhhhhh', '...hhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhhhh',
            '..hhhsssssss', '..hhssssssss']
    L = _L(pelo + CABEZA_MARTY[8:], CUERPO_MARTY, {'h': '#1b1b1f', 'H': '#1b1b1f', 'R': '#d23c3c', 'x': '#f4f1e8',
                                                   'y': '#5a2028', 'Y': '#43161d', 'b': '#2a1418', 'z': '#1b1b1f'})
    dy = _arriba(L, 2)
    _cara(L, est, dy)
    L.puntos('R', (5, 0), (5, 1), (6, 1), (6, 2), (18, 0), (18, 1), (17, 1), (17, 2))
    if est == 'normal':
        _limpia_boca(L, dy)
        L.tramo(16 + dy, 10, 13, 'k')
        L.pon(14, 15 + dy, 'k')
    L.puntos('h', (11, 17 + dy), (12, 17 + dy), (11, 18 + dy), (12, 18 + dy))
    _cuello_y_corbata(L, '#d23c3c', dy)
    return L, dy


def alan_rails(est):
    """Alan Rails: la gorra de revisor con la banda dorada, el bigote de manillar y el uniforme con botones dorados"""
    gorra = ['....cccccccc', '...ccccccccc', '..cccccccccc', '..oooooooooo', '.vvvvvvvvvvv', '..hhhhhhhhhh']
    L = _L(gorra + CABEZA_MARTY[6:], CUERPO_MARTY, {'c': '#22304f', 'o': '#e8b923', 'v': '#141821', 'h': '#5e3a19',
                                                    'H': '#3e2510', 'M': '#5e3a19', 'y': '#3a4f7a', 'Y': '#2c3d60',
                                                    'b': '#22304f', 'z': '#1b1b1f'})
    _cara(L, est)
    L.puntos('o', (11, 1), (12, 1))
    L.tramo(14, 7, 16, 'M')
    L.puntos('M', (6, 15), (7, 15), (16, 15), (17, 15), (5, 14), (18, 14))
    L.puntos('o', (10, 20), (13, 20), (10, 22), (13, 22), (10, 24), (13, 24))
    return L, 0


def supernova(est):
    """Supernova: la melena blanca enorme, las pestañas, los labios y el traje morado con la estrella dorada"""
    melena = ['....hhhhhhhh', '..hhhhhhhhhh', '.hhhhhhhhhhh', 'hhhhhhhhhhhh', 'hhhhhhhhhhhh', 'hhhhhhhhhhhh',
              'hhhhhsssssss', 'hhhhssssssss', 'hhhsssHHHsss', 'hhhssswwwsss', 'hhhsswwwwwss', 'hhhsswwwwwss',
              '.hhssswwwsss', '.hhsssssssss', '..hssssssssS', '...sssssskks', '....sssssssk', '.....sssssss',
              '..........ss']
    L = _L(melena, CUERPO_MARTY, {'h': '#f4f4f0', 'H': '#8a8a96', 'y': '#7b3fb5', 'Y': '#5e2f8f', 'o': '#f2c230',
                                  'b': '#5e2f8f', 'z': '#1b1b1f'})
    _cara(L, est)
    L.puntos('k', (5, 9), (18, 9))
    if est == 'normal':
        _limpia_boca(L)
        L.tramo(16, 10, 13, 'r')
    L.puntos('o', (11, 21), (12, 21), (10, 22), (11, 22), (12, 22), (13, 22), (11, 23), (12, 23))
    return L, 0


def gearhead(est):
    """Gearhead: la cabeza de metal con un engranaje de bronce encima, los remaches y el mono verde azulado"""
    L = _L(CALVO, CUERPO_MARTY, {'s': '#8fa3b8', 'S': '#6f8398', 'H': '#4a5866', 'G': '#c49a5a', 'g': '#8a6a3a',
                                 'y': '#2f8f8a', 'Y': '#236b67', 'b': '#236b67', 'z': '#1b1b1f'})
    dy = _arriba(L, 3)
    _cara(L, est, dy)
    L.puntos('G', (9, 0), (10, 0), (13, 0), (14, 0))
    L.tramo(1, 7, 16, 'G')
    L.tramo(2, 6, 17, 'G')
    L.tramo(3, 6, 17, 'G')
    L.tramo(4, 7, 16, 'G')
    L.puntos('G', (5, 2), (18, 2), (5, 3), (18, 3))
    L.tramo(2, 10, 13, 'g')
    L.tramo(3, 10, 13, 'g')
    L.puntos('g', (3, 9 + dy), (20, 9 + dy), (3, 12 + dy), (20, 12 + dy))
    L.tramo(25 + dy, 5, 18, 'G')
    return L, dy


def ronin(est):
    """Ronin (28-oct): el pelo verde corto, el ojo izquierdo cerrado con su cicatriz, los tres
    pendientes de oro, la camisa blanca, la faja verde, el pañuelo negro al brazo y sus tres katanas a la cadera"""
    pelo = ['......hhhhhh', '...h.hhhhhhh', '..hhhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhhhh', '..hhhhhhhhhh',
            '..hhhsssssss', '..hhssssssss']
    L = _L(pelo + CABEZA_MARTY[8:], CUERPO_MARTY, {'h': '#4caf50', 'H': '#2e7d32', 's': '#f0c49a', 'S': '#d4a07a',
                                                   'y': '#f4f1e8', 'Y': '#d6d3c8', 'g': '#2e7d32', 'b': '#26262a',
                                                   'z': '#1b1b1f', 'o': '#e8b923', 'c': '#b0524a', 'x': '#f4f1e8',
                                                   'n': '#26262a', 'R': '#c0392b', 'd': '#4a4a52'})
    _cara(L, est)
    if est == 'normal':
        _limpia_boca(L)
        L.tramo(16, 10, 13, 'k')
        L.pon(14, 15, 'k')
    # el ojo izquierdo (a la derecha del dibujo), cerrado y con la cicatriz de arriba abajo
    for y in range(6, 14):
        for x in range(13, 20):
            if L.filas[y][x] in ('w', 'k', 'H'):
                L.pon(x, y, 's')
    L.tramo(10, 14, 18, 'k')
    for y in range(7, 14):
        L.pon(16, y, 'c')
    L.puntos('o', (22, 11), (22, 12), (22, 13))
    L.tramo(24, 5, 18, 'g')
    L.tramo(25, 5, 18, 'g')
    L.puntos('n', (20, 22), (21, 22))
    # las tres katanas, por detrás, a la cadera: la empuñadura blanca, la negra y la roja, y sus vainas
    for i, puno in enumerate(('x', 'n', 'R')):
        for t in range(9):
            x, y = 21 + i - round(t * 3 / 8), 21 + t
            if 0 <= x < L.w and L.filas[y][x] == '.':
                L.pon(x, y, puno if t < 2 else 'd')
    return L, 0


NUEVOS7 = [
    ('N01', 'Poli', 'Marty Poli', poli), ('N02', 'Vaquero', 'Marty Vaquero', vaquero),
    ('N03', 'Pirata', 'Marty Pirata', pirata), ('N04', 'Gecko', 'Marty Gecko', gecko),
    ('N05', 'Ciclope', 'Marty Cíclope', ciclope), ('N06', 'Toxico', 'Marty Tóxico', toxico),
    ('N07', 'Rey', 'Marty Rey', rey), ('N08', 'Astronauta', 'Marty Astronauta', astronauta),
    ('N09', 'MiniDoc', 'Mini Doc', mini_doc), ('N10', 'Pepinillo', 'Pepinillo', pepinillo),
    ('N11', 'Tammy', 'Tammy', tammy), ('N12', 'Ethan', 'Ethan', ethan), ('N13', 'Unity', 'Unity', unity),
    ('N14', 'Pecas', 'Pecas', pecas), ('N15', 'Goldenfold', 'Mr. Goldenfold', goldenfold),
    ('N16', 'Wong', 'Dra. Wong', dr_wong), ('N17', 'Nimbus', 'Mr. Nimbus', nimbus),
    ('N18', 'Curtis', 'Presidente Curtis', curtis), ('N19', 'Beauregard', 'Mr. Beauregard', beauregard),
    ('N20', 'Hemorrhage', 'Hemorrhage', hemorrhage), ('N21', 'Needful', 'Mr. Needful', needful),
    ('N22', 'AlanRails', 'Alan Rails', alan_rails), ('N23', 'Supernova', 'Supernova', supernova),
    ('N24', 'Gearhead', 'Gearhead', gearhead), ('N25', 'Ronin', 'Ronin', ronin),
]
FN = {tag: fn for _c, tag, _n, fn in NUEVOS7}
NOMBRE = {tag: nombre for _c, tag, nombre, _f in NUEVOS7}

# Los elegidos el 28-oct para el mod, en este orden
ELEGIDOS = ['Poli', 'Vaquero', 'Pirata', 'Gecko', 'Ciclope', 'Toxico', 'MiniDoc', 'Astronauta', 'Pepinillo', 'Pecas',
            'Ronin']

# ---- Los pequeños, para las casillas (16 × 16, como los de hoy): el Marty pequeño de martys.ts, cambiado ----
_M01 = ['....hhhhhh......', '...hhhhhhhh.....', '...hssssssh.....', '...swwsswws.....', '...swesswes.....',
        '...ssssssss.....', '...sssksss......', '....ssssss......', '...yyyyyyyy.....', '..syyyyyyyys....',
        '..syyyyyyyys....', '...yyyyyyyy.....', '...bbbbbbbb.....', '...bbb..bbb.....', '...bbb..bbb.....',
        '...NNN..NNN.....']
_M01_PAL = {'e': '#1b1b1f', 'b': '#2f5fb3', 's': '#f2c6a0', 'N': '#5b3a29', 'w': '#ffffff', 'y': '#daa520',
            'h': '#6b4423', 'k': '#1b1b1f'}
CAMISETA = {'Poli': '#2f4a8a', 'Vaquero': '#d9b98c', 'Pirata': '#2b3a67', 'Gecko': '#f2c94c', 'Ciclope': '#e07b39',
            'Toxico': '#a8a23a', 'MiniDoc': '#7cc4e8', 'Astronauta': '#9fd8ff', 'Pepinillo': '#7cbf3a',
            'Pecas': '#8fcf6a', 'Ronin': '#4caf50'}


def _p(filas, pal, cambios=(), filas_nuevas=None):
    """El Marty pequeño, con sus filas cambiadas ({fila: texto}), su paleta y sus puntos ((x, y, clave), ...)"""
    f = [list(x) for x in filas]
    for y, texto in (filas_nuevas or {}).items():
        f[y] = list(texto)
    for x, y, k in cambios:
        f[y][x] = k
    return {'filas': [''.join(x) for x in f], 'pal': {**_M01_PAL, **pal}}


def pequeno(tag):
    if tag == 'Poli':
        d = _p(_M01, {'c': '#2b3f73', 'v': '#141821', 'o': '#e8b923', 'y': '#2f4a8a', 'b': '#1d2440', 'N': '#1b1b1f'},
               [(4, 9, 'o')], {0: '...cccccccc.....', 1: '..vvvvvvvvvv....'})
    elif tag == 'Vaquero':
        d = _p(_M01, {'a': '#8b5a2b', 'R': '#c0392b', 'y': '#d9b98c', 'b': '#3d5a8a'},
               [(x, 8, 'R') for x in range(5, 9)], {0: '...aaaaaaaa.....', 1: '.aaaaaaaaaaaa...'})
    elif tag == 'Pirata':
        d = _p(_M01, {'R': '#c0392b', 'x': '#f4f1e8', 'y': '#f2f0e8', 'n': '#2b3a67', 'b': '#3b3b46'},
               [(11, 1, 'R'), (12, 2, 'R')] + [(x, y, 'n') for y in (9, 11) for x in range(3, 11)],
               {0: '....RRRRRR......', 1: '...RRxRRRRR.....'})
    elif tag == 'Gecko':
        d = _p(_M01, {'s': '#f2c94c', 'p': '#4a3020', 'w': '#fff6d6', 'y': '#f4f1e8', 'b': '#3d5a8a'},
               [(5, 0, 'p'), (8, 1, 'p'), (3, 2, 'p'), (10, 5, 'p'), (2, 10, 'p'), (12, 12, 's'), (13, 13, 'p'),
                (14, 13, 's')],
               {0: '....ssssss......', 1: '...ssssssss.....', 2: '...ssssssss.....'})
    elif tag == 'Ciclope':
        d = _p(_M01, {'y': '#e07b39'}, [(4, 3, 's'), (5, 3, 'w'), (6, 3, 'w'), (7, 3, 'w'), (8, 3, 's'), (9, 3, 's'),
                                       (4, 4, 's'), (5, 4, 'w'), (6, 4, 'e'), (7, 4, 'w'), (8, 4, 's'), (9, 4, 's')])
    elif tag == 'Toxico':
        d = _p(_M01, {'s': '#c3c98f', 'h': '#4a5226', 'y': '#a8a23a', 'g': '#8ad13b', 'b': '#3b4a2a'},
               [(3, 3, 'g'), (10, 2, 'g'), (5, 10, 'g'), (8, 9, 'g')])
    elif tag == 'MiniDoc':
        d = _p(_M01, {'h': '#b9dcec', 'H': '#7fa9bd', 'y': '#f4f6f8', 'm': '#7cc4e8', 'b': '#8d6b4a', 'N': '#2e2a2a'},
               [(x, y, 'm') for y in range(8, 12) for x in (6, 7)],
               {0: '...h.h.h.h.h....', 1: '..hhhhhhhhhh....', 2: '...hHHHHHHh.....'})
    elif tag == 'Astronauta':
        d = _p(_M01, {'G': '#9fd8ff', 'P': '#7c8791', 'y': '#e9edf2', 'b': '#c5ccd6', 'N': '#8a939d'},
               [(2, y, 'G') for y in range(1, 7)] + [(11, y, 'G') for y in range(1, 7)] + [(x, 8, 'P') for x in range(3, 11)],
               {0: '...GGGGGGGG.....'})
    elif tag == 'Pepinillo':
        d = {'filas': ['......ss........', '.....ssss.......', '....ssssss......', '....HHHHHH......', '....wesswe......',
                       '....ssssss......', '....skkkks......', '....ssssss......', '....ssSsss......', '....ssssss......',
                       '....sssSss......', '....ssssss......', '.....ssss.......', '.....ssss.......', '......ss........',
                       '................'],
             'pal': {'s': '#7cbf3a', 'S': '#5a9a2a', 'H': '#2f4f1a', 'w': '#ffffff', 'e': '#1b1b1f', 'k': '#1b1b1f'}}
    elif tag == 'Pecas':
        d = _p(_M01, {'h': '#e07a3a', 'y': '#8fcf6a', 'b': '#3f5fa8'},
               [(2, y, 'h') for y in range(2, 10)] + [(11, y, 'h') for y in range(2, 10)])
    elif tag == 'Ronin':
        d = _p(_M01, {'h': '#4caf50', 'H': '#2e7d32', 's': '#f0c49a', 'y': '#f4f1e8', 'g': '#2e7d32', 'b': '#26262a',
                      'N': '#1b1b1f', 'o': '#e8b923', 'c': '#b0524a'},
               [(8, 3, 's'), (9, 3, 'c'), (8, 4, 'H'), (9, 4, 'H'), (9, 5, 'c'), (11, 3, 'o'), (11, 4, 'o')] +
               [(x, 11, 'g') for x in range(3, 11)])
    else:
        raise KeyError(tag)
    return {'tag': tag, 'nombre': NOMBRE[tag], 'camiseta': CAMISETA[tag], **d}
