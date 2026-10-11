export const roles = [
  {
    id: "superadmin",
    label: "Profesor",
    title: "Superadministrador",
    name: "Alejandro Morales",
    initials: "AM",
    description:
      "Supervisa todas las empresas y acompaña el aprendizaje del grupo.",
  },
  {
    id: "admin",
    label: "Administrador",
    title: "Administrador de empresa",
    name: "Valeria Torres",
    initials: "VT",
    description:
      "Organiza su empresa, administra integrantes y consulta sus resultados.",
  },
  {
    id: "manager",
    label: "Gerente",
    title: "Gerente de operaciones",
    name: "Diego Hernández",
    initials: "DH",
    description:
      "Da seguimiento a las actividades y al desempeño de su empresa.",
  },
  {
    id: "finance",
    label: "Financiero",
    title: "Responsable de finanzas",
    name: "Sofía Ramírez",
    initials: "SR",
    description: "Importa movimientos y analiza los indicadores de su empresa.",
  },
  {
    id: "employee",
    label: "Empleado",
    title: "Colaborador",
    name: "Mateo López",
    initials: "ML",
    description: "Consulta sus actividades y los documentos de su equipo.",
  },
];

export const initialCompanies = [
  {
    id: "aurora",
    name: "Aurora Creative",
    initials: "ac",
    sector: "Diseño y comunicación",
    color: "blue",
    members: 8,
    progress: 92,
    income: 286400,
    expense: 183200,
    status: "Al día",
    admin: "Valeria Torres",
  },
  {
    id: "verde",
    name: "Verde Raíz",
    initials: "vr",
    sector: "Productos sustentables",
    color: "green",
    members: 7,
    progress: 85,
    income: 224800,
    expense: 156300,
    status: "Al día",
    admin: "Camila Reyes",
  },
  {
    id: "orbita",
    name: "Órbita Tech",
    initials: "ot",
    sector: "Tecnología y servicios",
    color: "purple",
    members: 8,
    progress: 76,
    income: 312600,
    expense: 226800,
    status: "Por revisar",
    admin: "Emiliano Cruz",
  },
  {
    id: "naranja",
    name: "Naranja Studio",
    initials: "ns",
    sector: "Marketing y publicidad",
    color: "orange",
    members: 6,
    progress: 68,
    income: 178500,
    expense: 129700,
    status: "Por revisar",
    admin: "Regina Flores",
  },
  {
    id: "marea",
    name: "Marea Comercial",
    initials: "mc",
    sector: "Comercio y distribución",
    color: "teal",
    members: 7,
    progress: 88,
    income: 246200,
    expense: 170600,
    status: "Al día",
    admin: "Santiago Luna",
  },
  {
    id: "cumbre",
    name: "Cumbre Alimentos",
    initials: "ca",
    sector: "Alimentos y bebidas",
    color: "sand",
    members: 6,
    progress: 54,
    income: 165300,
    expense: 140500,
    status: "Requiere atención",
    admin: "Isabella Ríos",
  },
];

export const initialDocuments = initialCompanies.flatMap((company, i) => [
  {
    id: `${company.id}-1`,
    company: company.id,
    name: `Movimientos_${company.initials}_octubre.xlsx`,
    category: "Finanzas",
    date: "2026-10-09",
    status: i === 2 || i === 3 ? "Por revisar" : "Revisado",
    sample: true,
  },
  {
    id: `${company.id}-2`,
    company: company.id,
    name: `Presupuesto_${company.initials}.xlsx`,
    category: "Presupuestos",
    date: "2026-10-08",
    status: "Revisado",
    sample: true,
  },
  {
    id: `${company.id}-3`,
    company: company.id,
    name: `Ventas_${company.initials}.xlsx`,
    category: "Finanzas",
    date: "2026-10-07",
    status: "Revisado",
    sample: true,
  },
  {
    id: `${company.id}-4`,
    company: company.id,
    name: `Entrega_${company.initials}_unidad_2.xlsx`,
    category: "Entregables",
    date: "2026-10-06",
    status: i === 5 ? "Por revisar" : "Revisado",
    sample: true,
  },
]);

export const initialActivity = [
  {
    id: 1,
    company: "aurora",
    person: "Valeria Torres",
    action: "subió los movimientos de octubre",
    time: "Hace 12 min",
    color: "blue",
    icon: "upload",
  },
  {
    id: 2,
    company: "verde",
    person: "Camila Reyes",
    action: "completó el presupuesto mensual",
    time: "Hace 38 min",
    color: "green",
    icon: "check",
  },
  {
    id: 3,
    company: "orbita",
    person: "Emiliano Cruz",
    action: "envió su reporte para revisión",
    time: "Hace 1 h",
    color: "orange",
    icon: "file",
  },
  {
    id: 4,
    company: "marea",
    person: "Santiago Luna",
    action: "actualizó las actividades del equipo",
    time: "Hace 2 h",
    color: "teal",
    icon: "users",
  },
];

export const initialTasks = initialCompanies.flatMap((c) => [
  {
    id: `${c.id}-t1`,
    company: c.id,
    title: "Registrar los movimientos del mes",
    detail: "Finanzas · Unidad 2",
    due: "12 oct",
    done: c.progress > 80,
  },
  {
    id: `${c.id}-t2`,
    company: c.id,
    title: "Analizar el punto de equilibrio",
    detail: "Planeación · Unidad 2",
    due: "15 oct",
    done: false,
  },
  {
    id: `${c.id}-t3`,
    company: c.id,
    title: "Entregar el reporte de resultados",
    detail: "Entregable · Unidad 2",
    due: "16 oct",
    done: false,
  },
]);

export const periods = [
  { value: "2026-10", label: "Octubre 2026" },
  { value: "2026-09", label: "Septiembre 2026" },
  { value: "2026-08", label: "Agosto 2026" },
];
export const money = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(value);
export const compactMoney = (value) =>
  `$${new Intl.NumberFormat("es-MX", { notation: "compact", maximumFractionDigits: 2 }).format(value)}`;
export const percent = (value) => `${value.toFixed(1)}%`;
const incomeFactors = [0.46, 0.6, 0.54, 0.76, 0.84, 1];
const expenseFactors = [0.55, 0.69, 0.67, 0.81, 0.9, 1];
export function financeFor(companies, transactions, period) {
  const index = Math.max(0, Math.min(5, Number(period.slice(5)) - 5));
  const ids = new Set(companies.map((c) => c.id));
  const extra = transactions.filter(
    (t) => ids.has(t.company) && t.date.startsWith(period),
  );
  const income =
    Math.round(
      companies.reduce((sum, c) => sum + c.income * incomeFactors[index], 0),
    ) +
    extra
      .filter((t) => t.type === "Ingreso")
      .reduce((sum, t) => sum + t.amount, 0);
  const expense =
    Math.round(
      companies.reduce((sum, c) => sum + c.expense * expenseFactors[index], 0),
    ) +
    extra
      .filter((t) => t.type === "Egreso")
      .reduce((sum, t) => sum + t.amount, 0);
  return {
    income,
    expense,
    profit: income - expense,
    margin: income ? ((income - expense) / income) * 100 : 0,
  };
}

export function membersFor(company) {
  const names = [
    company.admin,
    "Diego Hernández",
    "Sofía Ramírez",
    "Mateo López",
    "Ana Martínez",
    "Luis García",
    "Lucía Mendoza",
    "Pablo Castillo",
  ];
  return names.slice(0, company.members).map((name, i) => ({
    id: `${company.id}-m${i}`,
    name,
    role: ["admin", "manager", "finance", "employee"][Math.min(i, 3)],
    initials: name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join(""),
  }));
}
