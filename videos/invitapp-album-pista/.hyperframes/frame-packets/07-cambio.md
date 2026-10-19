# Frame packet: 07-cambio

## Project inputs

- Project: /Users/gustavojimenez/Documents/Projects/invitation-project/videos/invitapp-album-pista
- Design tokens: /Users/gustavojimenez/Documents/Projects/invitation-project/videos/invitapp-album-pista/frame.md
- RULES_DIR: /Users/gustavojimenez/.claude/plugins/cache/hyperframes/hyperframes/0.8.111/skills/hyperframes-animation/rules

## Assigned storyboard block

## Frame 7 — Un toque y cambia la noche

- scene: Acercamiento a la pastilla "Pide tu canción"; un toque y la pantalla crema sube y se vuelve noche: entrada de La Pista (disco violeta, "Boda Ana & Pedro", nombre ya escrito). Cambia la música.
- voiceover: "¿Y la música? Un toque…"
- duration: 1.904s
- transition_in: cut
- status: outline
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
