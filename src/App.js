import React, { Component } from 'react';
import './css/App.css';

// Component Imports
import Game from './components/Game.js';

class App extends Component {
  render() {
    return (
      // This is where the App is stored.
      <Game level='1' />
    );
  }
}

export default App;
