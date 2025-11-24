# Authentication API Documentation

This document outlines all the authentication endpoints available in the KDSM Encryptor application using Appwrite backend.

## Base URL
```
/api/auth
```

## Authentication Endpoints

### 1. User Registration
**POST** `/api/auth/register`

Register a new user account and automatically send email verification.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "$id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerification": false
  },
  "session": {...},
  "message": "Account created successfully. Please check your email to verify your account."
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "A user with the same email already exists"
}
```

### 2. User Login
**POST** `/api/auth/session`

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "session": {...},
  "user": {
    "$id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerification": true,
    "registration": "2024-01-01T00:00:00.000Z"
  },
  "message": "Login successful"
}
```

### 3. Session Verification
**GET** `/api/auth/session`

Verify current session and get user data.

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "$id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerification": true,
    "registration": "2024-01-01T00:00:00.000Z",
    "status": true,
    "labels": []
  },
  "session": {
    "isValid": true,
    "requiresVerification": false
  }
}
```

### 4. User Logout
**DELETE** `/api/auth/session`

Logout and delete current session.

**Response:**
```json
{
  "success": true
}
```

### 5. Get User Profile
**GET** `/api/auth/user`

Get detailed user profile information.

**Response:**
```json
{
  "success": true,
  "user": {
    "$id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerification": true,
    "registration": "2024-01-01T00:00:00.000Z",
    "status": true,
    "labels": [],
    "phone": "",
    "phoneVerification": false
  }
}
```

### 6. Update User Profile
**PATCH** `/api/auth/user`

Update user name or email.

**Request Body:**
```json
{
  "name": "New Name",
  "email": "newemail@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated. Please verify your new email address.",
  "user": {...}
}
```

### 7. Change Password
**PUT** `/api/auth/user`

Change user password.

**Request Body:**
```json
{
  "oldPassword": "current_password",
  "newPassword": "new_password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

### 8. Delete Account
**DELETE** `/api/auth/user`

Delete user account permanently.

**Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

## Email Verification Endpoints

### 9. Email Verification Management
**POST** `/api/auth/verify-email`

Handle email verification actions.

**Create Verification (Send Email):**
```json
{
  "action": "create"
}
```

**Confirm Verification:**
```json
{
  "action": "confirm",
  "userId": "user_id",
  "secret": "verification_token"
}
```

**Resend Verification:**
```json
{
  "action": "resend"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

### 10. Get Verification Status
**GET** `/api/auth/verify-email`

Check email verification status.

**Response:**
```json
{
  "success": true,
  "emailVerification": true,
  "user": {
    "$id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerification": true
  }
}
```

## Password Recovery Endpoints

### 11. Password Recovery
**POST** `/api/auth/password-recovery`

Handle password recovery actions.

**Create Recovery (Send Email):**
```json
{
  "action": "create",
  "email": "user@example.com"
}
```

**Confirm Recovery:**
```json
{
  "action": "confirm",
  "userId": "user_id",
  "secret": "recovery_token",
  "password": "new_password",
  "passwordAgain": "new_password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password recovery email sent successfully"
}
```

## Error Responses

Common error response format:
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```

### Common HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `404` - Not Found (user not found)
- `409` - Conflict (duplicate email)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

## Authentication Flow

1. **Registration**: User registers → Verification email sent automatically
2. **Email Verification**: User clicks link → Account verified
3. **Login**: User logs in → Session cookie set
4. **API Access**: Include session cookie in requests
5. **Logout**: User logs out → Session deleted

## Security Features

- HTTP-only cookies for session management
- Automatic email verification on registration
- Password strength requirements (minimum 8 characters)
- Rate limiting on authentication attempts
- Secure cookie settings (production)
- Session validation on protected endpoints
- Automatic session cleanup on errors

## Environment Variables Required

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
# Appwrite credentials in /lib/appwrite/kdsm.js
```

## Frontend Integration Examples

### Registration
```javascript
const register = async (email, password, name) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  return response.json();
};
```

### Login
```javascript
const login = async (email, password) => {
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include' // Important for cookies
  });
  return response.json();
};
```

### Check Session
```javascript
const checkSession = async () => {
  const response = await fetch('/api/auth/session', {
    credentials: 'include'
  });
  return response.json();
};
```

### Send Verification Email
```javascript
const sendVerificationEmail = async () => {
  const response = await fetch('/api/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create' }),
    credentials: 'include'
  });
  return response.json();
};
```
