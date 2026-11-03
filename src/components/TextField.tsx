import {
  StyleSheet,
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { useRef, useState } from 'react';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  variant?: 'default' | 'signup';
};
export function TextField({
  label,
  error,
  style,
  variant = 'default',
  onFocus,
  onBlur,
  onChangeText,
  placeholder,
  placeholderTextColor,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const signup = variant === 'signup';
  const [uncontrolledText, setUncontrolledText] = useState(
    inputProps.defaultValue ?? '',
  );
  const empty = (inputProps.value ?? uncontrolledText).length === 0;
  return (
    <View style={[styles.field, signup && styles.signupField]}>
      <Text style={[styles.label, signup && styles.signupLabel]}>{label}</Text>
      <Pressable
        accessible={false}
        onPress={() => inputRef.current?.focus()}
        style={[
          styles.inputSurface,
          signup && focused && styles.focused,
          error && styles.invalid,
        ]}
      >
        <View style={styles.inputLine}>
          <TextInput
            ref={inputRef}
            accessibilityLabel={label}
            {...inputProps}
            placeholder=""
            accessibilityHint={inputProps.accessibilityHint ?? placeholder}
            onChangeText={(text) => {
              if (inputProps.value === undefined) setUncontrolledText(text);
              onChangeText?.(text);
            }}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            style={[styles.input, style]}
          />
          {empty && placeholder ? (
            <View
              pointerEvents="none"
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={styles.placeholderLayer}
            >
              <Text
                style={[
                  styles.placeholder,
                  {
                    color:
                      placeholderTextColor ?? (signup ? '#82796B' : '#6C6457'),
                  },
                ]}
              >
                {placeholder}
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  signupField: { marginTop: 20, marginBottom: 0 },
  signupLabel: { marginLeft: 2, marginBottom: 9, lineHeight: 21 },
  focused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#8D6B24',
    outlineColor: '#EADBB5',
    outlineWidth: 3,
    outlineOffset: 2,
  },
  invalid: {
    borderColor: '#B42318',
    borderWidth: 2,
    paddingHorizontal: 15,
    paddingVertical: 13,
  },
  error: { color: '#B42318', fontSize: 13, marginTop: 8 },
  field: { marginBottom: 16 },
  label: { color: '#332E24', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputSurface: {
    minHeight: 54,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#978B75',
    borderRadius: 14,
    backgroundColor: '#FFFEFA',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputLine: { minHeight: 24, justifyContent: 'center' },
  placeholderLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
  },
  placeholder: { fontSize: 16, lineHeight: 24, includeFontPadding: false },
  input: {
    minHeight: 24,
    padding: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
    color: '#332E24',
    fontSize: 16,
  },
});
