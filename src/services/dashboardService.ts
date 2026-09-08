import { httpClient } from '../api/httpClient';
import type { DashboardSummary } from '../types/dashboard';

export const dashboardService = {
  summary: async () => {
    const { data } = await httpClient.get<DashboardSummary>('/api/dashboard/summary');
    return data;
  },
};
