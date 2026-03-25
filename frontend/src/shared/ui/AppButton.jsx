import './AppButton.scss'

export function AppButton({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  onClick,
}) {
  return (
    <button
      type={type}
      className={`app-button app-button--${variant}`}
      disabled={disabled}
      onClick={onClick}
    >
      <span>{children}</span>
    </button>
  )
}
