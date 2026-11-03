import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { usePhotoPicker } from '../hooks/usePhotoPicker';
import { PhotoAvatarButton } from './PhotoAvatarButton';
import { Spinner } from './Spinner';

export function SignupPhotoPicker() {
  const [uri, setUri] = useState<string>();
  const { openPhotoMenu, isPicking } = usePhotoPicker({
    title: '프로필 사진',
    uri,
    onChange: setUri,
  });
  return (
    <View style={styles.editor}>
      <PhotoAvatarButton
        uri={uri}
        placeholderIcon="user"
        accessibilityLabel="보호자 사진 변경"
        imageLabel="선택한 보호자 사진"
        disabled={isPicking}
        onPress={openPhotoMenu}
      />
      <Text style={styles.label}>프로필 사진 (선택)</Text>
      {isPicking ? <Spinner label="사진을 불러오고 있어요" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  editor: { alignItems: 'center', marginTop: 24, marginBottom: 8, gap: 12 },
  label: { color: '#6C6457', fontSize: 13, lineHeight: 21 },
});
