import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type SpinnerProps = { label?: string };
const SpinnerContext = createContext<
  ((label: string | undefined) => void) | null
>(null);

export function SpinnerProvider({ children }: { children: ReactNode }) {
  const [label, setLabel] = useState<string>();
  return (
    <SpinnerContext.Provider value={setLabel}>
      <View style={styles.container}>
        <View
          style={styles.container}
          accessibilityElementsHidden={label !== undefined}
        >
          {children}
        </View>
        {label !== undefined ? (
          <View
            accessible
            accessibilityViewIsModal
            accessibilityRole="progressbar"
            accessibilityLabel={label}
            accessibilityState={{ busy: true }}
            style={styles.overlay}
          >
            <ActivityIndicator
              accessible={false}
              size="large"
              color="#F2CD70"
            />
            <Text accessible={false} style={styles.label}>
              {label}
            </Text>
          </View>
        ) : null}
      </View>
    </SpinnerContext.Provider>
  );
}

export function Spinner({ label = '불러오는 중이에요' }: SpinnerProps) {
  const setLabel = useContext(SpinnerContext);
  if (!setLabel)
    throw new Error('Spinner는 SpinnerProvider 안에서 사용해야 합니다.');
  useEffect(() => {
    setLabel(label);
    return () => setLabel(undefined);
  }, [label, setLabel]);
  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
  },
});
