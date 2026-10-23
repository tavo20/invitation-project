import { TemplateSchema } from '../../editor/editor.models';

/** Campos de Neblina que el cliente puede cambiar desde su link de edición. */
export const NEBLINA_SCHEMA: TemplateSchema = {
  sections: [
    {
      title: 'Portada',
      fields: [
        { key: 'heroImage', type: 'image', label: 'Foto principal', hint: 'Mejor una foto vertical de los dos.', aspect: '3/4' },
        { key: 'names1', type: 'text', label: 'Nombre 1', max: 24 },
        { key: 'names2', type: 'text', label: 'Nombre 2', max: 24 },
        { key: 'inicial_1', type: 'text', label: 'Inicial 1', max: 2 },
        { key: 'inicial_2', type: 'text', label: 'Inicial 2', max: 2 },
        { key: 'date', type: 'text', label: 'Fecha en la portada', hint: 'Así se ve escrita, ej. 12 · 06 · 2027', max: 30 },
        { key: 'location', type: 'text', label: 'Ciudad o lugar', max: 50 },
        { key: 'countdownDate', type: 'datetime', label: 'Fecha y hora de la boda', hint: 'Se usa para la cuenta regresiva.' },
      ],
    },
    {
      title: 'Frase y fecha',
      fields: [
        { key: 'quote', type: 'textarea', label: 'Frase', max: 260 },
        { key: 'saveDateText', type: 'text', label: 'Texto de "Save the date"', hint: 'Ej. 12 DE JUN DEL 2027', max: 30 },
      ],
    },
    {
      title: 'Padres y padrinos',
      fields: [
        { key: 'showParents', type: 'toggle', label: 'Mostrar esta sección' },
        { key: 'parentsTitle', type: 'text', label: 'Título', max: 60 },
        { key: 'brideLabel', type: 'text', label: 'Título de los padres de ella', max: 20 },
        { key: 'brideParent1', type: 'text', label: 'Padre o madre de ella', max: 40 },
        { key: 'brideParent2', type: 'text', label: 'Padre o madre de ella', max: 40 },
        { key: 'groomLabel', type: 'text', label: 'Título de los padres de él', max: 20 },
        { key: 'groomParent1', type: 'text', label: 'Padre o madre de él', max: 40 },
        { key: 'groomParent2', type: 'text', label: 'Padre o madre de él', max: 40 },
        { key: 'padrinosLabel', type: 'text', label: 'Título de los padrinos', max: 20 },
        { key: 'padrino1', type: 'text', label: 'Padrino o madrina', max: 40 },
        { key: 'padrino2', type: 'text', label: 'Padrino o madrina', max: 40 },
      ],
    },
    {
      title: 'Nuestra historia',
      fields: [
        { key: 'storyTitle', type: 'text', label: 'Título', max: 40 },
        { key: 'storyText1', type: 'textarea', label: 'Primer párrafo', max: 500 },
        { key: 'storyText2', type: 'textarea', label: 'Segundo párrafo', max: 500 },
        { key: 'storyImages', type: 'images', label: 'Fotos del carrusel', maxItems: 6 },
      ],
    },
    {
      title: 'Itinerario',
      fields: [
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
      title: 'Ceremonia',
      fields: [
        { key: 'ceremonyTitle', type: 'text', label: 'Título', max: 30 },
        { key: 'ceremonyTime', type: 'text', label: 'Hora', max: 12 },
        { key: 'ceremonyPlace', type: 'text', label: 'Lugar', max: 60 },
        { key: 'ceremonyAddress', type: 'text', label: 'Dirección', max: 100 },
        { key: 'ceremonyMapLink', type: 'url', label: 'Link de Google Maps', placeholder: 'https://maps.app.goo.gl/…' },
        { key: 'ceremonyButton', type: 'text', label: 'Texto del botón', max: 20 },
      ],
    },
    {
      title: 'Código de vestimenta',
      fields: [
        { key: 'dressTitle', type: 'text', label: 'Título', max: 30 },
        { key: 'dressType', type: 'text', label: 'Tipo de vestimenta', max: 40 },
        { key: 'dressNote', type: 'textarea', label: 'Nota', max: 200 },
        { key: 'dressColors', type: 'colors', label: 'Colores sugeridos', maxItems: 6 },
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
            { value: 'mist', label: 'Niebla' },
            { value: 'dusk', label: 'Atardecer' },
            { value: 'rose', label: 'Rosa' },
            { value: 'forest', label: 'Bosque' },
          ],
        },
      ],
    },
    {
      title: 'Cierre',
      fields: [
        { key: 'giftTitle', type: 'text', label: 'Título de regalos', max: 40 },
        { key: 'finalMessage', type: 'textarea', label: 'Mensaje final', max: 300 },
      ],
    },
  ],
};
