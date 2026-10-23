import { EditableTemplate } from './editor.models';
import { NeblinaComponent, NEBLINA_DEFAULT_DATA } from '../plantillas/neblina/neblina.component';
import { NEBLINA_SCHEMA } from '../plantillas/neblina/neblina.schema';
import { FlowPlantillaComponent, FLOW_DEFAULT_DATA } from '../plantillas/flow-plantilla/flow-plantilla.component';
import { FLOW_SCHEMA } from '../plantillas/flow-plantilla/flow-plantilla.schema';

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
  // Flow: en `home` se registra como "xyz"
  xyz: {
    component: FlowPlantillaComponent,
    schema: FLOW_SCHEMA,
    // vacío: la plantilla firma con los nombres de la portada
    defaults: { ...FLOW_DEFAULT_DATA, closingNames: '' },
    // la pantalla de entrada taparía la invitación en la vista previa
    previewOverrides: { showIntroScreen: false, showEnvelopeIntro: false },
  },
};
