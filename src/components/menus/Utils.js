import { Route } from 'react-router-dom';
import Level from '../game/Level.js';

// Imports from preload.js
const { fs, path, appPath } = window;

/**
 * Reads all files in the levels directory.
 *
 * @returns {Array} An array of levels.
 */
export function getLevelFiles() {
  // Synchronous loading is used because data is small and
  // levels are needed to have a functioning level select menu.
  const levelFiles = [];

  // Get the path of the levels using appPath. Remember, from the preload,
  // that window.appPath is an object that holds a string appPath.
  const dirPath = path.join(appPath.appPath, 'data', 'levels');
  const fileNames = fs.readdirSync(dirPath);
  /**
   * Add each level to the read levels.
   */
  fileNames.forEach((fileName) => {
    const levelFile = require(`../../data/levels/${fileName}`);
    levelFiles.push(levelFile);
  });
  return levelFiles;
}

/**
 * Generate the level pages.
 *
 * @returns {Array} An array of Routes, from react-router-dom.
 */
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

/**
 * Generates the level buttons, each of which has the ability to update the
 * state of the level.
 *
 * @param {string} color The color to set the button to.
 * @param {function} setSelectedLevel The function that updates the state.
 */
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
        {name}
      </div>
    );
  });
}

export function addLeaderboardEntry(levelid, initials, score) {
  const { fs, path, api } = window;
  api.response('send-userdata-dir', (data) => {
    const leaderboardPath = path.join(
      data,
      'leaderboard',
      `leaderboard${levelid}.json`
    );
    const leaderboardEntry = {
      initials: initials,
      score: score,
    };
    // Try to read the file.
    fs.readFile(leaderboardPath, 'utf-8', (err, data) => {
      let newData;
      if (err) {
        // The file does not exist. Create a file.
        // No leaderboard, first id.
        leaderboardEntry.id = 1;
        newData = JSON.stringify([leaderboardEntry], null, 2);
      } else {
        // The file exists. Parse it.
        const dataJSON = JSON.parse(data);
        // Add the next id.
        leaderboardEntry.id = dataJSON[dataJSON.length - 1].id + 1;
        dataJSON.push(leaderboardEntry);
        newData = JSON.stringify(dataJSON, null, 2);
      }
      fs.writeFile(leaderboardPath, newData, (err) => {
        if (err) throw err;
      });
    });
  });
  api.request('request-userdata-dir');
}

export function readLeaderboardEntries(levelid, setLeaderboard) {
  const { fs, path, api } = window;
  api.response('send-userdata-dir', (data) => {
    const leaderboardPath = path.join(
      data,
      'leaderboard',
      `leaderboard${levelid}.json`
    );
    // Try to read the file.
    try {
      // Synchronous because asynchronous would lead to problems with the selected
      // file being out of sync if the user accessed the leaderboard from a level
      // or post level menu. Because these files are intended to be small (local
      // leaderboards), this will not make a significant impact on performance.
      const file = fs.readFileSync(leaderboardPath, 'utf-8');
      setLeaderboard(JSON.parse(file));
    } catch (err) {
      // The file does not exist. Set the leaderboard to [].
      setLeaderboard([]);
    }
  });
  api.request('request-userdata-dir');
}