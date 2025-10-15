import React from 'react';
import logoImage from '../assets/EtherX_word_logo.png';
import './Logo.css';

const Logo = ({ size = 32, className = '' }) => {
  return (
    <div className={`logo-wrapper ${className}`}>
      <img 
        src={logoImage}
        alt="EtherXWord Logo"
        width={size}
        height={size}
        className="logo-image"
      />
    </div>
  );
};

export default Logo;