import { Pressable, StyleSheet, Text, View } from 'react-native';

type AuthSwitchProps = { prompt: string; label: string; onPress?: () => void };
export function AuthSwitch({ prompt, label, onPress }: AuthSwitchProps) {
  return (
    <View style={styles.authSwitch}>
      <Text style={styles.switchPrompt}>{prompt}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        disabled={!onPress}
        onPress={onPress}
        style={styles.switchButton}
      >
        <Text style={styles.switchText}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  authSwitch: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  switchPrompt: { color: '#6C6457', fontSize: 12 },
  switchButton: { minHeight: 44, justifyContent: 'center' },
  switchText: { color: '#332E24', fontSize: 13, fontWeight: '700' },
});
