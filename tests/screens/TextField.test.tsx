import { test, expect } from '@jest/globals';
import { useState } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { Text, TextInput } from 'react-native';
import { TextField } from '../../src/components/TextField';

function ControlledField() {
  const [value, setValue] = useState('');
  return (
    <TextField
      label="닉네임"
      placeholder="닉네임 입력"
      value={value}
      onChangeText={setValue}
    />
  );
}

test('입력·삭제에 따라 안내를 숨기고 다시 표시하며 접근성 label을 유지한다', () => {
  let screen: ReactTestRenderer;
  act(() => {
    screen = create(<ControlledField />);
  });
  const placeholderVisible = () =>
    screen.root
      .findAllByType(Text)
      .some((node) => node.props.children === '닉네임 입력');
  const field = () => screen.root.findByType(TextInput);
  expect(placeholderVisible()).toBe(true);
  expect(field().props.accessibilityLabel).toBe('닉네임');
  expect(field().props.accessibilityHint).toBe('닉네임 입력');
  act(() => field().props.onChangeText('산책친구'));
  expect(placeholderVisible()).toBe(false);
  expect(field().props.value).toBe('산책친구');
  act(() => field().props.onChangeText(''));
  expect(placeholderVisible()).toBe(true);
  act(() => screen.unmount());
});

test('defaultValue로 시작하는 입력도 비우면 안내를 표시한다', () => {
  let screen: ReactTestRenderer;
  act(() => {
    screen = create(
      <TextField
        label="닉네임"
        placeholder="닉네임 입력"
        defaultValue="산책친구"
      />,
    );
  });
  const placeholderVisible = () =>
    screen.root
      .findAllByType(Text)
      .some((node) => node.props.children === '닉네임 입력');
  expect(placeholderVisible()).toBe(false);
  act(() => screen.root.findByType(TextInput).props.onChangeText(''));
  expect(placeholderVisible()).toBe(true);
  act(() => screen.unmount());
});
