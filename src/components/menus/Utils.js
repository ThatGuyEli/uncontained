import { Route } from 'react-router-dom';
import Level from '../game/Level.js';

// Imports from preload.js
const { fs, path, appPath } = window;

/**
 * Reads all JSON files in the given directory.
 *
 * @param {string} dir The directory to read.
 *
 * @returns {Array} An array of levels.
 */
export function getFiles(dir) {
  const files = [];

  // Get the path of the levels using appPath. Remember, from the preload,
  // that window.appPath is an object that holds a string appPath.
  const dirPath = path.join(appPath.appPath, 'data', dir);

  // Synchronous loading is used because data is small and
  // files are needed to have a functioning menu.
  const fileNames = fs.readdirSync(dirPath);

  //Add each level to the read JSON files.
  fileNames.forEach((fileName) => {
    const file = require(`../../data/${dir}/${fileName}`);
    files.push(file);
  });
  return files;
}

/**
 * Generate the level pages.
 *
 * @returns {Array} An array of Routes, from react-router-dom.
 */
export function generateLevelPages() {
  const levels = getFiles('levels');
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
 * Generates the buttons of a given file, each of which has the ability to update the
 * state of the level.
 *
 * @param {string} dir The directory to read.
 * @param {string} color The color to set the button to.
 * @param {function} setSelected The function that updates the state.
 */
export function generateButtons(dir, color, setSelected) {
  const files = getFiles(dir);
  // Order the files based on ID.
  files.sort((a, b) => {
    return a.id - b.id;
  });
  return files.map((file) => {
    const { name, id } = file;
    return (
      <div
        key={id}
        className={`center-children link-text button ${color} standard-border div-hover`}
        onClick={() => setSelected(file)}
      >
        {name}
      </div>
    );
  });
}

/**
 * Add a leaderboard entry to the leaderboard file.
 * Note that this file is not stored within the app,
 * but in the user's local appdata directory.
 * 
 * On Windows: C:\Users\{youruser}\AppData\Roaming\
 * On Mac: ~/Library/Application Support/
 * On Linux: ~/.config/
 * 
 * @param {number} levelid The ID of the level to add an entry for.
 * @param {string} initials A three-character string to attach to the entry.
 * @param {number} score The score of the entry.
 */
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

/**
 * Read the leaderboard entries based on a given level ID.
 * @param {number} levelid The ID of the level to read entries for.
 * @param {function} setLeaderboard A function that updates the state of the leaderboard.
 */
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
