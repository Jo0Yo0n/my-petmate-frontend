import { jest, test, expect, afterEach } from '@jest/globals';
import { router } from 'expo-router';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { ActionSheetIOS, Alert, Image, Modal, TextInput } from 'react-native';
import SignupScreen from '../../src/app/signup';
import LoginScreen from '../../src/app/login';
import * as ImagePicker from 'expo-image-picker';
import { Spinner, SpinnerProvider } from '../../src/components/Spinner';

jest.mock('expo-router', () => ({
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
    screen = create(<SpinnerProvider>{component}</SpinnerProvider>);
  });
}
function press(label: string) {
  const button = screen.root.findAll(
    (node) =>
      typeof node.props.onPress === 'function' &&
      node.props.accessibilityLabel === label,
  )[0];
  if (!button) throw new Error(`Button missing: ${label}`);
  act(() => button.props.onPress());
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

function fillSubmissionForm(kind: 'login' | 'signup') {
  mount(kind === 'login' ? <LoginScreen /> : <SignupScreen />);
  input('이메일', 'mate@example.com');
  input('비밀번호', 'Pass123!');
  if (kind === 'signup') {
    input('닉네임', '산책친구');
    input('비밀번호 확인', 'Pass123!');
    press('가족');
    press('쉬는 중');
  }
}

test.each(['login', 'signup'] as const)(
  '%s 제출 중 공통 오버레이와 버튼 비활성을 표시하고 버튼·키보드 중복 제출을 막는다',
  (kind) => {
    jest.useFakeTimers();
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    fillSubmissionForm(kind);
    const label = kind === 'login' ? '로그인' : '회원가입';
    const nativeModalCount = screen.root.findAllByType(Modal).length;
    const button = () =>
      screen.root.findAllByProps({ accessibilityLabel: label })[0];
    const keyboardSubmit = screen.root
      .findAllByType(TextInput)
      .find(
        (node) =>
          node.props.accessibilityLabel ===
          (kind === 'login' ? '비밀번호' : '비밀번호 확인'),
      )!.props.onSubmitEditing;
    // state가 재렌더링되기 전 중복 호출까지 확인한다.
    act(() => {
      button().props.onPress();
      keyboardSubmit();
    });
    expect(screen.root.findByType(Spinner).props.label).toBe(
      kind === 'login' ? '로그인 중이에요' : '제출 중이에요',
    );
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
      `${label} 준비 중`,
      expect.stringContaining('요청은 전송되지 않아요'),
    );
    expect(router.replace).not.toHaveBeenCalled();
    // 종료 후 키보드로 다시 제출할 수 있다.
    act(() => keyboardSubmit());
    expect(screen.root.findAllByType(Spinner)).toHaveLength(1);
    act(() => jest.advanceTimersByTime(800));
    expect(alert).toHaveBeenCalledTimes(2);
  },
);

test.each(['login', 'signup'] as const)(
  '%s 모의 제출 중 화면을 떠나면 늦은 안내를 표시하지 않는다',
  (kind) => {
    jest.useFakeTimers();
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    fillSubmissionForm(kind);
    press(kind === 'login' ? '로그인' : '회원가입');
    act(() => screen.unmount());
    act(() => jest.advanceTimersByTime(800));
    expect(alert).not.toHaveBeenCalled();
  },
);

test('로그인 필수 입력 오류에서는 모의 제출을 시작하지 않는다', () => {
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
