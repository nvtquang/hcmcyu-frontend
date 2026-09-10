import { httpClient } from '../api/httpClient';
import type { OrganizationMemberSummary, OrganizationUnit, OrganizationUnitFormValues } from '../types/organization';

const toPayload = (values: OrganizationUnitFormValues) => ({
  name: values.name,
  code: values.code,
  type: values.type,
  parentId: values.type === 'WARD' ? null : values.parentId || null,
  active: values.active,
});

export const organizationService = {
  list: async () => {
    const { data } = await httpClient.get<OrganizationUnit[]>('/api/organizations');
    return data;
  },
  publicBranches: async () => {
    const { data } = await httpClient.get<OrganizationUnit[]>('/api/organizations/public');
    return data;
  },
  findById: async (id: string) => {
    const { data } = await httpClient.get<OrganizationUnit>(`/api/organizations/${id}`);
    return data;
  },
  create: async (values: OrganizationUnitFormValues) => {
    const { data } = await httpClient.post<OrganizationUnit>('/api/organizations', toPayload(values));
    return data;
  },
  update: async (id: string, values: OrganizationUnitFormValues) => {
    const { data } = await httpClient.put<OrganizationUnit>(`/api/organizations/${id}`, toPayload(values));
    return data;
  },
  delete: async (id: string) => {
    await httpClient.delete(`/api/organizations/${id}`);
  },
  members: async (id: string) => {
    const { data } = await httpClient.get<OrganizationMemberSummary[]>(`/api/organizations/${id}/members`);
    return data;
  },
};
