# PropList API — Testing Guide

---

## Environment Setup

Open Postman and create a new **Environment** called `PropList`.

Add the following variables:

| Variable   | Initial Value                          | Current Value   |
|------------|----------------------------------------|-----------------|
| `baseUrl`  | `http://localhost:5000/api`            | _(same)_        |
| `token`    | _(leave empty)_                        | _(leave empty)_ |

> **Tip:** After logging in, copy the `access_token` from the response and paste it into the **Current Value** of `token`. All protected requests will then automatically use `Authorization: Bearer {{token}}`.

---

## Auth Flow

Follow these steps before testing any protected endpoint:

**Step 1** — Call `POST {{baseUrl}}/auth/register` to create a new account.

**Step 2** — Call `POST {{baseUrl}}/auth/login` with the same credentials. Copy the `access_token` value from the JSON response.

**Step 3** — In Postman, open your `PropList` environment, find the `token` variable, and paste the copied value into **Current Value**. Click **Save**.

**Step 4** — For every protected request, set the **Authorization** header to:
```
Authorization: Bearer {{token}}
```
Or use the **Auth** tab → **Bearer Token** → `{{token}}`.

---

## Testing Order

Follow this sequence to avoid dependency errors:

1. `POST /auth/register` — create an **owner** account
2. `POST /auth/login` — obtain a JWT, set `{{token}}`
3. `GET /auth/me` — verify session
4. `POST /properties` — create a draft property _(save the returned `_id` as `propertyId`)_
5. `GET /properties` — list published properties (draft won't appear yet)
6. `GET /properties/:id` — view your draft (works because you own it)
7. `PATCH /properties/:id` — edit the draft
8. `POST /properties/:id/images` — upload at least one image _(required before publishing)_
9. `POST /properties/:id/publish` — publish the property
10. `GET /properties` — the property now appears in public results
11. `POST /favorites/:propertyId/toggle` — favorite the published property
12. `GET /favorites` — list your favorites
13. `POST /favorites/:propertyId/toggle` — toggle again to un-favorite
14. _(Login as admin)_ `PATCH /properties/:id/disable` — archive the property
15. `DELETE /properties/:id` — soft-delete the property

---

## AUTH Endpoints

---

### POST /auth/register

**Description:** Creates a new user account with a specified role (`owner`, `user`, or `admin`).

| Field          | Value             |
|----------------|-------------------|
| Auth required  | None              |
| Required role  | —                 |

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "role": "owner"
}
```

**Success Response — `201 Created`:**
```json
{
  "_id": "64a1f2c3e4b5d6f7a8b9c0d1",
  "email": "john.doe@example.com",
  "role": "owner",
  "createdAt": "2024-06-01T08:00:00.000Z",
  "updatedAt": "2024-06-01T08:00:00.000Z"
}
```

**Error Responses:**

| Status | When it occurs |
|--------|----------------|
| `400 Bad Request` | Missing or invalid fields (e.g. invalid email format, password too short) |
| `409 Conflict` | An account with this email already exists |

---

### POST /auth/login

**Description:** Authenticates a user and returns a signed JWT access token.

| Field          | Value |
|----------------|-------|
| Auth required  | None  |
| Required role  | —     |

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Success Response — `200 OK`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NGExZjJjM2U0YjVkNmY3YThiOWMwZDEiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwicm9sZSI6Im93bmVyIiwiaWF0IjoxNzE3MjMwNDAwfQ.abc123"
}
```

**Error Responses:**

| Status | When it occurs |
|--------|----------------|
| `400 Bad Request` | Missing email or password |
| `401 Unauthorized` | Invalid credentials |

---

### GET /auth/me

**Description:** Returns the currently authenticated user's profile (without the password field).

| Field          | Value        |
|----------------|--------------|
| Auth required  | Bearer Token |
| Required role  | —            |

**Request Body:** None

**Success Response — `200 OK`:**
```json
{
  "_id": "64a1f2c3e4b5d6f7a8b9c0d1",
  "email": "john.doe@example.com",
  "role": "owner",
  "createdAt": "2024-06-01T08:00:00.000Z",
  "updatedAt": "2024-06-01T08:00:00.000Z"
}
```

**Error Responses:**

| Status | When it occurs |
|--------|----------------|
| `401 Unauthorized` | No token or invalid/expired token |
| `404 Not Found` | User record deleted from DB after token was issued |

---

## PROPERTIES Endpoints

---

### POST /properties

**Description:** Creates a new property listing in `draft` status, owned by the authenticated user.

| Field          | Value        |
|----------------|--------------|
| Auth required  | Bearer Token |
| Required role  | `owner`      |

**Request Body:**
```json
{
  "title": "Luxury Villa in Bole",
  "description": "A stunning 4-bedroom villa with garden, pool, and mountain views.",
  "location": "Bole, Addis Ababa",
  "price": 450000
}
```

**Success Response — `201 Created`:**
```json
{
  "_id": "64b2e3d4f5c6a7b8c9d0e1f2",
  "title": "Luxury Villa in Bole",
  "description": "A stunning 4-bedroom villa with garden, pool, and mountain views.",
  "location": "Bole, Addis Ababa",
  "price": 450000,
  "images": [],
  "status": "draft",
  "ownerId": "64a1f2c3e4b5d6f7a8b9c0d1",
  "deletedAt": null,
  "createdAt": "2024-06-01T09:00:00.000Z",
  "updatedAt": "2024-06-01T09:00:00.000Z"
}
```

**Error Responses:**

| Status | When it occurs |
|--------|----------------|
| `400 Bad Request` | Missing required fields or failed validation (e.g. price is negative) |
| `401 Unauthorized` | No token or invalid token |
| `403 Forbidden` | Authenticated user does not have the `owner` role |

---

### GET /properties

**Description:** Lists all published, non-deleted properties with optional filtering and pagination.

| Field          | Value |
|----------------|-------|
| Auth required  | None  |
| Required role  | —     |

**Query Params:**

| Param      | Example      | Description                                     |
|------------|--------------|-------------------------------------------------|
| `page`     | `1`          | Page number (default: 1)                        |
| `limit`    | `10`         | Items per page (default: 10, max: 50)           |
| `location` | `Bole`       | Case-insensitive substring match on location    |
| `minPrice` | `100000`     | Minimum price (inclusive)                       |
| `maxPrice` | `500000`     | Maximum price (inclusive)                       |
| `status`   | `published`  | Filter by status (admin only: `draft`/`archived`) |

**Example URL:**
```
GET {{baseUrl}}/properties?page=1&limit=10&location=Bole&minPrice=100000&maxPrice=500000
```

**Success Response — `200 OK`:**
```json
{
  "data": [
    {
      "_id": "64b2e3d4f5c6a7b8c9d0e1f2",
      "title": "Luxury Villa in Bole",
      "description": "A stunning 4-bedroom villa with garden, pool, and mountain views.",
      "location": "Bole, Addis Ababa",
      "price": 450000,
      "images": ["https://res.cloudinary.com/demo/image/upload/v1/proplist/properties/villa1.jpg"],
      "status": "published",
      "ownerId": {
        "_id": "64a1f2c3e4b5d6f7a8b9c0d1",
        "email": "john.doe@example.com"
      },
      "deletedAt": null,
      "createdAt": "2024-06-01T09:00:00.000Z",
      "updatedAt": "2024-06-01T11:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

**Error Responses:**

| Status | When it occurs |
|--------|----------------|
| `400 Bad Request` | Invalid query param types (e.g. `limit=abc`) |

---

### GET /properties/:id

**Description:** Returns a single property by ID; draft properties are only visible to their owner or an admin.

| Field          | Value        |
|----------------|--------------|
| Auth required  | None (optional Bearer Token for draft access) |
| Required role  | — (owner or admin to view drafts) |

**Example URL:**
```
GET {{baseUrl}}/properties/64b2e3d4f5c6a7b8c9d0e1f2
```

**Success Response — `200 OK`:**
```json
{
  "_id": "64b2e3d4f5c6a7b8c9d0e1f2",
  "title": "Luxury Villa in Bole",
  "description": "A stunning 4-bedroom villa with garden, pool, and mountain views.",
  "location": "Bole, Addis Ababa",
  "price": 450000,
  "images": ["https://res.cloudinary.com/demo/image/upload/v1/proplist/properties/villa1.jpg"],
  "status": "published",
  "ownerId": {
    "_id": "64a1f2c3e4b5d6f7a8b9c0d1",
    "email": "john.doe@example.com"
  },
  "deletedAt": null,
  "createdAt": "2024-06-01T09:00:00.000Z",
  "updatedAt": "2024-06-01T11:00:00.000Z"
}
```

**Error Responses:**

| Status | When it occurs |
|--------|----------------|
| `403 Forbidden` | Property is a draft and requester is not the owner or admin |
| `404 Not Found` | Property does not exist or has been soft-deleted |

---

### PATCH /properties/:id

**Description:** Updates editable fields of a draft property owned by the authenticated user.

| Field          | Value        |
|----------------|--------------|
| Auth required  | Bearer Token |
| Required role  | `owner`      |

**Example URL:**
```
PATCH {{baseUrl}}/properties/64b2e3d4f5c6a7b8c9d0e1f2
```

**Request Body** _(all fields optional)_**:**
```json
{
  "title": "Modern Villa in Bole — Updated",
  "price": 480000
}
```

**Success Response — `200 OK`:**
```json
{
  "_id": "64b2e3d4f5c6a7b8c9d0e1f2",
  "title": "Modern Villa in Bole — Updated",
  "description": "A stunning 4-bedroom villa with garden, pool, and mountain views.",
  "location": "Bole, Addis Ababa",
  "price": 480000,
  "images": [],
  "status": "draft",
  "ownerId": "64a1f2c3e4b5d6f7a8b9c0d1",
  "deletedAt": null,
  "createdAt": "2024-06-01T09:00:00.000Z",
  "updatedAt": "2024-06-01T10:30:00.000Z"
}
```

**Error Responses:**

| Status | When it occurs |
|--------|----------------|
| `400 Bad Request` | Invalid field values |
| `401 Unauthorized` | No or invalid token |
| `403 Forbidden` | Requester is not the property owner |
| `404 Not Found` | Property does not exist or is soft-deleted |

---

### POST /properties/:id/publish

**Description:** Transitions a draft property to `published` status after validating all required fields and images are present.

| Field          | Value        |
|----------------|--------------|
| Auth required  | Bearer Token |
| Required role  | `owner`      |

**Example URL:**
```
POST {{baseUrl}}/properties/64b2e3d4f5c6a7b8c9d0e1f2/publish
```

**Request Body:** None

**Success Response — `200 OK`:**
```json
{
  "_id": "64b2e3d4f5c6a7b8c9d0e1f2",
  "title": "Modern Villa in Bole — Updated",
  "description": "A stunning 4-bedroom villa with garden, pool, and mountain views.",
  "location": "Bole, Addis Ababa",
  "price": 480000,
  "images": ["https://res.cloudinary.com/demo/image/upload/v1/proplist/properties/villa1.jpg"],
  "status": "published",
  "ownerId": "64a1f2c3e4b5d6f7a8b9c0d1",
  "deletedAt": null,
  "createdAt": "2024-06-01T09:00:00.000Z",
  "updatedAt": "2024-06-01T11:00:00.000Z"
}
```

**Error Responses:**

| Status | When it occurs |
|--------|----------------|
| `400 Bad Request` | Property is not in `draft` status |
| `400 Bad Request` | One or more required fields are missing (e.g. `images` is empty) |
| `401 Unauthorized` | No or invalid token |
| `403 Forbidden` | Requester is not the property owner |
| `404 Not Found` | Property does not exist or is soft-deleted |
| `409 Conflict` | Another concurrent request already published this property |

---

### POST /properties/:id/images

**Description:** Uploads a single image file to Cloudinary and appends its URL to the property's `images` array.

| Field          | Value        |
|----------------|--------------|
| Auth required  | Bearer Token |
| Required role  | `owner`      |

**Example URL:**
```
POST {{baseUrl}}/properties/64b2e3d4f5c6a7b8c9d0e1f2/images
```

**Request Body:** `multipart/form-data`

| Field  | Type   | Description                    |
|--------|--------|--------------------------------|
| `file` | File   | Image file (JPEG, PNG, or WebP, max 5MB) |

> **In Postman:** Go to **Body** → **form-data** → add a key named `file`, change type to **File**, and select your image.

**Success Response — `200 OK`:**
```json
{
  "_id": "64b2e3d4f5c6a7b8c9d0e1f2",
  "title": "Modern Villa in Bole — Updated",
  "images": [
    "https://res.cloudinary.com/demo/image/upload/v1/proplist/properties/villa1.jpg"
  ],
  "status": "draft",
  "ownerId": "64a1f2c3e4b5d6f7a8b9c0d1",
  "deletedAt": null
}
```

**Error Responses:**

| Status | When it occurs |
|--------|----------------|
| `400 Bad Request` | File type not allowed (must be JPEG, PNG, or WebP) |
| `400 Bad Request` | File exceeds 5MB size limit |
| `400 Bad Request` | Property is already `published` (images locked) |
| `401 Unauthorized` | No or invalid token |
| `403 Forbidden` | Requester is not the property owner |
| `404 Not Found` | Property does not exist or is soft-deleted |

---

### PATCH /properties/:id/disable

**Description:** Allows an admin to archive (disable) a property, setting its status to `archived`.

| Field          | Value        |
|----------------|--------------|
| Auth required  | Bearer Token |
| Required role  | `admin`      |

**Example URL:**
```
PATCH {{baseUrl}}/properties/64b2e3d4f5c6a7b8c9d0e1f2/disable
```

**Request Body:** None

**Success Response — `200 OK`:**
```json
{
  "_id": "64b2e3d4f5c6a7b8c9d0e1f2",
  "title": "Modern Villa in Bole — Updated",
  "status": "archived",
  "ownerId": "64a1f2c3e4b5d6f7a8b9c0d1",
  "deletedAt": null,
  "updatedAt": "2024-06-02T08:00:00.000Z"
}
```

**Error Responses:**

| Status | When it occurs |
|--------|----------------|
| `401 Unauthorized` | No or invalid token |
| `403 Forbidden` | Authenticated user does not have the `admin` role |
| `404 Not Found` | Property does not exist or is already soft-deleted |

---

### DELETE /properties/:id

**Description:** Soft-deletes a property by setting `deletedAt` to the current timestamp; the record is excluded from all future queries.

| Field          | Value        |
|----------------|--------------|
| Auth required  | Bearer Token |
| Required role  | `owner` or `admin` |

**Example URL:**
```
DELETE {{baseUrl}}/properties/64b2e3d4f5c6a7b8c9d0e1f2
```

**Request Body:** None

**Success Response — `200 OK`:**
```json
{
  "message": "Property deleted"
}
```

**Error Responses:**

| Status | When it occurs |
|--------|----------------|
| `401 Unauthorized` | No or invalid token |
| `403 Forbidden` | User has `owner` role but does not own this property |
| `403 Forbidden` | User role is not `owner` or `admin` |
| `404 Not Found` | Property does not exist or is already soft-deleted |

---

## FAVORITES Endpoints

---

### POST /favorites/:propertyId/toggle

**Description:** Toggles the authenticated user's favorite on a published property — favorites it if not already saved, un-favorites it if it is.

| Field          | Value        |
|----------------|--------------|
| Auth required  | Bearer Token |
| Required role  | — (any authenticated user) |

**Example URL:**
```
POST {{baseUrl}}/favorites/64b2e3d4f5c6a7b8c9d0e1f2/toggle
```

**Request Body:** None

**Success Response — `201 Created` (favorited):**
```json
{
  "favorited": true
}
```

**Success Response — `201 Created` (un-favorited):**
```json
{
  "favorited": false
}
```

**Error Responses:**

| Status | When it occurs |
|--------|----------------|
| `401 Unauthorized` | No or invalid token |
| `404 Not Found` | Property does not exist, is not published, or has been soft-deleted |

---

### GET /favorites

**Description:** Returns a paginated list of the authenticated user's favorited published properties.

| Field          | Value        |
|----------------|--------------|
| Auth required  | Bearer Token |
| Required role  | — (any authenticated user) |

**Query Params:**

| Param   | Example | Description                        |
|---------|---------|------------------------------------|
| `page`  | `1`     | Page number (default: 1)           |
| `limit` | `10`    | Items per page (default: 10)       |

**Example URL:**
```
GET {{baseUrl}}/favorites?page=1&limit=10
```

**Success Response — `200 OK`:**
```json
{
  "data": [
    {
      "_id": "64c3f4e5a6b7c8d9e0f1a2b3",
      "userId": "64a1f2c3e4b5d6f7a8b9c0d1",
      "propertyId": {
        "_id": "64b2e3d4f5c6a7b8c9d0e1f2",
        "title": "Modern Villa in Bole — Updated",
        "description": "A stunning 4-bedroom villa with garden, pool, and mountain views.",
        "location": "Bole, Addis Ababa",
        "price": 480000,
        "images": ["https://res.cloudinary.com/demo/image/upload/v1/proplist/properties/villa1.jpg"],
        "status": "published"
      },
      "createdAt": "2024-06-01T12:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

> **Note:** Favorites for properties that have since been archived or soft-deleted are automatically filtered out from the response — `propertyId` will be `null` in the raw Mongoose result and those entries are excluded.

**Error Responses:**

| Status | When it occurs |
|--------|----------------|
| `401 Unauthorized` | No or invalid token |
