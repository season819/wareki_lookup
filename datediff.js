// datediff.js
// 日本祝日資料由 holidays-ja.js 提供

// 簡易和暦定義（與主站一致即可）
var DJA_JAPANESE_ERAS = [
  { name: "明治", start: 1868, end: 1912 },
  { name: "大正", start: 1912, end: 1926 },
  { name: "昭和", start: 1926, end: 1989 },
  { name: "平成", start: 1989, end: 2019 },
  { name: "令和", start: 2019, end: null }
];

function djaSeirekiToJapanese(year) {
  for (var i = 0; i < DJA_JAPANESE_ERAS.length; i++) {
    var e = DJA_JAPANESE_ERAS[i];
    if (year < e.start) continue;
    if (e.end && year >= e.end) continue;
    var n = year - e.start + 1;
    return e.name + (n === 1 ? "元" : n) + "年";
  }
  return null;
}

function djaSeirekiToMinguo(year) {
  var n = year - 1911;
  if (n <= 0) return null;
  return n;
}

function pad2(n) {
  return n < 10 ? "0" + n : String(n);
}

function toDateObj(str) {
  if (!str) return null;
  var p = str.split("-");
  if (p.length !== 3) return null;
  var y = parseInt(p[0], 10);
  var m = parseInt(p[1], 10);
  var d = parseInt(p[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return new Date(y, m - 1, d);
}

function setToday(id) {
  var el = document.getElementById(id);
  var now = new Date();
  el.value =
    now.getFullYear() + "-" +
    pad2(now.getMonth() + 1) + "-" +
    pad2(now.getDate());
}

/* 更新和暦／民國顯示 */
function updateDjaYearDisplays() {
  function setFor(inputId, jpId, twId) {
    var input = document.getElementById(inputId);
    var jpEl = document.getElementById(jpId);
    var twEl = document.getElementById(twId);
    if (!input || !jpEl || !twEl) return;

    var d = toDateObj(input.value);
    if (!d) {
      jpEl.textContent = "和暦：—";
      twEl.textContent = "民国：—";
      return;
    }
    var y = d.getFullYear();
    var jp = djaSeirekiToJapanese(y);
    var tw = djaSeirekiToMinguo(y);

    jpEl.textContent = "和暦：" + (jp || "—");
    twEl.textContent = "民国：" + (tw != null ? tw + " 年" : "—");
  }

  setFor("dja-start", "dja-start-jp", "dja-start-tw");
  setFor("dja-end", "dja-end-jp", "dja-end-tw");
}


document.addEventListener("DOMContentLoaded", function () {

  var startInput = document.getElementById("dja-start");
  var endInput   = document.getElementById("dja-end");

  var summaryEl = document.getElementById("dja-summary");
  var detailEl  = document.getElementById("dja-detail");

  function showDefault() {
    summaryEl.textContent = "開始日と終了日を入力して「計算」を押してください。";
    detailEl.innerHTML = `
      <li>総日数：—</li>
      <li>およそ何週間：—</li>
      <li>およそ何か月（30日換算）：—</li>
      <li>およそ何年（365日換算）：—</li>
    `;
  }

  function calc() {
    var s = toDateObj(startInput.value);
    var e = toDateObj(endInput.value);

    if (!s || !e) {
      showDefault();
      updateDjaYearDisplays();
      return;
    }

    // 日付入替え
    var swapped = false;
    if (e < s) {
      var t = s;
      s = e;
      e = t;
      swapped = true;
    }

    var diffMs = e.getTime() - s.getTime();
    var diffDays = Math.round(diffMs / 86400000);

    summaryEl.textContent =
      s.getFullYear() + "-" + pad2(s.getMonth() + 1) + "-" + pad2(s.getDate()) + " から " +
      e.getFullYear() + "-" + pad2(e.getMonth() + 1) + "-" + pad2(e.getDate()) +
      " までの差は " + diffDays + " 日です。" +
      (swapped ? "（開始日・終了日を自動調整しました）" : "");

    detailEl.innerHTML = `
      <li>総日数：${diffDays} 日</li>
      <li>およそ何週間：${(diffDays / 7).toFixed(2)} 週間</li>
      <li>およそ何か月（30日換算）：${(diffDays / 30).toFixed(2)} か月</li>
      <li>およそ何年（365日換算）：${(diffDays / 365).toFixed(3)} 年</li>
    `;

    updateDjaYearDisplays();
  }

  document.getElementById("dja-calc").addEventListener("click", calc);

  document.getElementById("dja-clear").addEventListener("click", function () {
    startInput.value = "";
    endInput.value = "";
    showDefault();
    updateDjaYearDisplays();
  });

  document.getElementById("dja-swap").addEventListener("click", function () {
    var a = startInput.value;
    startInput.value = endInput.value;
    endInput.value = a;
    updateDjaYearDisplays();
  });

  document.getElementById("dja-set-start-today").addEventListener("click", function () {
    setToday("dja-start");
    updateDjaYearDisplays();
  });

  document.getElementById("dja-set-end-today").addEventListener("click", function () {
    setToday("dja-end");
    updateDjaYearDisplays();
  });

  // 日付改變時即時更新和暦／民國
  startInput.addEventListener("change", updateDjaYearDisplays);
  endInput.addEventListener("change", updateDjaYearDisplays);

  // 頁尾年份
  var fy = document.getElementById("current-year");
  if (fy) {
    fy.textContent = new Date().getFullYear();
  }

  showDefault();
  updateDjaYearDisplays();
  initDjaSidebarNextHolidayCard();
});
