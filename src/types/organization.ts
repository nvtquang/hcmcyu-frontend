export type OrganizationUnitType = 'WARD' | 'YOUTH_UNION_BRANCH';

export type OrganizationUnit = {
  id: string;
  name: string;
  code: string;
  type: OrganizationUnitType;
  parentId?: string | null;
  active: boolean;
};

export type OrganizationUnitFormValues = {
  name: string;
  code: string;
  type: OrganizationUnitType;
  parentId?: string;
  active: boolean;
};

export type OrganizationMemberSummary = {
  memberId: string;
  fullName: string;
  organizationId: string;
};
