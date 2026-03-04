import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './PageTransitionLoader.css';

const RUNNER_DISPLAY_MS = 500;

/** Running-themed loader shown during page transitions */
function RunningAnimation() {
  return (
    <div className="ptl-runner" aria-hidden="true">
      <div className="ptl-runner-figure">
        <div className="ptl-runner-head" />
        <div className="ptl-runner-body" />
        <div className="ptl-runner-leg ptl-runner-leg-front" />
        <div className="ptl-runner-leg ptl-runner-leg-back" />
        <div className="ptl-runner-arm ptl-runner-arm-front" />
        <div className="ptl-runner-arm ptl-runner-arm-back" />
      </div>
      <div className="ptl-track">
        <div className="ptl-track-line" />
        <div className="ptl-track-line" />
        <div className="ptl-track-line" />
      </div>
      <p className="ptl-label">Loading...</p>
    </div>
  );
}

export default function PageTransitionLoader() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const prevPathRef = useRef(location.pathname);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (location.pathname === prevPathRef.current) return;
    prevPathRef.current = location.pathname;

    setVisible(true);
    setAnimating(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setAnimating(false);
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
        timeoutRef.current = null;
      }, 300);
    }, RUNNER_DISPLAY_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div
      className={`ptl-overlay ${animating ? 'ptl-overlay--active' : 'ptl-overlay--fade'}`}
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <RunningAnimation />
    </div>
  );
}
