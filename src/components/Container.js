import React, { Component } from 'react';

class Container extends Component {
  loadContainer(fileName) {

  }
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const cn = `Container ${this.state.color}`;// className
    return (
      <div className={cn}>
        Container
      </div>
    );
  }
}

export default Container;