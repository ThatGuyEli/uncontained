import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Functional React Component.
 * A button included in the Post Level. These link to various pages of the game.
 * 
 * @param {object} props The properties to pass to the PostLevelButton.
 * 
 * @returns JSX that represents a link button in the Post Level page.
 */
export default function PostLevelButton({ url, selectedLevel, color, text }) {
  return (
    <Link
      to={{ pathname: url, selectedLevel: selectedLevel }}
      className='center-children link-text'
    >
      <div
        className={`${color} post-level-button center-children standard-border div-hover`}
      >
        {text}
      </div>
    </Link>
  );
}
