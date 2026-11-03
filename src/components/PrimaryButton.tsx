import { Pressable, StyleSheet, Text } from 'react-native';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};
export function PrimaryButton({
  label,
  onPress,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text style={[styles.buttonText, disabled && styles.textDisabled]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonDisabled: { backgroundColor: '#E8E3D8', shadowOpacity: 0 },
  textDisabled: { color: '#6C6457' },
  button: {
    minHeight: 44,
    backgroundColor: '#F2CD70',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#E4BA52',
    borderTopColor: '#F9E5B2',
    shadowColor: '#B88A2E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.65,
    shadowRadius: 0,
  },
  buttonPressed: {
    backgroundColor: '#E4BA52',
    transform: [{ translateY: 4 }],
    shadowOffset: { width: 0, height: 1 },
  },
  buttonText: { color: '#332E24', fontSize: 14, fontWeight: '600' },
});
