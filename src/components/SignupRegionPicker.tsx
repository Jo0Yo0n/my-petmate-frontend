import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DesignIcon } from './DesignIcon';

// The preview catalogue remains local until the public region API is connected.
const localities = ['망원동', '연남동', '합정동', '서교동'];
export function SignupRegionPicker() {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [regions, setRegions] = useState<string[]>([]);
  const [draft, setDraft] = useState<string[]>([]);
  const [error, setError] = useState('');
  const options =
    step === 0 ? ['서울특별시'] : step === 1 ? ['마포구'] : localities;
  function choose(name: string) {
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    if (draft.includes(name)) {
      setDraft(draft.filter((item) => item !== name));
      setError('');
    } else if (draft.length < 3) {
      setDraft([...draft, name]);
      setError('');
    } else
      setError('최대 3곳까지 선택할 수 있어요. 선택한 동네를 해제해 주세요.');
  }
  return (
    <View>
      <View style={styles.heading}>
        <Text style={styles.label}>주 활동 지역</Text>
        <Text style={styles.count}>{regions.length}/3</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="산책 지역 선택"
        onPress={() => {
          setDraft([...regions]);
          setStep(0);
          setError('');
          setOpen(true);
        }}
        style={styles.trigger}
      >
        <View style={styles.locationIcon}>
          <DesignIcon name="map-pin" color="#8D6B24" />
        </View>
        <View style={styles.triggerCopy}>
          <Text style={styles.triggerTitle}>지역 선택하기</Text>
          <Text style={styles.hint}>자주 산책하는 동네를 알려 주세요</Text>
        </View>
        <DesignIcon name="caret-right" size={20} color="#6C6457" />
      </Pressable>
      <View style={styles.chips}>
        {regions.map((name) => (
          <View key={name} style={styles.chip}>
            <Text style={styles.chipText}>{name}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${name} 삭제`}
              onPress={() =>
                setRegions(regions.filter((region) => region !== name))
              }
              style={styles.remove}
            >
              <DesignIcon name="x" size={14} />
            </Pressable>
          </View>
        ))}
      </View>
      <Text style={styles.help}>
        한 곳 이상, 최대 3곳까지 선택할 수 있어요.
      </Text>
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            accessibilityRole="button"
            accessibilityLabel="지역 선택 취소"
            onPress={() => setOpen(false)}
          />
          <View
            accessibilityViewIsModal
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, 20) },
            ]}
          >
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text accessibilityRole="header" style={styles.title}>
                어디에서 산책하나요?
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="지역 선택 닫기"
                onPress={() => setOpen(false)}
                style={styles.close}
              >
                <DesignIcon name="x" size={22} color="#6C6457" />
              </Pressable>
            </View>
            <Text style={styles.hint}>
              자주 걷는 동네를 최대 3곳 선택해 주세요.
            </Text>
            <View style={styles.steps}>
              {['시·도', '시·군·구', '읍·면·동'].map((name, index) => (
                <Pressable
                  key={name}
                  accessibilityRole="button"
                  accessibilityLabel={`${name} 단계`}
                  disabled={index > step}
                  onPress={() => setStep(index)}
                  style={[styles.step, index === step && styles.currentStep]}
                >
                  <Text
                    style={[
                      styles.stepText,
                      index === step && styles.currentStepText,
                    ]}
                  >
                    {index < step
                      ? index === 0
                        ? '서울특별시'
                        : '마포구'
                      : name}
                  </Text>
                </Pressable>
              ))}
            </View>
            <ScrollView
              style={styles.options}
              contentContainerStyle={styles.optionContent}
            >
              {options.map((name) => {
                const selected = step === 2 && draft.includes(name);
                return (
                  <Pressable
                    key={name}
                    accessibilityRole={step === 2 ? 'checkbox' : 'button'}
                    accessibilityLabel={name}
                    accessibilityState={{
                      checked: step === 2 ? selected : undefined,
                    }}
                    onPress={() => choose(name)}
                    style={[styles.option, selected && styles.selected]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.selectedText,
                      ]}
                    >
                      {name}
                    </Text>
                    <DesignIcon
                      name={step === 2 ? 'check' : 'caret-right'}
                      size={20}
                      color={
                        selected
                          ? '#8D6B24'
                          : step === 2
                            ? '#C9C1B0'
                            : '#6C6457'
                      }
                    />
                  </Pressable>
                );
              })}
            </ScrollView>
            {error ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="지역 선택 완료"
              disabled={!draft.length}
              onPress={() => {
                setRegions([...draft]);
                setOpen(false);
              }}
              style={[styles.confirm, !draft.length && styles.disabled]}
            >
              <Text style={styles.confirmText}>
                {draft.length
                  ? `${draft.length}곳 선택 완료`
                  : '동네를 선택해 주세요'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: { color: '#332E24', fontSize: 18, lineHeight: 25, fontWeight: '700' },
  count: { color: '#6C6457', fontSize: 13, lineHeight: 20 },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#F1EDE4',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFFEFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerCopy: { flex: 1, gap: 4 },
  triggerTitle: {
    color: '#332E24',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  hint: { color: '#6C6457', fontSize: 13, lineHeight: 21 },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    borderRadius: 22,
    backgroundColor: '#F7EDD0',
  },
  chipText: { color: '#332E24', fontSize: 14, lineHeight: 20 },
  remove: {
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  help: {
    color: '#6C6457',
    fontSize: 13,
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 24,
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#332E244D',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFEFB',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 10,
    maxHeight: '85%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D5CFC3',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    flex: 1,
    color: '#332E24',
    fontSize: 23,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  close: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  steps: { flexDirection: 'row', gap: 8, marginTop: 24, marginBottom: 16 },
  step: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderColor: '#E4DED0',
  },
  currentStep: { borderColor: '#8D6B24' },
  stepText: { color: '#6C6457', fontSize: 14, lineHeight: 21 },
  currentStepText: { color: '#332E24', fontWeight: '700' },
  options: { flexGrow: 0 },
  optionContent: { gap: 4, paddingBottom: 12 },
  option: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  optionText: { color: '#332E24', fontSize: 16, lineHeight: 24 },
  selected: { backgroundColor: '#F7EDD0' },
  selectedText: { fontWeight: '600' },
  error: { color: '#B42318', fontSize: 13, lineHeight: 21, marginVertical: 8 },
  confirm: {
    minHeight: 54,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#F2CD70',
    marginTop: 16,
  },
  disabled: { backgroundColor: '#E8E3D8' },
  confirmText: {
    color: '#332E24',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
});
