/* Evolve Wholesale — root app: router, site switcher, cart, toast */

const PricingScreen = ({ nav }) => {
  const D = window.DATA;
  const sample = D.products.filter((p) => ["p-01", "p-05", "p-13", "p-17", "p-09", "p-20"].includes(p.id));
  return (
    <div className="screen-in"><Page>
      <div style={{ padding: "48px 0 8px", textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
        <span className="eyebrow">Volume pricing</span>
        <h1 style={{ fontSize: 38, marginTop: 14 }}>Three tiers. No negotiating.</h1>
        <p style={{ fontSize: 16, color: "var(--ink-2-solid)", marginTop: 14, lineHeight: 1.6 }}>Every SKU drops in price as you scale. Your cart automatically applies the best tier you qualify for at checkout.</p>
      </div>
      <div className="card" style={{ overflow: "hidden", margin: "36px 0 80px" }}>
        <table className="tbl">
          <thead><tr><th>Product</th><th className="th-num">5–24 units</th><th className="th-num">25–99 units</th><th className="th-num">100+ units</th><th className="th-num">Max savings</th></tr></thead>
          <tbody>
            {sample.map((p) => {
              const save = Math.round((1 - p.tiers[2].price / p.tiers[0].price) * 100);
              return (
                <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => nav.go("product", { id: p.id })}>
                  <td><div className="row" style={{ gap: 12 }}><div style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", border: "1px solid var(--line)" }}><ImgPH label="" category={p.category} ratio="1/1" radius="0" /></div><div className="col"><span style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</span><span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{p.sku}</span></div></div></td>
                  <td className="td-num mono">{money(p.tiers[0].price)}</td>
                  <td className="td-num mono">{money(p.tiers[1].price)}</td>
                  <td className="td-num mono" style={{ fontWeight: 700, color: "var(--accent)" }}>{money(p.tiers[2].price)}</td>
                  <td className="td-num"><Badge tone="ok">−{save}%</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Page></div>
  );
};

const SettingsScreen = ({ nav }) => (
  <AdminShell nav={nav} active="admin-settings" title="Settings" subtitle="Account & store configuration">
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
      {[["Store profile", "Business name, logo, contact details", Icons.settings], ["Pricing tiers", "Configure volume break points", Icons.tag], ["Shipping & freight", "Carriers, free-freight threshold", Icons.truck], ["Team & roles", "Invite staff, set permissions", Icons.users], ["Payment terms", "Net-30 eligibility rules", Icons.receipt], ["Notifications", "Low-stock & order alerts", Icons.bell]].map(([h, t, I]) => (
        <div key={h} className="card" style={{ padding: 20, cursor: "pointer", display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: "var(--cream-2)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}><I size={21} /></div>
          <div className="col" style={{ flex: 1 }}><span style={{ fontWeight: 700, fontSize: 14.5 }}>{h}</span><span style={{ fontSize: 12.5, color: "var(--ink-2-solid)", marginTop: 3 }}>{t}</span></div>
          <Icons.chevR size={17} style={{ color: "var(--ink-3)" }} />
        </div>
      ))}
    </div>
  </AdminShell>
);

function App() {
  const [mode, setMode] = React.useState("customer");
  const [screen, setScreen] = React.useState("home");
  const [params, setParams] = React.useState({});
  const [items, setItems] = React.useState([]);
  const [toastMsg, setToastMsg] = React.useState(null);
  const viewRef = React.useRef(null);

  const toast = (m) => { setToastMsg(m); clearTimeout(window.__t); window.__t = setTimeout(() => setToastMsg(null), 2600); };

  const nav = {
    go: (s, p = {}) => { setScreen(s); setParams(p); if (viewRef.current) viewRef.current.scrollTop = 0; window.scrollTo(0, 0); },
  };

  const cart = {
    items,
    add: (p, qty, unit) => {
      setItems((prev) => {
        const ex = prev.find((i) => i.id === p.id);
        if (ex) return prev.map((i) => i.id === p.id ? { ...i, qty: i.qty + qty } : i);
        return [...prev, { id: p.id, name: p.name, sku: p.sku, brand: p.brand, category: p.category, moq: p.moq, unit, qty }];
      });
      toast(`Added ${qty} × ${p.sku} to your order`);
    },
    update: (id, qty) => setItems((prev) => prev.map((i) => i.id === id ? { ...i, qty: Math.max(i.moq, qty) } : i)),
    remove: (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
    checkout: () => { const n = "EW-" + (10473 + Math.floor(Math.random() * 90)); setItems([]); toast(`Order ${n} submitted — invoice on dispatch`); nav.go("home"); },
  };
  const cartCount = items.reduce((s, i) => s + 1, 0);

  // switch mode → sensible default screen
  const switchMode = (m) => { setMode(m); if (m === "customer") nav.go("home"); else nav.go("admin"); };

  const isAdmin = mode === "admin";

  let body;
  if (!isAdmin) {
    const screens = {
      home: <HomeScreen nav={nav} />,
      catalog: <CatalogScreen nav={nav} params={params} />,
      product: <ProductScreen nav={nav} params={params} cart={cart} />,
      cart: <CartScreen nav={nav} cart={cart} />,
      apply: <ApplyScreen nav={nav} cart={cart} />,
      deals: <PricingScreen nav={nav} />,
    };
    body = (
      <div className="col" style={{ minHeight: "100%" }}>
        <CustHeader nav={nav} cartCount={cartCount} active={screen === "catalog" && params.cat ? `catalog-${params.cat}` : screen} />
        <div style={{ flex: 1 }}>{screens[screen] || screens.home}</div>
        <CustFooter nav={nav} />
      </div>
    );
  } else {
    const screens = {
      admin: <DashboardScreen nav={nav} />,
      "admin-inventory": <InventoryScreen nav={nav} toast={toast} />,
      "admin-orders": <OrdersScreen nav={nav} />,
      "admin-customers": <CustomersScreen nav={nav} />,
      "admin-products": <InventoryScreen nav={nav} toast={toast} />,
      "admin-settings": <SettingsScreen nav={nav} />,
    };
    body = screens[screen] || screens.admin;
  }

  return (
    <div className="app-root">
      {/* Prototype mode ribbon */}
      <div className="modebar">
        <span className="mb-brand"><span className="mb-dot" />Evolve Wholesale — prototype</span>
        <span className="mb-hint">{isAdmin ? "Admin back office" : "Customer storefront"}</span>
        <div className="mb-seg">
          <button className={!isAdmin ? "on" : ""} onClick={() => switchMode("customer")}>Customer site</button>
          <button className={isAdmin ? "on" : ""} onClick={() => switchMode("admin")}>Admin</button>
        </div>
      </div>
      <div className="viewport scroll-y" ref={viewRef} style={{ background: isAdmin ? "var(--cream)" : "var(--paper)" }}>
        {body}
      </div>
      {toastMsg && <div className="toast"><Icons.check size={16} sw={2.6} />{toastMsg}</div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
