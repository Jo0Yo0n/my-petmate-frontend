import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Redirect } from 'expo-router';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../auth/SessionProvider';
import { DesignIcon } from '../components/DesignIcon';
import { PrimaryButton } from '../components/PrimaryButton';
import { Spinner } from '../components/Spinner';
import type { components } from '../api/openapi';

const profileTypes = { individual: '개인', couple: '커플', family: '가족' };
const days = {
  mon: '월',
  tue: '화',
  wed: '수',
  thu: '목',
  fri: '금',
  sat: '토',
  sun: '일',
};

export default function ProfileScreen() {
  const { guardian, loadGuardian, logout } = useSession();
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>(
    'loading',
  );
  const [attempt, setAttempt] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logoutPending = useRef(false);
  const isAuthenticated = guardian !== null;

  useEffect(() => {
    if (!isAuthenticated) return;
    const request = new AbortController();
    loadGuardian(request.signal)
      .then((loaded) => {
        if (request.signal.aborted) return;
        if (typeof loaded === 'string') {
          Alert.alert('로그인 필요', loaded);
          return;
        }
        setStatus(loaded ? 'ready' : 'error');
      })
      .catch(() => {
        if (!request.signal.aborted) setStatus('error');
      });
    return () => request.abort();
  }, [attempt, isAuthenticated, loadGuardian]);

  if (!guardian) return <Redirect href="/login" />;

  function confirmLogout() {
    Alert.alert('로그아웃', '현재 기기에서 로그아웃할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          if (logoutPending.current) return;
          logoutPending.current = true;
          setIsLoggingOut(true);
          if (!(await logout())) {
            Alert.alert(
              '기기에서 로그아웃했어요',
              '서버의 세션 폐기를 확인하지 못했어요.',
            );
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          내 정보
        </Text>
        {status === 'error' && (
          <View style={styles.card}>
            <Text accessibilityRole="alert" style={styles.value}>
              내 정보를 불러오지 못했어요.
            </Text>
            <PrimaryButton
              label="다시 시도"
              onPress={() => {
                setStatus('loading');
                setAttempt((current) => current + 1);
              }}
            />
          </View>
        )}
        {status === 'ready' && <GuardianDetails guardian={guardian} />}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="로그아웃"
          onPress={confirmLogout}
          disabled={isLoggingOut}
          style={({ pressed }) => [
            styles.logout,
            pressed && styles.logoutPressed,
          ]}
        >
          <Text style={styles.logoutText}>로그아웃</Text>
        </Pressable>
      </ScrollView>
      {isLoggingOut ? (
        <Spinner label="로그아웃 중이에요" />
      ) : status === 'loading' ? (
        <Spinner label="내 정보를 불러오는 중이에요" />
      ) : null}
    </SafeAreaView>
  );
}

function GuardianDetails({
  guardian,
}: {
  guardian: components['schemas']['Guardian'];
}) {
  return (
    <View style={styles.card}>
      <View style={styles.summary}>
        {guardian.photoUrl === null ? (
          <View
            style={[styles.photo, styles.placeholder]}
            accessible
            accessibilityRole="image"
            accessibilityLabel="기본 프로필 이미지"
          >
            <DesignIcon name="user" size={30} color="#8D6B24" />
          </View>
        ) : (
          <Image
            source={{ uri: guardian.photoUrl }}
            style={styles.photo}
            resizeMode="cover"
            accessible
            accessibilityLabel="프로필 사진"
          />
        )}
        <View style={styles.identity}>
          <Text style={styles.nickname}>{guardian.nickname}</Text>
          <Text style={styles.email}>{guardian.email}</Text>
        </View>
      </View>
      <ProfileFact label="보호자 유형">
        <Text style={styles.value}>{profileTypes[guardian.profileType]}</Text>
      </ProfileFact>
      {guardian.profileType === 'individual' && (
        <ProfileFact label="성별">
          <Text style={styles.value}>
            {guardian.gender === 'female' ? '여성' : '남성'}
          </Text>
        </ProfileFact>
      )}
      <ProfileFact label="메이트 찾기">
        <Text style={styles.value}>
          {guardian.discoveryStatus === 'searching' ? '찾는 중' : '쉬는 중'}
        </Text>
      </ProfileFact>
      <ProfileFact label="주 활동 지역">
        {guardian.activityRegions.length === 0 && (
          <Text style={styles.email}>등록한 지역이 없어요</Text>
        )}
        {guardian.activityRegions.map((region) => (
          <Text key={region.id} style={styles.value}>
            {region.path.map(({ name }) => name).join(' ')}
          </Text>
        ))}
      </ProfileFact>
      <ProfileFact label="활동 가능 시간">
        {guardian.availableTimeSlots.length === 0 && (
          <Text style={styles.email}>등록한 요일과 시간이 없어요</Text>
        )}
        {guardian.availableTimeSlots.map(
          ({ dayOfWeek, startTime, endTime }) => (
            <Text key={`${dayOfWeek}-${startTime}`} style={styles.value}>
              {`${days[dayOfWeek]}요일 ${startTime}–${endTime}`}
            </Text>
          ),
        )}
      </ProfileFact>
    </View>
  );
}

function ProfileFact({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.fact}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.factValues}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAF8F2' },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  title: { fontSize: 30, fontWeight: '800', color: '#332E24' },
  card: {
    backgroundColor: '#FFFEFB',
    borderWidth: 1,
    borderColor: '#E9E0CD',
    borderRadius: 24,
    padding: 20,
    gap: 8,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingBottom: 12,
  },
  identity: { flex: 1, gap: 4 },
  nickname: { color: '#332E24', fontSize: 24, fontWeight: '700' },
  email: { color: '#6C6457', fontSize: 14 },
  fact: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderColor: '#E9E0CD',
    paddingTop: 12,
    paddingBottom: 4,
  },
  factValues: { flex: 1, gap: 6 },
  logout: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: 14,
  },
  logoutPressed: { backgroundColor: '#F7EDD0' },
  logoutText: { color: '#6C6457', fontSize: 15, fontWeight: '600' },
  photo: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  placeholder: {
    backgroundColor: '#F7EDD0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { width: '38%', color: '#6C6457', fontSize: 14, fontWeight: '600' },
  value: { color: '#332E24', fontSize: 15 },
});
