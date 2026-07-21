export const AUTH_TOKEN_COOKIE_NAME = 'bulletproof_react_app_token';

export const authCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
};

export const getAuthTokenCookie = async () => {
  // Nếu đang ở Client (Trình duyệt), không gọi next/headers
  if (typeof window !== 'undefined') return undefined;

  // Dynamic import next/headers CHỈ KHI chạy trên Server
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_TOKEN_COOKIE_NAME);
};

export const checkLoggedIn = async () => {
  if (typeof window !== 'undefined') return false;

  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get(AUTH_TOKEN_COOKIE_NAME);
  return isLoggedIn;
};
