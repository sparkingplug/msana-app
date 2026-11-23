try { if (window.Telegram && Telegram.WebApp) Telegram.WebApp.expand(); } catch (e) {}
const BRS = ["Msana", "Cava", "Aser", "Dolce Bakery"];
const CATS = ["Income", "Stock", "Rent", "Bills", "Salary", "Government", "Personal"];
const DEF = {
  pin: "1234",
  disp: "",
  link: "https://t.me",
  promo: "🥐 Fresh croissants out now at Dolce Bakery! 15% OFF lunch combos at Msana, Cava & Aser!",
  pts: 100,
  menu: [
    { id: 1, br: "Msana", cat: "Mains", name: "Msana Special Tibs", p: 650, d: 10 },
    { id: 2, br: "Msana", cat: "Drinks", name: "Fresh Avocado Juice", p: 180, d: 0 },
    { id: 3, br: "Cava", cat: "Mains", name: "Cava Grilled Chicken", p: 720, d: 15 },
    { id: 4, br: "Aser", cat: "Mains", name: "Aser Combo Platter", p: 800, d: 0 },
    { id: 5, br: "Dolce Bakery", cat: "Pastries", name: "Butter Croissant", p: 160, d: 20 }
  ],
  orders: [],
  ledger: [],
  cust: []
};

let S = DEF;
try {
  const saved = localStorage.getItem("mcad_v5");
  if (saved) S = Object.assign({}, DEF, JSON.parse(saved));
} catch (e) {}

function save() {
  try { localStorage.setItem("mcad_v5", JSON.stringify(S)); } catch (e) {}
}

let cBr = "Msana", cCat = "All", cart = [], del = "Motorbike", bet = 20;
let fBr = "Msana", fCat = "Income", bmBr = "Msana";

function tab(t, b) {
  document.querySelectorAll("section").forEach(x => x.classList.add("hide"));
  document.getElementById("s-" + t).classList.remove("hide");
  document.querySelectorAll("nav button").forEach(x => x.classList.remove("on"));
  if (b) b.classList.add("on");
  renderAll();
}

function renderCust() {
  document.getElementById("c-branch").innerHTML = BRS.map(b =>
    `<button class="chip ${cBr === b ? 'on' : ''}" onclick="cBr='${b}';cCat='All';renderCust()">${b}</button>`
  ).join("");
  const items = S.menu.filter(m => m.br === cBr);
  const cats = ["All", ...new Set(items.map(m => m.cat))];
  document.getElementById("c-cat").innerHTML = cats.map(c =>
    `<button class="chip acc ${cCat === c ? 'on' : ''}" onclick="cCat='${c}';renderCust()">${c}</button>`
  ).join("");
  const list = cCat === "All" ? items : items.filter(m => m.cat === cCat);
  document.getElementById("c-menu").innerHTML = list.map(m => {
    const fp = Math.round(m.p * (1 - (m.d || 0) / 100));
    return `<div class="item"><div><strong>${m.name}</strong> ${m.d > 0 ? `<span class="badge">${m.d}% OFF</span>` : ''}<div style="font-size:12px;color:var(--mut)">${m.cat} • ${m.d > 0 ? `<span class="old">${m.p}</span>` : ''}<strong style="color:var(--pri)">${fp} ETB</strong></div></div><button class="btn sm" onclick="addCart(${m.id})">+ Add</button></div>`;
  }).join("");
}

function addCart(id) {
  const m = S.menu.find(x => x.id === id);
  if (m) {
    cart.push({ name: m.name, br: m.br, p: Math.round(m.p * (1 - (m.d || 0) / 100)) });
    renderCart();
  }
}

function renderCart() {
  const el = document.getElementById("cart-box");
  if (!cart.length) {
    el.innerHTML = "Cart is empty.";
    document.getElementById("cart-tot").innerText = "0 ETB";
    return;
  }
  el.innerHTML = cart.map((c, i) =>
    `<div class="row" style="margin-bottom:4px"><span>${c.name} (${c.br})</span><span>${c.p} ETB <b style="color:red;cursor:pointer" onclick="cart.splice(${i},1);renderCart()">✕</b></span></div>`
  ).join("");
  document.getElementById("cart-tot").innerText = cart.reduce((s, i) => s + i.p, 0).toLocaleString() + " ETB";
}

function setDel(d, b) {
  del = d;
  document.querySelectorAll("#del-chips .chip").forEach(x => x.classList.remove("on"));
  b.classList.add("on");
}

function sendOrder() {
  if (!cart.length) return alert("Add an item first.");
  const name = document.getElementById("o-name").value.trim() || "Customer";
  const phone = document.getElementById("o-phone").value.trim();
  const tg = document.getElementById("o-tg").value.trim().replace("@", "");
  const loc = document.getElementById("o-loc").value.trim() || "Addis Ababa";
  if (!phone) return alert("Enter phone number.");

  const br = cart[0].br;
  const tot = cart.reduce((s, i) => s + i.p, 0);
  const txt = cart.map(c => `${c.name} (${c.br})`).join(", ");
  const oid = Date.now().toString().slice(-4);

  S.orders.unshift({ id: oid, br, items: txt, name, phone, del, loc, st: "Pending" });
  if (!S.cust.some(c => c.phone === phone)) {
    S.cust.unshift({ id: Date.now(), name, phone, tg, cred: 50 });
  }
  cart = [];
  save();
  renderCart();

  const msg = encodeURIComponent(`🛎️ ORDER #${oid}\n📍 ${br}\n🍽️ ${txt}\n💰 ${tot} ETB\n🛵 ${del} → ${loc}\n👤 ${name} (${phone})`);
  window.open(S.disp ? `https://t.me{S.disp}?text=${msg}` : `https://t.me{encodeURIComponent(S.link)}&text=${msg}`, "_blank");
}

function renderRiders() {
  document.getElementById("r-list").innerHTML = S.orders.length ? S.orders.map(o =>
    `<div class="card" style="background:#f9fafb;margin-bottom:8px"><div class="row"><strong>#${o.id} • ${o.br}</strong><span class="badge">${o.del} • ${o.st}</span></div><div style="font-size:12px;margin:6px 0"><div>📦 ${o.items}</div><div>📍 ${o.loc}</div><div>📞 ${o.name} (${o.phone})</div></div><div class="row">${o.st === "Pending" ? `<button class="btn sm" onclick="claim('${o.id}')">✅ Claim</button>` : `<b class="pos" style="font-size:11px">✔ Claimed</b>`}<button class="btn tg sm" onclick="fwdRider('${o.id}')">✈️ Send Riders</button></div></div>`
  ).join("") : "No orders yet.";
}

function claim(id) {
  const o = S.orders.find(x => x.id === id);
  if (o) { o.st = "Claimed"; save(); renderRiders(); }
}

function fwdRider(id) {
  const o = S.orders.find(x => x.id === id);
  if (!o) return;
  const msg = encodeURIComponent(`🚨 RIDER DISPATCH #${o.id}\nPick up: ${o.br}\nDrop off: ${o.loc} (${o.del})\nCustomer: ${o.name} (${o.phone})`);
  window.open(`https://t.me{encodeURIComponent(S.link)}&text=${msg}`, "_blank");
}

function setBet(v, b) {
  bet = v;
  document.querySelectorAll("#s-game .chip").forEach(x => x.classList.remove("on"));
  b.classList.add("on");
}

function play(c) {
  if (S.pts < bet) return alert("Not enough points!");
  const r = Math.floor(Math.random() * 10) + 1;
  const win = (c === "HIGH" && r >= 6) || (c === "LOW" && r <= 5);
  S.pts += win ? bet : -bet;
  document.getElementById("g-res").innerHTML = win ? `<span class="pos">🎉 Rolled ${r}! +${bet} pts!</span>` : `<span class="neg">😅 Rolled ${r}! -${bet} pts.</span>`;
  document.getElementById("g-pts").innerText = S.pts;
  save();
}

function addPts() {
  S.pts += 50;
  document.getElementById("g-pts").innerText = S.pts;
  save();
}

function shareBot() {
  window.open(`https://t.me{encodeURIComponent(S.link)}&text=${encodeURIComponent("Order from Msana, Cava, Aser & Dolce Bakery! " + S.link)}`, "_blank");
}

function unlock() {
  if (document.getElementById("pin-in").value === S.pin) {
    document.getElementById("b-lock").classList.add("hide");
    document.getElementById("b-open").classList.remove("hide");
    document.getElementById("pin-in").value = "";
    renderBoss();
  } else {
    alert("Wrong PIN (Default: 1234)");
  }
}

function lock() {
  document.getElementById("b-open").classList.add("hide");
  document.getElementById("b-lock").classList.remove("hide");
}

function subTab(t, b) {
  ["fin", "menu", "crm", "set"].forEach(x => document.getElementById("sub-" + x).classList.add("hide"));
  document.getElementById("sub-" + t).classList.remove("hide");
  document.querySelectorAll(".tabs button").forEach(x => x.classList.remove("on"));
  b.classList.add("on");
  renderBoss();
}

function qAmt(v) {
  const e = document.getElementById("f-amt");
  e.value = (Number(e.value) || 0) + v;
}

function saveFin() {
  const a = Number(document.getElementById("f-amt").value);
  if (!a || a <= 0) return alert("Enter amount.");
  S.ledger.unshift({ id: Date.now(), br: fBr, cat: fCat, amt: a, note: document.getElementById("f-note").value.trim() || fCat });
  document.getElementById("f-amt").value = "";
  document.getElementById("f-note").value = "";
  save();
  renderBoss();
}

function renderBoss() {
  document.getElementById("f-branch").innerHTML = BRS.map(b =>
    `<button class="chip ${fBr === b ? 'on' : ''}" onclick="fBr='${b}';renderBoss()">${b}</button>`
  ).join("");
  document.getElementById("f-cat").innerHTML = CATS.map(c =>
    `<button class="chip acc ${fCat === c ? 'on' : ''}" onclick="fCat='${c}';renderBoss()">${c}</button>`
  ).join("");

  let tI = 0, tC = 0, tP = 0;
  document.getElementById("br-break").innerHTML = BRS.map(b => {
    const r = S.ledger.filter(l => l.br === b);
    const inc = r.filter(x => x.cat === "Income").reduce((s, x) => s + x.amt, 0);
    const cst = r.filter(x => x.cat !== "Income" && x.cat !== "Personal").reduce((s, x) => s + x.amt, 0);
    const prs = r.filter(x => x.cat === "Personal").reduce((s, x) => s + x.amt, 0);
    const net = inc - cst;
    tI += inc; tC += cst; tP += prs;
    return `<div class="box" style="margin-bottom:8px"><div class="row"><strong>${b}</strong><strong class="${net >= 0 ? 'pos' : 'neg'}">Net: ${net.toLocaleString()} ETB</strong></div><small>Income: ${inc.toLocaleString()} | Costs: ${cst.toLocaleString()}</small></div>`;
  }).join("");

  const biz = tI - tC, cash = biz - tP;
  document.getElementById("emp-tot").innerHTML = `
    <div class="box"><small>Total Income</small><strong class="pos">${tI.toLocaleString()} ETB</strong></div>
    <div class="box"><small>Total Costs</small><strong class="neg">${tC.toLocaleString()} ETB</strong></div>
    <div class="box"><small>Business Profit</small><strong class="${biz >= 0 ? 'pos' : 'neg'}">${biz.toLocaleString()} ETB</strong></div>
    <div class="box"><small>After Personal (${tP.toLocaleString()})</small><strong class="${cash >= 0 ? 'pos' : 'neg'}">${cash.toLocaleString()} ETB</strong></div>`;

  document.getElementById("led-list").innerHTML = S.ledger.slice(0, 12).map(l =>
