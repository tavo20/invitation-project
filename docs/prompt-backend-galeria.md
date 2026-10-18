# Prompt para Backend — Galería de fotos y videos del evento (Node.js + MongoDB + Cloudflare R2)

Necesito que agregues al backend actual (Node.js, Express, MongoDB con Mongoose) una galería tipo Instagram para los eventos. Los invitados suben fotos y videos desde el celular sin hacer login, ven el feed y dan likes. El anfitrión modera y descarga el álbum completo.

La galería se asocia a una **invitación** (`id_invitacion`), igual que las mesas (`/api/mesa/by-invitation/:id`).

Todas las respuestas siguen el formato que ya usamos:

```js
{ success: true, data: <payload> }
{ success: false, message: 'Texto del error' }
```

---

## Arquitectura de subida (importante)

**Los archivos NUNCA pasan por este backend.** El navegador los sube directo a Cloudflare R2 con URLs prefirmadas. El backend solo firma las URLs y guarda los metadatos en Mongo.

```
Front ──(1) POST /upload-url ──────────▶ Backend   valida galería abierta, tipo, tamaño, límite por invitado
Front ◀─(2) [{ key, uploadUrl }] ─────── Backend
Front ──(3) PUT archivo ───────────────▶ R2        directo, con el Content-Type firmado
Front ──(4) POST /posts { media keys } ─▶ Backend  verifica que los keys existen en R2 y guarda el post
```

El front ya comprime las fotos (WebP ~2000px) y genera las miniaturas (WebP 400px), incluida la portada de cada video. El backend no procesa imágenes ni videos.

---

## Dependencias

```bash
npm i @aws-sdk/client-s3 @aws-sdk/s3-request-presigner archiver express-rate-limit bcrypt uuid
```

(`bcrypt` y `uuid` probablemente ya estén instalados).

## Variables de entorno

```env
R2_ACCOUNT_ID=xxxxxxxx
R2_ACCESS_KEY_ID=xxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxx
R2_BUCKET=invitaciones-media
R2_PUBLIC_URL=https://media.tudominio.com   # dominio público del bucket, sin "/" al final
```

## Cliente R2

```js
// config/r2.js
const { S3Client } = require('@aws-sdk/client-s3');

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

module.exports = { r2, BUCKET: process.env.R2_BUCKET, PUBLIC_URL: process.env.R2_PUBLIC_URL };
```

---

## Modelos (Mongoose Schemas)

### 1. Gallery

```js
{
  id_invitacion:      { type: String, required: true, unique: true, index: true },
  status:             { type: String, enum: ['open', 'closed'], default: 'open' },
  requireApproval:    { type: Boolean, default: false },  // true → los posts nuevos quedan 'pending'
  maxUploadsPerGuest: { type: Number, default: 30 },      // máx. archivos por session_id (0 = ilimitado)
  hostTokenHash:      { type: String, required: true },   // bcrypt del hostToken, nunca el token en claro
}
// timestamps: true
```

### 2. GalleryPost

```js
{
  id_invitacion: { type: String, required: true, index: true },
  author: {
    session_id: { type: String, required: true, index: true }, // UUID del invitado (localStorage)
    name:       { type: String, required: true, maxlength: 60 },
  },
  caption: { type: String, maxlength: 500, default: '' },
  media: [{
    key:      { type: String, required: true },   // archivo principal en R2
    thumbKey: { type: String, required: true },   // miniatura WebP (en video es la portada)
    type:     { type: String, enum: ['image', 'video'], required: true },
    width:    { type: Number },
    height:   { type: Number },
    duration: { type: Number },                   // segundos, solo video
    size:     { type: Number },                   // bytes del archivo principal
  }],
  likes:    { type: Number, default: 0 },
  liked_by: [{ type: String }],                   // session_ids
  status:   { type: String, enum: ['visible', 'pending', 'hidden'], default: 'visible' },
}
// timestamps: true
// Índice compuesto: { id_invitacion: 1, status: 1, createdAt: -1 }
```

---

## Límites y validaciones

| Regla | Valor |
|-------|-------|
| Tipos de imagen permitidos | `image/webp`, `image/jpeg`, `image/png`, `image/heic` |
| Tipos de video permitidos | `video/mp4`, `video/quicktime`, `video/webm` |
| Tamaño máx. imagen | 15 MB |
| Tamaño máx. video | 100 MB |
| Duración máx. video | 60 s (la reporta el front en `duration`) |
| Tamaño máx. miniatura | 1 MB, `image/webp` o `image/jpeg` |
| Archivos por post | 1 a 10 (sin contar miniaturas) |
| Subidas por invitado | `gallery.maxUploadsPerGuest` (se cuentan los `media` de sus posts) |
| Vencimiento de la URL prefirmada | 10 minutos |

Guardar estos límites en un objeto `GALLERY_LIMITS` y devolverlos en `GET /by-invitation/:id` para que el front valide antes de subir.

---

## Rutas — Invitado (sin auth, se identifica con `session_id`)

### `GET /api/galeria/by-invitation/:id`

Configuración pública de la galería. **No devolver nunca `hostTokenHash`.**

```js
// 200
{ success: true, data: {
  id_invitacion: 'abc123',
  status: 'open',
  requireApproval: false,
  limits: { maxImageMB: 15, maxVideoMB: 100, maxVideoSeconds: 60, maxFilesPerPost: 10, maxUploadsPerGuest: 30 }
}}
// 404 si la invitación no tiene galería
```

### `POST /api/galeria/:id/upload-url`

Genera las URLs prefirmadas para subir a R2.

```js
// Body
{
  session_id: 'uuid-del-invitado',
  files: [
    { kind: 'image', contentType: 'image/webp', size: 412000 },
    { kind: 'thumb', contentType: 'image/webp', size: 38000 },
    { kind: 'video', contentType: 'video/mp4',  size: 48000000 },
    { kind: 'thumb', contentType: 'image/webp', size: 41000 }
  ]
}

// 200 — en el mismo orden que `files`
{ success: true, data: [
  { key: 'galeria/abc123/2f1c...e9.webp', uploadUrl: 'https://...r2.cloudflarestorage.com/...' },
  ...
]}
```

Lógica:
1. Buscar la galería; si no existe → 404. Si `status !== 'open'` → 403 `"La galería está cerrada"`.
2. Validar cada archivo contra los límites (tipo y tamaño según `kind`) → 400 con mensaje claro.
3. Contar los archivos que ya subió ese `session_id` (suma de `media.length` de sus posts) más los nuevos (`kind !== 'thumb'`). Si se pasa de `maxUploadsPerGuest` → 429 `"Llegaste al límite de subidas"`.
4. Generar `key = galeria/{id_invitacion}/{uuidv4()}.{ext}` (ext según el contentType).
5. Firmar con `PutObjectCommand({ Bucket, Key, ContentType, ContentLength: size })` y `getSignedUrl(r2, cmd, { expiresIn: 600 })`. Al firmar `ContentType` y `ContentLength`, el invitado no puede subir otro tipo de archivo ni uno más grande.

### `POST /api/galeria/:id/posts`

Crea el post una vez que los archivos ya están en R2.

```js
// Body
{
  session_id: 'uuid-del-invitado',
  author_name: 'Tía Carmen',
  caption: '¡Qué bonita boda! 💍',
  media: [
    { key: 'galeria/abc123/2f1c.webp', thumbKey: 'galeria/abc123/88aa.webp', type: 'image', width: 2000, height: 1500 },
    { key: 'galeria/abc123/91bd.mp4',  thumbKey: 'galeria/abc123/c3d0.webp', type: 'video', width: 1080, height: 1920, duration: 24 }
  ]
}

// 201
{ success: true, data: <GalleryPost serializado> }
```

Lógica:
1. Galería abierta (si no → 403).
2. Validar que `media` tenga 1–10 elementos y que cada `key`/`thumbKey` empiece con `galeria/{id_invitacion}/`. Si no → 400. Así nadie puede apuntar a archivos de otra galería.
3. Verificar con `HeadObjectCommand` que cada key existe en R2 (en paralelo) y guardar `size` desde `ContentLength`. Si alguno no existe → 400 `"Algún archivo no terminó de subirse"`.
4. Si es video y `duration > 60` → 400.
5. `status = gallery.requireApproval ? 'pending' : 'visible'`.
6. Devolver el post serializado (ver **Serialización** abajo).

### `GET /api/galeria/:id/posts`

Feed paginado.

```
?limit=20             (máx. 50)
&cursor=<_id>         paginación hacia atrás: posts con _id < cursor
&after=<ISO date>     solo posts creados después de esa fecha (el front lo consulta cada ~10 s para traer los nuevos)
&session_id=<uuid>    para marcar `liked` e incluir los posts 'pending' propios
```

```js
// 200
{ success: true, data: {
  items: [ <GalleryPost serializado>, ... ],   // orden createdAt desc
  nextCursor: '665f...' | null
}}
```

Filtro: `{ id_invitacion, $or: [ { status: 'visible' }, { status: 'pending', 'author.session_id': session_id } ] }`.
Si la galería está `closed`, el feed **se sigue viendo** (solo se bloquean las subidas).

### `POST /api/galeria/posts/:postId/like`

Alterna el like (si no lo tenía lo pone, si lo tenía lo quita).

```js
// Body
{ session_id: 'uuid' }
// 200
{ success: true, data: { likes: 12, liked: true } }
```

Hacerlo atómico con `findOneAndUpdate`:
- Para dar like: `{ _id, liked_by: { $ne: sid } }` → `{ $addToSet: { liked_by: sid }, $inc: { likes: 1 } }`
- Si no encontró nada, quitar el like: `{ _id, liked_by: sid }` → `{ $pull: { liked_by: sid }, $inc: { likes: -1 } }`

### `DELETE /api/galeria/posts/:postId`

El invitado borra **su propio** post.

```js
// Body
{ session_id: 'uuid' }
// 200
{ success: true, data: null }
// 403 si author.session_id !== session_id
```

Borrar también de R2 todos los `key` y `thumbKey` del post (`DeleteObjectsCommand`).

---

## Rutas — Anfitrión (header `X-Host-Token`)

### Middleware `requireHostToken`

```js
// Lee req.headers['x-host-token'] (o req.query.token solo en /download)
// Busca la Gallery por :id (o por el id_invitacion del post en rutas /posts/:postId)
// bcrypt.compare(token, gallery.hostTokenHash) → si falla 401 "Token de anfitrión inválido"
// Deja req.gallery disponible
```

### `POST /api/galeria/create`

Crea la galería de una invitación. Genera el `hostToken` y lo devuelve **solo esta vez**.

```js
// Body
{ id_invitacion: 'abc123', requireApproval?: false, maxUploadsPerGuest?: 30 }
// 201
{ success: true, data: {
  gallery: { id_invitacion, status, requireApproval, maxUploadsPerGuest },
  hostToken: 'k3J9...'   // crypto.randomBytes(24).toString('base64url')
}}
// 409 si ya existe una galería para esa invitación
```

Guardar `hostTokenHash = await bcrypt.hash(hostToken, 10)`.
El front arma el link del anfitrión como `/invitation/galeria/abc123/admin?token=k3J9...`.

### `POST /api/galeria/:id/regenerate-token` (auth anfitrión)

Por si el link del anfitrión se filtra. Genera un token nuevo, invalida el anterior y lo devuelve una vez.

### `GET /api/galeria/:id/admin` (auth anfitrión)

```js
{ success: true, data: {
  gallery: { id_invitacion, status, requireApproval, maxUploadsPerGuest, createdAt },
  stats: { posts: 84, images: 210, videos: 17, pending: 3, hidden: 2, guests: 41, totalBytes: 3221225472 }
}}
```

`stats` se calcula con un `aggregate` sobre `GalleryPost` (`$unwind: '$media'`, sumando `media.size`, y `$addToSet` de `author.session_id` para contar los invitados).

### `PUT /api/galeria/:id/config` (auth anfitrión)

```js
// Body (todos opcionales)
{ status: 'open' | 'closed', requireApproval: true, maxUploadsPerGuest: 50 }
// 200
{ success: true, data: <gallery pública> }
```

### `GET /api/galeria/:id/admin/posts` (auth anfitrión)

Igual que el feed pero sin filtrar por estado.

```
?status=pending|visible|hidden   (opcional, sin él trae todos)
&cursor=<_id>&limit=30
```

### `PUT /api/galeria/posts/:postId/status` (auth anfitrión)

```js
// Body
{ status: 'visible' | 'hidden' }
// 200
{ success: true, data: <GalleryPost serializado> }
```

### `DELETE /api/galeria/admin/posts/:postId` (auth anfitrión)

Borra cualquier post y sus archivos en R2.

### `GET /api/galeria/:id/download?token=<hostToken>` (auth anfitrión por query)

Descarga el álbum completo en ZIP. El token va en la query porque es un link de descarga normal del navegador y no puede mandar headers.

```js
res.setHeader('Content-Type', 'application/zip');
res.setHeader('Content-Disposition', `attachment; filename="album-${id}.zip"`);

const archive = archiver('zip', { zlib: { level: 0 } }); // level 0: las fotos y videos ya están comprimidos
archive.pipe(res);

// Recorrer con un cursor de Mongo, sin cargar todo en memoria:
// GalleryPost.find({ id_invitacion, status: 'visible' }).sort({ createdAt: 1 }).cursor()
// Por cada media: GetObjectCommand → archive.append(Body, { name })
// name: `${String(n).padStart(4,'0')}_${slug(author.name)}.${ext}`  ej. 0001_tia-carmen.webp
// Agregar los archivos de uno en uno (await al 'entry' o usar una cola) para no abrir cientos de streams a la vez.

await archive.finalize();
```

Como el ZIP se va enviando mientras se arma, empiezan a salir datos enseguida y Heroku no corta la conexión por su límite de 30 s.

---

## Serialización del post

No exponer `liked_by` completo (es una lista de session_ids). Transformar así:

```js
function serializePost(post, sessionId) {
  return {
    _id: post._id,
    author: { name: post.author.name, isMine: post.author.session_id === sessionId },
    caption: post.caption,
    media: post.media.map(m => ({
      type: m.type,
      url: `${PUBLIC_URL}/${m.key}`,
      thumbUrl: `${PUBLIC_URL}/${m.thumbKey}`,
      width: m.width, height: m.height, duration: m.duration,
    })),
    likes: post.likes,
    liked: !!sessionId && post.liked_by.includes(sessionId),
    status: post.status,
    createdAt: post.createdAt,
  };
}
```

---

## Protección contra abuso

Con `express-rate-limit`, por IP:

| Ruta | Límite |
|------|--------|
| `POST /:id/upload-url` | 30 / 10 min |
| `POST /:id/posts` | 20 / 10 min |
| `POST /posts/:postId/like` | 120 / min |
| Rutas de anfitrión | 60 / min |

En Heroku activar `app.set('trust proxy', 1)` para que tome la IP real.

---

## Configuración de Cloudflare R2 (una sola vez)

1. **Crear el bucket** `invitaciones-media`.
2. **Dominio público**: Settings → Custom Domains → `media.tudominio.com`. Así Cloudflare cachea las imágenes y videos y no se paga por la descarga de datos.
3. **API Token**: R2 → Manage API Tokens → permiso *Object Read & Write* solo para ese bucket. De ahí salen `R2_ACCESS_KEY_ID` y `R2_SECRET_ACCESS_KEY`.
4. **CORS del bucket** (Settings → CORS Policy):

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:4200",
      "https://<tu-proyecto>.web.app",
      "https://<tu-dominio-vercel>"
    ],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["Content-Type", "Content-Length"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

5. **Regla de borrado automático** (Settings → Object lifecycle rules): borrar los objetos con prefijo `galeria/` a los **180 días**. Opcionalmente, un cron que borre en Mongo los `GalleryPost` de más de 180 días para que no queden posts apuntando a archivos inexistentes.

---

## Resumen de rutas

| Método | Ruta | Auth |
|--------|------|------|
| GET | `/api/galeria/by-invitation/:id` | — |
| POST | `/api/galeria/:id/upload-url` | session_id |
| POST | `/api/galeria/:id/posts` | session_id |
| GET | `/api/galeria/:id/posts` | — |
| POST | `/api/galeria/posts/:postId/like` | session_id |
| DELETE | `/api/galeria/posts/:postId` | session_id (autor) |
| POST | `/api/galeria/create` | — |
| POST | `/api/galeria/:id/regenerate-token` | X-Host-Token |
| GET | `/api/galeria/:id/admin` | X-Host-Token |
| PUT | `/api/galeria/:id/config` | X-Host-Token |
| GET | `/api/galeria/:id/admin/posts` | X-Host-Token |
| PUT | `/api/galeria/posts/:postId/status` | X-Host-Token |
| DELETE | `/api/galeria/admin/posts/:postId` | X-Host-Token |
| GET | `/api/galeria/:id/download?token=` | token en query |

## Orden sugerido de implementación

1. Modelos, cliente R2 y `POST /create`, `GET /by-invitation/:id`.
2. `upload-url`, `posts` (crear y feed) y `like`: con esto el invitado ya puede usar la galería.
3. Middleware de anfitrión, `admin`, `config`, moderación y borrado.
4. Descarga en ZIP, rate limits y regla de borrado automático en R2.
