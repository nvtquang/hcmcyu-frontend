import { useRef } from 'react';
import type { Member } from '../../types/member';
import { resolveAssetUrl } from '../../utils/assetUrl';

type AvatarSectionProps = {
  member: Member;
  isUploading?: boolean;
  isDeleting?: boolean;
  onUpload: (file: File) => void;
  onDelete: () => void;
};

export const AvatarSection = ({ member, isUploading, isDeleting, onUpload, onDelete }: AvatarSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const avatarUrl = resolveAssetUrl(member.avatarUrl);

  return (
    <section className="surface profile-card">
      <div className="avatar-preview">
        {avatarUrl ? <img src={avatarUrl} alt={member.fullName} /> : <span>{member.fullName.charAt(0)}</span>}
      </div>
      <div>
        <h2>Ảnh đại diện</h2>
        <p className="page-description">Hỗ trợ jpg, jpeg, png, webp theo validation backend.</p>
        <div className="form-actions">
          <input
            ref={fileInputRef}
            className="visually-hidden"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onUpload(file);
                event.target.value = '';
              }
            }}
          />
          <button
            className="primary-button inline-button"
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            Tải avatar
          </button>
          <button
            className="secondary-button inline-button"
            type="button"
            disabled={isDeleting || !member.avatarUrl}
            onClick={onDelete}
          >
            Xóa avatar
          </button>
        </div>
      </div>
    </section>
  );
};

