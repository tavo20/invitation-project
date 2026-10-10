---
workflow: general-video
flow: companion
storyboard: yes
message: "Todas las fotos de tu fiesta, en un solo álbum: tus invitados las suben con un QR"
destination: instagram-reels
aspect: 1080x1920
language: es
audience: "Parejas que se casan y familias que celebran XV años en Colombia"
length: 20-25s
angle: qr-to-memory
voice: elevenlabs-male
---

## Intent

Lanzamiento de la nueva función de InvitApp: el álbum del evento. Recorrido "del QR al recuerdo":
el invitado escanea el QR de su mesa, sube su foto o video, la publicación aparece en el álbum
compartido de todos, y los novios descargan el álbum completo. Reel vertical con voz en off de
hombre (ElevenLabs, la misma del reel anterior). Elegante y romántico, no corporativo.

## Customizations

- Pantallas reales de la app (galería en `?mock=1`, `ng serve`) dentro de un mockup de celular:
  QR en la mesa, compositor de subida, cuadrícula del álbum, panel del anfitrión con descarga.
- Fotos del álbum: fotos de stock libres de bodas/fiestas (opción B elegida por el usuario),
  cargadas en el álbum de prueba en lugar de las fotos genéricas del mock.
- Música suave de fondo, recortada bajo la voz.

## Notes

- NO mencionar precios (el álbum se cobra aparte, pero el video no dice cuánto).
- Sin material adicional del usuario (ni logo nuevo ni clips).
- Inferido: estilo visual de `videos/invitapp-promo` y `videos/invitapp-reel-voz` (Great Vibes + Cormorant, crema/taupe).
- Cierre: marca InvitApp + "Escríbenos" + invitapp.art. Sin precio y SIN número de WhatsApp (pedido del usuario en videos anteriores: "No poner precio ni mi número").
