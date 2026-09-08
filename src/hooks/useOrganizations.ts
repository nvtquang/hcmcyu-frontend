import { useQuery } from '@tanstack/react-query';
import { organizationService } from '../services/organizationService';

export const useOrganizations = () =>
  useQuery({
    queryKey: ['organizations'],
    queryFn: organizationService.list,
  });

