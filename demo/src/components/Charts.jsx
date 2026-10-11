import { useState } from "react";
import { ArrowUpRight, ChevronDown, TrendingUp } from "lucide-react";
import { financeFor, money, compactMoney, percent } from "../data";

export function RevenueChart({ companies, transactions, period }) {
  const [hover, setHover] = useState(null);
  const [mode, setMode] = useState("both");
  const month = Number(period.slice(5));
  const months = ["May", "Jun", "Jul", "Ago", "Sep", "Oct"];
  const points = months
    .slice(0, month - 4)
    .map((label, i) => ({
      label,
      ...financeFor(
        companies,
        transactions,
        `2026-${String(i + 5).padStart(2, "0")}`,
      ),
    }));
  const max =
    Math.max(...points.flatMap((p) => [p.income, p.expense]), 1000) * 1.2;
  const grid = Array.from({ length: 5 }, (_, i) => (max * (4 - i)) / 4);
  const total = points.at(-1);
  const previous = points.at(-2);
  const growth = previous?.income
    ? ((total.income - previous.income) / previous.income) * 100
    : 0;
  return (
    <section className="panel revenue-panel">
      <div className="chart-head">
        <div>
          <h2>Desempeño financiero</h2>
          <p>Así crecen las empresas de tu grupo</p>
        </div>
        <label className="chart-mode">
          <select
            aria-label="Series del gráfico"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="both">Ingresos y egresos</option>
            <option value="income">Solo ingresos</option>
            <option value="expense">Solo egresos</option>
          </select>
          <ChevronDown size={13} />
        </label>
      </div>
      <div className="chart-summary">
        <strong>{compactMoney(total.income)}</strong>
        <span className="growth">
          <ArrowUpRight size={13} />
          {growth >= 0 ? "+" : ""}
          {percent(growth)}
        </span>
        <span className="muted">vs. mes anterior</span>
        <div className="chart-legend">
          {mode !== "expense" && (
            <span>
              <i className="blue-dot" />
              Ingresos
            </span>
          )}
          {mode !== "income" && (
            <span>
              <i className="mint-dot" />
              Egresos
            </span>
          )}
        </div>
      </div>
      <div
        className="bar-chart"
        role="img"
        aria-label={`Ingresos y egresos de mayo a ${points.at(-1).label} de 2026. Último mes: ingresos ${money(total.income)}, egresos ${money(total.expense)}.`}
      >
        <div className="chart-y">
          {grid.map((g, i) => (
            <span key={i}>{g === 0 ? "$0" : compactMoney(g)}</span>
          ))}
        </div>
        <div className="chart-plot">
          <div className="grid-lines">
            {grid.map((_, i) => (
              <i key={i} />
            ))}
          </div>
          <div className="bar-groups">
            {points.map((point, i) => (
              <div
                key={point.label}
                className={`bar-group ${i === points.length - 1 ? "current" : ""}`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={`${point.label}: ingresos ${money(point.income)}, egresos ${money(point.expense)}`}
              >
                <div className="bar-pair">
                  {mode !== "expense" && (
                    <div
                      className="bar income"
                      style={{ height: `${(point.income / max) * 100}%` }}
                    />
                  )}
                  {mode !== "income" && (
                    <div
                      className="bar expense"
                      style={{ height: `${(point.expense / max) * 100}%` }}
                    />
                  )}
                </div>
                <span className="month-label">{point.label}</span>
                {hover === i && (
                  <div className="chart-tooltip">
                    <strong>{point.label} 2026</strong>
                    <span>Ingresos {money(point.income)}</span>
                    <span>Egresos {money(point.expense)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="chart-foot">
        <span>
          <TrendingUp size={14} />
          Cada decisión cuenta. Cada resultado enseña.
        </span>
        <span>
          MXN · Datos de ejemplo{transactions.length ? " + importaciones" : ""}
        </span>
      </div>
    </section>
  );
}

export function ProgressRing({ value }) {
  const radius = 66;
  const length = 2 * Math.PI * radius;
  return (
    <div className="progress-ring">
      <svg viewBox="0 0 160 160" aria-hidden="true">
        <circle cx="80" cy="80" r={radius} className="ring-track" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          className="ring-value"
          strokeDasharray={`${(length * value) / 100} ${length}`}
        />
      </svg>
      <div>
        <strong>
          {value}
          <span>%</span>
        </strong>
        <small>avance promedio</small>
      </div>
    </div>
  );
}
