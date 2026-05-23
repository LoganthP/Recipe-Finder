/**
 * StarRating - local five-star rating control.
 * Props:
 *   rating (number)      - current rating from 0 to 5
 *   onChange (function)  - called with the selected rating
 *   readOnly (boolean)   - disables interactions when true
 *   small (boolean)      - renders compact stars for cards
 */
import { useState } from 'react';
import { FaRegStar, FaStar } from 'react-icons/fa';
import './StarRating.css';

export default function StarRating({ rating = 0, onChange, readOnly = false, small = false }) {
  const [preview, setPreview] = useState(0);
  const visibleRating = preview || rating;

  return (
    <div
      className={'star-rating' + (small ? ' star-rating--small' : '')}
      onMouseLeave={() => setPreview(0)}
      aria-label={`Rating ${rating} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const value = index + 1;
        const Icon = value <= visibleRating ? FaStar : FaRegStar;
        return (
          <button
            type="button"
            key={value}
            className="star-rating__star"
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setPreview(value)}
            onClick={() => !readOnly && onChange?.(value)}
            aria-label={`Rate ${value} out of 5`}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}
