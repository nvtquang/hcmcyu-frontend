import { useState } from 'react';
import { BankingSection } from '../features/banking/BankingSection';
import { AvatarSection } from '../features/profile/AvatarSection';
import { ProfileForm } from '../features/profile/ProfileForm';
import {
  useDeleteAvatar,
  useDeleteBankQr,
  useMyBanking,
  useMyProfile,
  useUpdateMyBanking,
  useUpdateMyProfile,
  useUploadAvatar,
  useUploadBankQr,
} from '../hooks/useMembers';
import type { ProfileFormValues } from '../services/memberService';
import type { BankingFormValues } from '../types/banking';
import { Card, LoadingSkeleton, PageHeader, StatusBadge } from '../components/ui';
import { memberStatusLabel, roleLabel } from '../utils/labels';
import { toApiError } from '../utils/apiError';
import { useAuth } from '../stores/AuthContext';

const memberOnlyBankingRoles = new Set(['MEMBER']);

export const ProfilePage = () => {
  const { role } = useAuth();
  const canEditBanking = Boolean(role && memberOnlyBankingRoles.has(role));
  const profileQuery = useMyProfile();
  const bankingQuery = useMyBanking(canEditBanking);
  const updateProfile = useUpdateMyProfile();
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();
  const updateBanking = useUpdateMyBanking();
  const uploadBankQr = useUploadBankQr();
  const deleteBankQr = useDeleteBankQr();
  const [profileError, setProfileError] = useState<string | null>(null);
  const [bankingError, setBankingError] = useState<string | null>(null);

  const handleProfileSave = async (values: ProfileFormValues) => {
    setProfileError(null);
    try {
      await updateProfile.mutateAsync(values);
    } catch (error) {
      setProfileError(toApiError(error).message ?? 'Không thể lưu hồ sơ');
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setProfileError(null);
    try {
      await uploadAvatar.mutateAsync(file);
    } catch (error) {
      setProfileError(toApiError(error).message ?? 'Không thể tải avatar');
    }
  };

  const handleAvatarDelete = async () => {
    setProfileError(null);
    try {
      await deleteAvatar.mutateAsync();
    } catch (error) {
      setProfileError(toApiError(error).message ?? 'Không thể xóa avatar');
    }
  };

  const handleBankingSave = async (values: BankingFormValues) => {
    setBankingError(null);
    try {
      await updateBanking.mutateAsync(values);
    } catch (error) {
      setBankingError(toApiError(error).message ?? 'Không thể lưu thông tin ngân hàng');
    }
  };

  const handleQrUpload = async (file: File) => {
    setBankingError(null);
    try {
      await uploadBankQr.mutateAsync(file);
    } catch (error) {
      setBankingError(toApiError(error).message ?? 'Không thể tải QR Banking');
    }
  };

  const handleQrDelete = async () => {
    setBankingError(null);
    try {
      await deleteBankQr.mutateAsync();
    } catch (error) {
      setBankingError(toApiError(error).message ?? 'Không thể xóa QR Banking');
    }
  };

  if (profileQuery.isLoading) {
    return (
      <Card>
        <LoadingSkeleton rows={5} />
      </Card>
    );
  }

  if (profileQuery.error || !profileQuery.data) {
    return <section className="error-box">{toApiError(profileQuery.error).message ?? 'Không thể tải hồ sơ'}</section>;
  }

  const member = profileQuery.data;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Cá nhân"
        title="Hồ sơ cá nhân"
        description="Thông tin phân quyền, TDP và trạng thái được quản lý bởi cán bộ có thẩm quyền."
      />

      {profileError && <section className="error-box">{profileError}</section>}

      <AvatarSection
        member={member}
        isUploading={uploadAvatar.isPending}
        isDeleting={deleteAvatar.isPending}
        onUpload={handleAvatarUpload}
        onDelete={handleAvatarDelete}
      />

      <Card>
        <div className="section-heading">
          <h2>Thông tin Đoàn</h2>
        </div>
        <div className="detail-grid">
          <div>
            <span>Tổ dân phố</span>
            <strong>{member.organizationName || member.organizationId}</strong>
          </div>
          <div>
            <span>Trạng thái</span>
            <strong>
              <StatusBadge value={member.memberStatus} label={memberStatusLabel[member.memberStatus]} />
            </strong>
          </div>
          <div>
            <span>Vai trò</span>
            <strong>{roleLabel[member.memberRole] ?? member.memberRole}</strong>
          </div>
          <div>
            <span>Ngày vào Đoàn</span>
            <strong>{member.youthUnionJoinDate || '-'}</strong>
          </div>
        </div>
      </Card>

      <Card>
        <div className="section-heading">
          <h2>Thông tin cá nhân</h2>
        </div>
        <ProfileForm member={member} isSubmitting={updateProfile.isPending} onSubmit={handleProfileSave} />
      </Card>

      {canEditBanking && (
        <BankingSection
          banking={bankingQuery.data}
          errorMessage={bankingError || (bankingQuery.error ? toApiError(bankingQuery.error).message : null)}
          isEditable
          isLoading={bankingQuery.isLoading}
          isSaving={updateBanking.isPending}
          isUploading={uploadBankQr.isPending}
          isDeleting={deleteBankQr.isPending}
          onSave={handleBankingSave}
          onUploadQr={handleQrUpload}
          onDeleteQr={handleQrDelete}
        />
      )}
    </div>
  );
};
