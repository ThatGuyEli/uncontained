import { Route, Link } from 'react-router-dom';
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

export function generateLevelButtons () {
  const levels = getLevelFiles();
  return levels.map((level) => {
    return (
      <Link key={level.name} to={`/levels/level${level.id}`}>
        <div >{level.name}</div>
      </Link>
    );
  });
}
