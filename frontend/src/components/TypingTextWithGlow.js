import React, { useRef } from 'react';
import { useTypingAnimation } from '../hooks/useTypingAnimation';
import { useMouseGlow } from '../hooks/useMouseGlow';

/** Text with smooth mouse-tracking glow. Optional typing animation. */
export default function TypingTextWithGlow({
  text,
  typing = false,
  typingInterval = 120,
  typingPauseMs = 1000,
  className = '',
  glowClassName = 'typing-glow',
  textClassName = '',
  glowInsideText = true,
  as: Component = 'span',
}) {
  const textRef = useRef(null);
  const displayed = useTypingAnimation(text, {
    interval: typingInterval,
    pauseAfterClearMs: typingPauseMs,
  });
  const { containerRef, glowRef, isHovering } = useMouseGlow({
    mode: glowInsideText ? 'text' : 'div',
    coordinateRef: glowInsideText ? textRef : undefined,
  });

  const content = typing ? displayed : text;

  return (
    <Component
      ref={containerRef}
      className={`typing-with-glow ${glowInsideText ? 'typing-glow-inside-text' : ''} ${className}`.trim()}
      data-hover={isHovering ? '' : undefined}
    >
      {!glowInsideText && (
        <span
          ref={glowRef}
          className={glowClassName}
          style={{ opacity: isHovering ? 1 : 0 }}
          aria-hidden="true"
        />
      )}
      <span ref={textRef} className={`typing-text ${textClassName}`.trim()}>
        {content}
        {typing && <span className="typing-cursor" aria-hidden="true">|</span>}
      </span>
    </Component>
  );
}
