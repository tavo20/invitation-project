const PANEL_FONTS =
  'https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400;500&family=Cormorant+Garamond:ital,wght@1,400;1,500;1,600&display=swap';

/** Carga las fuentes de la marca solo en las pantallas del panel. */
export const ensurePanelFonts = (doc: Document): void => {
  if (doc.querySelector(`link[href="${PANEL_FONTS}"]`)) return;
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = PANEL_FONTS;
  doc.head.appendChild(link);
};
