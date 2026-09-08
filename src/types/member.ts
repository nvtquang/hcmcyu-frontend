export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export type MemberRole =
  | 'WARD_SECRETARY'
  | 'WARD_DEPUTY_SECRETARY'
  | 'TDP_SECRETARY'
  | 'TDP_DEPUTY_SECRETARY'
  | 'MEMBER';

export type Member = {
  id: string;
  userId?: string | null;
  fullName: string;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  youthUnionJoinDate?: string | null;
  memberStatus: MemberStatus;
  memberRole: MemberRole;
  organizationId: string;
  organizationName?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type MemberFormValues = {
  userId?: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: Gender | '';
  phone?: string;
  email?: string;
  address?: string;
  avatarUrl?: string;
  youthUnionJoinDate?: string;
  memberStatus?: MemberStatus;
  organizationId: string;
};

export type MemberFilters = {
  keyword?: string;
  organizationId?: string;
  status?: MemberStatus | '';
  page: number;
  size: number;
};

