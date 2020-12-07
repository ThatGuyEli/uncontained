// Imports
import React, { Component } from 'react';
import { Route, HashRouter as Router } from 'react-router-dom';

// Component Imports
import MainMenu from './components/menus/MainMenu.js';
import LevelSelect from './components/menus/LevelSelect.js';
import HowToPlay from './components/menus/HowToPlay.js';
import Leaderboard from './components/menus/Leaderboard.js';
import PostLevel from './components/menus/PostLevel.js';
import * as Utils from './components/menus/Utils.js';
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
        <Route exact path='/' component={MainMenu} />
        <Route
          exact
          path='/level-select'
          render={() => <LevelSelect preloadLevelId='1' />}
        />
        <Route exact path='/how-to-play' component={HowToPlay} />
        <Route
          exact
          path='/leaderboard'
          render={() => <Leaderboard preloadLevelId='1' />}
        />
        <Route
          exact
          path='/post-level'
          /* Although this isn't possible, this is to prevent any possible errors
          from stray links that lead to here. */
          render={() => <PostLevel preloadLevelId='1' />}
        />
        {Utils.generateLevelPages()}
      </Router>
    );
  }
}

export default App;
