function Button({ children, className = '', size = 'md', variant = 'primary', type = 'button', ...props }) {
  const classes = ['ui-button', `ui-button-${variant}`, `ui-button-${size}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  )
}

export default Button
