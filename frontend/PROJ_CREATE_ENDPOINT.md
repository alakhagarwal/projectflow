# Project Creation Endpoint - Frontend Implementation Guide

## 📌 Quick Summary

This document provides all the information needed to implement the **`POST /proj/create`** endpoint on the frontend.

---

## 🔗 Endpoint Information

| Property | Value |
|----------|-------|
| **Method** | POST |
| **URL** | `/proj/create` |
| **Base URL** | `http://localhost:8080` |
| **Full URL** | `http://localhost:8080/proj/create` |
| **Authentication** | Required (JWT Token) |
| **Content-Type** | `application/json` |

---

## 🔐 Authentication

### Required Header
```
Authorization: Bearer <JWT_TOKEN>
```

**Example:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNjc0MzIxMDAwLCJleHAiOjE2NzQzMjIyMDB9...
```

### Important Notes
- The JWT token is obtained from the **login endpoint** (`POST /generate-token`)
- Only users who are **ADMIN** of the specified organization can create projects
- Token must be valid and not expired

---

## 📥 Request Body

### Fields

```json
{
  "organizationId": 1,
  "name": "Project Name",
  "description": "Project description",
  "projectStatus": "PLANNING",
  "projectPriority": "HIGH",
  "startDate": "2026-02-15",
  "endDate": "2026-12-31",
  "teamLeadEmail": "teamlead@example.com"
}
```

### Field Specifications

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| `organizationId` | Number | ✅ Yes | Must exist in database | The organization to create the project in |
| `name` | String | ✅ Yes | Cannot be blank or empty | Unique names recommended |
| `description` | String | ❌ No | None | Can be empty string or omitted |
| `projectStatus` | String (Enum) | ❌ No | See enum values below | Default: null (optional) |
| `projectPriority` | String (Enum) | ❌ No | See enum values below | Default: null (optional) |
| `startDate` | String (Date) | ✅ Yes | Format: `YYYY-MM-DD`, Not in past | Must be today or later |
| `endDate` | String (Date) | ✅ Yes | Format: `YYYY-MM-DD`, After start date | Must be after `startDate` |
| `teamLeadEmail` | String | ✅ Yes | Valid email, must exist in system | Team lead must be a member of the organization |

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

### Example Request

```javascript
const createProjectPayload = {
  organizationId: 1,
  name: "Website Redesign 2026",
  description: "Complete redesign of company website with new UI/UX",
  projectStatus: "ACTIVE",
  projectPriority: "HIGH",
  startDate: "2026-02-15",
  endDate: "2026-08-31",
  teamLeadEmail: "john.doe@company.com"
};
```

---

## 📤 Response

### Success Response (HTTP 200 OK)

```json
{
  "id": 5,
  "name": "Website Redesign 2026",
  "description": "Complete redesign of company website with new UI/UX",
  "organizationId": 1,
  "createdByEmail": "admin@company.com",
  "teamLeadEmail": "john.doe@company.com",
  "projectStatus": "ACTIVE",
  "projectPriority": "HIGH",
  "startDate": "2026-02-15",
  "endDate": "2026-08-31"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Number | Auto-generated project ID |
| `name` | String | Project name |
| `description` | String | Project description |
| `organizationId` | Number | Organization ID |
| `createdByEmail` | String | Email of the user who created the project |
| `teamLeadEmail` | String | Email of the team lead assigned to the project |
| `projectStatus` | String | Current status of the project |
| `projectPriority` | String | Priority level of the project |
| `startDate` | String | Project start date (YYYY-MM-DD) |
| `endDate` | String | Project end date (YYYY-MM-DD) |

---

## ❌ Error Responses

### 1. Validation Error (HTTP 400 Bad Request)

**When:** Required fields are missing or invalid

```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": {
    "name": "must not be blank",
    "organizationId": "must not be null",
    "startDate": "must not be null"
  }
}
```

**Common Field Errors:**
- `name`: "must not be blank"
- `organizationId`: "must not be null"
- `startDate`: "must not be null"
- `endDate`: "must not be null"
- `teamLeadEmail`: "must not be null"

---

### 2. Invalid Request (HTTP 400 Bad Request)

**When:** Business logic validation fails

#### End date before start date:
```json
{
  "status": 400,
  "message": "End date must be after start date"
}
```

#### Start date in the past:
```json
{
  "status": 400,
  "message": "Start date cannot be in the past"
}
```

#### Team lead not in organization:
```json
{
  "status": 400,
  "message": "Team lead must be a member of the organization"
}
```

---

### 3. Unauthorized (HTTP 403 Forbidden)

**When:** User is not an ADMIN of the organization

```json
{
  "status": 403,
  "message": "Only organization admins can create projects"
}
```

**Why:** The authenticated user must have ADMIN role in the specified organization to create projects.

---

### 4. Not Found (HTTP 404 Not Found)

**When:** Referenced resource doesn't exist

#### Organization not found:
```json
{
  "status": 404,
  "message": "Organization not found with id: 999"
}
```

#### Team lead not found:
```json
{
  "status": 404,
  "message": "User not found with email: notexist@example.com"
}
```

#### Creator not found (system error):
```json
{
  "status": 404,
  "message": "User not found with email: creator@example.com"
}
```

---

### 5. Unauthorized - Invalid Token (HTTP 401)

**When:** JWT token is missing, invalid, or expired

**Solution:** Re-login to get a new token using `/generate-token` endpoint

---

## 🔄 Implementation Example

### JavaScript (Fetch API)

```javascript
async function createProject(projectData, jwtToken) {
  try {
    const response = await fetch('http://localhost:8080/proj/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify(projectData)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error:', data.message);
      // Handle errors based on status code
      if (response.status === 400) {
        console.error('Validation errors:', data.errors);
      }
      return null;
    }

    console.log('Project created successfully:', data);
    return data;
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Usage
const projectData = {
  organizationId: 1,
  name: "Website Redesign 2026",
  description: "Complete redesign of company website with new UI/UX",
  projectStatus: "PLANNING",
  projectPriority: "HIGH",
  startDate: "2026-02-15",
  endDate: "2026-08-31",
  teamLeadEmail: "john.doe@company.com"
};

createProject(projectData, jwtToken);
```

### TypeScript with Axios

```typescript
import axios from 'axios';

interface CreateProjectRequest {
  organizationId: number;
  name: string;
  description?: string;
  projectStatus?: string;
  projectPriority?: string;
  startDate: string;
  endDate: string;
  teamLeadEmail: string;
}

interface ProjectResponse {
  id: number;
  name: string;
  description: string;
  organizationId: number;
  createdByEmail: string;
  teamLeadEmail: string;
  projectStatus: string;
  projectPriority: string;
  startDate: string;
  endDate: string;
}

async function createProject(
  projectData: CreateProjectRequest,
  jwtToken: string
): Promise<ProjectResponse | null> {
  try {
    const response = await axios.post<ProjectResponse>(
      'http://localhost:8080/proj/create',
      projectData,
      {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      }
    );

    console.log('Project created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error('Error:', error.response.data);
      // Handle different status codes
      if (error.response.status === 403) {
        console.error('You are not an admin of this organization');
      } else if (error.response.status === 400) {
        console.error('Validation failed:', error.response.data.errors);
      }
    }
    return null;
  }
}

// Usage
const projectData: CreateProjectRequest = {
  organizationId: 1,
  name: "Website Redesign 2026",
  description: "Complete redesign of company website with new UI/UX",
  projectStatus: "ACTIVE",
  projectPriority: "HIGH",
  startDate: "2026-02-15",
  endDate: "2026-08-31",
  teamLeadEmail: "john.doe@company.com"
};

createProject(projectData, jwtToken);
```

---

## 🎯 Business Rules to Implement

### User Permissions
- ✅ Only ADMIN users of the organization can create projects
- ✅ The creator and team lead can be different people

### Date Validation
- ✅ Start date must be today or later (cannot be in the past)
- ✅ End date must be after start date
- ✅ Use format: `YYYY-MM-DD`

### Team Lead Requirements
- ✅ Team lead must exist in the system (have an account)
- ✅ Team lead must be a member of the organization
- ✅ Team lead will automatically be assigned as "LEAD" in the project

### Default Behavior
- ✅ If `projectStatus` is not provided, it defaults to `null`
- ✅ If `projectPriority` is not provided, it defaults to `null`
- ✅ If `description` is not provided, it can be an empty string

---

## 🧪 Testing Scenarios

### ✅ Valid Request
```json
{
  "organizationId": 1,
  "name": "Mobile App Development",
  "description": "Native mobile app for iOS and Android",
  "projectStatus": "PLANNING",
  "projectPriority": "HIGH",
  "startDate": "2026-02-15",
  "endDate": "2026-06-30",
  "teamLeadEmail": "alice@company.com"
}
```
**Expected:** HTTP 200 with project details

---

### ❌ Test Cases

#### Missing Required Field
```json
{
  "organizationId": 1,
  "name": "Mobile App Development",
  "startDate": "2026-02-15"
  // Missing: endDate, teamLeadEmail
}
```
**Expected:** HTTP 400 - Validation failed

---

#### Invalid Date Range
```json
{
  "organizationId": 1,
  "name": "Mobile App Development",
  "startDate": "2026-06-30",
  "endDate": "2026-02-15",  // Before start date
  "teamLeadEmail": "alice@company.com"
}
```
**Expected:** HTTP 400 - "End date must be after start date"

---

#### Start Date in Past
```json
{
  "organizationId": 1,
  "name": "Mobile App Development",
  "startDate": "2026-01-15",  // In the past
  "endDate": "2026-06-30",
  "teamLeadEmail": "alice@company.com"
}
```
**Expected:** HTTP 400 - "Start date cannot be in the past"

---

#### Non-Admin User
```
Authorization: Bearer <token_of_non_admin_user>
```
**Expected:** HTTP 403 - "Only organization admins can create projects"

---

#### Team Lead Not in Organization
```json
{
  "organizationId": 1,
  "name": "Mobile App Development",
  "startDate": "2026-02-15",
  "endDate": "2026-06-30",
  "teamLeadEmail": "outsider@other.com"  // Not a member of org
}
```
**Expected:** HTTP 400 - "Team lead must be a member of the organization"

---

#### Invalid Organization ID
```json
{
  "organizationId": 9999,  // Doesn't exist
  "name": "Mobile App Development",
  "startDate": "2026-02-15",
  "endDate": "2026-06-30",
  "teamLeadEmail": "alice@company.com"
}
```
**Expected:** HTTP 404 - "Organization not found with id: 9999"

---

## 📋 UI Implementation Checklist

- [ ] Create project form with required fields:
  - [ ] Organization selector (dropdown from list of orgs where user is admin)
  - [ ] Project name input (text)
  - [ ] Project description input (textarea, optional)
  - [ ] Start date picker (date input, today or later only)
  - [ ] End date picker (date input, must be after start date)
  - [ ] Team lead selector (dropdown of org members, or search)
  - [ ] Status dropdown (PLANNING, ACTIVE, COMPLETED, ON_HOLD, CANCELLED - optional)
  - [ ] Priority dropdown (LOW, MEDIUM, HIGH - optional)

- [ ] Form validation:
  - [ ] Check required fields before submission
  - [ ] Validate date range on client side
  - [ ] Prevent selecting past dates
  - [ ] Show helpful error messages

- [ ] Submission handling:
  - [ ] Show loading state during request
  - [ ] Display success message with project ID
  - [ ] Handle error responses with user-friendly messages
  - [ ] Redirect to project details or list on success
  - [ ] Show specific errors for failed validations

- [ ] Error handling:
  - [ ] Check for 403 (not admin) and show appropriate message
  - [ ] Check for 404 (invalid org/team lead) and suggest fixes
  - [ ] Check for 400 validation errors and highlight fields
  - [ ] Show token expiration message if 401 received

---

## 🔗 Related Endpoints

### Before Creating a Project
1. **Get User Organizations** - Get list of organizations where user is admin
   - Needed to populate organization selector

2. **Get Organization Members** - Get members of selected organization
   - Needed to populate team lead selector

### After Creating a Project
1. **Get Project Details** - Fetch the created project
2. **Get Project Members** - View team lead and other project members
3. **Update Project** - Modify project details later

---

## 💡 Tips & Best Practices

1. **Date Handling**
   - Always use `YYYY-MM-DD` format
   - Consider timezone when comparing dates
   - Validate dates on both client and server

2. **User Experience**
   - Show clear error messages specific to the validation that failed
   - Disable submit button until all required fields are filled
   - Auto-format dates as user types
   - Show loading spinner during request

3. **Error Messages**
   - Parse the response JSON to show specific field errors
   - Map 403 errors to "You don't have permission" message
   - Map 404 errors to "Resource not found" message
   - Show server error messages as fallback

4. **Token Management**
   - Always include JWT token in Authorization header
   - Handle 401 responses by redirecting to login
   - Implement token refresh if needed

5. **Form UX**
   - Show required field indicators (*)
   - Disable organization selector if user is only admin of one org
   - Populate team lead suggestions based on organization members
   - Show tooltips for optional fields explaining their purpose

---

## 📞 Contact Backend Team

If you have questions about:
- Endpoint behavior
- Date format or validation
- Enum values for status/priority
- Authorization requirements
- Error handling

Feel free to reach out to the backend team!

---

## 📝 Notes

- Current date: January 27, 2026
- The endpoint requires JWT authentication
- Team lead is automatically added as a "LEAD" member of the project
- Only one project member entry is created initially (the team lead)
- Other team members can be added separately via a different endpoint

---

**Last Updated:** January 27, 2026  
**Version:** 1.0
