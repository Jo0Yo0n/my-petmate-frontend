import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { DesignIcon } from './DesignIcon';
import { SignupRegionPicker } from './SignupRegionPicker';
import { TimeRangeInput } from './TimeRangeInput';

const days = ['월', '화', '수', '목', '금', '토', '일'];
type Slot = { days: number[]; start: string; end: string };
const minutes = (time: string) =>
  /^([01]\d|2[0-3]):[0-5]\d$/.test(time)
    ? Number(time.slice(0, 2)) * 60 + Number(time.slice(3))
    : NaN;

export function SignupActivityFields() {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('12:00');
  const [slots, setSlots] = useState<Slot[]>([]);
  function addTime() {
    const from = minutes(start),
      to = minutes(end);
    const error = !selectedDays.length
      ? '요일을 하나 이상 선택해 주세요.'
      : !Number.isFinite(from) || !Number.isFinite(to)
        ? '시간을 HH:mm 형식으로 입력해 주세요.'
        : from >= to
          ? '종료 시간은 시작 시간보다 늦어야 해요.'
          : slots.some(
                (slot) =>
                  slot.days.some((day) => selectedDays.includes(day)) &&
                  from < minutes(slot.end) &&
                  to > minutes(slot.start),
              )
            ? '같은 요일의 시간이 겹치지 않게 설정해 주세요.'
            : '';
    if (error) return Alert.alert('활동 시간을 확인해 주세요', error);
    setSlots([...slots, { days: [...selectedDays].sort(), start, end }]);
    setSelectedDays([]);
    setStart('09:00');
    setEnd('12:00');
  }
  return (
    <View style={styles.activity}>
      <SignupRegionPicker />
      <View style={styles.editor}>
        <Text style={styles.legend}>활동 가능한 시간</Text>
        <View style={styles.days}>
          {days.map((day, index) => (
            <Pressable
              key={day}
              accessibilityRole="checkbox"
              accessibilityLabel={`${day}요일`}
              accessibilityState={{ checked: selectedDays.includes(index) }}
              onPress={() =>
                setSelectedDays(
                  selectedDays.includes(index)
                    ? selectedDays.filter((value) => value !== index)
                    : [...selectedDays, index],
                )
              }
              style={[
                styles.day,
                selectedDays.includes(index) && styles.selected,
              ]}
            >
              <Text style={styles.dayText}>{day}</Text>
            </Pressable>
          ))}
        </View>
        <TimeRangeInput
          start={start}
          end={end}
          onStartChange={setStart}
          onEndChange={setEnd}
        />
        <View style={styles.addTimeRow}>
          <Text style={styles.hint}>요일과 시간을 선택한 뒤</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="추가하기"
            onPress={addTime}
            style={styles.addTime}
          >
            <Text style={styles.buttonText}>추가하기</Text>
          </Pressable>
        </View>
      </View>
      {slots.length ? (
        <View style={styles.slotList}>
          {slots.map((slot, index) => (
            <View
              key={`${slot.days}-${slot.start}-${slot.end}`}
              style={[
                styles.slot,
                index === slots.length - 1 && styles.lastSlot,
              ]}
            >
              <View style={styles.slotCopy}>
                <Text style={styles.slotDays}>
                  {slot.days.map((day) => days[day]).join(' · ')}
                </Text>
                <Text style={styles.hours}>
                  {slot.start}–{slot.end}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${slot.start} ${slot.end} 시간 삭제`}
                onPress={() => setSlots(slots.filter((_, i) => i !== index))}
                style={styles.remove}
              >
                <DesignIcon name="x" size={16} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  activity: { marginTop: 28, marginBottom: 28 },
  hint: { color: '#6C6457', fontSize: 13, lineHeight: 21 },
  legend: { color: '#332E24', fontSize: 18, fontWeight: '700', lineHeight: 25 },
  selected: { backgroundColor: '#F7EDD0', borderColor: '#8D6B24' },
  buttonText: { color: '#332E24', fontSize: 14, fontWeight: '600' },
  remove: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editor: {
    borderWidth: 1,
    borderColor: '#E4DED0',
    borderRadius: 18,
    backgroundColor: '#FFFEFB',
    paddingVertical: 18,
    paddingHorizontal: 14,
    marginTop: 20,
    marginBottom: 12,
  },
  days: { flexDirection: 'row', gap: 5, marginTop: 12, marginBottom: 24 },
  day: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#978B75',
    borderRadius: 11,
  },
  dayText: { color: '#332E24', fontSize: 16 },
  addTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  addTime: {
    minHeight: 44,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#978B75',
    borderRadius: 12,
    backgroundColor: '#F7EDD0',
  },
  slotList: {
    marginTop: 12,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    marginBottom: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#EEE8DC',
    borderRadius: 14,
    backgroundColor: '#FBF8EF',
  },
  lastSlot: { borderBottomWidth: 0 },
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderColor: '#E4DED0',
    minHeight: 48,
    paddingVertical: 4,
  },
  slotCopy: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 16,
    flexShrink: 1,
  },
  slotDays: {
    flexShrink: 1,
    color: '#6C6457',
    fontSize: 14,
    lineHeight: 22,
    includeFontPadding: false,
  },
  hours: {
    color: '#332E24',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '600',
    includeFontPadding: false,
    fontVariant: ['tabular-nums'],
  },
});
