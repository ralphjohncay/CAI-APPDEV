/**
 * Load vector icon fonts before any screen renders (required on Android / some RN versions).
 */
import Ionicons from 'react-native-vector-icons/Ionicons';

let loaded = false;

export function loadIconFonts(): void {
  if (loaded) {
    return;
  }
  loaded = true;
  Ionicons.loadFont();
}
