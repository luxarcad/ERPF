// ExcelJS is loaded only when a workbook is imported or downloaded.
async function workbook() {
  const { default: ExcelJS } = await import("exceljs");
  return new ExcelJS.Workbook();
}

export function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const exampleRows = [
  {
    date: "2026-10-01",
    concept: "Venta de servicios",
    type: "Ingreso",
    amount: 45000,
  },
  {
    date: "2026-10-02",
    concept: "Compra de materiales",
    type: "Egreso",
    amount: 12000,
  },
  {
    date: "2026-10-03",
    concept: "Gastos de operación",
    type: "Egreso",
    amount: 8500,
  },
  {
    date: "2026-10-05",
    concept: "Venta de productos",
    type: "Ingreso",
    amount: 28000,
  },
];

export async function downloadWorkbook(
  name = "Plantilla_Nexo.xlsx",
  rows = exampleRows,
) {
  const book = await workbook();
  const sheet = book.addWorksheet("Movimientos");
  sheet.columns = [
    { header: "Fecha", key: "date", width: 18 },
    { header: "Concepto", key: "concept", width: 38 },
    { header: "Tipo", key: "type", width: 18 },
    { header: "Monto", key: "amount", width: 20 },
  ];
  rows.forEach((r) => sheet.addRow(r));
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF244CE0" },
  };
  sheet.getColumn("amount").numFmt = '"$"#,##0.00';
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  saveBlob(
    new Blob([await book.xlsx.writeBuffer()], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    name,
  );
}

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const rawValue = (cell) => {
  const value = cell.value;
  if (value && typeof value === "object" && !(value instanceof Date)) {
    if ("formula" in value || "sharedFormula" in value)
      throw new Error(
        "Usa valores, no fórmulas. En Excel, copia y pega como valores antes de importar.",
      );
    if ("richText" in value) return value.richText.map((t) => t.text).join("");
    if ("text" in value) return value.text;
    throw new Error(
      "El archivo contiene una celda con un valor no compatible.",
    );
  }
  return value;
};

export async function parseWorkbook(file) {
  if (!/\.xlsx$/i.test(file.name))
    throw new Error("Selecciona un archivo de Excel con extensión .xlsx.");
  if (file.size > 5 * 1024 * 1024)
    throw new Error("El archivo debe pesar menos de 5 MB.");
  const book = await workbook();
  try {
    await book.xlsx.load(await file.arrayBuffer());
  } catch {
    throw new Error(
      "No se pudo leer el archivo. Revisa que sea un .xlsx válido y sin contraseña.",
    );
  }
  const sheet = book.worksheets[0];
  if (!sheet || sheet.rowCount < 2)
    throw new Error(
      "La primera hoja debe incluir encabezados y al menos un movimiento.",
    );
  if (sheet.rowCount > 5001)
    throw new Error("La demo admite hasta 5,000 movimientos por archivo.");
  const headers = new Map();
  sheet
    .getRow(1)
    .eachCell((cell, i) => headers.set(normalize(rawValue(cell)), i));
  for (const h of ["fecha", "concepto", "tipo", "monto"])
    if (!headers.has(h))
      throw new Error(
        `Falta la columna «${h}». Puedes descargar nuestra plantilla.`,
      );
  const rows = [];
  sheet.eachRow((row, index) => {
    if (index === 1) return;
    const get = (name) => rawValue(row.getCell(headers.get(name)));
    const dateValue = get("fecha");
    const date =
      dateValue instanceof Date
        ? dateValue.toISOString().slice(0, 10)
        : String(dateValue ?? "").trim();
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(Date.parse(date)) ||
      new Date(date).toISOString().slice(0, 10) !== date
    )
      throw new Error(
        `Fila ${index}: escribe la fecha como AAAA-MM-DD o usa una fecha de Excel.`,
      );
    if (!["2026-08", "2026-09", "2026-10"].includes(date.slice(0, 7)))
      throw new Error(
        `Fila ${index}: la demo trabaja con agosto, septiembre y octubre de 2026.`,
      );
    const type = normalize(get("tipo"));
    const amount = get("monto");
    const concept = String(get("concepto") ?? "").trim();
    if (!["ingreso", "egreso"].includes(type))
      throw new Error(`Fila ${index}: el tipo debe ser Ingreso o Egreso.`);
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0)
      throw new Error(
        `Fila ${index}: el monto debe ser un número mayor a cero, sin símbolos ni texto.`,
      );
    if (!concept || concept.length > 180)
      throw new Error(
        `Fila ${index}: agrega un concepto de hasta 180 caracteres.`,
      );
    rows.push({
      date,
      concept,
      type: type === "ingreso" ? "Ingreso" : "Egreso",
      amount: Math.round(amount * 100) / 100,
    });
  });
  if (!rows.length)
    throw new Error("No encontramos movimientos en el archivo.");
  return rows;
}
