import { getToken, getUser } from './token';

export function useAuth() {
  const token = getToken();
  const user  = getUser();

  return {
    isAuthenticated: Boolean(token),
    role: user?.role || 'CUSTOMER',
    user,
  };
}