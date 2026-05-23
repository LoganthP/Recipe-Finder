/**
 * Favorites — displays all meals saved to favorites.
 * Shows an empty state with a CTA when there are no favorites.
 * Props:
 *   favorites (array)       — list of favorited meal objects
 *   onToggleFavorite (fn)   — called with meal to remove it
 */
import { Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import './Favorites.css';

export default function Favorites({ favorites, onToggleFavorite }) {
  return (
    <div className="container favorites">
      <div className="favorites__header">
        <h1>Your Favorites</h1>
        <p>{favorites.length} saved {favorites.length === 1 ? 'recipe' : 'recipes'}</p>
      </div>

      {favorites.length === 0 ? (
        <div className="favorites__empty">
          <div className="favorites__empty-box">🤍</div>
          <h2>No favorites yet</h2>
          <p>Tap the heart on any recipe to save it here for later.</p>
          <Link className="favorites__cta" to="/">Start exploring</Link>
        </div>
      ) : (
        <div className="favorites__grid">
          {favorites.map(meal => (
            <RecipeCard
              key={meal.idMeal}
              meal={meal}
              isFavorited={true}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
