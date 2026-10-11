import { useEffect, useRef } from "react";
import {
  X,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Search,
} from "lucide-react";
import JellyRadio from "./react-bits/JellyRadio";

export function Logo({ small = false }) {
  return (
    <div className={`brand ${small ? "small" : ""}`}>
      <span className="brand-icon">
        <i />
        <i />
        <i />
      </span>
      {!small && (
        <div>
          <strong>
            nexo<span>.</span>
          </strong>
          <small>ERP ACADÉMICO</small>
        </div>
      )}
    </div>
  );
}
export function Button({
  children,
  icon: Icon,
  variant = "",
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      className={`button ${variant} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
export function Badge({ children, tone }) {
  const color =
    tone ||
    ({
      "Al día": "green",
      Revisado: "green",
      "Por revisar": "orange",
      "Requiere atención": "red",
    }[children] ??
      "blue");
  return (
    <span className={`badge ${color}`}>
      <i />
      {children}
    </span>
  );
}
export function CompanyMark({ company, small = false }) {
  return (
    <span className={`company-mark ${company.color} ${small ? "small" : ""}`}>
      {company.initials}
    </span>
  );
}
export function Avatars({ count, color = "blue" }) {
  return (
    <div className="avatar-stack">
      {["VT", "DH", "SR"].slice(0, Math.min(count, 3)).map((s, i) => (
        <span key={s} className={`avatar avatar-${i} ${color}`}>
          {s}
        </span>
      ))}
      <span className="avatar extra">+{Math.max(0, count - 3)}</span>
    </div>
  );
}
export function SectionHead({ title, subtitle, action, onAction }) {
  return (
    <div className="section-head">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && (
        <button className="text-button" onClick={onAction}>
          {action}
          <ChevronRight size={15} />
        </button>
      )}
    </div>
  );
}
export function Stat({ title, value, icon: Icon, color, foot, change, down }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <span className={`stat-icon ${color}`}>
          <Icon size={19} />
        </span>
      </div>
      <strong className="stat-value">{value}</strong>
      <div className="stat-foot">
        {change && (
          <span className={down ? "orange-text" : "green-text"}>
            {down ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}
            {change}
          </span>
        )}
        <span>{foot}</span>
      </div>
    </article>
  );
}
export function Filters({
  items,
  value,
  onChange,
  label = "Filtrar resultados",
}) {
  return (
    <JellyRadio
      items={items}
      value={value}
      onChange={onChange}
      ariaLabel={label}
      chipColor="#f4f6f9"
      activeColor="#eaf0ff"
      textColor="#647087"
      activeTextColor="#3055d7"
      size="md"
      radius={7}
      swell={0.025}
      barge={0}
      shrink={0}
      gap={4}
    />
  );
}
export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar…",
  label,
}) {
  return (
    <label className="search-input">
      <Search size={16} />
      <input
        aria-label={label || placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
export function Empty({
  title = "Sin resultados",
  text = "Prueba con otro filtro o término de búsqueda.",
}) {
  return (
    <div className="empty">
      <Search size={27} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
export function Modal({ title, subtitle, onClose, children, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "wide" : ""}`}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) {
          const r = ref.current.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
      aria-labelledby="modal-title"
    >
      <div className="modal-head">
        <div>
          <h2 id="modal-title">{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button
          className="icon-button"
          aria-label="Cerrar ventana"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
