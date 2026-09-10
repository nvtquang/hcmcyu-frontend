import { FormEvent, useEffect, useState } from 'react';
import type { Post, PostFormValues, PostStatus, PostType } from '../../types/post';
import type { OrganizationUnit } from '../../types/organization';
import { postStatusLabel, postTypeLabel } from '../../utils/labels';

type PostFormProps = {
  initialValue?: Post;
  organizations: OrganizationUnit[];
  fixedOrganizationId?: string | null;
  isSubmitting?: boolean;
  submitLabel: string;
  onSubmit: (values: PostFormValues) => void;
  onCancel?: () => void;
};

const postTypes: PostType[] = ['NEWS', 'ANNOUNCEMENT', 'ACTIVITY_REPORT', 'OTHER'];
const postStatuses: PostStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

const toFormValues = (
  post: Post | undefined,
  defaultOrganizationId: string,
  fixedOrganizationId?: string | null,
): PostFormValues => ({
  title: post?.title ?? '',
  content: post?.content ?? '',
  type: post?.type ?? 'NEWS',
  organizationId: fixedOrganizationId ?? post?.organizationId ?? defaultOrganizationId,
  status: post?.status ?? 'PUBLISHED',
});

export const PostForm = ({
  initialValue,
  organizations,
  fixedOrganizationId,
  isSubmitting,
  submitLabel,
  onSubmit,
  onCancel,
}: PostFormProps) => {
  const defaultOrganizationId = organizations[0]?.id ?? fixedOrganizationId ?? '';
  const [values, setValues] = useState<PostFormValues>(() =>
    toFormValues(initialValue, defaultOrganizationId, fixedOrganizationId),
  );

  useEffect(() => {
    setValues(toFormValues(initialValue, defaultOrganizationId, fixedOrganizationId));
  }, [defaultOrganizationId, fixedOrganizationId, initialValue]);

  const updateField = (field: keyof PostFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <form className="member-form" onSubmit={handleSubmit}>
      <label>
        Tiêu đề
        <input
          required
          maxLength={255}
          value={values.title}
          onChange={(event) => updateField('title', event.target.value)}
        />
      </label>
      <label>
        Loại bài
        <select value={values.type} onChange={(event) => updateField('type', event.target.value)}>
          {postTypes.map((type) => (
            <option key={type} value={type}>
              {postTypeLabel[type]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Tổ dân phố
        <select
          required
          disabled={Boolean(fixedOrganizationId)}
          value={values.organizationId}
          onChange={(event) => updateField('organizationId', event.target.value)}
        >
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Trạng thái
        <select value={values.status} onChange={(event) => updateField('status', event.target.value)}>
          {postStatuses.map((status) => (
            <option key={status} value={status}>
              {postStatusLabel[status]}
            </option>
          ))}
        </select>
      </label>
      <label className="form-wide">
        Nội dung
        <textarea
          required
          value={values.content}
          onChange={(event) => updateField('content', event.target.value)}
        />
      </label>
      <div className="form-actions form-wide">
        {onCancel && (
          <button className="secondary-button inline-button" type="button" onClick={onCancel}>
            Hủy
          </button>
        )}
        <button className="primary-button inline-button" type="submit" disabled={isSubmitting}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
};
