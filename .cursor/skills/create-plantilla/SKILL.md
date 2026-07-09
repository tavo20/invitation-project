---
name: create-plantilla
description: >-
  Create a new wedding invitation template (plantilla) in this Angular project.
  Supports multiple visual themes. Use when the user asks to create a new
  invitation, add a new plantilla, or customize a template for a different couple.
---

# Create Plantilla (Wedding Invitation Template)

## Prerequisites

Read `.cursor/skills/invitation-styling/SKILL.md` first to pick a theme and apply the correct design tokens.

## Workflow

### 1. Gather Information

Ask the user for:

| Info | Example | Required |
|------|---------|----------|
| Couple names | Gerson & Nataly | Yes |
| Wedding date + time | November 14, 2026, 4:00 PM | Yes |
| Theme preference | Elegante Dorado, Romantico, Rustico, Moderno, or custom | Yes |
| Venue name + city | Atrio Hotel, Timaná Huila | Yes |
| Parents (novio) | Juan Ortiz, Isabel Canamejoy | Optional |
| Parents (novia) | Jesús Castro, María Pantoja | Optional |
| Padrinos | Darío Montenegro, Keila Ortiz | Optional |
| Dress code | Elegante, Casual, etc. | Optional |
| Hero message | Custom romantic/religious text | Optional (provide default) |
| Quote | Biblical verse or poem | Optional (provide default) |
| Closing message | Custom farewell text | Optional (provide default) |
| RSVP link | Google Forms URL | Optional |
| Main photo | Path to couple's photo | Yes |
| Song | Path to mp3 file | Optional |
| Google Maps link | Venue location URL | Optional |

### 2. Create Component Files

Create directory `src/app/plantillas/[name]/` with:

**Component TS** (`[name].component.ts`):

```typescript
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CountDownComponent } from '../../shared/components/count-down/count-down.component';
import { EventComponent } from '../../shared/components/event/event.component';

@Component({
  selector: 'app-[name]',
  standalone: true,
  imports: [CountDownComponent, EventComponent, CommonModule],
  templateUrl: './[name].component.html',
  styleUrl: './[name].component.scss'
})
export class [PascalName]Component {
  showInvitado = false;
  invitado: any = {};

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const invitacionId = +this.route.snapshot.queryParamMap.get('invitationId')! || 0;
    if (!invitacionId) return;
  }

  weddingDate: string = "[Month Day, Year HH:MM:SS]";

  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
  isPlaying: boolean = false;

  togglePlayPause(): void {
    if (this.isPlaying) {
      this.audioPlayerRef.nativeElement.pause();
    } else {
      this.audioPlayerRef.nativeElement.play();
    }
    this.isPlaying = !this.isPlaying;
  }
}
```

### 3. Build HTML from Sections

Sections are **modular**. Only include what the couple needs. The recommended order:

| # | Section | Class | Required |
|---|---------|-------|----------|
| 1 | Hero photo | `.main-image` | Yes |
| 2 | Music toggle | `.container-music` (inside main-image) | Optional |
| 3 | Names + title + message | `.hero-section` | Yes |
| 4 | Date display | `.date-display-container` | Yes |
| 5 | Audio element | `<audio>` | Optional |
| 6 | Decorative names | `.names-container` | Optional |
| 7 | Guest greeting | `.container-invitado` | Optional |
| 8 | Quote | `.container-qu` | Optional |
| 9 | Parents & godparents | `.padres-section` | Optional |
| 10 | Countdown | `.container-time` | Optional |
| 11 | Event details | `<app-event>` or inline | Yes |
| 12 | Dress code | `.dress-code-section` | Optional |
| 13 | RSVP | `.confirma` | Optional |
| 14 | Gift/sobres | `.sobres-section` | Optional |
| 15 | Closing message | `.cierre-section` | Optional |

### 4. Apply Theme Styles

Use the chosen theme's tokens from the styling skill. Apply colors and fonts throughout the SCSS. If the theme uses Google Fonts not yet imported, add them to `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=[Font+Name]&display=swap" rel="stylesheet">
```

### 5. Register Route

Add to `src/app/app.routes.ts`:

```typescript
{
  path: '[route-name]',
  loadComponent: () =>
    import('./plantillas/[folder]/[name].component')
      .then(m => m.[PascalName]Component)
}
```

### 6. Add Assets

- Couple photo → `src/assets/[plantilla-name]/main.jpeg`
- Custom song → `src/assets/songs/[song-name].mp3`

### 7. Event Component

The shared `EventComponent` has hardcoded venue data. For a different venue, either:
- **Option A**: Make `EventComponent` accept `@Input()` properties (venue name, address, map link, time)
- **Option B**: Skip `<app-event>` and write the event section inline in the plantilla HTML

## Default Texts

If the user doesn't provide custom text, use these as starting points and adapt:

**Hero message (religious):**
> Dios permitió que nos encontráramos y próximamente nos dará su bendición para ser instrumentos de su amor y de su gracia como esposos.

**Hero message (romantic):**
> El amor nos encontró y hoy nuestros corazones laten con una misma ilusión. Queremos compartir contigo el día más importante de nuestras vidas.

**Quote:**
> "El amor es paciente, es bondadoso. El amor no es envidioso ni orgulloso." — 1 Corintios 13:4-5

**Closing:**
> ¡A ponerse guapos, que nos vamos a casar! Te esperamos para celebrar juntos el comienzo de nuestra historia de amor.

**Sobres:**
> El mejor regalo será compartir este momento contigo. Si deseas tener un detalle con nosotros, agradecemos tu aporte en nuestra lluvia de sobres.
