import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Necessary utility
import * as Utils from './Utils.js';
import BackToMain from './BackToMain.js';
import Subtitle from './Subtitle.js';

export default function LevelSelect() {
  // By default, use level1's data.
  const [selectedLevel, setSelectedLevel] = useState(
    require('../../data/levels/level1.json')
  );

  //useEffect(() => {
  //  
  //}, [selectedLevel]);

  return (
    <div>
      <BackToMain />

      {/* Level Selector */}
      <div className='list-button-container orange standard-border'>
        {Utils.generateLevelButtons(setSelectedLevel)}
      </div>

      <Subtitle text='Level Select' className='blue standard-border' />

      <div className='content orange standard-border'>
        <div className='content-title blue standard-border'>{selectedLevel.name}</div>
        <Link to={`/levels/level${selectedLevel.id}`}>{selectedLevel.id}</Link>
      </div>
    </div>
  );
}
