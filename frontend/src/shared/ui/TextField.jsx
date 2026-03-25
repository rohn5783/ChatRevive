import './TextField.scss'

export function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
  readOnly = false,
  inputMode,
  maxLength,
  trailingAction,
}) {
  return (
    <label className="text-field">
      <span className="sr-only">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        readOnly={readOnly}
        inputMode={inputMode}
        maxLength={maxLength}
      />
      {trailingAction ? <span className="text-field__action">{trailingAction}</span> : null}
    </label>
  )
}
