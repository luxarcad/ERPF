import { financeFor } from "../data.js";

export const expenseLabels = [
  "Costos directos",
  "Nómina",
  "Operación",
  "Comercial",
  "Otros",
];
const profiles = {
  aurora: { costs: [18, 44, 21, 12, 5], target: 1.04 },
  verde: { costs: [48, 24, 16, 8, 4], target: 0.96 },
  orbita: { costs: [24, 42, 20, 10, 4], target: 1.09 },
  naranja: { costs: [20, 34, 19, 22, 5], target: 0.91 },
  marea: { costs: [57, 18, 14, 8, 3], target: 1.02 },
  cumbre: { costs: [51, 25, 16, 5, 3], target: 0.86 },
};
const receivableAging = {
  aurora: [70, 18, 9, 3],
  verde: [62, 24, 10, 4],
  orbita: [54, 27, 14, 5],
  naranja: [43, 30, 18, 9],
  marea: [76, 16, 6, 2],
  cumbre: [37, 28, 22, 13],
};
export const roundMoney = (value) =>
  Math.round((value + Number.EPSILON) * 100) / 100;
export const sumMoney = (values) =>
  values.reduce((sum, value) => sum + Math.round(value * 100), 0) / 100;
// Allocate in cents; the last category receives the remainder, preserving totals.
export function allocate(total, weights) {
  const cents = Math.round(total * 100);
  const weight = weights.reduce((sum, value) => sum + value, 0);
  let remaining = cents;
  return weights.map((value, index) => {
    const share =
      index === weights.length - 1
        ? remaining
        : Math.round((cents * value) / weight);
    remaining -= share;
    return share / 100;
  });
}
export function changePercent(current, previous) {
  return previous > 0 ? ((current - previous) / previous) * 100 : null;
}
export function buildAnalytics(companies, transactions, period) {
  const count = Number(period.slice(5)) - 4;
  const labels = ["May", "Jun", "Jul", "Ago", "Sep", "Oct"];
  const initialCash = sumMoney(
    companies.map((c) => roundMoney(c.income * 0.28)),
  );
  let balance = initialCash;
  const history = labels.slice(0, count).map((month, i) => {
    const key = `2026-${String(i + 5).padStart(2, "0")}`;
    const metrics = financeFor(companies, transactions, key);
    const opening = balance;
    balance = roundMoney(opening + metrics.income - metrics.expense);
    return { month, period: key, ...metrics, opening, balance };
  });
  const current = history.at(-1);
  const previous = history.at(-2);
  const costs = expenseLabels.map((name) => ({ name, actual: 0, budget: 0 }));
  const budgetUtilization = [0.94, 1.06, 0.88, 1.12, 0.96];
  const receivables = [0, 0, 0, 0];
  const payables = [0, 0, 0, 0];
  const companyMetrics = companies.map((company) => {
    const base = financeFor([company], [], period);
    const actual = financeFor([company], transactions, period);
    const profile = profiles[company.id] || {
      costs: [35, 30, 20, 10, 5],
      target: 1,
    };
    const categoryAmounts = allocate(base.expense, profile.costs);
    categoryAmounts.forEach((amount, i) => {
      costs[i].actual = sumMoney([costs[i].actual, amount]);
      costs[i].budget = sumMoney([
        costs[i].budget,
        roundMoney(amount / budgetUtilization[i]),
      ]);
    });
    allocate(
      roundMoney(base.income * 0.32),
      receivableAging[company.id] ?? [60, 25, 10, 5],
    ).forEach((v, i) => {
      receivables[i] = sumMoney([receivables[i], v]);
    });
    allocate(roundMoney(base.expense * 0.27), [62, 23, 10, 5]).forEach(
      (v, i) => {
        payables[i] = sumMoney([payables[i], v]);
      },
    );
    return {
      ...company,
      ...actual,
      incomeBudget: roundMoney(base.income / profile.target),
    };
  });
  const ids = new Set(companies.map((c) => c.id));
  const imported = transactions.filter(
    (t) => ids.has(t.company) && t.date.startsWith(period),
  );
  const unclassified = sumMoney(
    imported.filter((t) => t.type === "Egreso").map((t) => t.amount),
  );
  if (unclassified > 0)
    costs.push({ name: "Sin clasificar", actual: unclassified, budget: 0 });
  const budget = sumMoney(costs.map((c) => c.budget));
  const incomeBudget = sumMoney(companyMetrics.map((c) => c.incomeBudget));
  const aging = ["Por vencer", "1–30 días", "31–60 días", "+60 días"].map(
    (name, i) => ({ name, receivable: receivables[i], payable: payables[i] }),
  );
  return {
    history,
    current,
    previous,
    costs,
    companyMetrics,
    budget,
    incomeBudget,
    budgetVariance: roundMoney(budget - current.expense),
    budgetUsage: budget ? (current.expense / budget) * 100 : null,
    incomeAttainment: incomeBudget
      ? (current.income / incomeBudget) * 100
      : null,
    aging,
    receivables: sumMoney(receivables),
    payables: sumMoney(payables),
    overdue: sumMoney(receivables.slice(1)),
    importedCount: imported.length,
  };
}
