import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

export const SCENE_DURATIONS: Record<string, number> = {
  launch: 10000,
  prayer: 10000,
  quran: 10000,
  ai: 10000,
  outro: 10000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  launch: Scene1,
  prayer: Scene2,
  quran: Scene3,
  ai: Scene4,
  outro: Scene5,
};

const SCENE_START_SEC: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  let cumulativeMs = 0;
  for (const [key, ms] of Object.entries(SCENE_DURATIONS)) {
    out[key] = cumulativeMs / 1000;
    cumulativeMs += ms;
  }
  return out;
})();

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  muted = false,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentScene, currentSceneKey } = useVideoPlayer({ durations, loop });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '');
  const sceneIndex = Object.keys(SCENE_DURATIONS).indexOf(baseSceneKey);
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.45;
    const targetTime = SCENE_START_SEC[baseSceneKey] ?? 0;
    const EPSILON = 0.18;
    if (Math.abs(audio.currentTime - targetTime) > EPSILON) {
      audio.currentTime = targetTime;
    }
    audio.play().catch(() => {});
  }, [currentSceneKey, baseSceneKey, muted]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[var(--color-bg-dark)] font-body">

      {/* Persistent Background Layer */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <video
          src={`${import.meta.env.BASE_URL}videos/emerald-gold-particles.mp4`}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05261B] via-transparent to-[#05261B] opacity-80" />
      </div>

      <AnimatePresence mode="popLayout">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>

      {/* Persistent Logo Mark */}
      <motion.div
        className="absolute top-[5vh] left-[4vw] z-50 flex items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: sceneIndex > 0 && sceneIndex < 4 ? 1 : 0 }}
        transition={{ duration: 1 }}
      >
        <img
          src={`${import.meta.env.BASE_URL}images/crescent-moon.png`}
          className="w-8 h-8 object-contain"
          alt="Croissant"
        />
        <span className="font-display tracking-widest text-[var(--color-accent)] text-xl font-bold uppercase">Anssam</span>
      </motion.div>

      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}audio/bg_music.mp3`}
        preload="auto"
        autoPlay
        muted={muted}
      />
    </div>
  );
}
