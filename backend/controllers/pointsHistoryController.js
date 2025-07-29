const PointsHistory = require('../models/PointsHistory');
const { successResponse, errorResponse } = require('../utils/responseUtil');

const getPointsHistory = async (req, res) => {
  const { page = 1, limit = 20, type = '' } = req.query;
  
  try {
    const filter = { userId: req.user.id };
    if (type) filter.type = type;

    const history = await PointsHistory.find(filter)
      .populate('relatedId') // This could be complaint ID, withdrawal ID, etc.
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await PointsHistory.countDocuments(filter);
    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    };

    return successResponse(res, history, '', pagination);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getPointsHistoryByUser = async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20, type = '' } = req.query;
  
  try {
    const filter = { userId };
    if (type) filter.type = type;

    const history = await PointsHistory.find(filter)
      .populate('userId', 'name mobile')
      .populate('relatedId')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await PointsHistory.countDocuments(filter);
    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    };

    return successResponse(res, history, '', pagination);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getPointsHistory,
  getPointsHistoryByUser
};