import React from 'react';
import { Link } from 'react-router-dom'

/**
 * Functional React Component. This displays when the user
 * has run out of lives, prompting the user to restart or go to the main menu.
 * 
 * @returns JSX that represents a failed level menu.
 */
export default function LevelFailedMenu() {
  return (
    <div className='level-failed-menu orange standard-border center'>
      <div className='level-failed-text gray standard-border center-children'>
        Out of Lives...
      </div>
      <div
        onClick={() => window.location.reload(true)}
        className='level-failed-text blue standard-border center-children div-hover'
      >
        Restart
      </div>
      <Link to='/' className='link-text'>
        <div className='level-failed-text purple standard-border center-children div-hover'>
          Main Menu
        </div>
      </Link>
    </div>
  );
}
