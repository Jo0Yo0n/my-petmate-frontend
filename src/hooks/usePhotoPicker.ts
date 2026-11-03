import { useRef, useState } from 'react';
import { ActionSheetIOS, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

type PhotoPickerOptions = {
  title: string;
  uri?: string;
  onChange: (uri: string | undefined) => void;
};

// The current MVP targets iOS. Selection stays local; uploading belongs to the caller.
export function usePhotoPicker({ title, uri, onChange }: PhotoPickerOptions) {
  const active = useRef(false);
  const [isPicking, setIsPicking] = useState(false);

  async function pick(source: 'camera' | 'album') {
    setIsPicking(true);
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            '카메라를 사용할 수 없어요',
            '기기 설정에서 카메라 접근을 허용하거나 앨범에서 사진을 선택해 주세요.',
          );
          return;
        }
      }
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
        exif: false,
      };
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);
      if (!result.canceled && result.assets[0]) onChange(result.assets[0].uri);
    } catch {
      Alert.alert(
        '사진을 불러오지 못했어요',
        '다시 시도하거나 앨범에서 다른 사진을 선택해 주세요.',
      );
    } finally {
      active.current = false;
      setIsPicking(false);
    }
  }

  function openPhotoMenu() {
    if (active.current) return;
    active.current = true;
    const options = [
      '사진 찍기',
      '앨범에서 선택',
      ...(uri ? ['사진 삭제'] : []),
      '취소',
    ];
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title,
        options,
        cancelButtonIndex: options.length - 1,
        destructiveButtonIndex: uri ? 2 : undefined,
      },
      (index) => {
        if (index === 0) void pick('camera');
        else if (index === 1) void pick('album');
        else {
          active.current = false;
          if (uri && index === 2) onChange(undefined);
        }
      },
    );
  }

  return { openPhotoMenu, isPicking };
}
