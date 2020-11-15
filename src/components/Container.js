import React, { Component } from 'react';

class Container extends Component {
  constructor(props) {
    super(props);
    this.cn = `Container ${this.props.data.color}`; // className
    this.state = {
      // whether or not the component should track the mouse
      // and act accordingly
      attached: false,
      // the distance between the mouse and the top left corner,
      // in either x/y depending on the movement of the component
      offset: 0,
      sty: {},
    };
  }

  componentDidMount() {
    this.update();
    window.addEventListener('resize', this.update);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.update);
  }

  update = () => {
    const { dimensions, location } = this.props.data;
    const newsty = this.props.updateContainer(dimensions, location);
    this.setState({
      sty: newsty,
    });
  };

  attach = (e) => {
    this.setState({
      attached: true,
      offset:
        this.props.data.movement === 'x'
          ? e.nativeEvent.offsetX
          : e.nativeEvent.offsetY,
    });
  };

  detach = () => {
    this.setState({
      attached: false,
    });
  };

  move = (e) => {
    if (this.isMovable()) {
      this.setState((state) => {
        const newsty = Object.assign({}, state.sty);

        switch (this.props.data.movement) {
          case 'x':
            // add the new position minus the old position of mouse
            const shiftx = e.nativeEvent.offsetX - this.state.offset;
            newsty.left += shiftx;
            break;
          case 'y':
            // do same as 'x' but with offsetY and .top
            const shifty = e.nativeEvent.offsetY - this.state.offset;
            newsty.top += shifty;
            break;
          default:
            break;
        }

        return { sty: newsty };
      });
    }
  };

  isMovable() {
    switch (this.props.data.color) {
      case 'blue':
      case 'red':
        return this.state.attached && true;
      default:
        return false; // this.state.attached && false always returns false
    }
  }

  render() {
    return (
      <div
        className={this.cn}
        style={this.state.sty}
        onMouseDown={this.attach}
        onMouseUp={this.detach}
        onMouseMove={this.move}
      >
        {this.props.data.id}
      </div>
    );
  }
}

export default Container;
