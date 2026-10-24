import { useFonts } from 'expo-font';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { PlayfairDisplay_400Regular } from '@expo-google-fonts/playfair-display/400Regular';

// Only the two weights the app actually renders. Importing the package root
// would bundle all 18 font files (~6MB) into the APK.
export const useAppFonts = (): [boolean, Error | null] => {
  const [loaded, error] = useFonts({
    Inter: Inter_400Regular,
    'Playfair Display': PlayfairDisplay_400Regular,
  });
  return [loaded, error];
};
