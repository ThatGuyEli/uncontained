import React from 'react';

/**
 * Functional React Component.
 * The score table of the Leaderboard page. This uses a table to represent
 * the data.
 * 
 * @param {object} props The properties to pass to the score table.
 * 
 * @returns JSX that represents the score table.
 */
export default function ScoreTable({ leaderboard }) {

  // Simply helper method to generate the rows based on the leaderboard.
  function generateRows() {
    leaderboard.sort((a, b) => {
      return b.score - a.score;
    });
    return leaderboard.map((entry) => {
      return (
        <tr key={entry.id} className='score-table-row'>
          <td className='score-table-text'>{entry.initials}</td>
          <td className='score-table-text'>{entry.score}</td>
        </tr>
      );
    });
  }

  return (
    <div className='score-wrapper purple standard-border'>
      <table className='score-table'>
        <tbody className='score-body'>
          <tr>
            <th className='score-table-header'>Initials</th>
            <th className='score-table-header'>Score</th>
          </tr>
          {generateRows()}
        </tbody>
      </table>
    </div>
  );
}
