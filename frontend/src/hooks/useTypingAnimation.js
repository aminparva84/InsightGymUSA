import { useState, useEffect, useRef } from 'react';

export function useTypingAnimation(text, options = {}) {
  const { interval = 120, pauseAfterClearMs = 1000 } = options;

  const [length, setLength] = useState(0);
  const forwardRef = useRef(true);
  const pausedRef = useRef(false);
  const skipFirstRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (pausedRef.current) return;
      if (skipFirstRef.current) {
        skipFirstRef.current = false;
        return;
      }
      setLength((len) => {
        if (forwardRef.current) {
          if (len >= text.length) {
            forwardRef.current = false;
            return len;
          }
          return len + 1;
        } else {
          if (len <= 0) {
            forwardRef.current = true;
            pausedRef.current = true;
            skipFirstRef.current = true;
            setTimeout(() => {
              pausedRef.current = false;
            }, pauseAfterClearMs);
            return 0;
          }
          return len - 1;
        }
      });
    }, interval);
    return () => clearInterval(timer);
  }, [text.length, pauseAfterClearMs, interval]);

  return text.slice(0, length);
}
