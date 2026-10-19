---
workflow: product-launch-video
flow: automation
storyboard: yes
message: "Tus invitados llenan el álbum y eligen la música; ustedes y su DJ tienen el control"
destination: instagram-reels
aspect: 1080x1920
language: es
audience: "Novios (cliente final): parejas que se casan en Colombia"
length: 45s
angle: two-apps-one-party
voice: elevenlabs-brian
---

## Intent

Reel para los novios que presenta las dos apps del evento de InvitApp en un solo video:
el **Álbum** (fotos y videos de los invitados) y **La Pista** (la música que eligen los invitados).
Dos actos que se reflejan: primero el álbum (luz, crema, elegante), luego el toque en
"Pide tu canción" y la pantalla pasa a la noche de La Pista (negro + violeta neón). Cierre con
las dos apps juntas.

Recorrido pedido por el usuario, en este orden:

1. **Álbum — invitado:** abre el álbum (QR de la mesa), ve la cuadrícula, sube sus fotos **y videos**
   (elige, vista previa, nombre, publicar), su publicación aparece; recorre el álbum en la vista de
   una en una y da like con doble toque. Los videos se ven reproduciéndose.
2. **Álbum — panel de los novios:** ven todo lo que suben sus invitados (cifras: fotos, videos,
   invitados) y moderan: ocultan una foto, aprueban una pendiente.
3. **La Pista — invitado:** pide la canción que quiere que el DJ ponga, los invitados se dan like
   entre ellos (ranking), y ven si el DJ la aceptó, la va a poner (en cola) o ya la puso (sonando).
4. **La Pista — DJ:** abre su link único (sin cuenta) y modera todo: acepta, rechaza, pone "sonando".

Voz en off: Brian (ElevenLabs, `nPczCjzI2devNBz1zQrb`, modelo `eleven_multilingual_v2`), en español.

## Customizations

- Pantallas reales de la app nueva (Álbum crema + La Pista violeta neón) dentro de un mockup de
  celular, con datos de demostración inyectados en la captura (no se toca la base de datos).
- El cambio de app es la animación real de la app (la pantalla sube; crema → noche) y es el
  momento bisagra del video.
- Fotos del álbum: fotos de stock libres de bodas (elegido por el usuario); se pueden reutilizar las
  de `videos/invitapp-album/assets/stock/` (CREDITS.md incluido). Incluir al menos un video corto.
- Panel del DJ: mostrarlo con acercamientos a la lista y a los botones de estado (es denso para vertical).
- Subtítulos palabra por palabra.
- Música (elegida por el usuario): pista A romántica acústica (`videos/invitapp-album/assets/musica.mp3`)
  en el acto del álbum, y crossfade a la pista B pop latino (`videos/invitapp-musica/assets/musica.mp3`)
  en el toque de "Pide tu canción", hasta el cierre. Bajo la voz. Sin HeyGen.

## Notes

- NO mencionar precios y NO poner número de WhatsApp (pedido del usuario en videos anteriores).
- Cierre: marca InvitApp + "Escríbenos" + www.invitapp.art.
- Inferido: el acto del álbum hereda el estilo de `videos/invitapp-album` (Great Vibes + Cormorant,
  crema/taupe); el acto de La Pista usa su identidad propia (Unbounded, #0d0d0d, #c77dff → #ff4fd8).
- Si al ver los bocetos todo va muy rápido, se puede alargar a 50–55 s.
