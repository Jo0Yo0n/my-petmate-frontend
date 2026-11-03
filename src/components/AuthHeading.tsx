import { StyleSheet, Text, View } from 'react-native';

type AuthHeadingProps = { title: string; description: string };
export function AuthHeading({ title, description }: AuthHeadingProps) {
  return (
    <View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#332E24',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -1.15,
    marginBottom: 9,
  },
  description: { color: '#6C6457', fontSize: 13, marginBottom: 20 },
});
