import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ForbiddenMessage } from '../../components/ForbiddenMessage';
import { PostForm } from '../../features/posts/PostForm';
import { useDeletePost, useDeletePostImage, usePost, useUpdatePost, useUploadPostImages } from '../../hooks/usePosts';
import { useOrganizations } from '../../hooks/useOrganizations';
import { useAuth } from '../../stores/AuthContext';
import type { ApiError } from '../../types/api';
import type { PostFormValues } from '../../types/post';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { formatDateTime } from '../../utils/dateTime';
import { toApiError } from '../../utils/apiError';

const isOfficer = (role: string | null) =>
  role === 'WARD_SECRETARY' ||
  role === 'WARD_DEPUTY_SECRETARY' ||
  role === 'TDP_SECRETARY' ||
  role === 'TDP_DEPUTY_SECRETARY';

const isTdpOfficer = (role: string | null) => role === 'TDP_SECRETARY' || role === 'TDP_DEPUTY_SECRETARY';

export const PostDetailPage = () => {
  const { id = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { role, user } = useAuth();
  const [formError, setFormError] = useState<ApiError | null>(null);
  const [openImageUrl, setOpenImageUrl] = useState<string | null>(null);
  const isEditing = searchParams.get('mode') === 'edit';
  const canManage = isOfficer(role);

  const postQuery = usePost(id);
  const organizationsQuery = useOrganizations();
  const organizations = useMemo(
    () => (organizationsQuery.data ?? []).filter((organization) => organization.type === 'YOUTH_UNION_BRANCH'),
    [organizationsQuery.data],
  );
  const updatePost = useUpdatePost(id);
  const deletePost = useDeletePost();
  const uploadImages = useUploadPostImages(id);
  const deleteImage = useDeletePostImage(id);
  const fixedOrganizationId = isTdpOfficer(role) ? user?.tdpId : undefined;

  const handleUpdate = async (values: PostFormValues) => {
    setFormError(null);
    try {
      await updatePost.mutateAsync({
        ...values,
        organizationId: fixedOrganizationId ?? values.organizationId,
      });
      setSearchParams({});
    } catch (error) {
      setFormError(toApiError(error));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Xóa bài viết này?')) {
      return;
    }

    setFormError(null);
    try {
      await deletePost.mutateAsync(id);
      navigate('/posts');
    } catch (error) {
      setFormError(toApiError(error));
    }
  };

  const handleUploadImages = async (files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    setFormError(null);
    try {
      await uploadImages.mutateAsync(Array.from(files));
    } catch (error) {
      setFormError(toApiError(error));
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!window.confirm('Xóa ảnh này?')) {
      return;
    }

    setFormError(null);
    try {
      await deleteImage.mutateAsync(imageId);
    } catch (error) {
      setFormError(toApiError(error));
    }
  };

  if (postQuery.error && toApiError(postQuery.error).status === 403) {
    return <ForbiddenMessage />;
  }

  if (postQuery.isLoading) {
    return <section className="surface">Đang tải bài viết...</section>;
  }

  if (!postQuery.data) {
    return <section className="error-box">Không tìm thấy bài viết.</section>;
  }

  const post = postQuery.data;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">{post.title}</h1>
          <p className="page-description">
            {post.type} · {post.status} · {formatDateTime(post.createdAt)}
          </p>
        </div>
        <div className="header-actions">
          <Link className="secondary-button inline-button" to="/posts">
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
          <h2>Sửa bài viết</h2>
          <PostForm
            initialValue={post}
            organizations={organizations}
            fixedOrganizationId={fixedOrganizationId}
            isSubmitting={updatePost.isPending}
            submitLabel="Lưu bài viết"
            onSubmit={handleUpdate}
            onCancel={() => setSearchParams({})}
          />
        </section>
      ) : (
        <article className="surface post-body">
          <div className="pill">{post.type}</div>
          <p>{post.content}</p>
        </article>
      )}

      <section className="surface section-gap">
        <div className="section-heading">
          <div>
            <h2>Ảnh bài viết</h2>
            <p className="page-description">Upload nhiều ảnh, backend validate định dạng và dung lượng.</p>
          </div>
          {canManage && (
            <>
              <input
                ref={fileInputRef}
                className="visually-hidden"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => handleUploadImages(event.target.files)}
              />
              <button
                className="primary-button inline-button"
                type="button"
                disabled={uploadImages.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload ảnh
              </button>
            </>
          )}
        </div>

        <div className="image-grid">
          {(post.images ?? []).map((image) => {
            const imageUrl = resolveAssetUrl(image.imageUrl);
            return (
              <div className="image-tile" key={image.id}>
                {imageUrl && (
                  <button type="button" onClick={() => setOpenImageUrl(imageUrl)}>
                    <img src={imageUrl} alt="Ảnh bài viết" />
                  </button>
                )}
                {canManage && (
                  <button className="danger-link" type="button" onClick={() => handleDeleteImage(image.id)}>
                    Xóa ảnh
                  </button>
                )}
              </div>
            );
          })}
          {(post.images ?? []).length === 0 && <p>Chưa có ảnh.</p>}
        </div>
      </section>

      {openImageUrl && (
        <div className="modal-backdrop" role="presentation" onClick={() => setOpenImageUrl(null)}>
          <div className="qr-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <img src={openImageUrl} alt="Ảnh bài viết phóng to" />
            <button className="secondary-button inline-button" type="button" onClick={() => setOpenImageUrl(null)}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
};

