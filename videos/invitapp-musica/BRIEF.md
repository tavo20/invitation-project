---
workflow: product-launch-video
flow: automation
storyboard: yes
message: "En tu fiesta, la música la eligen tus invitados: piden sus canciones desde el celular y el DJ las pone"
destination: instagram-reels
aspect: 1080x1920
language: es
audience: "Parejas que se casan y familias que celebran XV años en Colombia"
length: 25s
angle: guests-pick-the-music
voice: elevenlabs-male
---

## Intent

Promo de la función de música de InvitApp (cola de canciones de la fiesta). Recorrido: el invitado
entra al link de la fiesta, busca su canción y la pide; los demás le dan me gusta y sube en el
ranking; el DJ la pone y aparece en "Sonando ahora". Mismo formato que el video del álbum
(`videos/invitapp-album`): vertical, voz de hombre ElevenLabs, subtítulos, estilo crema/taupe.

## Customizations

- Pantallas reales de la app (`/fiesta/:code` del invitado y `/dj/:code` del DJ) dentro de un
  mockup de celular, con datos de demostración inyectados en la captura (no se toca la base de datos).

## Notes

- Sin precios y sin número de WhatsApp (pedido del usuario). Cierre: InvitApp + "Escríbenos" + www.invitapp.art.
- Inferido: música de fondo suave bajo la voz, como en el video del álbum.
