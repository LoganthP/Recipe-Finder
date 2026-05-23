import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RecipeDetails from './pages/RecipeDetails';
import Favorites from './pages/Favorites';
import NotFound from './pages/NotFound';
import './styles/global.css';

const STORAGE_KEY = 'recipeFavorites';

export default function App() {
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  function toggleFavorite(meal) {
    setFavorites(prev => {
      const exists = prev.some(f => f.idMeal === meal.idMeal);
      return exists
        ? prev.filter(f => f.idMeal !== meal.idMeal)
        : [...prev, meal];
    });
  }

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={<Home favorites={favorites} onToggleFavorite={toggleFavorite} />}
        />
        <Route path="/recipe/:id" element={<RecipeDetails />} />
        <Route
          path="/favorites"
          element={<Favorites favorites={favorites} onToggleFavorite={toggleFavorite} />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
