import React from 'react';
import { Logo as LogoJsx } from './Logo.jsx';

export interface LogoProps {
  variant?: 'full' | 'mini-lumia' | 'mini-text' | 'icon-only';
  background?: 'transparent' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
  priority?: boolean;
}

export const Logo: React.FC<LogoProps> = (props) => {
  return <LogoJsx {...props} />;
};

export default Logo;
