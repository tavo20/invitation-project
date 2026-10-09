/**
 * QR del álbum para imprimir y poner en las mesas.
 * La librería se importa al usarla, para no cargarla en el resto de la app.
 */
export async function galleryQrDataUrl(url: string, size = 1024): Promise<string> {
  const QRCode = await import('qrcode');
  return QRCode.toDataURL(url, {
    width: size,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#2b2420', light: '#ffffff' },
  });
}

export function downloadDataUrl(dataUrl: string, fileName: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Link público del álbum para los invitados. */
export function galleryGuestUrl(invitationId: string): string {
  return `https://www.invitapp.art/invitation/galeria/${invitationId}`;
}
