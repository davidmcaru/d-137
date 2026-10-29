# D-137 por dentro

El mod de Claude Code que pone junto al chat un panel con lo de todas las sesiones abiertas en el PC y, encima del
mensaje, una franja de atajos. Por dentro se llama `d-137@d-137` (el plugin `d-137`, de su marketplace `d-137`), y su
herramienta, `mcp__d-137__progreso`. Se instala con una línea, en una terminal con Claude Code (el resto de maneras,
en el [README de la raíz](../README.md)):

```
/plugin install d-137 --marketplace davidmcaru/d-137
```

## Qué enseña

Cinco pestañas, cada una con su ficha arriba (el dibujo en su marco, la línea grande, el nombre y tres filas de
cuadritos). Cuatro estados, con su color y su tiempo: Trabaja (azul), Espera (naranja: te ha preguntado algo),
Bloqueada (rojo: espera a otra sesión por un archivo) y Parada (gris: sin tarea). Las casillas de las sesiones llevan
el borde y el fondo del color de su estado, y se abren pulsando en cualquier parte. Las fichas salen desplegadas de
entrada, y cada una se pliega con su botón, a la derecha.

- **Sesión** (esta sesión; su pestaña lleva la cabeza de su personaje): su ficha, con el contexto que
  lleva gastado, los pasos y lo que ha gastado hoy de la cuota de la semana. El personaje con su «?» lleva a sus
  preguntas en Decisión, y con su «!», a Todas, donde se ve el bloqueo; arriba va el personaje, y debajo, el nombre entero
  de la sesión (si al instalarlo eliges juntar por el principio del nombre, arriba va además ese principio, el rótulo, y
  debajo, el resto), con un botón pequeño delante que copia el enlace de la sesión; la carpeta de arriba a la derecha la abre en el
  Explorador. Desplegada, bajo una raya, lo de toda la sesión en un bloque de 3 × 3: cuánto lleva abierta, cuánto ha
  trabajado y su rato de trabajo más largo; lo que habría costado por la API (en morado), lo de ese rato y lo que sale
  por hora de trabajo; sus tokens (en azul) y los del rato que más gastó; y lo que hay sin commit (en rojo) o, sin git,
  los archivos que ha tocado (en naranja).
  Debajo, los pasos de la tarea, los del plan que cuenta Claude (de 4 a 8), plegados en una barra con «Ahora:» y
  desplegados en cascada, con «Limpiar» para quitar los hechos; el bloque de su dimensión, las sesiones de tu mismo
  trabajo según lo elegido al instalar (abajo, «Al instalarlo»): las del mismo repo, también desde otro worktree
  («Dimensión mi-web»), las del mismo repo y tu misma rama («Dimensión mi-web · main») o las que empiezan igual de nombre,
  hasta el primer espacio o guion («Web-01» y «Web-02» van juntas); y, sea cual sea su dimensión, las que chocan
  con esta (la que esperas o te espera, «Bloqueo», y la que toca tu mismo archivo, «Jope»), en rojo; con un Trabajador por
  cada tipo de lo que corre en el repo (agentes, servidores, comandos), que lleva a Activo con lo activo de ese tipo.
  Y lo entregado: lo que Claude crea (Write), te manda (SendUserFile) o te da en el chat para abrir con «Run»
  (`explorer.exe "<ruta>"`), con copiar la ruta, abrir la carpeta con el archivo marcado y abrirlo en su programa, salvo
  el código, que va a VS Code (un `.py` o un `.js` abiertos con su programa se ejecutarían). Plegado, lo de la última
  hora, como mucho tres; desplegado, hasta 50.
- **Todas** (todas las sesiones): su ficha (trabajan, esperan y bloqueadas) y, desplegada, el bloque de 3 × 3 de Marty con lo de
  todas las sesiones: sumado lo que se suma, y el rato más largo y el que más gastó, el de la que más. Las sesiones, en
  casillas, cuatro por fila, con un selector de estado y el tiempo que lleva cada una en su estado («26 min»); al pulsar
  su nombre o su tiempo, su panel (el rótulo pixelado, sus pasos, su gasto, su carpeta con la rama y los cambios sin
  commit, y «Contestar», «Avisar a…» o «Sesión»). El bloqueo, si lo hay, y lo que necesita de ti, por grupos. Una sesión
  parada no se cierra desde aquí: «Sesión» lleva a ella, para mirar qué hacía y cerrarla a mano.
- **Decisión** (lo que te toca, de todas las sesiones): su ficha y, desplegada, un bloque de 3 × 3 con las preguntas que
  te han hecho todas las sesiones, en total, hoy y esta semana (de lunes a domingo), cada una una vez aunque se vuelva a
  mandar; cómo contestas (con la recomendada, desde el panel o con lo tuyo, «Otra»), sacado de tu siguiente mensaje
  («todo lo recomendado», «1a 2b», «2: lo mío»); y lo de ahora: lo que te toca, las sesiones que te esperan y los avisos.
  Debajo, las preguntas una a una, con su contexto, las opciones enteras (se pulsa su caja o su letra), la recomendada
  en verde y «Otra» para escribir la tuya; el resumen y «Mandar a…», que manda la respuesta a su sesión; «Mandar todo» y
  «Copiar todo»; lo ya mandado, atenuado y con su tick hasta que esa sesión se pone a trabajar con la respuesta; y los
  avisos (lo que acabó bien o mal en segundo plano y las sesiones que llevan más de una hora paradas), con «Visto».
- **Activo** (lo que sigue en marcha): su ficha y, desplegada, el bloque de 3 × 3 de Marty, pero de los subagentes de
  todas las sesiones: lo que han tardado, lo que han costado (su parte del coste de su sesión, por lo que pesan) y sus
  tokens, en total, el que más y de media por agente, y los que acabaron mal, en rojo. Debajo, los servidores, comandos y
  agentes de todas las sesiones, activos o acabados, con su última línea y su avance, un bloque por sesión: `>_` abre una
  terminal que sigue su salida, ■ lo para (con una segunda pulsación), ⧉ copia la dirección de un servidor y «Limpiar»
  quita los acabados.
- **Cuota** (la cuota y el día): la semana, hoy y las 5 horas, y si te sobra o te falta para el ritmo de la semana;
  desplegada, la semana día a día, de lunes a domingo, con «se renueva» donde cambia la cuota. Lo gastado por cada
  sesión desde que se renovó la semana (desplegado, dos barras: la de la semana y, debajo, la de hoy), con el botón de la
  unidad: el %, los millones de tokens o los dólares a precio de la API. La semana empieza cuando se renueva la cuota:
  lo que diga Claude Code, en esta sesión o en otra, y, si nunca lo ha dicho, los lunes a las 0:00. Cuándo lo usas,
  por horas: con «Esta semana», la media de los días entre semana y la del finde y, desplegado, cada día; con «Media»,
  la de las cuatro semanas de antes. Y el día: lo que acabó cada sesión.

**La franja**, solo iconos pixelados, sin cajas: la cabeza de Doc (abre tu página); Fotos, Música, Vídeos y Recortes,
que escriben en la caja la skill que toca con la ruta entera de su documento («Usa la skill Fotos (lee …): »), donde
esté el cursor, sin borrar lo escrito y con un espacio si iría pegado a otra palabra; y, a la derecha, Más y Commit,
que despliegan debajo su menú. En Más: Analizar y Analizar Pro (abren su `.cmd`); Trabajo, Estudios y Gustos, que
escriben su skill como las de mano; «Mods», que deja `/reload-plugins` escrito en la caja de esta sesión y de las demás
abiertas, para mandarlo con Enter; y «Compact», que escribe `/compact` con lo que hay que conservar. En Commit, de lo
que se queda en local a lo que va al repo con más proceso: Cambios, Commit, Push, Cerrar-Tanda, Push+Ramas y Push+E2E,
que escriben en la caja su orden entera, sin mandarla. Todas las rutas, en `hooks/atajos.ts`.

**La pestaña** es la misma en todas las sesiones: la que eliges en una se apunta en `coordinador/vista.json` y las demás
se ponen en ella en un segundo.

Al terminar con decisiones, el mensaje propone «todo lo recomendado» en gris, para cogerlo con Tab. Cuando otra sesión
termina o te necesita, sale un aviso.

## Al instalarlo

Claude Code pregunta dos cosas al instalar el mod, en una pantalla con un desplegable para cada una (los campos de
`userConfig` de `.claude-plugin/plugin.json`); luego se cambian en `/config`, y el cambio recarga el mod
(`hooks/ajustes.ts`):

- **Qué sesiones van juntas** (la Dimensión de Sesión): «Mismo repo», también desde otro worktree o en otra rama (sin
  git, la misma carpeta), la que viene marcada; «Mismo repo y rama»; o «Mismo principio del nombre», para quien pone a
  sus sesiones nombres como «Web-01 Portada» y «Web-02 Menú». Con esta última, el principio del nombre es el rótulo de
  cada sesión; con las otras dos, el rótulo es el nombre entero, y la ficha de Sesión lleva arriba solo el personaje.
- **Frenos entre sesiones**: «Los dos» (el de archivos y el de git, más abajo), «Solo el de git» o «Ninguno».

Los textos de las opciones son lo que Claude Code guarda: si se cambia uno, quien lo había elegido vuelve al de por
defecto.

## Órdenes

- `/marty` abre el panel en Sesión, y `/d-137`, en Todas.
- `/rotulo <texto>` cambia el rótulo de la sesión en los paneles; sin texto, vuelve a su nombre.

## Cómo funciona

- **Las fichas** (`hooks/fichas.ts`): cada sesión deja la suya en `~/.claude/coordinador/<id>.json`, con su personaje,
  su nombre, su rótulo, su estado, su paso, sus decisiones, lo que tiene en marcha, su gasto, los archivos que toca, su
  carpeta (rama, cambios sin commit y la raíz de su worktree principal, la misma en todos los worktrees del repo) y el
  enlace para abrirla en la app, y la renueva cada 3 s; la que lleva 20 s sin
  renovarla sale de los paneles. Si dos sesiones arrancan a la vez con el mismo personaje, se lo queda la que llegó
  antes.
- **El registro del día** (`coordinador/registro/<id>.json`): lo que costó y lo que acabó cada sesión cada día, aunque
  ya esté cerrada, también hora a hora (para cortar la semana a la hora en que se renueva) y con sus tokens. Los dólares
  se apuntan a medida que sube el coste de la sesión (cada 30 s y al acabar cada turno): así lo de los subagentes, que el
  coste de la sesión ya suma, cuenta una sola vez. Los tokens salen de su transcripción
  (`~/.claude/projects/<carpeta>/<id>.jsonl` y las de sus subagentes, en `<id>/subagents`), cada respuesta una vez y con
  su hora (`hooks/tokens.ts`): se lee entera solo si ha cambiado, como mucho cada dos minutos o al acabar un turno.
- **Lo de toda la sesión** (el bloque de 3 × 3 de Marty, `hooks/sesion.ts`), de las mismas transcripciones: un rato de
  trabajo va desde tu mensaje (o el aviso que la pone a trabajar) hasta su última respuesta del turno, y se corta
  mientras te pregunta y espera, y tras más de un cuarto de hora sin nada; cada «Máx» es el suyo (el rato más largo, el
  que más tokens gastó y el que más costó). El coste de un rato es una estimación: Claude Code da el de la sesión sumado,
  y se reparte por lo que pesa en dólares lo de cada rato (escribir en la caché, leerla, la salida, el modelo). Una
  sesión que la app vuelve a abrir con otro id sigue contando lo de la de antes: su resumen dice dónde está aquella
  transcripción. Los archivos, sin git: los que escribe o te manda, y los que crean, cambian, mueven o borran sus
  órdenes en las carpetas que nombran (lo cambiado mientras corrían), cada uno una vez; lo de `~/.claude` no cuenta.
- **Los subagentes**: sus turnos también pasan por `turn.start` y `turn.complete` (con su `agentId`), y no tocan el
  estado, los pasos ni el plan de la sesión.
- **La cuota de todas** (`coordinador/cuota.json`): la lleva una sola sesión, la que llegó antes: apunta el % de la
  semana al empezar y al acabar cada día y lo gastado en cada hora, con la lectura más nueva de todas.
- **El gasto de cada sesión**: Claude Code solo da el % de la cuenta entera; lo de cada una sale de lo que cuesta (los
  dólares que suma su motor) por lo que vale cada dólar en % esos días (`hooks/calculos.ts`). Restar el % de antes y el
  de después contaría lo de todas las que trabajan a la vez.
- **El rótulo** sale del nombre de la sesión en la app, lo de delante del guion («PDF - Informe» → PDF) o, sin guion,
  la primera palabra («Not-02 Notas del proyecto» → Not-02, y debajo, «Notas del proyecto»), que Claude Code apunta en
  `~/.claude/sessions/<pid>.json`; de ahí sale también el enlace de la sesión (`claude://claude.ai/epitaxy/<id>`), que
  abre «Sesión». Eso, juntando por el principio del nombre; juntando por repo o por rama, el rótulo es el nombre entero.
- **Mandar una respuesta**: Decisión la manda a su sesión (`$.session.send`), y el mod de allí, si viene de este mod, con
  su marca, y tiene decisiones pendientes, la pasa como mensaje de la persona (`session.receive` y `$.prompt.submit`).
- **La recarga de «Mods»**: la app no deja que un mod lance `/reload-plugins` (sale «isn't available over a remote
  connection»): solo vale escrito por ti. Así que «Mods» lo deja escrito en la caja de esta sesión y manda «D-137 ·
  recarga el mod» a cada sesión abierta; el mod de allí se lo queda, sin que llegue a Claude (el mensaje llega con el
  marco de los de otra sesión, que se quita para reconocerlo), y lo deja escrito en su caja. La que está trabajando, al
  acabar su turno; si en la caja hay algo tuyo, no lo pisa: lo copia y te avisa.
- **Las transcripciones grandes**: la app no deja que un mod lea de una vez un archivo de más de 4 MiB, y las de una
  sesión larga pesan más (la de un día de trabajo, unos 30 MB). Esas se leen por PowerShell, que deja fuera las
  peticiones a la API y las copias de archivos y, de cada resultado de una herramienta, solo a qué llamada responde y
  cuándo: 28 MB se quedan en 7, en menos de un segundo, y salen las mismas cifras que leyéndola entera.
- **Los dos frenos**, los dos, solo el de git o ninguno, según lo elegido al instalar. Sin el de archivos, el archivo se
  apunta igual en la ficha: el panel sigue diciendo quién toca lo mismo.
- **El freno de choques**: antes de un `Edit` o un `Write`, si otra sesión está tocando ese archivo en su turno, esta
  recibe un `{ deny }` con el motivo, y aquella, un mensaje.
- **El freno de git**: antes de un `git restore`, `checkout`, `switch`, `stash`, `clean` o `reset --hard`, mira con
  `git status` qué está cambiado sin commit en ese repo; si algo de eso lo tocó otra sesión abierta, para la orden una
  vez y dice qué y de quién. Si Claude la repite en el mismo turno, tras comprobarlo, pasa.
- **Lo que sigue en marcha**: una orden en segundo plano se apunta con su id y el fichero de su salida, y su última
  línea se lee cada 6 s; el aviso de fin la marca como acabada. Los agentes salen de `$.agent.list()`.
- **Los pasos y lo que te toca**: cada herramienta es un paso. Lo que el panel no sabe solo (el paso en palabras
  sencillas, lo hecho y las decisiones con su contexto) se lo pasa Claude con la herramienta `progreso`, y el mod añade
  una instrucción corta a las de cada sesión para que lo haga. Las decisiones siguen en Decisión hasta que las contestas:
  desde el panel (la respuesta llega a su sesión como mensaje tuyo y las quita al llegar, aunque esa sesión esté
  trabajando) o en el chat de su sesión, porque un mensaje tuyo (no una orden como `/marty`) las quita al llegar, y a
  Claude le llega al lado la lista de las quitadas para que vuelva a mandar las que sigan sin contestar. También se van
  cuando Claude manda otras, o `decisiones: []`; un turno que no empieza con un mensaje tuyo (el aviso de una tarea en
  segundo plano, el mensaje de otra sesión) no las quita. Si Claude salta a un paso más adelante, los de antes cuentan
  como hechos, sin tiempo, y al acabar la tarea (`hecho`), todos; «Limpiar», con la sesión parada, deja la lista vacía.
- **Los dibujos** (`hooks/dibujos.ts`): todos en SVG, con sus píxeles enteros: los Martys (`hooks/martys.ts`), Doc,
  Paloma mensajera, Trabajador, la pistola de portales, la letra pixelada del rótulo y los iconos. El mod no usa
  imágenes; para verlos en imagen, la carpeta `Dibujos` del repo (la pinta `Herramientas/Rehacer dibujos.cmd`).
- **Los personajes de las fichas** (`hooks/personajes.ts`): en grande, cada uno con su estado en la cara (normal,
  esperando, bloqueado y pausado), lo más grandes que quepan en su recuadro (84 × 100 px; en el panel de la elegida,
  62 × 72) y centrados; el «?», el «!» o las zetas van aparte, encima, en la esquina del recuadro, sin mover al
  personaje. En la ficha de Marty, el recuadro lleva además el borde y el fondo de su estado, como las casillas; en
  pequeño (casillas, pestañas y franja, hasta 20 px), su dibujo pequeño. La pestaña Sesión lleva la cabeza del
  personaje de la sesión (`cabezaDe`), recortada de su dibujo de ficha, con el cuello de la camiseta, que deja ver su
  color (Marty y Azul solo se distinguen por ella). Doc cambia de cara según cómo van todas: una si hay algún bloqueo,
  otra si alguna espera una decisión, otra si están todas paradas y, si no, dos que se alternan cada medio minuto.
- **El personaje de cada sesión**: al abrirla, uno libre al azar (siempre el mismo para la misma sesión, porque sale de
  su id) entre los 25 que hay: los Martys (Marty D-137, Azul, Evil, Mutante, Xenomarty y Martinator), los de reserva
  (Verano, Liz, Gerardo, Copito, Terror, Pompis, Mantequillo y Michi) y los disfrazados, dibujados sobre la cabeza y el
  cuerpo de Marty (Poli, Vaquero, Pirata, Gecko, Cíclope, Tóxico, Mini Doc, Astronauta, Pepinillo, Pecas y Ronin).
- **El aspecto** (`hooks/kit.tsx`): el escritorio no deja poner CSS, así que lo que pinta a su manera se dibuja en SVG
  con los colores y las medidas de un CSS de referencia (`T`): los botones (con su icono; el principal, cian, y el de
  Decisión, azul), las pestañas con el dibujo de su ficha, las pastillas, las etiquetas de estado y de tipo, los filtros,
  las líneas entre filas, los números de «Lo que necesita de ti», las teclas de las opciones, la fila de Decisión y las
  etiquetas de los menús de la franja. El texto de un SVG no crece: su ancho se calcula letra a letra (`anchoTexto`).
  Se pulsan con la zona propia (`toque`) y, debajo, un botón en blanco con la clave de siempre (`svgPulsable`); en la
  terminal, que no pinta SVG, salen botones normales.

**Lo que el escritorio pinta y lo que no**, por si haces un mod:

- un `Svg` con el `alt` vacío no se pinta: todos llevan su texto;
- dentro de un botón solo cabe texto, y sin su color ni su negrita: por eso los botones van dibujados;
- el borde de una caja es de 1 px y deja el hueco de una fila por lado: dos cajas, una dentro de otra, salen como un
  marco gordo, así que las casillas y los paneles llevan uno solo, de su color, con el fondo opaco (`grueso` y `mezcla`);
- la zona propia (`toque`) va solo en las casillas enteras: con una encima de cada botón dibujado eran decenas y los
  clics se perdían; cuenta un clic que baja y sube dentro, aunque el panel se redibuje entre medias;
- los trazos discontinuos de un SVG no se pintan: las rayas a trazos van con rayitas rellenas;
- para pulsar un dibujo (el personaje de una casilla, un Trabajador, un icono de la franja) va encima un botón de
  caracteres en blanco (U+2800), en una capa que sobresale una columna por lado (`pulsable`, en `comun.tsx`): el botón
  lleva su relleno aunque no se vea, y si no cabe el escritorio lo corta con «…», que sí se ve;
- una casilla entera se pulsa con una zona propia del escritorio (`hooks/toque.tsx`, un `Client`) que no pinta nada y
  avisa del clic al mod (`ui.message`); va solo donde no hay botones debajo, y si no carga (`ui.fault`) se quita y queda
  el botón del dibujo;
- una caja con borde gana el alto de una fila arriba y otra abajo; el fondo de un `Text` no siempre se pinta, y va en
  su caja;
- un `Svg` sin ancho toma el de su dibujo hasta el de su hueco; uno más ancho, con `preserveAspectRatio="none"`, se
  encoge justo hasta su hueco (`dibujoLleno`): así llegan las barras y los cuadritos hasta la cifra, sea cual sea el
  ancho del panel.

**El panel**: `hooks/panel.tsx` (las pestañas y la franja), una pestaña por archivo (`marty.tsx`, `doc.tsx`,
`pajaro.tsx`, `genio.tsx` y `portales.tsx`), lo común en `comun.tsx` y las gráficas en `graficas.ts`;
`hooks/register.tsx` engancha los eventos y guarda lo de la vista (la pestaña, lo desplegado, lo pulsado).

## Para cambiarlo

- **Los atajos de la franja**, en `hooks/atajos.ts`. Después, «Mods» o `/reload-plugins` en cada sesión.
- **La prueba**, `Herramientas/d-137.test.tsx`: se copia en la raíz de una copia de la carpeta `d-137` y se pasa con
  `claude plugin test <esa copia>`. Imprime el árbol de cada pestaña entre marcas («ARBOL:<nombre>»).
- **La vista previa**, `Herramientas/vista.cjs`: pinta esos árboles como HTML con el aspecto oscuro de la app y saca una
  imagen por pestaña (`node vista.cjs <árboles.txt> <carpeta>`). Es aproximada: los botones y la letra de la app no son
  exactamente así. Necesita Playwright: el de esa carpeta (`npm i playwright`) o el de la que diga `PLAYWRIGHT_DIR`.
- **Antes de darlo por bueno**: `claude plugin validate` en la raíz del repo, `tsc` con un `tsconfig.json` fuera del mod
  y la prueba.
- **Los dibujos de los personajes** (`hooks/personajes.ts`) no se tocan a mano: los escribe el generador,
  `Herramientas/generador/exportar_mod.py` (Python 3, sin nada más instalado): `python exportar_mod.py` reescribe
  `d-137/hooks/personajes.ts`. Cada personaje se dibuja en su rejilla de píxeles, en `it4/caras.py` (Doc y la base de
  Marty), `it5/martys5.py` (los Martys), `it5/otros5.py` y `it6/estados6.py` (los de reserva, Trabajador, Paloma mensajera y la
  pistola, con sus cuatro estados) e `it7/nuevos7.py` (los disfrazados), con el estilo de `it4/estilo.py` y
  `it3/pixel.py`. Después, `Herramientas/Rehacer dibujos.cmd` vuelve a pintar en imagen todos los dibujos del mod en
  `Dibujos`.

## De reserva

`recursos/reserva.json` guarda dibujos que no carga nada, en la rejilla de los Martys: personajes de más (Verano, Liz,
Gerardo, Copito, Terror, Pompis, el robot de la mantequilla y Michi), por si hay más sesiones que
personajes; objetos (la batería cósmica, el chirimbolo, la tele cósmica, el cristal del destino y el
arcade), como ideas para una pestaña nueva; y los de las fichas de Decisión (Paloma mensajera) y Cuota
(la pistola de portales).
