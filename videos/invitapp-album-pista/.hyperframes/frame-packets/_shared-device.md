# Celular compartido (idéntico en todos los frames)

Todos los frames usan EL MISMO celular. Estado base (lo que el storyboard llama "x 50%, scale 0.74"):

- Pantalla (área visible de la captura): 545 × 1180 px, esquinas internas radio 52px. La captura (1170×2532) llena la pantalla con `object-fit: cover; object-position: top center`.
- Marco: 14px de grosor alrededor de la pantalla, color #111 con un filo interior 1px rgba(255,255,255,0.08); exterior 573 × 1208 px, radio exterior 66px.
- Sin muesca, sin botones laterales dibujados. Sombra: `0 40px 80px -30px rgba(43,36,32,0.45)` sobre crema; sobre noche `0 40px 90px -30px rgba(0,0,0,0.8), 0 0 60px -20px rgba(199,125,255,0.25)`.
- Centro del celular en estado base: x = 540 px, y = 820 px del lienzo 1080×1920 (borde superior ≈ 216 px, inferior ≈ 1424 px). Así queda libre la banda de subtítulos (y > 1594 px) y el espacio para un titular arriba (y 70–200 px).
- "scale N" en el storyboard es relativo a ESTE estado base (scale 0.74 = el estado base; 0.80 = 1.081× el base; 0.62 = 0.838× el base; 0.70 = 0.946× el base). Escala uniforme con `transform: scale()` desde el centro del celular.
- "x 30%" / "x 35%" = centro del celular en x = 0.30·1080 / 0.35·1080 px.
- El toque del dedo: círculo de 64px, relleno blanco 35% (sobre crema usar rgba(43,36,32,0.18); en La Pista violeta #c77dff al 45%), que se encoge 1→0.85 y suelta un anillo que se expande y desvanece. Nunca un cursor de mouse.
- Las capturas viven en `assets/*.png` (1170×2532, ya incluyen la interfaz completa de la app: no redibujar la app).
- Fondo: frames 1–6 crema #faf7f4 (con anillos finos `geo-ring` muy tenues opcionales); frame 7 pasa de crema a #0d0d0d; frames 8–11 #0d0d0d con un resplandor radial violeta #c77dff ~18% arriba-izquierda y magenta #ff4fd8 ~10% arriba-derecha; frame 12 mitad crema / mitad noche.
