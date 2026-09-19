import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Detects whether the viewport is mobile width (< 768px).
 * Listens for viewport resize changes via matchMedia.
 * @returns {boolean} True if viewport is mobile width
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}
