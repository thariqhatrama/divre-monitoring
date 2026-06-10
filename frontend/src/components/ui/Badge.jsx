function Badge({ children, className = '', variant = 'default' }) {
  return (
    <span className={['ui-badge', `ui-badge-${variant}`, className].filter(Boolean).join(' ')}>
      {children}
    </span>
  )
}

export default Badge
