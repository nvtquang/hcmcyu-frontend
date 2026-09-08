import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import type { NotificationFilters } from '../types/notification';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (filters: NotificationFilters) => [...notificationKeys.all, 'list', filters] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

export const useNotifications = (filters: NotificationFilters) =>
  useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => notificationService.list(filters),
  });

export const useUnreadNotifications = () =>
  useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: notificationService.unreadCount,
    refetchInterval: 60000,
  });

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userNotificationId: string) => notificationService.markRead(userNotificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};
