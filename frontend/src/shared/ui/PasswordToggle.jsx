export function PasswordToggle({ visible, onToggle }) {
  return (
    <button
      type="button"
      className={`field-toggle password-toggle ${visible ? 'is-visible' : 'is-hidden'}`}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onToggle}
      aria-label={visible ? 'Hide password' : 'Show password'}
      aria-pressed={visible}
      title={visible ? 'Hide password' : 'Show password'}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="password-toggle__icon">
        <path
          className="password-toggle__eye"
          d="M2.7 12S6.4 5.9 12 5.9 21.3 12 21.3 12 17.6 18.1 12 18.1 2.7 12 2.7 12Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
        />
        <circle
          className="password-toggle__pupil"
          cx="12"
          cy="12"
          r="2.7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          className="password-toggle__lid"
          d="M4.4 12C6.3 9.6 8.8 8.4 12 8.4s5.7 1.2 7.6 3.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
        />
        <path
          className="password-toggle__slash"
          d="M4 4.5 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
        />
      </svg>
    </button>
  )
}
