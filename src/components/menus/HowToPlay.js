import React/*, { useState }*/ from 'react'

// Component imports
//import * as Utils from './Utils.js';
import BackToMain from './BackToMain.js';
import Subtitle from './Subtitle.js';

export default function HowToPlay() {
  //const [selectedLevel, setSelectedLevel] = useState(
  //  require(`../../data/levels/level${preloadLevelId}.json`)
  //);
  return (
    <div>
      <Subtitle text='How to Play' className='red standard-border'/>

      {/* Level Selector */}
      <div className='list-button-container orange standard-border'>
        {/* The state mutator is passed so that onClick these buttons switch the selected level. */}
        {/*Utils.generateLevelButtons(setSelectedLevel)*/}
      </div>

      <div className='content orange standard-border'>

      </div>

      <BackToMain />
    </div>
  )
}
