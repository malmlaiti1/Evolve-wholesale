/* Evolve Wholesale — Admin shell + Dashboard */

const AdminShell = ({ nav, active, title, subtitle, children, actions }) => {
  const D = window.DATA;
  const navItems = [
    { id: "admin", label: "Dashboard", icon: Icons.grid },
    { id: "admin-inventory", label: "Inventory", icon: Icons.box, badge: D.kpis.lowStock },
    { id: "admin-orders", label: "Orders", icon: Icons.receipt },
    { id: "admin-customers", label: "Customers", icon: Icons.users },
    { id: "admin-products", label: "Products", icon: Icons.tag },
  ];
  return (
    <div style={{ height: "100%", display: "flex", background: "var(--cream)" }}>
      {/* Sidebar */}
      <aside style={{ width: 238, flex: "0 0 238px", background: "var(--paper)", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", padding: "0" }}>
        <div style={{ padding: "20px 20px 18px", borderBottom: "1px solid var(--line)" }}><Logo sub={false} /></div>
        <nav style={{ padding: "16px 12px", flex: 1 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-3)", padding: "0 12px 10px" }}>Operations</div>
          <div className="col" style={{ gap: 2 }}>
            {navItems.map((n) => {
              const on = active === n.id;
              return (
                <button key={n.id} onClick={() => nav.go(n.id)} className="row" style={{
                  gap: 11, padding: "10px 12px", borderRadius: 9, border: 0, width: "100%",
                  background: on ? "var(--accent-soft)" : "transparent", color: on ? "var(--accent)" : "var(--ink-2-solid)",
                  fontSize: 14, fontWeight: on ? 700 : 500, transition: "all .14s",
                }}
                  onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = "var(--cream-2)"; }}
                  onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "transparent"; }}>
                  <n.icon size={18} />{n.label}
                  {n.badge ? <span className="mono" style={{ marginLeft: "auto", background: "var(--warn-soft)", color: "var(--warn)", fontSize: 10.5, fontWeight: 700, padding: "1px 7px", borderRadius: 100 }}>{n.badge}</span> : null}
                </button>
              );
            })}
          </div>
        </nav>
        <div style={{ padding: 12, borderTop: "1px solid var(--line)" }}>
          <button onClick={() => nav.go("admin-settings")} className="row" style={{ gap: 11, padding: "10px 12px", borderRadius: 9, border: 0, width: "100%", background: "transparent", color: "var(--ink-2-solid)", fontSize: 14, fontWeight: 500 }}><Icons.settings size={18} />Settings</button>
          <div className="row" style={{ gap: 10, padding: "12px", marginTop: 4, background: "var(--cream)", borderRadius: 11 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flex: "0 0 auto" }}>AM</div>
            <div className="col" style={{ flex: 1, minWidth: 0 }}><span style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Amir Malik</span><span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>Operations</span></div>
          </div>
        </div>
      </aside>
      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ height: 66, flex: "0 0 66px", borderBottom: "1px solid var(--line)", background: "rgba(255,255,255,.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", padding: "0 28px", gap: 20 }}>
          <div className="col">
            <h1 style={{ fontSize: 19, letterSpacing: "-.02em" }}>{title}</h1>
            {subtitle && <span style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>{subtitle}</span>}
          </div>
          <div className="row" style={{ gap: 12, marginLeft: "auto" }}>
            <div className="search-wrap" style={{ width: 240 }}><Icons.search /><input className="field" placeholder="Search orders, SKUs, customers…" /></div>
            <button style={{ position: "relative", border: "1px solid var(--line-2)", background: "var(--paper)", width: 40, height: 40, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-2-solid)" }}>
              <Icons.bell size={18} /><span style={{ position: "absolute", top: 9, right: 10, width: 7, height: 7, borderRadius: "50%", background: "var(--danger)", border: "1.5px solid var(--paper)" }} /></button>
            {actions}
          </div>
        </header>
        <div className="scroll-y screen-in" style={{ flex: 1, padding: "26px 28px 40px" }}>{children}</div>
      </div>
    </div>
  );
};

/* KPI card */
const Kpi = ({ label, value, delta, icon: I, suffix }) => {
  const up = delta >= 0;
  return (
    <div className="card" style={{ padding: "18px 20px" }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: "var(--ink-2-solid)", fontWeight: 600 }}>{label}</span>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--cream-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}><I size={17} /></div>
      </div>
      <div className="mono" style={{ fontSize: 27, fontWeight: 700, marginTop: 14, letterSpacing: "-.02em" }}>{value}</div>
      {delta != null && (
        <div className="row" style={{ gap: 5, marginTop: 7 }}>
          <span className="row" style={{ gap: 2, fontSize: 12, fontWeight: 700, color: up ? "var(--ok)" : "var(--danger)" }}>{up ? <Icons.arrowUp size={13} /> : <Icons.arrowDn size={13} />}{Math.abs(delta)}%</span>
          <span style={{ fontSize: 12, color: "var(--ink-3)" }}>vs last month</span>
        </div>
      )}
    </div>
  );
};

const DashboardScreen = ({ nav }) => {
  const D = window.DATA;
  const lowStock = D.products.filter((p) => p.status !== "in").sort((a, b) => a.stock - b.stock);
  const recent = D.orders.slice(0, 5);
  const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const topProducts = [
    { ...D.products[0], sold: 1240 }, { ...D.products[12], sold: 980 }, { ...D.products[16], sold: 870 }, { ...D.products[8], sold: 640 },
  ];

  return (
    <AdminShell nav={nav} active="admin" title="Dashboard" subtitle="Monday, June 9, 2026" actions={<Btn variant="primary" size="sm" icon={Icons.download}>Export report</Btn>}>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        <Kpi label="Revenue (MTD)" value={money0(D.kpis.revenue)} delta={D.kpis.revenueDelta} icon={Icons.chart} />
        <Kpi label="Orders (MTD)" value={D.kpis.orders.toLocaleString()} delta={D.kpis.ordersDelta} icon={Icons.receipt} />
        <Kpi label="Units shipped" value={D.kpis.units.toLocaleString()} delta={D.kpis.unitsDelta} icon={Icons.box} />
        <Kpi label="Avg. order value" value={money0(D.kpis.avgOrder)} delta={D.kpis.avgOrderDelta} icon={Icons.tag} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginTop: 16 }}>
        {/* Revenue chart */}
        <div className="card" style={{ padding: 22 }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
            <div className="col"><span style={{ fontSize: 15, fontWeight: 700 }}>Revenue trend</span><span style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 3 }}>Last 12 months</span></div>
            <div className="row" style={{ gap: 6 }}>
              <Badge tone="accent">+8.4% YoY</Badge>
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <div className="row" style={{ alignItems: "flex-end", gap: 8, height: 150 }}>
              {D.revenueSeries.map((v, i) => {
                const max = Math.max(...D.revenueSeries);
                return (
                  <div key={i} className="col" style={{ flex: 1, alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                    <div title={`$${v}k`} style={{ width: "100%", maxWidth: 30, height: `${(v / max) * 100}%`, background: i === D.revenueSeries.length - 1 ? "var(--accent)" : "var(--accent-mid)", borderRadius: "5px 5px 0 0", transition: "height .5s ease" }} />
                    <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{months[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* Low stock alerts */}
        <div className="card" style={{ padding: 22, display: "flex", flexDirection: "column" }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
            <div className="row" style={{ gap: 8 }}><Icons.alert size={17} style={{ color: "var(--warn)" }} /><span style={{ fontSize: 15, fontWeight: 700 }}>Stock alerts</span></div>
            <button onClick={() => nav.go("admin-inventory")} style={{ border: 0, background: "transparent", color: "var(--accent)", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>View all</button>
          </div>
          <div className="col" style={{ gap: 0, flex: 1 }}>
            {lowStock.map((p, i) => (
              <div key={p.id} className="row" style={{ gap: 12, padding: "11px 0", borderBottom: i < lowStock.length - 1 ? "1px solid var(--line)" : 0 }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, overflow: "hidden", flex: "0 0 auto", border: "1px solid var(--line)" }}><ImgPH label="" category={p.category} ratio="1/1" radius="0" /></div>
                <div className="col" style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{p.sku}</span>
                </div>
                <div className="col" style={{ alignItems: "flex-end", gap: 4 }}>
                  <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: p.status === "out" ? "var(--danger)" : "var(--warn)" }}>{p.stock}</span>
                  {stockBadge(p.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders + top products */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginTop: 16 }}>
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="row" style={{ justifyContent: "space-between", padding: "18px 20px 14px" }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Recent orders</span>
            <button onClick={() => nav.go("admin-orders")} style={{ border: 0, background: "transparent", color: "var(--accent)", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>View all orders</button>
          </div>
          <table className="tbl">
            <thead><tr><th>Order</th><th>Customer</th><th className="th-num">Total</th><th>Status</th></tr></thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} style={{ cursor: "pointer" }} onClick={() => nav.go("admin-orders")}>
                  <td className="mono" style={{ fontWeight: 700, fontSize: 12.5 }}>{o.id}</td>
                  <td><div className="col"><span style={{ fontWeight: 600, fontSize: 13 }}>{o.customer}</span><span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{o.units} units</span></div></td>
                  <td className="td-num mono" style={{ fontWeight: 700 }}>{money0(o.total)}</td>
                  <td><Badge tone={orderStatusTone(o.status)} dot>{o.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card" style={{ padding: 22 }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>Top products (MTD)</span>
          <div className="col" style={{ gap: 0, marginTop: 14 }}>
            {topProducts.map((p, i) => {
              const max = topProducts[0].sold;
              return (
                <div key={p.id} style={{ padding: "11px 0", borderBottom: i < 3 ? "1px solid var(--line)" : 0 }}>
                  <div className="row" style={{ justifyContent: "space-between", marginBottom: 7 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                    <span className="mono" style={{ fontSize: 12.5, fontWeight: 700 }}>{p.sold.toLocaleString()}</span>
                  </div>
                  <div style={{ height: 6, background: "var(--cream-2)", borderRadius: 100, overflow: "hidden" }}><div style={{ width: `${(p.sold / max) * 100}%`, height: "100%", background: "var(--accent)", borderRadius: 100 }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminShell>
  );
};

Object.assign(window, { AdminShell, Kpi, DashboardScreen });
