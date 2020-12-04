import { Route } from 'react-router-dom';
import Level from '../game/Level.js';

// Imports from preload.js
const { fs, path } = window;

export function getLevelFiles() {
  // Synchronouse loading is used because data is small and
  // levels are needed to have a functioning level select menu.
  const levelFiles = [];
  const dirPath = path.join('src', 'data', 'levels');
  const fileNames = fs.readdirSync(dirPath);
  fileNames.forEach((fileName) => {
    const levelFile = require(`../../data/levels/${fileName}`);
    levelFiles.push(levelFile);
  });
  return levelFiles;
}

export function generateLevelPages() {
  const levels = getLevelFiles();
  return levels.map((level) => {
    return (
      <Route
        key={level.id}
        exact
        path={`/levels/level${level.id}`}
        render={() => <Level id={level.id} />}
      />
    );
  });
}

export function generateLevelButtons(setSelectedLevel) {
  const levels = getLevelFiles();
  return levels.map((level) => {
    const { name, id } = level;
    /*
      <Link
        key={name}
        to={`/levels/level${id}`}
        className='link-text'
      >
      </Link>
    */
    return (
      <div
        key={id}
        className='link-text level-button blue standard-border div-hover'
        onClick={() => setSelectedLevel(level)}
      >
        <span>{name}</span>
      </div>
    );
  });
}
