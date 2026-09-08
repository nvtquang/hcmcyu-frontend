import { httpClient } from '../api/httpClient';
import type { PageResponse } from '../types/api';
import type { Notification, NotificationFilters, UnreadCount } from '../types/notification';

export const notificationService = {
  list: async (filters: NotificationFilters) => {
    const { data } = await httpClient.get<PageResponse<Notification>>('/api/notifications', {
      params: {
        page: filters.page,
        size: filters.size,
        sort: 'createdAt,desc',
      },
    });
    return data;
  },
  unreadCount: async () => {
    const { data } = await httpClient.get<UnreadCount>('/api/notifications/unread-count');
    return data;
  },
  markRead: async (userNotificationId: string) => {
    const { data } = await httpClient.put<Notification>(`/api/notifications/${userNotificationId}/read`);
    return data;
  },
  markAllRead: async () => {
    const { data } = await httpClient.put<UnreadCount>('/api/notifications/read-all');
    return data;
  },
};
