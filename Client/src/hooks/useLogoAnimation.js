import { useState, useEffect } from 'react';

export const useLogoAnimation = () => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start animation every 3 minutes (180000ms)
    const animationInterval = setInterval(() => {
      setIsAnimating(true);
      
      // Stop animation after 3 seconds
      setTimeout(() => {
        setIsAnimating(false);
      }, 3000);
    }, 180000); // 3 minutes

    // Cleanup interval on unmount
    return () => clearInterval(animationInterval);
  }, []);

  return isAnimating;
};