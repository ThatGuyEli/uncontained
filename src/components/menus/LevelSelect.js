import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Necessary utility
import * as Utils from './Utils.js';
import BackButton from './BackButton.js';
import Subtitle from './Subtitle.js';
import DifficultyBar from './DifficultyBar.js';
import ContentButton from './ContentButton.js';

export default function LevelSelect({ preloadLevelId }) {
  // By default, use level1's data. This is passed from App.js.
  const [selectedLevel, setSelectedLevel] = useState(
    require(`../../data/levels/level${preloadLevelId}.json`)
  );

  return (
    <div>
      <Subtitle text='Level Select' className='blue standard-border' />

      {/* Level Selector */}
      <div className='list-button-container orange standard-border'>
        {/* The state mutator is passed so that onClick these buttons switch the selected level. */}
        {Utils.generateLevelButtons(setSelectedLevel)}
      </div>

      <div className='content orange standard-border'>
        {/* Level Name. Does not have enough subcomponents to make into a full component. */}
        <div className='content-title blue standard-border center-children'>
          {selectedLevel.name}
        </div>

        <DifficultyBar difficulty={selectedLevel.difficulty} />

        {/* Level Description. Does not have enough subcomponents to make into a full component. */}
        <div className='level-description gray standard-border center-children'>
          {selectedLevel.description}
        </div>

        <div className='content-buttons'>
          <ContentButton url='/leaderboard' color='purple' text='Leaderboard' />
          <ContentButton url={`/levels/level${selectedLevel.id}`} color='blue' text='Play' />          
        </div>
      </div>

      <BackButton url='/' />
    </div>
  );
}
