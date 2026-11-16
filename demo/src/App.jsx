import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Wallet,
  FolderOpen,
  ClipboardList,
  Settings,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  Plus,
  Bell,
  Search,
  Upload,
  Download,
  FileSpreadsheet,
  Check,
  CircleHelp,
  Clock3,
  TrendingUp,
  MoreHorizontal,
  CalendarDays,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Activity,
  Target,
  CircleCheck,
  LogIn,
} from "lucide-react";
import {
  roles,
  initialCompanies,
  initialDocuments,
  initialActivity,
  initialTasks,
  periods,
  money,
  percent,
  financeFor,
  membersFor,
} from "./data";
import {
  Button,
  Logo,
  Badge,
  CompanyMark,
  Avatars,
  SectionHead,
  Stat,
  Filters,
  SearchInput,
  Empty,
  Modal,
} from "./components/UI";
const Analytics = lazy(() => import("./components/Analytics"));
import {
  ImportDialog,
  CompanyDialog,
  RoleDialog,
  DocumentDialog,
  ResetDialog,
} from "./components/Dialogs";
const FolderFloat = lazy(() => import("./components/react-bits/FolderFloat"));
import SquishSwitch from "./components/react-bits/SquishSwitch";
import SwipeRow from "./components/react-bits/SwipeRow";
import { downloadWorkbook, saveBlob } from "./lib/spreadsheets";
import "./App.css";

const navigation = [
  { id: "overview", label: "Vista general", icon: LayoutDashboard },
  { id: "companies", label: "Empresas", icon: Building2 },
  { id: "finances", label: "Finanzas", icon: Wallet },
  { id: "documents", label: "Documentos", icon: FolderOpen },
  { id: "activity", label: "Actividades", icon: ClipboardList },
];
const titles = {
  overview: "Resumen ejecutivo",
  companies: "Empresas",
  finances: "Finanzas",
  documents: "Documentos",
  activity: "Actividades",
  team: "Integrantes y roles",
  settings: "Configuración",
};
const folderOptions = ["Todos", "Finanzas", "Presupuestos", "Entregables"];

function App() {
  const [companies, setCompanies] = useState(initialCompanies);
  const [documents, setDocuments] = useState(initialDocuments);
  const [transactions, setTransactions] = useState([]);
  const [events, setEvents] = useState(initialActivity);
  const [tasks, setTasks] = useState(initialTasks);
  const [role, setRole] = useState("superadmin");
  const [company, setCompany] = useState("all");
  const [page, setPage] = useState("overview");
  const [period, setPeriod] = useState("2026-10");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [companyStatus, setCompanyStatus] = useState("Todas");
  const [docSearch, setDocSearch] = useState("");
  const [docCategory, setDocCategory] = useState("Todos");
  const [docStatus, setDocStatus] = useState("Todos");
  const [taskFilter, setTaskFilter] = useState("Pendientes");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [memberRoles, setMemberRoles] = useState({});
  const [settings, setSettings] = useState({ tips: true, compact: false });
  const [courseName, setCourseName] = useState("Gestión Empresarial");
  const [courseDraft, setCourseDraft] = useState("Gestión Empresarial");
  const toastTimer = useRef(null);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const professor = role === "superadmin";
  const canManage = professor || role === "admin";
  const canFinance = role !== "employee";
  const canImport = professor || ["admin", "finance"].includes(role);
  const scoped = useMemo(
    () =>
      company === "all" ? companies : companies.filter((c) => c.id === company),
    [companies, company],
  );
  const roleDefinition = roles.find((r) => r.id === role);
  const roleMember =
    !professor && scoped[0]
      ? membersFor(scoped[0]).find(
          (m) => (memberRoles[m.id] || m.role) === role,
        )
      : null;
  const currentRole = roleMember
    ? {
        ...roleDefinition,
        name: roleMember.name,
        initials: roleMember.initials,
      }
    : roleDefinition;
  const scopedIds = new Set(scoped.map((c) => c.id));
  const scopedDocs = documents.filter((d) => scopedIds.has(d.company));
  const scopedEvents = events.filter((e) => scopedIds.has(e.company));
  const scopedTasks = tasks.filter((t) => scopedIds.has(t.company));
  const pendingDocs = scopedDocs.filter((d) => d.status === "Por revisar");
  const averageProgress = Math.round(
    scoped.reduce((s, c) => s + c.progress, 0) / Math.max(scoped.length, 1),
  );
  const visibleCompanies = scoped.filter(
    (c) =>
      c.name.toLowerCase().includes(companySearch.toLowerCase()) &&
      (companyStatus === "Todas" ||
        (companyStatus === "Al día"
          ? c.status === "Al día"
          : c.status !== "Al día")),
  );
  const visibleDocs = scopedDocs.filter(
    (d) =>
      d.name.toLowerCase().includes(docSearch.toLowerCase()) &&
      (docCategory === "Todos" || d.category === docCategory) &&
      (docStatus === "Todos" || d.status === docStatus),
  );
  const selectedDoc =
    modal?.type === "document"
      ? documents.find((d) => d.id === modal.id)
      : null;
  const selectedCompany =
    modal?.type === "companyDetail"
      ? companies.find((c) => c.id === modal.id)
      : null;
  const go = (next) => {
    setPage(next);
    setSearch("");
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const notify = (message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 5000);
  };
  const addEvent = (companyId, action, icon = "check") =>
    setEvents((prev) => [
      {
        id: crypto.randomUUID(),
        company: companyId,
        person: currentRole.name,
        action,
        time: "Ahora",
        color: "blue",
        icon,
      },
      ...prev,
    ]);

  function importFile({ company: owner, file, rows }) {
    if (
      documents.some(
        (d) =>
          d.company === owner &&
          d.fingerprint === `${file.name}-${file.size}-${file.lastModified}`,
      )
    ) {
      return "Este archivo ya se importó en esa empresa durante la sesión.";
    }
    const id = crypto.randomUUID();
    setDocuments((prev) => [
      {
        id,
        company: owner,
        name: file.name,
        date: "2026-10-10",
        category: "Finanzas",
        status: "Por revisar",
        sample: false,
        rows,
        fingerprint: `${file.name}-${file.size}-${file.lastModified}`,
      },
      ...prev,
    ]);
    setTransactions((prev) => [
      ...prev,
      ...rows.map((r, i) => ({
        ...r,
        company: owner,
        id: `${id}-${i}`,
        document: id,
      })),
    ]);
    addEvent(owner, `importó ${rows.length} movimientos de Excel`, "upload");
    setCompany(owner);
    setPeriod(rows[0].date.slice(0, 7));
    setModal(null);
    go("finances");
    notify(
      `${rows.length} movimientos importados. Los indicadores ya están actualizados.`,
    );
  }
  function createCompany(values) {
    const id = crypto.randomUUID();
    const next = {
      ...values,
      id,
      initials: values.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toLowerCase(),
      color: ["blue", "green", "orange", "teal"][companies.length % 4],
      progress: 0,
      income: 0,
      expense: 0,
      status: "Al día",
    };
    setCompanies((prev) => [...prev, next]);
    setCompany("all");
    setCompanySearch("");
    setCompanyStatus("Todas");
    setTasks((prev) => [
      ...prev,
      {
        id: `${id}-t1`,
        company: id,
        title: "Importar los primeros movimientos",
        detail: "Finanzas · Primeros pasos",
        due: "16 oct",
        done: false,
      },
    ]);
    addEvent(id, "creó un nuevo espacio de empresa", "users");
    setModal(null);
    go("companies");
    notify(`${values.name} ya tiene su espacio de trabajo.`);
  }
  function exportReport() {
    const safe = (value) => `"${String(value).replaceAll('"', '""')}"`;
    const rows = [
      [
        "Empresa",
        "Periodo",
        "Integrantes",
        "Ingresos MXN",
        "Egresos MXN",
        "Resultado MXN",
        "Margen %",
        "Avance %",
      ],
      ...scoped.map((c) => {
        const m = financeFor([c], transactions, period);
        return [
          c.name,
          period,
          c.members,
          m.income,
          m.expense,
          m.profit,
          m.margin.toFixed(2),
          c.progress,
        ];
      }),
    ];
    const csv =
      "\uFEFF" +
      rows
        .map((row) =>
          row
            .map((value) =>
              safe(
                typeof value === "string" && /^[=+@-]/.test(value)
                  ? `'${value}`
                  : value,
              ),
            )
            .join(","),
        )
        .join("\r\n");
    saveBlob(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      `Nexo_reporte_${period}.csv`,
    );
    notify("Reporte descargado. Puedes abrirlo en Excel.");
  }
  function reset() {
    setCompanies(initialCompanies);
    setDocuments(initialDocuments);
    setTransactions([]);
    setEvents(initialActivity);
    setTasks(initialTasks);
    setMemberRoles({});
    setSettings({ tips: true, compact: false });
    setCourseName("Gestión Empresarial");
    setCourseDraft("Gestión Empresarial");
    setCompany("all");
    setRole("superadmin");
    setPeriod("2026-10");
    setCompanySearch("");
    setCompanyStatus("Todas");
    setDocSearch("");
    setDocCategory("Todos");
    setDocStatus("Todos");
    setTaskFilter("Pendientes");
    setModal(null);
    go("overview");
    notify("La demo está lista para empezar de nuevo.");
  }
  function reviewDocument(id) {
    const doc = documents.find((d) => d.id === id);
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "Revisado" } : d)),
    );
    addEvent(doc.company, `revisó ${doc.name}`, "check");
    notify("Documento marcado como revisado.");
    setModal(null);
  }

  const companyTable = (list, short = false) => (
    <div className={`table-scroll ${settings.compact ? "compact-table" : ""}`}>
      <table className="company-table">
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Equipo</th>
            {canFinance && <th className="numeric">Ingresos del mes</th>}
            <th>Avance académico</th>
            <th>Estado</th>
            <th>
              <span className="sr-only">Abrir</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {list.map((c) => (
            <tr key={c.id}>
              <td>
                <button
                  className="company-cell"
                  onClick={() => setModal({ type: "companyDetail", id: c.id })}
                >
                  <CompanyMark company={c} />
                  <span>
                    <strong>{c.name}</strong>
                    <small>{c.sector}</small>
                  </span>
                </button>
              </td>
              <td>
                <Avatars
                  count={c.members}
                  initials={membersFor(c).map((m) => m.initials)}
                  color={c.color}
                />
                <small className="members-count">{c.members} integrantes</small>
              </td>
              {canFinance && (
                <td className="numeric table-money">
                  {money(financeFor([c], transactions, period).income)}
                </td>
              )}
              <td>
                <div className="progress-cell">
                  <span className="progress-track">
                    <i
                      className={c.progress < 70 ? "orange" : ""}
                      style={{ width: `${c.progress}%` }}
                    />
                  </span>
                  <span>{c.progress}%</span>
                </div>
              </td>
              <td>
                <Badge>{c.status}</Badge>
              </td>
              <td>
                <button
                  className="icon-button"
                  aria-label={`Ver ${c.name}`}
                  onClick={() => setModal({ type: "companyDetail", id: c.id })}
                >
                  <ArrowUpRight size={17} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!list.length && <Empty />}
      {short && (
        <div className="table-bottom">
          <span>
            {list.length} empresas · {list.reduce((s, c) => s + c.members, 0)}{" "}
            integrantes
          </span>
          <span>
            <i className="live-dot" />
            Ciclo académico activo
          </span>
        </div>
      )}
    </div>
  );
  const activityFeed = (
    <div className="activity-feed">
      {scopedEvents.slice(0, 4).map((e) => {
        const Icon =
          { upload: Upload, check: Check, file: FileSpreadsheet, users: Users }[
            e.icon
          ] || Activity;
        const c = companies.find((item) => item.id === e.company);
        return (
          <div className="feed-item" key={e.id}>
            <span className={`feed-icon ${e.color}`}>
              <Icon size={16} />
            </span>
            <div>
              <p>
                <strong>{e.person}</strong> {e.action}.
              </p>
              <small>
                {c?.name}
                <i />
                {e.time}
              </small>
            </div>
          </div>
        );
      })}
      {!scopedEvents.length && (
        <p className="muted">Las acciones del equipo aparecerán aquí.</p>
      )}
    </div>
  );

  return (
    <div className={`app-shell ${sidebarCollapsed ? "collapsed" : ""}`}>
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Logo />
          <button
            className="collapse-button"
            aria-label={sidebarCollapsed ? "Expandir menú" : "Contraer menú"}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={17} />
            ) : (
              <PanelLeftClose size={17} />
            )}
          </button>
        </div>
        <button
          className="workspace-switch"
          onClick={() => setModal({ type: "course" })}
        >
          <span className="workspace-icon">
            <GraduationCap size={20} />
          </span>
          <span className="workspace-text">
            <strong>Aula empresarial</strong>
            <small>Ingeniería en Gestión</small>
          </span>
          <ChevronDown size={14} className="nav-label" />
        </button>
        <nav aria-label="Menú principal">
          {navigation
            .filter((n) => canFinance || n.id !== "finances")
            .map((n) => (
              <button
                title={n.label}
                className={`nav-item ${page === n.id ? "active" : ""}`}
                key={n.id}
                onClick={() => go(n.id)}
                aria-current={page === n.id ? "page" : undefined}
              >
                <n.icon size={19} />
                <span className="nav-label">
                  {!professor && n.id === "companies" ? "Mi empresa" : n.label}
                </span>
                {n.id === "companies" && (
                  <span className="nav-count">{scoped.length}</span>
                )}
              </button>
            ))}
        </nav>
        <nav aria-label="Administración">
          <button
            title="Integrantes y roles"
            className={`nav-item ${page === "team" ? "active" : ""}`}
            onClick={() => go("team")}
            aria-current={page === "team" ? "page" : undefined}
          >
            <Users size={19} />
            <span className="nav-label">Integrantes y roles</span>
          </button>
          <button
            title="Configuración"
            className={`nav-item ${page === "settings" ? "active" : ""}`}
            onClick={() => go("settings")}
            aria-current={page === "settings" ? "page" : undefined}
          >
            <Settings size={19} />
            <span className="nav-label">Configuración</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <button
            className="support-button"
            onClick={() => setModal({ type: "guide" })}
          >
            <CircleHelp size={18} />
            <span className="nav-label">Guía de inicio</span>
            <ArrowUpRight size={15} className="nav-label" />
          </button>
          <div className="sidebar-user">
            <span className="profile-avatar">{currentRole.initials}</span>
            <div className="nav-label">
              <strong>{currentRole.name}</strong>
              <small>{currentRole.title}</small>
            </div>
            <button
              className="icon-button"
              title="Cambiar perspectiva"
              aria-label="Cambiar perspectiva"
              onClick={() => setModal({ type: "role" })}
            >
              <MoreHorizontal size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Mi espacio</span>
            <ChevronRight size={14} />
            <strong>
              {page === "overview" && !canFinance ? "Mi espacio" : titles[page]}
            </strong>
          </div>
          <div className="topbar-actions">
            <div className="global-search">
              <Search size={17} />
              <input
                aria-label="Buscar en el espacio"
                placeholder="Buscar en tu espacio…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearch("");
                }}
              />
              <kbd>⌕</kbd>
              {search && (
                <div className="search-results">
                  <small>EMPRESAS Y SECCIONES</small>
                  {[
                    ...navigation
                      .filter((n) => canFinance || n.id !== "finances")
                      .map((n) => ({ id: n.id, name: n.label, section: true })),
                    ...scoped,
                  ]
                    .filter((item) =>
                      item.name.toLowerCase().includes(search.toLowerCase()),
                    )
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSearch("");
                          if (item.section) go(item.id);
                          else setModal({ type: "companyDetail", id: item.id });
                        }}
                      >
                        {item.section ? (
                          <LayoutDashboard size={16} />
                        ) : (
                          <Building2 size={16} />
                        )}
                        {item.name}
                        <ChevronRight size={14} />
                      </button>
                    ))}
                  {![
                    ...navigation
                      .filter((n) => canFinance || n.id !== "finances")
                      .map((n) => ({ name: n.label })),
                    ...scoped,
                  ].some((item) =>
                    item.name.toLowerCase().includes(search.toLowerCase()),
                  ) && <p>Sin resultados para «{search}».</p>}
                </div>
              )}
            </div>
            <span className="topbar-divider" />
            <button
              className="notification-button"
              aria-label={`Notificaciones: ${pendingDocs.length} documentos pendientes`}
              onClick={() => setModal({ type: "notifications" })}
            >
              <Bell size={19} />
              {pendingDocs.length > 0 && <i />}
            </button>
            <button
              className="role-selector"
              onClick={() => setModal({ type: "role" })}
            >
              <span className="demo-label">Demo</span>
              Vista de {currentRole.label.toLowerCase()}
              <ChevronDown size={13} />
            </button>
            <button
              className="topbar-avatar"
              onClick={() => setModal({ type: "role" })}
              aria-label="Elegir rol de demostración"
            >
              {currentRole.initials}
            </button>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <h1>
                {page === "overview" && !canFinance
                  ? "Mi espacio"
                  : titles[page]}
              </h1>
            </div>
            <div className="heading-buttons">
              {["overview", "finances"].includes(page) && canFinance && (
                <Button icon={Download} onClick={exportReport}>
                  Exportar reporte
                </Button>
              )}
              {professor && ["overview", "companies"].includes(page) ? (
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={() => setModal({ type: "createCompany" })}
                >
                  Nueva empresa
                </Button>
              ) : canImport && ["documents", "finances"].includes(page) ? (
                <Button
                  variant="primary"
                  icon={Upload}
                  onClick={() => setModal({ type: "import" })}
                >
                  Importar Excel
                </Button>
              ) : null}
            </div>
          </div>
          <div className="context-bar">
            <div className="context-left">
              <span className="course-label">
                <GraduationCap size={17} />
                {courseName}
                <span className="course-group">Grupo 5A</span>
              </span>
              <span className="context-divider" />
              {professor ? (
                <label className="context-select">
                  <Building2 size={15} />
                  <select
                    aria-label="Filtrar por empresa"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  >
                    <option value="all">Todas las empresas</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={13} />
                </label>
              ) : (
                <span className="company-context">
                  <Building2 size={15} />
                  {scoped[0]?.name}
                </span>
              )}
            </div>
            {canFinance &&
              ["overview", "companies", "finances"].includes(page) && (
                <label className="context-select period-select">
                  <CalendarDays size={15} />
                  <select
                    aria-label="Periodo financiero"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    {periods.map((p) => (
                      <option value={p.value} key={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={13} />
                </label>
              )}
          </div>

          {page === "overview" && (
            <div className="page-content">
              {canFinance ? (
                <Suspense
                  fallback={
                    <div className="analytics-loading">
                      Cargando indicadores…
                    </div>
                  }
                >
                  <Analytics
                    companies={scoped}
                    transactions={transactions}
                    period={period}
                    onCompanySelect={setCompany}
                    showHelp={settings.tips}
                  />
                </Suspense>
              ) : (
                <div className="stats-grid">
                  <Stat
                    title="Integrantes"
                    value={scoped[0]?.members}
                    icon={Users}
                    color="blue"
                  />
                  <Stat
                    title="Actividades completadas"
                    value={scopedTasks.filter((t) => t.done).length}
                    icon={CircleCheck}
                    color="green"
                    foot={`de ${scopedTasks.length} actividades`}
                  />
                  <Stat
                    title="Documentos"
                    value={scopedDocs.length}
                    icon={FileSpreadsheet}
                    color="orange"
                    foot={`${pendingDocs.length} por revisar`}
                  />
                  <Stat
                    title="Avance académico"
                    value={`${averageProgress}%`}
                    icon={TrendingUp}
                    color="purple"
                  />
                </div>
              )}
              <section className="panel">
                <SectionHead
                  title={professor ? "Empresas" : "Mi empresa"}
                  action="Ver detalle"
                  onAction={() => go("companies")}
                />
                {companyTable(scoped)}
              </section>
            </div>
          )}
          {page === "companies" && (
            <div className="page-content">
              <div className="company-summary">
                <div>
                  <span className="summary-icon blue">
                    <Building2 size={21} />
                  </span>
                  <strong>{scoped.length}</strong>
                  <span>{professor ? "empresas" : "empresa"}</span>
                </div>
                <div>
                  <span className="summary-icon green">
                    <Users size={21} />
                  </span>
                  <strong>{scoped.reduce((s, c) => s + c.members, 0)}</strong>
                  <span>integrantes</span>
                </div>
                <div>
                  <span className="summary-icon orange">
                    <Target size={21} />
                  </span>
                  <strong>{averageProgress}%</strong>
                  <span>de avance promedio</span>
                </div>
              </div>
              <section className="panel">
                <div className="list-toolbar">
                  <Filters
                    items={["Todas", "Al día", "Con pendientes"]}
                    value={companyStatus}
                    onChange={setCompanyStatus}
                  />
                  <SearchInput
                    value={companySearch}
                    onChange={setCompanySearch}
                    placeholder="Buscar empresa…"
                  />
                </div>
                {companyTable(visibleCompanies, true)}
              </section>
            </div>
          )}
          {page === "finances" && canFinance && (
            <div className="page-content">
              <Suspense
                fallback={
                  <div className="analytics-loading">Cargando indicadores…</div>
                }
              >
                <Analytics
                  companies={scoped}
                  transactions={transactions}
                  period={period}
                  view="finances"
                  onCompanySelect={setCompany}
                  showHelp={settings.tips}
                />
              </Suspense>
              <details className="panel finance-detail">
                <summary>Resultados por empresa</summary>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Empresa</th>
                        <th className="numeric">Ingresos</th>
                        <th className="numeric">Egresos</th>
                        <th className="numeric">Resultado neto</th>
                        <th className="numeric">Margen neto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scoped.map((c) => {
                        const m = financeFor([c], transactions, period);
                        return (
                          <tr key={c.id}>
                            <td>
                              <span className="company-cell">
                                <CompanyMark company={c} small />
                                <strong>{c.name}</strong>
                              </span>
                            </td>
                            <td className="numeric">{money(m.income)}</td>
                            <td className="numeric">{money(m.expense)}</td>
                            <td
                              className={`numeric ${m.profit >= 0 ? "green-text" : "orange-text"}`}
                            >
                              {money(m.profit)}
                            </td>
                            <td className="numeric">{percent(m.margin)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </details>
              <details className="panel finance-detail">
                <summary>
                  Movimientos importados ·{" "}
                  {
                    transactions.filter(
                      (t) =>
                        scopedIds.has(t.company) && t.date.startsWith(period),
                    ).length
                  }
                </summary>
                {transactions.filter(
                  (t) => scopedIds.has(t.company) && t.date.startsWith(period),
                ).length ? (
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Concepto</th>
                          <th>Empresa</th>
                          <th>Tipo</th>
                          <th className="numeric">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions
                          .filter(
                            (t) =>
                              scopedIds.has(t.company) &&
                              t.date.startsWith(period),
                          )
                          .map((t) => (
                            <tr key={t.id}>
                              <td>{t.date}</td>
                              <td>{t.concept}</td>
                              <td>
                                {
                                  companies.find((c) => c.id === t.company)
                                    ?.name
                                }
                              </td>
                              <td>
                                <Badge
                                  tone={
                                    t.type === "Ingreso" ? "green" : "orange"
                                  }
                                >
                                  {t.type}
                                </Badge>
                              </td>
                              <td className="numeric">{money(t.amount)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Empty
                    title="Sin movimientos importados"
                    text="Importa la plantilla de ejemplo para ver los movimientos de este periodo."
                  />
                )}
              </details>
            </div>
          )}
          {page === "documents" && (
            <div className="page-content">
              <div className="folders-grid">
                {folderOptions.slice(1).map((category, i) => (
                  <div
                    className={`folder-card ${docCategory === category ? "selected" : ""}`}
                    key={category}
                  >
                    <Suspense fallback={<div className="folder-placeholder" />}>
                      <FolderFloat
                        items={["Ver documentos", "Descargar plantilla"]}
                        label={category}
                        sublabel={`${scopedDocs.filter((d) => d.category === category).length} documentos`}
                        trigger="click"
                        physics={false}
                        width={174}
                        height={108}
                        spread={90}
                        lift={14}
                        tilt={3}
                        folderColor={["#8ba5f1", "#63baa5", "#e9ad79"][i]}
                        frontColor={["#5278da", "#2e9c80", "#d9904d"][i]}
                        paperColor="#fff"
                        itemColor="#fff"
                        itemTextColor="#24344a"
                        radius={9}
                        onSelect={(value) =>
                          value === "Ver documentos"
                            ? setDocCategory(category)
                            : downloadWorkbook().catch(() =>
                                notify("No se pudo descargar la plantilla."),
                              )
                        }
                      />
                    </Suspense>
                    <button
                      className="folder-open-button"
                      onClick={() =>
                        setDocCategory(
                          docCategory === category ? "Todos" : category,
                        )
                      }
                    >
                      {docCategory === category
                        ? "Ver todos"
                        : `Abrir ${category.toLowerCase()}`}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <section className="panel">
                <div className="list-toolbar">
                  <Filters
                    items={folderOptions}
                    value={docCategory}
                    onChange={setDocCategory}
                    label="Categoría de documentos"
                  />
                  <SearchInput
                    value={docSearch}
                    onChange={setDocSearch}
                    placeholder="Buscar documento…"
                  />
                </div>
                <div className="documents-subhead">
                  <span>
                    {visibleDocs.length} documentos{" "}
                    {docCategory !== "Todos"
                      ? `en ${docCategory.toLowerCase()}`
                      : "compartidos"}
                  </span>
                  <label>
                    Estado
                    <select
                      aria-label="Estado del documento"
                      value={docStatus}
                      onChange={(e) => setDocStatus(e.target.value)}
                    >
                      <option>Todos</option>
                      <option>Por revisar</option>
                      <option>Revisado</option>
                    </select>
                  </label>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Nombre del archivo</th>
                        <th>Empresa</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>
                          <span className="sr-only">Abrir</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleDocs.map((d) => (
                        <tr key={d.id}>
                          <td>
                            <button
                              className="document-cell"
                              onClick={() =>
                                setModal({ type: "document", id: d.id })
                              }
                            >
                              <span className="file-icon">
                                <FileSpreadsheet size={21} />
                              </span>
                              <span>
                                <strong>{d.name}</strong>
                                <small>
                                  {d.sample
                                    ? "Archivo de ejemplo"
                                    : `${d.rows.length} movimientos importados`}{" "}
                                  · {d.category}
                                </small>
                              </span>
                            </button>
                          </td>
                          <td>
                            {companies.find((c) => c.id === d.company)?.name}
                          </td>
                          <td>{d.date}</td>
                          <td>
                            <Badge>{d.status}</Badge>
                          </td>
                          <td>
                            <button
                              className="icon-button"
                              aria-label={`Abrir ${d.name}`}
                              onClick={() =>
                                setModal({ type: "document", id: d.id })
                              }
                            >
                              <ArrowUpRight size={17} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!visibleDocs.length && (
                    <Empty
                      title="No hay documentos en esta vista"
                      text="Prueba otro filtro o importa un nuevo archivo de Excel."
                    />
                  )}
                </div>
              </section>
            </div>
          )}
          {page === "activity" && (
            <div className="page-content">
              <div className="activity-layout">
                <section className="panel tasks-panel">
                  <SectionHead
                    title={
                      professor
                        ? "Actividades de los equipos"
                        : "Actividades de mi equipo"
                    }
                  />
                  <div className="task-filters">
                    <Filters
                      items={["Pendientes", "Completadas", "Todas"]}
                      value={taskFilter}
                      onChange={setTaskFilter}
                    />
                  </div>
                  <div className="task-list">
                    {scopedTasks
                      .filter(
                        (t) =>
                          taskFilter === "Todas" ||
                          (taskFilter === "Completadas" ? t.done : !t.done),
                      )
                      .map((t) => (
                        <SwipeRow
                          key={`${t.id}-${t.done}-${taskFilter}`}
                          rowColor="#fff"
                          textColor="#263249"
                          actionColor={t.done ? "#bd7a35" : "#24876d"}
                          drawerColor="#edf3f9"
                          height={88}
                          radius={8}
                          actionWidth={92}
                          fullSwipe={false}
                          label={t.title}
                          actions={[
                            {
                              id: "complete",
                              label: t.done ? "Reabrir" : "Completar",
                              icon: <Check size={19} />,
                              onSelect: () => {
                                setTasks((prev) =>
                                  prev.map((item) =>
                                    item.id === t.id
                                      ? { ...item, done: !item.done }
                                      : item,
                                  ),
                                );
                                addEvent(
                                  t.company,
                                  `${t.done ? "reabrió" : "completó"} «${t.title}»`,
                                );
                                notify(
                                  t.done
                                    ? "Actividad reabierta."
                                    : "¡Un paso más! Actividad completada.",
                                );
                              },
                            },
                          ]}
                        >
                          <span
                            className={`task-check ${t.done ? "checked" : ""}`}
                          >
                            {t.done && <Check size={15} />}
                          </span>
                          <div className="task-copy">
                            <strong>{t.title}</strong>
                            <small>
                              {companies.find((c) => c.id === t.company)?.name}{" "}
                              · {t.detail}
                            </small>
                          </div>
                          <span className="task-due">
                            <Clock3 size={13} />
                            {t.due}
                          </span>
                        </SwipeRow>
                      ))}
                    {!scopedTasks.some(
                      (t) =>
                        taskFilter === "Todas" ||
                        (taskFilter === "Completadas" ? t.done : !t.done),
                    ) && (
                      <Empty
                        title={
                          taskFilter === "Completadas"
                            ? "Aún no hay actividades completadas"
                            : "¡Todo al día!"
                        }
                        text="Usa Acciones para cambiar el estado de una actividad."
                      />
                    )}
                  </div>
                </section>
                <section className="panel">
                  <SectionHead title="Actividad reciente" />
                  {activityFeed}
                  <div className="activity-note">
                    <Activity size={15} />
                    Historial ilustrativo y acciones de esta sesión.
                  </div>
                </section>
              </div>
            </div>
          )}
          {page === "team" && (
            <div className="page-content">
              <div className="role-legend">
                {roles
                  .filter((r) => r.id !== "superadmin")
                  .map((r, i) => (
                    <div key={r.id}>
                      <span className={`role-dot role-${i}`} />
                      <strong>{r.label}</strong>
                      <small>
                        {
                          [
                            "Organiza la empresa",
                            "Coordina operaciones",
                            "Analiza los números",
                            "Colabora en las tareas",
                          ][i]
                        }
                      </small>
                    </div>
                  ))}
              </div>
              {scoped.map((c) => (
                <section className="panel" key={c.id}>
                  <div className="team-header">
                    <CompanyMark company={c} />
                    <div>
                      <h2>{c.name}</h2>
                      <p>{c.members} integrantes · Equipo de práctica</p>
                    </div>
                    <Badge tone="blue">{c.members} de 8 lugares</Badge>
                  </div>
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Integrante</th>
                          <th>Rol en la empresa</th>
                          <th>Responsabilidad</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {membersFor(c).map((m, i) => {
                          const memberRole = memberRoles[m.id] || m.role;
                          return (
                            <tr key={m.id}>
                              <td>
                                <div className="member-cell">
                                  <span
                                    className={`member-avatar member-${i % 4}`}
                                  >
                                    {m.initials}
                                  </span>
                                  <div>
                                    <strong>{m.name}</strong>
                                    <small>Alumno · Grupo 5A</small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                {canManage && i > 0 ? (
                                  <select
                                    className="role-select"
                                    aria-label={`Rol de ${m.name} en ${c.name}`}
                                    value={memberRole}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      const list = membersFor(c);
                                      const priorRole =
                                        memberRoles[m.id] || m.role;
                                      if (
                                        ["manager", "finance"].includes(
                                          priorRole,
                                        ) &&
                                        !list.some(
                                          (other) =>
                                            other.id !== m.id &&
                                            (memberRoles[other.id] ||
                                              other.role) === priorRole,
                                        )
                                      ) {
                                        notify(
                                          `Asigna otro ${roles.find((r) => r.id === priorRole).label.toLowerCase()} antes de cambiar este rol.`,
                                        );
                                        return;
                                      }
                                      setMemberRoles((prev) => ({
                                        ...prev,
                                        [m.id]: value,
                                      }));
                                      addEvent(
                                        c.id,
                                        `actualizó el rol de ${m.name}`,
                                        "users",
                                      );
                                      notify(
                                        "Rol actualizado para esta sesión.",
                                      );
                                    }}
                                  >
                                    {roles
                                      .filter(
                                        (r) =>
                                          !["superadmin", "admin"].includes(
                                            r.id,
                                          ),
                                      )
                                      .map((r) => (
                                        <option key={r.id} value={r.id}>
                                          {r.label}
                                        </option>
                                      ))}
                                  </select>
                                ) : (
                                  <span className="role-label">
                                    {
                                      roles.find((r) => r.id === memberRole)
                                        ?.label
                                    }
                                  </span>
                                )}
                              </td>
                              <td className="muted">
                                {
                                  {
                                    admin: "Equipo y administración",
                                    manager: "Operaciones y seguimiento",
                                    finance: "Registros e indicadores",
                                    employee: "Actividades y colaboración",
                                  }[memberRole]
                                }
                              </td>
                              <td>
                                <Badge tone="green">Activo</Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              ))}
            </div>
          )}
          {page === "settings" && (
            <div className="page-content settings-layout">
              <section className="panel">
                <SectionHead
                  title="Tu experiencia en Nexo"
                  subtitle="Preferencias de esta sesión de demostración."
                />
                <div className="setting-row">
                  <div>
                    <strong>Ayuda en gráficos</strong>
                    <p>Muestra los botones de ayuda sobre los indicadores.</p>
                  </div>
                  <SquishSwitch
                    checked={settings.tips}
                    onChange={(value) =>
                      setSettings((prev) => ({ ...prev, tips: value }))
                    }
                    ariaLabel="Mostrar ayuda en gráficos"
                    width={48}
                    height={27}
                    trackColor="#dce2ec"
                    trackOnColor="#2a9c80"
                    thumbColor="#fff"
                    thumbOnColor="#fff"
                  />
                </div>
                <div className="setting-row">
                  <div>
                    <strong>Tablas compactas</strong>
                    <p>
                      Reduce la altura de las filas en el listado de empresas.
                    </p>
                  </div>
                  <SquishSwitch
                    checked={settings.compact}
                    onChange={(value) =>
                      setSettings((prev) => ({ ...prev, compact: value }))
                    }
                    ariaLabel="Usar tablas compactas"
                    width={48}
                    height={27}
                    trackColor="#dce2ec"
                    trackOnColor="#2a9c80"
                    thumbColor="#fff"
                    thumbOnColor="#fff"
                  />
                </div>
                <div className="setting-row">
                  <div>
                    <strong>Perspectiva de usuario</strong>
                    <p>
                      Actualmente exploras como{" "}
                      {currentRole.label.toLowerCase()}.
                    </p>
                  </div>
                  <Button onClick={() => setModal({ type: "role" })}>
                    Cambiar rol
                  </Button>
                </div>
              </section>
              {professor && (
                <section className="panel">
                  <SectionHead
                    title="Datos del aula"
                    subtitle="Personaliza el nombre visible del curso."
                  />
                  <form
                    className="settings-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (courseDraft.trim()) {
                        setCourseName(courseDraft.trim());
                        notify("Nombre del curso actualizado.");
                      }
                    }}
                  >
                    <label className="field">
                      Nombre del curso
                      <input
                        value={courseDraft}
                        onChange={(e) => setCourseDraft(e.target.value)}
                        maxLength={40}
                        required
                      />
                    </label>
                    <div className="form-two">
                      <label className="field">
                        Grupo
                        <input value="5A" readOnly />
                      </label>
                      <label className="field">
                        Ciclo académico
                        <input value="Agosto – Diciembre 2026" readOnly />
                      </label>
                    </div>
                    <button
                      className="button primary"
                      type="submit"
                      disabled={!courseDraft.trim()}
                    >
                      Guardar cambios
                    </button>
                  </form>
                </section>
              )}
              <section className="panel">
                <SectionHead title="Acerca de esta propuesta" />
                <div className="about-demo">
                  <Logo />
                  <p>
                    ERP académico para Ingeniería en Gestión Empresarial. Un
                    espacio para que los alumnos experimenten cómo se organiza y
                    administra una empresa.
                  </p>
                  <div className="about-tags">
                    <span>Datos de ejemplo</span>
                    <span>Escritorio y tablet</span>
                  </div>
                  <p>
                    Las importaciones, empresas nuevas y ajustes viven en la
                    memoria del navegador. Al recargar, la demo vuelve a su
                    estado inicial.
                  </p>
                  <Button
                    variant="danger"
                    onClick={() => setModal({ type: "reset" })}
                  >
                    Reiniciar demostración
                  </Button>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>

      {modal?.type === "import" && (
        <ImportDialog
          companies={professor ? companies : scoped}
          defaultCompany={company}
          onClose={() => setModal(null)}
          onImport={importFile}
          notify={notify}
        />
      )}
      {modal?.type === "createCompany" && (
        <CompanyDialog
          onClose={() => setModal(null)}
          onCreate={createCompany}
        />
      )}
      {modal?.type === "role" && (
        <RoleDialog
          role={role}
          company={company}
          companies={companies}
          onClose={() => setModal(null)}
          onApply={(nextRole, nextCompany) => {
            setRole(nextRole);
            setCompany(nextCompany);
            setModal(null);
            go("overview");
            notify(
              `Ahora exploras la vista de ${roles.find((r) => r.id === nextRole).label.toLowerCase()}.`,
            );
          }}
        />
      )}
      {selectedDoc && (
        <DocumentDialog
          doc={selectedDoc}
          company={companies.find((c) => c.id === selectedDoc.company)}
          canReview={canManage}
          onClose={() => setModal(null)}
          onReview={() => reviewDocument(selectedDoc.id)}
          notify={notify}
        />
      )}
      {modal?.type === "reset" && (
        <ResetDialog onClose={() => setModal(null)} onReset={reset} />
      )}
      {selectedCompany && (
        <Modal
          title={selectedCompany.name}
          subtitle={selectedCompany.sector}
          onClose={() => setModal(null)}
          wide
        >
          <div className="modal-body">
            <div className="company-detail-top">
              <CompanyMark company={selectedCompany} />
              <div>
                <strong>
                  Un equipo de {selectedCompany.members} integrantes
                </strong>
                <p>Administrador: {selectedCompany.admin}</p>
              </div>
              <Badge>{selectedCompany.status}</Badge>
            </div>
            <div className="preview-totals">
              <div>
                <small>Avance académico</small>
                <strong>{selectedCompany.progress}%</strong>
              </div>
              <div>
                <small>Documentos compartidos</small>
                <strong>
                  {
                    documents.filter((d) => d.company === selectedCompany.id)
                      .length
                  }
                </strong>
              </div>
              {canFinance && (
                <div>
                  <small>
                    Ingresos · {periods.find((p) => p.value === period).label}
                  </small>
                  <strong>
                    {money(
                      financeFor([selectedCompany], transactions, period)
                        .income,
                    )}
                  </strong>
                </div>
              )}
            </div>
            <div className="company-detail-note">
              <GraduationCap size={22} />
              <div>
                <strong>Unidad 2 · Gestión financiera</strong>
                <p>
                  El equipo practica el registro de movimientos, la lectura de
                  indicadores y la toma de decisiones empresariales.
                </p>
              </div>
            </div>
            <div className="detail-people">
              {membersFor(selectedCompany).map((m) => (
                <span key={m.id}>
                  <span className="member-avatar">{m.initials}</span>
                  {m.name}
                </span>
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <Button
              onClick={() => {
                setCompany(selectedCompany.id);
                setModal(null);
                go("team");
              }}
            >
              Ver integrantes
            </Button>
            <Button
              variant="primary"
              icon={LogIn}
              onClick={() => {
                setCompany(selectedCompany.id);
                setModal(null);
                go("overview");
              }}
            >
              Entrar a la empresa
            </Button>
          </div>
        </Modal>
      )}
      {modal?.type === "notifications" && (
        <Modal
          title="Pendientes de revisión"
          subtitle="Documentos que esperan una mirada de seguimiento."
          onClose={() => setModal(null)}
        >
          <div className="modal-body notification-list">
            {pendingDocs.map((d) => (
              <button
                key={d.id}
                onClick={() => setModal({ type: "document", id: d.id })}
              >
                <span className="file-icon">
                  <FileSpreadsheet size={21} />
                </span>
                <div>
                  <strong>{d.name}</strong>
                  <small>
                    {companies.find((c) => c.id === d.company)?.name}
                  </small>
                </div>
                <ChevronRight size={16} />
              </button>
            ))}
            {!pendingDocs.length && (
              <Empty
                title="Todo está al día"
                text="No hay documentos pendientes de revisión."
              />
            )}
          </div>
        </Modal>
      )}
      {modal?.type === "guide" && (
        <Modal
          title="Bienvenido a tu aula empresarial"
          subtitle="Un pequeño recorrido para empezar con confianza."
          onClose={() => setModal(null)}
          wide
        >
          <div className="modal-body guide-grid">
            {[
              {
                icon: Building2,
                title: "1. Conoce a las empresas",
                text: "Cada equipo de 6 a 8 alumnos tiene su propia empresa, integrantes y resultados.",
                route: "companies",
              },
              {
                icon: Users,
                title: "2. Un rol para cada persona",
                text: "Administrador, gerente, financiero y empleados colaboran; el profesor supervisa.",
                route: "team",
              },
              {
                icon: FileSpreadsheet,
                title: "3. Dale vida a tus datos",
                text: "Descarga la plantilla, importa un Excel y revisa los movimientos antes de agregarlos.",
                route: "documents",
              },
              {
                icon: canFinance ? TrendingUp : ClipboardList,
                title: canFinance
                  ? "4. Aprende de los resultados"
                  : "4. Participa en tu equipo",
                text: canFinance
                  ? "Compara ingresos, egresos y márgenes. Todo empieza con una buena pregunta."
                  : "Completa tus actividades y consulta el trabajo de tus compañeros.",
                route: canFinance ? "finances" : "activity",
              },
            ].map((item) => (
              <button
                key={item.route}
                onClick={() => {
                  setModal(null);
                  go(item.route);
                }}
              >
                <item.icon size={24} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <ArrowUpRight size={17} />
              </button>
            ))}
          </div>
          <div className="modal-footer">
            <p className="local-note">
              Esta es una propuesta navegable con datos de ejemplo.
            </p>
            <Button variant="primary" onClick={() => setModal(null)}>
              Empezar a explorar
            </Button>
          </div>
        </Modal>
      )}
      {modal?.type === "course" && (
        <Modal
          title="Tu aula empresarial"
          subtitle="Un semestre para aprender haciendo."
          onClose={() => setModal(null)}
        >
          <div className="modal-body course-detail">
            <span className="form-hero">
              <GraduationCap size={30} />
            </span>
            <h3>{courseName}</h3>
            <p>Ingeniería en Gestión Empresarial · Grupo 5A</p>
            <div className="preview-totals">
              <div>
                <small>Empresas</small>
                <strong>{companies.length}</strong>
              </div>
              <div>
                <small>Alumnos</small>
                <strong>{companies.reduce((s, c) => s + c.members, 0)}</strong>
              </div>
              <div>
                <small>Ciclo</small>
                <strong>2026-2</strong>
              </div>
            </div>
            <p>Profesor: Alejandro Morales</p>
            <p className="local-note">
              Agosto – Diciembre 2026 · Aula de demostración
            </p>
          </div>
          <div className="modal-footer">
            <Button variant="primary" onClick={() => setModal(null)}>
              Volver al aula
            </Button>
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <CircleCheck size={20} />
          <span>{toast}</span>
          <button
            className="icon-button"
            aria-label="Cerrar aviso"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
export default App;
