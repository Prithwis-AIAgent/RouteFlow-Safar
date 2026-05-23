'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if user has already seen the splash screen in this session
    const hasSeenSplash = sessionStorage.getItem('safar_splash_seen');
    if (hasSeenSplash) {
      setVisible(false);
      return;
    }

    // Smooth loading progress simulation
    const totalDuration = 2400; // ms
    const intervalTime = 30; // ms
    const increment = 100 / (totalDuration / intervalTime);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    // Start fade out transition
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Completely unmount splash screen component
    const removeTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('safar_splash_seen', 'true');
    }, 3000);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#07111f] transition-opacity duration-500 ease-in-out ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Cinematic Gradient Background Aura */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-[35rem] h-[35rem] bg-blue-600/10 rounded-full blur-[120px] animate-[pulse_6s_infinite]" />
        <div className="absolute bottom-[20%] right-[10%] w-[35rem] h-[35rem] bg-cyan-500/10 rounded-full blur-[120px] animate-[pulse_6s_infinite_2s]" />
      </div>

      {/* Floating Sparkle Particles */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-400 blur-[0.5px]"
            style={{
              width: `${Math.random() * 3 + 2}px`,
              height: `${Math.random() * 3 + 2}px`,
              top: `${Math.random() * 90 + 5}%`,
              left: `${Math.random() * 90 + 5}%`,
              animation: `float-particle ${Math.random() * 8 + 12}s linear infinite`,
              animationDelay: `${Math.random() * -6}s`,
            }}
          />
        ))}
      </div>

      {/* Main Branding Card */}
      <div className="flex flex-col items-center space-y-9 z-10">
        {/* Glowing Logo Container */}
        <div className="relative flex items-center justify-center w-36 h-36 sm:w-40 sm:h-40 rounded-[2.5rem] bg-[#0c1c33]/80 border border-slate-800/80 p-6 shadow-[0_20px_50px_rgba(7,17,31,0.6)] backdrop-blur-md animate-[reveal_1.2s_ease-out_forwards,float_3s_ease-in-out_infinite_1.2s]">
          {/* Subtle Glowing Aura */}
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-primary/30 to-cyan-400/20 blur-xl opacity-75 animate-[glowPulse_3s_infinite_alternate]" />
          
          <Image
            src="/logo.png"
            alt="Safar Logo"
            width={120}
            height={120}
            className="w-full h-full object-contain relative z-10"
            priority
          />
        </div>

        {/* Text Presentation */}
        <div className="text-center space-y-2 animate-[reveal_1.2s_ease-out_0.2s_forwards] opacity-0">
          <h1 className="text-4xl font-extrabold tracking-wider bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Safar
          </h1>
          <p className="text-xs font-semibold text-cyan-400/80 tracking-[0.25em] uppercase">
            Smart Route Planner
          </p>
        </div>

        {/* Premium Loading Progress Bar */}
        <div className="w-48 h-[3px] bg-slate-800/80 rounded-full overflow-hidden relative animate-[reveal_1.2s_ease-out_0.4s_forwards] opacity-0">
          <div
            className="h-full bg-gradient-to-r from-primary via-blue-500 to-cyan-400 rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_#06b6d4]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
