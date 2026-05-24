# AI Article Generator API Endpoints

This document outlines the available REST API endpoints exposed by the NestJS backend. All endpoints (except login and register) require authentication via `HttpOnly` cookies. Ensure that your frontend Axios client is configured with `withCredentials: true`.

## Authentication ( `/auth` )

| Method | Endpoint | Description | Payload |
|--------|----------|-------------|---------|
| `POST` | `/auth/register` | Create a new user account | `{ email, password, firstName, lastName }` |
| `POST` | `/auth/login` | Authenticate and receive cookies | `{ email, password }` |
| `POST` | `/auth/refresh` | Refresh an expired access token | *None (uses HttpOnly refreshToken cookie)* |
| `POST` | `/auth/logout` | Clear auth cookies | *None* |

## Users ( `/users` )

| Method | Endpoint | Description | Payload |
|--------|----------|-------------|---------|
| `GET` | `/users/me` | Get the currently authenticated user | *None* |
| `PATCH` | `/users/me` | Update the current user's profile | `{ firstName?, lastName? }` |

## Organizations ( `/organizations` )

| Method | Endpoint | Description | Payload |
|--------|----------|-------------|---------|
| `GET` | `/organizations` | List organizations the user belongs to | *None* |
| `POST` | `/organizations` | Create a new organization | `{ name, slug }` |

## Uploads ( `/uploads` )

| Method | Endpoint | Description | Payload |
|--------|----------|-------------|---------|
| `POST` | `/uploads` | Upload a raw document for processing | `multipart/form-data` with field `file` (Max 10MB, `.docx`) |

## Jobs ( `/jobs` )

| Method | Endpoint | Description | Payload |
|--------|----------|-------------|---------|
| `GET` | `/jobs/:id` | Get the status of an extraction job | *None* |

## Drafts ( `/drafts` )

| Method | Endpoint | Description | Payload |
|--------|----------|-------------|---------|
| `GET` | `/drafts` | List all article drafts | Query params: `cursor?`, `limit?`, `status?` |
| `GET` | `/drafts/:id` | Get the details of a specific draft | *None* |
| `PATCH` | `/drafts/:id` | Update a draft's content | `{ title?, hook?, structuredContent?, status? }` |
| `GET` | `/drafts/:id/revisions` | List historical revisions of a draft | *None* |

---

### Security Note
Authentication is entirely handled via cookies. You do not need to manually attach an `Authorization` header on the frontend. Just make sure to handle 401 errors by calling `/auth/refresh` and retrying the failed requests.
