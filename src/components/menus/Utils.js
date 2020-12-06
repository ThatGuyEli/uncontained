import { Route } from 'react-router-dom';
import Level from '../game/Level.js';

// Imports from preload.js
const { fs, path } = window;

export function getLevelFiles() {
  // Synchronous loading is used because data is small and
  // levels are needed to have a functioning level select menu.
  const levelFiles = [];

  // Get the path of the levels using appPath.
  const dirPath = path.join(window.appPath.appPath, 'src', 'data', 'levels');
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

export function generateLevelButtons(color, setSelectedLevel) {
  const levels = getLevelFiles();
  return levels.map((level) => {
    const { name, id } = level;
    return (
      <div
        key={id}
        className={`center-children link-text level-button ${color} standard-border div-hover`}
        onClick={() => setSelectedLevel(level)}
      >
        <span>{name}</span>
      </div>
    );
  });
}
