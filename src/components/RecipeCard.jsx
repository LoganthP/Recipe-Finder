/**
 * RecipeCard - displays a meal thumbnail, name, course/category badges, rating,
 * and favorite toggle.
 * Props:
 *   meal (object)              - TheMealDB meal object
 *   isFavorited (boolean)      - whether this meal is in favorites
 *   onToggleFavorite(function) - called with meal when heart is clicked
 *   rating (number)            - local user rating to preview on the card
 */
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import StarRating from './StarRating';
import { getCourseLabel } from '../utils/courseMap';
import './RecipeCard.css';

function getStoredRating(id) {
  try {
    return JSON.parse(localStorage.getItem('recipeRatings'))?.[id] || 0;
  } catch {
    return 0;
  }
}

export default function RecipeCard({ meal, isFavorited, onToggleFavorite, rating }) {
  const navigate = useNavigate();
  const visibleRating = rating ?? getStoredRating(meal.idMeal);

  function handleHeartClick(event) {
    event.stopPropagation();
    onToggleFavorite(meal);
  }

  return (
    <article className="recipe-card" onClick={() => navigate(`/recipe/${meal.idMeal}`)}>
      <div className="recipe-card__img-wrap">
        <img
          className="recipe-card__img"
          src={meal.strMealThumb}
          alt={meal.strMeal}
          loading="lazy"
        />
      </div>

      <div className="recipe-card__body">
        <h3 className="recipe-card__title">{meal.strMeal}</h3>
        <StarRating rating={visibleRating} readOnly small />

        <div className="recipe-card__meta">
          <div className="recipe-card__badges">
            {meal.strCategory && (
              <>
                <span className="recipe-card__badge recipe-card__badge--course">
                  {getCourseLabel(meal.strCategory)}
                </span>
                <span className="recipe-card__badge">{meal.strCategory}</span>
              </>
            )}
          </div>

          <div className="recipe-card__actions">
            <span className="recipe-card__view">View Recipe</span>
            <button
              className={'recipe-card__heart' + (isFavorited ? ' favorited' : '')}
              onClick={handleHeartClick}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorited ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
