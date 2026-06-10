import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatPercent } from '../utils/formatIDR'

function MarginChart({ data = [] }) {
  return (
    <div className="chart-card">
      <h2>Margin RAB vs Realisasi</h2>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => formatPercent(value)} />
            <Legend />
            <Bar dataKey="margin_rab" name="Margin RAB" fill="#0f766e" radius={[6, 6, 0, 0]} />
            <Bar dataKey="margin_realisasi" name="Margin Realisasi" fill="#2563eb" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default MarginChart
