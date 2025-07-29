const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { id, role }
    } catch (err) {
      // Token is invalid, but we continue without user
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

const isAdmin = async (req, res, next) => {
  if (!['sub_admin', 'admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }
  const admin = await Admin.findById(req.user.id);
  req.user.permissions = admin.permissions;
  // Check permissions if needed
  next();
};

module.exports = { verifyToken, optionalAuth, isAdmin };