const ActionHistory = require('../models/ActionHistory');
const { successResponse, errorResponse } = require('../utils/responseUtil');

const getActionHistory = async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    adminId = '', 
    action = '', 
    resource = '',
    startDate = '', 
    endDate = '' 
  } = req.query;
  
  try {
    const filter = {};
    
    if (adminId) filter.adminId = adminId;
    if (action) filter.action = { $regex: action, $options: 'i' };
    if (resource) filter.resource = { $regex: resource, $options: 'i' };
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const actions = await ActionHistory.find(filter)
      .populate('adminId', 'name email role')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Transform the data to match frontend expectations
    const transformedActions = actions.map(action => ({
      id: action._id,
      adminId: action.adminId?._id,
      adminName: action.adminId?.name || 'Unknown Admin',
      adminRole: action.adminId?.role || 'Unknown',
      action: action.action,
      entity: action.resource, // Map resource to entity for frontend compatibility
      entityId: action.resourceId,
      timestamp: action.createdAt,
      details: action.details,
      ipAddress: action.ipAddress,
      userAgent: action.userAgent,
      performedBy: {
        name: action.adminId?.name || 'Unknown Admin',
        role: action.adminId?.role || 'Unknown'
      }
    }));

    const total = await ActionHistory.countDocuments(filter);
    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    };

    return successResponse(res, transformedActions, '', pagination);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getActionById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const action = await ActionHistory.findById(id)
      .populate('adminId', 'name email role');
    
    if (!action) {
      return errorResponse(res, 'Action history not found', 404);
    }

    return successResponse(res, action);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getActionHistory,
  getActionById
};