/**
 * RecipeDetails — fetches and displays full meal info by ID.
 * Includes star ratings, personal cook notes, share button, and print button.
 * Uses useParams to get the meal ID from the URL.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiYoutube, FiShare2, FiPrinter } from 'react-icons/fi';
import StarRating from '../components/StarRating';
import useDebounce from '../hooks/useDebounce';
import './RecipeDetails.css';

const API_BASE = 'https://www.themealdb.com/api/json/v1/1';

function getIngredients(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim()) {
      ingredients.push({ name: name.trim(), measure: (measure || '').trim() });
    }
  }
  return ingredients;
}

export default function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [shareToast, setShareToast] = useState(null);

  const debouncedNotes = useDebounce(notes, 600);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/lookup.php?i=${id}`)
      .then(r => r.json())
      .then(data => {
        if (!data.meals) throw new Error('Not found');
        const mealData = data.meals[0];
        setMeal(mealData);
        
        // Load rating and notes after meal is loaded
        const saved = JSON.parse(localStorage.getItem('mealRatings') || '{}');
        setRating(saved[mealData.idMeal] || 0);
        
        const notesKey = `cookNotes:${mealData.idMeal}`;
        setNotes(localStorage.getItem(notesKey) || '');
        
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load this recipe.');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!meal) return;
    const notesKey = `cookNotes:${meal.idMeal}`;
    localStorage.setItem(notesKey, debouncedNotes);
  }, [debouncedNotes, meal?.idMeal]);

  function handleRating(value) {
    setRating(value);
    const saved = JSON.parse(localStorage.getItem('mealRatings') || '{}');
    saved[meal.idMeal] = value;
    localStorage.setItem('mealRatings', JSON.stringify(saved));
  }

  function handleShare() {
    const url = `${window.location.origin}${window.location.pathname}`;
    const shareText = `Check out this recipe: ${meal.strMeal}`;

    if (navigator.share) {
      navigator.share({
        title: meal.strMeal,
        text: shareText,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setShareToast('Link copied!');
        setTimeout(() => setShareToast(null), 2500);
      }).catch(() => {
        setShareToast('Could not copy link');
        setTimeout(() => setShareToast(null), 2500);
      });
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="container details__loading">
        <p>Loading recipe…</p>
      </div>
    );
  }

  if (error || !meal) {
    return (
      <div className="container details__error">
        <p>{error || 'Recipe not found.'}</p>
        <a href="/">← Back to Home</a>
      </div>
    );
  }

  const ingredients = getIngredients(meal);
  const steps = meal.strInstructions
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean);

  return (
    <div className="container details">
      <button className="details__back" onClick={() => navigate(-1)}>
        <FiArrowLeft /> Back
      </button>

      <img
        className="details__hero"
        src={meal.strMealThumb}
        alt={meal.strMeal}
      />

      <div className="details__layout">
        <div className="details__main">
          <div className="details__header">
            <h1 className="details__title">{meal.strMeal}</h1>
            <div className="details__header-actions">
              <button
                className="details__action-btn"
                onClick={handleShare}
                aria-label="Share recipe"
              >
                <FiShare2 /> Share
              </button>
              <button
                className="details__action-btn"
                onClick={handlePrint}
                aria-label="Print recipe"
              >
                <FiPrinter /> Print
              </button>
            </div>
            {shareToast && <div className="details__toast">{shareToast}</div>}
          </div>

          <div className="details__tags">
            {meal.strCategory && <span className="details__tag">{meal.strCategory}</span>}
            {meal.strArea && <span className="details__tag">{meal.strArea}</span>}
          </div>

          <h2 className="details__section-title">Instructions</h2>
          <ol className="details__instructions">
            {steps.map((step, i) => (
              <li key={i} className="details__step">{step}</li>
            ))}
          </ol>

          <h2 className="details__section-title">My Notes</h2>
          <textarea
            className="details__notes"
            placeholder="Add your cooking tips and personal notes here…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
          <div className="details__notes-indicator">Saved ✓</div>
        </div>

        <aside className="details__sidebar">
          <div className="details__sidebar-section">
            <div className="details__sidebar-header">Rate this recipe</div>
            <div className="details__star-wrapper">
              <StarRating rating={rating} onChange={handleRating} />
            </div>
          </div>

          <div className="details__sidebar-section">
            <div className="details__sidebar-header">Ingredients</div>
            <ul className="details__ingredients">
              {ingredients.map((ing, i) => (
                <li key={i} className="details__ingredient">
                  <span className="details__ingredient-name">{ing.name}</span>
                  <span className="details__ingredient-measure">{ing.measure}</span>
                </li>
              ))}
            </ul>
          </div>

          {meal.strYoutube && (
            <a
              className="details__yt-btn"
              href={meal.strYoutube}
              target="_blank"
              rel="noreferrer"
            >
              <FiYoutube /> Watch on YouTube
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}
