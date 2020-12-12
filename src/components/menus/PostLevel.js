import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

// Component imports
import Subtitle from './Subtitle.js';
import PostLevelButton from './PostLevelButton.js';
import * as Utils from './Utils.js';

/**
 * Functional React Component.
 * The Post Level, which displays after the user has completed a level.
 *
 * @param {object} props The properties to pass to the Post Level.
 *
 * @returns JSX that represents the Post Level page.
 */
export default function PostLevel({ preloadLevelId }) {
  const history = useHistory();

  // By default, the score is -1 to prevent saving a score multiple
  // times.
  const [score, setScore] = useState(-1);
  const [level, setLevel] = useState(
    require(`../../data/levels/level${preloadLevelId}.json`)
  );

  // Similar to Leaderboard, change the levelid based on the history.
  useEffect(() => {
    const loc = history.location;
    if (loc.hasOwnProperty('level') && loc.hasOwnProperty('score')) {
      setScore(loc.score);
      setLevel(loc.level);
    }
  }, [history.location]);

  // Re-add the escape-to-close, because the game overrode it.
  useEffect(() => {
    document.onkeydown = (e) => {
      if (e.key === 'Escape') window.close();
    };
  }, []);

  // A central state for the initials textbox.
  const [initials, setInitials] = useState('');

  // Prevent a user from refreshing (the score would be -1) and making entries.
  // Because a user can never get a real score of -1, this ensures that even a
  // score of 0 can be entered.
  const [hasSaved, setHasSaved] = useState(false);
  useEffect(() => {
    setHasSaved(score === -1);
  }, [score]);

  // Simple helper method to save the leaderboard entry.
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

          {/* A way for the user to enter their initials. */}
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

        {/* Various Links */}
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
