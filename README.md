# Gazella - Media Service #

Este repositorio contiene el servicio de gestión de archivos multimedia del sistema Gazella

## Stack tecnologico ##

* Node.js + TypeScript
* Express.js
* MinIO Object Storage
* RabbitMQ
* Multer

## Ejecutando el proyecto ##

Cree un archivo .env con la siguiente estructura:

```text
PORT=3003

MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=password123
MINIO_BUCKET_NAME=gazella-media
MINIO_PUBLIC_ENDPOINT=localhost

RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
```

Una vez definidas las variables de entorno levante los contenedores:

```bash
docker compose up --build
```

## Servicios disponibles ##

### Media Service ###

```text
http://localhost:3003
```

### MinIO Console ###

```text
http://localhost:9001
```

Credenciales por defecto:

```text
Usuario: admin
Password: password123
```

### RabbitMQ Management ###

```text
http://localhost:15672
```

Credenciales por defecto:

```text
Usuario: guest
Password: guest
```

## Endpoints ##

### Health Check ###

```http
GET /health
```

Respuesta:

```json
{
  "status": "OK",
  "service": "MediaService",
  "minioBucket": "gazella-media"
}
```

---

### Subir archivo ###

```http
POST /api/media/upload
```

Content-Type:

```text
multipart/form-data
```

Parámetros:

| Campo | Tipo    |
|---    |---      |
| file  | Archivo |

Ejemplo usando curl:

```bash
curl -X POST http://localhost:3003/api/media/upload \
  -F "file=@imagen.png"
```

Respuesta exitosa:

```json
{
  "message": "File uploaded successfully",
  "url": "http://localhost:9000/gazella-media/imagen.png"
}
```

---

### Eliminar archivo ###

```http
DELETE /api/media/:fileName
```

Ejemplo:

```bash
curl -X DELETE http://localhost:3003/api/media/imagen.png
```

Respuesta:

```json
{
  "message": "File imagen.png deleted successfully"
}
```

## Eventos RabbitMQ ##

El servicio publica eventos en RabbitMQ utilizando el exchange:

```text
gazella_exchange
```

### Evento de subida ###

Routing key:

```text
media.uploaded
```

Payload:

```json
{
  "url": "http://localhost:9000/gazella-media/file.png",
  "originalName": "file.png",
  "size": 12345,
  "mimetype": "image/png",
  "timestamp": "2026-05-07T00:00:00.000Z"
}
```

### Evento de eliminación ###

Routing key:

```text
media.deleted
```

Payload:

```json
{
  "fileName": "file.png",
  "timestamp": "2026-05-07T00:00:00.000Z"
}
```

## Scripts disponibles ##

### Desarrollo ###

```bash
npm run dev
```

### Build ###

```bash
npm run build
```

### Producción ###

```bash
npm start
```

## Estructura del proyecto ##

```text
src/
├── controllers/
├── messaging/
├── middlewares/
├── routes/
├── services/
└── index.ts
```

## Flujo general del servicio ##

1. El cliente sube un archivo mediante HTTP
2. Multer procesa el multipart/form-data
3. El archivo es almacenado en MinIO
4. El servicio publica un evento en RabbitMQ
5. Otros microservicios pueden consumir dichos eventos
