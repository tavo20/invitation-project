# Prompt para Backend — Party Queue (Node.js + MongoDB)

Necesito que crees el backend para una app de solicitud de canciones en fiestas. Usa Node.js, Express y MongoDB con Mongoose. JWT para auth del DJ.

---

## Modelos (Mongoose Schemas)

### 1. DjUser

```js
{
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true }, // Hashear con bcrypt
}
// timestamps: true
```

### 2. Party

```js
{
  name:    { type: String, required: true },
  code:    { type: String, required: true, unique: true, lowercase: true }, // Slug corto para URL
  dj_id:   { type: ObjectId, ref: 'DjUser', required: true },
  status:  { type: String, enum: ['active', 'paused', 'finished'], default: 'active' },
  config: {
    maxRequestsPerUser: { type: Number, default: 5 },      // 0 = ilimitado
    cooldownMinutes:    { type: Number, default: 2 },       // Minutos entre solicitudes por usuario
    allowDuplicates:    { type: Boolean, default: false },   // ¿Misma canción puede pedirse 2 veces?
  }
}
// timestamps: true
```

### 3. SongRequest

```js
{
  party_id: { type: ObjectId, ref: 'Party', required: true, index: true },
  song: {
    spotifyId:   { type: String, required: true },
    name:        { type: String, required: true },
    artists:     { type: String, required: true },    // "Selena, Marshmello"
    albumName:   { type: String },
    albumImage:  { type: String },                     // URL imagen 300x300
    duration_ms: { type: Number },
    spotifyUri:  { type: String },
    spotifyUrl:  { type: String },
  },
  suggested_by: {
    session_id: { type: String, required: true },      // UUID del invitado (localStorage)
    name:       { type: String, required: true },
    email:      { type: String },
  },
  likes:     { type: Number, default: 0 },
  liked_by:  [{ type: String }],                       // Array de session_ids
  status:    { type: String, enum: ['pending', 'queued', 'playing', 'played', 'rejected'], default: 'pending' },
}
// timestamps: true
```

---

## Rutas

### Auth DJ — `/api/dj`

| Método | Ruta | Auth | Body | Descripción |
|--------|------|------|------|-------------|
| POST | `/api/dj/register` | No | `{ name, email, password }` | Crear cuenta DJ. Hashear password con bcrypt. Devolver `{ success, data: { token, user } }` |
| POST | `/api/dj/login` | No | `{ email, password }` | Login. Comparar hash. Devolver `{ success, data: { token, user } }` |
| GET | `/api/dj/me` | JWT | — | Devolver perfil del DJ logueado |

### Fiestas — `/api/party`

| Método | Ruta | Auth | Body / Params | Descripción |
|--------|------|------|---------------|-------------|
| POST | `/api/party/create` | JWT | `{ name, config? }` | Crear fiesta. Generar `code` automático desde el `name` (slugify). El `dj_id` sale del token JWT |
| GET | `/api/party/my-parties` | JWT | — | Listar fiestas del DJ logueado |
| GET | `/api/party/by-code/:code` | No | `:code` | Obtener fiesta por código. Esto es lo que usan los invitados para entrar |
| PUT | `/api/party/:id/status` | JWT | `{ status }` | Cambiar status: `active`, `paused`, `finished`. Validar que el DJ sea dueño |
| PUT | `/api/party/:id/config` | JWT | `{ maxRequestsPerUser?, cooldownMinutes?, allowDuplicates? }` | Actualizar configuración de límites |

### Solicitudes de canciones — `/api/request`

| Método | Ruta | Auth | Body / Params | Descripción |
|--------|------|------|---------------|-------------|
| POST | `/api/request/create` | No | `{ party_id, song, guest }` | Crear solicitud. Validar: (1) La fiesta existe y está `active`. (2) Si `allowDuplicates` es false, verificar que `song.spotifyId` no exista ya en esa fiesta. (3) Contar solicitudes del `guest.session_id` en esa fiesta y comparar con `maxRequestsPerUser`. (4) Verificar cooldown: que la última solicitud del usuario tenga más de `cooldownMinutes` de antigüedad |
| GET | `/api/request/by-party/:partyId` | No | `:partyId` | Listar todas las solicitudes de una fiesta. Ordenar por `likes` DESC. Esto lo usan tanto invitados como el DJ |
| PUT | `/api/request/:id/like` | No | `{ session_id }` | Toggle like. Si `session_id` ya está en `liked_by`, quitarlo y hacer `likes--`. Si no está, agregarlo y hacer `likes++`. Usar `$addToSet` / `$pull` atómico |
| PUT | `/api/request/:id/status` | JWT | `{ status }` | DJ cambia el status de una solicitud. Validar que el DJ sea dueño de la fiesta. Si el status es `playing`, poner todas las demás que estén en `playing` en esa fiesta en `played` (solo puede haber una sonando) |

### Búsqueda de canciones — `/api/song`

| Método | Ruta | Auth | Query | Descripción |
|--------|------|------|-------|-------------|
| GET | `/api/song/search` | No | `?q=selena&limit=10&offset=0` | Buscar canciones en Spotify. Ya lo tienes implementado |

---

## Validaciones importantes

1. **Al crear solicitud (`POST /api/request/create`)**:
   - Fiesta debe existir y tener `status: 'active'`
   - Si `config.allowDuplicates === false` → no permitir si ya existe un request con el mismo `song.spotifyId` en esa fiesta
   - Si `config.maxRequestsPerUser > 0` → contar requests del `session_id` en esa fiesta, rechazar si ya alcanzó el límite
   - Si `config.cooldownMinutes > 0` → buscar el último request del `session_id`, rechazar si no han pasado los minutos

2. **Al cambiar status a `playing` (`PUT /api/request/:id/status`)**:
   - Automáticamente cambiar cualquier otro request con `status: 'playing'` en esa fiesta a `played`
   - Solo puede haber UNA canción en `playing` por fiesta

3. **Al hacer like (`PUT /api/request/:id/like`)**:
   - Es toggle: si ya dio like → quitar, si no → poner
   - Usar operaciones atómicas de Mongo (`$addToSet`, `$pull`, `$inc`)

---

## Formato de respuestas

Todas las respuestas deben seguir este formato:

```json
// Éxito
{ "success": true, "data": { ... } }

// Error
{ "success": false, "message": "Descripción del error" }
```

---

## Estructura de carpetas sugerida

```
src/
├── models/
│   ├── DjUser.js
│   ├── Party.js
│   └── SongRequest.js
├── routes/
│   ├── dj.routes.js
│   ├── party.routes.js
│   ├── request.routes.js
│   └── song.routes.js
├── middleware/
│   └── auth.js              ← Verificar JWT, setear req.djUser
├── controllers/
│   ├── dj.controller.js
│   ├── party.controller.js
│   ├── request.controller.js
│   └── song.controller.js
└── index.js
```
