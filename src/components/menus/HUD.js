import React from 'react';

export default function HUD({ score, togglePause, lives }) {
  return (
    <div className='hud orange standard-border'>
      <div className='hud-text gray standard-border center-children' onClick={togglePause}>Pause</div>
      <div className='hud-text blue standard-border center-children'>Score:{score}</div>
      <div className='hud-text purple standard-border center-children'>Lives: {lives}</div>
    </div>
  );
}
