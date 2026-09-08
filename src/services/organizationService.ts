import { httpClient } from '../api/httpClient';
import type { OrganizationUnit } from '../types/organization';

export const organizationService = {
  list: async () => {
    const { data } = await httpClient.get<OrganizationUnit[]>('/api/organizations');
    return data;
  },
};

