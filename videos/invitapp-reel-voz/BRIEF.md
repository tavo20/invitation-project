---
workflow: product-launch-video
flow: automation
storyboard: no
message: "Tus invitados confirman en un toque y tú organizas las mesas sin caos"
destination: instagram-reels
aspect: 1080x1920
language: es
audience: "Parejas que organizan su boda (y familias de XV años)"
length: 25s
angle: rsvp-to-seating
voice: elevenlabs-male
---

## Intent

Reel con voz en off (hombre, ElevenLabs) que explica el recorrido "del sí a la mesa": el invitado
confirma desde la invitación, la pareja ve el panel de confirmaciones en tiempo real y luego
asigna mesas. Cierre con marca InvitApp, precio y WhatsApp.

Guion aprobado (verbatim):
"Organizar tu boda no debería ser un caos.
Con InvitApp, tus invitados confirman desde la invitación, en un toque.
Y tú ves en tiempo real quién confirmó, quién está pendiente y cuántas personas van.
Después armas tus mesas: eliges al invitado, tocas la mesa, y listo. Sin pasarte del cupo.
InvitApp. Invitaciones que enamoran, y una fiesta bajo control. Escríbenos."

## Assets

- Capturas de la invitación de prueba `nicol-andres-test` (Carlos & Andrea): invitación, modal RSVP,
  panel de confirmaciones, distribución de mesas (localhost:4200 + API localhost:8085).

## Customizations

- Nombres y comentarios de invitados pulidos solo en pantalla al capturar (la base de datos no se toca),
  salvo la asignación de mesa, que el usuario autorizó hacer real.
- Una mesa abierta mostrando sus invitados; secuencia seleccionar invitado → sentarlo.

## Notes

- Cierre: "Desde $239" (moneda por confirmar) y WhatsApp 321 858 1771.
- Estilo visual del promo anterior (videos/invitapp-promo): Great Vibes + Cormorant, crema/taupe.
