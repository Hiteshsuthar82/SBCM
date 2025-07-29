const fetch = require('node-fetch');

const sessions = new Map(); // Simple in-memory session for OTP; use Redis in prod

const sendOTP = async (mobile, sessionId) => {
  const otp = process.env.OTP_BYPASS_MODE === 'true' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
  sessions.set(sessionId, { otp, expiry: Date.now() + 10 * 60 * 1000 }); // 10 min expiry
  if (process.env.OTP_BYPASS_MODE === 'true') {
    console.log(`Bypass OTP for ${mobile}: ${otp}`);
    return;
  }
  const url = `https://2factor.in/API/V1/${process.env.TWOFACTOR_API_KEY}/SMS/${mobile}/${otp}`;
  await fetch(url);
  // Handle response
};

const validateOTP = async (sessionId, otp) => {
  const session = sessions.get(sessionId);
  if (!session || session.expiry < Date.now()) return false;
  if (process.env.OTP_BYPASS_MODE === 'true' && otp === '123456') return true;
  if (session.otp !== otp) return false;
  sessions.delete(sessionId);
  return true;
};

module.exports = { sendOTP, validateOTP };