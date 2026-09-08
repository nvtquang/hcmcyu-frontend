import { env } from '../api/config';

export const resolveAssetUrl = (url?: string | null) => {
  if (!url) {
    return null;
  }

  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  return `${env.apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};
