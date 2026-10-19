# Frame packet: 02-dos-apps

## Project inputs

- Project: /Users/gustavojimenez/Documents/Projects/invitation-project/videos/invitapp-album-pista
- Design tokens: /Users/gustavojimenez/Documents/Projects/invitation-project/videos/invitapp-album-pista/frame.md
- RULES_DIR: /Users/gustavojimenez/.claude/plugins/cache/hyperframes/hyperframes/0.8.111/skills/hyperframes-animation/rules

## Assigned storyboard block

## Frame 2 — Dos apps, un evento

- scene: Dos celulares se abren como un libro: a la izquierda el Álbum (crema, "ÁLBUM"), a la derecha La Pista (negro, "LA PISTA"); se nombran con su ícono
- voiceover: "Con InvitApp, tu evento trae dos apps: el Álbum… y La Pista."
- duration: 4.783s
- transition_in: crossfade
- status: outline
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

## Selected blueprint: comparison-split

# comparison-split — Comparison Split-Cards

**intent**: Two paired items of equal weight shown side-by-side with mirrored 3D "book-open" tilts — the eye reads them as a balanced comparison, then a pill badge lands at each card's inner edge to punctuate. The motion IS the symmetry: two cards arriving from opposite wings into a held spread.

**roles served**

- Key_Feature (from `comparison-split-cards`): when two complementary features / capabilities of equal weight should be presented **simultaneously, not sequentially** — an A/B, a "X + Y together," paired concepts the viewer must weigh side-by-side. Not for >2 items (use `grid-card-assemble`) or sequential steps.

**duration**: 4–6s

**shot structure** (a `[bg]` canvas carrying two faint ambient glow blooms — `[accent A]` near 30%, `[accent B]` near 70% — so each side owns a color identity across a 50% symmetry axis; equal-width cards under one shared perspective parent)

- **Scene 1 (0.0–~0.8s) — title sets the concept.** A centered `[title line]` with an `[accent keyword]` slides DOWN into place from just above (a short smooth settle). The downward arrival is deliberate: it forms a non-conflicting T-shape against the cards, which arrive from the sides next.
- **Scene 2 (~0.4–1.9s) — the split-tilt entry (signature move).** Two equal-width feature cards arrive from opposite wings — `[left card]` from the left, `[right card]` from the right ~0.2s behind — each carrying a **mirrored 3D `rotateY` tilt** (left faces right, right faces left, opening like a book) and scaling ~0.85→1 as it lands. The entry overlaps the title's tail so the whole thing reads as ONE arrival, not two beats. Each card holds `[image / label / subtitle]`; box-shadows fall **outward** from the tilt (left shadow right, right shadow left).
- **Scene 3 (~1.9–end) — badges punctuate, then hold.** A pill `[badge]` lands at each card's **inner edge** (left then right, ~0.3s apart), overlapping its card ~15% so it reads as attached, not orbiting. This is the lone overshoot in the shot — it earns the punctuation. Settles and holds.

**motion vocabulary**: title slide-down from above; mirrored opposite-wing card entry; static book-open `rotateY` tilt (`+tilt` left, `−tilt` right); tilt-matched outward box-shadow; inner-edge badge spring-pop; gentle phase-opposed idle float (left vs right, never synchronized) registered as subtle jitter; dual side-glow ambient.

**rule mapping**

- two cards entering from opposite wings with mirrored `rotateY` tilts + tilt-matched shadow → `split-tilt-cards` (the signature; keep the two-layer split so the entry `x`/`scale` and the idle never collide on one alias)
- title slide-down settle → `gsap-effects` (translate + opacity on a long-tail `power3`)
- inner-edge pill badge pop (the one overshoot) → `spring-pop-entrance` (overshoot register — earns the punctuation)
- phase-opposed idle float on the pair → `sine-wave-loop` (low-amplitude register — subtle jitter, NOT lazy breathing; left `sin(t)`, right `sin(t+π)` so they never conveyor-belt)
- the two faint side glows behind the cards → `ambient-glow-bloom` (un-triggered soft bloom, one per accent)

**camera modifier**: camera-static by default — the symmetry is the subject and a move would break the balance.
