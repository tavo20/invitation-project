# Plan de Mesas y Puestos — InvitApp

## Resumen

Funcionalidad para que los clientes puedan organizar a sus invitados confirmados en mesas con puestos asignados, todo desde un panel visual dentro de la app.

---

## Lo que ya existe

| Componente | Ruta / Archivo | Descripción |
|---|---|---|
| **ConfirmationDocument** | `shared/services/confirmation.service.ts` | Modelo de invitado: `_id`, `names`, `numero_confirmados`, `status`, `id_invitacion` |
| **Lista de confirmaciones** | `confirmation/confirmations-list/` | Panel para ver, crear, editar y eliminar invitados |
| **Backend API** | `api/invitation-confirmation` | CRUD completo de confirmaciones |
| **MainService** | `shared/services/main.service.ts` | Obtiene datos de invitación por slug o ID |

---

## Modelo de datos (Backend)

### Colección: `mesas`

```json
{
  "_id": "ObjectId",
  "id_invitacion": "string",
  "nombre": "Mesa 1",
  "capacidad": 8,
  "forma": "redonda | rectangular",
  "posicion_x": 0,
  "posicion_y": 0,
  "puestos": [
    {
      "numero": 1,
      "confirmation_id": "ObjectId | null",
      "nombre_invitado": "string | null"
    },
    {
      "numero": 2,
      "confirmation_id": null,
      "nombre_invitado": null
    }
  ],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Alternativa: campo en ConfirmationDocument

Agregar a cada confirmación:

```json
{
  "mesa_id": "ObjectId | null",
  "puesto": 3
}
```

> **Recomendación**: Usar la colección `mesas` con el array `puestos` embebido. Es más fácil de consultar y renderizar visualmente.

---

## Endpoints del Backend

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/mesas/:id_invitacion` | Listar todas las mesas de una invitación |
| `POST` | `/api/mesas/create` | Crear una mesa nueva |
| `PUT` | `/api/mesas/update/:id` | Editar mesa (nombre, capacidad, posición) |
| `DELETE` | `/api/mesas/delete/:id` | Eliminar una mesa |
| `PUT` | `/api/mesas/assign` | Asignar invitado a un puesto (`{ mesa_id, puesto, confirmation_id }`) |
| `PUT` | `/api/mesas/unassign` | Desasignar invitado de un puesto (`{ mesa_id, puesto }`) |

---

## Frontend — Componentes

### 1. Ruta nueva

```
/invitation/seating/:id
```

Agregar en `app.routes.ts`:

```typescript
{
  path: 'invitation/seating/:id',
  loadComponent: () =>
    import('./seating/seating.component')
      .then(m => m.SeatingComponent)
}
```

### 2. SeatingService (`shared/services/seating.service.ts`)

```typescript
@Injectable({ providedIn: 'root' })
export class SeatingService {
  private readonly API = environment.apiUrl + 'api/mesas';

  getMesas(invitationId: string): Observable<Mesa[]>;
  createMesa(data: CreateMesaPayload): Observable<Mesa>;
  updateMesa(id: string, data: Partial<Mesa>): Observable<Mesa>;
  deleteMesa(id: string): Observable<void>;
  assignGuest(mesaId: string, puesto: number, confirmationId: string): Observable<void>;
  unassignGuest(mesaId: string, puesto: number): Observable<void>;
}
```

### 3. SeatingComponent (`seating/seating.component.ts`)

**Vista principal** con dos zonas:

```
┌─────────────────────────────────────────────────┐
│  Panel de Mesas y Puestos                       │
│                                                 │
│  ┌──────────────────────┐  ┌──────────────────┐ │
│  │                      │  │ Invitados sin    │ │
│  │   Zona visual de     │  │ mesa asignada    │ │
│  │   mesas (drag&drop)  │  │                  │ │
│  │                      │  │ • Juan (2)       │ │
│  │   ┌───┐    ┌───┐    │  │ • Maria (3)      │ │
│  │   │ 1 │    │ 2 │    │  │ • Pedro (1)      │ │
│  │   └───┘    └───┘    │  │ • Ana (2)        │ │
│  │                      │  │                  │ │
│  │   ┌───┐    ┌───┐    │  │ [Crear mesa +]   │ │
│  │   │ 3 │    │ 4 │    │  │                  │ │
│  │   └───┘    └───┘    │  │                  │ │
│  │                      │  │                  │ │
│  └──────────────────────┘  └──────────────────┘ │
│                                                 │
│  Resumen: 4 mesas | 32 puestos | 24 asignados  │
└─────────────────────────────────────────────────┘
```

### 4. Funcionalidades del panel

- **Crear mesa**: Modal con nombre, forma (redonda/rectangular), número de puestos
- **Editar mesa**: Click en mesa → cambiar nombre, agregar/quitar puestos
- **Eliminar mesa**: Con confirmación, desasigna invitados primero
- **Drag & drop**: Arrastrar invitado de la lista lateral a un puesto de la mesa
- **Desasignar**: Click en puesto ocupado → opción de quitar invitado
- **Resumen en tiempo real**: Total mesas, puestos ocupados/libres, invitados sin mesa

---

## Dependencias

| Paquete | Para qué |
|---|---|
| `@angular/cdk` | Módulo `DragDropModule` para arrastrar invitados a puestos |

> Ya debería estar instalado. Si no: `npm install @angular/cdk`

---

## Plan de implementación paso a paso

| # | Tarea | Archivos |
|---|---|---|
| 1 | Crear endpoints de mesas en el backend (Node/Express + Mongoose) | Backend repo |
| 2 | Crear `SeatingService` | `shared/services/seating.service.ts` |
| 3 | Crear interfaces `Mesa`, `Puesto`, `CreateMesaPayload` | `shared/models/mesa.model.ts` |
| 4 | Crear `SeatingComponent` con layout de dos columnas | `seating/seating.component.ts/html/scss` |
| 5 | Implementar lista lateral de invitados confirmados sin mesa | Dentro de `SeatingComponent` |
| 6 | Implementar vista visual de mesas (círculos/rectángulos con puestos) | Dentro de `SeatingComponent` |
| 7 | Implementar drag & drop con `@angular/cdk/drag-drop` | Dentro de `SeatingComponent` |
| 8 | Agregar ruta en `app.routes.ts` | `app.routes.ts` |
| 9 | Agregar link desde `confirmations-list` al panel de mesas | `confirmations-list.component.html` |
| 10 | Estilos responsive para móvil (lista vertical en vez de 2 columnas) | `seating.component.scss` |

---

## Vista visual de una mesa (ejemplo CSS)

### Mesa redonda con 8 puestos

```
        [1]
     [8]    [2]
   [7]  Mesa  [3]
     [6]    [4]
        [5]
```

Cada puesto es un `div` posicionado con `transform: rotate(Xdeg) translateY(-Rpx)` alrededor del centro de la mesa.

### Mesa rectangular con 10 puestos

```
  [1] [2] [3] [4] [5]
  ┌─────────────────┐
  │     Mesa 3      │
  └─────────────────┘
  [6] [7] [8] [9] [10]
```

---

## Flujo del usuario

```
1. Cliente abre la lista de confirmaciones
2. Ve botón "Organizar mesas" → navega a /invitation/seating/:id
3. Crea mesas con nombre y número de puestos
4. Ve la lista de invitados confirmados a la derecha
5. Arrastra invitados a los puestos de las mesas
6. Cada cambio se guarda automáticamente (o con botón "Guardar")
7. Puede imprimir/exportar el plano de mesas
```

---

## Consideraciones

- Un invitado con `numero_confirmados: 3` puede necesitar 3 puestos (o 1 puesto representando al grupo)
- Decidir si se asigna **por grupo** (1 confirmación = 1 puesto grupal) o **por persona** (1 confirmación de 3 = 3 puestos individuales)
- Solo invitados con `status: 'confirmado'` deberían aparecer en la lista de asignación
- Responsive: en móvil la vista visual de mesas puede ser scroll horizontal
