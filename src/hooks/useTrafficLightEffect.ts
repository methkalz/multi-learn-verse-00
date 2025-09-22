import { useState, useEffect } from 'react';

export const useTrafficLightEffect = () => {
  const [activeBox, setActiveBox] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const nextBox = () => {
      setActiveBox((prev) => {
        const next = prev < 3 ? prev + 1 : 0;
        
        // Fourth box (index 3) stays lit for 2000ms, others for 800ms
        const delay = prev === 3 ? 2000 : 800;
        timeoutId = setTimeout(nextBox, delay);
        
        return next;
      });
    };

    // Start the cycle
    timeoutId = setTimeout(nextBox, 800);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return activeBox;
};