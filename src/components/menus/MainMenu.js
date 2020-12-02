import React from 'react';
import { Link } from 'react-router-dom';

export default function MainMenu() {
  return (
    <div className='test'>
      <nav>
        <ul>
          <li>
            <Link to='/level'>Level 4</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
