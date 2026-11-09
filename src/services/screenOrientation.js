import { Platform } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

export const canFollowDeviceOrientation =
  Platform.OS === 'android' || (Platform.OS === 'ios' && !Platform.isPad);

export function lockScreenOrientation(orientation) {
  return ScreenOrientation.lockAsync(orientation);
}
