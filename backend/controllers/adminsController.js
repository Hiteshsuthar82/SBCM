const Admin = require('../models/Admin');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const { successResponse, errorResponse } = require('../utils/responseUtil');

const getAdmins = async (req, res) => {
  const { page = 1, limit = 10, search = '', role = '', status = 'all' } = req.query;
  
  try {
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;
    if (status !== 'all') filter.isActive = status === 'active';

    const admins = await Admin.find(filter)
      .populate('role', 'name permissions')
      .select('-password')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Admin.countDocuments(filter);
    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    };

    return successResponse(res, admins, '', pagination);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getAdminById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const admin = await Admin.findById(id)
      .populate('role', 'name permissions')
      .select('-password');
    
    if (!admin) {
      return errorResponse(res, 'Admin not found', 404);
    }

    return successResponse(res, admin);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const createAdmin = async (req, res) => {
  const { email, password, name, role } = req.body;
  
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return errorResponse(res, 'Admin with this email already exists', 400);
    }

    // Verify role exists
    const roleDoc = await Role.findById(role);
    if (!roleDoc) {
      return errorResponse(res, 'Invalid role specified', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = new Admin({
      email,
      password: hashedPassword,
      name,
      role,
      permissions: roleDoc.permissions
    });

    await admin.save();
    await admin.populate('role', 'name permissions');

    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    return successResponse(res, adminResponse, 'Admin created successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  
  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return errorResponse(res, 'Admin not found', 404);
    }

    // Check if email is being changed and if it already exists
    if (email && email !== admin.email) {
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return errorResponse(res, 'Admin with this email already exists', 400);
      }
    }

    const updateData = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 12);

    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('role', 'name permissions').select('-password');

    return successResponse(res, updatedAdmin, 'Admin updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const changeAdminRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  try {
    // Verify role exists
    const roleDoc = await Role.findById(role);
    if (!roleDoc) {
      return errorResponse(res, 'Invalid role specified', 400);
    }

    const admin = await Admin.findByIdAndUpdate(
      id,
      { 
        role, 
        permissions: roleDoc.permissions,
        updatedAt: new Date() 
      },
      { new: true }
    ).populate('role', 'name permissions').select('-password');

    if (!admin) {
      return errorResponse(res, 'Admin not found', 404);
    }

    return successResponse(res, admin, 'Admin role updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const activateAdmin = async (req, res) => {
  const { id } = req.params;
  
  try {
    const admin = await Admin.findByIdAndUpdate(
      id,
      { isActive: true, updatedAt: new Date() },
      { new: true }
    ).populate('role', 'name permissions').select('-password');

    if (!admin) {
      return errorResponse(res, 'Admin not found', 404);
    }

    return successResponse(res, admin, 'Admin activated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const deactivateAdmin = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Prevent deactivating self
    if (id === req.user.id) {
      return errorResponse(res, 'You cannot deactivate your own account', 400);
    }

    const admin = await Admin.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    ).populate('role', 'name permissions').select('-password');

    if (!admin) {
      return errorResponse(res, 'Admin not found', 404);
    }

    return successResponse(res, admin, 'Admin deactivated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const deleteAdmin = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Prevent deleting self
    if (id === req.user.id) {
      return errorResponse(res, 'You cannot delete your own account', 400);
    }

    const admin = await Admin.findByIdAndDelete(id);
    
    if (!admin) {
      return errorResponse(res, 'Admin not found', 404);
    }

    return successResponse(res, null, 'Admin deleted successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  changeAdminRole,
  activateAdmin,
  deactivateAdmin,
  deleteAdmin
};