import type { components } from './openapi';

type FieldError = components['schemas']['FieldError'];

type ProblemResult = {
  status: number;
  requestId: string | undefined;
} & (
  | { kind: 'problem'; code: string; fieldErrors?: FieldError[] }
  | {
      kind:
        | 'non-json'
        | 'invalid-json'
        | 'unreadable-body'
        | 'invalid-problem'
        | 'status-mismatch'
        | 'request-id-mismatch';
    }
);

const requestIdPattern = /^req-[0-7][0-9A-HJKMNP-TV-Z]{25}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFieldError(value: unknown): value is FieldError {
  return (
    isRecord(value) &&
    typeof value.field === 'string' &&
    typeof value.reason === 'string'
  );
}

export async function parseProblemDetail(
  response: Response,
): Promise<ProblemResult> {
  const status = response.status;
  const headerId = response.headers.get('My-Petmate-Request-Id');
  const requestId =
    headerId && requestIdPattern.test(headerId) ? headerId : undefined;
  const metadata = { status, requestId };
  const mediaType = response.headers
    .get('Content-Type')
    ?.split(';')[0]
    .trim()
    .toLowerCase();
  if (
    mediaType !== 'application/problem+json' &&
    mediaType !== 'application/json'
  ) {
    return { kind: 'non-json', ...metadata };
  }

  let text: string;
  try {
    text = await response.text();
  } catch {
    return { kind: 'unreadable-body', ...metadata };
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return { kind: 'invalid-json', ...metadata };
  }

  if (
    !isRecord(body) ||
    !Number.isInteger(body.status) ||
    typeof body.code !== 'string' ||
    !body.code.trim() ||
    typeof body.requestId !== 'string' ||
    !requestIdPattern.test(body.requestId) ||
    typeof body.type !== 'string' ||
    typeof body.title !== 'string' ||
    typeof body.detail !== 'string' ||
    typeof body.instance !== 'string' ||
    (body.fieldErrors !== undefined &&
      (!Array.isArray(body.fieldErrors) ||
        !body.fieldErrors.every(isFieldError)))
  ) {
    return { kind: 'invalid-problem', ...metadata };
  }

  if (body.status !== status) return { kind: 'status-mismatch', ...metadata };
  if (requestId === undefined || requestId !== body.requestId) {
    return { kind: 'request-id-mismatch', ...metadata };
  }

  return {
    status,
    requestId,
    kind: 'problem',
    code: body.code,
    fieldErrors: body.fieldErrors,
  };
}
