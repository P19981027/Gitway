import { useRef, useEffect, useState } from 'react';

const DIRECTION_CLASS = {
  up: 'animate-fade-in-up',
  down: 'animate-fade-in-up',
  left: 'animate-fade-in-left',
  right: 'animate-fade-in-right',
};

export function AnimatedSection({ direction = 'up', delay = 0, className = '', children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const animationClass = visible ? DIRECTION_CLASS[direction] || DIRECTION_CLASS.up : 'opacity-0';

  const style = delay > 0 ? { animationDelay: `${delay}ms` } : undefined;

  return (
    <div
      ref={ref}
      className={`${animationClass}${className ? ` ${className}` : ''}`}
      style={style}
    >
      {children}
    </div>
  );
}
