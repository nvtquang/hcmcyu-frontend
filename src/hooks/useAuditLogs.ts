import { useQuery } from '@tanstack/react-query';
import { auditService } from '../services/auditService';
import type { AuditLogFilters } from '../types/audit';

export const auditKeys = {
  all: ['audit-logs'] as const,
  list: (filters: AuditLogFilters) => [...auditKeys.all, 'list', filters] as const,
};

export const useAuditLogs = (filters: AuditLogFilters) =>
  useQuery({
    queryKey: auditKeys.list(filters),
    queryFn: () => auditService.list(filters),
  });
