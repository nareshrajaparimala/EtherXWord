import React from 'react';
import './ProfileBox.css';

const ProfileBox = ({ 
  text, 
  size = 52, 
  className = '', 
  onClick = null,
  style = {} 
}) => {
  const displayText = text ? text.charAt(0).toUpperCase() : 'U';
  
  return (
    <div 
      className={`profile-box ${className}`}
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size * 0.38}px`,
        ...style
      }}
    >
      {displayText}
    </div>
  );
};

export default ProfileBox;