import React from 'react';

export default function DifficultyBar({ difficulty }) {
  // A percent of the bar, where 100% is a fully filled in bar.
  const style = {
    width: `${difficulty}%`,
  };

  return (
    <>
      <div className='difficulty-text center-children'>Difficulty:</div>
      <div className='difficulty-outer gray standard-border'>
        <div className='difficulty-inner' style={style}>
        </div>
      </div>
    </>
  );
}
