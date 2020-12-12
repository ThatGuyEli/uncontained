import React, { Component } from 'react';
import Container from './Container.js';
import Character from './Character.js';
import '../../css/Game.css';

import PauseMenu from '../menus/PauseMenu.js';
import HUD from '../menus/HUD.js';
import LevelCompleteMenu from '../menus/LevelCompleteMenu.js';
import LevelFailedMenu from '../menus/LevelFailedMenu.js';

// Note: although I would have liked to break this
// into multiple smaller files, React.js recommends
// state to be as high in the component structure as
// necessary. This state contains information necessary
// to the level, but not to the entire application.

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
    this.levelFile = require(`../../data/levels/level${props.id}.json`);

    // Load the controls.
    this.keys = require('../../data/keybinds.json');

    // Actions handle how keys work. Because the Chromium browser
    // polls keypresses at an inconsistent rate, we must instead
    // rely on initial activation. This initial activation toggles
    // the action, and the game clock reads from this action object,
    // not the key presses.
    this.actions = {
      left: false,
      right: false,
      jump: false,
      jumpOnce: false,
      // This is activated by losing a life, and is disabled after taking effect.
    };

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
      // Whether or not the game is paused. This was originally not in the
      // state because it did not need to rerender; however, with the introduction
      // of the pause menu, rerenders are required (to render/unrender the
      // pause menu).
      paused: false,

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
        yJumpVel: -13,

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

      // Whether or not a container is moving. This is used when the container
      // automatically moves.
      containerIsMoving: false,

      // The score starts at 10000, then decreases by 1 per frame. This means that
      // a score of 0 will occur after 10000 frames. At 60fps, this is 166 2/3 seconds,
      // or ~2.7 minutes. This is ample time to complete the level with a usable leaderboard
      // score.
      score: 10000,

      // Whether or not the level is complete. Note that complete does not
      // indicate success; a combination of this and how many lives the character
      // has determines whether or not the user was successful in the level.
      complete: false,

      // How many lives the user has.
      lives: 3,
    };

    // Populate the container states with default state.
    this.levelFile.containers.forEach((container) => {
      const isHorizontal = container.movement === 'x';
      // Create the default container state.
      const containerState = {
        // ID for identification.
        id: container.id,
        // Color for color identification.
        color: container.color,

        // Whether or not the container moves horizontally
        isHorizontal: isHorizontal,

        // The index and opposite index of the movement axis.
        // For example, if the container movement was 'x', then
        // the index would be 0, because location[0] is the x.
        index: isHorizontal ? 0 : 1,
        antiIndex: isHorizontal ? 1 : 0,

        // Whether or not the component should track the mouse
        // and act accordingly.
        attached: false,

        // The location of the container, because it changes frequently.
        location: container.location,

        // Add the dimensions to the state, not because it changes, but
        // because it is easier to access this way from certain methods.
        dimensions: container.dimensions,

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

        // A list of all of the states of the openings that the container holds.
        openingStates: [],
        // A list of all of the states of the items that the container holds.
        itemStates: [],
        // A list of all of the states of the platforms that the container holds.
        platformStates: [],
      };
      // Red, purple, and orange specific property: isActivated.
      // This determines whether or not red, purple, and orange should
      // do certain things.
      // Red: doors are locked until isActivated
      // Purple/orange: automatically moves positively when isActivated,
      // automatically moves negatively when isActivated.
      switch (container.color) {
        case 'red':
        case 'purple':
        case 'orange':
          containerState.isActivated = false;
          break;
        default:
          break;
      }

      // Add locations to the sideArr.
      const { location, dimensions } = container;
      const antiIndex = containerState.antiIndex;

      for (let i = 0; i < dimensions[antiIndex]; i++) {
        containerState.sideArr.push(location[antiIndex] + i);
      }

      // Add openingStates for each opening.
      container.openings.forEach((opening) => {
        const openingState = {
          id: opening.id,
          container: container.id,
          border: opening.border,
          location: opening.location,
          width: opening.width,
          sty: {},
        };
        containerState.openingStates.push(openingState);
      });

      // Add itemStates for each item.
      container.items.forEach((item) => {
        const isExit = item.itemType === 'exit';
        const itemState = {
          id: item.id,
          container: container.id,
          itemType: item.itemType,
          location: item.location,
          dimensions: isExit ? [2, 2] : [1, 1],
          activated: false,
          sty: {},
          yVel: 0,
          yAcc: 1,
        };
        // specific styles
        switch (item.itemType) {
          case 'lever':
            itemState.lever = {};
            itemState.base = {};
          // Note that there is no break above this line, because
          // both levers and plates should have a color.
          // eslint-disable-next-line
          case 'plate':
            itemState.color = item.color;
            break;
          default:
            break;
        }
        containerState.itemStates.push(itemState);
      });

      // Add platformStates for each platform.
      container.platforms.forEach((platform) => {
        const platformState = {
          id: platform.id,
          container: container.id,
          color: container.color,
          location: platform.location,
          dimensions: platform.dimensions,
          sty: {},
        };
        containerState.platformStates.push(platformState);
      });
      // Add this default container state to the list of containerStates.
      this.state.containerStates.push(containerState);
    });
  }

  /**
   * When the component mounts, update the style of this component.
   * Additionally, add the event listener to update the style whenever
   * the event listener resizes. Finally, add keyboard controls and
   * create a timer.
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
   * the event listeners and stop the timer. This is to prevent
   * unnecessary calls to no-longer-existing components.
   */
  componentWillUnmount() {
    clearInterval(this.timer);
    window.removeEventListener('resize', this.pauseForResize);
    window.removeEventListener('resize', this.updateSty);
  }

  //-----------------------------\\
  // Key Event And Timer Methods \\
  //-----------------------------\\

  /**
   * Handles KeyboardEvents from onKeyDown and onKeyUp.
   *
   * @param {KeyboardEvent} e The keyboard event to handle.
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
        else if (action === 'interact')
          this.interact(this.getInteractableNearCharacter());
        else this.actions[action] = true;
      }
      // Otherwise, set the respective action to false.
      else if (
        e.type === 'keyup' &&
        action !== 'pause' &&
        action !== 'interact'
      ) {
        this.actions[action] = false;
      }
    }
  };

  /**
   * Toggle whether or not the game is paused. On pause, pause the
   * timer. On unpause, start the timer again. If the game is complete
   * (the character interacted with the door), don't do anything.
   */
  togglePause = () => {
    if (this.state.complete) return;
    this.setState({ paused: !this.state.paused }, () => {
      if (this.state.paused) {
        clearInterval(this.timer);
      } else {
        this.timer = setInterval(this.timerFunc, 1000 / 60);
      }
    });
  };

  /**
   * Pause the game and stop the timer.
   */
  pauseForResize = () => {
    this.setState({ paused: true });
    clearInterval(this.timer);
  };

  /**
   * {this.timer} calls this method every frame. Sets
   * the state of the character to moving, then moves
   * the character. Additionally, highlight a nearby
   * interactable object (if any) and unhighlight all
   * other objects.
   */
  timerFunc = () => {
    // Set the character to moving, then move the character.
    this.setState(
      {
        characterState: Object.assign(this.state.characterState, {
          isMoving: true,
        }),
      },
      this.moveCharacter
    );

    // For each item in each container, move it if it is falling (or on the box's case,
    // if it is being pushed on). Additionally, activate any uninteractable items.
    // Also automatically move the container if it is an automove container.
    this.state.containerStates.forEach((containerState) => {
      this.autoMoveContainer(containerState);
      containerState.itemStates.forEach((itemState) => {
        this.moveItem(itemState);
        this.activateUninteractable(containerState, itemState);
      });
    });

    // Highlight an interactable, and unhighlight all other interactables.
    const interactable = this.getInteractableNearCharacter();
    if (interactable !== null && interactable !== undefined) {
      const isOpening = !interactable.hasOwnProperty('itemType');
      this.highlightInteractable(interactable, isOpening);
    }
    this.unhighlightAll(interactable);

    // Decrement the score.
    if (this.state.score > 0)
      this.setState({
        score: this.state.score - 1,
      });
  };

  /**
   * Activate an uninteractable item.
   *
   * @param {object} containerState The containerState that the itemState is in.
   * @param {object} itemState The itemState to activate.
   */
  activateUninteractable = (containerState, itemState) => {
    const characterState = this.state.characterState;
    if (
      itemState.container === characterState.container &&
      !this.itemIsInteractable(itemState)
    ) {
      const activated = this.characterIsCollidingWithItem(
        characterState,
        itemState
      );
      switch (itemState.itemType) {
        case 'plate':
          const newsty = Object.assign({}, itemState.sty);
          const bs = this.state.blockSize;

          // Cycle through the container state and look for a boxState.
          let boxIsColliding;
          for (let i = 0; i < containerState.itemStates.length; i++) {
            const otherItemState = containerState.itemStates[i];
            if (otherItemState.itemType === 'box') {
              boxIsColliding = this.itemsAreColliding(
                otherItemState,
                itemState
              );
              if (boxIsColliding) {
                break;
              }
            }
          }

          // This modifies the height and width of the plate based on if it
          // should be pressed down or up.
          if ((activated || boxIsColliding) && newsty.height !== 0.2 * bs[1]) {
            newsty.height = 0.2 * bs[1];
            newsty.top += 0.2 * bs[1];
          } else if (!activated && newsty.height === 0.2 * bs[1]) {
            newsty.top -= 0.2 * bs[1];
            newsty.height = 0.4 * bs[1];
          }

          // Only make this call if the state is not in sync.
          if (itemState.activated !== (activated || boxIsColliding)) {
            this.updateItemState(itemState.container, itemState.id, {
              sty: newsty,
              activated: activated || boxIsColliding,
            });
            // Toggle when the activation changes.
            this.toggleContainerActivation(itemState.color);
          }
          break;
        case 'collectible':
          // If the collectible is activated, set it to activated permanently.
          // Also, increment the score by 1000.
          if (activated && !itemState.activated) {
            this.setState({
              score: this.state.score + 1000,
            });
            this.updateItemState(itemState.container, itemState.id, {
              activated: activated,
            });
          }
          break;

        case 'spike':
          // If the state is not in sync, update it and act accordingly.
          // This prevents multiple lives from being taken in one collision.
          if (activated !== itemState.activated) {
            // If activated is true, then subtract a life and simulate a jump.
            if (activated) {
              // If the character has been hurt recently (jumpOnce is true),
              // Don't subtract lives.
              const newLives =
                this.state.lives - (this.actions.jumpOnce ? 0 : 1);
              this.actions.jumpOnce = true;
              // If the lives is < 0, tell the user they lose and have to restart.
              if (newLives < 0) {
                this.togglePause();
                this.setState({ complete: true });
              }
              // Set the state. This is done regardless to ensure that a person
              // who completed the level with 0 lives left is still prompted
              // with the level complete menu.
              this.setState({
                lives: newLives,
              });
            }
            // Regardless, resync whether or not the container is activated.
            this.updateItemState(itemState.container, itemState.id, {
              activated: activated,
            });
          }
          break;
        default:
          break;
      }
    }
  };

  /**
   * Unhighlight all of the interactable objects within the container
   * that the character is located in except for a nearby interactable
   * object (if any).
   *
   * @param {Object} interactable The object to not unhighlight (keep highlighted).
   */
  unhighlightAll = (interactable) => {
    // Get the container state of the container that the character is in.
    const containerState = this.getContainerStateById(
      this.state.characterState.container
    );

    for (let i = 0; i < containerState.itemStates.length; i++) {
      const itemState = containerState.itemStates[i];
      if (this.itemIsInteractable(itemState) && itemState !== interactable) {
        const newsty = Object.assign({}, itemState.sty, {
          backgroundColor: '', // default
        });
        this.updateItemState(containerState.id, itemState.id, {
          sty: newsty,
        });
      }
    }

    // Loop through the opening states and if they are not the interactable,
    // then mark it a dark color.
    for (let i = 0; i < containerState.openingStates.length; i++) {
      const openingState = containerState.openingStates[i];
      if (openingState !== interactable) {
        const newsty = Object.assign({}, openingState.sty, {
          backgroundColor: '', // default
        });
        this.updateOpeningState(containerState.id, openingState.id, {
          sty: newsty,
        });
      }
    }
  };

  /**
   * Interact with the given object.
   *
   * @param {Object} interactable The object to interact with
   */
  interact = (interactable) => {
    // Prevent errors and interacting with objects while the game is paused.
    if (
      this.state.paused ||
      interactable === undefined ||
      interactable === null
    )
      return;

    const isOpening = !interactable.hasOwnProperty('itemType');

    if (isOpening) this.interactOpening(interactable);
    else this.interactItem(interactable);
  };

  /**
   * Interact with the opening. This interactable must be
   * an opening, or else the program will throw an error.
   *
   * @param {object} interactable The interactable opening.
   */
  interactOpening = (interactable) => {
    const characterState = this.state.characterState;
    const containerState = this.getContainerStateById(characterState.container);
    // Prepare for opening interaction.
    // Whether or not the border is on a horizontal axis or vertical axis.
    // Note that this is not what the border looks like visually, but rather
    // the side that the border rests on.
    const borderIsHorizontal =
      interactable.border === 'left' || interactable.border === 'right';
    // Index and antiIndex, for referencing both x and y in one line.
    const index = borderIsHorizontal ? 0 : 1;
    const antiIndex = borderIsHorizontal ? 1 : 0;
    // The location of the original location.
    const mainLoc = containerState.location;

    // Get all adjacent containers on the side that the opening is on.
    const adjacentContainers = this.getAdjacentContainers(
      containerState,
      interactable.border
    );
    // Loop through each adjacent container on that side, then
    // loop through all of that container's openings. Even though
    // this could result in a large calculation, it usually does not,
    // as a container likely only has one or two adjacent locations.
    adjacentContainers.forEach((adjacentContainer) => {
      adjacentContainer.openingStates.forEach((openingState) => {
        // Only continue if the openings are on opposite sides. This ensures
        // that minimum calculations are done on each opening is not on.
        // Additionally, return if the color is red and it is not activated.
        if (
          interactable.border !== this.oppositeSide(openingState.border) ||
          (adjacentContainer.color === 'red' && !adjacentContainer.isActivated)
        )
          return;

        // Prepare for interaction.
        const { location: otherLoc, dimensions: otherDim } = adjacentContainer;
        // If the absolute locations are equal, interact with the opening.
        if (
          interactable.location + mainLoc[antiIndex] ===
          openingState.location + otherLoc[antiIndex]
        ) {
          // Before moving, deactivate any activated boxes.
          for (let i = 0; i < containerState.itemStates.length; i++) {
            const itemState = containerState.itemStates[i];
            if (itemState.itemType === 'box' && itemState.activated) {
              this.interactItem(itemState);
            }
          }

          // Determine new location of the character as well.
          let newLocOfIndex;
          // The location of the character in relation to the opening.
          // This ensures that when travelling between containers of
          // different dimensions, the character is still placed
          // next to the opening.
          const charRelLoc =
            characterState.location[antiIndex] - interactable.location;
          const newLocOfAntiIndex = charRelLoc + openingState.location;

          // Set the newLocationOfIndex based on if the character is going
          // "negatively" or "positively"
          switch (interactable.border) {
            case 'top':
            case 'left':
              // If top or left, set the new location to be just within
              // the bounds, which is 2 blocks less than the max dimensions.
              newLocOfIndex = otherDim[index] - 2;
              break;
            case 'bottom':
            case 'right':
              // If bottom or right, the new location only has to be 0.
              newLocOfIndex = 0;
              break;
            default:
              break;
          }

          // Set the new character state, which sets a new container location
          // and new location relative to that container.
          const newCharacterState = Object.assign(characterState, {
            container: adjacentContainer.id,
            location: [
              borderIsHorizontal ? newLocOfIndex : newLocOfAntiIndex,
              borderIsHorizontal ? newLocOfAntiIndex : newLocOfIndex,
            ],
          });

          // Set the state of the character, then update its style (rerender it).
          this.setState(
            {
              characterState: newCharacterState,
            },
            this.updateCharacterSty
          );

          // Finally, unhighlight the interactable.
          const newsty = Object.assign({}, interactable.sty);
          newsty.backgroundColor = ''; // default
          this.updateOpeningState(containerState.id, interactable.id, {
            sty: newsty,
          });
        }
      });
    });
  };

  /**
   * Interact with the item. This interactable must be
   * an item, or else the program will throw an error.
   *
   * @param {object} interactable The interactable item.
   */
  interactItem = (interactable) => {
    // Flip the activated boolean, then act based on that.
    const { lever, sty, container, id, color, itemType } = interactable;
    const activated = !interactable.activated;

    switch (itemType) {
      // If the character is interacting with an exit, finish the level.
      case 'exit':
        this.togglePause();
        this.setState({
          complete: true,
        });
        break;

      // If the character is interacting with a lever, switch lever.
      case 'lever':
        const itemLever = Object.assign({}, lever);
        const plusOrMinus = activated ? -1 : 1;
        itemLever.transform = `rotate(${activated ? 135 : 45}deg)`;
        itemLever.left =
          sty.left - (plusOrMinus * itemLever.width) / (2 * Math.SQRT2);
        this.updateItemState(container, id, {
          lever: itemLever,
          activated: activated,
        });
        this.toggleContainerActivation(color);
        break;
      case 'box':
        this.updateItemState(container, id, {
          activated: activated,
        });
        break;
      default:
        break;
    }
  };

  /**
   * Toggles isActivated in each container with that color.
   *
   * @param {string} color The color of the containers to activate. Can only be red, purple, or orange.
   */
  toggleContainerActivation = (color) => {
    for (let i = 0; i < this.state.containerStates.length; i++) {
      const containerState = this.state.containerStates[i];
      // If the container is of the correct color
      if (containerState.color === color) {
        this.updateContainerState(containerState.id, {
          isActivated: !containerState.isActivated,
        });
      }
    }
  };

  /**
   * Get the reverse side. If the side is top, return bottom,
   * and vice versa. If the side is left, return right, and
   * vice versa.
   *
   * @param {string} side The side to get the reverse of.
   *
   * @returns {string} The opposite side.
   */
  oppositeSide = (side) => {
    switch (side) {
      case 'top':
        return 'bottom';
      case 'bottom':
        return 'top';
      case 'left':
        return 'right';
      case 'right':
        return 'left';
      default:
        return null;
    }
  };

  /**
   * General accessor. This is used in Container, which cannot
   * normally access this.state.paused.
   *
   * @returns {boolean} Whether or not the game is paused.
   */
  gameIsPaused = () => {
    return this.state.paused;
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
   * calls this.updateBlockSize().
   */
  updateSty = () => {
    // Note: although Object.assign could be used, it is
    // more efficient to simply list the style changes needed.
    const newsty = {};
    const { innerWidth, innerHeight } = window;

    // set both border radius and size to border.
    const border = (innerHeight + innerWidth) / 200;
    newsty.borderRadius = border;
    newsty.borderWidth = border;

    const doubleBorder = 2 * border;
    const fourThirdsHeight = (innerHeight * 4) / 3;

    // if the width of the viewport is less than 4/3 of the height,
    // base the style off of the width
    if (innerWidth < fourThirdsHeight) {
      const threeFourthsWidth = (innerWidth * 3) / 4;
      const margin = (innerHeight - threeFourthsWidth) / 2;

      Object.assign(newsty, {
        width: innerWidth - doubleBorder,
        height: threeFourthsWidth - doubleBorder,
        marginTop: margin,
        marginBottom: margin,
        marginLeft: 0,
        marginRight: 0,
      });
    }
    // otherwise, base the style off of the height
    else {
      const margin = (innerWidth - fourThirdsHeight) / 2;

      Object.assign(newsty, {
        width: fourThirdsHeight - doubleBorder,
        height: innerHeight - doubleBorder,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: margin,
        marginRight: margin,
      });
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
    const { marginLeft: x, marginTop: y, borderWidth: border } = this.state.sty;

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
  };

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
    // Return oldLocation if theselfState.isHorizontal movement is invalid to prevent
    // NaN and underfined errors.
  };

  /**
   * Move the container based on its current position and the mouse's
   * location. This method is passed down to Container. Note that this is
   * the mouse version of move container.
   *
   * @param {container} container the container to move
   * @param {MouseEvent} e the mouse event to move the container based on
   */
  moveContainer = (container, e) => {
    // If the character is in the container,
    // or if the game is paused,
    // don't move.
    const containerState = this.getContainerStateById(container.props.id);
    if (this.state.paused || this.characterIsIn(containerState)) return;

    const newsty = Object.assign({}, containerState.sty);

    // Depending on if the movement is x or y, move the container
    // the difference as the mouse moves.
    const border = this.state.sty.borderWidth;
    const {
      id,
      mouseOffset: mo,
      location,
      isHorizontal,
      index,
    } = containerState;

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
    this.updateContainerState(id, {
      isMovingPos: offset - mo > 0,
    });

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
    const ccm = this.containerCanMove(containerState);

    // If it can actually move, set the calculated location
    // to the newsty and set the location to the nearest
    // block.
    const newloc = Object.assign([], location);
    if (ccm) {
      newsty[isHorizontal ? 'left' : 'top'] = newpx;
      newloc[index] = this.nearestContainerLocation(
        containerState,
        newpx
      ).newLocation;
    }
    // Finally, set the state.
    this.updateContainerState(id, {
      sty: newsty,
      isMoving: false,
      location: newloc,
    });
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
   * @param {object} containerState The containerState to move.
   *
   * @returns {boolean} Whether or not the container can move.
   */
  containerCanMove = (containerState) => {
    const {
      location,
      dimensions,
      isHorizontal,
      index,
      antiIndex,
      isMovingPos: pos,
    } = containerState;

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
   * Automatically move the container. This is used for orange and purple
   * containers.
   * Note that this uses the containerState and not the container itself, because
   * it is not required.
   *
   * @param {object} containerState The state of the container to automatically move.
   *
   */
  autoMoveContainer = (containerState) => {
    // Check to make sure that the container is orange/purple.
    // Even though this check is also called before this method
    // is called, it will help
    // in case this method is called elsewhere.
    const color = containerState.color;
    if (
      !this.state.containerIsMoving &&
      (color === 'purple' || color === 'orange') &&
      this.containerCanAutoMove(containerState)
    ) {
      this.rewriteBlocks(containerState, false);
      const {
        id,
        isHorizontal,
        index,
        location,
        dimensions,
        isActivated,
        sty,
      } = containerState;
      const newloc = Object.assign([], location);

      // If the container is activated, move it positively.
      let plusOrMinus = isActivated ? 1 : -1;

      // Move the container by one block in its specified direction.
      newloc[index] += plusOrMinus;
      // Prevent the container from going out of bounds.
      newloc[index] = Math.max(
        0,
        Math.min(
          this.levelFile.dimensions[index] - dimensions[index],
          newloc[index]
        )
      );

      // If the location is the same as before (ie a bound has been hit)
      // Set plusOrMinus to 0 so that the style doesn't change.
      if (location[index] === newloc[index]) plusOrMinus = 0;

      // Check to make sure the container can automatically move,
      // then set the state if it can.
      const newsty = Object.assign({}, sty);
      const bs = this.state.blockSize;
      const topOrLeft = isHorizontal ? 'left' : 'top';
      newsty[topOrLeft] += plusOrMinus * bs[index];
      this.updateContainerState(id, {
        sty: newsty,
        location: newloc,
      });
      this.rewriteBlocks(containerState, true);
    }
  };

  /**
   * Check if the container can automatically move. This code is very similar
   * to containerCanMove, but is different because it checks for the container's
   * color and uses isActivated as opposed to and
   * isMovingPos, respectively. However, the logic is the same, so check
   * containerCanMove for the logic explanations.
   *
   * @param {object} containerState The state of the container to check.
   *
   * @returns {boolean} Whether or not this container can automatically move.
   */
  containerCanAutoMove = (containerState) => {
    const color = containerState.color;
    if (
      !this.characterIsIn(containerState) &&
      (color === 'purple' || color === 'orange')
    ) {
      const {
        dimensions,
        location,
        isHorizontal,
        isActivated: pos,
        index,
        antiIndex,
      } = containerState;

      let adjacentLocation = pos
        ? Math.min(
            location[index] + dimensions[index],
            this.levelFile.dimensions[index] - 1
          )
        : Math.max(location[index] - 1, 0);

      for (let i = 0; i < dimensions[antiIndex]; i++) {
        const x = isHorizontal ? adjacentLocation : location[0] + i;
        const y = isHorizontal ? location[1] + i : adjacentLocation;
        if (this.state.blocks[x][y]) {
          return false;
        }
      }
      return true;
    } else return false;
    // The container is not purple or orange, so it cannot automove. Return false.
  };

  /**
   * Either write {true} or {false} blocks to {this.blocks}.
   * based on the parameter {isSetting}.
   *
   * @param {Object} containerState  the state of the container to rewrite blocks for
   * @param {Boolean} isSetting whether or not the Container is being attached or detached
   * @param {Function} callback the function that will be called back after this function finishes
   */
  rewriteBlocks = (containerState, isSetting, callback) => {
    const { location, dimensions } = containerState;
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
   * @param {object} containerState The state of the container to find the nearest location of.
   * @param {number} oldPixelLocation The previous pixel location
   */
  nearestContainerLocation = (containerState, oldPixelLocation) => {
    const {
      sideArr,
      isMovingPos: pos,
      dimensions,
      isHorizontal,
      index,
    } = containerState;

    // Get spacing so the border and whitespace isn't used
    // in the calculations.
    const { marginLeft: x, marginTop: y, borderWidth: border } = this.state.sty;
    const spacing = (isHorizontal ? x : y) + border;

    // Determine whether the x or y blockSize should be used.
    // Note that this shouldn't matter too much but can still
    // prevent the container from snapping to the wrong location.

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
  };

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
          updateOpeningSty={this.updateOpeningSty}
          updateItemSty={this.updateItemSty}
          updatePlatformSty={this.updatePlatformSty}
          characterIsIn={this.characterIsIn}
          toggleIsMoving={() => {
            this.setState({ containerIsMoving: !this.state.containerIsMoving });
          }}
          {...container}
          // Instead of using data={container}, this component
          // uses the spread operator to add clarity when using
          // information from the levelFile through props.
        />
      );
    });
  };

  /**
   * Generates an array of containerStates adjacent to the given containerState
   * on the given side. For example, if a container is touching two containers
   * on its right side, this method will return an array of those two containerStates.
   *
   * @param {object} containerState The containerState to find adjacent containers from.
   * @param {string} side The side to find adjacent containers from.
   *
   * @returns {Array} An array of containerStates of adjacent containers.
   */
  getAdjacentContainers = (containerState, side) => {
    // Access x and y in one variable.
    const sideIsHorizontal = side === 'left' || side === 'right';
    const index = sideIsHorizontal ? 0 : 1;
    const antiIndex = sideIsHorizontal ? 1 : 0;

    // Get the location and dimensions of the main container.
    const { location: mainLoc, dimensions: mainDim } = containerState;

    // Filter the containerStates based on whether or not they are adjacent,
    // then return it.
    return this.state.containerStates.filter((otherContainerState) => {
      // Get the location and dimensions of the other container.
      const { location: otherLoc, dimensions: otherDim } = otherContainerState;

      // adjTopOrLeft and adjRightOrBottom determine if the containers'
      // important axis (remember, using index ensures that x and y work)
      // are only one apart. The location + dimensions of a container will
      // be one above the location of its edge. This allows us to simply add
      // the location and dimensions and compare it to the other location.
      const adjTopOrLeft =
        (side === 'top' || side === 'left') &&
        // This infers that the other container is above / to the left of it.
        mainLoc[index] === otherLoc[index] + otherDim[index];
      const adjRightOrBottom =
        (side === 'right' || side === 'bottom') &&
        // This infers that the other container is below / to the right of it.
        mainLoc[index] + mainDim[index] === otherLoc[index];

      // Then, this determines if the containers are actually touching. The
      // booleans above only determine if they share one axis; they could
      // but not be touching, such as a diagonal square on a checkerboard.
      // This method ensures that the first edge (top or left) of one
      // container is not after the last edge of the other container.
      // In essence, this boolean gives the containers a range that they must
      // be in on the opposite axis.
      const adj =
        mainLoc[antiIndex] < otherLoc[antiIndex] + otherDim[antiIndex] &&
        mainLoc[antiIndex] + mainDim[antiIndex] > otherLoc[antiIndex];

      // Finally, return the three booleans combines. Only one of the initial
      // two need to be correct, because only one of them *can* be correct.
      return (adjTopOrLeft || adjRightOrBottom) && adj;
    });
  };

  //-----------------\\
  // Opening Methods \\
  //-----------------\\
  /**
   * Update the style of a given opening. Called from Opening, which
   * passes to Container, which passes to here.
   *
   * @param {Container} container The container that holds the opening.
   * @param {Opening} opening The opening to update.
   */
  updateOpeningSty = (container, opening) => {
    // Prepare to calculate based on the dimensions of the container
    // And the location/width of the opening.
    const { dimensions: cdimensions } = container.props;
    const { location, width: doorWidth } = opening.props;
    const bs = this.state.blockSize;
    const border = this.state.sty.borderWidth;

    // Use a switch statement to determine the following variables.
    // Note: I would have liked to compress this down, but all of the
    // sides have too different results that it is too difficult to do
    // nicely. Other examples of reduced code are most of the methods
    // that use "index" or "isHorizontal".
    let leftLoc, topLoc, width, height;
    switch (opening.props.border) {
      case 'top':
        leftLoc = location * bs[0];
        topLoc = 0;
        width = doorWidth * bs[0];
        height = border;
        break;
      case 'bottom':
        leftLoc = location * bs[0];
        topLoc = cdimensions[1] * bs[1] - border;
        width = doorWidth * bs[0];
        height = border;
        break;
      case 'left':
        leftLoc = 0;
        topLoc = location * bs[1];
        width = border;
        height = doorWidth * bs[1];
        break;
      case 'right':
        leftLoc = cdimensions[0] * bs[0] - border;
        topLoc = location * bs[1];
        width = border;
        height = doorWidth * bs[1];
        break;
      default:
        return;
    }

    // Create a style using this, then update the opening state.
    const newsty = {
      width: width,
      height: height,
      left: leftLoc - border,
      top: topLoc - border,
    };

    this.updateOpeningState(container.props.id, opening.props.id, {
      sty: newsty,
    });
  };

  /**
   * Update the openingState with the given container id and opening id.
   * This does not replace the state with newstate, but rather simply
   * assigns updated values.
   *
   * @param {number} containerid The id of the container that the state is in.
   * @param {number} openingid The id of the opening to update.
   * @param {object} newstate The state to set.
   */
  updateOpeningState = (containerid, openingid, newstate) => {
    // Create a modifiable copy of the containerState.
    const containerState = Object.assign(
      {},
      this.getContainerStateById(containerid)
    );

    // Iterate through the openingStates of the container.
    for (let i = 0; i < containerState.openingStates.length; i++) {
      const openingState = containerState.openingStates[i];
      // Once the desired id is found, update the values of the openingState
      // and set the containerState with this state.
      if (openingState.id === openingid) {
        containerState.openingStates[i] = Object.assign(openingState, newstate);
        this.updateContainerState(containerid, containerState);
      }
    }
  };

  /**
   * Get the openingState with the given id from the given containerState.
   *
   * @param {object} containerState The containerState to search through for the openingState.
   * @param {number} id The id of the requested openingState.
   *
   * @returns {object} The requested openingState, or none.
   */
  getOpeningStateById = (containerState, id) => {
    // Iterate through the opening states until the requested openingState is found.
    for (let i = 0; i < containerState.openingStates.length; i++) {
      const openingState = containerState.openingStates[i];
      if (openingState.id === id) return openingState;
    }
  };

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
    const border = this.state.sty.borderWidth;
    const halfBorder = border / 2;
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
      borderWidth: halfBorder,
      borderRadius: halfBorder,
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
    const { left, right, jump, jumpOnce } = this.actions;

    // To prevent unnecessary operations, return if the
    // character is not falling and is not pressing any controls.
    if (!left && !right && !jump && !this.characterIsInAir()) {
      return;
    }
    const characterState = Object.assign({}, this.state.characterState);
    const sty = Object.assign({}, characterState.sty);
    characterState.sty = sty;
    const bs = this.state.blockSize;

    // Precalculate spacing used to the minimum and maximum bounds.
    const border = this.state.sty.borderWidth;
    const containerPixelLocation = this.getContainerPixelLocation(
      characterState.container
    );
    const containerState = this.getContainerStateById(characterState.container);

    // If a box is attached to the character, prepare to move that as well.
    let boxState, boxSty;
    for (let i = 0; i < containerState.itemStates.length; i++) {
      const itemState = containerState.itemStates[i];
      if (itemState.itemType === 'box' && itemState.activated) {
        // Check to make sure that the box is still in range. If it is not,
        // deactivate it. Because the box could only leave range if the character is
        // moving, this is done here.
        if (this.objectIsInRange(itemState.location, 3, 3)) {
          boxState = Object.assign({}, itemState);
          boxSty = Object.assign({}, boxState.sty);
          boxState.sty = boxSty;
        } else {
          this.interactItem(itemState);
        }
      }
    }

    // Normally, this would be within the if (left && !right) statement,
    // but because of platforms this has been moved so that the else if
    // can access it.
    const minX = containerPixelLocation[0] + border;

    // Within this if/else if, calculate either the minX or the maxX
    // and ensure that the new pixel location is not more/less than it.

    // The following code relates to the x axis.
    // If the keys pressed move left and not right
    if (left && !right) {
      const deltaX = this.toPixelsPerFrame(characterState.xVel, bs[0]);
      sty.left -= deltaX;

      // Implement very similar logic to the code below this if
      // statement for the activated box.
      if (boxState !== undefined) {
        boxSty.left -= deltaX;
        const platformState = this.itemIsCollidingWithPlatform(boxState);
        if (platformState !== undefined && platformState !== null) {
          const { left: pLeft, width: pWidth } = platformState.sty;
          boxSty.left = pLeft + pWidth;
        } else {
          boxSty.left = Math.max(0, boxSty.left);
        }
      }

      // If the character is trying to move left and colliding with the platform,
      // set its position to be the end of the platform.
      const platformState = this.characterIsCollidingWithPlatform(
        characterState
      );
      if (platformState !== undefined && platformState !== null) {
        const { left: pLeft, width: pWidth } = platformState.sty;
        sty.left = minX + pLeft + pWidth;
      } else {
        sty.left = Math.max(minX, sty.left);
      }
    }
    // If the keys pressed move right and not left
    else if (!left && right) {
      const maxX =
        containerPixelLocation[0] +
        containerState.sty.width -
        sty.width -
        border;
      const deltaX = this.toPixelsPerFrame(characterState.xVel, bs[0]);
      sty.left += deltaX;

      // Implement very similar logic to the code below this if
      // statement for the activated box.
      if (boxState !== undefined) {
        boxSty.left += deltaX;
        const platformState = this.itemIsCollidingWithPlatform(boxState);
        if (platformState !== undefined && platformState !== null) {
          const { left: pLeft } = platformState.sty;
          boxSty.left = pLeft - sty.width;
        } else {
          const boxMaxX = containerState.sty.width - boxSty.width - 2 * border;
          boxSty.left = Math.min(boxMaxX, boxSty.left);
        }
      }

      // If the character is trying to move right and colliding with the platform,
      // set its position to be the end of the platform.
      const platformState = this.characterIsCollidingWithPlatform(
        characterState
      );
      if (platformState !== undefined && platformState !== null) {
        const { left: pLeft } = platformState.sty;
        sty.left = minX + pLeft - sty.width;
      } else {
        sty.left = Math.min(maxX, sty.left);
      }
    }
    // Note that when both left and right are pressed, nothing happens.

    // The following code relates to the y axis.
    // If the character is in the air, make sure that they are not jumping
    // above the maximum or falling below the floor.
    if (this.characterIsInAir() && !this.actions.jumpOnce) {
      const minY = containerPixelLocation[1] + border;
      const maxY =
        containerPixelLocation[1] +
        containerState.sty.height -
        sty.height -
        border +
        1;
      // Note that this line does not work properly because we have
      // already converted the velocity to pixels. If we convert it
      // again, it would be invalid. Instead, opt to just add the
      // velocity to the position.
      //sty.top += this.toPixelsPerFrame(characterState.yVel, bs[1]);

      // Add the velocity to the y axis, confirm that is within the bounds,
      // then increase the acceleration.
      sty.top += characterState.yVel;
      if (boxState !== undefined) {
        boxSty.top += characterState.yVel;
        const platformState = this.itemIsCollidingWithPlatform(boxState);
        if (platformState !== undefined && platformState !== null) {
          // If the velocity is positive, the character is falling downwards.
          // In that case, move the activated box to the top of the platform.
          if (characterState.yVel > 0) {
            boxSty.top = platformState.sty.top - boxSty.height - 1;
          }
          // Otherwise, the character is moving upwards (from a jump).
          // In that case, the move the activated box to the bottom of the platform.
          else {
            boxSty.top = platformState.sty.top + platformState.sty.height;
          }
        } else {
          const boxMaxY =
            containerState.sty.height - boxSty.height - 2 * border + 1;
          boxSty.top = Math.max(0, Math.min(boxMaxY, boxSty.top));
        }
      }

      const platformState = this.characterIsCollidingWithPlatform(
        characterState
      );
      if (platformState !== undefined && platformState !== null) {
        // If the velocity is positive, the character is falling downwards.
        // In that case, move the character to the top of the platform.
        if (characterState.yVel > 0) {
          sty.top = minY + platformState.sty.top - sty.height - 2;
        }
        // Otherwise, the character is moving upwards (from a jump).
        // In that case, the move the character to the bottom of the platform.
        else {
          sty.top = minY + platformState.sty.top + platformState.sty.height + 1;
        }
        characterState.yVel = 0;
      } else {
        sty.top = Math.max(minY, Math.min(maxY, sty.top));
        characterState.yVel += this.toPixelsPerFrame(
          characterState.yAcc,
          bs[1]
        );
      }
    }
    // If the character is jumping, set the velocity to be the jumping velocity.
    else if (jump || jumpOnce) {
      characterState.yVel = this.toPixelsPerFrame(
        characterState.yJumpVel,
        bs[1]
      );

      sty.top += characterState.yVel;
      if (boxState !== undefined) boxSty.top += characterState.yVel;
      this.actions.jumpOnce = false;
    }
    // Finally, if it is not falling/jumping, it is still. Set the velocity to 0.
    else {
      characterState.yVel = 0;
    }

    characterState.isMoving = false;

    // Finally, set the state of the character. Afterwards,
    // update the character's location.

    if (boxState !== undefined) {
      this.nearestItemLocation(boxState);
      this.updateItemState(boxState.container, boxState.id, boxState);
    }
    this.setState(
      {
        characterState: characterState,
      },
      this.nearestCharacterLocation
    );
  };

  /**
   * Determine whether the charcter is colliding with any platform
   * within its container. Note that this is different code than
   * this.itemIsCollidingWithPlatform because of how the Character's location
   * is calculated. Note that this requries a temporary characterState because
   * these changes have not yet been finalized.
   *
   * @param {object} tempCharacterState The temporary characterState.
   *
   * @returns {object} the platformState that the character is colliding with.
   */
  characterIsCollidingWithPlatform = (tempCharacterState) => {
    const containerState = this.getContainerStateById(
      tempCharacterState.container
    );
    for (let i = 0; i < containerState.platformStates.length; i++) {
      const platformState = containerState.platformStates[i];
      if (
        this.characterIsCollidingWithItem(tempCharacterState, platformState)
      ) {
        return platformState;
      }
    }
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

  // Calculate the distance from the character to the object
  // to interact with
  /**
   * Determine whether or not an object is in range of the character to interact with.
   *
   * @param {Array} objectLocation The location of the object (centered and in [x,y] format)
   * @param {number} xRange The maximum distance the object can be to be in range on the x axis.
   * @param {number} yRange The maximum distance the object can be to be in range on the y axis.
   *
   * @returns {boolean} Whether or not the object is in range.
   */
  objectIsInRange = (objectLocation, xRange, yRange) => {
    const characterState = this.state.characterState;
    const deltaX = characterState.location[0] - objectLocation[0];
    const deltaY = characterState.location[1] - objectLocation[1];
    return Math.abs(deltaX) <= xRange && Math.abs(deltaY) <= yRange;
  };

  /**
   * Get a nearby interactable near the character. The priority is as follows:
   * exit, opening (in order of instantiation), levers (in order of instantiation).
   *
   * @returns {object} the state of the interactable object near the character.
   */
  getInteractableNearCharacter = () => {
    // Prepare to iterate over the openingStates of the container that the
    // character is in.
    const characterState = this.state.characterState;
    const containerState = this.getContainerStateById(characterState.container);

    // Note: this will not throw any errors even when items are nearby;
    // items will simply take priority on interaction. Similarly,
    // objects instantiated first will take priority. This does not have
    // a major impact on the game as long as the level is designed to have
    // a normal distance between openings and items.

    for (let i = 0; i < containerState.itemStates.length; i++) {
      const itemState = containerState.itemStates[i];
      // Prevent items such as collectibles from being interacted with, because
      // they can only be used through nearby movement.
      if (!this.itemIsInteractable(itemState)) continue;
      // Taking the middle of the object when the object is small produces
      // a larger offset than desired. itemState.location works just fine.
      //const { location, dimensions } = itemState;
      //// middle of the object
      //const iLocation = [
      //  location[0] + dimensions[0] / 2,
      //  location[1] + dimensions[1] / 2,
      //];
      if (this.objectIsInRange(itemState.location, 1, 1)) {
        return itemState;
      }
    }

    // Iterate.
    for (let i = 0; i < containerState.openingStates.length; i++) {
      // For openings, the interactable distance comes from the middle
      // of the opening, not the top/left of it. This calculates that.
      const openingState = containerState.openingStates[i];
      // The maximum distance from the middle.
      const parallelRange = openingState.width / 2;
      // The maximum distance away from the middle, not along the line.
      const perpendicularRange = 2;
      const middle = openingState.location + parallelRange - 1;

      let olocation, xRange, yRange;
      // Like some other methods, this result is a little too complicated
      // to compress efficiently.
      switch (openingState.border) {
        case 'top':
          olocation = [middle, 0];
          xRange = parallelRange;
          yRange = perpendicularRange;
          break;
        case 'bottom':
          olocation = [middle, containerState.dimensions[1]];
          xRange = parallelRange;
          yRange = perpendicularRange;
          break;
        case 'left':
          olocation = [0, middle];
          xRange = perpendicularRange;
          yRange = parallelRange;
          break;
        case 'right':
          olocation = [containerState.dimensions[0], middle];
          xRange = perpendicularRange;
          yRange = parallelRange;
          break;
        default:
          break;
      }
      // Determine if the openingState is within range. If true,
      // return the openingState.
      if (this.objectIsInRange(olocation, xRange, yRange)) {
        return openingState;
      }
    }
  };

  /**
   * Highlights the interactable object. Requires a specification of whether or not
   * the object is an opening.
   *
   * @param {object} interactable The object to highlight.
   * @param {boolean} isOpening Whether or not this object is an opening or another item.
   */
  highlightInteractable = (interactable, isOpening) => {
    // Prevent errors.
    if (interactable !== null && interactable !== undefined) {
      const green = '#a3be8c';
      const yellow = '#ebcb8b';
      const red = '#bf616a';
      // By default, it will highlight green.
      let color = green;

      const containerState = this.getContainerStateById(
        this.state.characterState.container
      );

      // If the interactable is an opening, do some checks.
      // This is the same logic as interactOpening, but this time,
      // don't do anything but change the highlight color.
      // The logic is explained at this.interactOpening().
      if (isOpening) {
        color = yellow;
        const borderIsHorizontal =
          interactable.border === 'left' || interactable.border === 'right';
        const antiIndex = borderIsHorizontal ? 1 : 0;
        const mainLoc = containerState.location;

        const adjacentContainers = this.getAdjacentContainers(
          containerState,
          interactable.border
        );

        adjacentContainers.forEach((adjacentContainer) => {
          adjacentContainer.openingStates.forEach((openingState) => {
            // Check validity per interaction.
            const { location: otherLoc, color: otherColor } = adjacentContainer;

            // Whether or not the borders are lined up.
            const linedUp =
              interactable.location + mainLoc[antiIndex] ===
              openingState.location + otherLoc[antiIndex];

            // If the container is lined up, set the highlight to green unless
            // the color is red and it is not activated.
            // Otherwise, set the highlight to yellow, because it is not lined up.
            if (linedUp) {
              if (otherColor === 'red' && !adjacentContainer.isActivated) {
                color = red;
              } else {
                color = green;
              }
            }
          });
        });
      }

      // Copy the style, then update it.
      const newsty = Object.assign({}, interactable.sty, {
        backgroundColor: color,
      });
      if (isOpening) {
        this.updateOpeningState(containerState.id, interactable.id, {
          sty: newsty,
        });
      } else {
        this.updateItemState(containerState.id, interactable.id, {
          sty: newsty,
        });
      }
    }
  };

  /**
   * Checks whether or not the character is in the given container.
   *
   * @param {object} containerState the container to check
   *
   * @returns {boolean} Whether or not the character is in the given container.
   */
  characterIsIn = (containerState) => {
    return this.state.characterState.container === containerState.id;
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

    // Make a temporary characterState to test if it would be colliding with a platform
    // as it falls.
    const tempCharacterState = Object.assign({}, characterState);
    const tempsty = Object.assign({}, tempCharacterState.sty);
    tempCharacterState.sty = tempsty;
    tempsty.top += 1; // To test if it is going to collide immediately.

    // If the character and platform would collide, return false. Otherwise, calculate
    // whether or not the character is hitting the ground.
    const platformState = this.characterIsCollidingWithPlatform(
      tempCharacterState
    );
    if (platformState !== undefined && platformState !== null) {
      return false;
    }

    // For spacing
    const border = this.state.sty.borderWidth;
    const containerPixelLocation = this.getContainerPixelLocation(
      characterState.container
    );
    const height = this.getContainerStateById(characterState.container).sty
      .height;

    // Only the max is needed, which is the floor.
    const max = containerPixelLocation[1] + height - sty.height - border;
    return sty.top < max;
  };

  //--------------\\
  // Item Methods \\
  //--------------\\
  /**
   * Update the style of the Item. Like Openings, this method is
   * called from Item, passed through Container, and passed up to here.
   *
   * @param {Container} container The Container that holds the Item.
   * @param {Item} item The Item to update the style of.
   */
  updateItemSty = (container, item) => {
    const dimensions = item.dimensions;
    const location = item.props.selfState.location;
    const bs = this.state.blockSize;

    const newsty = {
      width: dimensions[0] * bs[0],
      height: dimensions[1] * bs[1],
      left: location[0] * bs[0],
      top: location[1] * bs[1],
    };
    const border = this.state.sty.borderWidth;
    const halfBorder = border / 2;

    // Apply item-specific styling. Note that this is not the top/left,
    // which has to be done in this.moveItem().
    switch (item.props.itemType) {
      // If the item is a plate, make its height 1/4 and give it rounded corners.
      case 'plate':
        newsty.height *= 0.4;
        newsty.borderTopLeftRadius = halfBorder;
        newsty.borderTopRightRadius = halfBorder;
        newsty.borderWidth = border / 4;
        break;

      // If the item is an exit, give it a border and round the top corners.
      case 'exit':
        newsty.borderWidth = border;
        newsty.borderTopLeftRadius = border;
        newsty.borderTopRightRadius = border;
        break;

      // If the item is a box, round all the corners. This has a similar shape
      // to the character.
      case 'box':
        newsty.borderRadius = halfBorder;
        newsty.borderWidth = halfBorder;
        break;

      // The collectible should have a border width equal to the box and character.
      case 'collectible':
        newsty.borderWidth = halfBorder;
        break;

      // The lever has two special <div>s within it, so make specific modifications.
      // The lever itself should be a diagonal line with rounded corners, like a pill.
      // The base should have rounded top corners and half the normal height.
      case 'lever':
        const lever = {
          width: newsty.width,
          height: newsty.height / 4,
          transform: `rotate(${item.props.selfState.activated ? 135 : 45}deg)`,
          borderRadius: newsty.width / 2,
          borderWidth: border / 4,
        };
        const base = {
          height: newsty.height * 0.5,
          borderTopLeftRadius: border,
          borderTopRightRadius: border,
        };
        this.updateItemState(container.props.id, item.props.id, {
          lever: lever,
          base: base,
        });

        newsty.height *= 0.5;
        break;

      // For spikes, we want to use the triangle-by-border CSS trick.
      case 'spike':
        newsty.borderLeftWidth = bs[0] / 2;
        newsty.borderRightWidth = bs[0] / 2;
        newsty.borderBottomWidth = bs[1];
        break;

      default:
        break;
    }

    // Update the style, now that it has been modified for each type of item.
    this.updateItemState(container.props.id, item.props.id, {
      sty: newsty,
    });
  };

  /**
   * Update the item state.
   *
   * @param {number} containerid The id of the container that has the item.
   * @param {number} itemid The id of the item to update.
   * @param {object} newstate The state to update the item with.
   */
  updateItemState = (containerid, itemid, newstate) => {
    // Get a mutatable copy of the containerState.
    const containerState = Object.assign(
      {},
      this.getContainerStateById(containerid)
    );

    // Cycle through the itemStates until one with a matching id is found.
    for (let i = 0; i < containerState.itemStates.length; i++) {
      const itemState = containerState.itemStates[i];
      if (itemState.id === itemid) {
        containerState.itemStates[i] = Object.assign(itemState, newstate);
        this.updateContainerState(containerid, containerState);
      }
    }
  };

  /**
   * Check whether or not an item is interactable. If the item is
   * an exit, a box, or a lever, return true.
   *
   * @param {object} itemState The item to check.
   *
   * @returns {boolean} Whether or not the item is interactable.
   */
  itemIsInteractable = (itemState) => {
    switch (itemState.itemType) {
      case 'exit':
      case 'lever':
      case 'box':
        return true;
      default:
        return false;
    }
  };

  /**
   * Determine whether or not a given item is in the air. This could be
   * falling or jumping.
   *
   * @param {object} itemState The item to check.
   *
   * @returns {boolean} Whether or not the item is in the air.
   */
  itemIsInAir = (itemState) => {
    // Prevent the collectible from falling, as it is supposed to float.
    if (itemState.itemType === 'collectible') return false;
    const sty = itemState.sty;

    // For spacing
    const border = this.state.sty.borderWidth;
    const height = this.getContainerStateById(itemState.container).sty.height;

    // Only the max is needed, which is the floor.
    const max = height - sty.height - 2 * border + 1;

    return sty.top < max;
  };

  /**
   * Move an item, only downwards due to gravity.
   * @param {object} initItemState The item to move.
   */
  moveItem = (initItemState) => {
    // NOTE: Although many other methods do not need a full copy of an item
    // state, it is necessary for this method to pass the modified state
    // *before* changes are made, so that methods can check the validation
    // of said changes.

    const itemState = Object.assign({}, initItemState);

    // If the item is an activated box, let the character movement dictate it.
    // OR
    // If the item is not in the air, and its velocity is not 0,
    // set its velocity to 0.
    const inAir = this.itemIsInAir(itemState);
    if (
      (itemState.itemType === 'box' && itemState.activated) ||
      (!inAir && itemState.yVel !== 0)
    ) {
      itemState.yVel = 0;
      this.nearestItemLocation(itemState);
      this.updateItemState(itemState.container, itemState.id, {
        yVel: 0,
      });
      return;
    }

    if (!inAir) {
      return;
    }

    // Make the style mutable.
    const sty = Object.assign({}, itemState.sty);
    itemState.sty = sty;
    const bs = this.state.blockSize;

    // Precalculate spacing used for the minimum and maximum bounds.
    const border = this.state.sty.borderWidth;
    const height = this.getContainerStateById(itemState.container).sty.height;

    // Because the items can only move downwards (except for the box), only calculate
    // the maxY.
    const maxY = height - sty.height - 2 * border + 1;

    // Move the position based on velocity; move the velocity based on acceleration.
    sty.top += itemState.yVel;

    // If the item is colliding with a platform on the y axis, set its y-axis to
    // the top of the the platform.
    const platformState = this.itemIsCollidingWithPlatform(itemState);
    if (platformState !== undefined && platformState !== null) {
      sty.top = platformState.sty.top - sty.height;
      itemState.yVel = 0;
    } else {
      sty.top = Math.min(maxY, sty.top);
      itemState.yVel += this.toPixelsPerFrame(itemState.yAcc, bs[1]);
    }

    // Lever only location: if the item is a lever, modify the "lever" part of the lever.
    if (itemState.itemType === 'lever') {
      itemState.lever.top =
        itemState.sty.top - itemState.lever.height + itemState.base.height / 4;
      const plusOrMinus = itemState.activated ? -1 : 1;
      itemState.lever.left =
        itemState.sty.left -
        (plusOrMinus * itemState.lever.width) / (2 * Math.SQRT2);
    }

    // Update the item location and itemState.
    this.nearestItemLocation(itemState);
    this.updateItemState(itemState.container, itemState.id, itemState);
  };

  /**
   * Updates the itemState to have the most recent itemLocation.
   *
   * @param {object} itemState The item state to update.
   */
  nearestItemLocation = (itemState) => {
    const { left, top } = itemState.sty;
    const bs = this.state.blockSize;

    // Calculate the new location, which is px/blockSize.
    const newlocation = [Math.floor(left / bs[0]), Math.floor(top / bs[1])];

    // Finally, set the new location.
    itemState.location = newlocation;
  };

  /**
   * Checks if a noninteractable item is colliding with the character.
   * Note that this requries a temporary characterState because
   * these changes have not yet been finalized.
   *
   * @param {object} tempCharacterState The temporary characterState.
   *
   * @param {object} itemState The item to check collision with.
   *
   * @returns {boolean} Whether or not the character is colliding with the item.
   */
  characterIsCollidingWithItem = (tempCharacterState, itemState) => {
    // Prepare the states.
    const itemSty = itemState.sty;
    const containerPixelLocation = this.getContainerPixelLocation(
      tempCharacterState.container
    );

    // For readability. Note that this is not passed into
    // this.itemsAreColliding() because special calculations
    // are required for the character, which is not located within
    // a specfic container.
    const {
      top: cTop,
      height: cHeight,
      left: cLeft,
      width: cWidth,
    } = tempCharacterState.sty;

    const border = this.state.sty.borderWidth;
    const iTop = itemSty.top + containerPixelLocation[1] + border;
    const iHeight = itemSty.height;
    const iLeft = itemSty.left + containerPixelLocation[0] + border;
    const iWidth = itemSty.width;

    // If the items are intersecting, on both the x and y axis, return true.
    const horizontalCollision =
      cLeft + cWidth > iLeft && cLeft < iLeft + iWidth;
    const verticalCollision = cTop + cHeight > iTop && cTop < iTop + iHeight;
    return horizontalCollision && verticalCollision;
  };

  /**
   * Determines whether or not two items are colliding.
   *
   * @param {object} itemState1 The state of the first item to check.
   * @param {object} itemState2 The state of the second item to check.
   */
  itemsAreColliding = (itemState1, itemState2) => {
    // Prepare items from the itemState1.
    const {
      top: top1,
      height: height1,
      left: left1,
      width: width1,
    } = itemState1.sty;

    // Prepare items from itemState2.
    const {
      top: top2,
      height: height2,
      left: left2,
      width: width2,
    } = itemState2.sty;

    // If the items are intersecting, on both the x and y axis, return true.
    const horizontalCollision =
      left1 + width1 > left2 && left1 < left2 + width2;
    const verticalCollisions = top1 + height1 > top2 && top1 < top2 + height2;
    return horizontalCollision && verticalCollisions;
  };

  //------------------\\
  // Platform Methods \\
  //------------------\\
  /**
   * Update the style of the Platform. Like Openings, this method is called
   * from Platform, passed through Container, and passed up to here.
   *
   * @param {Container} container The Container that holds the Platform.
   * @param {Plaform} platform The Platform to update the style of.
   */
  updatePlatformSty = (container, platform) => {
    const { dimensions, location } = platform.props.selfState;
    const bs = this.state.blockSize;

    const border = this.state.sty.borderWidth;
    const halfBorder = border / 2;
    const newsty = {
      width: dimensions[0] * bs[0],
      height: dimensions[1] * bs[1],
      left: location[0] * bs[0],
      top: location[1] * bs[1],
      borderRadius: halfBorder,
      borderWidth: halfBorder,
    };

    this.updatePlatformState(container.props.id, platform.props.id, {
      sty: newsty,
    });
  };

  /**
   * Update the item state.
   *
   * @param {number} containerid The id of the container that has the item.
   * @param {number} platformid The id of the platform to update.
   * @param {object} newstate The state to update the platform with.
   */
  updatePlatformState = (containerid, platformid, newstate) => {
    // Get a mutatable copy of the containerState.
    const containerState = Object.assign(
      {},
      this.getContainerStateById(containerid)
    );

    // Cycle through the platformStates until one with a matching id is found.
    for (let i = 0; i < containerState.platformStates.length; i++) {
      const platformState = containerState.platformStates[i];
      if (platformState.id === platformid) {
        containerState.platformStates[i] = Object.assign(
          platformState,
          newstate
        );
        this.updateContainerState(containerid, containerState);
      }
    }
  };

  /**
   * Determine whether the given item is colliding with any platforms
   * within its container.
   *
   * @param {object} itemState The itemState to check.
   *
   * @returns {object} the platformState that the item is colliding with, if any.
   */
  itemIsCollidingWithPlatform = (itemState) => {
    const containerState = this.getContainerStateById(itemState.container);

    // Cycle through the platformStates.
    for (let i = 0; i < containerState.platformStates.length; i++) {
      const platformState = containerState.platformStates[i];
      if (this.itemsAreColliding(itemState, platformState))
        return platformState;
    }
  };

  //---------------\\
  // Render Method \\
  //---------------\\

  /**
   * Rendering method.
   *
   * @returns a div that represents the playable level.
   */
  render() {
    // Return the level object in index.html.
    // Note that the Containers are generated before the
    // character so that the character naturally is on top
    // of the Containers. Additionally, the Character needs
    // a reference, because it always is in a container.
    let level = (
      <>
        <HUD
          togglePause={this.togglePause}
          score={this.state.score}
          lives={Math.max(0, this.state.lives)}
        />
        <div className='Level' style={this.state.sty}>
          {this.generateContainers()}
          <Character
            selfState={this.state.characterState}
            updateSty={this.updateCharacterSty}
          />
        </div>
      </>
    );
    if (this.state.complete) {
      if (this.state.lives < 0) {
        return (
          <>
            {level}
            <LevelFailedMenu />
          </>
        );
      } else {
        return (
          <>
            {level}
            <LevelCompleteMenu
              score={this.state.score}
              level={this.levelFile}
            />
          </>
        );
      }
    } else if (this.state.paused) {
      return (
        <>
          {level}
          <PauseMenu unpause={this.togglePause} />
        </>
      );
    } else return level;
  }
}

export default Level;
