import {
  AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, inject
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400;500&family=Cormorant+Garamond:ital,wght@1,400;1,500;1,600&family=Manrope:wght@400;500;600&display=swap';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly doc = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly whatsappUrl = 'https://wa.me/573218581771';
  readonly whatsappNumber = '321 858 1771';

  readonly steps = [
    { k: 'La invitación', h: 'Llega a cada invitado', i: 'con tu historia.', p: 'Tus fotos, tu canción, cuenta regresiva, mapa y código de vestimenta. Se abre en cualquier celular.' },
    { k: 'Confirmaciones', h: 'Confirman en un toque.', i: 'Tú lo ves al instante.', p: 'Sabes quién va, con cuántos acompañantes y quién falta por responder, sin escribirle a nadie.' },
    { k: 'Mesas', h: 'Cada quien sabe', i: 'dónde sentarse.', p: 'Asignas puestos una vez y cada invitado recibe su ticket con código QR.' },
    { k: 'Galería', h: 'Las fotos de todos,', i: 'en un solo lugar.', p: 'Tus invitados suben lo que capturan a una galería privada de tu boda.' },
    { k: 'Música', h: 'La pista', i: 'la ponen ellos.', p: 'Los invitados piden canciones y votan. El DJ las recibe ordenadas en su pantalla.' },
  ];

  readonly plans = [
    {
      name: 'Esencial', price: '$199.000', star: false, cta: 'Quiero Esencial',
      items: [
        { t: 'Invitación personalizada con música', on: true },
        { t: 'Confirmación de asistencia y lista', on: true },
        { t: 'Mesas y tickets QR', on: false },
        { t: 'Editor para hacer cambios', on: false },
        { t: 'Galería de fotos de invitados', on: false },
        { t: 'Música de la fiesta con el DJ', on: false },
      ]
    },
    {
      name: 'Completa', price: '$499.000', star: true, cta: 'Quiero Completa',
      items: [
        { t: 'Invitación personalizada con música', on: true },
        { t: 'Confirmación de asistencia y lista', on: true },
        { t: 'Mesas y tickets QR', on: true },
        { t: 'Editor para hacer cambios', on: true },
        { t: 'Galería de fotos de invitados', on: true },
        { t: 'Música de la fiesta con el DJ', on: true },
      ]
    }
  ];

  readonly galleryTiles = [[28, 40, 72], [340, 35, 70], [20, 30, 55], [200, 20, 62], [35, 45, 80], [350, 25, 48], [15, 40, 66], [45, 30, 74], [330, 30, 60]]
    .map(([h, s, l], i) => `linear-gradient(${40 + i * 30}deg,hsl(${h} ${s}% ${l}%),hsl(${h + 20} ${s - 10}% ${l - 18}%))`);

  activeStep = 0;
  liveCount = 142;
  editorNames = 'Valentina & Andrés';

  @ViewChild('seq') seqRef!: ElementRef<HTMLElement>;
  @ViewChild('stage') stageRef!: ElementRef<HTMLElement>;
  @ViewChild('env') envRef!: ElementRef<HTMLElement>;
  @ViewChild('seqPhone') phoneRef!: ElementRef<HTMLElement>;
  @ViewChild('top') topRef!: ElementRef<HTMLElement>;
  @ViewChild('hint') hintRef!: ElementRef<HTMLElement>;
  @ViewChild('cap') capRef!: ElementRef<HTMLElement>;
  @ViewChild('meterBar') meterBarRef!: ElementRef<HTMLElement>;
  @ViewChild('meterNum') meterNumRef!: ElementRef<HTMLElement>;
  @ViewChild('meterLabel') meterLabelRef!: ElementRef<HTMLElement>;
  @ViewChild('qr') qrRef!: ElementRef<HTMLCanvasElement>;

  private geo: any = {};
  private ticking = false;
  private io?: IntersectionObserver;
  private liveTimer?: ReturnType<typeof setInterval>;
  private fontLink?: HTMLLinkElement;
  private readonly onScroll = () => this.requestFrame();
  private readonly onResize = () => { this.layout(); this.requestFrame(); };

  ngOnInit(): void {
    this.title.setTitle('InvitApp · Tu boda en un solo link');
    this.meta.updateTag({ name: 'description', content: 'Invitación, confirmaciones, mesas, las fotos de tus invitados y la música de la fiesta. Todo en un solo link.' });
    this.meta.updateTag({ property: 'og:title', content: 'InvitApp · Tu boda en un solo link' });
    this.meta.updateTag({ property: 'og:description', content: 'Invitación, confirmaciones, mesas, fotos de tus invitados y la música de la fiesta.' });

    if (!this.doc.querySelector(`link[href="${FONTS_HREF}"]`)) {
      this.fontLink = this.doc.createElement('link');
      this.fontLink.rel = 'stylesheet';
      this.fontLink.href = FONTS_HREF;
      this.doc.head.appendChild(this.fontLink);
    }
  }

  ngAfterViewInit(): void {
    this.drawQr();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onResize);
      // espera a que carguen las fuentes para medir bien el celular
      (this.doc as any).fonts?.ready?.then(() => { this.layout(); this.frame(); });
      this.layout();
      this.frame();
    });

    this.io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          this.zone.run(() => this.activeStep = Number((e.target as HTMLElement).dataset['s']));
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    this.doc.querySelectorAll('.c-step').forEach(s => this.io!.observe(s));

    if (!reduce) {
      this.liveTimer = setInterval(() => {
        this.liveCount = this.liveCount >= 176 ? 142 : this.liveCount + 1;
      }, 2200);
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
    this.io?.disconnect();
    if (this.liveTimer) clearInterval(this.liveTimer);
    this.fontLink?.remove();
  }

  scrollTo(id: string, ev: Event): void {
    ev.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.doc.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }

  onNamesInput(ev: Event): void {
    this.editorNames = (ev.target as HTMLInputElement).value;
  }

  // ===== Secuencia de scroll: el sobre se abre, sale el celular y se acomoda =====
  private requestFrame(): void {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => this.frame());
  }

  private layout(): void {
    const env = this.envRef.nativeElement;
    const phone = this.phoneRef.nativeElement;
    const vw = window.innerWidth;
    const vh = this.stageRef.nativeElement.clientHeight;
    const wide = vw > 860;
    const ew = Math.min(440, vw * 0.84);
    const eh = ew * 0.62;
    const ecy = vh * (wide ? 0.7 : 0.68);

    Object.assign(env.style, { left: `${(vw - ew) / 2}px`, top: `${ecy - eh / 2}px`, width: `${ew}px`, height: `${eh}px` });
    env.style.setProperty('--ew', `${ew}px`);

    const pw = phone.offsetWidth;
    const ph = phone.offsetHeight;
    this.geo = {
      vw, vh, eh, ecy, pw, ph,
      s0: (eh * 0.9) / ph,
      sf: Math.min(1, (vh * (wide ? 0.8 : 0.58)) / ph),
      fx: wide ? vw * 0.2 : 0,
      fy: wide ? vh * 0.5 : vh * 0.38,
    };
  }

  private frame(): void {
    this.ticking = false;
    const G = this.geo;
    if (!G.ph) return;

    const cl = (v: number) => Math.max(0, Math.min(1, v));
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const seq = this.seqRef.nativeElement;
    const env = this.envRef.nativeElement;
    const r = seq.getBoundingClientRect();
    const total = seq.offsetHeight - G.vh;
    const p = cl(-r.top / total);

    const flap = ease(cl(p / 0.2));
    const rise = ease(cl((p - 0.16) / 0.28));
    const grow = ease(cl((p - 0.42) / 0.34));
    const capT = cl((p - 0.78) / 0.14);

    const top = this.topRef.nativeElement;
    top.style.opacity = String(1 - cl(p / 0.14));
    top.style.transform = `translateY(${-60 * cl(p / 0.2)}px)`;
    this.hintRef.nativeElement.style.opacity = String(1 - cl(p / 0.06));

    const eFlap = env.querySelector<HTMLElement>('.env-flap')!;
    const eSeal = env.querySelector<HTMLElement>('.env-seal')!;
    const ffOut = env.querySelector<HTMLElement>('.ff-out')!;
    eFlap.style.transform = `rotateX(${flap * 178}deg)`;
    eFlap.style.zIndex = flap > 0.5 ? '0' : '4';
    eSeal.style.opacity = String(1 - cl(flap * 3));
    eSeal.style.transform = `scale(${1 - flap * 0.4})`;
    ffOut.style.filter = `drop-shadow(0 ${4 - flap * 4}px 5px rgba(55,32,18,${0.3 * (1 - flap)})) brightness(${1 - Math.sin(flap * Math.PI) * 0.18})`;

    const drop = grow * G.vh * 0.75;
    const eo = String(1 - cl((p - 0.5) / 0.2));
    env.querySelectorAll<HTMLElement>('.env-back, .env-front, .env-flap, .env-shadow').forEach(el => {
      el.style.opacity = eo;
      el.style.translate = `0 ${drop}px`;
    });

    const startY = G.ecy + G.eh * 0.06;
    const riseY = G.ecy - G.eh * 0.5 - G.ph * G.s0 * 0.2;
    const y = lerp(lerp(startY, riseY, rise), G.fy, grow);
    const x = G.vw / 2 + lerp(0, G.fx, grow);
    const s = lerp(lerp(G.s0, G.s0 * 1.12, rise), G.sf, grow);
    const ry = Math.sin(grow * Math.PI) * -28;
    const rx = Math.sin(grow * Math.PI) * 12;
    const rz = lerp(0, -3, rise) * (1 - grow);
    const phone = this.phoneRef.nativeElement;
    phone.style.transform = `translate(${x - G.pw / 2}px,${y - G.ph / 2}px) scale(${s}) rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(${rz}deg)`;
    phone.style.zIndex = grow > 0.05 ? '5' : '2';
    phone.style.filter = `drop-shadow(0 ${30 * grow}px ${60 * grow}px rgba(232,180,160,${0.25 * grow}))`;

    const cap = this.capRef.nativeElement;
    cap.style.opacity = String(capT);
    cap.classList.toggle('on', capT > 0.5);
    (cap.querySelector('.c-cap-in') as HTMLElement).style.transform = `translateY(${(1 - capT) * 24}px)`;

    this.meterBarRef.nativeElement.style.width = `${p * 100}%`;
    this.meterNumRef.nativeElement.textContent = `${Math.round(p * 100)}%`;
    this.meterLabelRef.nativeElement.textContent =
      p < 0.18 ? 'El sobre llega' : p < 0.44 ? 'Se abre' : p < 0.78 ? 'Tu invitación' : 'Tu boda, en un link';
  }

  // Código QR decorativo para la tarjeta del ticket
  private drawQr(): void {
    const ctx = this.qrRef.nativeElement.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 25, 25);
    ctx.fillStyle = '#1b1512';
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) if (rnd() > 0.52) ctx.fillRect(x, y, 1, 1);
    [[0, 0], [18, 0], [0, 18]].forEach(([x, y]) => {
      ctx.fillStyle = '#fff'; ctx.fillRect(x, y, 7, 7);
      ctx.fillStyle = '#1b1512'; ctx.fillRect(x, y, 7, 7);
      ctx.fillStyle = '#fff'; ctx.fillRect(x + 1, y + 1, 5, 5);
      ctx.fillStyle = '#1b1512'; ctx.fillRect(x + 2, y + 2, 3, 3);
    });
  }
}
