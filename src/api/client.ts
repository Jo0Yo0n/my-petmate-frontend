import { parseProblemDetail } from './parseProblemDetail';

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  json?: unknown;
};

export type ApiResult =
  | { kind: 'success'; data: unknown }
  | { kind: 'empty' }
  | {
      kind: 'http-error';
      error: Awaited<ReturnType<typeof parseProblemDetail>>;
    }
  | { kind: 'network-error' }
  | { kind: 'invalid-json' };

export async function apiRequest(
  path: `/api/${string}`,
  { json, headers: requestHeaders, ...options }: ApiRequestOptions = {},
): Promise<ApiResult> {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL is required.');
  }

  const headers = new Headers(requestHeaders);
  headers.set('Accept', 'application/json, application/problem+json');
  const body = json === undefined ? undefined : JSON.stringify(json);
  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  let text: string;
  try {
    const response = await fetch(`${baseUrl.replace(/\/+$/, '')}${path}`, {
      ...options,
      headers,
      body,
    });
    if (!response.ok)
      return { kind: 'http-error', error: await parseProblemDetail(response) };
    if (response.status === 204 || response.status === 205) {
      return { kind: 'empty' };
    }
    text = await response.text();
  } catch {
    return { kind: 'network-error' };
  }

  if (text === '') return { kind: 'empty' };

  try {
    const data: unknown = JSON.parse(text);
    return { kind: 'success', data };
  } catch {
    return { kind: 'invalid-json' };
  }
}
