# Inventario de material — InvitApp · Álbum + La Pista

Capturas reales de la app (390×844 @3x = 1170×2532 px, celular), con datos de demostración
inyectados en la captura (`capture/shoot.mjs`). Evento de ejemplo: boda de **Ana & Pedro**;
invitada que sube y pide: **Laura**. Fotos: stock CC0 de bodas (`capture/media/CREDITS.md`).

## Álbum — invitado (crema, Cormorant)

- `assets/a01-album-grid.png` — Álbum de Ana & Pedro, arriba: marca "ÁLBUM", título, "Comparte tus fotos y videos", Todas/Mis fotos, cuadrícula de fotos de boda (novia, damas, mesas, pastel, brindis); una miniatura de video con "▶ 0:05"; botón flotante "+" y pastilla negra "Pide tu canción" arriba a la derecha.
- `assets/a02-album-grid-scroll.png` — La misma cuadrícula desplazada: más fotos de la fiesta (útil para un scroll).
- `assets/a03-composer.png` — "Nueva publicación" (hoja inferior): 3 miniaturas elegidas (foto del baile, VIDEO del baile, brindis), nombre "Laura", texto "El primer baile 💃", botón Publicar.
- `assets/a04-published-grid.png` — Cuadrícula con la publicación nueva de Laura de primera y aviso "¡Publicado!".
- `assets/a05-mis-fotos.png` — Pestaña "Mis fotos": solo lo que subió Laura.
- `assets/a06-feed.png` — Vista de una en una: publicación de Laura (carrusel 1/3, foto del primer baile), corazón vacío.
- `assets/a07-feed-like.png` — Igual, justo después del doble toque: corazón rojo, "1 me gusta".
- `assets/a08-feed-video.png` — La segunda del carrusel (2/3) es el VIDEO del baile con controles (fotograma quieto; reproducir encima `assets/video-064.mp4`).
- `assets/video-064.mp4` — Clip vertical 5 s (720×1280) del primer baile, acercamiento lento: es el video que sube Laura.
- `assets/video-130.mp4` — Clip vertical 5 s de bengalas en la noche (el video que ya estaba en el álbum).
- `assets/qr-mesa.png` — Código QR para la mesa (del video anterior del álbum).

## Álbum — panel de los novios (crema)

- `assets/b01-admin-top.png` — "PANEL DEL ANFITRIÓN · Ana & Pedro": cifras 235 fotos · 19 videos · 64 invitados · 3.4 GB; Ajustes (Recibir fotos ON, Aprobar antes de publicar OFF); link y QR para invitados.
- `assets/b02-admin-mod.png` — Moderación: botón "Descargar todo el álbum (ZIP)", filtros Todas/Por aprobar/Ocultas, tarjetas con foto y botones Ocultar/Borrar.
- `assets/b03-admin-pending.png` — Filtro "Por aprobar (2)": brindis de Mateo y foto de Isabella con botones verdes "Aprobar".
- `assets/b04-admin-approved.png` — Después de aprobar una: queda 1 por aprobar.

## Cambio de app

- `assets/c01-album-pill.png` — Álbum con la pastilla negra "Pide tu canción" (nota violeta) arriba a la derecha: el botón que lleva a La Pista.
- `assets/c02-pista-entrada.png` — Entrada de La Pista (negro, violeta neón): ícono de disco en degradado, "LA PISTA", "Boda Ana & Pedro", "Sugiere canciones para la fiesta", nombre y correo ya escritos (vienen del álbum), botón "Entrar" violeta; pastilla crema "Ver el álbum".

## La Pista — invitado (negro #0d0d0d, violeta #c77dff → magenta #ff4fd8, Unbounded)

- `assets/m01-pista-home.png` — Inicio: "Hola, Laura", secciones General / Salsa 10:00 PM, tarjeta "SONANDO AHORA · Vivir Mi Vida – Marc Anthony", buscador, lista de pendientes con corazones y conteos.
- `assets/m02-search.png` — Busca "quedate beele": resultados "quédate – Beéle" (BORONDO) con botón "+ Pedir".
- `assets/m03-requested.png` — Después de pedir: "quédate · pedida por Laura" aparece en la lista.
- `assets/m04-liked.png` — Laura le da like a "Ay, DiOs Mío!" (corazón rojo, 8): los invitados votan entre ellos.
- `assets/m05-now-playing.png` — Arriba de nuevo con la lista ordenada por likes (1 Ay DiOs Mío 8 ♥, 2 La Gota Fría, 3 Cali Pachanguero, 4 quédate).
- `assets/m06-mine-queued.png` — "Mis pedidos": quédate con la etiqueta violeta "¡En cola!" (el DJ la aceptó).
- `assets/m07-guest-playing.png` — "SONANDO AHORA · quédate – Beéle", fondo teñido por la carátula: la canción de Laura ya suena.
- `assets/m08-mine-playing.png` — "Mis pedidos": quédate con etiqueta "Sonando 🎶".

## La Pista — panel del DJ (link único, sin cuenta; violeta de La Pista, marca "LA PISTA · DJ")

- `assets/d01-dj-top.png` — Panel del DJ "Boda Ana & Pedro": Compartir / Pausar / Finalizar, cifras (Total, Pendientes, En cola, Sonaron), Secciones General/Salsa, "Sonando ahora", filtros. Sin botón "Volver" (entró por su link).
- `assets/d02-dj-list.png` — Lista de pedidos con likes y quién la pidió; botones verdes "Poner ahora", "En cola", "Rechazar".
- `assets/d03-dj-queued.png` — Lista abajo: "quédate · pedida por Laura" ya en cola (quedan Poner ahora / Rechazar); otras con "Ya sonó" y "Descartada".
- `assets/d04-dj-playing.png` — Arriba del panel tras poner quédate: cifras actualizadas (9 total, 3 pendientes, 2 en cola, 2 sonaron).

## Audio

- `assets/musica-album.mp3` — Pista A, romántica acústica (2:16): acto del álbum.
- `assets/musica-pista.mp3` — Pista B, pop latino alegre (0:30): desde "Pide tu canción" al cierre.

## Fuentes

- `assets/fonts/great-vibes.woff2`, `cormorant.woff2`, `cormorant-italic.woff2` — tipografías de la marca InvitApp en los videos anteriores.
