import React from 'react';
import { Link } from 'react-router-dom';
import '../../css/Menu.css';

/**
 * Functional component Main Menu.
 *
 * @returns JSX that represents a main menu.
 */
export default function MainMenu() {
  /**
   * A helper method to create the main menu buttons.
   *
   * @param {string} to The url of the page to go to.
   * @param {string} color The color of the button.
   * @param {string} text The text to put inside of the button.
   * @param {function} onClick The method to execute on click.
   *
   * @returns JSX that represents a button for the main menu.
   */
  function MainMenuButton({ to, color, text, onClick }) {
    return (
      <Link to={to} className='main-menu-text link-text'>
        <div
          className={`main-menu-button ${color} standard-border div-hover center-children`}
          onClick={onClick}
        >
          {text}
        </div>
      </Link>
    );
  }

  return (
    <>
      <div className='title-bar'>
        <span className='title-text center'>Uncontained</span>
      </div>

      <div className='btn-container'>
        <MainMenuButton to='/level-select' color='blue' text='Level Select' />
        <MainMenuButton to='/how-to-play' color='red' text='How to Play' />
        <MainMenuButton to='/leaderboard' color='purple' text='Leaderboard' />
        <MainMenuButton
          to='/'
          color='orange'
          text='Exit Game'
          onClick={window.close}
        />
      </div>
    </>
  );
}
