/**
 * Navbar — sticky top navigation with logo, page links, and dark mode toggle.
 * Uses NavLink for active-class highlighting and useDarkMode for theme control.
 */
import { NavLink } from 'react-router-dom';
import { GiKnifeFork } from 'react-icons/gi';
import { FaHeart } from 'react-icons/fa';
import { FiSun, FiMoon } from 'react-icons/fi';
import useDarkMode from '../hooks/useDarkMode';
import './Navbar.css';

export default function Navbar() {
  const [isDark, toggleDark] = useDarkMode();

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__logo">
          <GiKnifeFork className="navbar__logo-icon" />
          <span>Modern Hearth</span>
        </NavLink>

        <nav className="navbar__nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => 'navbar__link' + (isActive ? ' active' : '')}
          >
            Home
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) => 'navbar__link' + (isActive ? ' active' : '')}
          >
            <FaHeart style={{ verticalAlign: '-2px', marginRight: 4 }} />
            Favorites
          </NavLink>
          <button
            className="navbar__dark-toggle"
            onClick={toggleDark}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <FiSun /> : <FiMoon />}
          </button>
        </nav>
      </div>
    </header>
  );
}
