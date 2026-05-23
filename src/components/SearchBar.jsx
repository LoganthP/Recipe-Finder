/**
 * SearchBar — controlled text input that fires onSearch on button click or Enter key.
 * Props:
 *   value (string)      — current input value
 *   onChange (fn)       — called with new input value
 *   onSearch (fn)       — called when user submits the search
 */
import { FiSearch } from 'react-icons/fi';
import './SearchBar.css';

export default function SearchBar({ value, onChange, onSearch }) {
  function handleKey(e) {
    if (e.key === 'Enter') onSearch();
  }

  return (
    <div className="search-bar">
      <input
        className="search-bar__input"
        type="text"
        placeholder="Search recipes by name or ingredient…"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKey}
        aria-label="Search recipes"
      />
      <button className="search-bar__btn" onClick={onSearch} aria-label="Search">
        <FiSearch style={{ verticalAlign: '-2px', marginRight: 6 }} />
        Search
      </button>
    </div>
  );
}
