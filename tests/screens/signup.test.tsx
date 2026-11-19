import { afterEach, expect, jest, test } from '@jest/globals';
import { Redirect, router } from 'expo-router';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { ActionSheetIOS, Alert, Image, Modal, TextInput } from 'react-native';
import SignupScreen from '../../src/app/signup';
import LoginScreen from '../../src/app/login';
import ProfileScreen from '../../src/app/profile';
import { SessionProvider } from '../../src/auth/SessionProvider';
import * as ImagePicker from 'expo-image-picker';
import { Spinner, SpinnerProvider } from '../../src/components/Spinner';

jest.mock('expo-router', () => ({
  Redirect: jest.fn(() => null),
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    canGoBack: jest.fn(() => true),
  },
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: require('react-native').View,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

let screen: ReactTestRenderer;
function mount(component: React.ReactElement) {
  act(() => {
    screen = create(
      <SessionProvider>
        <SpinnerProvider>{component}</SpinnerProvider>
      </SessionProvider>,
    );
  });
}
function press(label: string) {
  const button = screen.root.findAll(
    (node) =>
      typeof node.props.onPress === 'function' &&
      node.props.accessibilityLabel === label,
  )[0];
  if (!button) throw new Error(`Button missing: ${label}`);
  act(() => {
    button.props.onPress();
  });
}
function input(label: string, value: string) {
  act(() =>
    screen.root
      .findAllByType(TextInput)
      .find((node) => node.props.accessibilityLabel === label)!
      .props.onChangeText(value),
  );
}
function text() {
  return JSON.stringify(screen.toJSON());
}
afterEach(() => {
  act(() => screen?.unmount());
  jest.clearAllMocks();
  jest.useRealTimers();
});

test('필수 입력 오류와 개인 성별을 조건부로 표시한다', () => {
  mount(<SignupScreen />);
  expect(
    screen.root
      .findAllByProps({ accessibilityRole: 'radio' })
      .every((node) => !node.props.accessibilityState.checked),
  ).toBe(true);
  press('회원가입');
  expect(text()).toContain('닉네임을 입력해 주세요.');
  expect(text()).toContain('보호자 유형을 선택해 주세요.');
  press('개인');
  press('회원가입');
  expect(text()).toContain('성별을 선택해 주세요.');
  press('커플');
  expect(text()).not.toContain('성별을 선택해 주세요.');
  expect(
    screen.root.findAllByProps({ accessibilityLabel: '여성' }),
  ).toHaveLength(0);
});

test('비밀번호 원문을 비교하고 버튼과 키보드가 같은 검증을 사용한다', () => {
  jest.useFakeTimers();
  const alert = jest.spyOn(Alert, 'alert');
  mount(<SignupScreen />);
  input('닉네임', '산책친구');
  input('이메일', 'mate@example.com');
  input('비밀번호', 'Pass123! ');
  input('비밀번호 확인', 'Pass123!');
  press('가족');
  press('쉬는 중');
  press('회원가입');
  expect(text()).toContain('비밀번호가 일치하지 않아요.');
  expect(alert).not.toHaveBeenCalled();
  input('비밀번호 확인', 'Pass123! ');
  act(() =>
    screen.root
      .findAllByType(TextInput)
      .find((node) => node.props.accessibilityLabel === '비밀번호 확인')!
      .props.onSubmitEditing(),
  );
  act(() => jest.advanceTimersByTime(800));
  expect(alert).toHaveBeenCalledWith(
    '회원가입 준비 중',
    expect.stringContaining('아직 가입 요청은 전송되지 않아요'),
  );
});

test('로그인에서 가입으로 이동하고 돌아오며 직접 진입에서도 로그인으로 이동한다', () => {
  mount(<LoginScreen />);
  press('회원가입 →');
  expect(router.push).toHaveBeenCalledWith('/signup');
  act(() => screen.unmount());
  mount(<SignupScreen />);
  press('로그인');
  expect(router.back).toHaveBeenCalledTimes(1);
  jest.mocked(router.canGoBack).mockReturnValue(false);
  press('← 로그인으로');
  expect(router.replace).toHaveBeenCalledWith('/login');
});

test('지역과 시간을 로컬에서 추가·삭제하고 겹치는 시간은 입력을 유지한다', () => {
  const alert = jest.spyOn(Alert, 'alert');
  mount(<SignupScreen />);
  press('산책 지역 선택');
  press('서울특별시');
  press('마포구');
  press('망원동');
  press('지역 선택 완료');
  expect(text()).toContain('망원동');
  press('망원동 삭제');
  expect(
    screen.root.findAllByProps({ accessibilityLabel: '망원동 삭제' }),
  ).toHaveLength(0);
  press('월요일');
  press('추가하기');
  expect(
    screen.root.findAllByProps({ accessibilityLabel: '09:00 12:00 시간 삭제' })
      .length,
  ).toBeGreaterThan(0);
  press('월요일');
  press('추가하기');
  expect(alert).toHaveBeenLastCalledWith(
    '활동 시간을 확인해 주세요',
    '같은 요일의 시간이 겹치지 않게 설정해 주세요.',
  );
  expect(
    screen.root.findAllByProps({ accessibilityLabel: '월요일' })[0].props
      .accessibilityState.checked,
  ).toBe(true);
  press('09:00 12:00 시간 삭제');
  expect(
    screen.root.findAllByProps({ accessibilityLabel: '09:00 12:00 시간 삭제' }),
  ).toHaveLength(0);
});

test('지역 선택은 최대 3곳이며 취소하면 확정한 지역을 유지한다', () => {
  mount(<SignupScreen />);
  press('산책 지역 선택');
  press('서울특별시');
  press('마포구');
  press('망원동');
  press('연남동');
  press('합정동');
  press('서교동');
  expect(text()).toContain('최대 3곳까지 선택할 수 있어요.');
  press('지역 선택 완료');
  expect(
    screen.root.findAllByProps({ accessibilityLabel: '망원동 삭제' }).length,
  ).toBeGreaterThan(0);
  expect(
    screen.root.findAllByProps({ accessibilityLabel: '서교동 삭제' }),
  ).toHaveLength(0);
  press('산책 지역 선택');
  press('서울특별시');
  press('마포구');
  press('망원동');
  press('지역 선택 닫기');
  expect(
    screen.root.findAllByProps({ accessibilityLabel: '망원동 삭제' }).length,
  ).toBeGreaterThan(0);
});

async function choosePhotoOption(index: number) {
  const show = jest.mocked(ActionSheetIOS.showActionSheetWithOptions);
  const callback = show.mock.calls[show.mock.calls.length - 1][1];
  await act(async () => callback(index));
}

test('iOS 기본 메뉴에서 사진을 선택하고 취소 시 기존 사진을 유지한다', async () => {
  const sheet = jest
    .spyOn(ActionSheetIOS, 'showActionSheetWithOptions')
    .mockImplementation(() => {});
  jest
    .mocked(ImagePicker.launchImageLibraryAsync)
    .mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///test/profile.jpg', width: 100, height: 100 }],
    })
    .mockResolvedValueOnce({ canceled: true, assets: null });
  mount(<SignupScreen />);
  press('보호자 사진 변경');
  expect(sheet).toHaveBeenLastCalledWith(
    expect.objectContaining({
      options: ['사진 찍기', '앨범에서 선택', '취소'],
      cancelButtonIndex: 2,
    }),
    expect.any(Function),
  );
  expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
  await choosePhotoOption(1);
  const photo = () =>
    screen.root
      .findAllByType(Image)
      .find((node) => node.props.accessibilityLabel === '선택한 보호자 사진');
  expect(photo()?.props.source.uri).toBe('file:///test/profile.jpg');
  press('보호자 사진 변경');
  await choosePhotoOption(1);
  expect(photo()?.props.source.uri).toBe('file:///test/profile.jpg');
  press('보호자 사진 변경');
  await choosePhotoOption(3);
  expect(photo()?.props.source.uri).toBe('file:///test/profile.jpg');
  press('보호자 사진 변경');
  await choosePhotoOption(2);
  expect(photo()).toBeUndefined();
});

test('사진 선택 실패를 안내하고 다시 기본 메뉴를 열 수 있다', async () => {
  const sheet = jest
    .spyOn(ActionSheetIOS, 'showActionSheetWithOptions')
    .mockImplementation(() => {});
  jest
    .mocked(ImagePicker.launchImageLibraryAsync)
    .mockRejectedValueOnce(new Error('picker failed'));
  const alert = jest.spyOn(Alert, 'alert');
  mount(<SignupScreen />);
  press('보호자 사진 변경');
  await choosePhotoOption(1);
  expect(alert).toHaveBeenLastCalledWith(
    '사진을 불러오지 못했어요',
    expect.any(String),
  );
  press('보호자 사진 변경');
  expect(sheet).toHaveBeenCalledTimes(2);
});

test.each(['success', 'cancel', 'failure'] as const)(
  '사진 선택 중 spinner를 표시하고 %s 후 숨긴다',
  async (outcome) => {
    jest
      .spyOn(ActionSheetIOS, 'showActionSheetWithOptions')
      .mockImplementation(() => {});
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    let resolve!: (result: ImagePicker.ImagePickerResult) => void;
    let reject!: (reason: Error) => void;
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockReturnValueOnce(
      new Promise((resolveResult, rejectResult) => {
        resolve = resolveResult;
        reject = rejectResult;
      }),
    );
    mount(<SignupScreen />);
    const nativeModalCount = screen.root.findAllByType(Modal).length;
    const spinners = () =>
      screen.root.findAllByProps({ accessibilityRole: 'progressbar' });
    expect(spinners()).toHaveLength(0);
    press('보호자 사진 변경');
    await choosePhotoOption(1);
    expect(spinners().length).toBeGreaterThan(0);
    expect(spinners()[0].props.accessibilityLabel).toBe(
      '사진을 불러오고 있어요',
    );
    expect(spinners()[0].props.accessibilityState.busy).toBe(true);
    // The loading layer must not present a native modal alongside the picker.
    expect(screen.root.findAllByType(Modal)).toHaveLength(nativeModalCount);
    expect(spinners()[0].props.accessibilityViewIsModal).toBe(true);
    const photoButton = () =>
      screen.root.findAllByProps({ accessibilityLabel: '보호자 사진 변경' })[0];
    expect(photoButton().props.disabled).toBe(true);
    await act(async () => {
      if (outcome === 'failure') reject(new Error('picker failed'));
      else if (outcome === 'cancel') resolve({ canceled: true, assets: null });
      else
        resolve({
          canceled: false,
          assets: [
            { uri: 'file:///test/profile.jpg', width: 100, height: 100 },
          ],
        });
    });
    expect(spinners()).toHaveLength(0);
    expect(screen.root.findAllByType(Spinner)).toHaveLength(0);
    expect(photoButton().props.disabled).toBe(false);
    expect(text()).toContain('프로필 사진 (선택)');
  },
);

test('잘못된 로그인 입력은 요청하지 않고 이메일만 정규화한다', async () => {
  const fetchMock = mockLoginFetch();
  mount(<LoginScreen />);
  input('이메일', 'invalid');
  input('비밀번호', 'x'.repeat(73));
  expect(text()).not.toContain('이메일 주소 형식을 확인해 주세요.');

  press('로그인');
  expect(text()).toContain('이메일 주소 형식을 확인해 주세요.');
  expect(text()).toContain('비밀번호는 72자 이하로 입력해 주세요.');
  expect(fetchMock).not.toHaveBeenCalled();
  expect(screen.root.findAllByType(Spinner)).toHaveLength(0);

  input('이메일', 'mate@.');
  expect(text()).toContain('이메일 주소 형식을 확인해 주세요.');

  input('이메일', ' MATE@EXAMPLE.COM ');
  input('비밀번호', ' ');
  expect(text()).not.toContain('이메일 주소 형식을 확인해 주세요.');
  expect(text()).not.toContain('비밀번호는 72자 이하로 입력해 주세요.');
  await act(async () => {
    screen.root
      .findAllByProps({ accessibilityLabel: '로그인' })[0]
      .props.onPress();
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledWith(
    'http://localhost:8080/api/auth/login',
    expect.objectContaining({
      method: 'POST',
      body: '{"email":"mate@example.com","password":" "}',
    }),
  );
});

const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

function mockLoginFetch() {
  process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:8080';
  return jest
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async () => new Response('{}'));
}

afterEach(() => {
  jest.restoreAllMocks();
  if (baseUrl === undefined) delete process.env.EXPO_PUBLIC_API_BASE_URL;
  else process.env.EXPO_PUBLIC_API_BASE_URL = baseUrl;
});

function fillSignupSubmissionForm() {
  mount(<SignupScreen />);
  input('이메일', 'mate@example.com');
  input('비밀번호', 'Pass123!');
  input('닉네임', '산책친구');
  input('비밀번호 확인', 'Pass123!');
  press('가족');
  press('쉬는 중');
}

test('회원가입 제출 중 공통 오버레이와 버튼 비활성을 표시하고 중복 제출을 막는다', () => {
  jest.useFakeTimers();
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  fillSignupSubmissionForm();
  const nativeModalCount = screen.root.findAllByType(Modal).length;
  const button = () =>
    screen.root.findAllByProps({ accessibilityLabel: '회원가입' })[0];
  const keyboardSubmit = screen.root
    .findAllByType(TextInput)
    .find((node) => node.props.accessibilityLabel === '비밀번호 확인')!.props
    .onSubmitEditing;
  act(() => {
    button().props.onPress();
    keyboardSubmit();
  });
  expect(screen.root.findByType(Spinner).props.label).toBe('제출 중이에요');
  expect(button().props.disabled).toBe(true);
  expect(screen.root.findAllByType(Modal)).toHaveLength(nativeModalCount);
  expect(
    screen.root.findAllByProps({ accessibilityElementsHidden: true }).length,
  ).toBeGreaterThan(0);
  expect(alert).not.toHaveBeenCalled();
  act(() => jest.advanceTimersByTime(800));
  expect(screen.root.findAllByType(Spinner)).toHaveLength(0);
  expect(button().props.disabled).toBe(false);
  expect(alert).toHaveBeenCalledTimes(1);
  expect(alert).toHaveBeenCalledWith(
    '회원가입 준비 중',
    expect.stringContaining('요청은 전송되지 않아요'),
  );
  expect(router.replace).not.toHaveBeenCalled();
  act(() => keyboardSubmit());
  expect(screen.root.findAllByType(Spinner)).toHaveLength(1);
  act(() => jest.advanceTimersByTime(800));
  expect(alert).toHaveBeenCalledTimes(2);
});

test('회원가입 모의 제출 중 화면을 떠나면 늦은 안내를 표시하지 않는다', () => {
  jest.useFakeTimers();
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  fillSignupSubmissionForm();
  press('회원가입');
  act(() => screen.unmount());
  act(() => jest.advanceTimersByTime(800));
  expect(alert).not.toHaveBeenCalled();
});

function loginForm() {
  mount(<LoginScreen />);
  input('이메일', 'mate@example.com');
  input('비밀번호', 'Pass123!');
}

const loginResponse = {
  accessToken: 'fixture-access',
  refreshToken: 'fixture-refresh',
  tokenType: 'Bearer',
  expiresIn: 900,
  refreshExpiresIn: 2592000,
  guardian: {
    id: '80f224bb-aea8-42e5-b11a-5b01f13189d2',
    email: 'mate@example.com',
    profileType: 'individual',
    gender: 'female',
    status: 'active',
    nickname: '보리네',
    discoveryStatus: 'searching',
    photoUrl: null,
    activityRegions: [
      {
        id: 'locality-id',
        path: [
          { level: 'sido', name: '서울특별시' },
          { level: 'sgg', name: '마포구' },
          { level: 'umd', name: '연남동' },
        ],
      },
    ],
    availableTimeSlots: [
      { dayOfWeek: 'sat', startTime: '09:00', endTime: '10:00' },
    ],
  },
};

test('중복 제출 없이 로그인하고 내 정보 조회 실패 후 재시도해 서버 응답을 표시한다', async () => {
  const fetchMock = mockLoginFetch();
  let resolve!: (response: Response) => void;
  fetchMock.mockReturnValueOnce(
    new Promise((done) => {
      resolve = done;
    }),
  );
  loginForm();
  const button = () =>
    screen.root.findAllByProps({ accessibilityLabel: '로그인' })[0];
  const password = screen.root
    .findAllByType(TextInput)
    .find((node) => node.props.accessibilityLabel === '비밀번호')!;
  act(() => {
    button().props.onPress();
    password.props.onSubmitEditing();
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(button().props.disabled).toBe(true);
  expect(screen.root.findByType(Spinner).props.label).toBe('로그인 중이에요');

  await act(async () => resolve(new Response(JSON.stringify(loginResponse))));
  expect(screen.root.findByType(Redirect).props.href).toBe('/profile');
  let resolveProfile!: (response: Response) => void;
  fetchMock.mockReturnValueOnce(
    new Promise((done) => {
      resolveProfile = done;
    }),
  );
  act(() => {
    screen.update(
      <SessionProvider>
        <SpinnerProvider>
          <ProfileScreen />
        </SpinnerProvider>
      </SessionProvider>,
    );
  });
  expect(screen.root.findByType(Spinner).props.label).toBe(
    '내 정보를 불러오는 중이에요',
  );
  expect(fetchMock.mock.calls[1][0]).toBe(
    'http://localhost:8080/api/guardians/me',
  );
  expect(
    new Headers(fetchMock.mock.calls[1][1]?.headers).get('Authorization'),
  ).toBe('Bearer fixture-access');
  await act(async () => resolveProfile(new Response(null, { status: 500 })));
  expect(text()).toContain('내 정보를 불러오지 못했어요.');
  fetchMock.mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        ...loginResponse.guardian,
        nickname: '조회한 닉네임',
      }),
    ),
  );
  await act(async () => press('다시 시도'));
  expect(text()).toContain('조회한 닉네임');
  expect(text()).toContain('기본 프로필 이미지');
  expect(text()).toContain('서울특별시 마포구 연남동');
  expect(text()).toContain('토요일 09:00–10:00');
  expect(text()).not.toContain('fixture-access');
  expect(text()).not.toContain('fixture-refresh');
  expect(fetchMock).toHaveBeenCalledTimes(3);

  act(() => screen.unmount());
  mount(<ProfileScreen />);
  expect(screen.root.findByType(Redirect).props.href).toBe('/login');
});

test.each([true, false])(
  '로그아웃 서버 성공 여부가 %s일 때 세션을 정리하고 늦은 조회를 무시한다',
  async (serverSucceeded) => {
    const fetchMock = mockLoginFetch().mockResolvedValueOnce(
      new Response(JSON.stringify(loginResponse)),
    );
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    loginForm();
    await act(async () => press('로그인'));

    let resolveProfile!: (response: Response) => void;
    fetchMock.mockReturnValueOnce(
      new Promise((done) => {
        resolveProfile = done;
      }),
    );
    act(() => {
      screen.update(
        <SessionProvider>
          <SpinnerProvider>
            <ProfileScreen />
          </SpinnerProvider>
        </SessionProvider>,
      );
    });
    fetchMock.mockResolvedValueOnce(
      new Response(null, { status: serverSucceeded ? 204 : 503 }),
    );
    press('로그아웃');
    const confirm = alert.mock.calls[0][2]?.find(
      ({ style }) => style === 'destructive',
    );
    await act(async () => confirm?.onPress?.());
    expect(fetchMock.mock.calls[2][0]).toBe(
      'http://localhost:8080/api/auth/logout',
    );
    expect(fetchMock.mock.calls[2][1]).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ refreshToken: 'fixture-refresh' }),
    });
    expect(screen.root.findByType(Redirect).props.href).toBe('/login');
    if (!serverSucceeded) {
      expect(alert).toHaveBeenCalledWith(
        '기기에서 로그아웃했어요',
        '서버의 세션 폐기를 확인하지 못했어요.',
      );
    }
    await act(async () =>
      resolveProfile(new Response(JSON.stringify(loginResponse.guardian))),
    );
    expect(screen.root.findByType(Redirect).props.href).toBe('/login');
  },
);

test('로그인 화면을 떠난 뒤 받은 성공 응답으로 세션을 만들지 않는다', async () => {
  const fetchMock = mockLoginFetch();
  let resolve!: (response: Response) => void;
  fetchMock.mockReturnValueOnce(
    new Promise((done) => {
      resolve = done;
    }),
  );
  loginForm();
  press('로그인');
  act(() => {
    screen.update(
      <SessionProvider>
        <SpinnerProvider>
          <ProfileScreen />
        </SpinnerProvider>
      </SessionProvider>,
    );
  });
  expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
  await act(async () => resolve(new Response(JSON.stringify(loginResponse))));
  expect(screen.root.findByType(Redirect).props.href).toBe('/login');
});

test.each<[string, () => Promise<Response>, string]>([
  [
    '오프라인',
    () => Promise.reject(new Error('offline')),
    '서버에 연결하지 못했어요.',
  ],
  [
    '잘못된 성공 응답',
    () => Promise.resolve(new Response('{"guardian":{}}')),
    '로그인하지 못했어요.',
  ],
  [
    '자격 증명 오류',
    () => {
      const requestId = 'req-01ARZ3NDEKTSV4RRFFQ69G5FAV';
      return Promise.resolve(
        new Response(
          JSON.stringify({
            type: 'urn:my-petmate:problem:invalid-credentials',
            title: '유효하지 않은 로그인 정보',
            detail: '이메일 또는 비밀번호가 올바르지 않습니다.',
            instance: '/api/auth/login',
            status: 401,
            code: 'AUTH_INVALID_CREDENTIALS',
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
    },
    '이메일 또는 비밀번호를 확인해 주세요.',
  ],
])(
  '%s에서 세션을 만들지 않고 다시 입력할 수 있다',
  async (_, respond, message) => {
    const fetchMock = mockLoginFetch().mockImplementationOnce(respond);
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    loginForm();
    await act(async () => {
      await screen.root
        .findAllByProps({ accessibilityLabel: '로그인' })[0]
        .props.onPress();
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(alert).toHaveBeenCalledWith(
      '로그인 실패',
      expect.stringContaining(message),
    );
    expect(screen.root.findAllByType(Redirect)).toHaveLength(0);
    expect(screen.root.findAllByType(Spinner)).toHaveLength(0);
    expect(
      screen.root
        .findAllByType(TextInput)
        .find((node) => node.props.accessibilityLabel === '비밀번호')!.props
        .value,
    ).toBe('');
  },
);

test('로그인 필수 입력 오류에서는 제출을 시작하지 않는다', () => {
  mount(<LoginScreen />);
  press('로그인');
  expect(text()).toContain('이메일을 입력해 주세요.');
  expect(text()).toContain('비밀번호를 입력해 주세요.');
  expect(screen.root.findAllByType(Spinner)).toHaveLength(0);
});

test.each([
  ['00:00', '00:00'],
  ['23:59', '23:50'],
  ['24:09', '12:00'],
])('유효하지 않은 시간 범위 %s–%s는 목록에 추가하지 않는다', (start, end) => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  mount(<SignupScreen />);
  press('월요일');
  input('시작 시간', start);
  input('종료 시간', end);
  press('추가하기');
  expect(alert).toHaveBeenCalledWith(
    '활동 시간을 확인해 주세요',
    expect.any(String),
  );
  expect(
    screen.root.findAllByProps({
      accessibilityLabel: `${start} ${end} 시간 삭제`,
    }),
  ).toHaveLength(0);
  const fields = screen.root.findAllByType(TextInput);
  expect(
    fields.find((node) => node.props.accessibilityLabel === '시작 시간')!.props
      .value,
  ).toBe(start);
  expect(
    fields.find((node) => node.props.accessibilityLabel === '종료 시간')!.props
      .value,
  ).toBe(end);
});
