/**
 * AreaFilter - dropdown filter for supported cuisine areas.
 * Props:
 *   areas (array)        - list of area names
 *   selected (string)    - current area value, or "All"
 *   onSelect (function)  - called with the selected area
 */
import './AreaFilter.css';

export default function AreaFilter({ areas = [], selected = 'All', onSelect }) {
  const safeSelected = selected === 'All areas' ? 'All' : selected;

  return (
    <div className="area-filter">
      <label className="area-filter__label" htmlFor="area-select">Area</label>
      <select
        id="area-select"
        className="area-filter__select"
        value={safeSelected}
        onChange={event => onSelect(event.target.value)}
      >
        <option value="All">All areas</option>
        {areas.map(area => (
          <option key={area} value={area}>{area}</option>
        ))}
      </select>
    </div>
  );
}
