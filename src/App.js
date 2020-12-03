// Imports
import React, { Component } from 'react';
import { Route, HashRouter as Router } from 'react-router-dom';

// Component Imports
import Level from './components/game/Level.js';
import MainMenu from './components/menus/MainMenu.js';
import LevelSelect from './components/menus/LevelSelect.js';
import HowToPlay from './components/menus/HowToPlay.js';
import Leaderboard from './components/menus/Leaderboard.js';
import './css/Global.css';

/**
 * The component that holds all of the other components,
 * and promptly named App.
 * @extends Component
 */
class App extends Component {
  /**
   * Rendering method.
   *
   * @returns JSX that represents the game.
   */
  render() {
    return (
      <Router>
        <Route exact path='/'             component={MainMenu} />
        <Route exact path='/level-select' component={LevelSelect} />
        <Route exact path='/how-to-play'  component={HowToPlay} />
        <Route exact path='/leaderboard'  component={Leaderboard} />
        <Route exact path='/level'        render={() => <Level id='4' />} />
      </Router>
    );
    // The /level Route is temporary
  }
}

export default App;
