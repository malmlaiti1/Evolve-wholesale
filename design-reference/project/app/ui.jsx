/* Evolve Wholesale — icons + shared UI primitives (Babel/JSX) */

/* ---- Icon set: clean 1.6px line icons, 24px grid ---- */
const Icon = ({ d, paths, size = 18, fill = false, sw = 1.7, style, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"}
       stroke={fill ? "none" : "currentColor"} strokeWidth={sw} strokeLinecap="round"
       strokeLinejoin="round" style={style} {...rest}>
    {d ? <path d={d} /> : paths}
  </svg>
);

const Icons = {
  search:   (p) => <Icon {...p} paths={<><circle cx="11" cy="11" r="7.5"/><path d="M21 21l-4.3-4.3"/></>} />,
  cart:     (p) => <Icon {...p} paths={<><path d="M3 4h2l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2L21 7H6"/><circle cx="9.5" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/></>} />,
  box:      (p) => <Icon {...p} paths={<><path d="M21 8.5 12 3 3 8.5v7L12 21l9-5.5v-7Z"/><path d="m3 8.5 9 5.5 9-5.5"/><path d="M12 14v7"/></>} />,
  grid:     (p) => <Icon {...p} paths={<><rect x="3.5" y="3.5" width="7" height="7" rx="1.4"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.4"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.4"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.4"/></>} />,
  chart:    (p) => <Icon {...p} paths={<><path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16l3.5-4 3 2.5L20 8"/></>} />,
  receipt:  (p) => <Icon {...p} paths={<><path d="M5 3v18l2-1.4L9 21l2-1.4L13 21l2-1.4L17 21l2-1.4V3l-2 1.4L15 3l-2 1.4L11 3 9 4.4 7 3 5 4.4Z"/><path d="M8.5 9h7M8.5 13h5"/></>} />,
  users:    (p) => <Icon {...p} paths={<><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 6.2a3 3 0 0 1 0 5.6"/><path d="M17.5 19a5 5 0 0 0-2.3-4.2"/></>} />,
  tag:      (p) => <Icon {...p} paths={<><path d="M3.5 12.5 11 5h6.5V11.5L10 19a2 2 0 0 1-2.8 0l-3.7-3.7a2 2 0 0 1 0-2.8Z"/><circle cx="14.5" cy="8.5" r="1.2" fill="currentColor" stroke="none"/></>} />,
  settings: (p) => <Icon {...p} paths={<><circle cx="12" cy="12" r="3"/><path d="M12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>} />,
  bell:     (p) => <Icon {...p} paths={<><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/></>} />,
  plus:     (p) => <Icon {...p} paths={<><path d="M12 5v14M5 12h14"/></>} />,
  minus:    (p) => <Icon {...p} paths={<><path d="M5 12h14"/></>} />,
  check:    (p) => <Icon {...p} paths={<path d="M4.5 12.5 9 17l10.5-10.5"/>} />,
  chevR:    (p) => <Icon {...p} paths={<path d="M9 5l7 7-7 7"/>} />,
  chevD:    (p) => <Icon {...p} paths={<path d="M5 9l7 7 7-7"/>} />,
  arrowR:   (p) => <Icon {...p} paths={<><path d="M4 12h15"/><path d="M13 6l6 6-6 6"/></>} />,
  arrowUp:  (p) => <Icon {...p} paths={<><path d="M12 19V5"/><path d="M6 11l6-6 6 6"/></>} />,
  arrowDn:  (p) => <Icon {...p} paths={<><path d="M12 5v14"/><path d="M6 13l6 6 6-6"/></>} />,
  truck:    (p) => <Icon {...p} paths={<><path d="M2.5 6.5h11v9h-11z"/><path d="M13.5 9.5h4l3 3v3h-7z"/><circle cx="6.5" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></>} />,
  shield:   (p) => <Icon {...p} paths={<><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></>} />,
  globe:    (p) => <Icon {...p} paths={<><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.4 2.5 14.6 0 17M12 3.5c-2.5 2.4-2.5 14.6 0 17"/></>} />,
  bolt:     (p) => <Icon {...p} paths={<path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z"/>} />,
  filter:   (p) => <Icon {...p} paths={<path d="M3.5 5h17l-6.5 8v5l-4 2v-7L3.5 5Z"/>} />,
  alert:    (p) => <Icon {...p} paths={<><path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 10v4M12 17v.5"/></>} />,
  download: (p) => <Icon {...p} paths={<><path d="M12 3v11"/><path d="M7 10l5 5 5-5"/><path d="M4 20h16"/></>} />,
  dots:     (p) => <Icon {...p} paths={<><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/></>} />,
  edit:     (p) => <Icon {...p} paths={<><path d="M4 20h4L18.5 9.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4Z"/><path d="M13.5 6.5l3 3"/></>} />,
  phone:    (p) => <Icon {...p} paths={<><rect x="7" y="2.5" width="10" height="19" rx="2.4"/><path d="M11 18.5h2"/></>} />,
  headphones:(p)=> <Icon {...p} paths={<><path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="3" y="13" width="4" height="6" rx="1.4"/><rect x="17" y="13" width="4" height="6" rx="1.4"/></>} />,
  cable:    (p) => <Icon {...p} paths={<><path d="M6 3v4a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v4"/><rect x="3.5" y="2" width="5" height="3" rx="1"/><rect x="15.5" y="19" width="5" height="3" rx="1"/></>} />,
  star:     (p) => <Icon {...p} paths={<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9L12 3.5Z"/>} />,
  logout:   (p) => <Icon {...p} paths={<><path d="M14 4h4a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 18 20h-4"/><path d="M3.5 12h11M11 8l4 4-4 4"/></>} />,
  pkgClock: (p) => <Icon {...p} paths={<><path d="M3 8.5 12 3l9 5.5v7L12 21"/><circle cx="6.5" cy="17.5" r="4"/><path d="M6.5 15.7v1.8l1.2 1"/></>} />,
};

/* category → icon */
const catIcon = (id) => ({
  smartphones: Icons.phone, tablets: Icons.box, cases: Icons.shield,
  charging: Icons.bolt, audio: Icons.headphones, cables: Icons.cable,
}[id] || Icons.box);

/* ---- Building blocks ---- */
const Logo = ({ mark = true, color, sub = true }) => (
  <div className="row" style={{ gap: 11 }}>
    {mark && (
      <div style={{
        width: 32, height: 32, borderRadius: 9, background: color || "var(--accent)",
        display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto",
      }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
          <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" stroke="#F4F8F4" strokeWidth="1.7" strokeLinejoin="round"/>
          <path d="M12 7v10M7.5 9.2 12 12l4.5-2.8" stroke="#F4F8F4" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    )}
    <div className="col" style={{ lineHeight: 1 }}>
      <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-.02em" }}>Evolve <span style={{ color: "var(--accent)" }}>Wholesale</span></span>
      {sub && <span className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)", letterSpacing: ".14em", marginTop: 3 }}>B2B SUPPLY · EST. 2021</span>}
    </div>
  </div>
);

const Btn = ({ variant = "primary", size, icon: I, iconR: IR, children, className = "", ...rest }) => (
  <button className={`btn btn-${variant} ${size ? "btn-" + size : ""} ${className}`} {...rest}>
    {I && <I />}{children}{IR && <IR />}
  </button>
);

const Badge = ({ tone = "neutral", dot, children }) => (
  <span className={`badge badge-${tone}`}>{dot && <span className="dot" />}{children}</span>
);

const stockBadge = (status) => ({
  in:  <Badge tone="ok" dot>In stock</Badge>,
  low: <Badge tone="warn" dot>Low stock</Badge>,
  out: <Badge tone="danger" dot>Out of stock</Badge>,
}[status]);

/* Image placeholder with category glyph */
const ImgPH = ({ label, category, ratio = "1 / 1", radius = "var(--r)", glyph = true, style }) => {
  const C = category ? catIcon(category) : null;
  return (
    <div className="imgph" style={{ aspectRatio: ratio, borderRadius: radius, ...style }}>
      <div className="col" style={{ alignItems: "center", gap: 9 }}>
        {glyph && C && <C size={34} style={{ color: "var(--accent)", opacity: .42 }} />}
        {label && <span className="imgph-label">{label}</span>}
      </div>
    </div>
  );
};

const money = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
const money0 = (n) => "$" + Math.round(n).toLocaleString("en-US");

/* Mini sparkline / bar chart */
const Sparkbars = ({ data, color = "var(--accent)", h = 56 }) => {
  const max = Math.max(...data);
  return (
    <div className="row" style={{ alignItems: "flex-end", gap: 4, height: h }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, height: `${(v / max) * 100}%`, minHeight: 4,
          background: i === data.length - 1 ? color : "var(--accent-mid)",
          borderRadius: "3px 3px 0 0", transition: "height .4s ease",
        }} />
      ))}
    </div>
  );
};

const orderStatusTone = (s) => ({
  "Processing": "warn", "Awaiting payment": "neutral", "Shipped": "accent",
  "Delivered": "ok", "Cancelled": "danger",
}[s] || "neutral");

Object.assign(window, {
  Icon, Icons, catIcon, Logo, Btn, Badge, stockBadge, ImgPH, money, money0, Sparkbars, orderStatusTone,
});
