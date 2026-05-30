import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => setPhase(4), 8500), // exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center z-10"
      {...sceneTransitions.clipPolygon}
    >
      <div className="absolute inset-0">
        <video 
          src={`${import.meta.env.BASE_URL}videos/mosque-interior.mp4`}
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-dark)] via-transparent to-transparent opacity-90" />
      </div>

      <div className="absolute left-[8vw] top-[30vh] w-[40vw] flex flex-col items-start z-20">
        <motion.div 
          className="w-[3vw] h-[3px] bg-[var(--color-accent)] mb-8"
          initial={{ scaleX: 0, transformOrigin: 'left' }}
          animate={phase >= 1 ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, ease: "circOut" }}
        />
        
        <motion.h2
          className="font-display text-[4vw] text-white leading-tight mb-4 uppercase tracking-wider"
          initial={{ opacity: 0, x: -50 }}
          animate={phase >= 2 ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          Prochaine Prière
        </motion.h2>

        <motion.div
          className="font-arabic text-[6vw] text-gradient-gold mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          المغرب
        </motion.div>

        <motion.div
          className="flex items-center gap-6 font-display text-[5vw] text-white tabular-nums tracking-widest"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <span>01</span>
          <span className="text-[var(--color-accent)] mb-2">:</span>
          <span>45</span>
          <span className="text-[var(--color-accent)] mb-2">:</span>
          <span>12</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
