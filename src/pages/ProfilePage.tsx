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
import { toApiError } from '../utils/apiError';

export const ProfilePage = () => {
  const profileQuery = useMyProfile();
  const bankingQuery = useMyBanking();
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
    return <section className="surface">Đang tải hồ sơ...</section>;
  }

  if (profileQuery.error || !profileQuery.data) {
    return <section className="error-box">{toApiError(profileQuery.error).message ?? 'Không thể tải hồ sơ'}</section>;
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Hồ sơ cá nhân</h1>
          <p className="page-description">Thông tin phân quyền, TDP và trạng thái không được chỉnh sửa tại đây.</p>
        </div>
      </div>

      {profileError && <section className="error-box">{profileError}</section>}

      <AvatarSection
        member={profileQuery.data}
        isUploading={uploadAvatar.isPending}
        isDeleting={deleteAvatar.isPending}
        onUpload={handleAvatarUpload}
        onDelete={handleAvatarDelete}
      />

      <section className="surface section-gap">
        <h2>Thông tin cá nhân</h2>
        <ProfileForm
          member={profileQuery.data}
          isSubmitting={updateProfile.isPending}
          onSubmit={handleProfileSave}
        />
      </section>

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
    </>
  );
};

