import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LoadingScreenProps {
  onComplete: () => void;
  isLoading: boolean;
}

const SHATTER_PIECES = [
  'polygon(50% 50%, 0% 0%, 30% 0%)',
  'polygon(50% 50%, 30% 0%, 70% 0%)',
  'polygon(50% 50%, 70% 0%, 100% 0%)',
  'polygon(50% 50%, 100% 0%, 100% 40%)',
  'polygon(50% 50%, 100% 40%, 100% 80%)',
  'polygon(50% 50%, 100% 80%, 100% 100%)',
  'polygon(50% 50%, 100% 100%, 60% 100%)',
  'polygon(50% 50%, 60% 100%, 20% 100%)',
  'polygon(50% 50%, 20% 100%, 0% 100%)',
  'polygon(50% 50%, 0% 100%, 0% 60%)',
  'polygon(50% 50%, 0% 60%, 0% 0%)',
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, isLoading }) => {
  const [phase, setPhase] = useState<'loading' | 'cracking' | 'shattering' | 'flash' | 'done'>('loading');

  useEffect(() => {
    // Only transition if external loading is done
    if (!isLoading && phase === 'loading') {
      setTimeout(() => setPhase('cracking'), 500); // Small delay to let user see paw
    }
  }, [isLoading, phase]);

  useEffect(() => {
    if (phase === 'cracking') {
      setTimeout(() => setPhase('shattering'), 300);
    } else if (phase === 'shattering') {
      setTimeout(() => setPhase('flash'), 800);
    } else if (phase === 'flash') {
      setTimeout(() => {
        setPhase('done');
        onComplete();
      }, 1000);
    }
  }, [phase, onComplete]);

  if (phase === 'done') return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-white">
      {/* Background container that is black during loading, then pieces fly apart */}
      <AnimatePresence>
        {(phase === 'loading' || phase === 'cracking' || phase === 'shattering') && (
          <div className="absolute inset-0 bg-white">
            {SHATTER_PIECES.map((clipPath, i) => {
              // Calculate a vector outward from center
              const cx = (parseInt(clipPath.match(/(\d+)%/g)![2]) + parseInt(clipPath.match(/(\d+)%/g)![4])) / 2;
              const cy = (parseInt(clipPath.match(/(\d+)%/g)![3]) + parseInt(clipPath.match(/(\d+)%/g)![5])) / 2;
              const vx = cx - 50;
              const vy = cy - 50;
              
              return (
                <motion.div
                  key={i}
                  className="absolute inset-0 bg-black"
                  style={{ clipPath }}
                  initial={{ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }}
                  animate={
                    phase === 'shattering' 
                    ? {
                        x: vx * 10,
                        y: vy * 10,
                        scale: 0.8,
                        rotate: (Math.random() - 0.5) * 40,
                        opacity: 0,
                      } 
                    : { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }
                  }
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  {/* Inside each black piece, we can duplicate the loading paw so it cracks nicely, but simpler is just black chunks */}
                </motion.div>
              );
            })}

            {/* Static black overlay before shatter so seams aren't visible */}
            {phase === 'loading' && <div className="absolute inset-0 bg-black" />}

            {/* Cracks SVG overlay */}
            {phase === 'cracking' && (
               <motion.svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                 <motion.path 
                   d="M50,50 L35,35 L20,0 M50,50 L65,40 L80,0 M50,50 L80,50 L100,50 M50,50 L75,75 L80,100 M50,50 L30,65 L20,100 M50,50 L20,55 L0,50 M50,50 L25,35 L10,20 M50,50 L70,55 L90,80 M50,50 L60,10 L70,0" 
                   stroke="white" 
                   strokeWidth="0.5" 
                   fill="none"
                   initial={{ pathLength: 0, opacity: 1 }}
                   animate={{ pathLength: 1, opacity: 1 }}
                   transition={{ duration: 0.3 }}
                 />
                 <motion.circle 
                   cx="50" cy="50" r="1.5" fill="white" 
                   initial={{ scale: 0, opacity: 1 }}
                   animate={{ scale: 15, opacity: 0 }}
                   transition={{ duration: 0.4 }}
                 />
               </motion.svg>
            )}

            {/* The Bear Paw & Circles inside the center */}
            <AnimatePresence>
              {phase === 'loading' && (
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                  exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative w-64 h-64 flex items-center justify-center">
                    
                    {/* Swirling Circles */}
                    <svg className="absolute inset-0 w-full h-full animate-spin-slow" style={{ transformOrigin: '50% 50%' }} viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                      <circle cx="100" cy="100" r="90" fill="none" stroke="white" strokeWidth="6" strokeDasharray="150 400" strokeLinecap="round" className="animate-spin-reverse-fast" style={{ transformOrigin: '50% 50%' }} />
                      <circle cx="100" cy="100" r="75" fill="none" stroke="white" strokeWidth="3" strokeDasharray="50 400" strokeLinecap="round" className="animate-spin-fast" style={{ transformOrigin: '50% 50%' }} />
                    </svg>

                    {/* Glowing Paw */}
                    <motion.svg 
                      width="120" height="120" viewBox="0 0 200 200" 
                      className="drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                      animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {/* Pad */}
                      <path d="M 100,160 C 40,160 30,100 60,85 C 75,75 85,85 100,75 C 115,85 125,75 140,85 C 170,100 160,160 100,160 Z" fill="white"/>
                      
                      {/* Toes */}
                      <ellipse cx="35" cy="75" rx="10" ry="16" transform="rotate(-40 35 75)" fill="white"/>
                      <ellipse cx="65" cy="50" rx="12" ry="18" transform="rotate(-15 65 50)" fill="white"/>
                      <ellipse cx="100" cy="40" rx="12" ry="20" fill="white"/>
                      <ellipse cx="135" cy="50" rx="12" ry="18" transform="rotate(15 135 50)" fill="white"/>
                      <ellipse cx="165" cy="75" rx="10" ry="16" transform="rotate(40 165 75)" fill="white"/>

                      {/* Claws */}
                      <path d="M 30,55 Q 22,40 10,25 Q 30,35 38,50 Z" fill="white"/>
                      <path d="M 60,30 Q 55,15 45,5 Q 65,15 70,28 Z" fill="white"/>
                      <path d="M 95,20 Q 100,5 100,-5 Q 100,5 105,20 Z" fill="white"/>
                      <path d="M 140,30 Q 145,15 155,5 Q 135,15 130,28 Z" fill="white"/>
                      <path d="M 170,55 Q 178,40 190,25 Q 170,35 162,50 Z" fill="white"/>
                    </motion.svg>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>

      {/* The Flash overlay (Fades out to reveal app) */}
      <AnimatePresence>
         {(phase === 'flash' || phase === 'shattering') && (
            <motion.div 
               className="absolute inset-0 bg-white z-[9000] pointer-events-none"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.8 }}
            />
         )}
      </AnimatePresence>
    </div>
  );
};
