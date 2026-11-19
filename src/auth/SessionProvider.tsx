import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { apiRequest } from '../api/client';
import type { components } from '../api/openapi';

type Guardian = components['schemas']['Guardian'];
type LoginRequest = components['schemas']['LoginRequest'];
type Session = Pick<
  components['schemas']['AuthResponse'],
  'accessToken' | 'refreshToken' | 'guardian'
>;

type Auth = {
  guardian: Guardian | null;
  loadGuardian: (signal: AbortSignal) => Promise<boolean | string>;
  logout: () => Promise<boolean>;
  login: (
    credentials: LoginRequest,
    signal: AbortSignal,
  ) => Promise<string | undefined>;
};

const SessionContext = createContext<Auth | null>(null);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isGuardian(g: unknown): g is Guardian {
  if (!isRecord(g)) return false;
  return (
    typeof g.id === 'string' &&
    typeof g.email === 'string' &&
    typeof g.nickname === 'string' &&
    g.status === 'active' &&
    (g.profileType === 'individual'
      ? g.gender === 'female' || g.gender === 'male'
      : (g.profileType === 'couple' || g.profileType === 'family') &&
        (g.gender === null || g.gender === 'female' || g.gender === 'male')) &&
    (g.discoveryStatus === 'searching' || g.discoveryStatus === 'paused') &&
    (g.photoUrl === null || typeof g.photoUrl === 'string') &&
    Array.isArray(g.activityRegions) &&
    g.activityRegions.every(
      (region: unknown) =>
        isRecord(region) &&
        typeof region.id === 'string' &&
        Array.isArray(region.path) &&
        region.path.length >= 1 &&
        region.path.length <= 3 &&
        region.path.every(
          (segment: unknown) =>
            isRecord(segment) &&
            (segment.level === 'sido' ||
              segment.level === 'sgg' ||
              segment.level === 'umd') &&
            typeof segment.name === 'string',
        ),
    ) &&
    Array.isArray(g.availableTimeSlots) &&
    g.availableTimeSlots.every(
      (slot: unknown) =>
        isRecord(slot) &&
        typeof slot.dayOfWeek === 'string' &&
        /^(mon|tue|wed|thu|fri|sat|sun)$/.test(slot.dayOfWeek) &&
        typeof slot.startTime === 'string' &&
        typeof slot.endTime === 'string',
    )
  );
}

function isSession(value: unknown): value is Session {
  return (
    isRecord(value) &&
    typeof value.accessToken === 'string' &&
    !!value.accessToken.trim() &&
    typeof value.refreshToken === 'string' &&
    !!value.refreshToken.trim() &&
    isGuardian(value.guardian)
  );
}

const fallback = '로그인하지 못했어요. 잠시 후 다시 시도해 주세요.';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  async function login(credentials: LoginRequest, signal: AbortSignal) {
    const result = await apiRequest('/api/auth/login', {
      method: 'POST',
      json: credentials,
      signal,
    });
    if (signal.aborted) return;
    if (result.kind === 'success' && isSession(result.data)) {
      const { accessToken, refreshToken, guardian } = result.data;
      setSession({ accessToken, refreshToken, guardian });
      return;
    }
    if (result.kind === 'network-error')
      return '서버에 연결하지 못했어요. 연결 상태를 확인하고 다시 시도해 주세요.';
    if (result.kind === 'http-error' && result.error.kind === 'problem') {
      const { status, code } = result.error;
      if (status === 401 && code === 'AUTH_INVALID_CREDENTIALS')
        return '이메일 또는 비밀번호를 확인해 주세요.';
      if (status === 403 && code === 'ACCOUNT_RESTRICTED')
        return '이용이 제한된 계정이에요.';
      if (status === 403 && code === 'ACCOUNT_WITHDRAWN')
        return '탈퇴한 계정이에요.';
    }
    return fallback;
  }

  const accessToken = session?.accessToken;
  const loadGuardian = useCallback(
    async (signal: AbortSignal) => {
      if (!accessToken) return false;
      const result = await apiRequest('/api/guardians/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal,
      });
      if (signal.aborted) return false;
      if (result.kind === 'success' && isGuardian(result.data)) {
        const guardian = result.data;
        setSession((current) =>
          current?.accessToken === accessToken
            ? { ...current, guardian }
            : current,
        );
        return true;
      }
      if (result.kind === 'http-error' && result.error.kind === 'problem') {
        const { status, code } = result.error;
        let message: string | undefined;
        if (
          status === 401 &&
          (code === 'AUTH_TOKEN_EXPIRED' || code === 'AUTH_TOKEN_INVALID')
        ) {
          message = '세션이 종료됐어요. 다시 로그인해 주세요.';
        } else if (status === 403 && code === 'ACCOUNT_RESTRICTED') {
          message = '이용이 제한된 계정이에요.';
        } else if (status === 403 && code === 'ACCOUNT_WITHDRAWN') {
          message = '탈퇴한 계정이에요.';
        }
        if (message) {
          setSession((current) =>
            current?.accessToken === accessToken ? null : current,
          );
          return message;
        }
      }
      return false;
    },
    [accessToken],
  );

  async function logout() {
    if (!session) return false;
    const { refreshToken } = session;
    const request = new AbortController();
    const timeout = setTimeout(() => request.abort(), 10_000);
    try {
      const result = await apiRequest('/api/auth/logout', {
        method: 'POST',
        json: { refreshToken },
        signal: request.signal,
      });
      return !request.signal.aborted && result.kind === 'empty';
    } catch {
      return false;
    } finally {
      clearTimeout(timeout);
      setSession((current) =>
        current?.refreshToken === refreshToken ? null : current,
      );
    }
  }

  return (
    <SessionContext.Provider
      value={{
        guardian: session?.guardian ?? null,
        login,
        loadGuardian,
        logout,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const auth = useContext(SessionContext);
  if (!auth) throw new Error('SessionProvider is required.');
  return auth;
}
