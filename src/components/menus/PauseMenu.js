import React from 'react';
import { Link } from 'react-router-dom';

export default function PauseMenu({ unpause }) {
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
      <div className='pause-buttons'>
        <PauseButton text='Resume' color='blue' onClick={unpause} />

        {/* Although this function is deprecated when passing whether or not to
        force it, it is necessary here so that the state is reloaded from file. */}
        <PauseButton
          text='Restart'
          color='red'
          onClick={() => window.location.reload(true)}
        />
        <Link to='/' className='link-text'>
          <PauseButton text='Exit to Main Menu' color='purple' />
        </Link>
        <PauseButton text='Exit Game' color='orange' onClick={window.close}/>
      </div>
    </div>
  );
}
