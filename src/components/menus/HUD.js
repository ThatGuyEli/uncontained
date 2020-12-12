import React from 'react';

/**
 * A Heads-Up-Display, so that the user can see their lives,
 * score, and pause button.
 * 
 * @param {object} props The properties to pass to the HUD.
 * 
 * @returns JSX that represents the Heads-Up-Display.
 */
export default function HUD({ score, togglePause, lives }) {
  return (
    <div className='hud orange standard-border'>
      <div className='hud-text gray standard-border center-children' onClick={togglePause}>Pause</div>
      <div className='hud-text blue standard-border center-children'>Score:{score}</div>
      <div className='hud-text purple standard-border center-children'>Lives: {lives}</div>
    </div>
  );
}
