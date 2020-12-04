import React from 'react';
import { Link } from 'react-router-dom';

export default function ContentButton({ url, color, text }) {
  return (
    <Link to={url} className='link-text center-children'>
      <div className={`${color} link-button center-children standard-border div-hover`}>
        {text}
      </div>
    </Link>
  );
}
