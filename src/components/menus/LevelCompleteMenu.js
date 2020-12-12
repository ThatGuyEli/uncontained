import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Functional React Component. The LevelCompleteMenu displays after the
 * level is won, and directs the user to the PostLevel.
 * 
 * @param {object} props The properties to pass to the LevelCompleteMenu.
 * 
 * @returns JSX that represents the LevelCompleteMenu.
 */
export default function LevelCompleteMenu({ score, level }) {
  const to = {
    pathname: '/post-level',
    score: score,
    level: level,
  };

  return (
    <div className='level-complete-menu orange standard-border center'>
      <div className='level-complete-text gray standard-border center-children'>
        Level Complete!
      </div>
      <Link to={to} className='link-text'>
        <div className='level-complete-text blue standard-border center-children div-hover'>
          Continue
        </div>
      </Link>
    </div>
  );
}
