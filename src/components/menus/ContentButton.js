import React from 'react';
import { Link } from 'react-router-dom';

export default function ContentButton({ url, selectedLevel, color, text }) {
  return (
    <Link
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
