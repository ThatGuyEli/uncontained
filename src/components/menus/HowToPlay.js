import React, { useState } from 'react';

// Component imports
import * as Utils from './Utils.js';
import BackToMain from './BackToMain.js';
import Subtitle from './Subtitle.js';

/**
 * Functional React Component. This generates the How To Play
 * page of the game.
 * 
 * @returns The JSX of the How To Play page.
 */
export default function HowToPlay() {
  // By default, use character.json.
  const [help, setHelp] = useState(
    require(`../../data/howtoplay/character.json`)
  );

  // A simple helper method to generate sections of the menu.
  function generateSections() {
    return help.sections.map((section) => {
      return (
        <div key={section.id}>
          <div className='help-subheader center-children'>{section.subheading}</div>
          <div className='help-text'>{section.text}</div>
        </div>
      );
    });
  }

  return (
    <>
      <Subtitle text='How to Play' className='red standard-border' />

      {/* Level Selector */}
      <div className='list-button-container orange standard-border'>
        {/* The state mutator is passed so that onClick these buttons switch the selected level. */}
        {Utils.generateButtons('howtoplay', 'red', setHelp)}
      </div>

      <div className='content orange standard-border'>
        <div className='content-title red standard-border center-children'>
          {help.name}
        </div>
        <div className='content-body gray standard-border'>
          {generateSections()}
        </div>
      </div>

      <BackToMain />
    </>
  );
}
