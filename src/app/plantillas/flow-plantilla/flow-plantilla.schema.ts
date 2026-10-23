import { TemplateSchema } from '../../editor/editor.models';

const SHOW_SECTION = 'Mostrar esta sección';

/** Campos de Flow que el cliente puede cambiar desde su link de edición. */
export const FLOW_SCHEMA: TemplateSchema = {
  sections: [
    {
      title: 'Pantalla de entrada',
      fields: [
        // showEnvelopeIntro (sobre animado) no se ofrece todavía: lo prendemos nosotros desde el admin
        { key: 'showIntroScreen', type: 'toggle', label: 'Pantalla "Toca para entrar"' },
        { key: 'introText', type: 'text', label: 'Texto de la pantalla de entrada', max: 30 },
        { key: 'autoPlayMusic', type: 'toggle', label: 'La música empieza al entrar', hint: 'La pantalla de entrada no sale en la vista previa: la verás al abrir tu invitación.' },
      ],
    },
    {
      title: 'Portada',
      preview: '.flow-invitation',
      fields: [
        { key: 'names1', type: 'text', label: 'Nombre 1', max: 24 },
        { key: 'names2', type: 'text', label: 'Nombre 2', max: 24 },
        { key: 'invitationText1', type: 'text', label: 'Texto de invitación (línea 1)', max: 60 },
        { key: 'invitationText2', type: 'text', label: 'Texto de invitación (línea 2)', max: 60 },
      ],
    },
    {
      title: 'Fecha',
      preview: '.flow-date',
      fields: [
        { key: 'dayOfWeek', type: 'text', label: 'Día de la semana', placeholder: 'SÁBADO', max: 12 },
        { key: 'dayNumber', type: 'text', label: 'Día', placeholder: '26', max: 2 },
        { key: 'month', type: 'text', label: 'Mes (abreviado)', placeholder: 'NOV', max: 5 },
        { key: 'year', type: 'text', label: 'Año', placeholder: '2030', max: 4 },
        { key: 'hourLabel', type: 'text', label: 'Hora', placeholder: '20:00 HRS.', max: 14 },
        { key: 'weddingDate', type: 'datetime', label: 'Fecha y hora de la boda', hint: 'Se usa para la cuenta regresiva.' },
      ],
    },
    {
      title: 'Música',
      preview: '.card-invitation',
      fields: [
        { key: 'showMusic', type: 'toggle', label: SHOW_SECTION, controlsSection: true },
        { key: 'musicImage', type: 'image', label: 'Foto del reproductor', hint: 'Foto vertical; se recorta desde arriba. JPG o PNG, mínimo 1080 px de ancho.', aspect: '3/4' },
        {
          key: 'audioSrc',
          type: 'audio',
          nameKey: 'songTitle',
          label: 'Canción',
          hint: 'MP3 o M4A, máximo 10 MB y 6 minutos.',
        },
        { key: 'songTitle', type: 'text', label: 'Nombre de la canción', max: 40 },
        { key: 'songArtist', type: 'text', label: 'Artista', max: 40 },
      ],
    },
    {
      title: 'Padres y padrinos',
      preview: '.flow-parents',
      fields: [
        { key: 'showParents', type: 'toggle', label: SHOW_SECTION, controlsSection: true },
        { key: 'parentsTitle', type: 'text', label: 'Título', max: 60 },
        { key: 'brideLabel', type: 'text', label: 'Título de los padres de ella', max: 20 },
        { key: 'brideParents', type: 'textList', label: 'Padres de ella', itemLabel: 'Nombre', max: 40, maxItems: 4, addLabel: 'Agregar nombre' },
        { key: 'groomLabel', type: 'text', label: 'Título de los padres de él', max: 20 },
        { key: 'groomParents', type: 'textList', label: 'Padres de él', itemLabel: 'Nombre', max: 40, maxItems: 4, addLabel: 'Agregar nombre' },
        { key: 'showPadrinos', type: 'toggle', label: 'Mostrar padrinos' },
        { key: 'padrinosLabel', type: 'text', label: 'Título de los padrinos', max: 20 },
        { key: 'padrinos', type: 'textList', label: 'Padrinos', itemLabel: 'Nombre', max: 40, maxItems: 6, addLabel: 'Agregar padrino' },
      ],
    },
    {
      title: 'Cuenta regresiva',
      preview: '.flow-countdown',
      fields: [
        { key: 'showCountdown', type: 'toggle', label: SHOW_SECTION, controlsSection: true },
        { key: 'countdownTitle', type: 'text', label: 'Título', max: 40 },
        { key: 'countdownText', type: 'textarea', label: 'Texto', max: 160 },
      ],
    },
    {
      title: 'Foto intermedia',
      preview: '.flow-image_2',
      fields: [
        { key: 'showImage2', type: 'toggle', label: SHOW_SECTION, controlsSection: true },
        { key: 'image2', type: 'image', label: 'Foto', hint: 'Foto vertical; ocupa todo el ancho. JPG o PNG, mínimo 1080 px de ancho.', aspect: '4/5' },
      ],
    },
    {
      title: 'Ceremonia',
      preview: '.flow-event',
      fields: [
        { key: 'showEvent', type: 'toggle', label: SHOW_SECTION, controlsSection: true },
        { key: 'eventTitle', type: 'text', label: 'Título', max: 30 },
        { key: 'eventVenue', type: 'text', label: 'Lugar', max: 60 },
        { key: 'eventAddress', type: 'text', label: 'Dirección', max: 100 },
        { key: 'eventHour', type: 'text', label: 'Hora', max: 12 },
        { key: 'eventMapLink', type: 'url', label: 'Link de Google Maps', placeholder: 'https://maps.app.goo.gl/…' },
        { key: 'eventButtonText', type: 'text', label: 'Texto del botón', hint: 'Se usa también en el botón de la recepción.', max: 20 },
      ],
    },
    {
      title: 'Recepción',
      preview: '.flow-event--reception',
      fields: [
        { key: 'showReception', type: 'toggle', label: SHOW_SECTION, controlsSection: true },
        { key: 'receptionTitle', type: 'text', label: 'Título', max: 30 },
        { key: 'receptionVenue', type: 'text', label: 'Lugar', max: 60 },
        { key: 'receptionAddress', type: 'text', label: 'Dirección', max: 100 },
        { key: 'receptionHour', type: 'text', label: 'Hora', max: 12 },
        { key: 'receptionMapLink', type: 'url', label: 'Link de Google Maps', placeholder: 'https://maps.app.goo.gl/…' },
      ],
    },
    {
      title: 'Código de vestimenta',
      preview: '.flow-dresscode',
      fields: [
        { key: 'showDressCode', type: 'toggle', label: SHOW_SECTION, controlsSection: true },
        { key: 'dressTitle', type: 'text', label: 'Título', max: 30 },
        { key: 'dressType', type: 'text', label: 'Tipo de vestimenta', max: 40 },
        { key: 'dressNote', type: 'textarea', label: 'Nota', max: 200 },
        { key: 'showDressColors', type: 'toggle', label: 'Mostrar colores sugeridos' },
        { key: 'dressColors', type: 'colors', label: 'Colores sugeridos', maxItems: 6 },
        { key: 'showDressCodeButton', type: 'toggle', label: 'Mostrar botón con más información' },
        { key: 'dressCodeButtonText', type: 'text', label: 'Texto del botón', max: 24 },
        { key: 'dressCodeButtonUrl', type: 'url', label: 'Link del botón', placeholder: 'https://…' },
      ],
    },
    {
      title: 'Frase',
      preview: '.flow-quote-card',
      fields: [
        { key: 'showQuote', type: 'toggle', label: SHOW_SECTION, controlsSection: true },
        { key: 'quoteImage', type: 'image', label: 'Foto', hint: 'Foto cuadrada o vertical. JPG o PNG, mínimo 1080 px de ancho.', aspect: '1/1' },
        { key: 'quote', type: 'textarea', label: 'Frase', max: 260 },
      ],
    },
    {
      title: 'Itinerario',
      preview: '.flow-itinerary',
      fields: [
        { key: 'showItinerary', type: 'toggle', label: SHOW_SECTION, controlsSection: true },
        { key: 'itineraryTitle', type: 'text', label: 'Título', max: 30 },
        {
          key: 'itinerary',
          type: 'list',
          label: 'Momentos',
          itemFields: [
            { key: 'time', label: 'Hora', max: 12 },
            { key: 'label', label: 'Momento', max: 40 },
          ],
          maxItems: 8,
          addLabel: 'Agregar momento',
        },
      ],
    },
    {
      title: 'Confirmación de asistencia',
      preview: '.flow-rsvp',
      fields: [
        { key: 'showRsvp', type: 'toggle', label: SHOW_SECTION, controlsSection: true },
        { key: 'confirmTitle', type: 'text', label: 'Título', max: 40 },
        { key: 'confirmText', type: 'textarea', label: 'Texto', max: 160 },
        { key: 'confirmButtonText', type: 'text', label: 'Texto del botón', max: 24 },
      ],
    },
    {
      title: 'Lluvia de sobres',
      preview: '.flow-sobres',
      fields: [
        { key: 'showSobres', type: 'toggle', label: SHOW_SECTION, controlsSection: true },
        { key: 'sobresTitle', type: 'text', label: 'Título', max: 40 },
      ],
    },
    {
      title: 'Cuenta bancaria',
      preview: '.flow-bank',
      fields: [
        { key: 'showBankAccount', type: 'toggle', label: SHOW_SECTION, controlsSection: true },
        { key: 'bankAccountTitle', type: 'text', label: 'Título', max: 40 },
        { key: 'bankName', type: 'text', label: 'Banco', max: 40 },
        { key: 'bankAccountType', type: 'text', label: 'Tipo de cuenta', placeholder: 'Ahorros', max: 30 },
        { key: 'bankAccountNumber', type: 'text', label: 'Número de cuenta', max: 30 },
        { key: 'bankAccountHolder', type: 'text', label: 'Titular', max: 60 },
        { key: 'bankAccountId', type: 'text', label: 'Cédula o NIT del titular', max: 20 },
        { key: 'showBankButton', type: 'toggle', label: 'Mostrar botón con más información' },
        { key: 'bankButtonText', type: 'text', label: 'Texto del botón', max: 24 },
        { key: 'bankButtonUrl', type: 'url', label: 'Link del botón', placeholder: 'https://…' },
      ],
    },
    {
      title: 'Galería',
      preview: '.flow-gallery',
      fields: [
        { key: 'showGallery', type: 'toggle', label: SHOW_SECTION, controlsSection: true },
        { key: 'galleryImages', type: 'images', label: 'Fotos', hint: 'Fotos verticales; ocupan todo el ancho. JPG o PNG, mínimo 1080 px de ancho.', maxItems: 10 },
      ],
    },
    {
      title: 'Estilo',
      fields: [
        {
          key: 'palette',
          type: 'select',
          label: 'Paleta de colores',
          options: [
            { value: 'forest', label: 'Bosque' },
            { value: 'terracotta', label: 'Terracota' },
            { value: 'sage', label: 'Salvia' },
          ],
        },
      ],
    },
    {
      title: 'Cierre',
      preview: '.flow-closing',
      fields: [
        { key: 'closingHighlight', type: 'textarea', label: 'Mensaje final', max: 300, lineBreaks: true },
        { key: 'closingNames', type: 'text', label: 'Firma', hint: 'Si lo dejas vacío, usamos los nombres de la portada.', max: 60 },
      ],
    },
  ],
};
