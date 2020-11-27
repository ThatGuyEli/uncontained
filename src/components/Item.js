/*
Item
  - style
    - height
    - width
    - top
    - left
  - type: string
  - activated: boolean
    - toggled for levers/plates
    - collected for collectible
    - isMoving for box
  - isContact(): boolean
    - true if activates on touch
    - false if activates on interaction

Item State
  - style
  - type
  - activated

All items have dimensions [1,1] except for exit, which has dimensions [1,2]
*/
import React, { Component } from 'react';

class Item extends Component {
  constructor(props) {
    super(props);
    if (this.props.itemType === 'exit') this.dimensions = [1, 2];
    else this.dimensions = [1, 1];
  }

  componentDidMount() {
    window.setTimeout(this.updateSty, 11);
    window.addEventListener('resize', this.updateSty);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateSty);
  }

  updateSty = () => {
    this.props.updateSty(this);
  }

  /**
   * Rendering method.
   *
   * @returns JSX that represents an item.
   */
  render() {
    if (this.props.itemType === 'lever')
      return (
        <>
          <div className='Item switch' style={this.props.selfState.sty}></div>
          <div className='Item base' style={this.props.selfState.sty}></div>
        </>
      );
    else
      return (
        <div
          className={`Item ${this.props.itemType}`}
          style={this.props.selfState.sty}
        ></div>
      );
  }
}

export default Item;
