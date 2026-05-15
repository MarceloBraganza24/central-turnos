export const ROLE_PERMISSIONS = {
  owner: {
    canManageSettings: true,
    canManageAvailability: true,
    canManageAppointments: true,
    canManageClients: true,
    canManageTeam: true,
    canViewReports: true,
  },

  manager: {
    canManageSettings: true,
    canManageAvailability: true,
    canManageAppointments: true,
    canManageClients: true,
    canManageTeam: true,
    canViewReports: true,
  },

  professional: {
    canManageSettings: false,
    canManageAvailability: true,
    canManageAppointments: true,
    canManageClients: true,
    canManageTeam: false,
    canViewReports: true,
  },

  receptionist: {
    canManageSettings: false,
    canManageAvailability: false,
    canManageAppointments: true,
    canManageClients: true,
    canManageTeam: false,
    canViewReports: false,
  },

  staff: {
    canManageSettings: false,
    canManageAvailability: false,
    canManageAppointments: true,
    canManageClients: false,
    canManageTeam: false,
    canViewReports: false,
  },

  collaborator: {
    canManageSettings: false,
    canManageAvailability: false,
    canManageAppointments: false,
    canManageClients: false,
    canManageTeam: false,
    canViewReports: false,
  },
};

export type TenantRole = keyof typeof ROLE_PERMISSIONS;