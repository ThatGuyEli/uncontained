// Imports
import React, { Component } from 'react';
import './css/App.css';
import Level from './components/Level.js';

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
      <Level id='2' />
    );
  }
}

export default App;
