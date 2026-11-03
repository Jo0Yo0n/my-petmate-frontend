import { afterEach, expect, jest, test } from '@jest/globals';
import { useState } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { ActionSheetIOS, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { PhotoAvatarButton } from '../../src/components/PhotoAvatarButton';
import { usePhotoPicker } from '../../src/hooks/usePhotoPicker';

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

function DogPhoto() {
  const [uri, setUri] = useState<string>();
  const { openPhotoMenu, isPicking } = usePhotoPicker({
    title: '반려견 사진',
    uri,
    onChange: setUri,
  });
  return (
    <PhotoAvatarButton
      uri={uri}
      placeholderIcon="paw-print"
      accessibilityLabel="반려견 사진 변경"
      imageLabel="선택한 반려견 사진"
      disabled={isPicking}
      onPress={openPhotoMenu}
    />
  );
}
let screen: ReactTestRenderer;
function mount() {
  act(() => {
    screen = create(<DogPhoto />);
  });
}
function open() {
  act(() => screen.root.findByType(PhotoAvatarButton).props.onPress());
}
async function choose(index: number) {
  const calls = jest.mocked(ActionSheetIOS.showActionSheetWithOptions).mock
    .calls;
  await act(async () => calls[calls.length - 1][1](index));
}
afterEach(() => {
  act(() => screen.unmount());
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

test('같은 아바타와 선택 동작을 반려견 문구·아이콘으로 조합해 촬영·삭제한다', async () => {
  const sheet = jest
    .spyOn(ActionSheetIOS, 'showActionSheetWithOptions')
    .mockImplementation(() => {});
  jest
    .mocked(ImagePicker.requestCameraPermissionsAsync)
    .mockResolvedValue({
      granted: true,
      status: 'granted' as ImagePicker.PermissionStatus,
      canAskAgain: true,
      expires: 'never',
    });
  jest
    .mocked(ImagePicker.launchCameraAsync)
    .mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///test/dog.jpg', width: 100, height: 100 }],
    });
  mount();
  open();
  open();
  expect(sheet).toHaveBeenCalledTimes(1);
  expect(sheet).toHaveBeenCalledWith(
    expect.objectContaining({ title: '반려견 사진' }),
    expect.any(Function),
  );
  await choose(0);
  expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalledTimes(1);
  expect(ImagePicker.launchCameraAsync).toHaveBeenCalledTimes(1);
  expect(
    screen.root
      .findAllByType(Image)
      .find((node) => node.props.accessibilityLabel === '선택한 반려견 사진')
      ?.props.source.uri,
  ).toBe('file:///test/dog.jpg');
  open();
  await choose(2);
  expect(screen.root.findByType(PhotoAvatarButton).props.uri).toBeUndefined();
});

test('카메라 권한이 거부되면 촬영을 열지 않고 다시 메뉴를 열 수 있다', async () => {
  const sheet = jest
    .spyOn(ActionSheetIOS, 'showActionSheetWithOptions')
    .mockImplementation(() => {});
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest
    .mocked(ImagePicker.requestCameraPermissionsAsync)
    .mockResolvedValue({
      granted: false,
      status: 'denied' as ImagePicker.PermissionStatus,
      canAskAgain: false,
      expires: 'never',
    });
  mount();
  open();
  await choose(0);
  expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
  expect(alert).toHaveBeenCalledWith(
    '카메라를 사용할 수 없어요',
    expect.any(String),
  );
  open();
  expect(sheet).toHaveBeenCalledTimes(2);
  await choose(2);
  open();
  expect(sheet).toHaveBeenCalledTimes(3);
});
