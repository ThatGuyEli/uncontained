import React, { Component } from 'react';

/**
 * Class that represents an opening in the container.
 * @extends Component
 */
class Opening extends Component {

  /**
   * When the component mounts, update the style after 1ms
   * to allow the Container to render. Additionally, add the
   * event listener to update this component's style on resize.
   */
  componentDidMount() {
    window.setTimeout(this.updateSty, 1);
    window.addEventListener('resize', this.updateSty);
  }

  /**
   * When the component is going to unount, remove the listener
   * from the window. This is to prevent unnecessary calls to
   * no-longer-existing objects.
   */
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateSty);
  }

  /**
   * Update the style of this component. This gets passed into Container,
   * which passes it into Level. Read more about this method there.
   */
  updateSty = () => {
    this.props.updateSty(this);
  }

  /**
   * Rendering method.
   * 
   * @returns a div that represents an opening in a Container.
   */
  render() {
    return <div className='Opening' style={this.props.selfState.sty}></div>;
  }
}

export default Opening;