/**
 * CourseFilter - renders course pills mapped to TheMealDB categories.
 * Props:
 *   selected (string)    - active course label, defaults to "All courses"
 *   onSelect (function)  - called with the selected course label
 */
import { COURSE_MAP } from '../utils/courseMap';
import './CourseFilter.css';

const COURSE_ICONS = {
  'All courses': '🍽️',
  Starter: '🥗',
  'Main course': '🍖',
  Dessert: '🍰',
  'Side dish': '🥘',
  Breakfast: '🌅',
};

export default function CourseFilter({ selected = 'All courses', onSelect }) {
  return (
    <div className="course-filter" role="group" aria-label="Filter by meal course">
      {Object.keys(COURSE_MAP).map(course => (
        <button
          type="button"
          key={course}
          className={'course-filter__pill' + (selected === course ? ' active' : '')}
          onClick={() => onSelect(course)}
        >
          <span className="course-filter__icon" aria-hidden="true">{COURSE_ICONS[course]}</span>
          <span>{course}</span>
        </button>
      ))}
    </div>
  );
}
