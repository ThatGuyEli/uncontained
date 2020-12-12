import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../css/Menu.css';

/**
 * Functional React Component.
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

  // Close the game whenever Escape is pressed. Note that this does
  // not work in the game, because Escape is mapped to pause there.
  useEffect(() => {
    document.onkeydown = (e) => {
      if (e.key === 'Escape') window.close();
    };
  }, []);

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
