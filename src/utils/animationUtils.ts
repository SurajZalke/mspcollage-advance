
import React from 'react';

// 3D card tilt effect
export const use3DTilt = () => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    card.style.transition = 'transform 0.1s ease-out';
  };
  
  const resetTilt = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    cardRef.current.style.transition = 'transform 0.5s ease-out';
  };
  
  return { cardRef, handleMouseMove, resetTilt };
};

// Staggered animation for lists
export const getStaggeredAnimation = (index: number, baseDelay: number = 0.1) => {
  return {
    animationDelay: `${baseDelay * index}s`,
  };
};
