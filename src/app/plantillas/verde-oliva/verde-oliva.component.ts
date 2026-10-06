import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

type Point = [number, number];

// Segmentos del cuarto superior izquierdo del marco, medidos sobre la referencia (636px de ancho).
// Se recorren desde el centro del borde superior hacia el lado izquierdo.
type Segment =
  | { line: Point }
  | { curve: [Point, Point, Point] };

const REF_WIDTH = 636;

// Espacio que ocupa el encaje inferior; el marco termina por encima
export const LACE_SPACE = 44;

// Línea exterior (banda gruesa): borde superior → escalón en S → escalón en S → muesca cóncava → lado
const OUTER: Segment[] = [
  { line: [228, 84] },
  { curve: [[206, 84], [212, 128], [188, 128]] },
  { line: [130, 128] },
  { curve: [[108, 128], [114, 205], [92, 205]] },
  { line: [68, 205] },
  { curve: [[68, 219], [56, 231], [42, 231]] },
];

// Línea interior (fina), paralela a 28px
const INNER: Segment[] = [
  { line: [242, 112] },
  { curve: [[220, 112], [226, 152], [202, 152]] },
  { line: [150, 152] },
  { curve: [[128, 152], [134, 232], [114, 232]] },
  { line: [96, 232] },
  { curve: [[96, 246], [84, 258], [70, 258]] },
];

// Línea del programa: lienzo de 300 de ancho, un evento cada TL_ROW, alternando izquierda/derecha
const TL_WIDTH = 300;
const TL_ROW = 130;
const TL_TOP = 24;

const TL_SEGMENTS = {
  // corazón izquierdo (30,y) → corazón derecho (270,y+ROW): rodea el texto por la derecha y hace un rizo al centro
  leftToRight: (y: number) =>
    `C 110 ${y - 4} 214 ${y + 2} 214 ${y + 40} C 214 ${y + 70} 160 ${y + 72} 140 ${y + 92} ` +
    `C 124 ${y + 108} 146 ${y + 122} 154 ${y + 108} C 162 ${y + 94} 136 ${y + 96} 150 ${y + 114} ` +
    `C 170 ${y + 132} 230 ${y + 130} 270 ${y + 130}`,
  // corazón derecho (270,y) → corazón izquierdo (30,y+ROW): baja por fuera del texto, cruza por debajo y entra desde el borde
  rightToLeft: (y: number) =>
    `C 290 ${y} 296 ${y + 16} 294 ${y + 40} C 292 ${y + 76} 240 ${y + 84} 170 ${y + 90} ` +
    `C 110 ${y + 95} 40 ${y + 92} 16 ${y + 108} C 4 ${y + 116} 10 ${y + 130} 30 ${y + 130}`,
};

// Corazón trazado por la propia línea: lóbulo derecho → punta → lóbulo izquierdo → vuelve a la muesca
const TL_HEART = (y: number) =>
  `C 160 ${y - 20} 188 ${y - 20} 188 ${y + 8} C 188 ${y + 30} 166 ${y + 44} 150 ${y + 62} ` +
  `C 134 ${y + 44} 112 ${y + 30} 112 ${y + 8} C 112 ${y - 20} 140 ${y - 20} 150 ${y}`;

interface TimelineItem {
  time: string;
  title: string;
}

@Component({
  selector: 'app-verde-oliva',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verde-oliva.component.html',
  styleUrl: './verde-oliva.component.scss'
})
export class VerdeOlivaComponent implements OnInit, AfterViewInit, OnDestroy {
  public names1 = 'Vladislav';
  public names2 = 'Angelina';

  // Sobre de apertura
  public envelopeState: 'closed' | 'opening' | 'opened' = 'closed';
  private envelopeTimer?: ReturnType<typeof setTimeout>;

  get initials(): string {
    return `${this.names1.charAt(0)} & ${this.names2.charAt(0)}`;
  }
  public tagline = 'Hoy y para siempre…';

  // Sección de bienvenida
  public greetingInitial = 'Q';
  public greetingRest = 'ueridos familiares';
  public greetingLine2 = 'y amigos';
  public inviteText = 'Los invitamos a compartir la alegría de un día tan especial para nosotros y a ser parte del comienzo de nuestra historia familiar.';
  public dayTitle = 'En este día';
  public weddingDate = '2026-09-25';

  // Programa
  public timelineInitial = 'P';
  public timelineRest = 'rograma';
  public timeline: TimelineItem[] = [
    { time: '16:30', title: 'Recepción de invitados' },
    { time: '17:00', title: 'Ceremonia civil' },
    { time: '17:45', title: 'Brindis y fotos' },
    { time: '18:30', title: 'Banquete' },
    { time: '20:00', title: 'Primer baile' },
    { time: '20:30', title: 'Corte del pastel' },
    { time: '21:00', title: '¡A bailar!' },
  ];
  public timelineViewBox = '';
  public timelineRatio = '';
  public timelinePath = '';
  public timelineHearts: Point[] = [];
  public timelineSlots: { left: boolean; top: string }[] = [];

  // Ubicación
  public locationInitial = 'U';
  public locationRest = 'bicación';
  public locationLines = [
    'Los esperamos en:',
    'Calle Gagarin 66, Esentukí',
    'Imperial Sparta, salón “Fénix”',
  ];
  public locationHint = 'Encuéntranos aquí';
  public mapButtonText = 'Ver en el mapa';
  public mapLink = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Imperial Sparta, Calle Gagarin 66, Esentukí');

  // Dress code
  public dressInitial = 'D';
  public dressRest = 'ress code';
  public dressText = '¡Nos encantará que acompañes la paleta de colores de nuestra celebración!';
  public dressColors = ['#6b5750', '#9c8a80', '#5a6150', '#a3ad94', '#ffffff'];

  // Confirmación de asistencia
  public rsvpInitial = 'C';
  public rsvpRest = 'onfirmación';
  public rsvpText = 'Nos estamos esforzando mucho para que la celebración sea inolvidable, por eso te pedimos confirmar tu asistencia antes de finales de junio.';
  public rsvpButtonText = 'Confirmar aquí';
  public rsvpLink = '#';

  // Deseos
  public wishesInitial = 'D';
  public wishesRest = 'eseos';
  public wishes = [
    'Lo mejor para nosotros es tu presencia y tus buenas palabras.',
    'No queremos complicarte con la elección de un regalo, por eso agradeceremos mucho tu aporte a nuestro presupuesto familiar.',
    'Si quieres contar una pequeña historia sobre nosotros o preparar una sorpresa, avísale a nuestro coordinador del evento.',
  ];

  public day = 0;
  public month = '';
  public days: { number: number; isDay: boolean }[] = [];

  public width = 0;
  public height = 0;
  public scale = 1;
  public outerPath = '';
  public innerPath = '';

  private resizeObserver?: ResizeObserver;

  constructor(private host: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngOnInit(): void {
    // mientras el sobre está cerrado no se puede desplazar la página
    document.body.style.overflow = 'hidden';

    const [y, m, d] = this.weddingDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    this.day = d;
    this.month = date.toLocaleDateString('es', { month: 'long' });
    // dos días antes y dos después, con el día de la boda en el centro
    this.days = [-2, -1, 0, 1, 2].map((offset) => ({
      number: new Date(y, m - 1, d + offset).getDate(),
      isDay: offset === 0,
    }));

    this.buildTimeline();
  }

  // Sello → solapa → carta → desvanecido; la duración total coincide con las transiciones del SCSS
  public openEnvelope(): void {
    if (this.envelopeState !== 'closed') return;
    this.envelopeState = 'opening';
    window.scrollTo(0, 0);
    this.envelopeTimer = setTimeout(() => {
      this.envelopeState = 'opened';
      document.body.style.overflow = '';
    }, 2600);
  }

  private buildTimeline(): void {
    const n = this.timeline.length;
    const lastY = TL_TOP + (n - 1) * TL_ROW;
    const lastIsLeft = (n - 1) % 2 === 0;
    // punta superior del corazón final, centrado debajo del último evento
    const heartTop = lastY + (lastIsLeft ? 100 : 108);
    const height = heartTop + 84;

    let d = `M -6 ${TL_TOP + 20} C 4 ${TL_TOP + 8} 16 ${TL_TOP} 30 ${TL_TOP}`;
    for (let i = 0; i < n - 1; i++) {
      const y = TL_TOP + i * TL_ROW;
      d += ' ' + (i % 2 === 0 ? TL_SEGMENTS.leftToRight(y) : TL_SEGMENTS.rightToLeft(y));
    }
    // remate: la línea baja al centro y traza un corazón
    d += lastIsLeft
      ? ` C 110 ${lastY - 4} 214 ${lastY + 2} 214 ${lastY + 40} C 214 ${lastY + 70} 150 ${heartTop - 24} 150 ${heartTop}`
      : ` C 290 ${lastY} 296 ${lastY + 16} 294 ${lastY + 40} C 292 ${lastY + 76} 240 ${lastY + 84} 190 ${lastY + 86}` +
        ` C 150 ${lastY + 88} 150 ${heartTop - 16} 150 ${heartTop}`;
    d += ' ' + TL_HEART(heartTop);

    this.timelinePath = d;
    this.timelineViewBox = `0 0 ${TL_WIDTH} ${height}`;
    this.timelineRatio = `${TL_WIDTH} / ${height}`;
    this.timelineHearts = this.timeline.map((_, i) => [i % 2 === 0 ? 30 : 270, TL_TOP + i * TL_ROW]);
    this.timelineSlots = this.timeline.map((_, i) => ({
      left: i % 2 === 0,
      top: `${((TL_TOP + i * TL_ROW + 12) / height) * 100}%`,
    }));
  }

  ngAfterViewInit(): void {
    const el = this.host.nativeElement.querySelector('.oliva-page') as HTMLElement;
    this.resizeObserver = new ResizeObserver(([entry]) => {
      this.zone.run(() => this.buildFrame(entry.contentRect.width, entry.contentRect.height));
    });
    this.resizeObserver.observe(el);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    clearTimeout(this.envelopeTimer);
    document.body.style.overflow = '';
  }

  // Ubica una voluta usando coordenadas relativas (0–1) y la escala del marco
  public place(x: number, y: number, rotate = 0, flip = false, size = 1): string {
    const s = this.scale * size;
    return `translate(${x * this.width} ${y * this.height}) rotate(${rotate}) scale(${flip ? -s : s} ${s})`;
  }

  private buildFrame(w: number, h: number): void {
    this.width = w;
    this.height = h;
    this.scale = w / REF_WIDTH;
    const frameHeight = h - LACE_SPACE;
    this.outerPath = this.framePath(OUTER, w, frameHeight);
    this.innerPath = this.framePath(INNER, w, frameHeight);
  }

  // Muestrea el cuarto superior izquierdo y lo refleja en los cuatro cuadrantes
  private framePath(segments: Segment[], w: number, h: number): string {
    const k = w / REF_WIDTH;
    const firstY = 'line' in segments[0] ? segments[0].line[1] : segments[0].curve[2][1];

    let current: Point = [REF_WIDTH / 2, firstY];
    const quarter: Point[] = [current];
    for (const seg of segments) {
      if ('line' in seg) {
        quarter.push(seg.line);
        current = seg.line;
      } else {
        const [c1, c2, end] = seg.curve;
        quarter.push(...this.sampleCubic(current, c1, c2, end, 16));
        current = end;
      }
    }

    const q: Point[] = quarter.map(([x, y]) => [x * k, y * k]);
    q.push([q[q.length - 1][0], h / 2]);

    const mx = ([x, y]: Point): Point => [w - x, y];
    const my = ([x, y]: Point): Point => [x, h - y];
    const reversed = [...q].reverse();

    const points = [
      ...q,
      ...reversed.map(my),
      ...q.map((p) => mx(my(p))),
      ...reversed.map(mx),
    ];

    return 'M ' + points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ') + ' Z';
  }

  private sampleCubic(p0: Point, c1: Point, c2: Point, p3: Point, steps: number): Point[] {
    const out: Point[] = [];
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const u = 1 - t;
      const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
      out.push([
        a * p0[0] + b * c1[0] + c * c2[0] + d * p3[0],
        a * p0[1] + b * c1[1] + c * c2[1] + d * p3[1],
      ]);
    }
    return out;
  }
}
