<div align="center">

<p><picture>
  <source media="(prefers-reduced-motion: reduce)" srcset="Capturas/hero-quieto.webp">
  <img src="Capturas/hero.webp" alt="D-137, el panel de tus sesiones de Claude Code: las cinco pestañas reales pasan una a una al frente, cada una con su pregunta" width="100%">
</picture></p>

Un mod que pone junto al chat lo que pasa en todas las sesiones que tienes abiertas en el PC:<br>
qué hace cada una, cuál te espera, qué sigue en marcha y cuánto llevas gastado.<br>
Cada sesión es un personaje en pixel art.

<br>

[![Mod para Claude Code](https://img.shields.io/badge/Claude_Code-mod-bdf0ff?style=for-the-badge&labelColor=151515)](#instalarlo)
[![Windows 11](https://img.shields.io/badge/Windows-11-bdf0ff?style=for-the-badge&labelColor=151515)](#requisitos)
[![Todo se queda en tu PC](https://img.shields.io/badge/tus_datos-en_tu_PC-bdf0ff?style=for-the-badge&labelColor=151515)](#y-además)
[![Última versión](https://img.shields.io/github/v/release/davidmcaru/d-137?label=versi%C3%B3n&style=for-the-badge&color=bdf0ff&labelColor=151515)](https://github.com/davidmcaru/d-137/releases)
[![Licencia MIT](https://img.shields.io/badge/licencia-MIT-bdf0ff?style=for-the-badge&labelColor=151515)](LICENSE)

<br>

<a href="#qué-hace"><b>Qué hace</b></a> &nbsp;·&nbsp;
<a href="#instalarlo"><b>Instalarlo</b></a> &nbsp;·&nbsp;
<a href="#los-personajes"><b>Personajes</b></a> &nbsp;·&nbsp;
<a href="#ponerle-tus-atajos"><b>Tus atajos</b></a> &nbsp;·&nbsp;
<a href="#requisitos"><b>Requisitos</b></a> &nbsp;·&nbsp;
<a href="#cómo-está-hecho"><b>Cómo está hecho</b></a> &nbsp;·&nbsp;
<a href="#in-english"><b>English</b></a>

</div>

<br>

## Qué hace

Varias sesiones de Claude a la vez: una trabaja, otra te preguntó algo hace 26 minutos y otra está bloqueada esperando a
la tercera. Desde el chat no se ve. Con D-137, sí: cinco pestañas junto al chat, cada una con su personaje y una
pregunta.

### Sesión: ¿cómo va esta?

El contexto que lleva gastado, los pasos de su tarea, lo que ha gastado hoy y la sesión entera, en un bloque de 3 × 3:
cuánto lleva abierta y trabajando, lo que habría costado por la API, sus tokens y lo que hay sin commit (o, sin git, los
archivos que ha tocado). Debajo, las sesiones de su mismo repo (o de su misma rama, o las que empiezan igual de nombre:
lo eliges al instalarlo), lo que corre en ellas y lo que te ha entregado, para abrirlo con un clic.

<img src="Capturas/pestana-sesion.png" alt="La pestaña Sesión: el personaje de esta sesión con su contexto, sus pasos, lo gastado hoy y el bloque de 3 × 3" width="580">

### Todas: ¿cuál me necesita?

Todas las sesiones: cuáles trabajan, esperan o están bloqueadas, cuánto llevan así, quién espera a quién y lo que
necesita de ti, por orden.

<img src="Capturas/pestana-todas.png" alt="La pestaña Todas: lo que necesita de ti, primero la sesión bloqueada y después las que esperan, cada una con su frase" width="580">

### Decisión: ¿qué me toca decidir?

Lo que te toca decidir en todas las sesiones, pregunta a pregunta, con sus opciones y la recomendada. Contestas desde
aquí y la respuesta llega a su sesión como si la hubieras escrito allí.

<img src="Capturas/pestana-decision.png" alt="La pestaña Decisión: una pregunta de la sesión Agenda con sus opciones y la recomendada marcada" width="580">

### Activo: ¿qué sigue en marcha?

Lo que sigue en marcha: agentes, servidores y comandos de todas las sesiones, con su última línea; abre su salida en una
terminal o páralo. Y lo que han tardado y gastado los subagentes.

<img src="Capturas/pestana-activo.png" alt="La pestaña Activo: un comando con su progreso, un agente y un servidor local de dos sesiones" width="580">

### Cuota: ¿cuánto me queda?

La cuota: la semana, hoy y las 5 horas, si vas por encima o por debajo del ritmo de la semana, lo que gasta cada sesión
(en %, en tokens o en dólares) y a qué horas lo usas.

<img src="Capturas/pestana-cuota.png" alt="La pestaña Cuota: la semana, hoy y las 5 horas con lo que sobra, y el mapa de a qué horas lo usas" width="580">

*Las capturas llevan los datos de ejemplo de la prueba del mod.*

### Y además

- **Claude rellena el panel solo.** El mod le da una herramienta, `progreso`, y una instrucción corta: Claude cuenta ahí
  su plan, el paso en el que está y lo que te deja por decidir.
- **Dos frenos entre sesiones.** Si una va a escribir en un archivo que otra está tocando en ese momento, espera y avisa
  a la otra. Y antes de un `git restore`, `checkout`, `switch`, `stash`, `clean` o `reset --hard` que se llevaría
  cambios sin commit de otra sesión abierta, para una vez y dice qué y de quién. Los dos, solo el de git o ninguno: lo
  eliges al instalarlo.
- **La franja de atajos**, encima del mensaje: botones que escriben en la caja la skill o la orden que toca (commit,
  push…), donde esté el cursor y sin mandarla; y «Mods», que deja `/reload-plugins` escrito en todas las sesiones
  abiertas, para recargar el mod con un Enter en cada una.
- **Avisos** cuando otra sesión termina o te necesita.
- **Todo se queda en tu PC.** El mod no se conecta a nada: lee lo que Claude Code ya guarda en tu carpeta de usuario
  (`~/.claude`) y apunta lo suyo en `~/.claude/coordinador`.

## Instalarlo

<p><picture>
  <source media="(prefers-reduced-motion: reduce)" srcset="Capturas/instalar-quieto.webp">
  <img src="Capturas/instalar.webp" alt="Una terminal instala D-137 con una orden y el panel se abre solo a su lado" width="100%">
</picture></p>

En una terminal con Claude Code:

```
/plugin install d-137 --marketplace davidmcaru/d-137
```

Responde `y` para añadir el marketplace y elige el ámbito de usuario (el primero, con Enter). En la sesión donde lo
instalas funciona al momento; en las que ya estaban abiertas, escribe `/reload-plugins`. El panel se abre solo y, si lo
cierras, `/marty` o `/d-137` lo vuelven a abrir.

Te pregunta dos cosas, cada una con su desplegable:

- **Qué sesiones van juntas** en la pestaña Sesión: las del mismo repo, también desde otro worktree o en otra rama (lo
  que viene marcado); las del mismo repo y tu misma rama; o las que empiezan igual de nombre, si pones a tus sesiones
  nombres como «Web-01 Portada» y «Web-02 Menú».
- **Qué frenos quieres**: los dos, solo el de git o ninguno.

Se cambia luego en `/config` o con `/plugin configure d-137@d-137`.

<details>
<summary><b>Desde la consola, desde la app de escritorio o sin GitHub</b></summary>

<br>

Desde la consola de tu sistema:

```
claude plugin install d-137 --marketplace davidmcaru/d-137
```

En la app de escritorio de Claude: pulsa **+** junto a la caja del mensaje, luego **Plugins**, **Add marketplace** con
`davidmcaru/d-137` y, por último, **Add plugin**.

En Windows, sin GitHub: descarga el ZIP (**Code → Download ZIP**), descomprímelo donde quieras y haz doble clic en
`Instalar D-137.cmd`. Si luego mueves la carpeta, vuelve a hacerlo desde el sitio nuevo.

Instalado desde la consola o con `Instalar D-137.cmd`, no pregunta: se queda con lo marcado.

</details>

Para ponerlo al día: `claude plugin update d-137@d-137` y `/reload-plugins`. Para quitarlo:
`/plugin uninstall d-137@d-137`.

## Los personajes

<p><picture>
  <source media="(prefers-reduced-motion: reduce)" srcset="Capturas/personajes-quieto.webp">
  <img src="Capturas/personajes.webp" alt="Pantalla de recreativa con los 25 personajes: el selector pasa de uno a otro y enseña sus caras según trabaje, espere, esté bloqueado o parado" width="100%">
</picture></p>

Cada sesión lleva uno de los 25, el mismo mientras dure, con cuatro caras: trabajando, esperando, bloqueada y parada.
Todos, con sus cuatro caras, en [`Dibujos/Personajes`](Dibujos/Personajes).

![Los 25 personajes de las sesiones, en fila, con su nombre](Capturas/desfile.svg)

## Ponerle tus atajos

![La franja de encima del mensaje, con el menú «Más» abierto](Capturas/franja.png)

La franja viene con ejemplos, y todas sus rutas están en un archivo,
[`d-137/hooks/atajos.ts`](d-137/hooks/atajos.ts):

- **Fotos, Música, Vídeos y Recortes**, a la vista, y **Trabajo, Estudios y Gustos**, en «Más», escriben «Usa la skill
  _nombre_ (lee _ruta_): » para que acabes tú la frase. Vienen apuntando a `~/.claude/skills/<nombre>/SKILL.md`.
- **La cabeza de Doc** abre una página tuya, y **Analizar** y **Analizar Pro**, un `.cmd`, como con doble clic: la de
  Doc puede ser también un `.cmd`, el que arranque tu panel. Si el archivo no está, el panel te dice qué ruta falta.
- **Cerrar-Tanda**, en «Commit», sigue la receta de `.claude/commands/cerrar-tanda.md` del repo antes del commit y el
  push.

Tras cambiarlo, pulsa «Mods» (en «Más») o escribe `/reload-plugins` en cada sesión.

Una orden más: `/rotulo <texto>` cambia el nombre corto de la sesión en los paneles; sin texto, vuelve al suyo.

## Requisitos

- **Claude Code con mods** (los plugins de hooks en TypeScript). Probado con la versión 2.1.309, en la app de
  escritorio y en la terminal.
- **Windows** (probado en Windows 11). En macOS y Linux no está probado: abrir archivos y carpetas, y leer las
  transcripciones de más de 4 MB, van por PowerShell y el Explorador de Windows.

Los dólares son lo que habría costado cada sesión a precio de la API, y lo de cada rato de trabajo, una estimación. Si
Claude Code aún no ha dicho cuándo se renueva tu cuota semanal, el mod supone que los lunes a las 0:00.

## Cómo está hecho

- TypeScript, sin dependencias ni imágenes: cada dibujo es una rejilla de píxeles escrita en el código y pintada en
  SVG.
- Cada sesión deja su ficha en `~/.claude/coordinador` cada 3 segundos, y el panel de cada una lee las de todas.
- Las pruebas usan el banco de pruebas de Claude Code: [`Herramientas/d-137.test.tsx`](Herramientas/d-137.test.tsx).
- Lo que hace cada parte, cómo funciona por dentro y cómo cambiarlo, en [`d-137/README.md`](d-137/README.md).

<details>
<summary><b>Las carpetas del repo</b></summary>

<br>

```
.claude-plugin/marketplace.json   el marketplace, para instalarlo desde GitHub
d-137/                            el mod
Herramientas/                     la prueba, la vista previa, el instalador, el que pinta los dibujos y el desfile, y
                                  el generador de los personajes (generador/, en Python)
Dibujos/                          todos los dibujos del mod, en imagen (Dibujos.html, para verlos juntos)
Capturas/                         las imágenes de este README
Instalar D-137.cmd                el instalador para Windows, sin GitHub
```

</details>

Lo ha hecho [David M. Carrasco Ruiz](https://davidmcaru.com)
([LinkedIn](https://www.linkedin.com/in/davidmcaru)), con Claude Code. Los personajes son pixel art hecho para el mod.
Licencia [MIT](LICENSE).

## In English

A Claude Code mod that adds a panel beside the chat with every session open on your PC: what each one is doing, which
one needs you, what is still running and how much quota you have used. Each session is a pixel-art character. Windows
only for now, and everything stays on your PC. The panel and this page are in Spanish.

```
/plugin install d-137 --marketplace davidmcaru/d-137
```
