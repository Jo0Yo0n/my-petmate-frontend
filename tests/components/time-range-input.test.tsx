import { afterEach, expect, test } from '@jest/globals';
import { useState } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { TimeRangeInput } from '../../src/components/TimeRangeInput';

function Harness() {
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('12:00');
  return (
    <TimeRangeInput
      start={start}
      end={end}
      onStartChange={setStart}
      onEndChange={setEnd}
    />
  );
}
let screen: ReactTestRenderer;
afterEach(() => {
  act(() => screen?.unmount());
});
function mount() {
  act(() => {
    screen = create(<Harness />);
  });
}
function field(label: string) {
  return screen.root
    .findAllByType(TextInput)
    .find((node) => node.props.accessibilityLabel === label)!;
}
function input(label: string, value: string) {
  act(() => field(label).props.onChangeText(value));
}
function track() {
  return screen.root.findAll(
    (node) => typeof node.props.onResponderGrant === 'function',
  )[0];
}
function drag(from: number, to: number) {
  act(() =>
    track().props.onLayout({ nativeEvent: { layout: { width: 1439 } } }),
  );
  act(() =>
    track().props.onResponderGrant({ nativeEvent: { locationX: from } }),
  );
  act(() => track().props.onResponderMove({ nativeEvent: { locationX: to } }));
}
function adjust(label: string, actionName: string) {
  act(() =>
    screen.root
      .findAll(
        (node) =>
          node.props.accessibilityLabel === label &&
          typeof node.props.onAccessibilityAction === 'function',
      )[0]
      .props.onAccessibilityAction({ nativeEvent: { actionName } }),
  );
}

test.each(['drag', 'accessibility'] as const)(
  '%s: 종료 00:00 이후 시작 조작으로 음수 시간을 만들지 않는다',
  (mode) => {
    mount();
    input('종료 시간', '00:00');
    if (mode === 'drag') drag(540, -100);
    else adjust('시작 시간 조절', 'decrement');
    expect(field('시작 시간').props.value).toBe('00:00');
    expect(field('종료 시간').props.value).toBe('00:00');
  },
);

test.each(['drag', 'accessibility'] as const)(
  '%s: 시작 23:59 이후 종료 조작으로 24시 이상을 만들지 않는다',
  (mode) => {
    mount();
    input('시작 시간', '23:59');
    if (mode === 'drag') drag(720, 1600);
    else adjust('종료 시간 조절', 'increment');
    expect(field('시작 시간').props.value).toBe('23:59');
    expect(field('종료 시간').props.value).toBe('23:50');
  },
);

test('일반 드래그·접근성 조작은 같은 입력값에 반영된다', () => {
  mount();
  drag(540, 600);
  expect(field('시작 시간').props.value).toBe('10:00');
  adjust('시작 시간 조절', 'increment');
  expect(field('시작 시간').props.value).toBe('10:10');
  expect(field('종료 시간').props.value).toBe('12:00');
});

test('직접 입력 중 잘못된 형식은 유지하고 슬라이더는 유효한 시간을 생성한다', () => {
  mount();
  input('시작 시간', 'abc');
  input('종료 시간', '');
  expect(field('시작 시간').props.value).toBe('abc');
  drag(540, 600);
  expect(field('시작 시간').props.value).toBe('10:00');
  expect(field('종료 시간').props.value).toBe('');
});
