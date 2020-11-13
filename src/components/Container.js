import React, { Component } from 'react';

class Container extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const cn = `Container ${this.props.data.color}`;// className
    return (
      <div className={cn} style={this.props.updateContainerSize(this.props.data.dimensions)}>
        { this.props.data.id }
      </div>
    );
  }
}

export default Container;