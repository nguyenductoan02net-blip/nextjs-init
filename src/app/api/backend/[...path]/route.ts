import { NextRequest, NextResponse } from 'next/server';

import { env } from '@/config/env';
import {
  AUTH_TOKEN_COOKIE_NAME,
  authCookieOptions,
} from '@/utils/auth';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

const isAuthPath = (path: string) =>
  path === 'auth/login' || path === 'auth/register';

export async function handler(
  request: NextRequest,
  context: RouteContext,
) {
  const { path } = await context.params;
  const backendUrl = `${env.API_URL}/${path.join('/')}${request.nextUrl.search}`;
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value;
  const requestHeaders = new Headers(request.headers);

  requestHeaders.delete('host');
  requestHeaders.delete('content-length');
  if (token) {
    requestHeaders.set('authorization', `Bearer ${token}`);
  }

  const upstreamResponse = await fetch(backendUrl, {
    method: request.method,
    headers: requestHeaders,
    body: request.method === 'GET' || request.method === 'HEAD'
      ? undefined
      : await request.arrayBuffer(),
    cache: 'no-store',
  });

  const responseBody = await upstreamResponse.arrayBuffer();
  const responseHeaders = new Headers();
  const contentType = upstreamResponse.headers.get('content-type');
  if (contentType) responseHeaders.set('content-type', contentType);

  const response = new NextResponse(responseBody, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });

  if (isAuthPath(path.join('/')) && upstreamResponse.ok) {
    const payload = JSON.parse(new TextDecoder().decode(responseBody)) as {
      jwt?: string;
    };
    if (payload.jwt) {
      response.cookies.set(
        AUTH_TOKEN_COOKIE_NAME,
        payload.jwt,
        authCookieOptions,
      );
    }
  }

  if (path.join('/') === 'auth/logout') {
    response.cookies.delete(AUTH_TOKEN_COOKIE_NAME);
  }

  return response;
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
