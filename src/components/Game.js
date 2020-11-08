import React, { Component, createRef } from "react";

class Game extends Component {
  constructor(props) {
    super(props);
    this.ref = createRef();
    this.state = {
      // The game dimensions refer to how many "blocks"
      // are given to the game. Each block will have
      // an adjustable amount of pixels determined by
      // the height and width of the window.
      blockDimensions: [400, 300],
      // blockSize is the specific pixel:block ratio.
      // For example, a block might be 40px by 40px.
      // This array is preset to 40/40 so that this.updateBlockSize
      // will not throw an error. Theoretically, these
      // units should be square. However, they will
      // be very slightly different (fractions of pixels).
      blockSize: [40, 40],
    };
  }

  // On mount, update the block size.
  componentDidMount() {
    this.updateBlockSize();
  }

  // Update the block size on resize and mount.
  updateBlockSize() {
    // Create a temporary blockSize array to replace this.state.blockSize.
    let bs = [
      this.ref.current.clientWidth / this.state.blockDimensions[0],
      this.ref.current.clientHeight / this.state.blockDimensions[1],
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

  // Render the component
  render() {
    // On resize, update the block size. Additionally ensure that
    // ref.current is not null to prevent errors.
    window.addEventListener("resize", () => {
      if (this.ref.current !== null) {
        this.updateBlockSize();
      }
    });

    // Return the game object in index.html
    return (
      <div className="Game" ref={this.ref}>
        <h1>Test</h1>
      </div>
    );
  }
}

export default Game;
