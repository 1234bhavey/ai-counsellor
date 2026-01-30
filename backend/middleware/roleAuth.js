// Role-based authorization middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated (auth middleware should run first)
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Get user role (default to 'student' if not set)
      const userRole = req.user.role || 'student';

      // Check if user's role is in the allowed roles array
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          message: 'Access denied. Insufficient permissions.',
          required_roles: allowedRoles,
          user_role: userRole
        });
      }

      // User has required role, proceed
      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      res.status(500).json({ message: 'Authorization error' });
    }
  };
};

// Predefined role combinations for common use cases
const roles = {
  STUDENT_ONLY: ['student'],
  COUNSELLOR_ONLY: ['counsellor'],
  ADMIN_ONLY: ['admin', 'super_admin'],
  SUPER_ADMIN_ONLY: ['super_admin'],
  
  // Combined roles
  COUNSELLOR_AND_ADMIN: ['counsellor', 'admin', 'super_admin'],
  ADMIN_AND_SUPER: ['admin', 'super_admin'],
  ALL_STAFF: ['counsellor', 'admin', 'super_admin'],
  ALL_USERS: ['student', 'counsellor', 'admin', 'super_admin']
};

// Helper function to check if user has specific role
const hasRole = (user, role) => {
  return user && user.role === role;
};

// Helper function to check if user has any of the specified roles
const hasAnyRole = (user, allowedRoles) => {
  return user && allowedRoles.includes(user.role || 'student');
};

// Helper function to get role hierarchy level (higher number = more permissions)
const getRoleLevel = (role) => {
  const levels = {
    'student': 1,
    'counsellor': 2,
    'admin': 3,
    'super_admin': 4
  };
  return levels[role] || 0;
};

// Check if user has role level equal or higher than required
const hasMinimumRole = (user, minimumRole) => {
  const userLevel = getRoleLevel(user?.role);
  const requiredLevel = getRoleLevel(minimumRole);
  return userLevel >= requiredLevel;
};

module.exports = {
  requireRole,
  roles,
  hasRole,
  hasAnyRole,
  getRoleLevel,
  hasMinimumRole
};