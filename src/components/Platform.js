import React, { Component } from 'react'

/**
 * Class that represents a platform in the Container.
 * @extends Component
 */
class Platform extends Component {

  /**
   * When the component mounts, update the style after 10ms
   * to allow the Container to render. Additionally, add the
   * event listener to update this component's style on resize.
   */
  componentDidMount() {
    window.setTimeout(this.updateSty)
    window.addEventListener('resize', this.updateSty);
  }

  /**
   * When the component is going to unmount, remove the listener
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
   * @returns JSX that represents a platform.
   */
  render() {
    return (
      <div className={`Platform ${this.props.color}`} style={this.props.selfState.sty}></div>
    )
  }
}

export default Platform;