import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Functional React Component. Creates a button for the content of a page
 * that links to some other page.
 * 
 * @param {object} props Properties to configure the button with.
 * 
 * @returns JSX that represents a link button within the content of a page.
 */
export default function ContentButton({ url, selectedLevel, color, text }) {
  return (
    <Link
    // The selected level is for sending the user to the leaderboard of
    // the selected level.
      to={{ pathname: url, selectedLevel: selectedLevel }}
      className='link-text center-children'
    >
      <div
        className={`${color} link-button center-children standard-border div-hover`}
      >
        {text}
      </div>
    </Link>
  );
}
