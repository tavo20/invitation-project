import { Type } from '@angular/core';

// ============================================================
// Esquema de una plantilla: qué campos puede editar el cliente
// ============================================================

interface BaseField {
  /** Misma key que usa la plantilla en `invitationData`. */
  key: string;
  label: string;
  hint?: string;
}

export interface TextField extends BaseField {
  type: 'text' | 'textarea' | 'url';
  max?: number;
  placeholder?: string;
}

/** Fecha y hora; se guarda como "2027-06-12T16:30:00" (hora local). */
export interface DateTimeField extends BaseField {
  type: 'datetime';
}

export interface ToggleField extends BaseField {
  type: 'toggle';
  /** Si está apagado, el editor esconde los campos que vienen después en la sección. */
  controlsSection?: boolean;
}

export interface SelectField extends BaseField {
  type: 'select';
  options: { value: string; label: string }[];
}

export interface ImageField extends BaseField {
  type: 'image';
  /** Proporción sugerida para la vista previa del campo, ej. '3/4'. */
  aspect?: string;
}

/** Canción de la invitación: MP3 o M4A, se sube tal cual. */
export interface AudioField extends BaseField {
  type: 'audio';
  /** Key donde se guarda el nombre del archivo, para mostrarlo en el editor. */
  nameKey: string;
}

export interface ImagesField extends BaseField {
  type: 'images';
  maxItems: number;
}

export interface ColorsField extends BaseField {
  type: 'colors';
  maxItems: number;
}

/** Lista de objetos con campos de texto, ej. el itinerario. */
export interface ListField extends BaseField {
  type: 'list';
  itemFields: { key: string; label: string; max?: number }[];
  maxItems: number;
  addLabel: string;
}

export type EditorField =
  | TextField
  | DateTimeField
  | ToggleField
  | SelectField
  | ImageField
  | AudioField
  | ImagesField
  | ColorsField
  | ListField;

export interface EditorSection {
  title: string;
  /** Selector CSS de esa parte en la plantilla; la vista previa baja hasta ahí al abrir la sección. */
  preview?: string;
  fields: EditorField[];
}

export interface TemplateSchema {
  sections: EditorSection[];
}

/** Lo que el editor necesita de cada plantilla editable. */
export interface EditableTemplate {
  component: Type<unknown>;
  schema: TemplateSchema;
  /** Valores con los que arranca un campo que la invitación todavía no tiene. */
  defaults: Record<string, unknown>;
}

// ============================================================
// API del editor (header X-Edit-Token)
// ============================================================

export interface EditorInvitation {
  id_invitation: string;
  slug: string;
  template: string;
  data: Record<string, unknown>;
  hasDraft: boolean;
  published_at: string | null;
  updatedAt?: string;
}

export interface EditorUploadTarget {
  key: string;
  uploadUrl: string;
  publicUrl: string;
}
