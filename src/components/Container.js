import React, { Component } from 'react';
import Item from './Item.js';
import Opening from './Opening.js';

/**
 * Container component. This Container holds all components
 * within it except for the character and boxes, which move
 * between Containers.
 *
 * @extends Component
 */
class Container extends Component {
  /**
   * Generic constructor.
   * @constructor
   * @param {Object} props the properties needed to create this object
   */
  constructor(props) {
    super(props);
    this.cn = `Container ${this.props.color}`; // className
  }

  /**
   * When the component mounts, update the style after 10ms
   * to allow the Level to render. Additionally, add the
   * event listeners to update this component's style on resize,
   * move on mouse move, attach on mouse down, and detach on mouse up.
   */
  componentDidMount() {
    window.setTimeout(this.update, 10);
    window.addEventListener('resize', this.update);
    window.addEventListener('mousemove', this.move);
    window.addEventListener('mouseup', this.detach);
  }

  /**
   * When the component is going to unmount, remove the listener
   * from the window. This is to prevent unnecessary calls to
   * no-longer-existing objects.
   */
  componentWillUnmount() {
    window.removeEventListener('resize', this.update);
    window.removeEventListener('mousemove', this.move);
    window.removeEventListener('mouseup', this.detach);
  }

  /**
   * Update the style of the component. This is called
   * on resize to scale the Container up or down depending
   * on the new height. This method calls updateContainerSty
   * from Level.
   */
  update = () => {
    const { dimensions, location, id } = this.props;
    this.props.updateSty(id, dimensions, location);
  };

  /**
   * Attaches the mouse to the Container. This stores the offset
   * and prepares the Container for movement. The method will not
   * attach the mouse if it is already attached or if the Container
   * is not movable.
   *
   * @param {MouseEvent} e the mouse event to get the offset from
   */
  attach = (e) => {
    if (!this.props.selfState.attached && this.isMovable()) {
      // Utilize rewriteBlocks callback in order to update the state
      // after the blocks are rewritten.
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

  /**
   * Detaches the mouse from the Cotainer. This method also
   * snaps the Container to the nearest location so that
   * other features are possible, such as traveling between
   * containers. The method will not detach the mouse if it
   * is not attached or if the Container is not movable.
   */
  detach = () => {
    if (this.props.selfState.attached && this.isMovable()) {
      this.snap();
      this.props.rewriteBlocks(this, true);
    }
  };

  /**
   * Snap the container to its bounds. This method is called from
   * this.detach() or this.automove().
   */
  snap = () => {
    // Create a boolean on whether or not the movement
    // is horizontal, and a reference to sty.
    const isHorizontal = this.props.movement === 'x';
    const sty = this.props.selfState.sty;

    // Get the nearest block from Level.js, passing in either left or top.
    const nearestBlock = this.props.nearestLocation(
      this,
      isHorizontal ? sty.left : sty.top
    );

    // Set the new location, either x or y, depending on isHorizontal.
    const index = isHorizontal ? 0 : 1;
    this.props.location[index] = nearestBlock.newLocation;

    // Similarly, determine which part of newsty to modify and modify it.
    const newsty = Object.assign({}, sty);
    const location = isHorizontal ? 'left' : 'top';
    newsty[location] = nearestBlock.newPixelLocation;

    // Finally, update the state.
    this.props.updateSelfState(this.props.id, {
      attached: false,
      sty: newsty,
    });
  };

  /**
   * Movement function. This checks if movement is possible,
   * then calls the movement function in Level.
   * @param {MouseEvent} e the mouse event to calculate movement from
   */
  move = (e) => {
    if (
      this.props.selfState.attached &&
      !this.props.selfState.isMoving &&
      this.isMovable() &&
      !this.props.characterIsIn(this)
    ) {
      this.props.updateSelfState(this.props.id, { isMoving: true });
      this.props.move(this, e);
    }
  };

  /**
   * Checks whether or not this container is movable.
   * @returns {boolean} Whether or not this container is movable.
   */
  isMovable = () => {
    // Return false is the game is paused,
    // because no Container is movable when it is paused.
    if (this.props.gameIsPaused()) return false;

    // If the color is blue or red, return true.
    // Otherwise, return false.
    switch (this.props.color) {
      case 'blue':
      case 'red':
        return true;
      default:
        return false;
    }
  };

  //-----------------\\
  // Opening methods \\
  //-----------------\\
  /**
   * This method is passing the Container and the Item to Level,
   * which updates the style of the Item.
   * 
   * @param {Opening} opening The Opening to update the style of.
   */
  updateOpeningSty = (opening) => {
    this.props.updateOpeningSty(this, opening);
  };

  /**
   * Generate the opening within this Container.
   * 
   * @returns {Array} An Array of Openings attached to this Container.
   */
  generateOpenings = () => {
    // Use higher order function array.map.
    return this.props.openings.map((opening) => {
      return (
        <Opening
          key={opening.id}
          updateSty={this.updateOpeningSty}
          selfState={this.getOpeningStateById(opening.id)}
          {...opening}
        />
      );
    });
  };

  /**
   * Get the openingState with the given id.
   * 
   * @param {number} id The id of the opening to search for.
   * 
   * @returns {object} The openingState with the given id.
   */
  getOpeningStateById = (id) => {
    for (let i = 0; i < this.props.selfState.openingStates.length; i++) {
      const openingState = this.props.selfState.openingStates[i];
      if (openingState.id === id) {
        return openingState;
      }
    }
  };

  //--------------\\
  // Item methods \\
  //--------------\\
  /**
   * Generate the items within this Container.
   * 
   * @returns {Array} An Array of Items attached to this Container.
   */
  generateItems = () => {
    // Use higher order function array.map.
    return this.props.items.map((item) => {
      return (
        <Item 
        key={item.id}
        updateSty={this.updateItemSty}
        selfState={this.getItemStateById(item.id)}
        {...item}
        />
      );
    });
  }

  /**
   * This method is passing the Container and the Item to
   * Level, which updates the style of the Item.
   * 
   * @param {Item} item The item to update the style of.
   */
  updateItemSty = (item) => {
    this.props.updateItemSty(this, item);
  }
  
  /**
   * Get the itemState with the given id.
   * 
   * @param {number} id The id of the item to search for.
   * 
   * @returns {object} The itemState with the given id.
   */
  getItemStateById = (id) => {
    // Cycle through the itemStates until the matching id is found.
    for (let i = 0; i < this.props.selfState.itemStates.length; i++) {
      const itemState = this.props.selfState.itemStates[i];
      if (itemState.id === id) return itemState;
    }
  }

  /**
   * Rendering method.
   *
   * @returns a <div> that represents the container.
   */
  render() {
    return (
      <div
        className={this.cn}
        style={this.props.selfState.sty}
        onMouseDown={this.attach}
        onMouseOut={this.detach}
      >
        {this.generateOpenings()}
        {this.generateItems()}
      </div>
    );
  }
}

export default Container;
