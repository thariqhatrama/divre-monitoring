function PageHeader({ actions, className = '', description, eyebrow, title }) {
  return (
    <header className={['page-header', className].filter(Boolean).join(' ')}>
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  )
}

export default PageHeader
