import { httpClient } from '../api/httpClient';
import type { PageResponse } from '../types/api';
import type { AuditLog, AuditLogFilters } from '../types/audit';

export const auditService = {
  list: async (filters: AuditLogFilters) => {
    const { data } = await httpClient.get<PageResponse<AuditLog>>('/api/audit-logs', {
      params: {
        action: filters.action || undefined,
        resourceType: filters.resourceType || undefined,
        organizationId: filters.organizationId || undefined,
        result: filters.result || undefined,
        date: filters.date || undefined,
        page: filters.page,
        size: filters.size,
        sort: 'timestamp,desc',
      },
    });
    return data;
  },
};
