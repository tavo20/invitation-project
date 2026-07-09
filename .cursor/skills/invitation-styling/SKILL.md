---
name: invitation-styling
description: >-
  Design system for wedding invitation templates with multiple themes.
  Defines color palettes, fonts, spacing, layout patterns, and section structure.
  Use when styling invitation components, creating new sections, choosing a theme,
  or adjusting visual design of plantillas.
---

# Invitation Styling Guide

## Theme System

Each invitation can use a different theme. When creating a new plantilla, ask the user which theme to use or let them describe a custom one.

### Available Themes

#### 1. Elegante Dorado (default)

| Token | Value | Usage |
|-------|-------|-------|
| `--accent` | `#A38C7B` | Cursive titles, dividers, name rows, highlights |
| `--text-dark` | `#222` | Hero names, hero title |
| `--text-body` | `#333` | Date labels, parent names |
| `--text-secondary` | `#444` | Messages, descriptions |
| `--text-subtle` | `#555` | Uppercase subtitles |
| `--text-muted` | `#888` | Notes, disclaimers |
| `--btn-bg` | `rgb(155 126 38 / 30%)` | Soft button backgrounds |
| `--btn-solid` | `#8c725d` | Solid button backgrounds |
| `--bg` | `rgb(230 229 229)` | Page background |
| `--font-cursive` | `'Dancing Script', cursive` | Names, section titles |
| `--font-body` | `"Edu NSW ACT Hand Pre", cursive` | Body text |

#### 2. Romantico Rosa

| Token | Value | Usage |
|-------|-------|-------|
| `--accent` | `#C48B9F` | Cursive titles, dividers, highlights |
| `--text-dark` | `#2D1B2E` | Hero names, hero title |
| `--text-body` | `#4A3B4C` | Body text |
| `--text-secondary` | `#6B5A6D` | Messages |
| `--text-subtle` | `#8A7A8C` | Subtitles |
| `--text-muted` | `#A89AAB` | Notes |
| `--btn-bg` | `rgb(196 139 159 / 25%)` | Soft buttons |
| `--btn-solid` | `#9E6B7F` | Solid buttons |
| `--bg` | `#F9F3F5` | Page background |
| `--font-cursive` | `'Great Vibes', cursive` | Names, titles |
| `--font-body` | `'Cormorant Garamond', serif` | Body text |

#### 3. Rustico Natural

| Token | Value | Usage |
|-------|-------|-------|
| `--accent` | `#7A8B5C` | Cursive titles, dividers, highlights |
| `--text-dark` | `#2C3318` | Hero names, hero title |
| `--text-body` | `#4A5232` | Body text |
| `--text-secondary` | `#5E6745` | Messages |
| `--text-subtle` | `#7A8266` | Subtitles |
| `--text-muted` | `#9BA188` | Notes |
| `--btn-bg` | `rgb(122 139 92 / 25%)` | Soft buttons |
| `--btn-solid` | `#5E7040` | Solid buttons |
| `--bg` | `#F5F2EC` | Page background |
| `--font-cursive` | `'Amatic SC', cursive` | Names, titles |
| `--font-body` | `'Josefin Sans', sans-serif` | Body text |

#### 4. Moderno Minimalista

| Token | Value | Usage |
|-------|-------|-------|
| `--accent` | `#1A1A1A` | Titles, dividers, highlights |
| `--text-dark` | `#000000` | Hero names |
| `--text-body` | `#333333` | Body text |
| `--text-secondary` | `#555555` | Messages |
| `--text-subtle` | `#777777` | Subtitles |
| `--text-muted` | `#999999` | Notes |
| `--btn-bg` | `rgb(0 0 0 / 8%)` | Soft buttons |
| `--btn-solid` | `#1A1A1A` | Solid buttons |
| `--bg` | `#FFFFFF` | Page background |
| `--font-cursive` | `'Playfair Display', serif` | Names, titles |
| `--font-body` | `'Montserrat', sans-serif` | Body text |

### Creating a Custom Theme

If the user describes a specific style, create a new theme following the token structure above. Map their preferences to:
1. An accent color (main visual thread)
2. A cursive/display font for names and titles
3. A body font for text content
4. A background color/tone
5. A text color scale (dark → muted, 5 steps)

## Layout Patterns

These patterns are consistent across ALL themes.

### Section Container

```scss
.[section]-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 60px 30px;
    width: 100%;
    box-sizing: border-box;
}
```

### Section Title + Divider

```html
<h2 class="[section]-titulo">Title</h2>
<div class="[section]-divider"></div>
```

```scss
.[section]-titulo {
    font-family: var(--font-cursive);
    font-size: 2.4em;
    color: var(--accent);
    font-weight: 700;
    margin: 0;
}

.[section]-divider {
    width: 60px;
    height: 1px;
    background-color: var(--accent);
    margin: 20px 0;
}
```

### Two-Column Grid (collapses on mobile)

```scss
.[section]-grid {
    display: flex;
    gap: 50px;
    margin: 10px 0;
}

@media (max-width: 480px) {
    .[section]-grid {
        flex-direction: column;
        gap: 30px;
    }
}
```

### Full-Screen Hero Image

```scss
.main-image {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}
```

### Text Content Block

```scss
.[section]-mensaje {
    font-size: 1em;
    color: var(--text-secondary);
    line-height: 1.7;
    max-width: 380px;
    font-style: italic;
}
```

## Naming Convention

- Section wrapper: `.[section]-section`
- Title: `.[section]-titulo`
- Divider: `.[section]-divider`
- Subtitle labels: `.[section]-subtitulo`
- Body text: `.[section]-mensaje`, `.[section]-desc`, `.[section]-texto`

## Responsive Breakpoints

| Breakpoint | Adjustments |
|------------|-------------|
| `max-width: 550px` | Reduce large cursive fonts, tighten padding |
| `max-width: 480px` | Collapse grids to column layout |
| `max-width: 424px` | Further reduce fonts and padding |

## Key Rules

- Text containers: `max-width: 360px–380px` for readable line length
- All sections centered via flex column + `align-items: center`
- Main container `.container-main` is a vertical flex column
- The accent color is the unifying visual thread within a theme
- Assets per plantilla go in `src/assets/[plantilla-name]/`
- Import Google Fonts needed for the chosen theme in `index.html` or `styles.scss`
