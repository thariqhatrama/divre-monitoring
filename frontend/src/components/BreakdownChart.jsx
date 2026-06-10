import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatIDR } from '../utils/formatIDR'

function BreakdownChart({ data = [] }) {
  return (
    <div className="chart-card">
      <h2>Breakdown RAB vs Realisasi per Kategori</h2>
      <div className="chart-wrap chart-wrap-tall">
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={data} layout="vertical" margin={{ top: 12, right: 24, left: 16, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(value) => formatIDR(value, { short: true })} />
            <YAxis type="category" dataKey="kategori" width={90} />
            <Tooltip formatter={(value) => formatIDR(value)} />
            <Legend />
            <Bar dataKey="rab" name="RAB" fill="#0f766e" radius={[0, 6, 6, 0]} />
            <Bar dataKey="realisasi" name="Realisasi" fill="#f97316" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default BreakdownChart
