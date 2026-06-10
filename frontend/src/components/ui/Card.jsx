function Card({ actions, children, className = '', description, title }) {
  return (
    <section className={['ui-card', className].filter(Boolean).join(' ')}>
      {(title || description || actions) && (
        <header className="ui-card-header">
          <div>
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
          {actions && <div className="ui-card-actions">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  )
}

export default Card
