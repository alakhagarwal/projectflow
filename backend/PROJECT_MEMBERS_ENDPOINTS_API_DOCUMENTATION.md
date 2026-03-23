# Project Members Endpoints API Documentation

This document covers both project-member endpoints:

1. `POST /proj/{projectId}/members` (add a member)
2. `GET /proj/{projectId}/members` (fetch members)

Implementation references:
- `src/main/java/com/projectmanagement/project_management_system/Controller/ProjectController.java`
- `src/main/java/com/projectmanagement/project_management_system/Service/ProjectService.java`
- `src/main/java/com/projectmanagement/project_management_system/Configuration/SecurityConfig.java`

---

## Common Security and Authentication

- All project endpoints are protected by Spring Security (`anyRequest().authenticated()`).
- You must send a valid JWT bearer token.

Example header:

```http
Authorization: Bearer <your_jwt_token>
```

If token is missing/invalid/expired, request is rejected before controller logic.

---

## 1) Add Project Member

### Endpoint

- **Method:** `POST`
- **URL:** `/proj/{projectId}/members`
- **Auth required:** Yes (JWT)
- **Success status:** `201 Created`
- **Content-Type:** `application/json`

### Who Can Call

Requester must be one of:
- `ADMIN` in the organization that owns the project, or
- `LEAD` in that same project

Additional rule:
- Assigning `projectRole = LEAD` is allowed **only** for organization `ADMIN`.

### Path Params

| Param | Type | Required | Description |
|---|---|---|---|
| `projectId` | Long | Yes | Target project id |

### Request Body (`AddProjectMemberRequestDTO`)

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | String | Yes | User email to add |
| `projectRole` | Enum (`MEMBER`, `LEAD`) | No | Defaults to `MEMBER` when omitted |

Validation:
- `email` must not be blank
- `email` must be a valid email format

### Business Rules

- Target user must exist.
- Target user must be an `ACTIVE` member of the same organization as the project.
- Target user must not already be a member of the project.
- If `projectRole` is omitted, backend assigns `MEMBER`.

### Success Response (`ProjectMemberResponseDTO`)

```json
{
  "projectId": 12,
  "projectName": "Website Revamp",
  "userId": 34,
  "userEmail": "jane.doe@example.com",
  "memberName": "Jane Doe",
  "projectRole": "MEMBER"
}
```

### Error Cases

- `400 Bad Request`
  - Validation failed (`email` blank/invalid)
  - `User is not a member of this organization`
  - `User must be an active member of the organization`
  - `User is already a member of this project`
- `403 Forbidden`
  - `Only organization admins or project leads can add members to a project`
  - `Only organization admins can assign LEAD role`
- `404 Not Found`
  - Requester user not found
  - Project not found
  - Target user not found

---

## 2) Fetch Project Members

### Endpoint

- **Method:** `GET`
- **URL:** `/proj/{projectId}/members`
- **Auth required:** Yes (JWT)
- **Success status:** `200 OK`

### Who Can Call

- Caller must already be a member of that project.

Current service check:
- `existsByUserIdAndProjectId(requestedById, projectId)` must be true.

### Path Params

| Param | Type | Required | Description |
|---|---|---|---|
| `projectId` | Long | Yes | Target project id |

### Success Response

Returns `List<ProjectMemberResponseDTO>`.

Example:

```json
[
  {
    "projectId": 12,
    "projectName": "Website Revamp",
    "userId": 11,
    "userEmail": "lead@example.com",
    "memberName": "Project Lead",
    "projectRole": "LEAD"
  },
  {
    "projectId": 12,
    "projectName": "Website Revamp",
    "userId": 34,
    "userEmail": "jane.doe@example.com",
    "memberName": "Jane Doe",
    "projectRole": "MEMBER"
  }
]
```

### Error Cases

- `403 Forbidden`
  - `You are not a member of this project`
- `404 Not Found`
  - Requester user not found
  - Project not found

---

## Response Model Reference (`ProjectMemberResponseDTO`)

| Field | Type | Description |
|---|---|---|
| `projectId` | Long | Project id |
| `projectName` | String | Project name |
| `userId` | Long | Member user id |
| `userEmail` | String | Member email |
| `memberName` | String | `firstName + lastName` (trimmed) |
| `projectRole` | Enum (`LEAD`, `MEMBER`) | Member role in project |

---

## Quick cURL Examples

### Add member

```bash
curl -X POST "http://localhost:8080/proj/12/members" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.doe@example.com",
    "projectRole": "MEMBER"
  }'
```

### Fetch members

```bash
curl -X GET "http://localhost:8080/proj/12/members" \
  -H "Authorization: Bearer <your_jwt_token>"
```

---

## Notes for Frontend

- For add-member flow, handle `400`, `403`, and `404` separately.
- For fetch-members flow, `403` means caller is authenticated but not part of this project.
- Do not assume all org members can fetch project members; current rule is project-members-only access.

