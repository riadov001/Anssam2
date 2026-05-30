import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3500),
      setTimeout(() => setPhase(4), 8500), // exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      {...sceneTransitions.splitHorizontal}
    >
      <div className="absolute inset-0">
         <img 
            src={`${import.meta.env.BASE_URL}images/islamic-archway.png`}
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
         />
      </div>

      <div className="relative z-20 w-[60vw] text-center">
        <motion.h2
          className="font-arabic text-[5vw] text-gradient-gold leading-[1.6]"
          initial={{ opacity: 0, filter: 'blur(10px)', y: 30 }}
          animate={phase >= 1 ? { opacity: 1, filter: 'blur(0px)', y: 0 } : {}}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          dir="rtl"
        >
          إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ
        </motion.h2>

        <motion.div 
          className="w-[10vw] h-[1px] bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent mx-auto my-12"
          initial={{ scaleX: 0 }}
          animate={phase >= 2 ? { scaleX: 1 } : {}}
          transition={{ duration: 1, ease: "easeInOut" }}
        />

        <motion.p
          className="font-body text-[2vw] text-white/80 font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          Certes, ce Coran guide vers ce qu'il y a de plus droit...
        </motion.p>
        
        <motion.p
          className="font-display text-[1.2vw] text-[var(--color-accent)] mt-6 tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          Sourate Al-Isra (17:9)
        </motion.p>
      </div>
    </motion.div>
  );
}
