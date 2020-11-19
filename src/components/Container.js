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
      mouseOffset: 0,
      sty: {},
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.update);
    window.addEventListener('mousemove', this.move);
    window.addEventListener('mouseup', this.detach);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.update);
    window.removeEventListener('mousemove', this.move);
    window.removeEventListener('mouseup', this.detach);
  }

  update = () => {
    const { dimensions, location } = this.props.data;
    const newsty = this.props.update(dimensions, location);
    this.setState({
      sty: newsty,
    });
  };

  // set the state to attached, also send the offset from the click
  // to the top left of the container
  // note that this checks if the state is attached first to not make
  // unnecessary calls to the react api.
  attach = (e) => {
    if (!this.state.attached && this.isMovable()) {
      this.setState({
        attached: true,
        // note that this uses react's synthetic event as opposed
        // to vanilla JS events, so it needs to reference e.nativeEvent
        // as opposed to just regular e.
        mouseOffset:
          this.props.data.movement === 'x'
            ? e.nativeEvent.offsetX
            : e.nativeEvent.offsetY,
      });
    }
  };

  // set the state to not be attached
  // note that this checks if the state is attached first to not make
  // unnecessary calls to the react api.
  detach = () => {
    if (this.state.attached && this.isMovable()) {
      this.setState({
        attached: false,
      });
      // todo: comment
      const isHorizontal = this.props.data.movement === 'x';
      const sty = this.state.sty
      const nearestBlock = this.props.nearestBlock(isHorizontal ? sty.left : sty.top, isHorizontal);
      if (isHorizontal) {
        this.props.data.location[0] = nearestBlock.newLocation;
        this.setState((state) => {
          const newsty = Object.assign({}, state.sty);
          newsty.left = nearestBlock.newPixelLocation;
          return {
            sty: newsty,
          }
        });
      }
      else {
        this.props.data.location[1] = nearestBlock.newLocation;
        this.setState((state) => {
          const newsty = Object.assign({}, state.sty);
          newsty.top = nearestBlock.newPixelLocation;
          return {
            sty: newsty,
          }
        });
      }

    }
  };

  move = (e) => {
    if (this.state.attached && this.isMovable()) {
      this.props.move(this, e);
    }
  };

  isMovable() {
    switch (this.props.data.color) {
      case 'blue':
      case 'red':
        return true;
      default:
        return false;
    }
  }

  render() {
    return (
      <div className={this.cn} style={this.state.sty} onMouseDown={this.attach}>
      </div>
    );
  }
}

export default Container;
