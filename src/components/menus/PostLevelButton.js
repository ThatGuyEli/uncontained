import React from 'react';
import { Link } from 'react-router-dom';

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
