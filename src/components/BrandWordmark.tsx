import { Image, StyleSheet, Text, View } from 'react-native';

export function BrandWordmark() {
  return (
    <View style={styles.wordmark}>
      <View style={styles.brandMark} accessibilityElementsHidden>
        <Image
          source={require('../../assets/images/paw-print.png')}
          style={styles.paw}
        />
      </View>
      <View>
        <Text style={styles.brandName}>my petmate</Text>
        <Text style={styles.brandCaption}>반려견 산책 메이트</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wordmark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 22,
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#F2CD70',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-7deg' }],
  },
  paw: { width: 25, height: 25, transform: [{ rotate: '7deg' }] },
  brandName: {
    color: '#332E24',
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  brandCaption: { color: '#6C6457', fontSize: 10, marginTop: 2 },
});
