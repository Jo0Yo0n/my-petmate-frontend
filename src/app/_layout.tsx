import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SessionProvider, useSession } from '../auth/SessionProvider';
import { SpinnerProvider } from '../components/Spinner';

function AppStack() {
  const { guardian } = useSession();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!guardian}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack.Protected>
      <Stack.Protected guard={!!guardian}>
        <Stack.Screen name="profile" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <SpinnerProvider>
        <StatusBar style="dark" />
        <AppStack />
      </SpinnerProvider>
    </SessionProvider>
  );
}
