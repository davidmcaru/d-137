"""Iteración 3 de «Personajes» · el píxel fino (26-oct: «12 variantes, con este mismo estilo de píxeles, pero que
sean un poco más finos y detallados… en la ficha, que por cada píxel actual tenga 4 (2×2)»). Los dibujos de hoy del mod
(Doc, 12 × 18, y Marty M-01, 16 × 16) pasan a 2 × 2 con Scale2x, que redondea las escaleras sin cambiar el diseño, y de
ahí salen 12 maneras de usar ese detalle: brillo en los ojos, volumen, contornos, tramado, luz de borde, ojos grandes,
paletas y pegatina. En la casilla se queda el modelo de hoy, con la paleta de cada variante."""
import colorsys

DOC = (['..h..h..h...', '.hhh.hhhhh..', 'hhhhhhhhhhh.', 'hhssssssssh.', 'hskkkkkkkksh', '.swwssswwss.', '.sewssswess.',
         '.ssssSSssss.', '.sskwwwwkss.', '..ssssssss..', '..cmmmmmmc..', '.ccmmmmmmcc.', 'ccCmmmmmmCcc', 'scCmmmmmmCcs',
         '.ccnnnnnncc.', '.cCnn..nnCc.', '...nn..nn...', '...kk..kk...'],
        {'h': '#b9dcec', 's': '#f2c6a0', 'S': '#d9a882', 'k': '#1b1b1f', 'w': '#ffffff', 'e': '#1b1b1f', 'c': '#f4f6f8',
         'C': '#c3ccd5', 'm': '#7cc4e8', 'n': '#8d6b4a'})
MARTY = (['....hhhhhh......', '...hhhhhhhh.....', '...hssssssh.....', '...swwsswws.....', '...swesswes.....',
          '...ssssssss.....', '...sssksss......', '....ssssss......', '...yyyyyyyy.....', '..syyyyyyyys....',
          '..syyyyyyyys....', '...yyyyyyyy.....', '...bbbbbbbb.....', '...bbb..bbb.....', '...bbb..bbb.....',
          '...NNN..NNN.....'],
         {'e': '#1b1b1f', 'b': '#2f5fb3', 's': '#f2c6a0', 'N': '#5b3a29', 'w': '#ffffff', 'y': '#daa520', 'h': '#6b4423',
          'k': '#1b1b1f'})
SPRITES = {'doc': DOC, 'marty': MARTY}
NEGRO = '#1b1b1f'
# los colores que no se sombrean ni se aclaran: los ojos, las pupilas y las líneas
FIJOS = {'#ffffff', NEGRO}


def rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def hexa(r, g, b):
    return '#%02x%02x%02x' % tuple(max(0, min(255, int(round(v)))) for v in (r, g, b))


def oscuro(h, f=0.78):
    return hexa(*(v * f for v in rgb(h)))


def claro(h, f=0.22):
    return hexa(*(v + (255 - v) * f for v in rgb(h)))


def tono(h, sat=1.0, luz=1.0):
    r, g, b = (v / 255 for v in rgb(h))
    hh, ll, ss = colorsys.rgb_to_hls(r, g, b)
    r2, g2, b2 = colorsys.hls_to_rgb(hh, max(0, min(1, ll * luz)), max(0, min(1, ss * sat)))
    return hexa(r2 * 255, g2 * 255, b2 * 255)


def rejilla(quien):
    """El dibujo de hoy como rejilla de colores (None, transparente)"""
    filas, pal = SPRITES[quien]
    ancho = max(len(f) for f in filas)
    return [[pal.get(c) for c in f.ljust(ancho, '.')] for f in filas]


def scale2x(r):
    """Scale2x (EPX): cada píxel pasa a 2 × 2, y donde dos vecinos coinciden en diagonal la esquina toma su color"""
    h, w = len(r), len(r[0])
    get = lambda y, x: r[y][x] if 0 <= y < h and 0 <= x < w else None  # noqa: E731
    out = [[None] * (w * 2) for _ in range(h * 2)]
    for y in range(h):
        for x in range(w):
            p = r[y][x]
            a, b, c, d = get(y - 1, x), get(y, x + 1), get(y, x - 1), get(y + 1, x)
            e0 = a if c == a and c != d and a != b else p
            e1 = b if a == b and a != c and b != d else p
            e2 = c if d == c and d != b and c != a else p
            e3 = d if b == d and b != a and d != c else p
            out[2 * y][2 * x], out[2 * y][2 * x + 1], out[2 * y + 1][2 * x], out[2 * y + 1][2 * x + 1] = e0, e1, e2, e3
    return out


def copia(r):
    return [fila[:] for fila in r]


def doble(r):
    """A 2 × 2: Scale2x para redondear, pero los ojos, las pupilas y las líneas negras, en bloques enteros (Scale2x
    los deforma: una pupila sola quedaba en diagonal)"""
    epx = scale2x(r)
    out = copia(epx)
    for y in range(len(epx)):
        for x in range(len(epx[0])):
            ingenuo = r[y // 2][x // 2]
            if ingenuo in FIJOS or epx[y][x] in FIJOS:
                out[y][x] = ingenuo
    return out


def brillo_ojos(r, quien):
    """Un punto de luz en cada pupila: arriba a la izquierda de su bloque de 2 × 2"""
    out = copia(r)
    h, w = len(r), len(r[0])
    for y in range(1, h - 1):
        for x in range(w - 2):
            bloque = r[y][x] == NEGRO and r[y][x + 1] == NEGRO and r[y + 1][x] == NEGRO and r[y + 1][x + 1] == NEGRO
            # una pupila tiene blanco de ojo justo encima o justo a la derecha (la ceja, la boca y los zapatos, no)
            if bloque and (r[y - 1][x] == '#ffffff' or r[y][x + 2] == '#ffffff'):
                out[y][x] = '#ffffff'
    return out


def volumen(r, sombra=0.8, luz=0.2):
    """Sombra en el borde derecho y abajo de cada mancha de color, y luz arriba a la izquierda"""
    h, w = len(r), len(r[0])
    out = copia(r)
    for y in range(h):
        for x in range(w):
            c = r[y][x]
            if not c or c in FIJOS:
                continue
            der = r[y][x + 1] if x + 1 < w else None
            aba = r[y + 1][x] if y + 1 < h else None
            arr = r[y - 1][x] if y > 0 else None
            izq = r[y][x - 1] if x > 0 else None
            if der != c or aba != c:
                out[y][x] = oscuro(c, sombra)
            elif (arr != c or izq != c) and luz:
                out[y][x] = claro(c, luz)
    return out


def tramado(r):
    """La sombra, en damero: el color y su sombra alternados"""
    h, w = len(r), len(r[0])
    out = copia(r)
    for y in range(h):
        for x in range(w):
            c = r[y][x]
            if not c or c in FIJOS:
                continue
            der = r[y][x + 1] if x + 1 < w else None
            der2 = r[y][x + 2] if x + 2 < w else None
            if der != c:
                out[y][x] = oscuro(c, 0.72)
            elif der2 != c and (x + y) % 2 == 0:
                out[y][x] = oscuro(c, 0.72)
    return out


def contorno(r, color=None, grosor=1):
    """Un borde alrededor de la silueta (la rejilla crece un píxel por lado): negro, o el color de al lado oscurecido"""
    for _ in range(grosor):
        h, w = len(r), len(r[0])
        base = [[None] * (w + 2)] + [[None] + fila[:] + [None] for fila in r] + [[None] * (w + 2)]
        out = copia(base)
        for y in range(h + 2):
            for x in range(w + 2):
                if base[y][x]:
                    continue
                vec = [base[yy][xx] for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1))
                       if 0 <= yy < h + 2 and 0 <= xx < w + 2 and base[yy][xx]]
                if vec:
                    out[y][x] = color if color else oscuro(vec[0], 0.45)
        r = out
    return r


def luz_borde(r, color='#bdf0ff'):
    """Un filo de luz cian en el borde derecho de la silueta, para el fondo oscuro"""
    h, w = len(r), len(r[0])
    out = copia(r)
    for y in range(h):
        for x in range(w):
            c = r[y][x]
            if c and c not in FIJOS and (x + 1 >= w or r[y][x + 1] is None):
                out[y][x] = hexa(*((a * 0.45 + b * 0.55) for a, b in zip(rgb(c), rgb(color))))
    return out


def paleta(r, sat=1.0, luz=1.0):
    return [[tono(c, sat, luz) if c and c not in FIJOS else c for c in fila] for fila in r]


def ojos_grandes(r, quien):
    """Los ojos, un píxel más de blanco por cada lado (sin pasar sobre la línea de la ceja)"""
    out = copia(r)
    h, w = len(r), len(r[0])
    blancos = [(y, x) for y in range(h) for x in range(w) if r[y][x] == '#ffffff']
    piel = rgb(SPRITES[quien][1]['s'])
    for y, x in blancos:
        for yy, xx in ((y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= yy < h and 0 <= xx < w and r[yy][xx] and rgb(r[yy][xx]) == piel:
                out[yy][xx] = '#ffffff'
    return out


def sombra_suelo(r):
    """Una sombra ovalada bajo los pies (dos filas más)"""
    h, w = len(r), len(r[0])
    out = copia(r) + [[None] * w for _ in range(2)]
    pies = [x for x in range(w) if r[h - 1][x]]
    if pies:
        x0, x1 = min(pies) - 2, max(pies) + 2
        for x in range(max(0, x0), min(w, x1 + 1)):
            out[h][x] = '#00000066'
            if x0 + 2 <= x <= x1 - 2:
                out[h + 1][x] = '#00000033'
    return out


def pegatina(r):
    return contorno(contorno(r, NEGRO), '#ffffff')


# Las 12 variantes: nombre, idea, rasgos y lo que se hace con la rejilla de 2 × 2 (y la paleta de la casilla)
def _v(base, quien, *pasos):
    r = base
    for p in pasos:
        r = p(r, quien) if p in (brillo_ojos, ojos_grandes) else p(r)
    return r


VARIANTES = [
    ('P1', 'Fino, con brillo en los ojos', 'El de hoy a 2 × 2, con las escaleras redondeadas y un punto de luz en cada pupila',
     ['2 × 2', 'Brillo en los ojos'], lambda r, q: _v(r, q, brillo_ojos), None),
    ('P2', 'Con volumen', 'Cada color con su sombra a la derecha y abajo y su luz arriba a la izquierda',
     ['2 × 2', 'Sombra y luz'], lambda r, q: _v(r, q, brillo_ojos, volumen), None),
    ('P3', 'Contorno negro', 'Con volumen y un borde negro de un píxel alrededor, como un sprite de juego',
     ['Volumen', 'Contorno negro'], lambda r, q: contorno(_v(r, q, brillo_ojos, volumen), NEGRO), None),
    ('P4', 'Contorno de color', 'Con volumen y un borde del color oscuro de cada parte, más suave que el negro',
     ['Volumen', 'Contorno de color'], lambda r, q: contorno(_v(r, q, brillo_ojos, volumen)), None),
    ('P5', 'Plano, como hoy', 'Solo a 2 × 2 y redondeado: los mismos colores planos de hoy, sin brillos',
     ['2 × 2', 'Plano'], lambda r, q: r, None),
    ('P6', 'Tramado', 'La sombra en damero, como en las consolas antiguas', ['2 × 2', 'Damero'],
     lambda r, q: _v(r, q, brillo_ojos, tramado), None),
    ('P7', 'Luz de borde', 'Con volumen y un filo de luz cian a la derecha, que lo despega del fondo oscuro del panel',
     ['Volumen', 'Luz cian'], lambda r, q: _v(r, q, brillo_ojos, volumen, luz_borde), None),
    ('P8', 'Ojos grandes', 'Con volumen y los ojos un píxel más grandes por cada lado: más expresivo',
     ['Volumen', 'Ojos grandes'], lambda r, q: _v(r, q, ojos_grandes, brillo_ojos, volumen), None),
    ('P9', 'Colores vivos', 'Con volumen y los colores más saturados', ['Volumen', 'Más color'],
     lambda r, q: paleta(_v(r, q, brillo_ojos, volumen), 1.35, 1.0), (1.35, 1.0)),
    ('P10', 'Colores apagados', 'Con volumen y los colores más suaves, para no gritar en el panel',
     ['Volumen', 'Menos color'], lambda r, q: paleta(_v(r, q, brillo_ojos, volumen), 0.65, 0.95), (0.65, 0.95)),
    ('P11', 'Pegatina', 'Contorno negro y otro blanco por fuera, como una pegatina', ['Contorno doble', 'Pegatina'],
     lambda r, q: pegatina(_v(r, q, brillo_ojos, volumen)), None),
    ('P12', 'Con sombra en el suelo', 'Contorno negro y una sombra ovalada bajo los pies', ['Contorno negro', 'Sombra'],
     lambda r, q: sombra_suelo(contorno(_v(r, q, brillo_ojos, volumen), NEGRO)), None),
]


def detalle(r, quien):
    """Lo que cabe a 2 × 2 y no cabía antes (en la rejilla doble, antes de contornos): en Doc, las ojeras, los dientes
    separados, la baba verde, las solapas de la bata y brillos en el pelo; en Marty, la boca nerviosa, el cuello de la
    camiseta y brillos en el pelo"""
    out = copia(r)
    pal = SPRITES[quien][1]

    def pon(y, x, color, si=None):
        if 0 <= y < len(out) and 0 <= x < len(out[0]) and (si is None or out[y][x] == si):
            out[y][x] = color
    pelo, piel = pal['h'], pal['s']
    if quien == 'doc':
        for y, x in ((14, 5), (14, 6), (14, 16), (14, 17)):
            pon(y, x, pal['S'], piel)
        for y in (16, 17):
            for x in (10, 13):
                pon(y, x, NEGRO, '#ffffff')
        pon(18, 16, '#8ee05a', piel)
        pon(19, 16, '#8ee05a', piel)
        for y, x in ((20, 6), (20, 7), (21, 7), (20, 16), (20, 17), (21, 16)):
            pon(y, x, pal['c'], pal['m'])
        for y, x in ((2, 3), (3, 3), (3, 4), (4, 9), (2, 15), (3, 15), (4, 20)):
            pon(y, x, claro(pelo, 0.45), pelo)
    else:
        for y in (12, 13):
            for x in (12, 13):
                pon(y, x, piel, NEGRO)
        for y, x in ((12, 13), (12, 14), (13, 11), (13, 12)):
            pon(y, x, NEGRO, piel)
        for x in range(11, 19):
            pon(16, x, oscuro(pal['y'], 0.82), pal['y'])
        for y, x in ((1, 12), (1, 13), (2, 9), (2, 10), (1, 17)):
            pon(y, x, claro(pelo, 0.3), pelo)
    return out


def fina(quien, codigo):
    v = next(x for x in VARIANTES if x[0] == codigo)
    r = doble(rejilla(quien))
    # la plana se queda como la de hoy, sin retoques
    if codigo != 'P5':
        r = detalle(r, quien)
    return v[4](r, quien)


def casilla(quien, codigo):
    """En la casilla, el modelo de hoy (16 de alto), con la paleta de la variante"""
    v = next(x for x in VARIANTES if x[0] == codigo)
    r = rejilla(quien)
    return paleta(r, *v[5]) if v[5] else r


def svg(r, alto_px, fondo=None):
    """Una rejilla como SVG, con sus píxeles enteros"""
    h, w = len(r), len(r[0])
    out = []
    for y, fila in enumerate(r):
        x = 0
        while x < w:
            c = fila[x]
            if not c:
                x += 1
                continue
            n = 1
            while x + n < w and fila[x + n] == c:
                n += 1
            op = ''
            if len(c) == 9:
                op = f' fill-opacity="{int(c[7:9], 16) / 255:.2f}"'
                c = c[:7]
            out.append(f'<rect x="{x}" y="{y}" width="{n}" height="1" fill="{c}"{op}/>')
            x += n
    ancho_px = round(alto_px * w / h, 2)
    f = f'<rect x="-1" y="-1" width="{w + 2}" height="{h + 2}" fill="{fondo}"/>' if fondo else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{ancho_px}" height="{alto_px}" viewBox="0 0 {w} {h}" '
            f'shape-rendering="crispEdges">{f}{"".join(out)}</svg>')
