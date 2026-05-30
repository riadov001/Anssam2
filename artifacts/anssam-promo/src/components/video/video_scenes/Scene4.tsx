import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3500),
      setTimeout(() => setPhase(4), 8500), // exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center z-10"
      {...sceneTransitions.wipe}
    >
      <div className="absolute right-[10vw] top-[20vh] w-[45vw] flex flex-col z-20 gap-8">
        
        <motion.div 
          className="self-end bg-white/10 backdrop-blur-md rounded-2xl rounded-tr-none p-6 border border-white/20"
          initial={{ opacity: 0, scale: 0.9, x: 20 }}
          animate={phase >= 1 ? { opacity: 1, scale: 1, x: 0 } : {}}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <p className="font-body text-[1.5vw] text-white font-light">
            Comment trouver la paix intérieure dans les moments difficiles ?
          </p>
        </motion.div>

        <motion.div 
          className="self-start bg-[var(--color-secondary)] backdrop-blur-xl rounded-2xl rounded-tl-none p-8 border border-[var(--color-accent)]/30 max-w-[90%]"
          initial={{ opacity: 0, scale: 0.9, x: -20 }}
          animate={phase >= 2 ? { opacity: 1, scale: 1, x: 0 } : {}}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className="flex items-center gap-4 mb-4">
             <img 
                src={`${import.meta.env.BASE_URL}images/crescent-moon.png`} 
                className="w-8 h-8 object-contain"
              />
              <span className="font-display text-[var(--color-accent)] tracking-widest text-[1.2vw]">ANSSAM IA</span>
          </div>
          <p className="font-body text-[1.6vw] text-white/90 leading-relaxed font-light">
            Dans le Coran, Allah dit : "N'est-ce point par l'évocation d'Allah que se tranquillisent les cœurs ?" (13:28). Prenez un moment pour faire du Dhikr...
          </p>
        </motion.div>

      </div>

      <motion.div 
        className="absolute left-[10vw] bottom-[20vh] z-20"
        initial={{ opacity: 0, y: 30 }}
        animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: "circOut" }}
      >
        <h2 className="font-display text-[3.5vw] text-white leading-tight uppercase tracking-wider mb-2">
          Assistant Spirituel
        </h2>
        <p className="font-arabic text-[4vw] text-gradient-gold drop-shadow-lg">
          مستشارك الذكي
        </p>
      </motion.div>

    </motion.div>
  );
}
