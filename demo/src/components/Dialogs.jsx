import { useRef, useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  Check,
  AlertCircle,
  Building2,
  ArrowRight,
  ShieldCheck,
  Users,
  CircleHelp,
} from "lucide-react";
import { Button, Modal, CompanyMark } from "./UI";
import { roles, money } from "../data";
import { parseWorkbook, downloadWorkbook } from "../lib/spreadsheets";
import HoldButton from "./react-bits/HoldButton";

export function ImportDialog({
  companies,
  defaultCompany,
  onClose,
  onImport,
  notify,
}) {
  const [company, setCompany] = useState(
    defaultCompany === "all" ? companies[0]?.id : defaultCompany,
  );
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const input = useRef(null);
  async function readFile(next) {
    if (!next || busy) return;
    setFile(next);
    setRows(null);
    setError("");
    setBusy(true);
    try {
      setRows(await parseWorkbook(next));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const income =
    rows
      ?.filter((r) => r.type === "Ingreso")
      .reduce((s, r) => s + r.amount, 0) ?? 0;
  const expense =
    rows
      ?.filter((r) => r.type === "Egreso")
      .reduce((s, r) => s + r.amount, 0) ?? 0;
  return (
    <Modal
      title="Importar movimientos"
      subtitle="Convierte un Excel en información para tu empresa."
      onClose={onClose}
      wide
    >
      <div className="modal-body">
        <div className="steps-strip">
          <span className="active">
            1 <b>Selecciona tu archivo</b>
          </span>
          <i />
          <span className={rows ? "active" : ""}>
            2 <b>Revisa e importa</b>
          </span>
        </div>
        <label className="field">
          Empresa
          <select value={company} onChange={(e) => setCompany(e.target.value)}>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <input
          type="file"
          accept=".xlsx"
          ref={input}
          hidden
          onChange={(e) => readFile(e.target.files?.[0])}
        />
        <button
          type="button"
          className={`drop-zone ${drag ? "drag" : ""}`}
          disabled={busy}
          onClick={() => input.current.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            readFile(e.dataTransfer.files?.[0]);
          }}
        >
          <span className="upload-icon">
            {file ? <FileSpreadsheet size={27} /> : <Upload size={27} />}
          </span>
          <strong>
            {busy
              ? "Leyendo tu archivo…"
              : file?.name || "Arrastra tu Excel aquí"}
          </strong>
          <span>
            {file
              ? "Haz clic para elegir otro archivo"
              : "o haz clic para seleccionarlo"}
          </span>
          <small>.xlsx · Hasta 5 MB y 5,000 movimientos</small>
        </button>
        <div className="template-row">
          <div>
            <strong>Empieza con la estructura correcta</strong>
            <p>Fecha, Concepto, Tipo y Monto · Ago–Oct 2026</p>
          </div>
          <Button
            icon={Download}
            variant="subtle"
            onClick={() =>
              downloadWorkbook().catch(() =>
                notify("No se pudo descargar la plantilla. Intenta de nuevo."),
              )
            }
          >
            Plantilla
          </Button>
        </div>
        {error && (
          <div className="alert error" role="alert">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
        {rows && (
          <div className="import-preview">
            <div className="success-line">
              <Check size={18} />
              {rows.length} movimientos listos para importar
            </div>
            <div className="preview-totals">
              <div>
                <small>Ingresos del archivo</small>
                <strong>{money(income)}</strong>
              </div>
              <div>
                <small>Egresos del archivo</small>
                <strong>{money(expense)}</strong>
              </div>
              <div>
                <small>Resultado neto</small>
                <strong>{money(income - expense)}</strong>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Concepto</th>
                    <th>Tipo</th>
                    <th className="numeric">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 4).map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td>
                      <td>{r.concept}</td>
                      <td>{r.type}</td>
                      <td className="numeric">{money(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length > 4 && (
              <small className="muted">
                Vista previa de los primeros 4 movimientos.
              </small>
            )}
          </div>
        )}
        <p className="local-note">
          <ShieldCheck size={15} />
          El archivo se procesa en tu navegador. Los cambios se conservan
          durante esta sesión.
        </p>
      </div>
      <div className="modal-footer">
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="primary"
          icon={ArrowRight}
          disabled={!rows || busy || !company}
          onClick={() => {
            const importError = onImport({ company, file, rows });
            if (importError) setError(importError);
          }}
        >
          Importar {rows ? `${rows.length} movimientos` : "movimientos"}
        </Button>
      </div>
    </Modal>
  );
}

export function CompanyDialog({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [sector, setSector] = useState("Servicios");
  const [members, setMembers] = useState(6);
  const [admin, setAdmin] = useState("");
  return (
    <Modal
      title="Una nueva empresa, un nuevo equipo"
      subtitle="Crea un espacio de práctica para tus alumnos."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim() && admin.trim())
            onCreate({
              name: name.trim(),
              sector,
              members: Number(members),
              admin: admin.trim(),
            });
        }}
      >
        <div className="modal-body">
          <span className="form-hero">
            <Building2 size={28} />
          </span>
          <label className="field">
            Nombre de la empresa
            <input
              required
              maxLength={45}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Horizonte Consultores"
            />
          </label>
          <div className="form-two">
            <label className="field">
              Sector
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
              >
                {[
                  "Servicios",
                  "Comercio",
                  "Tecnología",
                  "Alimentos y bebidas",
                  "Manufactura",
                  "Productos sustentables",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Integrantes
              <select
                value={members}
                onChange={(e) => setMembers(e.target.value)}
              >
                {[6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} alumnos
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="field">
            Nombre del administrador
            <input
              required
              maxLength={60}
              value={admin}
              onChange={(e) => setAdmin(e.target.value)}
              placeholder="Nombre del alumno responsable"
            />
          </label>
          <div className="alert">
            <Users size={19} />
            <span>
              Se crearán {members} integrantes de ejemplo: un administrador, un
              gerente, un financiero y {members - 3} empleados.
            </span>
          </div>
        </div>
        <div className="modal-footer">
          <Button onClick={onClose}>Cancelar</Button>
          <button
            className="button primary"
            type="submit"
            disabled={!name.trim() || !admin.trim()}
          >
            Crear empresa
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function RoleDialog({ role, company, companies, onClose, onApply }) {
  const [selected, setSelected] = useState(role);
  const [selectedCompany, setSelectedCompany] = useState(
    company === "all" ? companies[0].id : company,
  );
  return (
    <Modal
      title="Explora cada perspectiva"
      subtitle="Cambia de rol para recorrer la propuesta del ERP."
      onClose={onClose}
    >
      <div className="modal-body">
        <div className="role-options">
          {roles.map((r) => (
            <label
              key={r.id}
              className={`role-option ${selected === r.id ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="role"
                value={r.id}
                checked={selected === r.id}
                onChange={() => setSelected(r.id)}
              />
              <span
                className={`role-icon ${r.id === "superadmin" ? "blue" : "green"}`}
              >
                {r.id === "superadmin" ? (
                  <ShieldCheck size={20} />
                ) : (
                  <Users size={20} />
                )}
              </span>
              <span>
                <strong>
                  {r.label}
                  {r.id === "superadmin" && <small>Superadmin</small>}
                </strong>
                <p>{r.description}</p>
              </span>
            </label>
          ))}
        </div>
        {selected !== "superadmin" && (
          <label className="field">
            Empresa del equipo
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <p className="local-note">
          Los roles son una simulación visual. Esta demo no incluye inicio de
          sesión ni permisos de servidor.
        </p>
      </div>
      <div className="modal-footer">
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="primary"
          icon={ArrowRight}
          onClick={() =>
            onApply(
              selected,
              selected === "superadmin" ? "all" : selectedCompany,
            )
          }
        >
          Explorar como{" "}
          {roles.find((r) => r.id === selected).label.toLowerCase()}
        </Button>
      </div>
    </Modal>
  );
}

export function DocumentDialog({
  doc,
  company,
  onClose,
  onReview,
  canReview,
  notify,
}) {
  const rows = doc.rows;
  return (
    <Modal
      title="Detalle del documento"
      subtitle={doc.name}
      onClose={onClose}
      wide
    >
      <div className="modal-body">
        <div className="document-owner">
          <CompanyMark company={company} />
          <div>
            <strong>{company.name}</strong>
            <p>
              {doc.category} · {doc.date} · {doc.status}
            </p>
          </div>
        </div>
        {doc.sample ? (
          <div className="alert">
            <CircleHelp size={20} />
            <span>
              Documento de ejemplo para la presentación. La descarga genera una
              hoja de movimientos ilustrativa.
            </span>
          </div>
        ) : (
          <>
            <div className="preview-totals">
              <div>
                <small>Movimientos</small>
                <strong>{rows.length}</strong>
              </div>
              <div>
                <small>Ingresos del archivo</small>
                <strong>
                  {money(
                    rows
                      .filter((r) => r.type === "Ingreso")
                      .reduce((s, r) => s + r.amount, 0),
                  )}
                </strong>
              </div>
              <div>
                <small>Egresos del archivo</small>
                <strong>
                  {money(
                    rows
                      .filter((r) => r.type === "Egreso")
                      .reduce((s, r) => s + r.amount, 0),
                  )}
                </strong>
              </div>
            </div>
            <div className="table-scroll preview-table">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Concepto</th>
                    <th>Tipo</th>
                    <th className="numeric">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i}>
                      <td>{r.date}</td>
                      <td>{r.concept}</td>
                      <td>{r.type}</td>
                      <td className="numeric">{money(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <p className="local-note">
          Revisar indica que el profesor o administrador consultó la entrega. No
          es una calificación.
        </p>
      </div>
      <div className="modal-footer">
        <Button
          icon={Download}
          onClick={() =>
            downloadWorkbook(doc.name, rows).catch(() =>
              notify("No se pudo descargar el documento."),
            )
          }
        >
          Descargar {doc.sample ? "ejemplo" : "archivo"}
        </Button>
        {canReview && doc.status !== "Revisado" && (
          <Button variant="primary" icon={Check} onClick={onReview}>
            Marcar como revisado
          </Button>
        )}
      </div>
    </Modal>
  );
}

export function ResetDialog({ onClose, onReset }) {
  return (
    <Modal
      title="Reiniciar la demostración"
      subtitle="Vuelve al estado inicial para una nueva presentación."
      onClose={onClose}
    >
      <div className="modal-body">
        <div className="alert warning">
          <AlertCircle size={20} />
          <span>
            Se quitarán las empresas creadas, los movimientos importados y los
            cambios de esta sesión.
          </span>
        </div>
        <p>Mantén presionado el botón durante 1.5 segundos para confirmar.</p>
      </div>
      <div className="modal-footer">
        <Button onClick={onClose}>Cancelar</Button>
        <HoldButton
          backgroundColor="#fff0e8"
          fillColor="#c85c26"
          textColor="#a74318"
          fillTextColor="#fff"
          radius={8}
          holdTime={1500}
          doneLabel="Reiniciada"
          onHold={onReset}
          onTap={() => {}}
          glow={false}
        >
          Mantén para reiniciar
        </HoldButton>
      </div>
    </Modal>
  );
}
