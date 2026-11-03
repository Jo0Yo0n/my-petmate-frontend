import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { BrandWordmark } from '../components/BrandWordmark';
import { AuthSwitch } from '../components/AuthSwitch';
import { AuthHeading } from '../components/AuthHeading';
import { Spinner } from '../components/Spinner';
import { usePreviewSubmission } from '../hooks/usePreviewSubmission';
import { useState } from 'react';
import { router } from 'expo-router';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const { isSubmitting, submitPreview } = usePreviewSubmission();

  function submit() {
    const next = {
      email: email.trim() ? undefined : '이메일을 입력해 주세요.',
      password: password ? undefined : '비밀번호를 입력해 주세요.',
    };
    setErrors(next);
    if (next.email || next.password) return;
    submitPreview(() =>
      Alert.alert('로그인 준비 중', '아직 로그인 요청은 전송되지 않아요.'),
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior="padding" style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <BrandWordmark />

          <Image
            source={require('../../docs/design-assets/editable-wireframes/assets/login-dog.png')}
            style={styles.photo}
            resizeMode="cover"
            accessible
            accessibilityLabel="하네스를 착용하고 공원에서 산책하는 반려견"
          />

          <AuthHeading
            title="어서오세요!"
            description="이메일과 비밀번호를 입력해 주세요."
          />

          <TextField
            label="이메일"
            autoCapitalize="none"
            autoComplete="username"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="이메일 주소를 입력해 주세요"
            error={errors.email}
          />
          <TextField
            label="비밀번호"
            autoCapitalize="none"
            autoComplete="current-password"
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호를 입력해 주세요"
            secureTextEntry
            error={errors.password}
            returnKeyType="done"
            onSubmitEditing={submit}
          />

          <PrimaryButton
            label="로그인"
            onPress={submit}
            disabled={isSubmitting}
          />

          <AuthSwitch
            prompt="처음 오셨나요?"
            label="회원가입 →"
            onPress={() => router.push('/signup')}
          />
        </ScrollView>
      </KeyboardAvoidingView>
      {isSubmitting ? <Spinner label="로그인 중이에요" /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAF8F2' },
  content: { paddingHorizontal: 26, paddingTop: 10, paddingBottom: 22 },
  photo: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 29,
  },
});
