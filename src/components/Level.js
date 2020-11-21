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

    const { dimensions, containers } = this.levelFile;

    // cycle through the blocks and populate it with booleans
    // true = container is in that block
    // false = container is not in that block
    // note: even though this loop is technically a large calculation,
    // it will only run once per level load.
    const blocks = [];
    for (let x = 0; x < dimensions[0]; x++) {
      const blockColumn = [];
      for (let y = 0; y < dimensions[1]; y++) {
        let blockOccupied = false;
        for (let i = 0; i < containers.length; i++) {
          const container = containers[i];
          const cdimensions = container.dimensions;
          const clocation = container.location;

          // if:
          // x is at least at container's x
          // x is less than the container's x + width
          // y is at least at container's y
          // y is less than the container's y + height
          // then set the block occupied to 1 and replacing
          //
          if (
            x >= clocation[0] &&
            x < clocation[0] + cdimensions[0] &&
            y >= clocation[1] &&
            y < clocation[1] + cdimensions[1]
          ) {
            blockOccupied = true;
            break;
          }
        }
        blockColumn.push(blockOccupied);
      }
      blocks.push(blockColumn);
    }
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

      // blocks determines whether or not a container is
      // occupying that specific location. this is a 2D array
      // with the columns (x values) first.
      // true = container is in that block
      // false = container is not in that block
      blocks: blocks,

      // these containerStates act as the states of each
      // individual container, which are used to determine
      // the size and location of each container
      containerStates: [],
    };

    // populate the container states with default settings
    this.levelFile.containers.forEach((container) => {
      // create a container state
      const containerState = {
        id: container.id,
        // whether or not the component should track the mouse
        // and act accordingly
        attached: false,
        // the distance between the mouse and the top left corner,
        // in either x/y depending on the movement of the component
        mouseOffset: 0,
        sty: {},
        isMoving: false,
      };
      this.state.containerStates.push(containerState);
    });
  }

  // On mount, update the block size and add a window listener
  // to automatically readjust the sizes of everything.
  componentDidMount() {
    window.addEventListener('resize', this.updateBlockSize);
  }

  // Similarly, when the component is being unmouned, remove 
  // the event listener. This is to prevent unnecessary calls
  // to no-longer-existing components.
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateBlockSize);
  }

  // Update the block size on resize and mount.
  updateBlockSize = () => {
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

  // Update the container size. Passed up from Container.js in order
  // to access this.ref.current
  updateContainerSize = (dimensions, location) => {
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
  getNewContainerPixelLocation = (
    mo,
    oldLocation,
    newOffset,
    mouseClient,
    min,
    max
  ) => {
    // depending on if the movement is x or y, move the container
    // the difference as the mouse moves
    const newLocation = oldLocation + newOffset - mo;

    // if the mouse is under the minimum pixel length,
    // plus the offset between the mouse and the corner of the container,
    // just set the location to the minimum
    if (mouseClient <= min + mo) {
      return min;
    }
    // similarly, if the mouse is under the max pixel length,
    // plus the offset between the mouse and the corner of the container,
    // just set the location to the maximum
    else if (mouseClient >= max + mo + this.getBorder()) {
      return max;
    }
    // finally, if the new location would be in between the min and max,
    // set it to that.
    // note that this is still an if statement because the mouse may
    // update in a place where the new location would be out of the
    // bounds but the mouse is still within the bounds.
    else if (newLocation > min && newLocation < max) {
      return newLocation;
    } else return oldLocation;
    // return oldloc if the movement is invalid to prevent
    // NaN and underfined errors
  };

  // instead of checking the validity of where the container would be, check whether
  // or not the container can move in that direction. that direction would be
  // determined by the relative location of the mouse from the original mouse location
  // (positive or negative). if it can move in that direction, continuously move
  // that container in that direction and update its location.
  // pos = boolean that determines whether or not the container wants to move in a
  // positive direction
  containerCanMove = (container, pos, isHorizontal) => {
    const { location, dimensions } = container.props.data;
    const index = isHorizontal ? 0 : 1;

    // the adjacent location is either the location directly after
    // the end of the dimensions, but since location + dimension is
    // already + 1 over the edge, don't do anything else
    // or the adjacent location is directly before the location,
    // in which case subtract one
    const adjacentLocation = pos
    // use Math.min/max to fix edge cases
      ? Math.min(
          location[index] + dimensions[index],
          this.levelFile.dimensions[index] - 1
        )
      : Math.max(location[index] - 1, 0);

    // top left or top right if horizontal
    // top left or bottom left if vertical
    const x1 = isHorizontal ? adjacentLocation : location[0];
    const y1 = isHorizontal ? location[1] : adjacentLocation;

    // also, check the other corner on that side. that means:
    // for top left, check bottom left
    // for top right, check bottom right
    // for bottom left, check bottom right
    const x2 = isHorizontal ? adjacentLocation : location[0] + dimensions[0] - 1;
    const y2 = isHorizontal ? location[1] + dimensions[1] - 1 : adjacentLocation;

    // true if both blocks are not occupied (false)
    return !this.state.blocks[x1][y1] && !this.state.blocks[x2][y2];
  };

  // rewrite the blocks based on whether or not the block is being
  // clicked on or let go of. 
  rewriteBlocks = (container, isSetting) => {
    const { location, dimensions } = container.props.data;
    // overwrite old x and y with 0s
    const newBlocks = Object.assign({}, this.state.blocks);

    // cycle through the blocks that the container currently is located
    // in. since this method is only called on click and on "un"click,
    // the block table is not constantly being rewritten
    for (let x = location[0]; x < location[0] + dimensions[0]; x++) {
      for (let y = location[1]; y < location[1] + dimensions[1]; y++) {
        newBlocks[x][y] = isSetting;
      }
    }
    this.setState({
      blocks: newBlocks,
    });
  };

  // move the container based on its current position on the new mouse
  // location. this is called passed up from Container.js
  moveContainer = (container, e) => {
    const containerState = this.getContainerStateById(container.props.data.id);
    const newsty = Object.assign({}, containerState.sty);
    // depending on if the movement is x or y, move the container
    // the difference as the mouse moves
    const border = this.getBorder();
    const mo = containerState.mouseOffset;
    const { location } = container.props.data;

    const isHorizontal = container.props.data.movement === 'x';
    const rect = this.ref.current.getBoundingClientRect();

    // calculate the min/max based on whether or not the container's
    // movement is horizontal. if the container is horizontal,
    // use the left + border as min and the right - width - border
    // if the container is vertical, use top instead of left,
    // bottom instead of right, and height instead of width
    let min, max;
    if (isHorizontal) {
      min = rect.left + border;
      max = rect.right - newsty.width - border;
    } else {
      min = rect.top + border;
      max = rect.bottom - newsty.height - border;
    }

    // calculate the new container location, in pixels
    const newpx = this.getNewContainerPixelLocation(
      mo,
      isHorizontal ? newsty.left : newsty.top,
      isHorizontal ? e.offsetX : e.offsetY,
      isHorizontal ? e.clientX : e.clientY,
      min,
      max
    );

    // check whether or not the container can actually move
    const ccm = this.containerCanMove(
      container,
      (isHorizontal ? newsty.left : newsty.top) < newpx,
      isHorizontal
    );

    // if it can actually move, set the calculated location
    // to the newsty and set the location to the nearest
    // block.
    if (ccm) {
      const index = isHorizontal ? 0 : 1;
      const other = isHorizontal ? 1 : 0;
      newsty[isHorizontal ? 'left' : 'top'] = newpx;
      location[index] = this.nearestBlock(
        location[other],
        newpx,
        isHorizontal
      ).newLocation;
    }

    // set the style of the container to the calculated newsty
    // set the movement to false, because the calculations are
    // completed.
    containerState.sty = newsty;
    containerState.isMoving = false;

    // reset the container states, which redraws the component
    this.setState((state) => {
      return { containerStates: state.containerStates };
    });
  };

  // get the nearest block by rounding the ratio of pixels to blocks
  // then, return both that new location and the new pixel location
  // called from this.props.nearestBlock, from Container.js
  // note: only returns an x or a y value for location/pixels,
  // based on isHorizontal
  nearestBlock = (constLocation, oldPixelLocation, isHorizontal) => {
    // get spacing so the border and whitespace isn't used
    // in the calculations
    const { x, y } = this.ref.current.getBoundingClientRect();
    const spacing = (isHorizontal ? x : y) + this.getBorder();

    // determine whether the x or y blocksize should be used
    // note that this shouldn't matter too much but can still
    // prevent the container from snapping
    const index = isHorizontal ? 0 : 1;

    // oldLocation - spacing to get just the difference from
    // the level div
    // divide to get the ratio, then round to get a full
    // location number
    let newLocation =
      (oldPixelLocation - spacing) / this.state.blockSize[index];
    const roundedNewLocation = Math.round(newLocation);

    // to prevent containers leaving the bounds, either ceil() or
    // floor() the location depending on if the rounded location
    const nlx = isHorizontal ? roundedNewLocation : constLocation;
    const nly = isHorizontal ? constLocation : roundedNewLocation;
    if (this.state.blocks[nlx][nly]) {
      if (newLocation > roundedNewLocation) {
        newLocation = Math.ceil(newLocation);
      } else {
        newLocation = Math.floor(newLocation);
      }
    } else {
      newLocation = roundedNewLocation;
    }

    // remultiply that to get the new locaton, which is "rounded"
    const newPixelLocation =
      newLocation * this.state.blockSize[index] + spacing;
    return {
      newPixelLocation: newPixelLocation,
      newLocation: newLocation,
    };
  };

  // this method is intended to replace setState() and is called
  // by Container.js
  updateContainerState = (id, newstate) => {
    // note that this does not use getContainerById because
    // the index is necessary to replace it

    // cycle through container states until the wanted id is found
    for (let i = 0; i < this.state.containerStates.length; i++) {
      const containerState = this.state.containerStates[i];
      if (containerState.id === id) {

        // modify the state by replacing whatever newstate specifies
        this.setState((state) => {
          state.containerStates[i] = Object.assign(containerState, newstate);
          return {
            containerStates: state.containerStates,
          };
        });
      }
    }
  };

  // cycle through the state.containerStates until the one with
  // the requested id is found. note that the id is not always
  // the same as the index, which is why this method is necessary.
  getContainerStateById(id) {
    for (let i = 0; i < this.state.containerStates.length; i++) {
      const containerState = this.state.containerStates[i];
      if (containerState.id === id) return containerState;
    }
  }

  // Generate the level containers using array.map
  generateContainers() {
    return this.levelFile.containers.map((container) => {
      const containerState = this.getContainerStateById(container.id);
      return (
        <Container
          key={container.id}
          data={container}
          updateSize={this.updateContainerSize}
          move={this.moveContainer}
          nearestBlock={this.nearestBlock}
          rewriteBlocks={this.rewriteBlocks}
          updateSelfState={this.updateContainerState}
          selfState={containerState}
        />
      );
    });
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
