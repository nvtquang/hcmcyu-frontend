import { Link } from 'react-router-dom';
import { useDashboardSummary } from '../hooks/useDashboard';
import { useAuth } from '../stores/AuthContext';
import type { Event } from '../types/event';
import type { Post } from '../types/post';
import { formatDateTime } from '../utils/dateTime';

const officerRoles = new Set(['WARD_SECRETARY', 'WARD_DEPUTY_SECRETARY', 'TDP_SECRETARY', 'TDP_DEPUTY_SECRETARY']);

const StatCard = ({ label, value, to }: { label: string; value: number | string; to?: string }) => {
  const content = (
    <>
      <span>{label}</span>
      <strong>{value}</strong>
    </>
  );

  return to ? (
    <Link className="surface stat-card" to={to}>
      {content}
    </Link>
  ) : (
    <div className="surface stat-card">{content}</div>
  );
};

const EmptyText = ({ children }: { children: string }) => <p className="muted-text">{children}</p>;

const EventTable = ({ events }: { events: Event[] }) => (
  <div className="table-wrap">
    <table className="data-table compact-table">
      <thead>
        <tr>
          <th>Sự kiện</th>
          <th>Loại</th>
          <th>Thời gian</th>
          <th>Địa điểm</th>
        </tr>
      </thead>
      <tbody>
        {events.map((event) => (
          <tr key={event.id}>
            <td>
              <Link className="text-action" to={`/events/${event.id}`}>
                {event.title}
              </Link>
            </td>
            <td>{event.type}</td>
            <td>{formatDateTime(event.startTime)}</td>
            <td>{event.location ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PostList = ({ posts }: { posts: Post[] }) => (
  <div className="dashboard-list">
    {posts.map((post) => (
      <Link className="dashboard-list-item" to={`/posts/${post.id}`} key={post.id}>
        <div>
          <strong>{post.title}</strong>
          <span>{post.type} · {post.organizationId}</span>
        </div>
        <span>{formatDateTime(post.createdAt)}</span>
      </Link>
    ))}
  </div>
);

export const DashboardPage = () => {
  const { user } = useAuth();
  const dashboardQuery = useDashboardSummary();
  const summary = dashboardQuery.data;
  const isOfficer = Boolean(user?.role && officerRoles.has(user.role));
  const isWard = user?.role === 'WARD_SECRETARY' || user?.role === 'WARD_DEPUTY_SECRETARY';
  const maxTdpCount = Math.max(...(summary?.member.membersByTdp.map((item) => item.count) ?? [0]), 1);
  const maxStatusCount = Math.max(...Object.values(summary?.member.memberStatusCounts ?? { empty: 0 }), 1);

  if (dashboardQuery.isLoading) {
    return <div className="surface">Đang tải dashboard...</div>;
  }

  if (dashboardQuery.isError || !summary) {
    return <div className="error-box">Không thể tải dashboard. Vui lòng thử lại sau.</div>;
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">
            {isOfficer ? (isWard ? 'Tổng hợp toàn phường' : 'Tổng hợp theo phạm vi TDP') : 'Thông tin cá nhân của đoàn viên'}
          </p>
        </div>
      </header>

      {isOfficer ? (
        <>
          <section className="dashboard-stat-grid">
            <StatCard label="Tổng đoàn viên" value={summary.member.totalMembers} to="/members" />
            <StatCard label="Cán bộ Đoàn" value={summary.member.officerCount} />
            <StatCard label="Sự kiện sắp tới" value={summary.event.upcomingEventCount} to="/events" />
            <StatCard label="Activity report mới" value={summary.content.recentActivityReportCount} to="/posts" />
            <StatCard label="Lượt đăng ký event" value={summary.event.registeredParticipantCount} />
            <StatCard label="Thông báo chưa đọc" value={summary.notification.count} to="/notifications" />
          </section>

          <section className="dashboard-grid">
            <div className="surface">
              <div className="section-heading">
                <h2>Đoàn viên theo TDP</h2>
              </div>
              <div className="bar-chart">
                {summary.member.membersByTdp.map((item) => (
                  <div className="bar-row" key={item.organizationId}>
                    <span>{item.organizationName}</span>
                    <div>
                      <i style={{ width: `${(item.count / maxTdpCount) * 100}%` }} />
                    </div>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface">
              <div className="section-heading">
                <h2>Member status</h2>
              </div>
              <div className="bar-chart">
                {Object.entries(summary.member.memberStatusCounts).map(([status, count]) => (
                  <div className="bar-row" key={status}>
                    <span>{status}</span>
                    <div>
                      <i style={{ width: `${(count / maxStatusCount) * 100}%` }} />
                    </div>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="surface">
            <div className="section-heading">
              <h2>Sự kiện sắp tới</h2>
              <Link className="text-action" to="/events">Xem tất cả</Link>
            </div>
            {summary.event.upcomingEvents.length ? <EventTable events={summary.event.upcomingEvents} /> : <EmptyText>Chưa có sự kiện sắp tới.</EmptyText>}
          </section>

          <section className="surface">
            <div className="section-heading">
              <h2>Bài báo cáo gần đây</h2>
              <Link className="text-action" to="/posts">Xem tất cả</Link>
            </div>
            {summary.content.newPosts.length ? <PostList posts={summary.content.newPosts} /> : <EmptyText>Chưa có bài viết mới.</EmptyText>}
          </section>
        </>
      ) : (
        <>
          <section className="dashboard-stat-grid">
            <StatCard label="Sự kiện sắp tới" value={summary.event.upcomingEventCount} to="/events" />
            <StatCard label="Sự kiện đã đăng ký" value={summary.event.registeredEvents.length} to="/events" />
            <StatCard label="Thông báo chưa đọc" value={summary.notification.count} to="/notifications" />
            <StatCard label="Bài viết mới" value={summary.content.newPosts.length} to="/posts" />
          </section>

          <section className="surface">
            <div className="section-heading">
              <h2>Upcoming events</h2>
              <Link className="text-action" to="/events">Xem tất cả</Link>
            </div>
            {summary.event.upcomingEvents.length ? <EventTable events={summary.event.upcomingEvents} /> : <EmptyText>Chưa có sự kiện sắp tới.</EmptyText>}
          </section>

          <section className="surface">
            <div className="section-heading">
              <h2>My events</h2>
            </div>
            {summary.event.registeredEvents.length ? (
              <div className="table-wrap">
                <table className="data-table compact-table">
                  <thead>
                    <tr>
                      <th>Sự kiện</th>
                      <th>Trạng thái</th>
                      <th>Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.event.registeredEvents.map((participation) => (
                      <tr key={participation.id}>
                        <td>
                          <Link className="text-action" to={`/events/${participation.eventId}`}>
                            {participation.eventTitle}
                          </Link>
                        </td>
                        <td>{participation.status}</td>
                        <td>{formatDateTime(participation.eventStartTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyText>Chưa đăng ký sự kiện nào.</EmptyText>
            )}
          </section>

          <section className="surface">
            <div className="section-heading">
              <h2>Latest posts</h2>
              <Link className="text-action" to="/posts">Xem tất cả</Link>
            </div>
            {summary.content.newPosts.length ? <PostList posts={summary.content.newPosts} /> : <EmptyText>Chưa có bài viết mới.</EmptyText>}
          </section>
        </>
      )}
    </div>
  );
};
