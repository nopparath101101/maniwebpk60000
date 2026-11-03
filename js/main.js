/* ES3 เท่านั้น: ไม่ใช้ forEach/filter/map/JSON/addEventListener/classList เพื่อรองรับ IE7/IE8 */
function $(id) { return document.getElementById(id); }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function has(text, q) { return String(text).toLowerCase().indexOf(String(q).toLowerCase()) !== -1; }
function trim(s) { return String(s).replace(/^\s+|\s+$/g, ""); }
function setOn(box, el) {
  var a = box.getElementsByTagName("a"), i;
  for (i = 0; i < a.length; i++) { a[i].className = a[i].className.replace(/\s*\bon\b/g, ""); }
  el.className = el.className + " on";
}

/* ---------- ข่าว (สไลด์โปสเตอร์) ---------- */
var newsCat = "ประชาสัมพันธ์", newsPos = 0, newsList = [], CARD_W = 265, timer = null;
function renderNews() {
  var track = $("news-track"), i, n, html = "", w;
  if (!track) { return; }
  newsList = [];
  for (i = 0; i < NEWS.length; i++) { if (NEWS[i].cat === newsCat) { newsList.push(NEWS[i]); } }
  for (i = 0; i < newsList.length; i++) {
    n = newsList[i];
    html += '<div class="ncard"><a href="' + esc(n.url) + '">' +
      (n.img ? '<img src="images/news/' + esc(n.img) + '" alt="' + esc(n.title) + '" /><span class="cap">' + esc(n.title) + '</span>' :
               '<div class="ph">' + esc(n.title) + '<small>(ใส่รูปโปสเตอร์ใน images/news/ แล้วระบุชื่อไฟล์ใน js/data.js)</small></div>') +
      '</a></div>';
  }
  if (newsList.length === 0) { html = '<div class="empty" style="width:1040px">ยังไม่มีข่าวในหมวดนี้</div>'; }
  track.style.width = (newsList.length * CARD_W + 20) + "px";
  track.innerHTML = html;
  newsPos = 0; track.style.left = "0px";
}
function setNews(cat, el) { newsCat = cat; setOn($("news-seg"), el); renderNews(); return false; }
function slide(dir) {
  var max = newsList.length - 4, track = $("news-track"), target, cur, step;
  if (max < 0) { max = 0; }
  newsPos += dir; if (newsPos < 0) { newsPos = 0; } if (newsPos > max) { newsPos = max; }
  target = -newsPos * CARD_W; cur = parseInt(track.style.left, 10) || 0;
  if (timer) { clearInterval(timer); }
  timer = setInterval(function () {
    step = (target - cur) / 4;
    if (Math.abs(target - cur) < 2) { cur = target; clearInterval(timer); timer = null; } else { cur += step; }
    track.style.left = Math.round(cur) + "px";
  }, 25);
  return false;
}

/* ---------- Dashboard ---------- */
var dashIdx = 0;
function renderDash() {
  var box = $("dash-box"), d = DASHBOARDS[dashIdx] || { name: "", url: "" }, full = $("dash-full");
  if (!box) { return; }
  if (d.url) {
    box.innerHTML = '<iframe src="' + esc(d.url) + '" frameborder="0" scrolling="auto"></iframe>';
    full.href = d.url; full.target = "_blank";
  } else {
    box.innerHTML = '<div class="empty">ยังไม่ได้ตั้งค่าลิงก์ Dashboard "' + esc(d.name) + '" (แก้ที่ DASHBOARDS ในไฟล์ js/data.js)</div>';
    full.href = "#";
  }
}
function setDash(i, el) { dashIdx = i; setOn($("dash-seg"), el); renderDash(); return false; }

/* ---------- หนังสือเวียน ---------- */
function deptClass(d) { var i; for (i = 0; i < DEPTS.length; i++) { if (DEPTS[i] === d) { return "dp" + ((i % 7) + 1); } } return "dp1"; }
function renderCirc() {
  var body = $("circ-body"), q, dept, i, c, html = "", shown = 0, chips;
  if (!body) { return; }
  q = trim($("circ-q").value); dept = $("circ-dept").value;
  for (i = 0; i < CIRCULARS.length; i++) {
    c = CIRCULARS[i];
    if (dept !== "" && c.dept !== dept) { continue; }
    if (q !== "" && !(has(c.title, q) || has(c.no, q))) { continue; }
    chips = "";
    if (c.no) { chips += '<span class="chip">' + esc(c.no) + '</span>'; }
    if (c.files) { chips += '<span class="chip file">' + c.files + ' ไฟล์</span>'; }
    if (c.links) { chips += '<span class="chip link">' + c.links + ' ลิงก์</span>'; }
    html += '<tr class="row"><td class="first"><div class="docicon"></div><div class="doctitle">' + esc(c.title) + '</div><div class="chips">' + chips + '</div></td>' +
      '<td class="c"><span class="tpill tp' + c.type + '">' + esc(TYPES[c.type]) + '</span><div class="tdate">' + esc(c.date) + '</div></td>' +
      '<td class="c"><span class="dpill ' + deptClass(c.dept) + '">' + esc(c.dept) + '</span></td>' +
      '<td class="c last">' + (c.url ? '<a class="dlbtn" href="' + esc(c.url) + '" title="ดาวน์โหลด"></a>' : '<span class="dash">-</span>') + '</td></tr>';
    shown++;
  }
  if (shown === 0) { html = '<tr><td colspan="4" class="empty">ไม่พบข้อมูล</td></tr>'; }
  body.innerHTML = html;
  $("circ-count").innerHTML = 'พบข้อมูล <b>' + shown + '</b> รายการ';
}
function initDeptSelect() {
  var s = $("circ-dept"), i;
  if (!s) { return; }
  s.options[0] = new Option("ทุกส่วนงาน", "");
  for (i = 0; i < DEPTS.length; i++) { s.options[i + 1] = new Option(DEPTS[i], DEPTS[i]); }
}

/* ---------- รวมระบบ/คู่มือ ---------- */
var hubKind = "";
function renderHub() {
  var box = $("hub-main"), side = $("side"), q, i, j, g, it, apps, docs, html = "", sh = "", shown, cnt;
  if (!box) { return; }
  q = trim($("hub-q").value);
  for (i = 0; i < HUB.length; i++) {
    g = HUB[i]; apps = ""; docs = ""; cnt = 0;
    for (j = 0; j < g.items.length; j++) {
      it = g.items[j];
      if (hubKind !== "" && it.kind !== hubKind) { continue; }
      if (q !== "" && !has(it.name, q)) { continue; }
      cnt++;
      var card = '<div class="sitem"><a href="' + esc(it.url) + '"><span class="ico' + (it.kind === "doc" ? " d" : "") + '"></span><b>' + esc(it.name) +
        '</b><small>' + (it.kind === "doc" ? "ดาวน์โหลด" : "เข้าสู่ระบบ") + '</small></a><span class="st"></span></div>';
      if (it.kind === "doc") { docs += card; } else { apps += card; }
    }
    if (q !== "" && cnt === 0) { continue; }
    html += '<div class="grp" id="g' + i + '"><div class="gh"><div class="gi"></div><h2>' + esc(g.name) + '</h2><p>' + esc(g.desc) + '</p><div class="clear"></div></div>';
    if (apps) { html += '<div class="sub">ระบบงาน (APPLICATIONS)</div>' + apps + '<div class="clear"></div>'; }
    if (docs) { html += '<div class="sub">คู่มือ/เอกสาร (DOCUMENTS)</div>' + docs + '<div class="clear"></div>'; }
    if (!apps && !docs) { html += '<div class="empty" style="text-align:left;padding:6px 0">ยังไม่มีรายการ</div>'; }
    html += '</div>';
    sh += '<a href="#g' + i + '">' + esc(g.name) + '</a>';
  }
  box.innerHTML = html; side.innerHTML = sh;
}
function setKind(k, el) { hubKind = k; setOn($("hub-filter"), el); renderHub(); return false; }

/* ---------- เบอร์โทรศัพท์ ---------- */
function renderPhones() {
  var body = $("phone-body"), q, i, p, html = "";
  if (!body) { return; }
  q = trim($("phone-q").value);
  for (i = 0; i < PHONES.length; i++) {
    p = PHONES[i];
    if (q !== "" && !(has(p.name, q) || has(p.zip, q) || has(p.pos, q) || has(p.tel, q))) { continue; }
    html += '<tr class="row"><td class="nm">' + esc(p.name) + '</td><td><span class="zip">' + esc(p.zip) + '</span></td><td>' + esc(p.pos) +
      '</td><td>' + esc(p.unit) + '</td><td class="tel">' + esc(p.tel) + '</td></tr>';
  }
  if (html === "") { html = '<tr><td colspan="5" class="empty">ไม่พบข้อมูล</td></tr>'; }
  body.innerHTML = html;
}

function initLogin() {
  var a = $("login-link");
  if (a && typeof ADMIN_URL !== "undefined" && ADMIN_URL) { a.href = ADMIN_URL; a.target = "_blank"; }
}

function init() { initLogin(); initDeptSelect(); renderNews(); renderDash(); renderCirc(); renderHub(); renderPhones(); }
if (window.addEventListener) { window.addEventListener("load", init, false); }
else if (window.attachEvent) { window.attachEvent("onload", init); }
else { window.onload = init; }
