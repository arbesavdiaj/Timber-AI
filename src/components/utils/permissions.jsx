// Role-based permission system

const ROLE_PERMISSIONS = {
  administrator: {
    viewDashboard: true,
    viewZones: true,
    editZones: true,
    deleteZones: true,
    viewReports: true,
    generateReports: true,
    deleteReports: true,
    viewAlerts: true,
    manageAlerts: true,
    viewSensors: true,
    manageSensors: true,
    viewUsers: true,
    manageUsers: true,
    manageSettings: true,
    uploadData: true,
    viewInsights: true,
    viewRealTime: true,
  },
  forester: {
    viewDashboard: true,
    viewZones: true,
    editZones: true,
    deleteZones: false,
    viewReports: true,
    generateReports: true,
    deleteReports: false,
    viewAlerts: true,
    manageAlerts: true,
    viewSensors: true,
    manageSensors: true,
    viewUsers: false,
    manageUsers: false,
    manageSettings: false,
    uploadData: true,
    viewInsights: true,
    viewRealTime: true,
  },
  analyst: {
    viewDashboard: true,
    viewZones: true,
    editZones: false,
    deleteZones: false,
    viewReports: true,
    generateReports: true,
    deleteReports: false,
    viewAlerts: true,
    manageAlerts: false,
    viewSensors: true,
    manageSensors: false,
    viewUsers: false,
    manageUsers: false,
    manageSettings: false,
    uploadData: false,
    viewInsights: true,
    viewRealTime: true,
  },
};

export function hasPermission(user, permission) {
  if (!user) return false;

  // Base44 admin role has all permissions
  if (user.role === "admin") return true;

  const userRole = user.user_role || "analyst";
  const permissions = ROLE_PERMISSIONS[userRole];

  return permissions ? permissions[permission] : false;
}

export function getRoleLabel(role) {
  const labels = {
    administrator: "Administrator",
    forester: "Forester",
    analyst: "Analyst",
  };
  return labels[role] || role;
}

export function getRoleDescription(role) {
  const descriptions = {
    administrator: "Full system access - manage all users, settings, and data",
    forester:
      "Operational access - manage forest zones, sensors, and field operations",
    analyst: "View-only access - analyze data, generate reports, view insights",
  };
  return descriptions[role] || "";
}
