# Endpoints del API

Base URL: /api/medicamentos

| Método | Ruta  | Descripción      | Respuesta OK |
|--------|-------|------------------|--------------|
| GET    | /     | Lista todos      | 200          |
| POST   | /     | Crea uno         | 201          |
| PUT    | /{id} | Actualiza por ID | 200          |
| DELETE | /{id} | Elimina por ID   | 204          |

## Errores posibles
- 400 Bad Request — datos inválidos (nombre vacío, stock negativo, etc.)
- 404 Not Found   — el ID no existe (PUT o DELETE)
- 409 Conflict    — nombre + laboratorio ya registrado