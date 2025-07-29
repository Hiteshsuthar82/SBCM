const Rule = require('../models/Rule');
const ActionHistory = require('../models/ActionHistory');
const { successResponse, errorResponse } = require('../utils/responseUtil');

const getRules = async (req, res) => {
  const { page = 1, limit = 10, category = '', search = '' } = req.query;
  
  try {
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.description = { $regex: search, $options: 'i' };

    const rules = await Rule.find(filter)
      .populate('createdBy', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Rule.countDocuments(filter);
    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    };

    return successResponse(res, rules, '', pagination);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const createRule = async (req, res) => {
  const { category, description } = req.body;
  
  try {
    const rule = new Rule({
      category,
      description,
      createdBy: req.user.id
    });

    await rule.save();
    await rule.populate('createdBy', 'name email');

    // Log action history
    await ActionHistory.create({
      adminId: req.user.id,
      action: 'create',
      resource: 'rule',
      resourceId: rule._id,
      details: `Created rule in category "${category}": ${description.substring(0, 100)}...`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return successResponse(res, rule, 'Rule created successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const updateRule = async (req, res) => {
  const { id } = req.params;
  const { category, description } = req.body;
  
  try {
    const rule = await Rule.findByIdAndUpdate(
      id,
      { category, description, updatedAt: new Date() },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!rule) {
      return errorResponse(res, 'Rule not found', 404);
    }

    // Log action history
    await ActionHistory.create({
      adminId: req.user.id,
      action: 'update',
      resource: 'rule',
      resourceId: rule._id,
      details: `Updated rule in category "${category}": ${description.substring(0, 100)}...`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return successResponse(res, rule, 'Rule updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const deleteRule = async (req, res) => {
  const { id } = req.params;
  
  try {
    const rule = await Rule.findById(id);
    if (!rule) {
      return errorResponse(res, 'Rule not found', 404);
    }

    const ruleDetails = `${rule.category}: ${rule.description.substring(0, 100)}...`;
    await Rule.findByIdAndDelete(id);

    // Log action history
    await ActionHistory.create({
      adminId: req.user.id,
      action: 'delete',
      resource: 'rule',
      resourceId: id,
      details: `Deleted rule: ${ruleDetails}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    return successResponse(res, null, 'Rule deleted successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getRules,
  createRule,
  updateRule,
  deleteRule
};