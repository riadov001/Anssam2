import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

const SCENE_DURATIONS = {
  launch: 10000,
  prayer: 10000,
  quran: 10000,
  ai: 10000,
  outro: 10000,
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

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

      <AnimatePresence mode="sync">
        {currentScene === 0 && <Scene1 key="launch" />}
        {currentScene === 1 && <Scene2 key="prayer" />}
        {currentScene === 2 && <Scene3 key="quran" />}
        {currentScene === 3 && <Scene4 key="ai" />}
        {currentScene === 4 && <Scene5 key="outro" />}
      </AnimatePresence>

      {/* Persistent Logo Mark */}
      <motion.div 
        className="absolute top-[5vh] left-[4vw] z-50 flex items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: currentScene > 0 && currentScene < 4 ? 1 : 0 }}
        transition={{ duration: 1 }}
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/crescent-moon.png`} 
          className="w-8 h-8 object-contain"
          alt="Crescent"
        />
        <span className="font-display tracking-widest text-[var(--color-accent)] text-xl font-bold uppercase">Anssam</span>
      </motion.div>
    </div>
  );
}
