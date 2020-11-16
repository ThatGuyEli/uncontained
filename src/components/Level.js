import React, { Component, createRef } from 'react';
import Container from './Container.js';

class Level extends Component {
  constructor(props) {
    super(props);
    // The reference allows React to access the properties of
    // the component after the component has rendered. This is
    // mainly used to access the height and width of the component
    // to rescale the blocks.
    this.ref = createRef();
    // The level dimensions refer to how many "blocks"
    // are given to the level. Each block will have
    // an adjustable amount of pixels determined by
    // the height and width of the window.
    // this has been disabled and replaced by levelFile.dimensions
    // because some levels may have different dimensions
    // this.blockDimensions = [400, 300];

    // level is the object imported from the requested level,
    // which is passed through props. This json file includes
    // all of the data needed to load the level.
    this.levelFile = require(`../data/levels/level${props.id}.json`);

    this.state = {
      // blockSize is the specific pixel:block ratio.
      // For example, a block might be 40px by 40px.
      // This array is preset to 40/40 so that this.updateBlockSize
      // will not throw an error. Theoretically, these
      // units should be square. However, they will
      // be very slightly different (fractions of pixels).
      // note that this is in the state because it is
      // going to change with the window.
      blockSize: [40, 40],
    };
  }

  // On mount, update the block size.
  componentDidMount() {
    this.updateBlockSize();
    window.addEventListener('resize', this.updateBlockSize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateBlockSize);
  }

  // Update the block size on resize and mount.
  updateBlockSize = () => {
    if (this.ref.current !== null) {
      const cw = this.ref.current.clientWidth;
      const ch = this.ref.current.clientHeight;
      // Create a temporary blockSize array to replace this.state.blockSize.
      let bs = [
        cw / this.levelFile.dimensions[0],
        ch / this.levelFile.dimensions[1],
      ];

      // If either pixel ratio is not correct, replace the blockSize array.
      if (
        bs[0] !== this.state.blockSize[0] ||
        bs[1] !== this.state.blockSize[1]
      ) {
        this.setState({
          blockSize: bs,
        });
      }
    }
  };

  // Update the container size. Passed up from Container.js in order
  // to access this.ref.current
  updateContainer = (dimensions, location) => {
    if (this.ref.current !== null) {
      // get level's x and y, and client's height and width
      const { x, y } = this.ref.current.getBoundingClientRect();
      const border = this.getBorder();

      // get blocksize for readability
      const bs = this.state.blockSize;

      // pixel width, height, x, and y, respectively
      // px and py have added level x/y and border to position correctly
      const pw = dimensions[0] * bs[0];
      const ph = dimensions[1] * bs[1];
      const px = location[0] * bs[0] + x + border;
      const py = location[1] * bs[1] + y + border;

      return {
        height: ph,
        width: pw,
        top: py,
        left: px,
      };
    }
  };

  // calculate the border of the level window
  getBorder() {
    const cw = this.ref.current.clientWidth;
    const ch = this.ref.current.clientHeight;

    // set the border to be as big as it is in App.css
    // cw/100 and ch/100 are equivalent to 1vw and 1vh
    // in css, respectively
    // if clientWidth < 4/3 clientHeight, border is 1vw
    // else, border is 1vh
    return (cw + ch) / 200;
  }

  // a helper to move the container, because case 'x' and 'y' do
  // the exact same function but use different inputs which are 
  // passed into this function
  moveContainerHelper = (mo, oldloc, newOffset, mouseClient, min, max) => {
    // depending on if the movement is x or y, move the container
    // the difference as the mouse moves
    const newloc = oldloc + newOffset - mo;

    // if the mouse is under the minimum pixel length,
    // plus the offset between the mouse and the corner of the container,
    // just set the location to the minimum
    if (mouseClient <= min + mo) {
      return min;
    } 
    // similarly, if the mouse is under the max pixel length,
    // plus the offset between the mouse and the corner of the container,
    // just set the location to the maximum
    else if (mouseClient >= max + mo) {
      return max;
    } 
    // finally, if the new location would be in between the min and max,
    // set it to that.
    // note that this is still an if statement because the mouse may
    // update in a place where the new location would be out of the
    // bounds but the mouse is still within the bounds.
    else if (newloc > min && newloc < max) {
      return newloc;
    } else return oldloc; 
    // return oldloc if the movement is invalid to prevent
    // NaN and underfined errors 
  };

  // move the container based on its current position on the new mouse
  // location. this is called passed up from Container.js
  moveContainer = (container, e) => {
    if (container.isMovable()) {
      container.setState((state) => {
        const newsty = Object.assign({}, state.sty);

        // depending on if the movement is x or y, move the container
        // the difference as the mouse moves
        const border = this.getBorder();
        const mo = container.state.mouseOffset;
        switch (container.props.data.movement) {
          case 'x':
            const { left, right } = this.ref.current.getBoundingClientRect();
            const minX = left + border;
            const maxX = right - newsty.width - border;
            newsty.left = this.moveContainerHelper(
              mo,
              newsty.left,
              e.offsetX,
              e.clientX,
              minX,
              maxX
            );
            break;
          case 'y':
            const { top, bottom } = this.ref.current.getBoundingClientRect();
            const minY = top + border;
            const maxY = bottom - newsty.height - border;
            newsty.top = this.moveContainerHelper(
              newsty.top,
              e.offsetY,
              e.clientY,
              minY,
              maxY
            );
            // do same as 'x' but with height, offsetY, clientY, top, and bottom
            break;
          default:
            break;
        }

        return { sty: newsty };
      });
    }
  };

  // Generate the level containers using array.map
  generateContainers() {
    return this.levelFile.containers.map((container) => (
      <Container
        key={container.id}
        data={container}
        update={this.updateContainer}
        move={this.moveContainer}
      />
    ));
  }

  // Render the component
  render() {
    // Return the level object in index.html
    return (
      <div className='Level' ref={this.ref}>
        {this.generateContainers()}
      </div>
    );
  }
}

export default Level;
