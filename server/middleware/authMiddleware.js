const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  console.log("in protect func")
  let token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    console.log("***** protect *******", decoded, req.user )
    next();
  } catch (error) {
    console.log("***** no protect *******", error)
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please login again' });
    }
  
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

// אישור גישה לפי תפקיד
const protectRole = (role) => {
  return (req, res, next) => {
    console.log(req.user);
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'אין גישה - תפקיד לא מורשה.' });
    }
    next();
  };
};
module.exports = {protect, protectRole};
