# Add Project Member API Documentation

## Endpoint Overview
This API endpoint adds a user to an existing project.

The endpoint is already implemented in:
- `src/main/java/com/projectmanagement/project_management_system/Controller/ProjectController.java`
- `src/main/java/com/projectmanagement/project_management_system/Service/ProjectService.java`

A member can be added only when all business rules pass:
- the requester is authenticated
- the requester is either an **organization admin** or a **project lead**
- the target user exists
- the target user is an **ACTIVE** member of the same organization as the project
- the target user is not already a member of the project
- if `projectRole` is `LEAD`, only an **organization admin** can assign it

---

## Endpoint Details

**Method:** `POST`  
**URL:** `/proj/{projectId}/members`  
**Authentication:** Required (JWT Bearer Token)  
**Authorization:**
- Organization `ADMIN`, or
- Project `LEAD`

**Content-Type:** `application/json`

---

## Authentication

Include the JWT token in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token>
```

All routes except a few public auth/invite routes require authentication in `SecurityConfig`, so this endpoint is protected.

---

## Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | Long | Yes | ID of the project to which the member will be added |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | String | Yes | Email of the user to add to the project |
| `projectRole` | Enum (`LEAD`, `MEMBER`) | No | Role to assign in the project. Defaults to `MEMBER` if omitted |

### Validation Rules

- `email` must not be blank
- `email` must be a valid email address
- `projectRole` is optional
- if `projectRole` is omitted, the service assigns `MEMBER`

### Example Request

```http
POST /proj/12/members
Content-Type: application/json
Authorization: Bearer <your_jwt_token>
```

```json
{
  "email": "jane.doe@example.com",
  "projectRole": "MEMBER"
}
```

### Example Request Without Role

```json
{
  "email": "jane.doe@example.com"
}
```

In this case, the backend assigns:

```json
"projectRole": "MEMBER"
```

---

## Business Rules Enforced by the Service

### Who can add a member?
The authenticated user must satisfy at least one of these conditions:
- be an `ADMIN` in the organization that owns the project, or
- be a `LEAD` in the target project

Otherwise the request is rejected.

### Who can be added?
The target user:
- must exist in the system
- must be an `ACTIVE` member of the project's organization
- must not already be a member of the same project

### Role Assignment Rules
- `MEMBER` can be assigned by eligible requesters
- `LEAD` can be assigned **only** by an organization admin
- if a project lead tries to assign `LEAD`, the request is rejected with `403 Forbidden`

---

## Response

### Success Response (`201 Created`)

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

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `projectId` | Long | ID of the project |
| `projectName` | String | Name of the project |
| `userId` | Long | ID of the added user |
| `userEmail` | String | Email of the added user |
| `memberName` | String | Full name of the added user (`firstName + lastName`) |
| `projectRole` | Enum | Assigned role in the project |

### Enum Values

**ProjectRole**
- `LEAD`
- `MEMBER`

---

## Error Responses

## `400 Bad Request`

### Scenario 1: Validation failed
Returned by the global validation handler when request body fields are invalid.

```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": {
    "email": "Email is required"
  }
}
```

Possible validation messages:
- `Email is required`
- `Email must be valid`

### Scenario 2: Target user is not an active member of the organization

```json
{
  "status": 400,
  "message": "User must be an active member of the organization"
}
```

### Scenario 3: User is already a member of this project

```json
{
  "status": 400,
  "message": "User is already a member of this project"
}
```

---

## `401 Unauthorized`

### Scenario: Missing or invalid JWT token
This endpoint is protected by Spring Security. If the JWT token is missing, expired, or invalid, the request will be rejected before controller logic runs.

> Note: the exact response body for authentication failures depends on the configured security filter behavior.

---

## `403 Forbidden`

### Scenario 1: Requester is neither org admin nor project lead

```json
{
  "status": 403,
  "message": "Only organization admins or project leads can add members to a project"
}
```

### Scenario 2: Requester tries to assign `LEAD` without org admin privileges

```json
{
  "status": 403,
  "message": "Only organization admins can assign LEAD role"
}
```

---

## `404 Not Found`

### Scenario 1: Authenticated user not found

```json
{
  "status": 404,
  "message": "User not found with email: 'requester@example.com'"
}
```

### Scenario 2: Project not found

```json
{
  "status": 404,
  "message": "Project not found with id: '12'"
}
```

### Scenario 3: Target user not found

```json
{
  "status": 404,
  "message": "User not found with email: 'jane.doe@example.com'"
}
```

---

## cURL Example

```bash
curl -X POST "http://localhost:8080/proj/12/members" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.doe@example.com",
    "projectRole": "MEMBER"
  }'
```

---

## Frontend Notes

- Send `projectRole` only when you want to explicitly control the role
- If you do not send `projectRole`, the backend will store `MEMBER`
- Handle `403` separately because it can mean either:
  - requester lacks permission to add members, or
  - requester attempted to assign `LEAD` without org admin access
- Handle `400` separately for validation vs business-rule failures

---

## Implementation Reference

### Controller
`ProjectController#addMemberToProject`
- Accepts `projectId`
- Accepts `AddProjectMemberRequestDTO`
- Reads authenticated user from `@AuthenticationPrincipal`
- Returns `201 Created`

### Service
`ProjectService#addMemberToProject`
- validates requester
- loads project
- checks requester permission
- loads target user
- verifies active organization membership
- prevents duplicate membership
- applies default role
- restricts `LEAD` assignment
- saves `ProjectMember`
- returns `ProjectMemberResponseDTO`

