/* Evolve Wholesale — Admin: Inventory, Orders, Customers */

const statusOf = (stock) => stock === 0 ? "out" : stock <= 100 ? "low" : "in";

/* ---------------- INVENTORY ---------------- */
const InventoryScreen = ({ nav, toast }) => {
  const D = window.DATA;
  const [rows, setRows] = React.useState(() => D.products.map((p) => ({ ...p })));
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState("all");
  const [statusF, setStatusF] = React.useState("all");
  const [edit, setEdit] = React.useState(null); // product being edited
  const [draft, setDraft] = React.useState(0);

  const openEdit = (p) => { setEdit(p); setDraft(p.stock); };
  const save = () => {
    setRows(rows.map((r) => r.id === edit.id ? { ...r, stock: draft, status: statusOf(draft) } : r));
    toast(`Updated stock for ${edit.sku} → ${draft} units`);
    setEdit(null);
  };

  const filtered = rows.filter((p) =>
    (cat === "all" || p.category === cat) &&
    (statusF === "all" || p.status === statusF) &&
    (q === "" || (p.name + p.sku + p.brand).toLowerCase().includes(q.toLowerCase()))
  );

  const totalSkus = rows.length;
  const low = rows.filter((p) => p.status === "low").length;
  const out = rows.filter((p) => p.status === "out").length;
  const invValue = rows.reduce((s, p) => s + p.stock * p.price, 0);

  const Tile = ({ label, value, tone }) => (
    <div className="card" style={{ padding: "16px 18px" }}>
      <span style={{ fontSize: 12.5, color: "var(--ink-2-solid)", fontWeight: 600 }}>{label}</span>
      <div className="mono" style={{ fontSize: 24, fontWeight: 700, marginTop: 8, color: tone || "var(--ink)" }}>{value}</div>
    </div>
  );

  return (
    <AdminShell nav={nav} active="admin-inventory" title="Inventory" subtitle={`${totalSkus} SKUs tracked`}
      actions={<><Btn variant="secondary" size="sm" icon={Icons.download}>Export CSV</Btn><Btn variant="primary" size="sm" icon={Icons.plus}>Add product</Btn></>}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        <Tile label="Total SKUs" value={totalSkus} />
        <Tile label="Low stock" value={low} tone="var(--warn)" />
        <Tile label="Out of stock" value={out} tone="var(--danger)" />
        <Tile label="Inventory value" value={money0(invValue)} tone="var(--accent)" />
      </div>

      {/* Controls */}
      <div className="card" style={{ marginTop: 16, overflow: "hidden" }}>
        <div className="row" style={{ gap: 12, padding: "14px 16px", borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>
          <div className="search-wrap" style={{ width: 260 }}><Icons.search /><input className="field" placeholder="Search name, SKU, brand…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <select className="field" value={cat} onChange={(e) => setCat(e.target.value)} style={{ width: "auto" }}>
            <option value="all">All categories</option>
            {D.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="row" style={{ gap: 4, marginLeft: "auto", background: "var(--cream-2)", padding: 3, borderRadius: 8 }}>
            {[["all", "All"], ["in", "In stock"], ["low", "Low"], ["out", "Out"]].map(([v, l]) => (
              <button key={v} onClick={() => setStatusF(v)} style={{ border: 0, background: statusF === v ? "var(--paper)" : "transparent", color: statusF === v ? "var(--ink)" : "var(--ink-2-solid)", fontSize: 12.5, fontWeight: 600, padding: "6px 12px", borderRadius: 6, boxShadow: statusF === v ? "var(--sh-sm)" : "none" }}>{l}</button>
            ))}
          </div>
        </div>
        <table className="tbl">
          <thead><tr><th>Product</th><th>Category</th><th className="th-num">On hand</th><th className="th-num">Unit cost</th><th className="th-num">Stock value</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} style={{ background: p.status === "out" ? "var(--danger-soft)" : p.status === "low" ? "var(--warn-soft)" : undefined }}>
                <td>
                  <div className="row" style={{ gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", flex: "0 0 auto", border: "1px solid var(--line)" }}><ImgPH label="" category={p.category} ratio="1/1" radius="0" /></div>
                    <div className="col"><span style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</span><span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{p.sku} · {p.brand}</span></div>
                  </div>
                </td>
                <td className="muted" style={{ fontSize: 13 }}>{D.categories.find((c) => c.id === p.category)?.name}</td>
                <td className="td-num mono" style={{ fontWeight: 700, fontSize: 14 }}>{p.stock.toLocaleString()}</td>
                <td className="td-num mono" style={{ color: "var(--ink-2-solid)" }}>{money(p.price)}</td>
                <td className="td-num mono">{money0(p.stock * p.price)}</td>
                <td>{stockBadge(p.status)}</td>
                <td style={{ textAlign: "right" }}><button onClick={() => openEdit(p)} className="btn btn-secondary btn-sm" style={{ padding: "6px 10px" }}><Icons.edit size={14} />Adjust</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit drawer */}
      {edit && <Drawer title="Adjust stock" onClose={() => setEdit(null)}>
        <div className="row" style={{ gap: 14, marginBottom: 22 }}>
          <div style={{ width: 64, height: 64, borderRadius: 11, overflow: "hidden", border: "1px solid var(--line)", flex: "0 0 auto" }}><ImgPH label="" category={edit.category} ratio="1/1" radius="0" /></div>
          <div className="col"><span style={{ fontWeight: 700, fontSize: 15 }}>{edit.name}</span><span className="mono" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>{edit.sku}</span><div style={{ marginTop: 8 }}>{stockBadge(statusOf(draft))}</div></div>
        </div>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Units on hand</label>
        <div className="row" style={{ gap: 12, marginTop: 10 }}>
          <div className="row" style={{ border: "1px solid var(--line-2)", borderRadius: "var(--r-sm)", overflow: "hidden", background: "var(--paper)" }}>
            <button onClick={() => setDraft(Math.max(0, draft - 10))} style={{ border: 0, background: "transparent", width: 42, height: 46, color: "var(--ink-2-solid)" }}><Icons.minus size={16} /></button>
            <input className="mono" value={draft} onChange={(e) => setDraft(Math.max(0, parseInt(e.target.value) || 0))} style={{ width: 80, border: 0, textAlign: "center", fontSize: 18, fontWeight: 700, background: "transparent", outline: "none" }} />
            <button onClick={() => setDraft(draft + 10)} style={{ border: 0, background: "transparent", width: 42, height: 46, color: "var(--ink-2-solid)" }}><Icons.plus size={16} /></button>
          </div>
          <div className="row" style={{ gap: 6 }}>{[50, 100, 500].map((n) => <button key={n} onClick={() => setDraft(draft + n)} className="btn btn-ghost btn-sm">+{n}</button>)}</div>
        </div>
        <div style={{ background: "var(--cream)", borderRadius: 10, padding: "14px 16px", marginTop: 20 }}>
          <div className="row" style={{ justifyContent: "space-between", fontSize: 13 }}><span className="muted">Reorder threshold</span><span className="mono" style={{ fontWeight: 600 }}>100 units</span></div>
          <div className="row" style={{ justifyContent: "space-between", fontSize: 13, marginTop: 8 }}><span className="muted">New stock value</span><span className="mono" style={{ fontWeight: 700, color: "var(--accent)" }}>{money0(draft * edit.price)}</span></div>
        </div>
        <div className="row" style={{ gap: 10, marginTop: 24 }}>
          <Btn variant="secondary" className="btn-block" onClick={() => setEdit(null)}>Cancel</Btn>
          <Btn variant="primary" className="btn-block" icon={Icons.check} onClick={save}>Save changes</Btn>
        </div>
      </Drawer>}
    </AdminShell>
  );
};

/* ---------------- ORDERS ---------------- */
const OrdersScreen = ({ nav }) => {
  const D = window.DATA;
  const [tab, setTab] = React.useState("all");
  const [sel, setSel] = React.useState(null);
  const tabs = [["all", "All"], ["Processing", "Processing"], ["Awaiting payment", "Awaiting payment"], ["Shipped", "Shipped"], ["Delivered", "Delivered"]];
  const filtered = D.orders.filter((o) => tab === "all" || o.status === tab);

  return (
    <AdminShell nav={nav} active="admin-orders" title="Orders" subtitle={`${D.orders.length} orders this period`}
      actions={<Btn variant="primary" size="sm" icon={Icons.download}>Export</Btn>}>
      <div className="row" style={{ gap: 4, marginBottom: 16, background: "var(--cream-2)", padding: 4, borderRadius: 9, width: "fit-content" }}>
        {tabs.map(([v, l]) => {
          const n = v === "all" ? D.orders.length : D.orders.filter((o) => o.status === v).length;
          return <button key={v} onClick={() => setTab(v)} className="row" style={{ gap: 7, border: 0, background: tab === v ? "var(--paper)" : "transparent", color: tab === v ? "var(--ink)" : "var(--ink-2-solid)", fontSize: 13, fontWeight: 600, padding: "8px 14px", borderRadius: 7, boxShadow: tab === v ? "var(--sh-sm)" : "none" }}>{l}<span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{n}</span></button>;
        })}
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="tbl">
          <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th className="th-num">Units</th><th className="th-num">Total</th><th>Channel</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} style={{ cursor: "pointer" }} onClick={() => setSel(o)}>
                <td className="mono" style={{ fontWeight: 700, fontSize: 12.5 }}>{o.id}</td>
                <td><div className="col"><span style={{ fontWeight: 600, fontSize: 13 }}>{o.customer}</span><span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{o.contact}</span></div></td>
                <td className="muted mono" style={{ fontSize: 12.5 }}>{o.date}</td>
                <td className="td-num mono">{o.units.toLocaleString()}</td>
                <td className="td-num mono" style={{ fontWeight: 700 }}>{money0(o.total)}</td>
                <td><Badge tone="neutral">{o.channel}</Badge></td>
                <td><Badge tone={orderStatusTone(o.status)} dot>{o.status}</Badge></td>
                <td style={{ textAlign: "right", color: "var(--ink-3)" }}><Icons.chevR size={16} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sel && <Drawer title={sel.id} width={420} onClose={() => setSel(null)}>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 18 }}>
          <Badge tone={orderStatusTone(sel.status)} dot>{sel.status}</Badge>
          <span className="mono muted" style={{ fontSize: 12.5 }}>{sel.date}</span>
        </div>
        <div className="card" style={{ padding: 16, background: "var(--cream)" }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-3)" }}>Customer</span>
          <div style={{ fontWeight: 700, fontSize: 15, marginTop: 6 }}>{sel.customer}</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{sel.contact}</div>
        </div>
        <div className="col" style={{ gap: 0, marginTop: 18 }}>
          {[["Line items", sel.items], ["Total units", sel.units.toLocaleString()], ["Channel", sel.channel]].map(([l, v]) => (
            <div key={l} className="row" style={{ justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid var(--line)", fontSize: 13.5 }}><span className="muted">{l}</span><span className="mono" style={{ fontWeight: 600 }}>{v}</span></div>
          ))}
          <div className="row" style={{ justifyContent: "space-between", padding: "14px 0 0" }}><span style={{ fontWeight: 700, fontSize: 15 }}>Order total</span><span className="mono" style={{ fontWeight: 800, fontSize: 20, color: "var(--accent)" }}>{money0(sel.total)}</span></div>
        </div>
        {/* fulfillment timeline */}
        <div style={{ marginTop: 24 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-3)" }}>Fulfillment</span>
          <div className="col" style={{ marginTop: 14, gap: 0 }}>
            {[["Order placed", true], ["Payment confirmed", sel.status !== "Awaiting payment"], ["Picked & packed", ["Shipped", "Delivered"].includes(sel.status)], ["Shipped", ["Shipped", "Delivered"].includes(sel.status)], ["Delivered", sel.status === "Delivered"]].map(([l, done], i, arr) => (
              <div key={l} className="row" style={{ gap: 12, alignItems: "flex-start" }}>
                <div className="col" style={{ alignItems: "center", alignSelf: "stretch" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: done ? "var(--accent)" : "var(--cream-2)", border: done ? "0" : "1.5px solid var(--line-2)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>{done && <Icons.check size={11} sw={3} style={{ color: "#fff" }} />}</div>
                  {i < arr.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 16, background: done ? "var(--accent-mid)" : "var(--line)" }} />}
                </div>
                <span style={{ fontSize: 13.5, fontWeight: done ? 600 : 500, color: done ? "var(--ink)" : "var(--ink-3)", paddingBottom: 14 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="row" style={{ gap: 10, marginTop: 12 }}>
          <Btn variant="secondary" className="btn-block" icon={Icons.receipt}>Invoice</Btn>
          <Btn variant="primary" className="btn-block" icon={Icons.truck}>Mark shipped</Btn>
        </div>
      </Drawer>}
    </AdminShell>
  );
};

/* ---------------- CUSTOMERS (lightweight) ---------------- */
const CustomersScreen = ({ nav }) => {
  const D = window.DATA;
  const tierTone = { Platinum: "accent", Gold: "warn", Silver: "neutral" };
  return (
    <AdminShell nav={nav} active="admin-customers" title="Customers" subtitle={`${D.customers.length} wholesale accounts`} actions={<Btn variant="primary" size="sm" icon={Icons.plus}>Add account</Btn>}>
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="tbl">
          <thead><tr><th>Account</th><th>Tier</th><th className="th-num">Since</th><th className="th-num">Orders</th><th className="th-num">Lifetime spend</th><th>Status</th></tr></thead>
          <tbody>
            {D.customers.map((c) => (
              <tr key={c.id} style={{ cursor: "pointer" }}>
                <td><div className="row" style={{ gap: 12 }}><div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flex: "0 0 auto" }}>{c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div><span style={{ fontWeight: 600, fontSize: 13.5 }}>{c.name}</span></div></td>
                <td><Badge tone={tierTone[c.tier]}>{c.tier}</Badge></td>
                <td className="td-num mono muted">{c.since}</td>
                <td className="td-num mono">{c.orders}</td>
                <td className="td-num mono" style={{ fontWeight: 700 }}>{money0(c.spend)}</td>
                <td><Badge tone={c.status === "Active" ? "ok" : "warn"} dot>{c.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
};

/* ---- Generic right-side drawer ---- */
const Drawer = ({ title, children, onClose, width = 400 }) => (
  <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(33,30,24,.32)", zIndex: 100, display: "flex", justifyContent: "flex-end", animation: "screenIn .2s ease" }}>
    <div onClick={(e) => e.stopPropagation()} style={{ width, background: "var(--paper)", height: "100%", boxShadow: "var(--sh-lg)", display: "flex", flexDirection: "column", animation: "drawerIn .26s cubic-bezier(.2,.8,.2,1)" }}>
      <div className="row" style={{ justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--line)" }}>
        <h3 style={{ fontSize: 17 }}>{title}</h3>
        <button onClick={onClose} style={{ border: 0, background: "var(--cream-2)", width: 30, height: 30, borderRadius: 8, color: "var(--ink-2-solid)", fontSize: 15 }}>✕</button>
      </div>
      <div className="scroll-y" style={{ padding: 24, flex: 1 }}>{children}</div>
    </div>
  </div>
);

Object.assign(window, { InventoryScreen, OrdersScreen, CustomersScreen, Drawer, statusOf });
