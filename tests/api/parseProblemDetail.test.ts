import { expect, jest, test } from '@jest/globals';
import { parseProblemDetail } from '../../src/api/parseProblemDetail';

const requestId = 'req-01ARZ3NDEKTSV4RRFFQ69G5FAV';
const problem = {
  type: 'urn:my-petmate:problem:auth-token-invalid',
  title: '유효하지 않은 access token',
  status: 401,
  detail: '유효한 access token이 필요합니다.',
  instance: '/api/guardians/me',
  code: 'AUTH_TOKEN_INVALID',
  requestId,
};

function response(body: unknown, headerId: string | null = requestId) {
  const headers = new Headers({ 'Content-Type': 'application/problem+json' });
  if (headerId !== null) headers.set('My-Petmate-Request-Id', headerId);
  return new Response(JSON.stringify(body), { status: 401, headers });
}

test('정상 오류에서 코드와 요청 ID를 반환하고 원문은 노출하지 않는다', async () => {
  expect(await parseProblemDetail(response(problem))).toEqual({
    kind: 'problem',
    status: 401,
    requestId,
    code: 'AUTH_TOKEN_INVALID',
  });
});

test('필드 오류와 빈 필드 오류 배열을 처리한다', async () => {
  const fieldErrors = [
    { field: 'email', reason: '이메일 형식이 올바르지 않습니다.' },
  ];
  for (const fields of [fieldErrors, []]) {
    expect(
      await parseProblemDetail(response({ ...problem, fieldErrors: fields })),
    ).toMatchObject({ kind: 'problem', fieldErrors: fields });
  }
});

test.each([
  null,
  [],
  {},
  { ...problem, code: 1 },
  { ...problem, requestId: undefined },
  { ...problem, fieldErrors: null },
  { ...problem, fieldErrors: [{ field: 'email' }] },
  { ...problem, fieldErrors: ['email'] },
])('잘못된 계약 본문을 거절한다 (%#)', async (body) => {
  expect(await parseProblemDetail(response(body))).toMatchObject({
    kind: 'invalid-problem',
  });
});

test.each([null, '', 'invalid', 'req-01ARZ3NDEKTSV4RRFFQ69G5FAX'])(
  '요청 ID 헤더 누락·형식 오류·불일치를 거절한다 (%#)',
  async (headerId) => {
    expect(await parseProblemDetail(response(problem, headerId))).toMatchObject(
      { kind: 'request-id-mismatch', status: 401 },
    );
  },
);

test('본문과 HTTP 상태 불일치를 거절한다', async () => {
  expect(
    await parseProblemDetail(response({ ...problem, status: 403 })),
  ).toMatchObject({ kind: 'status-mismatch', status: 401 });
});

test('HTML 장애 응답과 깨진 JSON을 구분하고 요청 ID를 보존한다', async () => {
  const html = new Response('<html>장애</html>', {
    status: 502,
    headers: {
      'Content-Type': 'text/html',
      'My-Petmate-Request-Id': requestId,
    },
  });
  expect(await parseProblemDetail(html)).toEqual({
    kind: 'non-json',
    status: 502,
    requestId,
  });
  const broken = new Response('{', {
    status: 502,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
  expect(await parseProblemDetail(broken)).toMatchObject({
    kind: 'invalid-json',
    status: 502,
  });
});

test('본문 읽기 실패를 결과로 반환한다', async () => {
  const input = response(problem);
  jest.spyOn(input, 'text').mockRejectedValue(new Error('connection lost'));
  expect(await parseProblemDetail(input)).toMatchObject({
    kind: 'unreadable-body',
    requestId,
  });
});
