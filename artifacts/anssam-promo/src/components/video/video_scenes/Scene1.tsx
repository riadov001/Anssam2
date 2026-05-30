import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene1() {
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
      {...sceneTransitions.fadeBlur}
    >
      <div className="absolute inset-0">
         <img 
            src={`${import.meta.env.BASE_URL}images/geometric-pattern.png`}
            className="w-full h-full object-cover opacity-20"
         />
      </div>

      <div className="flex flex-col items-center justify-center z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
          animate={phase >= 1 ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-12"
        >
           <img 
            src={`${import.meta.env.BASE_URL}images/crescent-moon.png`} 
            className="w-48 h-48 object-contain drop-shadow-[0_0_30px_rgba(201,168,76,0.5)]"
            alt="Crescent"
          />
        </motion.div>

        <motion.h1 
          className="font-arabic text-[12vw] text-gradient-gold leading-none drop-shadow-2xl"
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          animate={phase >= 2 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          أنسام
        </motion.h1>

        <motion.div
          className="font-display text-[3vw] tracking-[0.5em] text-white mt-8 uppercase"
          initial={{ opacity: 0, letterSpacing: '1em' }}
          animate={phase >= 3 ? { opacity: 1, letterSpacing: '0.5em' } : {}}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          Anssam
        </motion.div>
      </div>
    </motion.div>
  );
}
