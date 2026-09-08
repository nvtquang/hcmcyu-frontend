import { useMutation, useQuery } from '@tanstack/react-query';
import { tokenStorage } from '../api/tokenStorage';
import { authService } from '../services/authService';
import type { LoginRequest, RegisterRequest } from '../types/auth';

export const useCurrentUser = () =>
  useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
    enabled: Boolean(tokenStorage.getAccessToken()),
  });

export const useLogin = () =>
  useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
  });

export const useRegister = () =>
  useMutation({
    mutationFn: (payload: RegisterRequest) => authService.register(payload),
  });
