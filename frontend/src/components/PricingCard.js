import React from 'react';
import { useMouseGlow } from '../hooks/useMouseGlow';

export default function PricingCard({ tier, isSelected, onCardClick, children }) {
  const { containerRef, glowRef, isHovering } = useMouseGlow({ mode: 'div' });
  const glowClass = isSelected ? 'pp-card-glow pp-card-glow-selected' : 'pp-card-glow';

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      className={`pp-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onCardClick(tier)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onCardClick(tier)}
      aria-pressed={isSelected}
      aria-label={`Select ${tier.name} plan`}
    >
      <span
        ref={glowRef}
        className={glowClass}
        style={{ opacity: isHovering ? 1 : 0 }}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
