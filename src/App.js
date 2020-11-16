import React, { Component } from 'react';
import './css/App.css';

// Component Imports
import Level from './components/Level.js';

class App extends Component {
  render() {
    return (
      // This is where the App is stored.
      <Level id='1' />
    );
  }
}

export default App;
