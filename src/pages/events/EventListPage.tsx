import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ForbiddenMessage } from '../../components/ForbiddenMessage';
import { EventForm } from '../../features/events/EventForm';
import { useCreateEvent, useDeleteEvent, useEvents } from '../../hooks/useEvents';
import { useOrganizations } from '../../hooks/useOrganizations';
import { useAuth } from '../../stores/AuthContext';
import type { ApiError } from '../../types/api';
import type { EventFilters, EventFormValues, EventStatus, EventType } from '../../types/event';
import type { OrganizationUnit } from '../../types/organization';
import { formatDateTime } from '../../utils/dateTime';
import { toApiError } from '../../utils/apiError';

const pageSize = 10;

const isOfficer = (role: string | null) =>
  role === 'WARD_SECRETARY' ||
  role === 'WARD_DEPUTY_SECRETARY' ||
  role === 'TDP_SECRETARY' ||
  role === 'TDP_DEPUTY_SECRETARY';

const getVisibleOrganizations = (
  organizations: OrganizationUnit[],
  role: string | null,
  tdpId?: string | null,
) => {
  const branches = organizations.filter((organization) => organization.type === 'YOUTH_UNION_BRANCH');

  if (role === 'TDP_SECRETARY' || role === 'TDP_DEPUTY_SECRETARY') {
    return branches.filter((organization) => organization.id === tdpId);
  }

  return branches;
};

export const EventListPage = () => {
  const { role, user } = useAuth();
  const [page, setPage] = useState(0);
  const [type, setType] = useState<EventType | ''>('');
  const [status, setStatus] = useState<EventStatus | ''>('');
  const [organization, setOrganization] = useState('');
  const [date, setDate] = useState('');
  const [upcoming, setUpcoming] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formError, setFormError] = useState<ApiError | null>(null);

  const organizationsQuery = useOrganizations();
  const organizations = useMemo(
    () => getVisibleOrganizations(organizationsQuery.data ?? [], role, user?.tdpId),
    [organizationsQuery.data, role, user?.tdpId],
  );
  const fixedOrganizationId =
    role === 'TDP_SECRETARY' || role === 'TDP_DEPUTY_SECRETARY' ? user?.tdpId : undefined;
  const canManage = isOfficer(role);

  const filters: EventFilters = {
    type,
    organization: fixedOrganizationId ?? organization,
    status,
    date,
    upcoming,
    page,
    size: pageSize,
  };
  const eventsQuery = useEvents(filters);
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();

  const events = eventsQuery.data?.content ?? [];
  const totalPages = eventsQuery.data?.totalPages ?? 0;

  const handleCreate = async (values: EventFormValues) => {
    setFormError(null);
    try {
      await createEvent.mutateAsync({
        ...values,
        organizationId: fixedOrganizationId ?? values.organizationId,
      });
      setIsCreateOpen(false);
    } catch (error) {
      setFormError(toApiError(error));
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!window.confirm('Xóa sự kiện này?')) {
      return;
    }

    setFormError(null);
    try {
      await deleteEvent.mutateAsync(eventId);
    } catch (error) {
      setFormError(toApiError(error));
    }
  };

  if (eventsQuery.error && toApiError(eventsQuery.error).status === 403) {
    return <ForbiddenMessage />;
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sự kiện</h1>
          <p className="page-description">Danh sách và sự kiện sắp tới theo phạm vi được phép.</p>
        </div>
        {canManage && (
          <button className="primary-button inline-button" type="button" onClick={() => setIsCreateOpen(true)}>
            Tạo sự kiện
          </button>
        )}
      </div>

      <section className="surface toolbar events-toolbar">
        <label>
          Loại
          <select value={type} onChange={(event) => { setType(event.target.value as EventType | ''); setPage(0); }}>
            <option value="">Tất cả</option>
            <option value="EVENT">EVENT</option>
            <option value="MEETING">MEETING</option>
            <option value="CONGRESS">CONGRESS</option>
            <option value="TASK">TASK</option>
            <option value="ACTIVITY">ACTIVITY</option>
          </select>
        </label>
        <label>
          TDP
          <select
            disabled={Boolean(fixedOrganizationId)}
            value={fixedOrganizationId ?? organization}
            onChange={(event) => { setOrganization(event.target.value); setPage(0); }}
          >
            <option value="">Tất cả</option>
            {organizations.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Trạng thái
          <select value={status} onChange={(event) => { setStatus(event.target.value as EventStatus | ''); setPage(0); }}>
            <option value="">Tất cả</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </label>
        <label>
          Ngày
          <input type="date" value={date} onChange={(event) => { setDate(event.target.value); setPage(0); }} />
        </label>
        <label className="checkbox-label">
          <input type="checkbox" checked={upcoming} onChange={(event) => { setUpcoming(event.target.checked); setPage(0); }} />
          Upcoming
        </label>
      </section>

      {formError?.status === 403 && <ForbiddenMessage />}
      {formError && formError.status !== 403 && <section className="error-box">{formError.message}</section>}

      {isCreateOpen && (
        <section className="surface section-gap">
          <h2>Tạo sự kiện</h2>
          <EventForm
            organizations={organizations}
            fixedOrganizationId={fixedOrganizationId}
            isSubmitting={createEvent.isPending}
            submitLabel="Tạo sự kiện"
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
          />
        </section>
      )}

      <section className="event-grid section-gap">
        {eventsQuery.isLoading && <div className="surface">Đang tải sự kiện...</div>}
        {!eventsQuery.isLoading && events.length === 0 && <div className="surface">Không có sự kiện.</div>}
        {events.map((event) => (
          <article className="surface event-card" key={event.id}>
            <div>
              <span className="pill">{event.type}</span>
              <h2>{event.title}</h2>
              <p>{event.location || 'Chưa có địa điểm'}</p>
            </div>
            <dl className="compact-list">
              <div>
                <dt>Bắt đầu</dt>
                <dd>{formatDateTime(event.startTime)}</dd>
              </div>
              <div>
                <dt>Kết thúc</dt>
                <dd>{formatDateTime(event.endTime)}</dd>
              </div>
              <div>
                <dt>Hạn đăng ký</dt>
                <dd>{formatDateTime(event.registrationDeadline)}</dd>
              </div>
              <div>
                <dt>Trạng thái</dt>
                <dd>{event.status}</dd>
              </div>
            </dl>
            <div className="table-actions">
              <Link className="text-action" to={`/events/${event.id}`}>
                Xem
              </Link>
              {canManage && (
                <>
                  <Link className="text-action" to={`/events/${event.id}?mode=edit`}>
                    Sửa
                  </Link>
                  <button className="danger-link" type="button" onClick={() => handleDelete(event.id)}>
                    Xóa
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </section>

      <div className="pagination">
        <button
          className="secondary-button inline-button"
          type="button"
          disabled={page === 0}
          onClick={() => setPage((current) => Math.max(current - 1, 0))}
        >
          Trước
        </button>
        <span>
          Trang {totalPages === 0 ? 0 : page + 1} / {totalPages}
        </span>
        <button
          className="secondary-button inline-button"
          type="button"
          disabled={totalPages === 0 || page >= totalPages - 1}
          onClick={() => setPage((current) => current + 1)}
        >
          Sau
        </button>
      </div>
    </>
  );
};

