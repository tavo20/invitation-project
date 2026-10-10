---
format: 1080x1920
duration: 26s
message: "Todas las fotos de tu fiesta, en un solo álbum: tus invitados las suben con un QR"
arc: Demo Loop — pregunta → promesa → QR → subir → álbum en vivo → descarga → CTA
audience: "Parejas que se casan y familias que celebran XV años en Colombia"
mode: collaborative
music: soft romantic acoustic underscore, warm piano and guitar, light and celebratory
---

## Frame 1 — ¿Y las fotos?

- scene: Fotos de la fiesta caen y se dispersan como en cien celulares distintos; sobre ellas, la pregunta en serif grande
- voiceover: "Cien invitados tomando fotos… ¿y cuántas te llegan?"
- duration: 3.9s
- transition_in: cut
- status: animated
- src: index.html
- type: hook
- persuasion: Pain validation
- beat: curiosity + leve frustración
- blueprint: kinetic-type-beats
- asset_candidates: assets/stock/*.jpg — fotos de stock de bodas y fiestas

narrativeRole: nombra el dolor que toda pareja conoce: las fotos quedan regadas en los celulares de otros.
keyMessage: las fotos de los invitados se pierden.

## Frame 2 — Un solo álbum

- scene: Las fotos dispersas vuelan al centro y se ordenan en una sola cuadrícula; aparece "El álbum de tu evento" y la marca InvitApp
- voiceover: "Con el álbum de InvitApp, todas llegan a un solo lugar."
- duration: 3.8s
- transition_in: zoom-through
- status: animated
- src: index.html
- type: product_intro
- persuasion: Negative contrast (de regadas → juntas)
- beat: relief
- blueprint: kinetic-type-beats

narrativeRole: entrega la promesa del video en el segundo beat.
keyMessage: un solo álbum para todas las fotos.

## Frame 3 — Escanea el QR

- scene: Tarjeta de mesa con el QR del álbum; un celular entra, enfoca el QR y se abre la pantalla real del álbum
- voiceover: "Tus invitados escanean el QR de su mesa,"
- duration: 2.7s
- transition_in: crossfade
- status: animated
- src: index.html
- type: feature_showcase
- persuasion: Friction reduction
- beat: ease
- blueprint: device-surface-showcase
- asset_candidates: capture/album-grid.png — cuadrícula del álbum en el celular; QR real generado con el link del álbum

narrativeRole: muestra el primer paso: entrar es tan fácil como escanear.
keyMessage: no hay app ni registro, solo un QR.

## Frame 4 — Suben en segundos

- scene: En el celular: toque al botón +, se eligen 3 fotos, la barra de progreso llega a 100% y sale "¡Publicado! 🎉"
- voiceover: "y suben fotos y videos en segundos."
- duration: 2.8s
- transition_in: cut
- status: animated
- src: index.html
- type: feature_showcase
- persuasion: Show-don't-tell proof
- beat: ease + confianza
- blueprint: device-surface-showcase
- asset_candidates: capture/composer.png — hoja "Nueva publicación" con miniaturas; capture/progress.png — barra "Subiendo… 72%"

narrativeRole: prueba que subir es inmediato, con la pantalla real.
keyMessage: subir fotos y videos toma segundos.

## Frame 5 — El álbum crece en vivo

- scene: La cuadrícula se llena en cascada con fotos nuevas; corazones de "me gusta" saltan sobre algunas; contador "48 fotos · 12 videos"
- voiceover: "Todos ven el álbum crecer en vivo."
- duration: 2.4s
- transition_in: crossfade
- status: animated
- src: index.html
- type: benefit_highlight
- persuasion: Belonging (todos comparten el mismo recuerdo)
- beat: excitement + belonging
- blueprint: grid-card-assemble
- asset_candidates: assets/stock/*.jpg — fotos de stock; capture/feed.png — vista de feed con like

narrativeRole: convierte la función en emoción: la fiesta vista por todos.
keyMessage: el álbum es compartido y vivo.

## Frame 6 — Descárgalo todo

- scene: Panel del anfitrión en el celular: cifras del álbum y el botón "Descargar álbum"; un toque y aparece el ZIP completo
- voiceover: "Y tú descargas el álbum completo, con un toque."
- duration: 3.4s
- transition_in: push-slide LEFT
- status: animated
- src: index.html
- type: benefit_highlight
- persuasion: Value stacking (todo queda contigo)
- beat: peace of mind
- blueprint: device-surface-showcase
- asset_candidates: capture/admin.png — panel del anfitrión con estadísticas y descarga

narrativeRole: cierra el recorrido en manos de la pareja: los recuerdos son suyos.
keyMessage: todas las fotos quedan contigo.

## Frame 7 — InvitApp

- scene: Las fotos se apilan en un álbum y dan paso al logo InvitApp en Great Vibes; debajo "Escríbenos" y www.invitapp.art
- voiceover: "InvitApp. Todos tus recuerdos, en un solo álbum. Escríbenos."
- duration: 7.25s
- transition_in: blur-crossfade
- status: animated
- src: index.html
- type: cta
- persuasion: Future pacing
- beat: aspiration + urgency-to-act
- blueprint: logo-assemble-lockup

narrativeRole: firma la marca y pide la acción, sin precio.
keyMessage: escríbenos para tener tu álbum.
