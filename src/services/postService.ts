import { httpClient } from '../api/httpClient';
import type { PageResponse } from '../types/api';
import type { Post, PostFilters, PostFormValues } from '../types/post';

const toPayload = (values: PostFormValues) => ({
  title: values.title,
  content: values.content,
  type: values.type,
  organizationId: values.organizationId,
  status: values.status,
});

export const postService = {
  list: async (filters: PostFilters) => {
    const { data } = await httpClient.get<PageResponse<Post>>('/api/posts', {
      params: {
        organization: filters.organization || undefined,
        type: filters.type || undefined,
        date: filters.date || undefined,
        page: filters.page,
        size: filters.size,
        sort: 'createdAt,desc',
      },
    });
    return data;
  },
  findById: async (id: string) => {
    const { data } = await httpClient.get<Post>(`/api/posts/${id}`);
    return data;
  },
  create: async (values: PostFormValues) => {
    const { data } = await httpClient.post<Post>('/api/posts', toPayload(values));
    return data;
  },
  update: async (id: string, values: PostFormValues) => {
    const { data } = await httpClient.put<Post>(`/api/posts/${id}`, toPayload(values));
    return data;
  },
  delete: async (id: string) => {
    await httpClient.delete(`/api/posts/${id}`);
  },
  uploadImages: async (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const { data } = await httpClient.post<Post>(`/api/posts/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  deleteImage: async (postId: string, imageId: string) => {
    await httpClient.delete(`/api/posts/${postId}/images/${imageId}`);
  },
};

