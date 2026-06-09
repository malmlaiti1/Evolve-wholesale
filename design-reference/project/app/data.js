/* Evolve Wholesale — mock data store
   Plain global script (loaded before Babel). Exposes window.DATA. */
(function () {
  const categories = [
    { id: "smartphones", name: "Smartphones", count: 6 },
    { id: "tablets", name: "Tablets", count: 2 },
    { id: "cases", name: "Cases & Protection", count: 4 },
    { id: "charging", name: "Charging", count: 4 },
    { id: "audio", name: "Audio", count: 3 },
    { id: "cables", name: "Cables & Adapters", count: 3 },
  ];

  const brands = ["Apexa", "Northwind", "Lumio", "Voltcraft", "Kaze", "Halo", "Meridian"];

  // Tiered wholesale pricing: [minQty, unitPrice]
  const tier = (a, b, c) => [
    { min: 5, price: a },
    { min: 25, price: b },
    { min: 100, price: c },
  ];

  const products = [
    { id: "p-01", name: "Apexa A9 Pro 256GB", brand: "Apexa", category: "smartphones", sku: "APX-A9P-256", msrp: 899, price: 612, tiers: tier(612, 588, 559), moq: 5, stock: 340, status: "in", tag: "Best seller", color: "Graphite", desc: "Flagship 6.7\" OLED handset. Unlocked, dual-SIM, 5G. Retail-ready packaging." },
    { id: "p-02", name: "Apexa A9 256GB", brand: "Apexa", category: "smartphones", sku: "APX-A9-256", msrp: 749, price: 498, tiers: tier(498, 479, 452), moq: 5, stock: 512, status: "in", tag: null, color: "Midnight", desc: "6.4\" OLED, unlocked 5G. High-margin mid-flagship for repair shops & resellers." },
    { id: "p-03", name: "Northwind N7 128GB", brand: "Northwind", category: "smartphones", sku: "NW-N7-128", msrp: 599, price: 388, tiers: tier(388, 372, 351), moq: 5, stock: 86, status: "low", tag: null, color: "Slate", desc: "Reliable everyday 5G smartphone. Strong volume seller in prepaid channels." },
    { id: "p-04", name: "Northwind N7 Lite 64GB", brand: "Northwind", category: "smartphones", sku: "NW-N7L-64", msrp: 329, price: 198, tiers: tier(198, 189, 176), moq: 10, stock: 0, status: "out", tag: null, color: "Slate", desc: "Entry 5G device built for prepaid and value channels." },
    { id: "p-05", name: "Lumio Edge 5G 256GB", brand: "Lumio", category: "smartphones", sku: "LM-EDG-256", msrp: 699, price: 451, tiers: tier(451, 433, 409), moq: 5, stock: 224, status: "in", tag: "New", color: "Sand", desc: "Curved-display 5G flagship. Premium feel, mid-tier cost." },
    { id: "p-06", name: "Lumio Go 128GB", brand: "Lumio", category: "smartphones", sku: "LM-GO-128", msrp: 279, price: 167, tiers: tier(167, 159, 148), moq: 10, stock: 690, status: "in", tag: null, color: "Mist", desc: "Budget hero. Moves fast in volume; ideal loss-leader for store traffic." },
    { id: "p-07", name: "Meridian Tab 11", brand: "Meridian", category: "tablets", sku: "MR-TAB11", msrp: 449, price: 289, tiers: tier(289, 277, 262), moq: 5, stock: 148, status: "in", tag: null, color: "Graphite", desc: "11\" LCD tablet, WiFi + LTE. Popular for POS and kiosk resale." },
    { id: "p-08", name: "Meridian Tab 8 Mini", brand: "Meridian", category: "tablets", sku: "MR-TAB8", msrp: 269, price: 171, tiers: tier(171, 164, 153), moq: 10, stock: 64, status: "low", tag: null, color: "Slate", desc: "Compact 8\" tablet. Great attach item for family plans." },
    { id: "p-09", name: "Halo Armor Case — A9 Series", brand: "Halo", category: "cases", sku: "HL-ARM-A9", msrp: 39, price: 11.5, tiers: tier(11.5, 10.2, 8.9), moq: 25, stock: 4200, status: "in", tag: "High margin", color: "Black", desc: "Rugged drop-rated case. 12-pack inner cartons. 3.4x markup at retail." },
    { id: "p-10", name: "Halo Clear Shield — Universal", brand: "Halo", category: "cases", sku: "HL-CLR-UNI", msrp: 24, price: 6.4, tiers: tier(6.4, 5.7, 4.9), moq: 25, stock: 7800, status: "in", tag: null, color: "Clear", desc: "Slim clear TPU case. Bulk poly-bag packing for high-volume accounts." },
    { id: "p-11", name: "Halo Folio Wallet — Edge", brand: "Halo", category: "cases", sku: "HL-FOL-EDG", msrp: 34, price: 9.8, tiers: tier(9.8, 8.7, 7.5), moq: 25, stock: 92, status: "low", tag: null, color: "Brown", desc: "PU leather folio with card slots. Premium accessory upsell." },
    { id: "p-12", name: "Halo Tempered Glass 10-pk", brand: "Halo", category: "cases", sku: "HL-TG-10", msrp: 49, price: 13.2, tiers: tier(13.2, 11.8, 10.1), moq: 25, stock: 3100, status: "in", tag: null, color: "Clear", desc: "9H tempered glass, 10-pack. Essential checkout attach item." },
    { id: "p-13", name: "Voltcraft 35W USB-C Charger", brand: "Voltcraft", category: "charging", sku: "VC-35W-C", msrp: 39, price: 12.9, tiers: tier(12.9, 11.6, 9.9), moq: 25, stock: 2600, status: "in", tag: "Best seller", color: "White", desc: "GaN fast charger, dual-port. UL/ETL listed, retail boxed." },
    { id: "p-14", name: "Voltcraft 10K Power Bank", brand: "Voltcraft", category: "charging", sku: "VC-PB-10K", msrp: 49, price: 16.4, tiers: tier(16.4, 14.8, 12.7), moq: 25, stock: 880, status: "in", tag: null, color: "Black", desc: "10,000mAh USB-C PD power bank. Airline-safe, retail packaged." },
    { id: "p-15", name: "Voltcraft Wireless Pad 15W", brand: "Voltcraft", category: "charging", sku: "VC-WL-15", msrp: 34, price: 10.1, tiers: tier(10.1, 9.0, 7.6), moq: 25, stock: 0, status: "out", tag: null, color: "Black", desc: "Qi2 15W wireless charging pad. Strong margin accessory." },
    { id: "p-16", name: "Voltcraft Car Kit Dual-Port", brand: "Voltcraft", category: "charging", sku: "VC-CAR-2", msrp: 29, price: 7.8, tiers: tier(7.8, 6.9, 5.8), moq: 25, stock: 1900, status: "in", tag: null, color: "Black", desc: "45W car charger, dual USB-C. Impulse-buy counter item." },
    { id: "p-17", name: "Kaze Buds Pro ANC", brand: "Kaze", category: "audio", sku: "KZ-BUDS-P", msrp: 89, price: 31.5, tiers: tier(31.5, 28.4, 24.6), moq: 10, stock: 560, status: "in", tag: "New", color: "White", desc: "Active noise-cancelling TWS earbuds. Retail box, multi-language." },
    { id: "p-18", name: "Kaze Buds Lite", brand: "Kaze", category: "audio", sku: "KZ-BUDS-L", msrp: 39, price: 13.2, tiers: tier(13.2, 11.9, 10.2), moq: 25, stock: 1400, status: "in", tag: null, color: "Black", desc: "Value TWS earbuds. Volume mover for prepaid & convenience." },
    { id: "p-19", name: "Kaze Over-Ear BT Headset", brand: "Kaze", category: "audio", sku: "KZ-OE-BT", msrp: 69, price: 23.9, tiers: tier(23.9, 21.5, 18.6), moq: 10, stock: 112, status: "low", tag: null, color: "Graphite", desc: "Wireless over-ear headphones, 40h battery. Mid-tier audio margin." },
    { id: "p-20", name: "Kaze USB-C to USB-C 2m 3-pk", brand: "Kaze", category: "cables", sku: "KZ-CC-2M3", msrp: 29, price: 6.9, tiers: tier(6.9, 6.1, 5.2), moq: 25, stock: 5200, status: "in", tag: null, color: "White", desc: "Braided 100W cables, 3-pack. Top accessory attach SKU." },
    { id: "p-21", name: "Kaze USB-C to Lightning 3-pk", brand: "Kaze", category: "cables", sku: "KZ-CL-3", msrp: 34, price: 8.4, tiers: tier(8.4, 7.5, 6.4), moq: 25, stock: 3300, status: "in", tag: null, color: "White", desc: "MFi-grade cables, 3-pack. Reliable repeat-order item." },
    { id: "p-22", name: "Kaze Multiport Hub 7-in-1", brand: "Kaze", category: "cables", sku: "KZ-HUB-7", msrp: 59, price: 19.7, tiers: tier(19.7, 17.7, 15.2), moq: 10, stock: 240, status: "in", tag: null, color: "Gray", desc: "USB-C hub: HDMI, USB-A, SD, PD. Higher-ticket accessory." },
  ];

  const orders = [
    { id: "EW-10472", customer: "Riverside Mobile", contact: "Dana Okafor", date: "2026-06-08", items: 14, units: 320, total: 18940.0, status: "Processing", channel: "Online" },
    { id: "EW-10471", customer: "TechBay Resellers", contact: "Marcus Lim", date: "2026-06-08", items: 6, units: 540, total: 9612.5, status: "Awaiting payment", channel: "Quote" },
    { id: "EW-10470", customer: "CellPoint #4", contact: "Priya Nair", date: "2026-06-07", items: 9, units: 210, total: 12480.0, status: "Shipped", channel: "Online" },
    { id: "EW-10469", customer: "Metro Wireless Hub", contact: "Sam Carter", date: "2026-06-07", items: 22, units: 880, total: 27310.0, status: "Processing", channel: "Online" },
    { id: "EW-10468", customer: "QuickFix Repairs", contact: "Lena Vogt", date: "2026-06-06", items: 4, units: 120, total: 3984.0, status: "Delivered", channel: "Online" },
    { id: "EW-10467", customer: "Sunrise Phones", contact: "Omar Said", date: "2026-06-06", items: 11, units: 410, total: 15220.0, status: "Shipped", channel: "Quote" },
    { id: "EW-10466", customer: "Galaxy Trading Co", contact: "Wei Chen", date: "2026-06-05", items: 18, units: 1240, total: 41090.0, status: "Delivered", channel: "Online" },
    { id: "EW-10465", customer: "Downtown Devices", contact: "Aisha Bello", date: "2026-06-05", items: 3, units: 75, total: 2210.0, status: "Cancelled", channel: "Online" },
    { id: "EW-10464", customer: "Peak Mobile Supply", contact: "Jordan Reyes", date: "2026-06-04", items: 7, units: 300, total: 8740.0, status: "Delivered", channel: "Quote" },
  ];

  const customers = [
    { id: "c-01", name: "Galaxy Trading Co", tier: "Platinum", since: 2021, orders: 142, spend: 384200, status: "Active" },
    { id: "c-02", name: "Metro Wireless Hub", tier: "Gold", since: 2022, orders: 98, spend: 211400, status: "Active" },
    { id: "c-03", name: "Riverside Mobile", tier: "Gold", since: 2023, orders: 61, spend: 142900, status: "Active" },
    { id: "c-04", name: "TechBay Resellers", tier: "Silver", since: 2024, orders: 34, spend: 71200, status: "Active" },
    { id: "c-05", name: "QuickFix Repairs", tier: "Silver", since: 2024, orders: 22, spend: 38600, status: "Pending review" },
  ];

  // 12-month revenue sparkline (in thousands)
  const revenueSeries = [182, 196, 174, 210, 234, 221, 248, 263, 257, 281, 296, 312];

  const kpis = {
    revenue: 312480,
    revenueDelta: 8.4,
    orders: 1284,
    ordersDelta: 5.1,
    units: 48210,
    unitsDelta: 11.2,
    lowStock: 5,
    avgOrder: 6840,
    avgOrderDelta: 2.3,
  };

  window.DATA = { categories, brands, products, orders, customers, revenueSeries, kpis };
})();
