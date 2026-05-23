/**
 * NotFound — 404 page shown for any unmatched route.
 */
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
      <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍳</p>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        Page not found
      </h1>
      <p style={{ color: 'var(--color-muted)', marginBottom: '2rem' }}>
        Looks like this page got burned.
      </p>
      <Link
        to="/"
        style={{
          padding: '0.6rem 1.5rem',
          background: 'var(--color-saffron)',
          color: '#fff',
          borderRadius: 'var(--radius-pill)',
          fontWeight: 600,
        }}
      >
        Go Home
      </Link>
    </div>
  );
}
