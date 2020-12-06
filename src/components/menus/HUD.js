import React from 'react';

export default function HUD({ score, togglePause }) {
  return (
    <div className='hud orange standard-border'>
      <div className='hud-text gray standard-border center-children' onClick={togglePause}>Pause</div>
      <div className='hud-text blue standard-border center-children'>Score:{score}</div>
    </div>
  );
}
