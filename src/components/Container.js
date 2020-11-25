import React, { Component } from 'react';

class Container extends Component {
  constructor(props) {
    super(props);
    this.cn = `Container ${this.props.color}`; // className
  }

  componentDidMount() {
    window.setTimeout(this.update, 10);
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
    const { dimensions, location, id } = this.props;
    this.props.updateSty(id, dimensions, location);
  };

  // set the state to attached, also send the offset from the click
  // to the top left of the container
  // note that this checks if the state is attached first to not make
  // unnecessary calls to the react api.
  attach = (e) => {
    if (!this.props.selfState.attached && this.isMovable()) {
      this.props.rewriteBlocks(this, false, () => {
        this.props.updateSelfState(this.props.id, {
          attached: true,
          mouseOffset:
            this.props.movement === 'x'
              ? e.nativeEvent.offsetX
              : e.nativeEvent.offsetY,
        });
      });
    }
  };

  // set the state to not be attached
  // note that this checks if the state is attached first to not make
  // unnecessary calls to the react api.
  detach = () => {
    if (this.props.selfState.attached && this.isMovable()) {
      this.snap();
      this.props.rewriteBlocks(this, true);
    }
  };

  // snap the container to its bounds. called from this.detach()
  // if the container is red/blue and this.automove() if it is
  // green/purple
  snap = () => {
    // create a boolean on whether or not the movement
    // is horizontal, and a reference to sty
    const isHorizontal = this.props.movement === 'x';
    const sty = this.props.selfState.sty;

    // get the nearest block from Level.js, passing in either left or top
    const nearestBlock = this.props.nearestLocation(
      //this.props.location[isHorizontal ? 1 : 0],
      this,
      isHorizontal ? sty.left : sty.top
      //isHorizontal
    );

    // set the new location, either x or y, depending on isHorizontal
    const index = isHorizontal ? 0 : 1;
    this.props.location[index] = nearestBlock.newLocation;

    // similarly, determine which part of newsty to modify and modify it
    const newsty = Object.assign({}, sty);
    const location = isHorizontal ? 'left' : 'top';
    newsty[location] = nearestBlock.newPixelLocation;
    this.props.updateSelfState(this.props.id, {
      attached: false,
      sty: newsty,
    });
  };

  // if the object is movable, call move from Level.js
  // note that this.state.attached is called first to
  // be slightly more efficient (no need to call another method)
  move = (e) => {
    if (
      this.props.selfState.attached &&
      !this.props.selfState.isMoving &&
      this.isMovable()
    ) {
      this.props.updateSelfState(this.props.id, { isMoving: true });
      this.props.move(this, e);
    }
  };

  // check if the container is movable based on its color
  isMovable() {
    if (this.props.gameIsPaused()) return false;
    switch (this.props.color) {
      case 'blue':
      case 'red':
        return true;
      default:
        return false;
    }
  }

  render() {
    return (
      <div
        className={this.cn}
        style={this.props.selfState.sty}
        onMouseDown={this.attach}
        onMouseOut={this.detach}
      ></div>
    );
  }
}

export default Container;
