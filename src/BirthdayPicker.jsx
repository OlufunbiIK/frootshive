import { useState, useEffect, useRef } from "react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const pad = (n) => String(n).padStart(2, "0");

/* ---------- one custom dropdown ---------- */
function Dropdown({ label, placeholder, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef(null);
  const list = useRef(null);
  const selIndex = options.findIndex((o) => o.value === value);
  const selected = options[selIndex];

  const openList = () => {
    setActive(selIndex > -1 ? selIndex : 0);
    setOpen(true);
  };

  /* close when tapping outside */
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (!root.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  /* keep the highlighted option centred in the list */
  useEffect(() => {
    if (!open) return;
    const l = list.current;
    const el = l?.children[active];
    if (el)
      l.scrollTop = el.offsetTop - l.clientHeight / 2 + el.clientHeight / 2;
  }, [open, active]);

  const choose = (i) => {
    const o = options[i];
    if (!o || o.disabled) return;
    onChange(o.value);
    setOpen(false);
  };

  const move = (dir) => {
    let i = active;
    for (let n = 0; n < options.length; n++) {
      i = (i + dir + options.length) % options.length;
      if (!options[i].disabled) break;
    }
    setActive(i);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") return setOpen(false);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      return open ? move(e.key === "ArrowDown" ? 1 : -1) : openList();
    }
    if (e.key === "Enter" && open) {
      e.preventDefault();
      choose(active);
    }
  };

  return (
    <div className={"dd" + (open ? " open" : "")} ref={root}>
      <span className="dd-lab">{label}</span>
      <button
        type="button"
        className={"dd-btn" + (selected ? "" : " ph")}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <svg
          viewBox="0 0 12 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 1.5L6 6.5L11 1.5" />
        </svg>
      </button>
      {open && (
        <ul className="dd-list" role="listbox" ref={list}>
          {options.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              aria-disabled={o.disabled || undefined}
              className={i === active ? "act" : ""}
              onClick={() => choose(i)}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- birthday picker: Month / Day / Year ----------
   value in/out is "YYYY-MM-DD" (or "" until all three are chosen) */
export default function BirthdayPicker({ value, onChange }) {
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;
  const cd = now.getDate();

  const [y0, m0, d0] = value ? value.split("-").map(Number) : [0, 0, 0];
  const [p, setP] = useState({ y: y0, m: m0, d: d0 });

  const update = (patch) => {
    const n = { ...p, ...patch };
    const maxDay = n.y && n.m ? new Date(n.y, n.m, 0).getDate() : 31;
    if (n.d > maxDay) n.d = maxDay;
    /* no birthdays in the future */
    if (n.y === cy && n.m > cm) n.m = 0;
    if (n.y === cy && n.m === cm && n.d > cd) n.d = 0;
    setP(n);
    onChange(n.y && n.m && n.d ? `${n.y}-${pad(n.m)}-${pad(n.d)}` : "");
  };

  const maxDay = p.y && p.m ? new Date(p.y, p.m, 0).getDate() : 31;

  const months = MONTHS.map((label, i) => ({
    value: i + 1,
    label,
    disabled: p.y === cy && i + 1 > cm,
  }));
  const days = Array.from({ length: maxDay }, (_, i) => ({
    value: i + 1,
    label: String(i + 1),
    disabled: p.y === cy && p.m === cm && i + 1 > cd,
  }));
  const years = Array.from({ length: 101 }, (_, i) => ({
    value: cy - i,
    label: String(cy - i),
  }));

  return (
    <div className="dp">
      <Dropdown
        label="Month"
        placeholder="Month"
        value={p.m}
        options={months}
        onChange={(m) => update({ m })}
      />
      <Dropdown
        label="Day"
        placeholder="Day"
        value={p.d}
        options={days}
        onChange={(d) => update({ d })}
      />
      <Dropdown
        label="Year"
        placeholder="Year"
        value={p.y}
        options={years}
        onChange={(y) => update({ y })}
      />
    </div>
  );
}
