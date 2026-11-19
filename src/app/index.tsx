import { Redirect } from 'expo-router';
import { useSession } from '../auth/SessionProvider';

export default function Index() {
  const { guardian } = useSession();
  return <Redirect href={guardian ? '/profile' : '/login'} />;
}
