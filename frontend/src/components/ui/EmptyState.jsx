function EmptyState({ action, className = '', description, title = 'Belum ada data' }) {
  return (
    <div className={['empty-state', className].filter(Boolean).join(' ')}>
      <div aria-hidden="true" className="empty-state-icon">∅</div>
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  )
}

export default EmptyState
