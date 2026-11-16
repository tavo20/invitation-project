/**
 * Descargas de confirmaciones y mesas en Excel y PDF.
 * ExcelJS y jsPDF se cargan solo al presionar "Descargar", así no pesan en las invitaciones ni en el panel.
 */

export interface InvitadoExport {
  _id?: string;
  names: string;
  numero_confirmados: number;
  status: string;
  descripcion?: string;
  mesa_id?: string | null;
  type?: string;
  deleted?: boolean;
  createdAt?: string;
}

export interface MesaExport {
  _id: string;
  name: string;
  capacity: number;
  order?: number;
  capitan?: string | null;
  capitanNombre?: string;
}

export interface DatosEvento {
  nombre: string;
  /** Texto libre de la fecha, como viene de la invitación. */
  fecha?: string;
  lugar?: string;
  organizador?: string;
  /** Marca que firma el archivo: la del planner si es marca blanca, si no InvitApp. */
  marca?: string;
}

type Estado = 'confirmado' | 'pendiente' | 'cancelada';

const ESTADO_LABEL: Record<Estado, string> = { confirmado: 'Asiste', pendiente: 'Por confirmar', cancelada: 'No asiste' };
const ORDEN: Record<Estado, number> = { confirmado: 0, pendiente: 1, cancelada: 2 };

// Paleta de la marca para documentos (fondo blanco, se imprime bien)
const C = {
  ciruela: '2A1622',
  rosa: 'B5735F',
  rosaClaro: 'F6E9E3',
  tinta: '231C20',
  gris: '6E6470',
  linea: 'E3D8DC',
  zebra: 'FAF6F7',
  ok: '2F7D4F',
  okFondo: 'E6F4EA',
  warn: '9A6A10',
  warnFondo: 'FDF3DC',
  no: '8A5A5A',
  noFondo: 'F4ECEC',
};
const ESTADO_COLOR: Record<Estado, { txt: string; fondo: string }> = {
  confirmado: { txt: C.ok, fondo: C.okFondo },
  pendiente: { txt: C.warn, fondo: C.warnFondo },
  cancelada: { txt: C.no, fondo: C.noFondo },
};

// ===== Datos =====

const estadoDe = (s: string): Estado => {
  const v = String(s || '').toLowerCase();
  if (v === 'confirmado' || v === 'confirmed') return 'confirmado';
  if (v === 'cancelada' || v === 'cancelled' || v === 'canceled') return 'cancelada';
  return 'pendiente';
};

const invitados = (lista: InvitadoExport[]) =>
  lista
    .filter(i => !i.deleted && i.type !== 'hospedaje')
    .map(i => ({ ...i, estado: estadoDe(i.status), personas: Number(i.numero_confirmados) || 0 }))
    .sort((a, b) => ORDEN[a.estado] - ORDEN[b.estado] || a.names.localeCompare(b.names, 'es'));

const resumen = (lista: ReturnType<typeof invitados>) => {
  const r = { confirmado: { grupos: 0, personas: 0 }, pendiente: { grupos: 0, personas: 0 }, cancelada: { grupos: 0, personas: 0 } };
  lista.forEach(i => {
    r[i.estado].grupos += 1;
    r[i.estado].personas += i.estado === 'cancelada' ? 0 : i.personas;
  });
  return r;
};

const mesasConInvitados = (mesas: MesaExport[], lista: ReturnType<typeof invitados>) => {
  const ordenadas = [...mesas].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0) || a.name.localeCompare(b.name, 'es', { numeric: true }));
  const ids = new Set(ordenadas.map(m => m._id));
  const sentables = lista.filter(i => i.estado !== 'cancelada');
  return {
    mesas: ordenadas.map(m => {
      const gente = sentables.filter(i => i.mesa_id === m._id);
      const ocupados = gente.reduce((t, i) => t + i.personas, 0);
      const grupoCapitan = gente.find(g => (g as any)._id && (g as any)._id === m.capitan);
      // capitan sigue siendo el id; capitanTexto es lo que se imprime
      const capitanTexto = m.capitan ? m.capitanNombre || grupoCapitan?.names || '' : '';
      return { ...m, gente, ocupados, libres: Math.max(0, m.capacity - ocupados), capitanTexto };
    }),
    sinMesa: sentables.filter(i => i.estado === 'confirmado' && (!i.mesa_id || !ids.has(i.mesa_id))),
  };
};

const fechaDescarga = () =>
  new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date());

const fechaCorta = (iso?: string) =>
  iso ? new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso)) : '';

const archivo = (tipo: string, ev: DatosEvento, ext: string) => {
  const base = ev.nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'evento';
  return `${tipo}-${base}.${ext}`;
};

const descargar = (blob: Blob, nombre: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};

const subtitulo = (ev: DatosEvento) => [ev.fecha, ev.lugar].filter(Boolean).join(' · ');

// ===== Excel =====

async function nuevoLibro(ev: DatosEvento) {
  const ExcelJS = (await import('exceljs')).default ?? (await import('exceljs'));
  const wb = new (ExcelJS as any).Workbook();
  wb.creator = ev.marca || 'InvitApp';
  wb.created = new Date();
  return wb;
}

/** Encabezado de hoja: título del evento, subtítulo y fecha de descarga. Devuelve la fila donde empieza la tabla. */
function encabezadoHoja(ws: any, ev: DatosEvento, titulo: string, columnas: number): number {
  const ultima = String.fromCharCode(64 + columnas);
  ws.mergeCells(`A1:${ultima}1`);
  ws.getCell('A1').value = ev.nombre;
  ws.getCell('A1').font = { name: 'Calibri', size: 18, bold: true, color: { argb: 'FF' + C.ciruela } };
  ws.getRow(1).height = 28;

  ws.mergeCells(`A2:${ultima}2`);
  ws.getCell('A2').value = [titulo, subtitulo(ev)].filter(Boolean).join('  ·  ');
  ws.getCell('A2').font = { name: 'Calibri', size: 11, color: { argb: 'FF' + C.rosa } };

  ws.mergeCells(`A3:${ultima}3`);
  ws.getCell('A3').value = `Descargado el ${fechaDescarga()}${ev.organizador ? '  ·  ' + ev.organizador : ''}  ·  ${ev.marca || 'InvitApp'}`;
  ws.getCell('A3').font = { name: 'Calibri', size: 9, color: { argb: 'FF' + C.gris } };
  return 5;
}

function tablaExcel(ws: any, fila: number, encabezados: string[], filas: (string | number)[][], anchos: number[], opts: { estadoCol?: number; wrapCols?: number[] } = {}) {
  ws.columns = anchos.map(w => ({ width: w }));
  const h = ws.getRow(fila);
  encabezados.forEach((t, i) => {
    const c = h.getCell(i + 1);
    c.value = t;
    c.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.ciruela } };
    c.alignment = { vertical: 'middle', horizontal: i === 0 ? 'left' : 'center' };
  });
  h.height = 22;

  filas.forEach((datos, r) => {
    const row = ws.getRow(fila + 1 + r);
    datos.forEach((v, i) => {
      const c = row.getCell(i + 1);
      c.value = v;
      c.font = { name: 'Calibri', size: 11, color: { argb: 'FF' + C.tinta } };
      c.alignment = { vertical: 'top', horizontal: typeof v === 'number' ? 'center' : 'left', wrapText: opts.wrapCols?.includes(i) };
      c.border = { bottom: { style: 'thin', color: { argb: 'FF' + C.linea } } };
      if (r % 2 === 1) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + C.zebra } };
    });
    if (opts.estadoCol !== undefined) {
      const c = row.getCell(opts.estadoCol + 1);
      const e = (Object.keys(ESTADO_LABEL) as Estado[]).find(k => ESTADO_LABEL[k] === c.value);
      if (e) {
        c.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF' + ESTADO_COLOR[e].txt } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + ESTADO_COLOR[e].fondo } };
        c.alignment = { vertical: 'top', horizontal: 'center' };
      }
    }
  });

  ws.views = [{ state: 'frozen', ySplit: fila }];
  if (filas.length) {
    ws.autoFilter = { from: { row: fila, column: 1 }, to: { row: fila + filas.length, column: encabezados.length } };
  }
  ws.pageSetup = { orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } };
}

/** Títulos de cada lista por estado (hojas del Excel y secciones del PDF). */
const LISTAS: { estado: Estado; titulo: string; hoja: string }[] = [
  { estado: 'confirmado', titulo: 'Asisten', hoja: 'Asisten' },
  { estado: 'pendiente', titulo: 'Por confirmar', hoja: 'Por confirmar' },
  { estado: 'cancelada', titulo: 'No asisten', hoja: 'No asisten' },
];

export async function confirmacionesExcel(ev: DatosEvento, lista: InvitadoExport[], mesas: MesaExport[]): Promise<void> {
  const inv = invitados(lista);
  const r = resumen(inv);
  const nombreMesa = new Map(mesas.map(m => [m._id, m.name]));
  const mesaDe = (id?: string | null) => (id && nombreMesa.get(id)) || '';
  const wb = await nuevoLibro(ev);

  // Resumen
  const res = wb.addWorksheet('Resumen', { properties: { tabColor: { argb: 'FF' + C.ciruela } } });
  const f0 = encabezadoHoja(res, ev, 'Resumen de confirmaciones', 3);
  tablaExcel(res, f0, ['Lista', 'Grupos', 'Personas'], LISTAS.map(l => [ESTADO_LABEL[l.estado], r[l.estado].grupos, r[l.estado].personas]), [22, 12, 12], { estadoCol: 0 });
  const tot = res.getRow(f0 + 4);
  tot.values = ['Total', inv.length, r.confirmado.personas + r.pendiente.personas];
  tot.eachCell((c: any, i: number) => {
    c.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF' + C.ciruela } };
    c.alignment = { horizontal: i === 1 ? 'left' : 'center' };
    c.border = { top: { style: 'medium', color: { argb: 'FF' + C.ciruela } } };
  });
  res.views = [];
  res.autoFilter = undefined;
  res.getCell(`A${f0 + 6}`).value = 'Cada lista está en su propia hoja (abajo). Personas = quienes asisten o están por confirmar.';
  res.getCell(`A${f0 + 6}`).font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF' + C.gris } };

  // Una hoja por estado
  for (const l of LISTAS) {
    const gente = inv.filter(i => i.estado === l.estado);
    const ws = wb.addWorksheet(l.hoja, { properties: { tabColor: { argb: 'FF' + ESTADO_COLOR[l.estado].txt } } });
    const personas = l.estado === 'cancelada' ? '' : `  ·  ${r[l.estado].personas} personas`;
    const f = encabezadoHoja(ws, ev, `${l.titulo}: ${gente.length} ${gente.length === 1 ? 'grupo' : 'grupos'}${personas}`, 5);
    ws.getCell('A2').font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF' + ESTADO_COLOR[l.estado].txt } };
    if (!gente.length) {
      ws.columns = [{ width: 34 }];
      ws.getCell(`A${f}`).value = 'Nadie en esta lista por ahora.';
      ws.getCell(`A${f}`).font = { name: 'Calibri', size: 11, italic: true, color: { argb: 'FF' + C.gris } };
      continue;
    }
    tablaExcel(ws, f, ['Nombre', 'Personas', 'Mesa', 'Mensaje', 'Fecha'],
      gente.map(i => [i.names, i.personas, mesaDe(i.mesa_id), i.descripcion || '', fechaCorta(i.createdAt)]),
      [34, 11, 14, 50, 14], { wrapCols: [0, 3] });
    // Encabezado de la tabla con el color de la lista
    ws.getRow(f).eachCell((c: any) => (c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + ESTADO_COLOR[l.estado].txt } }));
  }

  // Todos, para filtrar
  const ws = wb.addWorksheet('Todos', { properties: { tabColor: { argb: 'FF' + C.gris } } });
  const f1 = encabezadoHoja(ws, ev, `Todos: ${inv.length} respuestas`, 6);
  tablaExcel(ws, f1, ['Nombre', 'Personas', 'Estado', 'Mesa', 'Mensaje', 'Fecha'],
    inv.map(i => [i.names, i.personas, ESTADO_LABEL[i.estado], mesaDe(i.mesa_id), i.descripcion || '', fechaCorta(i.createdAt)]),
    [34, 11, 15, 14, 48, 14], { estadoCol: 2, wrapCols: [0, 4] });

  const buf = await wb.xlsx.writeBuffer();
  descargar(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), archivo('confirmaciones', ev, 'xlsx'));
}

export async function mesasExcel(ev: DatosEvento, lista: InvitadoExport[], mesasBase: MesaExport[]): Promise<void> {
  const { mesas, sinMesa } = mesasConInvitados(mesasBase, invitados(lista));
  const wb = await nuevoLibro(ev);

  const ws = wb.addWorksheet('Por mesa', { properties: { tabColor: { argb: 'FF' + C.ciruela } } });
  const f0 = encabezadoHoja(ws, ev, `${mesas.length} mesas`, 5);
  tablaExcel(ws, f0, ['Mesa', 'Capitán', 'Capacidad', 'Ocupados', 'Libres', 'Invitados'],
    mesas.map(m => [m.name, m.capitanTexto || 'Sin capitán', m.capacity, m.ocupados, m.libres, m.gente.map(g => `${g.names} (${g.personas})`).join('\n')]),
    [18, 24, 12, 12, 10, 56], { wrapCols: [1, 5] });

  const as = wb.addWorksheet('Asignaciones', { properties: { tabColor: { argb: 'FF' + C.rosa } } });
  const f1 = encabezadoHoja(as, ev, 'Un invitado por fila, para filtrar', 4);
  tablaExcel(as, f1, ['Mesa', 'Invitado', 'Personas', 'Estado', 'Capitán'],
    mesas.flatMap(m => m.gente.map(g => [m.name, g.names, g.personas, ESTADO_LABEL[g.estado], g._id && g._id === m.capitan ? 'Sí' : ''])),
    [18, 38, 11, 15, 11], { estadoCol: 3, wrapCols: [1] });

  const sm = wb.addWorksheet('Sin mesa', { properties: { tabColor: { argb: 'FF' + C.warn } } });
  const f2 = encabezadoHoja(sm, ev, `${sinMesa.length} grupos confirmados sin mesa`, 3);
  tablaExcel(sm, f2, ['Invitado', 'Personas', 'Mensaje'],
    sinMesa.map(g => [g.names, g.personas, g.descripcion || '']),
    [38, 11, 50], { wrapCols: [0, 2] });

  const buf = await wb.xlsx.writeBuffer();
  descargar(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), archivo('mesas', ev, 'xlsx'));
}

// ===== PDF =====

const rgb = (hex: string): [number, number, number] => [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];

async function nuevoPdf() {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  return { doc, autoTable };
}

/** Banda de encabezado de la primera página. Devuelve la Y donde empieza el contenido. */
function portadaPdf(doc: any, ev: DatosEvento, titulo: string): number {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(...rgb(C.ciruela));
  doc.rect(0, 0, w, 112, 'F');
  doc.setFillColor(...rgb(C.rosa));
  doc.rect(40, 84, 36, 2, 'F');

  doc.setTextColor(232, 180, 160);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(titulo.toUpperCase(), 40, 34, { charSpace: 1.2 });

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text(doc.splitTextToSize(ev.nombre, w - 80)[0], 40, 64);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(217, 203, 211);
  const sub = subtitulo(ev);
  if (sub) doc.text(doc.splitTextToSize(sub, w - 80)[0], 40, 102);
  return 140;
}

function piePdf(doc: any, ev: DatosEvento) {
  const n = doc.getNumberOfPages();
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  for (let p = 1; p <= n; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...rgb(C.gris));
    doc.text(`${ev.nombre}  ·  Descargado el ${fechaDescarga()}${ev.organizador ? '  ·  ' + ev.organizador : ''}`, 40, h - 24);
    doc.text(`${ev.marca || 'InvitApp'}  ·  ${p} / ${n}`, w - 40, h - 24, { align: 'right' });
  }
}

/** Cajas de cifras bajo la portada. */
function cifrasPdf(doc: any, y: number, cifras: { valor: string; etiqueta: string; color?: string }[]): number {
  const w = doc.internal.pageSize.getWidth();
  const gap = 10;
  const ancho = (w - 80 - gap * (cifras.length - 1)) / cifras.length;
  cifras.forEach((c, i) => {
    const x = 40 + i * (ancho + gap);
    doc.setFillColor(...rgb(C.rosaClaro));
    doc.roundedRect(x, y, ancho, 58, 8, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...rgb(c.color || C.ciruela));
    doc.text(c.valor, x + 14, y + 28);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...rgb(C.gris));
    doc.text(c.etiqueta, x + 14, y + 45);
  });
  return y + 58 + 22;
}

const estiloTabla = {
  theme: 'plain' as const,
  styles: { font: 'helvetica', fontSize: 9.5, textColor: rgb(C.tinta), cellPadding: { top: 6, bottom: 6, left: 6, right: 6 }, lineColor: rgb(C.linea), lineWidth: { bottom: 0.5 }, valign: 'top' as const },
  headStyles: { fillColor: rgb(C.ciruela), textColor: [255, 255, 255] as [number, number, number], fontStyle: 'bold' as const, fontSize: 9, lineWidth: 0 },
  alternateRowStyles: { fillColor: rgb(C.zebra) },
  margin: { left: 40, right: 40, bottom: 48 },
};

export async function confirmacionesPdf(ev: DatosEvento, lista: InvitadoExport[], mesas: MesaExport[]): Promise<void> {
  const inv = invitados(lista);
  const r = resumen(inv);
  const nombreMesa = new Map(mesas.map(m => [m._id, m.name]));
  const { doc, autoTable } = await nuevoPdf();
  const alto = doc.internal.pageSize.getHeight();

  let y = portadaPdf(doc, ev, 'Lista de confirmaciones');
  y = cifrasPdf(doc, y, [
    { valor: String(r.confirmado.personas), etiqueta: `asisten · ${r.confirmado.grupos} grupos`, color: C.ok },
    { valor: String(r.pendiente.personas), etiqueta: `por confirmar · ${r.pendiente.grupos} grupos`, color: C.warn },
    { valor: String(r.cancelada.grupos), etiqueta: 'grupos no asisten', color: C.no },
    { valor: String(inv.length), etiqueta: 'respuestas en total' },
  ]);

  // Una sección por lista: título con color, conteo y su tabla
  for (const l of LISTAS) {
    const gente = inv.filter(i => i.estado === l.estado);
    const color = ESTADO_COLOR[l.estado];
    // El título no queda solo al final de una página
    if (y > alto - 140) {
      doc.addPage();
      y = 48;
    }
    doc.setFillColor(...rgb(color.fondo));
    doc.roundedRect(40, y, doc.internal.pageSize.getWidth() - 80, 34, 6, 6, 'F');
    doc.setFillColor(...rgb(color.txt));
    doc.rect(40, y, 4, 34, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...rgb(color.txt));
    doc.text(l.titulo, 54, y + 22);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const cuenta = `${gente.length} ${gente.length === 1 ? 'grupo' : 'grupos'}` + (l.estado === 'cancelada' ? '' : ` · ${r[l.estado].personas} personas`);
    doc.text(cuenta, doc.internal.pageSize.getWidth() - 54, y + 22, { align: 'right' });
    y += 42;

    if (!gente.length) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(...rgb(C.gris));
      doc.text('Nadie en esta lista por ahora.', 46, y + 8);
      y += 34;
      continue;
    }

    autoTable(doc, {
      ...estiloTabla,
      startY: y,
      head: [['Nombre', 'Personas', 'Mesa', 'Mensaje']],
      body: gente.map(i => [i.names, String(i.personas), (i.mesa_id && nombreMesa.get(i.mesa_id)) || '—', i.descripcion || '']),
      headStyles: { ...estiloTabla.headStyles, fillColor: rgb(color.txt), lineColor: rgb(color.txt), lineWidth: 0.6 },
      columnStyles: {
        0: { cellWidth: 170, fontStyle: 'bold' },
        1: { cellWidth: 56, halign: 'center' },
        2: { cellWidth: 70 },
        3: { textColor: rgb(C.gris), fontStyle: 'italic' },
      },
    });
    y = (doc as any).lastAutoTable.finalY + 26;
  }

  piePdf(doc, ev);
  descargar(doc.output('blob'), archivo('confirmaciones', ev, 'pdf'));
}

export async function mesasPdf(ev: DatosEvento, lista: InvitadoExport[], mesasBase: MesaExport[]): Promise<void> {
  const { mesas, sinMesa } = mesasConInvitados(mesasBase, invitados(lista));
  const { doc, autoTable } = await nuevoPdf();
  const puestos = mesas.reduce((t, m) => t + m.capacity, 0);
  const ocupados = mesas.reduce((t, m) => t + m.ocupados, 0);
  const sin = sinMesa.reduce((t, g) => t + g.personas, 0);

  let y = portadaPdf(doc, ev, 'Distribución de mesas');
  const conCapitan = mesas.filter(m => m.capitan).length;
  y = cifrasPdf(doc, y, [
    { valor: String(mesas.length), etiqueta: 'mesas' },
    { valor: `${ocupados}/${puestos}`, etiqueta: 'puestos asignados' },
    { valor: `${conCapitan}/${mesas.length}`, etiqueta: 'mesas con capitán', color: conCapitan === mesas.length ? C.ok : C.rosa },
    { valor: String(sin), etiqueta: 'confirmados sin mesa', color: sin ? C.warn : C.ok },
  ]);

  if (!mesas.length) {
    doc.setFontSize(11);
    doc.setTextColor(...rgb(C.gris));
    doc.text('Aún no hay mesas creadas.', 40, y + 10);
  }

  // Una tabla por mesa: no se parte entre páginas
  mesas.forEach(m => {
    autoTable(doc, {
      ...estiloTabla,
      startY: y,
      pageBreak: 'avoid',
      rowPageBreak: 'avoid',
      head: [[{ content: m.name, styles: { halign: 'left' } }, { content: `${m.ocupados}/${m.capacity} puestos`, styles: { halign: 'right' } }]],
      body: [
        ...(m.gente.length
          ? [[{ content: m.capitanTexto ? `Capitán: ${m.capitanTexto}` : 'Sin capitán', colSpan: 2, styles: { textColor: rgb(m.capitanTexto ? C.rosa : C.gris), fontStyle: m.capitanTexto ? 'bold' : 'italic', fillColor: rgb(C.rosaClaro), fontSize: 9 } }]]
          : []),
        ...(m.gente.length
          ? m.gente.map(g => [g.names + (g.estado === 'pendiente' ? '  (por confirmar)' : '') + (g._id && g._id === m.capitan ? '  · capitán' : ''), String(g.personas)])
          : [[{ content: 'Sin invitados asignados', colSpan: 2, styles: { textColor: rgb(C.gris), fontStyle: 'italic' } }]]),
      ] as any,
      columnStyles: { 0: { fontStyle: 'bold' }, 1: { cellWidth: 90, halign: 'right' } },
      headStyles: { ...estiloTabla.headStyles, fillColor: m.ocupados > m.capacity ? rgb('9B3B3B') : rgb(C.ciruela), lineColor: m.ocupados > m.capacity ? rgb('9B3B3B') : rgb(C.ciruela), lineWidth: 0.6 },
    });
    y = (doc as any).lastAutoTable.finalY + 14;
  });

  if (sinMesa.length) {
    autoTable(doc, {
      ...estiloTabla,
      startY: y + 6,
      head: [[{ content: 'Confirmados sin mesa', styles: { halign: 'left' } }, { content: `${sin} personas`, styles: { halign: 'right' } }]],
      body: sinMesa.map(g => [g.names, String(g.personas)]),
      columnStyles: { 0: { fontStyle: 'bold' }, 1: { cellWidth: 90, halign: 'right' } },
      headStyles: { ...estiloTabla.headStyles, fillColor: rgb(C.warn), lineColor: rgb(C.warn), lineWidth: 0.6 },
    });
  }

  piePdf(doc, ev);
  descargar(doc.output('blob'), archivo('mesas', ev, 'pdf'));
}
