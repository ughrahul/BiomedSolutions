"use client";

import { useEffect } from 'react';

export default function FontLoader() {
  useEffect(() => {
    // Check if fonts are already loaded to prevent duplicates
    const fontsAlreadyLoaded = document.querySelectorAll('link[href*="fonts.googleapis.com"]').length > 0;
    
    if (fontsAlreadyLoaded) {
      return;
    }

    // Load fonts after component mounts
    const loadFonts = () => {
      // Load Inter font
      const interLink = document.createElement('link');
      interLink.rel = 'stylesheet';
      interLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      interLink.crossOrigin = 'anonymous';
      document.head.appendChild(interLink);

      // Load Poppins font
      const poppinsLink = document.createElement('link');
      poppinsLink.rel = 'stylesheet';
      poppinsLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
      poppinsLink.crossOrigin = 'anonymous';
      document.head.appendChild(poppinsLink);

      // Load Space Grotesk font (if needed)
      const spaceGroteskLink = document.createElement('link');
      spaceGroteskLink.rel = 'stylesheet';
      spaceGroteskLink.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap';
      spaceGroteskLink.crossOrigin = 'anonymous';
      document.head.appendChild(spaceGroteskLink);
    };

    // Small delay to ensure DOM is ready and preloads are processed
    const timer = setTimeout(loadFonts, 200);
    
    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
}
