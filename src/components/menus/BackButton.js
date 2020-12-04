import React from 'react';
import { Link } from 'react-router-dom';

export default function BackButton({ url }) {
  return (
    <Link to={url} className='back-text link-text'>
      <div className='back-container orange standard-border div-hover'>
        <span className='center'>Back</span>
      </div>
    </Link>
  );
}
