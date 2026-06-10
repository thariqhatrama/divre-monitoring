function Input({ className = '', error, hint, label, id, ...props }) {
  const inputId = id || props.name

  return (
    <label className={['ui-field', className].filter(Boolean).join(' ')} htmlFor={inputId}>
      {label && <span>{label}</span>}
      <input className="ui-input" id={inputId} {...props} />
      {hint && !error && <small>{hint}</small>}
      {error && <small className="ui-field-error">{error}</small>}
    </label>
  )
}

export default Input
