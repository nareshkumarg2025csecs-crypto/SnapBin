# REST API Reference — SnapBin

Base URL: `http://localhost:3001/api` (or `/api` via Nginx reverse proxy)
Swagger UI: `http://localhost:3001/api/docs`

## Endpoints Summary

| Method | Endpoint | Description | Query / Body Params | Headers |
|---|---|---|---|---|
| `POST` | `/api/pastes` | Create a new paste | `{ title?, content, language?, expiration?, visibility?, burnAfterRead? }` | None |
| `GET` | `/api/pastes/:id` | Retrieve single paste | `id` parameter | None |
| `GET` | `/api/pastes` | List public pastes | `?page=1&limit=20&sort=newest` | None |
| `DELETE` | `/api/pastes/:id` | Delete a paste | `id` parameter | `X-Delete-Token: <token>` |
| `GET` | `/api/health` | Service health check | None | None |
