import { useState, useEffect } from 'react';

export const useTrafficLightEffect = () => {
  const [activeBox, setActiveBox] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const scheduleNext = (currentBox: number) => {
      // Fourth box (index 3) stays lit for 2000ms, others for 800ms
      const delay = currentBox === 3 ? 2000 : 800;
      
      timeoutId = setTimeout(() => {
        setActiveBox((prev) => {
          const next = prev < 3 ? prev + 1 : 0;
          scheduleNext(next);
          return next;
        });
      }, delay);
    };

    // Start the cycle
    scheduleNext(0);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return activeBox;
};