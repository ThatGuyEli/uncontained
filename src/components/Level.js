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
    this.keys = require('../data/keybinds.json');
    this.actions = {
      left: false,
      right: false,
      jump: false,
    };
    this.paused = false;

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

        isMoving: false,
        // The velocities are measured in blocks, but are multiplied
        // by blockSize to determine the actual amount of pixels moved.
        // The xVelocity is constant, but is stored in the state because
        // the yVelocity will not be constant and keeping them together
        // is important.
        xVel: 3,
        yVel: 0,
        // The character will accelerate vertically to give a curve effect
        // when falling/jumping.
        yAcc: 1,
        // The jump velocity is negative because up is negative
        yJumpVel: -12,

        // The location is relative to the container that the
        // character is located in. Note that unlike containers,
        // the character's pixel location does not snap to
        // the location underneath it.
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
        isMovingPos: false,

        // A list of locations that the container's side occupies. This
        // stores the value of the *opposite* axis, which means that it
        // will never change. This is important because it saves calculation
        // time during movement.
        sideArr: [],
      };
      const isHorizontal = container.movement === 'x';
      const { location, dimensions } = container;
      const antiIndex = isHorizontal ? 1 : 0;

      for (let i = 0; i < dimensions[antiIndex]; i++) {
        containerState.sideArr.push(location[antiIndex] + i);
      }

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
    this.timer = setInterval(this.timerFunc, 1000 / 60);
    this.updateSty();
    document.onkeydown = this.handleKey;
    document.onkeyup = this.handleKey;
    window.addEventListener('resize', this.updateSty);
    window.addEventListener('resize', this.pauseForResize);
  }

  /**
   * Similarly, when the component is being unmounted, remove
   * the event listener. This is to prevent unnecessary calls
   * to no-longer-existing components.
   */
  componentWillUnmount() {
    window.removeEventListener('resize', this.pauseForResize);
    window.removeEventListener('resize', this.updateSty);
  }

  //-----------------------------\\
  // Key Event And Timer Methods \\
  //-----------------------------\\

  /**
   * Handles KeyboardEvents from onKeyDown and onKeyUp.
   *
   * @param {KeyboardEvent} e the keyboard event to handle
   */
  handleKey = (e) => {
    // Only do something with the key if the key is in the controls.
    if (e.key in this.keys) {
      const action = this.keys[e.key];

      // If the key is being pressed down, set the respective action
      // to true.
      if (e.type === 'keydown') {
        // If the action is to pause, pause instead.
        if (action === 'pause') this.togglePause();
        else this.actions[action] = true;
      } 
      // Otherwise, set the respective action to false.
      else if (e.type === 'keyup' && action !== 'pause') {
        this.actions[action] = false;
      }
    }
  };

  /**
   * Toggle whether or not the game is paused. On pause, pause the
   * timer. On unpause, start the timer again.
   */
  togglePause = () => {
    this.paused = !this.paused;
    if (this.paused) {
      clearInterval(this.timer);
    } else {
      this.timer = setInterval(this.timerFunc, 1000 / 60);
    }
    // todo: add pause menu
    // todo: pause interval that moves the character
  };

  /**
   * Pause the game and stop the timer.
   */
  pauseForResize = () => {
    this.paused = true;
    clearInterval(this.timer);
  };

  /**
   * {this.timer} calls this method every frame. Sets
   * the state of the character to moving, then moves
   * the character.
   */
  timerFunc = () => {
    this.setState(
      {
        characterState: Object.assign(this.state.characterState, {
          isMoving: true,
        }),
      },
      this.moveCharacter
    );
  };

  /**
   * General accessor. This is used in Container, which cannot
   * normally access {this.paused}.
   * 
   * @returns {boolean} Whether or not the game is paused.
   */
  gameIsPaused = () => {
    return this.paused;
  };

  //---------------\\
  // Level Methods \\
  //---------------\\

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
    // Note: although Object.assign could be used, it is
    // more efficient to simply list the style changes needed.
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
   * Get the pixel size of the border based on the
   * viewport. This returns the pixel value of the average
   * of 1% of the {@link window.innerWidth} and 1%
   * of the {@link window.innerHeight}.
   *
   * @returns the pixel size of the border
   */
  getBorder = () => {
    const { innerWidth, innerHeight } = window;
    return (innerWidth + innerHeight) / 200;
  }

  /**
   * Convert a unit to pixels per frame, at 60fps.
   *
   * @param {number} unit The unit to multiply.
   * @param {number} blockSize The ratio of the block.
   */
  toPixelsPerFrame = (unit, blockSize) => {
    return (unit * blockSize) / (1000 / 60);
  };

  //-------------------\\
  // Container Methods \\
  //-------------------\\

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
   * This method is intended to replace setState() for Containers.
   * 
   * @param {number} id The id of the container to update the state of.
   * @param {object} newstate The state to replace the old state.
   */
  updateContainerState = (id, newstate) => {
    // Note that this does not use getContainerById because
    // the index is necessary to replace it.

    // Cycle through container states until the requested id is found.
    for (let i = 0; i < this.state.containerStates.length; i++) {
      const containerState = this.state.containerStates[i];
      if (containerState.id === id) {
        // Modify the state by replacing whatever newstate specifies.
        this.setState((state) => {
          state.containerStates[i] = Object.assign(containerState, newstate);
          return {
            containerStates: state.containerStates,
          };
        });
      }
    }
  };

  /**
   * Get the pixel location of the container with the matching id.
   * 
   * @param {number} id The id of the container to get the pixel location from.
   * 
   * @returns {Array} the pixel location, in [x,y] format.
   */
  getContainerPixelLocation = (id) => {
    // Search for the container, then return its top and left in [x,y] format.
    const containerState = this.getContainerStateById(id);
    return [containerState.sty.left, containerState.sty.top];
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
    else if (mouseClient >= max + mo) {
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

  /**
   * Move the container based on its current position and the mouse's
   * location. This method is passed down to Container.
   * 
   * @param {container} container the container to move
   * @param {MouseEvent} e the mouse event to move the container based on
   */
  moveContainer = (container, e) => {
    // If the character is in the container,
    // or if the game is paused,
    // don't move.
    if (this.paused || this.characterIsIn(container)) return;

    const containerState = this.getContainerStateById(container.props.id);
    const newsty = Object.assign({}, containerState.sty);

    // Depending on if the movement is x or y, move the container
    // the difference as the mouse moves.
    const border = this.getBorder();
    const mo = containerState.mouseOffset;
    const location = container.props.location;

    const isHorizontal = container.props.movement === 'x';
    const { marginTop: y, height, marginLeft: x, width } = this.state.sty;

    // Calculate the min/max based on whether or not the container's
    // movement is horizontal. If the container is horizontal,
    // use the left + border as min and the right - width - border.
    // If the container is vertical, use top instead of left,
    // bottom instead of right, and height instead of width.
    let min, max;
    if (isHorizontal) {
      min = x + border;
      max = x + width - newsty.width + border;
    } else {
      min = y + border;
      max = y + height - newsty.height + border;
    }

    const offset = isHorizontal ? e.offsetX : e.offsetY;
    containerState.isMovingPos = offset - mo > 0;

    // Calculate the new container location, in pixels.
    const newpx = this.getNewContainerPixelLocation(
      mo,
      isHorizontal ? newsty.left : newsty.top,
      offset,
      isHorizontal ? e.clientX : e.clientY,
      min,
      max
    );

    // Check whether or not the container can actually move.
    const ccm = this.containerCanMove(container);

    // If it can actually move, set the calculated location
    // to the newsty and set the location to the nearest
    // block.
    if (ccm) {
      const index = isHorizontal ? 0 : 1;
      newsty[isHorizontal ? 'left' : 'top'] = newpx;
      location[index] = this.nearestContainerLocation(
        container,
        newpx
      ).newLocation;
    }

    // Set the style of the container to the calculated newsty.
    // Set the movement to false, because the calculations are
    // completed.
    containerState.sty = newsty;
    containerState.isMoving = false;

    // Redraw the component.
    this.forceUpdate();
  };

  // ** This comment was used for debugging purposes and for a theoretical approach
  //    to a now fixed bug. However, it was kept here to demonstrate the thought process.
  // Instead of checking the validity of where the container would be, check whether
  // or not the container can move in that direction. That direction would be
  // determined by the relative location of the mouse from the original mouse location
  // (positive or negative). if it can move in that direction, continuously move
  // that container in that direction and update its location.

  /**
   * Determine if the container can move.
   * 
   * @param {Container} container The container to move.
   * 
   * @returns {boolean} Whether or not the container can move.
   */
  containerCanMove = (container) => {
    const { location, dimensions } = container.props;
    const isHorizontal = container.props.movement === 'x';
    const pos = container.props.selfState.isMovingPos;
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
    for (let i = 0; i < dimensions[antiIndex]; i++) {
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

  /**
   * Either write {true} or {false} blocks to {this.blocks}.
   * based on the parameter {isSetting}.
   *
   * @param {Object} container  the Container to rewrite blocks for
   * @param {Boolean} isSetting whether or not the Container is being attached or detached
   * @param {Function} callback the function that will be called back after this function finishes
   */
  rewriteBlocks = (container, isSetting, callback) => {
    const { location, dimensions } = container.props;
    // Overwrite old x and y with 0s.
    const newBlocks = Object.assign({}, this.state.blocks);

    // Cycle through the blocks that the container currently is located
    // in. Since this method is only called on mouse down and on 
    // mouse up, the block table is not constantly being rewritten.
    for (let x = location[0]; x < location[0] + dimensions[0]; x++) {
      for (let y = location[1]; y < location[1] + dimensions[1]; y++) {
        newBlocks[x][y] = isSetting;
      }
    }
    this.setState(
      {
        blocks: newBlocks,
      },
      callback
    );
  };

  /**
   * Get the nearest block by rounding the ratio of pixels to blocks.
   * Then, return both that new location and the new pixel location.
   * This method is passed down to Container.
   * Note: this method only returns information for the axis
   * that the container moves along.
   * 
   * @param {Container} container Container to find the nearest location of.
   * @param {number} oldPixelLocation The previous pixel location
   */
  nearestContainerLocation = (container, oldPixelLocation) => {
    const isHorizontal = container.props.movement === 'x';
    const dimensions = container.props.dimensions;
    const { sideArr, isMovingPos: pos } = container.props.selfState;

    // Get spacing so the border and whitespace isn't used
    // in the calculations.
    const { marginLeft: x, marginTop: y } = this.state.sty;
    const spacing = (isHorizontal ? x : y) + this.getBorder();

    // Determine whether the x or y blockSize should be used.
    // Note that this shouldn't matter too much but can still
    // prevent the container from snapping to the wrong location.
    const index = isHorizontal ? 0 : 1;

    // oldLocation - spacing to get the difference from
    // the level div
    // Divide to get the ratio, then round to get a full
    // location number.
    let newLocation =
      (oldPixelLocation - spacing) / this.state.blockSize[index];
    const roundedNewLocation = Math.round(newLocation);

    // While cycling through the opposite axis, if the container
    // is moving in a positive direction, add the dimension - 1.
    // This is to ensure that the locations checked are the ones
    // at the end of the container.
    const backSide = pos ? dimensions[index] - 1 : 0;

    // nlx = newLocationX, nly = newLocationY, nlr = newLocationRelative
    let nlx, nly, nlr;
    nlr = roundedNewLocation + backSide;

    // Loops through every part of the side. If any part is in conflict,
    // reverse the newLocationRelative until it is not in conflict.
    // This will find a location in which none of the array is in
    // conflict, so the container cannot break out of its boundaries.
    // This solution was implemented to replace the previous method,
    // which only checked the top left corner of the container for
    // conflict. That method was limited by only checking the top
    // left corner and not accounting for mouse events not updating
    // consistently.
    for (let i = 0; i < sideArr.length; i++) {
      nlx = isHorizontal ? nlr : sideArr[i];
      nly = isHorizontal ? sideArr[i] : nlr;
      while (this.state.blocks[nlx][nly]) {
        if (pos) nlr--;
        else nlr++;
        nlx = isHorizontal ? nlr : sideArr[i];
        nly = isHorizontal ? sideArr[i] : nlr;
      }
    }
    newLocation = nlr - backSide;

    // Remultiply that to get the new location in pixels.
    const newPixelLocation =
      newLocation * this.state.blockSize[index] + spacing;
    return {
      newPixelLocation: newPixelLocation,
      newLocation: newLocation,
    };
  };

  /**
   * Cycle through the container states until the one with the
   * requested id is found. Note that the id is not always the
   * same as the index, which is why this method is necessary.
   * 
   * @param {number} id The id of the container to get the state of.
   * 
   * @returns {object} The requested container state, or null if none exist.
   */
  getContainerStateById = (id) => {
    for (let i = 0; i < this.state.containerStates.length; i++) {
      const containerState = this.state.containerStates[i];
      if (containerState.id === id) return containerState;
    }
    return null;
  }

  /**
   * Generate the container components using JSX.
   * 
   * @returns {Array} An array of Containers read from the level file.
   */
  generateContainers = () => {
    // Use Array.map to create a unique container 
    // for every single container in the level file.
    return this.levelFile.containers.map((container) => {
      const containerState = this.getContainerStateById(container.id);

      // Create a container based on the container state, and pass down
      // props that need to be called from the container.
      return (
        <Container
          key={container.id}
          updateSty={this.updateContainerSty}
          move={this.moveContainer}
          nearestLocation={this.nearestContainerLocation}
          rewriteBlocks={this.rewriteBlocks}
          updateSelfState={this.updateContainerState}
          selfState={containerState}
          gameIsPaused={this.gameIsPaused}
          {...container}
          // Instead of using data={container}, this component
          // uses the spread operator to add clarity when using
          // information from the levelFile through props.
        />
      );
    });
  }

  //-------------------\\
  // Character Methods \\
  //-------------------\\

  /**
   * Update the character style. This method uses the location of the 
   * character and the pixel location of the container.
   */
  updateCharacterSty = () => {
    const characterState = Object.assign({}, this.state.characterState);
    const bs = this.state.blockSize;
    const border = this.getBorder();
    const containerPixelLocation = this.getContainerPixelLocation(
      characterState.container
    );

    // Create a style for the width, height, left, top, and border.
    const xpxRel =
      characterState.location[0] * bs[0] + containerPixelLocation[0] + border;
    const ypxRel =
      characterState.location[1] * bs[1] + containerPixelLocation[1] + border;
    const sty = {
      width: bs[0] * characterState.size[0],
      height: bs[1] * characterState.size[1],
      left: xpxRel,
      top: ypxRel,
      borderWidth: border / 4,
      borderRadius: border / 2,
    };

    // Apply the style to the character and set the state.
    characterState.sty = sty;
    this.setState({
      characterState: characterState,
    });
  };

  /**
   * Move the character based on the keys being pressed. This method
   * is called every frame.
   */
  moveCharacter = () => {
    const { left, right, jump } = this.actions;

    // To prevent unnecessary operations, return if the
    // character is not falling and is not pressing any controls.
    if (!left && !right && !jump && !this.characterIsInAir()) {
      return;
    }
    const characterState = Object.assign({}, this.state.characterState);
    const sty = Object.assign({}, characterState.sty);
    const bs = this.state.blockSize;

    // Precalculate spacing used to the minimum and maximum bounds.
    const border = this.getBorder();
    const containerPixelLocation = this.getContainerPixelLocation(
      characterState.container
    );
    const { width, height } = this.getContainerStateById(
      characterState.container
    ).sty;

    // Within this if/else if, calculate either the minX or the maxX
    // and ensure that the new pixel location is not more/less than it.

    // If the keys pressed move left and not right
    if (left && !right) {
      const minX = containerPixelLocation[0] + border;
      sty.left -= this.toPixelsPerFrame(characterState.xVel, bs[0]);
      sty.left = Math.max(minX, sty.left);
    } 
    // If the keys pressed move right and not left
    else if (!left && right) {
      const maxX = containerPixelLocation[0] + width - sty.width - border;
      sty.left += this.toPixelsPerFrame(characterState.xVel, bs[0]);
      sty.left = Math.min(maxX, sty.left);
    }
    // Note that when both left and right are pressed, nothing happens.

    // If the character is in the air, make sure that they are not jumping
    // above the maximum or falling below the floor.
    if (this.characterIsInAir()) {
      const minY = containerPixelLocation[1] + border;
      const maxY = containerPixelLocation[1] + height - sty.height - border;
      // Note that this line does not work properly because we have
      // already converted the velocity to pixels. If we convert it
      // again, it would be invalid. Instead, opt to just add the
      // velocity to the position.
      //sty.top += this.toPixelsPerFrame(characterState.yVel, bs[1]);

      // Add the velocity to the y axis, confirm that is within the bounds,
      // then increase the acceleration.
      sty.top += characterState.yVel;
      sty.top = Math.max(minY, Math.min(maxY, sty.top));
      characterState.yVel += this.toPixelsPerFrame(characterState.yAcc, bs[1]);
    } 
    // If the character is jumping, set the velocity to be the jumping velocity.
    else if (jump) {
      characterState.yVel = this.toPixelsPerFrame(
        characterState.yJumpVel,
        bs[1]
      );
      sty.top += this.toPixelsPerFrame(characterState.yVel, bs[1]);
    } 
    // Finally, if it is not falling/jumping, it is still. Set the velocity to 0.
    else {
      characterState.yVel = 0;
    }

    characterState.sty = sty;
    characterState.isMoving = false;

    // Finally, set the state of the character. Afterwards,
    // update the character's location.
    this.setState(
      {
        characterState: characterState,
      },
      this.nearestCharacterLocation
    );
  };

  /**
   * Finds the nearest character location and sets the character's
   * location to that in this.state.characterState. Note that
   * this does not necessarily mean that the pixels will line up.
   * However, on resize, the character will snap to the location.
   */
  nearestCharacterLocation = () => {
    const characterState = Object.assign({}, this.state.characterState);
    const { left, top } = characterState.sty;
    const bs = this.state.blockSize;

    // Determine the spacing, which is just the location of the
    // container.
    const containerPixelLocation = this.getContainerPixelLocation(
      characterState.container
    );
    const spacingX = containerPixelLocation[0];
    const spacingY = containerPixelLocation[1];

    // Calculate the new location, which is px/blockSize.
    const newlocation = [
      Math.floor((left - spacingX) / bs[0]),
      Math.floor((top - spacingY) / bs[1]),
    ];

    // Finally, set the new location.
    characterState.location = newlocation;
    this.setState({
      characterState: characterState,
    });
  };

  /**
   * Checks whether or not the character is in the given container.
   *
   * @param {Container} container the container to check
   *
   * @returns {boolean} Whether or not the character is in the given container.
   */
  characterIsIn = (container) => {
    return this.state.characterState.container === container.props.id;
  };

  /**
   * Determine whether or not the character is in the air. This could be
   * falling or jumping.
   *
   * @returns {boolean} Whether or not the character is in the air.
   */
  characterIsInAir = () => {
    const characterState = this.state.characterState;
    const sty = characterState.sty;

    // For spacing
    const border = this.getBorder();
    const containerPixelLocation = this.getContainerPixelLocation(
      characterState.container
    );
    const height = this.getContainerStateById(characterState.container).sty
      .height;

    // Only the max is needed, which is the floor.
    const max = containerPixelLocation[1] + height - sty.height - border;

    // todo: platforms
    return sty.top < max;
  };

  //---------------\\
  // Render Method \\
  //---------------\\

  /**
   * Rendering method.
   *
   * @returns a <div> that represents the playable level.
   */
  render() {
    // Return the level object in index.html.
    // Note that the Containers are generated before the
    // character so that the character naturally is on top
    // of the Containers. Additionally, the Character needs
    // a reference, because it always is in a container.
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
