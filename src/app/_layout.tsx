import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SpinnerProvider } from '../components/Spinner';

export default function RootLayout() {
  return (
    <SpinnerProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </SpinnerProvider>
  );
}
