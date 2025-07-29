const QuickTour = require('../models/QuickTour');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { successResponse, errorResponse } = require('../utils/responseUtil');

const getQuickTours = async (req, res) => {
  try {
    const { role } = req.user;
    let tours;

    if (role === 'user') {
      // Get tours for regular users
      tours = await QuickTour.find({
        enabled: true,
        $or: [
          { requiredRoles: { $size: 0 } }, // Tours for all users
          { requiredRoles: { $in: ['user'] } }
        ]
      }).sort({ createdAt: -1 });
    } else {
      // Get tours for admins based on their role
      const admin = await Admin.findById(req.user.id).populate('role');
      tours = await QuickTour.find({
        enabled: true,
        $or: [
          { requiredRoles: { $size: 0 } }, // Tours for all
          { requiredRoles: { $in: [admin.role._id] } }
        ]
      }).populate('requiredRoles', 'name').sort({ createdAt: -1 });
    }

    return successResponse(res, tours);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getQuickTourById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const tour = await QuickTour.findById(id).populate('requiredRoles', 'name');
    
    if (!tour) {
      return errorResponse(res, 'Quick tour not found', 404);
    }

    return successResponse(res, tour);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const createQuickTour = async (req, res) => {
  const { name, description, steps, requiredRoles, enabled, autoStart, showForNewUsers, showForReturningUsers } = req.body;
  
  try {
    const tour = new QuickTour({
      name,
      description,
      steps,
      requiredRoles: requiredRoles || [],
      enabled: enabled !== undefined ? enabled : true,
      autoStart: autoStart || false,
      showForNewUsers: showForNewUsers !== undefined ? showForNewUsers : true,
      showForReturningUsers: showForReturningUsers || false
    });

    await tour.save();
    await tour.populate('requiredRoles', 'name');

    return successResponse(res, tour, 'Quick tour created successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const updateQuickTour = async (req, res) => {
  const { id } = req.params;
  const { name, description, steps, requiredRoles, enabled, autoStart, showForNewUsers, showForReturningUsers } = req.body;
  
  try {
    const tour = await QuickTour.findByIdAndUpdate(
      id,
      {
        name,
        description,
        steps,
        requiredRoles: requiredRoles || [],
        enabled: enabled !== undefined ? enabled : true,
        autoStart: autoStart || false,
        showForNewUsers: showForNewUsers !== undefined ? showForNewUsers : true,
        showForReturningUsers: showForReturningUsers || false,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('requiredRoles', 'name');

    if (!tour) {
      return errorResponse(res, 'Quick tour not found', 404);
    }

    return successResponse(res, tour, 'Quick tour updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const deleteQuickTour = async (req, res) => {
  const { id } = req.params;
  
  try {
    const tour = await QuickTour.findByIdAndDelete(id);
    
    if (!tour) {
      return errorResponse(res, 'Quick tour not found', 404);
    }

    return successResponse(res, null, 'Quick tour deleted successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const assignTourToRoles = async (req, res) => {
  const { id } = req.params;
  const { roles } = req.body;
  
  try {
    const tour = await QuickTour.findByIdAndUpdate(
      id,
      { requiredRoles: roles, updatedAt: new Date() },
      { new: true }
    ).populate('requiredRoles', 'name');

    if (!tour) {
      return errorResponse(res, 'Quick tour not found', 404);
    }

    return successResponse(res, tour, 'Tour assigned to roles successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const markTourCompleted = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  
  try {
    // For now, we'll just return success as tour completion tracking
    // can be implemented on frontend or with a separate collection
    const tour = await QuickTour.findById(id);
    
    if (!tour) {
      return errorResponse(res, 'Quick tour not found', 404);
    }

    // Here you could implement tour completion tracking
    // For example, create a TourCompletion model to track which users completed which tours

    return successResponse(res, { tourId: id, userId: userId || req.user.id }, 'Tour marked as completed');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getQuickTours,
  getQuickTourById,
  createQuickTour,
  updateQuickTour,
  deleteQuickTour,
  assignTourToRoles,
  markTourCompleted
};