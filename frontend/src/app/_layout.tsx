import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GameAudioProvider, useGameAudio } from '../AudioContext';
import { GameProvider } from '../GameContext';
import { COLORS } from '../theme';

function MusicToggle() {
  const { musicEnabled, toggleMusic } = useGameAudio();
  const insets = useSafeAreaInsets();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={musicEnabled ? 'Mute music' : 'Play music'} onPress={toggleMusic} style={({ pressed }) => [styles.musicButton, { right: Math.max(10, insets.right + 5), top: Math.max(10, insets.top + 5) }, pressed && styles.musicPressed]}>
      <Text style={styles.musicText}>{musicEnabled ? '♫ MUSIC ON' : '♫ MUTED'}</Text>
    </Pressable>
  );
}

export default function RootLayout() {
  return (
    <GameAudioProvider>
      <GameProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, animation: 'fade', orientation: 'landscape', contentStyle: { backgroundColor: '#171b1c' } }} />
        <MusicToggle />
      </GameProvider>
    </GameAudioProvider>
  );
}

const styles = StyleSheet.create({
  musicButton: { position: 'absolute', zIndex: 1000, elevation: 20, minWidth: 108, minHeight: 48, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(7,17,18,0.94)', borderWidth: 3, borderColor: COLORS.gold, borderRadius: 9, shadowColor: '#000', shadowOpacity: 0.65, shadowRadius: 5, shadowOffset: { width: 3, height: 4 } },
  musicPressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  musicText: { color: COLORS.gold, fontSize: 14, fontWeight: '900', letterSpacing: 0.8 },
});
