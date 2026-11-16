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
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
export const compactMoney = (value) =>
  `$${new Intl.NumberFormat("es-MX", { notation: "compact", maximumFractionDigits: 2 }).format(value)}`;
export const percent = (value) => `${value.toFixed(1)}%`;
const incomeFactors = [0.46, 0.6, 0.54, 0.76, 0.84, 1];
const expenseFactors = [0.55, 0.69, 0.67, 0.81, 0.9, 1];
// Distinct seasonal scenarios; October remains the company baseline.
const monthlyProfiles = {
  aurora: {
    income: [0.48, 0.64, 0.59, 0.79, 0.88, 1],
    expense: [0.58, 0.67, 0.7, 0.83, 0.91, 1],
  },
  verde: {
    income: [0.72, 0.65, 0.81, 0.89, 1.04, 1],
    expense: [0.68, 0.73, 0.78, 0.82, 0.94, 1],
  },
  orbita: {
    income: [0.38, 0.56, 0.51, 0.78, 0.83, 1],
    expense: [0.52, 0.63, 0.67, 0.75, 0.86, 1],
  },
  naranja: {
    income: [0.67, 0.81, 0.92, 0.86, 1.08, 1],
    expense: [0.68, 0.78, 0.82, 0.85, 0.98, 1],
  },
  marea: {
    income: [0.61, 0.74, 0.71, 0.89, 0.93, 1],
    expense: [0.65, 0.75, 0.78, 0.86, 0.96, 1],
  },
  cumbre: {
    income: [0.89, 0.78, 0.86, 1.04, 0.96, 1],
    expense: [0.76, 0.82, 0.88, 0.94, 0.98, 1],
  },
};
export function financeFor(companies, transactions, period) {
  const index = Math.max(0, Math.min(5, Number(period.slice(5)) - 5));
  const ids = new Set(companies.map((c) => c.id));
  const extra = transactions.filter(
    (t) => ids.has(t.company) && t.date.startsWith(period),
  );
  // Round each company's baseline first so grouped totals reconcile with detail.
  // Accumulate imported amounts in cents to avoid binary floating-point drift.
  const total = (field, factors, type) =>
    (companies.reduce(
      (sum, c) =>
        sum +
        Math.round(
          c[field] * (monthlyProfiles[c.id]?.[field] ?? factors)[index],
        ) *
          100,
      0,
    ) +
      extra
        .filter((t) => t.type === type)
        .reduce((sum, t) => sum + Math.round(t.amount * 100), 0)) /
    100;
  const income = total("income", incomeFactors, "Ingreso");
  const expense = total("expense", expenseFactors, "Egreso");
  const profit = Math.round((income - expense) * 100) / 100;
  return {
    income,
    expense,
    profit,
    margin: income ? (profit / income) * 100 : 0,
  };
}

export function membersFor(company) {
  const teamNames = {
    aurora: [
      "Diego Hernández",
      "Sofía Ramírez",
      "Mateo López",
      "Ana Martínez",
      "Luis García",
      "Lucía Mendoza",
      "Pablo Castillo",
    ],
    verde: [
      "Andrés Silva",
      "Mariana Ortiz",
      "Daniel Pérez",
      "Julia Navarro",
      "José Romero",
      "Paula Vega",
    ],
    orbita: [
      "Nicolás Soto",
      "Fernanda Ruiz",
      "Gabriel León",
      "Renata Campos",
      "Adrián Díaz",
      "Victoria Molina",
      "Sebastián Lara",
    ],
    naranja: [
      "Rodrigo Fuentes",
      "Daniela Ponce",
      "Bruno Mejía",
      "Elena Salas",
      "Hugo Acosta",
    ],
    marea: [
      "Carlos Estrada",
      "Ximena Serrano",
      "Javier Robles",
      "Natalia Moreno",
      "Iván Rojas",
      "Andrea Solís",
    ],
    cumbre: [
      "Arturo Medina",
      "Clara Valdez",
      "Raúl Peña",
      "Valentina Rivas",
      "Óscar Delgado",
    ],
  };
  const names = [
    company.admin,
    ...(teamNames[company.id] ??
      Array.from({ length: 7 }, (_, i) => `Integrante ${i + 2}`)),
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
