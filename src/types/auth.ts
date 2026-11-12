export const isAuthEndpoint = (url: string = ''): boolean => {
  const authEndpoints = ['/auth/token/', '/auth/register/', '/auth/token/refresh/'];
  return authEndpoints.some(endpoint => url.includes(endpoint));
};