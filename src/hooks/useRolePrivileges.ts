'use client';

import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import {
  UserRole,
  RoleConfig,
  ROLE_CONFIGS,
  getRoleConfig,
  hasPrivilege,
  getPrivilegeScope,
  getRoleNavigation,
  getRoleColor,
  getRoleIcon,
  getRoleName,
  canAccessAdmin,
  canAccessFacultyBoard,
  canManageUsers,
  canCreateBadges,
  canViewAuditLogs,
  canManageCMS,
  canMonitorStudents,
  canAssignTasks,
} from '@/lib/role-privileges';

export function useRolePrivileges() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role as UserRole || 'student';

  return useMemo(() => {
    const config = getRoleConfig(role);

    return {
      // Role info
      role,
      roleConfig: config,
      roleName: getRoleName(role),
      roleColor: getRoleColor(role),
      roleIcon: getRoleIcon(role),

      // Navigation
      allowedRoutes: getRoleNavigation(role),

      // Permission checks
      canAccessAdmin: canAccessAdmin(role),
      canAccessFacultyBoard: canAccessFacultyBoard(role),
      canManageUsers: canManageUsers(role),
      canCreateBadges: canCreateBadges(role),
      canViewAuditLogs: canViewAuditLogs(role),
      canManageCMS: canManageCMS(role),
      canMonitorStudents: canMonitorStudents(role),
      canAssignTasks: canAssignTasks(role),

      // Generic privilege checks
      hasPrivilege: (resource: keyof RoleConfig['privileges'], action: 'create' | 'read' | 'update' | 'delete') =>
        hasPrivilege(role, resource, action),
      getPrivilegeScope: (resource: keyof RoleConfig['privileges']) =>
        getPrivilegeScope(role, resource),

      // Feature access
      features: config.features,
      restrictions: config.restrictions,
      novelFeatures: config.novelFeatures,
      duties: config.duties,
      dashboardWidgets: config.dashboardWidgets,

      // Role checks
      isStudent: role === 'student',
      isFaculty: role === 'faculty',
      isSuperAdmin: role === 'super_admin',
    };
  }, [role]);
}

// Export types for use in components
export type { UserRole, RoleConfig };
