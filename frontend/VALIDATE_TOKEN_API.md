# Token Validation API Documentation

## Overview
This endpoint allows the frontend to validate if a JWT token is still valid and retrieve the authenticated user's information.

---

## Endpoint Details

### Validate Token
**Endpoint:** `GET /auth/validate-token`

**Authentication:** ✅ Required (Protected endpoint - JWT token needed)

**Description:** Validates the JWT token and returns user information if the token is valid.

---

## Request

### Headers
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

### Example Request
```http
GET /auth/validate-token HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## Responses

### ✅ Success Response (200 OK)
Token is valid and not expired.

```json
{
  "valid": true,
  "email": "user@example.com",
  "message": "Token is valid"
}
```

**Response Fields:**
- `valid` (boolean): Always `true` if this response is returned
- `email` (string): The email address of the authenticated user (extracted from token)
- `message` (string): Success message

---

### ❌ Error Response (401 Unauthorized)
Token is invalid, expired, or missing.

```json
{
  "timestamp": "2026-01-22T10:30:00.000+00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource",
  "path": "/auth/validate-token"
}
```

**Common Reasons for 401:**
- Token is expired (> 15 minutes old)
- Token signature is invalid
- Token is malformed
- No Authorization header provided
- Invalid Bearer token format

---

### ❌ Error Response (403 Forbidden)
Token is valid but user doesn't have access.

```json
{
  "timestamp": "2026-01-22T10:30:00.000+00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied"
}
```

---

## How It Works

```
┌─────────────┐
│  Frontend   │
│   (React)   │
└──────┬──────┘
       │ GET /auth/validate-token
       │ Header: Authorization: Bearer <token>
       ↓
┌──────────────────────────────┐
│   Spring Security Filters    │
├──────────────────────────────┤
│ 1. Extract token from header │
│ 2. Validate signature        │
│ 3. Check expiration          │
└──────┬───────────────────────┘
       │
       ├─→ Invalid/Expired ❌
       │   └─→ Return 401 Unauthorized
       │
       └─→ Valid ✅
           └─→ Set Authentication in SecurityContext
               └─→ Execute Controller Method
                   │
                   ↓
           ┌─────────────────────┐
           │  UserController     │
           │  validateToken()    │
           ├─────────────────────┤
           │ Extract user email  │
           │ Build response      │
           │ Return 200 OK       │
           └─────────────────────┘
```

---

## JavaScript/React Implementation

### 1. Basic Validation Function

```javascript
/**
 * Validates the JWT token stored in localStorage
 * @returns {Promise<Object>} { valid: boolean, email?: string, message?: string }
 */
const validateToken = async () => {
  const token = localStorage.getItem('token');
  
  // No token found
  if (!token) {
    return { valid: false, message: 'No token found' };
  }
  
  try {
    const response = await fetch('http://localhost:8080/auth/validate-token', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      // { valid: true, email: "user@example.com", message: "Token is valid" }
      return data;
    } else if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token'); // Clean up
      return { valid: false, message: 'Token expired or invalid' };
    } else {
      return { valid: false, message: 'Validation failed' };
    }
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false, message: 'Network error' };
  }
};
```

---

### 2. React Hook - useAuth

```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook to handle authentication state
 */
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const result = await validateToken();
      
      if (result.valid) {
        setIsAuthenticated(true);
        setUser({ email: result.email });
      } else {
        setIsAuthenticated(false);
        setUser(null);
        navigate('/login'); // Redirect to login
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  return { isAuthenticated, user, loading };
};

// Usage in component
function Dashboard() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div>
      <h1>Welcome, {user.email}!</h1>
      {/* Your dashboard content */}
    </div>
  );
}
```

---

### 3. Protected Route Component

```javascript
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

/**
 * Protected Route component that validates token before rendering
 */
const ProtectedRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      const result = await validateToken();
      setIsValid(result.valid);
    };
    
    checkToken();
  }, []);

  // Still checking
  if (isValid === null) {
    return <div>Verifying authentication...</div>;
  }

  // Token invalid - redirect to login
  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  // Token valid - render protected content
  return children;
};

// Usage in App.js
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
```

---

### 4. Context Provider for Global Auth State

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  useEffect(() => {
    const checkAuth = async () => {
      const result = await validateToken();
      
      setAuth({
        isAuthenticated: result.valid,
        user: result.valid ? { email: result.email } : null,
        loading: false
      });
    };

    checkAuth();
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    // Optionally re-validate
    checkAuth();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({
      isAuthenticated: false,
      user: null,
      loading: false
    });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Usage in component
function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav>
      {isAuthenticated ? (
        <>
          <span>Welcome, {user.email}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <a href="/login">Login</a>
      )}
    </nav>
  );
}
```

---

### 5. Axios Interceptor (Alternative Implementation)

```javascript
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:8080',
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Validate token using axios
const validateTokenAxios = async () => {
  try {
    const response = await api.get('/auth/validate-token');
    return response.data; // { valid: true, email: "...", message: "..." }
  } catch (error) {
    return { valid: false, message: error.message };
  }
};

export { api, validateTokenAxios };
```

---

### 6. Periodic Token Validation

```javascript
/**
 * Set up periodic token validation (every 5 minutes)
 * Useful for long-running sessions
 */
const setupTokenValidation = (onInvalid) => {
  const VALIDATION_INTERVAL = 5 * 60 * 1000; // 5 minutes

  const intervalId = setInterval(async () => {
    const result = await validateToken();
    
    if (!result.valid) {
      clearInterval(intervalId);
      onInvalid(); // Callback when token becomes invalid
    }
  }, VALIDATION_INTERVAL);

  // Clean up on unmount
  return () => clearInterval(intervalId);
};

// Usage in React component
useEffect(() => {
  const cleanup = setupTokenValidation(() => {
    alert('Your session has expired. Please login again.');
    navigate('/login');
  });

  return cleanup;
}, [navigate]);
```

---

## Use Cases

### 1. **On App Load**
Validate token when app starts to check if user is still logged in.

### 2. **Protected Routes**
Check token validity before rendering protected components.

### 3. **Session Monitoring**
Periodically validate token during long user sessions.

### 4. **Before Critical Actions**
Validate token before important operations (payments, data updates, etc.).

### 5. **Auto-Logout**
Automatically log out user when token expires.

---

## Security Best Practices

✅ **Always use HTTPS** in production  
✅ **Store token securely** (avoid localStorage for sensitive apps, use httpOnly cookies)  
✅ **Validate on every page load** in protected routes  
✅ **Clear token on logout**  
✅ **Handle token expiration gracefully**  
✅ **Don't expose token in URL parameters**  
✅ **Implement refresh token mechanism** for better UX (optional)

---

## Testing with cURL

```bash
# Get a token first
curl -X POST http://localhost:8080/generate-token \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Response: {"token":"eyJhbGci..."}

# Validate the token
curl -X GET http://localhost:8080/auth/validate-token \
  -H "Authorization: Bearer eyJhbGci..."

# Expected: {"valid":true,"email":"user@example.com","message":"Token is valid"}
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "No Authorization header" | Ensure token is in `Authorization: Bearer <token>` format |
| "Token expired" | Token lasts 15 minutes - user needs to login again |
| "CORS error" | Make sure CORS is configured properly in backend |
| "Network error" | Check if backend server is running on port 8080 |
| "Token invalid" | Token might be corrupted - clear localStorage and login again |

---

**Last Updated:** January 22, 2026
