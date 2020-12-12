import React, { useEffect, useState } from 'react';

// Component imports
import * as Utils from './Utils.js';
import BackToMain from './BackToMain.js';
import Subtitle from './Subtitle.js';
import { useHistory } from 'react-router-dom';
import ScoreTable from './ScoreTable.js';

/**
 * Functional React Component. This page loads the Leaderboard of
 * any selected level.
 * 
 * @param {object} props The properties to pass to the leaderboard.
 * 
 * @returns JSX that represents the leaderboard page of a selected level.
 */
export default function Leaderboard({ preloadLevelId }) {
  // History is used in the useEffect. See the comments below.
  const history = useHistory();
  const [selectedLevel, setSelectedLevel] = useState(
    require(`../../data/levels/level${preloadLevelId}.json`)
  );

  // When the history changes (ie when this page loads), watch for
  // history.location to change. If it does, check if it was passed
  // a 'selectedLevel'. If it did, set that to the selectedLevel here,
  // because it came from Level Select.
  useEffect(() => {
    if (history.location.hasOwnProperty('selectedLevel')) {
      setSelectedLevel(history.location.selectedLevel);
    }
  }, [history.location]);

  // By default, set a blank leaderboard. This will change when the selected
  // level loads.
  const [leaderboard, setLeaderboard] = useState([]);

  // When the selected level changes, update the leaderboard.
  useEffect(() => {
    Utils.readLeaderboardEntries(selectedLevel.id, setLeaderboard);
  }, [selectedLevel]);

  return (
    <>
      <Subtitle text='Leaderboard' className='purple standard-border' />

      {/* Level Selector */}
      <div className='list-button-container orange standard-border'>
        {/* The state mutator is passed so that onClick these buttons switch
        the selected level. */}
        {Utils.generateButtons('levels', 'purple', setSelectedLevel)}
      </div>

      <div className='content orange standard-border'>
        {/* Level Name. Does not have enough subcomponents to make into a full
        component. */}
        <div className='content-title purple standard-border center-children'>
          {selectedLevel.name}
        </div>

        <ScoreTable leaderboard={leaderboard} />
      </div>

      <BackToMain />
    </>
  );
}
