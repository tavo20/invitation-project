import { EditableTemplate } from './editor.models';
import { NeblinaComponent, NEBLINA_DEFAULT_DATA } from '../plantillas/neblina/neblina.component';
import { NEBLINA_SCHEMA } from '../plantillas/neblina/neblina.schema';

/**
 * Plantillas que el cliente puede editar con su link, por el nombre que tienen en `template`.
 * Para sumar una plantilla: escribe su `*.schema.ts` y agrégala aquí.
 */
export const EDITABLE_TEMPLATES: Record<string, EditableTemplate> = {
  neblina: {
    component: NeblinaComponent,
    schema: NEBLINA_SCHEMA,
    defaults: { ...NEBLINA_DEFAULT_DATA },
  },
};
