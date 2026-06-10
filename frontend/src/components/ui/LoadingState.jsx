function LoadingState({ className = '', label = 'Memuat data...' }) {
  return (
    <div className={['loading-state', className].filter(Boolean).join(' ')} role="status">
      <span aria-hidden="true" className="loading-state-spinner" />
      <span>{label}</span>
    </div>
  )
}

export default LoadingState
