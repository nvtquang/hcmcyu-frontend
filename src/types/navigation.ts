import type { Role } from './api';

export type NavigationItem = {
  to: string;
  label: string;
};

export type LayoutRoleGroup = 'admin' | 'member';

export const WARD_ADMIN_ROLES: Role[] = ['WARD_SECRETARY', 'WARD_DEPUTY_SECRETARY'];

export const TDP_ADMIN_ROLES: Role[] = ['TDP_SECRETARY', 'TDP_DEPUTY_SECRETARY'];

