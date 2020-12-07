import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Subtitle from './Subtitle.js';
import PostLevelButton from './PostLevelButton.js';
import * as Utils from './Utils.js';

export default function PostLevel({ preloadLevelId }) {
  const history = useHistory();
  const [score, setScore] = useState(-1);
  const [level, setLevel] = useState(
    require(`../../data/levels/level${preloadLevelId}.json`)
  );

  useEffect(() => {
    const loc = history.location;
    if (loc.hasOwnProperty('level') && loc.hasOwnProperty('score')) {
      setScore(loc.score);
      setLevel(loc.level);
    }
  }, [history.location]);

  // For input form
  const [initials, setInitials] = useState('');

  // Prevent a user from refreshing (the score would be -1) and making entries.
  // Because a user can never get a real score of -1, this ensures that even a
  // score of 0 can be entered.
  const [hasSaved, setHasSaved] = useState(false);
  useEffect(() => {
    setHasSaved(score === -1);
  }, [score]);

  function saveScore() {
    if (!hasSaved && initials.length === 3) {
      setHasSaved(true);
      Utils.addLeaderboardEntry(level.id, initials, score);
    }
  }

  return (
    <>
      <Subtitle
        text={`Completed: ${level.name}`}
        className='blue standard-border'
      />
      <div className='post-level-container orange standard-border'>
        <div className='post-level-col'>
          <div className='post-level-score blue standard-border center-children'>
            Score: {score}
          </div>
          <div className='post-level-entry gray standard-border'>
            <div className='post-level-entry-title purple standard-border center-children'>
              Initials
            </div>
            <input
              className='gray standard-border'
              type='text'
              id='initials'
              maxLength='3'
              placeholder='AAA'
              value={initials}
              onChange={(e) => {
                setInitials(e.target.value.toUpperCase());
              }}
            />
            <div
              className={`post-level-entry-save 
              ${hasSaved ? 'red' : 'blue'} 
              standard-border 
              div-hover 
              center-children`}
              onClick={saveScore}
            >
              Save
            </div>
          </div>
        </div>
        <div className='post-level-col'>
          <PostLevelButton
            url={`/levels/level${level.id}`}
            color='blue'
            text='Replay'
          />
          <PostLevelButton
            url='/level-select'
            color='blue'
            text='Level Select'
          />
          <PostLevelButton
            url='/leaderboard'
            color='purple'
            text='Leaderboard'
            selectedLevel={level}
          />
          <PostLevelButton url='/' color='gray' text='Main Menu' />
          <div onClick={window.close}>
            <PostLevelButton url='/' color='orange' text='Exit Game' />
          </div>
        </div>
      </div>
    </>
  );
}
