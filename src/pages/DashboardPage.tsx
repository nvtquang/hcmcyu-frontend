import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { CalendarDays, FileText, MapPin, MessageCircle, UsersRound } from 'lucide-react';
import { Card, EmptyState, LoadingSkeleton, PageHeader, StatusBadge } from '../components/ui';
import { useEvents } from '../hooks/useEvents';
import { usePosts } from '../hooks/usePosts';
import { eventService } from '../services/eventService';
import { useAuth } from '../stores/AuthContext';
import type { Event } from '../types/event';
import type { Post } from '../types/post';
import { eventStatusLabel, eventTypeLabel, postStatusLabel, postTypeLabel } from '../utils/labels';
import { formatDateTime } from '../utils/dateTime';

const wardRoles = new Set(['WARD_SECRETARY', 'WARD_DEPUTY_SECRETARY']);

type FeedSort = 'newest' | 'oldest' | 'engagement';

type FeedItem = {
  id: string;
  kind: 'event' | 'post';
  title: string;
  description?: string | null;
  meta: string;
  location?: string | null;
  time?: string;
  to: string;
  status: string;
  statusLabel: string;
  engagement: number;
  engagementLabel: string;
};

const getPostEngagement = (post: Post) => {
  const maybePost = post as Post & {
    interactionCount?: number;
    viewCount?: number;
    commentCount?: number;
    reactionCount?: number;
  };

  return maybePost.interactionCount ?? maybePost.reactionCount ?? maybePost.commentCount ?? maybePost.viewCount ?? 0;
};

const buildFeed = (
  events: Event[],
  posts: Post[],
  eventParticipationCounts: Record<string, number>,
  sort: FeedSort,
): FeedItem[] => {
  const items: FeedItem[] = [
    ...events.map((event) => {
      const goingCount = eventParticipationCounts[event.id] ?? 0;

      return {
        id: `event-${event.id}`,
        kind: 'event' as const,
        title: event.title,
        description: event.description,
        meta: eventTypeLabel[event.type],
        location: event.location,
        time: event.startTime,
        to: `/events/${event.id}`,
        status: event.status,
        statusLabel: eventStatusLabel[event.status],
        engagement: goingCount,
        engagementLabel: `${goingCount} lượt tham gia`,
      };
    }),
    ...posts.map((post) => {
      const engagement = getPostEngagement(post);

      return {
        id: `post-${post.id}`,
        kind: 'post' as const,
        title: post.title,
        description: post.content,
        meta: postTypeLabel[post.type],
        time: post.createdAt,
        to: `/posts/${post.id}`,
        status: post.status,
        statusLabel: postStatusLabel[post.status],
        engagement,
        engagementLabel: `${engagement} lượt tương tác`,
      };
    }),
  ];

  return items.sort((left, right) => {
    if (sort === 'engagement') {
      const engagementDiff = right.engagement - left.engagement;
      if (engagementDiff !== 0) {
        return engagementDiff;
      }
    }

    const leftTime = left.time ? new Date(left.time).getTime() : 0;
    const rightTime = right.time ? new Date(right.time).getTime() : 0;
    return sort === 'oldest' ? leftTime - rightTime : rightTime - leftTime;
  });
};

export const DashboardPage = () => {
  const { user } = useAuth();
  const [feedSort, setFeedSort] = useState<FeedSort>('newest');
  const eventsQuery = useEvents({ page: 0, size: 40, upcoming: false });
  const postsQuery = usePosts({ page: 0, size: 40 });
  const events = eventsQuery.data?.content ?? [];
  const posts = postsQuery.data?.content ?? [];
  const isWard = Boolean(user?.role && wardRoles.has(user.role));

  const participationQueries = useQueries({
    queries: events.map((event) => ({
      queryKey: ['events', 'dashboard-feed', event.id, 'participation-summary'] as const,
      queryFn: () => eventService.participationSummary(event.id),
      enabled: Boolean(event.id),
      staleTime: 60_000,
    })),
  });

  const eventParticipationCounts = useMemo(
    () =>
      events.reduce<Record<string, number>>((accumulator, event, index) => {
        accumulator[event.id] = participationQueries[index]?.data?.going ?? 0;
        return accumulator;
      }, {}),
    [events, participationQueries],
  );

  const feed = useMemo(
    () => buildFeed(events, posts, eventParticipationCounts, feedSort),
    [eventParticipationCounts, events, posts, feedSort],
  );

  const isLoading = eventsQuery.isLoading || postsQuery.isLoading;
  const isError = eventsQuery.isError || postsQuery.isError;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Tổng quan"
        title="Bảng tin hoạt động"
        description="Dòng thời gian sự kiện và bài viết theo phạm vi dữ liệu backend cho phép."
        actions={
          isWard && (
            <>
              <Link className="secondary-button inline-button" to="/events">
                <CalendarDays size={17} aria-hidden="true" />
                Quản lý sự kiện
              </Link>
              <Link className="secondary-button inline-button" to="/posts">
                <FileText size={17} aria-hidden="true" />
                Quản lý bài viết
              </Link>
            </>
          )
        }
      />

      <Card className="feed-panel">
        <div className="section-heading timeline-heading">
          <div>
            <h2>Bảng tin</h2>
            <p className="page-description">Sự kiện và bài viết được gom về một dòng thời gian chung.</p>
          </div>
          <label className="compact-filter">
            Sắp xếp
            <select value={feedSort} onChange={(event) => setFeedSort(event.target.value as FeedSort)}>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Lâu nhất</option>
              <option value="engagement">Nhiều tương tác/tham gia nhất</option>
            </select>
          </label>
        </div>

        {isLoading && <LoadingSkeleton rows={7} />}
        {isError && <div className="error-box">Không thể tải bảng tin. Vui lòng thử lại sau.</div>}
        {!isLoading && !isError && feed.length === 0 && <EmptyState title="Chưa có sự kiện hoặc bài viết" />}

        {!isLoading && !isError && feed.length > 0 && (
          <div className="feed-list">
            {feed.map((item) => (
              <Link className="feed-item" key={item.id} to={item.to}>
                <div className={`feed-icon feed-icon-${item.kind}`}>
                  {item.kind === 'event' ? (
                    <CalendarDays size={20} aria-hidden="true" />
                  ) : (
                    <FileText size={20} aria-hidden="true" />
                  )}
                </div>
                <div className="feed-body">
                  <div className="feed-meta">
                    <span>{item.kind === 'event' ? 'Sự kiện' : 'Bài viết'}</span>
                    <span>{item.meta}</span>
                    {item.time && <span>{formatDateTime(item.time)}</span>}
                  </div>
                  <h2>{item.title}</h2>
                  {item.description && <p>{item.description}</p>}
                  <div className="feed-footer">
                    <StatusBadge value={item.status} label={item.statusLabel} />
                    {item.location && (
                      <span>
                        <MapPin size={15} aria-hidden="true" />
                        {item.location}
                      </span>
                    )}
                    <span>
                      {item.kind === 'event' ? (
                        <UsersRound size={15} aria-hidden="true" />
                      ) : (
                        <MessageCircle size={15} aria-hidden="true" />
                      )}
                      {item.engagementLabel}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
