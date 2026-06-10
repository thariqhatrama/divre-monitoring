import { getMarginStatusClass, getMarginStatusLabel } from '../utils/marginFlag'

function MarginBadge({ status }) {
  return (
    <span className={`status-pill ${getMarginStatusClass(status)}`}>
      {getMarginStatusLabel(status)}
    </span>
  )
}

export default MarginBadge
