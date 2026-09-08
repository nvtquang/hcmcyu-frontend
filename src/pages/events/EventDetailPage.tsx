import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ForbiddenMessage } from '../../components/ForbiddenMessage';
import { EventForm } from '../../features/events/EventForm';
import {
  useDeleteEvent,
  useEvent,
  useMyEventParticipations,
  useParticipants,
  useParticipationSummary,
  useUpdateEvent,
  useUpdateParticipation,
} from '../../hooks/useEvents';
import { useOrganizations } from '../../hooks/useOrganizations';
import { useAuth } from '../../stores/AuthContext';
import type { ApiError } from '../../types/api';
import type { EventFormValues, ParticipationStatus } from '../../types/event';
import { formatDateTime } from '../../utils/dateTime';
import { toApiError } from '../../utils/apiError';

const isOfficer = (role: string | null) =>
  role === 'WARD_SECRETARY' ||
  role === 'WARD_DEPUTY_SECRETARY' ||
  role === 'TDP_SECRETARY' ||
  role === 'TDP_DEPUTY_SECRETARY';

const isTdpOfficer = (role: string | null) => role === 'TDP_SECRETARY' || role === 'TDP_DEPUTY_SECRETARY';

const participationLabels: Record<ParticipationStatus, string> = {
  GOING: 'Tham gia',
  NOT_GOING: 'Không tham gia',
  UNDECIDED: 'Chưa chắc',
};

export const EventDetailPage = () => {
  const { id = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const [formError, setFormError] = useState<ApiError | null>(null);
  const isEditing = searchParams.get('mode') === 'edit';
  const canManage = isOfficer(role);

  const eventQuery = useEvent(id);
  const summaryQuery = useParticipationSummary(id);
  const participantsQuery = useParticipants(id, canManage);
  const myParticipationsQuery = useMyEventParticipations();
  const organizationsQuery = useOrganizations();
  const updateEvent = useUpdateEvent(id);
  const deleteEvent = useDeleteEvent();
  const updateParticipation = useUpdateParticipation(id);

  const organizations = useMemo(
    () => (organizationsQuery.data ?? []).filter((organization) => organization.type === 'YOUTH_UNION_BRANCH'),
    [organizationsQuery.data],
  );
  const fixedOrganizationId = isTdpOfficer(role) ? user?.tdpId : undefined;
  const myParticipation = myParticipationsQuery.data?.find((item) => item.eventId === id);

  const handleUpdate = async (values: EventFormValues) => {
    setFormError(null);
    try {
      await updateEvent.mutateAsync({
        ...values,
        organizationId: fixedOrganizationId ?? values.organizationId,
      });
      setSearchParams({});
    } catch (error) {
      setFormError(toApiError(error));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Xóa sự kiện này?')) {
      return;
    }

    setFormError(null);
    try {
      await deleteEvent.mutateAsync(id);
      navigate('/events');
    } catch (error) {
      setFormError(toApiError(error));
    }
  };

  const handleVote = async (status: ParticipationStatus) => {
    setFormError(null);
    try {
      await updateParticipation.mutateAsync(status);
    } catch (error) {
      setFormError(toApiError(error));
    }
  };

  if (eventQuery.error && toApiError(eventQuery.error).status === 403) {
    return <ForbiddenMessage />;
  }

  if (eventQuery.isLoading) {
    return <section className="surface">Đang tải sự kiện...</section>;
  }

  if (!eventQuery.data) {
    return <section className="error-box">Không tìm thấy sự kiện.</section>;
  }

  const event = eventQuery.data;
  const summary = summaryQuery.data ?? { going: 0, notGoing: 0, undecided: 0 };
  const participantCount = summary.going + summary.notGoing + summary.undecided;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">{event.title}</h1>
          <p className="page-description">
            {event.type} · {event.status}
          </p>
        </div>
        <div className="header-actions">
          <Link className="secondary-button inline-button" to="/events">
            Quay lại
          </Link>
          {canManage && (
            <>
              <button
                className="primary-button inline-button"
                type="button"
                onClick={() => setSearchParams(isEditing ? {} : { mode: 'edit' })}
              >
                {isEditing ? 'Xem chi tiết' : 'Sửa'}
              </button>
              <button className="secondary-button inline-button" type="button" onClick={handleDelete}>
                Xóa
              </button>
            </>
          )}
        </div>
      </div>

      {formError?.status === 403 && <ForbiddenMessage />}
      {formError && formError.status !== 403 && <section className="error-box">{formError.message}</section>}

      {isEditing && canManage ? (
        <section className="surface">
          <h2>Sửa sự kiện</h2>
          <EventForm
            initialValue={event}
            organizations={organizations}
            fixedOrganizationId={fixedOrganizationId}
            isSubmitting={updateEvent.isPending}
            submitLabel="Lưu sự kiện"
            onSubmit={handleUpdate}
            onCancel={() => setSearchParams({})}
          />
        </section>
      ) : (
        <>
          <section className="surface detail-grid">
            <div>
              <span>Địa điểm</span>
              <strong>{event.location || '-'}</strong>
            </div>
            <div>
              <span>Tổ chức</span>
              <strong>{event.organizationId}</strong>
            </div>
            <div>
              <span>Bắt đầu</span>
              <strong>{formatDateTime(event.startTime)}</strong>
            </div>
            <div>
              <span>Kết thúc</span>
              <strong>{formatDateTime(event.endTime)}</strong>
            </div>
            <div>
              <span>Hạn đăng ký</span>
              <strong>{formatDateTime(event.registrationDeadline)}</strong>
            </div>
            <div>
              <span>Số lượng tối đa</span>
              <strong>{event.maxParticipants ?? 'Không giới hạn'}</strong>
            </div>
            <div className="detail-wide">
              <span>Mô tả</span>
              <strong>{event.description || '-'}</strong>
            </div>
          </section>

          <section className="surface section-gap stats-grid">
            <div>
              <span>Participant count</span>
              <strong>{participantCount}</strong>
            </div>
            <div>
              <span>GOING</span>
              <strong>{summary.going}</strong>
            </div>
            <div>
              <span>NOT_GOING</span>
              <strong>{summary.notGoing}</strong>
            </div>
            <div>
              <span>UNDECIDED</span>
              <strong>{summary.undecided}</strong>
            </div>
          </section>

          {role === 'MEMBER' && (
            <section className="surface section-gap">
              <h2>Đăng ký tham gia</h2>
              <p className="page-description">Trạng thái hiện tại: {myParticipation?.status ?? 'Chưa chọn'}</p>
              <div className="form-actions">
                {(Object.keys(participationLabels) as ParticipationStatus[]).map((status) => (
                  <button
                    className={myParticipation?.status === status ? 'primary-button inline-button' : 'secondary-button inline-button'}
                    type="button"
                    key={status}
                    disabled={updateParticipation.isPending}
                    onClick={() => handleVote(status)}
                  >
                    {participationLabels[status]}
                  </button>
                ))}
              </div>
            </section>
          )}

          {canManage && (
            <section className="surface section-gap">
              <h2>Participants</h2>
              {participantsQuery.error && toApiError(participantsQuery.error).status === 403 && <ForbiddenMessage />}
              {participantsQuery.isLoading ? (
                <p>Đang tải danh sách...</p>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Member ID</th>
                        <th>Trạng thái</th>
                        <th>Cập nhật</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(participantsQuery.data ?? []).map((participant) => (
                        <tr key={participant.id}>
                          <td>{participant.memberId}</td>
                          <td>{participant.status}</td>
                          <td>{formatDateTime(participant.updatedAt)}</td>
                        </tr>
                      ))}
                      {(participantsQuery.data ?? []).length === 0 && (
                        <tr>
                          <td colSpan={3}>Chưa có participant.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </>
  );
};

