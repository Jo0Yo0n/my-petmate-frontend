import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

const minutesPerDay = 24 * 60;

const minutes = (time: string) =>
  /^([01]\d|2[0-3]):[0-5]\d$/.test(time)
    ? Number(time.slice(0, 2)) * 60 + Number(time.slice(3))
    : NaN;
const clock = (value: number) =>
  `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;

type TimeRangeInputProps = {
  start: string;
  end: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
};

export function TimeRangeInput({
  start,
  end,
  onStartChange,
  onEndChange,
}: TimeRangeInputProps) {
  const trackWidth = useRef(1);
  const dragging = useRef<'start' | 'end'>('start');
  const [activeThumb, setActiveThumb] = useState<'start' | 'end'>();
  const startMinute = Number.isFinite(minutes(start)) ? minutes(start) : 540;
  const endMinute = Number.isFinite(minutes(end)) ? minutes(end) : 720;
  // Both drag and accessibility actions use the same bounds. Direct input
  // can temporarily be invalid; addTime remains responsible for validation.
  function updateTime(key: 'start' | 'end', value: number) {
    const bounded = Math.max(
      0,
      Math.min(
        1430,
        key === 'start'
          ? Math.min(value, endMinute - 10)
          : Math.max(value, startMinute + 10),
      ),
    );
    if (key === 'start') onStartChange(clock(bounded));
    else onEndChange(clock(bounded));
  }
  function updateTrack(x: number) {
    if (trackWidth.current <= 0 || !Number.isFinite(x)) return;
    updateTime(
      dragging.current,
      Math.round(((x / trackWidth.current) * minutesPerDay) / 10) * 10,
    );
  }
  return (
    <View>
      <Text style={styles.timeLegend}>시간 범위</Text>
      <View style={styles.timeValues}>
        {(['start', 'end'] as const).map((key) => (
          <View key={key} style={styles.timeValue}>
            <Text style={styles.body}>{key === 'start' ? '시작' : '종료'}</Text>
            <TextInput
              accessibilityLabel={key === 'start' ? '시작 시간' : '종료 시간'}
              value={key === 'start' ? start : end}
              onChangeText={key === 'start' ? onStartChange : onEndChange}
              maxLength={5}
              keyboardType="numbers-and-punctuation"
              style={styles.timeInput}
            />
          </View>
        ))}
      </View>
      <View
        style={styles.track}
        onLayout={(event) => {
          trackWidth.current = event.nativeEvent.layout.width;
        }}
        onStartShouldSetResponder={() => true}
        onResponderGrant={(event) => {
          const x = event.nativeEvent.locationX;
          dragging.current =
            Math.abs((x / trackWidth.current) * minutesPerDay - startMinute) <
            Math.abs((x / trackWidth.current) * minutesPerDay - endMinute)
              ? 'start'
              : 'end';
          setActiveThumb(dragging.current);
          updateTrack(x);
        }}
        onResponderRelease={() => setActiveThumb(undefined)}
        onResponderTerminate={() => setActiveThumb(undefined)}
        onResponderMove={(event) => updateTrack(event.nativeEvent.locationX)}
      >
        <View pointerEvents="none" style={styles.trackBase} />
        <View
          pointerEvents="none"
          style={[
            styles.trackSelected,
            {
              left: `${(startMinute / minutesPerDay) * 100}%`,
              right: `${100 - (endMinute / minutesPerDay) * 100}%`,
            },
          ]}
        />
        {(['start', 'end'] as const).map((key) => (
          <View
            key={key}
            accessible
            pointerEvents="none"
            accessibilityRole="adjustable"
            accessibilityLabel={
              key === 'start' ? '시작 시간 조절' : '종료 시간 조절'
            }
            accessibilityValue={{
              min: 0,
              max: 1439,
              now: key === 'start' ? startMinute : endMinute,
              text: key === 'start' ? start : end,
            }}
            accessibilityActions={[
              { name: 'increment' },
              { name: 'decrement' },
            ]}
            onAccessibilityAction={(event) => {
              const delta =
                event.nativeEvent.actionName === 'increment' ? 10 : -10;
              updateTime(
                key,
                (key === 'start' ? startMinute : endMinute) + delta,
              );
            }}
            style={[
              styles.thumb,
              key === activeThumb && styles.activeThumb,
              {
                left: `${((key === 'start' ? startMinute : endMinute) / minutesPerDay) * 100}%`,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.ticks}>
        {['00', '06', '12', '18', '24'].map((tick) => (
          <View key={tick} style={styles.tickAnchor}>
            <Text style={styles.tick}>{tick}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.hint}>
        10분 단위로 조절할 수 있어요.{'\n'}시간을 눌러 직접 수정할 수도 있어요.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { color: '#6C6457', fontSize: 14, lineHeight: 22 },
  hint: { color: '#6C6457', fontSize: 13, lineHeight: 21 },
  timeLegend: {
    color: '#6C6457',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  timeValues: { flexDirection: 'row', gap: 8 },
  timeValue: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#E4DED0',
    borderRadius: 13,
  },
  timeInput: {
    width: '100%',
    height: 40,
    fontSize: 26,
    textAlignVertical: 'center',
    includeFontPadding: false,
    fontWeight: '700',
    color: '#332E24',
    textAlign: 'center',
    padding: 0,
  },
  track: { height: 44, marginTop: 10, marginHorizontal: 8 },
  trackBase: {
    position: 'absolute',
    top: 18,
    height: 8,
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#E8E3D8',
  },
  trackSelected: {
    position: 'absolute',
    top: 18,
    height: 8,
    backgroundColor: '#F2CD70',
  },
  thumb: {
    position: 'absolute',
    top: 10,
    width: 24,
    height: 24,
    marginLeft: -12,
    borderRadius: 12,
    backgroundColor: '#F2CD70',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  activeThumb: {
    transform: [{ scale: 4 / 3 }],
    borderColor: '#8D6B24',
    zIndex: 1,
  },
  ticks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 8,
  },
  tickAnchor: { width: 0, alignItems: 'center' },
  tick: { width: 44, textAlign: 'center', color: '#6C6457', fontSize: 12 },
});
