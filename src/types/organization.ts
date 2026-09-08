export type OrganizationUnitType = 'WARD' | 'YOUTH_UNION_BRANCH';

export type OrganizationUnit = {
  id: string;
  name: string;
  code: string;
  type: OrganizationUnitType;
  parentId?: string | null;
  active: boolean;
};

