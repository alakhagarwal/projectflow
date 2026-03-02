# Frontend Integration Guide: Invite & Accept Invitation System

## Overview

This document explains the invite and accept invitation system for the Project Management System. The backend is fully implemented and ready for frontend integration.

---

## Table of Contents

1. [System Flow](#system-flow)
2. [API Endpoints](#api-endpoints)
3. [Send Invitation](#1-send-invitation)
4. [Accept Invitation](#2-accept-invitation)
5. [Get All Organizations](#3-get-all-organizations)
6. [Frontend Implementation](#frontend-implementation)
7. [Error Handling](#error-handling)
8. [Testing Checklist](#testing-checklist)

---

## System Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        INVITATION FLOW                                  │
└─────────────────────────────────────────────────────────────────────────┘

Step 1: Admin sends invitation
┌──────────────┐     POST /org/{orgId}/invite      ┌──────────────┐
│   Frontend   │ ──────────────────────────────────>│   Backend    │
│  (Admin UI)  │     {email, role}                 │              │
└──────────────┘                                    └──────┬───────┘
                                                          │
                                                          ▼
                                                   ┌──────────────┐
                                                   │   Database   │
                                                   │ (INVITED)    │
                                                   └──────┬───────┘
                                                          │
                                                          ▼
                                                   ┌──────────────┐
                                                   │  Email Sent  │
                                                   │  to User     │
                                                   └──────────────┘

Step 2: User receives email and clicks "Accept Invitation"
┌──────────────┐                                   ┌──────────────┐
│   User's     │ ──── Click Accept Button ─────────>│  Frontend    │
│   Email      │     ?token=abc-123-xyz            │ /accept-invite│
└──────────────┘                                   └──────────────┘

Step 3: Frontend calls accept endpoint
┌──────────────┐  POST /org/accept-invite?token=xyz ┌──────────────┐
│   Frontend   │ ───────────────────────────────────>│   Backend    │
│              │     Authorization: Bearer JWT      │              │
└──────────────┘                                    └──────┬───────┘
                                                          │
                                                          ▼
                                                   ┌──────────────┐
                                                   │   Database   │
                                                   │ (ACTIVE)     │
                                                   └──────────────┘

Step 4: User can now see the organization
┌──────────────┐     GET /org/getAll               ┌──────────────┐
│   Frontend   │ ──────────────────────────────────>│   Backend    │
│  (Dashboard) │                                   │              │
└──────────────┘<───────────────────────────────────└──────────────┘
                     [org1, org2, org3...]
```

---

## API Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/org/{orgId}/invite` | POST | Send invitation to user | Yes (Admin only) |
| `/org/accept-invite` | POST | Accept an invitation | Yes (Invited user) |
| `/org/getAll` | GET | Get all user's organizations | Yes |

---

## 1. Send Invitation

### Endpoint
```
POST /org/{orgId}/invite
```

### Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Request Body
```json
{
  "email": "newuser@example.com",
  "role": "MEMBER"
}
```

### Role Options
| Role | Description |
|------|-------------|
| `ADMIN` | Can manage organization, invite members, create projects |
| `MEMBER` | Can view and participate in projects |

### Response

**Success (200 OK)**:
```
"Invitation sent successfully"
```

**Errors**:
| Status | Message | Reason |
|--------|---------|--------|
| 400 | "Inviter not found" | Inviter email doesn't exist |
| 400 | "Organization not found" | Invalid organization ID |
| 400 | "Inviter is not a member of the organization" | Inviter not in org |
| 400 | "Only ADMIN members can invite new members" | Inviter is not admin |
| 400 | "Invited user not found" | User email doesn't exist |
| 400 | "User is already an active member" | Already a member |
| 400 | "User already has a pending invitation" | Already invited |
| 401 | Unauthorized | Missing or invalid JWT |

### Frontend Implementation

```javascript
async function inviteMember(orgId, email, role) {
  const token = localStorage.getItem('jwt_token');
  
  try {
    const response = await fetch(`http://localhost:8080/org/${orgId}/invite`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, role })
    });

    if (response.ok) {
      alert('✅ Invitation sent successfully!');
      return true;
    } else {
      const error = await response.text();
      alert(`❌ Error: ${error}`);
      return false;
    }
  } catch (error) {
    alert(`❌ Network error: ${error.message}`);
    return false;
  }
}

// Usage
inviteMember(1, 'john@example.com', 'MEMBER');
```

### React Component Example

```jsx
import { useState } from 'react';

function InviteMemberForm({ orgId }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`http://localhost:8080/org/${orgId}/invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, role })
      });

      if (response.ok) {
        setMessage('✅ Invitation sent successfully!');
        setEmail('');
      } else {
        const error = await response.text();
        setMessage(`❌ ${error}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Invite Member</h3>
      
      <input
        type="email"
        placeholder="Enter email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="MEMBER">Member</option>
        <option value="ADMIN">Admin</option>
      </select>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Invitation'}
      </button>
      
      {message && <p>{message}</p>}
    </form>
  );
}

export default InviteMemberForm;
```

---

## 2. Accept Invitation

### How It Works

1. User receives email with "Accept Invitation" button
2. Button links to: `http://your-frontend.com/accept-invite?token=abc-123-xyz`
3. Frontend extracts `token` from URL
4. Frontend calls backend API with token
5. Backend activates membership
6. User can now see the organization

### Endpoint
```
POST /org/accept-invite?token={invitation_token}
```

### Headers
```
Authorization: Bearer <JWT_TOKEN>
```

**Note**: The JWT must be from the **invited user**, not the inviter.

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | Yes | The invitation token from email link |

### Response

**Success (200 OK)**:
```
"Invitation accepted"
```

**Errors**:
| Status | Message | Reason |
|--------|---------|--------|
| 400 | "Invalid invitation token" | Token doesn't exist |
| 400 | "Invitation token has expired" | More than 7 days old |
| 400 | "Invitation already accepted" | Token already used |
| 400 | "User not found" | JWT user not in database |
| 401 | Unauthorized | Missing or invalid JWT |

### Token Expiration
- Tokens expire **7 days** after creation
- Once accepted, tokens are **cleared** (can't be reused)

### Frontend Implementation

```javascript
async function acceptInvitation(token) {
  const jwtToken = localStorage.getItem('jwt_token');
  
  if (!jwtToken) {
    // User not logged in, redirect to login
    window.location.href = `/login?redirect=/accept-invite?token=${token}`;
    return;
  }
  
  try {
    const response = await fetch(
      `http://localhost:8080/org/accept-invite?token=${token}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      }
    );

    if (response.ok) {
      alert('✅ Invitation accepted! Welcome to the organization.');
      window.location.href = '/dashboard';
    } else {
      const error = await response.text();
      alert(`❌ Error: ${error}`);
    }
  } catch (error) {
    alert(`❌ Network error: ${error.message}`);
  }
}
```

### React Component Example

```jsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid invitation link. No token provided.');
      return;
    }

    const jwtToken = localStorage.getItem('jwt_token');
    
    if (!jwtToken) {
      // Redirect to login, then come back
      navigate(`/login?redirect=/accept-invite?token=${token}`);
      return;
    }

    acceptInvitation();
  }, [token]);

  const acceptInvitation = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/org/accept-invite?token=${token}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
          }
        }
      );

      if (response.ok) {
        setStatus('success');
        // Redirect to dashboard after 2 seconds
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        const error = await response.text();
        setStatus('error');
        setErrorMessage(error);
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Network error. Please try again.');
    }
  };

  if (status === 'processing') {
    return (
      <div className="accept-invite-page">
        <div className="spinner"></div>
        <h2>Processing your invitation...</h2>
        <p>Please wait while we activate your membership.</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="accept-invite-page success">
        <div className="icon">✅</div>
        <h2>Invitation Accepted!</h2>
        <p>You are now a member of the organization.</p>
        <p>Redirecting to dashboard...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="accept-invite-page error">
        <div className="icon">❌</div>
        <h2>Oops! Something went wrong</h2>
        <p>{errorMessage}</p>
        <button onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </button>
      </div>
    );
  }
}

export default AcceptInvitePage;
```

### Router Setup

```jsx
// App.jsx or routes.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AcceptInvitePage from './pages/AcceptInvitePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Other routes */}
        <Route path="/accept-invite" element={<AcceptInvitePage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 3. Get All Organizations

### Endpoint
```
GET /org/getAll
```

### Headers
```
Authorization: Bearer <JWT_TOKEN>
```

### Response (200 OK)
```json
[
  {
    "id": 1,
    "name": "My Company",
    "slug": "my-company",
    "logoUrl": "https://s3.amazonaws.com/...",
    "role": "ADMIN"
  },
  {
    "id": 5,
    "name": "Partner Org",
    "slug": "partner-org",
    "logoUrl": null,
    "role": "MEMBER"
  }
]
```

### Important Notes
- Only shows organizations where user is **ACTIVE** (confirmed member)
- Does **NOT** show organizations where user is **INVITED** (pending)
- Once user accepts invitation, org appears in this list

### Frontend Implementation

```javascript
async function getOrganizations() {
  const token = localStorage.getItem('jwt_token');
  
  try {
    const response = await fetch('http://localhost:8080/org/getAll', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const organizations = await response.json();
      return organizations;
    } else {
      console.error('Failed to fetch organizations');
      return [];
    }
  } catch (error) {
    console.error('Network error:', error);
    return [];
  }
}
```

---

## Frontend Implementation

### Required Routes

| Route | Purpose |
|-------|---------|
| `/accept-invite` | Accept invitation page |
| `/dashboard` | After acceptance, redirect here |
| `/org/:id/settings` | Invite members form (Admin only) |

### Environment Variables

```env
# .env (React)
REACT_APP_API_BASE_URL=http://localhost:8080

# .env (Vite)
VITE_API_BASE_URL=http://localhost:8080
```

### API Base URL Setup

```javascript
// config.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export { API_BASE_URL };
```

### CORS Note
The backend is configured to allow requests from:
- `http://localhost:3000` (React default)
- `http://localhost:5173` (Vite default)

If you use a different port, ask the backend developer to add it to CORS config.

---

## Error Handling

### Common Errors and Solutions

| Error | Cause | Frontend Action |
|-------|-------|-----------------|
| 401 Unauthorized | JWT missing or expired | Redirect to login |
| 400 "Invalid invitation token" | Bad token in URL | Show error, link to dashboard |
| 400 "Invitation token has expired" | Over 7 days | Show error, contact admin |
| 400 "Invitation already accepted" | Already used | Show info, link to dashboard |
| 400 "Only ADMIN members can invite" | User is not admin | Hide invite button for non-admins |

### Error Display Component

```jsx
function ErrorMessage({ message, onRetry }) {
  const errorMessages = {
    'Invalid invitation token': {
      title: 'Invalid Link',
      description: 'This invitation link is not valid. Please check your email for the correct link.',
      action: 'Go to Dashboard'
    },
    'Invitation token has expired': {
      title: 'Link Expired',
      description: 'This invitation has expired. Please ask the admin to send a new invitation.',
      action: 'Contact Admin'
    },
    'Invitation already accepted': {
      title: 'Already Accepted',
      description: 'You have already accepted this invitation. You can access the organization from your dashboard.',
      action: 'Go to Dashboard'
    }
  };

  const errorInfo = errorMessages[message] || {
    title: 'Error',
    description: message,
    action: 'Try Again'
  };

  return (
    <div className="error-container">
      <h2>{errorInfo.title}</h2>
      <p>{errorInfo.description}</p>
      <button onClick={onRetry}>{errorInfo.action}</button>
    </div>
  );
}
```

---

## Testing Checklist

### Send Invitation
- [ ] Admin can send invitation
- [ ] Non-admin cannot send invitation (button hidden or disabled)
- [ ] Error shown if email doesn't exist
- [ ] Error shown if already a member
- [ ] Error shown if already invited
- [ ] Success message shown after sending

### Accept Invitation
- [ ] Clicking email link opens `/accept-invite?token=xyz`
- [ ] Token is extracted from URL
- [ ] If not logged in, redirect to login first
- [ ] After login, redirect back to accept page
- [ ] Success message shown
- [ ] Redirect to dashboard after success
- [ ] Error shown for invalid token
- [ ] Error shown for expired token

### Get Organizations
- [ ] After accepting, organization appears in list
- [ ] Correct role shown (ADMIN/MEMBER)
- [ ] Logo displayed if available

---

## Database State Changes

### When Invitation is Sent

```
organization_member table:
┌────┬─────────┬────────┬──────────┬──────────────────────────────────┬─────────────────────┐
│ id │ user_id │ org_id │ status   │ invite_token                     │ invite_expires_at   │
├────┼─────────┼────────┼──────────┼──────────────────────────────────┼─────────────────────┤
│ 1  │ 5       │ 1      │ INVITED  │ 550e8400-e29b-41d4-a716-446655.. │ 2026-02-06 12:00:00 │
└────┴─────────┴────────┴──────────┴──────────────────────────────────┴─────────────────────┘
```

### After Invitation is Accepted

```
organization_member table:
┌────┬─────────┬────────┬──────────┬──────────────┬───────────────────┐
│ id │ user_id │ org_id │ status   │ invite_token │ invite_expires_at │
├────┼─────────┼────────┼──────────┼──────────────┼───────────────────┤
│ 1  │ 5       │ 1      │ ACTIVE   │ NULL         │ NULL              │
└────┴─────────┴────────┴──────────┴──────────────┴───────────────────┘
```

**Changes**:
- `status`: INVITED → **ACTIVE**
- `invite_token`: UUID → **NULL**
- `invite_expires_at`: timestamp → **NULL**

---

## Email Template

The invitation email looks like this:

```
┌─────────────────────────────────────────────────────────────┐
│                        🎉 You're Invited!                   │
│                                                             │
│  Hi there,                                                  │
│                                                             │
│  John Doe has invited you to join their team.              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Organization: My Company                            │   │
│  │ Your Role: MEMBER                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Click the button below to accept the invitation:           │
│                                                             │
│            [   Accept Invitation   ]                        │
│                                                             │
│  ⏰ This invitation expires in 7 days                       │
│                                                             │
│  If you didn't expect this invitation, you can ignore it.  │
└─────────────────────────────────────────────────────────────┘
```

The "Accept Invitation" button links to:
```
http://your-frontend-url.com/accept-invite?token=550e8400-e29b-41d4-a716-446655440000
```

---

## Quick Summary

### For Admin (Sending Invitations)
1. Go to organization settings
2. Enter user's email
3. Select role (ADMIN or MEMBER)
4. Click "Send Invitation"
5. User receives email

### For User (Accepting Invitation)
1. Check email inbox
2. Click "Accept Invitation" button
3. Log in (if not already)
4. Automatically redirected to dashboard
5. Organization now visible in list

### API Calls Summary

```
# Send Invitation (Admin)
POST /org/{orgId}/invite
Body: { "email": "user@example.com", "role": "MEMBER" }
Auth: Bearer <admin_jwt>

# Accept Invitation (Invited User)
POST /org/accept-invite?token=abc-123-xyz
Auth: Bearer <user_jwt>

# Get Organizations (Any User)
GET /org/getAll
Auth: Bearer <jwt>
```

---

## Contact

If you have questions about the backend API, please reach out.

**Backend Developer**: [Your Name]
**Last Updated**: January 30, 2026
