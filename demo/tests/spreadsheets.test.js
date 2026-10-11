import test from 'node:test'
import assert from 'node:assert/strict'
import ExcelJS from 'exceljs'
import { parseWorkbook, exampleRows } from '../src/lib/spreadsheets.js'
import { financeFor, initialCompanies } from '../src/data.js'

async function fixture(rows, headers = ['Fecha', 'Concepto', 'Tipo', 'Monto']) {
  const book = new ExcelJS.Workbook()
  const sheet = book.addWorksheet('Movimientos')
  sheet.addRow(headers)
  rows.forEach(row => sheet.addRow(row))
  return new File([await book.xlsx.writeBuffer()], 'prueba.xlsx')
}
const validRow = ['2026-10-01', 'Venta de servicios', 'Ingreso', 12500.50]

test('reads real XLSX bytes and normalizes type, whitespace and cents', async () => {
  const file = await fixture([['2026-10-01', ' Venta ', ' INGRESO ', 100.129], [new Date('2026-09-04T12:00:00Z'), 'Renta', 'egreso', 30]])
  const rows = await parseWorkbook(file)
  assert.deepEqual(rows, [{ date: '2026-10-01', concept: 'Venta', type: 'Ingreso', amount: 100.13 }, { date: '2026-09-04', concept: 'Renta', type: 'Egreso', amount: 30 }])
})
test('template rows round trip without changing financial totals', async () => {
  const rows = await parseWorkbook(await fixture(exampleRows.map(r => [r.date, r.concept, r.type, r.amount])))
  assert.deepEqual(rows, exampleRows)
  assert.equal(rows.filter(r => r.type === 'Ingreso').reduce((s, r) => s + r.amount, 0), 73000)
  assert.equal(rows.filter(r => r.type === 'Egreso').reduce((s, r) => s + r.amount, 0), 20500)
})
test('rejects a missing required header', async () => {
  await assert.rejects(parseWorkbook(await fixture([validRow], ['Fecha', 'Concepto', 'Tipo', 'Importe'])), /Falta la columna/)
})
test('rejects nonnumeric and nonpositive amounts', async () => {
  for (const amount of ['1000', 0, -2]) await assert.rejects(parseWorkbook(await fixture([[...validRow.slice(0, 3), amount]])), /monto debe ser un número mayor/)
})
test('rejects invalid types, missing concepts and dates outside demo periods', async () => {
  await assert.rejects(parseWorkbook(await fixture([['2026-10-01', 'Venta', 'Transferencia', 100]])), /tipo debe ser/)
  await assert.rejects(parseWorkbook(await fixture([['2026-10-01', '', 'Ingreso', 100]])), /concepto/)
  await assert.rejects(parseWorkbook(await fixture([['2026-07-01', 'Venta', 'Ingreso', 100]])), /agosto, septiembre y octubre/)
  await assert.rejects(parseWorkbook(await fixture([['2026-09-31', 'Venta', 'Ingreso', 100]])), /fecha/)
})
test('rejects formulas even if the workbook includes a cached result', async () => {
  await assert.rejects(parseWorkbook(await fixture([['2026-10-01', 'Venta', 'Ingreso', { formula: '2+2', result: 4 }]])), /no fórmulas/)
})
test('rejects empty, invalid, old-format and oversized files', async () => {
  await assert.rejects(parseWorkbook(await fixture([])), /al menos un movimiento/)
  await assert.rejects(parseWorkbook(new File(['invalid'], 'prueba.xlsx')), /No se pudo leer/)
  await assert.rejects(parseWorkbook(new File(['invalid'], 'prueba.xls')), /extensión .xlsx/)
  await assert.rejects(parseWorkbook(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'grande.xlsx')), /menos de 5 MB/)
})
test('rejects more than 5,000 movements', async () => {
  await assert.rejects(parseWorkbook(await fixture(Array.from({ length: 5001 }, () => validRow))), /hasta 5,000/)
})
test('financial metrics isolate company and period and include imported transactions', () => {
  const company = initialCompanies[0]
  const transactions = [{ company: company.id, date: '2026-10-01', type: 'Ingreso', amount: 1000 }, { company: company.id, date: '2026-10-01', type: 'Egreso', amount: 200 }, { company: company.id, date: '2026-09-01', type: 'Ingreso', amount: 9999 }, { company: 'verde', date: '2026-10-01', type: 'Ingreso', amount: 99999 }]
  const metrics = financeFor([company], transactions, '2026-10')
  assert.equal(metrics.income, company.income + 1000)
  assert.equal(metrics.expense, company.expense + 200)
  assert.equal(metrics.profit, metrics.income - metrics.expense)
  assert.equal(metrics.margin, metrics.profit / metrics.income * 100)
})
test('zero-income companies produce a finite zero margin', () => {
  assert.deepEqual(financeFor([{ id: 'new', income: 0, expense: 0 }], [], '2026-10'), { income: 0, expense: 0, profit: 0, margin: 0 })
})
