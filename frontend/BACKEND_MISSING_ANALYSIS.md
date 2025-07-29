# Backend Missing Components Analysis

Based on the frontend requirements and your backend structure, here are the missing components:

## Missing Models:

1. **QuickTour.js** - For role-based tour management
2. **BusStop.js** - For customizable bus stops
3. **ComplaintType.js** - For dynamic complaint types
4. **Permission.js** - For granular permission system

## Missing Routes & Controllers:

1. **quickTours.js** route & **quickTourController.js**
2. **busStops.js** route & **busStopController.js**
3. **complaintTypes.js** route & **complaintTypeController.js**
4. **users.js** route & **userController.js** (for admin user management)
5. **permissions.js** route & **permissionController.js**

## Missing API Endpoints:

1. User management endpoints for admins
2. Bus stops CRUD endpoints
3. Quick tour management endpoints
4. Granular permission management endpoints
5. Complaint types management endpoints

---

# GROK PROMPT TO COMPLETE MISSING BACKEND

Create the following missing backend components for the SBCMS (Surat BRTS Complaint Management System):

## 1. Missing Models

### A) QuickTour.js Model

```javascript
// src/models/QuickTour.js
const mongoose = require("mongoose");

const tourStepSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  target: { type: String, required: true },
  placement: {
    type: String,
    enum: ["top", "bottom", "left", "right"],
    default: "bottom",
  },
  action: {
    type: { type: String, enum: ["click", "navigate"] },
    href: { type: String },
  },
});

const quickTourSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    steps: [tourStepSchema],
    requiredRoles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
    enabled: { type: Boolean, default: true },
    autoStart: { type: Boolean, default: false },
    showForNewUsers: { type: Boolean, default: true },
    showForReturningUsers: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("QuickTour", quickTourSchema);
```

### B) BusStop.js Model

```javascript
// src/models/BusStop.js
const mongoose = require("mongoose");

const busStopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    route: { type: String },
    active: { type: Boolean, default: true },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("BusStop", busStopSchema);
```

### C) ComplaintType.js Model

```javascript
// src/models/ComplaintType.js
const mongoose = require("mongoose");

const complaintTypeSchema = new mongoose.Schema(
  {
    value: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    color: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    pointsAwarded: { type: Number, default: 10 },
    order: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ComplaintType", complaintTypeSchema);
```

### D) Permission.js Model

```javascript
// src/models/Permission.js
const mongoose = require("mongoose");

const subPermissionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  default: { type: Boolean, default: false },
});

const permissionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    isRequired: { type: Boolean, default: false },
    dependsOn: [{ type: String }],
    subPermissions: [subPermissionSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Permission", permissionSchema);
```

## 2. Missing Routes

### A) quickTours.js Route

Create routes for:

- GET /quick-tours - Get all tours for current user's role
- POST /quick-tours - Create new tour (admin only)
- PUT /quick-tours/:id - Update tour
- DELETE /quick-tours/:id - Delete tour
- PUT /quick-tours/:id/assign - Assign tour to roles

### B) busStops.js Route

Create routes for:

- GET /bus-stops - Get all bus stops
- POST /bus-stops - Create bus stop
- PUT /bus-stops/:id - Update bus stop
- DELETE /bus-stops/:id - Delete bus stop
- PUT /bus-stops/:id/activate - Activate/deactivate

### C) complaintTypes.js Route

Create routes for:

- GET /complaint-types - Get all complaint types
- POST /complaint-types - Create complaint type
- PUT /complaint-types/:id - Update complaint type
- DELETE /complaint-types/:id - Delete complaint type

### D) users.js Route (for admin user management)

Create routes for:

- GET /users - Get all users (admin only)
- GET /users/:id - Get specific user
- PUT /users/:id - Update user
- PUT /users/:id/activate - Activate user
- PUT /users/:id/deactivate - Deactivate user
- DELETE /users/:id - Delete user

### E) admins.js Route (for admin management)

Create routes for:

- GET /admins - Get all admins
- POST /admins - Create admin
- PUT /admins/:id/role - Change admin role
- PUT /admins/:id/activate - Activate admin
- PUT /admins/:id/deactivate - Deactivate admin

## 3. Missing Controllers

Create controllers for all the above routes with proper:

- Permission checks using roleMiddleware.js
- Input validation
- Error handling
- Action logging for audit trail
- Super admin privilege handling

## 4. Required Permissions

Add these new permissions to your Role model:

- manageQuickTours
- manageBusStops
- manageComplaintTypes
- manageUsers
- manageAdmins
- viewUserActivity
- viewAdminActivity

## 5. Additional API Endpoints Needed

### A) Enhanced Config Endpoints

- PUT /config/bulk - Update multiple config values
- GET /config/complaint-types - Get complaint type configurations
- PUT /config/complaint-types - Update complaint type configurations

### B) Analytics Endpoints

- GET /analytics/dashboard - Dashboard charts data
- GET /analytics/complaints - Complaint analytics
- GET /analytics/users - User activity analytics

### C) Activity Logging Endpoints

- GET /activity/:userId - Get user activity logs
- GET /activity/admin/:adminId - Get admin activity logs

## Implementation Requirements:

1. **Use existing middleware**: authMiddleware.js, roleMiddleware.js
2. **Follow existing patterns**: Use same response format {data} or {msg, error}
3. **Add proper validation**: Validate all inputs in controllers
4. **Implement permissions**: Check permissions for each endpoint
5. **Add audit logging**: Log all actions using logUtils.js
6. **Handle file uploads**: Use uploadMiddleware.js where needed
7. **Rate limiting**: Apply appropriate rate limits

## Integration Notes:

1. Update your existing Complaint model to reference ComplaintType
2. Update Role model to include the new permissions
3. Add bus stop validation in complaint creation
4. Seed initial data for permissions and complaint types
5. Add proper indexing for performance

Please generate all the missing route files, controller files, and any additional middleware needed to complete this backend implementation following your existing code patterns and structure.
