// Imports
import React, { Component } from 'react';
import { Route, HashRouter as Router } from 'react-router-dom';

// Component Imports
import Level from './components/game/Level.js';
import MainMenu from './components/menus/MainMenu.js';

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
    //return <Level id='4' />;
    return (
      <Router>
        <Route path='/' exact component={MainMenu} />
        <Route path='/level' exact render={() => <Level id='4' />} />
      </Router>
    );
  }
}

export default App;
