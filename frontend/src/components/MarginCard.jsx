import { formatIDR, formatPercent } from '../utils/formatIDR'
import MarginBadge from './MarginBadge'

function MarginCard({ title, amount, percent, status, description }) {
  return (
    <div className="margin-card">
      <span>{title}</span>
      <strong>{formatIDR(amount)}</strong>
      <div className="margin-card-meta">
        <span>{formatPercent(percent)}</span>
        <MarginBadge status={status} />
      </div>
      {description ? <small>{description}</small> : null}
    </div>
  )
}

export default MarginCard
