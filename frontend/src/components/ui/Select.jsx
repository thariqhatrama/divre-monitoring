function Select({ children, className = '', error, hint, label, id, ...props }) {
  const selectId = id || props.name

  return (
    <label className={['ui-field', className].filter(Boolean).join(' ')} htmlFor={selectId}>
      {label && <span>{label}</span>}
      <select className="ui-select" id={selectId} {...props}>
        {children}
      </select>
      {hint && !error && <small>{hint}</small>}
      {error && <small className="ui-field-error">{error}</small>}
    </label>
  )
}

export default Select
