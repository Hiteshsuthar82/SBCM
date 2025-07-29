const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateToken, verifyToken: verifyJWT } = require('../utils/tokenUtil');
const { sendOTP, validateOTP } = require('../utils/otpUtil');
const { successResponse, errorResponse } = require('../utils/responseUtil');

const register = async (req, res) => {
  const { name, mobile } = req.body;
  try {
    // Check if user already exists
    let user = await User.findOne({ mobile });
    if (user) {
      return errorResponse(res, 'User already exists with this mobile number. Please login instead.', 400);
    }
    
    // Create new user
    user = new User({ name, mobile });
    await user.save();
    
    // Generate session ID and send OTP
    const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    await sendOTP(mobile, sessionId);
    
    return successResponse(res, { 
      sessionId, 
      message: 'Registration successful! OTP sent to your mobile number.',
      mobile: mobile.replace(/(\d{6})(\d{4})/, '******$2') // Mask mobile number
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const login = async (req, res) => {
  const { mobile, otp, sessionId } = req.body;
  try {
    // Validate OTP
    const valid = await validateOTP(sessionId, otp);
    if (!valid) {
      return errorResponse(res, 'Invalid or expired OTP. Please try again.', 400);
    }
    
    // Find user
    const user = await User.findOne({ mobile });
    if (!user) {
      return errorResponse(res, 'User not found. Please register first.', 404);
    }
    
    // Check if user is active
    if (!user.isActive) {
      return errorResponse(res, 'Your account has been deactivated. Please contact support.', 403);
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = generateToken({ id: user._id, role: 'user' });
    
    // Prepare user data
    const userData = {
      id: user._id,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      address: user.address,
      profession: user.profession,
      language: user.language,
      points: user.points,
      progress: user.progress,
      photo: user.photo,
      paymentDetails: user.paymentDetails,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };
    
    return successResponse(res, { 
      token, 
      user: userData,
      message: 'Login successful! Welcome to SBCMS.'
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find admin by email
    const admin = await Admin.findOne({ email }).populate('role');
    console.log(admin);
    if (!admin) {
      return errorResponse(res, 'Invalid email or password', 400);
    }

    
    // Check if admin is active
    if (!admin.isActive) {
      return errorResponse(res, 'Your admin account has been deactivated. Please contact super admin.', 403);
    }
    
    // Verify password
    // const isPasswordValid = await bcrypt.compare(password, admin.password);
    // if (!isPasswordValid) {
    //   return errorResponse(res, 'Invalid email or password', 400);
    // }
    
    // Update last login
    admin.lastLogin = new Date();
    await admin.save();
    
    // Generate JWT token
    const token = generateToken({ id: admin._id, role: admin.role });
    
    // Prepare admin data
    const adminData = {
      id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions: admin.permissions,
      isActive: admin.isActive,
      lastLogin: admin.lastLogin,
      createdAt: admin.createdAt
    };
    
    return successResponse(res, { 
      token, 
      admin: adminData,
      message: 'Admin login successful! Welcome to SBCMS Admin Panel.'
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const adminRegester = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return errorResponse(res, 'Admin with this email already exists', 400);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create new admin
    const admin = new Admin({ name, email, password: hashedPassword, role, isActive: true });
    await admin.save();
    
    return successResponse(res, admin, 'Admin registered successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
}

// Send OTP for existing user login
const sendLoginOtp = async (req, res) => {
  const { mobile } = req.body;
  try {
    // Check if user exists
    const user = await User.findOne({ mobile });
    if (!user) {
      return errorResponse(res, 'User not found. Please register first.', 404);
    }

    // Generate session ID and send OTP
    const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    await sendOTP(mobile, sessionId);
    
    return successResponse(res, { 
      sessionId, 
      message: 'OTP sent successfully',
      mobile: mobile.replace(/(\d{6})(\d{4})/, '******$2') // Mask mobile number
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// Verify JWT token and return user/admin data
const verifyToken = async (req, res) => {
  try {
    // Token is already verified by middleware, user/admin data is in req.user
    const { id, role } = req.user;
    
    if (role === 'user') {
      const user = await User.findById(id).select('-__v');
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }
      
      const userData = {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        address: user.address,
        profession: user.profession,
        language: user.language,
        points: user.points,
        progress: user.progress,
        photo: user.photo,
        paymentDetails: user.paymentDetails,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      };
      
      return successResponse(res, { user: userData });
    } else {
      // Admin verification
      const admin = await Admin.findById(id).populate('role').select('-password -__v');
      if (!admin) {
        return errorResponse(res, 'Admin not found', 404);
      }
      
      const adminData = {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt
      };
      
      return successResponse(res, { admin: adminData });
    }
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// Refresh JWT token
const refreshToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No token provided', 401);
    }

    const token = authHeader.substring(7);
    
    try {
      // Verify the token (even if expired, we can still decode it)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user/admin still exists
      if (decoded.role === 'user') {
        const user = await User.findById(decoded.id);
        if (!user || !user.isActive) {
          return errorResponse(res, 'User not found or inactive', 404);
        }
        
        // Generate new token
        const newToken = generateToken({ id: user._id, role: 'user' });
        
        const userData = {
          id: user._id,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
          points: user.points,
          progress: user.progress,
          language: user.language,
        };
        
        return successResponse(res, { token: newToken, user: userData });
      } else {
        const admin = await Admin.findById(decoded.id);
        if (!admin || !admin.isActive) {
          return errorResponse(res, 'Admin not found or inactive', 404);
        }
        
        // Generate new token
        const newToken = generateToken({ id: admin._id, role: admin.role });
        
        const adminData = {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          permissions: admin.permissions,
        };
        
        return successResponse(res, { token: newToken, admin: adminData });
      }
    } catch (jwtError) {
      // If token is expired, try to decode without verification
      if (jwtError.name === 'TokenExpiredError') {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.id || !decoded.role) {
          return errorResponse(res, 'Invalid token format', 401);
        }
        
        // Check if user/admin still exists
        if (decoded.role === 'user') {
          const user = await User.findById(decoded.id);
          if (!user || !user.isActive) {
            return errorResponse(res, 'User not found or inactive', 404);
          }
          
          // Generate new token
          const newToken = generateToken({ id: user._id, role: 'user' });
          
          const userData = {
            id: user._id,
            name: user.name,
            mobile: user.mobile,
            email: user.email,
            points: user.points,
            progress: user.progress,
            language: user.language,
          };
          
          return successResponse(res, { token: newToken, user: userData });
        } else {
          const admin = await Admin.findById(decoded.id);
          if (!admin || !admin.isActive) {
            return errorResponse(res, 'Admin not found or inactive', 404);
          }
          
          // Generate new token
          const newToken = generateToken({ id: admin._id, role: admin.role });
          
          const adminData = {
            id: admin._id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            permissions: admin.permissions,
          };
          
          return successResponse(res, { token: newToken, admin: adminData });
        }
      } else {
        return errorResponse(res, 'Invalid token', 401);
      }
    }
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = { register, login, adminLogin, adminRegester, sendLoginOtp, verifyToken, refreshToken };