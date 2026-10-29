"""Los personajes decididos (iteraciones 4 a 6), listos para el mod D-137: cada uno con sus cuatro estados en el estilo
elegido (el píxel de RP4 y MP4, con su brillo, su volumen y su contorno de color), en filas y paleta como los dibujos de
hoy (hooks\\dibujos.ts). Los Martys (sin el de dos cabezas ni el afro; Mutante, C1), los ocho de reserva, Doc con sus
variantes, Trabajador, Paloma mensajera y la pistola; y los dibujos pequeños de hoy de los de reserva, para las
casillas. Escribe d-137\\hooks\\personajes.ts (u otra carpeta hooks que se le diga) y una copia en datos\\, aquí al lado.
Uso: python exportar_mod.py [<carpeta hooks del mod>]   (hace falta Python 3; sin nada más instalado)"""
import io
import json
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
for d in ('it7', 'it6', 'it5', 'it4', 'it3'):
    sys.path.insert(0, os.path.join(AQUI, d))
import caras  # noqa: E402
import estados6  # noqa: E402
import estilo  # noqa: E402
import martys5  # noqa: E402
import nuevos7  # noqa: E402
import otros5  # noqa: E402

LETRAS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
ESTADOS = ('normal', 'espera', 'bloqueo', 'pausa')


def dibujo(r):
    """Una rejilla de colores como filas y paleta (una letra por color; «.» es vacío)"""
    pal, filas = {}, []
    for fila in r:
        s = ''
        for c in fila:
            if not c:
                s += '.'
                continue
            if c not in pal:
                pal[c] = LETRAS[len(pal)]
            s += pal[c]
        filas.append(s)
    return {'filas': filas, 'pal': {v: k for k, v in pal.items()}}


def lienzo(L):
    return estilo.base(L)


def main():
    salida = sys.argv[1] if len(sys.argv) > 1 else os.path.normpath(os.path.join(AQUI, '..', '..', 'd-137', 'hooks'))
    fichas = {}
    martys = {'M-01': martys5.m01, 'M-02': martys5.m02, 'M-03': martys5.m03, 'M-04': estados6.mutante_c1,
              'M-05': martys5.m05, 'M-08': martys5.m08}
    for tag, fn in martys.items():
        for est in ESTADOS:
            fichas[f'{tag}:{est}'] = dibujo(lienzo(fn(est)))
    reserva = {'Verano': 'PR1', 'Liz': 'PR2', 'Gerardo': 'PR3', 'Copito': 'PR4', 'Terror': 'PR5', 'Pompis': 'PR6',
               'Mantequillo': 'PR7', 'Michi': 'PR8'}
    fns = {cod: fn for cod, _n, fn in estados6.RESERVA6}
    for tag, cod in reserva.items():
        for est in ESTADOS:
            fichas[f'{tag}:{est}'] = dibujo(estilo.estilo(fns[cod](est)))
    docs = {'normal': caras.doc_r1, 'normal2': caras.doc_r4, 'espera': caras.doc_r3, 'paradas': caras.doc_r5,
             'bloqueo': estados6.doc_ca}
    for k, fn in docs.items():
        fichas[f'doc:{k}'] = dibujo(lienzo(fn()))
    fichas['genio'] = dibujo(estilo.estilo(otros5.genio()))
    fichas['pajaro'] = dibujo(estilo.estilo(otros5.pajaro()))
    fichas['pistola'] = dibujo(estilo.estilo(otros5.pistola_de()))
    # los pequeños de hoy de los de reserva (las casillas, hasta 20 px, con los dibujos de hoy) y el color de su camiseta
    claves = {'Verano': 'verano', 'Liz': 'liz', 'Gerardo': 'gerardo', 'Copito': 'copito', 'Terror': 'terror', 'Pompis': 'pompis',
              'Mantequillo': 'butter', 'Michi': 'michi'}
    camisetas = {'Verano': '#e86f9e', 'Liz': '#b0383c', 'Gerardo': '#9cc78f', 'Copito': '#c9c9c4', 'Terror': '#b3302f',
                 'Pompis': '#f4c542', 'Mantequillo': '#9aa0a8', 'Michi': '#e8892a'}
    pequenos = []
    for tag, clave in claves.items():
        v = otros5.RESERVA[clave]
        pequenos.append({'tag': tag, 'nombre': v['nombre'], 'camiseta': camisetas[tag], 'filas': v['filas'], 'pal': v['pal']})
    # los nuevos de la it-7 elegidos el 28-oct, con sus cuatro estados y su dibujo pequeño para las casillas
    for tag in nuevos7.ELEGIDOS:
        for est in ESTADOS:
            fichas[f'{tag}:{est}'] = dibujo(lienzo(nuevos7.FN[tag](est)[0]))
        pequenos.append(nuevos7.pequeno(tag))

    datos = os.path.join(AQUI, 'datos')
    os.makedirs(datos, exist_ok=True)
    io.open(os.path.join(datos, 'personajes-mod.json'), 'w', encoding='utf-8', newline='\n').write(
        json.dumps({'fichas': fichas, 'pequenos': pequenos}, ensure_ascii=False))
    if salida:
        ts = ('// Los personajes de las fichas, cada uno con sus cuatro estados (normal, espera, bloqueo y pausa), Doc con sus\n'
              '// variantes, Trabajador, Paloma mensajera y la pistola; y los pequeños de los de reserva, para las casillas. Lo\n'
              '// escribe Herramientas\\generador\\exportar_mod.py: no se toca a mano\n'
              "import type { Sprite } from './martys'\n\n"
              'type Dibujo = { filas: string[]; pal: Record<string, string> }\n'
              f'export const FICHAS: Record<string, Dibujo> = {json.dumps(fichas, ensure_ascii=False)}\n'
              f'export const RESERVA: Sprite[] = {json.dumps(pequenos, ensure_ascii=False)}\n')
        io.open(os.path.join(salida, 'personajes.ts'), 'w', encoding='utf-8', newline='\n').write(ts)
    print(len(fichas), 'fichas y', len(pequenos), 'pequeños')


if __name__ == '__main__':
    main()
