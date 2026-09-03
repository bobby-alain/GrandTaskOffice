import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useAudioPlayer } from "expo-audio";

const heistMusic = require("../assets/audio/office-heist-loop.wav");
const victoryMusic = require("../assets/audio/clean-getaway.wav");

interface GameAudioValue {
  musicEnabled: boolean;
  startMusic: () => void;
  toggleMusic: () => void;
  playVictory: () => void;
}

const GameAudioContext = createContext<GameAudioValue | undefined>(undefined);

export function GameAudioProvider({ children }: { children: ReactNode }) {
  const music = useAudioPlayer(heistMusic, { downloadFirst: true });
  const victory = useAudioPlayer(victoryMusic, { downloadFirst: true });
  const [musicEnabled, setMusicEnabled] = useState(true);

  useEffect(() => {
    music.loop = true;
    music.volume = 0.16;
    victory.volume = 0.42;
  }, [music, victory]);

  const startMusic = () => {
    victory.pause();
    if (musicEnabled) music.play();
  };

  const toggleMusic = () => {
    setMusicEnabled((enabled) => {
      if (enabled) music.pause();
      else music.play();
      return !enabled;
    });
  };

  const playVictory = () => {
    music.pause();
    void victory.seekTo(0);
    victory.play();
  };

  return <GameAudioContext.Provider value={{ musicEnabled, startMusic, toggleMusic, playVictory }}>{children}</GameAudioContext.Provider>;
}

export function useGameAudio() {
  const context = useContext(GameAudioContext);
  if (!context) throw new Error("useGameAudio must be used inside GameAudioProvider");
  return context;
}
