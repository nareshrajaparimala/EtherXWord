import React from 'react';
import './LoadingPage.css';

const LoadingPage = () => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        {/* Logo Animation */}
        <div className="logo-container">
          <div className="logo-text">
            <span className="letter">E</span>
            <span className="letter">t</span>
            <span className="letter">h</span>
            <span className="letter">e</span>
            <span className="letter">r</span>
            <span className="letter">X</span>
            <span className="letter">W</span>
            <span className="letter">o</span>
            <span className="letter">r</span>
            <span className="letter">d</span>
          </div>
          <div className="tagline">Decentralized Document Editor</div>
        </div>

        {/* Loading Animation */}
        <div className="loading-animation">
          <div className="spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <div className="loading-text">Loading...</div>
        </div>

        {/* Floating Particles */}
        <div className="particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;