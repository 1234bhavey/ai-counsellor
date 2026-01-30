// Role-based access control utilities for frontend (USER-ONLY SYSTEM)

// Role hierarchy levels (simplified for user-only system)
export const ROLE_LEVELS = {
  user: 1,
  student: 1  // Alias for user
};

// Check if user has specific role
export const hasRole = (user, role) => {
  return user && (user.role === role || user.role === 'user' || user.role === 'student');
};

// Check if user has any of the specified roles
export const hasAnyRole = (user, allowedRoles) => {
  return user && (allowedRoles.includes(user.role) || allowedRoles.includes('user') || allowedRoles.includes('student'));
};

// Check if user has minimum role level
export const hasMinimumRole = (user, minimumRole) => {
  return user && (user.role === 'user' || user.role === 'student');
};

// Get navigation items based on user role (USER-ONLY SYSTEM)
export const getNavigationItems = (user) => {
  // All users get the same navigation items
  return [
    { name: 'Dashboard', path: '/dashboard', icon: 'BarChart3' },
    { name: 'AI Counsellor', path: '/counsellor', icon: 'MessageCircle' },
    { name: 'Universities', path: '/universities', icon: 'BookOpen' },
    { name: 'Shortlisted', path: '/shortlisted', icon: 'Heart' },
    { name: 'Application Tasks', path: '/tasks', icon: 'ClipboardList' }
  ];
};

// Get role display name (simplified for user-only system)
export const getRoleDisplayName = (role) => {
  return 'Student';
};

// Get role badge color (simplified for user-only system)
export const getRoleBadgeColor = (role) => {
  return 'bg-blue-100 text-blue-800';
};

// Check if user can access specific route (USER-ONLY SYSTEM)
export const canAccessRoute = (user, route) => {
  // All authenticated users can access all routes
  const userRoutes = [
    '/dashboard',
    '/counsellor', 
    '/universities',
    '/shortlisted',
    '/tasks',
    '/profile'
  ];
  
  return user && userRoutes.includes(route);
};

// Get dashboard type based on role (USER-ONLY SYSTEM)
export const getDashboardType = (user) => {
  return 'student';
};

// Mask email for security (show beginning and end, hide middle)
export const getMaskedEmail = (user) => {
  const email = user.email || '';
  const [username, domain] = email.split('@');
  
  if (!username || !domain) return email;
  
  // Show first 2-3 characters and last 1-2 characters, mask the middle
  let maskedUsername;
  if (username.length <= 4) {
    maskedUsername = `${username.charAt(0)}${'*'.repeat(username.length - 1)}`;
  } else {
    const startChars = username.substring(0, 2);
    const endChars = username.slice(-2);
    const middleLength = username.length - 4;
    maskedUsername = `${startChars}${'*'.repeat(Math.max(middleLength, 2))}${endChars}`;
  }
    
  return `${maskedUsername}@${domain}`;
};

// Role-based feature flags (USER-ONLY SYSTEM)
export const getFeatureFlags = (user) => {
  // All features disabled for regular users
  return {
    canViewAnalytics: false,
    canManageUsers: false,
    canViewSystemMetrics: false,
    canManageUniversities: false,
    canViewAllStudents: false,
    canExportData: false,
    canConfigureSystem: false,
    canViewBusinessMetrics: false,
    canManageRoles: false
  };
};