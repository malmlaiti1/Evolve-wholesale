/* Evolve Wholesale — Customer storefront: Header, Footer, Home, Catalog */

const CustHeader = ({ nav, cartCount, active }) => {
  const links = [
    { id: "catalog", label: "Catalog" },
    { id: "catalog-smartphones", label: "Devices" },
    { id: "catalog-accessories", label: "Accessories" },
    { id: "deals", label: "Volume Pricing" },
  ];
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40, background: "rgba(255,255,255,.92)",
      backdropFilter: "blur(10px)", borderBottom: "1px solid var(--line)",
    }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px", height: 68, display: "flex", alignItems: "center", gap: 32 }}>
        <div onClick={() => nav.go("home")} style={{ cursor: "pointer" }}><Logo /></div>
        <nav className="row" style={{ gap: 4 }}>
          {links.map((l) => (
            <button key={l.id} onClick={() => nav.go(l.id.startsWith("catalog") ? "catalog" : l.id, l.id.includes("-") ? { cat: l.id.split("-")[1] } : {})}
              style={{
                border: 0, background: "transparent", padding: "8px 13px", borderRadius: 7,
                fontSize: 14, fontWeight: 600, color: active === l.id ? "var(--accent)" : "var(--ink-2-solid)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cream-2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              {l.label}
            </button>
          ))}
        </nav>
        <div className="row" style={{ gap: 12, marginLeft: "auto" }}>
          <div className="search-wrap" style={{ width: 220 }}>
            <Icons.search />
            <input className="field" placeholder="Search SKUs, brands…" onFocus={() => nav.go("catalog")} />
          </div>
          <button onClick={() => nav.go("cart")} style={{ position: "relative", border: "1px solid var(--line-2)", background: "var(--paper)", width: 42, height: 42, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink)" }}>
            <Icons.cart size={19} />
            {cartCount > 0 && (
              <span className="mono" style={{ position: "absolute", top: -7, right: -7, background: "var(--accent)", color: "#fff", fontSize: 10.5, fontWeight: 700, minWidth: 19, height: 19, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>{cartCount}</span>
            )}
          </button>
          <Btn variant="primary" size="sm" onClick={() => nav.go("apply")}>Apply for account</Btn>
        </div>
      </div>
    </header>
  );
};

const CustFooter = ({ nav }) => (
  <footer style={{ background: "var(--ink)", color: "#CFC8B9", marginTop: 0 }}>
    <div style={{ maxWidth: 1240, margin: "0 auto", padding: "52px 32px 32px", display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: 40 }}>
      <div>
        <div style={{ filter: "brightness(1.4)" }}><Logo sub={false} /></div>
        <p style={{ fontSize: 13.5, lineHeight: 1.6, marginTop: 16, maxWidth: 280, color: "#A39C8D" }}>
          Authorized wholesale supply of mobile devices and accessories for retailers, repair shops, and resellers across North America.
        </p>
        <div className="row" style={{ gap: 8, marginTop: 18 }}>
          <Badge tone="ok" dot>Net-30 available</Badge>
          <Badge tone="accent">Authentic stock</Badge>
        </div>
      </div>
      {[
        { h: "Shop", items: ["Smartphones", "Tablets", "Charging", "Audio", "Cables"] },
        { h: "Wholesale", items: ["Apply for account", "Volume pricing", "Freight & terms", "Returns policy"] },
        { h: "Company", items: ["About Evolve", "Contact sales", "Support", "Careers"] },
      ].map((c) => (
        <div key={c.h}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#fff", marginBottom: 14 }}>{c.h}</div>
          <ul className="col" style={{ gap: 10 }}>
            {c.items.map((i) => <li key={i} style={{ fontSize: 13.5, color: "#A39C8D", cursor: "pointer" }}>{i}</li>)}
          </ul>
        </div>
      ))}
    </div>
    <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", padding: "18px 32px" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#8E887A" }}>
        <span>© 2026 Evolve Wireless LLC. All rights reserved.</span>
        <span className="mono">Terms · Privacy · Wholesale Agreement</span>
      </div>
    </div>
  </footer>
);

const Page = ({ children, max = 1240, pad = "0 32px" }) => (
  <div style={{ maxWidth: max, margin: "0 auto", padding: pad }}>{children}</div>
);

/* ---------------- HOME ---------------- */
const HomeScreen = ({ nav }) => {
  const D = window.DATA;
  const featured = D.products.filter((p) => ["p-01", "p-05", "p-13", "p-17", "p-09", "p-20", "p-14", "p-07"].includes(p.id));
  const props = [
    { icon: Icons.shield, h: "100% authentic", t: "Sourced from authorized channels with full warranty." },
    { icon: Icons.truck, h: "Same-day dispatch", t: "Orders in by 2pm ET ship the same business day." },
    { icon: Icons.tag, h: "Tiered volume pricing", t: "Unit price drops automatically as you scale up." },
    { icon: Icons.receipt, h: "Net-30 terms", t: "Approved accounts get flexible payment terms." },
  ];
  return (
    <div className="screen-in">
      {/* Hero */}
      <div style={{ background: "var(--cream)", borderBottom: "1px solid var(--line)" }}>
        <Page>
          <div style={{ display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 56, alignItems: "center", padding: "72px 0 76px" }}>
            <div>
              <span className="eyebrow">Wholesale mobile supply</span>
              <h1 style={{ fontSize: 52, lineHeight: 1.02, marginTop: 18, marginBottom: 0, letterSpacing: "-.03em" }}>
                Stock your shelves<br />with <span style={{ color: "var(--accent)" }}>better margins.</span>
              </h1>
              <p style={{ fontSize: 17.5, lineHeight: 1.55, color: "var(--ink-2-solid)", marginTop: 22, maxWidth: 460 }}>
                Phones, tablets, and accessories at true wholesale pricing — with live inventory, fast freight, and Net-30 terms for approved retailers.
              </p>
              <div className="row" style={{ gap: 12, marginTop: 30 }}>
                <Btn variant="primary" size="lg" iconR={Icons.arrowR} onClick={() => nav.go("catalog")}>Browse the catalog</Btn>
                <Btn variant="secondary" size="lg" onClick={() => nav.go("apply")}>Apply for account</Btn>
              </div>
              <div className="row" style={{ gap: 28, marginTop: 40 }}>
                {[["22+", "SKUs in stock"], ["7", "trusted brands"], ["48k/mo", "units shipped"]].map(([n, l]) => (
                  <div key={l} className="col">
                    <span className="mono" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-.02em" }}>{n}</span>
                    <span style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 2 }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <ImgPH label="hero — retail-ready devices & accessories flat-lay" ratio="4 / 3.4" radius="var(--r-xl)" glyph={false} style={{ boxShadow: "var(--sh-lg)" }} />
              <div className="card" style={{ position: "absolute", bottom: -22, left: -22, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--sh-md)" }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}><Icons.bolt size={20} /></div>
                <div className="col"><span style={{ fontSize: 13, fontWeight: 700 }}>Live stock levels</span><span style={{ fontSize: 12, color: "var(--ink-3)" }}>Updated every order</span></div>
              </div>
            </div>
          </div>
        </Page>
      </div>

      {/* Value props */}
      <Page>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "var(--line)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", overflow: "hidden", margin: "-32px 0 0", position: "relative", boxShadow: "var(--sh)" }}>
          {props.map((p) => (
            <div key={p.h} style={{ background: "var(--paper)", padding: "22px 22px" }}>
              <p.icon size={22} style={{ color: "var(--accent)" }} />
              <div style={{ fontSize: 14.5, fontWeight: 700, marginTop: 12 }}>{p.h}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-2-solid)", marginTop: 5, lineHeight: 1.5 }}>{p.t}</div>
            </div>
          ))}
        </div>
      </Page>

      {/* Categories */}
      <Page>
        <div style={{ padding: "64px 0 0" }}>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
            <div><span className="eyebrow">Shop by category</span><h2 style={{ fontSize: 30, marginTop: 10 }}>Everything your counter needs</h2></div>
            <Btn variant="ghost" iconR={Icons.arrowR} onClick={() => nav.go("catalog")}>View all categories</Btn>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {D.categories.map((c) => {
              const C = catIcon(c.id);
              return (
                <div key={c.id} className="card" onClick={() => nav.go("catalog", { cat: c.id })}
                  style={{ padding: 22, cursor: "pointer", display: "flex", alignItems: "center", gap: 16, transition: "all .18s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--sh-md)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--sh-sm)"; e.currentTarget.style.transform = "none"; }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: "var(--cream-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flex: "0 0 auto" }}><C size={26} /></div>
                  <div className="col" style={{ flex: 1 }}>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{c.name}</span>
                    <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>{c.count} SKUs</span>
                  </div>
                  <Icons.chevR size={18} style={{ color: "var(--ink-3)" }} />
                </div>
              );
            })}
          </div>
        </div>
      </Page>

      {/* Featured products */}
      <Page>
        <div style={{ padding: "64px 0 0" }}>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
            <div><span className="eyebrow">Moving fast</span><h2 style={{ fontSize: 30, marginTop: 10 }}>Best sellers this month</h2></div>
            <Btn variant="ghost" iconR={Icons.arrowR} onClick={() => nav.go("catalog")}>See full catalog</Btn>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
            {featured.map((p) => <ProductCard key={p.id} p={p} nav={nav} />)}
          </div>
        </div>
      </Page>

      {/* Pricing CTA band */}
      <Page>
        <div style={{ margin: "72px 0", borderRadius: "var(--r-xl)", background: "var(--accent)", color: "#EAF2EC", padding: "48px 52px", display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 48, alignItems: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -60, top: -60, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,.05)" }} />
          <div style={{ position: "relative" }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--accent-mid)" }}>Volume pricing</span>
            <h2 style={{ fontSize: 34, marginTop: 14, color: "#fff", lineHeight: 1.1 }}>The more you buy, the less you pay.</h2>
            <p style={{ fontSize: 16, lineHeight: 1.55, marginTop: 14, color: "#C8DBCE", maxWidth: 440 }}>
              Every SKU has three pricing tiers. Hit a tier and your unit price drops automatically at checkout — no negotiating required.
            </p>
            <div style={{ marginTop: 26 }}>
              <Btn variant="secondary" iconR={Icons.arrowR} onClick={() => nav.go("apply")}>Get approved in 24 hours</Btn>
            </div>
          </div>
          <div className="card" style={{ padding: 22, position: "relative", color: "var(--ink)" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2-solid)", marginBottom: 4 }}>Example · Voltcraft 35W Charger</div>
            <div className="col" style={{ gap: 0 }}>
              {[["5–24 units", "$12.90"], ["25–99 units", "$11.60"], ["100+ units", "$9.90"]].map(([q, pr], i) => (
                <div key={q} className="row" style={{ justifyContent: "space-between", padding: "13px 0", borderBottom: i < 2 ? "1px solid var(--line)" : 0 }}>
                  <span style={{ fontSize: 14, color: "var(--ink-2-solid)" }}>{q}</span>
                  <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: i === 2 ? "var(--accent)" : "var(--ink)" }}>{pr}</span>
                </div>
              ))}
            </div>
            <div className="row" style={{ gap: 6, marginTop: 12, color: "var(--accent)" }}><Icons.tag size={14} /><span style={{ fontSize: 12.5, fontWeight: 600 }}>Save 23% at the top tier</span></div>
          </div>
        </div>
      </Page>
    </div>
  );
};

/* ---- Product card (shared) ---- */
const ProductCard = ({ p, nav }) => (
  <div className="card" style={{ overflow: "hidden", cursor: "pointer", transition: "all .18s", display: "flex", flexDirection: "column" }}
    onClick={() => nav.go("product", { id: p.id })}
    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--sh-md)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--sh-sm)"; e.currentTarget.style.transform = "none"; }}>
    <div style={{ position: "relative" }}>
      {p.tag && <span className={"tag-pill" + (p.tag === "New" || p.tag === "High margin" ? " accent" : "")}>{p.tag}</span>}
      <ImgPH label={p.sku} category={p.category} radius="0" ratio="1 / 1" />
    </div>
    <div style={{ padding: "15px 16px 17px", display: "flex", flexDirection: "column", flex: 1 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: ".03em" }}>{p.brand}</span>
        {stockBadge(p.status)}
      </div>
      <div style={{ fontSize: 14.5, fontWeight: 700, marginTop: 7, lineHeight: 1.25, minHeight: 36 }}>{p.name}</div>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end", marginTop: 13 }}>
        <div className="col">
          <span style={{ fontSize: 11, color: "var(--ink-3)" }}>From / unit</span>
          <span className="mono" style={{ fontSize: 19, fontWeight: 700, color: "var(--accent)", marginTop: 2 }}>{money(p.price)}</span>
        </div>
        <div className="col" style={{ alignItems: "flex-end" }}>
          <span style={{ fontSize: 11, color: "var(--ink-3)" }}>MSRP {money(p.msrp)}</span>
          <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-2-solid)", marginTop: 3 }}>MOQ {p.moq}</span>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { CustHeader, CustFooter, Page, HomeScreen, ProductCard });
