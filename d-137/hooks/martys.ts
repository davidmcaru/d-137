// Los Martys de las sesiones, en el orden y con los colores elegidos (22-oct): sacados de los bocetos del laboratorio
// (sprites.json), con la camiseta, que es también su color. Sin el de dos cabezas (M-06) ni el afro (M-07), que se
// quitaron del todo el 28-oct
export type Sprite = { tag: string; nombre: string; camiseta: string; filas: string[]; pal: Record<string, string> }

export const MARTYS: Sprite[] = [
  {
    "tag": "M-01",
    "nombre": "Marty",
    "camiseta": "#daa520",
    "filas": [
      "....hhhhhh......",
      "...hhhhhhhh.....",
      "...hssssssh.....",
      "...swwsswws.....",
      "...swesswes.....",
      "...ssssssss.....",
      "...sssksss......",
      "....ssssss......",
      "...yyyyyyyy.....",
      "..syyyyyyyys....",
      "..syyyyyyyys....",
      "...yyyyyyyy.....",
      "...bbbbbbbb.....",
      "...bbb..bbb.....",
      "...bbb..bbb.....",
      "...NNN..NNN....."
    ],
    "pal": {
      "e": "#1b1b1f",
      "b": "#2f5fb3",
      "s": "#f2c6a0",
      "N": "#5b3a29",
      "w": "#ffffff",
      "y": "#daa520",
      "h": "#6b4423",
      "k": "#1b1b1f"
    }
  },
  {
    "tag": "M-02",
    "nombre": "Marty azul",
    "camiseta": "#4a90e2",
    "filas": [
      "....hhhhhh......",
      "...hhhhhhhh.....",
      "...hssssssh.....",
      "...swwsswws.....",
      "...swesswes.....",
      "...ssssssss.....",
      "...sssksss......",
      "....ssssss......",
      "...yyyyyyyy.....",
      "..syyyyyyyys....",
      "..syyyyyyyys....",
      "...yyyyyyyy.....",
      "...bbbbbbbb.....",
      "...bbb..bbb.....",
      "...bbb..bbb.....",
      "...NNN..NNN....."
    ],
    "pal": {
      "e": "#1b1b1f",
      "b": "#2d3a4f",
      "s": "#f2c6a0",
      "N": "#5b3a29",
      "w": "#ffffff",
      "y": "#4a90e2",
      "h": "#6b4423",
      "k": "#1b1b1f"
    }
  },
  {
    "tag": "M-03",
    "nombre": "Marty malvado",
    "camiseta": "#3a3a3a",
    "filas": [
      "....hhhhhh......",
      "...hhhhhhhh.....",
      "...hkkhhhhh.....",
      "...skksswws.....",
      "...skksswes.....",
      "...ssssssss.....",
      "...sssksss......",
      "....ssssss......",
      "...yyyyyyyy.....",
      "..syyyyyyyys....",
      "..syyyyyyyys....",
      "...yyyyyyyy.....",
      "...bbbbbbbb.....",
      "...bbb..bbb.....",
      "...bbb..bbb.....",
      "...NNN..NNN....."
    ],
    "pal": {
      "e": "#1b1b1f",
      "b": "#1b1b1f",
      "s": "#f2c6a0",
      "N": "#5b3a29",
      "w": "#ffffff",
      "y": "#3a3a3a",
      "h": "#6b4423",
      "k": "#1b1b1f"
    }
  },
  {
    "tag": "M-04",
    "nombre": "Marty Mutante",
    "camiseta": "#43a047",
    "filas": [
      "....hhhhhh.ff...",
      "...hhhhhhhfFff..",
      "...hssssssfwef..",
      "...swwsswwsfFf..",
      "...swesswes.ff..",
      "..fssssssss.....",
      ".fFsssksss......",
      ".ff.ssssss......",
      "...yyyyyyyyff...",
      "..syyyyyyyyFff..",
      "..syyyyyyyy.ff..",
      "...yyyyyyyy.....",
      "...bbbbbbbb.....",
      "...bbb..bbb.....",
      "...bbb..bbb.....",
      "...NNN..NNN....."
    ],
    "pal": {
      "e": "#1b1b1f",
      "b": "#2f5fb3",
      "s": "#f2c6a0",
      "N": "#5b3a29",
      "f": "#e8958f",
      "F": "#b95f59",
      "w": "#ffffff",
      "y": "#43a047",
      "h": "#6b4423",
      "k": "#1b1b1f"
    }
  },
  {
    "tag": "M-05",
    "nombre": "Marty alien",
    "camiseta": "#b39ddb",
    "filas": [
      "..k.hhhhhh.k....",
      "...khhhhhhk.....",
      "...hssssssh.....",
      "...swwsswws.....",
      "...swesswes.....",
      "...ssssssss.....",
      "...sssksss......",
      "....ssssss......",
      "...yyyyyyyy.....",
      "..syyyyyyyys....",
      "..syyyyyyyys....",
      "...yyyyyyyy.....",
      "...bbbbbbbb.....",
      "...bbb..bbb.....",
      "...bbb..bbb.....",
      "...NNN..NNN....."
    ],
    "pal": {
      "e": "#1b1b1f",
      "b": "#2f5fb3",
      "s": "#8fd16a",
      "N": "#5b3a29",
      "w": "#ffffff",
      "y": "#b39ddb",
      "h": "#2e7d32",
      "k": "#1b1b1f"
    }
  },
  {
    "tag": "M-08",
    "nombre": "Marty robot",
    "camiseta": "#cfd5dc",
    "filas": [
      "....hhhrhh......",
      "...hhhhhhhh.....",
      "...hssssssh.....",
      "...swwsswws.....",
      "...swesswes.....",
      "...ssssssss.....",
      "...sssksss......",
      "....ssssss......",
      "...yyyyyyyy.....",
      "..syyyyyyyys....",
      "..syyyyyyyys....",
      "...yyyyyyyy.....",
      "...bbbbbbbb.....",
      "...bbb..bbb.....",
      "...bbb..bbb.....",
      "...NNN..NNN....."
    ],
    "pal": {
      "e": "#2aa0c0",
      "b": "#2f5fb3",
      "s": "#a7b0ba",
      "N": "#5b3a29",
      "w": "#ffffff",
      "y": "#cfd5dc",
      "h": "#5b6673",
      "k": "#1b1b1f",
      "r": "#d23c3c"
    }
  }
]
