import * as QRCode from 'qrcode';

/**
 * QR del álbum para imprimir y poner en las mesas.
 * Va en el mismo paquete del panel: un import aparte falla en el hosting
 * de producción y deja el botón de descarga apagado.
 */
type QrLib = {
  toString(text: string, options?: QRCode.QRCodeToStringOptions): Promise<string>;
};

function qrLib(): QrLib {
  const mod = QRCode as unknown as QrLib & { default?: QrLib };
  if (typeof mod.toString === 'function') return mod;
  if (mod.default && typeof mod.default.toString === 'function') return mod.default;
  throw new Error('No se pudo generar el QR');
}

export async function galleryQrDataUrl(url: string, size = 1024): Promise<string> {
  const svg = await qrLib().toString(url, {
    type: 'svg',
    width: size,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#2b2420', light: '#ffffff' },
  });
  return svgToPng(svg, size);
}

function svgToPng(svg: string, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blobUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(blobUrl);
        reject(new Error('No se pudo generar el QR'));
        return;
      }
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(blobUrl);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error('No se pudo generar el QR'));
    };
    img.src = blobUrl;
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
