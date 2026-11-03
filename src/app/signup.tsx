import { useState } from 'react';
import { router } from 'expo-router';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DesignIcon, type DesignIconName } from '../components/DesignIcon';
import { SignupPhotoPicker } from '../components/SignupPhotoPicker';
import { SignupActivityFields } from '../components/SignupActivityFields';
import { AuthSwitch } from '../components/AuthSwitch';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { Spinner } from '../components/Spinner';
import { usePreviewSubmission } from '../hooks/usePreviewSubmission';

type ProfileType = 'individual' | 'couple' | 'family';
type Gender = 'female' | 'male';
type DiscoveryStatus = 'searching' | 'paused';
type Errors = Partial<
  Record<
    | 'nickname'
    | 'email'
    | 'password'
    | 'confirmation'
    | 'profileType'
    | 'gender'
    | 'discoveryStatus',
    string
  >
>;

function Section({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.number}>{number}</Text>
      <View style={styles.sectionCopy}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {title}
        </Text>
        <Text style={styles.hint}>{description}</Text>
      </View>
    </View>
  );
}

function Choices<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
  layout = 'type',
}: {
  layout?: 'type' | 'gender' | 'discovery';
  label: string;
  options: readonly (readonly [T, string, DesignIconName?, string?])[];
  value: T | undefined;
  onChange: (value: T) => void;
  error?: string;
}) {
  return (
    <View
      style={[styles.choicesGroup, layout === 'gender' && styles.genderGroup]}
      accessibilityLabel={label}
    >
      <View
        style={[
          styles.choices,
          layout === 'discovery' && styles.discoveryChoices,
        ]}
      >
        {options.map(([key, title, icon, description]) => (
          <Pressable
            key={key}
            accessibilityRole="radio"
            accessibilityLabel={title}
            accessibilityHint={description}
            accessibilityState={{ checked: value === key }}
            hitSlop={layout === 'gender' ? 2 : undefined}
            onPress={() => onChange(key)}
            style={[
              styles.choice,
              layout === 'type' && styles.typeChoice,
              layout === 'discovery' && styles.discoveryChoice,
              layout === 'gender' && styles.genderChoice,
              value === key && styles.selected,
              value === key && layout === 'type' && styles.selectedType,
              value === key &&
                layout === 'discovery' &&
                styles.selectedDiscovery,
            ]}
          >
            {layout !== 'gender' ? (
              <View
                style={[
                  styles.radio,
                  layout === 'type' && styles.typeRadio,
                  layout === 'discovery' && styles.discoveryRadio,
                  value === key && styles.checkedRadio,
                ]}
              >
                {value === key ? <View style={styles.radioDot} /> : null}
              </View>
            ) : null}
            {icon ? (
              <DesignIcon
                name={icon}
                size={layout === 'type' ? 25 : 24}
                color={layout === 'type' ? '#746C58' : '#8D6B24'}
              />
            ) : null}
            <View
              style={layout === 'type' ? styles.typeCopy : styles.choiceCopy}
            >
              <Text
                style={[
                  styles.choiceTitle,
                  layout === 'gender' && styles.genderText,
                ]}
              >
                {title}
              </Text>
              {description ? (
                <Text style={styles.caption}>{description}</Text>
              ) : null}
            </View>
          </Pressable>
        ))}
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export default function SignupScreen() {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [profileType, setProfileType] = useState<ProfileType>();
  const [gender, setGender] = useState<Gender>();
  const [discoveryStatus, setDiscoveryStatus] = useState<DiscoveryStatus>();
  const [errors, setErrors] = useState<Errors>({});
  const { isSubmitting, submitPreview } = usePreviewSubmission();
  const goToLogin = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/login');
  };

  function submit() {
    const next: Errors = {};
    if (!nickname.trim()) next.nickname = '닉네임을 입력해 주세요.';
    if (!email.trim()) next.email = '이메일을 입력해 주세요.';
    if (!password) next.password = '비밀번호를 입력해 주세요.';
    if (!confirmation) next.confirmation = '비밀번호를 한 번 더 입력해 주세요.';
    else if (password !== confirmation)
      next.confirmation = '비밀번호가 일치하지 않아요.';
    if (!profileType) next.profileType = '보호자 유형을 선택해 주세요.';
    if (profileType === 'individual' && !gender)
      next.gender = '성별을 선택해 주세요.';
    if (!discoveryStatus)
      next.discoveryStatus = '메이트 찾기 상태를 선택해 주세요.';
    setErrors(next);
    if (Object.keys(next).length !== 0) return;
    submitPreview(() =>
      Alert.alert(
        '회원가입 준비 중',
        '아직 가입 요청은 전송되지 않아요. 지역은 디자인 미리보기의 예시이며 실제 가입 기능은 준비 중이에요.',
      ),
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.top}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="← 로그인으로"
              onPress={goToLogin}
              style={styles.back}
            >
              <DesignIcon name="arrow-left" size={20} color="#6C6457" />
              <Text style={styles.backText}>로그인으로</Text>
            </Pressable>
            <View style={styles.brandMark}>
              <DesignIcon name="paw-print" size={25} />
            </View>
          </View>
          <Text accessibilityRole="header" style={styles.title}>
            회원가입
          </Text>
          <Section
            number="01"
            title="계정 정보"
            description="로그인에 사용할 정보를 입력해 주세요."
          />
          <SignupPhotoPicker />
          <TextField
            variant="signup"
            label="닉네임"
            value={nickname}
            onChangeText={setNickname}
            maxLength={30}
            autoComplete="nickname"
            placeholder="닉네임을 입력해 주세요"
            error={errors.nickname}
          />
          <TextField
            variant="signup"
            label="이메일"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            keyboardType="email-address"
            placeholder="이메일 주소"
            error={errors.email}
          />
          <TextField
            variant="signup"
            label="비밀번호"
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            secureTextEntry
            maxLength={72}
            placeholder="안전한 비밀번호를 입력해 주세요"
            error={errors.password}
          />
          <Text style={styles.passwordHint}>
            8~72자 · 영문 대문자·소문자·숫자·특수문자(! @ # $ % ^ & *) 포함 ·
            공백 불가
          </Text>
          <TextField
            variant="signup"
            label="비밀번호 확인"
            value={confirmation}
            onChangeText={setConfirmation}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            secureTextEntry
            maxLength={72}
            placeholder="비밀번호를 한 번 더 입력해 주세요"
            error={errors.confirmation}
            returnKeyType="done"
            onSubmitEditing={submit}
          />
          <Section
            number="02"
            title="보호자 유형"
            description="현재 보호자 유형을 선택해 주세요."
          />
          <Choices<ProfileType>
            label="보호자 유형"
            options={[
              ['individual', '개인', 'user', '개인 보호자'],
              ['couple', '커플', 'users', '커플 보호자'],
              ['family', '가족', 'house', '가족 보호자'],
            ]}
            value={profileType}
            onChange={setProfileType}
            error={errors.profileType}
          />
          {profileType === 'individual' ? (
            <View style={styles.gender}>
              <Text style={styles.genderLabel}>성별</Text>
              <Choices<Gender>
                label="성별"
                layout="gender"
                options={[
                  ['female', '여성'],
                  ['male', '남성'],
                ]}
                value={gender}
                onChange={setGender}
                error={errors.gender}
              />
              <View style={styles.genderNote}>
                <DesignIcon name="leaf" size={18} color="#566341" />
                <Text style={styles.noteCopy}>
                  한 번 설정한 성별은 바꿀 수 없어요.
                </Text>
              </View>
            </View>
          ) : null}
          <Section
            number="03"
            title="메이트 찾기 상태"
            description="가입 후 내 정보에서 변경할 수 있어요."
          />
          <Choices<DiscoveryStatus>
            label="메이트 찾기 상태"
            layout="discovery"
            options={[
              ['searching', '찾는 중', 'sun', '추천과 새로운 관심 보내기'],
              ['paused', '쉬는 중', 'moon', '기존 관심·대화·약속은 유지'],
            ]}
            value={discoveryStatus}
            onChange={setDiscoveryStatus}
            error={errors.discoveryStatus}
          />
          <View style={styles.note}>
            <DesignIcon name="leaf" size={18} color="#566341" />
            <Text style={styles.noteCopy}>
              쉬는 중에도 이전에 받은 관심에 응답하고, 이미 연결된 친구와
              대화·약속을 이어갈 수 있어요.
            </Text>
          </View>
          <Section
            number="04"
            title="활동 지역과 시간"
            description="자주 걷는 동네와 편한 시간으로 산책 친구를 찾아요."
          />
          <SignupActivityFields />
          <PrimaryButton
            label="회원가입"
            onPress={submit}
            disabled={isSubmitting}
          />
          <AuthSwitch
            prompt="이미 계정이 있나요?"
            label="로그인"
            onPress={goToLogin}
          />
        </ScrollView>
      </KeyboardAvoidingView>
      {isSubmitting ? <Spinner label="제출 중이에요" /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAF8F2' },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  back: { minHeight: 44, flexDirection: 'row', gap: 7, alignItems: 'center' },
  backText: { color: '#6C6457', fontSize: 13 },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: '#F2CD70',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-7deg' }],
  },
  title: {
    color: '#332E24',
    fontSize: 30,
    lineHeight: 38.4,
    fontWeight: '700',
    letterSpacing: -1,
    marginBottom: 12,
  },
  description: {
    color: '#6C6457',
    fontSize: 15,
    lineHeight: 24.75,
    marginBottom: 0,
  },
  section: { flexDirection: 'row', gap: 11, marginTop: 32, marginBottom: 0 },
  number: {
    backgroundColor: '#F7EDD0',
    color: '#7B6027',
    borderRadius: 14,
    width: 28,
    height: 28,
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  sectionCopy: { flex: 1, gap: 5 },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 23.8,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: '#332E24',
  },
  hint: { color: '#6C6457', fontSize: 13, lineHeight: 21 },
  passwordHint: {
    color: '#6C6457',
    fontSize: 13,
    lineHeight: 22,
    marginTop: 10,
  },
  choicesGroup: { marginTop: 20, marginBottom: 0, gap: 8 },
  choiceLegend: {
    color: '#332E24',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22.4,
    marginBottom: 7,
  },
  choices: { flexDirection: 'row', gap: 8 },
  discoveryChoices: { flexDirection: 'column', gap: 10 },
  choice: {
    borderWidth: 1,
    borderColor: '#E4DED0',
    borderRadius: 18,
    backgroundColor: '#FFFEFB',
  },
  typeChoice: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingTop: 19,
    paddingBottom: 14,
    gap: 9,
  },
  typeCopy: { alignItems: 'center', gap: 5 },
  choiceCopy: { flex: 1, gap: 3 },
  discoveryChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 18,
    paddingLeft: 16,
    paddingRight: 42,
    borderRadius: 17,
  },
  genderChoice: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 13,
  },
  genderText: { fontSize: 14, fontWeight: '400' },
  selected: {
    backgroundColor: '#F7EDD0',
    borderColor: '#8D6B24',
    borderWidth: 2,
  },
  selectedType: { paddingTop: 18, paddingBottom: 13, paddingHorizontal: 4 },
  selectedDiscovery: { paddingVertical: 17, paddingLeft: 15, paddingRight: 41 },
  choiceTitle: {
    color: '#332E24',
    fontSize: 15,
    lineHeight: 22.5,
    fontWeight: '600',
  },
  caption: { color: '#6C6457', fontSize: 13, lineHeight: 21 },
  radio: {
    width: 17,
    height: 17,
    borderWidth: 1,
    borderColor: '#978B75',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFEFB',
  },
  typeRadio: { position: 'absolute', top: 10, right: 10 },
  discoveryRadio: {
    position: 'absolute',
    right: 16,
  },
  checkedRadio: { borderColor: '#846518' },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#846518',
  },
  gender: { marginTop: 24 },
  genderGroup: { marginTop: 12, marginBottom: 4 },
  genderLabel: {
    color: '#332E24',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
  },
  genderNote: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 2,
    paddingBottom: 6,
  },
  error: { color: '#B42318', fontSize: 13, lineHeight: 21 },
  note: { flexDirection: 'row', gap: 10, paddingVertical: 16 },
  noteCopy: { flex: 1, color: '#6C6457', fontSize: 13, lineHeight: 22 },
});
