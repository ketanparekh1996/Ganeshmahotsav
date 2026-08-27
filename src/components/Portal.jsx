import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const Portal = ({ children }) => {
  const el = useRef(document.createElement('div'));

  useEffect(() => {
    const portal = el.current;
    document.body.appendChild(portal);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.removeChild(portal);
      document.body.style.overflow = '';
    };
  }, []);

  return createPortal(children, el.current);
};

export default Portal;
