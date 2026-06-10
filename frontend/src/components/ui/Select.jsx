import { Children, isValidElement, useEffect, useMemo, useRef, useState } from 'react'

function optionToItem(child) {
  if (!isValidElement(child) || child.type !== 'option') return null

  return {
    value: child.props.value ?? String(child.props.children ?? ''),
    label: child.props.children,
    disabled: child.props.disabled
  }
}

function Select({ children, className = '', error, hint, label, id, name, value, onChange, disabled, required, ...props }) {
  const selectId = id || name
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const options = useMemo(() => Children.toArray(children).map(optionToItem).filter(Boolean), [children])
  const selectedOption = options.find((option) => String(option.value) === String(value)) || options[0]
  const listboxId = `${selectId || 'select'}-listbox`

  useEffect(() => {
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  function selectOption(option) {
    if (option.disabled || disabled) return

    onChange?.({
      target: {
        name,
        value: option.value
      }
    })
    setOpen(false)
  }

  function handleKeyDown(event) {
    if (disabled) return

    if (event.key === 'Escape') {
      setOpen(false)
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen((current) => !current)
    }
  }

  return (
    <label className={['ui-field', className].filter(Boolean).join(' ')} htmlFor={selectId} ref={rootRef}>
      {label && <span>{label}</span>}
      <select
        aria-hidden="true"
        className="ui-select-native"
        disabled={disabled}
        id={selectId}
        name={name}
        onChange={onChange}
        required={required}
        tabIndex={-1}
        value={value}
        {...props}
      >
        {children}
      </select>
      <span className="ui-select-wrap">
        <button
          aria-controls={listboxId}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="ui-select-trigger"
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          onKeyDown={handleKeyDown}
          type="button"
        >
          <span className={selectedOption?.value === '' ? 'ui-select-placeholder' : ''}>{selectedOption?.label || 'Pilih data'}</span>
          <svg aria-hidden="true" className="ui-select-chevron" viewBox="0 0 20 20" focusable="false">
            <path d="M5 7.5 10 12.5 15 7.5" />
          </svg>
        </button>

        {open ? (
          <span className="ui-select-menu" id={listboxId} role="listbox">
            {options.map((option) => {
              const selected = String(option.value) === String(value)
              return (
                <button
                  aria-selected={selected}
                  className={['ui-select-option', selected ? 'is-selected' : '', option.disabled ? 'is-disabled' : ''].filter(Boolean).join(' ')}
                  disabled={option.disabled}
                  key={option.value}
                  onClick={() => selectOption(option)}
                  role="option"
                  type="button"
                >
                  <span>{option.label}</span>
                  {selected ? (
                    <svg aria-hidden="true" viewBox="0 0 20 20" focusable="false">
                      <path d="m5 10 3 3 7-7" />
                    </svg>
                  ) : null}
                </button>
              )
            })}
          </span>
        ) : null}
      </span>
      {hint && !error && <small>{hint}</small>}
      {error && <small className="ui-field-error">{error}</small>}
    </label>
  )
}

export default Select
