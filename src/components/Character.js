import React, { Component } from 'react';

// requires the blocksize to render him

class Character extends Component {
  //constructor(props) {
  //  super(props);
  //}

  componentDidMount() {
    window.setTimeout(this.props.updateSty, 10);
    window.addEventListener('resize', this.props.updateSty);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.props.updateSty);
  }

  render() {
    return <div className='Character' style={this.props.selfState.sty}></div>;
  }
}

export default Character;
