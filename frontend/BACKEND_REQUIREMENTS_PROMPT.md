# COMPREHENSIVE BACKEND REQUIREMENTS FOR SURAT BRTS COMPLAINT MANAGEMENT SYSTEM (SBCMS)

## OVERVIEW

Create a complete Node.js/Express backend for the Surat BRTS Complaint Management System with MongoDB database, JWT authentication, file upload support, FCM push notifications, and comprehensive API endpoints.

## TECHNOLOGY STACK REQUIREMENTS

- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with role-based access control
- **File Storage**: Multer for file uploads (images/videos)
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **OTP Service**: 2factor.in integration (with bypass mode for development)
- **API Documentation**: Swagger/OpenAPI
- **Security**: CORS, helmet, rate limiting
- **Environment**: Environment-based configuration

## BASE API CONFIGURATION

- **Base URL**: `http://localhost:5000/api`
- **Response Format**: All responses must follow this structure:

```json
{
  "success": boolean,
  "data": any, // response data
  "message": string, // optional success message
  "error": string, // error message (only when success: false)
  "pagination": { // only for paginated endpoints
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

## DATABASE SCHEMAS/MODELS

### 1. User Schema

```javascript
// Collection: users
{
  _id: ObjectId,
  name: String (required),
  mobile: String (required, unique, 10 digits),
  email: String (optional, unique when provided),
  address: String (optional),
  aadhaar: String (optional, 12 digits),
  profession: String (optional),
  language: String (default: "en"),
  photo: String (optional, file path),
  points: Number (default: 0),
  paymentDetails: {
    upiId: String (optional),
    bankAccount: String (optional),
    ifsc: String (optional)
  },
  progress: Number (default: 0, profile completion percentage),
  isActive: Boolean (default: true),
  fcmTokens: [{
    token: String,
    platform: String, // "web", "android", "ios"
    createdAt: Date
  }],
  lastLogin: Date,
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### 2. Admin Schema

```javascript
// Collection: admins
{
  _id: ObjectId,
  email: String (required, unique),
  password: String (required, hashed),
  name: String (required),
  role: String (required, enum: ["sub_admin", "admin", "super_admin"]),
  permissions: [String], // array of permission names
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### 3. Complaint Schema

```javascript
// Collection: complaints
{
  _id: ObjectId,
  token: String (required, unique, auto-generated format: "BRTS001"),
  type: String (required),
  description: String (required),
  stop: String (required),
  dateTime: Date (optional),
  location: {
    latitude: Number (optional),
    longitude: Number (optional),
    address: String (optional)
  },
  evidence: [String], // array of file paths
  status: String (required, enum: ["pending", "under_review", "approved", "rejected"], default: "pending"),
  reason: String (optional, reason for rejection),
  adminDescription: String (optional),
  timeline: [{
    action: String (required),
    status: String (required),
    reason: String (optional),
    description: String (optional),
    adminId: ObjectId (optional, ref: "Admin"),
    adminName: String (optional),
    timestamp: Date (default: Date.now)
  }],
  points: Number (optional, awarded points),
  userId: ObjectId (required, ref: "User"),
  assignedTo: ObjectId (optional, ref: "Admin"),
  priority: String (enum: ["low", "medium", "high"], default: "medium"),
  dynamicFields: Object (optional, for custom fields),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### 4. Announcement Schema

```javascript
// Collection: announcements
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  image: String (optional, file path),
  route: String (optional),
  scheduledAt: Date (optional),
  isActive: Boolean (default: true),
  likes: [{
    userId: ObjectId (ref: "User"),
    createdAt: Date (default: Date.now)
  }],
  dislikes: [{
    userId: ObjectId (ref: "User"),
    createdAt: Date (default: Date.now)
  }],
  views: [{
    userId: ObjectId (ref: "User"),
    viewedAt: Date (default: Date.now)
  }],
  createdBy: ObjectId (required, ref: "Admin"),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### 5. Rule Schema

```javascript
// Collection: rules
{
  _id: ObjectId,
  category: String (required),
  description: String (required),
  isActive: Boolean (default: true),
  order: Number (default: 0),
  createdBy: ObjectId (required, ref: "Admin"),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### 6. Withdrawal Schema

```javascript
// Collection: withdrawals
{
  _id: ObjectId,
  userId: ObjectId (required, ref: "User"),
  points: Number (required),
  method: String (required, enum: ["UPI", "Bank Transfer"]),
  status: String (required, enum: ["pending", "processing", "approved", "rejected"], default: "pending"),
  reason: String (optional),
  description: String (optional),
  paymentDetails: {
    upiId: String (optional),
    bankAccount: String (optional),
    ifsc: String (optional),
    accountHolderName: String (optional)
  },
  timeline: [{
    action: String (required),
    status: String (required),
    reason: String (optional),
    description: String (optional),
    adminId: ObjectId (optional, ref: "Admin"),
    adminName: String (optional),
    timestamp: Date (default: Date.now)
  }],
  processedBy: ObjectId (optional, ref: "Admin"),
  transactionId: String (optional),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### 7. BusStop Schema

```javascript
// Collection: busstops
{
  _id: ObjectId,
  name: String (required),
  code: String (required, unique, uppercase),
  route: String (required),
  latitude: Number (optional),
  longitude: Number (optional),
  address: String (optional),
  enabled: Boolean (default: true),
  order: Number (default: 0),
  createdBy: ObjectId (required, ref: "Admin"),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### 8. SystemConfig Schema

```javascript
// Collection: systemconfigs
{
  _id: ObjectId,
  key: String (required, unique),
  value: Mixed (required),
  type: String (required, enum: ["boolean", "string", "number", "object", "array"]),
  description: String (optional),
  category: String (default: "general"),
  isSystem: Boolean (default: false), // prevent deletion if true
  updatedBy: ObjectId (optional, ref: "Admin"),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### 9. QuickTour Schema

```javascript
// Collection: quicktours
{
  _id: ObjectId,
  name: String (required),
  description: String (optional),
  targetRoles: [String] (required), // ["user", "admin", "sub_admin", "super_admin"]
  enabled: Boolean (default: true),
  steps: [{
    id: String (required),
    title: String (required),
    description: String (required),
    iconName: String (required), // icon component name
    target: String (optional), // CSS selector
    action: {
      text: String (optional),
      href: String (optional)
    }
  }],
  completions: [{
    userId: ObjectId (ref: "User"),
    adminId: ObjectId (ref: "Admin"),
    completedAt: Date (default: Date.now)
  }],
  createdBy: ObjectId (required, ref: "Admin"),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### 10. Role Schema

```javascript
// Collection: roles
{
  _id: ObjectId,
  name: String (required, unique),
  displayName: String (required),
  permissions: [String] (required),
  description: String (optional),
  isSystem: Boolean (default: false), // prevent deletion if true
  hierarchy: Number (default: 0), // for approval hierarchy
  createdBy: ObjectId (optional, ref: "Admin"),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### 11. ActionHistory Schema

```javascript
// Collection: actionhistories
{
  _id: ObjectId,
  userId: ObjectId (optional, ref: "User"),
  adminId: ObjectId (optional, ref: "Admin"),
  action: String (required),
  resource: String (required), // "complaint", "withdrawal", "user", etc.
  resourceId: ObjectId (optional),
  details: Object (optional),
  ipAddress: String (optional),
  userAgent: String (optional),
  createdAt: Date (default: Date.now)
}
```

### 12. PointsHistory Schema

```javascript
// Collection: pointshistories
{
  _id: ObjectId,
  userId: ObjectId (required, ref: "User"),
  type: String (required, enum: ["earned", "redeemed", "adjusted"]),
  points: Number (required),
  description: String (required),
  source: String (required), // "complaint_submission", "complaint_approval", "withdrawal", "admin_adjustment"
  referenceId: ObjectId (optional), // complaint or withdrawal ID
  adminId: ObjectId (optional, ref: "Admin"),
  createdAt: Date (default: Date.now)
}
```

## API ENDPOINTS SPECIFICATION

### AUTHENTICATION ENDPOINTS

#### POST /api/auth/register

```json
Request: {
  "name": "string (required)",
  "mobile": "string (required, 10 digits)"
}
Response: {
  "success": true,
  "data": {
    "sessionId": "string",
    "message": "OTP sent successfully"
  }
}
```

#### POST /api/auth/login

```json
Request: {
  "mobile": "string (required)",
  "otp": "string (required, 6 digits)",
  "sessionId": "string (required)"
}
Response: {
  "success": true,
  "data": {
    "token": "string (JWT token)",
    "user": {
      "id": "string",
      "name": "string",
      "mobile": "string",
      "email": "string",
      "points": "number",
      "progress": "number",
      "language": "string"
    }
  }
}
```

#### POST /api/auth/admin/login

```json
Request: {
  "email": "string (required)",
  "password": "string (required)"
}
Response: {
  "success": true,
  "data": {
    "token": "string (JWT token)",
    "admin": {
      "id": "string",
      "email": "string",
      "name": "string",
      "role": "string",
      "permissions": ["string"]
    }
  }
}
```

### COMPLAINT ENDPOINTS

#### POST /api/complaints

```json
Request: FormData {
  type: "string (required)",
  description: "string (required)",
  stop: "string (required)",
  dateTime: "string (optional, ISO date)",
  latitude: "number (optional)",
  longitude: "number (optional)",
  address: "string (optional)",
  evidence: "File[] (optional, max 5 files)",
  dynamicFields: "string (optional, JSON object)"
}
Response: {
  "success": true,
  "data": {
    "id": "string",
    "token": "string",
    "status": "pending",
    "points": "number (if awarded for submission)"
  }
}
```

#### GET /api/complaints/track/:token

```json
Response: {
  "success": true,
  "data": {
    "id": "string",
    "token": "string",
    "type": "string",
    "description": "string",
    "stop": "string",
    "status": "string",
    "timeline": [ComplaintTimeline],
    "points": "number",
    "createdAt": "string"
  }
}
```

#### GET /api/complaints/history

```json
Query Parameters: ?page=1&limit=10&status=all&type=all
Response: {
  "success": true,
  "data": [Complaint],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### GET /api/complaints (Admin only)

```json
Query Parameters: ?page=1&limit=10&status=all&priority=all&assignedTo=all
Response: {
  "success": true,
  "data": [ComplaintWithUser],
  "pagination": PaginationInfo
}
```

#### PUT /api/complaints/:id/approve (Admin only)

```json
Request: {
  "status": "string (required, approved/rejected)",
  "reason": "string (optional)",
  "description": "string (required)",
  "points": "number (optional, for approved complaints)"
}
Response: {
  "success": true,
  "data": {
    "complaint": ComplaintObject,
    "pointsAwarded": "number"
  }
}
```

### WITHDRAWAL ENDPOINTS

#### POST /api/withdrawals

```json
Request: {
  "points": "number (required, min: configurable)",
  "method": "string (required, UPI/Bank Transfer)",
  "paymentDetails": {
    "upiId": "string (for UPI)",
    "bankAccount": "string (for bank transfer)",
    "ifsc": "string (for bank transfer)",
    "accountHolderName": "string"
  }
}
Response: {
  "success": true,
  "data": {
    "id": "string",
    "status": "pending",
    "estimatedProcessingTime": "string"
  }
}
```

#### GET /api/withdrawals

```json
Query Parameters (Admin): ?page=1&limit=10&status=all&userId=all
Response: {
  "success": true,
  "data": [WithdrawalWithUser],
  "pagination": PaginationInfo
}
```

#### PUT /api/withdrawals/:id/approve (Admin only)

```json
Request: {
  "status": "string (required, approved/rejected/processing)",
  "reason": "string (optional)",
  "description": "string (optional)",
  "transactionId": "string (optional, for approved withdrawals)"
}
Response: {
  "success": true,
  "data": WithdrawalObject
}
```

### ANNOUNCEMENT ENDPOINTS

#### POST /api/announcements (Admin only)

```json
Request: FormData {
  title: "string (required)",
  description: "string (required)",
  image: "File (optional)",
  route: "string (optional)",
  scheduledAt: "string (optional, ISO date)"
}
Response: {
  "success": true,
  "data": AnnouncementObject
}
```

#### GET /api/announcements

```json
Query Parameters: ?page=1&limit=10&route=all
Response: {
  "success": true,
  "data": [AnnouncementWithStats],
  "pagination": PaginationInfo
}
```

#### POST /api/announcements/:id/like

```json
Response: {
  "success": true,
  "data": {
    "likes": "number",
    "userLiked": true
  }
}
```

### USER MANAGEMENT ENDPOINTS (Admin only)

#### GET /api/users

```json
Query Parameters: ?page=1&limit=10&search=&status=all
Response: {
  "success": true,
  "data": [UserWithStats],
  "pagination": PaginationInfo
}
```

#### GET /api/users/:id

```json
Response: {
  "success": true,
  "data": {
    "user": UserObject,
    "stats": {
      "totalComplaints": "number",
      "approvedComplaints": "number",
      "totalPoints": "number",
      "totalWithdrawals": "number",
      "joinDate": "string"
    }
  }
}
```

### ANALYTICS ENDPOINTS (Admin only)

#### GET /api/analytics/dashboard

```json
Query Parameters: ?timeRange=7d
Response: {
  "success": true,
  "data": {
    "complaints": {
      "total": "number",
      "pending": "number",
      "approved": "number",
      "rejected": "number",
      "dailyTrend": [DailyTrendData],
      "categoryBreakdown": [CategoryData]
    },
    "users": {
      "total": "number",
      "active": "number",
      "newThisMonth": "number",
      "retention": "number",
      "deviceBreakdown": [DeviceData]
    },
    "system": {
      "uptime": "number",
      "responseTime": "number",
      "errorRate": "number",
      "performanceScore": "number"
    },
    "withdrawals": {
      "total": "number",
      "amount": "number",
      "pending": "number",
      "approved": "number"
    }
  }
}
```

### CONFIGURATION ENDPOINTS (Admin only)

#### GET /api/config

```json
Response: {
  "success": true,
  "data": {
    "enableRewards": "boolean",
    "enableLeaderboards": "boolean",
    "complaintTypes": [ComplaintTypeObject],
    "pointsConfig": PointsConfigObject,
    "dynamicFields": DynamicFieldsObject,
    // ... all system configurations
  }
}
```

#### PUT /api/config

```json
Request: {
  "key": "string (required)",
  "value": "any (required)"
}
Response: {
  "success": true,
  "data": {
    "key": "string",
    "value": "any",
    "updatedAt": "string"
  }
}
```

### BUS STOPS ENDPOINTS (Admin only)

#### GET /api/bus-stops

```json
Query Parameters: ?route=all&enabled=all
Response: {
  "success": true,
  "data": [BusStopObject]
}
```

#### POST /api/bus-stops (Admin only)

```json
Request: {
  "name": "string (required)",
  "code": "string (required, 3-5 chars)",
  "route": "string (required)",
  "latitude": "number (optional)",
  "longitude": "number (optional)",
  "address": "string (optional)"
}
Response: {
  "success": true,
  "data": BusStopObject
}
```

### FCM NOTIFICATION ENDPOINTS

#### POST /api/fcm/update-token

```json
Request: {
  "token": "string (required)",
  "platform": "string (required, web/android/ios)"
}
Response: {
  "success": true,
  "message": "Token updated successfully"
}
```

#### POST /api/fcm/send-to-user (Admin only)

```json
Request: {
  "userId": "string (required)",
  "title": "string (required)",
  "body": "string (required)",
  "data": "object (optional)"
}
Response: {
  "success": true,
  "data": {
    "messageId": "string",
    "sent": "boolean"
  }
}
```

## MIDDLEWARE REQUIREMENTS

### 1. Authentication Middleware

- Verify JWT tokens
- Attach user/admin data to request object
- Handle token expiration

### 2. Authorization Middleware

- Role-based access control
- Permission checking
- Hierarchy-based approval rights

### 3. File Upload Middleware

- Support for images and videos
- File size limits (max 10MB per file)
- File type validation
- Automatic file compression

### 4. Rate Limiting

- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- File upload: 10 requests per hour

### 5. Validation Middleware

- Request body validation using Joi or similar
- File validation
- Sanitization

## SPECIAL FEATURES REQUIREMENTS

### 1. OTP Integration

- Use 2factor.in API for OTP sending
- Implement bypass mode for development (OTP: 123456)
- 6-digit OTP with 10-minute expiry
- Rate limiting for OTP requests

### 2. FCM Push Notifications

- User notification for complaint status updates
- Admin notification for new complaints
- Broadcast announcements
- Token management for multiple devices

### 3. File Management

- Secure file upload with virus scanning
- Image optimization and compression
- Multiple format support (JPG, PNG, MP4, etc.)
- Secure file serving with authentication

### 4. Points System

- Automatic point calculation
- Point history tracking
- Configurable point values
- Point expiry (optional)

### 5. Real-time Features

- WebSocket support for real-time updates
- Live complaint status updates
- Admin notification system

## DEPLOYMENT REQUIREMENTS

### Environment Variables

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sbcms
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# OTP Service
TWOFACTOR_API_KEY=your-api-key
OTP_BYPASS_MODE=true

# FCM
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,video/mp4

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### API Security Requirements

- CORS configuration
- Helmet for security headers
- Input sanitization
- SQL injection prevention
- XSS protection
- File upload security

### Database Indexes

```javascript
// Required indexes for performance
users: { mobile: 1 }, { email: 1 }
complaints: { token: 1 }, { userId: 1 }, { status: 1 }, { createdAt: -1 }
withdrawals: { userId: 1 }, { status: 1 }, { createdAt: -1 }
announcements: { createdAt: -1 }, { route: 1 }
busstops: { code: 1 }, { route: 1 }
actionhistories: { createdAt: -1 }, { adminId: 1 }, { userId: 1 }
pointshistories: { userId: 1 }, { createdAt: -1 }
```

## ERROR HANDLING REQUIREMENTS

- Consistent error response format
- Proper HTTP status codes
- Detailed error logging
- User-friendly error messages
- Development vs production error details

## TESTING REQUIREMENTS

- Unit tests for all endpoints
- Integration tests for workflows
- Mock data seeding
- API documentation with examples
- Postman collection generation

This comprehensive backend should support all the frontend functionality I've implemented, including the advanced features like role-based permissions, quick tours, analytics, and file management.
