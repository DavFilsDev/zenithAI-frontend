const NO_REFRESH_ENDPOINTS = ['/auth/token/', '/auth/register/', '/auth/profile/', '/auth/logout/'];

export const shouldSkipRefresh = (url: string = ''): boolean =>
  NO_REFRESH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
