/* Evolve Wholesale — Customer: Catalog, Product Detail, Cart, Apply */

/* ---------------- CATALOG ---------------- */
const CatalogScreen = ({ nav, params }) => {
  const D = window.DATA;
  const [cats, setCats] = React.useState(params.cat && params.cat !== "accessories" ? [params.cat] : []);
  const [brands, setBrands] = React.useState([]);
  const [avail, setAvail] = React.useState([]);
  const [sort, setSort] = React.useState("featured");

  const accessoryCats = ["cases", "charging", "audio", "cables"];
  React.useEffect(() => {
    if (params.cat === "accessories") setCats(accessoryCats);
    else if (params.cat) setCats([params.cat]);
  }, [params.cat]);

  const toggle = (arr, set, v) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  let list = D.products.filter((p) =>
    (cats.length === 0 || cats.includes(p.category)) &&
    (brands.length === 0 || brands.includes(p.brand)) &&
    (avail.length === 0 || avail.includes(p.status))
  );
  if (sort === "price-lo") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "price-hi") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "stock") list = [...list].sort((a, b) => b.stock - a.stock);

  const FilterGroup = ({ title, children }) => (
    <div style={{ padding: "18px 0", borderBottom: "1px solid var(--line)" }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--ink-2-solid)", marginBottom: 13 }}>{title}</div>
      {children}
    </div>
  );
  const Check = ({ on, onClick, label, count }) => (
    <label onClick={onClick} className="row" style={{ gap: 10, padding: "5px 0", cursor: "pointer", fontSize: 13.5 }}>
      <span style={{ width: 18, height: 18, borderRadius: 5, border: on ? "1px solid var(--accent)" : "1px solid var(--line-2)", background: on ? "var(--accent)" : "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto", transition: "all .12s" }}>
        {on && <Icons.check size={12} style={{ color: "#fff" }} sw={2.4} />}
      </span>
      <span style={{ flex: 1, color: on ? "var(--ink)" : "var(--ink-2-solid)", fontWeight: on ? 600 : 500 }}>{label}</span>
      {count != null && <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{count}</span>}
    </label>
  );

  const heading = params.cat === "accessories" ? "Accessories" : (cats.length === 1 ? D.categories.find((c) => c.id === cats[0])?.name : "Full Catalog");

  return (
    <div className="screen-in">
      <Page>
        <div style={{ padding: "32px 0 0" }}>
          <div className="row mono" style={{ gap: 7, fontSize: 12, color: "var(--ink-3)" }}>
            <span style={{ cursor: "pointer" }} onClick={() => nav.go("home")}>Home</span><Icons.chevR size={12} /><span style={{ color: "var(--ink-2-solid)" }}>Catalog</span>
          </div>
          <h1 style={{ fontSize: 32, marginTop: 12 }}>{heading || "Full Catalog"}</h1>
          <p className="muted" style={{ fontSize: 14, marginTop: 6 }}>Wholesale pricing shown. Sign in to a Gold or Platinum account for contract rates.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "236px 1fr", gap: 32, padding: "26px 0 72px", alignItems: "start" }}>
          {/* Sidebar */}
          <aside style={{ position: "sticky", top: 92 }}>
            <div className="card" style={{ padding: "4px 18px 18px" }}>
              <FilterGroup title="Category">
                {D.categories.map((c) => <Check key={c.id} on={cats.includes(c.id)} onClick={() => toggle(cats, setCats, c.id)} label={c.name} count={c.count} />)}
              </FilterGroup>
              <FilterGroup title="Brand">
                {D.brands.map((b) => <Check key={b} on={brands.includes(b)} onClick={() => toggle(brands, setBrands, b)} label={b} />)}
              </FilterGroup>
              <div style={{ padding: "18px 0 4px" }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--ink-2-solid)", marginBottom: 13 }}>Availability</div>
                {[["in", "In stock"], ["low", "Low stock"], ["out", "Out of stock"]].map(([v, l]) => <Check key={v} on={avail.includes(v)} onClick={() => toggle(avail, setAvail, v)} label={l} />)}
              </div>
            </div>
            {(cats.length || brands.length || avail.length) > 0 && (
              <button onClick={() => { setCats([]); setBrands([]); setAvail([]); }} style={{ border: 0, background: "transparent", color: "var(--accent)", fontSize: 13, fontWeight: 600, marginTop: 14, padding: "0 4px", cursor: "pointer" }}>Clear all filters</button>
            )}
          </aside>
          {/* Grid */}
          <div>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 18 }}>
              <span className="muted" style={{ fontSize: 13.5 }}><b className="mono" style={{ color: "var(--ink)" }}>{list.length}</b> products</span>
              <div className="row" style={{ gap: 8 }}>
                <span style={{ fontSize: 13, color: "var(--ink-3)" }}>Sort</span>
                <select className="field" value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: "auto", padding: "8px 30px 8px 12px", fontSize: 13.5 }}>
                  <option value="featured">Featured</option>
                  <option value="price-lo">Price: low to high</option>
                  <option value="price-hi">Price: high to low</option>
                  <option value="stock">Most in stock</option>
                </select>
              </div>
            </div>
            {list.length === 0 ? (
              <div className="card" style={{ padding: 60, textAlign: "center" }}>
                <Icons.search size={30} style={{ color: "var(--ink-3)" }} />
                <p style={{ marginTop: 12, fontWeight: 600 }}>No products match those filters</p>
                <p className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>Try removing a filter.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                {list.map((p) => <ProductCard key={p.id} p={p} nav={nav} />)}
              </div>
            )}
          </div>
        </div>
      </Page>
    </div>
  );
};

/* ---------------- PRODUCT DETAIL ---------------- */
const ProductScreen = ({ nav, params, cart }) => {
  const D = window.DATA;
  const p = D.products.find((x) => x.id === params.id) || D.products[0];
  const [qty, setQty] = React.useState(p.moq);
  const [thumb, setThumb] = React.useState(0);
  React.useEffect(() => { setQty(p.moq); setThumb(0); }, [p.id]);

  const activeTier = [...p.tiers].reverse().find((t) => qty >= t.min) || p.tiers[0];
  const unit = activeTier.price;
  const related = D.products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const oos = p.status === "out";

  return (
    <div className="screen-in">
      <Page>
        <div className="row mono" style={{ gap: 7, fontSize: 12, color: "var(--ink-3)", padding: "28px 0 22px" }}>
          <span style={{ cursor: "pointer" }} onClick={() => nav.go("home")}>Home</span><Icons.chevR size={12} />
          <span style={{ cursor: "pointer" }} onClick={() => nav.go("catalog", { cat: p.category })}>{D.categories.find((c) => c.id === p.category)?.name}</span>
          <Icons.chevR size={12} /><span style={{ color: "var(--ink-2-solid)" }}>{p.sku}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, paddingBottom: 24 }}>
          {/* Gallery */}
          <div>
            <ImgPH label={`${p.name} — product shot ${thumb + 1}`} category={p.category} ratio="1 / 1" radius="var(--r-lg)" style={{ border: "1px solid var(--line)" }} />
            <div className="row" style={{ gap: 10, marginTop: 12 }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} onClick={() => setThumb(i)} style={{ flex: 1, cursor: "pointer", borderRadius: 9, overflow: "hidden", border: thumb === i ? "2px solid var(--accent)" : "1px solid var(--line)" }}>
                  <ImgPH label="" category={p.category} ratio="1 / 1" radius="0" glyph={true} />
                </div>
              ))}
            </div>
          </div>
          {/* Buy box */}
          <div>
            <div className="row" style={{ gap: 10 }}>
              <span className="mono" style={{ fontSize: 12.5, color: "var(--ink-3)", letterSpacing: ".04em" }}>{p.brand}</span>
              {stockBadge(p.status)}
            </div>
            <h1 style={{ fontSize: 30, marginTop: 12, lineHeight: 1.12 }}>{p.name}</h1>
            <div className="row mono" style={{ gap: 16, marginTop: 12, fontSize: 12.5, color: "var(--ink-2-solid)" }}>
              <span>SKU {p.sku}</span><span style={{ color: "var(--line-2)" }}>·</span><span>Color {p.color}</span><span style={{ color: "var(--line-2)" }}>·</span><span>{p.stock.toLocaleString()} on hand</span>
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-2-solid)", marginTop: 18 }}>{p.desc}</p>

            {/* Tiered pricing */}
            <div className="card" style={{ marginTop: 22, padding: "4px 18px", background: "var(--cream)" }}>
              {p.tiers.map((t, i) => {
                const on = activeTier.min === t.min;
                const next = p.tiers[i + 1];
                const range = next ? `${t.min}–${next.min - 1}` : `${t.min}+`;
                return (
                  <div key={t.min} className="row" style={{ justifyContent: "space-between", padding: "13px 0", borderBottom: i < 2 ? "1px solid var(--line)" : 0 }}>
                    <div className="row" style={{ gap: 9 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: on ? "var(--accent)" : "var(--line-2)" }} />
                      <span style={{ fontSize: 14, fontWeight: on ? 700 : 500, color: on ? "var(--ink)" : "var(--ink-2-solid)" }}>{range} units</span>
                    </div>
                    <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: on ? "var(--accent)" : "var(--ink-2-solid)" }}>{money(t.price)}<span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-3)" }}>/ea</span></span>
                  </div>
                );
              })}
            </div>

            {/* Qty + add */}
            <div className="row" style={{ gap: 14, marginTop: 22, alignItems: "stretch" }}>
              <div className="row" style={{ border: "1px solid var(--line-2)", borderRadius: "var(--r-sm)", overflow: "hidden", background: "var(--paper)" }}>
                <button onClick={() => setQty(Math.max(p.moq, qty - p.moq))} disabled={oos} style={{ border: 0, background: "transparent", width: 44, color: "var(--ink-2-solid)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icons.minus size={16} /></button>
                <input className="mono" value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: 64, border: 0, textAlign: "center", fontSize: 16, fontWeight: 700, background: "transparent", outline: "none" }} />
                <button onClick={() => setQty(qty + p.moq)} disabled={oos} style={{ border: 0, background: "transparent", width: 44, color: "var(--ink-2-solid)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icons.plus size={16} /></button>
              </div>
              <Btn variant="primary" size="lg" icon={Icons.cart} className="btn-block" disabled={oos} onClick={() => cart.add(p, qty, unit)} style={{ flex: 1 }}>
                {oos ? "Out of stock" : `Add ${qty} — ${money(unit * qty)}`}
              </Btn>
            </div>
            <div className="row" style={{ gap: 7, marginTop: 12, fontSize: 12.5, color: "var(--ink-3)" }}>
              <Icons.alert size={14} /><span>Minimum order quantity: <b className="mono" style={{ color: "var(--ink-2-solid)" }}>{p.moq} units</b>. Sold in multiples of {p.moq}.</span>
            </div>

            {/* Meta strip */}
            <div className="row" style={{ gap: 0, marginTop: 22, borderTop: "1px solid var(--line)", paddingTop: 18 }}>
              {[[Icons.truck, "Ships same day"], [Icons.shield, "Authentic + warranty"], [Icons.receipt, "Net-30 eligible"]].map(([I, t]) => (
                <div key={t} className="row" style={{ gap: 8, flex: 1, fontSize: 12.5, color: "var(--ink-2-solid)" }}><I size={17} style={{ color: "var(--accent)" }} />{t}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        <div style={{ padding: "44px 0 72px" }}>
          <h2 style={{ fontSize: 22, marginBottom: 20 }}>More in {D.categories.find((c) => c.id === p.category)?.name}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {related.map((r) => <ProductCard key={r.id} p={r} nav={nav} />)}
          </div>
        </div>
      </Page>
    </div>
  );
};

/* ---------------- CART ---------------- */
const CartScreen = ({ nav, cart }) => {
  const items = cart.items;
  const subtotal = items.reduce((s, i) => s + i.unit * i.qty, 0);
  const freight = subtotal > 5000 || subtotal === 0 ? 0 : 89;
  const total = subtotal + freight;

  if (items.length === 0) {
    return (
      <div className="screen-in"><Page max={760}>
        <div className="card" style={{ marginTop: 80, marginBottom: 100, padding: "72px 40px", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--cream-2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", color: "var(--ink-3)" }}><Icons.cart size={30} /></div>
          <h2 style={{ fontSize: 24, marginTop: 22 }}>Your order is empty</h2>
          <p className="muted" style={{ fontSize: 15, marginTop: 8 }}>Browse the catalog and add products to build a bulk order.</p>
          <div style={{ marginTop: 26 }}><Btn variant="primary" size="lg" iconR={Icons.arrowR} onClick={() => nav.go("catalog")}>Browse the catalog</Btn></div>
        </div>
      </Page></div>
    );
  }

  return (
    <div className="screen-in"><Page>
      <h1 style={{ fontSize: 32, padding: "32px 0 6px" }}>Your order</h1>
      <p className="muted" style={{ fontSize: 14, marginBottom: 26 }}>{items.length} line items · {items.reduce((s, i) => s + i.qty, 0).toLocaleString()} units</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, paddingBottom: 80, alignItems: "start" }}>
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="tbl">
            <thead><tr><th>Product</th><th className="th-num">Unit price</th><th style={{ textAlign: "center" }}>Quantity</th><th className="th-num">Line total</th><th></th></tr></thead>
            <tbody>
              {items.map((i) => {
                const belowMoq = i.qty < i.moq;
                return (
                  <tr key={i.id}>
                    <td>
                      <div className="row" style={{ gap: 13 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 9, overflow: "hidden", flex: "0 0 auto", border: "1px solid var(--line)" }}><ImgPH label="" category={i.category} ratio="1/1" radius="0" /></div>
                        <div className="col">
                          <span style={{ fontWeight: 700, fontSize: 13.5, cursor: "pointer" }} onClick={() => nav.go("product", { id: i.id })}>{i.name}</span>
                          <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 3 }}>{i.sku} · {i.brand}</span>
                          {belowMoq && <span className="row" style={{ gap: 4, fontSize: 11.5, color: "var(--danger)", marginTop: 4 }}><Icons.alert size={12} />Below MOQ ({i.moq})</span>}
                        </div>
                      </div>
                    </td>
                    <td className="td-num mono" style={{ color: "var(--ink-2-solid)" }}>{money(i.unit)}</td>
                    <td>
                      <div className="row" style={{ justifyContent: "center" }}>
                        <div className="row" style={{ border: "1px solid var(--line-2)", borderRadius: 7, overflow: "hidden" }}>
                          <button onClick={() => cart.update(i.id, i.qty - i.moq)} style={{ border: 0, background: "transparent", width: 30, height: 32, color: "var(--ink-2-solid)" }}><Icons.minus size={13} /></button>
                          <span className="mono" style={{ width: 42, textAlign: "center", fontWeight: 700, fontSize: 13.5 }}>{i.qty}</span>
                          <button onClick={() => cart.update(i.id, i.qty + i.moq)} style={{ border: 0, background: "transparent", width: 30, height: 32, color: "var(--ink-2-solid)" }}><Icons.plus size={13} /></button>
                        </div>
                      </div>
                    </td>
                    <td className="td-num mono" style={{ fontWeight: 700 }}>{money(i.unit * i.qty)}</td>
                    <td style={{ textAlign: "right" }}><button onClick={() => cart.remove(i.id)} style={{ border: 0, background: "transparent", color: "var(--ink-3)", padding: 4 }}>✕</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Summary */}
        <div className="card" style={{ padding: 22, position: "sticky", top: 92 }}>
          <h3 style={{ fontSize: 17, marginBottom: 16 }}>Order summary</h3>
          {[["Subtotal", money(subtotal)], ["Est. freight", freight === 0 ? "Free" : money(freight)]].map(([l, v]) => (
            <div key={l} className="row" style={{ justifyContent: "space-between", padding: "9px 0", fontSize: 14 }}>
              <span className="muted">{l}</span><span className="mono" style={{ fontWeight: 600, color: v === "Free" ? "var(--ok)" : "var(--ink)" }}>{v}</span>
            </div>
          ))}
          {freight === 0 && subtotal > 0 && <div className="row" style={{ gap: 6, fontSize: 12, color: "var(--ok)", padding: "2px 0 6px" }}><Icons.check size={13} sw={2.4} />Free freight over $5,000</div>}
          <hr className="divider" style={{ margin: "10px 0" }} />
          <div className="row" style={{ justifyContent: "space-between", padding: "6px 0 16px" }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span><span className="mono" style={{ fontWeight: 800, fontSize: 22, color: "var(--accent)" }}>{money(total)}</span>
          </div>
          <Btn variant="primary" size="lg" className="btn-block" iconR={Icons.arrowR} onClick={() => cart.checkout()}>Submit order</Btn>
          <Btn variant="ghost" size="sm" className="btn-block" onClick={() => nav.go("catalog")} style={{ marginTop: 8 }}>Continue browsing</Btn>
          <div style={{ background: "var(--cream)", borderRadius: 9, padding: "12px 14px", marginTop: 16, display: "flex", gap: 9 }}>
            <Icons.receipt size={16} style={{ color: "var(--accent)", flex: "0 0 auto", marginTop: 1 }} />
            <span style={{ fontSize: 12, color: "var(--ink-2-solid)", lineHeight: 1.5 }}>Approved Net-30 accounts can submit without prepayment. An invoice is issued on dispatch.</span>
          </div>
        </div>
      </div>
    </Page></div>
  );
};

/* ---------------- APPLY (simple form screen) ---------------- */
const ApplyScreen = ({ nav, cart }) => {
  const [done, setDone] = React.useState(false);
  return (
    <div className="screen-in"><Page max={640}>
      <div className="card" style={{ margin: "56px 0 90px", padding: 0, overflow: "hidden" }}>
        <div style={{ background: "var(--accent)", color: "#EAF2EC", padding: "30px 36px" }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--accent-mid)" }}>Wholesale application</span>
          <h1 style={{ fontSize: 26, color: "#fff", marginTop: 10 }}>Open a wholesale account</h1>
          <p style={{ fontSize: 14.5, color: "#C8DBCE", marginTop: 8 }}>Approved in ~24 hours. You'll unlock contract pricing, Net-30 terms, and live stock.</p>
        </div>
        {done ? (
          <div style={{ padding: "56px 36px", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--ok-soft)", color: "var(--ok)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}><Icons.check size={28} sw={2.4} /></div>
            <h2 style={{ fontSize: 22, marginTop: 18 }}>Application received</h2>
            <p className="muted" style={{ fontSize: 14.5, marginTop: 8 }}>Our sales team will reach out within one business day.</p>
            <div style={{ marginTop: 24 }}><Btn variant="primary" onClick={() => nav.go("home")}>Back to home</Btn></div>
          </div>
        ) : (
          <div style={{ padding: "30px 36px 34px", display: "grid", gap: 16 }}>
            {[["Business name", "Acme Mobile LLC"], ["Contact name", "Your full name"], ["Work email", "you@business.com"], ["Reseller / tax ID", "XX-XXXXXXX"]].map(([l, ph]) => (
              <label key={l} className="col" style={{ gap: 6 }}><span style={{ fontSize: 13, fontWeight: 600 }}>{l}</span><input className="field" placeholder={ph} /></label>
            ))}
            <label className="col" style={{ gap: 6 }}><span style={{ fontSize: 13, fontWeight: 600 }}>Business type</span>
              <select className="field"><option>Independent phone shop</option><option>Repair store</option><option>Online reseller</option><option>Distributor</option></select>
            </label>
            <Btn variant="primary" size="lg" className="btn-block" onClick={() => setDone(true)} style={{ marginTop: 6 }}>Submit application</Btn>
          </div>
        )}
      </div>
    </Page></div>
  );
};

Object.assign(window, { CatalogScreen, ProductScreen, CartScreen, ApplyScreen });
