import React from 'react';
import { Link } from 'react-router-dom';

/**
 * A pause menu during the game. This displays when the user has paused the
 * game.
 *
 * @param {object} props The properties to pass to the pause menu.
 *
 * @returns JSX that represents the pause menu.
 */
export default function PauseMenu({ unpause }) {

  // Simple helper method that creates multiple buttons.
  function PauseButton({ text, color, onClick }) {
    return (
      <div
        className={`pause-button ${color} standard-border center-children div-hover`}
        onClick={onClick}
      >
        {text}
      </div>
    );
  }

  return (
    <div className='pause orange standard-border center'>
      <div className='pause-title gray standard-border center-children'>
        Paused
      </div>

      {/* Various buttons, such as resume and restart. */}
      <div className='pause-buttons'>
        <PauseButton text='Resume' color='blue' onClick={unpause} />

        {/* Although this function is deprecated when passing whether or not to
        force it, it is necessary here so that the state is reloaded from file. 
        */}
        <PauseButton
          text='Restart'
          color='red'
          onClick={() => window.location.reload(true)}
        />
        <Link to='/' className='link-text'>
          <PauseButton text='Exit to Main Menu' color='purple' />
        </Link>
        <PauseButton text='Exit Game' color='orange' onClick={window.close} />
      </div>
    </div>
  );
}
