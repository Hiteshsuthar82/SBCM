const Role = require('../models/Role');
const Admin = require('../models/Admin');
const ActionHistory = require('../models/ActionHistory');
const { successResponse, errorResponse } = require('../utils/responseUtil');

const getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });
    return successResponse(res, roles);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getRoleById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const role = await Role.findById(id);
    
    if (!role) {
      return errorResponse(res, 'Role not found', 404);
    }

    return successResponse(res, role);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const createRole = async (req, res) => {
  const { name, permissions } = req.body;
  
  try {
    // Check if role name already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return errorResponse(res, 'Role name already exists', 400);
    }

    const role = new Role({
      name,
      permissions
    });

    await role.save();

    // Log action history
    await ActionHistory.create({
      adminId: req.user.id,
      action: 'create',
      resource: 'role',
      resourceId: role._id,
      details: `Created role: ${name} with ${Object.keys(permissions || {}).length} permissions`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return successResponse(res, role, 'Role created successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const updateRole = async (req, res) => {
  const { id } = req.params;
  const { name, permissions } = req.body;
  
  try {
    // Check if role name already exists (excluding current role)
    const existingRole = await Role.findOne({ name, _id: { $ne: id } });
    if (existingRole) {
      return errorResponse(res, 'Role name already exists', 400);
    }

    const role = await Role.findByIdAndUpdate(
      id,
      { name, permissions, updatedAt: new Date() },
      { new: true }
    );

    if (!role) {
      return errorResponse(res, 'Role not found', 404);
    }

    // Log action history
    await ActionHistory.create({
      adminId: req.user.id,
      action: 'update',
      resource: 'role',
      resourceId: role._id,
      details: `Updated role: ${name} with ${Object.keys(permissions || {}).length} permissions`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return successResponse(res, role, 'Role updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const deleteRole = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if any admins are using this role
    const adminsWithRole = await Admin.countDocuments({ role: id });
    if (adminsWithRole > 0) {
      return errorResponse(res, 'Cannot delete role. It is assigned to one or more admins.', 400);
    }

    const role = await Role.findById(id);
    if (!role) {
      return errorResponse(res, 'Role not found', 404);
    }

    const roleName = role.name;
    await Role.findByIdAndDelete(id);

    // Log action history
    await ActionHistory.create({
      adminId: req.user.id,
      action: 'delete',
      resource: 'role',
      resourceId: id,
      details: `Deleted role: ${roleName}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return successResponse(res, null, 'Role deleted successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
};