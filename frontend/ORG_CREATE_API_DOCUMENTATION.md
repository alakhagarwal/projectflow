# Organization Creation API Documentation

## Endpoint: Create Organization

**URL:** `/org/create`  
**Method:** `POST`  
**Content-Type:** `multipart/form-data`  
**Authentication:** Required (JWT Token)

---

## Description

This endpoint allows authenticated users to create a new organization with an optional logo. The logo is uploaded to AWS S3, and a pre-signed URL (valid for 7 days) is returned for frontend access.

---

## Request Headers

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

---

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | String (form-data) | Yes | Organization name |
| `slug` | String (form-data) | Yes | Unique URL-friendly identifier (e.g., "my-org") |
| `logo` | File (form-data) | No | Organization logo image file |

### Parameter Details

- **name**: The display name of the organization (e.g., "My Company Inc.")
- **slug**: A unique identifier used in URLs. Must be lowercase, no spaces (use hyphens instead). Example: "my-company-inc"
- **logo**: Image file (PNG, JPG, etc.). Max size: 100MB

---

## Request Example

### Using JavaScript Fetch API

```javascript
const formData = new FormData();
formData.append('name', 'My Company Inc.');
formData.append('slug', 'my-company-inc');
formData.append('logo', logoFile); // File object from input[type="file"]

const response = await fetch('http://localhost:8080/org/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`
    // Note: Don't set Content-Type header manually, browser will set it with boundary
  },
  body: formData
});

const data = await response.json();
console.log(data);
```

### Using Axios

```javascript
import axios from 'axios';

const formData = new FormData();
formData.append('name', 'My Company Inc.');
formData.append('slug', 'my-company-inc');
formData.append('logo', logoFile);

const response = await axios.post('http://localhost:8080/org/create', formData, {
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'multipart/form-data'
  }
});

console.log(response.data);
```

### Using cURL (for testing)

```bash
curl -X POST http://localhost:8080/org/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=My Company Inc." \
  -F "slug=my-company-inc" \
  -F "logo=@/path/to/logo.png"
```

---

## Response

### Success Response (200 OK)

```json
{
  "id": 1,
  "name": "My Company Inc.",
  "slug": "my-company-inc",
  "logoUrl": "https://alakh-pms-1.s3.ap-south-1.amazonaws.com/organizations/my-company-inc/550e8400-e29b-41d4-a716-446655440000-logo.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20260126T105030Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=...&X-Amz-Signature=..."
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | Long | Unique identifier for the organization |
| `name` | String | Organization name |
| `slug` | String | Unique URL-friendly identifier |
| `logoUrl` | String (nullable) | Pre-signed S3 URL for the logo (valid for 7 days). Returns `null` if no logo was uploaded |

---

## Error Responses

### 400 Bad Request - Slug Already Exists

```json
{
  "error": "Organization with this slug already exists"
}
```

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

### 500 Internal Server Error - S3 Upload Failed

```json
{
  "error": "Failed to upload logo to S3"
}
```

---

## Important Notes for Frontend Implementation

### 1. **Pre-signed URL Expiration**
- The `logoUrl` is a **pre-signed URL** that expires after **7 days**
- After 7 days, you'll need to request a new pre-signed URL from the backend
- Consider implementing a URL refresh mechanism if users view organizations after 7 days

### 2. **Logo Display**
```javascript
// Simply use the logoUrl directly in img tag
<img src={organization.logoUrl} alt={organization.name} />
```

### 3. **File Size Limit**
- Maximum file size: **100MB**
- Validate file size on frontend before upload to improve UX:

```javascript
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

function validateFile(file) {
  if (file.size > MAX_FILE_SIZE) {
    alert('File size must be less than 100MB');
    return false;
  }
  return true;
}
```

### 4. **Recommended Image Types**
- PNG, JPG, JPEG, GIF, SVG
- Validate file type on frontend:

```javascript
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'];

function validateFileType(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    alert('Please upload a valid image file (PNG, JPG, GIF, SVG)');
    return false;
  }
  return true;
}
```

### 5. **Slug Validation**
Create URL-friendly slugs on the frontend:

```javascript
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-')  // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}

// Example: "My Company Inc." -> "my-company-inc"
```

### 6. **Error Handling**
Implement comprehensive error handling:

```javascript
try {
  const response = await fetch('http://localhost:8080/org/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwtToken}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create organization');
  }

  const data = await response.json();
  console.log('Organization created:', data);
  
  // Navigate to organization page or show success message
  
} catch (error) {
  console.error('Error creating organization:', error);
  // Show error message to user
  alert(error.message);
}
```

### 7. **Loading State**
Show loading indicator during upload:

```javascript
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    // ... upload logic
  } finally {
    setIsLoading(false);
  }
};
```

---

## Complete React Example

```javascript
import React, { useState } from 'react';
import axios from 'axios';

function CreateOrganizationForm({ jwtToken }) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name: name,
      slug: generateSlug(name)
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    // Validate file
    if (file) {
      const MAX_SIZE = 100 * 1024 * 1024; // 100MB
      const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
      
      if (file.size > MAX_SIZE) {
        setError('File size must be less than 100MB');
        return;
      }
      
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('Please upload a valid image file (PNG, JPG, GIF)');
        return;
      }
      
      setFormData({ ...formData, logo: file });
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('slug', formData.slug);
      if (formData.logo) {
        data.append('logo', formData.logo);
      }

      const response = await axios.post(
        'http://localhost:8080/org/create',
        data,
        {
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess(true);
      console.log('Organization created:', response.data);
      
      // Reset form or navigate to organization page
      // navigate(`/org/${response.data.slug}`);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create organization');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Organization Name:</label>
        <input
          type="text"
          value={formData.name}
          onChange={handleNameChange}
          required
          placeholder="My Company Inc."
        />
      </div>

      <div>
        <label>Slug (URL):</label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required
          placeholder="my-company-inc"
        />
      </div>

      <div>
        <label>Logo (Optional):</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>Organization created successfully!</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Organization'}
      </button>
    </form>
  );
}

export default CreateOrganizationForm;
```

---

## Testing Checklist

- [ ] Test with valid organization data and logo
- [ ] Test without logo (logo is optional)
- [ ] Test with duplicate slug (should fail)
- [ ] Test with invalid JWT token (should fail with 401)
- [ ] Test with file size > 100MB (should fail)
- [ ] Test logoUrl displays correctly in `<img>` tag
- [ ] Test logoUrl expiration after 7 days
- [ ] Test special characters in organization name
- [ ] Test slug generation from name

---

## Support

For any issues or questions, contact the backend team or refer to the main API documentation.

**Base URL:** `http://localhost:8080` (Development)  
**Version:** 1.0  
**Last Updated:** January 26, 2026
