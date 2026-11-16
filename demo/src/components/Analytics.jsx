import { useMemo, useState } from "react";
import {
  ChartNoAxesCombined,
  Info,
  Table2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import ChartCanvas from "./ChartCanvas";
import { Filters } from "./UI";
import { money, percent } from "../data";
import { buildAnalytics, changePercent } from "../lib/analytics";
import "./Analytics.css";

const blue = "#3964dc",
  green = "#29977d",
  orange = "#e8a05b";
const colors = [blue, green, orange, "#8499c9", "#b6c5d5", "#b87a59"];
const compact = (value) =>
  Math.abs(value) >= 1e6
    ? `${Number((value / 1e6).toFixed(1))} M`
    : Math.abs(value) >= 1000
      ? `${Number((value / 1000).toFixed(0))} mil`
      : value;
const tooltip = {
  trigger: "axis",
  renderMode: "richText",
  confine: true,
  backgroundColor: "#fff",
  borderWidth: 0,
  padding: 14,
  textStyle: { color: "#24364c", fontSize: 12 },
  extraCssText: "box-shadow: 0 8px 30px #23364c18",
  valueFormatter: money,
};
const grid = { left: 12, right: 20, top: 20, bottom: 8, containLabel: true };
const valueAxis = {
  type: "value",
  axisLabel: { color: "#8994a5", fontSize: 11, formatter: compact },
  splitLine: { lineStyle: { color: "#edf0f5", type: "dashed" } },
};
const categoryAxis = (data) => ({
  type: "category",
  data,
  axisTick: { show: false },
  axisLine: { show: false },
  axisLabel: { color: "#7d899c", fontSize: 11, margin: 15 },
});
const legend = (data) => ({
  bottom: 0,
  data,
  icon: "circle",
  itemWidth: 7,
  itemHeight: 7,
  itemGap: 22,
  textStyle: { color: "#6f7e92", fontSize: 11 },
});

function ChartFrame({
  title,
  unit = "MXN",
  help,
  showHelp,
  columns,
  rows,
  children,
  className = "",
  onRowSelect,
}) {
  const [table, setTable] = useState(false);
  return (
    <section className={`analytics-panel ${className}`}>
      <header className="chart-heading">
        <div>
          <h2>{title}</h2>
          <span className="chart-unit">{unit}</span>
        </div>
        <div className="chart-tools">
          {showHelp && (
            <details className="chart-help">
              <summary
                aria-label={`Acerca de ${title}`}
                title="Acerca de este indicador"
              >
                <Info size={15} />
              </summary>
              <p>{help}</p>
            </details>
          )}
          <button
            className="chart-tool"
            onClick={() => setTable(!table)}
            aria-pressed={table}
            aria-label={`${table ? "Ver gráfico" : "Ver datos"}: ${title}`}
            title={table ? "Ver gráfico" : "Ver datos"}
          >
            {table ? <ChartNoAxesCombined size={16} /> : <Table2 size={15} />}
          </button>
        </div>
      </header>
      {table ? (
        <div
          className="chart-data"
          tabIndex={0}
          aria-label={`Datos de ${title}`}
        >
          <table>
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {row.map((value, j) => (
                    <td key={j}>
                      {j === 0 && onRowSelect ? (
                        <button
                          className="text-button"
                          onClick={() => onRowSelect(i)}
                        >
                          {value}
                        </button>
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}
    </section>
  );
}

function Sparkline({ values, color }) {
  const min = Math.min(...values),
    max = Math.max(...values);
  const points = values
    .map(
      (v, i) =>
        `${(i * 88) / Math.max(values.length - 1, 1)},${33 - ((v - min) / (max - min || 1)) * 29}`,
    )
    .join(" ");
  return (
    <svg className="metric-sparkline" viewBox="0 0 90 38" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Metric({
  label,
  value,
  change,
  suffix = "%",
  series,
  color = blue,
  foot,
}) {
  const positive = change >= 0;
  return (
    <article className="business-metric">
      <div className="metric-label">{label}</div>
      <strong>{value}</strong>
      <div className="metric-context">
        {change != null ? (
          <>
            <span className={positive ? "metric-positive" : "metric-negative"}>
              {positive ? (
                <ArrowUpRight size={13} />
              ) : (
                <ArrowDownRight size={13} />
              )}
              {positive ? "+" : ""}
              {change.toLocaleString("es-MX", { maximumFractionDigits: 1 })}
              {suffix}
            </span>
            <span>vs. mes anterior</span>
          </>
        ) : (
          <span>{foot || "Sin periodo comparable"}</span>
        )}
      </div>
      {series && <Sparkline values={series} color={color} />}
    </article>
  );
}

function Trend({ model, showHelp }) {
  const { history } = model;
  const option = {
    color: [blue, green],
    tooltip,
    legend: legend(["Ingresos", "Egresos"]),
    grid: { ...grid, bottom: 44 },
    xAxis: { ...categoryAxis(history.map((h) => h.month)), boundaryGap: false },
    yAxis: valueAxis,
    series: ["income", "expense"].map((key, i) => ({
      name: i ? "Egresos" : "Ingresos",
      type: "line",
      smooth: 0.3,
      showSymbol: false,
      symbol: "circle",
      symbolSize: 7,
      lineStyle: { width: 2.5 },
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: i ? "#29977d16" : "#3964dc22" },
            { offset: 1, color: "#ffffff00" },
          ],
        },
      },
      data: history.map((h) => h[key]),
    })),
  };
  return (
    <ChartFrame
      title="Ingresos y egresos"
      help="Evolución mensual desde mayo hasta el periodo seleccionado. Incluye los movimientos de Excel de cada empresa en el mes al que corresponden."
      showHelp={showHelp}
      columns={["Mes", "Ingresos", "Egresos", "Resultado"]}
      rows={history.map((h) => [
        h.month,
        money(h.income),
        money(h.expense),
        money(h.profit),
      ])}
    >
      <ChartCanvas
        option={option}
        description="Evolución de ingresos y egresos por mes. Usa Ver datos para consultar los importes."
      />
    </ChartFrame>
  );
}

function Costs({ model, showHelp }) {
  const active = model.costs.filter((c) => c.actual > 0);
  const option = {
    color: colors,
    tooltip: {
      ...tooltip,
      trigger: "item",
      formatter: (p) => `${p.name}\n${money(p.value)} · ${percent(p.percent)}`,
    },
    series: [
      {
        name: "Egresos",
        type: "pie",
        radius: ["62%", "83%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: "#fff", borderWidth: 4, borderRadius: 5 },
        label: { show: false },
        emphasis: { scaleSize: 3 },
        data: active.map((c) => ({ name: c.name, value: c.actual })),
      },
    ],
  };
  return (
    <ChartFrame
      title="Composición de egresos"
      help="Distribución del escenario de ejemplo por categoría. Los egresos de Excel se agregan como Sin clasificar; no se les asigna una categoría automáticamente."
      showHelp={showHelp}
      columns={["Categoría", "Importe", "% del total"]}
      rows={active.map((c) => [
        c.name,
        money(c.actual),
        percent((c.actual / model.current.expense) * 100),
      ])}
    >
      {active.length ? (
        <div className="cost-distribution">
          <div className="donut-wrap">
            <ChartCanvas
              option={option}
              className="donut-chart"
              description="Gráfico de dona con la distribución de egresos por categoría."
            />
            <div className="donut-center">
              <span>Total</span>
              <strong>{money(model.current.expense)}</strong>
            </div>
          </div>
          <div className="cost-legend">
            {active.map((c, i) => (
              <div key={c.name}>
                <span>
                  <i style={{ background: colors[i] }} />
                  {c.name}
                </span>
                <strong>
                  {percent((c.actual / model.current.expense) * 100)}
                </strong>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="chart-empty">Sin egresos en este periodo</div>
      )}
    </ChartFrame>
  );
}

function Cash({ model, showHelp }) {
  const { current: c } = model;
  const steps = [
    ["Saldo inicial", 0, c.opening, blue],
    ["Ingresos", c.opening, c.opening + c.income, green],
    ["Egresos", c.opening + c.income, c.balance, orange],
    ["Saldo final", 0, c.balance, blue],
  ];
  const option = {
    grid: { ...grid, top: 25 },
    tooltip: {
      ...tooltip,
      trigger: "item",
      formatter: (p) =>
        `${steps[p.dataIndex][0]}\n${money(p.value[2] - p.value[1])}`,
    },
    xAxis: categoryAxis(steps.map((s) => s[0])),
    yAxis: { ...valueAxis, scale: false },
    series: [
      {
        type: "custom",
        data: steps.map((s, i) => [i, s[1], s[2]]),
        encode: { x: 0, y: [1, 2] },
        renderItem: (params, api) => {
          const start = api.coord([api.value(0), api.value(1)]),
            end = api.coord([api.value(0), api.value(2)]),
            width = api.size([1, 0])[0] * 0.48;
          return {
            type: "rect",
            shape: {
              x: start[0] - width / 2,
              y: Math.min(start[1], end[1]),
              width,
              height: Math.max(Math.abs(start[1] - end[1]), 1),
              r: 3,
            },
            style: { fill: steps[params.dataIndex][3] },
          };
        },
      },
    ],
  };
  return (
    <ChartFrame
      title="Flujo de caja"
      help="Modelo simplificado de caja: saldo inicial + ingresos − egresos = saldo final. El saldo inicial acumula el flujo desde mayo y un capital de ejemplo. No representa un estado financiero contable completo."
      showHelp={showHelp}
      columns={["Movimiento", "Importe"]}
      rows={[
        ["Saldo inicial", money(c.opening)],
        ["Ingresos", money(c.income)],
        ["Egresos", money(-c.expense)],
        ["Saldo final", money(c.balance)],
      ]}
    >
      <ChartCanvas
        option={option}
        description={`Flujo de caja. Saldo inicial ${money(c.opening)}, ingresos ${money(c.income)}, egresos ${money(c.expense)}, saldo final ${money(c.balance)}.`}
      />
    </ChartFrame>
  );
}

function Ranking({ model, showHelp, onCompanySelect }) {
  const multiple = model.companyMetrics.length > 1;
  const list = multiple
    ? [...model.companyMetrics].sort((a, b) => b.margin - a.margin)
    : model.history;
  const title = multiple ? "Rentabilidad por empresa" : "Margen mensual";
  const option = {
    grid: { ...grid, left: 10, right: 48, top: 5 },
    tooltip: { ...tooltip, valueFormatter: percent },
    xAxis: {
      ...valueAxis,
      axisLabel: { ...valueAxis.axisLabel, formatter: (v) => `${v}%` },
    },
    yAxis: {
      ...categoryAxis(list.map((c) => (multiple ? c.name : c.month))),
      inverse: true,
      axisLabel: {
        ...categoryAxis([]).axisLabel,
        width: 120,
        overflow: "truncate",
      },
    },
    series: [
      {
        name: "Margen neto",
        type: "bar",
        barMaxWidth: 14,
        data: list.map((c, i) => ({
          value: Number(c.margin.toFixed(1)),
          itemStyle: {
            color: c.margin < 0 ? orange : i === 0 ? green : "#7190e4",
            borderRadius: 3,
          },
        })),
        label: {
          show: true,
          position: "right",
          color: "#52617a",
          fontSize: 11,
          formatter: (p) => `${p.value}%`,
        },
      },
    ],
  };
  return (
    <ChartFrame
      title={title}
      unit="%"
      help="Margen neto = (ingresos − egresos) / ingresos. Selecciona una empresa en el gráfico o en su tabla para abrir su análisis. No incluye impuestos ni ajustes contables."
      showHelp={showHelp}
      columns={[multiple ? "Empresa" : "Mes", "Resultado", "Margen"]}
      rows={list.map((c) => [
        multiple ? c.name : c.month,
        money(c.profit),
        percent(c.margin),
      ])}
      onRowSelect={multiple ? (i) => onCompanySelect(list[i].id) : undefined}
    >
      <ChartCanvas
        option={option}
        description="Comparación del margen neto. La tabla ofrece los valores exactos y selección por teclado."
        onSelect={multiple ? (i) => onCompanySelect(list[i].id) : undefined}
      />
    </ChartFrame>
  );
}

function Profit({ model, showHelp }) {
  const option = {
    color: [blue, orange],
    grid: { ...grid, right: 22, bottom: 42 },
    tooltip: { ...tooltip, valueFormatter: undefined },
    legend: legend(["Resultado neto", "Margen neto"]),
    xAxis: categoryAxis(model.history.map((h) => h.month)),
    yAxis: [
      valueAxis,
      {
        ...valueAxis,
        axisLabel: { ...valueAxis.axisLabel, formatter: (v) => `${v}%` },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "Resultado neto",
        type: "bar",
        barMaxWidth: 35,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        tooltip: { valueFormatter: money },
        data: model.history.map((h) => ({
          value: h.profit,
          itemStyle: h.profit < 0 ? { color: "#d87855" } : undefined,
        })),
      },
      {
        name: "Margen neto",
        type: "line",
        yAxisIndex: 1,
        symbolSize: 6,
        smooth: 0.2,
        tooltip: { valueFormatter: percent },
        data: model.history.map((h) => Number(h.margin.toFixed(2))),
      },
    ],
  };
  return (
    <ChartFrame
      title="Resultado y margen"
      unit="MXN / %"
      help="Las barras muestran ingresos menos egresos, con escala a la izquierda. La línea muestra el margen neto, con escala porcentual a la derecha."
      showHelp={showHelp}
      columns={["Mes", "Resultado neto", "Margen neto"]}
      rows={model.history.map((h) => [
        h.month,
        money(h.profit),
        percent(h.margin),
      ])}
    >
      <ChartCanvas
        option={option}
        description="Gráfico combinado de resultado neto en barras y margen neto en línea, con dos escalas."
      />
    </ChartFrame>
  );
}

function Budget({ model, showHelp }) {
  const option = {
    color: ["#d4dff7", blue],
    tooltip,
    legend: legend(["Presupuesto", "Real"]),
    grid: { ...grid, bottom: 40 },
    xAxis: valueAxis,
    yAxis: { ...categoryAxis(model.costs.map((c) => c.name)), inverse: true },
    series: [
      {
        name: "Presupuesto",
        type: "bar",
        barMaxWidth: 11,
        data: model.costs.map((c) => c.budget),
        itemStyle: { borderRadius: 3 },
      },
      {
        name: "Real",
        type: "bar",
        barMaxWidth: 11,
        data: model.costs.map((c) => ({
          value: c.actual,
          itemStyle: {
            color: c.actual > c.budget ? orange : blue,
            borderRadius: 3,
          },
        })),
      },
    ],
  };
  return (
    <ChartFrame
      title="Egresos vs. presupuesto"
      help="Presupuesto mensual del escenario. El naranja indica un gasto superior a lo previsto. Las importaciones modifican el gasto real, sin cambiar el presupuesto."
      showHelp={showHelp}
      columns={["Categoría", "Presupuesto", "Real", "Disponible"]}
      rows={model.costs.map((c) => [
        c.name,
        money(c.budget),
        money(c.actual),
        money(c.budget - c.actual),
      ])}
    >
      <ChartCanvas
        option={option}
        description="Barras agrupadas de egresos reales y presupuestados por categoría."
      />
    </ChartFrame>
  );
}

function Targets({ model, showHelp }) {
  const list = model.companyMetrics;
  const option = {
    color: [green, "#dce4ef"],
    tooltip: { ...tooltip, valueFormatter: percent },
    grid: { ...grid, right: 40 },
    xAxis: {
      ...valueAxis,
      max: (v) => Math.max(120, Math.ceil(v.max / 20) * 20),
      axisLabel: { ...valueAxis.axisLabel, formatter: (v) => `${v}%` },
    },
    yAxis: {
      ...categoryAxis(list.map((c) => c.name)),
      inverse: true,
      axisLabel: {
        ...categoryAxis([]).axisLabel,
        width: 110,
        overflow: "truncate",
      },
    },
    series: [
      {
        name: "Cumplimiento",
        type: "bar",
        barMaxWidth: 18,
        showBackground: true,
        backgroundStyle: { color: "#f3f6fa", borderRadius: 4 },
        data: list.map((c) => ({
          value: c.incomeBudget
            ? Number(((c.income / c.incomeBudget) * 100).toFixed(1))
            : 0,
          itemStyle: {
            color: c.income >= c.incomeBudget ? green : blue,
            borderRadius: 4,
          },
        })),
        label: {
          show: true,
          position: "right",
          color: "#607089",
          fontSize: 11,
          formatter: (p) => `${p.value}%`,
        },
        markLine: {
          symbol: "none",
          silent: true,
          label: { show: false },
          lineStyle: { color: "#9baabd", type: "dashed" },
          data: [{ xAxis: 100 }],
        },
      },
    ],
  };
  return (
    <ChartFrame
      title="Cumplimiento de ingresos"
      unit="% de la meta"
      help="Ingresos reales divididos entre la meta mensual del escenario. La línea punteada marca el 100%. Una empresa nueva sin meta muestra 0% en el gráfico y Sin meta en la tabla."
      showHelp={showHelp}
      columns={["Empresa", "Meta", "Real", "Cumplimiento"]}
      rows={list.map((c) => [
        c.name,
        money(c.incomeBudget),
        money(c.income),
        c.incomeBudget
          ? percent((c.income / c.incomeBudget) * 100)
          : "Sin meta",
      ])}
    >
      <ChartCanvas
        option={option}
        description="Barras de cumplimiento de la meta de ingresos por empresa, con referencia del 100%."
      />
    </ChartFrame>
  );
}

function Aging({ model, showHelp }) {
  const option = {
    color: [blue, green, orange, "#ce785e"],
    tooltip,
    legend: { ...legend(model.aging.map((a) => a.name)), itemGap: 13 },
    grid: { ...grid, top: 35, bottom: 50 },
    xAxis: valueAxis,
    yAxis: categoryAxis(["Por cobrar", "Por pagar"]),
    series: model.aging.map((a) => ({
      name: a.name,
      type: "bar",
      stack: "total",
      barMaxWidth: 48,
      data: [a.receivable, a.payable],
    })),
  };
  return (
    <ChartFrame
      title="Antigüedad de saldos"
      help="Cartera de ejemplo al cierre del periodo. Días desde el vencimiento: por vencer, 1–30, 31–60 y más de 60. Los archivos de movimientos no modifican esta cartera porque no incluyen facturas ni fechas de vencimiento."
      showHelp={showHelp}
      columns={["Vencimiento", "Por cobrar", "Por pagar"]}
      rows={model.aging.map((a) => [
        a.name,
        money(a.receivable),
        money(a.payable),
      ])}
    >
      <ChartCanvas
        option={option}
        description="Barras apiladas de cuentas por cobrar y por pagar, distribuidas por vencimiento."
      />
    </ChartFrame>
  );
}

export default function Analytics({
  companies,
  transactions,
  period,
  view = "overview",
  onCompanySelect,
  showHelp = true,
}) {
  const [tab, setTab] = useState("Resultados");
  const model = useMemo(
    () => buildAnalytics(companies, transactions, period),
    [companies, transactions, period],
  );
  const { current: c, previous: p, history } = model;
  const props = { model, showHelp };
  return (
    <div className="analytics-workspace">
      {view === "finances" && (
        <div className="analytics-tabs">
          <Filters
            items={["Resultados", "Presupuesto", "Capital de trabajo"]}
            value={tab}
            onChange={setTab}
            label="Área de análisis financiero"
          />
        </div>
      )}
      {view === "overview" || tab === "Resultados" ? (
        <>
          <div className="business-metrics">
            <Metric
              label="Ingresos"
              value={money(c.income)}
              change={changePercent(c.income, p?.income)}
              series={history.map((h) => h.income)}
            />
            <Metric
              label="Resultado neto"
              value={money(c.profit)}
              change={changePercent(c.profit, p?.profit)}
              series={history.map((h) => h.profit)}
              color={green}
            />
            <Metric
              label="Margen neto"
              value={percent(c.margin)}
              change={p?.income && c.income ? c.margin - p.margin : null}
              suffix=" pp"
              series={history.map((h) => h.margin)}
              color={orange}
            />
            <Metric
              label="Saldo de caja"
              value={money(c.balance)}
              change={changePercent(c.balance, p?.balance)}
              series={history.map((h) => h.balance)}
            />
          </div>
          <div className="analytics-grid primary">
            <Trend {...props} />
            <Costs {...props} />
          </div>
          <div className="analytics-grid">
            {view === "overview" ? <Cash {...props} /> : <Profit {...props} />}
            <Ranking {...props} onCompanySelect={onCompanySelect} />
          </div>
        </>
      ) : tab === "Presupuesto" ? (
        <>
          <div className="business-metrics">
            <Metric
              label="Presupuesto de egresos"
              value={money(model.budget)}
              foot="Plan del periodo"
            />
            <Metric
              label="Egresos reales"
              value={money(c.expense)}
              foot={`${model.budgetUsage == null ? "Sin presupuesto" : `${percent(model.budgetUsage)} ejecutado`}`}
            />
            <Metric
              label={
                model.budgetVariance >= 0
                  ? "Presupuesto disponible"
                  : "Exceso de presupuesto"
              }
              value={money(Math.abs(model.budgetVariance))}
              foot={
                model.budgetVariance >= 0
                  ? "Presupuesto − gasto real"
                  : "Gasto real − presupuesto"
              }
            />
            <Metric
              label="Meta de ingresos"
              value={money(model.incomeBudget)}
              foot={
                model.incomeAttainment == null
                  ? "Sin meta asignada"
                  : `${percent(model.incomeAttainment)} alcanzado`
              }
            />
          </div>
          <div className="analytics-grid">
            <Budget {...props} />
            <Targets {...props} />
          </div>
        </>
      ) : (
        <>
          <div className="business-metrics">
            <Metric
              label="Saldo de caja"
              value={money(c.balance)}
              foot="Al cierre del periodo"
              series={history.map((h) => h.balance)}
            />
            <Metric
              label="Cuentas por cobrar"
              value={money(model.receivables)}
              foot="Cartera del escenario"
            />
            <Metric
              label="Cartera vencida"
              value={money(model.overdue)}
              foot={
                model.receivables
                  ? `${percent((model.overdue / model.receivables) * 100)} de las cuentas por cobrar`
                  : "Sin cuentas por cobrar"
              }
            />
            <Metric
              label="Cuentas por pagar"
              value={money(model.payables)}
              foot="Obligaciones del escenario"
            />
          </div>
          <div className="analytics-grid">
            <Cash {...props} />
            <Aging {...props} />
          </div>
        </>
      )}
    </div>
  );
}
