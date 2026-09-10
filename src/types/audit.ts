export type AuditAction =
  | 'CREATE_MEMBER'
  | 'UPDATE_MEMBER'
  | 'DISABLE_MEMBER'
  | 'CHANGE_ROLE'
  | 'CHANGE_ORGANIZATION'
  | 'CREATE_EVENT'
  | 'UPDATE_EVENT'
  | 'DELETE_EVENT'
  | 'CREATE_POST'
  | 'UPDATE_POST'
  | 'DELETE_POST';

export type AuditResourceType = 'MEMBER' | 'EVENT' | 'POST';

export type AuditResult = 'SUCCESS' | 'FAILURE';

export type AuditLog = {
  id: string;
  actorUserId: string;
  actorRole: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  organizationId?: string | null;
  timestamp: string;
  result: AuditResult;
};

export type AuditLogFilters = {
  action?: AuditAction | '';
  resourceType?: AuditResourceType | '';
  organizationId?: string;
  result?: AuditResult | '';
  date?: string;
  page: number;
  size: number;
};
