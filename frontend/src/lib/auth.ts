export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

export const getRole = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_role');
};

export const getUserName = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_name');
};

export const setAuth = (token: string, role: string, fullName: string) => {
  localStorage.setItem('access_token', token);
  localStorage.setItem('user_role', role);
  localStorage.setItem('user_name', fullName);
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_name');
};
