# Get Organization Members API Documentation

## Endpoint Overview
This API endpoint retrieves all members of a specific organization, including their user details, roles, and membership status. **Only active members of the organization can access this endpoint.**

---

## 📋 Endpoint Details

**Method:** `GET`  
**URL:** `/org/{orgId}/members`  
**Authentication:** Required (JWT Token)  
**Authorization:** User must be an ACTIVE member of the organization  
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
| `orgId` | Long | Yes | The ID of the organization |

### Example Request

```
GET /org/5/members
```

---

## 📤 Response

### Success Response (200 OK)

```json
[
  {
    "id": 1,
    "userId": 10,
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "organizationId": 5,
    "organizationName": "Tech Solutions Inc",
    "organizationRole": "ADMIN",
    "memberStatus": "ACTIVE",
    "inviteExpiresAt": null
  },
  {
    "id": 2,
    "userId": 15,
    "email": "jane.smith@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "organizationId": 5,
    "organizationName": "Tech Solutions Inc",
    "organizationRole": "MEMBER",
    "memberStatus": "ACTIVE",
    "inviteExpiresAt": null
  },
  {
    "id": 3,
    "userId": 20,
    "email": "bob.wilson@example.com",
    "firstName": "Bob",
    "lastName": "Wilson",
    "organizationId": 5,
    "organizationName": "Tech Solutions Inc",
    "organizationRole": "MEMBER",
    "memberStatus": "INVITED",
    "inviteExpiresAt": "2026-02-08T10:30:00Z"
  }
]
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Unique identifier for the organization membership record |
| `userId` | Long | Unique identifier of the user |
| `email` | String | Email address of the member |
| `firstName` | String | First name of the member |
| `lastName` | String | Last name of the member |
| `organizationId` | Long | ID of the organization |
| `organizationName` | String | Name of the organization |
| `organizationRole` | String (Enum) | Role of the member in the organization (`ADMIN` or `MEMBER`) |
| `memberStatus` | String (Enum) | Status of the membership (`ACTIVE` or `INVITED`) |
| `inviteExpiresAt` | String (ISO 8601) | Expiration timestamp for pending invitations (null for active members) |

### Enum Values

**OrganizationRole:**
- `ADMIN` - Organization administrator with full permissions
- `MEMBER` - Regular member with limited permissions

**MemberStatus:**
- `INVITED` - User has been invited but hasn't accepted yet
- `ACTIVE` - User has accepted the invitation and is an active member

---

## ⚠️ Error Responses

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

**Scenario 1:** User is not a member of the organization

```json
{
  "timestamp": "2026-02-01T10:30:00Z",
  "status": 403,
  "error": "Forbidden",
  "message": "You are not a member of this organization"
}
```

**Scenario 2:** User membership is not active (still in INVITED status)

```json
{
  "timestamp": "2026-02-01T10:30:00Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Your membership is not active"
}
```

### 404 Not Found

**Scenario:** Organization not found

```json
{
  "timestamp": "2026-02-01T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Organization with id '999' not found"
}
```

---

## 💡 Frontend Implementation Examples

### JavaScript (Fetch API)

```javascript
const getOrganizationMembers = async (orgId, token) => {
  try {
    const response = await fetch(`/org/${orgId}/members`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const members = await response.json();
    return members;
  } catch (error) {
    console.error('Error fetching organization members:', error);
    throw error;
  }
};

// Usage
getOrganizationMembers(5, 'your_jwt_token_here')
  .then(members => {
    console.log('Organization members:', members);
    // Filter active members
    const activeMembers = members.filter(m => m.memberStatus === 'ACTIVE');
    // Filter admins
    const admins = members.filter(m => m.organizationRole === 'ADMIN');
  })
  .catch(error => console.error('Failed to fetch members:', error));
```

### JavaScript (Axios)

```javascript
import axios from 'axios';

const getOrganizationMembers = async (orgId, token) => {
  try {
    const response = await axios.get(
      `/org/${orgId}/members`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message);
    } else if (error.request) {
      throw new Error('No response from server');
    } else {
      throw new Error(error.message);
    }
  }
};
```

### TypeScript Interface

```typescript
// Enum types
type OrganizationRole = 'ADMIN' | 'MEMBER';
type MemberStatus = 'INVITED' | 'ACTIVE';

// Response interface
interface OrganizationMemberDTO {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: number;
  organizationName: string;
  organizationRole: OrganizationRole;
  memberStatus: MemberStatus;
  inviteExpiresAt: string | null;
}

// API function
const getOrganizationMembers = async (
  orgId: number,
  token: string
): Promise<OrganizationMemberDTO[]> => {
  const response = await fetch(`/org/${orgId}/members`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch organization members');
  }

  return await response.json();
};

// Usage with React
import { useState, useEffect } from 'react';

function OrganizationMembers({ orgId, token }: { orgId: number, token: string }) {
  const [members, setMembers] = useState<OrganizationMemberDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await getOrganizationMembers(orgId, token);
        setMembers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [orgId, token]);

  if (loading) return <div>Loading members...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Organization Members ({members.length})</h2>
      <ul>
        {members.map(member => (
          <li key={member.id}>
            {member.firstName} {member.lastName} ({member.email})
            - Role: {member.organizationRole}
            - Status: {member.memberStatus}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🧪 Testing

### cURL Command

```bash
curl -X GET "http://localhost:8080/org/5/members" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Postman Collection

1. **Method:** GET
2. **URL:** `{{baseUrl}}/org/5/members`
3. **Headers:**
   - `Authorization: Bearer {{jwtToken}}`

---

## 📝 Important Notes

1. **Authentication Required:** All requests must include a valid JWT token
2. **Authorization Required:** Only ACTIVE members of the organization can view the member list
3. **Member Statuses:**
   - `ACTIVE`: User has accepted the invitation and can access the organization
   - `INVITED`: User has been invited but hasn't accepted yet
4. **Invite Expiration:** The `inviteExpiresAt` field is only populated for users with `INVITED` status
5. **Organization Roles:**
   - `ADMIN`: Can manage organization settings, invite members, create projects
   - `MEMBER`: Can view organization details and participate in projects
6. **Security:** Users can only view members of organizations they are active members of

---

## 🔄 Common Use Cases

### Filter Active Members Only

```javascript
const activeMembers = members.filter(m => m.memberStatus === 'ACTIVE');
```

### Get All Admins

```javascript
const admins = members.filter(m => m.organizationRole === 'ADMIN');
```

### Check if Invite is Expired

```javascript
const isPendingInvite = (member) => {
  if (member.memberStatus === 'INVITED' && member.inviteExpiresAt) {
    const expiryDate = new Date(member.inviteExpiresAt);
    return expiryDate > new Date();
  }
  return false;
};
```

### Count Members by Role

```javascript
const memberCounts = members.reduce((acc, member) => {
  acc[member.organizationRole] = (acc[member.organizationRole] || 0) + 1;
  return acc;
}, {});

console.log(`Admins: ${memberCounts.ADMIN}, Members: ${memberCounts.MEMBER}`);
```

---

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Missing/invalid token | Ensure JWT token is included in Authorization header |
| 403 Forbidden (not a member) | User is not part of the organization | User must be invited and accept the invitation first |
| 403 Forbidden (not active) | User has pending invitation | User needs to accept the invitation to become active |
| 404 Not Found | Invalid organization ID | Verify the organization exists and the ID is correct |
| Empty array returned | No members in organization | This is valid - the organization has no members yet |

---

## 📞 Support

For questions or issues, please contact the backend team or refer to the main API documentation.

**Backend Base URL:** `http://localhost:8080` (Development)

**API Version:** 1.0

**Last Updated:** February 1, 2026
