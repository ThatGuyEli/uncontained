import React, { Component } from 'react';

/**
 * Class that represents the controllable character of the game.
 * @extends Component
 */
class Character extends Component {

  /**
   * When the component mounts, update the style after 10ms
   * to allow the Level to render. Additionally, add the
   * event listener to update this component's style on resize.
   */
  componentDidMount() {
    window.setTimeout(this.props.updateSty, 10);
    window.addEventListener('resize', this.props.updateSty);
  }

  /**
   * When the component is going to unmount, remove the listener
   * from the window. This is to prevent unnecessary calls to
   * no-longer-existing objects.
   */
  componentWillUnmount() {
    window.removeEventListener('resize', this.props.updateSty);
  }

  /**
   * Rendering method.
   * 
   * @returns a div that represents the playable character.
   */
  render() {
    return <div className='Character' style={this.props.selfState.sty}></div>;
  }
}

export default Character;
