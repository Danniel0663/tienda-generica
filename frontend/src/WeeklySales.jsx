import { useState } from 'react';
import { formatCurrency } from './utils';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const SAMPLE = [
  [185000, 216000, 173000, 258000, 312000, 405000, 192000],
  [162000, 179000, 193000, 245000, 291000, 355000, 174000]
];

export function weeklyTotals(sales, today = new Date()) {
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  const previous = new Date(monday);
  previous.setDate(previous.getDate() - 7);
  const totals = [Array(7).fill(0), Array(7).fill(0)];
  for (const sale of sales) {
    const date = new Date(sale.fechaVenta);
    if (date >= previous && date <= today) {
      totals[date >= monday ? 0 : 1][(date.getDay() + 6) % 7] += Number(sale.valorTotalConIva);
    }
  }
  return totals;
}

export default function WeeklySales({ sales, sample = false }) {
  const [week, setWeek] = useState(0);
  const [day, setDay] = useState((new Date().getDay() + 6) % 7);
  const weeks = sample ? SAMPLE : weeklyTotals(sales);
  const peak = Math.max(1, ...weeks.flat());
  const values = weeks[week];
  return (
    <article className="weekly-sales">
      <div className="week-heading">
        <h3>Ventas por día</h3>
        {sample && <small>Datos de ejemplo</small>}
      </div>
      <select aria-label="Semana de ventas" value={week} onChange={event => setWeek(Number(event.target.value))}>
        <option value="0">Esta semana</option><option value="1">Semana anterior</option>
      </select>
      <div className="week-bars">
        {values.map((value, index) => (
          <button type="button" key={DAYS[index]} aria-pressed={index === day}
            aria-label={DAYS[index] + ', ' + formatCurrency(value)} onClick={() => setDay(index)}>
            <i style={{height: (value / peak * 68) + 'px'}} />
            <span>{DAYS[index]}</span>
          </button>
        ))}
      </div>
      <p aria-live="polite"><strong>{DAYS[day]} · {formatCurrency(values[day])}</strong></p>
      <small>Total semanal con IVA · {formatCurrency(values.reduce((sum, value) => sum + value, 0))}</small>
    </article>
  );
}
