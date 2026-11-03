import { Image, Pressable, StyleSheet, View } from 'react-native';
import { DesignIcon, type DesignIconName } from './DesignIcon';

type PhotoAvatarButtonProps = {
  uri?: string;
  placeholderIcon: DesignIconName;
  accessibilityLabel: string;
  imageLabel: string;
  disabled?: boolean;
  onPress: () => void;
};

export function PhotoAvatarButton({
  uri,
  placeholderIcon,
  accessibilityLabel,
  imageLabel,
  disabled = false,
  onPress,
}: PhotoAvatarButtonProps) {
  return (
    <View style={styles.control}>
      {uri ? (
        <Image
          accessible
          accessibilityLabel={imageLabel}
          source={{ uri }}
          style={styles.photo}
        />
      ) : (
        <View style={styles.avatar}>
          <DesignIcon name={placeholderIcon} size={40} color="#8D6B24" />
        </View>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        disabled={disabled}
        hitSlop={6}
        onPress={onPress}
        style={styles.camera}
      >
        <DesignIcon name="camera" size={17} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  control: { width: 96, height: 96 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F7EDD0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: { width: 96, height: 96, borderRadius: 48, resizeMode: 'cover' },
  camera: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFEFB',
    backgroundColor: '#F2CD70',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
