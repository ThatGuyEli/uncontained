import React, { Component } from 'react';
import Container from './Container.js';
import Character from './Character.js';

/**
 * Class that represents the level of the game.
 * @extends Component
 */
class Level extends Component {
  /**
   * Create a level based on the level id.
   *
   * @param {Object} props The properties necessary to instantiate the level.
   */
  constructor(props) {
    super(props);
    // The reference allows React to access the properties of
    // the component after the component has rendered. This is
    // mainly used to access the height and width of the component
    // to rescale the blocks.
    // this.ref = createRef();
    // This has been disabled in favor of using innerHeight and innerWidth,
    // which are built into JavaScript's window object.

    // The level dimensions refer to how many "blocks"
    // are given to the level. Each block will have
    // an adjustable amount of pixels determined by
    // the height and width of the window.
    // this.blockDimensions = [400, 300];
    // This has been disabled in favor of levelFile.dimensions
    // because some levels may have different dimensions.

    // Level is the object imported from the requested level,
    // which is passed through props. This JSON file includes
    // all of the data needed to load the level.
    this.levelFile = require(`../data/levels/level${props.id}.json`);

    // Cycle through the blocks and populate it with booleans.
    // true = container is in that block
    // false = container is not in that block
    // Note: even though this loop is technically a large calculation,
    // it will only run once per level load.
    const blocks = [];
    const { dimensions, containers } = this.levelFile;
    for (let x = 0; x < dimensions[0]; x++) {
      const blockColumn = [];
      for (let y = 0; y < dimensions[1]; y++) {
        let blockOccupied = false;
        for (let i = 0; i < containers.length; i++) {
          const container = containers[i];
          const cdimensions = container.dimensions;
          const clocation = container.location;

          // if all of the following conditions are met:
          // x is at least at container's x
          // x is less than the container's x + width
          // y is at least at container's y
          // y is less than the container's y + height
          // then set the block occupied to true
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
        // Add that boolean to the column.
        blockColumn.push(blockOccupied);
      }
      // Add that column to the array.
      blocks.push(blockColumn);
    }

    // The state of this class contains the "states" of all
    // of the other objects/components of the level, because
    // they are not needed at the higher levels of the game
    // (such as the menu or title screen).
    this.state = {
      sty: {},

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
      // occupying that specific location. This is a 2D array
      // with the columns (x values) first.
      // true = container is in that block
      // false = container is not in that block
      blocks: blocks,

      // The character state is stored here to allow everything
      // to access that state.
      characterState: {
        // The character's size will always be [1,1]. This is so that
        // big and small levels will adjust the character's size
        // accordingly.
        size: [1, 1],

        // The character's style, like the level style, will change
        // and so it is kept here in the state.
        sty: {},

        // The location is relative to the container that the
        // character is located in.
        container: this.levelFile.character.startContainer,
        location: this.levelFile.character.startLocation,
      },

      // containerStates is an array that keeps track of
      // each individual container's state, which includes
      // styling and other information.
      containerStates: [],
    };

    // Populate the container states with default state.
    this.levelFile.containers.forEach((container) => {
      // Create the default container state.
      const containerState = {
        // ID for identification.
        id: container.id,
        // Whether or not the component should track the mouse
        // and act accordingly.
        attached: false,

        // The distance between the mouse and the top left corner,
        // in either x/y depending on the movement of the component.
        mouseOffset: 0,

        // The container's style, like the level style, will change
        // and so it is kept here in the state.
        sty: {},

        // Whether or not the container is moving. This is to prevent
        // errors from asynchronous tasks.
        isMoving: false,
      };

      // Add this default container state to the list of containerStates.
      this.state.containerStates.push(containerState);
    });
  }

  /**
   * When the component mounts, update the style of this component.
   * Additionally, add the event listener to update the style whenever
   * the event listener resizes.
   */
  componentDidMount() {
    this.updateSty();
    window.addEventListener('resize', this.updateSty);
  }

  /**
   * Similarly, when the component is being unmounted, remove
   * the event listener. This is to prevent unnecessary calls
   * to no-longer-existing components.
   */
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateSty);
  }

  /**
   * Update the style of the level. This includes the margins,
   * border, and pixel dimensions of the component. The pixel
   * sizes are calculated so that the component will always be
   * centered, adhere to a 4:3 aspect ratio, and be as large
   * as possible. The color and border-style is handled by
   * /css/App.css. When the style is updated, this method
   * calls {@link #updateBlockSize}.
   */
  updateSty = () => {
    const newsty = {};
    const { innerWidth, innerHeight } = window;

    // set both border radius and size to border.
    const border = this.getBorder();
    newsty.borderRadius = border;
    newsty.borderWidth = border;

    const doubleBorder = 2 * border;
    const fourThirdsHeight = (innerHeight * 4) / 3;

    // if the width of the viewport is less than 4/3 of the height,
    // base the style off of the width
    if (innerWidth < fourThirdsHeight) {
      const threeFourthsWidth = (innerWidth * 3) / 4;
      newsty.width = innerWidth - doubleBorder;
      newsty.height = threeFourthsWidth - doubleBorder;

      const margin = (innerHeight - threeFourthsWidth) / 2;
      newsty.marginTop = margin;
      newsty.marginBottom = margin;
      newsty.marginLeft = 0;
      newsty.marginRight = 0;
    }
    // otherwise, base the style off of the height
    else {
      newsty.width = fourThirdsHeight - doubleBorder;
      newsty.height = innerHeight - doubleBorder;

      const margin = (innerWidth - fourThirdsHeight) / 2;
      newsty.marginTop = 0;
      newsty.marginBottom = 0;
      newsty.marginLeft = margin;
      newsty.marginRight = margin;
    }

    // this utilizes the callback parameter of setState.
    // when the state finishes setting the style to the new
    // style, also set the new block size
    this.setState({ sty: newsty }, this.updateBlockSize);
  };

  /**
   * Called from {@link #updateSty}. This updates the blockSize
   * based on the height and width of the component.
   */
  updateBlockSize = () => {
    const { width, height } = this.state.sty;
    // Create a temporary blockSize array to replace this.state.blockSize.
    let bs = [
      width / this.levelFile.dimensions[0],
      height / this.levelFile.dimensions[1],
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
  };

  /**
   * Update the container style. This method is passed into
   * {@link Container} using {@link Container.props} so that
   * it can access {@link this.state.sty}. This sets the state
   * based on the passed in id.
   *
   * @param {Number} id         the id of the container
   * @param {Array}  dimensions the dimensions of the container
   * @param {Array}  location   the location of the container
   */
  updateContainerSty = (id, dimensions, location) => {
    // Get the x and y of the Level to determine the relative
    // location of the Container.
    const { marginLeft: x, marginTop: y } = this.state.sty;
    const border = this.getBorder();

    // Get blocksize for readability.
    const bs = this.state.blockSize;

    // Calculate the width, height, left, top, and border
    // sizing of each container.
    const newsty = {
      width: dimensions[0] * bs[0],
      height: dimensions[1] * bs[1],
      left: location[0] * bs[0] + x + border,
      top: location[1] * bs[1] + y + border,
      borderWidth: border,
      borderRadius: border,
    };
    this.updateContainerState(id, { sty: newsty });
  };

  /**
   * Get the pixel size of the border based on the
   * viewport. This returns the pixel value of the average
   * of 1% of the {@link window.innerWidth} and 1%
   * of the {@link window.innerHeight}.
   *
   * @returns the pixel size of the border
   */
  getBorder() {
    const { innerWidth, innerHeight } = window;
    return (innerWidth + innerHeight) / 200;
  }

  /**
   * This method is a helper method for {@link this#moveContainer}.
   * It is used to move the container to a new pixel location,
   * based on 'x' and 'y'. Note that because 'x' and 'y' use
   * the exact same logic, the only difference is the input numbers,
   * so a helper method is perfect for this situation.
   *
   * @param {Number} mo          the offset of the mouse
   * @param {Number} oldLocation the previous location of the container
   * @param {Number} newOffset   the new location of the mouse, relative to the container
   * @param {Number} mouseClient the new location of the mouse, absolute
   * @param {Number} min         the maximum bound of the level
   * @param {Number} max         the minimum bound of the level
   *
   * @returns the new location, or the old location if the new location is invalid
   */
  getNewContainerPixelLocation = (
    mo,
    oldLocation,
    newOffset,
    mouseClient,
    min,
    max
  ) => {
    // Depending on if the movement is x or y, move the container
    // the distance of the mouse offset as the mouse moves.
    const newLocation = oldLocation + newOffset - mo;

    // If the mouse is under the minimum pixel length,
    // plus the offset between the mouse and the corner of the container,
    // set the location to the minimum.
    if (mouseClient <= min + mo) {
      return min;
    }
    // Similarly, if the mouse is under the max pixel length,
    // plus the offset between the mouse and the corner of the container,
    // set the location to the maximum.
    else if (mouseClient >= max + mo + this.getBorder()) {
      return max;
    }
    // Finally, if the new location would be in between the min and max,
    // set it to that.
    // Note that this is still an if statement because the mouse may
    // update in a place where the new location would be out of the
    // bounds but the mouse is still within the bounds.
    else if (newLocation > min && newLocation < max) {
      return newLocation;
    } else return oldLocation;
    // Return oldLocation if the movement is invalid to prevent
    // NaN and underfined errors.
  };

  // ** This comment was used for debugging purposes and for a theoretical approach
  //    to a now fixed bug. However, it was kept here to demonstrate the thought process.
  // Instead of checking the validity of where the container would be, check whether
  // or not the container can move in that direction. That direction would be
  // determined by the relative location of the mouse from the original mouse location
  // (positive or negative). if it can move in that direction, continuously move
  // that container in that direction and update its location.

  // pos = boolean that determines whether or not the container wants to move in a
  // positive direction.
  containerCanMove = (container, pos, isHorizontal) => {
    const { location, dimensions } = container.props.data;
    const index = isHorizontal ? 0 : 1;
    const antiIndex = isHorizontal ? 1 : 0;

    // The adjacent location is either the location directly after
    // the end of the dimensions, but since location + dimension is
    // already + 1 over the edge, don't do anything else.
    // Or the adjacent location is directly before the location,
    // in which case subtract one.
    const adjacentLocation = pos
      ? // Use Math.min/max to fix edge cases
        Math.min(
          location[index] + dimensions[index],
          this.levelFile.dimensions[index] - 1
        )
      : Math.max(location[index] - 1, 0);

    // Cycle from 0 to the dimensions of the axis opposite to the moving
    // axis. Check whether or not each block is occupied. If any of them
    // are occupied, return false. If the end of the loop is reached,
    // return true. This is used instead of checking the corners because
    // a container may be small enough to avoid both corners, breaking
    // the game.
    for (
      let i = 0;
      i < dimensions[antiIndex];
      i++
    ) {
      const x = isHorizontal ? adjacentLocation : location[0] + i;
      const y = isHorizontal ? location[1] + i : adjacentLocation;
      // If this block is occupied, return false.
      if (this.state.blocks[x][y]) {
        return false;
      }
    }
    // Otherwise, none of the blocks are occupied, so return true.
    return true;
  };

  // rewrite the blocks based on whether or not the block is being
  // clicked on or let go of.
  /**
   *
   * @param {Object} container
   * @param {Boolean} isSetting
   */
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
    const { marginTop: y, height, marginLeft: x, width } = this.state.sty;

    // calculate the min/max based on whether or not the container's
    // movement is horizontal. if the container is horizontal,
    // use the left + border as min and the right - width - border
    // if the container is vertical, use top instead of left,
    // bottom instead of right, and height instead of width
    let min, max;
    if (isHorizontal) {
      min = x + border;
      max = x + width - newsty.width + border;
    } else {
      min = y + border;
      max = y + height - newsty.height + border;
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

    // if the character is in the container,
    // update its pixel location
    if (this.characterIsIn(container)) {
      this.updateCharacterSty();
    }

    // redraw the component
    this.forceUpdate();
  };

  // get the nearest block by rounding the ratio of pixels to blocks
  // then, return both that new location and the new pixel location
  // called from this.props.nearestBlock, from Container.js
  // note: only returns an x or a y value for location/pixels,
  // based on isHorizontal
  nearestBlock = (constLocation, oldPixelLocation, isHorizontal) => {
    // get spacing so the border and whitespace isn't used
    // in the calculations
    const { marginLeft, marginTop } = this.state.sty;
    const x = marginLeft;
    const y = marginTop;
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
    // is occupied
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
          updateSty={this.updateContainerSty}
          move={this.moveContainer}
          nearestBlock={this.nearestBlock}
          rewriteBlocks={this.rewriteBlocks}
          updateSelfState={this.updateContainerState}
          selfState={containerState}
        />
      );
    });
  }

  getContainerPixelLocation(id) {
    const containerState = this.getContainerStateById(id);
    return [containerState.sty.left, containerState.sty.top];
  }

  updateCharacterState = (newstate) => {
    this.setState({
      characterState: newstate,
    });
  };

  updateCharacterSty = () => {
    const characterState = Object.assign({}, this.state.characterState);
    const bs = this.state.blockSize;
    const border = this.getBorder();
    const containerPixelLocation = this.getContainerPixelLocation(
      characterState.container
    );
    const xpxRel =
      characterState.location[0] * bs[0] + containerPixelLocation[0] + border;
    const ypxRel =
      characterState.location[1] * bs[1] + containerPixelLocation[1] + border;

    const sty = {
      width: bs[0] * characterState.size[0],
      height: bs[1] * characterState.size[1],
      left: xpxRel,
      top: ypxRel,
      borderWidth: border / 2,
      borderRadius: border * 1.25,
    };
    characterState.sty = sty;

    this.setState({
      characterState: characterState,
    });
  };

  characterIsIn = (container) => {
    return this.state.characterState.container === container.props.data.id;
  };

  // Render the component
  render() {
    // Return the level object in index.html
    return (
      <div className='Level' style={this.state.sty}>
        {this.generateContainers()}
        <Character
          selfState={this.state.characterState}
          updateSty={this.updateCharacterSty}
        />
      </div>
    );
  }
}

export default Level;
