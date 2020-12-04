import React, { useEffect, useState } from 'react';

// Component imports
import * as Utils from './Utils.js';
import BackToMain from './BackToMain.js';
import Subtitle from './Subtitle.js';
import { useHistory } from 'react-router-dom';

export default function Leaderboard({ preloadLevelId }) {
  const history = useHistory();
  const [selectedLevel, setSelectedLevel] = useState(
    require(`../../data/levels/level${preloadLevelId}.json`)
  );

  useEffect(() => {
    if (history.location.hasOwnProperty('selectedLevel')) {
      setSelectedLevel(history.location.selectedLevel);
    }
  }, [history.location]);

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
      </div>

      <BackToMain />
    </div>
  );
}
