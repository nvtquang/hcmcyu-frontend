import type { Event } from './event';
import type { Post } from './post';

export type OrganizationMemberCount = {
  organizationId: string;
  organizationName: string;
  count: number;
};

export type MemberDashboardSummary = {
  totalMembers: number;
  membersByTdp: OrganizationMemberCount[];
  officerCount: number;
  memberStatusCounts: Record<string, number>;
};

export type EventDashboardSummary = {
  upcomingEventCount: number;
  registeredParticipantCount: number;
  upcomingEvents: Event[];
  registeredEvents: Event[];
};

export type ContentDashboardSummary = {
  recentActivityReportCount: number;
  newPosts: Post[];
};

export type DashboardSummary = {
  member: MemberDashboardSummary;
  event: EventDashboardSummary;
  content: ContentDashboardSummary;
  notification: {
    count: number;
  };
};
