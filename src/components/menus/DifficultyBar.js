import React from 'react';

/**
 * Functional React Component. This creates a difficulty bar for
 * the the level, which gets more red the higher the difficulty
 * is.
 * 
 * @param {object} props The properties to pass to this component.
 * 
 * @returns JSX that represents a difficulty bar.
 */
export default function DifficultyBar({ difficulty }) {
  // A percent of the bar, where 100% is a fully filled in bar.
  const style = {
    width: `${difficulty}%`,
  };

  return (
    <>
      <div className='difficulty-text center-children gray standard-border'>
        Difficulty:
      </div>
      <div className='difficulty-outer gray standard-border'>
        <div className='difficulty-inner' style={style}></div>
      </div>
    </>
  );
}
