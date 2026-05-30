import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene5() {
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
      {...sceneTransitions.zoomThrough}
    >
      <div className="absolute inset-0">
         <img 
            src={`${import.meta.env.BASE_URL}images/geometric-pattern.png`}
            className="w-full h-full object-cover opacity-30"
         />
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--color-bg-dark)_70%)]" />
      </div>

      <div className="flex flex-col items-center justify-center z-20">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
          animate={phase >= 1 ? { opacity: 1, scale: 1, rotate: 0 } : {}}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-12"
        >
           <img 
            src={`${import.meta.env.BASE_URL}images/crescent-moon.png`} 
            className="w-[20vw] h-[20vw] object-contain drop-shadow-[0_0_50px_rgba(201,168,76,0.8)]"
            alt="Crescent"
          />
        </motion.div>

        <motion.div
          className="font-display text-[6vw] tracking-[0.4em] text-white uppercase text-center ml-[0.4em]"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          Anssam
        </motion.div>

        <motion.p
          className="font-body text-[2vw] text-[var(--color-accent)] mt-8 font-light tracking-wide"
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={phase >= 3 ? { opacity: 1, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          L'intelligence au service de la spiritualité
        </motion.p>
        
      </div>
    </motion.div>
  );
}
