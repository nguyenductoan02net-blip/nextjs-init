import { useNotifications } from '@/components/ui/notifications';
import { env } from '@/config/env';
import { AUTH_TOKEN_COOKIE_NAME } from '@/utils/auth';
type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  cookie?: string;
  params?: Record<string, string | number | boolean | undefined | null>;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
  baseUrl?: string;
};

function buildUrlWithParams(
  url: string,
  params?: RequestOptions['params'],
): string {
  if (!params) return url;
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  );
  if (Object.keys(filteredParams).length === 0) return url;
  const queryString = new URLSearchParams(
    filteredParams as Record<string, string>,
  ).toString();
  return `${url}?${queryString}`;
}

// Create a separate function for getting server-side cookies that can be imported where needed
export function getServerCookies() {
  if (typeof window !== 'undefined') return '';

  // Dynamic import next/headers only on server-side
  return import('next/headers').then(async (mod: any) => {
    try {
      const cookiesFn = mod.cookies || mod.default?.cookies;
      if (!cookiesFn) return '';
      const cookieStore = await cookiesFn();
      return cookieStore
        .getAll()
        .map((c: { name: string; value: string }) => `${c.name}=${c.value}`)
        .join('; ');
    } catch (error) {
      console.error('Failed to access cookies:', error);
      return '';
    }
  });
}

const getApiBaseUrl = () =>
  typeof window === 'undefined' ? env.API_URL : '/api/backend';

async function fetchApi<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    cookie,
    params,
    cache = 'no-store',
    next,
    baseUrl = getApiBaseUrl(),
  } = options;

  // Get cookies from the request when running on server
  let cookieHeader = cookie;
  if (typeof window === 'undefined' && !cookie) {
    cookieHeader = await getServerCookies();
  }

  const fullUrl = buildUrlWithParams(`${baseUrl}${url}`, params);

  const response = await fetch(fullUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(cookieHeader?.includes(`${AUTH_TOKEN_COOKIE_NAME}=`) &&
      !headers.Authorization
        ? {
            Authorization: `Bearer ${cookieHeader
              .split('; ')
              .find((cookieValue) =>
                cookieValue.startsWith(`${AUTH_TOKEN_COOKIE_NAME}=`),
              )
              ?.split('=')
              .slice(1)
              .join('=')}`,
          }
        : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
    cache,
    next,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.message || response.statusText;
    if (typeof window !== 'undefined') {
      useNotifications.getState().addNotification({
        type: 'error',
        title: 'Error',
        message,
      });
    }
    throw new Error(message);
  }

  return response.json();
}

export function createApiClient(defaultBaseUrl?: string) {
  return {
    get<T>(url: string, options?: RequestOptions): Promise<T> {
      return fetchApi<T>(url, { baseUrl: defaultBaseUrl, ...options, method: 'GET' });
    },
    post<T>(url: string, body?: any, options?: RequestOptions): Promise<T> {
      return fetchApi<T>(url, { baseUrl: defaultBaseUrl, ...options, method: 'POST', body });
    },
    put<T>(url: string, body?: any, options?: RequestOptions): Promise<T> {
      return fetchApi<T>(url, { baseUrl: defaultBaseUrl, ...options, method: 'PUT', body });
    },
    patch<T>(url: string, body?: any, options?: RequestOptions): Promise<T> {
      return fetchApi<T>(url, { baseUrl: defaultBaseUrl, ...options, method: 'PATCH', body });
    },
    delete<T>(url: string, options?: RequestOptions): Promise<T> {
      return fetchApi<T>(url, { baseUrl: defaultBaseUrl, ...options, method: 'DELETE' });
    },
  };
}

// Client cho Server chính
export const api = createApiClient();
