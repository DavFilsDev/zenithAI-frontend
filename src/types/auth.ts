const NO_REFRESH_ENDPOINTS = ['/auth/token/', '/auth/register/', '/auth/profile/'];

export const shouldSkipRefresh = (url: string = ''): boolean =>
  NO_REFRESH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
