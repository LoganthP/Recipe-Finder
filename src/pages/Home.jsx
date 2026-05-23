/**
 * Home - main page with debounced search, course/category/area filters,
 * sorting, pagination, recent searches, and recipe card grid.
 * Props:
 *   favorites (array)            - saved favorite meals
 *   onToggleFavorite (function)  - toggles a meal in favorites
 */
import { useEffect, useMemo, useState } from 'react';
import AreaFilter from '../components/AreaFilter';
import CategoryFilter from '../components/CategoryFilter';
import CourseFilter from '../components/CourseFilter';
import RecentSearches from '../components/RecentSearches';
import RecipeCard from '../components/RecipeCard';
import SearchBar from '../components/SearchBar';
import useDebounce from '../hooks/useDebounce';
import { COURSE_MAP } from '../utils/courseMap';
import './Home.css';

const API_BASE = 'https://www.themealdb.com/api/json/v1/1';
const RECENT_KEY = 'recentSearches';
const RATINGS_KEY = 'recipeRatings';
const PER_PAGE = 12;
const MIN_SAFE_ROOT_LENGTH = 4;
const ALL_COURSES = 'All courses';
const SUPPORTED_AREAS = [
  'Afghan',
  'Algerian',
  'American',
  'Argentine',
  'Australian',
  'British',
  'Canadian',
  'Chinese',
  'Croatian',
  'Dutch',
  'Egyptian',
  'Filipino',
  'French',
  'Greek',
  'Indian',
  'Irish',
  'Italian',
  'Jamaican',
  'Japanese',
  'Kenyan',
  'Malaysian',
  'Mexican',
  'Moroccan',
  'Polish',
  'Portuguese',
  'Russian',
  'Saudi Arabian',
  'Spanish',
  'Syrian',
  'Thai',
  'Tunisian',
  'Turkish',
  'Ukrainian',
  'Uruguayan',
  'Vietnamese',
];
const AREA_PRIMARY_FILTERS = {
  Afghan: 'Afghanistan',
  Argentine: 'Argentina',
  French: 'France',
  Indian: 'India',
};
const AREA_COUNTRIES = {
  Afghan: 'Afghanistan',
  Algerian: 'Algeria',
  American: 'United States',
  Argentine: 'Argentina',
  Australian: 'Australia',
  British: 'United Kingdom',
  Canadian: 'Canada',
  Chinese: 'China',
  Croatian: 'Croatia',
  Dutch: 'Netherlands',
  Egyptian: 'Egypt',
  Filipino: 'Philippines',
  French: 'France',
  Greek: 'Greece',
  Indian: 'India',
  Irish: 'Ireland',
  Italian: 'Italy',
  Jamaican: 'Jamaica',
  Japanese: 'Japan',
  Kenyan: 'Kenya',
  Malaysian: 'Malaysia',
  Mexican: 'Mexico',
  Moroccan: 'Morocco',
  Polish: 'Poland',
  Portuguese: 'Portugal',
  Russian: 'Russia',
  'Saudi Arabian': 'Saudi Arabia',
  Spanish: 'Spain',
  Syrian: 'Syria',
  Thai: 'Thailand',
  Tunisian: 'Tunisia',
  Turkish: 'Turkey',
  Ukrainian: 'Ukraine',
  Uruguayan: 'Uruguay',
  Vietnamese: 'Vietnam',
};

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-img" />
      <div className="skeleton-body">
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
    </div>
  );
}

function readStorageArray(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function readRatings() {
  try {
    return JSON.parse(localStorage.getItem(RATINGS_KEY)) || {};
  } catch {
    return {};
  }
}

function getNextRecentSearches(previousSearches, term) {
  const normalized = term.trim();
  return [
    normalized,
    ...previousSearches.filter(item => item.toLowerCase() !== normalized.toLowerCase()),
  ].slice(0, 5);
}

function getCountryRoot(area) {
  const specials = {
    Portuguese: 'Portugal',
    French: 'France',
    Spanish: 'Spain',
    British: 'Britain',
    Dutch: 'Netherlands',
    Greek: 'Greece',
    Irish: 'Ireland',
    Thai: 'Thailand',
    Filipino: 'Philippines',
    Indian: 'India',
    Cambodian: 'Cambodia',
    Bangladeshi: 'Bangladesh',
    Peruvian: 'Peru',
    Polish: 'Poland',
    Russian: 'Russia',
    Turkish: 'Turkey',
    Croatian: 'Croatia',
    Tunisian: 'Tunisia',
    Moroccan: 'Morocco',
    Egyptian: 'Egypt',
    Kenyan: 'Kenya',
    Jamaican: 'Jamaica',
    Uruguayan: 'Uruguay',
  };
  if (specials[area]) return specials[area];
  return area
    .replace(/(ian|ean|ese|ish|an)$/i, '')
    .replace(/i$/i, 'ia')
    .trim();
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Network request failed');
  return response.json();
}

function dedupeMeals(meals) {
  return [...new Map(meals.map(meal => [meal.idMeal, meal])).values()];
}

async function fetchCategoryMeals(categoryName) {
  const data = await fetchJson(`${API_BASE}/filter.php?c=${encodeURIComponent(categoryName)}`);
  return (data.meals || []).map(meal => ({
    ...meal,
    strCategory: meal.strCategory || categoryName,
  }));
}

async function fetchCourseMeals(courseCategories) {
  const results = await Promise.all(courseCategories.map(categoryName => fetchCategoryMeals(categoryName)));
  return dedupeMeals(results.flat());
}

async function fetchMealDetails(meals) {
  const limitedMeals = meals.slice(0, 80);
  const detailResults = await Promise.all(
    limitedMeals.map(meal => fetchJson(`${API_BASE}/lookup.php?i=${meal.idMeal}`))
  );
  return detailResults.map(data => data.meals?.[0]).filter(Boolean);
}

function mealMatchesArea(meal, area, countryRoot) {
  const targets = [area, countryRoot]
    .filter(Boolean)
    .map(value => value.toLowerCase());
  const mealArea = (meal.strArea || '').toLowerCase();
  const mealName = (meal.strMeal || '').toLowerCase();

  return targets.some(target => (
    mealArea === target || new RegExp(`\\b${target}\\b`, 'i').test(mealName)
  ));
}

async function fetchAreaFilterMeals(areaValue) {
  const data = await fetchJson(`${API_BASE}/filter.php?a=${encodeURIComponent(areaValue)}`);
  return data.meals || [];
}

async function fetchAreaMeals(area, countryRoot, setNotice, ignore) {
  const filterValues = [
    AREA_PRIMARY_FILTERS[area],
    area,
    countryRoot,
  ].filter((value, index, values) => value && values.indexOf(value) === index);

  let areaMeals = [];
  let usedFilterValue = '';

  for (const filterValue of filterValues) {
    console.log('[area] tier 1: filter.php?a=', filterValue);
    areaMeals = await fetchAreaFilterMeals(filterValue);
    if (areaMeals.length > 0) {
      usedFilterValue = filterValue;
      break;
    }
  }

  if (areaMeals.length > 0 && usedFilterValue) {
    if (usedFilterValue !== area && !ignore) {
      setNotice(
        `Showing ${usedFilterValue} results - TheMealDB stores ${area} cuisine under ${usedFilterValue}.`
      );
    }
    return areaMeals;
  }

  console.log('[area] tier 2: search.php?s=', area);
  const tierTwo = await fetchJson(`${API_BASE}/search.php?s=${encodeURIComponent(area)}`);
  let searchMeals = tierTwo.meals || [];
  searchMeals = searchMeals.filter(meal => mealMatchesArea(meal, area, countryRoot));

  if (searchMeals.length > 0) {
    return searchMeals;
  }

  if (!countryRoot || countryRoot.length < MIN_SAFE_ROOT_LENGTH) {
    return [];
  }

  console.log('[area] tier 3: search.php?s=', countryRoot);
  const tierThree = await fetchJson(`${API_BASE}/search.php?s=${encodeURIComponent(countryRoot)}`);
  searchMeals = (tierThree.meals || []).filter(meal => mealMatchesArea(meal, area, countryRoot));

  if (searchMeals.length > 0 && !ignore) {
    setNotice(
      `Showing results related to ${countryRoot} - TheMealDB has limited coverage for ${area} cuisine.`
    );
  }

  return searchMeals;
}

export default function Home({ favorites, onToggleFavorite }) {
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('chicken');
  const [category, setCategory] = useState('All');
  const [course, setCourse] = useState(ALL_COURSES);
  const [area, setArea] = useState('All');
  const [meals, setMeals] = useState([]);
  const [recentSearches, setRecentSearches] = useState(() => readStorageArray(RECENT_KEY));
  const [ratings] = useState(readRatings);
  const [lastUserSearch, setLastUserSearch] = useState('');
  const [sortMode, setSortMode] = useState('default');
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    const term = debouncedQuery.trim();

    if (!term && activeQuery) {
      queueMicrotask(() => {
        setLastUserSearch('');
        setActiveQuery('');
        setPage(1);
      });
      return;
    }

    if (term.length >= 2 && term !== activeQuery) {
      queueMicrotask(() => {
        setCategory('All');
        setCourse(ALL_COURSES);
        setArea('All');
        setLastUserSearch(term);
        setActiveQuery(term);
        setPage(1);
      });
    }
  }, [debouncedQuery, activeQuery]);

  useEffect(() => {
    let ignore = false;

    (async () => {
      setLoading(true);
      setError(null);
      setNotice(null);

      try {
        let nextMeals = [];
        const courseCategories = COURSE_MAP[course];
        const hasCourse = Boolean(courseCategories);
        const normalizedArea = area === 'All areas' ? 'All' : area;
        const hasArea = normalizedArea !== 'All';
        const hasCategory = category !== 'All';
        const countryRoot = hasArea ? AREA_COUNTRIES[normalizedArea] || getCountryRoot(normalizedArea) : '';

        if (hasArea && !hasCourse && !hasCategory) {
          nextMeals = await fetchAreaMeals(normalizedArea, countryRoot, setNotice, ignore);
        } else if (hasCategory) {
          if (hasCourse && !ignore) {
            setNotice('Filtering by category overrides course selection');
          }

          if (hasArea) {
            const [categoryMeals, areaMeals] = await Promise.all([
              fetchCategoryMeals(category),
              fetchAreaMeals(normalizedArea, countryRoot, setNotice, ignore),
            ]);
            const areaIds = new Set(areaMeals.map(meal => meal.idMeal));
            nextMeals = categoryMeals.filter(meal => areaIds.has(meal.idMeal));
            nextMeals = await fetchMealDetails(nextMeals);
          } else {
            nextMeals = await fetchCategoryMeals(category);
          }
        } else if (hasCourse && !hasArea) {
          nextMeals = await fetchCourseMeals(courseCategories);
        } else if (hasCourse && hasArea) {
          const [areaMeals, courseMeals] = await Promise.all([
            fetchAreaMeals(normalizedArea, countryRoot, setNotice, ignore),
            fetchCourseMeals(courseCategories),
          ]);
          const areaIds = new Set(areaMeals.map(meal => meal.idMeal));
          nextMeals = courseMeals.filter(meal => areaIds.has(meal.idMeal));
          nextMeals = await fetchMealDetails(nextMeals);
        } else {
          const searchTerm = activeQuery || 'chicken';
          const data = await fetchJson(`${API_BASE}/search.php?s=${encodeURIComponent(searchTerm)}`);
          nextMeals = data.meals || [];
        }

        if (!ignore) {
          setMeals(nextMeals);
          setLoading(false);
          if (
            activeQuery.trim()
            && lastUserSearch.trim().toLowerCase() === activeQuery.trim().toLowerCase()
            && nextMeals.length > 0
          ) {
            setRecentSearches(prev => {
              const next = getNextRecentSearches(prev, activeQuery);
              localStorage.setItem(RECENT_KEY, JSON.stringify(next));
              return next;
            });
          }
        }
      } catch {
        if (!ignore) {
          setError('Something went wrong. Please try again.');
          setLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [activeQuery, category, course, area, lastUserSearch]);

  function runSearch(term = query) {
    const nextTerm = term.trim();
    setQuery(nextTerm);
    setCategory('All');
    setCourse(ALL_COURSES);
    setArea('All');
    setLastUserSearch(nextTerm);
    setActiveQuery(nextTerm);
    setPage(1);
  }

  function clearRecentSearches() {
    localStorage.removeItem(RECENT_KEY);
    setRecentSearches([]);
  }

  function handleCourse(nextCourse) {
    setCourse(nextCourse);
    setCategory('All');
    setPage(1);
  }

  function handleCategory(nextCategory) {
    setCategory(nextCategory);
    setCourse(ALL_COURSES);
    setPage(1);
  }

  function handleArea(nextArea) {
    setArea(nextArea === 'All areas' ? 'All' : nextArea);
    setPage(1);
  }

  function handleSort(nextSort) {
    setSortMode(nextSort);
    setPage(1);
  }

  const favIds = new Set(favorites.map(favorite => favorite.idMeal));
  const sortedMeals = useMemo(() => {
    const nextMeals = [...meals];
    if (sortMode === 'az') {
      nextMeals.sort((a, b) => a.strMeal.localeCompare(b.strMeal));
    }
    if (sortMode === 'za') {
      nextMeals.sort((a, b) => b.strMeal.localeCompare(a.strMeal));
    }
    return nextMeals;
  }, [meals, sortMode]);

  const totalPages = Math.max(1, Math.ceil(sortedMeals.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagedMeals = sortedMeals.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <main>
      <section className="home__hero">
        <h1>Find your next favorite meal</h1>
        <p>Search recipes by name, then narrow the results by category or cuisine.</p>
        <SearchBar value={query} onChange={setQuery} onSearch={() => runSearch()} />
        <RecentSearches
          searches={recentSearches}
          onSearchPick={runSearch}
          onClear={clearRecentSearches}
        />
      </section>

      <div className="container">
        <div className="home__filters">
          <div className="home__filters-heading">
            <h2>Browse recipes</h2>
            <AreaFilter areas={SUPPORTED_AREAS} selected={area} onSelect={handleArea} />
          </div>

          <div className="home__filter-row">
            <div className="home__filters-label">By course</div>
            <CourseFilter selected={course} onSelect={handleCourse} />
          </div>

          <div className="home__filter-row">
            <div className="home__filters-label">By category</div>
            <CategoryFilter selected={category} onSelect={handleCategory} />
          </div>
        </div>

        <div className="home__toolbar">
          <label className="home__sort">
            <span>Sort</span>
            <select value={sortMode} onChange={event => handleSort(event.target.value)}>
              <option value="default">Default</option>
              <option value="az">A-Z</option>
              <option value="za">Z-A</option>
            </select>
          </label>
          <span className="home__count">
            {loading ? 'Loading recipes' : `${sortedMeals.length} ${sortedMeals.length === 1 ? 'recipe' : 'recipes'}`}
          </span>
        </div>

        {error && <p className="error-banner">{error}</p>}
        {notice && <p className="notice-banner">{notice}</p>}

        <div className="home__grid">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
            : pagedMeals.length === 0
              ? (
                <div className="home__state">
                  <div className="home__state-icon">No matches</div>
                  <h3>No recipes found</h3>
                  <p>Try a different search term, category, course, or area.</p>
                </div>
              )
              : pagedMeals.map(meal => (
                <RecipeCard
                  key={meal.idMeal}
                  meal={meal}
                  isFavorited={favIds.has(meal.idMeal)}
                  onToggleFavorite={onToggleFavorite}
                  rating={ratings[meal.idMeal] || 0}
                />
              ))}
        </div>

        {!loading && sortedMeals.length > 0 && (
          <div className="home__pagination" aria-label="Recipe pages">
            <button
              type="button"
              onClick={() => setPage(current => Math.max(1, current - 1))}
              disabled={safePage === 1}
            >
              Previous
            </button>
            <span>Page {safePage} of {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage(current => Math.min(totalPages, current + 1))}
              disabled={safePage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
