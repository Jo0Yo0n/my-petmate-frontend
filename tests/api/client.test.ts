import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import { apiRequest } from '../../src/api/client';

const originalBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
let fetchMock: jest.SpiedFunction<typeof fetch>;

beforeEach(() => {
  process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:8080///';
  fetchMock = jest.spyOn(globalThis, 'fetch');
});

afterEach(() => {
  jest.restoreAllMocks();
  if (originalBaseUrl === undefined)
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
  else process.env.EXPO_PUBLIC_API_BASE_URL = originalBaseUrl;
});

test('JSON 요청을 직렬화하고 호출자 헤더와 옵션을 전달한다', async () => {
  fetchMock.mockResolvedValue(new Response('{"nickname":"보리네"}'));
  const headers = new Headers({ 'X-Example': 'demo' });
  expect(
    await apiRequest('/api/example', {
      method: 'POST',
      headers,
      json: { value: 1 },
    }),
  ).toEqual({ kind: 'success', data: { nickname: '보리네' } });
  const [url, options] = fetchMock.mock.calls[0];
  expect(url).toBe('http://localhost:8080/api/example');
  expect(options?.method).toBe('POST');
  expect(options?.body).toBe('{"value":1}');
  expect(new Headers(options?.headers).get('Accept')).toBe(
    'application/json, application/problem+json',
  );
  expect(new Headers(options?.headers).get('Content-Type')).toBe(
    'application/json',
  );
  expect(new Headers(options?.headers).get('X-Example')).toBe('demo');
  expect(headers.get('Content-Type')).toBeNull();
});

test('GET은 JSON 본문과 Content-Type 없이 전송한다', async () => {
  fetchMock.mockResolvedValue(new Response('{}'));
  await apiRequest('/api/guardians/me');
  expect(fetchMock.mock.calls[0][1]?.body).toBeUndefined();
  expect(
    new Headers(fetchMock.mock.calls[0][1]?.headers).get('Content-Type'),
  ).toBeNull();
});

test.each([200, 204, 205])('빈 성공 응답 %i을 처리한다', async (status) => {
  fetchMock.mockResolvedValue(new Response(null, { status }));
  expect(await apiRequest('/api/example')).toEqual({ kind: 'empty' });
});

test('HTML HTTP 오류도 파서를 통해 반환한다', async () => {
  fetchMock.mockResolvedValue(
    new Response('<html/>', {
      status: 502,
      headers: { 'Content-Type': 'text/html' },
    }),
  );
  expect(await apiRequest('/api/example')).toMatchObject({
    kind: 'http-error',
    error: { kind: 'non-json', status: 502 },
  });
});

test('연결 실패와 잘못된 성공 JSON을 구분한다', async () => {
  fetchMock.mockRejectedValueOnce(new Error('offline'));
  expect(await apiRequest('/api/example')).toEqual({ kind: 'network-error' });
  fetchMock.mockResolvedValueOnce(new Response('{'));
  expect(await apiRequest('/api/example')).toEqual({ kind: 'invalid-json' });
});

test('성공 응답 본문 읽기 실패를 통신 실패로 반환한다', async () => {
  const response = new Response('{}');
  jest.spyOn(response, 'text').mockRejectedValue(new Error('connection lost'));
  fetchMock.mockResolvedValue(response);
  expect(await apiRequest('/api/example')).toEqual({ kind: 'network-error' });
});

test('기본 URL 누락은 요청 전 설정 오류로 알린다', async () => {
  delete process.env.EXPO_PUBLIC_API_BASE_URL;
  await expect(apiRequest('/api/example')).rejects.toThrow(
    'EXPO_PUBLIC_API_BASE_URL is required.',
  );
  expect(fetchMock).not.toHaveBeenCalled();
});

test('400 필드 오류를 실제 파서로 전달하고 민감한 응답 원문을 반환하거나 로그에 기록하지 않는다', async () => {
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const error = jest.spyOn(console, 'error').mockImplementation(() => {});
  const requestId = 'req-01ARZ3NDEKTSV4RRFFQ69G5FAV';
  const fieldErrors = [
    { field: 'email', reason: '이메일 형식이 올바르지 않습니다.' },
  ];
  fetchMock.mockResolvedValue(
    new Response(
      JSON.stringify({
        type: 'urn:my-petmate:problem:validation-failed',
        title: '입력값 검증 실패',
        status: 400,
        code: 'VALIDATION_FAILED',
        requestId,
        fieldErrors,
        detail: 'synthetic-private-response',
        instance: '/api/example',
        password: 'synthetic-password',
        accessToken: 'synthetic-access-token',
        refreshToken: 'synthetic-refresh-token',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/problem+json',
          'My-Petmate-Request-Id': requestId,
        },
      },
    ),
  );
  expect(await apiRequest('/api/example')).toEqual({
    kind: 'http-error',
    error: {
      kind: 'problem',
      status: 400,
      code: 'VALIDATION_FAILED',
      requestId,
      fieldErrors,
    },
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(log).not.toHaveBeenCalled();
  expect(warn).not.toHaveBeenCalled();
  expect(error).not.toHaveBeenCalled();
});

test('HTTP 상태와 본문 상태의 계약 불일치를 통신 실패와 구분하고 추적 정보를 보존한다', async () => {
  const requestId = 'req-01ARZ3NDEKTSV4RRFFQ69G5FAV';
  fetchMock.mockResolvedValue(
    new Response(
      JSON.stringify({
        type: 'urn:test',
        title: '오류',
        detail: '오류',
        instance: '/api/example',
        status: 403,
        code: 'FORBIDDEN',
        requestId,
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/problem+json',
          'My-Petmate-Request-Id': requestId,
        },
      },
    ),
  );
  expect(await apiRequest('/api/example')).toEqual({
    kind: 'http-error',
    error: { kind: 'status-mismatch', status: 401, requestId },
  });
});
