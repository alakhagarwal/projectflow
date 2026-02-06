# Get All Organizations API Documentation

## Endpoint: Get All Organizations

**URL:** `/org/getAll`  
**Method:** `GET`  
**Content-Type:** `application/json`  
**Authentication:** Required (JWT Token)

---

## Description

This endpoint retrieves all organizations created by the authenticated user. Each organization includes a fresh pre-signed URL for the logo (valid for 7 days), ensuring secure access to S3-hosted images.

---

## Request Headers

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## Request Parameters

**None** - The endpoint automatically uses the authenticated user's email from the JWT token.

---

## Request Example

### Using JavaScript Fetch API

```javascript
const response = await fetch('http://localhost:8080/org/getAll', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  }
});

const organizations = await response.json();
console.log(organizations);
```

### Using Axios

```javascript
import axios from 'axios';

const response = await axios.get('http://localhost:8080/org/getAll', {
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  }
});

console.log(response.data);
```

### Using cURL (for testing)

```bash
curl -X GET http://localhost:8080/org/getAll \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Response

### Success Response (200 OK)

```json
[
  {
    "id": 1,
    "name": "My Company Inc.",
    "slug": "my-company-inc",
    "logoUrl": "https://alakh-pms-1.s3.ap-south-1.amazonaws.com/organizations/my-company-inc/550e8400-e29b-41d4-a716-446655440000-logo.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20260127T105030Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=...&X-Amz-Signature=..."
  },
  {
    "id": 2,
    "name": "Tech Startup Ltd.",
    "slug": "tech-startup-ltd",
    "logoUrl": null
  },
  {
    "id": 3,
    "name": "Design Agency",
    "slug": "design-agency",
    "logoUrl": "https://alakh-pms-1.s3.ap-south-1.amazonaws.com/organizations/design-agency/7c9e6679-7425-40de-944b-e07fc1f90ae7-logo.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20260127T105030Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=...&X-Amz-Signature=..."
  }
]
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Unique identifier for the organization |
| `name` | String | Organization name |
| `slug` | String | Unique URL-friendly identifier |
| `logoUrl` | String (nullable) | Fresh pre-signed S3 URL for the logo (valid for 7 days). Returns `null` if organization has no logo |

---

## Error Responses

### 401 Unauthorized - Missing/Invalid Token

```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found - User Not Found

```json
{
  "error": "User not found"
}
```

---

## Important Notes for Frontend Implementation

### 1. **Pre-signed URLs Are Always Fresh**
- Every time you call this endpoint, **new pre-signed URLs** are generated
- Each URL is valid for **7 days** from the moment of the API call
- This ensures logos are always accessible without worrying about expired links

### 2. **Empty Response**
If the user hasn't created any organizations yet, the response will be an empty array:
```json
[]
```

### 3. **Null Logo Handling**
Some organizations might not have a logo (logoUrl will be `null`). Handle this gracefully in your UI:

```javascript
function OrganizationLogo({ org }) {
  return (
    <>
      {org.logoUrl ? (
        <img src={org.logoUrl} alt={org.name} />
      ) : (
        <div className="default-logo">
          {org.name.charAt(0).toUpperCase()}
        </div>
      )}
    </>
  );
}
```

### 4. **Display Organizations**
```javascript
organizations.map(org => (
  <div key={org.id} className="organization-card">
    <img 
      src={org.logoUrl || '/default-logo.png'} 
      alt={org.name}
      onError={(e) => e.target.src = '/default-logo.png'} // Fallback
    />
    <h3>{org.name}</h3>
    <p>/{org.slug}</p>
  </div>
))
```

### 5. **Navigation to Organization**
Use the slug for navigation:
```javascript
<Link to={`/org/${org.slug}`}>
  {org.name}
</Link>
```

### 6. **Caching Considerations**
- Since URLs expire after 7 days, avoid caching this data for more than a few hours
- Consider refreshing the list when user navigates back to the organizations page
- For real-time updates, you might want to refresh periodically or on user action

---

## Complete React Example

### Simple List Component

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function OrganizationsList({ jwtToken }) {
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        'http://localhost:8080/org/getAll',
        {
          headers: {
            'Authorization': `Bearer ${jwtToken}`
          }
        }
      );
      setOrganizations(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load organizations');
      console.error('Error fetching organizations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading organizations...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (organizations.length === 0) {
    return (
      <div>
        <p>No organizations yet.</p>
        <button onClick={() => window.location.href = '/org/create'}>
          Create Your First Organization
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2>My Organizations ({organizations.length})</h2>
      <div className="organizations-grid">
        {organizations.map(org => (
          <OrganizationCard key={org.id} org={org} />
        ))}
      </div>
    </div>
  );
}

function OrganizationCard({ org }) {
  return (
    <div className="org-card" onClick={() => window.location.href = `/org/${org.slug}`}>
      <div className="org-logo">
        {org.logoUrl ? (
          <img 
            src={org.logoUrl} 
            alt={org.name}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="default-logo" 
          style={{ display: org.logoUrl ? 'none' : 'flex' }}
        >
          {org.name.charAt(0).toUpperCase()}
        </div>
      </div>
      <h3>{org.name}</h3>
      <p className="org-slug">/{org.slug}</p>
    </div>
  );
}

export default OrganizationsList;
```

### With CSS

```css
.organizations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
}

.org-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.org-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.org-logo {
  width: 100px;
  height: 100px;
  margin: 0 auto 15px;
  position: relative;
}

.org-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.default-logo {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 40px;
  font-weight: bold;
  border-radius: 8px;
}

.org-card h3 {
  margin: 10px 0;
  font-size: 18px;
  text-align: center;
}

.org-slug {
  color: #666;
  font-size: 14px;
  text-align: center;
  font-family: monospace;
}
```

---

## Advanced React Example with Refresh

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function OrganizationsList({ jwtToken }) {
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        'http://localhost:8080/org/getAll',
        {
          headers: {
            'Authorization': `Bearer ${jwtToken}`
          }
        }
      );
      setOrganizations(response.data);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchOrganizations();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>My Organizations ({organizations.length})</h2>
        <button onClick={handleRefresh} disabled={isLoading}>
          {isLoading ? '⟳ Refreshing...' : '⟳ Refresh'}
        </button>
      </div>
      
      {lastRefresh && (
        <p style={{ fontSize: '12px', color: '#666' }}>
          Last updated: {lastRefresh.toLocaleTimeString()}
        </p>
      )}

      {error && <div style={{ color: 'red' }}>{error}</div>}

      {!isLoading && organizations.length === 0 && (
        <div>No organizations yet. Create your first one!</div>
      )}

      <div className="organizations-grid">
        {organizations.map(org => (
          <div key={org.id} className="org-card">
            {org.logoUrl ? (
              <img src={org.logoUrl} alt={org.name} />
            ) : (
              <div className="default-logo">
                {org.name.charAt(0).toUpperCase()}
              </div>
            )}
            <h3>{org.name}</h3>
            <p>/{org.slug}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrganizationsList;
```

---

## Common Use Cases

### 1. **Dashboard View**
Display all organizations on the user's dashboard for quick access.

### 2. **Organization Selector**
Use in a dropdown to switch between organizations:

```javascript
function OrganizationSelector({ organizations, currentOrgSlug, onSelect }) {
  return (
    <select 
      value={currentOrgSlug} 
      onChange={(e) => onSelect(e.target.value)}
    >
      {organizations.map(org => (
        <option key={org.id} value={org.slug}>
          {org.name}
        </option>
      ))}
    </select>
  );
}
```

### 3. **Navigation Menu**
Show organizations in a sidebar navigation:

```javascript
function Sidebar({ organizations }) {
  return (
    <nav>
      <h4>Your Organizations</h4>
      <ul>
        {organizations.map(org => (
          <li key={org.id}>
            <a href={`/org/${org.slug}`}>
              {org.logoUrl && <img src={org.logoUrl} width="24" height="24" />}
              {org.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

---

## Response Characteristics

### Typical Response Size
- **1 organization**: ~500 bytes
- **10 organizations**: ~5 KB
- **50 organizations**: ~25 KB

### Response Time
- **Expected**: 50-200ms
- **With 10 orgs**: ~100ms
- **With 50 orgs**: ~200ms

### Order
Organizations are returned in the order they exist in the database (typically by creation order, oldest first). If you need a specific order, sort on the frontend:

```javascript
// Sort by name (A-Z)
const sortedOrgs = [...organizations].sort((a, b) => 
  a.name.localeCompare(b.name)
);

// Sort by creation (newest first, assuming higher ID = newer)
const sortedOrgs = [...organizations].sort((a, b) => b.id - a.id);
```

---

## Testing Checklist

- [ ] Test with valid JWT token
- [ ] Test with invalid/expired JWT token (should return 401)
- [ ] Test with user who has 0 organizations (should return empty array)
- [ ] Test with user who has 1 organization
- [ ] Test with user who has multiple organizations (5-10)
- [ ] Test that logoUrl is null for organizations without logos
- [ ] Test that logoUrl displays correctly in `<img>` tag
- [ ] Test image fallback when logoUrl fails to load
- [ ] Test refresh functionality
- [ ] Test navigation using slug

---

## Differences from /org/create

| Feature | /org/create | /org/getAll |
|---------|------------|-------------|
| Method | POST | GET |
| Parameters | name, slug, logo | None (uses JWT) |
| Returns | Single OrgResponse | Array of OrgResponse |
| Use Case | Create new organization | Retrieve user's organizations |
| Body Type | multipart/form-data | N/A |

---

## Best Practices

1. **Error Handling**: Always handle 401 errors (expired token) by redirecting to login
2. **Empty State**: Show a friendly message when user has no organizations
3. **Loading State**: Show skeleton loaders or spinners while fetching
4. **Image Fallback**: Always provide fallback for missing/failed logos
5. **Caching**: Cache response for a few minutes, but refresh on user action
6. **Sorting**: Sort organizations alphabetically for better UX
7. **Search**: Add search/filter for users with many organizations

---

## Support

For any issues or questions, contact the backend team or refer to the main API documentation.

**Base URL:** `http://localhost:8080` (Development)  
**Version:** 1.0  
**Last Updated:** January 27, 2026

---

## Related Endpoints

- [Create Organization](/ORG_CREATE_API_DOCUMENTATION.md) - Create a new organization
- Organization Details (Coming soon) - Get details of a specific organization
- Update Organization (Coming soon) - Update organization information
- Delete Organization (Coming soon) - Delete an organization
