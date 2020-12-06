import React, { useEffect, useState } from 'react';

// Component imports
import * as Utils from './Utils.js';
import BackToMain from './BackToMain.js';
import Subtitle from './Subtitle.js';
import { useHistory } from 'react-router-dom';
import ScoreTable from './ScoreTable.js';

export default function Leaderboard({ preloadLevelId }) {
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

  const [leaderboard, setLeaderboard] = useState([]);
  //if (leaderboard.length === 0) {
  //  Utils.readLeaderboardEntries(selectedLevel.id, setLeaderboard);
  //}

  // When the selected level changes, update the leaderboard.
  useEffect(() => {
    Utils.readLeaderboardEntries(selectedLevel.id, setLeaderboard);
  }, [selectedLevel]);

  return (
    <div>
      <Subtitle text='Leaderboard' className='purple standard-border' />

      {/* Level Selector */}
      <div className='list-button-container orange standard-border'>
        {/* The state mutator is passed so that onClick these buttons switch the selected level. */}
        {Utils.generateLevelButtons('purple', setSelectedLevel)}
      </div>

      <div className='content orange standard-border'>
        {/* Level Name. Does not have enough subcomponents to make into a full component. */}
        <div className='content-title purple standard-border center-children'>
          {selectedLevel.name}
        </div>

        <ScoreTable leaderboard={leaderboard} />
      </div>

      <BackToMain />
    </div>
  );
}
