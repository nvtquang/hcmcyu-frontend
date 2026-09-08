import { tokenStorage } from '../api/tokenStorage';

export const authStore = {
  isAuthenticated: () => Boolean(tokenStorage.getAccessToken()),
  clear: () => tokenStorage.clear(),
};
