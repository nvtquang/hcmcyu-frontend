import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ForbiddenMessage } from '../../components/ForbiddenMessage';
import { MemberForm } from '../../features/members/MemberForm';
import { useCreateMember, useDisableMember, useMembers } from '../../hooks/useMembers';
import { useOrganizations } from '../../hooks/useOrganizations';
import { useAuth } from '../../stores/AuthContext';
import type { ApiError } from '../../types/api';
import type { MemberFilters, MemberFormValues, MemberStatus } from '../../types/member';
import type { OrganizationUnit } from '../../types/organization';
import { toApiError } from '../../utils/apiError';

const pageSize = 10;

const isForbidden = (error: unknown) => toApiError(error).status === 403;

const getVisibleOrganizations = (
  organizations: OrganizationUnit[],
  role: string | null,
  tdpId?: string | null,
) => {
  const branchOrganizations = organizations.filter((organization) => organization.type === 'YOUTH_UNION_BRANCH');

  if (role === 'TDP_SECRETARY' || role === 'TDP_DEPUTY_SECRETARY') {
    return branchOrganizations.filter((organization) => organization.id === tdpId);
  }

  return branchOrganizations;
};

export const MemberListPage = () => {
  const { role, user } = useAuth();
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [status, setStatus] = useState<MemberStatus | ''>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formError, setFormError] = useState<ApiError | null>(null);

  const organizationsQuery = useOrganizations();
  const organizations = useMemo(
    () => getVisibleOrganizations(organizationsQuery.data ?? [], role, user?.tdpId),
    [organizationsQuery.data, role, user?.tdpId],
  );
  const fixedOrganizationId =
    role === 'TDP_SECRETARY' || role === 'TDP_DEPUTY_SECRETARY' ? user?.tdpId : undefined;
  const canAssignRole = role === 'WARD_SECRETARY';

  const filters: MemberFilters = {
    keyword,
    organizationId: fixedOrganizationId ?? organizationId,
    status,
    page,
    size: pageSize,
  };
  const membersQuery = useMembers(filters);
  const createMember = useCreateMember();
  const disableMember = useDisableMember();

  const members = membersQuery.data?.content ?? [];
  const totalPages = membersQuery.data?.totalPages ?? 0;

  const handleCreate = async (values: MemberFormValues) => {
    setFormError(null);
    try {
      await createMember.mutateAsync({
        ...values,
        organizationId: fixedOrganizationId ?? values.organizationId,
      });
      setIsCreateOpen(false);
    } catch (error) {
      setFormError(toApiError(error));
    }
  };

  const handleDisable = async (memberId: string) => {
    setFormError(null);
    try {
      await disableMember.mutateAsync(memberId);
    } catch (error) {
      setFormError(toApiError(error));
    }
  };

  if (membersQuery.error && isForbidden(membersQuery.error)) {
    return <ForbiddenMessage />;
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {role === 'TDP_SECRETARY' || role === 'TDP_DEPUTY_SECRETARY' ? 'Đoàn viên TDP' : 'Đoàn viên'}
          </h1>
          <p className="page-description">
            Danh sách đoàn viên theo phạm vi quản lý của tài khoản đang đăng nhập.
          </p>
        </div>
        <button className="primary-button inline-button" type="button" onClick={() => setIsCreateOpen(true)}>
          Thêm đoàn viên
        </button>
      </div>

      <section className="surface toolbar">
        <label>
          Tìm kiếm
          <input
            placeholder="Tên, email, số điện thoại"
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(0);
            }}
          />
        </label>
        <label>
          Tổ dân phố
          <select
            disabled={Boolean(fixedOrganizationId)}
            value={fixedOrganizationId ?? organizationId}
            onChange={(event) => {
              setOrganizationId(event.target.value);
              setPage(0);
            }}
          >
            <option value="">Tất cả</option>
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Trạng thái
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as MemberStatus | '');
              setPage(0);
            }}
          >
            <option value="">Tất cả</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PENDING">PENDING</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </label>
      </section>

      {formError?.status === 403 && <ForbiddenMessage />}
      {formError && formError.status !== 403 && <section className="error-box">{formError.message}</section>}

      {isCreateOpen && (
        <section className="surface section-gap">
          <h2>Thêm đoàn viên</h2>
          <MemberForm
            organizations={organizations}
            fixedOrganizationId={fixedOrganizationId}
            isSubmitting={createMember.isPending}
            submitLabel="Tạo đoàn viên"
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
          />
        </section>
      )}

      <section className="surface section-gap">
        {membersQuery.isLoading ? (
          <p>Đang tải danh sách...</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>TDP</th>
                  <th>Trạng thái</th>
                  <th>Chức vụ</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td>{member.fullName}</td>
                    <td>{member.email || '-'}</td>
                    <td>{member.organizationName || member.organizationId}</td>
                    <td>{member.memberStatus}</td>
                    <td>{member.memberRole}</td>
                    <td>
                      <div className="table-actions">
                        <Link className="text-action" to={`/members/${member.id}`}>
                          Xem
                        </Link>
                        <Link className="text-action" to={`/members/${member.id}?mode=edit`}>
                          Sửa
                        </Link>
                        {canAssignRole && (
                          <Link className="text-action" to={`/members/${member.id}?mode=role`}>
                            Phân quyền
                          </Link>
                        )}
                        <button
                          className="danger-link"
                          type="button"
                          disabled={disableMember.isPending || member.memberStatus === 'INACTIVE'}
                          onClick={() => handleDisable(member.id)}
                        >
                          Vô hiệu hóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {members.length === 0 && (
                  <tr>
                    <td colSpan={6}>Không có dữ liệu.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

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
      </section>
    </>
  );
};
