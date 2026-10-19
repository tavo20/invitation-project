---
format: 1080x1920
duration: 51s
message: "Tus invitados llenan el álbum y eligen la música; ustedes y su DJ tienen el control"
arc: Demo Loop en dos actos — gancho → dos apps → Álbum (invitado → panel de los novios) → cambio de app → La Pista (invitado → DJ → estado) → CTA
audience: "Novios (cliente final): parejas que se casan en Colombia"
mode: collaborative
music: none
---

## Video direction

- **palette system (de `frame.md`)** — Acto 1, frames 1–6: fondo `bg-primary` crema #faf7f4, tinta `text-primary`, acento `accent` rosa taupe, líneas `line`; display Cormorant Garamond, marca en Great Vibes, texto de apoyo Inter. Frame 7 es la bisagra: arranca crema y termina en noche. Acto 2, frames 8–11: fondo `pista-bg` #0d0d0d con un resplandor `pista-violet`→`pista-magenta` muy suave arriba; títulos en Unbounded (`pista-display` / `pista-label`), texto Inter `pista-text` / `pista-muted`. Frame 12: mitad crema / mitad noche, la marca une las dos. Nunca inventar colores fuera de estos roles.
- **el dispositivo** — un solo celular (marco negro redondeado, sin muesca exagerada, sombra suave larga) que muestra las capturas reales a pantalla completa del teléfono. Es el mismo objeto físico en todo el video: cambia lo que muestra, no el aparato. Tamaño base ~74% del alto útil, centrado o a 60/40 según el frame. Los acercamientos a una zona de la pantalla son `zoom-to-target` del celular entero (no se recorta la captura).
- **motion grammar + reveal model** — curvas largas `power3`, nada de rebotes. Cada pieza entra cuando la voz la nombra (reveal pautado por la voz; nunca todo en el primer 25%). Los cambios de pantalla dentro del celular son `scale-swap` cortos o un `crossfade` de la captura, y los toques del dedo son `button press` con un círculo de toque (sin cursor de mouse). Entre frames del mismo acto el celular continúa (handoff) para que se sienta un solo recorrido.
- **rhythm / stillness** — frames que respiran (lectura quieta al final): 2 (las dos apps), 6 (el panel, antes del giro) y 12 (cierre). Frames de energía: 4, 7, 8, 10. El frame 7 es el clímax visual (cambio crema → noche) y va precedido por la quietud del 6.
- **texto en pantalla** — pocas palabras, en `display`/`pista-display`, una frase corta por frame como titular arriba del celular (o al lado en 60/40); los subtítulos de la voz van en la banda inferior. Nunca repetir el subtítulo como titular.
- **caption band** — el 17% inferior queda libre para los subtítulos; el celular y los titulares viven en el 83% superior.
- **negative list** — sin rebotes ni elásticos; sin cursores de mouse ni barras de navegador; sin degradados "IA" morado-azul de fondo (el violeta solo como resplandor sutil del acto 2 y en la marca); sin bokeh flotante; sin precios ni WhatsApp; no inventar pantallas: solo las capturas del inventario. Ningún frame "presentación" (todo de entrada y luego congelado) ni "salvapantallas" (todo flotando a la vez).
- **audio** — voz Brian arriba; música propia: pista A (romántica) frames 1–6, crossfade a la pista B (pop latino) en el toque del frame 7; la música baja bajo la voz. Sin efectos de sonido de biblioteca.
<!-- Música propia (no de la biblioteca): pista A romántica en los frames 1–6 y crossfade a la pista B pop latino
     en el frame 7 (el toque en "Pide tu canción") hasta el cierre. Se monta a mano en el index, bajo la voz. -->

## Frame 1 — Lo que todos quieren en tu boda

- scene: Sobre crema, la frase se arma en dos golpes: "Las fotos de todos…" y luego "…y su canción." con una nota violeta que se cuela
- voiceover: "En tu boda, todos quieren dos cosas: ver las fotos… y escuchar su canción."
- duration: 4.923s
- transition_in: cut
- status: animated
- src: compositions/frames/01-hook.html
- type: hook
- persuasion: Deseo compartido (lo que pasa en toda boda)
- beat: curiosidad cálida
- asset_candidates: none
- blueprint: kinetic-type-beats (Adapt)
- focal: none
- roles: —
- sfx: none

Adapt: se mantiene la frase que se arma por golpes; dos golpes en vez de tres y el segundo trae un acento de color (nota violeta) que anticipa el acto 2.
Scene 1 (0.0–1.4s): fondo crema con un anillo fino `geo-ring` muy tenue; aparece "En tu boda" en Cormorant pequeño arriba y debajo, por palabras, "todos quieren dos cosas" — centrado, tercio superior. → per-word staggered reveal
Scene 2 (1.4–2.6s): cuando la voz dice "ver las fotos", entra grande "las fotos…" en Cormorant display tinta, con un marco de foto (línea fina) que se dibuja alrededor. → per-word staggered reveal + SVG self-draw
Scene 3 (2.6–4.0s): en "y escuchar su canción" entra debajo "…y su canción." en Cormorant itálica con una pequeña nota musical violeta que se cuela y queda flotando apenas (jitter mínimo); lectura quieta al final. → spring-pop entrance (sin rebote) + subtle jitter

narrativeRole: nombra el deseo doble que el video resuelve; anticipa los dos actos (fotos → música).
keyMessage: tu boda tiene dos protagonistas además de ustedes: los recuerdos y la música.

## Frame 2 — Dos apps, un evento

- scene: Dos celulares se abren como un libro: a la izquierda el Álbum (crema, "ÁLBUM"), a la derecha La Pista (negro, "LA PISTA"); se nombran con su ícono
- voiceover: "Con InvitApp, tu evento trae dos apps: el Álbum… y La Pista."
- duration: 4.783s
- transition_in: crossfade
- status: animated
- src: compositions/frames/02-dos-apps.html
- type: product_intro
- persuasion: Paquete completo (dos en uno)
- beat: revelación
- asset_candidates: assets/a01-album-grid.png, assets/m07-guest-playing.png
- blueprint: comparison-split (Reproduce)
- focal: assets/a01-album-grid.png
- roles: a01-album-grid = supporting (celular izquierdo) · m07-guest-playing = supporting (celular derecho)
- sfx: none

Scene 1 (0.0–1.4s): sobre crema, "InvitApp" en Great Vibes aparece arriba al centro; aún sin celulares. → per-word staggered reveal
Scene 2 (1.4–2.8s): en "el Álbum…" entra desde la izquierda un celular con `a01-album-grid` inclinado (giro 3D tipo libro abierto) y debajo la etiqueta "ÁLBUM" con su ícono de cámara rosa. → split-tilt cards (lado izquierdo)
Scene 3 (2.8–4.0s): en "…y La Pista" entra desde la derecha el segundo celular con `m07-guest-playing` (pantalla negra violeta) con la etiqueta "LA PISTA" en Unbounded degradado; detrás de él el fondo se oscurece apenas en esa mitad. Las dos etiquetas hacen un pop suave y quedan quietas. → split-tilt cards (lado derecho) + spring-pop entrance
handoff_out: el celular izquierdo (Álbum) sale hacia el centro: x: 30%→50%, scale 0.62→0.74, opacity 1, rotationY 18°→0°; el derecho sale por la derecha con fade.

narrativeRole: presenta las dos apps como un par antes de mostrar cada una.
keyMessage: InvitApp = Álbum + La Pista.

## Frame 3 — El QR de la mesa

- scene: El QR de la mesa se escanea y el celular aterriza en el Álbum de Ana & Pedro: cuadrícula de fotos de la boda, con un video
- voiceover: "Tus invitados escanean el QR de su mesa… y entran al álbum."
- duration: 3.994s
- transition_in: crossfade
- status: animated
- src: compositions/frames/03-qr.html
- type: feature_showcase
- persuasion: Cero fricción (sin descargar nada)
- beat: facilidad
- asset_candidates: assets/qr-mesa.png, assets/a01-album-grid.png, assets/a02-album-grid-scroll.png
- blueprint: device-surface-showcase (Adapt)
- focal: assets/a01-album-grid.png
- roles: qr-mesa = supporting (tarjeta de mesa) · a01-album-grid = cutout (pantalla del celular) · a02-album-grid-scroll = supporting (scroll)
- sfx: none

Adapt: se mantiene el celular como héroe con un flujo real; el primer paso no es una pantalla sino el QR de la mesa.
handoff_in: celular Álbum en x 50%, scale 0.74, opacity 1, rotationY 0°, mostrando a01-album-grid.
Scene 1 (0.0–1.6s): una tarjeta de mesa crema con el QR (`qr-mesa`) y la línea "Escanea y comparte" entra en primer plano abajo-izquierda, el celular queda detrás desenfocado; una línea de escaneo recorre el QR. Layered-depth, 3 capas. → depth-of-field-blur + bars/progress wipe
Scene 2 (1.6–3.0s): en "y entran al álbum" la tarjeta se desliza fuera y el celular gana foco mostrando la cuadrícula de Ana & Pedro (`a01-album-grid`); titular arriba "Entran con un QR" en Cormorant. Centrado. → depth-of-field-blur (se aclara) + spring-pop
Scene 3 (3.0–4.0s): dentro de la pantalla la cuadrícula se desplaza suave hacia `a02-album-grid-scroll` (más fotos de la fiesta) y se detiene. → 3D page-scroll reveal (scroll interno, sin inclinación)
handoff_out: celular en x 50%, scale 0.74, opacity 1, mostrando la cuadrícula.

narrativeRole: primer paso del invitado: entrar es escanear.
keyMessage: entrar al álbum es escanear un QR.

## Frame 4 — Suben fotos y videos

- scene: La hoja "Nueva publicación" con la foto del primer baile, el VIDEO del baile y el brindis; "Laura", "El primer baile 💃"; toque en Publicar → "¡Publicado!" y la publicación aparece de primera
- voiceover: "Suben sus fotos y videos en segundos… y aparecen al instante."
- duration: 4.319s
- transition_in: crossfade
- status: animated
- src: compositions/frames/04-suben.html
- type: feature_showcase
- persuasion: Inmediatez
- beat: satisfacción
- asset_candidates: assets/a03-composer.png, assets/a04-published-grid.png, assets/video-064.mp4
- blueprint: device-surface-showcase (Reproduce)
- focal: assets/a03-composer.png
- roles: a03-composer = cutout · a04-published-grid = cutout (estado final) · video-064 = supporting (miniatura que se mueve)
- sfx: none

handoff_in: celular en x 50%, scale 0.74, opacity 1, cuadrícula del álbum.
Scene 1 (0.0–1.6s): un toque en el botón "+" (círculo de toque) y la pantalla cambia a la hoja "Nueva publicación" (`a03-composer`); a la derecha del celular asoman tres fichas flotantes (foto del baile, VIDEO con ícono ▶, brindis) que viajan hacia la hoja. Asimétrico 60/40. → button press + scale-swap
Scene 2 (1.6–3.4s): en "fotos y videos" el titular arriba "Fotos y videos" aparece por palabras; la ficha del video muestra el clip `video-064` moviéndose en miniatura. Toque en "Publicar". → per-word staggered reveal + button press
Scene 3 (3.4–5.0s): en "y aparecen al instante" la pantalla pasa a `a04-published-grid` con el aviso "¡Publicado!"; acercamiento suave a la primera fila donde está la publicación nueva de Laura y se queda quieto. → scale-swap + zoom-to-target
handoff_out: celular en x 50%, scale 0.74→0.80 (acercado a la fila superior), opacity 1.

narrativeRole: la acción principal del invitado: subir (incluye video, pedido explícito).
keyMessage: fotos y videos, publicados al instante.

## Frame 5 — Todos lo recorren

- scene: Vista de una en una: el video del primer baile se reproduce; doble toque y estalla el corazón, "1 me gusta"
- voiceover: "Todos recorren el álbum… y dan me gusta con dos toques."
- duration: 3.901s
- transition_in: crossfade
- status: animated
- src: compositions/frames/05-recorren.html
- type: benefit_highlight
- persuasion: Comunidad (el álbum es de todos)
- beat: calidez
- asset_candidates: assets/a06-feed.png, assets/a07-feed-like.png, assets/a08-feed-video.png, assets/video-064.mp4
- blueprint: device-surface-showcase (Adapt)
- focal: assets/a07-feed-like.png
- roles: a06-feed = cutout · a07-feed-like = cutout (después del like) · a08-feed-video = supporting · video-064 = cutout (se reproduce dentro de la pantalla)
- sfx: none

Adapt: el flujo es ver → reproducir → like; el video corre dentro de la pantalla del celular sobre la captura.
handoff_in: celular en x 50%, scale 0.80, opacity 1.
Scene 1 (0.0–1.5s): la pantalla pasa a la vista de una en una (`a08-feed-video`) y el clip `video-064` se reproduce encima del área del video (el primer baile en movimiento). Titular arriba "Todos lo ven" en Cormorant. → scale-swap + per-word staggered reveal
Scene 2 (1.5–2.8s): en "y dan me gusta" la pantalla pasa a `a06-feed` (la foto del baile); dos toques rápidos sobre la foto (dos círculos de toque). → button press ×2
Scene 3 (2.8–4.0s): en "con dos toques" estalla un corazón grande blanco en el centro de la foto, se encoge y la pantalla queda en `a07-feed-like` (corazón rojo, "1 me gusta"); lectura quieta. → spring-pop entrance (sin rebote) + scale-swap
handoff_out: celular en x 50%, scale 0.80→0.74, opacity 1.

narrativeRole: el álbum es vivo y compartido, no un buzón.
keyMessage: los invitados ven y celebran las fotos de todos.

## Frame 6 — Tu panel: lo ves todo

- scene: Panel de los novios: las cifras (235 fotos, 19 videos, 64 invitados) se cuentan; acercamiento a "Por aprobar": toque en Aprobar; aparece "Descargar todo el álbum (ZIP)"
- voiceover: "Y tú, desde tu panel, lo ves todo: apruebas, ocultas… y descargas el álbum completo."
- duration: 6.13s
- transition_in: crossfade
- status: animated
- src: compositions/frames/06-panel-novios.html
- type: feature_showcase
- persuasion: Control (los novios mandan)
- beat: tranquilidad
- asset_candidates: assets/b01-admin-top.png, assets/b03-admin-pending.png, assets/b04-admin-approved.png, assets/b02-admin-mod.png
- blueprint: dataviz-countup (Adapt)
- focal: assets/b01-admin-top.png
- roles: b01-admin-top = cutout · b03-admin-pending = cutout · b04-admin-approved = supporting · b02-admin-mod = supporting (botón ZIP)
- sfx: none

Adapt: el dato lo carga el panel real; las cifras del panel se repiten grandes fuera del celular con count-up, luego se acerca a la moderación.
handoff_in: celular en x 50%, scale 0.74, opacity 1.
Scene 1 (0.0–1.8s): el celular se corre a la izquierda (60/40) mostrando el panel de los novios (`b01-admin-top`); a la derecha, en "lo ves todo", cuentan hacia arriba tres cifras en Cormorant con etiqueta Inter pequeña: 235 fotos · 19 videos · 64 invitados, separadas por líneas finas. → value-scaled counter + per-word staggered reveal
Scene 2 (1.8–3.8s): en "apruebas, ocultas" la pantalla pasa a `b03-admin-pending` con acercamiento a las tarjetas "Por aprobar"; toque en "Aprobar" y pasa a `b04-admin-approved`; a la derecha aparecen dos fichas "✓ Aprobar" "Ocultar" en el momento en que se nombran. → zoom-to-target + button press + scale-swap
Scene 3 (3.8–5.5s): en "y descargas el álbum completo" la pantalla muestra `b02-admin-mod` con el botón "Descargar todo el álbum (ZIP)" iluminado (glow suave rosa); el celular vuelve al centro y todo queda quieto — respiro antes del giro. → keyword glow + held read
handoff_out: celular en x 50%, scale 0.74, opacity 1, quieto.

narrativeRole: cierra el acto 1 desde el punto de vista de los novios: control y descarga.
keyMessage: los novios moderan y se llevan todo.

## Frame 7 — Un toque y cambia la noche

- scene: Acercamiento a la pastilla "Pide tu canción"; un toque y la pantalla crema sube y se vuelve noche: entrada de La Pista (disco violeta, "Boda Ana & Pedro", nombre ya escrito). Cambia la música.
- voiceover: "¿Y la música? Un toque…"
- duration: 1.904s
- transition_in: cut
- status: animated
- src: compositions/frames/07-cambio.html
- type: product_intro
- persuasion: Sorpresa (de los recuerdos a la fiesta)
- beat: giro
- asset_candidates: assets/c01-album-pill.png, assets/c02-pista-entrada.png
- blueprint: compose
- focal: assets/c01-album-pill.png
- roles: c01-album-pill = cutout (estado inicial) · c02-pista-entrada = cutout (estado final)
- sfx: none

Compose: la bisagra del video, el cambio real de app. Movimientos: zoom-to-target, button press, una "cortina" de noche que sube y card morph del fondo.
handoff_in: celular en x 50%, scale 0.74, opacity 1, quieto.
Scene 1 (0.0–1.0s): la pantalla es `c01-album-pill`; en "¿Y la música?" acercamiento rápido a la pastilla negra "Pide tu canción" arriba a la derecha (el celular crece y se desplaza para centrar la pastilla). → zoom-to-target
Scene 2 (1.0–1.8s): en "Un toque" la pastilla se comprime con un círculo de toque violeta. → button press
Scene 3 (1.8–3.0s): desde abajo sube la noche: dentro del celular la entrada de La Pista (`c02-pista-entrada`) sube cubriendo el álbum, y al mismo tiempo el fondo del video pasa de crema a #0d0d0d con un resplandor violeta suave arriba; el celular vuelve a su tamaño. La música cambia a la pista B en este instante. → card morph-anchor + motion-blur streak (sutil) + ambient glow bloom
handoff_out: celular en x 50%, scale 0.74, opacity 1, pantalla c02-pista-entrada, fondo noche.

narrativeRole: la bisagra del video; el cambio real de app (crema → noche) y el cambio de música.
keyMessage: desde el álbum, La Pista está a un toque.

## Frame 8 — Piden su canción

- scene: En La Pista se escribe "quedate beele", aparece "quédate" de Beéle con "+ Pedir"; toque y la canción entra a la lista "pedida por Laura"
- voiceover: "…y en La Pista, tus invitados piden la canción que quieren que suene."
- duration: 3.855s
- transition_in: crossfade
- status: animated
- src: compositions/frames/08-piden.html
- type: feature_showcase
- persuasion: Participación
- beat: emoción
- asset_candidates: assets/m01-pista-home.png, assets/m02-search.png, assets/m03-requested.png
- blueprint: device-surface-showcase (Reproduce)
- focal: assets/m02-search.png
- roles: m01-pista-home = cutout · m02-search = cutout · m03-requested = cutout (estado final)
- sfx: none

handoff_in: celular en x 50%, scale 0.74, fondo noche, pantalla c02-pista-entrada.
Scene 1 (0.0–1.4s): toque en "Entrar" y la pantalla pasa a `m01-pista-home` ("Hola, Laura", Sonando ahora); arriba aparece "LA PISTA" (`pista-label`) y el titular "Pide tu canción" en Unbounded. → button press + scale-swap + per-word staggered reveal
Scene 2 (1.4–3.2s): en "piden la canción" la pantalla pasa a `m02-search`; afuera, a la derecha, una ficha grande con la carátula de "quédate – Beéle" sale de la lista y flota en primer plano (asimétrico 60/40). → scale-swap + spring-pop entrance
Scene 3 (3.2–5.0s): en "que quieren que suene" toque en "+ Pedir" (círculo violeta); la ficha vuela de vuelta a la pantalla y la pantalla pasa a `m03-requested` con "quédate · pedida por Laura" resaltada por un brillo violeta breve; lectura quieta. → button press + scale-swap + keyword glow
handoff_out: celular en x 50%, scale 0.74, opacity 1, pantalla m03-requested.

narrativeRole: el invitado elige la música.
keyMessage: cualquier canción, pedida desde el celular.

## Frame 9 — Votan entre ellos

- scene: Corazón en "Ay, DiOs Mío!" (8 ♥); la lista se ordena por likes con los números 1, 2, 3
- voiceover: "Votan entre ellos… y las favoritas suben."
- duration: 2.786s
- transition_in: crossfade
- status: animated
- src: compositions/frames/09-votan.html
- type: benefit_highlight
- persuasion: Prueba social (la pista decide)
- beat: juego
- asset_candidates: assets/m04-liked.png, assets/m05-now-playing.png
- blueprint: grid-card-assemble (Adapt)
- focal: assets/m04-liked.png
- roles: m04-liked = cutout · m05-now-playing = supporting
- sfx: none

Adapt: la "grilla" es la lista de la fiesta; las filas se reordenan por likes en cascada.
handoff_in: celular en x 50%, scale 0.74, pantalla m03-requested.
Scene 1 (0.0–1.6s): en "Votan entre ellos" la pantalla pasa a `m04-liked`; acercamiento a la fila "Ay, DiOs Mío!" y toque en su corazón: el corazón se llena de rojo y el número sube 7→8; a la derecha flotan tres corazones pequeños. → zoom-to-target + button press + value-scaled counter
Scene 2 (1.6–3.5s): en "y las favoritas suben" el celular vuelve a tamaño base mostrando `m05-now-playing`; afuera, a la derecha, tres fichas numeradas 1·2·3 (Ay DiOs Mío · La Gota Fría · Cali Pachanguero, con sus corazones) se ensamblan en cascada como un podio; lectura quieta. → grid-card-assemble cascade
handoff_out: celular sale hacia la izquierda: x 50%→35%, scale 0.74→0.70, opacity 1→0.

narrativeRole: la música es de todos, no del que más grita.
keyMessage: los likes ordenan la fila.

## Frame 10 — El DJ, con su propio link

- scene: Panel del DJ (sin cuenta, su link): cifras de la fiesta; acercamiento a "quédate · pedida por Laura" → "En cola" → "Poner ahora"; las cifras se actualizan
- voiceover: "Tu DJ entra con su propio link y lo modera todo: acepta, rechaza… y la pone."
- duration: 4.969s
- transition_in: crossfade
- status: animated
- src: compositions/frames/10-dj.html
- type: feature_showcase
- persuasion: Orden (sin papelitos ni gritos al DJ)
- beat: control
- asset_candidates: assets/d01-dj-top.png, assets/d02-dj-list.png, assets/d03-dj-queued.png, assets/d04-dj-playing.png
- blueprint: camera-journey (Adapt)
- focal: assets/d03-dj-queued.png
- roles: d01-dj-top = cutout · d02-dj-list = supporting · d03-dj-queued = cutout · d04-dj-playing = cutout (estado final)
- sfx: none

Adapt: un segundo celular, el del DJ, entra; la cámara viaja por su panel en tres paradas (link → canción de Laura → sonando).
Scene 1 (0.0–1.5s): entra desde la derecha el celular del DJ con `d01-dj-top` ("LA PISTA · DJ", "Boda Ana & Pedro", Activa); arriba el titular "Tu DJ, con su propio link" y una pastilla con un ícono de enlace "invitapp.art/dj/…" que se escribe. → split-tilt card (un lado) + type-on with caret
Scene 2 (1.5–3.3s): en "lo modera todo: acepta, rechaza" la cámara baja por la lista (`d02-dj-list` → `d03-dj-queued`) y se acerca a la tarjeta "quédate · pedida por Laura"; toque en "En cola" y luego aparecen resaltados "Rechazar" y "Poner ahora" según se nombran. → viewport pan + zoom-to-target + button press
Scene 3 (3.3–5.0s): en "y la pone" toque en "Poner ahora" (círculo violeta) y la pantalla pasa a `d04-dj-playing`: "SONANDO AHORA · quédate"; la cámara se aleja a tamaño base y queda quieta. → button press + scale-swap + pull-back
handoff_out: celular del DJ sale hacia la derecha con fade; entra el celular de Laura por la izquierda (frame 11).

narrativeRole: el DJ tiene el control con una herramienta propia y privada.
keyMessage: el DJ modera con su link único.

## Frame 11 — ¡Está sonando!

- scene: En el celular de Laura, "Mis pedidos": "quédate · ¡En cola!" → "Sonando 🎶"; arriba "SONANDO AHORA · quédate" y el fondo se tiñe con la carátula
- voiceover: "Y cada invitado ve cuando su canción está en cola… y cuando suena."
- duration: 4.598s
- transition_in: crossfade
- status: animated
- src: compositions/frames/11-suena.html
- type: benefit_highlight
- persuasion: Recompensa (mi canción sonó)
- beat: alegría
- asset_candidates: assets/m06-mine-queued.png, assets/m08-mine-playing.png, assets/m07-guest-playing.png
- blueprint: device-surface-showcase (Adapt)
- focal: assets/m07-guest-playing.png
- roles: m06-mine-queued = cutout · m08-mine-playing = cutout · m07-guest-playing = cutout (cierre del acto)
- sfx: none

Adapt: la pantalla del invitado cambia de estado sola (sin toques): en cola → sonando.
Scene 1 (0.0–1.8s): el celular de Laura (centrado) muestra "Mis pedidos" con "quédate · ¡En cola!" (`m06-mine-queued`); en "está en cola" la etiqueta "¡En cola!" se ilumina y arriba aparece el titular "Tu canción, en vivo" en Unbounded. → keyword glow + per-word staggered reveal
Scene 2 (1.8–3.0s): en "y cuando suena" la etiqueta cambia a "Sonando 🎶" (`m08-mine-playing`). → scale-swap
Scene 3 (3.0–4.5s): la pantalla pasa a `m07-guest-playing`: "SONANDO AHORA · quédate – Beéle" y el fondo del video se tiñe del tono de la carátula detrás del celular; ecualizador vivo (barras) junto al título; lectura quieta. → scale-swap + ambient glow bloom + live SVG internals
handoff_out: celular de Laura en x 50%, scale 0.74, opacity 1, pantalla m07-guest-playing.

narrativeRole: cierra el loop del invitado: pidió, votaron, sonó.
keyMessage: el invitado ve el estado de su canción.

## Frame 12 — InvitApp

- scene: Los dos celulares (Álbum y La Pista) se juntan; "InvitApp" en Great Vibes, "Tus recuerdos y tu música, en manos de todos", "Escríbenos" y www.invitapp.art
- voiceover: "InvitApp. Tus recuerdos y tu música, en manos de todos. Escríbenos."
- duration: 4.458s
- transition_in: crossfade
- status: animated
- src: compositions/frames/12-cierre.html
- type: cta
- persuasion: Cierre de marca + llamada a la acción
- beat: cierre cálido
- asset_candidates: assets/a04-published-grid.png, assets/m07-guest-playing.png
- blueprint: logo-assemble-lockup (Adapt)
- focal: none
- roles: a04-published-grid = supporting (celular izquierdo) · m07-guest-playing = supporting (celular derecho)
- sfx: none

Adapt: la marca se arma entre los dos celulares; sin logo gráfico, la marca es la palabra InvitApp en Great Vibes.
handoff_in: celular de Laura en x 50%, scale 0.74, pantalla m07-guest-playing.
Scene 1 (0.0–1.8s): el celular de La Pista se corre a la derecha y se achica; desde la izquierda entra el celular del Álbum (`a04-published-grid`); el fondo se parte: mitad izquierda crema, mitad derecha noche, unidas por una línea fina vertical. → split-tilt cards + card morph-anchor del fondo
Scene 2 (1.8–3.6s): en "InvitApp" la palabra InvitApp en Great Vibes se dibuja al centro, encima de los dos celulares (tinta sobre crema que pasa a blanco sobre noche); debajo, por palabras, "Tus recuerdos y tu música, en manos de todos." en Cormorant. → SVG self-draw + per-word staggered reveal
Scene 3 (3.6–5.0s): en "Escríbenos" aparece una pastilla "Escríbenos" y debajo "www.invitapp.art" en Inter; todo queda quieto (cierre). → spring-pop entrance (sin rebote) + held read

narrativeRole: marca + CTA, sin precio ni WhatsApp.
keyMessage: escríbenos para tener las dos apps en tu evento.
