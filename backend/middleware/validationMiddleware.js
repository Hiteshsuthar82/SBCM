const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, error: error.details[0].message });
  next();
};

const registerValidation = validate(Joi.object({
  name: Joi.string().required(),
  mobile: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
}));

const loginValidation = validate(Joi.object({
  mobile: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
  otp: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
  sessionId: Joi.string().required(),
}));

const adminLoginValidation = validate(Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}));

const sendOtpValidation = validate(Joi.object({
  mobile: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
}));

const complaintValidation = validate(Joi.object({
  type: Joi.string().required(),
  description: Joi.string().required(),
  stop: Joi.string().required(),
  dateTime: Joi.date().optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  address: Joi.string().optional(),
  dynamicFields: Joi.string().optional(),
}));

const withdrawalValidation = validate(Joi.object({
  points: Joi.number().min(100).required(),
  method: Joi.string().valid('UPI', 'Bank Transfer').required(),
  paymentDetails: Joi.object({
    upiId: Joi.string().optional(),
    bankAccount: Joi.string().optional(),
    ifsc: Joi.string().optional(),
    accountHolderName: Joi.string().optional(),
  }).required(),
}));

const announcementValidation = validate(Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  route: Joi.string().optional(),
  scheduledAt: Joi.date().optional(),
}));

const configUpdateValidation = validate(Joi.object({
  key: Joi.string().required(),
  value: Joi.any().required(),
}));

const busStopValidation = validate(Joi.object({
  name: Joi.string().required(),
  code: Joi.string().min(3).max(5).required(),
  route: Joi.string().required(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  address: Joi.string().optional(),
}));

const fcmTokenValidation = validate(Joi.object({
  token: Joi.string().required(),
  platform: Joi.string().valid('web', 'android', 'ios').required(),
}));

const fcmSendValidation = validate(Joi.object({
  userId: Joi.string().required(),
  title: Joi.string().required(),
  body: Joi.string().required(),
  data: Joi.object().optional(),
}));

const rulesValidation = validate(Joi.object({
  category: Joi.string().required(),
  description: Joi.string().required(),
}));

const rolesValidation = validate(Joi.object({
  name: Joi.string().required(),
  permissions: Joi.array().items(Joi.string()).required(),
}));

const adminValidation = validate(Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().required(),
  role: Joi.string().required(),
}));

const adminUpdateValidation = validate(Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
}));

const userUpdateValidation = validate(Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  address: Joi.string().optional(),
  profession: Joi.string().optional(),
  language: Joi.string().optional(),
}));

const quickTourValidation = validate(Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  steps: Joi.array().items(Joi.object({
    id: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    target: Joi.string().required(),
    placement: Joi.string().valid('top', 'bottom', 'left', 'right').optional(),
    action: Joi.object({
      type: Joi.string().valid('click', 'navigate').optional(),
      href: Joi.string().optional(),
    }).optional(),
  })).required(),
  requiredRoles: Joi.array().items(Joi.string()).optional(),
  enabled: Joi.boolean().optional(),
  autoStart: Joi.boolean().optional(),
  showForNewUsers: Joi.boolean().optional(),
  showForReturningUsers: Joi.boolean().optional(),
}));

const reportValidation = validate(Joi.object({
  type: Joi.string().valid('complaints', 'users', 'withdrawals', 'analytics').required(),
  dateRange: Joi.object({
    start: Joi.date().optional(),
    end: Joi.date().optional(),
  }).optional(),
  filters: Joi.object().optional(),
}));

const fcmBroadcastValidation = validate(Joi.object({
  title: Joi.string().required(),
  body: Joi.string().required(),
  data: Joi.object().optional(),
}));

const fcmRoleValidation = validate(Joi.object({
  role: Joi.string().required(),
  title: Joi.string().required(),
  body: Joi.string().required(),
  data: Joi.object().optional(),
}));

const bulkConfigValidation = validate(Joi.object({
  configs: Joi.array().items(Joi.object({
    key: Joi.string().required(),
    value: Joi.any().required(),
  })).required(),
}));

module.exports = {
  registerValidation,
  loginValidation,
  adminLoginValidation,
  sendOtpValidation,
  complaintValidation,
  withdrawalValidation,
  announcementValidation,
  configUpdateValidation,
  bulkConfigValidation,
  busStopValidation,
  fcmTokenValidation,
  fcmSendValidation,
  fcmBroadcastValidation,
  fcmRoleValidation,
  rulesValidation,
  rolesValidation,
  adminValidation,
  adminUpdateValidation,
  userUpdateValidation,
  quickTourValidation,
  reportValidation,
};