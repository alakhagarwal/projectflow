# Create Task API Documentation

## Endpoint Overview
This API endpoint allows authenticated users to create a new task within a project.

---

## 📋 Endpoint Details

**Method:** `POST`  
**URL:** `/task/create/{projectId}`  
**Authentication:** Required (JWT Token)  
**Content-Type:** `application/json`

---

## 🔐 Authentication

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📥 Request

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | Long | Yes | The ID of the project where the task will be created |

### Request Body

```json
{
  "title": "string",
  "description": "string",
  "assignedToEmail": "string",
  "taskType": "string",
  "taskPriority": "string",
  "taskStatus": "string",
  "dueDate": "YYYY-MM-DD"
}
```

### Field Details

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `title` | String | Yes | 3-200 characters | The task title |
| `description` | String | Yes | 10-2000 characters | Detailed description of the task |
| `assignedToEmail` | String | Yes | Valid email format | Email of the user to whom the task is assigned (must be a project member) |
| `taskType` | String (Enum) | Yes | Must be valid TaskType | Type of task |
| `taskPriority` | String (Enum) | Yes | Must be valid TaskPriority | Priority level of the task |
| `taskStatus` | String (Enum) | Yes | Must be valid TaskStatus | Current status of the task |
| `dueDate` | String (Date) | No | ISO 8601 format (YYYY-MM-DD), must be in future | Task deadline |

### Enum Values

**TaskType:**
- `FEATURE`
- `BUG`
- `TASK`
- `IMPROVEMENT`
- `OTHER`

**TaskPriority:**
- `LOW`
- `MEDIUM`
- `HIGH`

**TaskStatus:**
- `TO_DO`
- `IN_PROGRESS`
- `DONE`

---

## 📤 Response

### Success Response (201 Created)

```json
{
  "id": 1,
  "title": "Implement login feature",
  "description": "Create a secure login system with JWT authentication",
  "projectId": 5,
  "projectName": "E-commerce Platform",
  "assignedToEmail": "developer@example.com",
  "assignedToName": "John Doe",
  "createdByEmail": "manager@example.com",
  "createdByName": "Jane Smith",
  "taskType": "FEATURE",
  "taskPriority": "HIGH",
  "taskStatus": "TO_DO",
  "dueDate": "2026-02-15",
  "createdAt": "2026-02-01T10:30:00Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Unique identifier for the created task |
| `title` | String | Task title |
| `description` | String | Task description |
| `projectId` | Long | ID of the project |
| `projectName` | String | Name of the project |
| `assignedToEmail` | String | Email of assigned user |
| `assignedToName` | String | Full name of assigned user |
| `createdByEmail` | String | Email of task creator |
| `createdByName` | String | Full name of task creator |
| `taskType` | String | Type of task |
| `taskPriority` | String | Priority level |
| `taskStatus` | String | Current status |
| `dueDate` | String | Due date (can be null) |
| `createdAt` | String | ISO 8601 timestamp of creation |

---

## ⚠️ Error Responses

### 400 Bad Request - Validation Error

**Scenario:** Invalid input data

```json
{
  "timestamp": "2026-02-01T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": [
    "Title must be between 3 and 200 characters",
    "Description must be between 10 and 2000 characters",
    "Invalid email format",
    "Due date must be in the future"
  ]
}
```

### 401 Unauthorized

**Scenario:** Missing or invalid JWT token

```json
{
  "timestamp": "2026-02-01T10:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden

**Scenario:** User is not a member of the project

```json
{
  "timestamp": "2026-02-01T10:30:00Z",
  "status": 403,
  "error": "Forbidden",
  "message": "You are not a member of this project"
}
```

### 404 Not Found

**Scenario 1:** Project not found

```json
{
  "timestamp": "2026-02-01T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Project with id '999' not found"
}
```

**Scenario 2:** Assigned user not found

```json
{
  "timestamp": "2026-02-01T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "User with email 'nonexistent@example.com' not found"
}
```

### 400 Bad Request - Business Logic Error

**Scenario:** Assigned user is not a project member

```json
{
  "timestamp": "2026-02-01T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Assigned user is not a member of this project"
}
```

---

## 💡 Frontend Implementation Examples

### JavaScript (Fetch API)

```javascript
const createTask = async (projectId, taskData, token) => {
  try {
    const response = await fetch(`/task/create/${projectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(taskData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const createdTask = await response.json();
    return createdTask;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Usage
const taskData = {
  title: "Implement login feature",
  description: "Create a secure login system with JWT authentication",
  assignedToEmail: "developer@example.com",
  taskType: "FEATURE",
  taskPriority: "HIGH",
  taskStatus: "TO_DO",
  dueDate: "2026-02-15"
};

createTask(5, taskData, 'your_jwt_token_here')
  .then(task => console.log('Task created:', task))
  .catch(error => console.error('Failed to create task:', error));
```

### JavaScript (Axios)

```javascript
import axios from 'axios';

const createTask = async (projectId, taskData, token) => {
  try {
    const response = await axios.post(
      `/task/create/${projectId}`,
      taskData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.message);
    } else if (error.request) {
      // Request made but no response
      throw new Error('No response from server');
    } else {
      // Something else happened
      throw new Error(error.message);
    }
  }
};
```

### TypeScript Interface

```typescript
// Request interface
interface CreateTaskRequest {
  title: string;
  description: string;
  assignedToEmail: string;
  taskType: 'FEATURE' | 'BUG' | 'TASK' | 'IMPROVEMENT' | 'OTHER';
  taskPriority: 'LOW' | 'MEDIUM' | 'HIGH';
  taskStatus: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
  dueDate?: string; // ISO 8601 format (YYYY-MM-DD)
}

// Response interface
interface TaskResponse {
  id: number;
  title: string;
  description: string;
  projectId: number;
  projectName: string;
  assignedToEmail: string;
  assignedToName: string;
  createdByEmail: string;
  createdByName: string;
  taskType: string;
  taskPriority: string;
  taskStatus: string;
  dueDate: string | null;
  createdAt: string;
}

// API function
const createTask = async (
  projectId: number,
  taskData: CreateTaskRequest,
  token: string
): Promise<TaskResponse> => {
  const response = await fetch(`/task/create/${projectId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(taskData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create task');
  }

  return await response.json();
};
```

---

## 🧪 Testing

### cURL Command

```bash
curl -X POST "http://localhost:8080/task/create/5" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Implement login feature",
    "description": "Create a secure login system with JWT authentication",
    "assignedToEmail": "developer@example.com",
    "taskType": "FEATURE",
    "taskPriority": "HIGH",
    "taskStatus": "TO_DO",
    "dueDate": "2026-02-15"
  }'
```

### Postman Collection

1. **Method:** POST
2. **URL:** `{{baseUrl}}/task/create/5`
3. **Headers:**
   - `Content-Type: application/json`
   - `Authorization: Bearer {{jwtToken}}`
4. **Body (raw JSON):**
```json
{
  "title": "Implement login feature",
  "description": "Create a secure login system with JWT authentication",
  "assignedToEmail": "developer@example.com",
  "taskType": "FEATURE",
  "taskPriority": "HIGH",
  "taskStatus": "TO_DO",
  "dueDate": "2026-02-15"
}
```

---

## 📝 Important Notes

1. **Authentication Required:** All requests must include a valid JWT token
2. **Project Membership:** The authenticated user must be a member of the project
3. **Assigned User Validation:** The assigned user must also be a member of the same project
4. **Due Date:** Must be in the future if provided
5. **Character Limits:** 
   - Title: 3-200 characters
   - Description: 10-2000 characters
6. **Email Format:** Must be a valid email address
7. **Enum Values:** Use exact case-sensitive enum values (e.g., "HIGH", not "high")

---

## 🔄 Workflow

1. User fills out the task creation form
2. Frontend validates input (client-side validation)
3. Frontend sends POST request with JWT token
4. Backend validates:
   - JWT token authenticity
   - User is project member
   - Assigned user exists and is project member
   - Input data validation
5. Backend creates task in database
6. Backend returns created task with 201 status
7. Frontend displays success message and redirects/updates UI

---

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Missing/invalid token | Ensure JWT token is included in Authorization header |
| 403 Forbidden | User not project member | Verify user has access to the project |
| 404 Not Found | Invalid project/user ID | Verify project exists and assigned user email is correct |
| 400 Bad Request | Validation failure | Check all required fields and validation rules |
| 400 Bad Request | Assigned user not in project | Ensure assigned user is a member of the project |

---

## 📞 Support

For questions or issues, please contact the backend team or refer to the main API documentation.

**Backend Base URL:** `http://localhost:8080` (Development)

**API Version:** 1.0

**Last Updated:** February 1, 2026
