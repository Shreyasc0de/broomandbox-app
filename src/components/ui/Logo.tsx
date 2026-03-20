import React from 'react';
import logoUrl from '../../assets/logo-removebg-preview.png';

const Logo = ({ className = "h-12 w-auto object-contain" }: { className?: string }) => (
  <img
    src={logoUrl}
    alt="Broom & Box Logo"
    className={className}
  />
);

export default Logo;
