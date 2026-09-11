import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { ForbiddenMessage } from '../../components/ForbiddenMessage';
import { Card, EmptyState, LoadingSkeleton, PageHeader, StatusBadge } from '../../components/ui';
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
import { useMemberNameMap } from '../../hooks/useMembers';
import { useOrganizations } from '../../hooks/useOrganizations';
import { useAuth } from '../../stores/AuthContext';
import type { ApiError } from '../../types/api';
import type { EventFormValues, ParticipationStatus } from '../../types/event';
import { eventStatusLabel, eventTypeLabel, participationStatusLabel } from '../../utils/labels';
import { formatDateTime } from '../../utils/dateTime';
import { toApiError } from '../../utils/apiError';

const canManageEvents = (role: string | null) => role === 'WARD_SECRETARY' || role === 'WARD_DEPUTY_SECRETARY';

const isTdpOfficer = (role: string | null) => role === 'TDP_SECRETARY' || role === 'TDP_DEPUTY_SECRETARY';

export const EventDetailPage = () => {
  const { id = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const [formError, setFormError] = useState<ApiError | null>(null);
  const isEditing = searchParams.get('mode') === 'edit';
  const canManage = canManageEvents(role);

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
  const participantNameMap = useMemberNameMap((participantsQuery.data ?? []).map((participant) => participant.memberId));

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
    return (
      <Card>
        <LoadingSkeleton rows={5} />
      </Card>
    );
  }

  if (!eventQuery.data) {
    return <section className="error-box">Không tìm thấy sự kiện.</section>;
  }

  const event = eventQuery.data;
  const summary = summaryQuery.data ?? { going: 0, notGoing: 0, undecided: 0 };
  const participantCount = summary.going + summary.notGoing + summary.undecided;
  const eventOrganizationName =
    organizationsQuery.data?.find((organization) => organization.id === event.organizationId)?.name ?? 'Chưa có TDP';

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={eventTypeLabel[event.type]}
        title={event.title}
        description={`${eventStatusLabel[event.status]} · ${formatDateTime(event.startTime)}`}
        actions={
          <>
            <Link className="secondary-button inline-button" to="/events">
              <ArrowLeft size={17} aria-hidden="true" />
              Quay lại
            </Link>
            {canManage && (
              <>
                <button
                  className="primary-button inline-button"
                  type="button"
                  onClick={() => setSearchParams(isEditing ? {} : { mode: 'edit' })}
                >
                  <Pencil size={17} aria-hidden="true" />
                  {isEditing ? 'Xem chi tiết' : 'Sửa'}
                </button>
                <button className="secondary-button inline-button" type="button" onClick={handleDelete}>
                  Xóa
                </button>
              </>
            )}
          </>
        }
      />

      {formError?.status === 403 && <ForbiddenMessage />}
      {formError && formError.status !== 403 && <section className="error-box">{formError.message}</section>}

      {isEditing && canManage ? (
        <Card>
          <div className="section-heading">
            <h2>Sửa sự kiện</h2>
          </div>
          <EventForm
            initialValue={event}
            organizations={organizations}
            fixedOrganizationId={fixedOrganizationId}
            isSubmitting={updateEvent.isPending}
            submitLabel="Lưu sự kiện"
            onSubmit={handleUpdate}
            onCancel={() => setSearchParams({})}
          />
        </Card>
      ) : (
        <>
          <Card className="detail-grid">
            <div>
              <span>Địa điểm</span>
              <strong>{event.location || '-'}</strong>
            </div>
            <div>
              <span>Tổ chức</span>
              <strong>{eventOrganizationName}</strong>
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
          </Card>

          <section className="stats-grid">
            <Card>
              <span>Tổng phản hồi</span>
              <strong>{participantCount}</strong>
            </Card>
            <Card>
              <span>Tham gia</span>
              <strong>{summary.going}</strong>
            </Card>
            <Card>
              <span>Không tham gia</span>
              <strong>{summary.notGoing}</strong>
            </Card>
            <Card>
              <span>Chưa chắc</span>
              <strong>{summary.undecided}</strong>
            </Card>
          </section>

          {role === 'MEMBER' && (
            <Card>
              <div className="section-heading">
                <div>
                  <h2>Đăng ký tham gia</h2>
                  <p className="page-description">
                    Trạng thái hiện tại: {myParticipation ? participationStatusLabel[myParticipation.status] : 'Chưa chọn'}
                  </p>
                </div>
              </div>
              <div className="form-actions">
                {(Object.keys(participationStatusLabel) as ParticipationStatus[]).map((status) => (
                  <button
                    className={myParticipation?.status === status ? 'primary-button inline-button' : 'secondary-button inline-button'}
                    type="button"
                    key={status}
                    disabled={updateParticipation.isPending}
                    onClick={() => handleVote(status)}
                  >
                    {participationStatusLabel[status]}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {canManage && (
            <Card>
              <div className="section-heading">
                <h2>Danh sách phản hồi</h2>
              </div>
              {participantsQuery.error && toApiError(participantsQuery.error).status === 403 && <ForbiddenMessage />}
              {participantsQuery.isLoading ? (
                <LoadingSkeleton rows={4} />
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Đoàn viên</th>
                        <th>Trạng thái</th>
                        <th>Cập nhật</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(participantsQuery.data ?? []).map((participant) => (
                        <tr key={participant.id}>
                          <td>{participantNameMap[participant.memberId] ?? 'Đoàn viên'}</td>
                          <td>
                            <StatusBadge value={participant.status} label={participationStatusLabel[participant.status]} />
                          </td>
                          <td>{formatDateTime(participant.updatedAt)}</td>
                        </tr>
                      ))}
                      {(participantsQuery.data ?? []).length === 0 && (
                        <tr>
                          <td colSpan={3}>
                            <EmptyState title="Chưa có phản hồi" />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
};
