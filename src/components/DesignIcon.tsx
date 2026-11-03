import { Image } from 'react-native';

// The preview's Phosphor SVG assets, rasterized at 3× for native Image support.
const icons = {
  camera: require('../../assets/icons/camera.png'),
  'map-pin': require('../../assets/icons/map-pin.png'),
  check: require('../../assets/icons/check.png'),
  'arrow-left': require('../../assets/icons/arrow-left.png'),
  'paw-print': require('../../assets/icons/paw-print.png'),
  user: require('../../assets/icons/user.png'),
  users: require('../../assets/icons/users.png'),
  house: require('../../assets/icons/house.png'),
  sun: require('../../assets/icons/sun.png'),
  moon: require('../../assets/icons/moon.png'),
  leaf: require('../../assets/icons/leaf.png'),
  'caret-right': require('../../assets/icons/caret-right.png'),
  'caret-down': require('../../assets/icons/caret-down.png'),
  x: require('../../assets/icons/x.png'),
};
export type DesignIconName = keyof typeof icons;
export function DesignIcon({
  name,
  size = 22,
  color = '#332E24',
}: {
  name: DesignIconName;
  size?: number;
  color?: string;
}) {
  return (
    <Image
      source={icons[name]}
      accessible={false}
      style={{ width: size, height: size, tintColor: color }}
    />
  );
}
