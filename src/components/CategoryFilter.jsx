/**
 * CategoryFilter — fetches meal categories from TheMealDB and renders pill buttons.
 * Props:
 *   selected (string)      — currently active category name (or 'All')
 *   onSelect (fn)          — called with category name when a pill is clicked
 */
import { useState, useEffect } from 'react';
import './CategoryFilter.css';

const API_BASE = 'https://www.themealdb.com/api/json/v1/1';

export default function CategoryFilter({ selected, onSelect }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/categories.php`)
      .then(r => r.json())
      .then(data => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const all = ['All', ...categories.map(c => c.strCategory)];

  return (
    <div className="category-filter" role="group" aria-label="Filter by category">
      {all.map(cat => (
        <button
          key={cat}
          className={'category-filter__pill' + (selected === cat ? ' active' : '')}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
