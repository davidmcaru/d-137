// Los tokens de una sesión, sacados de su transcripción: Claude Code da sumados los dólares (/cost), pero no los tokens
// (28-oct: «los millones de tokens que lleva gastados cada sesión»). Cada línea de una respuesta del modelo en el
// .jsonl lleva su uso, con su hora; y los subagentes tienen el suyo aparte, en <id>\subagents. Contando de ahí sale
// todo, con su hora y sin que un subagente cuente dos veces
import { diaDe } from './fichas'

const ceros = () => Array.from({ length: 24 }, () => 0)

type Uso = Record<string, unknown>
const num = (u: Uso, k: string) => (typeof u[k] === 'number' ? (u[k] as number) : 0)
const suma = (u: Uso) =>
  num(u, 'input_tokens') + num(u, 'output_tokens') + num(u, 'cache_read_input_tokens') + num(u, 'cache_creation_input_tokens')
// Lo que pesa en dólares, en tokens de entrada: escribir en la caché cuesta 1,25 (5 min) o 2 (1 h), leerla 0,1 y la
// salida 5; y un Haiku o un Sonnet, menos que un Opus. Solo sirve para repartir el coste de la sesión entre sus ratos
const pesoDe = (u: Uso, modelo: string) => {
  const h1 = num((u.cache_creation ?? {}) as Uso, 'ephemeral_1h_input_tokens')
  const m5 = Math.max(0, num(u, 'cache_creation_input_tokens') - h1)
  const p = num(u, 'input_tokens') + m5 * 1.25 + h1 * 2 + num(u, 'cache_read_input_tokens') * 0.1 + num(u, 'output_tokens') * 5
  return p * (/haiku/i.test(modelo) ? 0.2 : /sonnet/i.test(modelo) ? 0.6 : 1)
}
// El uso de una respuesta: el de arriba o, si es más, el de sus iteraciones (en una sesión que sigue de otra, la
// primera respuesta copiada lo trae a cero arriba y entero en ellas)
export function usoDe(u: Uso, modelo = ''): { n: number; peso: number } {
  const its = Array.isArray(u.iterations) ? (u.iterations as Uso[]) : []
  const enIts = its.reduce((s, x) => s + suma(x), 0)
  if (enIts > suma(u)) return { n: enIts, peso: its.reduce((s, x) => s + pesoDe(x, modelo), 0) }
  return { n: suma(u), peso: pesoDe(u, modelo) }
}

// Los tokens de una o varias transcripciones (.jsonl), sumados por día y por hora (la del PC). Cada respuesta sale en
// varias líneas, una por bloque, con su uso repetido: cuenta una vez (por su id y la de su petición), con la cifra más
// alta. Todos: los de entrada, los de salida y los que lee y escribe en la caché
export function tokensDe(textos: string[]): { total: number; dias: Record<string, number[]> } {
  const vistas = new Map<string, { t: number; n: number }>()
  for (const texto of textos) {
    for (const l of texto.split('\n')) {
      if (!l.includes('"usage"') || !l.includes('"assistant"')) continue
      let x: { type?: string; timestamp?: string; requestId?: string; message?: { id?: string; usage?: Uso } }
      try {
        x = JSON.parse(l)
      } catch {
        // una línea a medio escribir: la última, mientras trabaja
        continue
      }
      const u = x.message?.usage
      const t = Date.parse(x.timestamp ?? '')
      if (x.type !== 'assistant' || !u || !Number.isFinite(t)) continue
      const n = usoDe(u).n
      const clave = `${x.message?.id ?? ''}:${x.requestId ?? ''}`
      const antes = vistas.get(clave)
      if (!antes || n > antes.n) vistas.set(clave, { t: antes?.t ?? t, n })
    }
  }
  const dias: Record<string, number[]> = {}
  let total = 0
  for (const { t, n } of vistas.values()) {
    const fila = dias[diaDe(t)] ?? (dias[diaDe(t)] = ceros())
    const h = new Date(t).getHours()
    fila[h] = (fila[h] ?? 0) + n
    total += n
  }
  return { total, dias }
}

// Dónde están las transcripciones de una sesión: la suya, en la carpeta de su proyecto (~/.claude/projects/<carpeta>/
// <id>.jsonl), y las de sus subagentes (<id>/subagents/*.jsonl), con su tamaño y su fecha, para no leerlas si no han
// cambiado
export type Transcripcion = { ruta: string; size: number; mtimeMs: number }
type Entrada = { name: string; kind: string; size?: number; mtimeMs?: number }
export async function transcripcionesDe($: any, casa: string, id: string, proyecto: string | null):
  Promise<{ proyecto: string | null; archivos: Transcripcion[] }> {
  const base = `${casa}/projects`
  const lista = async (dir: string): Promise<Entrada[]> => {
    try {
      return (await $.fs.list(dir)) as Entrada[]
    } catch {
      return []
    }
  }
  let dir = proyecto
  let principal = dir ? (await lista(dir)).find(f => f.kind === 'file' && f.name === `${id}.jsonl`) : undefined
  if (!principal) {
    dir = null
    for (const p of await lista(base)) {
      if (p.kind !== 'dir') continue
      const f = (await lista(`${base}/${p.name}`)).find(x => x.kind === 'file' && x.name === `${id}.jsonl`)
      if (f) {
        dir = `${base}/${p.name}`
        principal = f
        break
      }
    }
  }
  if (!dir || !principal) return { proyecto: null, archivos: [] }
  const de = (ruta: string, f: Entrada): Transcripcion => ({ ruta, size: f.size ?? 0, mtimeMs: f.mtimeMs ?? 0 })
  const subs = (await lista(`${dir}/${id}/subagents`))
    .filter(f => f.kind === 'file' && f.name.endsWith('.jsonl'))
    .map(f => de(`${dir}/${id}/subagents/${f.name}`, f))
  return { proyecto: dir, archivos: [de(`${dir}/${id}.jsonl`, principal), ...subs] }
}
