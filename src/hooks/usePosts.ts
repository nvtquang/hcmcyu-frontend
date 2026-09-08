import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { postService } from '../services/postService';
import type { PostFilters, PostFormValues } from '../types/post';

export const postKeys = {
  all: ['posts'] as const,
  list: (filters: PostFilters) => [...postKeys.all, 'list', filters] as const,
  detail: (id: string) => [...postKeys.all, 'detail', id] as const,
};

export const usePosts = (filters: PostFilters) =>
  useQuery({
    queryKey: postKeys.list(filters),
    queryFn: () => postService.list(filters),
  });

export const usePost = (id: string) =>
  useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postService.findById(id),
    enabled: Boolean(id),
  });

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: PostFormValues) => postService.create(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postKeys.all }),
  });
};

export const useUpdatePost = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: PostFormValues) => postService.update(id, values),
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      queryClient.setQueryData(postKeys.detail(id), post);
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postKeys.all }),
  });
};

export const useUploadPostImages = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: File[]) => postService.uploadImages(id, files),
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      queryClient.setQueryData(postKeys.detail(id), post);
    },
  });
};

export const useDeletePostImage = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => postService.deleteImage(postId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
    },
  });
};

