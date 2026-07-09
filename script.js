const products = [
  { name: "سمن 55 جم * 36", boxPrice: 270.48, piecePrice: 7.51, pack: 36 },
  { name: "سمن 350 جم * 12", boxPrice: 563.50, piecePrice: 46.96, pack: 12 },
  { name: "سمن 700 جم * 6", boxPrice: 534.84, piecePrice: 89.14, pack: 6 },
  { name: "سمن 1 ك صافي * 6", boxPrice: 725.94, piecePrice: 120.99, pack: 6 },
  { name: "سمن 1.5 كجم * 4", boxPrice: 695.31, piecePrice: 173.83, pack: 4 },
  { name: "سمن 2 ك صافي * 4", boxPrice: 898.17, piecePrice: 224.54, pack: 4 },
  { name: "سمن 2.5 كجم * 4", boxPrice: 1089.76, piecePrice: 272.44, pack: 4 },
  { name: "سمن 4.25 كجم * 1", boxPrice: 467.95, piecePrice: 467.95, pack: 1 },
  { name: "سمن 11 كجم * 1", boxPrice: 1188.01, piecePrice: 1188.01, pack: 1 },
  { name: "ذرة سبراي 200 ملي * 12", boxPrice: 302.82, piecePrice: 25.24, pack: 12 },
  { name: "زيت ذرة 700 مللي * 6", boxPrice: 545.86, piecePrice: 90.98, pack: 6 },
  { name: "ذرة 1 لتر * 6", boxPrice: 772.98, piecePrice: 128.83, pack: 6 },
  { name: "زيت ذرة 1.6 لتر * 6", boxPrice: 1210.55, piecePrice: 201.76, pack: 6 },
  { name: "زيت ذرة 2.2 لتر * 4", boxPrice: 1089.03, piecePrice: 272.26, pack: 4 },
  { name: "زيت ذرة 3.5 لتر * 4", boxPrice: 1707.90, piecePrice: 426.97, pack: 4 },
  { name: "عباد سبراي 200 ملي * 12", boxPrice: 281.51, piecePrice: 23.46, pack: 12 },
  { name: "زيت عباد 700 مللي * 6", boxPrice: 442.72, piecePrice: 73.79, pack: 6 },
  { name: "عباد 1 لتر * 6", boxPrice: 614.71, piecePrice: 102.45, pack: 6 },
  { name: "زيت عباد 1.6 لتر * 6", boxPrice: 991.52, piecePrice: 165.25, pack: 6 },
  { name: "زيت عباد 2.2 لتر * 4", boxPrice: 901.85, piecePrice: 225.46, pack: 4 },
  { name: "زيت عباد 5 لتر * 2", boxPrice: 1006.95, piecePrice: 503.48, pack: 2 },
  { name: "زيت عباد 10 لتر * 1", boxPrice: 1006.46, piecePrice: 1006.46, pack: 1 },
  { name: "زيت الممتاز 700 مللي * 12", boxPrice: 732.55, piecePrice: 61.05, pack: 12 },
  { name: "زيت الممتاز 1 لتر * 12", boxPrice: 958.69, piecePrice: 79.89, pack: 12 },
  { name: "زيت الممتاز 2.5 لتر * 4", boxPrice: 775.18, piecePrice: 193.80, pack: 4 },
  { name: "زيت الممتاز 4.5 لتر * 4", boxPrice: 1409.98, piecePrice: 352.49, pack: 4 }
];

let db = JSON.parse(localStorage.getItem('naguib_v16')) || { stock: {}, logs: [] };
let tempItems = [],
  currentMode = 'out',
  selectModeActive = false,
  selectedIds = new Set();

const cleanName = n => n.split('*')[0].trim();

// حالة القائمة السريعة: { productName: { qty, unit } }
const qState = {};

function getGrpClass(name) {
  if (name.includes('سمن')) return 'grp-samn';
  if (name.includes('ذرة') || name.includes('ذرة')) return 'grp-corn';
  if (name.includes('عباد')) return 'grp-sun';
  if (name.includes('الممتاز') || name.includes('ممتاز')) return 'grp-mmtaz';
  return '';
}

function renderQuickList() {
  const list = document.getElementById('quickList');
  if (!list) return;
  list.innerHTML = products.map((p, i) => {
    const stockBoxes = db.stock[p.name] || 0;
    const q = qState[p.name] || { qty: 0, unit: 'box' };
    const isActive = q.qty > 0;
    
    // حساب المتبقي
    const selectedBoxes = q.unit === 'box' ? q.qty : q.qty / p.pack;
    const remBoxes = stockBoxes - selectedBoxes;
    const isNeg = currentMode === 'out' && remBoxes < 0;
    
    // عرض المتبقي بالوحدة المختارة
    const remLabel = q.qty > 0 ?
      (q.unit === 'box' ?
        formatQty(remBoxes, p.pack) // كراتين وقطع
        :
        formatQty(remBoxes, p.pack)) // نفس الدالة تتعامل مع الكسور
      :
      formatQty(stockBoxes, p.pack); // عرض المخزون لو ما فيش اختيار
    
    return `<div class="qitem ${getGrpClass(p.name)}${isActive?' active':''}${isNeg?' neg':''}">
                <div style="flex:1;min-width:0">
                    <div class="qitem-name">${cleanName(p.name)}</div>
                    <div class="qitem-stock" style="color:${isNeg?'var(--red)':q.qty>0?'var(--green)':'var(--ink3)'}">
                        ${q.qty > 0 ? 'متبقي: ' : 'متاح: '}${remLabel}
                    </div>
                </div>
                <div class="qitem-ctrl">
                    <button class="qbtn minus" onclick="qAdj(${i},-1)">−</button>
                    <input type="number" inputmode="numeric" min="0" class="qitem-qty" value="${q.qty}"
                        onchange="qSetQty(${i}, this.value)"
                        onkeydown="if(event.key==='Enter') this.blur()"
                        onfocus="this.select()"
                        onclick="this.select()">
                    <button class="qbtn plus"  onclick="qAdj(${i},+1)">+</button>
                    <button class="qitem-unit${q.unit==='piece'?' piece':''}" onclick="qToggleUnit(${i})">${q.unit==='box'?'كرتونة':'قطعة'}</button>
                </div>
            </div>`;
  }).join('');
}

function qAdj(i, delta) {
  const p = products[i];
  if (!qState[p.name]) qState[p.name] = { qty: 0, unit: 'box' };
  qState[p.name].qty = Math.max(0, qState[p.name].qty + delta);
  renderQuickList();
}

function qSetQty(i, val) {
  const p = products[i];
  if (!qState[p.name]) qState[p.name] = { qty: 0, unit: 'box' };
  let n = parseInt(val, 10);
  if (isNaN(n) || n < 0) n = 0;
  qState[p.name].qty = n;
  renderQuickList();
}

function qToggleUnit(i) {
  const p = products[i];
  if (!qState[p.name]) qState[p.name] = { qty: 0, unit: 'box' };
  qState[p.name].unit = qState[p.name].unit === 'box' ? 'piece' : 'box';
  renderQuickList();
}

function addSelectedToTemp() {
  let added = false;
  products.forEach((p, i) => {
    const q = qState[p.name];
    if (!q || q.qty <= 0) return;
    const bq = q.unit === 'box' ? q.qty : q.qty / p.pack;
    const pr = q.unit === 'box' ? q.qty * p.boxPrice : q.qty * p.piecePrice;
    const displayQty = q.unit === 'box' ? `${q.qty} ك` : `${q.qty} ق`;
    const ex = tempItems.find(it => it.name === p.name);
    if (ex) {
      ex.boxQty += bq;
      ex.price += pr;
      const t = Math.round(ex.boxQty * p.pack);
      const b = Math.floor(t / p.pack),
        pc = t % p.pack;
      const parts = [];
      if (b > 0) parts.push(b + ' ك');
      if (pc > 0) parts.push(pc + ' ق');
      ex.displayQty = parts.join(' و ') || '0';
    } else {
      tempItems.push({ name: p.name, boxQty: bq, displayQty, price: pr, pack: p.pack });
    }
    qState[p.name].qty = 0;
    added = true;
  });
  if (added) { renderQuickList();
    renderTemp(); }
}

function formatQty(f, pack) {
  let t = Math.round(Math.abs(f) * pack),
    b = Math.floor(t / pack),
    p = t % pack;
  let r = [];
  if (b > 0) r.push(b + ' ك');
  if (p > 0) r.push(p + ' ق');
  return (f < 0 ? '-' : '') + (r.join(' و ') || '0');
}

function changeMode(m) {
  currentMode = m;
  document.getElementById('outBtn').classList.toggle('active', m === 'out');
  document.getElementById('inBtn').classList.toggle('active', m === 'in');
  document.getElementById('modeTitle').innerText = m === 'out' ? '🧾 فاتورة مبيعات' : '📥 توريد بضاعة';
  renderQuickList();
}

function renderTemp() {
  const w = document.getElementById('tempWrapper');
  if (!tempItems.length) { w.classList.add('hidden'); return; }
  w.classList.remove('hidden');
  let total = 0;
  document.getElementById('tempBody').innerHTML = tempItems.map((item, i) => {
    total += item.price;
    
    if (currentMode === 'in') {
      return `<div class="ti-row">
                    <button class="x-btn-sm" onclick="tempItems.splice(${i},1);renderTemp()">✕</button>
                    <div class="ti-row-name">${cleanName(item.name)}</div>
                    <span class="ti-row-qty">${item.displayQty}</span>
                    <span class="ti-row-price">${item.price.toFixed(2)}</span>
                </div>`;
    }
    
    const rem = (db.stock[item.name] || 0) - item.boxQty,
      isNeg = currentMode === 'out' && rem < 0;
    return `<div class="ti${isNeg?' neg':''}">
                <button class="x-btn" onclick="tempItems.splice(${i},1);renderTemp()">✕</button>
                <div class="ti-name">${item.name}</div>
                <div class="ti-boxes c3">
                    <div class="mbox qty"><span class="mbox-lbl">الكمية</span><span class="mbox-val">${item.displayQty}</span></div>
                    <div class="mbox rem${isNeg?' n':''}"><span class="mbox-lbl">المتبقي</span><span class="mbox-val">${formatQty(rem,item.pack)}</span></div>
                    <div class="mbox price"><span class="mbox-lbl">السعر</span><span class="mbox-val">${item.price.toFixed(2)}</span></div>
                </div></div>`;
  }).join('');
  document.getElementById('totalDisplay').innerText = `إجمالي ${currentMode==='out'?'الفاتورة':'التوريد'}: ${total.toLocaleString('en-US')} ج.م`;
}

function saveToDB() {
  tempItems.forEach(i => db.stock[i.name] = (db.stock[i.name] || 0) + (currentMode === 'out' ? -i.boxQty : i.boxQty));
  
  const itemsForLog = tempItems.map(i => ({
    name: i.name,
    qty: i.boxQty, // بالكرتونة (للتوافق)
    qtyPieces: Math.round(i.boxQty * i.pack), // بالقطع (للحساب الدقيق)
    label: `${cleanName(i.name)} (${i.displayQty})`
  }));
  
  // العروض الإضافية تتطبق على فواتير المبيعات (فاتورة −) فقط، مش على التوريد
  const total = currentMode === 'out' ?
    applyAdditionalOffers(itemsForLog).total :
    tempItems.reduce((s, i) => s + i.price, 0);
  
  db.logs.push({
    id: Date.now(),
    date: new Date().toLocaleString('ar-EG'),
    items: itemsForLog,
    total: total.toFixed(2),
    type: currentMode,
    isDone: false
  });
  localStorage.setItem('naguib_v16', JSON.stringify(db));
  tempItems = [];
  renderTemp();
  refreshUI();
}

function toggleDone(id) {
  const l = db.logs.find(x => x.id === id);
  if (l) { l.isDone = !l.isDone;
    localStorage.setItem('naguib_v16', JSON.stringify(db));
    refreshUI(); }
}

// ══════════════════════════════════════════════
// تشيك نهائي: احسب المخزون من الصفر من السجلات
// المخزون = كل التوريد - كل المبيعات
// وبعدين تأكد مفيش صنف سالب
// ══════════════════════════════════════════════
function recalcStock() {
  const stockPieces = {};
  products.forEach(p => { stockPieces[p.name] = 0; });
  db.logs.forEach(l => {
    l.items.forEach(it => {
      const p = products.find(p => p.name === it.name);
      if (!p) return;
      const pieces = it.qtyPieces !== undefined ? it.qtyPieces : Math.round(it.qty * p.pack);
      stockPieces[it.name] = (stockPieces[it.name] || 0) + (l.type === 'in' ? pieces : -pieces);
    });
  });
  const stock = {};
  products.forEach(p => { stock[p.name] = stockPieces[p.name] / p.pack; });
  db.stock = stock;
}

async function deleteLog(id) {
  const ok = await showConfirm('سيتم حذف العملية وإرجاع الكمية للمخزن.', '🗑 حذف العملية');
  if (!ok) return;
  const idx = db.logs.findIndex(x => x.id === id);
  if (idx > -1) {
    db.logs.splice(idx, 1);
    recalcStock();
    localStorage.setItem('naguib_v16', JSON.stringify(db));
    refreshUI();
  }
}

async function startNewDay() {
  const ok = await showConfirm('سيتم تصفير المخزن وحذف كل السجلات نهائياً.', '☀ يوم جديد');
  if (ok) {
    db = { stock: {}, logs: [] };
    localStorage.setItem('naguib_v16', JSON.stringify(db));
    refreshUI();
  }
}

// عدد أصناف فاتورة محفوظة في السجل (نفس منطق: سمن بـ2 قطعة أو أكتر = صنفين)
function countLogItems(log) {
  let n = 0;
  log.items.forEach(it => {
    const p = products.find(p => p.name === it.name);
    const qtyPieces = Math.round(it.qty * (p?.pack || 1));
    const isSamn = it.name.includes('سمن');
    if (isSamn && qtyPieces >= 2) n += 2;
    else n += 1;
  });
  return n;
}

let doneFilter = 'all';

function filterByDone(v) {
  doneFilter = v;
  filterLogs('out');
}

function filterLogs(type) {
  let f = db.logs.slice().reverse().filter(l => type === 'all' || l.type === type);
  
  // فيلتر مكتمل/غير مكتمل (فواتير المبيعات فقط)
  const doneTabsEl = document.getElementById('doneFtabs');
  if (type === 'out') {
    doneTabsEl.classList.remove('hidden');
    if (doneFilter === 'done') f = f.filter(l => l.isDone);
    if (doneFilter === 'undone') f = f.filter(l => !l.isDone);
  } else {
    doneTabsEl.classList.add('hidden');
  }
  
  // إجمالي كل الفواتير/التوريد المعروض
  const grandTotal = f.reduce((s, l) => s + parseFloat(l.total), 0);
  
  // فواتير متشابهة القيمة (الفرق بينها أقل من 50 ج) → تتحدد بإطار أحمر
  const SIMILAR_DIFF = 5;
  const similarIds = new Set();
  for (let a = 0; a < f.length; a++) {
    for (let b = a + 1; b < f.length; b++) {
      const diff = Math.abs(parseFloat(f[a].total) - parseFloat(f[b].total));
      if (diff < SIMILAR_DIFF) { similarIds.add(f[a].id);
        similarIds.add(f[b].id); }
    }
  }
  
  // ملخص علوي: عدد الفواتير + متوسط عدد الأصناف (فواتير المبيعات فقط)
  const topSummaryHTML = (type === 'out' && f.length) ?
    `<div style="background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:2px 14px;margin-bottom:12px;">
                <div class="popup-row"><span>عدد الفواتير</span><span>${f.length} فاتورة</span></div>
                <div class="popup-row"><span>متوسط عدد الأصناف بالفاتورة</span><span>${(f.reduce((s,l)=>s+countLogItems(l),0)/f.length).toFixed(1)} صنف</span></div>
                <div class="popup-row" style="border-bottom:none;"><span>إجمالي قيمة الفواتير</span><span>${grandTotal.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})} ج.م</span></div>
            </div>` :
    '';
  
  const bottomTotalHTML = type === 'out' ? '' : `<div style="margin-top:10px;padding:12px;background:var(--bar-bg);color:var(--bar-fg);border-radius:9px;text-align:center;font-weight:900;font-size:.95rem;">
            ${type==='in'?'إجمالي التوريد':'الإجمالي الكلي'}: ${grandTotal.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})} ج.م
        </div>`;
  
  document.getElementById('logContainer').innerHTML = f.length ? topSummaryHTML + f.map((l, idx) => {
      const num = f.length - idx; // ترقيم تنازلي (الأحدث = الأعلى رقماً)
      const isSel = selectedIds.has(l.id);
      const isSimilar = similarIds.has(l.id);
      const rows = l.items.map(it => {
        const qtyLabel = it.label.match(/\(([^)]+)\)/)?.[1] || '';
        if (l.type === 'in') {
          // نفس شكل صف التوريد في شاشة إضافة الفاتورة: اسم + كمية + سعر
          const p = products.find(p => p.name === it.name);
          const pieces = it.qtyPieces !== undefined ? it.qtyPieces : Math.round(it.qty * (p?.pack || 1));
          const price = pieces * (p?.piecePrice || 0);
          return `<div class="lc-row">
                        <span class="lc-row-name">${cleanName(it.name)}</span>
                        <span class="lc-row-qty">${qtyLabel}</span>
                        <span class="lc-row-price">${price.toFixed(2)}</span>
                    </div>`;
        }
        return `<div class="lc-row">
                    <span class="lc-row-name">${cleanName(it.name)}</span>
                    <span class="lc-row-qty">${qtyLabel}</span>
                </div>`;
      }).join('');
      return `<div class="lc${l.isDone?' done':''}${isSel?' sel':''}${isSimilar?' similar':''}" onclick="${selectModeActive?`toggleSelect(${l.id})`:''}">
                <div class="lc-top">
                    <div class="lc-left">
                        ${selectModeActive ? `<span class="tick">${isSel?'✅':'⬜'}</span>`
                            : `<button class="trash-btn" onclick="event.stopPropagation();deleteLog(${l.id})">🗑</button>
                               <button class="trash-btn" onclick="event.stopPropagation();openEdit(${l.id})" style="opacity:.5;font-size:.9rem;">✏️</button>
                               <button class="trash-btn" onclick="event.stopPropagation();shareInvoiceImage(${l.id})" style="opacity:.5;font-size:.95rem;">📤</button>`}
                        <span class="badge ${l.type}">${l.type==='out'?'فاتورة':'توريد'}</span>
                    </div>
                    <div class="lc-right">
                        <span style="font-size:.7rem;font-weight:900;color:var(--ink3);">#${num}</span>
                        <span class="lc-date">${l.date}</span>
                        ${l.type==='out' && !selectModeActive
                            ? `<input type="checkbox" class="done-chk" ${l.isDone?'checked':''} onclick="event.stopPropagation();toggleDone(${l.id})">`:''}
                    </div>
                </div>
                <div class="lc-rows">${rows}</div>
                <div class="lc-foot">
                    <span class="lc-foot-lbl">الإجمالي</span>
                    <span class="lc-foot-val">${parseFloat(l.total).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})} ج.م</span>
                </div>
            </div>`;
    }).join('') + bottomTotalHTML :
    `<p class="empty">لا توجد عمليات</p>`;
}

function toggleSelectMode() {
  selectModeActive = !selectModeActive;
  selectedIds.clear();
  const btn = document.getElementById('selectModeBtn');
  btn.classList.toggle('on', selectModeActive);
  btn.innerText = selectModeActive ? '✕ إلغاء' : '☑ تحديد';
  document.getElementById('deleteSelectedBtn').style.display = selectModeActive ? 'block' : 'none';
  document.getElementById('mergeSelectedBtn').style.display = selectModeActive ? 'block' : 'none';
  filterLogs(document.querySelector('input[name="f"]:checked')?.id.replace('f', '').toLowerCase() || 'out');
}

function toggleSelect(id) {
  selectedIds.has(id) ? selectedIds.delete(id) : selectedIds.add(id);
  filterLogs(document.querySelector('input[name="f"]:checked')?.id.replace('f', '').toLowerCase() || 'out');
}

async function deleteAllLogs() {
  const activeFilter = document.querySelector('input[name="f"]:checked')?.id.replace('f', '').toLowerCase() || 'out';
  const applyDoneFilter = activeFilter === 'out' && doneFilter !== 'all';
  
  let typeLabel = activeFilter === 'in' ? 'التوريد' : activeFilter === 'out' ? 'الفواتير' : 'كل العمليات';
  if (applyDoneFilter) typeLabel += doneFilter === 'done' ? ' المكتملة' : ' الغير مكتملة';
  
  const ok = await showConfirm(`سيتم حذف ${typeLabel} وإرجاع الكميات للمخزن.`, '🗑 حذف الكل');
  if (!ok) return;
  
  db.logs = db.logs.filter(l => {
    const typeMatches = activeFilter === 'all' || l.type === activeFilter;
    if (!typeMatches) return true; // نوع مختلف → يفضل
    if (applyDoneFilter) {
      const doneMatches = doneFilter === 'done' ? l.isDone : !l.isDone;
      return !doneMatches; // مطابق للنوع بس مش مطابق لحالة الإكمال المختارة → يفضل
    }
    return false; // مطابق ومفيش فيلتر إكمال مفعّل → يتحذف
  });
  recalcStock();
  localStorage.setItem('naguib_v16', JSON.stringify(db));
  refreshUI();
}

async function deleteSelected() {
  if (!selectedIds.size) return;
  const ok = await showConfirm(`سيتم حذف ${selectedIds.size} عملية وإرجاع الكميات للمخزن.`, '🗑 حذف المحدد');
  if (!ok) return;
  db.logs = db.logs.filter(l => !selectedIds.has(l.id));
  recalcStock();
  localStorage.setItem('naguib_v16', JSON.stringify(db));
  selectModeActive = false;
  selectedIds.clear();
  _resetSel();
  refreshUI();
}

function mergeSelected() {
  if (selectedIds.size < 2) { showAlert('اختار فاتورتين على الأقل للدمج.', '⚠️ تنبيه'); return; }
  const toLogs = db.logs.filter(l => selectedIds.has(l.id));
  const merged = {};
  let tot = 0;
  toLogs.forEach(l => {
    tot += parseFloat(l.total);
    l.items.forEach(it => {
      if (merged[it.name]) {
        merged[it.name].qty += it.qty;
        const p = products.find(p => p.name === it.name);
        merged[it.name].label = `${cleanName(it.name)} (${Math.round(merged[it.name].qty*(p?p.pack:1))} ق)`;
      } else merged[it.name] = { ...it };
    });
  });
  db.logs = db.logs.filter(l => !selectedIds.has(l.id));
  db.logs.push({ id: Date.now(), date: new Date().toLocaleString('ar-EG'), items: Object.values(merged), total: tot.toFixed(2), type: 'out', isDone: false });
  localStorage.setItem('naguib_v16', JSON.stringify(db));
  selectModeActive = false;
  selectedIds.clear();
  _resetSel();
  refreshUI();
}

function _resetSel() {
  const b = document.getElementById('selectModeBtn');
  b.classList.remove('on');
  b.innerText = '☑ تحديد';
  document.getElementById('deleteSelectedBtn').style.display = 'none';
  document.getElementById('mergeSelectedBtn').style.display = 'none';
}

function refreshUI() {
  renderQuickList();
  
  const inStock = products.filter(p => (db.stock[p.name] || 0) !== 0);
  document.getElementById('stockDisplay').innerHTML = inStock.length ?
    inStock.map(p => { const v = db.stock[p.name] || 0; return `
                <div class="sc${v<=0?' warn':''}">
                    <div class="sc-name">${cleanName(p.name)}</div>
                    <div class="sc-qty">${formatQty(v,p.pack)}</div>
                </div>`; }).join('') :
    '<p class="empty" style="grid-column:1/-1">المخزن فارغ</p>';
  
  // إجمالي قيمة المخزون
  const stockValue = products.reduce((sum, p) => {
    const v = db.stock[p.name] || 0;
    return sum + (v * p.boxPrice);
  }, 0);
  const stEl = document.getElementById('stockTotal');
  if (inStock.length) {
    stEl.style.display = 'block';
    stEl.innerText = `إجمالي قيمة المخزون: ${stockValue.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})} ج.م`;
  } else {
    stEl.style.display = 'none';
  }
  
  filterLogs(document.querySelector('input[name="f"]:checked')?.id.replace('f', '').toLowerCase() || 'out');
}

function updateIpiPlaceholder() {
  const ic = parseInt(document.getElementById('invoiceCount').value) || 0;
  const el = document.getElementById('invoiceItemCount');
  el.placeholder = ic ? `تلقائي · ${ic} فاتورة` : 'تلقائي';
}

// ══════════════════════════════════════════════
// عدد الأصناف الفعلي في الفاتورة (نفس منطق ملخص البوب أب:
// سمن بكمية 2 قطعة أو أكتر = صنفين، وأي صنف تاني = صنف واحد)
// ══════════════════════════════════════════════
function countItems(inv) {
  let n = 0;
  Object.entries(inv.items).forEach(([name, qty]) => {
    if (qty <= 0) return;
    if (name.includes('سمن') && qty >= 2) n += 2;
    else n += 1;
  });
  return n;
}

// ══════════════════════════════════════════════
// تشيك نهائي: تأكد إن مفيش فاتورتين قيمتهم
// متقاربة (فرق أقل من 50 جنيه)
// الحل: انقل قطع بين الفواتير لكسر التشابه
// ipi: أقل عدد أصناف مطلوب في أي فاتورة (لازم يفضل محترم حتى لو اتنقلت أصناف)
// ══════════════════════════════════════════════
function fixSimilarTotals(invs, ic, non55, s55, ipi) {
  const MIN_DIFF = 25;
  
  for (let pass = 0; pass < 200; pass++) {
    let changed = false;
    
    for (let a = 0; a < ic; a++) {
      for (let b = a + 1; b < ic; b++) {
        const diff = Math.abs(invs[a].total - invs[b].total);
        if (diff >= MIN_DIFF) continue;
        
        const hi = invs[a].total >= invs[b].total ? a : b;
        const lo = hi === a ? b : a;
        
        let fixed = false;
        
        // الأصناف المشتركة بين الفاتورتين (عندهم كميات تقدر تلعب فيها)
        // رتب: الأصناف الوفيرة (زي ممتاز لتر) أول، وبعدين الأكتر كمية،
        // عشان النقل يبقى من صنف عدده كبير مش صنف نادر
        const shared = Object.keys(invs[hi].items)
          .filter(name => {
            if (s55 && name === s55.name) return false; // متلعبش في الظرف 55
            if (invMaxedOut(invs[lo], name)) return false; // lo وصلت للحد الأقصى (1 ق)
            // لو سمن وعنده 2 قطعة بس → متلعبش (ممكن يخصم صنف)
            const p = products.find(p => p.name === name);
            if (!p) return false;
            const qtyHi = invs[hi].items[name] || 0;
            if (name.includes('سمن') && Math.round(qtyHi * p.pack) <= 2) return false;
            return qtyHi > 0;
          })
          .sort((x, y) => {
            const rx = isRestrictedOne(x) ? 1 : 0,
              ry = isRestrictedOne(y) ? 1 : 0;
            if (rx !== ry) return rx - ry; // الغير مقيد (وفير) أولاً
            return (invs[hi].items[y] || 0) - (invs[hi].items[x] || 0); // الأكتر كمية أولاً
          });
        
        for (const name of shared) {
          if (fixed) break;
          const p = products.find(p => p.name === name);
          if (!p) continue;
          const maxMove = invs[hi].items[name];
          
          // جرب نقل 1، 2، 3... قطعة من hi → lo
          for (let pcs = 1; pcs <= maxMove; pcs++) {
            const newHi = parseFloat((invs[hi].total - pcs * p.piecePrice).toFixed(2));
            const newLo = parseFloat((invs[lo].total + pcs * p.piecePrice).toFixed(2));
            
            // تأكد إن السمن مش هيوصل لأقل من 2 قطعة
            if (name.includes('سمن')) {
              const remPcs = Math.round((invs[hi].items[name] - pcs) * p.pack);
              if (remPcs > 0 && remPcs < 2) continue;
            }
            
            if (Math.abs(newHi - newLo) >= MIN_DIFF && newHi > 0) {
              // منع نقص عدد أصناف hi عن الحد الأدنى (ipi) لو النقل هيشيل الصنف بالكامل
              const willFullyRemove = (invs[hi].items[name] - pcs) <= 0;
              if (willFullyRemove && ipi) {
                const weight = (name.includes('سمن') && invs[hi].items[name] >= 2) ? 2 : 1;
                if (countItems(invs[hi]) - weight < ipi) continue;
              }
              invs[hi].items[name] -= pcs;
              invs[hi].total = newHi;
              if (invs[hi].items[name] <= 0) delete invs[hi].items[name];
              invs[lo].items[name] = (invs[lo].items[name] || 0) + pcs;
              invs[lo].total = newLo;
              changed = true;
              fixed = true;
              break;
            }
          }
        }
        
        // لو الأصناف المشتركة مش كافية، جرب صنف موجود في hi بس
        if (!fixed) {
          const hiOnly = Object.keys(invs[hi].items)
            .filter(name => {
              if (s55 && name === s55.name) return false;
              const p = products.find(p => p.name === name);
              if (!p) return false;
              const qtyHi = invs[hi].items[name] || 0;
              if (name.includes('سمن') && Math.round(qtyHi * p.pack) <= 2) return false;
              return qtyHi > 0 && !invs[lo].items[name];
            })
            .sort((x, y) => {
              const rx = isRestrictedOne(x) ? 1 : 0,
                ry = isRestrictedOne(y) ? 1 : 0;
              if (rx !== ry) return rx - ry; // الغير مقيد (وفير) أولاً
              return (invs[hi].items[y] || 0) - (invs[hi].items[x] || 0); // الأكتر كمية أولاً
            });
          
          for (const name of hiOnly) {
            if (fixed) break;
            const p = products.find(p => p.name === name);
            if (!p) continue;
            const maxMove = invs[hi].items[name];
            
            for (let pcs = 1; pcs <= maxMove; pcs++) {
              const newHi = parseFloat((invs[hi].total - pcs * p.piecePrice).toFixed(2));
              const newLo = parseFloat((invs[lo].total + pcs * p.piecePrice).toFixed(2));
              if (Math.abs(newHi - newLo) >= MIN_DIFF && newHi > 0) {
                const willFullyRemove = (invs[hi].items[name] - pcs) <= 0;
                if (willFullyRemove && ipi) {
                  const weight = (name.includes('سمن') && invs[hi].items[name] >= 2) ? 2 : 1;
                  if (countItems(invs[hi]) - weight < ipi) continue;
                }
                invs[hi].items[name] -= pcs;
                invs[hi].total = newHi;
                if (invs[hi].items[name] <= 0) delete invs[hi].items[name];
                invs[lo].items[name] = (invs[lo].items[name] || 0) + pcs;
                invs[lo].total = newLo;
                changed = true;
                fixed = true;
                break;
              }
            }
          }
        }
        
        // ── الحل الأخير: لو hi و lo عندهم بالظبط نفس الأصناف
        // (زي لما كل الأصناف مقيدة بقطعة واحدة وموجودة في الاتنين)
        // مفيش نقل ممكن بينهم خالص. هنا نسحب صنف من فاتورة تالتة
        // (مش موجود عند lo) عشان نكسر التطابق ──
        if (!fixed) {
          borrowLoop: for (let k = 0; k < ic; k++) {
            if (k === hi || k === lo) continue;
            const candidates = Object.keys(invs[k].items)
              .filter(name => {
                if (s55 && name === s55.name) return false;
                if (invMaxedOut(invs[lo], name)) return false;
                const p = products.find(p => p.name === name);
                if (!p) return false;
                const qty = invs[k].items[name] || 0;
                if (name.includes('سمن') && Math.round(qty * p.pack) <= 2) return false;
                return qty > 0;
              })
              .sort((x, y) => {
                const rx = isRestrictedOne(x) ? 1 : 0,
                  ry = isRestrictedOne(y) ? 1 : 0;
                if (rx !== ry) return rx - ry;
                return (invs[k].items[y] || 0) - (invs[k].items[x] || 0);
              });
            
            for (const name of candidates) {
              const p = products.find(p => p.name === name);
              if (!p) continue;
              const willFullyRemove = invs[k].items[name] === 1;
              if (willFullyRemove && ipi) {
                const weight = (name.includes('سمن') && invs[k].items[name] >= 2) ? 2 : 1;
                if (countItems(invs[k]) - weight < ipi) continue;
              }
              const newLo = parseFloat((invs[lo].total + p.piecePrice).toFixed(2));
              if (Math.abs(invs[hi].total - newLo) >= MIN_DIFF) {
                invs[k].items[name]--;
                invs[k].total = parseFloat((invs[k].total - p.piecePrice).toFixed(2));
                if (invs[k].items[name] <= 0) delete invs[k].items[name];
                invs[lo].items[name] = (invs[lo].items[name] || 0) + 1;
                invs[lo].total = newLo;
                changed = true;
                fixed = true;
                break borrowLoop;
              }
            }
          }
        }
      }
    }
    if (!changed) break;
  }
}

// ── تعديل الفاتورة ──
let editLogId = null;
let editItems = []; // { name, qtyPieces }

function openEdit(id) {
  const l = db.logs.find(x => x.id === id);
  if (!l) return;
  editLogId = id;
  
  // حوّل الأصناف لقطع
  editItems = l.items.map(it => {
    const p = products.find(p => p.name === it.name);
    const pcs = it.qtyPieces !== undefined ? it.qtyPieces : Math.round(it.qty * (p?.pack || 1));
    return { name: it.name, qtyPieces: pcs };
  });
  
  document.getElementById('editTitle').innerText = l.type === 'out' ? '✏️ تعديل الفاتورة' : '✏️ تعديل التوريد';
  renderEditBody(l.type);
  document.getElementById('editOverlay').classList.add('show');
}

function renderEditBody(type) {
  const rows = editItems.map((it, i) => {
    const p = products.find(p => p.name === it.name);
    if (!p) return '';
    const unit = it.unit || 'piece';
    const qty = unit === 'box' ?
      +(it.qtyPieces / p.pack).toFixed(2) :
      it.qtyPieces;
    const unitLabel = unit === 'box' ? 'ك' : 'ق';
    return `<div class="edit-row">
                <div class="edit-row-name">${cleanName(it.name)}</div>
                <div class="edit-row-ctrl">
                    <button class="qbtn minus" onclick="editAdj(${i},-1)">−</button>
                    <input type="number" inputmode="decimal" min="0" step="any" class="edit-qty" value="${qty}"
                        onchange="editSetQty(${i}, this.value)"
                        onkeydown="if(event.key==='Enter') this.blur()"
                        onfocus="this.select()"
                        onclick="this.select()">
                    <button class="qitem-unit${unit==='box'?'':' piece'}" onclick="editToggleUnit(${i})">${unitLabel}</button>
                    <button class="qbtn plus" onclick="editAdj(${i},+1)">+</button>
                    <button class="x-btn" style="position:static;width:26px;height:26px;flex-shrink:0;" onclick="editRemove(${i})">✕</button>
                </div>
            </div>`;
  }).join('');
  
  const existing = editItems.map(x => x.name);
  const opts = products
    .filter(p => !existing.includes(p.name))
    .map(p => `<option value="${products.indexOf(p)}">${cleanName(p.name)}</option>`)
    .join('');
  
  document.getElementById('editBody').innerHTML = `
            <div>${rows}</div>
            <div class="edit-add-row">
                <div style="font-size:.78rem;font-weight:800;color:var(--ink3);margin-bottom:6px;">إضافة صنف جديد</div>
                <select id="editNewItem" style="margin-bottom:8px;">
                    <option value="">— اختر صنف —</option>
                    ${opts}
                </select>
                <button class="qadd-btn" style="padding:9px;" onclick="editAddNew()">+ إضافة</button>
            </div>`;
}

function editToggleUnit(i) {
  const cur = editItems[i].unit || 'piece';
  editItems[i].unit = cur === 'piece' ? 'box' : 'piece';
  const l = db.logs.find(x => x.id === editLogId);
  renderEditBody(l?.type);
}

function editAdj(i, delta) {
  const p = products.find(p => p.name === editItems[i].name);
  if (!p) return;
  const step = (editItems[i].unit || 'piece') === 'box' ? p.pack : 1;
  editItems[i].qtyPieces = Math.max(0, editItems[i].qtyPieces + delta * step);
  const l = db.logs.find(x => x.id === editLogId);
  renderEditBody(l?.type);
}

function editSetQty(i, val) {
  const p = products.find(p => p.name === editItems[i].name);
  if (!p) return;
  let n = parseFloat(val);
  if (isNaN(n) || n < 0) n = 0;
  const unit = editItems[i].unit || 'piece';
  editItems[i].qtyPieces = unit === 'box' ? Math.round(n * p.pack) : Math.round(n);
  const l = db.logs.find(x => x.id === editLogId);
  renderEditBody(l?.type);
}

function editRemove(i) {
  editItems.splice(i, 1);
  const l = db.logs.find(x => x.id === editLogId);
  renderEditBody(l?.type);
}

function editAddNew() {
  const sel = document.getElementById('editNewItem');
  if (!sel.value) return;
  const p = products[parseInt(sel.value)];
  editItems.push({ name: p.name, qtyPieces: 1 });
  const l = db.logs.find(x => x.id === editLogId);
  renderEditBody(l?.type);
}

function saveEdit() {
  const l = db.logs.find(x => x.id === editLogId);
  if (!l) return;
  
  l.items = editItems
    .filter(it => it.qtyPieces > 0)
    .map(it => {
      const p = products.find(p => p.name === it.name);
      return {
        name: it.name,
        qty: it.qtyPieces / (p?.pack || 1),
        qtyPieces: it.qtyPieces,
        label: `${cleanName(it.name)} (${it.qtyPieces} ق)`
      };
    });
  
  l.total = l.items.reduce((sum, it) => {
    const p = products.find(p => p.name === it.name);
    return sum + (it.qtyPieces * (p?.piecePrice || 0));
  }, 0).toFixed(2);
  
  recalcStock();
  localStorage.setItem('naguib_v16', JSON.stringify(db));
  closeEditPopup();
  refreshUI();
}

function closeEditPopup(e) {
  if (e && e.target !== document.getElementById('editOverlay')) return;
  document.getElementById('editOverlay').classList.remove('show');
  editLogId = null;
  editItems = [];
}

// ── Custom Dialogs ──
let confirmResolve = null;

function showConfirm(msg, title = 'تأكيد') {
  return new Promise(resolve => {
    confirmResolve = resolve;
    document.getElementById('confirmTitle').innerText = title;
    document.getElementById('confirmMsg').innerText = msg;
    document.getElementById('confirmOverlay').classList.add('show');
  });
}

function showAlert(msg, title = 'تنبيه') {
  document.getElementById('alertTitle').innerText = title;
  document.getElementById('alertMsg').innerText = msg;
  document.getElementById('alertOverlay').classList.add('show');
}
// override confirmResolve to also close overlay
const _origConfirmResolve = v => {
  document.getElementById('confirmOverlay').classList.remove('show');
  if (confirmResolve) confirmResolve(v);
};
document.getElementById('confirmOverlay')
  .querySelector('.popup-btn-cancel').onclick = () => _origConfirmResolve(false);
document.getElementById('confirmOverlay')
  .querySelector('.popup-btn-confirm').onclick = () => _origConfirmResolve(true);

function calculateItemWeight(n, q) { return n.includes('سمن') ? (q >= 2 ? 2 : 1) : 1; }

// ══════════════════════════════════════════════════════════
// 🎯 دالة "العروض الإضافية" — كل الأرقام والشروط هنا في مكان واحد
// عشان يبقى سهل تعديلها كل ما العروض تتغير.
// بتاخد تركيبة الفاتورة النهائية (بعد التوزيع أو بعد الإضافة اليدوية)
// وترجع الإجمالي الصح بعد كل الخصومات المستحقة.
//
// items المتوقعة: [{ name, qtyPieces }, ...] (قطع كل صنف في الفاتورة)
// ══════════════════════════════════════════════════════════
function applyAdditionalOffers(items) {
  
  // ── إعدادات العرض 1: الصفيح (سمن 11ك + 4.25ك) ──
  const SHEET_11K = "سمن 11 كجم * 1";
  const SHEET_425K = "سمن 4.25 كجم * 1";
  // السعر بعد الخصم الأساسي على الصفيح (قبل خصم الـ3 قطع الإضافي)
  const SHEET_DISCOUNTED_PRICE = {
    [SHEET_11K]: 1139.60,
    [SHEET_425K]: 448.85
  };
  const SHEET_BONUS_MIN_PIECES = 3; // لو 3 قطع أو أكتر من الصفيح (مجتمعين أو منفصلين)
  const SHEET_BONUS_PERCENT = 0.75; // خصم إضافي فوق السعر المخصوم فوق
  
  // ── إعدادات العرض 2: خصم 1% على أصناف سمن معينة ──
  const SAMN_OFFER2_NAMES = [
    "سمن 700 جم * 6", "سمن 1 ك صافي * 6", "سمن 1.5 كجم * 4",
    "سمن 2 ك صافي * 4", "سمن 2.5 كجم * 4"
  ]; // عدا: 55جم، 350جم، 11ك، 4.25ك (دول مستثنيين تماماً من هذا العرض)
  const SAMN_15K = "سمن 1.5 كجم * 4";
  const SAMN_OFFER2_MIN_BOXES = 3; // 3 كراتين سمن (من القائمة فوق) على الأقل
  const SAMN_OFFER2_PERCENT = 1;
  
  // ── إعدادات العرض 3: خصم 1% على كل الزيوت ──
  const OIL_MIN_CORN_BOXES = 1; // كرتونة ذرة (أي صنف) على الأقل
  const OIL_MIN_SUN_BOXES = 1; // كرتونة عباد (أي صنف) على الأقل
  const OIL_MIN_MOMTAZ_BOXES = 2; // كرتونتين ممتاز (أي وزن) على الأقل
  const OIL_OFFER3_PERCENT = 1;
  
  // ── أدوات مساعدة ──
  const getPieces = name => items.find(it => it.name === name)?.qtyPieces || 0;
  const pack = name => products.find(p => p.name === name)?.pack || 1;
  const boxesOf = names => names.reduce((s, n) => s + (getPieces(n) / pack(n)), 0);
  
  const cornNames = products.filter(p => p.name.includes('ذرة')).map(p => p.name);
  const sunNames = products.filter(p => p.name.includes('عباد')).map(p => p.name);
  const momtazNames = products.filter(p => p.name.includes('الممتاز')).map(p => p.name);
  
  // ── تحقق الشروط ──
  const sheetPieces = getPieces(SHEET_11K) + getPieces(SHEET_425K);
  const sheetBonusApplies = sheetPieces >= SHEET_BONUS_MIN_PIECES;
  
  const samnBoxesTotal = boxesOf(SAMN_OFFER2_NAMES);
  const has15kBox = (getPieces(SAMN_15K) / pack(SAMN_15K)) >= 1;
  const samnOfferApplies = samnBoxesTotal >= SAMN_OFFER2_MIN_BOXES && has15kBox;
  
  const oilOfferApplies = boxesOf(cornNames) >= OIL_MIN_CORN_BOXES &&
    boxesOf(sunNames) >= OIL_MIN_SUN_BOXES &&
    boxesOf(momtazNames) >= OIL_MIN_MOMTAZ_BOXES;
  
  // ── احسب السعر النهائي لكل صنف ──
  let total = 0;
  const breakdown = [];
  
  items.forEach(it => {
    const p = products.find(p => p.name === it.name);
    if (!p || !it.qtyPieces) return;
    let unitPrice = p.piecePrice;
    let note = '';
    
    if (it.name === SHEET_11K || it.name === SHEET_425K) {
      unitPrice = SHEET_DISCOUNTED_PRICE[it.name];
      if (sheetBonusApplies) {
        unitPrice = unitPrice * (1 - SHEET_BONUS_PERCENT / 100);
        note = 'عرض الصفيح + خصم 3 قطع';
      } else {
        note = 'عرض الصفيح';
      }
    } else if (SAMN_OFFER2_NAMES.includes(it.name) && samnOfferApplies) {
      unitPrice = unitPrice * (1 - SAMN_OFFER2_PERCENT / 100);
      note = 'سمن إضافي 1%';
    } else if ((cornNames.includes(it.name) || sunNames.includes(it.name) || momtazNames.includes(it.name)) && oilOfferApplies) {
      unitPrice = unitPrice * (1 - OIL_OFFER3_PERCENT / 100);
      note = 'زيوت إضافي 1%';
    }
    
    const lineTotal = unitPrice * it.qtyPieces;
    total += lineTotal;
    breakdown.push({ name: it.name, unitPrice: parseFloat(unitPrice.toFixed(2)), lineTotal: parseFloat(lineTotal.toFixed(2)), note });
  });
  
  return { total: parseFloat(total.toFixed(2)), breakdown };
}

// ══════════════════════════════════════════════════════════
// 🖼️ بناء صورة الفاتورة (canvas) — مستخدمة في المشاركة والطباعة
// فواتير المبيعات: الصنف | الكمية | السعر قبل الخصم | الخصم | القيمة + تفصيل العروض تحت
// فواتير التوريد: الصنف | الكمية | سعر القائمة | الخصم | الصافي (من غير عروض إضافية)
// ══════════════════════════════════════════════════════════
async function buildInvoiceCanvas(log, targetWidth) {
  let columns, rows, detailLines = [],
    grandTotal;
  
  if (log.type === 'out') {
    columns = [
      { key: 'name', label: 'الصنف', nameCol: true },
      { key: 'qty', label: 'الكمية', isText: true },
      { key: 'listDisplay', label: 'السعر قبل الخصم' },
      { key: 'discount', label: 'الخصم', isDiscount: true },
      { key: 'value', label: 'القيمة', isNet: true }
    ];
    
    const itemsForOffers = log.items.map(it => {
      const p = products.find(p => p.name === it.name);
      const pieces = it.qtyPieces !== undefined ? it.qtyPieces : Math.round(it.qty * (p?.pack || 1));
      const qtyLabel = it.label.match(/\(([^)]+)\)/)?.[1] || `${pieces} ق`;
      return { name: it.name, qtyPieces: pieces, qtyLabel };
    });
    const offersResult = applyAdditionalOffers(itemsForOffers);
    rows = itemsForOffers.map(it => {
      const p = products.find(p => p.name === it.name);
      // إجمالي "قبل الخصم" (للحسابات والملخص) = سعر القائمة الخام × الكمية
      const listPricePerPiece = (p?.piecePrice || 0) / 0.98;
      const before = it.qtyPieces * listPricePerPiece;
      // "السعر قبل الخصم" المعروض بالعمود = سعر الكرتونة الواحدة من القائمة (بدون ضرب في الكمية)
      const listDisplay = (p?.boxPrice || 0) / 0.98;
      const afterItem = offersResult.breakdown.find(b => b.name === it.name);
      const value = afterItem ? afterItem.lineTotal : (it.qtyPieces * (p?.piecePrice || 0));
      return {
        name: cleanName(it.name),
        qty: it.qtyLabel,
        before,
        listDisplay,
        discount: before - value,
        value,
        note: afterItem ? afterItem.note : ''
      };
    });
    grandTotal = rows.reduce((s, r) => s + r.value, 0);
    
    // ── تفاصيل الخصومات بالتفصيل (2% + كل عرض إضافي اتفعّل) ──
    let totalBefore = 0,
      total2pct = 0;
    const offerTotals = {};
    rows.forEach(r => {
      totalBefore += r.before;
      const base2pct = r.before * 0.02;
      total2pct += base2pct;
      const extra = r.discount - base2pct;
      if (extra > 0.005 && r.note) offerTotals[r.note] = (offerTotals[r.note] || 0) + extra;
    });
    const totalDiscounts = totalBefore - grandTotal;
    
    detailLines.push({ label: 'إجمالي قبل الخصم', value: totalBefore, kind: 'plain' });
    detailLines.push({ label: 'خصم 2%', value: total2pct, kind: 'discount' });
    Object.entries(offerTotals).forEach(([note, amt]) => {
      detailLines.push({ label: `خصم ${note}`, value: amt, kind: 'discount' });
    });
    detailLines.push({ label: 'إجمالي الخصومات', value: totalDiscounts, kind: 'discount-bold' });
    
  } else {
    // ── توريد: من غير أي عروض إضافية، خصم الـ2% بس ──
    columns = [
      { key: 'name', label: 'الصنف', nameCol: true },
      { key: 'qty', label: 'الكمية', isText: true },
      { key: 'listDisplay', label: 'سعر القائمة' },
      { key: 'discount', label: 'الخصم', isDiscount: true },
      { key: 'net', label: 'الصافي', isNet: true }
    ];
    
    rows = log.items.map(it => {
      const p = products.find(p => p.name === it.name);
      const pieces = it.qtyPieces !== undefined ? it.qtyPieces : Math.round(it.qty * (p?.pack || 1));
      const net = pieces * (p?.piecePrice || 0);
      const list = net / 0.98; // إجمالي سعر القائمة (للحسابات والملخص)
      const listDisplay = (p?.boxPrice || 0) / 0.98; // سعر الكرتونة الواحدة من القائمة (بدون ضرب في الكمية)
      const qtyLabel = it.label.match(/\(([^)]+)\)/)?.[1] || `${pieces} ق`;
      return { name: cleanName(it.name), qty: qtyLabel, list, listDisplay, discount: list - net, net };
    });
    grandTotal = rows.reduce((s, r) => s + r.net, 0);
    
    const totalList = rows.reduce((s, r) => s + r.list, 0);
    const totalDiscounts = totalList - grandTotal;
    detailLines.push({ label: 'إجمالي قبل الخصم', value: totalList, kind: 'plain' });
    detailLines.push({ label: 'الخصومات', value: totalDiscounts, kind: 'discount' });
  }
  
  // ── تأكد إن الخط اتحمل قبل الرسم ──
  try {
    await document.fonts.load("700 24px Tajawal");
    await document.fonts.load("700 14px Tajawal");
    await document.fonts.load("600 14px Tajawal");
    await document.fonts.load("500 14px Tajawal");
    await document.fonts.ready;
  } catch (e) {}
  
  // ── أبعاد الصورة ──
  const width = targetWidth;
  const headerH = 90,
    tableHeadH = 42,
    rowH = 46,
    detailLineH = 36,
    footerH = 64;
  const height = headerH + tableHeadH + rows.length * rowH + detailLines.length * detailLineH + footerH;
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.direction = 'rtl';
  
  // ── أعمدة موزّعة على العرض بالكامل (من غير مسافة فاضية على الشمال) ──
  const margin = 24;
  const rightMargin = width - margin;
  const nameColWidth = columns.length > 4 ? 220 : 280; // مساحة أقل للاسم لو الأعمدة أكتر (توريد)
  const numericCols = columns.slice(1);
  const colW = (width - 2 * margin - nameColWidth) / numericCols.length;
  const colX = {};
  numericCols.forEach((col, idx) => { colX[col.key] = rightMargin - nameColWidth - colW * idx - colW / 2; });
  
  // خلفية
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  
  // هيدر
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(0, 0, width, headerH);
  ctx.fillStyle = '#6EE7B7';
  ctx.font = "700 24px Tajawal";
  ctx.textAlign = 'right';
  ctx.fillText('كريستال', rightMargin, 38);
  ctx.fillStyle = '#fff';
  ctx.font = "600 15px Tajawal";
  ctx.fillText(log.type === 'out' ? 'فاتورة مبيعات' : 'فاتورة توريد', rightMargin, 64);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#aaa';
  ctx.font = "500 13px Tajawal";
  ctx.fillText(log.date, margin, 64);
  
  // رأس الجدول
  let y = headerH;
  ctx.fillStyle = '#F0F0EB';
  ctx.fillRect(0, y, width, tableHeadH);
  ctx.fillStyle = '#555555';
  ctx.font = "700 14px Tajawal";
  ctx.textAlign = 'right';
  ctx.fillText(columns[0].label, rightMargin, y + 27);
  ctx.textAlign = 'center';
  numericCols.forEach(col => ctx.fillText(col.label, colX[col.key], y + 27));
  
  // صفوف الأصناف
  rows.forEach((r, i) => {
    const ry = headerH + tableHeadH + i * rowH;
    if (i % 2 === 1) { ctx.fillStyle = '#FAFAF8';
      ctx.fillRect(0, ry, width, rowH); }
    
    const midY = ry + rowH / 2 + 5;
    ctx.fillStyle = '#1A1A1A';
    ctx.font = "600 14px Tajawal";
    ctx.textAlign = 'right';
    ctx.fillText(r[columns[0].key], rightMargin, midY);
    
    numericCols.forEach(col => {
      ctx.textAlign = 'center';
      if (col.isText) {
        ctx.fillStyle = '#1A1A1A';
        ctx.font = "600 14px Tajawal";
        ctx.fillText(r[col.key], colX[col.key], midY);
      } else if (col.isDiscount) {
        const v = r[col.key];
        ctx.fillStyle = v > 0.004 ? '#C0392B' : '#999999';
        ctx.font = "500 14px Tajawal";
        ctx.fillText(v > 0.004 ? '-' + v.toFixed(2) : '0.00', colX[col.key], midY);
      } else if (col.isNet) {
        ctx.fillStyle = '#2D6A4F';
        ctx.font = "700 14px Tajawal";
        ctx.fillText(r[col.key].toFixed(2), colX[col.key], midY);
      } else {
        ctx.fillStyle = '#555555';
        ctx.font = "500 14px Tajawal";
        ctx.fillText(r[col.key].toFixed(2), colX[col.key], midY);
      }
    });
    
    ctx.strokeStyle = '#E8E8E3';
    ctx.beginPath();
    ctx.moveTo(0, ry + rowH);
    ctx.lineTo(width, ry + rowH);
    ctx.stroke();
  });
  
  // ── تفاصيل الخصومات ──
  let detailY = headerH + tableHeadH + rows.length * rowH;
  detailLines.forEach((d, i) => {
    ctx.fillStyle = i % 2 === 1 ? '#FAFAF8' : '#FFFFFF';
    ctx.fillRect(0, detailY, width, detailLineH);
    
    const midY = detailY + detailLineH / 2 + 5;
    const isBold = d.kind === 'discount-bold';
    ctx.font = (isBold ? "700 " : "600 ") + "14px Tajawal";
    ctx.fillStyle = d.kind === 'plain' ? '#1A1A1A' : '#C0392B';
    ctx.textAlign = 'right';
    ctx.fillText(d.label, rightMargin, midY);
    
    ctx.textAlign = 'left';
    const sign = d.kind === 'plain' ? '' : '-';
    ctx.fillText(`${sign}${d.value.toFixed(2)}`, margin, midY);
    
    ctx.strokeStyle = '#E8E8E3';
    ctx.beginPath();
    ctx.moveTo(0, detailY + detailLineH);
    ctx.lineTo(width, detailY + detailLineH);
    ctx.stroke();
    
    detailY += detailLineH;
  });
  
  // الإجمالي بعد الخصم
  const footerY = detailY;
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(0, footerY, width, footerH);
  ctx.fillStyle = '#fff';
  ctx.font = "700 19px Tajawal";
  ctx.textAlign = 'center';
  ctx.fillText(
    `الإجمالي بعد الخصم: ${grandTotal.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})} ج.م`,
    width / 2, footerY + footerH / 2 + 7
  );
  
  return canvas;
}

// ══════════════════════════════════════════════════════════
// 📤 مشاركة الفاتورة كصورة (أو تنزيلها لو المشاركة مش مدعومة)
// ══════════════════════════════════════════════════════════
async function shareInvoiceImage(logId) {
  const log = db.logs.find(x => x.id === logId);
  if (!log) return;
  const canvas = await buildInvoiceCanvas(log, 720);
  
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const file = new File([blob], `فاتورة-${logId}.png`, { type: 'image/png' });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'فاتورة', text: 'فاتورة من كريستال' });
        return;
      } catch (e) { /* المستخدم لغى المشاركة أو فشلت، هنزّلها بدلاً منها */ }
    }
    const link = document.createElement('a');
    link.download = `فاتورة-${logId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, 'image/png');
}

// ══════════════════════════════════════════════
// قيد إضافي: عباد + ذرة + الممتاز (عدا 1 لتر فقط)
// الحد الأقصى لأي فاتورة من هذه الأصناف = 1 قطعة فقط
// (السمن مستثنى تماماً، وباقي الأصناف توزع عادي)
// ══════════════════════════════════════════════
const restrictedOneName = new Set(
  products
  .filter(p =>
    p.name.includes('عباد') ||
    p.name.includes('ذرة') ||
    (p.name.includes('الممتاز') && !p.name.includes('1 لتر'))
  )
  .map(p => p.name)
);

function isRestrictedOne(name) { return restrictedOneName.has(name); }

// ── Fisher-Yates Shuffle حقيقي: بيرجع نسخة جديدة متبعترة عشوائياً ──
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── نسبة التشابه بين فاتورتين (Jaccard): أصناف مشتركة ÷ كل الأصناف المختلفة ──
function jaccardSimilarity(invA, invB) {
  const namesA = new Set(Object.keys(invA.items).filter(n => invA.items[n] > 0));
  const namesB = new Set(Object.keys(invB.items).filter(n => invB.items[n] > 0));
  const union = new Set([...namesA, ...namesB]);
  if (union.size === 0) return 0;
  let shared = 0;
  namesA.forEach(n => { if (namesB.has(n)) shared++; });
  return shared / union.size;
}

// ── بصمة الفاتورة: تمثيل نصي ثابت (بدون اعتماد على ترتيب الأصناف) ──
// بيتكوّن من اسم كل صنف + كميته، مرتبين أبجدياً، عشان فاتورتين
// بنفس المحتوى (حتى لو الترتيب مختلف) يطلعلهم نفس البصمة بالظبط.
function buildInvoiceSignature(invoice) {
  return Object.keys(invoice.items)
    .filter(name => invoice.items[name] > 0)
    .sort()
    .map(name => `${name}=${invoice.items[name]}`)
    .join('|');
}

// ── نسبة التشابه بين فاتورتين من 0 لـ100 (100 = متطابقتين تماماً) ──
// بتقارن كمية كل صنف في الفاتورتين (بدون الاعتماد على total)
function calculateSimilarity(invA, invB) {
  const allNames = new Set([...Object.keys(invA.items), ...Object.keys(invB.items)]);
  let diffSum = 0,
    maxSum = 0;
  allNames.forEach(name => {
    const qa = invA.items[name] || 0,
      qb = invB.items[name] || 0;
    if (qa === 0 && qb === 0) return;
    diffSum += Math.abs(qa - qb);
    maxSum += Math.max(qa, qb);
  });
  if (maxSum === 0) return 100;
  return Math.max(0, Math.min(100, (1 - diffSum / maxSum) * 100));
}

function invMaxedOut(inv, name) { return isRestrictedOne(name) && (inv.items[name] || 0) >= 1; }

// ══════════════════════════════════════════════════════════
// 🛡️ إصلاح نهائي: يضمن عدم وجود فاتورتين ببصمة متطابقة
// الأولوية: 1) Swap صنف بصنف بين الفاتورتين
//           2) نقل قطعة من فاتورة تالتة
//           3) استبدال صنف بصنف تاني من المخزون المتبقي
// بيحترم كل القيود الحالية (restrictedOne، حد أدنى السمن 2 قطعة،
// الحد الأدنى لعدد الأصناف، فرق القيم المطلوب)
// ══════════════════════════════════════════════════════════
function eliminateDuplicateInvoices(invs, ic, non55, s55, ipi, stock) {
  const MIN_DIFF = 25;
  const canTouch = name => !s55 || name !== s55.name;
  const samnFloorOk = (inv, name) => !name.includes('سمن') || inv.items[name] > 2;
  const weightOf = (inv, name) => (name.includes('سمن') && inv.items[name] >= 2) ? 2 : 1;
  
  for (let pass = 0; pass < 60; pass++) {
    // ابنِ خريطة (بصمة → قائمة فواتير) للاكتشاف السريع
    const sigGroups = new Map();
    for (let i = 0; i < ic; i++) {
      const sig = buildInvoiceSignature(invs[i]);
      if (!sigGroups.has(sig)) sigGroups.set(sig, []);
      sigGroups.get(sig).push(i);
    }
    const dupGroups = [...sigGroups.values()].filter(g => g.length > 1);
    if (dupGroups.length === 0) break; // مفيش تطابق خالص، خلصنا
    
    let fixedAny = false;
    
    for (const group of dupGroups) {
      for (let gi = 0; gi < group.length - 1; gi++) {
        const a = group[gi],
          b = group[gi + 1];
        
        // ── المحاولة 1: Swap صنف بصنف (بأولوية: الأكتر تكراراً، الأغلى، غير المقيد) ──
        const namesA = Object.keys(invs[a].items).filter(n => canTouch(n) && invs[a].items[n] > 0 && samnFloorOk(invs[a], n));
        const namesB = Object.keys(invs[b].items).filter(n => canTouch(n) && invs[b].items[n] > 0 && samnFloorOk(invs[b], n));
        const priority = n => {
          const p = products.find(p => p.name === n);
          return [invs[a].items[n] || invs[b].items[n] || 0, p?.piecePrice || 0, isRestrictedOne(n) ? 0 : 1];
        };
        const cmp = (x, y) => {
          const px = priority(x),
            py = priority(y);
          for (let k = 0; k < 3; k++)
            if (px[k] !== py[k]) return py[k] - px[k];
          return 0;
        };
        namesA.sort(cmp);
        namesB.sort(cmp);
        
        let swapped = false;
        for (const nameA of namesA) {
          if (swapped) break;
          for (const nameB of namesB) {
            if (nameA === nameB) continue;
            if (isRestrictedOne(nameB) && invs[a].items[nameB]) continue;
            if (isRestrictedOne(nameA) && invs[b].items[nameA]) continue;
            const pA = products.find(p => p.name === nameA);
            const pB = products.find(p => p.name === nameB);
            if (!pA || !pB) continue;
            
            const newTotalA = parseFloat((invs[a].total - pA.piecePrice + pB.piecePrice).toFixed(2));
            const newTotalB = parseFloat((invs[b].total - pB.piecePrice + pA.piecePrice).toFixed(2));
            if (newTotalA <= 0 || newTotalB <= 0) continue;
            if (Math.abs(newTotalA - newTotalB) < MIN_DIFF) continue;
            
            invs[a].items[nameA]--;
            if (invs[a].items[nameA] <= 0) delete invs[a].items[nameA];
            invs[a].items[nameB] = (invs[a].items[nameB] || 0) + 1;
            invs[b].items[nameB]--;
            if (invs[b].items[nameB] <= 0) delete invs[b].items[nameB];
            invs[b].items[nameA] = (invs[b].items[nameA] || 0) + 1;
            invs[a].total = newTotalA;
            invs[b].total = newTotalB;
            swapped = true;
            fixedAny = true;
            break;
          }
        }
        if (swapped) continue;
        
        // ── المحاولة 2: نقل قطعة من فاتورة تالتة (مش موجودة عند b) ──
        let moved = false;
        for (let k = 0; k < ic && !moved; k++) {
          if (k === a || k === b) continue;
          const cands = Object.keys(invs[k].items)
            .filter(n => canTouch(n) && invs[k].items[n] > 0 && samnFloorOk(invs[k], n))
            .sort(cmp);
          for (const name of cands) {
            if (invMaxedOut(invs[b], name)) continue;
            const p = products.find(p => p.name === name);
            if (!p) continue;
            const willFullyRemove = invs[k].items[name] === 1;
            if (willFullyRemove && ipi && (countItems(invs[k]) - weightOf(invs[k], name) < ipi)) continue;
            const newB = parseFloat((invs[b].total + p.piecePrice).toFixed(2));
            if (Math.abs(invs[a].total - newB) < MIN_DIFF) continue;
            
            invs[k].items[name]--;
            if (invs[k].items[name] <= 0) delete invs[k].items[name];
            invs[k].total = parseFloat((invs[k].total - p.piecePrice).toFixed(2));
            invs[b].items[name] = (invs[b].items[name] || 0) + 1;
            invs[b].total = newB;
            moved = true;
            fixedAny = true;
            break;
          }
        }
        if (moved) continue;
        
        // ── المحاولة 3: استبدال صنف بصنف تاني من المخزون المتبقي ──
        if (stock) {
          for (const nameOut of namesB) {
            const pOut = products.find(p => p.name === nameOut);
            if (!pOut) continue;
            let done = false;
            for (const p of non55) {
              if (stock[p.name] <= 0) continue;
              if (p.name === nameOut) continue;
              if (invMaxedOut(invs[b], p.name)) continue;
              const newB = parseFloat((invs[b].total - pOut.piecePrice + p.piecePrice).toFixed(2));
              if (newB <= 0 || Math.abs(invs[a].total - newB) < MIN_DIFF) continue;
              
              invs[b].items[nameOut]--;
              if (invs[b].items[nameOut] <= 0) delete invs[b].items[nameOut];
              stock[nameOut] = (stock[nameOut] || 0) + 1;
              invs[b].items[p.name] = (invs[b].items[p.name] || 0) + 1;
              invs[b].total = newB;
              stock[p.name]--;
              done = true;
              fixedAny = true;
              break;
            }
            if (done) break;
          }
        }
      }
    }
    
    if (!fixedAny) break; // مفيش أي تحسين حصل الدورة دي، وقف عشان منلفش لا نهاية
  }
}

function generateInvoices() {
  const ipi = parseInt(document.getElementById('invoiceItemCount').value) || 5;
  const ic = parseInt(document.getElementById('invoiceCount').value);
  const MIN = 250;
  if (!ic) return;
  
  const s55 = products.find(p => p.name.includes('55'));
  
  // المخزون بالقطع
  const stock = {};
  products.forEach(p => { stock[p.name] = Math.floor((db.stock[p.name] || 0) * p.pack); });
  
  // هيكل الفواتير
  const invs = Array.from({ length: ic }, () => ({ items: {}, total: 0, itemCount: 0 }));
  
  const force55 = document.querySelector('input[name="force55"]:checked')?.value || 'yes';
  
  // ══════════════════════════════════════════════
  // الخطوة 1: ظرف 55 - قطعتين في كل فاتورة دايماً
  // إجباري: حتى لو المخزون سالب
  // حسب المخزون: يوقف لما يخلص
  // ══════════════════════════════════════════════
  if (s55) {
    for (let i = 0; i < ic; i++) {
      if (force55 === 'no' && stock[s55.name] < 2) break;
      invs[i].items[s55.name] = (invs[i].items[s55.name] || 0) + 2;
      invs[i].total += 2 * s55.piecePrice;
      invs[i].itemCount++;
      stock[s55.name] -= 2;
    }
  }
  
  // ══════════════════════════════════════════════
  // الخطوة 2: وزع باقي الأصناف
  // لكل قطعة: أضفها للفاتورة الأقل قيمة اللي لسه ناقصها أصناف
  // (Fisher-Yates Shuffle لترتيب الأصناف + كسر تعادل عشوائي بين الفواتير)
  // ══════════════════════════════════════════════
  const non55 = shuffleArray(products.filter(p => !s55 || p.name !== s55.name));
  
  for (const p of non55) {
    if (stock[p.name] <= 0) continue;
    while (stock[p.name] > 0) {
      const eligible = [...Array(ic).keys()]
        .filter(i => !invMaxedOut(invs[i], p.name))
        .filter(i => invs[i].itemCount < ipi || invs[i].items[p.name] !== undefined);
      if (eligible.length === 0) break;
      
      // إحصائيات عامة لحساب التوازن (مرة واحدة لكل قطعة مش لكل مرشح)
      const avgTotal = invs.reduce((s, x) => s + x.total, 0) / ic;
      const avgItemCount = invs.reduce((s, x) => s + x.itemCount, 0) / ic;
      
      // ── نظام Score: يختار الفاتورة الأنسب بدل الأقل قيمة بس ──
      let bestI = eligible[0],
        bestScore = -Infinity;
      for (const idx of eligible) {
        const inv = invs[idx];
        let score = 0;
        score += (avgTotal - inv.total); // الأقل قيمة = سكور أعلى
        score += (avgItemCount - inv.itemCount) * 3; // الأقل عدد أصناف = سكور أعلى
        if (inv.items[p.name] === undefined) score += 5; // تفضيل التنويع
        
        // امنع إن الإضافة دي تخلي الفاتورة تتطابق مع فاتورة تانية "شبه مكتملة"
        if (inv.itemCount + 1 >= ipi) {
          const wouldBeItems = { ...inv.items, [p.name]: (inv.items[p.name] || 0) + 1 };
          const newSig = buildInvoiceSignature({ items: wouldBeItems });
          for (let j = 0; j < ic; j++) {
            if (j === idx || invs[j].itemCount < ipi) continue;
            if (buildInvoiceSignature(invs[j]) === newSig) { score -= 1000000; break; }
          }
        }
        
        if (score > bestScore) { bestScore = score;
          bestI = idx; }
      }
      
      const i = bestI;
      if (invs[i].itemCount >= ipi && invs[i].items[p.name] === undefined) break;
      if (invs[i].items[p.name] === undefined) invs[i].itemCount++;
      invs[i].items[p.name] = (invs[i].items[p.name] || 0) + 1;
      invs[i].total += p.piecePrice;
      stock[p.name]--;
    }
  }
  
  // ══════════════════════════════════════════════
  // الخطوة 3: وزع الأصناف المتبقية (غير 55) على
  // الفواتير الأقل قيمة حتى تخلص كلها
  // ══════════════════════════════════════════════
  let hasRemaining = true;
  while (hasRemaining) {
    hasRemaining = false;
    // رتب الفواتير من الأقل للأعلى قيمة (حتمي، بدون عشوائية)
    const sorted = [...Array(ic).keys()].sort((a, b) => invs[a].total - invs[b].total);
    for (const p of non55) {
      if (stock[p.name] <= 0) continue;
      for (const i of sorted) {
        if (stock[p.name] <= 0) break;
        if (invMaxedOut(invs[i], p.name)) continue; // بلغت الحد الأقصى (1 ق) لهذا الصنف
        invs[i].items[p.name] = (invs[i].items[p.name] || 0) + 1;
        invs[i].total += p.piecePrice;
        stock[p.name]--;
        hasRemaining = true;
        break; // انتقل للصنف التالي بعد ما تضيف للأقل قيمة
      }
    }
  }
  
  // ══════════════════════════════════════════════
  // الخطوة 4: كسر التشابه - قارن كل الفواتير ببعض
  // لو في قيمتين متقاربات (فرق أقل من 50 جنيه)
  // انقل قطعة من صنف بين الفاتورتين عشان تفرق بينهم
  // ══════════════════════════════════════════════
  const DIFF_MIN = 50; // الحد الأدنى للفرق المقبول بين فاتورتين
  
  // كرر لحد ما محدش قريب من التاني
  for (let pass = 0; pass < 20; pass++) {
    let changed = false;
    
    for (let a = 0; a < ic; a++) {
      for (let b = a + 1; b < ic; b++) {
        const diff = Math.abs(invs[a].total - invs[b].total);
        if (diff >= DIFF_MIN) continue; // الفرق كافي، تخطي
        
        // الفاتورة الأعلى تعطي قطعة للأقل
        const hi = invs[a].total >= invs[b].total ? a : b;
        const lo = hi === a ? b : a;
        
        // ابحث عن صنف في الفاتورة الأعلى ممكن ننقل منه قطعة
        // الأولوية للأصناف الوفيرة (زي ممتاز لتر) مش الأصناف المقيدة النادرة
        let moved = false;
        const hiNamesSorted = Object.keys(invs[hi].items).sort((x, y) => {
          const rx = isRestrictedOne(x) ? 1 : 0,
            ry = isRestrictedOne(y) ? 1 : 0;
          if (rx !== ry) return rx - ry;
          return (invs[hi].items[y] || 0) - (invs[hi].items[x] || 0);
        });
        for (const name of hiNamesSorted) {
          const qty = invs[hi].items[name];
          if (qty <= 0) continue;
          const p = products.find(p => p.name === name);
          if (!p) continue;
          if (invMaxedOut(invs[lo], name)) continue; // lo وصلت للحد الأقصى (1 ق) من هذا الصنف
          
          // منع نقص عدد أصناف hi عن الحد الأدنى (ipi) لو النقل هيشيل الصنف بالكامل
          if (qty === 1 && ipi && countItems(invs[hi]) - 1 < ipi) continue;
          
          // انقل قطعة واحدة من hi → lo
          invs[hi].items[name]--;
          invs[hi].total -= p.piecePrice;
          if (invs[hi].items[name] === 0) delete invs[hi].items[name];
          
          invs[lo].items[name] = (invs[lo].items[name] || 0) + 1;
          invs[lo].total += p.piecePrice;
          
          // تحقق: هل الفرق اتحسن؟
          const newDiff = Math.abs(invs[hi].total - invs[lo].total);
          if (newDiff >= DIFF_MIN) {
            moved = true;
            changed = true;
            break;
          }
          
          // مش كافي، رجّع
          invs[lo].items[name]--;
          invs[lo].total -= p.piecePrice;
          if (invs[lo].items[name] === 0) delete invs[lo].items[name];
          
          invs[hi].items[name] = (invs[hi].items[name] || 0) + 1;
          invs[hi].total += p.piecePrice;
        }
        
        // لو مش قادر ينقل، جرب يضيف من المخزون المتبقي (الأصناف الوفيرة أولاً)
        if (!moved) {
          const stockCandidates = non55.slice().sort((a, b) => {
            const ra = isRestrictedOne(a.name) ? 1 : 0,
              rb = isRestrictedOne(b.name) ? 1 : 0;
            if (ra !== rb) return ra - rb;
            return (stock[b.name] || 0) - (stock[a.name] || 0);
          });
          for (const p of stockCandidates) {
            if (stock[p.name] <= 0) continue;
            if (invMaxedOut(invs[lo], p.name)) continue; // بلغت الحد الأقصى (1 ق)
            invs[lo].items[p.name] = (invs[lo].items[p.name] || 0) + 1;
            invs[lo].total += p.piecePrice;
            stock[p.name]--;
            const newDiff = Math.abs(invs[hi].total - invs[lo].total);
            if (newDiff >= DIFF_MIN) { changed = true; break; }
            // مش كافي، رجّع
            invs[lo].items[p.name]--;
            invs[lo].total -= p.piecePrice;
            if (invs[lo].items[p.name] === 0) delete invs[lo].items[p.name];
            stock[p.name]++;
          }
        }
      }
    }
    if (!changed) break;
  }
  
  // ══════════════════════════════════════════════
  // ── تشيك نهائي: كسر التشابه في القيم ──
  fixSimilarTotals(invs, ic, non55, s55, ipi);
  
  // الخطوة 5: تسوية عدد الأصناف - double check
  // يكرر لحد ما محدش يتغير (stable)
  // ══════════════════════════════════════════════
  let globalChanged = true;
  while (globalChanged) {
    globalChanged = false;
    
    // جولة كاملة على كل الفواتير
    for (let pass = 0; pass < ic * ic; pass++) {
      // رتب كل مرة من جديد عشان يأخذ أحدث وضع
      const sorted = [...Array(ic).keys()]
        .sort((a, b) => countItems(invs[b]) - countItems(invs[a]));
      const hi = sorted[0];
      const lo = sorted[sorted.length - 1];
      const hiCount = countItems(invs[hi]);
      const loCount = countItems(invs[lo]);
      
      // لو الفرق 1 أو أقل → مش محتاج تسوية
      if (hiCount - loCount <= 1) break;
      
      // ابحث عن صنف في hi ينقله لـ lo
      let moved = false;
      for (const [name, qty] of Object.entries(invs[hi].items)) {
        if (qty <= 0) continue;
        if (s55 && name === s55.name) continue; // لا تنقل الظرف 55
        const p = products.find(p => p.name === name);
        if (!p) continue;
        if (invs[lo].items[name]) continue; // الصنف موجود في lo → تخطي
        
        // منع نقص عدد أصناف hi عن الحد الأدنى (ipi) لو النقل هيشيل الصنف بالكامل
        if (qty === 1 && ipi && countItems(invs[hi]) - 1 < ipi) continue;
        
        // انقل قطعة واحدة من hi → lo
        invs[hi].items[name]--;
        invs[hi].total -= p.piecePrice;
        if (invs[hi].items[name] === 0) delete invs[hi].items[name];
        
        invs[lo].items[name] = (invs[lo].items[name] || 0) + 1;
        invs[lo].total += p.piecePrice;
        
        moved = true;
        globalChanged = true;
        break;
      }
      if (!moved) break;
    }
  }
  
  // ══════════════════════════════════════════════
  // خطوة تسوية عدد الأصناف بتحرك قطع بين الفواتير من غير
  // ما تراعي تشابه القيم، فبنعيد فحص التشابه تاني هنا
  // عشان نضمن إن مفيش فاتورتين بفرق أقل من 25 ج حتى لو
  // خطوة التسوية رجعتهم متشابهين
  // ══════════════════════════════════════════════
  fixSimilarTotals(invs, ic, non55, s55, ipi);
  
  // ══════════════════════════════════════════════
  // تقليل نسبة التشابه بين الفواتير (Jaccard) لأقل من 70%
  // قدر الإمكان: بنضيف صنف مميز (من مخزون لسه فاضل ومش موجود
  // عند الفاتورة التانية) بدل ما نشيل أي حاجة موجودة أصلاً،
  // عشان محافظين على كل القيود التانية (الحد الأدنى، القطعة
  // الواحدة للمقيدين...إلخ). ده أفضل جهد ممكن، مش مضمون 100%
  // لو المخزون قليل التنوع.
  // ══════════════════════════════════════════════
  const SIMILARITY_MAX = 0.7;
  for (let pass = 0; pass < 30; pass++) {
    let changed = false;
    for (let a = 0; a < ic; a++) {
      for (let b = a + 1; b < ic; b++) {
        if (jaccardSimilarity(invs[a], invs[b]) <= SIMILARITY_MAX) continue;
        
        for (const target of [a, b]) {
          const other = target === a ? b : a;
          let added = false;
          for (const p of non55) {
            if (stock[p.name] <= 0) continue;
            if (invs[other].items[p.name]) continue; // لازم يكون مميز عن التانية
            if (invMaxedOut(invs[target], p.name)) continue;
            invs[target].items[p.name] = (invs[target].items[p.name] || 0) + 1;
            invs[target].total += p.piecePrice;
            stock[p.name]--;
            added = true;
            changed = true;
            break;
          }
          if (added) break;
        }
      }
    }
    if (!changed) break;
  }
  // الإضافات فوق ممكن تكون أثرت على فروق القيم، فنعيد الفحص أخيراً
  fixSimilarTotals(invs, ic, non55, s55, ipi);
  
  // ══════════════════════════════════════════════
  // 🛡️ الحارس الأخير: تأكد نهائياً إن مفيش فاتورتين ببصمة
  // متطابقة (نفس الأصناف بالظبط)، وأصلحهم لو لقى أي تطابق
  // ══════════════════════════════════════════════
  eliminateDuplicateInvoices(invs, ic, non55, s55, ipi, stock);
  
  const finalStock = {};
  products.forEach(p => { finalStock[p.name] = stock[p.name] / p.pack; });
  
  const logs = [];
  invs.forEach((inv, i) => {
    const items = Object.entries(inv.items)
      .filter(([, q]) => q > 0)
      .map(([name, qty]) => {
        const p = products.find(p => p.name === name);
        return { name, qty: qty / p.pack, qtyPieces: qty, label: `${cleanName(name)} (${qty} ق)` };
      });
    
    // لو الفاتورة أقل من 250 → ارجع أصنافها للمخزون ولا تحفظها
    if (!items.length || inv.total < MIN) {
      Object.entries(inv.items).forEach(([name, qty]) => {
        if (qty > 0) finalStock[name] = (finalStock[name] || 0) + qty / (products.find(p => p.name === name)?.pack || 1);
      });
      return;
    }
    
    // طبّق العروض الإضافية على التركيبة النهائية للفاتورة
    const offersResult = applyAdditionalOffers(items);
    
    logs.push({
      id: Date.now() + i,
      date: new Date().toLocaleString('ar-EG'),
      items,
      total: offersResult.total.toFixed(2),
      type: 'out',
      isDone: false
    });
  });
  
  db.stock = finalStock;
  db.logs.push(...logs);
  localStorage.setItem('naguib_v16', JSON.stringify(db));
  refreshUI();
  
  // بوب آب الملخص
  const groups = {};
  let totalItemsAcrossInvoices = 0;
  logs.forEach(l => {
    let n = 0;
    l.items.forEach(it => {
      const p = products.find(p => p.name === it.name);
      const qty = Math.round(it.qty * (p?.pack || 1)); // الكمية بالقطع
      const isSamn = it.name.includes('سمن');
      if (isSamn && qty >= 2) n += 2; // سمن 2 قطعة أو أكتر = صنفين
      else if (isSamn && qty === 1) n += 1; // سمن قطعة واحدة = صنف
      else n += 1; // باقي الأصناف = صنف
    });
    groups[n] = (groups[n] || 0) + 1;
    totalItemsAcrossInvoices += n;
  });
  const avgItemCount = logs.length ? (totalItemsAcrossInvoices / logs.length) : 0;
  
  let rowsHTML = `<div class="popup-row"><span>إجمالي الفواتير المُنشأة</span><span>${logs.length} فاتورة</span></div>`;
  if (logs.length) {
    rowsHTML += `<div class="popup-row"><span>متوسط عدد الأصناف</span><span>${avgItemCount.toFixed(1)} صنف</span></div>`;
  }
  Object.entries(groups).sort((a, b) => b[0] - a[0]).forEach(([n, count]) => {
    rowsHTML += `<div class="popup-row"><span>${count} فاتورة</span><span>${n} صنف</span></div>`;
  });
  document.getElementById('popupRows').innerHTML = rowsHTML;
  document.getElementById('popupNote').style.display = 'none';
  document.querySelector('.popup-title').innerText = logs.length ? '✅ تم إنشاء الفواتير' : '⚠️ لم يتم إنشاء أي فاتورة';
  if (!logs.length) document.getElementById('popupRows').innerHTML = '<div class="popup-row"><span>السبب</span><span>المخزون غير كافٍ</span></div>';
  document.getElementById('popupOverlay').classList.add('show');
}

function closePopup(e) {
  if (e.target === document.getElementById('popupOverlay'))
    document.getElementById('popupOverlay').classList.remove('show');
}

// ── قفل قسم تقسيم المخزون ──
let divUnlocked = false;

function toggleDivLock() {
  if (divUnlocked) {
    divUnlocked = false;
    document.getElementById('divLockedView').classList.remove('hidden');
    document.getElementById('divUnlockedView').classList.add('hidden');
    document.getElementById('divLockBtn').innerText = '🔒';
    return;
  }
  document.getElementById('divPasswordInput').value = '';
  document.getElementById('passwordOverlay').classList.add('show');
  setTimeout(() => document.getElementById('divPasswordInput').focus(), 50);
}

function submitDivPassword() {
  const val = document.getElementById('divPasswordInput').value;
  document.getElementById('passwordOverlay').classList.remove('show');
  if (val === 'arma') {
    divUnlocked = true;
    document.getElementById('divLockedView').classList.add('hidden');
    document.getElementById('divUnlockedView').classList.remove('hidden');
    document.getElementById('divLockBtn').innerText = '🔓';
  } else {
    showAlert('كلمة المرور غير صحيحة.', '⚠️ خطأ');
  }
}

// ── حاسبة السطور المتبقية ──
function openCalcPage() {
  document.getElementById('calcPage').classList.add('show');
}

function closeCalcPage() {
  document.getElementById('calcPage').classList.remove('show');
}

function calcRemainingLines() {
  const A = parseFloat(document.getElementById('calcA').value);
  const N = parseFloat(document.getElementById('calcN').value);
  const R = parseFloat(document.getElementById('calcR').value);
  const T = parseFloat(document.getElementById('calcT').value);
  const resEl = document.getElementById('calcResult');
  resEl.classList.remove('hidden');
  
  if (isNaN(A) || isNaN(N) || isNaN(R) || isNaN(T)) {
    resEl.innerText = 'من فضلك أدخل الأرقام الأربعة كلها.';
    return;
  }
  if (R <= 0) {
    resEl.innerText = 'لا يوجد فواتير متبقية للحساب.';
    return;
  }
  
  const totalNeeded = T * (N + R) - A * N;
  const perInvoice = totalNeeded / R;
  resEl.innerText = `العدد المطلوب لكل فاتورة: ${perInvoice.toFixed(2)} صنف`;
}

// ── Theme (AMOLED dark mode) ──
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  const btn = document.getElementById('themeBtn');
  if (btn) btn.innerText = t === 'dark' ? '☀' : '🌙';
  // update mobile browser chrome color
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', t === 'dark' ? '#000000' : '#1A1A1A');
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  const next = cur === 'dark' ? 'light' : 'dark';
  localStorage.setItem('mowazze_theme', next);
  applyTheme(next);
}
applyTheme(localStorage.getItem('mowazze_theme') || 'light');

// ── PWA Install ──
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('installBanner').classList.add('show');
});

window.addEventListener('appinstalled', () => {
  document.getElementById('installBanner').classList.remove('show');
  deferredPrompt = null;
});

async function installApp() {
  if (!deferredPrompt) {
    // iOS - أظهر تعليمات
    showAlert('لتثبيت التطبيق على iOS:\n\nاضغط على زرار المشاركة ثم اختر "Add to Home Screen"', '📱 تثبيت مُوزّع');
    return;
  }
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    document.getElementById('installBanner').classList.remove('show');
  }
  deferredPrompt = null;
}

// ── Service Worker ──
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

refreshUI();