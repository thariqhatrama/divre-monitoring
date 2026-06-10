import { Link } from 'react-router-dom'
import MarginBadge from './MarginBadge'
import { formatIDR, formatPercent } from '../utils/formatIDR'

function formatDelta(value, indicator) {
  const formatted = formatPercent(value)
  if (formatted === '-') return '-'
  if (indicator === 'naik') return `▲ ${formatted}`
  if (indicator === 'turun') return `▼ ${formatted}`
  return `◆ ${formatted}`
}

function getDeltaClass(indicator) {
  if (indicator === 'naik') return 'delta-up'
  if (indicator === 'turun') return 'delta-down'
  return 'delta-flat'
}

function ProyekTable({ projects = [], showCabang = true, showActions = true, emptyMessage = 'Belum ada proyek sesuai filter.' }) {
  if (!projects.length) {
    return <p className="master-empty">{emptyMessage}</p>
  }

  return (
    <div className="table-scroll">
      <table className="data-table proyek-table dashboard-project-table">
        <thead>
          <tr>
            <th>Nama Proyek</th>
            {showCabang ? <th>Cabang</th> : null}
            <th>Nilai</th>
            <th>Total RAB</th>
            <th>Margin RAB</th>
            <th>Total Realisasi</th>
            <th>Margin Realisasi</th>
            <th>Delta</th>
            <th>Status Margin</th>
            <th>Status Proyek</th>
            {showActions ? <th>Aksi</th> : null}
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const isCritical = ['kritis', 'rugi'].includes(project.status_margin)

            return (
              <tr key={project.id} className={isCritical ? 'project-risk-row' : undefined}>
                <td>
                  <strong>{project.nama}</strong>
                  <span>{project.klien || 'Klien belum diisi'}</span>
                </td>
                {showCabang ? (
                  <td>
                    <strong>{project.cabang?.nama || '-'}</strong>
                    <span>{project.cabang?.kode_seg23 || '-'}</span>
                  </td>
                ) : null}
                <td>{formatIDR(project.nilai_proyek_idr, { short: true })}</td>
                <td>{formatIDR(project.total_rab_idr, { short: true })}</td>
                <td>{formatPercent(project.margin_rab)}</td>
                <td>{formatIDR(project.total_realisasi_idr, { short: true })}</td>
                <td>{formatPercent(project.margin_realisasi)}</td>
                <td className={getDeltaClass(project.indikator_delta)}>{formatDelta(project.delta_margin, project.indikator_delta)}</td>
                <td><MarginBadge status={project.status_margin} /></td>
                <td><span className={`status-pill status-${project.status}`}>{project.status}</span></td>
                {showActions ? (
                  <td>
                    <div className="table-actions">
                      <Link to={`/proyek/${project.id}/detail`}>Detail</Link>
                      <Link to={`/proyek/${project.id}/rab`}>RAB</Link>
                      <Link to={`/proyek/${project.id}/realisasi`}>Realisasi</Link>
                    </div>
                  </td>
                ) : null}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ProyekTable
