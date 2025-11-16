// src/pages/Splash/index.tsx
import { useEffect, useState } from 'react';
import loadingGif from '@/assets/gifs/loading.gif';
import './Splash.css';

export function Splash() {
  const [fadeOut, setFadeOut] = useState(false);

  // purely visual: start fade-out after 3.5s (so total visible ≈ 4s including fade)
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 3600);

    return () => clearTimeout(fadeTimer);
  }, []);

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`} role="status" aria-live="polite">
      <div className="splash-content">
        <img
          src={loadingGif}
          alt="Loading..."
          className="splash-gif"
          // ensure the GIF is treated as block-level and centered
          style={{ display: 'block', margin: '0 auto' }}
        />
        <h1 className="splash-title">Je te crois</h1>
      </div>
    </div>
  );
}
