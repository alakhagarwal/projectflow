# Project Management System - API Documentation

## Base URL
```
http://localhost:8080
```

---

## 📝 Authentication APIs

### 1. User Registration
Register a new user account.

**Endpoint:** `POST /auth/register`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourPassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Success Response (201 Created):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Error Response (409 Conflict) - Email Already Exists:**
```json
{
  "timestamp": "2026-01-22T10:30:00",
  "status": 409,
  "error": "Conflict",
  "message": "Email already exists"
}
```

**Validation Rules:**
- `email`: Required, must be valid email format
- `password`: Required, minimum 6 characters
- `firstName`: Required, non-empty string
- `lastName`: Required, non-empty string

---

### 2. Generate Token (Login)
Authenticate user and generate JWT token.

**Endpoint:** `POST /generate-token`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourPassword123"
}
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNjc0MzIxMDAwLCJleHAiOjE2NzQzMjIyMDB9..."
}
```

**Response Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Error Response (401 Unauthorized) - Invalid Credentials:**
```json
{
  "error": "Invalid email or password"
}
```

**Error Response (400 Bad Request) - Malformed Request:**
```json
{
  "error": "Invalid request body"
}
```

**Token Details:**
- **Algorithm:** HS256
- **Expiration:** 15 minutes
- **Subject (sub):** User's email address
- **Format:** Standard JWT (can be decoded at https://jwt.io)

---

## 🔐 Using the JWT Token

All protected API endpoints require the JWT token in the `Authorization` header:

**Example Request:**
```http
GET /api/protected-resource HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**If Token is Expired (401 Unauthorized):**
```json
{
  "error": "Invalid or expired token"
}
```

---

## 📋 API Summary Table

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| POST | `/auth/register` | ❌ No | Create new user account |
| POST | `/generate-token` | ❌ No | Login and get JWT token |
| GET/POST | `/*` (other endpoints) | ✅ Yes | All other endpoints need JWT |

---

## 🔄 Complete Authentication Flow

```
1. User Registration
   POST /auth/register
   ├─ Request: { email, password, firstName, lastName }
   └─ Response: { id, email, firstName, lastName }

2. User Login
   POST /generate-token
   ├─ Request: { email, password }
   └─ Response: { token: "JWT_STRING" }

3. Access Protected Resources
   GET /api/any-protected-route
   ├─ Header: Authorization: Bearer JWT_STRING
   └─ Response: Protected data
```

---

## 💡 Frontend Implementation Tips

### JavaScript Example - Registration
```javascript
const register = async (email, password, firstName, lastName) => {
  const response = await fetch('http://localhost:8080/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, firstName, lastName })
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Registration failed');
};
```

### JavaScript Example - Login
```javascript
const login = async (email, password) => {
  const response = await fetch('http://localhost:8080/generate-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data.token;
  }
  throw new Error('Invalid credentials');
};
```

### JavaScript Example - Protected API Call
```javascript
const fetchProtected = async (endpoint) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:8080${endpoint}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    // Redirect to login
  }
  
  return await response.json();
};
```

---

## ⚠️ Important Notes

1. **Token Expiration:** Tokens expire after 15 minutes. After expiration, user needs to login again.
2. **Password Security:** Passwords are hashed using BCrypt algorithm.
3. **CORS:** Configure CORS on frontend if running on different domain/port.
4. **HTTPS:** Use HTTPS in production (not HTTP).
5. **Token Storage:** Store JWT in secure storage (avoid XSS attacks).

---

## 🛠️ Backend Stack

- **Framework:** Spring Boot 3.x
- **Security:** Spring Security + JWT (HS256)
- **Database:** MySQL
- **Authentication:** Email + Password
- **Password Encoding:** BCrypt

---

**Last Updated:** January 22, 2026
