import React, { Component, createRef } from 'react';
import Container from './Container.js';

class Game extends Component {
  constructor(props) {
    super(props);
    // The reference allows React to access the properties of
    // the component after the component has rendered. This is
    // mainly used to access the height and width of the component
    // to rescale the blocks.
    this.ref = createRef();
    // The game dimensions refer to how many "blocks"
    // are given to the game. Each block will have
    // an adjustable amount of pixels determined by
    // the height and width of the window.
    this.blockDimensions = [400, 300];
    // level is the object imported from the requested level,
    // which is passed through props. This json file includes
    // all of the data needed to load the level.
    this.level = require(`../data/levels/level${props.level}.json`);

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
        cw / this.blockDimensions[0],
        ch / this.blockDimensions[1],
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
  // Update the container size.
  updateContainer = (dimensions, location) => {
    if (this.ref.current !== null) {
      // get game's x and y, and client's height and width
      const { x, y } = this.ref.current.getBoundingClientRect();
      const cw = this.ref.current.clientWidth;
      const ch = this.ref.current.clientHeight;

      // set the border to be as big as it is in App.css
      // cw/100 and ch/100 are equivalent to 1vw and 1vh
      // in css, respectively
      // if clientWidth < 4/3 clientHeight, border is 1vw
      // else, border is 1vh
      const border = (cw + ch) / 200;

      // get blocksize for readability
      const bs = this.state.blockSize;

      // pixel width, height, x, and y, respectively
      // px and py have added game x/y and border to position correctly
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

  generateContainers() {
    return this.level.containers.map((container) => (
      <Container
        key={container.id}
        data={container}
        updateContainer={this.updateContainer}
      />
    ));
  }

  // Render the component
  render() {
    // On resize, update the block size. Additionally ensure that
    // ref.current is not null to prevent errors.

    // Return the game object in index.html
    return (
      <div className='Game' ref={this.ref}>
        {this.generateContainers()}
      </div>
    );
  }
}

export default Game;
