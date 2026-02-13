# Project GetAll Endpoint - Frontend Implementation Guide

## 📌 Quick Summary

This document provides all the information needed to implement the **`GET /proj/getAll`** endpoint on the frontend.

---

## 🔗 Endpoint Information

| Property | Value |
|----------|-------|
| **Method** | GET |
| **URL** | `/proj/getAll/{organizationId}` |
| **Base URL** | `http://localhost:8080` |
| **Full URL** | `http://localhost:8080/proj/getAll/{organizationId}` |
| **Authentication** | Not Required (Optional) |
| **Content-Type** | `application/json` |

---

## 🔐 Authentication

### Optional Header
```
Authorization: Bearer <JWT_TOKEN>
```

**Note:** This endpoint does not require authentication, but you can include it if you want to track which user is accessing it.

---

## 📤 Request Details

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `organizationId` | Number | ✅ Yes | The organization ID to fetch projects from |

### Example Request

```javascript
// Basic fetch without authentication
fetch('http://localhost:8080/proj/getAll/1', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

```javascript
// With authentication (if needed)
fetch('http://localhost:8080/proj/getAll/1', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

---

## 📥 Response Body

### Success Response (HTTP 200 OK)

The endpoint returns an **array of project objects**:

```json
[
  {
    "id": 1,
    "name": "Website Redesign 2026",
    "description": "Complete redesign of company website with new UI/UX",
    "organizationId": 1,
    "createdByEmail": "john.doe@company.com",
    "teamLeadEmail": "jane.smith@company.com",
    "projectStatus": "ACTIVE",
    "projectPriority": "HIGH",
    "startDate": "2026-02-15",
    "endDate": "2026-08-31"
  },
  {
    "id": 2,
    "name": "Mobile App Development",
    "description": "Native iOS and Android mobile application",
    "organizationId": 1,
    "createdByEmail": "alice.johnson@company.com",
    "teamLeadEmail": "bob.williams@company.com",
    "projectStatus": "PLANNING",
    "projectPriority": "MEDIUM",
    "startDate": "2026-03-01",
    "endDate": "2026-12-31"
  }
]
```

### Response Field Specifications

| Field | Type | Description |
|-------|------|-------------|
| `id` | Number | Unique project identifier |
| `name` | String | Name of the project |
| `description` | String | Project description |
| `organizationId` | Number | The organization this project belongs to |
| `createdByEmail` | String | Email of the user who created the project |
| `teamLeadEmail` | String | Email of the team lead assigned to the project |
| `projectStatus` | String (Enum) | Current status of the project (see enum values below) |
| `projectPriority` | String (Enum) | Priority level of the project (see enum values below) |
| `startDate` | String (Date) | Project start date in format `YYYY-MM-DD` |
| `endDate` | String (Date) | Project end date in format `YYYY-MM-DD` |

### Enum Values

#### ProjectStatus
```
PLANNING
ACTIVE
COMPLETED
ON_HOLD
CANCELLED
```

#### ProjectPriority
```
LOW
MEDIUM
HIGH
```

### Empty Response (HTTP 200 OK)

If the organization has no projects:

```json
[]
```

---

## ❌ Error Responses

### Invalid Organization ID (HTTP 400 Bad Request)

If the organization ID is invalid or not found, the endpoint will still return an empty array `[]`. The API doesn't validate organization existence for this endpoint.

```json
[]
```

### Example Error Handling

```javascript
fetch('http://localhost:8080/proj/getAll/999')
  .then(response => response.json())
  .then(data => {
    if (Array.isArray(data) && data.length === 0) {
      console.log('No projects found or invalid organization');
    } else {
      console.log('Projects loaded:', data);
    }
  })
  .catch(error => console.error('Request failed:', error));
```

---

## 🧪 Example Implementation

### Using JavaScript Fetch API

```javascript
async function fetchProjectsByOrganization(organizationId) {
  try {
    const response = await fetch(`http://localhost:8080/proj/getAll/${organizationId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const projects = await response.json();
    console.log('Projects:', projects);
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

// Usage
fetchProjectsByOrganization(1);
```

### Using Axios

```javascript
import axios from 'axios';

async function fetchProjectsByOrganization(organizationId) {
  try {
    const response = await axios.get(`http://localhost:8080/proj/getAll/${organizationId}`);
    console.log('Projects:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

// Usage
fetchProjectsByOrganization(1);
```

### Using React Hook

```javascript
import { useState, useEffect } from 'react';

function useProjects(organizationId) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`http://localhost:8080/proj/getAll/${organizationId}`);
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [organizationId]);

  return { projects, loading, error };
}

// Usage in component
function ProjectList({ organizationId }) {
  const { projects, loading, error } = useProjects(organizationId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {projects.map(project => (
        <li key={project.id}>
          {project.name} - {project.projectStatus}
        </li>
      ))}
    </ul>
  );
}
```

---

## 📊 Sample Workflow

```
User selects an organization
  ↓
Frontend calls GET /proj/getAll/{organizationId}
  ↓
Backend fetches all projects for that organization
  ↓
Backend returns array of ProjResponse objects
  ↓
Frontend displays projects in a table/list
  ↓
User can click on a project to view details
```

---

## ✅ Implementation Checklist

- [ ] Create function to fetch projects from `/proj/getAll/{organizationId}`
- [ ] Store organization ID (from selected organization)
- [ ] Handle empty response (no projects)
- [ ] Display project list in UI
- [ ] Show project name, status, and priority in list
- [ ] Add click handler to view project details
- [ ] Handle API errors gracefully
- [ ] Add loading state while fetching data
- [ ] Format dates for display (YYYY-MM-DD)

---

## 🔗 Related Endpoints

- **Create Project**: `POST /proj/create` - Create a new project
- **Get Organization**: `GET /org/{id}` - Get organization details

---

## 📝 Notes

- The endpoint returns all projects for an organization regardless of the user's role (no authorization check)
- Response is an array of objects, not a single object
- All dates are in ISO format: `YYYY-MM-DD`
- Status and Priority fields use specific enum values - do not send custom values
- If no projects exist, an empty array `[]` is returned (not null or 404)

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Returns empty array | Verify the organization ID exists and has projects |
| 404 Not Found | Check the endpoint URL spelling and organization ID |
| Network error | Ensure backend is running on port 8080 |
| CORS error | Backend CORS configuration should allow your frontend origin |

