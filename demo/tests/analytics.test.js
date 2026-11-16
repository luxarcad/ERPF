import test from "node:test";
import assert from "node:assert/strict";
import { initialCompanies, financeFor } from "../src/data.js";
import {
  allocate,
  buildAnalytics,
  roundMoney,
  sumMoney,
} from "../src/lib/analytics.js";

test("category, company and aggregate totals reconcile for every demo month", () => {
  for (const period of ["2026-08", "2026-09", "2026-10"]) {
    const model = buildAnalytics(initialCompanies, [], period);
    assert.equal(
      sumMoney(model.costs.map((c) => c.actual)),
      model.current.expense,
    );
    assert.equal(
      sumMoney(model.companyMetrics.map((c) => c.income)),
      model.current.income,
    );
    assert.equal(
      sumMoney(model.companyMetrics.map((c) => c.expense)),
      model.current.expense,
    );
    assert.equal(
      sumMoney(model.companyMetrics.map((c) => c.profit)),
      model.current.profit,
    );
    assert.equal(
      model.current.profit,
      roundMoney(model.current.income - model.current.expense),
    );
    assert.equal(
      model.current.balance,
      roundMoney(model.current.opening + model.current.profit),
    );
    assert.equal(model.current.opening, model.previous.balance);
  }
});

test("expense imports update actuals and cash without rewriting budgets or invoice fixtures", () => {
  const company = [initialCompanies[0]];
  const before = buildAnalytics(company, [], "2026-10");
  const transactions = [
    {
      company: company[0].id,
      date: "2026-10-07",
      type: "Egreso",
      amount: 15100.28,
    },
  ];
  const after = buildAnalytics(company, transactions, "2026-10");
  assert.equal(
    after.current.expense,
    roundMoney(before.current.expense + 15100.28),
  );
  assert.equal(
    after.current.balance,
    roundMoney(before.current.balance - 15100.28),
  );
  assert.equal(after.costs.at(-1).name, "Sin clasificar");
  assert.equal(after.costs.at(-1).actual, 15100.28);
  assert.equal(
    sumMoney(after.costs.map((c) => c.actual)),
    after.current.expense,
  );
  assert.equal(after.budget, before.budget);
  assert.equal(after.incomeBudget, before.incomeBudget);
  assert.deepEqual(after.aging, before.aging);
});

test("historical imports affect later cash but only their own month in income and expenses", () => {
  const company = [initialCompanies[0]];
  const before = buildAnalytics(company, [], "2026-10");
  const after = buildAnalytics(
    company,
    [
      {
        company: company[0].id,
        date: "2026-09-01",
        type: "Ingreso",
        amount: 50000,
      },
      {
        company: initialCompanies[1].id,
        date: "2026-10-01",
        type: "Ingreso",
        amount: 99999,
      },
    ],
    "2026-10",
  );
  assert.equal(after.current.income, before.current.income);
  assert.equal(after.current.balance, before.current.balance + 50000);
  assert.equal(after.previous.income, before.previous.income + 50000);
  assert.equal(after.importedCount, 0);
});

test("zero-activity company has no invented cash, targets, categories or receivables", () => {
  const model = buildAnalytics(
    [{ id: "new", income: 0, expense: 0 }],
    [],
    "2026-10",
  );
  assert.equal(model.current.balance, 0);
  assert.equal(model.current.margin, 0);
  assert.equal(model.budgetUsage, null);
  assert.equal(model.incomeAttainment, null);
  assert.equal(model.receivables, 0);
  assert.equal(model.payables, 0);
  assert.equal(sumMoney(model.costs.map((c) => c.actual)), 0);
});

test("losses and negative cash are preserved instead of clamped", () => {
  const model = buildAnalytics(
    [{ id: "loss", income: 100, expense: 400 }],
    [],
    "2026-10",
  );
  assert.equal(model.current.profit, -300);
  assert.equal(model.current.margin, -300);
  assert.ok(model.current.balance < 0);
});

test("cent allocation and imported decimals do not drift from financial totals", () => {
  assert.equal(sumMoney(allocate(100.01, [18, 44, 21, 12, 5])), 100.01);
  const company = [{ id: "decimal", income: 0, expense: 0 }];
  const transactions = Array.from({ length: 30 }, () => ({
    company: "decimal",
    date: "2026-10-01",
    type: "Ingreso",
    amount: 0.1,
  }));
  assert.equal(financeFor(company, transactions, "2026-10").income, 3);
  const model = buildAnalytics(initialCompanies, [], "2026-10");
  assert.equal(
    sumMoney(model.aging.map((a) => a.receivable)),
    model.receivables,
  );
  assert.equal(sumMoney(model.aging.map((a) => a.payable)), model.payables);
});
