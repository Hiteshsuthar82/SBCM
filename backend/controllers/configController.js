const SystemConfig = require('../models/SystemConfig');
const { successResponse, errorResponse } = require('../utils/responseUtil');

const getConfig = async (req, res) => {
  try {
    const configs = await SystemConfig.find({});
    const configMap = configs.reduce((acc, c) => ({ ...acc, [c.key]: c.value }), {});
    return successResponse(res, configMap);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const updateConfig = async (req, res) => {
  const { key, value } = req.body;
  try {
    let config = await SystemConfig.findOne({ key });
    if (!config) {
      config = new SystemConfig({ key, value, type: typeof value });
    } else {
      config.value = value;
      config.updatedBy = req.user.id;
    }
    await config.save();
    return successResponse(res, { key: config.key, value: config.value, updatedAt: config.updatedAt });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const bulkUpdateConfig = async (req, res) => {
  const { configs } = req.body;
  
  try {
    const results = [];
    
    for (const { key, value } of configs) {
      let config = await SystemConfig.findOne({ key });
      if (!config) {
        config = new SystemConfig({ key, value, type: typeof value });
      } else {
        config.value = value;
        config.updatedBy = req.user.id;
      }
      await config.save();
      results.push({ key: config.key, value: config.value });
    }

    return successResponse(res, results, 'Configurations updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getComplaintTypes = async (req, res) => {
  try {
    const config = await SystemConfig.findOne({ key: 'complaintTypes' });
    const defaultTypes = [
      { id: 'cleanliness', name: 'Cleanliness', icon: 'cleaning' },
      { id: 'safety', name: 'Safety', icon: 'shield' },
      { id: 'maintenance', name: 'Maintenance', icon: 'tools' },
      { id: 'overcrowding', name: 'Overcrowding', icon: 'users' },
      { id: 'driver_behavior', name: 'Driver Behavior', icon: 'user' },
      { id: 'schedule', name: 'Schedule Issues', icon: 'clock' },
      { id: 'accessibility', name: 'Accessibility', icon: 'accessibility' },
      { id: 'other', name: 'Other', icon: 'help' }
    ];
    
    return successResponse(res, config ? config.value : defaultTypes);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const updateComplaintTypes = async (req, res) => {
  const { types } = req.body;
  
  try {
    let config = await SystemConfig.findOne({ key: 'complaintTypes' });
    if (!config) {
      config = new SystemConfig({ 
        key: 'complaintTypes', 
        value: types, 
        type: 'array' 
      });
    } else {
      config.value = types;
      config.updatedBy = req.user.id;
    }
    await config.save();
    
    return successResponse(res, config.value, 'Complaint types updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = { getConfig, updateConfig, bulkUpdateConfig, getComplaintTypes, updateComplaintTypes };