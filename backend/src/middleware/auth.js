const jwt = require('jsonwebtoken');
const userService = require('../services/userService'); // Import your userService[cite: 13]

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Dynamic permission checker middleware factory
const checkPermission = (permissionKey) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // 1. Automatic bypass rule: If the user is an ADMIN, let them through directly[cite: 10]
      if (req.user.role === 'ADMIN' || req.user.roles?.includes('ADMIN')) {
        return next();
      }

      // 2. Query the database using your existing service method to check for the permission key[cite: 13]
      const hasAccess = await userService.hasPermission(req.user.id, permissionKey);

      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have permission to perform this action" });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Internal server error during authorization check', error: error.message });
    }
  };
};

module.exports = { authMiddleware, checkPermission };