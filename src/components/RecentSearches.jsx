/**
 * RecentSearches — displays the last 5 search terms as clickable pill chips.
 * Props:
 *   searches (string[]) — list of recent search terms
 *   onSelect (fn)       — called with term when a pill is clicked
 *   onClear (fn)        — called when the Clear link is clicked
 */
import './RecentSearches.css';

export default function RecentSearches({ searches, onSelect, onClear }) {
  if (!searches.length) return null;

  return (
    <div className="recent-searches">
      <span className="recent-searches__label">Recent:</span>
      {searches.map(term => (
        <button
          key={term}
          className="recent-searches__pill"
          onClick={() => onSelect(term)}
        >
          {term}
        </button>
      ))}
      <button className="recent-searches__clear" onClick={onClear}>
        Clear
      </button>
    </div>
  );
}
